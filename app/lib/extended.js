'use strict';
// Wire payloads adapted from Fryyyyy/zeekr_homeassistant (MIT).
// Explicit actions only: no toggles, guessed service IDs, automatic retries or optimistic state.
const remote = (command, serviceId, params, extra = {}) => ({ kind: 'remote', payload: {
  command, serviceId, setting: { ...extra, serviceParameters: Object.entries(params).map(([key, value]) => ({ key, value: String(value) })) }
} });
const SIMPLE = {
  lock: ['start', 'RDL', { door: 'all' }], unlock: ['stop', 'RDU', { door: 'all' }],
  release_trunk: ['start', 'RDU', { target: 'trunk' }], release_hood: ['start', 'RDU', { target: 'hood' }],
  open_charge_lid: ['start', 'RDO', { target: 'front-charge-lid' }], close_charge_lid: ['stop', 'RDC', { target: 'front-charge-lid' }],
  open_windows: ['start', 'RWS', { target: 'window' }], close_windows: ['stop', 'RWS', { target: 'window' }],
  ventilate_windows: ['start', 'RWS', { target: 'ventilate' }],
  open_sunshade: ['start', 'RWS', { target: 'sunshade' }], close_sunshade: ['stop', 'RWS', { target: 'sunshade' }],
  flash_lights: ['start', 'RHL', { rhl: 'light-flash' }], honk_flash: ['start', 'RHL', { rhl: 'horn-light-flash' }],
  start_defrost: ['start', 'ZAF', { DF: 'true', 'DF.level': '2' }], stop_defrost: ['start', 'ZAF', { DF: 'false' }],
  stop_wheel_heat: ['start', 'ZAF', { SW: 'false' }],
  start_sentry: ['start', 'RSM', { rsm: '6' }], stop_sentry: ['stop', 'RSM', { rsm: '6' }],
  stop_parking_comfort: ['stop', 'PCM', { parking_comfortable: 'false' }],
};
const SEATS = { driver: '11', passenger: '19', rear_left: '21', rear_right: '29' };
function integer(value, min, max, name) {
  if (!Number.isInteger(value) || value < min || value > max) throw new Error(`${name}: ${min}–${max}.`);
  return value;
}
function boolean(value, name) {
  if (typeof value !== 'boolean') throw new Error(`${name}: true/false krävs.`);
  return value;
}
function clock(value) {
  if (typeof value !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new Error('Ange klockslag som HH:MM.');
  return value;
}
function departureTime(value, now = Date.now()) {
  const match = typeof value === 'string' && value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?(Z|[+-]\d{2}:\d{2})$/);
  if (!match) throw new Error('Ange avgång som ISO-datum med tidszon, t.ex. 2026-11-01T07:00:00+01:00.');
  const [, y, mo, d, h, mi, se, zone] = match;
  const days = new Date(Date.UTC(Number(y), Number(mo), 0)).getUTCDate();
  if (+mo < 1 || +mo > 12 || +d < 1 || +d > days || +h > 23 || +mi > 59 || +(se || 0) > 59 || (zone !== 'Z' && (+zone.slice(1, 3) > 14 || +zone.slice(4) > 59 || (+zone.slice(1, 3) === 14 && +zone.slice(4) !== 0)))) throw new Error('Ogiltigt datum eller tidszon.');
  const time = Date.parse(value);
  if (!Number.isFinite(time) || time <= now) throw new Error('Avgångstiden måste ligga i framtiden.');
  return String(time);
}
function action(id, args = {}) {
  if (SIMPLE[id]) return remote(...SIMPLE[id]);
  if (id === 'start_wheel_heat') return remote('start', 'ZAF', { SW: 'true', 'SW.duration': integer(args.minutes, 1, 60, 'Minuter'), 'SW.level': 3 });
  if (id === 'set_seat') {
    if (!Object.hasOwn(SEATS, args.seat) || !['heat', 'vent'].includes(args.mode)) throw new Error('Ogiltigt säte eller läge.');
    if (args.mode === 'vent' && !['driver', 'passenger'].includes(args.seat)) throw new Error('Bakre sätesventilation finns inte i det verifierade underlaget.');
    const code = (args.mode === 'heat' ? 'SH.' : 'SV.') + SEATS[args.seat];
    const level = integer(args.level, 0, 3, 'Nivå');
    const params = { [code]: level ? 'true' : 'false' };
    if (level) { params[code + '.level'] = level; params[code + '.duration'] = integer(args.minutes, 1, 60, 'Minuter'); }
    return remote('start', 'ZAF', params);
  }
  if (id === 'set_charge_limit') {
    const soc = integer(args.level, 50, 100, 'Laddgräns');
    if (soc % 5) throw new Error('Laddgränsen anges i steg om 5 procent.');
    return remote('start', 'RCS', { soc: soc * 10, 'rcs.setting': 1, altCurrent: 1 });
  }
  if (id === 'start_ac_vent' || id === 'stop_ac_vent') return remote(id === 'start_ac_vent' ? 'start' : 'stop', 'RCC',
    { 'rcc.conditioner': 50, 'rcc.ventilation': 0 }, id === 'start_ac_vent' ? { operationScheduling: { duration: 6 } } : {});
  if (id === 'set_charge_plan') {
    const start = clock(args.start), end = clock(args.end);
    if (start === end) throw new Error('Start och slut måste vara olika klockslag.');
    return { kind: 'chargePlan', payload: { bcCycleActive: boolean(args.cycle, 'Battericykel'), bcTempActive: boolean(args.conditioning, 'Batterikonditionering'),
      command: 'start', endTime: end, scheduledTime: '', startTime: start, target: '2', timerId: '2' } };
  }
  if (id === 'set_departure') return { kind: 'travelPlan', payload: { ac: boolean(args.ac, 'Klimat') ? 'true' : 'false', btActive: false, btTempActive: false,
    bw: boolean(args.wheel, 'Rattvärme') ? '1' : '0', bwl: '1', command: 'start', scheduleList: [], scheduledTime: departureTime(args.when), timerId: '4' } };
  if (id === 'disable_charge_plan') return { kind: 'disableChargePlan' };
  if (id === 'disable_departure') return { kind: 'disableTravelPlan' };
  throw new Error('Okänd åtgärd.');
}
function disablePlan(kind, plan) {
  if (!plan || typeof plan !== 'object' || Array.isArray(plan) || !['start', 'stop'].includes(plan.command)) throw new Error('Ingen läsbar befintlig plan. Inget ändrades.');
  if (kind === 'chargePlan') return { bcCycleActive: [true, 'true', '1', 1].includes(plan.bcCycleActive), bcTempActive: [true, 'true', '1', 1].includes(plan.bcTempActive),
    command: 'stop', endTime: clock(plan.endTime), scheduledTime: plan.scheduledTime || '', startTime: clock(plan.startTime), target: '2', timerId: '2' };
  if (kind !== 'travelPlan') throw new Error('Okänd plantyp.');
  // Copy documented fields so disabling does not overwrite a recurring schedule with defaults.
  const result = { command: 'stop' };
  for (const key of ['ac', 'btActive', 'btTempActive', 'bw', 'bwl', 'scheduleList', 'scheduledTime', 'timerId']) {
    if (Object.hasOwn(plan, key)) result[key] = plan[key];
  }
  if (!result.timerId) result.timerId = '4';
  return result;
}
module.exports = { SIMPLE, action, disablePlan, departureTime };
