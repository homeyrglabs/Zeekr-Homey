'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { generateKeyPairSync } = require('node:crypto');
const { hmacHeaders, appSignature, encryptVIN, encryptPassword, canonicalJSON } = require('../lib/crypto');
const { makeConfig, publicConfig, parseSecrets } = require('../lib/config');
const { ZeekrClient } = require('../lib/client');
const { telemetry } = require('../lib/telemetry');
const commands = require('../lib/commands');
const { publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const keys = { hmac_access_key: 'test-access', hmac_secret_key: 'test-hmac-secret',
  password_public_key: publicKey.export({ format: 'der', type: 'spki' }).toString('base64'),
  prod_secret: 'test-prod-secret', vin_key: '0123456789abcdef', vin_iv: 'fedcba9876543210' };
const config = makeConfig({ email: 'test@example.invalid', password: 'test-password', secrets: keys });
const json = data => ({ ok: true, status: 200, headers: new Headers(), json: async () => data });
const ok = data => json({ success: true, data });
const vin = 'L6T79XXXXXXXX0001';
test('extractor keys map directly; extra candidates are discarded', () => {
  assert.deepEqual(parseSecrets(JSON.stringify({ ...keys, prod_secret_candidates: ['ignored'], unrelated: 'ignored' })), keys);
});
test('missing runtime keys are rejected by name, not replaced by old global keys', () => {
  assert.throws(() => parseSecrets({ ...keys, vin_iv: null, prod_secret: null }), /prod_secret, vin_iv/);
});
test('invalid RSA and hex-decoded VIN bytes are rejected', () => {
  assert.throws(() => parseSecrets({ ...keys, password_public_key: 'invalid' }), /RSA/);
  assert.throws(() => parseSecrets({ ...keys, vin_key: keys.vin_key + keys.vin_key }), /16 UTF-8/);
});
test('configuration defaults to SE/3.1.1 and validates update interval and region', () => {
  assert.equal(config.country, 'SE'); assert.equal(config.interval, 300); assert.equal(config.appVersion, '3.1.1');
  assert.throws(() => makeConfig({ country: 'AU' }, config), /EU/);
  assert.throws(() => makeConfig({ interval: 2 }, config), /60/);
  assert.equal(makeConfig({ password: '', secrets: '' }, config).password, config.password);
});
test('public settings contain neither password, token nor key material', () => {
  const out = JSON.stringify(publicConfig(config));
  for (const value of [config.password, ...Object.values(keys)]) assert.ok(!out.includes(value));
});
test('password encryption accepts the extractor DER public key', () => {
  const encrypted = encryptPassword('test-password', keys.password_public_key);
  assert.equal(Buffer.from(encrypted, 'base64').length, 256);
});
test('canonical JSON sorts nested objects and escapes unicode like Python', () => {
  assert.equal(canonicalJSON({ z: [{ b: 'å', a: 1 }], a: true }), '{"a":true,"z":[{"a":1,"b":"\\u00e5"}]}');
});
test('protocol signatures and VIN match independently generated upstream Python fixtures', () => {
  const fixtures = require('./fixtures/protocol.json');
  for (const f of fixtures.hmac) assert.deepEqual(hmacHeaders(f.method, f.url, f.keys, f.date), f.expected);
  for (const f of fixtures.app) assert.equal(appSignature(f.method, f.url, f.headers, f.body, f.secret), f.expected);
  for (const f of fixtures.vin) assert.equal(encryptVIN(f.text, f.key, f.iv), f.expected);
});
test('telemetry preserves zero and unknown; does not turn missing values into false', () => {
  const unknown = telemetry({}, null);
  assert.equal(unknown.measure_battery, null); assert.equal(unknown.zeekr_charging, null); assert.equal(unknown.measure_power, null);
  const zero = telemetry({ additionalVehicleStatus: { electricVehicleStatus: { chargeLevel: '0', chargerState: '25' }, climateStatus: { interiorTemp: '0', preClimateActive: '0' } } });
  assert.equal(zero.measure_battery, 0); assert.equal(zero.measure_temperature, 0);
  assert.equal(zero.zeekr_charging, false); assert.equal(zero.measure_power, 0); assert.equal(zero.zeekr_climate, false);
  const active = telemetry({ additionalVehicleStatus: { electricVehicleStatus: { chargerState: '2', chargeLevel: 'NaN', statusOfChargerConnection: '1' } } }, { chargePower: '10.623' });
  assert.equal(active.measure_power, 10623); assert.equal(active.measure_battery, null); assert.equal(active.zeekr_plugged, true);
});
test('commands use Fryyyyy service IDs and exact parameter names', () => {
  assert.deepEqual(commands.charging(true), { command: 'start', serviceId: 'RCS', setting: { serviceParameters: [{ key: 'rcs.restart', value: '1' }] } });
  assert.deepEqual(commands.charging(false), { command: 'stop', serviceId: 'RCS', setting: { serviceParameters: [{ key: 'rcs.terminate', value: '1' }] } });
  assert.deepEqual(commands.climate(true, 22, 15).setting.serviceParameters, [{ key: 'AC', value: 'true' }, { key: 'AC.temp', value: '22' }, { key: 'AC.duration', value: '15' }]);
  assert.deepEqual(commands.climate(false).setting.serviceParameters, [{ key: 'AC', value: 'false' }]);
  assert.throws(() => commands.climate(true, 50, 15), /16/);
});
test('full mocked EU login, shared vehicle discovery and headers', async () => {
  const requests = [];
  const fetch = async (url, request) => {
    requests.push({ url, ...request });
    if (url.endsWith('checkUserV2')) return ok({});
    if (url.endsWith('loginByEmailEncrypt')) return ok({ tokenName: 'Authorization', tokenValue: 'auth-test' });
    if (url.includes('/user/tspCode')) return ok({ code: 'tsp-test', loginId: 'id' });
    if (url.includes('ms-user-auth/')) return ok({ accessToken: 'bearer-test' });
    if (url.includes('vehicle-list')) return ok([{ vin: 'L6T79XXXXXXXX0001', modelName: '001' }]);
    // These optional calls are not allowed to break an otherwise valid login.
    return json({ success: false, code: 'optional-unavailable' });
  };
  const sessions = [];
  const c = new ZeekrClient(config, { fetch, onSession: async value => sessions.push(value) });
  assert.equal((await c.vehicles()).length, 1);
  assert.equal(requests.length, 9);
  assert.ok(requests[0].url.startsWith('https://gateway-pub-azure.zeekr.eu/'));
  const bearer = requests.find(r => r.url.includes('ms-user-auth'));
  assert.equal(bearer.headers['X-PROJECT-ID'], 'ZEEKR_EU'); assert.equal(bearer.headers.authorization, '');
  assert.equal(requests.at(-1).headers.authorization, 'bearer-test');
  assert.ok(requests.at(-1).url.endsWith('?needSharedCar=true'));
  assert.equal(sessions[0].token, 'bearer-test');
});
test('concurrent login is serialized and a failed login is throttled', async () => {
  let attempts = 0;
  const c = new ZeekrClient(config, { fetch: async () => { attempts++; return json({ success: false, code: '079021', msg: 'private token here' }); } });
  const results = await Promise.allSettled([c.login(), c.login(), c.login()]);
  assert.equal(attempts, 1); assert.equal(results[0].status, 'rejected');
  assert.ok(!results[0].reason.message.includes('private token'));
  await assert.rejects(c.login(), /fem minuter/); assert.equal(attempts, 1);
});
test('two expired-token responses cause only one refresh', async () => {
  let logins = 0, calls = 0;
  const c = new ZeekrClient(config, { session: { token: 'old', deviceId: 'device' }, fetch: async () => {
    calls++; if (calls <= 2) return json({ success: false, msg: 'Token expired' });
    return ok({ additionalVehicleStatus: {} });
  } });
  c._login = async () => { logins++; await new Promise(resolve => setImmediate(resolve)); c.token = 'new'; };
  await Promise.all([c.status(vin), c.status(vin)]);
  assert.equal(logins, 1); assert.equal(calls, 4);
});
test('saved session avoids a fresh login after an app restart', async () => {
  const c = new ZeekrClient(config, { session: { token: 'saved', deviceId: 'device' }, fetch: async (_url, options) => {
    assert.equal(options.headers.authorization, 'saved'); return ok([]);
  } });
  assert.deepEqual(await c.vehicles(), []);
});
test('POST timeout is not retried and no payload leaks in error', async () => {
  let calls = 0;
  const c = new ZeekrClient(config, { session: { token: 'saved', deviceId: 'device' }, fetch: async () => { calls++; throw new Error('secret'); } });
  await assert.rejects(c.remote(vin, commands.charging(true)), error => !error.message.includes('secret'));
  assert.equal(calls, 1);
});
test('rate limit establishes shared backoff before any further requests', async () => {
  let calls = 0;
  const c = new ZeekrClient(config, { session: { token: 'saved', deviceId: 'device' }, fetch: async () => {
    calls++; return { ok: false, status: 429, headers: new Headers({ 'retry-after': '300' }) };
  } });
  await assert.rejects(c.status(vin), /begränsar/); await assert.rejects(c.status(vin), /begränsar/);
  assert.equal(calls, 1);
});
test('invalid JSON and HTTP errors are actionable and never expose response bodies', async () => {
  const c = new ZeekrClient(config, { session: { token: 'saved', deviceId: 'device' }, fetch: async () => ({ ok: true, status: 200, headers: new Headers(), json: async () => { throw new Error('SECRET'); } }) });
  await assert.rejects(c.status(vin), /ogiltigt svar/);
});
