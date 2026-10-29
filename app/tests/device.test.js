'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const load = Module._load;
class MockDevice {
  constructor() { this.values = {}; this.available = true; this.timers = []; this.events = []; this.calls = 0; this.statusData = { additionalVehicleStatus: { electricVehicleStatus: { chargeLevel: '10', chargerState: '2', statusOfChargerConnection: '1' } } }; }
  getData() { return { vin: 'L6T79XXXXXXXX0001' }; }
  getAvailable() { return this.available; }
  hasCapability() { return true; }
  getCapabilityValue(k) { return this.values[k] ?? null; }
  async setCapabilityValue(k, value) { this.values[k] = value; }
  async setAvailable() { this.available = true; }
  async setUnavailable(reason) { this.available = false; this.reason = reason; }
  async setWarning(warning) { this.warning = warning; }
  async unsetWarning() { this.warning = ''; }
}
Module._load = function(id, ...args) { if (id === 'homey') return { Device: MockDevice }; return load.call(this, id, ...args); };
const Device = require('../drivers/zeekr/device');
Module._load = load;
function device() {
  const d = new Device();
  const client = { status: async () => { d.calls++; return d.statusData; }, charging: async () => ({ chargePower: '10.623' }), remote: async () => {} };
  d.homey = { settings: { get: () => ({ interval: 300 }) },
    app: { getClient: () => client }, flow: { getDeviceTriggerCard: id => ({ trigger: async (_device, tokens) => d.events.push({ id, tokens }) }) },
    setTimeout: (callback, ms) => { const timer = { callback, ms }; d.timers.push(timer); return timer; }, clearTimeout: timer => { timer.cleared = true; } };
  return { d, client };
}
test('poll updates values and does not trigger changes on the first sample', async () => {
  const { d } = device(); await d.onInit();
  assert.equal(d.values.measure_battery, 10); assert.equal(d.values.measure_power, 10623);
  assert.equal(d.events.length, 0); d.requireFresh();
  d.statusData.additionalVehicleStatus.electricVehicleStatus.chargeLevel = '20'; d.lastAttempt = 0;
  await d.refresh(); assert.deepEqual(d.events, [{ id: 'battery_changed', tokens: { level: 20 } }]);
});
test('partial charging failure clears old charge data and signals partial status', async () => {
  const { d, client } = device(); await d.onInit(); d.lastAttempt = 0;
  client.charging = async () => { throw new Error('failed'); }; await d.refresh();
  assert.equal(d.values.measure_power, null); assert.equal(d.available, true); assert.match(d.warning, /Laddvärden/);
});
test('failed status makes conditions unavailable instead of using stale SOC', async () => {
  const { d, client } = device(); await d.onInit(); d.lastAttempt = 0;
  client.status = async () => { throw new Error('Offline'); };
  await assert.rejects(d.refresh(), /Offline/); assert.equal(d.available, false); assert.throws(() => d.requireFresh(), /aktuell/);
});
test('overlapping polls share one request and polling does not run faster than 30s', async () => {
  const { d } = device(); await d.onInit(); d.lastAttempt = 0;
  await Promise.all([d.refresh(), d.refresh()]); assert.equal(d.calls, 2);
  await d.refresh(); assert.equal(d.calls, 2);
});
test('command acceptance does not set observed charging or climate state', async () => {
  const { d } = device(); await d.onInit(); const before = d.values.zeekr_charging;
  await d.sendCommand({ command: 'stop', serviceId: 'RCS' });
  assert.equal(d.values.zeekr_charging, before); assert.match(d.values.zeekr_status, /accepterat/);
  await assert.rejects(d.sendCommand({}), /tio sekunder/);
});
test('delete cancels timers and an in-flight response cannot update the device', async () => {
  const { d, client } = device(); await d.onInit(); d.lastAttempt = 0;
  let release; client.status = () => new Promise(resolve => { release = resolve; });
  const pending = d.refresh(); await d.onDeleted();
  release({ additionalVehicleStatus: { electricVehicleStatus: { chargeLevel: 99 } } }); await pending;
  assert.equal(d.values.measure_battery, 10); assert.ok(d.timers.every(t => t.cleared));
});
