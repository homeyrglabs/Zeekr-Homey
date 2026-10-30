'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const info = { configured: true, keysSaved: true, email: 'example@example.invalid', country: 'SE', appVersion: '3.1.1', interval: 300 };
function surface(file, pairing, language = 'en') {
  const html = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  const elements = {}, nodes = [];
  for (const match of html.matchAll(/<[a-z][^>]*>/gi)) {
    const attrs=Object.fromEntries([...match[0].matchAll(/([\w-]+)="([^"]*)"/g)].map(x=>[x[1],x[2]]));
    const node={attrs,value:attrs.value||'',textContent:'',listeners:{},addEventListener(name,fn){this.listeners[name]=fn;},getAttribute(name){return this.attrs[name];},setAttribute(name,value){this.attrs[name]=value;}};
    nodes.push(node);if(attrs.id)elements[attrs.id]=node;
  }
  const doc={documentElement:{},getElementById:id=>elements[id],querySelectorAll:selector=>nodes.filter(n=>Object.hasOwn(n.attrs,selector.slice(1,-1)))};
  const catalog=require('../locales/'+language+'.json');
  const calls = [], views = [];
  const Homey = { __:(key,tags={})=>key.split('.').reduce((v,k)=>v?.[k],catalog)?.replace(/__(\w+)__/g,(m,k)=>Object.hasOwn(tags,k)?String(tags[k]):m),
    ready: () => calls.push('ready'), showView: name => views.push(name),
    emit: async event => { calls.push(event); return event === 'configuration' ? info : { ...info, vehicles: 1 }; },
    api: (method, route, _payload, callback) => { calls.push(method + route); callback(null, method === 'GET' ? info : { ...info, vehicles: 1 }); } };
  const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');
  const context = { Homey, document: doc, Promise, JSON, Error, Number };
  vm.createContext(context); vm.runInContext(scripts, context);
  if (!pairing) context.onHomeyReady(Homey);
  return { elements, calls, views, doc, nodes };
}
const flush = () => new Promise(resolve => setImmediate(resolve));
test('pairing uses the Promise bridge, saves then opens vehicle list and clears credentials', async () => {
  const { elements, calls, views } = surface('drivers/zeekr/pair/login.html', true);
  await flush(); assert.equal(elements.email.value, info.email); assert.equal(elements.existing.hidden, false);
  elements.password.value = 'transient-password'; elements.secrets.value = '{}';
  await elements.form.listeners.submit({ preventDefault() {} });
  assert.deepEqual(calls, ['configuration', 'login']); assert.deepEqual(views, ['list_devices']);
  assert.equal(elements.password.value, ''); assert.equal(elements.secrets.value, ''); assert.equal(elements.save.disabled, false);
});
test('settings uses authenticated Homey API and is revealed after boot', async () => {
  const { elements, calls, views } = surface('settings/index.html', false);
  await flush(); assert.ok(calls.includes('ready')); assert.equal(elements.existing.hidden, true);
  await elements.form.listeners.submit({ preventDefault() {} });
  assert.ok(calls.includes('POST/configuration')); assert.deepEqual(views, []);
});
for(const language of ['en','sv']) {
  test(language+' pairing and settings translate labels, placeholders and dynamic status',async()=>{
    for(const [file,pairing] of [['settings/index.html',false],['drivers/zeekr/pair/login.html',true]]) {
      const {elements,doc,nodes}=surface(file,pairing,language);await flush();
      assert.equal(doc.documentElement.lang,language);
      assert.equal(elements.save.textContent,language==='en'?'Save and connect':'Spara och anslut');
      assert.match(elements.password.attrs.placeholder,language==='en'?/Leave blank/:/Lämna tomt/);
      assert.match(elements.keystate.textContent,language==='en'?/Six keys/:/Sex nycklar/);
      assert.ok(nodes.some(n=>n.attrs.href==='https://github.com/homeyrglabs/Zeekr-Homey/releases'));
      await elements.form.listeners.submit({preventDefault(){}});
      assert.equal(elements.status.textContent,language==='en'?'Connected. Vehicles: 1.':'Ansluten. Antal bilar: 1.');
    }
  });
}
test('key-file errors are localized and do not display file contents',async()=>{
  for(const language of ['en','sv']) {
    const {elements}=surface('settings/index.html',false,language);await flush();
    elements.file.files=[{size:20,text:async()=>'{PRIVATE_INVALID_JSON'}];await elements.file.listeners.change();
    assert.equal(elements.status.textContent,language==='en'?'Could not read the file as JSON.':'Kunde inte läsa filen som JSON.');assert.ok(!elements.status.textContent.includes('PRIVATE'));
  }
});
