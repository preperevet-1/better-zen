// ==UserScript==
// @name           Zen Tidy Tabs
// @description    Apple Intelligence tab grouping with native Zen folders.
// @include        main
// @version        0.8.0
// ==/UserScript==
(() => {
  'use strict';
  const ICONS = {"broom": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNCAxNCI+PGcgdHJhbnNmb3JtPSJyb3RhdGUoMjUgNyA3KSI+PHBhdGggZD0iTTcgLjc1VjciIGZpbGw9Im5vbmUiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cmVjdCB4PSI0LjUiIHk9IjYuNSIgd2lkdGg9IjUiIGhlaWdodD0iMiIgcng9Ii43NSIvPjxwYXRoIGQ9Ik00LjI1IDlIOS43NUwxMS41IDEzLjVIMi41WiIvPjwvZz48L3N2Zz4="};
  // First matching rule wins. Edit names/domains/words to customize.
  const RULES = [
    { name: 'AI', domains: ['claude.ai','claude.com','anthropic.com','chatgpt.com','perplexity.ai'], words: ['claude','chatgpt','perplexity'] },
    { name: 'Arc Browser', domains: ['arc.net', 'thebrowser.company'], words: ['arc browser', 'act ii of arc'] },
    { name: 'Apple', domains: ['apple.com', '9to5mac.com', 'macrumors.com'], words: ['apple', 'iphone', 'macbook', 'shareplay', 'vision pro'] },
    { name: 'Design', domains: ['figma.com', 'dribbble.com', 'behance.net', 'mobbin.com','uxcel.com','thedsgnblog.com', 'pinterest.com'], words: ['design', 'дизайн', 'ux', 'ui', 'typography', 'типографіка', 'user interface', 'интерфейс пользователя', 'інтерфейс користувача'] },
    { name: 'Development', domains: ['github.com', 'gitlab.com', 'stackoverflow.com', 'developer.mozilla.org'], words: ['javascript', 'typescript', 'react', 'css', 'програмування'] },
    { name: 'Games', domains: ['steampowered.com', 'steamcommunity.com', 'gog.com', 'epicgames.com', 'minecraft.net', 'minecraft.wiki','poki.com','crazygames.com','itch.io', 'roblox.com'], words: ['videogames', 'video games', 'gaming','games','ігри','игры','poki','steam', 'відеоігри', 'minecraft', 'майнкрафт', 'roblox'] },
    { name: 'Media', domains: ['youtube.com', 'youtu.be', 'spotify.com', 'soundcloud.com', 'vimeo.com'], words: [] },
    { name: 'Shopping', domains: ['amazon.com', 'ebay.com', 'etsy.com', 'rozetka.com.ua'], words: [] },
  ];
  function classify({ url = '', title = '' }, baseDomain = host => host) {
    let parsed;
    try { parsed = new URL(url); } catch { return 'Other'; }
    if (!['https:', 'http:'].includes(parsed.protocol)) return 'Other';
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    let query = '';
    // Search queries are useful, arbitrary URL paths can create false matches.
    if (/^(www\.)?(google\.[a-z.]+|bing\.com|duckduckgo\.com)$/.test(host)) {
      query = parsed.searchParams.get('q') || '';
    }
    const words = new Set((title + ' ' + query).toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) || []);
    const normalized = ' ' + [...(title + ' ' + query).toLocaleLowerCase().matchAll(/[\p{L}\p{N}]+/gu)].map(m => m[0]).join(' ') + ' ';
    for (const rule of RULES) {
      if (rule.domains.some(d => host === d || host.endsWith('.' + d)) ||
          rule.words.some(w => w.includes(' ') ? normalized.includes(' ' + w + ' ') : words.has(w))) return rule.name;
    }
    try { return baseDomain(host) || host; } catch { return host; }
  }
  function groupTabs(tabs, describe, baseDomain) {
    const candidates = new Map();
    for (const tab of tabs) {
      const name = classify(describe(tab), baseDomain);
      if (!candidates.has(name)) candidates.set(name, []);
      candidates.get(name).push(tab);
    }
    const groups = new Map();
    const grouped = new Set();
    for (const [name, items] of candidates) {
      if (name !== 'Other' && items.length >= 2) {
        groups.set(name, items); items.forEach(tab => grouped.add(tab));
      }
    }
    // Keep unrelated singletons together, rather than one heading per website.
    const rest = tabs.filter(tab => !grouped.has(tab));
    if (rest.length >= 2) groups.set('Other', rest);
    return { groups, loose: rest.length < 2 ? rest : [] };
  }
  function eligible(tab, strip) {
    return tab?.localName === 'tab' && tab.parentElement === strip &&
      !tab.pinned && !tab.closing && !tab.hasAttribute('pinned') &&
      !tab.hasAttribute('zen-essential') && !tab.hasAttribute('zen-empty-tab') &&
      !tab.hasAttribute('zen-glance-tab') && !tab.group;
  }
  function aiURL(raw) {
    try {
      const url = new URL(raw);
      if (!['http:', 'https:'].includes(url.protocol)) return '';
      return (url.origin + url.pathname).slice(0, 400);
    } catch { return ''; }
  }
  function parseAIPlan(data, tabs) {
    if (!data || !Array.isArray(data.groups)) throw new Error('Invalid AI group response.');
    const used = new Set(), names = new Set(), groups = new Map();
    for (const group of data.groups) {
      const name = typeof group.name === 'string' ? group.name.trim() : '';
      if (!name || name.length > 60 || names.has(name.toLowerCase()) || !Array.isArray(group.tabIds) || group.tabIds.length < 2) {
        throw new Error('Invalid AI group. No tabs were changed.');
      }
      const items = [];
      for (const id of group.tabIds) {
        if (!Number.isInteger(id) || id < 0 || id >= tabs.length || used.has(id)) throw new Error('Invalid or repeated AI tab ID.');
        used.add(id); items.push(tabs[id]);
      }
      names.add(name.toLowerCase()); groups.set(name, items);
    }
    return { groups, loose:tabs.filter((_, i) => !used.has(i)) };
  }
  function reconcileTopics(plan, tabs, describe) {
    const aliases = new Map([
      ['ai assistants','AI'], ['artificial intelligence','AI'], ['ai tools','AI'], ['ai','AI'],
      ['ux design','Design'], ['ui ux','Design'], ['user experience','Design'], ['ux','Design'], ['design','Design'],
      ['games','Gaming'], ['video games','Gaming'], ['gaming','Gaming']
    ]);
    const assigned = new Map();
    for (const [topic, items] of plan.groups) {
      const canonical = aliases.get(topic.toLowerCase()) || topic;
      for (const tab of items) assigned.set(tab, canonical);
    }
    const buckets = new Map();
    for (const tab of tabs) {
      const known = classify(describe(tab));
      const name = ['AI','Design','Games'].includes(known) ? (known === 'Games' ? 'Gaming' : known) : assigned.get(tab) || 'Other';
      if (!buckets.has(name)) buckets.set(name, []);
      buckets.get(name).push(tab);
    }
    const groups = new Map(), loose = [];
    for (const [name, items] of buckets) {
      if (name === 'Other' || items.length < 2) loose.push(...items);
      else groups.set(name, items);
    }
    if (loose.length > 1) { groups.set('Other', loose); return {groups,loose:[]}; }
    return {groups, loose};
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { classify, groupTabs, eligible, RULES, aiURL, parseAIPlan, reconcileTopics }; return;
  }
  if (location.href !== 'chrome://browser/content/browser.xhtml') return;
  window.ZenTidyTabs?.destroy();
  const NS = 'http://www.w3.org/1999/xhtml';
  const states = new Map();
  const abort = new AbortController();
  let observer, timer, startupTimer, originalAddTab, patchedAddTab, settingsMenu, groupMenu, appleProcess, destroyed = false, busy = false;
  const node = (tag, cls, text) => {
    const el = document.createElementNS(NS, tag);
    if (cls) el.className = cls;
    if (text) el.textContent = text;
    return el;
  };
  function report(error) {
    console.error('[Zen Tidy Tabs]', error);
    Services.prompt.alert(window, 'Tidy Tabs', 'Unable to complete action: ' + error.message);
  }
  function activeStrip() {
    const ws = gZenWorkspaces.activeWorkspaceElement;
    return ws?.querySelector('.zen-workspace-normal-tabs-section') ||
      (gZenWorkspaces.activeWorkspaceStrip?.matches('.zen-workspace-normal-tabs-section') ? gZenWorkspaces.activeWorkspaceStrip : null);
  }
  const tabsIn = strip => [...strip.children].filter(t => eligible(t, strip));
  const {SessionStore} = ChromeUtils.importESModule('moz-src:///browser/components/sessionstore/SessionStore.sys.mjs');
  const sessionKey = 'zen-tidy-tabs-group-v1';
  function saveGroup(tab, name) {
    if (name) {
      const workspace = tab.getAttribute('zen-workspace-id') || gZenWorkspaces.activeWorkspace;
      SessionStore.setCustomTabValue(tab, sessionKey, JSON.stringify({workspace,name}));
    } else SessionStore.deleteCustomTabValue(tab, sessionKey);
  }
  function restoreGroups(strip, state) {
    for (const tab of tabsIn(strip)) {
      if (state.assignments.has(tab)) continue;
      const value = SessionStore.getCustomTabValue(tab, sessionKey);
      if (!value) continue;
      try {
        const {name, workspace} = JSON.parse(value);
        if (workspace === gZenWorkspaces.activeWorkspace && typeof name === 'string' && name.length && name.length <= 60) {
          state.assignments.set(tab,name);
          state.revealed.add(name);
        }
      } catch {}
    }
  }
  function getState(strip) {
    if (!states.has(strip)) states.set(strip, { assignments: new Map(), revealed: new Set(), headers: [], separator: null, tidyButton: null });
    return states.get(strip);
  }
  function members(strip, name) {
    const s = getState(strip);
    return tabsIn(strip).filter(t => s.assignments.get(t) === name);
  }
  function removeHeaders(s) {
    s.headers.forEach(h => h.remove()); s.headers = [];
  }
  function openGroupMenu(event, strip, name) {
    event.preventDefault(); event.stopPropagation();
    groupMenu?.remove();
    groupMenu = document.createXULElement('menupopup');
    for (const [label, action] of [
      ['Create pinned folder', () => folder(strip, name)],
      ['Close group', () => clear(strip, name)]
    ]) {
      const item = document.createXULElement('menuitem');
      item.setAttribute('label',label);
      item.addEventListener('command', () => Promise.resolve().then(action).catch(report));
      groupMenu.append(item);
    }
    document.getElementById('mainPopupSet').append(groupMenu);
    groupMenu.openPopupAtScreen(event.screenX,event.screenY,true);
  }
  function clear(strip, name) {
    if (busy || strip !== activeStrip()) return;
    const tabs = name === undefined ? tabsIn(strip) : members(strip, name);
    // Native closing preserves beforeunload prompts and session undo behavior.
    if (tabs.length) gBrowser.removeTabs(tabs);
    schedule();
  }
  function folder(strip, name) {
    if (busy || strip !== activeStrip()) return;
    const tabs = members(strip, name);
    if (!tabs.length) return;
    if (typeof gZenFolders?.createFolder !== 'function') throw new Error('This Zen version does not support native folders.');
    const created = gZenFolders.createFolder(tabs, { label: name, workspaceId: gZenWorkspaces.activeWorkspace });
    return Promise.resolve(created).then(() => {
      for (const tab of tabs) saveGroup(tab, null);
      schedule();
    });
  }
  function moveInOrder(strip, ordered) {
    let previous = null;
    for (const tab of ordered) {
      if (!eligible(tab, strip)) continue;
      if (previous) gBrowser.moveTabAfter(tab, previous);
      else {
        const first = tabsIn(strip)[0];
        if (first && first !== tab) gBrowser.moveTabBefore(tab, first);
      }
      previous = tab;
    }
  }
  // This release switches the existing installation to the requested local engine once.
  if (!Services.prefs.getBoolPref('zen.tidy.apple-enabled-v7', false)) {
    Services.prefs.setStringPref('zen.tidy.engine', 'apple');
    Services.prefs.setBoolPref('zen.tidy.apple-enabled-v7', true);
  }
  async function configureApple() {
    const picker = Cc['@mozilla.org/filepicker;1'].createInstance(Ci.nsIFilePicker);
    picker.init(window.browsingContext, 'Choose zen-tidy-apple from the extracted mod folder', Ci.nsIFilePicker.modeOpen);
    if (await new Promise(resolve => picker.open(resolve)) !== Ci.nsIFilePicker.returnOK) return false;
    if (picker.file.leafName !== 'zen-tidy-apple' || !picker.file.isExecutable())
      throw new Error('Select the executable named zen-tidy-apple inside apple-intelligence.');
    Services.prefs.setStringPref('zen.tidy.apple-helper', picker.file.path);
    Services.prefs.setStringPref('zen.tidy.engine', 'apple');
    return true;
  }
  async function applePlan(tabs) {
    if (tabs.length > 40) throw new Error('Apple Intelligence supports up to 40 tabs per workspace.');
    const {Subprocess} = ChromeUtils.importESModule('resource://gre/modules/Subprocess.sys.mjs');
    const process = await Subprocess.call({command:Services.prefs.getStringPref('zen.tidy.apple-helper'), arguments:[]});
    appleProcess = process;
    let expired = false;
    const timeout = setTimeout(() => { expired = true; process.kill(); }, 60000);
    try {
      if (destroyed) { process.kill(); throw new Error('Grouping cancelled.'); }
      await process.stdin.write(JSON.stringify({tabs:tabs.map((tab,id) => ({id,
        title:String(tab.label || '').slice(0,100), url:aiURL(tab.linkedBrowser?.currentURI?.spec).slice(0,120)
      }))}));
      await process.stdin.close();
      let output = '';
      while (true) {
        const chunk = await process.stdout.readString();
        if (!chunk) break;
        output += chunk;
        if (output.length > 100000) throw new Error('Unexpected Apple Intelligence response size.');
      }
      const {exitCode} = await process.wait();
      if (expired) throw new Error('Apple Intelligence timed out. Try fewer tabs.');
      if (exitCode !== 0) throw new Error('Apple Intelligence helper could not run. Re-select it from Tidy settings.');
      const result = JSON.parse(output);
      if (result.error || !result.available) throw new Error(result.error || 'Apple Intelligence is unavailable.');
      return reconcileTopics(parseAIPlan(result, tabs), tabs, tab => ({
        title:tab.label, url:tab.linkedBrowser?.currentURI?.spec
      }));
    } finally {
      clearTimeout(timeout);
      process.kill();
      if (appleProcess === process) appleProcess = null;
    }
  }
  function openSettings(event) {
    event.preventDefault(); event.stopPropagation();
    if (!settingsMenu) {
      settingsMenu = document.createXULElement('menupopup');
      const add = (label, action) => {
        const item = document.createXULElement('menuitem'); item.setAttribute('label', label);
        item.addEventListener('command', () => { if (!busy) Promise.resolve().then(action).catch(report); });
        settingsMenu.append(item);
      };
      add('Apple Intelligence helper…', configureApple);
      add('Use Apple Intelligence', () => Services.prefs.setStringPref('zen.tidy.engine','apple'));
      add('Use local rules', () => Services.prefs.setStringPref('zen.tidy.engine','rules'));
      document.getElementById('mainPopupSet').append(settingsMenu);
    }
    settingsMenu.openPopupAtScreen(event.screenX, event.screenY, true);
  }
  function installDrag() {
    let drag = null, indicator = null;
    const listen = (type, fn) => window.addEventListener(type,fn,{capture:true,signal:abort.signal});
    function mark(element, edge) {
      if (indicator !== element) indicator?.removeAttribute('data-ztt-drop');
      indicator = element;
      if (element) element.setAttribute('data-ztt-drop',edge);
    }
    function reset() { mark(null); drag = null; }
    listen('dragstart', event => {
      reset();
      const strip = activeStrip();
      if (busy || !strip) return;
      const header = event.target.closest?.('.ztt-header');
      if (header?.parentElement === strip) {
        drag = {strip, name:header.dataset.zttGroup};
        event.dataTransfer.setData('application/x-zen-tidy-group', drag.name);
        event.dataTransfer.effectAllowed = 'move';
        event.stopImmediatePropagation();
        return;
      }
      const tab = event.target.closest?.('tab');
      if (eligible(tab,strip)) drag = {strip, tab};
    });
    function destination(event) {
      if (!drag || busy || drag.strip !== activeStrip()) return null;
      const {strip, name, tab} = drag;
      const s = getState(strip);
      const target = event.target;
      if (name) {
        const workspace = gZenWorkspaces.activeWorkspaceElement;
        const separator = s.separator;
        if (workspace.contains(target) && separator &&
            (separator.contains(target) || target.closest?.('.zen-workspace-pinned-tabs-section') ||
             event.clientY < separator.getBoundingClientRect().top)) {
          return {kind:'folder', element:separator, edge:'pin'};
        }
      }
      if (!strip.contains(target)) return null;
      const header = target.closest?.('.ztt-header');
      const row = target.closest?.('tab');
      const topic = header?.dataset.zttGroup || s.assignments.get(row);
      if (tab) {
        if (!eligible(tab,strip) || !topic || s.assignments.get(tab) === topic) return null;
        return {kind:'join', topic, element:header || row, edge:'join'};
      }
      if (topic === name) return null;
      const anchor = header || row;
      const after = anchor ? event.clientY > anchor.getBoundingClientRect().top + anchor.getBoundingClientRect().height / 2 : true;
      const edge = topic ? (after ? 'after' : 'before') : (anchor ? 'before' : 'after');
      const targetMembers = topic ? members(strip,topic) : [];
      const firstHeader = s.headers.find(h => h.dataset.zttGroup === topic);
      return {kind:'order',topic, edge, element:topic ? (after ? targetMembers.at(-1) : firstHeader) : anchor || strip};
    }
    function handle(event) {
      const dest = destination(event);
      if (!dest) { mark(null); return; }
      event.preventDefault(); event.stopImmediatePropagation();
      event.dataTransfer.dropEffect = 'move';
      if (event.type !== 'drop') { mark(dest.element,dest.edge); return; }
      const {strip, name, tab} = drag;
      reset();
      const s = getState(strip);
      if (dest.kind === 'folder') {
        Promise.resolve().then(() => folder(strip,name)).catch(report);
        return;
      }
      if (dest.kind === 'join') {
        const last = members(strip,dest.topic).at(-1);
        if (!last) return;
        gBrowser.moveTabAfter(tab,last);
        s.assignments.set(tab,dest.topic);
        saveGroup(tab,dest.topic);
      } else {
        const moving = members(strip,name);
        if (!moving.length) return;
        const remaining = tabsIn(strip).filter(t => !moving.includes(t));
        const targetMembers = dest.topic ? members(strip,dest.topic) : [];
        let index;
        if (targetMembers.length) {
          index = dest.edge === 'after' ? remaining.indexOf(targetMembers.at(-1))+1 : remaining.indexOf(targetMembers[0]);
        } else {
          index = dest.edge === 'after' ? remaining.length : remaining.findIndex(t => s.assignments.has(t));
          if (index < 0) index = remaining.length;
        }
        remaining.splice(index,0,...moving);
        moveInOrder(strip,remaining);
      }
      render(strip);
    }
    for (const type of ['dragenter','dragover','drop']) listen(type,handle);
    listen('dragleave',event => { if (!indicator?.contains(event.relatedTarget)) mark(null); });
    listen('dragend',reset);
    abort.signal.addEventListener('abort',reset,{once:true});
  }
  function installInsertionHook() {
    originalAddTab = gBrowser.addTab;
    patchedAddTab = function(uri, options = {}) {
      if (!destroyed && !options.pinned && !options.essential && !options._forZenEmptyTab && !options.tabGroup && options.insertTab !== false &&
          (!options.zenWorkspaceId || options.zenWorkspaceId === gZenWorkspaces.activeWorkspace)) {
        const strip = activeStrip(), s = strip && states.get(strip);
        const first = strip && tabsIn(strip)[0];
        if (first && s?.assignments.size && Number.isInteger(first.index)) {
          options = {...options, tabIndex:first.index, elementIndex:undefined, relatedToCurrent:false, skipAnimation:true};
        }
      }
      const tab = originalAddTab.call(this, uri, options);
      // Native insertion targets a tab, while our heading precedes that tab.
      // Put the heading back after the new tab synchronously, before painting.
      if (!destroyed && tab) {
        const strip = activeStrip(), s = strip && states.get(strip);
        if (s?.assignments.size && eligible(tab,strip) && !s.assignments.has(tab)) render(strip);
      }
      return tab;
    };
    gBrowser.addTab = patchedAddTab;
  }
  function animateTidy(s, running = () => false) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return Promise.resolve();
    const line = s.separator.querySelector('toolbarseparator');
    if (!line) return Promise.resolve();
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.classList.add('ztt-wave'); svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('fill', 'none'); path.setAttribute('stroke', 'currentColor');
    svg.append(path); line.append(svg);
    const brush = s.tidyButton.querySelector('.toolbarbutton-icon');
    const sweep = brush?.animate([
      { transform:'rotate(0deg)', offset:0 },
      { transform:'rotate(24deg)', offset:0.25 },
      { transform:'rotate(-5deg)', offset:0.65 },
      { transform:'rotate(0deg)', offset:1 }
    ], { duration:900, easing:'ease-in-out' });
    return new Promise(resolve => {
      let frame;
      const finish = () => {
        cancelAnimationFrame(frame); svg.remove(); sweep?.cancel();
        s.cancelWave = null; resolve();
      };
      s.cancelWave = finish;
      const start = performance.now();
      let settleAt = null;
      const smooth = value => value * value * (3 - 2 * value);
      const draw = now => {
        if (destroyed || !line.isConnected) { finish(); return; }
        const elapsed = now - start;
        if (!running() && settleAt === null && elapsed >= 600) settleAt = elapsed;
        const strength = smooth(Math.max(0, Math.min(1, elapsed / 300, settleAt === null ? 1 : (settleAt + 300 - elapsed) / 300)));
        const width = Math.max(1, line.getBoundingClientRect().width);
        svg.setAttribute('viewBox', `0 0 ${width} 9`);
        let d = '';
        // A traveling sine with a smooth amplitude envelope returns to the
        // exact same one-pixel baseline; no vertical scaling of its stroke.
        for (let x = 0; x <= Math.ceil(width); x++) {
          const y = 4.5 + 2.25 * strength * Math.sin(2 * Math.PI * (x / 10 + elapsed / 500));
          d += `${x ? 'L' : 'M'}${x},${y.toFixed(3)} `;
        }
        path.setAttribute('d', d);
        path.setAttribute('stroke-width', String(1 + 0.25 * strength));
        if (settleAt !== null && elapsed >= settleAt + 300) finish();
        else frame = requestAnimationFrame(draw);
      };
      draw(start);
    });
  }
  async function tidy(strip) {
    if (busy || strip !== activeStrip() || tabsIn(strip).length < 5) return;
    const engine = Services.prefs.getStringPref('zen.tidy.engine', 'apple') === 'rules' ? 'rules' : 'apple';
    if (engine === 'apple' && !Services.prefs.getStringPref('zen.tidy.apple-helper', '')) {
      if (!await configureApple()) return;
    }
    if (busy || destroyed || strip !== activeStrip()) return;
    const s = getState(strip);
    const snapshot = tabsIn(strip);
    busy = true;
    if (!mountControl(strip, s)) { busy = false; return; }
    s.separator.classList.add('ztt-working');
    s.tidyButton.disabled = true;
    s.tidyButton.setAttribute('aria-busy', 'true');
    try {
      // Let the wave play while retaining an exact scope for this click.
      let waiting = engine === 'apple';
      const pending = waiting ? applePlan(snapshot).then(value => ({value}), error => ({error})).finally(() => { waiting = false; }) : null;
      await animateTidy(s, () => waiting);
      const result = pending ? await pending : null;
      if (destroyed || !strip.isConnected || strip !== activeStrip()) return;
      if (result?.error) throw result.error;
      const tabs = snapshot.filter(tab => eligible(tab, strip));
      const plan = result?.value || groupTabs(tabs,
        tab => ({ url: tab.linkedBrowser?.currentURI?.spec, title: tab.label }),
        host => Services.eTLD.getBaseDomainFromHost(host));
      // Tabs may close, move or be pinned while the request is in flight.
      const groups = new Map(), grouped = new Set();
      for (const [name, members] of plan.groups) {
        const kept = members.filter(tab => eligible(tab,strip));
        if (kept.length >= 2) { groups.set(name,kept); kept.forEach(tab => grouped.add(tab)); }
      }
      const loose = tabs.filter(tab => !grouped.has(tab));
      s.assignments.clear();
      s.revealed.clear();
      for (const [name, items] of groups) for (const tab of items) s.assignments.set(tab, name);
      for (const tab of tabs) saveGroup(tab, s.assignments.get(tab));
      removeHeaders(s);
      moveInOrder(strip, loose.concat([...groups.values()].flat()));
    } finally {
      busy = false;
      s.separator?.classList.remove('ztt-working');
      if (s.tidyButton) { s.tidyButton.disabled = false; s.tidyButton.removeAttribute('aria-busy'); }
      if (!destroyed) render(strip);
    }
  }
  function unmountControl(s) {
    s.cancelWave?.();
    s.tidyButton?.remove();
    s.separator?.classList.remove('ztt-native-separator', 'ztt-working');
    s.tidyButton = null; s.separator = null;
  }
  function mountControl(strip, s) {
    const workspace = strip.closest('zen-workspace') || gZenWorkspaces.activeWorkspaceElement;
    const clearButton = workspace?.querySelector('.pinned-tabs-container-separator > .zen-workspace-close-unpinned-tabs-button');
    if (!clearButton) { unmountControl(s); return false; }
    const separator = clearButton.parentElement;
    if (s.separator === separator && s.tidyButton?.isConnected) {
      s.tidyButton.hidden = tabsIn(strip).length < 5;
      return true;
    }
    unmountControl(s);
    s.separator = separator;
    separator.classList.add('ztt-native-separator');
    const tidyButton = document.createXULElement('toolbarbutton');
    tidyButton.className = 'ztt-tidy';
    tidyButton.setAttribute('label', 'Tidy');
    tidyButton.setAttribute('tooltiptext', 'Group tabs · Right-click for AI settings');
    tidyButton.setAttribute('aria-label', 'Tidy tabs');
    tidyButton.addEventListener('contextmenu', openSettings);
    tidyButton.addEventListener('command', () => { tidy(strip).catch(report); });
    tidyButton.addEventListener('dblclick', e => e.stopPropagation());
    separator.insertBefore(tidyButton, clearButton);
    s.tidyButton = tidyButton;
    tidyButton.hidden = tabsIn(strip).length < 5;
    return true;
  }
  function render(strip) {
    const s = getState(strip);
    mountControl(strip, s);
    restoreGroups(strip,s);
    for (const tab of s.assignments.keys()) if (!eligible(tab, strip)) s.assignments.delete(tab);
    // A group is a snapshot from the last Tidy click. New tabs stay above
    // all headers, even when Zen inserts them next to the selected tab.
    const counts = new Map();
    for (const name of s.assignments.values()) counts.set(name, (counts.get(name) || 0) + 1);
    for (const [tab, name] of s.assignments) if (counts.get(name) < 2) s.assignments.delete(tab);
    const current = tabsIn(strip);
    const loose = current.filter(tab => !s.assignments.has(tab));
    const blocks = new Map();
    for (const tab of current) {
      const name = s.assignments.get(tab);
      if (!name) continue;
      if (!blocks.has(name)) blocks.set(name, []);
      blocks.get(name).push(tab);
    }
    const ordered = loose.concat(...blocks.values());
    if (current.some((tab, i) => tab !== ordered[i])) moveInOrder(strip, ordered);
    let lastName;
    const previous = [...s.headers];
    const kept = [];
    let revealIndex = 0;
    for (const tab of tabsIn(strip)) {
      const name = s.assignments.get(tab);
      if (name && name !== lastName && members(strip, name).length >= 2) {
        let header = previous.find(h => h.dataset.zttGroup === name && !kept.includes(h));
        if (!header) {
          header = node('div', 'ztt-header');
          header.dataset.zttGroup = name;
          const label = node('span', 'ztt-label', name);
          header.append(label);
          header.draggable = true;
          header.tabIndex = 0;
          header.addEventListener('contextmenu', event => openGroupMenu(event,strip,name));
          if (!s.revealed.has(name)) {
            s.revealed.add(name);
            label.classList.add('ztt-title-enter');
            label.style.animationDelay = Math.min(revealIndex++ * 55, 165) + 'ms';
            label.addEventListener('animationend', event => {
              if (event.animationName !== 'ztt-title-enter') return;
              label.classList.remove('ztt-title-enter'); label.style.removeProperty('animation-delay');
            });
          }
        }
        header.setAttribute('aria-label', name);
        if (header.nextElementSibling !== tab) strip.insertBefore(header, tab);
        kept.push(header);
      }
      lastName = name;
    }
    for (const header of previous) if (!kept.includes(header)) header.remove();
    s.headers = kept;
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (destroyed || busy) return;
      if (gBrowser.tabContainer.hasAttribute('movingtab')) { schedule(); return; }
      for (const [strip, s] of states) if (!strip.isConnected) { removeHeaders(s); unmountControl(s); states.delete(strip); }
      const strip = activeStrip();
      if (strip) render(strip);
    }, 100);
  }
  const style = node('style');
  style.textContent = `
    .ztt-header { display:flex; align-items:center; gap:5px; flex:none;
      box-sizing:border-box; min-width:0; margin:3px 5px 0; padding:0 5px;
      color:inherit; font:inherit; -moz-window-dragging:no-drag; }
    .ztt-header { height:22px; min-height:22px; margin-top:3px; }
    .ztt-label { flex:0 1 auto; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:12px; font-weight:600; opacity:.68; }
    [data-ztt-drop='before'] { box-shadow:inset 0 2px var(--zen-primary-color,Highlight)!important; }
    [data-ztt-drop='after'],[data-ztt-drop='pin'] { box-shadow:inset 0 -2px var(--zen-primary-color,Highlight)!important; }
    [data-ztt-drop='join'] { outline:1px solid var(--zen-primary-color,Highlight); outline-offset:-2px; }
    .ztt-header { cursor:grab; justify-content:flex-start; }
    .ztt-header:focus-visible { outline:2px solid var(--zen-primary-color,#8c70c2); outline-offset:1px; border-radius:4px; }
    .ztt-native-separator > .ztt-tidy {
      color:inherit!important; font-size:10px; font-weight:500;
      opacity:1!important; margin:0!important; padding:0 0 0 8px!important;
      border:0!important; box-shadow:none!important; outline:none;
      -moz-window-dragging:no-drag; cursor:pointer;
    }
    .ztt-native-separator > toolbarbutton,
    .ztt-native-separator > toolbarbutton:hover,
    .ztt-native-separator > toolbarbutton:active {
      background:none!important; border-color:transparent!important; box-shadow:none!important;
    }
    .ztt-native-separator > .ztt-tidy[hidden] { display:none!important; }
    .ztt-native-separator > .ztt-tidy > .toolbarbutton-icon {
      display:block!important; width:12px!important; height:14px!important;
      list-style-image:none!important; background:currentColor!important;
      mask:url("${ICONS.broom}") center / contain no-repeat!important;
    }
    .ztt-native-separator > .ztt-tidy:focus-visible { outline:2px solid var(--zen-primary-color,#8c70c2); }
    /* Zen draws a separate substitute line inside each hidden button.
       Replace those segments with one continuous line over the native row. */
    #navigator-toolbox:not([zen-has-implicit-hover="true"]) .ztt-native-separator::before {
      content:''; position:absolute; inset-inline:9px 5px; top:50%; height:1px;
      background:var(--zen-pinned-separator-color); pointer-events:none;
    }
    #navigator-toolbox:not([zen-has-implicit-hover="true"]) .ztt-native-separator > toolbarseparator {
      background:transparent!important;
    }
    .ztt-native-separator.ztt-working > toolbarseparator {
      position:relative; overflow:visible; border-color:transparent!important;
      background:none!important; }
    .ztt-native-separator.ztt-working::before { display:none!important; }
    .ztt-wave { position:absolute; left:0; top:50%; transform:translateY(-50%);
      display:block; width:100%; height:9px; overflow:hidden; pointer-events:none;
      color:var(--zen-pinned-separator-color); }
    .ztt-native-separator.ztt-working > toolbarbutton { pointer-events:auto; }
    .ztt-native-separator.ztt-working > toolbarbutton > :is(.toolbarbutton-icon,.toolbarbutton-text) { opacity:.5; }
    .ztt-title-enter {
      position:relative; -webkit-text-fill-color:transparent;
      background:linear-gradient(90deg,currentColor 0%,currentColor 35%,#6a9ee9 42%,#c8a9e8 46%,#e7c777 50%,#d97dbd 54%,currentColor 62%,currentColor 100%);
      background-size:300% 100%; background-repeat:no-repeat; background-clip:text;
      animation:ztt-title-enter 1200ms ease-out both;
    }
    .ztt-title-enter::after {
      content:''; position:absolute; left:0; top:50%; width:min(72px,60%); height:6px;
      border-radius:2px; background:currentColor; transform:translateY(-50%);
      animation:ztt-title-placeholder 1200ms ease-out both;
      animation-delay:inherit;
    }
    @keyframes ztt-title-enter {
      0%,18% { opacity:.35; background-position:100% 0; clip-path:inset(0); -webkit-text-fill-color:transparent; background-size:0% 100%; }
      19% { opacity:.68; background-position:100% 0; background-size:300% 100%; }
      100% { opacity:.68; background-position:0% 0; background-size:300% 100%; }
    }
    @keyframes ztt-title-placeholder {
      0%,12% { opacity:.35; }
      22%,100% { opacity:0; }
    }
    :root:not([zen-sidebar-expanded='true']) .ztt-header,
    :root:not([zen-sidebar-expanded='true']) .ztt-tidy { display:none; }
    @media(prefers-reduced-motion:reduce) { .ztt-title-enter,.ztt-title-enter::after,.ztt-wave { animation:none!important; } .ztt-title-enter { background:none; -webkit-text-fill-color:currentColor; } .ztt-title-enter::after { display:none; } }
  `;
  function init() {
    if (destroyed) return;
    if (!window.gBrowser || !window.gZenWorkspaces) { startupTimer = setTimeout(init, 250); return; }
    document.documentElement.append(style);
    installInsertionHook();
    installDrag();
    for (const event of ['SSTabRestored','SSTabRestoring','TabOpen','TabClose','TabMove','TabPinned','TabUnpinned','TabAttrModified','TabSelect','TabGroupCreate','TabGroupRemoved']) {
      gBrowser.tabContainer.addEventListener(event, schedule, { signal:abort.signal });
    }
    // Observe only browser workspace attributes, not our header mutations.
    observer = new MutationObserver(schedule);
    observer.observe(document.documentElement, { subtree:true, attributes:true, attributeFilter:['zen-workspace-id','active','zen-active','zen-sidebar-expanded'] });
    window.addEventListener('unload', destroy, { once:true, signal:abort.signal });
    schedule();
  }
  function destroy() {
    destroyed = true; abort.abort(); observer?.disconnect(); clearTimeout(timer); clearTimeout(startupTimer);
    for (const s of states.values()) { removeHeaders(s); unmountControl(s); }
    states.clear(); style.remove(); settingsMenu?.remove(); groupMenu?.remove(); appleProcess?.kill();
    if (gBrowser.addTab === patchedAddTab) gBrowser.addTab = originalAddTab;
    if (window.ZenTidyTabs?.destroy === destroy) delete window.ZenTidyTabs;
  }
  window.ZenTidyTabs = { destroy, configureApple, tidy:() => { const strip = activeStrip(); if (strip) return tidy(strip); } };
  init();
})();
