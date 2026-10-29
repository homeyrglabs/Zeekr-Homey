'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const info = { configured: true, keysSaved: true, email: 'example@example.invalid', country: 'SE', appVersion: '3.1.1', interval: 300 };
function surface(file, pairing) {
  const html = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const elements = {};
  for (const match of html.matchAll(/id="([^"]+)"/g)) elements[match[1]] = { value: '', textContent: '', listeners: {}, addEventListener(name, handler) { this.listeners[name] = handler; } };
  const calls = [], views = [];
  const Homey = { ready: () => calls.push('ready'), showView: name => views.push(name),
    emit: async (event, payload) => { calls.push(event); return event === 'configuration' ? info : { ...info, vehicles: 1 }; },
    api: (method, route, payload, callback) => { calls.push(method + route); callback(null, method === 'GET' ? info : { ...info, vehicles: 1 }); } };
  const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');
  const context = { Homey, document: { getElementById: id => elements[id] }, Promise, JSON, Error, Number };
  vm.createContext(context); vm.runInContext(scripts, context);
  if (!pairing) context.onHomeyReady(Homey);
  return { elements, calls, views };
}
const flush = () => new Promise(resolve => setImmediate(resolve));
test('pairing uses the documented Promise bridge, saves then opens vehicle list', async () => {
  const { elements, calls, views } = surface('drivers/zeekr/pair/login.html', true);
  await flush(); assert.equal(elements.email.value, info.email); assert.equal(elements.existing.hidden, false);
  elements.password.value = 'transient-password'; elements.secrets.value = '{}';
  await elements.form.listeners.submit({ preventDefault() {} });
  assert.deepEqual(calls, ['configuration', 'login']); assert.deepEqual(views, ['list_devices']);
  assert.equal(elements.password.value, ''); assert.equal(elements.secrets.value, ''); assert.equal(elements.save.disabled, false);
});
test('settings uses authenticated Homey API and is revealed after boot', async () => {
  const { elements, calls, views } = surface('settings/index.html', false);
  await flush(); assert.ok(calls.includes('ready')); assert.equal(elements.existing.hidden, true);
  await elements.form.listeners.submit({ preventDefault() {} });
  assert.ok(calls.includes('POST/configuration')); assert.deepEqual(views, []);
});
