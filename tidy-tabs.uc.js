// ==UserScript==
// @name           Zen Tidy Tabs
// @description    Rule-based tab grouping with native Zen folders.
// @include        main
// @version        0.11.2
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
  const manualTabs = new WeakSet();
  function saveGroup(tab, name) {
    if (name) {
      const workspace = tab.getAttribute('zen-workspace-id') || gZenWorkspaces.activeWorkspace;
      SessionStore.setCustomTabValue(tab, sessionKey, JSON.stringify({workspace,name,manual:manualTabs.has(tab)}));
    } else {
      manualTabs.delete(tab);
      SessionStore.deleteCustomTabValue(tab, sessionKey);
    }
  }
  function restoreGroups(strip, state) {
    for (const tab of tabsIn(strip)) {
      if (state.assignments.has(tab)) continue;
      const value = SessionStore.getCustomTabValue(tab, sessionKey);
      if (!value) continue;
      try {
        const {name, workspace, manual} = JSON.parse(value);
        if (workspace === gZenWorkspaces.activeWorkspace && typeof name === 'string' && name.length && name.length <= 60) {
          if (manual) manualTabs.add(tab);
          const topic = manual ? name : /^(?:https?:|www\.)|^(?:[\w-]+\.)+[a-z]{2,}$/i.test(name) ? classify({url:tab.linkedBrowser?.currentURI?.spec,title:tab.label}) : name === 'Games' ? 'Gaming' : name;
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
  function uniqueName(strip, base, except) {
    const names = new Set(getState(strip).assignments.values());
    let name = base;
    for (let i = 2; names.has(name) && name !== except; i++) {
      const suffix = ' ' + i;
      name = base.slice(0,60-suffix.length) + suffix;
    }
    return name;
  }
  function assignManual(strip, tabs, name) {
    for (const tab of tabs) {
      manualTabs.add(tab);
      getState(strip).assignments.set(tab,name);
      saveGroup(tab,name);
    }
    render(strip);
  }
  function renameGroup(strip, old) {
    if (busy || strip !== activeStrip()) return;
    const header = getState(strip).headers.find(h => h.dataset.zttGroup === old);
    if (!header || header.querySelector('input')) return;
    const input = node('input','ztt-name-input');
    input.value = old;
    input.maxLength = 60;
    input.setAttribute('aria-label','Group name');
    header.draggable = false;
    header.prepend(input);
    const finish = commit => {
      if (!input.isConnected) return;
      const value = input.value.replace(/\s+/g,' ').trim();
      input.removeEventListener('blur',cancel);
      input.remove();
      header.draggable = true;
      if (commit && value && value !== old) {
        const name = uniqueName(strip,value,old);
        getState(strip).revealed.add(name);
        assignManual(strip,members(strip,old),name);
      }
    };
    const cancel = () => finish(false);
    input.addEventListener('blur',cancel);
    input.addEventListener('keydown',event => {
      event.stopPropagation();
      if (event.isComposing || !['Enter','Escape'].includes(event.key)) return;
      event.preventDefault();
      finish(event.key === 'Enter');
    });
    input.focus();
    input.setSelectionRange(input.value.length,input.value.length);
  }
  function installSelectionMenu() {
    const menu = document.getElementById('tabContextMenu');
    const item = document.createXULElement('menuitem');
    item.setAttribute('label','Group Selected Tabs');
    const anchor = document.getElementById('context_moveTabToGroup');
    menu.insertBefore(item,anchor?.parentElement === menu ? anchor : menu.firstElementChild);
    function selection(strip) {
      const tabs = gBrowser.selectedTabs;
      return strip && !busy && tabs.includes(TabContextMenu.contextTab) && tabs.length >= 2 &&
        tabs.every(tab => eligible(tab,strip)) ? tabs : [];
    }
    menu.addEventListener('popupshowing',event => {
      if (event.target === menu) item.hidden = !selection(activeStrip()).length;
    },{signal:abort.signal});
    item.addEventListener('command',() => {
      const strip = activeStrip(), tabs = selection(strip);
      if (tabs.length) assignManual(strip,tabs,uniqueName(strip,'New Group'));
    });
    abort.signal.addEventListener('abort',()=>item.remove(),{once:true});
  }
  function openGroupMenu(event, strip, name) {
    event.preventDefault(); event.stopPropagation();
    groupMenu?.remove();
    groupMenu = document.createXULElement('menupopup');
    for (const [label, action] of [
      ['Rename group', () => renameGroup(strip,name)],
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
      const headingGap = element.classList.contains('ztt-header') ? 4 : 0;
      gBrowser.tabContainer.tabDragAndDrop._placeDropIndicator({
        left:rect.left + 4, width:Math.max(0,rect.width - 8),
        top:edge === 'before' ? rect.top - headingGap : rect.bottom + headingGap
      });
      indicator = element;
    }
    function reset() { mark(null); drag = null; }
    listen('dragstart', event => {
      reset();
      const strip = activeStrip();
      if (busy || !strip) return;
      if (event.target.closest?.('.ztt-group-close,.ztt-name-input')) { event.preventDefault(); return; }
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
          const source = native.isZenFolder ? native : native.localName !== 'tab' && native.closest?.('zen-folder');
          if (source?.isZenFolder && !source.isLiveFolder && gZenWorkspaces.activeWorkspaceElement.contains(source) &&
              source.allItems.every(el => el.localName === 'tab') && source.tabs.some(t => !t.hasAttribute('zen-empty-tab'))) {
            drag = {strip:active,source};
          } else {
            if (!eligible(native,active) || native.multiselected && gBrowser.selectedTabs.length > 1) return null;
            drag = {strip:active,tab:native};
          }
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
      if (drag.source) {
        if (!strip.contains(target) && !inColumn) return null;
        for (const header of s.headers) {
          const last = members(strip,header.dataset.zttGroup).at(-1);
          if (last && y < (header.getBoundingClientRect().top + last.getBoundingClientRect().bottom)/2)
            return {kind:'unpin',element:header,edge:'before',anchor:members(strip,header.dataset.zttGroup)[0]};
        }
        return {kind:'unpin',element:tabsIn(strip).at(-1) || strip,edge:'after'};
      }
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
      const {strip, name, tab, source} = drag;
      reset();
      const s = getState(strip);
      if (dest.kind === 'unpin') {
        const label = uniqueName(strip,(source.label || 'New Group').slice(0,60));
        const tabs = [...source.tabs].filter(t => !t.hasAttribute('zen-empty-tab'));
        const ordered = tabsIn(strip);
        ordered.splice(dest.anchor ? ordered.indexOf(dest.anchor) : ordered.length,0,...tabs);
        const convert = async () => {
          await source.unpackTabs();
          for (const member of tabs) gBrowser.unpinTab(member);
          moveInOrder(strip,ordered);
          assignManual(strip,tabs,label);
        };
        convert().catch(report);
        return;
      }
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
      for (const tab of tabs) { manualTabs.delete(tab); saveGroup(tab, s.assignments.get(tab)); }
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
    for (const [tab, name] of s.assignments) if (counts.get(name) < 2 && !manualTabs.has(tab)) { s.assignments.delete(tab); saveGroup(tab,null); }
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
      if (name && name !== lastName && (manualTabs.has(tab) || members(strip, name).length >= 2)) {
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
          header.addEventListener('dblclick',event => {
            if (!event.target.closest('button')) renameGroup(strip,name);
          });
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
      border-radius:22px; corner-shape:squircle; background:light-dark(#fffefe,#2c2b30); color:light-dark(#171619,#f5f3f7);
      box-shadow:0 2px 9px rgb(0 0 0 / .12),0 0 1px rgb(0 0 0 / .15);
      --ztt-accent:var(--zen-primary-color,AccentColor); }
    .ztt-create-list { box-sizing:border-box; width:100%; padding:8px; font:menu; }
    .ztt-create-row { box-sizing:border-box; width:100%; height:40px; padding:0 10px;
      appearance:none; display:flex; align-items:center; gap:10px; color:inherit;
      font:inherit; font-size:13px; font-weight:600; border:0; outline:0; border-radius:14px; corner-shape:squircle; background:transparent; }
    .ztt-create-row:enabled:is(:hover,:focus-visible) { background:color-mix(in srgb,var(--ztt-accent) 18%,light-dark(#e6e3e9,#49454f)); }
    .ztt-create-row:disabled { opacity:.45; }
    .ztt-create-icon { flex:0 0 26.4px; height:26.4px; background:currentColor; mask: no-repeat center / contain; }
    .ztt-create-shortcut { margin-inline-start:auto; color:color-mix(in srgb,var(--ztt-accent) 70%,currentColor);
      opacity:.8; font-weight:550; white-space:nowrap; }
    .ztt-create-divider { border:0; border-top:1px solid color-mix(in srgb,currentColor 12%,transparent); margin:8px 4px; }
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
    :root[zen-has-empty-tab="true"] #urlbar #identity-icon-box { margin-inline-end:-3px!important; }
    #urlbar #urlbar-input::placeholder,
    :root[zen-has-empty-tab="true"] #urlbar #urlbar-input:placeholder-shown {
      color:light-dark(#929292,#aaa)!important; text-indent:0!important; }
     .zen-essentials-container .tabbrowser-tab[zen-essential="true"]:hover .tab-background {
      background-color:var(--zen-toolbar-element-bg-hover)!important; }
    @media (prefers-reduced-motion:no-preference) {
      #urlbar:not([breakout-extend]) .urlbar-background,
       .zen-essentials-container .tabbrowser-tab[zen-essential="true"] .tab-background {
        transition:background-color 110ms ease-out!important; }
    }
    #zen-library-footer [data-l10n-id="library-footer-donate-button"] { display:none!important; }
    :is(#back-button,#forward-button,#reload-button) { position:relative; }
    :is(#back-button,#forward-button,#reload-button)::before {
      content:''; position:absolute; width:29px; height:29px; inset:0; margin:auto;
      border-radius:11px; corner-shape:squircle; pointer-events:none; }
    :is(#back-button,#forward-button,#reload-button):not([disabled="true"]):hover::before {
      background:var(--toolbarbutton-background-color-hover,color-mix(in srgb,currentColor 12%,transparent)); }
    :is(#back-button,#forward-button,#reload-button):not([disabled="true"]):active::before {
      background:var(--toolbarbutton-background-color-active,color-mix(in srgb,currentColor 20%,transparent)); }
    :is(#back-button,#forward-button,#reload-button) > .toolbarbutton-icon {
      position:relative; background:transparent!important; }
    @media (prefers-reduced-motion:no-preference) {
      :is(#back-button,#forward-button,#reload-button) > .toolbarbutton-icon {
        transition:translate 140ms ease-out,rotate 170ms ease-out,scale 100ms ease-out!important; }
      #back-button:not([disabled="true"]):hover > .toolbarbutton-icon { translate:-2px 0; }
      #forward-button:not([disabled="true"]):hover > .toolbarbutton-icon { translate:2px 0; }
      #reload-button:not([disabled="true"]):hover > .toolbarbutton-icon { rotate:18deg; }
      :is(#back-button,#forward-button,#reload-button):not([disabled="true"]):active > .toolbarbutton-icon { scale:.88; }
    }
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
      padding:5px!important; scale:none!important; background:transparent!important; position:relative; }
    #zen-sidebar-foot-buttons #zen-library-button .zen-library-sprite {
      --zen-library-sprite-size:20px; width:20px!important; height:20px!important; scale:none!important; }
    @media (prefers-reduced-motion:no-preference) {
      #zen-sidebar-foot-buttons #zen-library-button .zen-library-sprite::before { animation-duration:360ms!important; }
      #zen-sidebar-foot-buttons #zen-library-button:hover .zen-library-sprite::before { animation-duration:420ms!important; }
    }
    #zen-workspaces-button toolbarbutton[zen-workspace-id]:hover {
      background:transparent!important; border-color:transparent!important; box-shadow:none!important; }
    #zen-workspaces-button, #zen-workspaces-button[dont-show='true'] {
      display:flex!important; justify-content:safe center!important; gap:2px!important; }
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
    .ztt-header > .ztt-name-input { appearance:none!important; min-width:0; flex:1; height:20px;
      box-sizing:border-box; font:inherit; font-size:12px; font-weight:600; line-height:20px;
      color:inherit; caret-color:currentColor; margin:0!important; padding:0!important;
      border:0!important; outline:0!important; box-shadow:none!important; background:transparent!important; }
    .ztt-name-input ~ .ztt-label { display:none; }
    .ztt-label { line-height:20px; flex:0 1 auto; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:12px; font-weight:600; opacity:.68; }
    .ztt-group-close { margin-inline-start:auto; margin-inline-end:-8px; }
    .ztt-group-close { flex:none; margin-block:0; appearance:none; padding:0; border:0; background:transparent; color:inherit;
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
    .ztt-native-separator > :is(.ztt-tidy,.zen-workspace-close-unpinned-tabs-button) > .toolbarbutton-text {
      font-weight:600!important; }
    .ztt-native-separator > .ztt-tidy:not([hidden]) + .zen-workspace-close-unpinned-tabs-button > .toolbarbutton-icon {
      display:none!important; }
    #navigator-toolbox[zen-has-implicit-hover="true"] .ztt-native-separator:not(.ztt-working)
      > .ztt-tidy:not([hidden]) + .zen-workspace-close-unpinned-tabs-button::before {
      content:''; display:block; flex:none; inline-size:1px; block-size:11px;
      margin-inline-end:5px; background:color-mix(in srgb,currentColor 22%,transparent); pointer-events:none; }
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
  const CREATE_ICONS = {"space": "data:image/png;base64,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", "boost": "data:image/png;base64,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", "split view": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAAAXNSR0IArs4c6QAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAASKADAAQAAAABAAAASAAAAACz+WTVAAADWElEQVR4Ae2aO4sUQRSF1/f7sYIrBpoYKGJgoIIKBmsgioGBbGpk5E/wPxiYmBkJGqqBGC6+Ak1MREzE3VQEFV186/lkGotipm/31MBOr+fCobu6um7d+up2zcLeiQmbCZiACZiACZiACZiACZiACZiACYwZgWUF8TC2ZHzB1K2H/tYI1NraLnC9ZtgkbZQmpS3SSmmc7buC+yi9kz5Ln6QFaaQGyJ3SJemhxIS/pGpnxv1KrB+kWemiNCW1TQ4NGWx71HVfYjfGHUYU3zet4a60SxqJrZEXHJKWXcqaQaBYA5/aTWm1VGtN0uy0PNyROGuq95mcSaqM0m2R4Xtz5oHP+Ef2bJgmMQOC8zONn9hPSo+kgdbkgJ3R6FWJB+C8lm5LL6UvUokt1+C90uXMyRW1mYcdLzHAHJDOSbt7jiporK0WUO/92gsQ0nR9q/a0xC8ZOwO8EvEJ4y+dg/tjEn0lvhlLjGTnWem9lM7zVO1i4/RPnd5Qe3ux138OVuj2hJTOwf0Riewale2QI87SdJ75yHmTADZkTubU5pega0bMb7Kg83Mv6262Q+xwal/VYBe6ZsRM7KmFCRK+kHrr3XcRTrWM1rEPA6ia7L+4GlCwzQZkQAGBoNsZZEABgaDbGWRAAYGg2xlkQAGBoNsZZEABgaDbGWRAAYGg2xlkQAGBoNsZZEABgaDbGWRAAYGg2xlkQAGBoNsZZEABgaB7mAyqSkgC12PZ3Tr2JoB+Zktdq3briTIfi9Ek5nXZxPnasu5m/5unkCm1/WpQc9M1I2ZiT43KlVprUkA1Jw+TiZdp3VOZdU9akFr/v1tjUqM4ol8pHM/I1nCXU2d97skcapnOSEezftZWa00APZaHg4kXyoCp/jovvZLyigk9amUsoF9B5QU9PyWVbgCf1T7puARwDJ/M+4RGnfFSZBQyPZDY0fR9wIyqRpEsyj9bsrM0e+Tib8zEjioDEKWDh6UX1cNhr5SxXZdwiOOlINZyVWryBem12Kb0yjVpKUBiDRwR26TQ0k8mepmD+pA007tybmyV8go0PRoro5SY4s156Zl0S3ou8Sy0NoBwxt9NfMukJvdtx2vIohjHAuXEwKJWkXubCZiACZiACZiACZiACZiACZiACXSTwB/IKms6iWXW/wAAAABJRU5ErkJggg==", "folder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAAAXNSR0IArs4c6QAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAASKADAAQAAAABAAAASAAAAACz+WTVAAAEV0lEQVR4Ae2azctUVRyAtbKMrBaWpRkVKWIUGEKBLXThtmjhLmqRi2pTu9JdgYJ/gbuoRS4ECxeCRIEEQUIEZbWI/CDKIg37/v58HpkD5z3NmXtn7sz73ld+P3g4c8/MPR/P+bgzc++SJRFhIAyEgTAQBsJAGAgDYSAMhIEwEAZ6ZmBpx/bUzv+3Y7m9Ob3WwVoDl/PGCjC9Aq6EWvzNG38M+In0V/gHLtm4gZ49Aq/C5/AnOFNG8S3vvwVPw0a4Ci7JWE2vDsMoGU3vvcf5D8P1MO7M5ZT+xjKa9hL8Dk0SRr3vjPsMnoRbwCXa+2gzklvoxTEo95u/yHOPGbavXDb4fCnBz7ofHYSX4QwozlDuLMI6xQFOg9y6njaC9lPaU0WJP3J8YsAvpHnnlONG7p6zHty7clF+VrE/wCn4GpIkXk410oCco9QP4R04Dw7S1OJ9SrJTCWfO82DHrwavaCXmXwsPwttgg2xsKsPUY8UoK43uLNLfKF8c1JOwC2z71OICJeUdc9RXtSzdmXM7vAJe+ZSblzWfrx0Qv3p8DwfgGphKlJ06QqnjFO4ydjY9Bm+AohxNZ44NtuGzpBwE67Lu3dAYbfYgK8jjNQ4eBfeecUKp62AbbILV4NJs0wY+NlFczlnWe/OAvJBPOLAdLr9quATGjVJY2/N/5oMfgUvUK6J1z1IOxV8s/ybSh+AZWAkpHKwN8EHKGJZOImhYOW3zXFJu2PMZ56nsS7gNdmYVO7vugpkL8ueD346tcNYzgioaI+05Lp3vwEHxJ8+bkAvisPlq1nUGuVS2wmbwu09fwk3YWXMUvgCl+X2rjMbfhl0F3UGNL8Aa6NMMUoRL2f1njweEV68yGmd8V0H3UOPd4JWisbKydTM+dmlthyTIWTR2dBXk+U5lvzn3LRQ08hLepsFdBR2nkmfB3199DH/vdYqugs5S+zfQt+WlFJdUvu8syBLzx+asfonbyQWPvi6NBReTGhCCkolKGoIqYlJ2CEomKmkIqohJ2SEomaikIagiJmWHoGSikoagipiUHYKSiUoagipiUnYISiYqaQiqiEnZISiZqKQhqCImZYegZKKSTiKoj/8eVro3J3uSvrb6L7n8x7CPdzDmmBhy4KDa7jLKvpXvtxLk3ck8vM1zHSymmeQNzvvyTgxe+yjMyGjzp/1pSrgxK8WnMp6DfeBdg4n+DOe8+YplVHQ/PF5UaLtPFXn/O2wzCxShkDx8UuNT8GkN72D2VZJy1sK94ENfeX8d3Fth5K2h/AQ+OzQ2kvsulGs4PYiU31oZWsACZto/b4m7xFI4mPIiPDF4TTJ5WMFeSAUv9tQ7rl/BOphauCkryacmFrMg5XwM26DVZb/NEqOsi6EkHzjaAQ/AneBzQfn05bB34aBeAPfL1+EQnIXGSzyfmbNpedwUClWIV7++PO7S1Gbfd9Y7e5SisIgwEAbCQBgIA2EgDISBMBAGwkAY6LGB/wDJ1JG2jgbY3wAAAABJRU5ErkJggg==", "new tab": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAAAXNSR0IArs4c6QAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAASKADAAQAAAABAAAASAAAAACz+WTVAAAEmklEQVR4Ae2az8tVRRyHLdOyLNNQkbSNQmItXGgkLkRd6apA3ImrIuj/cKlgC3eugnTTDxcWuBHNEN2IUP5YyPu+UGE/1KTEMsvngTswzHvve85577nnzpX5wMM5Z+45M9/5nDkzc+bcBQuKigPFgeJAcaA4UBwoDhQHigPFgeJAcaA4kJkDzwwRj9cOc/0QRTe+9H+ukMZqWsEXKeFlWArLYRk8BznrEcHdh9/hL/gTHkCr0sg18DGcBwv8D8KdyX1rrH/AWfgAVkHTxsElg7Wen74B70buZlTF9w91OAXroBU9Ty5maLOcpFYzyCjr4KP2GSyGOVWnme0hh6/Aviacb+EWEloUu9nKmDXC/jOO39h3w7cwUHU62P1cvSjKQXNuwZdwDR5CztKYt+E9eKMXaDDNug1t0Lu9TMPG0eBDuAQ+zxrWhsLdDXm1me8LZHoGPgVH3qC0biG90dbe32ADFrKyUQ55nLyaMOxLQz3czlSF9mzVCfz+UnLONMe2nEmTMU8lQb+SHM86rGPQwuSqvznW/UmTMRt7rMr6V54Q59bbH6U5YZbep9hWkhrHXmcUayWyiky8URtgOzhPcbY+1dtnMz7lYpDvdodgJ3iXnbV/BL43jVXzecTaDtjh3VFxL6yA1+B9eBXGrlwMsgUtidxwcmdaOjeKTulmNweDrGk6Ug5K68aVqJRcDIpCymu3GFRxP4pBFQZ1Ncy7pvQ6+KKY3hQ74jch1Vsk2HGnkzvnSffgJ0hnxiS1qy4McqlkI7i04HJD2iFr0HJIdZCE+5Aa9C9pU3ASboDHI1MXBvn6sAMOgC+HaQsiaZZppnmNrSVVaEE/8oPYmkamLgwKj9daatFkXpOuIsQmaPQaiBfy4t9b2+/CINeyXXm8CvZBqUkeW1ErHOtnDvotq4QWdJ3fH8YXjGK/C4N8nzoHzozXQ1qmBvmqYR8V6ywHdyDtg1xLvgkXwXXxkSoNdhSFPSbTGfgcNKJfJ+0olhr0BWm3IDXI/H6BX6FfH0Vye+rCIKN1pHFYllR22qkJnvNDj36/+Xsn6jeidFLwpBRSDKq4U8WgCTHIzjbua9y3Mx67cmhBmuPHyLugMR7/BuF7HLvjUw4GWXsN+QRmYBqOgIaNXV0N81UVdUZ8DL4GW9AUjPxNnTIqlYtBPlq3e1QG3eUJ83nE0nepLuMdtqzGsdcxKB1N/KdE44KGrVkL1xtz/OXELNO6zSqmjkEuWsXaxIGfZSZNxmzssRwp51SdPmiaHOIVv10c74bT8ADi+QuH81baKtvM15WEvbAtic66zak6Bl0gh81RLq4QHoZ9cAOyGG2IY5B8rFzy9bu/3YPSfG/Idx7MpfSu9Tv3HRLPwWKIz9cY12bautNkNRIZs7FLkDE7tdgK34fE+W5d7TsOZmjGTwPW5SjUeYI4rVqrOMWJ3NNgknWwi1gBlYofmaqT7ai3wP7edh1b/4GRrhCSlJVcrPPLxwxchhNwBUyrVBODzMxpgc+yTdP9ptdzyVhkt+ArjGb5IcD9ouJAcaA4UBwoDhQHigPFgeJAcaA4UBwoDkymA08AAbyr4RrK0EcAAAAASUVORK5CYII="};
  function installCreateMenu() {
    const nativePopup = document.getElementById('zenCreateNewPopup');
    if (!nativePopup) return;
    const {gZenBoostsManager:boosts} = ChromeUtils.importESModule('resource:///modules/zen/boosts/ZenBoostsManager.sys.mjs');
    const {ShortcutUtils} = ChromeUtils.importESModule('resource://gre/modules/ShortcutUtils.sys.mjs');
    const panel = node('div');
    panel.id = 'ztt-create-panel';
    panel.popover = 'manual';
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
    const motionFrames = [
      {opacity:0, transform:'translateY(3px) scale(.96)'},
      {opacity:1, transform:'none'}
    ];
    let motion = null, closing = false;
    function closeMenu() {
      if (closing || !panel.matches(':popover-open')) return;
      closing = true;
      panel.inert = true;
      plus?.removeAttribute('ztt-create-open');
      const finish = () => {
        if (!closing) return;
        panel.hidePopover();
        panel.inert = false;
        closing = false;
      };
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) { finish(); return; }
      if (motion && motion.playState !== 'idle') {
        motion.reverse();
      } else {
        motion = panel.animate(motionFrames,{duration:120,easing:'cubic-bezier(.2,.8,.2,1)',direction:'reverse'});
      }
      motion.onfinish = finish;
    }
    const rows = actions.map(([label,icon,command]) => {
      if (icon === 'boost' || icon === 'split view') list.append(node('hr','ztt-create-divider'));
      const row = node('button','ztt-create-row');
      row.type = 'button'; row.setAttribute('role','menuitem');
      const glyph = node('span','ztt-create-icon');
      glyph.style.maskImage = 'url("'+CREATE_ICONS[icon]+'")';
      const title = node('span','',label), shortcut = node('span','ztt-create-shortcut');
      row.append(glyph,title,shortcut); list.append(row);
      row.addEventListener('click',() => {
        closeMenu();
        if (command) { document.getElementById(command)?.doCommand(); return; }
        const site = siteBoost();
        if (site) boosts.openBoostWindow(window,site.existing || boosts.createNewBoost(site.uri.host),site.uri);
      });
      return {row,title,shortcut,command};
    });
    function showMenu() {
      if (motion) { motion.onfinish = null; motion.cancel(); motion = null; }
      closing = false;
      panel.inert = false;
      for (const {row,title,shortcut,command} of rows) {
        if (!command) {
          const site = siteBoost();
          row.disabled = !site;
          title.textContent = site?.existing ? 'Edit Boost' : 'New Boost';
          continue;
        }
        const cmd = document.getElementById(command);
        row.disabled = !cmd || cmd.getAttribute('disabled') === 'true';
        const nativeCommand = command === 'cmd_newNavigatorTab' ? 'cmd_newNavigatorTabNoEvent' : command;
        const key = [...document.querySelectorAll('key[command="'+nativeCommand+'"]')].find(k =>
          !k.closest('[disabled="true"]') && (k.getAttribute('keycode') ||
          (k.getAttribute('key') && k.getAttribute('key') !== '*')));
        shortcut.textContent = key ? ShortcutUtils.prettifyShortcut(key) : '';
      }
      panel.showPopover();
      plus?.setAttribute('ztt-create-open','');
      positionMenu();
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        motion = panel.animate(motionFrames,{duration:120,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'});
      }
      panel.focus({preventScroll:true});
    }
    function positionMenu() {
      const plus = document.getElementById('zen-create-new-button');
      if (!plus || !panel.matches(':popover-open')) return;
      const bar = plus.closest('#zen-sidebar-foot-buttons').getBoundingClientRect();
      const button = plus.getBoundingClientRect();
      const width = Math.min(224,Math.max(1,bar.width - 8));
      const left = Math.max(bar.left+4,Math.min(button.right-width,bar.right-4-width));
      panel.style.width = width+'px';
      panel.style.left = left+'px';
      panel.style.transformOrigin = (button.left + button.width/2 - left)+'px bottom';
      panel.style.top = Math.max(4,button.top-panel.offsetHeight-12)+'px';
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
    const plus = document.getElementById('zen-create-new-button');
    const options = {capture:true,signal:abort.signal};
    document.addEventListener('pointerdown',event=>{
      const path = event.composedPath();
      if (!path.includes(panel) && !path.includes(plus)) closeMenu();
    },options);
    window.addEventListener('keydown',event=>{
      if (event.key === 'Escape' && panel.matches(':popover-open')) {
        event.preventDefault(); event.stopImmediatePropagation();
        closeMenu(); plus?.focus();
      }
    },options);
    let closeOnClick = false;
    plus?.addEventListener('pointerdown',event=>{
      if (event.button === 0) closeOnClick = panel.matches(':popover-open');
    },options);
    plus?.addEventListener('mousedown',event=>{
      if (event.button === 0) event.stopImmediatePropagation();
    },options);
    plus?.addEventListener('click',event=>{
      if (event.button !== 0) return;
      event.preventDefault(); event.stopImmediatePropagation();
      if (!closing && (closeOnClick || panel.matches(':popover-open'))) closeMenu();
      else showMenu();
      closeOnClick = false;
    },options);
    plus?.addEventListener('keydown',event=>{
      if (!['Enter',' '].includes(event.key)) return;
      event.preventDefault(); event.stopImmediatePropagation();
      if (!event.repeat) showMenu();
    },options);
    nativePopup.addEventListener('popupshowing',event=>{
      if (event.target !== nativePopup) return;
      event.preventDefault(); event.stopImmediatePropagation();
      showMenu();
    },options);
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
    installSelectionMenu();
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
