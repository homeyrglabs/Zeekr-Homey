'use strict';
const Homey = require('homey');
class ZeekrDriver extends Homey.Driver {
  async onPair(session) {
    session.setHandler('configuration', async () => this.homey.app.getConfigInfo());
    session.setHandler('login', async input => this.homey.app.saveConfig(input));
    session.setHandler('list_devices', async () => {
      const existing = new Set(this.getDevices().map(d => d.getData().vin));
      const vehicles = await this.homey.app.getClient().vehicles();
      return vehicles.filter(v => !existing.has(v.vin)).map(v => ({
        name: String(v.vehicleName || v.carName || v.modelName || 'Zeekr') + ' · ' + v.vin.slice(-4), data: { vin: v.vin }
      }));
    });
  }
}
module.exports = ZeekrDriver;
