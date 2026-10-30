'use strict';
const catalog = require('../locales/en.json');
function english(key, tags = {}) {
  const value = key.split('.').reduce((v, part) => v?.[part], catalog);
  if (typeof value !== 'string') throw new Error('Missing English translation: ' + key);
  return value.replace(/__([a-zA-Z0-9_]+)__/g, (match, name) => Object.hasOwn(tags, name) ? String(tags[name]) : match);
}
function translator(homey) {
  return (key, tags = {}) => {
    const translated = typeof homey?.__ === 'function' ? homey.__(key, tags) : null;
    return typeof translated === 'string' && translated !== key ? translated : english(key, tags);
  };
}
module.exports = { english, translator };
