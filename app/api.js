'use strict';
module.exports = {
  getConfiguration: async ({ homey }) => homey.app.getConfigInfo(),
  saveConfiguration: async ({ homey, body }) => homey.app.saveConfig(body),
  disconnect: async ({ homey }) => homey.app.disconnect()
};
