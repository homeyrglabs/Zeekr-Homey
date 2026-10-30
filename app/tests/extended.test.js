'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { action, disablePlan, departureTime } = require('../lib/extended');
const { telemetry } = require('../lib/telemetry');
const { ZeekrClient } = require('../lib/client');
const { generateKeyPairSync } = require('node:crypto');
const { publicKey } = generateKeyPairSync('rsa', { modulusLength: 1024 });
const keys = { hmac_access_key: 'fake-access', hmac_secret_key: 'fake-hmac', prod_secret: 'fake-prod', vin_key: '0123456789abcdef', vin_iv: 'fedcba9876543210', password_public_key: publicKey.export({type:'spki',format:'der'}).toString('base64') };
const vin = 'L6T79XXXXXXXX0001';
const params = id => action(id).payload.setting.serviceParameters;
test('central lock and unlock retain distinct upstream service IDs and directions', () => {
  assert.deepEqual(action('lock').payload, { command:'start', serviceId:'RDL', setting:{serviceParameters:[{key:'door',value:'all'}]} });
  assert.deepEqual(action('unlock').payload, { command:'stop', serviceId:'RDU', setting:{serviceParameters:[{key:'door',value:'all'}]} });
  assert.deepEqual(params('release_trunk'), [{key:'target',value:'trunk'}]);
  assert.deepEqual(params('release_hood'), [{key:'target',value:'hood'}]);
});
test('covers and locator use explicit documented targets, never toggles', () => {
  assert.deepEqual(params('honk_flash'), [{key:'rhl',value:'horn-light-flash'}]);
  assert.deepEqual(params('ventilate_windows'), [{key:'target',value:'ventilate'}]);
  assert.equal(action('close_windows').payload.command,'stop');
  assert.equal(action('close_charge_lid').payload.serviceId,'RDC');
  assert.equal(action('open_charge_lid').payload.serviceId,'RDO');
  assert.deepEqual(action('start_ac_vent').payload.setting,{operationScheduling:{duration:6},serviceParameters:[{key:'rcc.conditioner',value:'50'},{key:'rcc.ventilation',value:'0'}]});
});
test('seat controls encode passenger/rear seats, stop without duration, and refuse unsupported ventilation', () => {
  assert.deepEqual(action('set_seat',{seat:'rear_right',mode:'heat',level:2,minutes:15}).payload.setting.serviceParameters,
    [{key:'SH.29',value:'true'},{key:'SH.29.level',value:'2'},{key:'SH.29.duration',value:'15'}]);
  assert.deepEqual(action('set_seat',{seat:'passenger',mode:'vent',level:0}).payload.setting.serviceParameters,[{key:'SV.19',value:'false'}]);
  for (const args of [{seat:'rear_left',mode:'vent',level:1,minutes:15},{seat:'driver',mode:'heat',level:4,minutes:15},{seat:'driver',mode:'heat',level:1,minutes:0}]) assert.throws(()=>action('set_seat',args));
});
test('charge limit validates discrete percentages and uses tenths on wire', () => {
  assert.deepEqual(action('set_charge_limit',{level:80}).payload.setting.serviceParameters,[{key:'soc',value:'800'},{key:'rcs.setting',value:'1'},{key:'altCurrent',value:'1'}]);
  for(const level of [49,101,81,'80',NaN]) assert.throws(()=>action('set_charge_limit',{level}));
});
test('charge plans validate times and preserve flags when disabled', () => {
  const p=action('set_charge_plan',{start:'22:30',end:'06:00',cycle:true,conditioning:false}).payload;
  assert.deepEqual(p,{bcCycleActive:true,bcTempActive:false,command:'start',endTime:'06:00',scheduledTime:'',startTime:'22:30',target:'2',timerId:'2'});
  assert.deepEqual(disablePlan('chargePlan',p),{...p,command:'stop'});
  for(const args of [{start:'24:00',end:'06:00',cycle:false,conditioning:false},{start:'06:00',end:'06:00',cycle:false,conditioning:false},{start:'01:00',end:'06:00',cycle:'false',conditioning:false}]) assert.throws(()=>action('set_charge_plan',args));
});
test('departure requires real future calendar date with explicit timezone; disable preserves recurrence', () => {
  assert.equal(departureTime('2099-11-01T07:00:00+01:00',0),String(Date.parse('2099-11-01T06:00:00Z')));
  for(const date of ['2099-02-30T07:00Z','2099-11-01T07:00','2099-11-01T07:00+14:01','2000-01-01T00:00Z']) assert.throws(()=>departureTime(date));
  const plan={command:'start',ac:'true',bw:'1',bwl:'1',btActive:false,btTempActive:false,timerId:'4',scheduledTime:'',scheduleList:[{day:'1',startTime:'07:00'}]};
  assert.deepEqual(disablePlan('travelPlan',plan),{...plan,command:'stop'});
  assert.equal(action('set_departure',{when:'2099-01-01T07:00:00Z',ac:true,wheel:false}).payload.scheduleList.length,0);
  for(const plan of [null,{},[],{error:'not a plan'}]) assert.throws(()=>disablePlan('travelPlan',plan));
});
test('extended telemetry distinguishes missing, off, zero and unknown codes', () => {
  const missing=telemetry({},null);
  for (const [key,value] of Object.entries(missing)) assert.equal(value,null,key);
  const v=telemetry({basicVehicleStatus:{position:{latitude:'59.0',longitude:'18.0'}},additionalVehicleStatus:{electricVehicleStatus:{timeToFullyCharged:'2047',chargeLidDcAcStatus:'2'},climateStatus:{winPosDriver:'0',winStatusDriver:'2',drvHeatSts:'0',drvVentSts:'2',winStatusPassenger:'255',passHeatingSts:'255'}}},null,{chargeLimit:{soc:'800'},remoteState:{vstdModeState:'0'},chargePlan:{command:'stop',startTime:'22:30',endTime:'06:00'}});
  assert.equal(v.zeekr_window_driver,0);assert.equal(v.zeekr_window_open_driver,false);assert.equal(v.zeekr_window_open_passenger,null);
  assert.equal(v.zeekr_seat_heat_driver,0);assert.equal(v.zeekr_seat_vent_driver,0);assert.equal(v.zeekr_seat_heat_passenger,null);
  assert.equal(v.zeekr_charge_minutes,null);assert.equal(v.zeekr_charge_limit,80);assert.equal(v.zeekr_charge_lid_open,false);assert.equal(v.zeekr_sentry,false);assert.equal(v.zeekr_charge_plan,false);assert.equal(v.zeekr_latitude,59);
});
test('extended requests use signed encrypted-VIN endpoints; commands are never retried', async () => {
  const calls=[];
  const c=new ZeekrClient({keys},{session:{token:'fake-token',deviceId:'fake-device'},fetch:async(url,r)=>{calls.push({url,...r});return {ok:true,status:200,headers:new Headers(),json:async()=>({success:true,data:{}})};}});
  await c.remote(vin,action('unlock').payload);await c.remote(vin,action('set_charge_limit',{level:80}).payload);
  await c.setChargePlan(vin,{command:'stop'});await c.setTravelPlan(vin,{command:'stop'});await c.remoteState(vin);await c.chargeLimit(vin);
  assert.ok(calls[0].url.endsWith('/ms-remote-control/v1.0/remoteControl/control'));
  assert.ok(calls[1].url.endsWith('/ms-charge-manage/api/v1.0/charge/control'));
  assert.ok(calls[2].url.endsWith('/setChargingPlan'));assert.ok(calls[3].url.endsWith('/setTravelPlan'));
  for(const r of calls){assert.ok(r.headers['X-SIGNATURE']);assert.notEqual(r.headers['X-VIN'],vin);}
  let attempts=0;c.fetch=async()=>{attempts++;throw Error('private details');};
  await assert.rejects(c.setTravelPlan(vin,{}),/reached/);assert.equal(attempts,1);
  attempts=0;c.fetch=async()=>{attempts++;return {ok:true,status:200,headers:new Headers(),json:async()=>({success:false,msg:'Token expired'})};};
  await assert.rejects(c.remote(vin,action('unlock').payload));assert.equal(attempts,1);
});
