// ==UserScript==
// @name           Zen Tidy Tabs
// @description    Local rule-based temporary tab groups with native Zen folders.
// @include        main
// @version        0.3.0
// ==/UserScript==
(() => {
  'use strict';
  const ICONS = {"broom": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImJsYWNrIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgY2xhc3M9Imx1Y2lkZSBsdWNpZGUtYnJvb20tc3BhcmtsZXMgcHJldmlldy1pY29uIj48cGF0aCBkPSJNMTEgMnYyIi8+PHBhdGggZD0iTTEyIDNoLTIiLz48cGF0aCBkPSJNMTMuNSAxMC41IDIyIDIiLz48cGF0aCBkPSJNMTQuNzM0IDEzLjg0MWEyIDIgMCAwMC0uMzE0LTIuNDJMMTIuNTggOS41OGEyIDIgMCAwMC0yLjQyMS0uMzE0bC03LjY1NyA0LjQ2MUExIDEgMCAwMDIuMyAxNS4zbDYuNDAzIDYuNDAzYTEgMSAwIDAwMS41NzEtLjIwNHoiLz48cGF0aCBkPSJNMjAgMTV2NCIvPjxwYXRoIGQ9Ik0yMiAxN2gtNCIvPjxwYXRoIGQ9Ik00IDR2NCIvPjxwYXRoIGQ9Im01IDE4IDItMiIvPjxwYXRoIGQ9Ik02IDZIMiIvPjxwYXRoIGQ9Im03LjY5OSAxMC43IDUuNjAyIDUuNjAxIi8+PC9zdmc+", "close": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNS40OTE5IDE1LjUwMDgiPjxwYXRoIGQ9Ik0xNC4wMDE0IDAuMjcwNTI1TDAuMjU3NzQgMTQuMDEyMUMtMC4wNjk2NjQgMTQuMzM5NS0wLjA4MDAxNDggMTQuOTExMyAwLjI1Nzc0IDE1LjI0OTFDMC42MDM3MzQgMTUuNTg0NyAxLjE2NTE4IDE1LjU4NDcgMS41MDI5NCAxNS4yNDkxTDE1LjIzNjMgMS41MTU3MkMxNS41NzE5IDEuMTc3OTcgMTUuNTgyMyAwLjYwNjE2OSAxNS4yMzYzIDAuMjcwNTI1QzE0Ljg4ODItMC4wNTY4Nzg5IDE0LjMzNzEtMC4wNjcyMjk3IDE0LjAwMTQgMC4yNzA1MjVaTTE1LjIzNjMgMTQuMDEyMUwxLjUwMjk0IDAuMjcwNTI1QzEuMTY1MTgtMC4wNTY4Nzg5IDAuNTkzMzg0LTAuMDY3MjI5NyAwLjI1Nzc0IDAuMjcwNTI1Qy0wLjA2OTY2NCAwLjYxNjUxOS0wLjA2OTY2NCAxLjE3Nzk3IDAuMjU3NzQgMS41MTU3MkwxNC4wMDE0IDE1LjI0OTFDMTQuMzI2NyAxNS41ODQ3IDE0Ljg5ODUgMTUuNTg0NyAxNS4yMzYzIDE1LjI0OTFDMTUuNTcxOSAxNC45MDEgMTUuNTcxOSAxNC4zMzk1IDE1LjIzNjMgMTQuMDEyMVoiLz48L3N2Zz4=", "folder": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTMgN2g2bDIgMmgxMHYxMUgzek0zIDdWNGg2bDIgM00xNiAxMXY2TTEzIDE0aDYiIGZpbGw9Im5vbmUiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMS43IiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4="};
  // First matching rule wins. Edit names/domains/words to customize.
  const RULES = [
    { name: 'Arc Browser', domains: ['arc.net', 'thebrowser.company'], words: ['arc browser', 'act ii of arc'] },
    { name: 'Apple', domains: ['apple.com', '9to5mac.com', 'macrumors.com'], words: ['apple', 'iphone', 'macbook', 'shareplay', 'vision pro'] },
    { name: 'Design', domains: ['figma.com', 'dribbble.com', 'behance.net', 'mobbin.com', 'pinterest.com'], words: ['design', 'дизайн', 'ux', 'ui', 'typography', 'типографіка', 'user interface', 'интерфейс пользователя', 'інтерфейс користувача'] },
    { name: 'Development', domains: ['github.com', 'gitlab.com', 'stackoverflow.com', 'developer.mozilla.org'], words: ['javascript', 'typescript', 'react', 'css', 'програмування'] },
    { name: 'Games', domains: ['steampowered.com', 'steamcommunity.com', 'gog.com', 'epicgames.com', 'minecraft.net', 'minecraft.wiki', 'roblox.com'], words: ['videogames', 'video games', 'gaming', 'відеоігри', 'minecraft', 'майнкрафт', 'roblox'] },
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
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { classify, groupTabs, eligible, RULES }; return;
  }
  if (location.href !== 'chrome://browser/content/browser.xhtml') return;
  window.ZenTidyTabs?.destroy();
  const NS = 'http://www.w3.org/1999/xhtml';
  const states = new Map();
  const abort = new AbortController();
  let observer, timer, startupTimer, destroyed = false, busy = false;
  const node = (tag, cls, text) => {
    const el = document.createElementNS(NS, tag);
    if (cls) el.className = cls;
    if (text) el.textContent = text;
    return el;
  };
  function button(text, title, fn) {
    const b = node('button', 'ztt-button', text);
    b.type = 'button'; b.title = title; b.setAttribute('aria-label', title);
    const icon = node('span', 'ztt-icon');
    icon.setAttribute('aria-hidden', 'true');
    icon.style.maskImage = 'url("' + ICONS[text === '⊞' ? 'folder' : 'close'] + '")';
    b.textContent = ''; b.append(icon);
    b.addEventListener('click', e => { e.stopPropagation(); Promise.resolve().then(fn).catch(report); });
    b.addEventListener('dblclick', e => e.stopPropagation());
    return b;
  }
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
  function getState(strip) {
    if (!states.has(strip)) states.set(strip, { assignments: new Map(), headers: [], separator: null, tidyButton: null });
    return states.get(strip);
  }
  function members(strip, name) {
    const s = getState(strip);
    return tabsIn(strip).filter(t => s.assignments.get(t) === name);
  }
  function removeHeaders(s) { s.headers.forEach(h => h.remove()); s.headers = []; }
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
    gZenFolders.createFolder(tabs, { label: name, workspaceId: gZenWorkspaces.activeWorkspace });
    schedule();
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
  async function tidy(strip) {
    if (busy || strip !== activeStrip() || tabsIn(strip).length < 5) return;
    const s = getState(strip);
    busy = true;
    if (!mountControl(strip, s)) { busy = false; return; }
    s.separator.classList.add('ztt-working');
    s.tidyButton.disabled = true;
    s.tidyButton.setAttribute('aria-busy', 'true');
    try {
      // Let the wave play while retaining an exact scope for this click.
      await new Promise(resolve => setTimeout(resolve, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650));
      if (destroyed || !strip.isConnected || strip !== activeStrip()) return;
      const tabs = tabsIn(strip);
      const { groups, loose } = groupTabs(tabs,
        tab => ({ url: tab.linkedBrowser?.currentURI?.spec, title: tab.label }),
        host => Services.eTLD.getBaseDomainFromHost(host));
      s.assignments.clear();
      for (const [name, items] of groups) for (const tab of items) s.assignments.set(tab, name);
      removeHeaders(s);
      moveInOrder(strip, [...groups.values()].flat().concat(loose));
    } finally {
      busy = false;
      s.separator?.classList.remove('ztt-working');
      if (s.tidyButton) { s.tidyButton.disabled = false; s.tidyButton.removeAttribute('aria-busy'); }
      if (!destroyed) render(strip);
    }
  }
  function unmountControl(s) {
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
    tidyButton.setAttribute('tooltiptext', 'Group tabs by topic and website');
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
    for (const tab of s.assignments.keys()) if (!eligible(tab, strip)) s.assignments.delete(tab);
    removeHeaders(s);
    let lastName;
    for (const tab of tabsIn(strip)) {
      const name = s.assignments.get(tab);
      if (name && name !== lastName && members(strip, name).length >= 2) {
        const header = node('div', 'ztt-header');
        const label = node('span', 'ztt-label', name);
        header.append(label,
          button('⊞', 'Create pinned folder: ' + name, () => folder(strip, name)),
          button('×', 'Close group: ' + name, () => clear(strip, name)));
        strip.insertBefore(header, tab); s.headers.push(header);
      }
      lastName = name;
    }
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
    .ztt-header { height:22px; min-height:22px; margin-top:3px; animation:ztt-appear .22s ease-out; }
    .ztt-label { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:12px; font-weight:600; opacity:.68; }
    .ztt-button { appearance:none; border:0; border-radius:6px; background:transparent;
      color:inherit; font:inherit; font-size:11px; font-weight:600; padding:5px 6px;
      min-width:22px; min-height:20px; cursor:pointer; white-space:nowrap; }
    .ztt-icon { display:block; width:14px; height:14px; background:currentColor; mask-size:contain; mask-repeat:no-repeat; mask-position:center; }
    .ztt-button:hover { background:transparent; box-shadow:none; }
    .ztt-button:focus-visible { outline:2px solid var(--zen-primary-color,#8c70c2); outline-offset:1px; }
    .ztt-button[hidden] { display:none; }
    .ztt-header .ztt-button { opacity:0; transition:opacity .15s; font-size:17px; padding:2px 5px; }
    .ztt-header:hover .ztt-button,.ztt-header:focus-within .ztt-button { opacity:.8; }
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
      position:relative; overflow:hidden; border-color:transparent!important;
      min-height:14px; background:none!important; }
    .ztt-native-separator.ztt-working > toolbarseparator::after {
      content:''; position:absolute; top:calc(50% - 7px); left:0; right:-24px; height:14px;
      background:currentColor; opacity:.3;
      mask:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='14' viewBox='0 0 24 14'%3E%3Cpath d='M0 7Q6 0 12 7T24 7' fill='none' stroke='black' stroke-width='1.7'/%3E%3C/svg%3E") repeat-x center;
      animation:ztt-wave .55s linear infinite; }
    @keyframes ztt-wave { to { transform:translateX(-24px); } }
    @keyframes ztt-appear { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:none; } }
    :root:not([zen-sidebar-expanded='true']) .ztt-header,
    :root:not([zen-sidebar-expanded='true']) .ztt-tidy { display:none; }
    @media(prefers-reduced-motion:reduce) { .ztt-header,.ztt-native-separator > toolbarseparator::after { animation:none!important; } }
  `;
  function init() {
    if (destroyed) return;
    if (!window.gBrowser || !window.gZenWorkspaces) { startupTimer = setTimeout(init, 250); return; }
    document.documentElement.append(style);
    for (const event of ['TabOpen','TabClose','TabMove','TabPinned','TabUnpinned','TabAttrModified','TabSelect','TabGroupCreate','TabGroupRemoved']) {
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
    states.clear(); style.remove();
    if (window.ZenTidyTabs?.destroy === destroy) delete window.ZenTidyTabs;
  }
  window.ZenTidyTabs = { destroy, tidy:() => { const strip = activeStrip(); if (strip) return tidy(strip); } };
  init();
})();
