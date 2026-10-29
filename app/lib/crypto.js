'use strict';
// Protocol port of Fryyyyy/zeekr_ev_api; see THIRD_PARTY_NOTICES.md.
const crypto = require('node:crypto');
const ALLOWED = new Set(['x-app-id', 'content-type', 'x-api-signature-nonce', 'x-timestamp',
  'x-api-signature-version', 'x-project-id', 'authorization', 'accept-language', 'x-vin', 'x-device-id', 'x-platform']);
const hmac = (text, key) => crypto.createHmac('sha256', key).update(text, 'utf8').digest('base64');
function canonicalJSON(value) {
  const sorted = v => Array.isArray(v) ? v.map(sorted) : v && typeof v === 'object'
    ? Object.fromEntries(Object.keys(v).sort().map(k => [k, sorted(v[k])])) : v;
  // Match Python json.dumps(sort_keys=True, separators=(',', ':')) including ensure_ascii.
  return JSON.stringify(sorted(value)).replace(/[\u007f-\uffff]/g, c => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`);
}
function hmacHeaders(method, url, keys, date = new Date().toUTCString()) {
  const u = new URL(url);
  const path = '/' + u.pathname.split('/').filter(Boolean).join('/');
  const params = {};
  for (const pair of u.search.slice(1).split('&')) {
    const i = pair.indexOf('=');
    if (i >= 0) params[pair.slice(0, i)] = pair.slice(i + 1);
  }
  const query = Object.keys(params).sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : a.toLowerCase() > b.toLowerCase() ? 1 : 0)
    .map(k => `${k}=${params[k]}`).join('&');
  const base = [method.toUpperCase(), path, query, keys.hmac_access_key, date, ''].join('\n');
  // Upstream signs Request.data (empty), even when the wire body uses Request.json.
  return { 'X-HMAC-ALGORITHM': 'hmac-sha256', 'X-HMAC-SIGNATURE': hmac(base, keys.hmac_secret_key),
    'X-HMAC-ACCESS-KEY': keys.hmac_access_key, 'X-HMAC-DIGEST': hmac('', keys.hmac_secret_key), 'X-DATE': date };
}
function appSignature(method, url, headers, body, secret) {
  const u = new URL(url);
  const lower = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), String(v)]));
  let base = Object.keys(lower).filter(k => ALLOWED.has(k) && (!['authorization', 'x-vin'].includes(k) || lower[k]))
    .sort().map(k => `${k}:${lower[k]}\n`).join('');
  const params = {};
  for (const [k, v] of u.searchParams) if (!(k in params)) params[k] = v;
  const query = Object.keys(params).sort().map(k => `${k}=${params[k].replace(/%2F/g, '/').replace(/%3F/g, '?').replace(/\*/g, '%2A')}`).join('&');
  if (query) base += query + '\n';
  if ((lower['content-type'] || '').includes('application/json') && body) {
    base += crypto.createHash('md5').update(canonicalJSON(JSON.parse(body))).digest('base64') + '\n';
  }
  return hmac(base + method.toUpperCase() + '\n' + u.pathname.trimEnd(), secret);
}
function encryptVIN(vin, key, iv) {
  // These are 16 UTF-8 characters, not hex-decoded bytes (matches upstream).
  const cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from(key, 'utf8'), Buffer.from(iv, 'utf8'));
  return Buffer.concat([cipher.update(vin, 'utf8'), cipher.final()]).toString('base64');
}
function publicKey(value) {
  if (value.includes('BEGIN PUBLIC KEY') || value.includes('BEGIN RSA PUBLIC KEY')) return crypto.createPublicKey(value);
  return crypto.createPublicKey({ key: Buffer.from(value, 'base64'), format: 'der', type: 'spki' });
}
function encryptPassword(password, key) {
  return crypto.publicEncrypt({ key: publicKey(key), padding: crypto.constants.RSA_PKCS1_PADDING }, Buffer.from(password)).toString('base64');
}
module.exports = { canonicalJSON, hmacHeaders, appSignature, encryptVIN, encryptPassword, publicKey };
