const assert = require('node:assert/strict');
const { classify, groupTabs, eligible } = require('./tidy-tabs.uc.js');
const cases = [
 ['https://store.steampowered.com', 'Welcome to Steam', 'Games'],
 ['https://google.com/search?q=videogames', '', 'Games'],
 ['https://youtube.com', 'YouTube', 'Media'],
 ['https://google.com/search?q=search+design', '', 'Design'],
 ['https://example.com', 'Що таке UX: принципи', 'Design'],
 ['https://example.com', 'Design Resources', 'Design'],
 ['https://wikipedia.org', 'Wikipedia', 'wikipedia.org'],
 ['https://pinterest.com', '', 'Design'],
 ['https://youtube.com/watch?v=a', 'Meet Act II of Arc Browser', 'Arc Browser'],
 ['https://example.com', 'Watch together using SharePlay', 'Apple'],
 ['https://notapple.com', '', 'notapple.com'],
 ['https://example.com', 'Liquid guide', 'example.com'],
 ['about:blank', '', 'Other'],
 ['bad url', '', 'Other']
];
for (const [url, title, expected] of cases) assert.equal(classify({url,title}), expected);
const strip = {};
const tab = {localName:'tab', parentElement:strip, hasAttribute:()=>false};
assert.equal(eligible(tab,strip),true);
for (const flag of ['pinned','closing','group']) assert.equal(eligible({...tab,[flag]:true},strip),false);
assert.equal(eligible(tab,{}),false);
for (const attr of ['pinned','zen-essential','zen-empty-tab','zen-glance-tab']) assert.equal(eligible({...tab,hasAttribute:a=>a===attr},strip),false);


assert.equal(classify({url:'https://minecraft.net',title:'Добро пожаловать на официальный сайт'}),'Games');
assert.equal(classify({url:'https://uk.wikipedia.org',title:'Інтерфейс користувача'}),'Design');
assert.equal(classify({url:'https://ru.wikipedia.org',title:'Интерфейс пользователя'}),'Design');
const sample = [
 {url:'https://store.steampowered.com'}, {url:'https://minecraft.net'},
 {url:'https://figma.com'}, {url:'https://wikipedia.org',title:'Интерфейс пользователя'},
 {url:'https://youtube.com'}, {url:'https://chatgpt.com'}, {url:'https://accounts.google.com'}
];
const plan = groupTabs(sample, t=>t);
assert.equal(plan.groups.get('Games').length,2);
assert.equal(plan.groups.get('Design').length,2);
assert.equal(plan.groups.get('Other').length,3);
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
assert.deepEqual(plan.groups.get('Other'),sample.slice(4));
console.log('39 assertions passed');
const { aiURL, parseAIPlan } = require('./tidy-tabs.uc.js');
assert.equal(aiURL('https://user:password@example.com/page?token=secret#private'),'https://example.com/page');
assert.equal(aiURL('about:preferences'),'');
assert.equal(aiURL('file:///secret.txt'),'');
assert.equal(aiURL('bad url'),'');
const aiTabs=[{id:0},{id:1},{id:2}];
const aiResult=parseAIPlan({groups:[{name:'Space',tabIds:[0,2]}]},aiTabs);
assert.deepEqual(aiResult.groups.get('Space'),[aiTabs[0],aiTabs[2]]);
assert.deepEqual(aiResult.loose,[aiTabs[1]]);
assert.throws(()=>parseAIPlan({groups:[{name:'Bad',tabIds:[0,99]}]},aiTabs));
assert.throws(()=>parseAIPlan({groups:[{name:'Bad',tabIds:[0,0]}]},aiTabs));
assert.throws(()=>parseAIPlan({groups:[{name:'Bad',tabIds:[0]}]},aiTabs));
assert.throws(()=>parseAIPlan({groups:[{name:'',tabIds:[0,1]}]},aiTabs));
assert.throws(()=>parseAIPlan({groups:[{name:'A',tabIds:[0,1]},{name:'B',tabIds:[1,2]}]},aiTabs));
assert.deepEqual(parseAIPlan({groups:[]},aiTabs).loose,aiTabs);
console.log('12 additional AI validation assertions passed');
