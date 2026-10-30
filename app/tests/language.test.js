'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {english,translator}=require('../lib/language');
const {action}=require('../lib/extended');
const {parseSecrets}=require('../lib/config');
const {apiError,ZeekrClient}=require('../lib/client');
function homey(language){const catalog=require('../locales/'+language+'.json');return {__:(key,tags={})=>key.split('.').reduce((v,k)=>v?.[k],catalog)?.replace(/__(\w+)__/g,(m,k)=>Object.hasOwn(tags,k)?String(tags[k]):m)};}
function leaves(obj,prefix=''){return Object.entries(obj).flatMap(([k,v])=>typeof v==='string'?[prefix+k]:leaves(v,prefix+k+'.'));}
test('English and Swedish catalogs cover identical keys and interpolation tags',()=>{
  const en=require('../locales/en.json'),sv=require('../locales/sv.json');assert.deepEqual(leaves(en).sort(),leaves(sv).sort());
  for(const key of leaves(en)){const a=key.split('.').reduce((v,k)=>v[k],en),b=key.split('.').reduce((v,k)=>v[k],sv);assert.deepEqual((a.match(/__\w+__/g)||[]).sort(),(b.match(/__\w+__/g)||[]).sort(),key);}
});
test('runtime fallback is English; Homey language localizes validation and sanitized API errors',()=>{
  assert.equal(translator({__:()=>null})('runtime.command_accepted'),'Command accepted; waiting for vehicle status');
  for(const lang of ['en','sv']){const t=translator(homey(lang));assert.throws(()=>action('set_charge_limit',{level:81},t),lang==='en'?/steps of 5/:/steg om 5/);assert.throws(()=>action('start_wheel_heat',{minutes:0},t),lang==='en'?/Minutes: 1–60/:/Minuter: 1–60/);assert.throws(()=>parseSecrets('{',t),lang==='en'?/valid JSON/:/giltig JSON/);const e=apiError({code:'079025',msg:'PRIVATE'},t);assert.match(e.message,lang==='en'?/rejected/:/avvisades/);assert.ok(!e.message.includes('PRIVATE'));assert.equal(e.code,'079025');}
  assert.equal(english('runtime.http_error',{code:503}),'Zeekr responded with HTTP 503.');
});
test('client uses injected Homey translation for network failure and retains error code',async()=>{
  const c=new ZeekrClient({}, {translate:translator(homey('sv')),fetch:async()=>{throw Error('PRIVATE');},session:{token:'fake',deviceId:'fake'}});
  await assert.rejects(c._http('GET','https://example.invalid',{}),e=>e.code==='network'&&/kunde inte nås/.test(e.message)&&!e.message.includes('PRIVATE'));
});
