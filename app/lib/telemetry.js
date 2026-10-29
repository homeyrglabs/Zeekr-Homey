'use strict';
// Field mappings adapted from Fryyyyy/zeekr_homeassistant.
function number(value, min = -Infinity, max = Infinity) {
  if (value === null || value === undefined || typeof value === 'boolean' || (typeof value === 'string' && !value.trim())) return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
}
function flag(value) { return [1, '1', true].includes(value) ? true : [0, '0', false].includes(value) ? false : null; }
function telemetry(status, charging) {
  const a = status?.additionalVehicleStatus || {};
  const ev = a.electricVehicleStatus || {}, climate = a.climateStatus || {}, maintenance = a.maintenanceStatus || {};
  const safety = a.drivingSafetyStatus || {};
  const state = number(ev.chargerState);
  const isCharging = state === null ? null : [1, 2, 15].includes(state) ? true : [0, 25, 26].includes(state) ? false : null;
  const plugged = flag(ev.statusOfChargerConnection);
  const power = number(charging?.chargePower, 0, 1000);
  const voltage = number(charging?.chargeVoltage, 0, 1500);
  const current = number(charging?.chargeCurrent, 0, 1500);
  return {
    measure_battery: number(ev.chargeLevel, 0, 100), zeekr_range: number(ev.distanceToEmptyOnBatteryOnly, 0, 2000),
    zeekr_odometer: number(maintenance.odometer, 0), measure_temperature: number(climate.interiorTemp, -60, 90),
    zeekr_charging: isCharging, zeekr_plugged: plugged, zeekr_climate: flag(climate.preClimateActive),
    zeekr_locked: flag(safety.centralLockingStatus),
    measure_power: isCharging === false ? 0 : power === null ? null : power * 1000,
    measure_voltage: isCharging === false ? 0 : voltage, measure_current: isCharging === false ? 0 : current,
    zeekr_tyre_fl: number(maintenance.tyreStatusDriver, 0, 600), zeekr_tyre_fr: number(maintenance.tyreStatusPassenger, 0, 600),
    zeekr_tyre_rl: number(maintenance.tyreStatusDriverRear, 0, 600), zeekr_tyre_rr: number(maintenance.tyreStatusPassengerRear, 0, 600)
  };
}
module.exports = { telemetry, number, flag };
