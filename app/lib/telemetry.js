'use strict';
// Field mappings adapted from Fryyyyy/zeekr_homeassistant.
function number(value, min = -Infinity, max = Infinity) {
  if (value === null || value === undefined || typeof value === 'boolean' || (typeof value === 'string' && !value.trim())) return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
}
function flag(value) { return [1, '1', true].includes(value) ? true : [0, '0', false].includes(value) ? false : null; }
function telemetry(status, charging, extras = {}) {
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
    ...extendedTelemetry(status, charging, extras),
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
function oneTwo(value) { return [1, '1'].includes(value) ? true : [0, '0', 2, '2'].includes(value) ? false : null; }
function planEnabled(value) { return value === 'start' ? true : value === 'stop' ? false : null; }
function planClock(value) { return typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : null; }
function extendedTelemetry(status, charging, extras) {
  const a = status?.additionalVehicleStatus || {}, ev = a.electricVehicleStatus || {}, climate = a.climateStatus || {};
  const safety = a.drivingSafetyStatus || {}, maintenance = a.maintenanceStatus || {}, running = a.runningStatus || {};
  const remote = extras.remoteState || {}, position = status?.basicVehicleStatus?.position || {};
  const rawLimit = number(extras.chargeLimit?.soc, 0, 1000), departure = number(extras.travelPlan?.scheduledTime, 1, 8640000000000000);
  const left = number(ev.timeToFullyCharged, 0, 2046);
  const out = {
    zeekr_charge_limit: rawLimit === null ? null : rawLimit / 10,
    zeekr_charge_minutes: left, zeekr_charge_speed: number(charging?.chargeSpeed, 0, 2000),
    zeekr_trip_distance: number(running.tripMeter2, 0), zeekr_trip_speed: number(running.avgSpeed, 0, 400),
    zeekr_consumption: number(ev.averPowerConsumption, 0, 200),
    zeekr_range_20: number(ev.distanceToEmptyOnBattery20Soc, 0, 2000), zeekr_range_100: number(ev.distanceToEmptyOnBattery100Soc, 0, 2000),
    zeekr_latitude: number(position.latitude, -90, 90), zeekr_longitude: number(position.longitude, -180, 180),
    zeekr_defrost: oneTwo(climate.defrost), zeekr_wheel_heat: oneTwo(climate.steerWhlHeatingSts), zeekr_ac_vent: flag(climate.airBlowerActive),
    zeekr_sentry: flag(remote.vstdModeState), zeekr_hood_open: flag(safety.engineHoodOpenStatus), zeekr_trunk_open: flag(safety.trunkOpenStatus),
    zeekr_trunk_locked: flag(safety.trunkLockStatus), zeekr_park_brake: flag(safety.electricParkBrakeStatus),
    zeekr_charge_lid_open: [1, '1'].includes(ev.chargeLidDcAcStatus) ? true : [2, '2'].includes(ev.chargeLidDcAcStatus) ? false : null,
    zeekr_sunshade_position: number(climate.curtainPos, 0, 100),
    zeekr_charge_plan: planEnabled(extras.chargePlan?.command), zeekr_departure_plan: planEnabled(extras.travelPlan?.command),
    zeekr_charge_plan_start: planClock(extras.chargePlan?.startTime), zeekr_charge_plan_end: planClock(extras.chargePlan?.endTime),
    zeekr_departure_time: departure === null ? null : new Date(departure).toISOString()
  };
  for (const [side, api, heat, vent, detail] of [
    ['driver','Driver','drvHeatSts','drvVentSts','drvVentDetail'], ['passenger','Passenger','passHeatingSts','passVentSts','passVentDetail'],
    ['rear_left','DriverRear','rlHeatingSts'], ['rear_right','PassengerRear','rrHeatingSts']
  ]) {
    out['zeekr_door_' + side] = flag(safety['doorOpenStatus' + api]);
    out['zeekr_door_lock_' + side] = flag(safety['doorLockStatus' + api]);
    out['zeekr_window_' + side] = number(climate['winPos' + api], 0, 100);
    const win = climate['winStatus' + api];
    out['zeekr_window_open_' + side] = [1, '1'].includes(win) ? true : [0, '0', 2, '2'].includes(win) ? false : null;
    const level = number(climate[heat], 0, 3);
    out['zeekr_seat_heat_' + side] = Number.isInteger(level) ? level : null;
    if (vent) {
      const active = oneTwo(climate[vent]), vl = number(climate[detail], 1, 3);
      out['zeekr_seat_vent_' + side] = active === false ? 0 : active === true && Number.isInteger(vl) ? vl : null;
    }
  }
  for (const [side, api] of [['fl','Driver'],['fr','Passenger'],['rl','DriverRear'],['rr','PassengerRear']]) {
    out['zeekr_tyre_temp_' + side] = number(maintenance['tyreTemp' + api], -60, 150);
    for (const [key, field] of [['warn','tyrePreWarning'],['hot','tyreTempWarning']]) {
      const n = number(maintenance[field + api], 0, 255);
      out['zeekr_tyre_' + key + '_' + side] = n === null ? null : n !== 0;
    }
  }
  return out;
}
module.exports = { telemetry, number, flag };
