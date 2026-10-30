'use strict';
const { english } = require('./language');
const { publicKey } = require('./crypto');
const KEY_NAMES = ['hmac_access_key', 'hmac_secret_key', 'password_public_key', 'prod_secret', 'vin_key', 'vin_iv'];
const EU_COUNTRIES = new Set('AD AL AT AX BA BE BG CH CY CZ DE DK EE ES FI FR GB GI GR HR HU IE IS IT LI LT LU LV MC MD ME MK MT NL NO PL PT RO RS SE SI SK SM UA'.split(' '));
function parseSecrets(input, t = english) {
  let source = input;
  if (typeof input === 'string') {
    if (input.length > 65536) throw new Error(t('runtime.key_too_large'));
    try { source = JSON.parse(input); } catch { throw new Error(t('runtime.key_json')); }
  }
  if (!source || typeof source !== 'object' || Array.isArray(source)) throw new Error(t('runtime.import_keys'));
  const result = {};
  const missing = KEY_NAMES.filter(k => typeof source[k] !== 'string' || !source[k].trim());
  if (missing.length) throw new Error(t('runtime.missing_keys', { keys: missing.join(', ') }));
  for (const key of KEY_NAMES) {
    if (source[key].length > 8192) throw new Error(t('runtime.key_length', { key }));
    result[key] = source[key].trim();
  }
  for (const key of ['vin_key', 'vin_iv']) if (Buffer.byteLength(result[key], 'utf8') !== 16) throw new Error(t('runtime.vin_length', { key }));
  try { if (publicKey(result.password_public_key).asymmetricKeyType !== 'rsa') throw new Error(); }
  catch { throw new Error(t('runtime.invalid_rsa')); }
  return result;
}
function makeConfig(input, previous = {}, t = english) {
  if (!input || typeof input !== 'object') throw new Error(t('runtime.missing_config'));
  const email = String(input.email ?? previous.email ?? '').trim();
  const password = typeof input.password === 'string' && input.password ? input.password : previous.password;
  const country = String(input.country ?? previous.country ?? 'SE').trim().toUpperCase();
  const appVersion = String(input.appVersion ?? previous.appVersion ?? '3.1.1').trim();
  const interval = Number(input.interval ?? previous.interval ?? 300);
  if (!email || !email.includes('@') || email.length > 254) throw new Error(t('runtime.email'));
  if (typeof password !== 'string' || !password || password.length > 1024) throw new Error(t('runtime.password'));
  if (!EU_COUNTRIES.has(country)) throw new Error(t('runtime.eu_only'));
  if (!/^\d+\.\d+\.\d+$/.test(appVersion)) throw new Error(t('runtime.app_version'));
  if (!Number.isInteger(interval) || interval < 60 || interval > 3600) throw new Error(t('runtime.interval'));
  const keys = input.secrets && (typeof input.secrets !== 'string' || input.secrets.trim()) ? parseSecrets(input.secrets, t) : parseSecrets(previous.keys, t);
  return { email, password, country, appVersion, interval, keys };
}
function publicConfig(config) {
  return { configured: Boolean(config), email: config?.email || '', country: config?.country || 'SE',
    appVersion: config?.appVersion || '3.1.1', interval: config?.interval || 300, keysSaved: Boolean(config?.keys) };
}
module.exports = { KEY_NAMES, parseSecrets, makeConfig, publicConfig };
