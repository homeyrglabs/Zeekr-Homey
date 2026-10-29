'use strict';
// Exact service/key structure from Fryyyyy's Home Assistant climate.py and switch.py.
function charging(active) {
  return { command: active ? 'start' : 'stop', serviceId: 'RCS',
    setting: { serviceParameters: [{ key: active ? 'rcs.restart' : 'rcs.terminate', value: '1' }] } };
}
function climate(active, temperature = 21, minutes = 15) {
  if (active && (!Number.isFinite(temperature) || temperature < 16 || temperature > 28 || !Number.isInteger(minutes) || minutes < 1 || minutes > 30)) {
    throw new Error('Välj 16–28 °C och 1–30 minuter.');
  }
  return { command: 'start', serviceId: 'ZAF', setting: { serviceParameters: active
    ? [{ key: 'AC', value: 'true' }, { key: 'AC.temp', value: String(temperature) }, { key: 'AC.duration', value: String(minutes) }]
    : [{ key: 'AC', value: 'false' }] } };
}
module.exports = { charging, climate };
