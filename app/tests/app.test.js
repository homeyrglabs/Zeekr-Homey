'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const { generateKeyPairSync } = require('node:crypto');
const { publicKey } = generateKeyPairSync('rsa', { modulusLength: 1024 });
const input = { email: 'test@example.invalid', password: 'test-password', secrets: {
  hmac_access_key: 'test-access', hmac_secret_key: 'test-secret', prod_secret: 'test-prod',
  password_public_key: publicKey.export({ type: 'spki', format: 'der' }).toString('base64'),
  vin_key: '0123456789abcdef', vin_iv: 'fedcba9876543210' } };
let fail = false;
class FakeClient {
  constructor(config, options = {}) { this.config = config; this.options = options; }
  async vehicles() { if (fail) throw new Error('Login failed'); return [{ vin: 'L6T79XXXXXXXX0001' }]; }
  exportSession() { return { token: 'test-token', deviceId: 'test-device' }; }
}
const load = Module._load;
Module._load = function(id, ...args) {
  if (id === 'homey') return { App: class {}, Driver: class {} };
  if (id === './lib/client') return { ZeekrClient: FakeClient };
  return load.call(this, id, ...args);
};
const App = require('../app');
const Driver = require('../drivers/zeekr/driver');
Module._load = load;
function app() {
  const a = new App(), stored = new Map(), listeners = {};
  a.log = () => {};
  a.homey = { settings: { get: key => stored.get(key), set: (key, value) => stored.set(key, value), unset: key => stored.delete(key) },
    drivers: { getDrivers: () => ({}) }, flow: { getActionCard: id => ({ registerRunListener: fn => { listeners[id] = fn; } }),
      getConditionCard: id => ({ registerRunListener: fn => { listeners[id] = fn; } }) } };
  return { a, stored, listeners };
}
test('invalid replacement preserves the working account and session', async () => {
  const { a, stored } = app(); await a.onInit(); await a.saveConfig(input);
  const before = stored.get('account'), session = stored.get('session');
  fail = true; await assert.rejects(a.saveConfig({ ...input, password: 'wrong' }), /Login failed/); fail = false;
  assert.equal(stored.get('account'), before); assert.equal(stored.get('session'), session);
  assert.equal(a.getConfigInfo().keysSaved, true); assert.equal(a.getConfigInfo().password, undefined);
});
test('restart reuses matching saved session and disconnect removes account and session', async () => {
  const { a, stored } = app(); await a.onInit(); await a.saveConfig(input);
  a.client = null; const c = a.getClient(); assert.equal(c.options.session.token, 'test-token');
  await a.disconnect(); assert.equal(stored.has('account'), false); assert.equal(stored.has('session'), false);
  assert.throws(() => a.getClient(), /app settings/);
});
test('pairing excludes an already paired VIN and stores no credentials in device data', async () => {
  const driver = new Driver(), handlers = {};
  driver.homey = { app: { getClient: () => ({ vehicles: async () => [{ vin: 'L6T79XXXXXXXX0001' }, { vin: 'L6T79XXXXXXXX0002', modelName: '001' }] }), getConfigInfo: () => ({}) } };
  driver.getDevices = () => [{ getData: () => ({ vin: 'L6T79XXXXXXXX0001' }) }];
  await driver.onPair({ setHandler: (id, fn) => { handlers[id] = fn; } });
  const result = await handlers.list_devices(); assert.equal(result.length, 1);
  assert.deepEqual(Object.keys(result[0].data), ['vin']); assert.match(result[0].name, /001/);
});
test('every expanded Flow card is registered and dispatches its own ID and arguments',async()=>{
  const {a,listeners}=app();await a.onInit();const ids=require('../lib/expanded-actions.json'),calls=[];
  const device={performAction:async(id,args)=>{calls.push({id,args});return true;}};
  for(const id of ids){const args={device,level:80};assert.equal(await listeners[id](args),true);assert.equal(calls.at(-1).id,id);assert.deepEqual(calls.at(-1).args,{level:80});}
});
