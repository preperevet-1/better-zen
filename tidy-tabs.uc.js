// ==UserScript==
// @name           Zen Tidy Tabs
// @description    Rule-based tab grouping with native Zen folders.
// @include        main
// @version        0.10.1
// ==/UserScript==
(() => {
  'use strict';
  const ICONS = {"broom": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNCAxNCI+PGcgdHJhbnNmb3JtPSJyb3RhdGUoMjUgNyA3KSI+PHBhdGggZD0iTTcgLjc1VjciIGZpbGw9Im5vbmUiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cmVjdCB4PSI0LjUiIHk9IjYuNSIgd2lkdGg9IjUiIGhlaWdodD0iMiIgcng9Ii43NSIvPjxwYXRoIGQ9Ik00LjI1IDlIOS43NUwxMS41IDEzLjVIMi41WiIvPjwvZz48L3N2Zz4="};
  // First matching rule wins. Edit names/domains/words to customize.
  const RULES = [
    { name: 'AI', domains: ['claude.ai','claude.com','anthropic.com','chatgpt.com','perplexity.ai'], words: ['claude','chatgpt','perplexity'] },
    { name: 'Browsers', domains: ['zen-browser.app','zen-browser.com','arc.net','diabrowser.com','thebrowser.company','firefox.com','vivaldi.com','brave.com','opera.com','chromium.org','googlechrome.com'], words: ['browser','browsers','браузер','браузери','браузеры','firefox','chromium','zen twilight','act ii of arc','farewell to arc'] },
    { name: 'Social Media', domains: ['instagram.com','facebook.com','threads.com','threads.net','x.com','twitter.com','tiktok.com','bsky.app','reddit.com','mastodon.social','linkedin.com'], words: ['social media','social network','соцмережі','соціальні мережі'] },
    { name: 'News', domains: ['reuters.com','apnews.com','bbc.com','bbc.co.uk','theguardian.com','nytimes.com','suspilne.media','pravda.com.ua','theverge.com'], words: ['breaking news','новини','новости','headlines'] },
    { name: 'Learning', domains: ['coursera.org','edx.org','khanacademy.org','duolingo.com','udemy.com'], words: ['online course','language learning','вивчення мови'] },
    { name: 'Travel', domains: ['booking.com','airbnb.com','tripadvisor.com','skyscanner.net'], words: ['travel guide','flights','подорож','авіаквитки'] },
    { name: 'Food', domains: ['allrecipes.com','seriouseats.com','cookpad.com'], words: ['recipe','recipes','рецепт','рецепти','sourdough'] },
    { name: 'Sports', domains: ['espn.com','uefa.com','nba.com','formula1.com'], words: ['football','basketball','футбол','баскетбол','formula 1'] },
    { name: 'Apple', domains: ['apple.com', '9to5mac.com', 'macrumors.com'], words: ['apple', 'iphone', 'macbook', 'shareplay', 'vision pro'] },
    { name: 'Design', domains: ['figma.com', 'dribbble.com', 'behance.net', 'mobbin.com','uxcel.com','thedsgnblog.com', 'pinterest.com'], words: ['design', 'дизайн', 'ux', 'ui', 'typography', 'типографіка', 'user interface', 'интерфейс пользователя', 'інтерфейс користувача'] },
    { name: 'Programming', domains: ['github.com', 'gitlab.com', 'stackoverflow.com', 'developer.mozilla.org','python.org','rust-lang.org','npmjs.com','codepen.io','developer.apple.com'], words: ['javascript', 'typescript', 'react', 'css', 'програмування','programming','coding','python','rust','kotlin','программирование'] },
    { name: 'Gaming', domains: ['steampowered.com', 'steamcommunity.com', 'gog.com', 'epicgames.com', 'minecraft.net', 'minecraft.wiki','poki.com','crazygames.com','itch.io', 'roblox.com'], words: ['videogames', 'video games', 'gaming','games','ігри','игры','poki','steam', 'відеоігри', 'minecraft', 'майнкрафт', 'roblox'] },
    { name: 'Space', domains: ['nasa.gov','esa.int','spacex.com'], words: ['space','spacex','astronomy','black holes','solar system','космос','астрономія','чорні діри'] },
    { name: 'Reference', domains: ['wikipedia.org','britannica.com','dictionary.cambridge.org'], words: [] },
    { name: 'Media', domains: ['youtube.com', 'youtu.be', 'spotify.com', 'soundcloud.com', 'vimeo.com'], words: [] },
    { name: 'Shopping', domains: ['amazon.com', 'ebay.com', 'etsy.com', 'rozetka.com.ua'], words: [] },
  ];
  function classify({ url = '', title = '' }) {
    let parsed;
    try { parsed = new URL(url); } catch { return 'Other'; }
    if (!['https:', 'http:'].includes(parsed.protocol)) return 'Other';
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    if ((host === 'github.com' && /^\/zen-browser(?:\/|$)/i.test(parsed.pathname)) ||
        (host === 'google.com' && /^\/chrome(?:\/|$)/.test(parsed.pathname)) ||
        ((host === 'mozilla.org' || host.endsWith('.mozilla.org')) && /^\/(?:[a-z-]+\/)?firefox(?:\/|$)/i.test(parsed.pathname))) return 'Browsers';
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
    return 'Other';
  }
  function groupTabs(tabs, describe) {
    const candidates = new Map();
    for (const tab of tabs) {
      const name = classify(describe(tab));
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
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { classify, groupTabs, eligible, RULES }; return;
  }
  if (location.href !== 'chrome://browser/content/browser.xhtml') return;
  window.ZenTidyTabs?.destroy();
  const NS = 'http://www.w3.org/1999/xhtml';
  const states = new Map();
  const abort = new AbortController();
  let observer, timer, startupTimer, originalAddTab, patchedAddTab, groupMenu, destroyed = false, busy = false;
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
          const topic = /^(?:https?:|www\.)|^(?:[\w-]+\.)+[a-z]{2,}$/i.test(name) ? classify({url:tab.linkedBrowser?.currentURI?.spec,title:tab.label}) : name === 'Games' ? 'Gaming' : name;
          state.assignments.set(tab,topic);
          state.revealed.add(topic);
          if (topic !== name) saveGroup(tab,topic);
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
      ['Ungroup', () => {
        if (busy || strip !== activeStrip()) return;
        const state = getState(strip);
        for (const tab of members(strip,name)) {
          saveGroup(tab,null);
          state.assignments.delete(tab);
        }
        render(strip);
      }],
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
  function folder(strip, name, insertBefore = null) {
    if (busy || strip !== activeStrip()) return;
    const tabs = members(strip, name);
    if (!tabs.length) return;
    if (typeof gZenFolders?.createFolder !== 'function') throw new Error('This Zen version does not support native folders.');
    const created = gZenFolders.createFolder(tabs, { label: name, insertBefore, workspaceId: gZenWorkspaces.activeWorkspace });
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
  function installDrag() {
    let drag = null, indicator = null;
    const listen = (type, fn) => window.addEventListener(type,fn,{capture:true,signal:abort.signal});
    function mark(element, edge) {
      if (!element) {
        if (indicator) gZenPinnedTabManager.removeTabContainersDragoverClass(false);
        indicator = null;
        return;
      }
      const rect = element.getBoundingClientRect();
      gBrowser.tabContainer.tabDragAndDrop._placeDropIndicator({
        left:rect.left + 4, width:Math.max(0,rect.width - 8),
        top:edge === 'before' ? rect.top : rect.bottom
      });
      indicator = element;
    }
    function reset() { mark(null); drag = null; }
    listen('dragstart', event => {
      reset();
      const strip = activeStrip();
      if (busy || !strip) return;
      if (event.target.closest?.('.ztt-group-close')) { event.preventDefault(); return; }
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
      if (busy) return null;
      // Zen also starts drags directly (for example from its tab list).
      // The native data transfer identifies the source even when dragstart was retargeted.
      const active = activeStrip();
      if (!drag?.name && active) {
        const flavor = 'application/x-moz-tabbrowser-tab';
        const native = event.dataTransfer?.types.includes(flavor) && event.dataTransfer.mozGetDataAt(flavor,0);
        if (native) {
          if (!eligible(native,active) || native.multiselected && gBrowser.selectedTabs.length > 1) return null;
          drag = {strip:active,tab:native};
        }
      }
      if (!drag || drag.strip !== active) return null;
      const {strip, name, tab} = drag;
      const s = getState(strip);
      const target = event.target;
      const y = event.clientY;
      const bounds = strip.getBoundingClientRect();
      const insideX = event.clientX >= bounds.left && event.clientX <= bounds.right;
      const inColumn = insideX && y >= bounds.top && y <= bounds.bottom;
      if (name) {
        const separator = s.separator;
        const section = separator?.parentElement;
        const rect = section?.getBoundingClientRect();
        if (section && (section.contains(target) || (insideX && y >= rect.top && y <= rect.bottom))) {
          // A temporary group becomes a top-level folder. Its marker and insertion
          // anchor must describe the same gap, including beside an expanded folder.
          const pins = [...section.children].filter(el =>
            el.matches('zen-folder,tab-group,tab[pinned]') && el.getBoundingClientRect().height > 0);
          for (const [i,pin] of pins.entries()) {
            const box = pin.getBoundingClientRect();
            const label = pin.labelContainerElement?.getBoundingClientRect();
            if (y < box.top + (label?.height || box.height)/2)
              return {kind:'folder',element:pin,edge:'before',insertBefore:pin};
            if (y <= box.bottom)
              return {kind:'folder',element:pin,edge:'after',insertBefore:pins[i+1] || separator};
          }
          return {kind:'folder',element:separator,edge:'before',insertBefore:separator};
        }
        if (!strip.contains(target) && !inColumn) return null;
        // The header and its last member delimit one drop target. Only one
        // midpoint per group participates, regardless of the hovered child.
        let lastSlot = null;
        for (const header of s.headers) {
          const topic = header.dataset.zttGroup;
          if (topic === name) continue;
          const last = members(strip,topic).at(-1);
          if (!last) continue;
          const top = header.getBoundingClientRect().top;
          const bottom = last.getBoundingClientRect().bottom;
          if (y < (top + bottom) / 2)
            return {kind:'order',topic,edge:'before',element:header};
          lastSlot = {kind:'order',topic,edge:'after',element:last};
          if (y <= bottom) return lastSlot;
        }
        return lastSlot;
      }
      const rows = [...strip.children].filter(el => eligible(el,strip) || el.classList.contains('ztt-header'));
      // A native drag preview can sit under the pointer instead of the destination tab.
      const hit = inColumn ? rows.find(el => {
        const rect = el.getBoundingClientRect();
        return rect.height > 0 && y >= rect.top && y < rect.bottom;
      }) : null;
      const first = tabsIn(strip).find(t => t !== tab);
      if (tab && s.assignments.has(tab) && (s.separator?.contains(target) ||
          insideX && s.separator && s.headers[0] && y >= s.separator.getBoundingClientRect().top &&
          y < s.headers[0].getBoundingClientRect().top && !hit && !target.closest?.('.zen-workspace-pinned-tabs-section'))) {
        return {kind:'tab',topic:null,anchor:first,edge:'before',element:s.separator,indicatorEdge:'after'};
      }
      if (!strip.contains(target) && !inColumn) return null;
      const hovered = hit || target;
      const header = hovered.closest?.('.ztt-header');
      const row = hovered.closest?.('tab');
      const topic = header?.dataset.zttGroup || s.assignments.get(row);
      if (tab) {
        if (!eligible(tab,strip) || row === tab) return null;
        const after = el => event.clientY >= el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2;
        if (header) {
          const items = members(strip,topic).filter(t => t !== tab);
          if (!items.length) return null;
          const firstHeader = s.headers[0] === header;
          if (firstHeader && y <= header.getBoundingClientRect().top + 2) return {kind:'tab',topic:null,anchor:items[0],element:header,edge:'before'};
          return {kind:'tab',topic,anchor:items[0],element:header,edge:'before',indicatorEdge:'after'};
        }
        if (row) {
          if (!eligible(row,strip) || (!topic && !s.assignments.has(tab))) return null;
          return {kind:'tab',topic,anchor:row,element:row,edge:after(row)?'after':'before'};
        }
        const next = [...strip.children].find(el => el !== tab && (eligible(el,strip) || el.classList.contains('ztt-header')) && el.getBoundingClientRect().bottom > event.clientY);
        if (next?.classList.contains('ztt-header') && next === s.headers[0])
          return {kind:'tab',topic:null,anchor:members(strip,next.dataset.zttGroup)[0],element:next,edge:'before'};
        if (next && eligible(next,strip))
          return {kind:'tab',topic:s.assignments.get(next),anchor:next,element:next,edge:'before'};
        return null;
      }
      return null;
    }
    function handle(event) {
      const dest = destination(event);
      if (!dest) { mark(null); return; }
      event.preventDefault(); event.stopImmediatePropagation();
      event.dataTransfer.dropEffect = 'move';
      if (event.type !== 'drop') { mark(dest.element,dest.indicatorEdge || dest.edge); return; }
      const {strip, name, tab} = drag;
      reset();
      const s = getState(strip);
      if (dest.kind === 'folder') {
        Promise.resolve().then(() => folder(strip,name,dest.insertBefore)).catch(report);
        return;
      }
      if (dest.kind === 'tab') {
        if (!dest.anchor || dest.anchor === tab) return;
        const controller = gBrowser.tabContainer.tabDragAndDrop;
        const nativeDrag = Boolean(tab._dragData);
        if (nativeDrag) {
          controller.finishMoveTogetherSelectedTabs(tab);
          controller.finishAnimateTabMove();
          controller._resetTabsAfterDrop(tab);
        }
        if (dest.topic) s.assignments.set(tab,dest.topic);
        else s.assignments.delete(tab);
        saveGroup(tab,dest.topic);
        if (dest.edge === 'before') gBrowser.moveTabBefore(tab,dest.anchor);
        else gBrowser.moveTabAfter(tab,dest.anchor);
        render(strip);
        if (nativeDrag && controller._dropLandingArmed && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
          controller._landDragImageOnElements?.([tab]);
        }
        return;
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
  function animateTidy(s) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return Promise.resolve();
    const line = s.separator.querySelector('toolbarseparator');
    if (!line) return Promise.resolve();
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.classList.add('ztt-wave'); svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('fill', 'none'); path.setAttribute('stroke', 'currentColor');
    svg.append(path); line.append(svg);
    return new Promise(resolve => {
      let frame;
      const finish = () => {
        cancelAnimationFrame(frame); svg.remove();
        s.cancelWave = null; resolve();
      };
      s.cancelWave = finish;
      const start = performance.now();
      let settleAt = null;
      const smooth = value => value * value * (3 - 2 * value);
      const draw = now => {
        if (destroyed || !line.isConnected) { finish(); return; }
        const elapsed = now - start;
        if (settleAt === null && elapsed >= 600) settleAt = elapsed;
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
    const s = getState(strip);
    const snapshot = tabsIn(strip);
    busy = true;
    if (!mountControl(strip, s)) { busy = false; return; }
    s.separator.classList.add('ztt-working');
    s.tidyButton.disabled = true;
    s.tidyButton.setAttribute('aria-busy', 'true');
    try {
      // Let the wave play while retaining an exact scope for this click.
      await animateTidy(s);
      if (destroyed || !strip.isConnected || strip !== activeStrip()) return;
      const tabs = snapshot.filter(tab => eligible(tab, strip));
      const plan = groupTabs(tabs,
        tab => ({ url: tab.linkedBrowser?.currentURI?.spec, title: tab.label }));
      // Tabs may close, move or be pinned during the wave animation.
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
    tidyButton.setAttribute('tooltiptext', 'Group tabs by topic');
    tidyButton.setAttribute('aria-label', 'Tidy tabs');
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
          const close = node('button','ztt-group-close');
          close.type = 'button';
          close.title = 'Close group: ' + name;
          close.setAttribute('aria-label',close.title);
          close.addEventListener('click',event => { event.stopPropagation(); clear(strip,name); });
          header.append(label,close);
          header.draggable = true;
          header.tabIndex = 0;
          header.addEventListener('contextmenu', event => openGroupMenu(event,strip,name));
          if (!s.revealed.has(name) && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
            s.revealed.add(name);
            label.replaceChildren(...Array.from(name,(letter,index) => {
              const glyph = node('span','ztt-letter',letter);
              glyph.style.setProperty('--letter-delay', Math.min(index,28)*17+'ms');
              return glyph;
            }));
            label.classList.add('ztt-title-enter');
            label.style.animationDelay = Math.min(revealIndex++ * 55, 165) + 'ms';
            label.addEventListener('animationend', event => {
              if (event.animationName !== 'ztt-title-enter') return;
              label.textContent = name;
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
    #ztt-create-panel {
      position:fixed; inset:auto; margin:0; padding:0; border:0; outline:0; overflow:visible;
      border-radius:12px; background:light-dark(#fffefe,#2c2b30); color:light-dark(#171619,#f5f3f7);
      box-shadow:0 2px 9px rgb(0 0 0 / .12),0 0 1px rgb(0 0 0 / .15);
      --ztt-accent:var(--zen-primary-color,AccentColor); }
    #ztt-create-panel::after { content:''; position:absolute; bottom:-4px; left:var(--tip);
      width:8px; height:8px; background:inherit; transform:translateX(-50%) rotate(45deg);
      box-shadow:1px 1px 1px rgb(0 0 0 / .06); pointer-events:none; }
    .ztt-create-list { box-sizing:border-box; width:100%; padding:8px; font:menu; }
    .ztt-create-row { box-sizing:border-box; width:100%; height:40px; padding:0 10px;
      appearance:none; display:flex; align-items:center; gap:10px; color:inherit;
      font:inherit; font-size:13px; font-weight:600; border:0; outline:0; border-radius:8px; background:transparent; }
    .ztt-create-row:enabled:is(:hover,:focus-visible) { background:color-mix(in srgb,var(--ztt-accent) 18%,transparent); }
    .ztt-create-row:disabled { opacity:.45; }
    .ztt-create-icon { flex:0 0 22px; height:22px; background:currentColor; mask: no-repeat center / contain; }
    .ztt-create-shortcut { margin-inline-start:auto; color:color-mix(in srgb,var(--ztt-accent) 70%,currentColor);
      opacity:.8; font-weight:550; white-space:nowrap; }
    .ztt-create-divider { border:0; border-top:1px solid color-mix(in srgb,var(--ztt-accent) 25%,light-dark(#cec8d2,#65606a)); margin:8px 4px; }
    #zen-create-new-button .toolbarbutton-icon { rotate:0deg; transition:rotate .2s ease-out; }
    #zen-create-new-button[ztt-create-open] .toolbarbutton-icon { rotate:45deg; }
    @media(prefers-reduced-motion:reduce) { #zen-create-new-button .toolbarbutton-icon { transition:none; } }
    .zen-workspace-scroll-to-tab, .zen-current-workspace-indicator { display:none!important; }

    #urlbar :is(#page-action-buttons,#zen-copy-url-button,#tracking-protection-icon-container,
      #trust-icon-container,#urlbar-revert-button-container,#urlbar-search-mode-indicator-close),
    #urlbar #identity-box > :not(#zen-site-data-icon-button) { display:none!important; }

    :root[zen-has-empty-tab="true"] #urlbar #identity-box > #identity-icon-box {
      display:flex!important; }
    :root[zen-has-empty-tab="true"] #urlbar #identity-icon {
      list-style-image:url("chrome://browser/skin/zen-icons/search-glass.svg")!important;
      -moz-context-properties:fill; fill:currentColor; opacity:.65; }
    #urlbar:not([breakout-extend]) #urlbar-input { text-indent:2px!important; }
    #urlbar { --ztt-address-ink:light-dark(#929292,#aaa); }
    #urlbar:is(:hover,:focus-within) { --ztt-address-ink:light-dark(#111,#f4f4f4); }
    #urlbar #urlbar-input, #urlbar #urlbar-input::placeholder {
      color:var(--ztt-address-ink)!important; opacity:1; }
    :root[zen-single-toolbar="true"] .zen-essentials-container:not(:empty) {
      padding-bottom:4px!important; }
    /* Native navigation: 31×29 hit area, 29×29 hover surface, 17×17 artwork. */
    #zen-sidebar-foot-buttons :is(#zen-library-button,#zen-create-new-button) {
      box-sizing:border-box!important; position:relative; flex:none!important;
      width:31px!important; min-width:31px!important; max-width:31px!important;
      height:29px!important; min-height:29px!important; max-height:29px!important;
      padding:0 1px!important; align-items:center; justify-content:center;
      background:transparent!important; }
    #zen-sidebar-foot-buttons :is(#zen-library-button,#zen-create-new-button)::before {
      content:''; position:absolute; inset:0 1px; pointer-events:none; }
    #zen-sidebar-foot-buttons :is(#zen-library-button,#zen-create-new-button):is(:hover,:focus-visible)::before {
      background:var(--toolbarbutton-hover-background,var(--zen-toolbar-element-bg)); }
    #zen-sidebar-foot-buttons :is(#zen-library-button,#zen-create-new-button)::before,
    :is(#back-button,#forward-button,#reload-button,#stop-button) > .toolbarbutton-icon {
      border-radius:11px!important; corner-shape:squircle; }
    #zen-sidebar-foot-buttons #zen-create-new-button > .toolbarbutton-icon {
      box-sizing:border-box!important; width:29px!important; height:29px!important;
      padding:6px!important; scale:none!important; background:transparent!important; position:relative; }
    #zen-sidebar-foot-buttons #zen-library-button .zen-library-sprite {
      --zen-library-sprite-size:17px; width:17px!important; height:17px!important; scale:1.03!important; }
    #zen-workspaces-button toolbarbutton[zen-workspace-id]:hover {
      background:transparent!important; border-color:transparent!important; box-shadow:none!important; }
    #zen-workspaces-button, #zen-workspaces-button[dont-show='true'] {
      display:flex!important; justify-content:safe center!important; gap:0!important; }
    #zen-workspaces-button toolbarbutton[zen-workspace-id] {
      position:relative; flex:0 0 12px!important; width:12px!important; min-width:12px!important;
      max-width:12px!important; height:24px!important; margin:0!important; padding:0!important;
      background:transparent!important; opacity:1!important; filter:none!important; }
    #zen-workspaces-button toolbarbutton[zen-workspace-id] > * { visibility:hidden!important; }
    #zen-workspaces-button toolbarbutton[zen-workspace-id]::after {
      content:''!important; display:block!important; position:absolute!important; inset:auto!important;
      left:50%!important; top:50%!important; transform:translate(-50%,-50%)!important;
      width:6px!important; height:6px!important; border-radius:50%!important;
      background:currentColor!important; opacity:.25!important; pointer-events:none; }
    #zen-workspaces-button toolbarbutton[zen-workspace-id][active='true']::after { opacity:.95!important; }
    #zen-workspaces-button toolbarbutton[zen-workspace-id]:hover::after {
      background:color-mix(in srgb,currentColor 85%,black)!important; }
    #zen-workspaces-button toolbarbutton[zen-workspace-id]:hover:not([active='true'])::after { opacity:.38!important; }
    #zen-workspaces-button toolbarbutton[zen-workspace-id][active='true']:hover::after { opacity:1!important; }
    @media (prefers-color-scheme:dark) {
      #zen-workspaces-button toolbarbutton[zen-workspace-id]:hover:not([active='true'])::after { opacity:.25!important; }
    }

    .ztt-header { display:flex; align-items:center; gap:5px; flex:none;
      box-sizing:border-box; min-width:0; margin:3px 5px 0; padding:0 5px;
      color:inherit; font:inherit; -moz-window-dragging:no-drag; }
    .ztt-header { height:22px; min-height:22px; margin-top:3px; }
    .ztt-label { flex:0 1 auto; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:12px; font-weight:600; opacity:.68; }
    .ztt-group-close { margin-inline-end:-8px; appearance:none; margin-inline-start:auto; padding:0; border:0; background:transparent; color:inherit;
      width:22px; height:20px; display:grid; place-items:center; opacity:0; cursor:default; }
    .ztt-group-close::before { content:''; width:12px; height:12px; background:currentColor;
      mask:url('resource://content-accessible/close-12.svg') center / contain no-repeat; }
    .ztt-header:hover .ztt-group-close,.ztt-header:focus-within .ztt-group-close { opacity:.75; }
    .ztt-header { cursor:default; justify-content:flex-start; }
    .ztt-header:focus-visible { outline:2px solid var(--zen-primary-color,#8c70c2); outline-offset:1px; border-radius:4px; }
    .ztt-native-separator > .ztt-tidy {
      color:inherit!important; font-size:10px; font-weight:500;
      opacity:1!important; margin:0!important; padding:0 0 0 8px!important;
      border:0!important; box-shadow:none!important; outline:none;
      -moz-window-dragging:no-drag; cursor:default;
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
      flex:1!important; position:relative; overflow:visible; border-color:transparent!important;
      background:none!important; }
    .ztt-native-separator.ztt-working::before { display:none!important; }
    .ztt-wave { position:absolute; left:0; top:50%; transform:translateY(-50%);
      display:block; width:100%; height:9px; overflow:hidden; pointer-events:none;
      color:var(--zen-pinned-separator-color); }
    .ztt-native-separator.ztt-working > toolbarbutton { display:none!important; }
    .ztt-title-enter { position:relative; animation:ztt-title-enter 1540ms linear both; }
    .ztt-letter { display:inline-block; white-space:pre; animation:ztt-letter-rise 760ms both;
      animation-delay:calc(160ms + var(--letter-delay)); }
    @keyframes ztt-letter-rise {
      0% { transform:translateY(.85em); opacity:0; }
      26% { color:#679be0; opacity:1; }
      48% { transform:translateY(0); color:#c5a3de; }
      66% { color:#d6ae72; }
      80% { color:#cb8aad; }
      100% { color:inherit; opacity:1; transform:none; }
    }
    @keyframes ztt-title-enter { from,to { opacity:.68; } }
    .ztt-title-enter::after {
      content:''; position:absolute; left:0; top:50%; width:min(72px,60%); height:6px;
      border-radius:2px; background:currentColor; transform:translateY(-50%);
      animation:ztt-title-placeholder 1000ms ease-out both;
    }
    @keyframes ztt-title-placeholder {
      0%,12% { opacity:.35; }
      22%,100% { opacity:0; }
    }
    :root:not([zen-sidebar-expanded='true']) .ztt-header,
    :root:not([zen-sidebar-expanded='true']) .ztt-tidy { display:none; }
    @media(prefers-reduced-motion:reduce) { .ztt-title-enter,.ztt-title-enter::after,.ztt-letter,.ztt-wave { animation:none!important; } .ztt-title-enter { background:none; -webkit-text-fill-color:currentColor; } .ztt-title-enter::after { display:none; } }
  `;
  const CREATE_ICONS = {"space": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzFfOTIpIj4KPHBhdGggc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIuNzUiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGQ9Ik0xNi42MzMyIDIuMzk1MTFMMTcuMDczMSA0Ljg3NDdIMTUuNzQwOEwxNS4zNDQ5IDIuNjQyODdDMTUuMTU2OCAxLjYzMzQ1IDE0LjUyMzYgMS4xNzk4MiAxMy40NzM4IDEuMzY2MzRMNC42ODEzIDIuOTAwNDRDMy42Mzk1NCAzLjA4MjggMy4xOTgyIDMuNzI2NzMgMy4zNzQwNCA0LjczNjE2TDUuNjUzOTEgMTcuNTg0OEM1LjgxNTQ0IDE4LjQ4MTEgNi4zNDcwMSAxOC45NDgzIDcuMjE2NzcgMTguODk5MlYyMC4yMTZDNS42MzUzNCAyMC4zNDIyIDQuNjY5MTkgMTkuNTM5NiA0LjM2MTQyIDE3LjgzNjdMMi4wNzczNiA0LjkzOTY2QzEuNzQwNTcgMy4wNjQwMiAyLjUyNDQgMS45NTI1NSA0LjM4NzI2IDEuNjM0NEwxMy4zMjA5IDAuMDcyMzA0NUMxNS4xODM4IC0wLjI1Mzc5NiAxNi4yOTY0IDAuNTIzNjMgMTYuNjMzMiAyLjM5NTExWiIgZmlsbD0iYmxhY2siLz4KPHBhdGggc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIuNzUiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGQ9Ik0yMiA3LjczNjk2QzIyIDUuODMzMzQgMjEuMDQxNCA0Ljg3NDcgMTkuMTQ2MSA0Ljg3NDdIMTAuMDc4M0M4LjE4Mjk4IDQuODc0NyA3LjIxNjQ1IDUuODMzMzQgNy4yMTY0NSA3LjczNjk2VjIwLjgyNEM3LjIxNjQ1IDIyLjcxOTYgOC4xOTEzOCAyMy42ODYyIDEwLjA3ODMgMjMuNjg2MkgxOS4xNDYxQzIxLjAzMyAyMy42ODYyIDIyIDIyLjcxOTYgMjIgMjAuODI0VjcuNzM2OTZaTTIwLjY4NzMgNy43NjEyVjIwLjc5OTdDMjAuNjg3MyAyMS44MDg4IDIwLjEzOTkgMjIuMzg0MiAxOS4wNzM3IDIyLjM4NDJIMTAuMTQyN0M5LjA4NDU2IDIyLjM4NDIgOC41MzcxNiAyMS44MDg4IDguNTM3MTYgMjAuNzk5N1Y3Ljc2MTJDOC41MzcxNiA2LjczNTQ5IDkuMDg0NTYgNi4xNzY2NyAxMC4xNDI3IDYuMTc2NjdIMTkuMDczN0MyMC4xMzk5IDYuMTc2NjcgMjAuNjg3MyA2LjczNTQ5IDIwLjY4NzMgNy43NjEyWiIgZmlsbD0iYmxhY2siLz4KPHBhdGggc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIuNzUiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGQ9Ik0xNS4zNzcxIDE4LjQ1NDFWMTAuNTMzMkMxNS4zNzcxIDEwLjA4NzggMTUuMDYyNyA5Ljc4NDk1IDE0LjYyMjMgOS43ODQ5NUMxNC4xOTk3IDkuNzg0OTUgMTMuODkzOSAxMC4wOTIzIDEzLjg5MzkgMTAuNTMzMlYxOC40NTQxQzEzLjg5MzkgMTguODg2NCAxNC4xOTk3IDE5LjE5MzcgMTQuNjIyMyAxOS4xOTM3QzE1LjA2MjcgMTkuMTkzNyAxNS4zNzcxIDE4Ljg5MDkgMTUuMzc3MSAxOC40NTQxWk0xMC42NDY4IDE1LjIyNDlIMTguNjI0M0MxOS4wNjg4IDE1LjIyNDkgMTkuMzc0NSAxNC45MjE2IDE5LjM3NDUgMTQuNTAyNEMxOS4zNzQ1IDE0LjA2NTYgMTkuMDczMyAxMy43NTM4IDE4LjYyNDMgMTMuNzUzOEgxMC42NDY4QzEwLjE5NzcgMTMuNzUzOCA5Ljg5MjQyIDE0LjA2NTYgOS44OTI0MiAxNC41MDI0QzkuODkyNDIgMTQuOTIxNiAxMC4yMDIzIDE1LjIyNDkgMTAuNjQ2OCAxNS4yMjQ5WiIgZmlsbD0iYmxhY2siLz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF8xXzkyIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjI0IiBmaWxsPSJ3aGl0ZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMikiLz4KPC9jbGlwUGF0aD4KPC9kZWZzPgo8L3N2Zz4K", "folder": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzFfNjQpIj4KPHBhdGggc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIuNzUiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGQ9Ik0zLjU4MzEgMjAuODkwMUgyMC42NjVDMjIuNDY3NCAyMC44OTAxIDIzLjUgMTkuODI1OCAyMy41IDE3Ljc2NlY3LjAzNDU3QzIzLjUgNC45NzQ3MyAyMi40NTg5IDMuOTE5MTggMjAuNDE2OSAzLjkxOTE4SDEwLjU2NDVDOS44MTc5MiAzLjkxOTE4IDkuNDA5NjIgMy43NjAxMyA4Ljg4NzE2IDMuMjk2NjZMOC4yODQ1IDIuNzcyODNDNy42MTA5IDIuMTcyMzggNy4xMjE5MiAyIDYuMTA4NDMgMkgzLjE5NjM4QzEuNDY5ODIgMiAwLjUgMi45NzgwNiAwLjUgNC45NTU4NVYxNy43NjZDMC41IDE5LjgzNSAxLjU0MTE2IDIwLjg5MDEgMy41ODMxIDIwLjg5MDFaTTMuNjA5MTggMTkuNDQ4M0MyLjUwNDM2IDE5LjQ0ODMgMS45MDI0MyAxOC44NTk1IDEuOTAyNDMgMTcuNjk1NlY1LjAzOTk1QzEuOTAyNDMgMy45NjIyNyAyLjQ0NjQ3IDMuNDIzODYgMy40Nzk1NCAzLjQyMzg2SDUuNzYwODlDNi40ODUwNyAzLjQyMzg2IDYuODg0NDIgMy41ODc0OSA3LjQyMDMxIDQuMDY0NzFMOC4wMjc0OCA0LjU4ODU0QzguNjcwMTIgNS4xNTczNCA5LjE5NDUyIDUuMzUyMjEgMTAuMjE3IDUuMzUyMjFIMjAuMzkwOEMyMS40Nzc3IDUuMzUyMjEgMjIuMDk3NSA1Ljk0OTc3IDIyLjA5NzUgNy4xMTM2N1YxNy43MDQ0QzIyLjA5NzUgMTguODU5NSAyMS40Nzc3IDE5LjQ0ODMgMjAuMzkwOCAxOS40NDgzSDMuNjA5MThaTTMuMDMzMTUgOC4zOTNIMjAuOTU3OVY3Ljg3NjM2QzIwLjk1NzkgNy4yMDAxMiAyMC42MDQxIDYuODMzMjMgMTkuODUyMiA2LjgzMzIzSDQuMTM4ODFDMy4zOTU0NSA2LjgzMzIzIDMuMDMzMTUgNy4yMDAxMiAzLjAzMzE1IDcuODc2MzZWOC4zOTNaIiBmaWxsPSJibGFjayIvPgo8L2c+CjxkZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzFfNjQiPgo8cmVjdCB3aWR0aD0iMjMiIGhlaWdodD0iMTkiIGZpbGw9IndoaXRlIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwLjUgMikiLz4KPC9jbGlwUGF0aD4KPC9kZWZzPgo8L3N2Zz4K", "boost": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzFfODEpIj4KPHBhdGggc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIuNzUiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGQ9Ik0zLjE2NjM5IDIxLjg2NjhDNC42OTk3IDIzLjM2NDMgNi41MDg0OSAyMy4zODA0IDguMDEzMjEgMjEuODk4NUM5LjI0MDYzIDIwLjcwNCAxMC40MzkgMTcuOTM5IDExLjM3NjQgMTYuODc0NEwxMy41MTI3IDE4Ljk3NDlDMTQuMTk5NyAxOS42NTE2IDE1LjAyODggMTkuNjQ3NSAxNS42ODc2IDE4Ljk5NDNMMTYuODg0IDE3LjgxODVDMTcuNTUwOCAxNy4xNjEyIDE3LjU1MDggMTYuMzc2NyAxNi44NiAxNS43TDkuNDUzNiA4LjQ0NDYzQzguNzY2NjIgNy43NjM4MSA3Ljk1MzkxIDcuNzYwMDggNy4yODI5MyA4LjQyMTExTDYuMDkwNjYgOS41OTMxNUM1LjQzMTg4IDEwLjIzODUgNS40MTU1IDExLjA0MjkgNi4xMDYyNyAxMS43MjM3TDguMjQ2NzMgMTMuODE2NEM3LjE2Nzk1IDE0LjczMDYgNC4zNDU0MyAxNS45MDg2IDMuMTI2MDEgMTcuMTA2OUMxLjYxMzI5IDE4LjU5MjggMS42MjU0OCAyMC4zNTcgMy4xNjYzOSAyMS44NjY4Wk03LjIwMzUyIDEwLjMxNTRMOC4wMzYxNyA5LjUxNTRDOC4yODM4NSA5LjI3Mjc3IDguNTU2NjkgOS4yNzI3NyA4LjgwNDM3IDkuNTA3NTNMMTUuNzc1IDE2LjMzNkMxNi4wMTQ2IDE2LjU3MDcgMTYuMDEwNSAxNi44NDE4IDE1Ljc2MjggMTcuMDg4NUwxNC45NTAzIDE3Ljg5MjJDMTQuNjk4NSAxOC4xNDY4IDE0LjQxMzggMTguMTQyNyAxNC4xNjYxIDE3LjkwMDFMMTEuODQyNSAxNS42MTIyQzExLjUxOSAxNS4yODc1IDExLjEwNzEgMTUuMzE0MyAxMC43Mzk0IDE1LjY2M0M5LjkyMjc1IDE2LjQ0MjggOC41OTU5MSAxOS42MDExIDcuMTMxOTcgMjEuMDMxNUM2LjE3MDU1IDIxLjk3NzQgNS4wMjE2NCAyMS45NjkyIDQuMDI3NDQgMjEuMDA3MkMzLjA1MzgzIDIwLjA0MTUgMy4wNDU0NCAxOC45MDQyIDQuMDAzMDYgMTcuOTcwMUM1LjQ3MTIgMTYuNTQzOSA4LjcwMzMzIDE1LjIzNjMgOS40OTE0IDE0LjQ0MDRDOS44NDMwNyAxNC4wNzYxIDkuODc0NjggMTMuNjY4OSA5LjU1MTIxIDEzLjM1OThMNy4yMDM1MiAxMS4wNzU3QzYuOTYzODUgMTAuODMzMSA2Ljk2Mzg1IDEwLjU1OCA3LjIwMzUyIDEwLjMxNTRaTTUuNTIwOCAyMC42OTI5QzYuMTQ5OSAyMC42OTI5IDYuNjYwODggMjAuMTg4MiA2LjY2MDg4IDE5LjU2QzYuNjYwODggMTguOTQzNyA2LjE0OTkgMTguNDM0OSA1LjUyMDggMTguNDM0OUM0Ljg3OTUxIDE4LjQzNDkgNC4zNjAxNSAxOC45NDM3IDQuMzYwMTUgMTkuNTZDNC4zNjAxNSAyMC4xODgyIDQuODc5NTEgMjAuNjkyOSA1LjUyMDggMjAuNjkyOVpNMTYuNzc2MiAxNi40NzA3TDIxLjI0MzIgMTIuMDk0OEMyMi4yNjQ3IDExLjA5NDEgMjIuMjQ4NyA5Ljg4NTM5IDIxLjIxNTQgOC44NjUyN0wxMy43NjQgMS41NTgwMkMxMi44MDM1IDAuNjE3MDI3IDExLjE4OSAwLjk4MTY5NiAxMC44NTY4IDIuNDM0ODFDMTAuMDA5NyA2LjA2NDgxIDkuODkxMTMgNi43MDU1MiA4LjQ4ODk0IDguNjE0NzhMOS40MzQ1NiA5LjUyOTE0QzExLjAwNTYgNy40NTkzOSAxMS4xNzUyIDYuNDM3IDEyLjA2NzUgMy4wODAxQzEyLjIxMDggMi41MTcxMSAxMi42OTE0IDIuNDAyMTUgMTMuMDM0IDIuNzI5OUwyMC4yMjIxIDkuNzYzNTlDMjAuNzA4NCAxMC4yMzk5IDIwLjcwODQgMTAuODI5NSAyMC4yNDIgMTEuMjg2M0wxNS44NjcyIDE1LjU3NkwxNi43NzYyIDE2LjQ3MDdaTTE1LjM4OTMgMTEuMTQzNkMxNS44ODkyIDExLjYzMzQgMTguNjgxNiAxMC4xMTY0IDE5LjY0NDkgOC45MzM4MkwxNy41NDM0IDYuODc5MjdDMTcuMzY0NyA4LjUzOTYyIDE2LjQ4MjUgOS43MzQxMSAxNS40MTM3IDEwLjc4NTNDMTUuMjkxOCAxMC45MDQ3IDE1LjMwNCAxMS4wNiAxNS4zODkzIDExLjE0MzZaIiBmaWxsPSJibGFjayIvPgo8L2c+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMV8xXzgxKSI+CjxwYXRoIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iLjc1IiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJNNCA3Ljk5NDc1QzQuMTQ4MDggNy45OTQ3NSA0LjI1OTQ4IDcuODkwMzkgNC4yODM3MyA3LjczNzE5QzQuNjIwMDQgNC45MTYzMSA0Ljk3Mjc0IDQuNTYxODkgNy43MzM5NyA0LjI3NzRDNy44OTAzOSA0LjI2MzY0IDggNC4xNDUzNiA4IDMuOTk3MzhDOCAzLjg0OTQzIDcuODkwMzkgMy43MzExMSA3LjczMzk3IDMuNzE3MzVDNC45NzI3NCAzLjQzMjkgNC42MjAwNCAzLjA3ODQ3IDQuMjgzNzMgMC4yNTc1ODNDNC4yNTk0OCAwLjEwNDM3NiA0LjE0ODA4IDAgNCAwQzMuODU4OTMgMCAzLjc0MjMxIDAuMTA0Mzc2IDMuNzE2MjcgMC4yNTc1ODNDMy4zNzk5MyAzLjA3ODQ3IDMuMDI3MjUgMy40MzI5IDAuMjY2MDM1IDMuNzE3MzVDMC4xMDk1OTMgMy43MzExMSAwIDMuODQ5NDMgMCAzLjk5NzM4QzAgNC4xNDUzNiAwLjEwOTU5MyA0LjI1ODIzIDAuMjY2MDM1IDQuMjc3NEMzLjAyMTUxIDQuNjM0MTYgMy4zNTUxOSA0LjkxNTc4IDMuNzE2MjcgNy43MzcxOUMzLjc0MjMxIDcuODkwMzkgMy44NTg5MyA3Ljk5NDc1IDQgNy45OTQ3NVoiIGZpbGw9ImJsYWNrIi8+CjwvZz4KPGRlZnM+CjxjbGlwUGF0aCBpZD0iY2xpcDBfMV84MSI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMiIgZmlsbD0id2hpdGUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDIgMSkiLz4KPC9jbGlwUGF0aD4KPGNsaXBQYXRoIGlkPSJjbGlwMV8xXzgxIj4KPHJlY3Qgd2lkdGg9IjgiIGhlaWdodD0iOCIgZmlsbD0id2hpdGUiLz4KPC9jbGlwUGF0aD4KPC9kZWZzPgo8L3N2Zz4K", "split view": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzFfNTEpIj4KPHBhdGggc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIuNzUiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGQ9Ik0xMS4yNTEgMjAuOTgzN0gxMi43NTgyVjIuOTgzMDNIMTEuMjUxVjIwLjk4MzdaTTUuMzEzNDcgMjIuMDAwMkgxOC42ODY1QzIwLjg5MDMgMjIuMDAwMiAyMiAyMC44ODE2IDIyIDE4LjcxNjVWNS4yODgyNEMyMiAzLjEyMzIyIDIwLjg5MDMgMi4wMDQ1OSAxOC42ODY1IDIuMDA0NTlINS4zMTM0N0MzLjExODk1IDIuMDA0NTkgMiAzLjExMzU5IDIgNS4yODgyNFYxOC43MTY1QzIgMjAuODkxMiAzLjExODk1IDIyLjAwMDIgNS4zMTM0NyAyMi4wMDAyWk01LjM0MTUgMjAuNDg0OEM0LjE1NDEyIDIwLjQ4NDggMy41MDcyMiAxOS44NTY4IDMuNTA3MjIgMTguNjQyNlY1LjM2MjJDMy41MDcyMiA0LjEzODg2IDQuMTU0MTIgMy41MTk5OCA1LjM0MTUgMy41MTk5OEgxOC42NTg1QzE5LjgyNjYgMy41MTk5OCAyMC40OTI4IDQuMTM4ODYgMjAuNDkyOCA1LjM2MjJWMTguNjQyNkMyMC40OTI4IDE5Ljg1NjggMTkuODI2NiAyMC40ODQ4IDE4LjY1ODUgMjAuNDg0OEg1LjM0MTVaIiBmaWxsPSJibGFjayIvPgo8L2c+CjxkZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzFfNTEiPgo8cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIGZpbGw9IndoaXRlIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgyIDIpIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg==", "new tab": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzFfNTIpIj4KPHBhdGggc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIuNzUiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGQ9Ik0zLjQ1NjY4IDIwLjk5OThIMjAuNTQzM0MyMi41MDk4IDIwLjk5OTggMjMuNSAxOS45OTMgMjMuNSAxOC4wNDQ1VjUuOTU5MDFDMjMuNSA0LjAxMDQ5IDIyLjUwOTggMy4wMDM3MiAyMC41NDMzIDMuMDAzNzJIMy40NTY2OEMxLjQ5ODQ3IDMuMDAzNzIgMC41IDQuMDAxODIgMC41IDUuOTU5MDFWMTguMDQ0NUMwLjUgMjAuMDAxNyAxLjQ5ODQ3IDIwLjk5OTggMy40NTY2OCAyMC45OTk4Wk0zLjQ4MTcgMTkuNjM1OUMyLjQyMjE3IDE5LjYzNTkgMS44NDQ5MyAxOS4wNzA3IDEuODQ0OTMgMTcuOTc3OVY2LjAyNTU3QzEuODQ0OTMgNC45MjQ1NiAyLjQyMjE3IDQuMzY3NTcgMy40ODE3IDQuMzY3NTdIMjAuNTE4NEMyMS41NjA2IDQuMzY3NTcgMjIuMTU1MSA0LjkyNDU2IDIyLjE1NTEgNi4wMjU1N1YxNy45Nzc5QzIyLjE1NTEgMTkuMDcwNyAyMS41NjA2IDE5LjYzNTkgMjAuNTE4NCAxOS42MzU5SDMuNDgxN1oiIGZpbGw9ImJsYWNrIi8+CjxwYXRoIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iLjc1IiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBkPSJNMTIuNzAzNCAxNS43OTE3VjguMTc4NzhDMTIuNzAzNCA3Ljc1MDY4IDEyLjQxMDMgNy40NTk2NCAxMS45ODk1IDcuNDU5NjRDMTEuNTg5NyA3LjQ1OTY0IDExLjMwNDkgNy43NTUwMSAxMS4zMDQ5IDguMTc4NzhWMTUuNzkxN0MxMS4zMDQ5IDE2LjIwNzIgMTEuNTg5NyAxNi41MDI2IDExLjk4OTUgMTYuNTAyNkMxMi40MTAzIDE2LjUwMjYgMTIuNzAzNCAxNi4yMTE1IDEyLjcwMzQgMTUuNzkxN1pNOC4yMzM4MyAxMi42ODhIMTUuNzc0NEMxNi4xODY3IDEyLjY4OCAxNi40ODQgMTIuMzk2NiAxNi40ODQgMTEuOTkzN0MxNi40ODQgMTEuNTczOSAxNi4xOTkyIDExLjI3NDIgMTUuNzc0NCAxMS4yNzQySDguMjMzODNDNy44MDkwOSAxMS4yNzQyIDcuNTE2MDQgMTEuNTczOSA3LjUxNjA0IDExLjk5MzdDNy41MTYwNCAxMi4zOTY2IDcuODEzMzkgMTIuNjg4IDguMjMzODMgMTIuNjg4WiIgZmlsbD0iYmxhY2siLz4KPC9nPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF8xXzUyIj4KPHJlY3Qgd2lkdGg9IjIzIiBoZWlnaHQ9IjE4IiBmaWxsPSJ3aGl0ZSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC41IDMpIi8+CjwvY2xpcFBhdGg+CjwvZGVmcz4KPC9zdmc+Cg=="};
  function installCreateMenu() {
    const nativePopup = document.getElementById('zenCreateNewPopup');
    if (!nativePopup) return;
    const {gZenBoostsManager:boosts} = ChromeUtils.importESModule('resource:///modules/zen/boosts/ZenBoostsManager.sys.mjs');
    const {ShortcutUtils} = ChromeUtils.importESModule('resource://gre/modules/ShortcutUtils.sys.mjs');
    const panel = node('div');
    panel.id = 'ztt-create-panel';
    panel.popover = 'auto';
    panel.tabIndex = -1;
    panel.setAttribute('role','menu');
    panel.setAttribute('aria-label','Create');
    const list = node('div','ztt-create-list');
    panel.append(list);
    document.documentElement.append(panel);
    const actions = [
      ['New Space','space','cmd_zenOpenWorkspaceCreation'],
      ['New Folder','folder','cmd_zenOpenFolderCreation'],
      ['New Boost','boost',null],
      ['New Split','split view','cmd_zenNewEmptySplit'],
      ['New Tab','new tab','cmd_newNavigatorTab']
    ];
    function siteBoost() {
      const uri = gBrowser.currentURI;
      if (!boosts.canBoostSite(uri)) return null;
      const saved = (boosts.loadBoostsFromStore(uri.host) || []).filter(b => b.boostEntry.boostData.changeWasMade);
      return {uri, existing:saved.find(b => b.id === boosts.getActiveBoostId(uri.host)) || saved[0]};
    }
    // Supply the reference shortcut when Zen has no binding for New Split.
    const splitCommand = 'cmd_zenNewEmptySplit';
    const nativeSplit = document.getElementById('zen-new-empty-split-view');
    const hasSplitKey = () => nativeSplit && nativeSplit.getAttribute('disabled') !== 'true' &&
      (nativeSplit.getAttribute('keycode') || (nativeSplit.getAttribute('key') && nativeSplit.getAttribute('key') !== '*'));
    const splitKeys = document.createXULElement('keyset');
    const fallback = document.createXULElement('key');
    fallback.setAttribute('keycode','VK_EQUALS');
    fallback.setAttribute('modifiers','control,shift');
    fallback.setAttribute('command',splitCommand);
    splitKeys.append(fallback);
    document.documentElement.append(splitKeys);
    const syncSplit = () => { if (hasSplitKey()) fallback.setAttribute('disabled','true'); else fallback.removeAttribute('disabled'); };
    syncSplit();
    const keyObserver = new MutationObserver(syncSplit);
    if (nativeSplit) keyObserver.observe(nativeSplit,{attributes:true});
    abort.signal.addEventListener('abort',()=>{keyObserver.disconnect();splitKeys.remove();},{once:true});
    const rows = actions.map(([label,icon,command]) => {
      if (icon === 'boost' || icon === 'split view') list.append(node('hr','ztt-create-divider'));
      const row = node('button','ztt-create-row');
      row.type = 'button'; row.setAttribute('role','menuitem');
      const glyph = node('span','ztt-create-icon');
      glyph.style.maskImage = 'url("'+CREATE_ICONS[icon]+'")';
      const title = node('span','',label), shortcut = node('span','ztt-create-shortcut');
      row.append(glyph,title,shortcut); list.append(row);
      row.addEventListener('click',() => {
        panel.hidePopover();
        if (command) { document.getElementById(command)?.doCommand(); return; }
        const site = siteBoost();
        if (site) boosts.openBoostWindow(window,site.existing || boosts.createNewBoost(site.uri.host),site.uri);
      });
      return {row,title,shortcut,command};
    });
    nativePopup.addEventListener('popupshowing',event => {
      if (event.target !== nativePopup) return;
      const plus = document.getElementById('zen-create-new-button');
      if (!plus) return;
      event.preventDefault(); event.stopImmediatePropagation();
      for (const {row,title,shortcut,command} of rows) {
        if (!command) {
          const site = siteBoost();
          row.disabled = !site;
          title.textContent = site?.existing ? 'Edit Boost' : 'New Boost';
          continue;
        }
        const cmd = document.getElementById(command);
        row.disabled = !cmd || cmd.getAttribute('disabled') === 'true';
        const key = command === splitCommand ? (hasSplitKey() ? nativeSplit : fallback) : command === 'cmd_newNavigatorTab' ? document.getElementById('key_newNavigatorTab') :
          document.querySelector('key[command="'+command+'"]:not([disabled="true"])');
        shortcut.textContent = key === fallback ? (navigator.platform.startsWith('Mac') ? '⌃⇧=' : 'Ctrl+Shift+=') :
          key && key.getAttribute('key') !== '*' ? ShortcutUtils.prettifyShortcut(key) : '';
      }
      panel.showPopover();
      positionMenu();
      panel.focus({preventScroll:true});
    },{capture:true,signal:abort.signal});
    function positionMenu() {
      const plus = document.getElementById('zen-create-new-button');
      if (!plus || !panel.matches(':popover-open')) return;
      const bar = plus.closest('#zen-sidebar-foot-buttons').getBoundingClientRect();
      const button = plus.getBoundingClientRect();
      const width = Math.min(210,Math.max(1,bar.width - 16));
      const left = Math.max(bar.left+8,Math.min(button.right-width,bar.right-8-width));
      panel.style.width = width+'px';
      panel.style.left = left+'px';
      panel.style.top = Math.max(4,button.top-panel.offsetHeight-12)+'px';
      panel.style.setProperty('--tip',Math.min(width-14,Math.max(14,button.left+button.width/2-left))+'px');
    }
    const footer = document.getElementById('zen-sidebar-foot-buttons');
    const resize = new ResizeObserver(positionMenu);
    if (footer) resize.observe(footer);
    window.addEventListener('resize',positionMenu,{signal:abort.signal});
    abort.signal.addEventListener('abort',()=>resize.disconnect(),{once:true});
    panel.addEventListener('beforetoggle',e=>{
      const plus = document.getElementById('zen-create-new-button');
      plus?.toggleAttribute('ztt-create-open',e.newState==='open');
      if(e.newState==='open') plus?.setAttribute('open','true');
      else plus?.removeAttribute('open');
    });
    document.getElementById('zen-create-new-button')?.addEventListener('mousedown',event=>{
      if (!panel.matches(':popover-open')) return;
      event.preventDefault();event.stopImmediatePropagation();panel.hidePopover();
    },{capture:true,signal:abort.signal});
    panel.addEventListener('keydown',event=>{
      if (!['ArrowDown','ArrowUp','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const enabled = rows.map(r=>r.row).filter(r=>!r.disabled);
      const index = enabled.indexOf(document.activeElement);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? enabled.length-1 :
        ((index < 0 && event.key === 'ArrowUp' ? 0 : index) + (event.key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length;
      enabled[next]?.focus();
    });
    abort.signal.addEventListener('abort',()=>{panel.hidePopover(); panel.remove();document.getElementById('zen-create-new-button')?.removeAttribute('open');},{once:true});
  }
  function init() {
    if (destroyed) return;
    if (!window.gBrowser || !window.gZenWorkspaces) { startupTimer = setTimeout(init, 250); return; }
    document.documentElement.append(style);
    installCreateMenu();
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
    states.clear(); style.remove(); groupMenu?.remove();
    if (gBrowser.addTab === patchedAddTab) gBrowser.addTab = originalAddTab;
    if (window.ZenTidyTabs?.destroy === destroy) delete window.ZenTidyTabs;
  }
  window.ZenTidyTabs = { destroy, tidy:() => { const strip = activeStrip(); if (strip) return tidy(strip); } };
  init();
})();
