'use strict';
const { translator } = require('./lib/language');
const Homey = require('homey');
const { createHash } = require('node:crypto');
const { ZeekrClient } = require('./lib/client');
const { makeConfig, publicConfig } = require('./lib/config');
const { charging, climate } = require('./lib/commands');
const fingerprint = config => createHash('sha256').update(JSON.stringify(config)).digest('hex');
class ZeekrApp extends Homey.App {
  async onInit() {
    this.t = translator(this.homey);
    this.client = null; this.clientKey = null; this.saving = false;
    for (const id of require('./lib/expanded-actions.json')) {
      this.homey.flow.getActionCard(id).registerRunListener(async ({ device, ...args }) => { await device.performAction(id, args); return true; });
    }
    this.homey.flow.getActionCard('refresh').registerRunListener(async ({ device }) => { await device.refresh(); return true; });
    this.homey.flow.getActionCard('start_charging').registerRunListener(async ({ device }) => { await device.sendCommand(charging(true)); return true; });
    this.homey.flow.getActionCard('stop_charging').registerRunListener(async ({ device }) => { await device.sendCommand(charging(false)); return true; });
    this.homey.flow.getActionCard('start_climate').registerRunListener(async ({ device, temperature, minutes }) => {
      await device.sendCommand(climate(true, temperature, minutes, this.t)); return true;
    });
    this.homey.flow.getActionCard('stop_climate').registerRunListener(async ({ device }) => { await device.sendCommand(climate(false, undefined, undefined, this.t)); return true; });
    for (const [card, capability] of Object.entries({ is_charging: 'zeekr_charging', is_plugged: 'zeekr_plugged', is_locked: 'zeekr_locked' })) {
      this.homey.flow.getConditionCard(card).registerRunListener(async ({ device }) => {
        device.requireFresh();
        const value = device.getCapabilityValue(capability);
        if (typeof value !== 'boolean') throw new Error(this.t('runtime.value_missing'));
        return value;
      });
    }
    this.homey.flow.getConditionCard('battery_below').registerRunListener(async ({ device, level }) => {
      device.requireFresh();
      const value = device.getCapabilityValue('measure_battery');
      if (typeof value !== 'number') throw new Error(this.t('runtime.battery_missing'));
      return value < level;
    });
    this.log('Zeekr v0.2.1 — community release');
  }
  getConfigInfo() { return publicConfig(this.homey.settings.get('account')); }
  getClient() {
    const config = this.homey.settings.get('account');
    if (!config) throw new Error(this.t('runtime.configure_account'));
    const key = fingerprint(config);
    if (!this.client || this.clientKey !== key) {
      const saved = this.homey.settings.get('session');
      this.clientKey = key;
      this.client = new ZeekrClient(config, {
        translate: this.t,
        session: saved?.configKey === key ? saved.session : null,
        onSession: async session => {
          if (this.clientKey === key) this.homey.settings.set('session', { configKey: key, session });
        }
      });
    }
    return this.client;
  }
  async saveConfig(input) {
    if (this.saving) throw new Error(this.t('runtime.busy_login'));
    this.saving = true;
    try {
      const config = makeConfig(input, this.homey.settings.get('account') || {}, this.t);
      const candidate = new ZeekrClient(config, { translate: this.t });
      const vehicles = await candidate.vehicles();
      // Keep the existing working account if validation/login fails.
      this.homey.settings.set('account', config);
      this.clientKey = fingerprint(config);
      const key = this.clientKey;
      candidate.onSession = async session => {
        if (this.clientKey === key) this.homey.settings.set('session', { configKey: key, session });
      };
      this.client = candidate;
      this.homey.settings.set('session', { configKey: key, session: candidate.exportSession() });
      this.refreshDevices();
      return { ...publicConfig(config), vehicles: vehicles.length };
    } finally { this.saving = false; }
  }
  refreshDevices() {
    for (const driver of Object.values(this.homey.drivers.getDrivers())) {
      for (const device of driver.getDevices()) Promise.resolve(device.configurationChanged?.()).catch(() => {});
    }
  }
  async disconnect() {
    this.homey.settings.unset('account'); this.homey.settings.unset('session');
    this.client = null; this.clientKey = null;
    this.refreshDevices(); return { disconnected: true };
  }
}
module.exports = ZeekrApp;
