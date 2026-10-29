'use strict';
const Homey = require('homey');
const { telemetry } = require('../../lib/telemetry');
class ZeekrDevice extends Homey.Device {
  async onInit() {
    this.deleted = false; this.lastPoll = 0; this.lastAttempt = 0; this.lastCommand = 0;
    this.pollPromise = null; this.commandBusy = false; this.timer = null; this.commandTimer = null; this.revision = 0;
    await this.setUnavailable('Ansluter till Zeekr…');
    await this.refresh().catch(error => this.setUnavailable(error.message));
    this.schedule();
  }
  interval() { return this.homey.settings.get('account')?.interval || 300; }
  schedule() {
    if (this.timer) this.homey.clearTimeout(this.timer);
    if (this.deleted || !this.homey.settings.get('account')) return;
    this.timer = this.homey.setTimeout(async () => {
      this.timer = null;
      try { await this.refresh(); } catch { /* refresh marks device unavailable */ }
      finally { this.schedule(); }
    }, this.interval() * 1000);
  }
  async configurationChanged() {
    this.revision += 1; this.lastPoll = 0; this.lastAttempt = 0;
    if (this.timer) this.homey.clearTimeout(this.timer);
    if (this.commandTimer) this.homey.clearTimeout(this.commandTimer);
    await this.setUnavailable('Kontoinställningarna har ändrats.');
    try {
      if (this.pollPromise) await this.pollPromise.catch(() => {});
      if (!this.deleted && this.homey.settings.get('account')) await this.refresh();
    } catch { /* refresh updates availability */ }
    finally { this.schedule(); }
  }
  requireFresh() {
    if (!this.getAvailable() || !this.lastPoll || Date.now() - this.lastPoll > Math.max(120, this.interval() * 2) * 1000) {
      throw new Error('Ingen aktuell avläsning finns. Uppdatera bilstatus först.');
    }
  }
  async refresh() {
    if (this.deleted) return;
    if (this.pollPromise) return this.pollPromise;
    if (Date.now() - this.lastAttempt < 30000) {
      if (!this.getAvailable()) throw new Error('Senaste hämtningen misslyckades. Vänta 30 sekunder innan nästa försök.');
      return;
    }
    this.lastAttempt = Date.now();
    const revision = this.revision;
    this.pollPromise = this._refresh(revision).catch(async error => {
      if (!this.deleted && revision === this.revision) await this.setUnavailable(error.message);
      throw error;
    }).finally(() => { this.pollPromise = null; });
    return this.pollPromise;
  }
  async _refresh(revision) {
    const client = this.homey.app.getClient();
    const vin = this.getData().vin;
    const status = await client.status(vin);
    if (!status?.additionalVehicleStatus || !Object.keys(status.additionalVehicleStatus).length) throw new Error('Zeekr returnerade ingen användbar bilstatus.');
    let charging = null, partial = false;
    const preliminary = telemetry(status, null);
    if (preliminary.zeekr_charging === true || preliminary.zeekr_plugged === true) {
      try { charging = await client.charging(vin); } catch { partial = true; }
    }
    if (this.deleted || revision !== this.revision) return;
    const values = telemetry(status, charging);
    const changes = [];
    for (const [key, value] of Object.entries(values)) {
      if (!this.hasCapability(key)) continue;
      const old = this.getCapabilityValue(key);
      await this.setCapabilityValue(key, value);
      if (this.lastPoll && old !== null && old !== undefined && value !== null && old !== value) changes.push([key, value]);
    }
    this.lastPoll = Date.now();
    await this.setCapabilityValue('zeekr_last_sync', new Date(this.lastPoll).toISOString());
    await this.setCapabilityValue('zeekr_status', partial ? 'Bilstatus hämtad; laddvärden saknas' : 'Bilstatus hämtad');
    await this.setAvailable();
    if (partial) await this.setWarning('Laddvärden kunde inte hämtas. De visas som okända.'); else await this.unsetWarning();
    for (const [key, value] of changes) {
      const trigger = { zeekr_charging: 'charging_changed', zeekr_plugged: 'plug_changed', measure_battery: 'battery_changed' }[key];
      if (trigger) {
        const tokens = key === 'measure_battery' ? { level: value } : { active: value };
        await this.homey.flow.getDeviceTriggerCard(trigger).trigger(this, tokens, {}).catch(() => {});
      }
    }
  }
  async sendCommand(payload) {
    if (this.deleted) throw new Error('Enheten har tagits bort.');
    if (this.commandBusy || Date.now() - this.lastCommand < 10000) throw new Error('Ett bilkommando skickades nyligen. Vänta tio sekunder.');
    this.commandBusy = true; this.lastCommand = Date.now();
    try {
      await this.homey.app.getClient().remote(this.getData().vin, payload);
      // Success means API acceptance. Never claim the car changed until telemetry confirms it.
      await this.setCapabilityValue('zeekr_status', 'Kommando accepterat; inväntar bilstatus');
      if (this.commandTimer) this.homey.clearTimeout(this.commandTimer);
      this.commandTimer = this.homey.setTimeout(async () => {
        this.commandTimer = null;
        try { await this.refresh(); } catch { /* unavailable is already set */ }
      }, 35000);
    } catch (error) {
      if (error.code === 'network' || /^5\d\d$/.test(error.code || '')) throw new Error('Ingen bekräftelse på kommandot. Kontrollera bilstatus innan du skickar igen.');
      throw error;
    } finally { this.commandBusy = false; }
  }
  async onDeleted() {
    this.deleted = true; this.revision += 1;
    if (this.timer) this.homey.clearTimeout(this.timer);
    if (this.commandTimer) this.homey.clearTimeout(this.commandTimer);
  }
  async onUninit() { await this.onDeleted(); }
}
module.exports = ZeekrDevice;
