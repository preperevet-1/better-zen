const assert = require('node:assert/strict');
const { classify, groupTabs, eligible } = require('./tidy-tabs.uc.js');
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


assert.equal(classify({url:'https://minecraft.net',title:'Добро пожаловать на официальный сайт'}),'Ігри');
assert.equal(classify({url:'https://uk.wikipedia.org',title:'Інтерфейс користувача'}),'Дизайн');
assert.equal(classify({url:'https://ru.wikipedia.org',title:'Интерфейс пользователя'}),'Дизайн');
const sample = [
 {url:'https://store.steampowered.com'}, {url:'https://minecraft.net'},
 {url:'https://figma.com'}, {url:'https://wikipedia.org',title:'Интерфейс пользователя'},
 {url:'https://youtube.com'}, {url:'https://chatgpt.com'}, {url:'https://accounts.google.com'}
];
const plan = groupTabs(sample, t=>t);
assert.equal(plan.groups.get('Ігри').length,2);
assert.equal(plan.groups.get('Дизайн').length,2);
assert.equal(plan.groups.get('Інше').length,3);
assert.equal(plan.groups.size,3);
assert.equal(plan.loose.length,0);
const solo = groupTabs([{url:'https://youtube.com'}],t=>t);
assert.equal(solo.groups.size,0);
assert.equal(solo.loose.length,1);
const withLone = groupTabs(sample.slice(0,5),t=>t);
assert.equal(withLone.groups.size,2);
assert.equal(withLone.loose.length,1);
assert.deepEqual(withLone.loose,[sample[4]]);
const seen = [...plan.groups.values()].flat().concat(plan.loose);
assert.equal(new Set(seen).size,sample.length);
assert.equal(seen.length,sample.length);
assert.deepEqual(plan.groups.get('Інше'),sample.slice(4));
console.log('39 assertions passed');
