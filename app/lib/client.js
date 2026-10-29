'use strict';
// JavaScript adaptation of Fryyyyy/zeekr_ev_api's EU login and vehicle endpoints.
const { randomUUID } = require('node:crypto');
const { hmacHeaders, appSignature, encryptPassword, encryptVIN } = require('./crypto');
const EU_APP = 'https://gateway-pub-azure.zeekr.eu/overseas-app/';
const EU_USER = 'https://gateway-pub-azure.zeekr.eu/zeekr-cuc-idaas/';
const EU_TSP = 'https://eu-snc-tsp-api-gw.zeekrlife.com/';
const CLIENT_ID = '1JwLroFkFFIpgFGdTRrm4_nzkkwDkfHj7RxJQb7J8tc';
class ZeekrError extends Error {
  constructor(message, code = '') { super(message); this.name = 'ZeekrError'; this.code = String(code); }
}
function apiError(json) {
  const code = String(json?.code ?? json?.errorCode ?? 'unknown').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 30);
  const hints = { '079021': 'Kontot används i en annan session. Använd ett separat delat Zeekr-konto.',
    '079025': 'Signering eller VIN-kryptering avvisades. Kontrollera EU-nycklarna för din APK-version.' };
  return new ZeekrError(hints[code] || `Zeekr avvisade anropet (kod ${code}). Kontrollera konto, region och nycklar.`, code);
}
class ZeekrClient {
  constructor(config, options = {}) {
    this.config = config; this.fetch = options.fetch || global.fetch;
    this.deviceId = options.deviceId || randomUUID(); this.token = ''; this.authToken = '';
    this.loginPromise = null; this.refreshAfter = 0; this.blockedUntil = 0; this.blockedMessage = '';
    this.onSession = options.onSession || (() => {});
    if (options.session?.token && options.session?.deviceId) {
      this.token = options.session.token; this.deviceId = options.session.deviceId;
    }
  }
  exportSession() { return { token: this.token, deviceId: this.deviceId }; }
  async _http(method, url, headers, body) {
    if (Date.now() < this.blockedUntil) throw new ZeekrError(this.blockedMessage, 'backoff');
    let response;
    try { response = await this.fetch(url, { method, headers, body, redirect: 'error', signal: AbortSignal.timeout(30000) }); }
    catch { throw new ZeekrError('Zeekr kunde inte nås. Kontrollera internetanslutningen och försök senare.', 'network'); }
    if (response.status === 429) {
      const seconds = Number(response.headers.get('retry-after'));
      const retryAt = Date.parse(response.headers.get('retry-after') || '');
      const wait = Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : Number.isFinite(retryAt) ? retryAt - Date.now() : 300000;
      this.blockedUntil = Date.now() + Math.max(60000, Math.min(wait, 3600000));
      this.blockedMessage = 'Zeekr begränsar anropen. Appen väntar innan nästa försök.';
      throw new ZeekrError(this.blockedMessage, '429');
    }
    if (!response.ok) throw new ZeekrError(`Zeekr svarade med HTTP ${response.status}.`, String(response.status));
    let json;
    try { json = await response.json(); } catch { throw new ZeekrError('Zeekr returnerade ett ogiltigt svar.', 'invalid_json'); }
    if (!json || typeof json !== 'object' || Array.isArray(json)) throw new ZeekrError('Zeekr returnerade ett oväntat svar.', 'invalid_json');
    return json;
  }
  _customHeaders() {
    const c = this.config;
    return { 'accept-language': 'en-AU', 'app-authorization': '1003',
      'app-code': '32816dbd-ff17-47b7-e250-5dae7d9f8cd4', appcode: 'eu-app', appid: 'TSP', appsecret: 'zeekr_tis',
      appversion: c.appVersion, 'call-source': 'android', 'client-id': CLIENT_ID,
      'Content-Type': 'application/json; charset=UTF-8', country: c.country, registcountry: c.country,
      'device-name': 'sdk_gphone64_x86_64', 'device-type': 'app', language: 'en', msgappid: '11002', msgclientid: '1003',
      'tmp-tenant-code': '3300743799505195008',
      'user-agent': `Device/GoogleAppName/com.zeekr.overseasAppVersion/${c.appVersion}Platform/androidOSVersion/16Ditto/true` };
  }
  async _custom(method, url, value, strict = true) {
    const headers = { ...this._customHeaders(), ...hmacHeaders(method, url, this.config.keys) };
    if (this.authToken) headers.authorization = this.authToken;
    const json = await this._http(method, url, headers, value === undefined ? undefined : JSON.stringify(value));
    if (json.success !== true && strict) throw apiError(json);
    return json.data;
  }
  async _signed(method, path, value, vin, retry = true, authenticating = false) {
    if (!authenticating) await this.login();
    const url = EU_TSP + path;
    const usedToken = this.token;
    const headers = { 'accept-language': 'en-AU', AppId: 'ONEX97FB91F061405',
      authorization: authenticating ? '' : usedToken, 'Content-Type': 'application/json; charset=UTF-8',
      'user-agent': 'okhttp/4.12.0', 'X-API-SIGNATURE-VERSION': '2.0', 'X-APP-ID': 'ZEEKRCNCH001M0001',
      'x-app-os-version': '', 'x-device-id': this.deviceId, 'x-p': 'Android', 'X-PLATFORM': 'APP',
      'X-PROJECT-ID': 'ZEEKR_EU', 'X-API-SIGNATURE-NONCE': randomUUID(), 'X-TIMESTAMP': String(Date.now()) };
    if (vin) headers['X-VIN'] = encryptVIN(vin, this.config.keys.vin_key, this.config.keys.vin_iv);
    const body = value === undefined ? undefined : JSON.stringify(value);
    headers['X-SIGNATURE'] = appSignature(method, url, headers, body, this.config.keys.prod_secret);
    const json = await this._http(method, url, headers, body);
    if (json.msg === 'Token expired' && retry && !authenticating) {
      await this.login(usedToken);
      return this._signed(method, path, value, vin, false);
    }
    if (json.success !== true) throw apiError(json);
    return json.data;
  }
  async login(expiredToken) {
    if (this.loginPromise) return this.loginPromise;
    if (this.token && (!expiredToken || this.token !== expiredToken)) return;
    if (Date.now() < this.refreshAfter) throw new ZeekrError('Inloggning misslyckades nyligen. Vänta fem minuter eller spara rättade inställningar.', 'auth_backoff');
    this.loginPromise = this._login().catch(error => {
      this.token = ''; this.authToken = ''; this.refreshAfter = Date.now() + 300000;
      return Promise.resolve(this.onSession(null)).catch(() => {}).then(() => { throw error; });
    }).finally(() => { this.loginPromise = null; });
    return this.loginPromise;
  }
  async _login() {
    // EU-only routing deliberately uses the EU hosts already present in upstream.
    this.token = ''; this.authToken = '';
    await this._custom('POST', EU_USER + 'auth/checkUserV2', { email: this.config.email, checkType: '1' });
    const info = await this._custom('POST', EU_USER + 'auth/loginByEmailEncrypt', {
      code: '', codeId: '', email: this.config.email, password: encryptPassword(this.config.password, this.config.keys.password_public_key) });
    if (info?.tokenName !== 'Authorization' || !info?.tokenValue) throw new ZeekrError('Zeekr returnerade ingen giltig inloggningstoken.');
    this.authToken = info.tokenValue;
    // Like upstream, nonessential profile/protocol/inbox results do not gate login.
    await this._custom('POST', EU_USER + 'user/info', undefined, false);
    await this._custom('POST', EU_APP + 'protocol/service/getProtocol', { country: this.config.country }, false);
    await this._custom('GET', EU_APP + 'member/inbox/home', undefined, false);
    const tsp = await this._custom('GET', EU_USER + `user/tspCode?tspClientId=${CLIENT_ID}`);
    if (!tsp?.code) throw new ZeekrError('Zeekr returnerade ingen TSP-kod.');
    await this._custom('GET', EU_USER + 'user/updateLanguage?language=en', undefined, false);
    const data = await this._signed('POST', 'ms-user-auth/v1.0/auth/login', {
      identifier: tsp.code, identityType: 10, loginDeviceId: 'google-sdk_gphone64_x86_64-36-16', loginDeviceJgId: '',
      loginDeviceType: 1, loginPhoneBrand: 'google', loginPhoneModel: 'sdk_gphone64_x86_64', loginSystem: 'Android'
    }, undefined, false, true);
    if (!data?.accessToken) throw new ZeekrError('Zeekr returnerade ingen giltig fordons-token.');
    this.token = data.accessToken; this.refreshAfter = 0;
    await this.onSession(this.exportSession());
  }
  async vehicles() {
    const data = await this._signed('GET', 'ms-app-bff/api/v4.0/veh/vehicle-list?needSharedCar=true');
    if (!Array.isArray(data)) throw new ZeekrError('Zeekr returnerade ingen fordonslista.');
    return data.filter(v => typeof v?.vin === 'string' && /^[A-HJ-NPR-Z0-9]{17}$/i.test(v.vin));
  }
  status(vin) { return this._signed('GET', 'ms-vehicle-status/api/v1.0/vehicle/status/latest?latest=false&target=new', undefined, vin); }
  charging(vin) { return this._signed('GET', 'ms-vehicle-status/api/v1.0/vehicle/status/qrvs', undefined, vin); }
  remote(vin, payload) {
    const path = payload.serviceId === 'RCS' ? 'ms-charge-manage/api/v1.0/charge/control' : 'ms-remote-control/v1.0/remoteControl/control';
    // Never repeat POST after network timeout or HTTP failure: acceptance is unknown.
    return this._signed('POST', path, payload, vin, false);
  }
}
module.exports = { ZeekrClient, ZeekrError, apiError };
