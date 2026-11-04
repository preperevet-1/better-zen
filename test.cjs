const assert = require('node:assert/strict');
const { classify, eligible } = require('./tidy-tabs.uc.js');
const cases = [
 ['https://store.steampowered.com', 'Welcome to Steam', 'Ігри'],
 ['https://google.com/search?q=videogames', '', 'Ігри'],
 ['https://youtube.com', 'YouTube', 'Відео й музика'],
 ['https://google.com/search?q=search+design', '', 'Дизайн'],
 ['https://example.com', 'Що таке UX: принципи', 'Дизайн'],
 ['https://example.com', 'Design Resources', 'Дизайн'],
 ['https://wikipedia.org', 'Wikipedia', 'wikipedia.org'],
 ['https://pinterest.com', '', 'Дизайн'],
 ['https://youtube.com/watch?v=a', 'Meet Act II of Arc Browser', 'Arc Browser'],
 ['https://example.com', 'Watch together using SharePlay', 'Apple'],
 ['https://notapple.com', '', 'notapple.com'],
 ['https://example.com', 'Liquid guide', 'example.com'],
 ['about:blank', '', 'Інше'],
 ['bad url', '', 'Інше']
];
for (const [url, title, expected] of cases) assert.equal(classify({url,title}), expected);
const strip = {};
const tab = {localName:'tab', parentElement:strip, hasAttribute:()=>false};
assert.equal(eligible(tab,strip),true);
for (const flag of ['pinned','closing','group']) assert.equal(eligible({...tab,[flag]:true},strip),false);
assert.equal(eligible(tab,{}),false);
for (const attr of ['pinned','zen-essential','zen-empty-tab','zen-glance-tab']) assert.equal(eligible({...tab,hasAttribute:a=>a===attr},strip),false);
console.log('23 assertions passed');
