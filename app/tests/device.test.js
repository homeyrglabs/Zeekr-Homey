'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const load = Module._load;
class MockDevice {
  constructor() { this.values = {}; this.available = true; this.timers = []; this.events = []; this.calls = 0; this.statusData = { additionalVehicleStatus: { electricVehicleStatus: { chargeLevel: '10', chargerState: '2', statusOfChargerConnection: '1' } } }; }
  registerCapabilityListener(capability, listener) { (this.listeners ||= {})[capability] = listener; }
  async addCapability(capability) { (this.added ||= []).push(capability); }
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
  const client = { status: async () => { d.calls++; return d.statusData; }, charging: async () => ({ chargePower: '10.623' }), remote: async () => {}, remoteState: async () => ({}), chargeLimit: async () => ({}), chargePlan: async () => ({}), travelPlan: async () => ({}) };
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
test('upgrade adds missing capabilities and registers buttons without sending commands', async()=>{
  const {d,client}=device();let sends=0;client.remote=async()=>{sends++;};
  d.driver={manifest:{capabilities:['measure_battery','button.unlock','zeekr_charge_limit']}};
  const caps=new Set(['measure_battery']);d.hasCapability=k=>caps.has(k);d.addCapability=async k=>{caps.add(k);(d.added||=[]).push(k);};
  await d.onInit();assert.deepEqual(d.added,['button.unlock','zeekr_charge_limit']);assert.equal(sends,0);assert.equal(typeof d.listeners['button.unlock'],'function');assert.equal(d.values.measure_battery,10);
});
test('unlock requests acceptance without changing observed lock and shares command cooldown', async()=>{
  const {d,client}=device();await d.onInit();d.values.zeekr_locked=true;const sent=[];client.remote=async(vin,p)=>sent.push(p);
  await d.listeners['button.unlock']();assert.equal(sent[0].serviceId,'RDU');assert.equal(d.values.zeekr_locked,true);
  await assert.rejects(d.performAction('lock'),/tio sekunder/);assert.equal(sent.length,1);
});
test('failed optional endpoint clears prior supplemental state while keeping primary available', async()=>{
  const {d,client}=device();client.chargeLimit=async()=>({soc:'800'});await d.onInit();assert.equal(d.values.zeekr_charge_limit,80);
  d.lastAttempt=0;client.chargeLimit=async()=>{throw Error('unsupported');};await d.refresh();assert.equal(d.values.zeekr_charge_limit,null);assert.equal(d.values.zeekr_supplement_sync,null);assert.equal(d.available,true);assert.match(d.warning,/tilläggsvärden/);
});
test('invalid input and unreadable existing plan cannot send a vehicle command', async()=>{
  const {d,client}=device();await d.onInit();let writes=0;client.setTravelPlan=async()=>{writes++;};client.remote=async()=>{writes++;};
  await assert.rejects(d.performAction('set_charge_limit',{level:81}),/steg/);assert.equal(d.lastCommand,0);
  await assert.rejects(d.performAction('disable_departure'),/befintlig plan/);assert.equal(writes,0);
});
test('deleting device while reading a plan prevents its later control POST', async()=>{
  const {d,client}=device();await d.onInit();let release,writes=0;client.travelPlan=()=>new Promise(r=>{release=r;});client.setTravelPlan=async()=>{writes++;};
  const pending=d.performAction('disable_departure');await d.onDeleted();release({command:'start',timerId:'4',scheduleList:[]});await assert.rejects(pending,/ändrades/);assert.equal(writes,0);
});
