// ==UserScript==
// @name           Zen Tidy Tabs
// @description    Rule-based tab grouping with native Zen folders.
// @include        main
// @version        0.14.37
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
    header.prepend(input);
    const finish = commit => {
      if (!input.isConnected) return;
      const value = input.value.replace(/\s+/g,' ').trim();
      input.removeEventListener('blur',cancel);
      input.remove();
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
    input.select();
  }
  function installSelectionMenu() {
    const menu = document.getElementById('tabContextMenu');
    const item = document.createXULElement('menuitem');
    item.id='ztt-group-selection';
    item.setAttribute('label','New Group with Tab');
    const anchor = document.getElementById('context_moveTabToGroup');
    menu.insertBefore(item,anchor?.parentElement === menu ? anchor : menu.firstElementChild);
    function selection(strip) {
      const tabs = TabContextMenu.contextTab?.multiselected ? gBrowser.selectedTabs : [TabContextMenu.contextTab];
      return strip && !busy && tabs.includes(TabContextMenu.contextTab) && tabs.length >= 1 &&
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
  // Tidy headings are siblings of native rows. Record the section Zia
  // actually placed the tabs in before the next Tidy render restores groups.
  function syncDroppedTopic(tabs) {
    const strip = activeStrip();
    const state = states.get(strip);
    if (!state) return;
    const dropped = new Set(tabs);
    let topic = null;
    for (const row of strip.children) {
      if (state.headers.includes(row)) topic = row.dataset.zttGroup;
      if (!dropped.has(row) || !eligible(row, strip)) continue;
      if (topic) state.assignments.set(row, topic);
      else state.assignments.delete(row);
      saveGroup(row, topic);
    }
    for (const tab of tabs) {
      if (!eligible(tab, strip) && state.assignments.delete(tab)) saveGroup(tab, null);
    }
  }
  // Sidebar drag and drop from Zia. See ATTRIBUTION.md and ZIA-LICENSE.txt.
  function installSidebarMotion() {
    if (window.__ziaLoaded) return;
    const onStop = fn => abort.signal.addEventListener('abort', fn, {once:true});
    function listen(target, type, callback, options = {}) {
      target?.addEventListener(type, callback, {
        ...(typeof options === 'boolean' ? {capture:options} : options),
        signal:abort.signal
      });
    }
    function observeWith(Observer, callback) {
      const observer = new Observer(callback);
      onStop(() => observer.disconnect());
      return observer;
    }
    const root = document.documentElement;
    const XHTML_NS = "http://www.w3.org/1999/xhtml";

    // Errors Zia can carry on past (a pref that isn't set, a tab that's gone)
    // are logged once per place at debug level instead of vanishing: visible in
    // the Browser Console, but not noisy.
    const notedErrors = new Set();
    function noteError(where, err) {
      if (notedErrors.has(where)) {
        return;
      }
      notedErrors.add(where);
      console.debug(`[Zia] ${where}:`, err);
    }

    // a setting (or several) watched for as long as the window is open
    function watchPrefs(names, fn) {
      for (const name of [names].flat()) {
        Services.prefs.addObserver(name, fn);
      }
      abort.signal.addEventListener("abort", () => {
        for (const name of [names].flat()) {
          Services.prefs.removeObserver(name, fn);
        }
      });
    }

    // an attribute or style property set to a value, or (null) removed
    function setAttr(el, name, value) {
      if (value == null) {
        el.removeAttribute(name);
      } else {
        el.setAttribute(name, value);
      }
    }
    function setStyle(el, name, value) {
      if (value == null) {
        el.style.removeProperty(name);
      } else {
        el.style.setProperty(name, value);
      }
    }

    function setFlag(name, on) {
      if (on === root.hasAttribute(name)) {
        return;
      }
      setAttr(root, name, on ? "true" : null);
    }
    function featureOn(name) {
      try {
        return Services.prefs.getBoolPref(`zia.features.${name}`, true);
      } catch (err) {
        return true;
      }
    }
    let zenHaptic = null;

    // Zen buzzes on its own drag events, which would double up with Zia's taps,
    // so its haptics are switched off for the length of a drag. That's a saved
    // pref, so Zia marks when it's done so (MUTE_MARK) and undoes its own change
    // rather than writing one: a drag that never finishes cleanly (Zen quit
    // mid-drag, a cancelled drop) is put right shortly after the pointer is
    // released, or on the next launch at the latest.
    const HAPTIC_PREF = "zen.haptic-feedback.enabled";
    const MUTE_MARK = "zia.haptics.muted";
    
    let hapticsWereOn = null;
    let hapticsHadUserValue = false;
    function restoreHaptics(hadUserValue) {
      if (hadUserValue) {
        Services.prefs.setBoolPref(HAPTIC_PREF, true);
      } else {
        Services.prefs.clearUserPref(HAPTIC_PREF);
        if (!Services.prefs.getBoolPref(HAPTIC_PREF, true)) {
          Services.prefs.setBoolPref(HAPTIC_PREF, true);
        }
      }
      Services.prefs.clearUserPref(MUTE_MARK);
    }
    function muteZenHaptics(muted) {
      try {
        if (muted && hapticsWereOn === null) {
          hapticsWereOn = Services.prefs.getBoolPref(HAPTIC_PREF, true);
          hapticsHadUserValue = Services.prefs.prefHasUserValue(HAPTIC_PREF);
          if (hapticsWereOn) {
            Services.prefs.setBoolPref(MUTE_MARK, true);
            Services.prefs.setBoolPref(HAPTIC_PREF, false);
          }
        } else if (!muted && hapticsWereOn !== null) {
          const was = hapticsWereOn;
          hapticsWereOn = null;
          if (was) {
            restoreHaptics(hapticsHadUserValue);
          }
        }
      } catch (err) {
        noteError("start: muteZenHaptics", err);
      }
    }

    function watchHapticsMute() {
      // Left muted by a drag that didn't finish (or a quit mid-drag)
      try {
        if (Services.prefs.getBoolPref(MUTE_MARK, false) && hapticsWereOn === null) {
          restoreHaptics(false);
        }
      } catch (err) { noteError("restore haptics", err); }
      let timer = 0;
      const settle = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          const dragging =
            root.hasAttribute("zia-dragging-tab") || !!document.querySelector(".tabbrowser-tab[zia-essential-dragged]");
          if (hapticsWereOn !== null && !dragging) {
            muteZenHaptics(false);
          }
        }, 800);
      };
      for (const type of ["dragend", "drop", "mouseup"]) {
        listen(window, type, settle, true);
      }
    }

    function quietZenHaptics() {
      const service = Services.zen;
      if (typeof service?.playHapticFeedback === "function") {
        zenHaptic = () => service.playHapticFeedback();
      }
    }
    function currentSeparator() {
      const own = window.gZenWorkspaces?.pinnedTabsContainer?.querySelector?.(".pinned-tabs-container-separator");
      if (own) {
        return own;
      }
      const all = document.querySelectorAll(".pinned-tabs-container-separator");
      for (const sep of all) {
        const box = sep.getBoundingClientRect();
        if (box.width > 0 && sep.checkVisibility?.({ visibilityProperty: true }) !== false) {
          return sep;
        }
      }
      return all[0] || null;
    }
    const FOLDER_SELECTOR = "zen-folder, tab-group:not([split-view-group])";

    function isEmptyFolder(folder) {
      const container = folder.querySelector(":scope > .tab-group-container");
      if (!container) {
        return false;
      }
      return ![...container.children].some(
        (child) =>
          child.localName === "zen-folder" ||
          // (a split in it too: it kept its slot, showing under the split)
          child.localName === "tab-group" ||
          (child.classList.contains("tabbrowser-tab") && !child.hasAttribute("zen-empty-tab"))
      );
    }

    // The slot is sized from a real tab in the sidebar (its background, the gaps
    // around it and how far it's inset in a folder), so it's exactly where the
    // first tab will sit, and a tab dragged in replaces it without anything
    // moving. Measured from a tab inside an open folder when there is one.
    const FOLDER_SLOT_INSET = { start: 14, end: 5 };
    const rootPx = (name, fallback) => parseFloat(getComputedStyle(root).getPropertyValue(name)) || fallback;
    let slotSize = "";
    function measureFolderSlot() {
      // (not a glance: its tab sits inside the one it came from, drawn as a
      // small picture, and the slot shrank to that while a glance was open)
      const visible = (tab) =>
        tab.getBoundingClientRect().height > 8 &&
        !tab.hasAttribute("zen-empty-tab") &&
        !tab.hasAttribute("zen-glance-tab") &&
        !tab.parentElement?.closest(".tabbrowser-tab");
      const inFolder = [...document.querySelectorAll("zen-folder:not([collapsed]) > .tab-group-container > .tabbrowser-tab")].find(visible);
      const tab =
        inFolder || [...document.querySelectorAll("#tabbrowser-tabs .tabbrowser-tab:not([zen-essential])")].find(visible);
      const bg = tab?.querySelector(":scope > .tab-stack > .tab-background");
      if (!tab || !bg) {
        return;
      }
      const t = tab.getBoundingClientRect();
      const b = bg.getBoundingClientRect();
      const style = getComputedStyle(tab);
      const top = (parseFloat(style.marginTop) || 0) + (b.top - t.top);
      const bottom = (parseFloat(style.marginBottom) || 0) + (t.bottom - b.bottom);
      let start;
      let end;
      if (inFolder) {
        const box = tab.parentElement.getBoundingClientRect();
        start = b.left - box.left;
        end = box.right - b.right;
      } else {
        start = FOLDER_SLOT_INSET.start + (b.left - t.left);
        end = FOLDER_SLOT_INSET.end + (t.right - b.right);
      }
      // Same gap on the right as at the bottom, inside an open empty folder's box
      const probe = document.querySelector("zen-folder[zia-empty]:not([collapsed])");
      const container = probe?.querySelector(":scope > .tab-group-container");
      if (probe && container) {
        const box = getComputedStyle(probe, "::before");
        const folderBox = probe.getBoundingClientRect();
        const inner = container.getBoundingClientRect();
        const boxRight = folderBox.right - (parseFloat(box.right) || 0);
        const boxBottom = folderBox.bottom - (parseFloat(box.bottom) || 0);
        // (the list's own padding below the slot is part of that gap)
        const gap = boxBottom - (inner.bottom - (parseFloat(getComputedStyle(container).paddingBottom) || 0) - bottom);
        if (gap > 0 && gap < 20) {
          end = inner.right - (boxRight - gap);
        }
      }
      const values = [top, bottom, start, end, b.height].map((n) => `${Math.round(n * 2) / 2}px`);
      if (values.join(" ") === slotSize) {
        return;
      }
      slotSize = values.join(" ");
      ["mt", "mb", "ms", "me", "h"].forEach((name, i) => root.style.setProperty(`--zia-slot-${name}`, values[i]));
    }

    // The slot's dashes, drawn to its size so they're even all the way round
    // at any sidebar width: two dashes centred on each corner, and on each
    // side as many as fit, spread evenly between the corners' (each set on a
    // whole screen pixel, so none blurs). Firefox's own dashes, spread to fit
    // each side, fell between pixels and greyed; a fixed pattern drawn round
    // the box came back to its start uneven.
    const SLOT_DASH = 3;
    const SLOT_GAP = 3;
    function slotDashesPath(width, height, radius, dpr) {
      const snap = (n) => Math.round(n * dpr) / dpr;
      const c = radius - 0.5;
      const arc = (Math.PI / 2) * c;
      // the corner's two dashes, centred on its arc, a gap between them
      const cornerPad = (arc - 2 * SLOT_DASH - SLOT_GAP) / 2;
      const parts = [];
      const corner = (cx, cy, from) => {
        for (const start of [cornerPad, cornerPad + SLOT_DASH + SLOT_GAP]) {
          const a1 = from + (start / arc) * (Math.PI / 2);
          const a2 = from + ((start + SLOT_DASH) / arc) * (Math.PI / 2);
          const x1 = cx + c * Math.cos(a1);
          const y1 = cy + c * Math.sin(a1);
          const x2 = cx + c * Math.cos(a2);
          const y2 = cy + c * Math.sin(a2);
          parts.push(`M${x1.toFixed(2)} ${y1.toFixed(2)}A${c} ${c} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`);
        }
      };
      // a side from its start to its end, along x or y at a fixed other
      const side = (from, to, fixed, horizontal) => {
        const length = to - from;
        // the gap at each end makes up a whole gap with the corner's pad
        const end = Math.max(0, SLOT_GAP - cornerPad);
        const n = Math.max(1, Math.round((length - 2 * end + SLOT_GAP) / (SLOT_DASH + SLOT_GAP)));
        const gap = n > 1 ? (length - 2 * end - n * SLOT_DASH) / (n - 1) : 0;
        for (let i = 0; i < n; i++) {
          const a = n > 1 ? snap(from + end + i * (SLOT_DASH + gap)) : snap(from + (length - SLOT_DASH) / 2);
          const b = a + SLOT_DASH;
          parts.push(horizontal ? `M${a} ${fixed}H${b}` : `M${fixed} ${a}V${b}`);
        }
      };
      const right = width - 0.5;
      const bottom = height - 0.5;
      corner(radius, radius, Math.PI);
      side(radius, width - radius, 0.5, true);
      corner(width - radius, radius, -Math.PI / 2);
      side(radius, height - radius, right, false);
      corner(width - radius, height - radius, 0);
      side(radius, width - radius, bottom, true);
      corner(radius, height - radius, Math.PI / 2);
      side(radius, height - radius, 0.5, false);
      return parts.join("");
    }

    function slotDashesImage(width, height, radius, dpr) {
      const svg =
        `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}' preserveAspectRatio='none'>` +
        `<path d='${slotDashesPath(width, height, radius, dpr)}' fill='none' stroke='context-stroke' stroke-width='1'/></svg>`;
      return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
    }

    // The slot shows its dashes from a canvas of its folder's (-moz-element),
    // redrawn to size at every step of a sidebar resize: a canvas shows its
    // new drawing at once, where a new picture blanked while it loaded, and
    // the last one stretched while it waited. The canvases sit off screen.
    let slotCanvasHolder = null;
    let slotCanvasCount = 0;
    const slotCanvases = new Set();

    function drawSlotCanvas(folder, container, width, height, radius, dpr) {
      let canvas = folder.ziaSlotCanvas;
      if (!canvas) {
        if (!slotCanvasHolder) {
          slotCanvasHolder = document.createElementNS(XHTML_NS, "div");
          slotCanvasHolder.id = "zia-slot-canvases";
          slotCanvasHolder.setAttribute("aria-hidden", "true");
          slotCanvasHolder.style.cssText = "position: fixed; top: 0; left: -10000px; pointer-events: none;";
          (document.body || document.documentElement).appendChild(slotCanvasHolder);
        }
        canvas = document.createElementNS(XHTML_NS, "canvas");
        canvas.id = `zia-slot-dashes-${++slotCanvasCount}`;
        canvas.style.display = "block";
        slotCanvasHolder.appendChild(canvas);
        canvas.ziaFolder = folder;
        folder.ziaSlotCanvas = canvas;
        slotCanvases.add(canvas);
        folder.style.setProperty("--zia-slot-dashes-live", `-moz-element(#${canvas.id})`);
      }
      const color = getComputedStyle(container, "::after").stroke;
      const key = `${width}x${height}@${dpr}:${color}`;
      if (canvas.ziaKey === key) {
        return;
      }
      canvas.ziaKey = key;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const context = canvas.getContext("2d");
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      context.lineWidth = 1;
      // (a colour the canvas can't read leaves the stand-in)
      context.strokeStyle = "rgba(255, 255, 255, 0.13)";
      if (color && color !== "none") {
        context.strokeStyle = color;
      }
      context.stroke(new Path2D(slotDashesPath(width, height, radius, dpr)));
    }

    function dropGoneSlotCanvases() {
      for (const canvas of slotCanvases) {
        if (!canvas.ziaFolder.isConnected) {
          canvas.remove();
          slotCanvases.delete(canvas);
        }
      }
    }

    // Each empty folder's slot gets its own (a folder inside another is
    // narrower); the page's keeps the latest, for a tab dragged in from
    // outside any folder. The slot's canvas is redrawn at once; the picture
    // a dragged tab wears is drawn afresh once the width has held still for
    // a moment, swapped in only once it's ready: drawn at every step, each
    // new one blanked the dashes while it loaded.
    const SLOT_DASHES_SETTLE_MS = 200;
    let lastSlotDashes = "";
    let slotDashesTimer = 0;
    function drawSlotDashes() {
      clearTimeout(slotDashesTimer);
      drawSlotDashesNow(true);
      // (a slot not drawn yet, a folder just made or opened, is drawn at once)
      if ([...document.querySelectorAll("zen-folder[zia-empty]")].some((folder) => !folder.ziaSlotDashes)) {
        drawSlotDashesNow();
        return;
      }
      slotDashesTimer = setTimeout(() => drawSlotDashesNow(), SLOT_DASHES_SETTLE_MS);
    }

    function useSlotDashes(target, image) {
      const url = image.slice(5, -2);
      const picture = new Image();
      picture.src = url;
      picture.decode().catch(() => {}).then(() => target.style.setProperty("--zia-slot-dashes-image", image));
    }

    function drawSlotDashesNow(canvasOnly = false) {
      dropGoneSlotCanvases();
      const height = rootPx("--zia-slot-h", 35);
      const inset = rootPx("--zia-slot-ms", 16) + rootPx("--zia-slot-me", 7);
      const radius = rootPx("--zia-tab-radius", 9.5);
      const dpr = window.devicePixelRatio || 1;
      for (const folder of document.querySelectorAll("zen-folder[zia-empty]")) {
        const container = folder.querySelector(":scope > .tab-group-container");
        const style = container && getComputedStyle(container);
        const box = container?.getBoundingClientRect();
        const width = box
          ? Math.round((box.width - (parseFloat(style.paddingLeft) || 0) - (parseFloat(style.paddingRight) || 0) - inset) * dpr) / dpr
          : 0;
        if (width < 2 * radius + 2 * SLOT_DASH || height < 2 * radius) {
          continue;
        }
        drawSlotCanvas(folder, container, width, height, radius, dpr);
        if (canvasOnly) {
          continue;
        }
        const key = `${width}x${height}@${dpr}`;
        if (folder.ziaSlotDashes !== key) {
          folder.ziaSlotDashes = key;
          const image = slotDashesImage(width, height, radius, dpr);
          useSlotDashes(folder, image);
          if (!folder.parentElement?.closest("zen-folder") && image !== lastSlotDashes) {
            lastSlotDashes = image;
            useSlotDashes(root, image);
          }
        }
      }
    }

    // A folder emptied by moving its last tab out collapses; an open empty
    // folder (new, or opened by hand) shows the slot.
    const wasEmpty = new WeakMap();

    function markEmptyFolders() {
      let open = false;
      for (const folder of document.querySelectorAll("zen-folder")) {
        const empty = isEmptyFolder(folder);
        folder.toggleAttribute("zia-empty", empty);
        if (empty && wasEmpty.get(folder) === false && !folder.hasAttribute("collapsed")) {
          try {
            folder.collapsed = true;
          } catch (err) {
            noteError("folder empty: collapse", err);
          }
        }
        wasEmpty.set(folder, empty);
        open ||= empty && !folder.hasAttribute("collapsed");
      }
      if (open) {
        measureFolderSlot();
        drawSlotDashes();
      }
    }

    function watchEmptyFolders() {
      const tabs = document.getElementById("tabbrowser-tabs");
      if (!tabs) {
        return;
      }
      let frame = 0;
      const schedule = () => {
        if (!frame) {
          frame = requestAnimationFrame(() => {
            frame = 0;
            markEmptyFolders();
          });
        }
      };
      observeWith(MutationObserver, schedule).observe(tabs, { childList: true, subtree: true });
      // (the slot's canvas takes its dashes' colour: redrawn when a folder's
      // colour changes, or the space turns light or dark)
      observeWith(MutationObserver, schedule).observe(tabs, { subtree: true, attributes: true, attributeFilter: ["zia-folder-color"] });
      observeWith(MutationObserver, schedule).observe(root, { attributes: true, attributeFilter: ["zia-light"] });
      // An empty folder opens by sliding its slot down into view, as a folder
      // does its tabs. Emptied (its last tab dragged out) and shut, Zen had
      // measured it with no slot showing, so it was only 4px up out of view
      // and opened with a snap. It's put a slot's height up before Zen opens it.
      listen(window, 
        "TabGroupExpand",
        (event) => {
          const folder = event.target;
          if (folder?.localName !== "zen-folder" || !folder.hasAttribute("zia-empty")) {
            return;
          }
          const start = folder.groupStartElement;
          if (!start) {
            return;
          }
          const room = rootPx("--zia-slot-h", 35) + rootPx("--zia-slot-mt", 2) + rootPx("--zia-slot-mb", 2);
          if ((parseFloat(getComputedStyle(start).marginTop) || 0) > -room) {
            start.style.marginTop = `${-(room + 4)}px`;
          }
        },
        true
      );
      for (const type of ["TabGroupCreate", "TabGrouped", "TabUngrouped", "TabClose", "TabMove", "TabGroupExpand"]) {
        listen(gBrowser.tabContainer, type, schedule);
      }
      listen(window, "ZenWorkspacesUIUpdate", schedule);
      // The sidebar's width changes a tab's size
      observeWith(ResizeObserver, schedule).observe(tabs);
      schedule();
    }

    // Split essentials: a split of two sites kept as one essential, as Dia
    // can. Zen can't hold a split among its essentials yet (splitting with an
    // essential copies it into an ordinary tab), so Zia keeps it like this:
    //
    //  - The essential is an ordinary Zen essential for the left site, which
    //    Zia draws as a split tile (both sites' icons side by side, the glow a
    //    blend of the two) and never shows by itself.
    //  - The split it opens is an ordinary Zen split of two ordinary tabs,
    //    tagged zia-split-of and hidden from the tab list. Clicking the tile
    //    selects it (making it first if there's none), in the space you're in;
    //    clicking a half of the tile goes to that half of the split.
    //  - While it's showing, the tile looks selected, its colour leaning
    //    towards whichever half you're in.
    //
    // Everything is kept in the session (the essential's "zia-split" value,
    // each split tab's "zia-split-of" and "zia-split-side"), so it survives a
    // restart. Take the essential out of the essentials, or close it, and its
    // split becomes an ordinary one in the tab list again; close either tab
    // of the split and both go, until the tile is clicked again. It's all
    // behind zia.essentials.split, and turned off, every split essential goes
    // back to being a plain essential and its split an ordinary one.
    const SPLIT_PREF = "zia.essentials.split";
    const SPLIT_DATA = "zia-split";
    const SPLIT_OF = "zia-split-of";
    const SPLIT_SIDE = "zia-split-side";

    const splitEssentialsOn = () => Services.prefs.getBoolPref(SPLIT_PREF, true);

    function sessionValue(tab, key) {
      try {
        return window.SessionStore?.getCustomTabValue(tab, key) || "";
      } catch (err) {
        return "";
      }
    }

    function setSessionValue(tab, key, value) {
      try {
        if (value) {
          window.SessionStore?.setCustomTabValue(tab, key, value);
        } else {
          window.SessionStore?.deleteCustomTabValue(tab, key);
        }
      } catch (err) {
        noteError("split essentials: session", err);
      }
    }

    function splitDataOf(tab) {
      if (!tab?.hasAttribute?.("zen-essential")) {
        return null;
      }
      if (tab.ziaSplit === undefined) {
        try {
          tab.ziaSplit = JSON.parse(sessionValue(tab, SPLIT_DATA) || "null");
        } catch (err) {
          tab.ziaSplit = null;
        }
      }
      return tab.ziaSplit?.id ? tab.ziaSplit : null;
    }

    function saveSplitData(tab, data) {
      tab.ziaSplit = data;
      setSessionValue(tab, SPLIT_DATA, data ? JSON.stringify(data) : "");
    }

    const splitEssentials = () => gBrowser.tabs.filter((tab) => splitDataOf(tab));

    function pairOf(id) {
      const pair = {};
      for (const tab of gBrowser.tabs) {
        if (!tab.closing && tab.getAttribute(SPLIT_OF) === id) {
          pair[tab.getAttribute(SPLIT_SIDE) === "b" ? "b" : "a"] = tab;
        }
      }
      return pair;
    }

    function essentialFor(tab) {
      const id = tab?.getAttribute?.(SPLIT_OF);
      return id ? splitEssentials().find((essential) => splitDataOf(essential).id === id) || null : null;
    }

    function tagPairTab(tab, id, side) {
      tab.setAttribute(SPLIT_OF, id);
      tab.setAttribute(SPLIT_SIDE, side);
      setSessionValue(tab, SPLIT_OF, id);
      setSessionValue(tab, SPLIT_SIDE, side);
    }

    function untagPairTab(tab) {
      tab.removeAttribute(SPLIT_OF);
      tab.removeAttribute(SPLIT_SIDE);
      setSessionValue(tab, SPLIT_OF, "");
      setSessionValue(tab, SPLIT_SIDE, "");
    }

    const tabIcon = (tab) => tab?.getAttribute("image") || "";
    const tabUrl = (tab) => tab?.linkedBrowser?.currentURI?.spec || "";

    const DEFAULT_ICON = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjE4NCAxODQgNjU3IDY1NyI+CiAgPGNpcmNsZSBjeD0iNTEyLjQzOSIgY3k9IjUxMi40MzkiIHI9IjExMy4wMiIgc3Ryb2tlPSIjNmI2YjZiIiBzdHJva2Utd2lkdGg9IjI1LjE5NTMiLz4KICA8Y2lyY2xlIGN4PSI1MTIuNDM5IiBjeT0iNTEyLjQzOSIgcj0iMTk3LjczNyIgc3Ryb2tlPSIjNmI2YjZiIiBzdHJva2Utd2lkdGg9IjQxLjk5MjIiLz4KICA8Y2lyY2xlIGN4PSI1MTIuNDM5IiBjeT0iNTEyLjQzOSIgcj0iMjk4LjI2NiIgc3Ryb2tlPSIjNmI2YjZiIiBzdHJva2Utd2lkdGg9IjU4Ljc4OTEiLz4KPC9zdmc+Cg==";
    const cssUrl = (url) => `url("${url.replace(/"/g, "%22")}")`;

    // The tile: both sites' icons, each in an upright half of its own (the
    // essential's own icon is hidden; it never loads, so it would only be
    // Zen's placeholder).
    function drawSplitTile(essential) {
      const data = splitDataOf(essential);
      const content = essential.querySelector(".tab-content");
      const halves = content ? [...content.querySelectorAll(":scope > .zia-split-half")] : [];
      if (!data || !splitEssentialsOn()) {
        halves.forEach((half) => half.remove());
        essential.removeAttribute("zia-split-tile");
        essential.style.removeProperty("--zia-split-glow");
        return;
      }
      if (!content) {
        return;
      }
      fillSplitHalves(content, [data.a, data.b]);
      essential.setAttribute("zia-split-tile", "true");
      paintSplitGlow(essential);
    }

    // The two halves (icon and title each) inside a tab's content: the tile
    // shows just the icons; as a row, while dragged off, the titles too
    function fillSplitHalves(content, sites) {
      ["a", "b"].forEach((side, i) => {
        let half = content.querySelector(`:scope > .zia-split-half[side="${side}"]`);
        if (!half) {
          half = document.createXULElement("hbox");
          half.className = "zia-split-half";
          half.setAttribute("side", side);
          const title = document.createXULElement("label");
          title.className = "zia-split-title";
          title.setAttribute("crop", "end");
          half.append(document.createXULElement("image"), title);
          content.append(half);
        }
        const icon = sites[i]?.icon || DEFAULT_ICON;
        const image = half.querySelector("image");
        if (image.getAttribute("src") !== icon) {
          image.setAttribute("src", icon);
        }
        half.querySelector(".zia-split-title").setAttribute("value", sites[i]?.title || "");
      });
    }

    // Tab dragging's stand-ins are copies of a tab, which Firefox fills
    // afresh once they're in the page, so the halves go in after that.
    // The tile a split turns into while it's dragged over the essentials:
    function dressSplitProxy(proxy, tab) {
      const tabs = [...(tab?.group?.tabs || [])].filter((t) => !t.closing);
      const content = proxy.querySelector(".tab-content");
      if (tabs.length !== 2 || !content) {
        return;
      }
      // looks as it will once it lands: in colour (of the half being dragged)
      // if the split's the one showing, plain if not
      proxy.removeAttribute("zia-split-focus");
      if (tabs.some((t) => t.selected)) {
        proxy.setAttribute("visuallyselected", "true");
        proxy.setAttribute("selected", "true");
        // the half you're in outlined, as it will be (the split's first tab
        // is its left half)
        const shown = tabs.find((t) => t.selected);
        proxy.setAttribute("zia-split-focus", shown === tabs[0] ? "a" : "b");
        const icon = tabIcon(shown) || tabIcon(tab);
        if (icon) {
          proxy.style.setProperty("--zia-split-glow", cssUrl(icon));
        }
      } else {
        proxy.removeAttribute("visuallyselected");
        proxy.removeAttribute("selected");
        proxy.style.removeProperty("--zia-split-glow");
      }
      fillSplitHalves(content, tabs.map((t) => ({ icon: tabIcon(t), title: t.label })));
      proxy.setAttribute("zia-split-tile", "true");
    }

    // ...and a split essential dragged off it, tile then row:
    function dressSplitCopy(copy, essential) {
      const data = splitDataOf(essential);
      const content = copy.querySelector(".tab-content");
      if (!data || !content) {
        return;
      }
      fillSplitHalves(content, [data.a, data.b]);
      copy.setAttribute("zia-split-tile", "true");
      // the copy's styles were cleared: keep the tile's colour
      const glow = essential.style.getPropertyValue("--zia-split-glow");
      if (glow) {
        copy.style.setProperty("--zia-split-glow", glow);
      }
    }

    // The selected look takes the colour of the half you're in, over the
    // whole tile
    function paintSplitGlow(essential) {
      const data = splitDataOf(essential);
      const side = essential.getAttribute("zia-split-focus") || essential.ziaLastSide || "a";
      const icon = data?.[side]?.icon;
      setStyle(essential, "--zia-split-glow", icon ? cssUrl(icon) : null);
    }

    // Selected look while its split is showing
    function syncSplitSelection() {
      const selected = gBrowser.selectedTab;
      const showing = essentialFor(selected);
      for (const essential of splitEssentials()) {
        const on = essential === showing;
        if (on) {
          const side = selected.getAttribute(SPLIT_SIDE) === "b" ? "b" : "a";
          essential.setAttribute("zia-split-focus", side);
          essential.ziaLastSide = side;
        } else {
          essential.removeAttribute("zia-split-focus");
        }
        paintSplitGlow(essential);
        if (on !== essential.hasAttribute("visuallyselected")) {
          essential._visuallySelected = on;
        }
      }
    }

    // The hover card shows the half you're in (or were last in)
    function splitCardSource(tab) {
      const data = splitDataOf(tab);
      if (!data) {
        return null;
      }
      const side = tab.getAttribute("zia-split-focus") || tab.ziaLastSide || "a";
      return pairOf(data.id)[side] || null;
    }

    function addTabFor(url) {
      return gBrowser.addTab(url || "about:blank", {
        triggeringPrincipal: Services.scriptSecurityManager.getSystemPrincipal(),
        inBackground: true,
        skipAnimation: true,
      });
    }

    // Shows an essential's split, making it first if it's gone
    function openSplitEssential(essential, side = "a") {
      const data = splitDataOf(essential);
      if (!data) {
        return;
      }
      let { a, b } = pairOf(data.id);
      const space = window.gZenWorkspaces?.activeWorkspace;
      if (a && b && a.group && a.group === b.group) {
        if (space && a.getAttribute("zen-workspace-id") !== space) {
          try {
            window.gZenWorkspaces.moveTabsToWorkspace([a, b], space);
          } catch (err) {
            noteError("split essentials: move split", err);
          }
        }
      } else {
        for (const leftover of [a, b]) {
          if (leftover) {
            untagPairTab(leftover);
            gBrowser.removeTab(leftover, { animate: false });
          }
        }
        a = addTabFor(data.a?.url);
        b = addTabFor(data.b?.url);
        tagPairTab(a, data.id, "a");
        tagPairTab(b, data.id, "b");
        window.gZenViewSplitter?.splitTabs([a, b], "vsep", side === "b" ? 1 : 0);
      }
      gBrowser.selectedTab = side === "b" ? b : a;
      syncSplitSelection();
    }

    // Why a tab's split can't become a split essential ("" when it can): a
    // two-site split, not already a split essential's, with the setting on
    function splitEssentialRefusal(tab) {
      if (!splitEssentialsOn()) {
        return "the Split essentials setting is off";
      }
      const group = tab?.group;
      if (!group?.hasAttribute("split-view-group")) {
        return "the tab isn't in a split";
      }
      const tabs = [...(group.tabs || group.querySelectorAll(".tabbrowser-tab"))].filter((t) => !t.closing);
      if (tabs.length !== 2) {
        return `the split has ${tabs.length} tabs, not two`;
      }
      if (tabs.some((t) => t.hasAttribute(SPLIT_OF) || t.hasAttribute("zen-essential"))) {
        return "it's already a split essential's";
      }
      return "";
    }

    const canBecomeSplitEssential = (tab) => !splitEssentialRefusal(tab);

    // Turns a two-site split into a split essential: the split itself stays
    // (hidden from the tab list) and becomes the essential's. From its tab's
    // right-click menu, or dragging it onto the essentials.
    function addSplitToEssentials(tab) {
      const refusal = splitEssentialRefusal(tab);
      if (refusal) {
        console.warn(`[Zia] Split essentials: can't add that split: ${refusal}`);
        return;
      }
      const tabs = [...(tab.group.tabs || tab.group.querySelectorAll(".tabbrowser-tab"))].filter((t) => !t.closing);
      const [a, b] = tabs;
      const id = `zia-split-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
      const essential = gBrowser.addTab(tabUrl(a) || "about:blank", {
        triggeringPrincipal: Services.scriptSecurityManager.getSystemPrincipal(),
        inBackground: true,
        skipAnimation: true,
        createLazyBrowser: true,
        title: a.label,
      });
      if (tabIcon(a)) {
        try {
          gBrowser.setIcon(essential, tabIcon(a), null, Services.scriptSecurityManager.getSystemPrincipal());
        } catch (err) {
          noteError("split essentials: icon", err);
        }
      }
      try {
        window.gZenPinnedTabManager?.addToEssentials(essential);
      } catch (err) {
        noteError("split essentials: add", err);
      }
      if (!essential.hasAttribute("zen-essential")) {
        console.warn("[Zia] Split essentials: Zen didn't take the new essential (the essentials may be full)");
        gBrowser.removeTab(essential, { animate: false });
        return;
      }
      saveSplitData(essential, {
        id,
        a: { url: tabUrl(a), title: a.label, icon: tabIcon(a) },
        b: { url: tabUrl(b), title: b.label, icon: tabIcon(b) },
      });
      tagPairTab(a, id, "a");
      tagPairTab(b, id, "b");
      drawSplitTile(essential);
      syncSplitSelection();
      return essential;
    }

    // The split essential is gone (closed, or taken out of the essentials):
    // its split is an ordinary one again.
    function releaseSplit(essential) {
      const data = essential.ziaSplit;
      if (!data?.id) {
        return;
      }
      for (const tab of Object.values(pairOf(data.id))) {
        untagPairTab(tab);
      }
      if (essential.isConnected && !essential.closing) {
        saveSplitData(essential, null);
        drawSplitTile(essential);
        essential.removeAttribute("zia-split-focus");
      }
    }

    // place(group), if given, puts the split where it was dropped
    function splitBackToList(essential, place = null) {
      const data = essential.ziaSplit;
      if (!data?.id || essential.closing || !essential.isConnected) {
        return;
      }
      let { a, b } = pairOf(data.id);
      releaseSplit(essential);
      try {
        if (!(a && b && a.group && a.group === b.group)) {
          for (const leftover of [a, b]) {
            if (leftover) {
              gBrowser.removeTab(leftover, { animate: false });
            }
          }
          a = addTabFor(data.a?.url);
          b = addTabFor(data.b?.url);
          window.gZenViewSplitter?.splitTabs([a, b], "vsep", -1, { activate: false });
        }
        const space = essential.getAttribute("zen-workspace-id") || window.gZenWorkspaces?.activeWorkspace;
        if (space && a.getAttribute("zen-workspace-id") !== space) {
          window.gZenWorkspaces?.moveTabsToWorkspace([a, b], space);
        }
        // dropped among the pinned tabs: the split's pinned too
        if (essential.pinned) {
          for (const tab of [a, b]) {
            if (!tab.pinned) {
              gBrowser.pinTab(tab);
            }
          }
        }
        if (a.group) {
          if (place) {
            place(a.group, [a, b]);
          } else {
            gBrowser.moveTabBefore(a.group, essential);
          }
        }
      } catch (err) {
        noteError("split essentials: back to the list", err);
      }
      const wasSelected = essential.selected;
      if (wasSelected && a && !a.closing) {
        gBrowser.selectedTab = a;
      }
      // Not removed mid-drop: Firefox's own drop still moves the dragged tab
      // afterwards, which would put a removed one back as a dead, unclosable
      // row. Hidden now, gone once the drop's done.
      essential.setAttribute("zia-split-gone", "true");
      goneEssentials.add(essential);
      setTimeout(() => {
        if (essential.isConnected && !essential.closing) {
          gBrowser.removeTab(essential, { animate: false });
        }
        setTimeout(clearDeadRows, 0);
      }, 0);
    }

    // A removed essential put back as a row (see above) can't be closed: it goes
    const goneEssentials = new Set();
    function clearDeadRows() {
      for (const row of goneEssentials) {
        // removed without animation, so one still showing after that is dead
        if (row.closing || !row.isConnected || !gBrowser.tabs.includes(row)) {
          goneEssentials.delete(row);
          if (row.isConnected) {
            row.remove();
          }
        }
      }
    }

    function watchSplitEssentials() {
      const container = gBrowser.tabContainer;

      // Clicking the tile shows its split, at the half that was clicked. The
      // press itself only keeps Zen from selecting the essential (so it can
      // still be dragged); the split opens on the click.
      const tileUnder = (event) => {
        if (event.button !== 0 || !splitEssentialsOn()) {
          return null;
        }
        const essential = event.target.closest?.(".tabbrowser-tab[zen-essential][zia-split-tile]");
        if (!essential || event.target.closest(".tab-close-button, .tab-reset-button, .tab-icon-overlay, .tab-audio-button")) {
          return null;
        }
        return essential;
      };
      listen(container, "mousedown", (event) => {
        if (tileUnder(event)) {
          event.stopPropagation();
        }
      }, true);
      listen(container, "click", (event) => {
        const essential = tileUnder(event);
        if (!essential) {
          return;
        }
        event.stopPropagation();
        const box = essential.getBoundingClientRect();
        openSplitEssential(essential, event.clientX > box.left + box.width / 2 ? "b" : "a");
      }, true);

      // Reached some other way (a shortcut, a restored selection): the split
      // shows instead of the essential by itself.
      listen(container, "TabSelect", (event) => {
        const tab = event.target;
        setTimeout(sweepReleased, 0);
        if (splitEssentialsOn() && splitDataOf(tab)) {
          setTimeout(() => {
            if (gBrowser.selectedTab === tab) {
              openSplitEssential(tab, "a");
            }
          }, 0);
          return;
        }
        syncSplitSelection();
      });

      listen(container, "TabClose", (event) => {
        const tab = event.target;
        if (tab.ziaSplit?.id) {
          releaseSplit(tab);
          return;
        }
        // One half closed: the whole split goes, until the tile's clicked again
        const id = tab.getAttribute(SPLIT_OF);
        if (id) {
          const { a, b } = pairOf(id);
          for (const other of [a, b]) {
            if (other && other !== tab) {
              untagPairTab(other);
              gBrowser.removeTab(other, { animate: false });
            }
          }
          setTimeout(syncSplitSelection, 0);
        }
      });

      // Taken out of the essentials (dragged back to the list, or Remove from
      // Essentials): its split takes its place there, and the essential goes.
      // A drag places the essential first, so this waits a moment for that;
      // and after any drag, or on switching tabs, anything missed is tidied.
      const sweepReleased = () => {
        clearDeadRows();
        for (const tab of gBrowser.tabs) {
          if (tab.ziaSplit?.id && !tab.closing && !tab.hasAttribute("zen-essential")) {
            splitBackToList(tab);
          }
        }
      };
      observeWith(MutationObserver, (records) => {
        for (const { target } of records) {
          if (target.ziaSplit?.id && !target.hasAttribute("zen-essential")) {
            setTimeout(() => splitBackToList(target), 120);
          }
        }
      }).observe(container, { subtree: true, attributes: true, attributeFilter: ["zen-essential", "pinned"] });
      listen(window, "dragend", () => setTimeout(sweepReleased, 400), true);
      listen(window, "drop", () => setTimeout(sweepReleased, 400), true);

      // Each half's icon follows its site
      listen(container, "TabAttrModified", (event) => {
        const tab = event.target;
        const side = tab.getAttribute(SPLIT_SIDE);
        if (!side || !event.detail?.changed?.includes("image")) {
          return;
        }
        const essential = essentialFor(tab);
        const data = essential && splitDataOf(essential);
        if (data && tabIcon(tab) && data[side]?.icon !== tabIcon(tab)) {
          saveSplitData(essential, { ...data, [side]: { ...data[side], icon: tabIcon(tab) } });
          drawSplitTile(essential);
        }
      });

      // After a restart: tags back on from the session; orphans let go
      const restore = () => {
        const on = splitEssentialsOn();
        const ids = new Set();
        for (const tab of gBrowser.tabs) {
          const data = splitDataOf(tab);
          if (data && on) {
            ids.add(data.id);
          } else if (data) {
            releaseSplit(tab);
          }
          drawSplitTile(tab);
        }
        for (const tab of gBrowser.tabs) {
          const id = tab.getAttribute(SPLIT_OF) || sessionValue(tab, SPLIT_OF);
          if (!id) {
            continue;
          }
          if (ids.has(id)) {
            tab.setAttribute(SPLIT_OF, id);
            tab.setAttribute(SPLIT_SIDE, sessionValue(tab, SPLIT_SIDE) || tab.getAttribute(SPLIT_SIDE) || "a");
          } else {
            untagPairTab(tab);
          }
        }
        syncSplitSelection();
      };
      window.SessionStore?.promiseAllWindowsRestored?.then(restore, restore);
      listen(container, "TabAddedToEssentials", (event) => drawSplitTile(event.target));
      watchPrefs(SPLIT_PREF, restore);
    }

    function nodeToMove(element) {
      if (!element) {
        return null;
      }
      if (element.hasAttribute?.("split-view-group") || element.group?.hasAttribute?.("split-view-group")) {
        return element.group || element;
      }
      if (gBrowser.isTab(element)) {
        return element;
      }
      if (gBrowser.isTabGroupLabel?.(element)) {
        return element.closest(".tab-group-label-container") || element;
      }
      if (gBrowser.isTabGroup?.(element)) {
        return element.labelContainerElement || element;
      }
      return element;
    }

    function moveTabsLikeDia() {
      const moved = new Set();
      let blank = null;
      let drag = null;
      let pending = null;
      let raf = 0;
      let lastDy = 0;

      const blankImage = () => {
        if (!blank) {
          blank = document.createElement("div");
          blank.style.cssText = "position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none;";
          document.documentElement.appendChild(blank);
          onStop(() => blank.remove());
        }
        return blank;
      };

      // What's dragged in the sidebar has Zia's own stand-in, so the system's picture is
      // blanked (for an essential, anything: it showed as a window-wide blurred band).
      // A drag in the Library (its spaces' tabs) is Zen's own, with its own picture
      // under the pointer and its drop line: Zia leaves it alone.
      const inLibrary = (event) => event.composedPath?.().some((node) => node.localName === "zen-library");
      let libraryDragging = false;
      listen(window, "dragstart", (event) => (libraryDragging = !!inLibrary(event)), true);
      listen(window, "dragend", () => (libraryDragging = false), true);

      // (handed to Zen mid-drag, by a switch of space: Zen's own picture of the tab, as Zia's
      // rows stay in the space it left, releaseToZen)
      let zenDragImage = false;
      // (Zen's picture is swapped for a blank one only in a drag Zia moves itself, a tab or a
      // Zen folder with its drag on: anything else, as Advanced Tab Groups' groups, keeps it,
      // or nothing at all showed moving under the pointer, #567)
      let ziaMoves = false;
      listen(window, "dragstart", (event) => {
        zenDragImage = false;
        ziaMoves = featureOn("dia-tab-drag") && !!tabFromEvent(event);
      }, true);
      const isTabGhost = (node) =>
        !libraryDragging &&
        !zenDragImage &&
        ((ziaMoves && !!(node?.querySelector?.("[drag-image]") || node?.hasAttribute?.("drag-image"))) ||
        !!essentialDragging ||
        !!node?.closest?.("#zen-essentials, .zen-essentials-container") ||
        !!node?.querySelector?.(".tabbrowser-tab[zen-essential]"));
      let essentialDragging = false;
      for (const name of ["setDragImage", "updateDragImage"]) {
        const original = DataTransfer.prototype[name];
        const wrapped = DataTransfer.prototype[name] = function (node, x, y) {
          return isTabGhost(node) ? original.call(this, blankImage(), 0, 0) : original.call(this, node, x, y);
        };
        onStop(() => { if (DataTransfer.prototype[name] === wrapped) DataTransfer.prototype[name] = original; });
      }

      const tabFromEvent = (event) => {
        const seen = [event.explicitOriginalTarget, event.originalTarget, event.target];
        for (const start of seen) {
          let node = start;
          while (node) {
            if (node.classList?.contains("tabbrowser-tab")) {
              return node.hasAttribute("zen-essential") ? null : node;
            }
            // (an Advanced Tab Groups group slides as a folder does: it was left to Zen's picture,
            // the row standing still while that went with the pointer, #567. Plain Firefox groups,
            // off in Zen and shaped differently, keep Zen's picture)
            if (node.localName === "zen-folder" || node.isZenFolder || (isTabGroup(node) && !!window.advancedTabGroups)) {
              return node;
            }
            node = node.parentElement || node.getRootNode?.()?.host;
          }
        }
        return null;
      };

      const layoutTop = (node) => {
        const box = window.windowUtils.getBoundsWithoutFlushing(node);
        return { top: box.top, height: box.height };
      };

      const measureHeadings = () => (states.get(activeStrip())?.headers || []).map(node => {
        const box = node.getBoundingClientRect();
        return {node, mid:box.top + box.height / 2};
      });

      const measureRows = (keepOpen = null) => {
        const rows = [];
        const seen = new Set();
        for (const item of gBrowser.tabContainer.ariaFocusableItems) {
          if (item.hasAttribute?.("zen-essential")) {
            continue;
          }
          // a split essential's own tabs, kept hidden in the list, aren't rows (as 0-high rows
          // between a folder and the next, no tab could be dropped into the folder)
          if (item.hasAttribute?.("zia-split-of") || item.group?.querySelector?.(":scope .tabbrowser-tab[zia-split-of]")) {
            continue;
          }
          // nor the selected tabs folded into the one dragged: hidden, as 0-high rows each step
          // past them moved nothing, and the dragged tab slid over the rows that should part
          if (item.hasAttribute?.("zia-drag-companion")) {
            continue;
          }
          let node = nodeToMove(item);
          // A closed folder is one row, its name and the tab it shows (that tab as a row too
          // moved aside twice and came apart from it, uncovering the tabs it hides).
          let closed = null;
          for (
            let host = node?.closest?.(FOLDER_SELECTOR);
            host;
            host = host.parentElement?.closest?.(FOLDER_SELECTOR)
          ) {
            if (host !== node && (host.hasAttribute("collapsed") || host.collapsed) && !host.contains(keepOpen)) {
              closed = host;
            }
          }
          // (only a folder showing a tab: a plain closed folder is its name, so a tab dragged
          // up past the separator lands below it first)
          if (closed?.hasAttribute("has-active")) {
            node = closed;
          } else {
            const host = node?.closest?.(FOLDER_SELECTOR);
            if (
              host &&
              host !== node &&
              (host.hasAttribute("collapsed") || host.collapsed) &&
              node.classList?.contains("tab-group-label-container") &&
              !host.contains(keepOpen)
            ) {
              node = host;
            }
          }
          if (!node || seen.has(node)) {
            continue;
          }
          seen.add(node);
          const box = layoutTop(node);
          // (showing its open tab: the name's height, where a tab can go in above that one)
          const header = closed?.hasAttribute("has-active") && node === closed ? headerOf(closed) : null;
          const head = header ? layoutTop(header).height : 0;
          rows.push({
            item,
            node,
            index: rows.length,
            top: box.top,
            mid: box.top + box.height / 2,
            height: box.height,
            head: head > 0 && head < box.height - 4 ? head : 0,
            delta: 0,
          });
        }
        // Numbered by place in the sidebar, not Firefox's tab count: that can lag a move,
        // and the folders a tab sat under all moved up out of its way
        rows.sort((a, b) => (a.node === b.node ? 0 : a.node.compareDocumentPosition(b.node) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
        rows.forEach((row, i) => {
          row.index = i;
        });
        return rows;
      };

      // An empty folder's "Drag tabs here" slot is drawn on its tab container,
      // so it follows the folder's header when that moves aside.
      const slotFolderOf = (node) =>
        node?.classList?.contains("tab-group-label-container") && node.parentElement?.hasAttribute("zia-empty")
          ? node.parentElement
          : null;

      const clearNode = (node) => {
        const slotFolder = slotFolderOf(node);
        if (slotFolder) {
          slotFolder.style.removeProperty("--zia-slot-y");
        }
        for (const name of ["top", "position", "z-index", "transform", "--zia-drag-y"]) {
          node.style.removeProperty(name);
        }
        node.removeAttribute("zia-dragging");
        node.removeAttribute("ztt-folder-target");
        node.style.removeProperty("--ztt-folder-inset");
        node.removeAttribute("zia-shift");
      };

      const clearMoved = () => {
        for (const node of moved) {
          clearNode(node);
        }
        moved.clear();
      };

      const place = (node, y, above) => {
        if (!node) {
          return;
        }
        node.style.setProperty("--zia-drag-y", `${Math.round(y)}px`);
        slotFolderOf(node)?.style.setProperty("--zia-slot-y", `${Math.round(y)}px`);
        node.style.removeProperty("top");
        node.style.setProperty("transform", `translateY(${Math.round(y)}px)`, "important");
        node.style.setProperty("position", "relative", "important");
        node.style.setProperty("z-index", above ? "40" : "1", "important");
        if (above) {
          node.setAttribute("zia-dragging", "true");
          node.removeAttribute("zia-shift");
        } else {
          node.setAttribute("zia-shift", "true");
          node.removeAttribute("zia-dragging");
        }
        moved.add(node);
      };

      const isFolderEl = (el) =>
        !!el && (el.localName === "zen-folder" || el.isZenFolder || (el.localName === "tab-group" && !el.hasAttribute("split-view-group")));
      const isTabGroup = (el) => el?.localName === "tab-group" && !el.isZenFolder && !el.hasAttribute("split-view-group");
      const headerOf = (folder) => folder?.querySelector?.(":scope > .tab-group-label-container") || null;
      const isCollapsed = (folder) => !!folder && (folder.collapsed === true || folder.hasAttribute("collapsed"));

      // An open empty folder's slot takes a tab's room under its header without being a
      // row: its height (measured once per drag) counts toward the folder's size, and a
      // tab dragged in takes its place instead of more room.
      const slotPitchOf = (folder) => {
        if (!drag || !folder?.hasAttribute?.("zia-empty") || isCollapsed(folder)) {
          return 0;
        }
        drag.slotPitch ||= new Map();
        if (!drag.slotPitch.has(folder)) {
          const container = folder.querySelector(":scope > .tab-group-container");
          drag.slotPitch.set(folder, container ? window.windowUtils.getBoundsWithoutFlushing(container).height : 0);
        }
        return drag.slotPitch.get(folder);
      };
      const slotAfterHeader = (row) =>
        row?.node?.classList?.contains("tab-group-label-container") ? slotPitchOf(row.node.parentElement) : 0;

      const rowFolder = (row) => {
        const node = row?.node;
        if (!node) {
          return null;
        }
        if (isFolderEl(node)) {
          return node;
        }
        if (node.classList?.contains("tab-group-label-container")) {
          return isFolderEl(node.parentElement) ? node.parentElement : null;
        }
        return node.parentElement?.closest?.(FOLDER_SELECTOR) || null;
      };
      const isFolderStart = (row, folder) => !!row && !!folder && (row.node === folder || row.node === headerOf(folder));
      const notARow = (row) => row.node === drag.moving || (drag.folder && drag.folder.contains(row.node));
      const rowBelowSep = (row) => drag.sepTop != null && row.top > drag.sepTop;
      const tabBelowSep = () => {
        if (drag.sepTop == null) {
          return false;
        }
        const startedBelow = drag.origin > drag.sepTop;
        return startedBelow ? !drag.sepDelta : !!drag.sepDelta;
      };

      const topLevel = (row) => (row.node.classList?.contains("tab-group-label-container") ? row.node.parentElement : row.node);

      const setDropSlot = (folder) => {
        if (!drag || drag.slot === folder) {
          return;
        }
        drag.slot?.removeAttribute("zia-drop-slot");
        drag.slot = folder || null;
        if (!drag.folder) {
          if (folder) drag.moving.style.setProperty("--ztt-folder-inset", drag.moving.getBoundingClientRect().width * .1 + "px");
          drag.moving.toggleAttribute("ztt-folder-target", !!folder);
        }
        folder?.setAttribute("zia-drop-slot", "true");
        // The folder it came from loses its highlight once it's dragged out (Firefox kept
        // it hovered until the mouse next moved, after the drop), and regains it coming back
        for (let home = drag.moving?.parentElement?.closest?.(FOLDER_SELECTOR); home; home = home.parentElement?.closest?.(FOLDER_SELECTOR)) {
          home.toggleAttribute("zia-left", !folder || (folder !== home && !home.contains(folder)));
        }
        // Over an empty folder the tab (or a split's box) covers its slot, so it wears the
        // slot's dashes instead (chrome.css), in the folder's colour.
        const tabs = drag.moving === drag.tab || (drag.split && drag.moving === drag.split) ? [drag.moving] : [];
        const into = !!folder?.hasAttribute("zia-empty");
        const border = into ? getComputedStyle(folder).getPropertyValue("--zia-slot-border") : "";
        for (const tab of tabs) {
          if (into) {
            tab.style.setProperty("--zia-slot-border", border);
          }
          tab.toggleAttribute("zia-into-empty", into);
        }
      };

      // Room for a tab going in at the top of a closed folder showing its open tab: that
      // tab moves down a tab's height or, coming from above, the folder's name moves up
      let topRoom = null;
      const roomAtTop = (folder, way) => {
        const key = folder ? `${way}` : null;
        if (topRoom?.folder === folder && topRoom?.key === key) {
          return;
        }
        if (topRoom) {
          topRoom.node.style.removeProperty("translate");
          topRoom = null;
        }
        if (!folder || !drag) {
          return;
        }
        const node = way === "up" ? headerOf(folder) : folder.querySelector(":scope > .tab-group-container");
        if (!node) {
          return;
        }
        node.style.setProperty("transition", "translate 0.15s ease");
        node.style.setProperty("translate", `0 ${way === "up" ? -drag.pitch : drag.pitch}px`);
        topRoom = { folder, key, node };
      };

      const updateTarget = (visualMid) => {
        let prev = null;
        let next = null;
        for (const row of drag.rows) {
          if (notARow(row)) {
            continue;
          }
          const above = row.index < drag.index ? !drag.shifted.has(row.node) : drag.shifted.has(row.node);
          if (above) {
            prev = row;
          } else if (!next) {
            next = row;
          }
        }
        const below = tabBelowSep();
        const same = (row) => !!row && rowBelowSep(row) === below;
        const slotTop = same(prev) ? prev.top + prev.delta + prev.height + Math.max(0, drag.pitch - drag.height) : null;
        const pf = same(prev) ? rowFolder(prev) : null;
        const nf = same(next) ? rowFolder(next) : null;

        const leaveUp = (row) =>
          row.index < drag.index ? row.top + row.height - 8 : row.top - 10;
        const leaveDown = (row) => {
          if (!row || !same(row)) {
            return drag.sepTop != null ? drag.sepTop + 2 : null;
          }
          return row.index > drag.index ? row.top + 8 : row.top + row.height + 10;
        };
        let cut = slotTop != null ? slotTop + drag.height / 2 - 2 : null;
        if (prev && same(prev)) {
          // the last folder before the separator: its slot is a whole tab tall, not the sliver
          // down to the separator
          if (!same(next) && slotTop != null) {
            // Coming up past the separator, the tab lands below the last folder first and goes
            // in once its middle is a little way into the slot (half: a band of a few pixels,
            // so it seemed to drop straight in; a third: so tall it seemed not to go in at all;
            // 4 tenths from below, where it counts as past the separator a fifth of the way in).
            // Leaving downward it stays in until its bottom meets the folder's (any earlier left
            // a tiny gap under the folder).
            const fromBelow = drag.sepTop != null && drag.origin > drag.sepTop;
            const inIt = drag.target?.folder === pf;
            cut = slotTop + drag.height * (fromBelow && !inIt ? 0.4 : 0.5);
          } else {
            const down = leaveDown(next);
            if (down != null) {
              cut = (leaveUp(prev) + down) / 2;
            }
          }
        }
        let folder = null;
        let atEnd = false;
        if (pf && nf === pf && !isFolderStart(next, pf)) {
          folder = pf;
        } else if (pf && cut != null && visualMid < cut && !(drag.folder && isCollapsed(pf))) {
          // (a folder dragged goes in at the end only of an open one: just below a closed
          // one, where a tab goes in, it's beside it, as a folder lost in one it can't see
          // into was hard to get out again, #567)
          folder = pf;
          atEnd = true;
        } else if (nf && !isFolderStart(next, nf)) {
          folder = nf;
        }
        // Between two rows inside the same open folder: that folder, not the list (it went
        // full width though still inside)
        if (!folder && prev && next && same(prev) && same(next)) {
          const holder = (node) => node?.parentElement?.closest?.(FOLDER_SELECTOR) || null;
          let common = holder(prev.node);
          while (common && !common.contains(next.node)) {
            common = holder(common);
          }
          if (common && !isCollapsed(common) && !drag.moving.contains?.(common) && !(drag.folder && !canNest(drag.folder, common))) {
            folder = common;
          }
        }
        // Out past the end of a folder inside another that ends there too: the outer one
        // takes it before the list (it went full width for a moment, still inside)
        if (!folder && pf && cut != null && visualMid >= cut) {
          const outer = pf.parentElement?.closest?.(FOLDER_SELECTOR);
          if (outer && !isCollapsed(outer) && outer.contains(prev.node) && !(next && outer.contains(next.node)) && !drag.moving.contains?.(outer)) {
            const down = same(next) ? leaveDown(next) : null;
            const outerCut = down != null && down > cut ? (cut + down) / 2 : cut + drag.height / 2;
            if (visualMid < outerCut) {
              folder = outer;
              atEnd = true;
            }
          }
        }
        // Between a closed folder's name and the tab it shows: into it at the top (a tab only;
        // the shown tab moves down to make room, or the name up)
        let first = null;
        const shows = (row) => !!row?.head && isFolderEl(row.node) && isCollapsed(row.node) && same(row);
        if (!drag.folder) {
          if (folder === pf && shows(prev) && visualMid < prev.top + (prev.delta || 0) + prev.head + (prev.height - prev.head) / 2) {
            first = "down";
          } else if (!folder && shows(next) && !drag.shifted.has(next.node) && visualMid > next.top + (next.delta || 0) + next.head / 2) {
            folder = next.node;
            first = "up";
          }
          if (first) {
            atEnd = false;
          }
        }
        if (folder && drag.moving.contains?.(folder)) {
          folder = null;
          first = null;
        }
        // a folder goes into another only where Zen allows that deep
        if (drag.folder && folder && !canNest(drag.folder, folder)) {
          folder = null;
          atEnd = false;
        }
        roomAtTop(first ? folder : null, first);

        const crosses = below === !!drag.tab.pinned;

        // A split is always Zia's to place: Zen won't take one across the separator, dropped
        // it outside a closed or empty folder, and went by what's under the pointer (at the
        // top of the list, below the first folder or back where it came from)
        // (and several selected tabs: Firefox placed them by its measure of the list, which the
        // drag had shifted, and two dragged a few rows down went to the end of it)
        const hand = !!(drag.folder || drag.split || folder || pf || (nf && isFolderStart(next, nf)) || crosses || drag.companions);
        // a tap going into or out of a folder (Zen's own are muted during a drag), not for
        // the one it's in as it starts
        if (drag.target && folder !== drag.target.folder) {
          tap();
        }
        drag.target = { folder, atEnd, first: !!first, prev, next, below, sameNext: same(next), slotTop, hand };
        setDropSlot(folder);
      };

      const paintedFolders = new Set();
      // Folders' boxes stretched round the room made for what's dragged: a tab, or
      // (listRoom) an essential brought down into the list, whose folders didn't open
      const paintFolders = (
        { rows, target, pitch, height, skip, outer, moving } =
          { rows: drag.rows, target: drag.target, pitch: drag.pitch, height: drag.height, skip: notARow, outer: drag.folder, moving: drag.moving }
      ) => {
        const folders = new Set();
        for (const row of rows) {
          for (let f = rowFolder(row); f; f = f.parentElement?.closest?.(FOLDER_SELECTOR)) {
            folders.add(f);
          }
        }
        for (const f of folders) {
          if (outer && (f === outer || outer.contains(f))) {
            continue;
          }
          const into = !!target?.folder && (target.folder === f || f.contains(target.folder));
          let top = 0;
          let grow = 0;
          if (isCollapsed(f) && !f.contains(moving)) {
            grow = into ? pitch : 0;
            if (into && topRoom?.folder === f && topRoom.key === "up") {
              top = -pitch;
              grow = 0;
            }
          } else {
            let origBottom = -Infinity;
            let shownBottom = -Infinity;
            let showsTab = false;
            for (const row of rows) {
              if (row.node === f || !f.contains(row.node)) {
                continue;
              }
              const slot = slotAfterHeader(row);
              origBottom = Math.max(origBottom, row.top + row.height + slot);
              if (row.node === headerOf(f)) {
                top = row.delta || 0;
              }
              if (!skip(row)) {
                const intoThisSlot = slot && into && target.folder === row.node.parentElement;
                shownBottom = Math.max(shownBottom, row.top + (row.delta || 0) + row.height + (intoThisSlot ? 0 : slot));
                showsTab ||= row.node !== headerOf(f);
              }
            }
            if (into && target.slotTop != null) {
              shownBottom = Math.max(shownBottom, target.slotTop + height);
              showsTab = true;
            }
            if (Number.isFinite(origBottom) && Number.isFinite(shownBottom)) {
              grow = shownBottom - origBottom;
            }
            // closed, its open tab dragged out, it loses the padding below that tab too
            // (chrome.css): the box closed up less that and snapped the rest on the drop
            if (isCollapsed(f) && !showsTab) {
              grow -= parseFloat(getComputedStyle(f).getPropertyValue("--zia-folder-inner-gap")) || 0;
            }
          }
          f.style.setProperty("--zia-drag-bg-top", `${Math.round(top)}px`);
          f.style.setProperty("--zia-drag-bg-grow", `${Math.round(grow)}px`);
          if (!f.hasAttribute("zia-bg-shift")) {
            f.setAttribute("zia-bg-shift", "true");
          }
          paintedFolders.add(f);
        }
      };

      const clearFolderPaint = () => {
        if (topRoom) {
          const { node } = topRoom;
          topRoom = null;
          node.style.removeProperty("translate");
          setTimeout(() => node.style.removeProperty("transition"), 200);
        }
        for (const f of paintedFolders) {
          f.removeAttribute("zia-bg-shift");
          f.style.removeProperty("--zia-drag-bg-top");
          f.style.removeProperty("--zia-drag-bg-grow");
        }
        paintedFolders.clear();
      };

      const FOLDER_TAB_INSET = { start: 14.5, end: 5 };
      const bgOf = (tab) => tab?.querySelector?.(":scope > .tab-stack > .tab-background");
      const contentOf = (tab) => tab?.querySelector?.(":scope > .tab-stack > .tab-content");
      const showing = (tab) => {
        if (tab?.visible === false || tab?.checkVisibility?.({ opacityProperty: true, visibilityProperty: true }) === false) {
          return null;
        }
        const bg = bgOf(tab);
        const box = bg?.getBoundingClientRect();
        return box && box.width > 20 && box.height > 8 ? box : null;
      };
      const folderBox = (folder) => {
        const box = folder.getBoundingClientRect();
        const before = getComputedStyle(folder, "::before");
        return { left: box.left + (parseFloat(before.left) || 0), right: box.right - (parseFloat(before.right) || 0) };
      };
      const sampleTab = (inside) =>
        [...(inside?.tabs || gBrowser.visibleTabs)].find(
          (tab) => tab !== drag?.tab && !tab.hasAttribute("zen-essential") && !tab.hasAttribute("zen-empty-tab") && showing(tab) &&
            (inside ? true : !tab.group || tab.group.hasAttribute("split-view-group") ? !inside : true)
        );
      const widthFor = (folder) => {
        if (folder) {
          const own = sampleTab(folder);
          if (own && own.group === folder) {
            return showing(own);
          }
          let inset = FOLDER_TAB_INSET;
          const other = [...gBrowser.visibleTabs].find(
            (tab) => tab !== drag?.tab && tab.group && isFolderEl(tab.group) && !tab.group.group && showing(tab)
          );
          if (other) {
            const box = showing(other);
            const fb = folderBox(other.group);
            inset = { start: box.left - fb.left, end: fb.right - box.right };
          }
          const fb = folderBox(folder);
          return { left: fb.left + inset.start, right: fb.right - inset.end };
        }
        const plain = [...gBrowser.visibleTabs].find(
          (tab) => tab !== drag?.tab && !tab.group && !tab.hasAttribute("zen-essential") && !tab.hasAttribute("zen-empty-tab") && showing(tab)
        );
        if (plain) {
          return showing(plain);
        }
        const anyFolder = document.querySelector("#tabbrowser-tabs zen-folder");
        return anyFolder ? folderBox(anyFolder) : null;
      };

      // A dragged folder narrows the same way over a folder it would go into, to the
      // width of folders already inside one (its margins, eased)
      const morphFolderWidth = (into) => {
        const moving = drag.folder;
        const key = into || "plain";
        if (drag.widthKey === key) {
          return;
        }
        drag.widthKey = key;
        if (!drag.folderBase) {
          const style = getComputedStyle(moving);
          drag.folderBase = {
            box: folderBox(moving),
            start: parseFloat(style.marginInlineStart) || 0,
            end: parseFloat(style.marginInlineEnd) || 0,
          };
        }
        const base = drag.folderBase;
        const inset = into ? (base.box.right - base.box.left) * 0.1 : 0;
        const start = inset, end = inset;
        moving.setAttribute("zia-morph-folder", "true");
        // eased frame by frame (the drag's own rules turn transitions off)
        const from = drag.folderShown || { start: base.start, end: base.end };
        const to = { start: base.start + start, end: base.end + end };
        const began = performance.now();
        const id = (drag.folderMorphId = (drag.folderMorphId || 0) + 1);
        const draw = (at) => {
          moving.style.setProperty("margin-inline-start", `${at.start}px`, "important");
          moving.style.setProperty("margin-inline-end", `${at.end}px`, "important");
          if (drag) {
            drag.folderShown = at;
          }
        };
        const step = (now) => {
          if (!drag || drag.folder !== moving || drag.folderMorphId !== id || !moving.hasAttribute("zia-morph-folder")) {
            return;
          }
          const t = Math.min(1, (now - began) / 140);
          const k = 1 - Math.pow(1 - t, 3);
          draw({ start: from.start + (to.start - from.start) * k, end: from.end + (to.end - from.end) * k });
          if (t < 1) {
            requestAnimationFrame(step);
          }
        };
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) draw(to);
        else requestAnimationFrame(step);
      };
      const unmorphFolder = (folder) => {
        if (!folder?.hasAttribute?.("zia-morph-folder")) {
          return;
        }
        folder.removeAttribute("zia-morph-folder");
        for (const name of ["margin-inline-start", "margin-inline-end"]) {
          folder.style.removeProperty(name);
        }
      };

      const morphWidth = (folder) => {
        if (drag.folder) {
          morphFolderWidth(folder);
          return;
        }
        const key = folder || "plain";
        // (out of a folder inside another into none waits a moment: passing to the outer
        // one it counted as in none for a sliver and went full width in between)
        if (key !== "plain" || drag.widthKey === "plain") {
          clearTimeout(drag.widthTimer);
          drag.widthTimer = 0;
        } else if (!drag.widthGo && drag.widthKey && drag.widthKey !== "plain" && drag.widthKey.parentElement?.closest?.(FOLDER_SELECTOR)) {
          if (!drag.widthTimer) {
            const current = drag;
            drag.widthTimer = setTimeout(() => {
              if (drag !== current) {
                return;
              }
              drag.widthTimer = 0;
              drag.widthGo = true;
              morphWidth(null);
              drag.widthGo = false;
            }, 200);
          }
          return;
        }
        if (drag.widthKey === key || !drag.bg) {
          return;
        }
        drag.widthKey = key;
        const want = widthFor(folder);
        let start = want ? want.left - drag.bgBox.left : 0;
        let end = want ? drag.bgBox.right - want.right : 0;
        if (Math.abs(start) > 40 || Math.abs(end) > 40) {
          start = 0;
          end = 0;
        }
        const tab = drag.split || drag.tab;
        tab.style.setProperty("--zia-morph-bg-start", `${drag.bgBase.start + start}px`);
        tab.style.setProperty("--zia-morph-bg-end", `${drag.bgBase.end + end}px`);
        tab.style.setProperty("--zia-morph-content-start", `${drag.contentBase.start + start}px`);
        tab.style.setProperty("--zia-morph-content-end", `${drag.contentBase.end + end}px`);
        tab.setAttribute("zia-morph", "true");
      };

      // Dropped, its narrower look goes straight to the row's own and the landing glide
      // starts from there: eased while the glide moved the row the other way (a folder's
      // indent changing), the two didn't cancel and it bulged sideways. Only a width that
      // differs from the one it was let go at eases, by its right edge.
      const MORPH_PROPS = ["--zia-morph-bg-start", "--zia-morph-bg-end", "--zia-morph-content-start", "--zia-morph-content-end"];
      // a dropped tab and, if it's in a split, the split: whichever wears the look
      const morphNodes = (tab) => [tab, tab?.group?.hasAttribute?.("split-view-group") ? tab.group : null];
      const settleDroppedWidth = (tab, width) => {
        const node = morphNodes(tab).find((n) => n?.hasAttribute?.("zia-morph"));
        if (!node) {
          return;
        }
        const split = node.localName === "tab-group";
        const box = split ? node.querySelector(":scope > .tab-group-container") : node.querySelector(".tab-background");
        const content = split ? null : node.querySelector(".tab-content");
        node.setAttribute("zia-morph-done", "true");
        node.removeAttribute("zia-morph");
        for (const name of MORPH_PROPS) {
          node.style.removeProperty(name);
        }
        const own = box?.getBoundingClientRect();
        const off = own && width > 0 ? own.width - width : 0;
        if (Math.abs(off) >= 0.5 && Math.abs(off) < 60) {
          const bs = getComputedStyle(box);
          const cs = content ? getComputedStyle(content) : null;
          node.style.setProperty("--zia-morph-bg-start", bs.marginInlineStart);
          node.style.setProperty("--zia-morph-bg-end", `${(parseFloat(bs.marginInlineEnd) || 0) + off}px`);
          if (cs) {
            node.style.setProperty("--zia-morph-content-start", cs.marginInlineStart);
            node.style.setProperty("--zia-morph-content-end", `${(parseFloat(cs.marginInlineEnd) || 0) + off}px`);
          }
          node.setAttribute("zia-morph", "true");
          box.getBoundingClientRect();
          node.removeAttribute("zia-morph-done");
          easeOutWidth(tab);
          return;
        }
        box?.getBoundingClientRect();
        node.removeAttribute("zia-morph-done");
      };

      const easeOutWidth = (tab) => {
        for (const node of morphNodes(tab)) {
          if (!node?.hasAttribute?.("zia-morph")) {
            continue;
          }
          node.setAttribute("zia-morph-out", "true");
          node.removeAttribute("zia-morph");
          for (const name of MORPH_PROPS) {
            node.style.removeProperty(name);
          }
          clearTimeout(node.ziaMorphOutTimer);
          node.ziaMorphOutTimer = setTimeout(() => node.removeAttribute("zia-morph-out"), 450);
        }
      };

      const newTabOnTop = () => Services.prefs.getBoolPref("zen.view.show-newtab-button-top", false);
      const newTabButton = () =>
        window.gZenWorkspaces?.activeWorkspaceElement?.newTabButton ||
        document.querySelector("#tabs-newtab-button, #vertical-tabs-newtab-button");

      let lastTap = 0;
      // Zia's own tap. Only if haptics are on in Zen; while a drag has them
      // muted, they're let through for just this one.
      const tap = () => {
        const muted = hapticsWereOn !== null;
        if (muted ? !hapticsWereOn : !Services.prefs.getBoolPref(HAPTIC_PREF, true)) {
          return;
        }
        const now = Date.now();
        if (now - lastTap < 140) {
          return;
        }
        lastTap = now;
        try {
          if (muted) {
            Services.prefs.setBoolPref(HAPTIC_PREF, true);
          }
          zenHaptic?.();
        } catch (err) {
          noteError("tab dragging: tap", err);
        } finally {
          if (muted) {
            Services.prefs.setBoolPref(HAPTIC_PREF, false);
          }
        }
      };

      // A Tidy topic occupies consecutive native rows. Use the same row transforms
      // for its heading, its tabs, and the neighboring blocks that make room.
      let topicDrag = null;
      function pinnedDestination(event) {
        const sep = currentSeparator();
        if (!sep) return null;
        const box = sep.getBoundingClientRect();
        const grid = gZenWorkspaces.getCurrentEssentialsContainer?.()?.getBoundingClientRect();
        const section = sep.parentElement;
        if (event.clientX < box.left || event.clientX > box.right ||
            event.clientY > box.bottom || event.clientY < (grid?.bottom || section.getBoundingClientRect().top)) return null;
        for (const {item, mid} of topicDrag.pinnedRows) {
          if (event.clientY < mid) return item;
        }
        return sep;
      }
      const endTopic = commit => {
        const state = topicDrag;
        if (!state) return;
        topicDrag = null;
        if (state.header.hasPointerCapture(state.pointer)) state.header.releasePointerCapture(state.pointer);
        if (!state.started) return;
        state.header.removeAttribute("ztt-pin-preview");
        root.removeAttribute('ztt-moving-topic');
        clearMoved();
        if (commit && state.strip === activeStrip() && state.pin) {
          Promise.resolve().then(() => folder(state.strip,state.header.dataset.zttGroup,state.pin)).catch(report);
        } else if (commit && state.strip === activeStrip() && state.from !== state.to) {
          const blocks = state.blocks.slice();
          blocks.splice(state.to, 0, blocks.splice(state.from, 1)[0]);
          const loose = tabsIn(state.strip).filter(tab => !getState(state.strip).assignments.has(tab));
          moveInOrder(state.strip, loose.concat(blocks.flatMap(block => block.tabs)));
          render(state.strip);
        }
        schedule();
      };
      listen(window, 'pointerdown', event => {
        const header = event.target.closest?.('.ztt-header');
        const strip = activeStrip();
        if (!header || header.parentElement !== strip || event.button || !event.isPrimary ||
            event.target.closest('button,input') || header.querySelector('input')) return;
        const blocks = getState(strip).headers.map(node => {
          const tabs = members(strip, node.dataset.zttGroup);
          const top = node.getBoundingClientRect().top - parseFloat(getComputedStyle(node).marginTop);
          const bottom = (tabs.at(-1) || node).getBoundingClientRect().bottom;
          return {node, tabs, top, bottom};
        });
        const from = blocks.findIndex(block => block.node === header);
        if (from < 0) return;
        const sep = currentSeparator();
        const pinnedRows = Array.from(sep?.parentElement.children || [])
          .filter(el => el.matches('zen-folder,tab-group,.tabbrowser-tab:not([zen-empty-tab])'))
          .map(item => { const r = item.getBoundingClientRect(); return {item,mid:r.top+r.height/2,height:r.height}; })
          .filter(row => row.height > 0);
        topicDrag = {header, strip, blocks, pinnedRows, from, to:from, y:event.clientY, pointer:event.pointerId};
      }, true);
      listen(window, 'pointermove', event => {
        const state = topicDrag;
        if (!state || event.pointerId !== state.pointer) return;
        if (!event.buttons) { endTopic(false); return; }
        const {blocks, from} = state;
        const own = blocks[from];
        const dy = Math.min(blocks.at(-1).bottom - own.bottom, event.clientY - state.y);
        state.pin = pinnedDestination(event);
        if (!state.started) {
          if (Math.abs(dy) < 4) return;
          state.started = true;
          state.header.setPointerCapture(event.pointerId);
          root.setAttribute('ztt-moving-topic', '');
        }
        event.preventDefault();
        let to = from;
        for (const [index, block] of blocks.entries()) {
          const mid = (block.top + block.bottom) / 2;
          if (index < from && own.top + dy < mid) to = Math.min(to,index);
          if (index > from && own.bottom + dy > mid) to = Math.max(to,index);
        }
        state.to = to;
        let opening = false;
        const gap = state.pinnedRows.find(row => row.item === state.pin)?.item.querySelector('.tab-group-label-container')?.getBoundingClientRect().height || own.tabs[0]?.getBoundingClientRect().height || 40;
        for (const {item} of state.pinnedRows) {
          if (item === state.pin) opening = true;
          place(item, opening ? gap : 0, false);
        }
        state.header.toggleAttribute("ztt-pin-preview", !!state.pin);
        const height = blocks[from + 1] ? blocks[from + 1].top - own.top : own.bottom - own.top;
        for (const [index, block] of blocks.entries()) {
          const shift = index === from ? dy : index >= to && index < from ? height :
            index <= to && index > from ? -height : 0;
          for (const row of [block.node, ...block.tabs]) place(row, shift, index === from);
        }
      }, true);
      listen(window, 'pointerup', event => {
        if (topicDrag?.pointer === event.pointerId) {
          topicDrag.pin = pinnedDestination(event);
          endTopic(true);
        }
      }, true);
      for (const type of ['pointercancel', 'blur', 'ZenWorkspacesUIUpdate'])
        listen(window, type, () => endTopic(false));
      listen(window, 'keydown', event => { if (event.key === 'Escape') endTopic(false); }, true);
      onStop(() => endTopic(false));

      const placeSep = (sepDelta) => {
        const sep = currentSeparator();
        if (sep && drag.sepDelta !== sepDelta) {
          drag.sepDelta = sepDelta;
          drag.sepShownY = sepDelta;
          place(sep, sepDelta, false);
          const button = newTabOnTop() ? newTabButton() : null;
          if (button) {
            place(button, sepDelta, false);
          }
        }
      };

      // A dragged folder whose height changed since the list was measured (it shut after
      // the drag began): measured again, or rows moved by the old height and it dropped wrong
      const remeasureFolderDrag = (folder) => {
        const strip = document.getElementById("tabbrowser-tabs");
        // measured where they sit, not partway through sliding back
        strip?.setAttribute("zia-measuring", "true");
        for (const row of drag.rows) {
          if (row.node !== folder && !folder.contains(row.node)) {
            place(row.node, 0, false);
            row.delta = 0;
            row.shownY = 0;
          }
        }
        placeSep(0);
        const kept = folder.style.getPropertyValue("transform");
        const keptPriority = folder.style.getPropertyPriority("transform");
        folder.style.removeProperty("transform");
        // (a real layout read first: the measuring below reads it unflushed)
        folder.getBoundingClientRect();
        const rows = measureRows(null);
        const box = layoutTop(folder);
        folder.style.setProperty("transform", kept, keptPriority);
        strip?.removeAttribute("zia-measuring");
        const mine = rows.find((row) => row.node === folder || folder.contains(row.node));
        const sep = currentSeparator();
        drag.rows = rows;
        drag.origin = box.top;
        drag.height = box.height;
        drag.pitch = box.height;
        drag.index = mine?.index ?? drag.index;
        drag.shifted = new Set();
        drag.sepTop = sep ? sep.getBoundingClientRect().top : null;
      };

      const apply = (dy) => {
        const moving = drag?.moving;
        if (!moving?.isConnected || !drag.rows) {
          return;
        }
        if (drag.folder && !drag.essentials && Math.abs(drag.folder.getBoundingClientRect().height - drag.height) > 3) {
          remeasureFolderDrag(drag.folder);
        }
        // A tab group stays on its side of the separator, stopping there (Zen folders live
        // above it, and a group taken across landed among the pinned ones, #567)
        if (drag.group && drag.sepTop != null) {
          dy = drag.origin > drag.sepTop ? Math.max(dy, drag.sepTop + 1 - drag.origin) : Math.min(dy, drag.sepTop - 1 - drag.height - drag.origin);
        }
        const visualMid = drag.origin + dy + drag.height / 2;
        const originMid = drag.origin + drag.height / 2;
        for (const {node, mid} of drag.headings) {
          const below = mid > originMid;
          const crossed = drag.essentials || drag.splitEssential ? below :
            below ? visualMid > mid : visualMid < mid;
          place(node, crossed ? (below ? -drag.pitch : drag.pitch) : 0, false);
        }
        const lastBottom = drag.rows.reduce((bottom,row) => Math.max(bottom,row.top + row.height), drag.origin + drag.height);
        const viewport = gBrowser.tabContainer.getBoundingClientRect();
        const limit = Math.min(viewport.bottom, lastBottom) - drag.origin - drag.height;
        drag.shownDy = Math.min(dy, Math.max(0, limit));
        place(moving, drag.shownDy, true);

        // New Tab at the foot of the list, when the list closes up (only if the
        // row taken out was above it)
        const shiftNewTab = (by) => {
          if (newTabOnTop()) {
            return;
          }
          const button = newTabButton();
          if (!button) {
            return;
          }
          drag.newTabTop ??= button.getBoundingClientRect().top;
          const want = by && drag.origin < drag.newTabTop ? by : 0;
          if ((drag.newTabShift || 0) !== want) {
            drag.newTabShift = want;
            place(button, want, false);
          }
        };
        // over the essentials (a tab or a split): the list closes up behind it
        if (drag.essentials || drag.splitEssential) {
          for (const row of drag.rows) {
            if (notARow(row)) {
              continue;
            }
            const gone = row.index > drag.index;
            if (gone) {
              drag.shifted.add(row.node);
            } else {
              drag.shifted.delete(row.node);
            }
            const delta = gone ? -drag.pitch : 0;
            if ((row.shownY ?? row.delta) !== delta) {
              row.delta = delta;
              row.shownY = delta;
              place(row.node, delta, false);
            }
          }
          if (drag.sepTop != null) {
            placeSep(drag.origin > drag.sepTop ? 0 : -drag.pitch);
          }
          // (New Tab under the list too: it stayed, leaving a gap above it
          // until the drop)
          shiftNewTab(-drag.pitch);
          drag.target = null;
          setDropSlot(null);
          takeEmptySlot();
          paintFolders();
          return;
        }

        shiftNewTab(0);
        let rowsMoved = false;
        for (const row of drag.rows) {
          if (notARow(row)) {
            continue;
          }
          const was = drag.shifted.has(row.node);
          let shift = false;
          // (a closed folder showing a tab moves aside only once the tab is
          // past its name: over the tab it shows, the tab goes in above it)
          if (row.index > drag.index) {
            shift = visualMid > row.top + (row.head || 0) + (was ? -10 : 8);
          } else if (row.index < drag.index) {
            shift = visualMid < row.top + (row.head || row.height) - (was ? -10 : 8);
          }
          if (shift) {
            drag.shifted.add(row.node);
          } else {
            drag.shifted.delete(row.node);
          }
          const delta = shift ? (row.index > drag.index ? -drag.pitch : drag.pitch) : 0;
          if (row.delta === delta) {
            continue;
          }
          row.delta = delta;
          row.shownY = delta;
          place(row.node, delta, false);
          rowsMoved = true;
        }
        if (drag.sepTop != null && !drag.group) {
          const startedBelow = drag.origin > drag.sepTop;
          let sepDelta = 0;
          // Coming up from below, it's over the separator a fifth of the way into the space that
          // opens (halfway, the gap under the last folder came first and it went in still in the
          // space made for it); back down, just past that point with a few pixels' give.
          const upTo = drag.sepTop + drag.pitch * 0.8 + (drag.sepDelta ? 4 : 0);
          if (startedBelow && visualMid < upTo) {
            sepDelta = drag.pitch;
          } else if (!startedBelow && visualMid > drag.sepTop + 2) {
            sepDelta = -drag.pitch;
          }
          // crossing the separator taps like a row moving does
          if (drag.sepDelta !== sepDelta && (drag.sepDelta || sepDelta)) {
            rowsMoved = true;
          }
          placeSep(sepDelta);
        }
        if (rowsMoved) {
          tap();
        }
        updateTarget(visualMid);
        takeEmptySlot();
        paintFolders();
        morphWidth(drag.target?.folder || null);
      };

      // Dropping into an open empty folder uses its slot as the tab's room: rows after the
      // folder move up by the slot's height too, and the slot fades (chrome.css).
      const takeEmptySlot = () => {
        const folder = drag.target?.folder;
        const pitch = slotPitchOf(folder);
        const headerRow = pitch ? drag.rows.find((row) => row.node === headerOf(folder)) : null;
        const after = (row) => !!headerRow && row.index > headerRow.index && !folder.contains(row.node);
        for (const row of drag.rows) {
          if (notARow(row)) {
            continue;
          }
          const want = (row.delta || 0) + (after(row) ? -pitch : 0);
          if ((row.shownY ?? row.delta ?? 0) !== want) {
            place(row.node, want, false);
          }
          row.shownY = want;
        }
        const sep = currentSeparator();
        if (sep && drag.sepTop != null) {
          const sepAfter = !!headerRow && drag.sepTop > headerRow.top;
          const want = (drag.sepDelta || 0) + (sepAfter ? -pitch : 0);
          if ((drag.sepShownY ?? drag.sepDelta ?? 0) !== want) {
            place(sep, want, false);
            const button = newTabOnTop() ? newTabButton() : null;
            if (button) {
              place(button, want, false);
            }
          }
          drag.sepShownY = want;
        }
      };

      const pinFor = (tab, pinned) => {
        try {
          if (pinned && !tab.pinned) {
            gBrowser.pinTab(tab);
          } else if (!pinned && tab.pinned) {
            gBrowser.unpinTab(tab);
          }
        } catch (err) {
          noteError("tab dragging: pinFor", err);
        }
      };

      const placeBefore = (tab, before) => {
        if (!tab || !before?.parentNode || tab === before) {
          return;
        }
        try {
          if (typeof gBrowser.moveTabBefore === "function" && (gBrowser.isTab(before) || isFolderEl(before) || before.localName === "tab-group")) {
            gBrowser.moveTabBefore(tab, before);
          }
        } catch (err) {
          noteError("tab dragging: placeBefore", err);
        }
        if (tab.nextElementSibling !== before) {
          try {
            // (a tab only: a split's own group is the split itself)
            if (gBrowser.isTab(tab) && tab.group && !before.closest?.("tab-group")) {
              gBrowser.ungroupTab?.(tab);
            }
          } catch (err) {
            noteError("tab dragging: placeBefore (2)", err);
          }
          before.parentNode.insertBefore(tab, before);
        }
      };

      const placeAfter = (tab, after) => {
        try {
          gBrowser.moveTabAfter(tab, after);
        } catch (err) {
          noteError("tab dragging: placeAfter", err);
        }
        if (after.nextElementSibling !== tab) {
          after.after(tab);
        }
      };

      // The row a drop into a folder goes before, as one of the folder's own
      // (none at its end, or when it's closed)
      const nextInFolder = (folder, box, target) => {
        let next = !target.atEnd && !isCollapsed(folder) && target.next && folder.contains(target.next.node) ? target.next.node : null;
        while (next && next.parentElement !== box) {
          next = next.parentElement;
        }
        return next;
      };

      // A split let go in a folder goes where it was shown (beside the hidden tab Zen
      // keeps in an empty one), and a closed folder shuts on it again
      const splitIntoFolder = (split, folder, target) => {
        folder.removeAttribute("zia-drop-slot");
        const box = folder.querySelector(":scope > .tab-group-container");
        if (!box) {
          return;
        }
        const items = [...box.children].filter(
          (item) => item !== split && ((gBrowser.isTab(item) && !item.hasAttribute("zen-empty-tab")) || isFolderEl(item) || item.localName === "tab-group")
        );
        // (a closed folder is marked as showing a tab before the split goes in,
        // as for a tab: with the open tab in the split, Zen opened the folder)
        const shut = isCollapsed(folder);
        const selected = [...split.tabs].some((t) => t.selected);
        const hadActive = folder.hasAttribute("has-active");
        if (shut && !hadActive) {
          folder.setAttribute("has-active", "true");
          folder.activeTabs = [];
        }
        let next = nextInFolder(folder, box, target);
        if (target.first && items.length) {
          next = items[0];
        }
        if (next && next !== split) {
          placeBefore(split, next);
        } else if (items.length) {
          placeAfter(split, items.at(-1));
        } else {
          const empty = box.querySelector(":scope > .tabbrowser-tab[zen-empty-tab]");
          if (empty) {
            placeAfter(split, empty);
          }
        }
        if (split.parentElement !== box) {
          box.appendChild(split);
        }
        if (!shut) {
          return;
        }
        if (!hadActive && !selected) {
          folder.removeAttribute("has-active");
          folder.activeTabs = [];
        }
        try {
          if (!isCollapsed(folder)) {
            folder.collapsed = true;
          } else if (selected) {
            const open = [...split.tabs].filter((t) => t.selected);
            if (!showOpenTabShut(folder, open)) {
              window.gZenFolders?.animateSelect?.(folder);
            }
          } else {
            window.gZenFolders?.on_TabGroupCollapse?.({ target: folder });
          }
        } catch (err) {
          noteError("tab dragging: split into a closed folder", err);
        }
        jumpToEnd(folder);
      };

      // Several selected tabs let go together: the others (folded into the dragged one) land
      // beside it in the order they had, as Firefox lays out a multiple drop. Firefox's own
      // drop placed them by its measure of the list, which Zia's drag had moved, so they
      // went to its end.
      const finishDrop = (tab, target, party = null) => {
        placeDropped(tab, target);
        const at = party?.indexOf(tab) ?? -1;
        if (at < 0 || !tab.isConnected || tab.group?.hasAttribute("split-view-group")) {
          return;
        }
        const pinned = !target.below;
        let anchor = tab;
        for (const other of party.slice(at + 1)) {
          pinFor(other, pinned);
          placeAfter(other, anchor);
          anchor = other;
        }
        anchor = tab;
        for (const other of party.slice(0, at).reverse()) {
          pinFor(other, pinned);
          placeBefore(other, anchor);
          anchor = other;
        }
      };

      const placeDropped = (tab, target) => {
        if (!tab?.isConnected) {
          return;
        }
        // A split crossing the separator: both its tabs pinned (or not), then
        // the split as a whole goes to the spot
        const split = tab.group?.hasAttribute("split-view-group") ? tab.group : null;
        if (split) {
          for (const t of [...split.tabs]) {
            pinFor(t, !target.below);
          }
          // (read after pinning, which can give the split a new group)
          const group = tab.group || split;
          const folder = target.folder?.isConnected && !split.contains(target.folder) ? target.folder : null;
          if (folder) {
            splitIntoFolder(split, folder, target);
            return;
          }
          if (target.next && target.sameNext) {
            placeBefore(group, topLevel(target.next));
          } else if (!target.below && currentSeparator()) {
            placeBefore(group, currentSeparator());
          } else {
            try {
              gBrowser.moveTabToEnd?.(group);
            } catch (err) {
              noteError("tab dragging: finishDrop (split)", err);
            }
          }
          return;
        }
        if (target.below && tab.group && !tab.group.hasAttribute("split-view-group")) {
          try {
            gBrowser.ungroupTab?.(tab);
          } catch (err) {
            noteError("tab dragging: finishDrop", err);
          }
        }
        pinFor(tab, !target.below);
        const folder = target.folder;
        if (folder && isCollapsed(folder)) {
          parkInFolder(tab, folder, target.first);
          return;
        }
        if (folder && target.atEnd) {
          const last = target.prev?.item;
          // (a tab of this folder's own: the row above can be in a folder
          // inside it, which the tab isn't going into)
          if (last && gBrowser.isTab(last) && last.group === folder) {
            placeAfter(tab, last);
          } else {
            folder.addTabs?.([tab]);
          }
          return;
        }
        if (target.next && target.sameNext) {
          placeBefore(tab, topLevel(target.next));
          return;
        }
        if (target.below) {
          try {
            gBrowser.moveTabToEnd?.(tab);
          } catch (err) {
            noteError("tab dragging: finishDrop (2)", err);
          }
          return;
        }
        const sep = currentSeparator();
        if (sep) {
          placeBefore(tab, sep);
        }
      };

      // Zen drops a folder by what's under the pointer, often a closed folder it then nests
      // it in: straight after, it's put where Zia showed it, never inside another folder.
      // (canNest: Zen's own limit on how deep folders go)
      const canNest = (folder, into) => {
        try {
          const inside = into.querySelector(":scope > .tab-group-container > .tabbrowser-tab") || into.labelElement || into;
          return window.gZenFolders?.canDropElement?.(folder, inside) ?? true;
        } catch (err) {
          return true;
        }
      };
      const outermostRow = (node) => {
        let row = topLevel({ node });
        for (let up = row.parentElement?.closest?.(FOLDER_SELECTOR); up; up = up.parentElement?.closest?.(FOLDER_SELECTOR)) {
          row = up;
        }
        return row;
      };
      const finishFolderDrop = (folder, target) => {
        if (!folder?.isConnected || !target) {
          return;
        }
        const nestedIn = folder.parentElement?.closest?.(FOLDER_SELECTOR) || null;
        // (the folder it comes out of, emptied, shuts itself: without the bounce, as when a
        // tab is taken out, or the line below jolted)
        if (nestedIn) {
          nestedIn.ziaLentUntil = Date.now() + 800;
        }
        const into = target.folder?.isConnected && target.folder !== folder && !folder.contains(target.folder) ? target.folder : null;
        if (into) {
          // (no longer empty: its slot went only on the next frame, and the folder opened
          // round both, twice the room, for a moment)
          into.removeAttribute("zia-empty");
          if (isCollapsed(into)) {
            into.ziaDroppedUntil = Date.now() + 500;
          }
          // Dropped where Zia showed it inside a folder: there, before the row
          // it was shown above (at the end, if none or the folder is closed)
          const box = into.querySelector(":scope > .tab-group-container");
          const next = nextInFolder(into, box, target);
          if (next && next !== folder) {
            placeBefore(folder, next);
          } else if (box) {
            const last = [...box.children].reverse().find((item) => item !== folder && (gBrowser.isTab(item) || isFolderEl(item)));
            if (last) {
              placeAfter(folder, last);
            }
            if (folder.parentElement !== box) {
              box.appendChild(folder);
            }
          }
          // a closed one keeps showing only its open tab
          if (isCollapsed(into)) {
            try {
              window.gZenFolders?.on_TabGroupCollapse?.({ target: into });
            } catch (err) {
              noteError("tab dragging: folder into a closed folder", err);
            }
            jumpToEnd(into);
          }
        } else {
          const group = isTabGroup(folder);
          const next = target.next && target.sameNext && (group || !target.below) ? outermostRow(target.next.node) : null;
          if (next && next !== folder && !folder.contains(next)) {
            placeBefore(folder, next);
          } else if (group) {
            // (a group let go below the last row: the end of its own section)
            const section = folder.closest(".zen-workspace-tabs-section") || folder.parentElement;
            const last = [...section.children].reverse().find((item) => item !== folder && !item.hasAttribute?.("zen-empty-tab") && (gBrowser.isTab(item) || isFolderEl(item)));
            if (last && last.nextElementSibling !== folder) {
              placeAfter(folder, last);
            }
          } else if (currentSeparator()) {
            placeBefore(folder, currentSeparator());
          }
          if (folder.parentElement?.closest?.(FOLDER_SELECTOR)) {
            console.warn("[Zia] The dropped folder is still inside another folder");
          }
        }
        // a closed folder it was taken back out of fits its new contents
        if (nestedIn && nestedIn !== folder.parentElement?.closest?.(FOLDER_SELECTOR) && isCollapsed(nestedIn)) {
          try {
            window.gZenFolders?.on_TabGroupCollapse?.({ target: nestedIn });
          } catch (err) {
            noteError("tab dragging: refold folder", err);
          }
        }
      };

      // A folder's animations straight to their last moment (not past it:
      // Zen only leaves its end styles once they've finished)
      const jumpToEnd = (folder) => {
        for (const anim of folder.getAnimations?.({ subtree: true }) || []) {
          try {
            const end = anim.effect?.getComputedTiming?.().endTime;
            if (anim.id !== "zia-land" && end > 1) {
              anim.currentTime = end - 1;
            }
          } catch (err) {
            noteError("tab dragging: folder animations", err);
          }
        }
      };

      // A closed folder showing the open tab just put in. Zen does it (animateSelect) unless
      // every tab in the folder is the open one: then it opened the folder, flashing open and
      // shut, so it's laid out here as Zen would. False when Zen's own way is fine.
      const showOpenTabShut = (folder, open) => {
        const zen = window.gZenFolders;
        const others = (folder.tabs || []).filter(
          (t) => !t.hasAttribute("zen-empty-tab") && !open.includes(t) && !(t.group?.hasAttribute?.("split-view-group") && open.some((o) => o.group === t.group))
        );
        if (others.length || !zen?.setFolderIndentation || folder.group) {
          return false;
        }
        folder.setAttribute("has-active", "true");
        folder.activeTabs = open;
        const container = folder.groupContainer || folder.querySelector(":scope > .tab-group-container");
        container?.removeAttribute("hidden");
        const start = folder.groupStartElement;
        if (start) {
          start.style.marginTop = "0px";
        }
        for (const tab of open) {
          zen.setFolderIndentation([tab], folder, true, false);
        }
        return true;
      };

      const parkInFolder = (tab, folder, first = false) => {
        folder?.removeAttribute("zia-drop-slot");
        if (!tab || !folder) {
          return;
        }
        if (!folder.contains(tab)) {
          const hadActive = folder.hasAttribute("has-active");
          if (!hadActive) {
            folder.setAttribute("has-active", "true");
            folder.activeTabs = [];
          }
          try {
            folder.addTabs?.([tab]);
          } catch (err) {
            console.error("[Zia] Could not add the tab to the folder:", err);
          }
          if (!hadActive && !tab.selected) {
            folder.removeAttribute("has-active");
            folder.activeTabs = [];
          }
        }
        // (let go between its name and the tab it shows: first in it)
        if (first) {
          const container = folder.querySelector(":scope > .tab-group-container");
          const head = [...(container?.children || [])].find(
            (el) => el !== tab && (gBrowser.isTab(el) || isFolderEl(el) || el.localName === "tab-group")
          );
          if (head) {
            placeBefore(tab, head);
          }
        }
        try {
          if (!isCollapsed(folder)) {
            folder.collapsed = true;
          } else if (tab.selected) {
            if (!showOpenTabShut(folder, [tab])) {
              window.gZenFolders?.animateSelect?.(folder);
            }
          } else {
            window.gZenFolders?.on_TabGroupCollapse?.({ target: folder });
          }
        } catch (err) {
          console.error("[Zia] Could not settle the folder:", err);
        }
        // Zen slides the folder's list down into place, so the tab just dropped blinked out
        // and slid in from above: it's where it landed already
        jumpToEnd(folder);
      };

      let proxy = null;
      let proxyLeaveTimer = 0;
      let landingTab = null;
      const PROXY_MS = 140;
      // (back into a row quicker than it became a tile: as long, it lagged)
      const PROXY_BACK_MS = 100;

      // A drag's copies are clones of the tab, so Zen could take one for a real tab: taking
      // an essential out mid-drag, it moved the copy into the list and put it back after the
      // drop (a duplicate row). A copy is live until removed; one put back after is taken out.
      const liveCopies = new WeakSet();
      // Once in the list the copy was in the browser's cached tabs, which a removal doesn't
      // refresh: closing the selected tab then picked the copy, failed, and wouldn't close
      const dropCopy = (node) => {
        liveCopies.delete(node);
        Element.prototype.remove.call(node);
        try {
          gBrowser.tabContainer._invalidateCachedTabs?.();
          gBrowser.tabContainer._invalidateCachedVisibleTabs?.();
        } catch (err) {
          noteError("tab dragging: forget the copy", err);
        }
      };
      const trackCopy = (node) => {
        liveCopies.add(node);
        node.remove = function () {
          dropCopy(this);
        };
        return node;
      };
      // A floating copy of a tab, without the drag's own marks on it (among
      // them what a drop just before left: a lock that pins position, so the
      // copy stuck where it started and the drag was trapped)
      const cloneCopy = (tab) => {
        const copy = trackCopy(tab.cloneNode(true));
        copy.removeAttribute("id");
        copy.setAttribute("ztt-initial", tab.hasAttribute("zen-essential") && tab.getAttribute("ztt-initial") || essentialInitial(tab));
        for (const name of [
          "dragtarget", "pending-drag", "multiselected", "zen-pinned-changed", "folder-active", "zen-folder-active",
          "zia-drop-lock", "zia-landing", "zia-hover-held", "zia-held-pinned", "zia-shift", "zia-dragging", "zia-to-essential",
        ]) {
          copy.removeAttribute(name);
        }
        copy.setAttribute("zia-essential-proxy", "true");
        floatCopy(copy);
        return copy;
      };
      // its size eased (the drag's own rules turn transitions off)
      const easeSize = (node, ms) =>
        node.style.setProperty(
          "transition",
          ["width", "height", "min-width", "max-width", "min-height", "max-height"].map((name) => `${name} ${ms}ms ease-out`).join(", "),
          "important"
        );
      // a copy floating over everything, drawn from its middle (left, top)
      const floatCopy = (node) => {
        node.style.cssText = "";
        for (const [name, value] of [
          ["position", "fixed"],
          ["margin", "0"],
          ["z-index", "2147483646"],
          ["pointer-events", "none"],
          ["transform", "none"],
          ["translate", "-50% -50%"],
        ]) {
          node.style.setProperty(name, value, "important");
        }
      };

      let roomFor = null;
      const makeRoom = (container) => {
        if (roomFor === container) {
          return;
        }
        roomFor?.removeAttribute("zia-make-room");
        roomFor = container || null;
        if (roomFor) {
          roomFor.style.setProperty("--zia-room", `${Math.round(tileSize().height + 8)}px`);
          roomFor.setAttribute("zia-make-room", "true");
        }
      };

      const canBeEssential = (tab) => {
        try {
          return window.gZenPinnedTabManager?.canEssentialBeAdded?.(tab) ?? true;
        } catch (err) {
          return false;
        }
      };

      const tileSize = () => {
        const usable = (el) => {
          const box = el?.isConnected ? window.windowUtils.getBoundsWithoutFlushing(el) : null;
          return box && box.width > 8 && box.height > 8 ? box : null;
        };

        const ownGrid = window.gZenWorkspaces?.getCurrentEssentialsContainer?.();
        const real = [...(ownGrid || document).querySelectorAll(".tabbrowser-tab[zen-essential]:not([zia-essential-proxy])")].find(
          (tile) => usable(tile)
        );
        const realBox = usable(real);
        if (realBox) {
          const bg = usable(real.querySelector(".tab-background")) || realBox;
          const stack = usable(real.querySelector(".tab-stack")) || realBox;
          // a split essential's half, if there's one, measured as it is
          const half = usable(
            (ownGrid || document).querySelector(".tabbrowser-tab[zen-essential][zia-split-tile]:not([zia-essential-proxy]) .zia-split-half")
          );
          return { width: realBox.width, height: bg.height, stackHeight: stack.height, half };
        }
        const box = usable(gBrowser.tabContainer.tabDragAndDrop?._fakeEssentialTab);
        if (box) {
          return { width: box.width, height: box.height };
        }

        const grid = window.gZenWorkspaces?.getCurrentEssentialsContainer?.() || document.getElementById("zen-essentials");
        const width = grid?.clientWidth ? (grid.clientWidth - 3 * 8) / 4 : 56;
        return { width, height: Math.round(width * 0.75) };
      };

      // A split tile's halves fill an essential's inner box less 8px all round; a stand-in
      // isn't that size, so its halves get the real ones' size, centred. With none to measure,
      // worked out as the tile does it: 4:5, at most half its box less 3px (left to the
      // stand-in's own narrower box, each landed 2px wider)
      const fitSplitHalves = (node, stackHeight, half = null, tileWidth = 0) => {
        if (half) {
          node.style.setProperty("--zia-split-half-height", `${half.height}px`);
          node.style.setProperty("--zia-split-half-width", `${half.width}px`);
        } else if (stackHeight > 16) {
          const height = stackHeight - 16;
          node.style.setProperty("--zia-split-half-height", `${height}px`);
          if (tileWidth > 16) {
            node.style.setProperty("--zia-split-half-width", `${Math.min(height * 0.8, (tileWidth - 16) / 2 - 3)}px`);
          }
        }
      };

      const moveProxy = (x, y) => {
        const off = proxy.ziaOffset || { x: 0, y: 0 };
        proxy.style.setProperty("left", `${Math.round(x - off.x)}px`, "important");
        proxy.style.setProperty("top", `${Math.round(y - off.y)}px`, "important");
      };

      // A stand-in changing between a row and a tile hides what's in it while the box morphs
      // (an icon stretched a row wide, a split's icons sliding, looked broken), then blurs
      // into focus once it's the new shape, as Dia's morphs do
      const fadeSplitContent = (node, ms) => {
        if (!node) {
          return;
        }
        const blur = matchMedia("(prefers-reduced-motion: reduce)").matches ? "blur(0px)" : "blur(6px)";
        node.querySelector(".tab-content")?.animate(
          [
            { opacity: 0, filter: blur },
            { opacity: 0, filter: blur, offset: 0.45 },
            { opacity: 1, filter: "blur(0px)" },
          ],
          { duration: Math.round(ms * 1.5), easing: "ease-out" }
        );
      };

      const showProxy = (x, y) => {
        clearTimeout(proxyLeaveTimer);
        if (!proxy) {
          const host = root;
          if (!host || !drag?.tab) {
            return;
          }
          proxy = cloneCopy(drag.tab);
          proxy.setAttribute("zen-essential", "true");
          proxy.setAttribute("pinned", "true");
          proxy.id = "zia-essential-proxy";
          const row = drag.moving.getBoundingClientRect();
          sizeCopy(proxy, row.width, row.height);
          host.appendChild(proxy);
          if (drag.split) {
            // a split starts as its row (both sites, icon and title), and
            // morphs into its tile below
            dressSplitProxy(proxy, drag.tab);
            proxy.removeAttribute("zen-essential");
            proxy.removeAttribute("pinned");
          }
          try {
            window.gZenPinnedTabManager?.setEssentialTabIcon?.(proxy);
          } catch (err) {
            noteError("tab dragging: showProxy", err);
          }
          moveProxy(x, y);

          const box = proxy.getBoundingClientRect();
          proxy.ziaOffset = { x: box.left + box.width / 2 - x, y: box.top + box.height / 2 - y };
        }
        proxy.ziaLeaving = false;
        easeSize(proxy, PROXY_MS);
        if (!drag.moving.hasAttribute("zia-to-essential")) {
          tap();
        }
        drag.moving.setAttribute("zia-to-essential", "true");
        const tile = tileSize();

        // (and back into a tile, headed back over the essentials)
        if (!proxy.hasAttribute("zen-essential")) {
          proxy.setAttribute("zen-essential", "true");
          proxy.setAttribute("pinned", "true");
          if (drag.split) {
            fitSplitHalves(proxy, tile.stackHeight, tile.half, tile.width);
          }
          fadeSplitContent(proxy, PROXY_MS);
        }
        sizeCopy(proxy, tile.width, tile.height);
        moveProxy(x, y);
      };

      const hideProxy = () => {
        if (!proxy || proxy.ziaLeaving || !drag?.moving) {
          return;
        }
        proxy.ziaLeaving = true;
        // (back to its row, not a tile stretched to a row's size, as a split does)
        if (proxy.hasAttribute("zen-essential")) {
          const current = proxy.getBoundingClientRect();
          proxy.removeAttribute("zen-essential");
          proxy.removeAttribute("pinned");
          sizeCopy(proxy, current.width, current.height);
          proxy.getBoundingClientRect();
          fadeSplitContent(proxy, PROXY_BACK_MS);
        }
        // Eased frame by frame to wherever its row is now: Zen slides the list
        // up as its cell in the essentials goes, so the row's place moves as
        // the tile travels (sent to where it was, it landed off and jumped)
        const leaving = proxy;
        const moving = drag.moving;
        const from = leaving.getBoundingClientRect();
        const began = performance.now();
        leaving.style.setProperty("transition", "none", "important");
        const step = (now) => {
          if (proxy !== leaving || !leaving.ziaLeaving) {
            return;
          }
          const t = Math.min(1, (now - began) / PROXY_BACK_MS);
          const k = 1 - (1 - t) * (1 - t);
          const row = moving.getBoundingClientRect();
          const at = (a, b) => a + (b - a) * k;
          sizeCopy(leaving, at(from.width, row.width), at(from.height, row.height));
          moveProxy(at(from.left + from.width / 2, row.left + row.width / 2), at(from.top + from.height / 2, row.top + row.height / 2));
          if (t < 1) {
            requestAnimationFrame(step);
          }
        };
        requestAnimationFrame(step);
        proxyLeaveTimer = setTimeout(() => {
          if (proxy === leaving && leaving.ziaLeaving) {
            leaving.remove();
            proxy = null;
            moving.removeAttribute("zia-to-essential");
          }
        }, PROXY_BACK_MS);
      };

      const landProxy = (tab) => {
        const tile = proxy;
        proxy = null;
        clearTimeout(proxyLeaveTimer);
        if (!tile) {
          return;
        }
        landingTab = tab;
        const done = () => {
          tile.remove();
          tab.removeAttribute("zia-to-essential");
          if (landingTab === tab) {
            landingTab = null;
          }
        };

        const whenEssential = (then, tries = 0) => {
          if (tab.isConnected && tab.hasAttribute("zen-essential")) {
            then();
          } else if (tries < 30) {
            requestAnimationFrame(() => whenEssential(then, tries + 1));
          } else {
            done();
          }
        };
        setTimeout(
          () =>
            whenEssential(() => {
              tab.removeAttribute("zia-essential-enter");
              for (const animation of tab.querySelector(".tab-stack")?.getAnimations?.() || []) {
                if (animation.effect?.getComputedTiming().endTime !== Infinity) {
                  animation.finish();
                }
              }
              const own = tab.getBoundingClientRect();
              const drawn = tab.querySelector(".tab-background")?.getBoundingClientRect() || own;
              const box = { left: own.left, width: own.width, top: drawn.top, height: drawn.height };
              const off = tile.ziaOffset || { x: 0, y: 0 };
              tile.style.setProperty("transition", `all ${PROXY_MS}ms ease-out`, "important");
              tile.style.setProperty("left", `${Math.round(box.left + box.width / 2 - off.x)}px`, "important");
              tile.style.setProperty("top", `${Math.round(box.top + box.height / 2 - off.y)}px`, "important");
              sizeCopy(tile, box.width, box.height);
              setTimeout(done, PROXY_MS + 20);
            }),
          0
        );
      };

      const fitZenSlot = () => fitSlot(gBrowser.tabContainer.tabDragAndDrop?._fakeEssentialTab);
      const fitSlot = (slot) => {
        if (!slot?.isConnected || slot.ziaFitted) {
          return;
        }
        const grid = window.gZenWorkspaces?.getCurrentEssentialsContainer?.();
        const tiles = [...(grid || document).querySelectorAll(".tabbrowser-tab[zen-essential]:not([zia-essential-proxy])")]
          .map((tile) => tile.getBoundingClientRect())
          .filter((box) => box.width > 8);
        if (!tiles.length) {
          return;
        }
        const first = tiles[0];
        const across = tiles.find((box) => Math.abs(box.top - first.top) < 2 && box.left > first.left + 2);
        const down = tiles.find((box) => box.top > first.top + 2);
        const stepX = across ? across.left - first.left : first.width + 7;
        const stepY = down ? down.top - first.top : first.height + (stepX - first.width);
        const own = slot.getBoundingClientRect();
        const width = stepX - 4;
        const height = stepY - 4;
        slot.style.setProperty("width", `${width}px`, "important");
        slot.style.setProperty("min-width", `${width}px`, "important");
        slot.style.setProperty("max-width", `${width}px`, "important");
        slot.style.setProperty("height", `${height}px`, "important");
        slot.style.setProperty("min-height", `${height}px`, "important");
        slot.style.setProperty("margin-inline-end", `${Math.min(0, (own.width || first.width) - width)}px`, "important");
        slot.style.setProperty("margin-block-end", `${Math.min(0, first.height - height)}px`, "important");
        slot.ziaFitted = true;
      };

      // Zen opens a cell for a tab dragged over the essentials but turns a split down there,
      // so Zia opens the same cell for a split essential, where the pointer is (always at the
      // end, the others never moved aside); over a tile it takes that tile's side, swapping.
      let splitSlot = null;
      const holdSplitSlot = (on, point = null) => {
        const grid = on ? window.gZenWorkspaces?.getCurrentEssentialsContainer?.() : null;
        if (!grid) {
          splitSlot?.remove();
          splitSlot = null;
          return;
        }
        if (!splitSlot || splitSlot.parentElement !== grid) {
          splitSlot?.remove();
          splitSlot = document.createXULElement("vbox");
          splitSlot.setAttribute("zia-split-slot", "true");
          grid.appendChild(splitSlot);
          fitSlot(splitSlot);
        }
        if (!point?.x && !point?.y) {
          return;
        }
        const cells = [...grid.children];
        // (not one still sliding: it's drawn where it was, under the pointer,
        // and swapped straight back, over and over)
        const tile = cells.find(
          (cell) =>
            cell !== splitSlot &&
            cell.classList?.contains("tabbrowser-tab") &&
            !cell.hasAttribute("zia-essential-proxy") &&
            !cell.getAnimations().some((a) => a.id === "zia-slot-slide") &&
            inBox(cell, point)
        );
        if (!tile) {
          return;
        }
        // (the tiles slide to their new places with a tap, as Zen's do: they jumped silently)
        const tiles = cells.filter((cell) => cell !== splitSlot && cell.classList?.contains("tabbrowser-tab") && !cell.hasAttribute("zia-essential-proxy"));
        const was = new Map(tiles.map((cell) => [cell, cell.getBoundingClientRect()]));
        if (cells.indexOf(splitSlot) < cells.indexOf(tile)) {
          tile.after(splitSlot);
        } else {
          tile.before(splitSlot);
        }
        tap();
        for (const cell of tiles) {
          const from = was.get(cell);
          const to = cell.getBoundingClientRect();
          const dx = from.left - to.left;
          const dy = from.top - to.top;
          if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
            continue;
          }
          const slide = cell.animate([{ translate: `${dx}px ${dy}px` }, { translate: "0 0" }], { duration: 180, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
          slide.id = "zia-slot-slide";
        }
      };

      const dropProxy = () => {
        clearTimeout(proxyLeaveTimer);
        proxy?.remove();
        proxy = null;
        document.querySelectorAll("[zia-to-essential]").forEach((node) => {
          if (node !== landingTab) {
            node.removeAttribute("zia-to-essential");
          }
        });
      };

      const noLanding = () => {
        const dnd = gBrowser.tabContainer.tabDragAndDrop;
        if (!dnd || dnd._landDragImageOnElements?.ziaQuiet) {
          return;
        }
        const original = dnd._landDragImageOnElements;
        const quiet = function (elements, ...rest) {
          try {
            for (const element of elements || []) {
              const { width, height } = element.getBoundingClientRect();
              this.ZenDragAndDropService.addDropLandingRect(
                Math.round(element.screenX),
                Math.round(element.screenY),
                Math.round(width),
                Math.round(height)
              );
            }
            this._landingElements = [];
          } catch (err) {
            return original?.call(this, elements, ...rest);
          }
          return undefined;
        };
        quiet.ziaQuiet = true;
        dnd._landDragImageOnElements = quiet;
        onStop(() => { if (dnd._landDragImageOnElements === quiet) dnd._landDragImageOnElements = original; });
      };

      // A closed folder whose one showing tab is dragged out is marked, so its room closes
      // smoothly once the tab lands (06: Zen's easing, as the spring's steps stuttered)
      const lendOut = (row) => {
        const home = row?.parentElement?.closest?.("zen-folder");
        if (!home || !isCollapsed(home) || !home.hasAttribute("has-active")) {
          return;
        }
        const showing = (home.activeTabs || []).filter((t) => t?.isConnected);
        if (showing.some((t) => t !== row && !row.contains?.(t))) {
          return;
        }
        home.setAttribute("zia-lent", "true");
      };
      // As the tab leaves, the folder's box is held where it ended through the drag, then
      // eased to its own height (in one step it snapped; held by its whole height it showed
      // more first, opening a little before closing)
      let lentHomes = [];
      const holdLent = () => {
        const homes = lentHomes;
        lentHomes = [];
        for (const home of homes) {
          let held = home.ziaHeldHeight;
          const boxBottom = home.ziaBoxBottom;
          const below = home.ziaBelow;
          home.ziaHeldHeight = home.ziaBoxBottom = home.ziaBelow = null;
          if (!home.isConnected || !(held > 0) || boxBottom == null) {
            continue;
          }
          // held so what's below stays where it was seen
          if (below?.node?.isConnected && !below.node.hasAttribute("zia-landing")) {
            const height = home.getBoundingClientRect().height;
            held = Math.max(0, height + below.top - below.node.getBoundingClientRect().top);
          }
          // its whole height (what's below stays) and its box's bottom where it was: as the tab
          // leaves, padding and inset change, and held by either alone the other moved
          home.style.setProperty("height", `${held}px`, "important");
          const inset = home.getBoundingClientRect().top + held - boxBottom;
          home.style.setProperty("--zia-hold-inset", `${inset}px`);
          home.setAttribute("zia-holding", "true");
          setTimeout(() => {
            home.style.removeProperty("height");
            home.removeAttribute("zia-holding");
            home.style.removeProperty("--zia-hold-inset");
            if (!home.isConnected) {
              return;
            }
            // (closed and showing no tab, it ends as its name alone: Zen is still shutting it,
            // a few pixels taller, so it eased open to that and snapped back)
            const shut = isCollapsed(home) && !home.hasAttribute("has-active") && !home.querySelector(".tabbrowser-tab[selected]");
            const own = shut && headerOf(home) ? headerOf(home).getBoundingClientRect().height : home.getBoundingClientRect().height;
            const ownInset = parseFloat(getComputedStyle(home, "::before").bottom) || 0;
            const timing = { duration: 200, easing: "cubic-bezier(0.25, 1, 0.5, 1)" };
            if (shut) {
              // ...held there until Zen has shut its list (sooner, it showed it part shut)
              const easing = home.animate([{ height: `${held}px` }, { height: `${own}px` }], { ...timing, fill: "forwards" });
              const until = performance.now() + 1000;
              const release = () => {
                const list = home.querySelector(":scope > .tab-group-container");
                const busy = home.getAnimations({ subtree: true }).some((a) => a !== easing && a.playState === "running");
                if (home.isConnected && performance.now() < until && (busy || (list && !list.hidden) || easing.playState === "running")) {
                  requestAnimationFrame(release);
                  return;
                }
                easing.cancel();
              };
              requestAnimationFrame(release);
            } else if (Math.abs(own - held) >= 0.5) {
              home.animate([{ height: `${held}px` }, { height: `${own}px` }], timing);
            }
            if (Math.abs(ownInset - inset) >= 0.5) {
              for (const pseudoElement of ["::before", "::after"]) {
                home.animate([{ bottom: `${inset}px` }, { bottom: `${ownInset}px` }], { ...timing, pseudoElement });
              }
            }
          }, 60);
        }
      };

      // What shows next below a folder (for holdLent: where it was seen)
      const shownAfter = (home) => {
        const strip = document.getElementById("tabbrowser-tabs");
        for (let at = home; at && at !== strip && strip?.contains(at); at = at.parentElement) {
          for (let next = at.nextElementSibling; next; next = next.nextElementSibling) {
            if (next.hasAttribute("zia-landing") || next.hasAttribute("zia-dragging")) {
              continue;
            }
            if (next.getBoundingClientRect().height > 0) {
              return next;
            }
          }
        }
        return null;
      };

      const unlend = () => {
        for (const home of document.querySelectorAll("zen-folder[zia-lent]")) {
          home.ziaLentUntil = Date.now() + 800;
          home.removeAttribute("zia-lent");
          // where its box ended through the drag (its visible bottom), for holdLent
          home.ziaBoxBottom = home.getBoundingClientRect().bottom - (parseFloat(getComputedStyle(home, "::before").bottom) || 0);
          home.ziaHeldHeight = home.getBoundingClientRect().height;
          // and where what's below was seen: the rows round it were shifted to show the tab gone,
          // so held by its height alone, what's below dropped a row first
          const below = shownAfter(home);
          home.ziaBelow = below ? { node: below, top: below.getBoundingClientRect().top } : null;
          lentHomes.push(home);
        }
      };

      const begin = (target, event) => {
        if (!target || target.hasAttribute?.("zen-essential")) {
          return;
        }
        holdSidebarWidth();
        const folder = isFolderEl(target) ? target : null;

        // an open folder that the drag caught before it shut: shut now
        if (folder && !isCollapsed(folder)) {
          snapShut(folder);
        }
        const split = !folder && target.group?.hasAttribute?.("split-view-group") ? target.group : null;
        const moving = folder || split || target;
        // Several tabs selected: the others fold into the one dragged (out of the list, the
        // rows closing up, a count on it), as macOS drags several things; Firefox moves them
        // all on the drop, and they show again there. (Only the dragged one moved, and the
        // rest jumped across on the drop.)
        let companions = 0;
        // (where the dragged tab was before those above it folded away, for the first move to
        // measure how far it rose, #396)
        let foldedFrom = null;
        if (!folder && !split && target.multiselected) {
          const startTop = target.getBoundingClientRect().top;
          const others = gBrowser.selectedTabs.filter((tab) => tab !== target && !tab.hasAttribute("zen-essential") && tab.isConnected);
          // (the rows round them close up smoothly as they fold away, rather than at once)
          const before = new Map();
          if (others.length) {
            for (const item of gBrowser.tabContainer.ariaFocusableItems) {
              const node = nodeToMove(item);
              if (node && node !== target && !others.includes(item) && !before.has(node)) {
                before.set(node, node.getBoundingClientRect().top);
              }
            }
          }
          // (the list let out of its box before they fold: the rows closing up overflow it a
          // moment, it looked scrollable, stayed clipped, and cut the dragged tab off, #396)
          unclipAround(target);
          for (const tab of others) {
            tab.setAttribute("zia-drag-companion", "true");
          }
          if (others.length) {
            target.setAttribute("zia-drag-count", String(others.length + 1));
            companions = others.length;
            foldedFrom = startTop;
            for (const [node, top] of before) {
              const now = node.getBoundingClientRect().top;
              if (Math.abs(top - now) > 0.5) {
                node.animate([{ translate: `0 ${top - now}px` }, { translate: "0 0" }], { duration: 160, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
              }
            }
          }
        }
        const rows = measureRows(folder ? null : target);
        const mine = rows.find((row) => row.item === target || row.node === moving || (folder && folder.contains(row.node)));
        const box = layoutTop(moving);
        const sep = currentSeparator();

        if (sep && !folder && (sep.hidden || sep.closest?.("[hide-separator]") || !sep.getBoundingClientRect().height)) {
          sep.setAttribute("zia-sep-open", "true");
        }
        const sepTop = sep ? sep.getBoundingClientRect().top : null;
        const side = (top) => (sepTop == null ? 0 : top > sepTop ? 1 : -1);
        let pitch = box.height;

        if (!folder && mine) {
          const fits = (gap) => gap > 8 && gap < box.height * 1.6;
          // (only between two side-by-side rows in the same list: a folder's name-to-tab gap and
          // its padding made the step short or long, and everything snapped the rest on the drop)
          const head = (row) => !!row.node?.classList?.contains("tab-group-label-container");
          const pair = (a, b) => !head(a) && !head(b) && a.node?.parentElement === b.node?.parentElement && side(a.top) === side(b.top);
          let best = Infinity;
          for (const row of rows) {
            if (Math.abs(row.index - mine.index) !== 1 || !pair(row, mine)) {
              continue;
            }
            const gap = Math.abs(row.top - mine.top);
            if (fits(gap) && gap < best) {
              best = gap;
            }
          }
          if (best === Infinity) {
            const sorted = [...rows].sort((a, b) => a.top - b.top);
            for (let i = 1; i < sorted.length; i++) {
              if (!pair(sorted[i - 1], sorted[i])) {
                continue;
              }
              const gap = sorted[i].top - sorted[i - 1].top;
              if (fits(gap) && gap < best) {
                best = gap;
              }
            }
          }
          if (best < Infinity) {
            pitch = best;
          }
        }
        document.documentElement.setAttribute("zia-dragging-tab", "true");
        muteZenHaptics(true);

        // a split's row narrows into a folder as a tab does, by its box
        const bg = folder ? null : split ? split.querySelector(":scope > .tab-group-container") : bgOf(target);
        const content = folder || split ? null : contentOf(target);
        const margins = (node) => {
          const style = node ? getComputedStyle(node) : null;
          return { start: parseFloat(style?.marginInlineStart) || 0, end: parseFloat(style?.marginInlineEnd) || 0 };
        };
        unclipAround(moving);
        noLanding();
        drag = {
          split,
          bg,
          content,
          bgBox: bg ? bg.getBoundingClientRect() : null,
          bgBase: margins(bg),
          contentBase: margins(content),
          widthKey: target.group && isFolderEl(target.group) ? target.group : "plain",
          tab: target,
          folder,
          // (a tab group, not a Zen folder: kept to its own side of the separator, #567)
          group: !!folder && isTabGroup(folder),
          moving,
          rows,
          origin: box.top,
          height: box.height,
          index: mine?.index ?? 0,
          pitch,
          shifted: new Set(),
          sepTop,
          sepDelta: 0,
          clientY: event.clientY || pending?.clientY || 0,
          screenY: event.screenY || pending?.screenY || 0,
          companions,
          headings:measureHeadings(),
          foldedFrom,
          space: window.gZenWorkspaces?.activeWorkspace,
        };
        lastDy = 0;
        lendOut(split || (folder ? null : target));
        for (const row of rows) {
          if (row.node === moving || (folder && folder.contains(row.node))) {
            continue;
          }
          place(row.node, 0, false);
        }
      };

      listen(window, 
        "mousedown",
        (event) => {
          if (event.button !== 0) {
            return;
          }
          const tab = tabFromEvent(event);
          pending = tab ? { tab, clientY: event.clientY, screenY: event.screenY } : null;
        },
        true
      );

      // An open folder is shut the moment it starts to be dragged (before the drag begins,
      // its animations jumped to their end so the list is closed at once), and dragged as a
      // closed folder. A plain click still just closes it.
      let snapping = null;
      const snapShut = (folder) => {
        try {
          folder.collapsed = true;
        } catch (err) {
          noteError("tab dragging: shut folder", err);
          return;
        }
        jumpToEnd(folder);
        folder.getBoundingClientRect();
      };
      listen(window, "mousedown", (event) => {
        snapping = null;
        if (event.button !== 0 || !featureOn("dia-tab-drag")) {
          return;
        }
        const label = event.target?.closest?.(".tab-group-label-container");
        const folder = label?.closest?.(FOLDER_SELECTOR);
        if (!folder || label.parentElement !== folder || isCollapsed(folder) || (isTabGroup(folder) && !window.advancedTabGroups)) {
          return;
        }
        snapping = { folder, x: event.screenX, y: event.screenY, shut: false };
      }, true);
      listen(window, "mousemove", (event) => {
        if (!snapping || snapping.shut) {
          return;
        }
        if (!(event.buttons & 1)) {
          snapping = null;
          return;
        }
        if (Math.hypot(event.screenX - snapping.x, event.screenY - snapping.y) < 2) {
          return;
        }
        snapping.shut = true;
        snapShut(snapping.folder);
      }, true);
      // shut already: the click that would have shut it isn't let reopen it
      listen(window, "click", (event) => {
        const shut = snapping?.shut && snapping.folder.contains(event.target);
        snapping = null;
        if (shut) {
          event.stopPropagation();
          event.preventDefault();
        }
      }, true);

      const onStart = (event) => {
        if (inLibrary(event)) {
          return;
        }
        const tab = tabFromEvent(event);
        if (tab) {
          begin(tab, event);
          return;
        }
        const inSidebar = event.target?.closest?.("#navigator-toolbox, #tabbrowser-tabs");
        if (inSidebar && pending?.tab) {
          begin(pending.tab, event);
        }
      };
      listen(window, "dragstart", onStart, true);
      listen(document.getElementById("tabbrowser-tabs"), "dragstart", onStart, true);

      const acceptSplitDrop = (event) => {
        event.preventDefault();
        if (event.dataTransfer) {
          event.dataTransfer.dropEffect = "move";
        }
      };

      const pointerOf = (event) => ({
        x: event.clientX || (event.screenX ? event.screenX - window.mozInnerScreenX : 0),
        y: event.clientY || (event.screenY ? event.screenY - window.mozInnerScreenY : 0),
      });
      const inBox = (element, point) => {
        if (!element) {
          return false;
        }
        const box = element.getBoundingClientRect();
        return box.width > 0 && point.x >= box.left && point.x <= box.right && point.y >= box.top && point.y <= box.bottom;
      };

      const essentialsGrid = () => window.gZenWorkspaces?.getCurrentEssentialsContainer?.() || document.querySelector(".zen-essentials-container");

      // the lowest of a bottom and the essentials' tiles' bottoms
      const tilesBottom = (bottom, grid = essentialsGrid()) => {
        for (const tile of grid?.querySelectorAll(".tabbrowser-tab[zen-essential]:not([zia-essential-proxy])") || []) {
          bottom = Math.max(bottom, tile.getBoundingClientRect().bottom);
        }
        return bottom;
      };
      const essentialsBottom = () => tilesBottom(document.getElementById("zen-essentials")?.getBoundingClientRect().bottom ?? -Infinity);

      // Over the tiles themselves or just below the last row: the essentials' own box stops
      // a little short of it, so a drag along it kept flipping into a list row.
      const overAnyTile = (point) => {
        const grid = essentialsGrid();
        if (!grid) {
          return false;
        }
        const box = grid.getBoundingClientRect();
        return box.width > 0 && point.x >= box.left && point.x <= box.right && point.y >= box.top && point.y <= tilesBottom(box.bottom, grid) + 6;
      };

      const onOver = (event) => {
        if (!drag?.moving?.isConnected) {
          return;
        }
        // The other selected tabs folded away above the dragged one moved it up a row each,
        // and the drag is measured from that much higher, or it hung below the pointer. Read
        // on the first move, not as they fold: in a scrolled list (compact mode's, often) the
        // list scrolls back a moment later to keep the tab in view, and it hadn't really moved
        // (#396). (Less any move already on the tab itself, Firefox's or Zia's.)
        if (drag.foldedFrom != null) {
          const style = getComputedStyle(drag.moving);
          const shifted = new DOMMatrix(style.transform === "none" ? undefined : style.transform).m42 + (parseFloat(style.translate.split(" ")[1]) || 0);
          const lift = drag.foldedFrom - (drag.moving.getBoundingClientRect().top - shifted);
          drag.foldedFrom = null;
          drag.clientY &&= drag.clientY - lift;
          drag.screenY &&= drag.screenY - lift;
        }
        let dy = null;
        if (event.clientY) {
          dy = event.clientY - drag.clientY;
        } else if (event.screenY && drag.screenY) {
          dy = event.screenY - drag.screenY;
        }
        if (dy === null) {
          return;
        }
        lastDy = dy;
        try {
          const over = event.target;
          const point = pointerOf(event);
          const sideBox = document.getElementById("navigator-toolbox")?.getBoundingClientRect();
          drag.away =
            !drag.folder && !!point.x && !over?.closest?.("#navigator-toolbox") && !!sideBox?.width &&
            (point.x < sideBox.left || point.x > sideBox.right);

          if (drag.away) {
            drag.essentials = false;
            setFlag("zia-drag-over-essentials", false);
            hideProxy();
            setDropSlot(null);
            return;
          }
          const essentials =
            document.getElementById("zen-essentials") ||
            window.gZenWorkspaces?.getCurrentEssentialsContainer?.() ||
            document.querySelector(".zen-essentials-container");
          const grid = essentialsGrid();
          const hasTiles = !!grid?.querySelector(".tabbrowser-tab[zen-essential]:not([zia-essential-proxy])");
          const promo = over?.closest?.("zen-essentials-promo") || null;

          // (#zen-essentials can measure 0px tall with the tiles drawn above
          // it, so the space's own grid is measured too)
          let overEssentials =
            !!promo || !!over?.closest?.("#zen-essentials, .zen-essentials-container") || inBox(essentials, point) || inBox(grid, point);

          drag.firstTop = drag.rows?.length ? Math.min(...drag.rows.map((row) => row.top)) : null;
          if (!overEssentials && !hasTiles && drag.firstTop != null) {
            overEssentials = point.y < drag.firstTop + 4;
          }
          drag.hasTiles = hasTiles;
          drag.essentials = !drag.folder && !drag.split && overEssentials && canBeEssential(drag.tab);
          // A two-site split over the essentials becomes a split essential
          // (24b-split-essentials.js)
          drag.splitEssential = !!drag.split && overEssentials && canBecomeSplitEssential(drag.tab);
          if (drag.split && overEssentials && !drag.splitEssential && !drag.splitRefusalNoted) {
            drag.splitRefusalNoted = true;
            console.warn(`[Zia] Split essentials: this split can't go in the essentials: ${splitEssentialRefusal(drag.tab)}`);
          }
          // Zen turns a split down over the essentials, and without a yes
          // there'd be no drop at all
          holdSplitSlot(drag.splitEssential, point);
          if (drag.splitEssential) {
            acceptSplitDrop(event);
            if (point.x) {
              tapOnNewTile(point, null);
              showProxy(point.x, point.y);
            }
          } else if (drag.split) {
            hideProxy();
          }
          // the dragged tab's section stops covering the essentials, so Zen
          // sees them under the pointer and takes the drop
          setFlag("zia-drag-over-essentials", !!(drag.essentials || drag.splitEssential));
          drag.noTiles = drag.essentials && !hasTiles && !promo;
          makeRoom(drag.noTiles ? document.getElementById("zen-essentials") || grid : null);
          if (drag.essentials) {
            fitZenSlot();
          }
          if (drag.essentials && point.x) {
            tapOnTileShift();
            showProxy(point.x, point.y);
          } else if (!drag.essentials && !drag.splitEssential) {
            drag.tileShifts = null;
            hideProxy();
          }
          apply(dy);
        } catch (err) {
          console.error("[Zia] Tab drag failed:", err);
        }
        if (!raf) {
          raf = requestAnimationFrame(() => {
            raf = 0;
            if (drag) {
              apply(lastDy);
            }
          });
        }
      };
      const fixDrop = (event) => {
        const tab = drag?.tab;
        const data = tab?._dragData;
        if (drag?.splitEssential) {
          acceptSplitDrop(event);
          return;
        }
        if (data && drag.essentials && drag.noTiles) {
          data.dropElement = tab;
          data.dropBefore = true;
          return;
        }
        if (!data || !event.clientY || drag.folder || drag.essentials || drag.away) {
          return;
        }
        if (drag.target?.hand) {
          data.dropElement = tab;
          data.dropBefore = true;
          if (typeof tab.elementIndex === "number") {
            data.animDropElementIndex = tab.elementIndex;
          }
          return;
        }
        const y = event.clientY;
        let target = null;
        for (const item of gBrowser.tabContainer.ariaFocusableItems) {
          if (item === tab || item.hasAttribute?.("zen-essential")) {
            continue;
          }
          const node = nodeToMove(item);
          if (!node) {
            continue;
          }
          const box = window.windowUtils.getBoundsWithoutFlushing(node);
          if (y < box.top || y > box.bottom) {
            continue;
          }
          target = { item, node, box };
          break;
        }
        if (!target) {
          return;
        }
        const folder = target.node.closest?.(FOLDER_SELECTOR);
        const header = folder?.querySelector(":scope > .tab-group-label-container");
        const headerBox = header ? window.windowUtils.getBoundsWithoutFlushing(header) : null;
        if (folder && headerBox && y > headerBox.top + headerBox.height * 0.2 && y < headerBox.bottom - headerBox.height * 0.2) {
          const first = folder.tabs?.[0];
          if (first) {
            data.dropElement = first;
            data.dropBefore = true;
            data.animDropElementIndex = first.elementIndex;
            return;
          }
        }
        data.dropElement = target.item;
        data.dropBefore = y < target.box.top + target.box.height / 2;
        if (typeof target.item.elementIndex === "number") {
          data.animDropElementIndex = target.item.elementIndex;
        }
      };

      // Everything let go glides into place the same way: tabs, splits,
      // folders and essentials
      const LAND_MS = 180;
      const LAND_EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)";
      // that curve, for a glide stepped frame by frame
      const landEase = (t) => {
        const bez = (a, b, u) => 3 * a * u * (1 - u) ** 2 + 3 * b * u * u * (1 - u) + u ** 3;
        let lo = 0;
        let hi = 1;
        for (let i = 0; i < 20; i++) {
          const mid = (lo + hi) / 2;
          if (bez(0.2, 0.2, mid) < t) {
            lo = mid;
          } else {
            hi = mid;
          }
        }
        return bez(0.8, 1, (lo + hi) / 2);
      };

      let essentialDrag = null;
      let essentialDropped = null;
      const ESSENTIAL_MS = 140;

      // Zen clears the size and place of every essential when a drop lands:
      // a floating copy with none stretches across the window and falls to
      // its bottom. Whatever of those it loses, it gets straight back.
      const PLACEMENT = [
        "position", "left", "top", "translate", "transform", "margin", "z-index",
        "width", "height", "min-width", "max-width", "min-height", "max-height",
      ];
      const keepPlacement = (node) => {
        if (node.ziaPlacementGuard) {
          return;
        }
        const seen = {};
        const note = () => {
          for (const name of PLACEMENT) {
            const value = node.style.getPropertyValue(name);
            if (value) {
              seen[name] = value;
            }
          }
        };
        note();
        node.ziaPlacementGuard = observeWith(MutationObserver, () => {
          for (const name of PLACEMENT) {
            if (seen[name] && !node.style.getPropertyValue(name)) {
              node.style.setProperty(name, seen[name], "important");
            }
          }
          if (node.style.getPropertyValue("width") !== `${Math.round(node.ziaSize.width)}px`) {
            sizeCopy(node, node.ziaSize.width, node.ziaSize.height);
          }
          note();
        });
        node.ziaPlacementGuard.observe(node, { attributes: true, attributeFilter: ["style"] });
      };

      const sizeCopy = (node, width, height) => {
        node.ziaSize = { width, height };
        for (const [name, value] of [
          ["width", width],
          ["height", height],
          ["min-width", width],
          ["max-width", width],
          ["min-height", height],
          ["max-height", height],
        ]) {
          node.style.setProperty(name, `${Math.round(value)}px`, "important");
        }
        keepPlacement(node);
      };

      const moveCopyTo = (copy, host) => {
        if (!host || copy.parentNode === host) {
          return;
        }
        const box = copy.getBoundingClientRect();
        const want = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
        host.appendChild(copy);
        copy.ziaHostShift = { x: 0, y: 0 };
        copy.style.setProperty("left", `${Math.round(want.x)}px`, "important");
        copy.style.setProperty("top", `${Math.round(want.y)}px`, "important");
        const now = copy.getBoundingClientRect();
        copy.ziaHostShift = { x: now.left + now.width / 2 - want.x, y: now.top + now.height / 2 - want.y };
        copy.style.setProperty("left", `${Math.round(want.x - copy.ziaHostShift.x)}px`, "important");
        copy.style.setProperty("top", `${Math.round(want.y - copy.ziaHostShift.y)}px`, "important");
      };

      const plainTabSize = () => {
        // (a tab on its own in the list: half of a split, or a tab in a
        // folder, is narrower, and an essential dragged off came out that size)
        const sample = [...gBrowser.visibleTabs].find(
          (tab) => !tab.hasAttribute("zen-essential") && !tab.hasAttribute("zen-empty-tab") && !tab.group && tab.getBoundingClientRect().height > 8
        );
        const splitBox = sample
          ? null
          : [...document.querySelectorAll("#tabbrowser-tabs tab-group[split-view-group] > .tab-group-container")].find(
              (box) => !box.closest(FOLDER_SELECTOR) && box.getBoundingClientRect().height > 8
            );
        const bg = (sample?.querySelector(".tab-background") || splitBox)?.getBoundingClientRect();
        if (bg?.width) {
          return { width: bg.width, height: bg.height };
        }
        const sidebar = document.getElementById("navigator-toolbox")?.getBoundingClientRect();
        return { width: (sidebar?.width || 240) - 16, height: 35 };
      };

      const sweepLeftovers = () => {
        const keep = new Set([essentialDrag?.copy, proxy].filter(Boolean));
        for (const node of document.querySelectorAll(".tabbrowser-tab[zia-essential-proxy]")) {
          if (!keep.has(node)) {
            node.remove();
          }
        }
        if (!essentialDrag) {
          for (const tab of document.querySelectorAll(".tabbrowser-tab[zia-essential-dragged]")) {
            tab.removeAttribute("zia-essential-dragged");
            tab.style.visibility = "";
          }
        }
        if (!drag) {
          for (const tab of document.querySelectorAll(".tabbrowser-tab[zia-to-essential]")) {
            if (tab !== landingTab) {
              tab.removeAttribute("zia-to-essential");
            }
          }
        }
      };
      listen(window, "mousedown", () => {
        if (!drag && !essentialDrag) {
          sweepLeftovers();
        }
      }, true);
      observeWith(MutationObserver, (records) => {
        for (const record of records) {
          for (const node of record.addedNodes) {
            if (node.nodeType === 1 && node.hasAttribute("zia-essential-proxy") && !liveCopies.has(node)) {
              dropCopy(node);
            }
          }
        }
      }).observe(document.getElementById("navigator-toolbox") || document.documentElement, { childList: true, subtree: true });

      // Zen's placeholder for a tab dragged over the essentials is a cell, and Zen sets the
      // grid's columns by cell count (eight essentials and it went three to a row) but shifts
      // the tiles by the old columns, past the sidebar's edge: the columns are kept meanwhile.
      observeWith(MutationObserver, (records) => {
        for (const { target: grid, oldValue } of records) {
          const slot = grid.querySelector(":scope > vbox:not(.tabbrowser-tab)");
          if (!slot) {
            continue;
          }
          if (grid.ziaColumns?.slot !== slot) {
            grid.ziaColumns = { slot, value: oldValue };
          }
          const value = grid.ziaColumns.value;
          if (grid.getAttribute("data-hack-type") !== value) {
            if (value === null) {
              grid.removeAttribute("data-hack-type");
            } else {
              grid.setAttribute("data-hack-type", value);
            }
          }
        }
      }).observe(document.getElementById("navigator-toolbox") || document.documentElement, {
        subtree: true,
        attributes: true,
        attributeFilter: ["data-hack-type"],
        attributeOldValue: true,
      });

      listen(window, "mousemove", (event) => {
        if (essentialDrag && event.buttons === 0 && Date.now() - (essentialDrag.startedAt || 0) > 300) {
          endEssentialDrag();
        }
      }, true);

      const onEssentialStart = (event) => {
        const tab = event.target?.closest?.(".tabbrowser-tab[zen-essential]");
        if (!tab || tab.hasAttribute("zia-essential-proxy") || !featureOn("dia-tab-drag") || inLibrary(event)) {
          return;
        }
        essentialDragging = true;
        try {
          event.dataTransfer?.setDragImage(blankImage(), 0, 0);
        } catch (err) {
          noteError("tab dragging: essential drag picture", err);
        }
        if (essentialDrag) {
          essentialDrag.copy?.remove();
          essentialDrag.tab?.removeAttribute("zia-essential-dragged");
          releaseSidebarWidth();
          essentialDrag = null;
        }
        sweepLeftovers();
        const tile = tab.getBoundingClientRect();
        const drawn = tab.querySelector(".tab-background")?.getBoundingClientRect() || tile;
        holdSidebarWidth();
        const copy = cloneCopy(tab);
        sizeCopy(copy, tile.width, drawn.height);
        fitSplitHalves(copy, 0, tab.querySelector(".zia-split-half")?.getBoundingClientRect() || null);
        const point = pointerOf(event);
        copy.style.setProperty("left", `${Math.round(tile.left + tile.width / 2)}px`, "important");
        copy.style.setProperty("top", `${Math.round(drawn.top + drawn.height / 2)}px`, "important");
        root.appendChild(copy);
        try {
          window.gZenPinnedTabManager?.setEssentialTabIcon?.(copy);
        } catch (err) {
          noteError("tab dragging: onEssentialStart", err);
        }
        dressSplitCopy(copy, tab);
        tab.setAttribute("zia-essential-dragged", "true");
        noLanding();

        muteZenHaptics(true);
        // The drag starts on its own tile (which tileUnder skips), so the very
        // first neighbour it moves onto taps too.
        lastTileUnder = tab;
        lastTapPoint = null;
        essentialDrag = {
          tab,
          copy,
          tile: { width: tile.width, height: drawn.height },
          offset: { x: point.x - (tile.left + tile.width / 2), y: point.y - (drawn.top + drawn.height / 2) },
          asTab: false,
          startedAt: Date.now(),
        };
      };

      const tileUnder = (point, skip) => {
        const grid = window.gZenWorkspaces?.getCurrentEssentialsContainer?.();
        for (const tile of (grid || document).querySelectorAll(".tabbrowser-tab[zen-essential]:not([zia-essential-proxy])")) {
          if (tile !== skip && inBox(tile, point)) {
            return tile;
          }
        }
        return null;
      };

      // A tab over the essentials taps as Zen moves the tiles aside for it (by the tile under
      // the pointer, it tapped crossing tiles that didn't move and missed some that did)
      const tapOnTileShift = () => {
        setTimeout(() => {
          if (!drag?.essentials) {
            if (drag) {
              drag.tileShifts = null;
            }
            return;
          }
          const grid = window.gZenWorkspaces?.getCurrentEssentialsContainer?.();
          const tiles = grid ? [...grid.children].filter((cell) => cell.classList?.contains("tabbrowser-tab") && !cell.hasAttribute("zia-essential-proxy") && cell !== drag.tab) : [];
          const shifts = tiles.map((cell) => `${cell.style.transform}${cell.style.translate}`).join("|");
          if (drag.tileShifts != null && shifts !== drag.tileShifts) {
            tap();
          }
          drag.tileShifts = shifts;
        }, 0);
      };

      const OVER_GAP = {};
      let lastTileUnder = null;
      let lastTapPoint = null;
      let lastTapAt = 0;
      const tapOnNewTile = (point, skip) => {
        const tile = tileUnder(point, skip);
        if (tile && tile !== lastTileUnder && lastTileUnder !== null) {
          const box = tile.getBoundingClientRect();
          // half a tile on from the last tap, or long enough after: edge jitter doesn't tap twice,
          // but heading back over the same edge does
          const far =
            !lastTapPoint ||
            Math.abs(point.x - lastTapPoint.x) >= box.width / 2 ||
            Math.abs(point.y - lastTapPoint.y) >= box.height / 2 ||
            Date.now() - lastTapAt > 300;
          if (far) {
            tap();
            lastTapPoint = { x: point.x, y: point.y };
            lastTapAt = Date.now();
          }
        }
        if (tile) {
          lastTileUnder = tile;
          lastTapPoint ||= { x: point.x, y: point.y };
        } else if (skip && inBox(window.gZenWorkspaces?.getCurrentEssentialsContainer?.(), point)) {
          // over the essentials but on no tile (the drop's gap, or its own spot): the next tile is
          // a new one, so moving back onto the tile that just slid aside taps again
          lastTileUnder = OVER_GAP;
        }
      };

      const listRoom = { rows: null, pitch: 0, sep: null, sepTop: null, sepDelta: 0, first: undefined, folder: null };

      // An essential dragged into the list goes into a folder as a tab does:
      // over a closed folder (its end), between the tabs of an open one, or
      // over an open empty one's slot
      const listRoomFolder = (prev, first, y) => {
        if (!prev) {
          return null;
        }
        if (isFolderEl(prev.node) && isCollapsed(prev.node)) {
          // Once in, it stays until its bottom meets the slot's, as a tab's does (it's drawn
          // centred on the pointer, so half a row past the name, plus the gap): at four
          // tenths it left the folder with its bottom still well inside
          const reach = listRoom.folder === prev.node ? listRoom.pitch / 2 + 2 : listRoom.pitch * 0.4;
          return listMid(y) < prev.top + prev.height + reach ? prev.node : null;
        }
        const label = prev.node.classList?.contains("tab-group-label-container");
        const folder = label ? prev.node.parentElement : prev.node.parentElement?.closest?.(FOLDER_SELECTOR);
        if (!folder || !isFolderEl(folder) || isCollapsed(folder)) {
          return null;
        }
        const firstInside = first && folder.contains(first.node) && first.node !== folder.labelContainerElement;
        if (firstInside) {
          return folder;
        }
        if (label && folder.hasAttribute("zia-empty") && y < prev.top + prev.height * 2) {
          return folder;
        }
        return null;
      };
      const markListRoomFolder = (folder) => {
        if (listRoom.folder === folder) {
          return;
        }
        listRoom.folder?.removeAttribute("zia-drop-slot");
        listRoom.folder = folder || null;
        if (folder && essentialDrag?.copy) essentialDrag.copy.style.setProperty("--ztt-folder-inset", essentialDrag.copy.getBoundingClientRect().width * .1 + "px");
        essentialDrag?.copy?.toggleAttribute("ztt-folder-target", !!folder);
        folder?.setAttribute("zia-drop-slot", "true");
      };
      const openListRoom = () => {
        listRoom.headings = measureHeadings();
        listRoom.rows = measureRows(null);
        listRoom.sep = currentSeparator();
        listRoom.sepTop = listRoom.sep ? listRoom.sep.getBoundingClientRect().top : null;
        const side = (top) => (listRoom.sepTop == null ? 0 : top > listRoom.sepTop ? 1 : -1);
        const sorted = [...listRoom.rows].sort((a, b) => a.top - b.top);
        let best = Infinity;
        for (let i = 1; i < sorted.length; i++) {
          const gap = sorted[i].top - sorted[i - 1].top;
          if (side(sorted[i].top) === side(sorted[i - 1].top) && gap > 8 && gap < sorted[i - 1].height * 1.6 && gap < best) {
            best = gap;
          }
        }
        listRoom.pitch = best < Infinity ? best : (sorted[0]?.height || 35) + 4;
        listRoom.sepDelta = 0;
        listRoom.first = undefined;

        listRoom.button = newTabButton();
        // (its bottom: over the last row or the button itself the drop still
        // goes above it, so it makes way; its top left half a gap there)
        listRoom.buttonBottom = listRoom.button?.getBoundingClientRect().bottom ?? null;
        listRoom.buttonDelta = 0;

        unclipAround(listRoom.button || listRoom.rows[listRoom.rows.length - 1]?.node);
      };
      // Where it counts as being, for where it goes: as a dragged tab's, a row past
      // once it's 8px into where that row is shown, pushed down to make room. By the
      // rows' own middles it went into a folder, and out, three quarters of a row early.
      const listAt = (y) => y - (listRoom.pitch / 2 + 8);
      // The cuts a tab coming up past the separator uses, by the dragged row's middle (listAt
      // plus half a tab and 8px): above the separator until four fifths of a tab past its top,
      // and into the closed folder before it only four tenths of a tab into that folder's slot.
      // Cut at the separator's top and the folder's bottom, the place after the last folder
      // (the line right under it) was a sliver: it went into the folder sooner, and skipped it.
      const listMid = (y) => y + listRoom.pitch / 2 + 8;
      const aboveListSep = (y) => listRoom.sepTop != null && listMid(y) < listRoom.sepTop + listRoom.pitch * 0.8;
      const shapeListRoom = (pointerY) => {
        if (!listRoom.rows) {
          openListRoom();
        }
        const y = listAt(pointerY);
        for (const {node, mid} of listRoom.headings) place(node, mid > y ? listRoom.pitch : 0, false);
        let first = null;
        let prev = null;
        for (const row of listRoom.rows) {
          const down = row.mid > y;
          if (down && !first) {
            first = row;
          }
          if (!down) {
            prev = row;
          }
          const delta = down ? listRoom.pitch : 0;
          if (row.delta !== delta) {
            row.delta = delta;
            place(row.node, delta, false);
          }
        }
        if (listRoom.sep) {
          const delta = aboveListSep(y) ? listRoom.pitch : 0;
          if (listRoom.sepDelta !== delta) {
            listRoom.sepDelta = delta;
            place(listRoom.sep, delta, false);
          }
        }
        if (listRoom.button && listRoom.buttonBottom != null) {
          // New Tab at the top (Zen's option) sits under the separator, where nothing drops above
          // it: it moves with the separator rather than making way as at the foot of the list
          const delta = newTabOnTop() ? listRoom.sepDelta : listRoom.buttonBottom > y ? listRoom.pitch : 0;
          if (listRoom.buttonDelta !== delta) {
            listRoom.buttonDelta = delta;
            place(listRoom.button, delta, false);
          }
        }
        // a tap as the rows make way, or going into or out of a folder, as a tab's drag taps
        const folder = listRoomFolder(prev, first, y) || null;
        if (listRoom.first !== undefined && (first !== listRoom.first || folder !== listRoom.folder)) {
          tap();
        }
        listRoom.first = first;
        markListRoomFolder(folder);
        paintFolders({
          rows: listRoom.rows,
          target: { folder: listRoom.folder, slotTop: prev ? prev.top + prev.height : null },
          pitch: listRoom.pitch,
          height: listRoom.pitch,
          skip: () => false,
          outer: null,
          moving: null,
        });
      };
      const closeListRoom = () => {
        if (!listRoom.rows) {
          return;
        }
        for (const row of listRoom.rows) {
          if (row.delta) {
            row.delta = 0;
            place(row.node, 0, false);
          }
        }
        for (const {node} of listRoom.headings) clearNode(node);
        if (listRoom.sep && listRoom.sepDelta) {
          listRoom.sepDelta = 0;
          place(listRoom.sep, 0, false);
        }
        if (listRoom.button && listRoom.buttonDelta) {
          listRoom.buttonDelta = 0;
          place(listRoom.button, 0, false);
        }
        reclip();
        markListRoomFolder(null);
        clearFolderPaint();
        listRoom.rows = null;
        listRoom.first = undefined;
      };

      const dropIntoListRoom = (tab, y) => {
        const first = listRoom.first || null;
        const sep = listRoom.sep;
        const sepTop = listRoom.sepTop;
        const below = sepTop != null && !aboveListSep(listAt(y));
        const folder = listRoom.folder?.isConnected ? listRoom.folder : null;
        markListRoomFolder(null);
        listRoom.rows = null;
        listRoom.first = undefined;
        // Zen takes the tab out of the essentials in its own time after the drop: it's placed
        // once that's happened (or Zia does it after a second), or Zen's own placing (the end
        // of the list) stuck
        return new Promise((resolve) => {
          let frames = 0;
          const whenOut = () => {
            if (tab.isConnected && tab.hasAttribute("zen-essential")) {
              if (++frames < 60) {
                requestAnimationFrame(whenOut);
                return;
              }
              try {
                window.gZenPinnedTabManager?.removeEssentials?.(tab, false);
              } catch (err) {
                noteError("tab dragging: out of the essentials", err);
              }
            }
            place();
            holdDropped();
            resolve();
          };
          requestAnimationFrame(whenOut);
        });

        // It lands under the pointer, which the browser doesn't see until it next moves: its x
        // (or -) is kept on, as for a dropped tab (nothing under the pointer at the drop counts)
        function holdDropped() {
          if (!tab.isConnected || tab.hasAttribute("zen-essential") || tab.group?.hasAttribute("split-view-group")) {
            return;
          }
          try {
            shownAtDrop = { row: null, buttons: [] };
            heldFolder = null;
            heldPinned = null;
            holdFolderHover(tab);
          } catch (err) {
            noteError("tab dragging: hold the dropped essential", err);
          }
        }

        function place() {
          try {
            if (!tab.isConnected || tab.hasAttribute("zen-essential")) {
              return;
            }
            // A split essential: its split goes straight to the spot
            if (tab.ziaSplit?.id) {
              splitBackToList(tab, (group, tabs) => {
                for (const t of tabs) {
                  pinFor(t, !below);
                }
                if (folder) {
                  const inside = first && folder.contains(first.node) ? first : null;
                  splitIntoFolder(group, folder, { first: false, atEnd: !inside, next: inside });
                  return;
                }
                if (first && (below || sepTop == null || first.top < sepTop)) {
                  placeBefore(group, topLevel(first));
                } else if (!below && sep) {
                  placeBefore(group, sep);
                } else {
                  gBrowser.moveTabToEnd?.(group);
                }
              });
              return;
            }
            pinFor(tab, !below);
            if (folder) {
              if (isCollapsed(folder)) {
                parkInFolder(tab, folder);
              } else if (first && folder.contains(first.node) && gBrowser.isTab(first.node)) {
                placeBefore(tab, first.node);
              } else {
                folder.addTabs?.([tab]);
              }
              return;
            }
            if (first && (below || sepTop == null || first.top < sepTop)) {
              placeBefore(tab, topLevel(first));
            } else if (!below && sep) {
              placeBefore(tab, sep);
            } else {
              gBrowser.moveTabToEnd?.(tab);
            }
          } catch (err) {
            console.error("[Zia] Placing the essential in the list failed:", err);
          }
        }
      };

      // The essentials slide from where they were to where a change puts them
      const slideTiles = (change) => {
        const grid = window.gZenWorkspaces?.getCurrentEssentialsContainer?.();
        const tiles = grid ? [...grid.querySelectorAll(":scope > .tabbrowser-tab")].filter((t) => !t.hasAttribute("zia-essential-proxy")) : [];
        const was = new Map(tiles.map((t) => [t, t.getBoundingClientRect()]));
        change();
        for (const t of tiles) {
          const from = was.get(t);
          const to = t.getBoundingClientRect();
          if (!from.width || !to.width) {
            continue;
          }
          const dx = from.left - to.left;
          const dy = from.top - to.top;
          if (Math.abs(dx) >= 0.5 || Math.abs(dy) >= 0.5) {
            t.animate([{ translate: `${dx}px ${dy}px` }, { translate: "0 0" }], { duration: 180, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
          }
        }
      };

      const onEssentialOver = (event) => {
        const state = essentialDrag;
        if (!state?.copy?.isConnected) {
          return;
        }
        const point = pointerOf(event);
        if (!point.x && !point.y) {
          return;
        }
        const sideBox = document.getElementById("navigator-toolbox")?.getBoundingClientRect();
        if (sideBox?.width && !event.target?.closest?.("#navigator-toolbox") && (point.x < sideBox.left || point.x > sideBox.right)) {
          state.copy.setAttribute("zia-over-page","true");
          return;
        }
        state.copy.removeAttribute("zia-over-page");
        tapOnNewTile(point, state.tab);
        const essentials = document.getElementById("zen-essentials");
        const overTiles = !!event.target?.closest?.("#zen-essentials") || inBox(essentials, point) || overAnyTile(point);
        // A row only once below the essentials altogether, so a drag along their last row stays
        // a tile; by their bottom as the drag began (afresh, the grid losing a row moved the line
        // past the pointer and back, flipping between tile and row)
        state.bottom ??= essentialsBottom();
        const asTab = !overTiles && inBox(document.getElementById("navigator-toolbox"), point) && point.y > state.bottom + 8;
        const copy = state.copy;
        if (asTab !== state.asTab) {
          state.asTab = asTab;
          state.rowFor = undefined;
          easeSize(copy, ESSENTIAL_MS);
          // (the others close up behind it out over the list, and open again if it comes back;
          // the only one keeps its cell: given up, the essentials emptied, the list jumped up under
          // the pointer and the row flashed over the first tab)
          const others = [...(essentialsGrid()?.querySelectorAll(".tabbrowser-tab[zen-essential]:not([zia-essential-proxy])") || [])].some((tile) => tile !== state.tab);
          slideTiles(() => state.tab.toggleAttribute("zia-essential-out", asTab && others));
          const current = copy.getBoundingClientRect();
          moveCopyTo(copy, asTab ? document.getElementById("tabbrowser-tabs") || root : root);
          sizeCopy(copy, current.width, current.height);
          copy.getBoundingClientRect();
          for (const name of ["zen-essential", "pinned"]) {
            if (asTab) {
              copy.removeAttribute(name);
            } else {
              copy.setAttribute(name, "true");
            }
          }
          fadeSplitContent(copy, ESSENTIAL_MS);
          const size = asTab ? plainTabSize() : state.tile;
          sizeCopy(copy, size.width, size.height);
          state.offset = asTab ? { x: 0, y: 0 } : state.offset;
        }
        // (as a row, the width a tab takes where it would go: over a folder, its
        // tabs' narrower width, as a dragged tab does; it stayed full width)
        let row = null;
        if (asTab) {
          shapeListRoom(point.y);
          row = widthFor(listRoom.folder);
          if (row && state.rowFor !== (listRoom.folder || "plain")) {
            state.rowFor = listRoom.folder || "plain";
            sizeCopy(copy, row.right - row.left, plainTabSize().height);
          }
        } else {
          closeListRoom();
        }
        const x = !asTab
          ? point.x - state.offset.x
          : row
            ? (row.left + row.right) / 2
            : (document.getElementById("navigator-toolbox")?.getBoundingClientRect().left || 0) + 8 + plainTabSize().width / 2;
        // (as a row, never over the essentials: turned into a row just below
        // them, it's centred on the pointer, and its top half showed over them)
        const y = asTab ? Math.max(point.y, essentialsBottom() + plainTabSize().height / 2 + 2) : point.y - state.offset.y;
        const shift = copy.ziaHostShift || { x: 0, y: 0 };
        copy.style.setProperty("left", `${Math.round(x - shift.x)}px`, "important");
        copy.style.setProperty("top", `${Math.round(y - shift.y)}px`, "important");
      };

      const dropPastLast = (tab, point) => {
        const grid = window.gZenWorkspaces?.getCurrentEssentialsContainer?.();
        const tiles = [...(grid || document).querySelectorAll(".tabbrowser-tab[zen-essential]:not([zia-essential-proxy])")].filter(
          (tile) => tile !== tab && tile.getBoundingClientRect().width > 8
        );
        const last = tiles[tiles.length - 1];
        if (!last || !point) {
          return;
        }
        const box = last.getBoundingClientRect();
        const past = point.y > box.bottom || (point.y >= box.top && point.x > box.left + box.width / 2);
        if (!past) {
          return;
        }
        setTimeout(() => {
          if (tab.isConnected && tab.hasAttribute("zen-essential") && last.isConnected && tab.previousElementSibling !== last) {
            try {
              gBrowser.moveTabAfter(tab, last);
            } catch (err) {
              console.error("[Zia] Could not move the essential to the end:", err);
            }
          }
        }, 0);
      };

      const endEssentialDrag = (event) => {
        const state = essentialDrag;
        releaseSidebarWidth();
        essentialDrag = null;
        essentialDragging = false;
        if (!state) {
          return;
        }
        if (event?.type === "drop") {
          const point = pointerOf(event);
          const essentials = document.getElementById("zen-essentials");
          if (inBox(essentials, point) || event.target?.closest?.("#zen-essentials") || overAnyTile(point)) {
            state.asTab = false;
            dropPastLast(state.tab, point);
          } else if (state.asTab && listRoom.rows) {
            state.placing = dropIntoListRoom(state.tab, point.y);
          }
        }
        if (listRoom.rows) {
          closeListRoom();
        }
        muteZenHaptics(false);
        essentialDropped = event?.type === "drop" ? state.tab : null;
        setTimeout(sweepLeftovers, 400);
        const copy = state.copy;
        const reveal = (now = false) => {
          state.tab.style.visibility = "";
          state.tab.removeAttribute("zia-essential-dragged");
          state.tab.removeAttribute("zia-essential-out");
          // (dropped into the list, the tab's already showing in its place:
          // the copy goes with it, not a frame later)
          if (now === true) {
            copy.remove();
          } else {
            requestAnimationFrame(() => copy.remove());
          }
        };
        // Dropped among the essentials: the tile glides from where it was let
        // go into its place (once that's settled) before the real one shows
        const glideHome = () => {
          // dropped into the list: it shows once it's in its place, not first
          // wherever Zen put it
          if (state.placing) {
            state.placing.finally(() => reveal(true));
            return;
          }
          if (!event || state.asTab || !copy.isConnected || !state.tab.isConnected ||
              !state.tab.hasAttribute("zen-essential") || matchMedia("(prefers-reduced-motion: reduce)").matches) {
            reveal();
            return;
          }
          // Heads for wherever the tile is on each frame, so it still lands
          // right while Zen is sliding the tiles into their new order
          const shift = copy.ziaHostShift || { x: 0, y: 0 };
          // from where it was last drawn under the pointer (its left and top
          // are its centre), not wherever Zen's drop may have knocked it
          const from = copy.getBoundingClientRect();
          const left = parseFloat(copy.style.getPropertyValue("left"));
          const top = parseFloat(copy.style.getPropertyValue("top"));
          const start = Number.isFinite(left) && Number.isFinite(top)
            ? { x: left + shift.x, y: top + shift.y }
            : { x: from.left + from.width / 2, y: from.top + from.height / 2 };
          // the same glide as a dropped tab or folder (LAND_MS, LAND_EASE)
          const began = performance.now();
          copy.style.setProperty("transition", "none", "important");
          const follow = () => {
            if (!copy.isConnected || !state.tab.isConnected) {
              reveal();
              return;
            }
            const box = state.tab.getBoundingClientRect();
            const drawn = state.tab.querySelector(".tab-background")?.getBoundingClientRect() || box;
            const to = { x: box.left + box.width / 2, y: drawn.top + drawn.height / 2 };
            const t = Math.min(1, (performance.now() - began) / LAND_MS);
            const ease = landEase(t);
            copy.style.setProperty("left", `${Math.round(start.x + (to.x - start.x) * ease - shift.x)}px`, "important");
            copy.style.setProperty("top", `${Math.round(start.y + (to.y - start.y) * ease - shift.y)}px`, "important");
            if (t < 1) {
              requestAnimationFrame(follow);
            } else {
              reveal();
            }
          };
          requestAnimationFrame(follow);
        };
        setTimeout(glideHome, 0);
      };

      listen(window, "dragstart", onEssentialStart, true);
      listen(window, "dragover", onEssentialOver, true);
      listen(window, "drop", endEssentialDrag, true);
      listen(window, "dragend", endEssentialDrag, true);

      listen(window, "dragover", onOver, true);
      listen(document.getElementById("tabbrowser-tabs"), "dragover", onOver, true);
      listen(window, "dragover", fixDrop);
      // Firefox moves the dragged tab too, after Zia, and stops it at the last tab: under the
      // list its move won, two of the tab showing. Zia's move is put back after Firefox's go.
      listen(window, "dragover", () => {
        const moving = drag?.moving;
        if (!moving?.isConnected || drag.away || drag.essentials || drag.splitEssential) {
          return;
        }
        if (moving.style.getPropertyPriority("transform") !== "important") {
          place(moving, drag.shownDy ?? 0, true);
        }
      });

      listen(window, 
        "drop",
        (event) => {
          const tab = drag?.tab;
          heldFolder = null;
          heldPinned = null;

          if (tab && drag.splitEssential) {
            event.preventDefault();
            event.stopPropagation();
            let essential = null;
            // (it goes where the cell was opened for it)
            const before = splitSlot?.isConnected ? splitSlot.nextElementSibling : null;
            try {
              essential = addSplitToEssentials(tab);
              if (essential && before?.hasAttribute?.("zen-essential") && before !== essential) {
                gBrowser.moveTabBefore(essential, before);
              }
            } catch (err) {
              console.error("[Zia] Could not make a split essential:", err);
            }
            if (essential) {
              // hidden where it lands until the tile flying to it gets there
              essential.setAttribute("zia-to-essential", "true");
              landProxy(essential);
            } else {
              hideProxy();
            }
            return;
          }
          if (tab && !drag.essentials && !drag.folder && !drag.split) {
            const point = pointerOf(event);
            const over = event.target;
            if (
              over?.closest?.("#zen-essentials, .zen-essentials-container") ||
              inBox(document.getElementById("zen-essentials"), point) ||
              inBox(window.gZenWorkspaces?.getCurrentEssentialsContainer?.(), point)
            ) {
              drag.essentials = true;
              drag.target = null;
            }
          }
          if (tab && drag.essentials) {
            if (drag.noTiles) {
              setTimeout(() => {
                try {
                  window.gZenPinnedTabManager?.addToEssentials?.(tab);
                } catch (err) {
                  console.error("[Zia] Could not add the first essential:", err);
                }
              }, 0);
            }
            landProxy(tab);
          } else if (drag?.folder && !drag.away && drag.target) {
            const folder = drag.folder;
            const target = drag.target;
            if (target.below && folder.localName === "zen-folder") {
              event.preventDefault();
              event.stopPropagation();
              const strip = activeStrip();
              const tabs = [...folder.tabs].filter(tab => !tab.closing && !tab.hasAttribute("zen-empty-tab"));
              if (!strip || !tabs.length || folder.isLiveFolder || folder.querySelector("zen-folder,tab-group")) return;
              const name = uniqueName(strip, (folder.label || "New Group").slice(0,60));
              const next = target.sameNext && target.next?.node;
              setTimeout(() => {
                if (!folder.isConnected || strip !== activeStrip()) return;
                try {
                  for (const tab of tabs) {
                    gBrowser.ungroupTab(tab);
                    if (tab.pinned) gBrowser.unpinTab(tab);
                    if (next?.parentElement === strip && gBrowser.isTab(next)) gBrowser.moveTabBefore(tab,next);
                    else gBrowser.moveTabToEnd(tab);
                  }
                  for (const placeholder of [...folder.tabs].filter(t => t.hasAttribute("zen-empty-tab"))) {
                    gBrowser.removeTab(placeholder, {animate:false});
                  }
                  assignManual(strip,tabs,name);
                } catch (error) { report(error); }
              }, 0);
              return;
            }
            // Into a closed folder Zia puts it there, Zen's drop not run: that opened the folder,
            // the dropped one missing for a frame, and left it open. Into an empty one too: Zen
            // moved it back out under the folder after Zia had put it in, and the folder, emptied,
            // shut over the gap
            if (target.folder && (isCollapsed(target.folder) || target.folder.hasAttribute("zia-empty")) && target.folder !== folder && !folder.contains(target.folder)) {
              event.preventDefault();
              event.stopPropagation();
            }
            // (the folder it goes into keeps its hover box too, as for a tab:
            // it went blank until the pointer next moved)
            heldFolder = target.folder || null;
            pendingFinish = true;
            setTimeout(() => {
              try {
                finishFolderDrop(folder, target);
                // (held where it was let go in the same step, as a tab is: a frame showed it at its
                // new place still shifted by the drag, up and back down)
                repinLanding?.();
              } catch (err) {
                console.error("[Zia] Folder drop failed:", err);
              }
              pendingFinish = false;
            }, 0);
          } else if (tab && !drag.folder && !drag.away && drag.target?.hand) {
            const target = drag.target;
            // Zia places it, Zen's drop not run: told to drop it where it was, Zen still took a tab
            // in a closed folder out of it for a frame (its favicon flashing left of where it lands).
            // Several selected go with it (finishDrop), in the order they're in now.
            const party = tab.multiselected
              ? gBrowser.selectedTabs.filter((t) => t.isConnected && !t.hasAttribute("zen-essential") && !t.group?.hasAttribute?.("split-view-group"))
              : null;
            event.preventDefault();
            event.stopPropagation();
            heldFolder = target.folder || null;
            heldPinned = !target.below;
            pendingFinish = true;
            // Put in place as the drop settles, in the same step (see settle): a moment later, the
            // room made for it in a folder had closed and it showed outside, full width, for a frame
            const run = () => {
              try {
                finishDrop(tab, target, party);
                syncDroppedTopic(party || [tab]);
                // (its width put right as it moves: the row's new width showed
                // first otherwise, 14px narrower)
                refitLanding?.();
                repinLanding?.();
                refitHeld?.();
              } catch (err) {
                console.error("[Zia] Tab drop failed:", err);
              }
              pendingFinish = false;
            };
            finishNow = run;
            setTimeout(() => {
              if (finishNow === run) {
                finishNow = null;
                run();
              }
            }, 0);
          }
          const dnd = gBrowser.tabContainer.tabDragAndDrop;
          if (dnd) {
            dnd._dontAnimateTabMove = true;
          }
        },
        true
      );
      let lockTimer = 0;
      let blockAnimUntil = 0;
      const ui = window.gZenUIManager;
      if (ui?.elementAnimate && !ui.elementAnimate.ziaTabLock) {
        const originalAnimate = ui.elementAnimate;
        const wrappedAnimate = function (ele, ...args) {
          if (Date.now() < blockAnimUntil && ele?.closest?.("#tabbrowser-tabs")) {
            ele.style.removeProperty("transform");
            return Promise.resolve();
          }
          return originalAnimate.call(ui, ele, ...args);
        };
        wrappedAnimate.ziaTabLock = true;
        ui.elementAnimate = wrappedAnimate;
        onStop(() => { if (ui.elementAnimate === wrappedAnimate) ui.elementAnimate = originalAnimate; });
      }
      const MOVEMENT = new Set(["transform", "translate"]);
      const movesOnly = (anim) => {
        try {
          const frames = anim.effect?.getKeyframes?.() || [];
          const props = new Set();
          for (const frame of frames) {
            for (const key of Object.keys(frame)) {
              if (!["offset", "computedOffset", "easing", "composite"].includes(key)) {
                props.add(key);
              }
            }
          }
          return props.size > 0 && [...props].every((prop) => MOVEMENT.has(prop));
        } catch (err) {
          return false;
        }
      };

      const heldWidths = new Set();
      function holdSidebarWidth() {
        const space = gZenWorkspaces.activeWorkspaceElement;
        if (!space || heldWidths.size) return;
        const sections = [space, ...space.querySelectorAll('.zen-workspace-pinned-tabs-section, .zen-workspace-normal-tabs-section')];
        const widths = sections.map(section => section.getBoundingClientRect().width);
        sections.forEach((section, i) => {
          if (!widths[i]) return;
          section.style.setProperty('--ztt-drag-width', widths[i] + 'px');
          section.setAttribute('ztt-drag-width', '');
          heldWidths.add(section);
        });
      }
      function releaseSidebarWidth() {
        for (const section of heldWidths) {
          section.removeAttribute('ztt-drag-width');
          section.style.removeProperty('--ztt-drag-width');
        }
        heldWidths.clear();
      }
      onStop(releaseSidebarWidth);
      const unclipped = [];
      const unclipAround = (node) => {
        const stop = document.getElementById("navigator-toolbox");
        const remember = (el, props) => {
          unclipped.push([el, props.map((prop) => [prop, el.style.getPropertyValue(prop), el.style.getPropertyPriority(prop)])]);
        };
        // (every ancestor read first, then the clipping ones changed: a change before the
        // next read made the browser lay the sidebar out again for each one, slow on
        // Windows at the start of every drag, #566)
        const clipping = (el) => {
          const style = getComputedStyle(el);
          const clips =
            ["hidden", "auto", "scroll", "clip"].includes(style.overflowY) || /paint|strict|content/.test(style.contain);
          const scrolls = el.scrollTop > 0 || el.scrollHeight > el.clientHeight + 1;
          return clips && !scrolls;
        };
        const lifted = [];
        let el = node?.parentNode;
        while (el && el !== stop && el !== document.documentElement) {
          if (el.nodeType === 1) {
            lifted.push(el);
            const inner = el.shadowRoot?.querySelector?.('[part~="scrollbox"]');
            if (inner) {
              lifted.push(inner);
            }
          }
          el = el.parentNode || el.host;
        }
        const props = ["overflow", "overflow-x", "overflow-y", "contain"];
        // (never a scroll box, such as the tab list's own: let out, Firefox builds it and every
        // row in it again, and once more as it's put back, about 1,000 rows' worth at the start
        // of every drag and as many at the drop, the drag starting late on Windows; #566)
        const scrollBox = (style) => ["hidden", "auto", "scroll"].includes(style.overflowY) || ["hidden", "auto", "scroll"].includes(style.overflowX);
        for (const each of lifted.filter(clipping).filter((el) => !scrollBox(getComputedStyle(el)))) {
          remember(each, props);
          for (const prop of props) {
            each.style.setProperty(prop, prop === "contain" ? "none" : "visible", "important");
          }
        }
      };
      const reclip = () => {
        while (unclipped.length) {
          const [el, props] = unclipped.pop();
          for (const [prop, value, priority] of props) {
            if (value) {
              el.style.setProperty(prop, value, priority);
            } else {
              el.style.removeProperty(prop);
            }
          }
        }
      };

      // What's just dropped keeps its hover look (box, x): the drag's look ends a frame before
      // the browser sees the pointer still over it, and Firefox forgets what's hovered until the
      // pointer next moves (Zen shows x and - only on hover), so what showed is noted and kept
      let shownAtDrop = { row: null, buttons: [] };
      listen(window, "drop", (event) => {
        shownAtDrop = { row: null, buttons: [] };
        const point = pointerOf(event);
        const row = document.elementsFromPoint(point.x, point.y)
          .map((el) => el.closest?.(".tabbrowser-tab:not([zia-essential-proxy]), zen-folder, tab-group"))
          .find(Boolean);
        if (!row) {
          return;
        }
        // a split shows the x of both its tabs while it's hovered
        const split = row.closest?.("tab-group[split-view-group]");
        const rows = split ? [...split.querySelectorAll(".tabbrowser-tab")] : [row];
        const buttons = rows.flatMap((one) => [...one.querySelectorAll(".tab-close-button, .tab-reset-button")]).filter((button) => {
          if (!rows.includes(button.closest(".tabbrowser-tab, zen-folder, tab-group"))) {
            return false;
          }
          const box = button.getBoundingClientRect();
          return box.width > 0 && getComputedStyle(button).display !== "none";
        });
        shownAtDrop = { row: row.closest(".tabbrowser-tab") || null, buttons };
      }, true);

      const holdFolderHover = (folder) => {
        const held = [folder];
        // a tab dropped into a folder: the folder keeps its hover box too
        if (heldFolder?.isConnected && !held.includes(heldFolder)) {
          held.push(heldFolder);
        }
        heldFolder = null;
        if (shownAtDrop.row && shownAtDrop.row !== folder && shownAtDrop.row.isConnected) {
          held.push(shownAtDrop.row);
        }
        let buttons = shownAtDrop.buttons.filter((button) => button.isConnected);
        shownAtDrop = { row: null, buttons: [] };
        // The dragged tab lets the pointer through, so its own button wasn't noted: dropped into
        // a folder it showed nothing until the browser found the pointer on it (a split: both
        // its tabs' x, as it shows both while hovered)
        const dropSplit = gBrowser.isTab(folder) && folder.group?.hasAttribute?.("split-view-group") ? folder.group : null;
        if (gBrowser.isTab(folder) && !buttons.some((button) => (dropSplit || folder).contains(button))) {
          for (const tab of dropSplit ? [...dropSplit.querySelectorAll(".tabbrowser-tab")] : [folder]) {
            const own = tab.querySelector(tab.pinned ? ".tab-reset-button" : ".tab-close-button");
            if (own) {
              buttons.push(own);
            }
          }
        }
        for (const node of held) {
          node.setAttribute("zia-hover-held", "true");
        }
        for (const button of buttons) {
          button.setAttribute("zia-held-shown", "true");
        }
        // A tab dropped into a folder is pinned there and shows a - where it had an x (the other
        // way pulled out): swapped as soon as it's let go, not when the pointer next moved
        refitHeld = (pinned) => {
          buttons = buttons.map((button) => {
            const tab = button.closest(".tabbrowser-tab");
            const want = pinned ?? tab?.pinned;
            tab?.toggleAttribute("zia-held-pinned", !!want && !tab.pinned);
            const kind = want ? ".tab-reset-button" : ".tab-close-button";
            const right = tab?.isConnected && !button.matches(kind) ? tab.querySelector(kind) : null;
            if (!right) {
              return button;
            }
            button.removeAttribute("zia-held-shown");
            right.setAttribute("zia-held-shown", "true");
            return right;
          });
        };
        if (heldPinned != null) {
          refitHeld(heldPinned);
        }
        heldPinned = null;
        let timer = 0;
        // Over a node by where the pointer is, not :hover: Zen tidies a folder just after a drop
        // and Firefox forgets the hover, so a move then let go and the folder's box flashed
        const over = (node, event) => {
          if (node.matches(":hover")) {
            return true;
          }
          if (!event?.clientX && !event?.clientY) {
            return false;
          }
          const box = node.getBoundingClientRect();
          return event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
        };
        const check = (event) => {
          if (!held.some((node) => node.isConnected && over(node, event))) {
            release();
            return;
          }
          // a button is held only while the pointer is on its own tab (on to the next tab in the
          // same folder, both showed their -)
          buttons = buttons.filter((button) => {
            const tab = button.closest(".tabbrowser-tab");
            // (a split's x's are held while it's hovered, either tab)
            const host = tab?.closest("tab-group[split-view-group]") || tab;
            if (host && over(host, event)) {
              return true;
            }
            button.removeAttribute("zia-held-shown");
            tab?.removeAttribute("zia-held-pinned");
            if (tab && held.includes(tab)) {
              tab.removeAttribute("zia-hover-held");
            }
            return false;
          });
        };
        const release = () => {
          if (releaseHeld === release) {
            releaseHeld = null;
          }
          refitHeld = null;
          for (const node of held) {
            node.removeAttribute("zia-hover-held");
          }
          for (const button of buttons) {
            button.removeAttribute("zia-held-shown");
            button.closest(".tabbrowser-tab")?.removeAttribute("zia-held-pinned");
          }
          window.removeEventListener("mousemove", check, true);
          clearTimeout(timer);
        };
        listen(window, "mousemove", check, true);
        timer = setTimeout(release, 4000);
        releaseHeld?.();
        releaseHeld = release;
      };

      let droppedFrom = null;
      let isRealDrop = false;
      let pendingFinish = false;
      let heldFolder = null;
      let repinLanding = null;
      let refitLanding = null;
      let finishNow = null;
      let refitHeld = null;
      let heldPinned = null;
      let dragGen = 0;
      let releaseHeld = null;
      listen(window, "drop", () => (isRealDrop = true), true);
      listen(window, "dragstart", () => (isRealDrop = false), true);
      // Held over a space's icon, Zen switches to that space mid-drag, and the rest of the drag
      // is Zen's: Zia's moved rows were the space it left, hidden now, and it went on steering the
      // drop by them (fixDrop), so the tab landed back in that space, pinned there (#488). Zen
      // announces no switch (ZenWorkspacesUIUpdate only comes at start-up), so it's seen as the
      // drag goes on, and Zia lets go: its rows put back and its steering stopped, Zen's drop
      // left as it is. (Not settle(): that turns Zen's drop off, and in 2.113.0 the tab went
      // back where it was.)
      const releaseToZen = (event) => {
        const tab = drag.split || drag.tab;
        zenDragImage = true;
        try {
          const image = gBrowser.tabContainer.tabDragAndDrop?.originalDragImageArgs;
          if (image?.length) {
            event.dataTransfer?.updateDragImage(...image);
          }
        } catch (err) {
          noteError("tab dragging: Zen's picture back", err);
        }
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        clearMoved();
        clearFolderPaint();
        reclip();
        holdSplitSlot(false);
        root.removeAttribute("zia-drag-over-essentials");
        document.querySelectorAll("[zia-sep-open]").forEach(sep => sep.removeAttribute("zia-sep-open"));
        drag.moving?.removeAttribute("zia-drag-away");
        if (drag.folder) {
          unmorphFolder(drag.folder);
        }
        easeOutWidth(tab);
        makeRoom(null);
        dropProxy();
        releaseSidebarWidth();
        drag = null;
        pending = null;
        document.documentElement.removeAttribute("zia-dragging-tab");
      };
      // A tab (or a split) goes with the drag instead: moved into the space now showing, and
      // dragged on there as before, under the pointer and inside the sidebar until pulled out to
      // the page. Handed to Zen, its loose picture went anywhere, over the split's panes too.
      // (A folder, a tab in one, or several at once: still handed to Zen.)
      const followIntoSpace = (event) => {
        const { tab, folder, companions } = drag;
        const space = window.gZenWorkspaces?.activeWorkspace;
        const group = tab?.group;
        if (folder || companions || !tab?.isConnected || (group && !group.hasAttribute?.("split-view-group")) || !space) {
          releaseToZen(event);
          return;
        }
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        clearMoved();
        clearFolderPaint();
        reclip();
        holdSplitSlot(false);
        root.removeAttribute("zia-drag-over-essentials");
        document.querySelectorAll("[zia-sep-open]").forEach(sep => sep.removeAttribute("zia-sep-open"));
        drag.moving?.removeAttribute("zia-drag-away");
        easeOutWidth(drag.split || tab);
        makeRoom(null);
        dropProxy();
        releaseSidebarWidth();
        drag = null;
        pending = null;
        try {
          window.gZenWorkspaces.moveTabsToWorkspace([tab], space);
        } catch (err) {
          noteError("tab dragging: follow into space", err);
          document.documentElement.removeAttribute("zia-dragging-tab");
          return;
        }
        begin(tab, event);
        if (drag) {
          // (measured from the tab's new place, at the end of the list: under the pointer now)
          const box = (drag.moving || tab).getBoundingClientRect();
          drag.clientY = box.top + box.height / 2;
          drag.screenY = 0;
        }
      };
      listen(window, 
        "dragover",
        (event) => {
          if (drag && drag.space !== window.gZenWorkspaces?.activeWorkspace) {
            followIntoSpace(event);
          }
        },
        true
      );

      const settle = () => {
        const droppedTab = drag?.tab || essentialDropped || null;
        if (drag?.moving && !drag.essentials && !drag.away && droppedFrom === null && isRealDrop) {
          const from = drag.moving.getBoundingClientRect();
          // (and where its background showed: a tab over a folder is drawn
          // narrower, indented like the folder's tabs)
          const bg = drag.bg?.isConnected ? drag.bg : null;
          const bgBox = bg?.getBoundingClientRect();
          droppedFrom = { node: drag.moving, top: from.top, left: from.left, tab: drag.tab, bg, bgLeft: bgBox?.left, bgWidth: bgBox?.width };
        }
        essentialDropped = null;
        // (a folder let go is moved a step later: its folders keep their look till then)
        const folderLanding = !!drag?.folder && pendingFinish;
        if (drag?.folder) {
          const dropped = drag.folder;
          // (a landing one goes just before its glide, which measures it)
          setTimeout(() => {
            if (!dropped.hasAttribute("zia-landing")) {
              unmorphFolder(dropped);
            }
          }, 0);
        }
        if (drag?.bg) {
          setTimeout(() => requestAnimationFrame(() => easeOutWidth(droppedTab)), 0);
        }
        releaseSidebarWidth();
        drag = null;
        pending = null;
        document.documentElement.removeAttribute("zia-dragging-tab");
        // The tabs folded into the dragged one unfold where they've landed, growing out under
        // it: shown again at once, they showed back where they'd been for a frame and then
        // jumped across as the drop placed them a step later
        const folded = [...document.querySelectorAll("[zia-drag-companion]")];
        if (folded.length) {
          setTimeout(() => {
            for (const tab of folded) {
              tab.removeAttribute("zia-drag-companion");
            }
            for (const tab of folded) {
              if (!tab.isConnected) {
                continue;
              }
              const height = tab.getBoundingClientRect().height;
              if (height > 0) {
                tab.animate(
                  [
                    { height: "0px", minHeight: "0px", opacity: 0, overflow: "clip" },
                    { height: `${height}px`, minHeight: `${height}px`, opacity: 1, overflow: "clip" },
                  ],
                  { duration: 180, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }
                );
              }
            }
          }, 0);
        }
        for (const tab of document.querySelectorAll("[zia-drag-count]")) {
          tab.removeAttribute("zia-drag-count");
        }
        setFlag("zia-drag-over-essentials", false);
        muteZenHaptics(false);
        reclip();
        document.querySelectorAll("[zia-drop-slot]").forEach((folder) => folder.removeAttribute("zia-drop-slot"));
        if (document.querySelector("[zia-left]")) {
          // (until the mouse moves, when Firefox works out what's hovered)
          listen(window, "mousemove", () => document.querySelectorAll("[zia-left]").forEach((folder) => folder.removeAttribute("zia-left")), { once: true, capture: true });
        }
        unlend();
        document.querySelectorAll("[zia-into-empty]").forEach((tab) => {
          tab.removeAttribute("zia-into-empty");
          tab.style.removeProperty("--zia-slot-border");
        });
        // (cleared at once, the folder it left wrapped it again, or the one it went into shut
        // to its name, for a frame before it moved)
        if (folderLanding) {
          setTimeout(clearFolderPaint, 0);
        } else {
          clearFolderPaint();
        }
        dropProxy();
        document.querySelectorAll("[zia-drag-away]").forEach((node) => node.removeAttribute("zia-drag-away"));
        makeRoom(null);
        holdSplitSlot(false);
        document.querySelectorAll("[zia-sep-open]").forEach((node) => node.removeAttribute("zia-sep-open"));

        if (raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
        blockAnimUntil = Date.now() + 400;
        const dnd = gBrowser.tabContainer.tabDragAndDrop;
        if (dnd) {
          dnd._dontAnimateTabMove = true;
          if (!dnd.handle_drop_transition?.ziaNeutered) {
            const skip = function () {
              this._dontAnimateTabMove = true;
            };
            skip.ziaNeutered = true;
            const original = dnd.handle_drop_transition;
            dnd.handle_drop_transition = skip;
            onStop(() => { if (dnd.handle_drop_transition === skip) dnd.handle_drop_transition = original; });
          }
        }
        const strip = document.getElementById("tabbrowser-tabs");

        const landing = droppedFrom;
        droppedFrom = null;
        strip?.setAttribute("zia-settling", "true");
        const locked = new Set(moved);
        clearMoved();
        for (const node of locked) {
          node.style.removeProperty("transform");
          node.setAttribute("zia-drop-lock", "true");
        }
        if (landing?.node?.isConnected) {
          const node = landing.node;
          holdFolderHover(node);

          node.setAttribute("zia-landing", "true");
          const held = node.getBoundingClientRect();
          node.style.setProperty("transform", `translate(${landing.left - held.left}px, ${landing.top - held.top}px)`, "important");
          // Firefox clears every tab's transform as its drag ends, so the tab painted a frame at
          // its new spot before the glide: it's pinned where let go each frame until the drop moves it
          const pin = () => {
            if (!node.isConnected) {
              return;
            }
            node.style.removeProperty("transform");
            const at = node.getBoundingClientRect();
            node.style.setProperty("transform", `translate(${landing.left - at.left}px, ${landing.top - at.top}px)`, "important");
          };
          repinLanding = pin;
          refitLanding = landing.bg ? () => settleDroppedWidth(landing.tab, landing.bgWidth) : null;
          const glideIn = () => {
            if (pendingFinish) {
              pin();
              requestAnimationFrame(glideIn);
              return;
            }
            repinLanding = null;
            refitLanding = null;
            refitHeld?.();
            node.style.removeProperty("transform");
            // the narrower look goes before the glide, which then starts the background where it
            // showed (in a folder, it stepped left as the glide began and slid back)
            if (landing.bg) {
              settleDroppedWidth(landing.tab, landing.bgWidth);
            }
            unmorphFolder(node);
            const to = node.getBoundingClientRect();
            const dy = landing.top - to.top;
            const dx = landing.bg?.isConnected ? landing.bgLeft - landing.bg.getBoundingClientRect().left : landing.left - to.left;
            if (!node.isConnected || node.hasAttribute("zen-essential") || (Math.abs(dy) < 2 && Math.abs(dx) < 2) || !to.height) {
              // kept a moment, past Firefox's own drop animation (see chrome.css)
              setTimeout(() => node.removeAttribute("zia-landing"), gBrowser.isTab(node) ? 0 : 400);
              return;
            }
            const glide = node.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }], {
              duration: LAND_MS,
              easing: LAND_EASE,
            });
            glide.id = "zia-land";
            const end = () => setTimeout(() => node.removeAttribute("zia-landing"), gBrowser.isTab(node) ? 0 : 250);
            glide.finished.then(end, end);
          };
          requestAnimationFrame(glideIn);
        }
        // A new drag started within the settling time is left alone: the wipe undid the offsets
        // Zen gives the other essentials to open a gap
        const gen = dragGen;
        const unlock = () => {
          strip?.removeAttribute("zia-settling");
          for (const node of locked) {
            node.style.removeProperty("top");
            node.removeAttribute("zia-drop-lock");
          }
        };
        const wipe = () => {
          if (gen !== dragGen) {
            unlock();
            return;
          }
          strip?.querySelectorAll(".tabbrowser-tab, .tab-group-label-container, tab-group, zen-folder").forEach((node) => {
            const appearing = node === droppedTab && !node.group;
            for (const anim of node.getAnimations()) {
              if (anim.id === "zia-land") {
                continue;
              }
              if (movesOnly(anim) || appearing) {
                anim.cancel();
              }
            }
            if (node.style.transform && !node.hasAttribute("zia-landing")) {
              node.style.transform = "";
            }

            // Firefox hides what's dragged until its own drop animation ends: for a folder, a part
            // inside it, so the whole folder vanished for a moment after landing
            if (node.style.visibility === "hidden" && (locked.has(node) || node === droppedTab || droppedTab?.contains?.(node))) {
              node.style.visibility = "";
            }
          });
          if (Date.now() < blockAnimUntil) {
            requestAnimationFrame(wipe);
          } else {
            unlock();
          }
        };
        clearTimeout(lockTimer);
        wipe();
        // the drop's own placing, now its landing is set up
        if (finishNow) {
          const run = finishNow;
          finishNow = null;
          run();
        }
        holdLent();
      };
      listen(window, "drop", settle, true);
      listen(window, "dragstart", () => {
        // (and what the last drop kept showing: dragged straight back into
        // the essentials, a tab kept its x on the tile)
        releaseHeld?.();
        dragGen++;
        blockAnimUntil = 0;
      }, true);
      listen(window, "dragend", () => {
        settle();
        setTimeout(settle, 0);
      });

      // A drag that ends where this window can't see (another window, the desktop, its tab
      // closed) never sends dragend, leaving every tab's x hidden until a restart. No mouse
      // moves arrive during a drag, so a move with no button held means it's over: tidy up.
      let lastTidy = 0;
      listen(window, 
        "mousemove",
        (event) => {
          if (event.buttons || event.timeStamp - lastTidy < 500) {
            return;
          }
          lastTidy = event.timeStamp;
          if (drag || document.documentElement.hasAttribute("zia-dragging-tab")) {
            settle();
          }
          const strip = document.getElementById("tabbrowser-tabs");
          if (strip?.hasAttribute("zia-settling") && Date.now() > blockAnimUntil + 1000) {
            strip.removeAttribute("zia-settling");
          }
          for (const tab of document.querySelectorAll(".tabbrowser-tab[zia-essential-dragged]")) {
            if (!essentialDrag) {
              tab.removeAttribute("zia-essential-dragged");
              tab.style.visibility = "";
            }
          }
        },
        true
      );
    }

    quietZenHaptics();
    watchHapticsMute();
    moveTabsLikeDia();
    watchEmptyFolders();
    watchSplitEssentials();
    onStop(() => {
      muteZenHaptics(false);
    });
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
      if (!destroyed) render(strip,true);
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
  function render(strip, animateNames = false) {
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
          header.tabIndex = 0;
          header.addEventListener('contextmenu', event => openGroupMenu(event,strip,name));
          if (animateNames && !s.revealed.has(name) && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
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

  function essentialInitial(tab) {
    const host = URL.parse(tab.linkedBrowser?.currentURI?.spec || '')?.hostname.replace(/^www\./i, '');
    return Array.from(host || tab.label?.trim() || '•')[0].toLocaleUpperCase();
  }
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (destroyed || busy) return;
      if (document.documentElement.hasAttribute("ztt-moving-topic") || document.documentElement.hasAttribute("zia-dragging-tab") || gBrowser.tabContainer.hasAttribute("zia-settling") || gBrowser.tabContainer.hasAttribute('movingtab')) { schedule(); return; }
      for (const [strip, s] of states) if (!strip.isConnected) { removeHeaders(s); unmountControl(s); states.delete(strip); }
      for (const tab of document.querySelectorAll('.tabbrowser-tab[zen-essential]:not([zia-essential-proxy])')) {
        const initial = essentialInitial(tab);
        if (tab.getAttribute('ztt-initial') !== initial) tab.setAttribute('ztt-initial', initial);
      }
      const strip = activeStrip();
      if (strip) render(strip);
    }, 100);
  }
  const style = node('style');
  style.textContent = `
    :root {
      --ztt-playing-icon:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cg%20transform%3D%22translate%280%208%29%22%20fill%3D%22context-fill%22%3E%3Crect%20x%3D%221%22%20y%3D%22-3.0%22%20width%3D%222%22%20height%3D%226%22%20rx%3D%221%22%3E%3Canimate%20attributeName%3D%22y%22%20values%3D%22-3.0%3B-1%3B-3.0%22%20dur%3D%220.62s%22%20repeatCount%3D%22indefinite%22%2F%3E%3Canimate%20attributeName%3D%22height%22%20values%3D%226%3B2%3B6%22%20dur%3D%220.62s%22%20repeatCount%3D%22indefinite%22%2F%3E%3C%2Frect%3E%3Crect%20x%3D%224%22%20y%3D%22-5.5%22%20width%3D%222%22%20height%3D%2211%22%20rx%3D%221%22%3E%3Canimate%20attributeName%3D%22y%22%20values%3D%22-5.5%3B-1%3B-5.5%22%20dur%3D%220.69s%22%20repeatCount%3D%22indefinite%22%2F%3E%3Canimate%20attributeName%3D%22height%22%20values%3D%2211%3B2%3B11%22%20dur%3D%220.69s%22%20repeatCount%3D%22indefinite%22%2F%3E%3C%2Frect%3E%3Crect%20x%3D%227%22%20y%3D%22-4.0%22%20width%3D%222%22%20height%3D%228%22%20rx%3D%221%22%3E%3Canimate%20attributeName%3D%22y%22%20values%3D%22-4.0%3B-1%3B-4.0%22%20dur%3D%220.76s%22%20repeatCount%3D%22indefinite%22%2F%3E%3Canimate%20attributeName%3D%22height%22%20values%3D%228%3B2%3B8%22%20dur%3D%220.76s%22%20repeatCount%3D%22indefinite%22%2F%3E%3C%2Frect%3E%3Crect%20x%3D%2210%22%20y%3D%22-6.5%22%20width%3D%222%22%20height%3D%2213%22%20rx%3D%221%22%3E%3Canimate%20attributeName%3D%22y%22%20values%3D%22-6.5%3B-1%3B-6.5%22%20dur%3D%220.8300000000000001s%22%20repeatCount%3D%22indefinite%22%2F%3E%3Canimate%20attributeName%3D%22height%22%20values%3D%2213%3B2%3B13%22%20dur%3D%220.8300000000000001s%22%20repeatCount%3D%22indefinite%22%2F%3E%3C%2Frect%3E%3Crect%20x%3D%2213%22%20y%3D%22-3.5%22%20width%3D%222%22%20height%3D%227%22%20rx%3D%221%22%3E%3Canimate%20attributeName%3D%22y%22%20values%3D%22-3.5%3B-1%3B-3.5%22%20dur%3D%220.9s%22%20repeatCount%3D%22indefinite%22%2F%3E%3Canimate%20attributeName%3D%22height%22%20values%3D%227%3B2%3B7%22%20dur%3D%220.9s%22%20repeatCount%3D%22indefinite%22%2F%3E%3C%2Frect%3E%3C%2Fg%3E%3C%2Fsvg%3E");
      --ztt-muted-icon:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cg%20transform%3D%22translate%280%208%29%22%20fill%3D%22context-fill%22%3E%3Crect%20x%3D%221%22%20y%3D%22-1.0%22%20width%3D%222%22%20height%3D%222%22%20rx%3D%221%22%3E%3C%2Frect%3E%3Crect%20x%3D%224%22%20y%3D%22-1.0%22%20width%3D%222%22%20height%3D%222%22%20rx%3D%221%22%3E%3C%2Frect%3E%3Crect%20x%3D%227%22%20y%3D%22-1.0%22%20width%3D%222%22%20height%3D%222%22%20rx%3D%221%22%3E%3C%2Frect%3E%3Crect%20x%3D%2210%22%20y%3D%22-1.0%22%20width%3D%222%22%20height%3D%222%22%20rx%3D%221%22%3E%3C%2Frect%3E%3Crect%20x%3D%2213%22%20y%3D%22-1.0%22%20width%3D%222%22%20height%3D%222%22%20rx%3D%221%22%3E%3C%2Frect%3E%3C%2Fg%3E%3C%2Fsvg%3E");
    }
    @media (prefers-reduced-motion:reduce) {
      :root { --ztt-playing-icon:url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cg%20transform%3D%22translate%280%208%29%22%20fill%3D%22context-fill%22%3E%3Crect%20x%3D%221%22%20y%3D%22-3.0%22%20width%3D%222%22%20height%3D%226%22%20rx%3D%221%22%3E%3C%2Frect%3E%3Crect%20x%3D%224%22%20y%3D%22-5.5%22%20width%3D%222%22%20height%3D%2211%22%20rx%3D%221%22%3E%3C%2Frect%3E%3Crect%20x%3D%227%22%20y%3D%22-4.0%22%20width%3D%222%22%20height%3D%228%22%20rx%3D%221%22%3E%3C%2Frect%3E%3Crect%20x%3D%2210%22%20y%3D%22-6.5%22%20width%3D%222%22%20height%3D%2213%22%20rx%3D%221%22%3E%3C%2Frect%3E%3Crect%20x%3D%2213%22%20y%3D%22-3.5%22%20width%3D%222%22%20height%3D%227%22%20rx%3D%221%22%3E%3C%2Frect%3E%3C%2Fg%3E%3C%2Fsvg%3E"); }
    }
    #tabbrowser-tabs :is(.tab-audio-button,.tab-icon-overlay)[soundplaying] { --ztt-audio-icon:var(--ztt-playing-icon); }
    #tabbrowser-tabs :is(.tab-audio-button,.tab-icon-overlay)[muted] { --ztt-audio-icon:var(--ztt-muted-icon); }
    #tabbrowser-tabs .tab-audio-button:not([crashed]):is([soundplaying],[muted])::part(button) {
      background-image:var(--ztt-audio-icon)!important; background-size:16px 16px!important;
      background-position:center!important; background-repeat:no-repeat!important;
      -moz-context-properties:fill!important; fill:currentColor!important;
    }
    #tabbrowser-tabs .tab-icon-overlay:not([crashed]):is([soundplaying],[muted]) {
      list-style-image:var(--ztt-audio-icon)!important; -moz-context-properties:fill!important;
    }

    #browser #tabbrowser-tabbox { box-shadow:0 0 5px rgb(0 0 0 / .065); }
    @media (prefers-reduced-motion:no-preference) {
      zen-folder:not([collapsed]) > .tab-group-container { animation:ztt-folder-open 135ms ease-out; }
      @keyframes ztt-folder-open { from { opacity:.3; clip-path:inset(0 0 90% 0); } to { opacity:1; clip-path:inset(0); } }
    }

    #tabbrowser-tabs[expanded] .tabbrowser-tab:not([zen-essential]) .tab-icon-stack {
      display:none!important;
    }
    #tabbrowser-tabs[expanded] .tabbrowser-tab:not([zen-essential]) .tab-content {
      padding-inline-start:15px!important; transition:padding-inline-start 220ms ease 180ms;
    }
    #tabbrowser-tabs[expanded] .tabbrowser-tab:not([zen-essential]):is([ztt-playing], [soundplaying]:not([ztt-has-controller]),[activemedia-blocked]) .tab-content {
      padding-inline-start:10px!important; transition-delay:0s;
    }
    .tabbrowser-tab:is([pending],[discarded],[zen-unloaded]):not([selected],[visuallyselected]) .tab-label {
      color:color-mix(in srgb,currentColor 72%,transparent)!important;
    }
    .ztt-essential-slot { height:38px; display:grid; place-items:center; pointer-events:none;
      background:var(--zen-toolbar-element-bg); border-radius:var(--border-radius-medium);
      font-size:13.5px; font-weight:500; }
    [ztt-slot-preview] { opacity:0!important; }
    .zen-essentials-container .tabbrowser-tab[zen-essential] {
      --tab-min-height:38px!important; min-height:38px!important; height:38px!important; max-height:38px!important;
    }
    .tabbrowser-tab[zen-essential][ztt-initial] {
      position:relative;
      & .tab-icon-stack, & .tab-icon-image { display:none!important; }
      &::after { content:attr(ztt-initial); position:absolute; inset:0; display:grid;
        place-items:center; padding-block-start:2px; box-sizing:border-box; line-height:1; pointer-events:none; font-size:13.5px; font-weight:500; }
    }
    .tabbrowser-tab[zen-essential]:not([selected],[visuallyselected])::after {
      color:light-dark(#929292,#aaa);
    }
    #tabbrowser-tabs .tabbrowser-tab[zen-essential] .tab-content {
      background-image:none!important;
    }
    #tabbrowser-tabs[expanded] .tabbrowser-tab[busy]:not([zen-essential]) .tab-content::after {
      content:""; flex:none; width:12px; height:12px; box-sizing:border-box;
      align-self:center; margin-inline:5px; border:2px solid currentColor;
      color:color-mix(in srgb,currentColor 76%,var(--zen-primary-color,AccentColor)); border-inline-start-color:transparent; border-radius:50%; opacity:1; pointer-events:none;
      animation:ztt-tab-spin 1.65s linear infinite; will-change:transform;
    }
    #tabbrowser-tabs .tabbrowser-tab[zen-essential][busy]::after {
      content:""; position:absolute; inset:0; margin:auto; width:14px; height:14px;
      box-sizing:border-box; padding:0; pointer-events:none; border-radius:50%;
      color:color-mix(in srgb,CanvasText 76%,var(--zen-primary-color,AccentColor));
      border:2px solid currentColor; border-inline-start-color:transparent;
      animation:ztt-tab-spin 1.65s linear infinite;
    }
    #tabContextMenu > [ztt-omit] { display:none!important; }
    #tabbrowser-tabs[expanded] .tabbrowser-tab[busy]:not([zen-essential]) :is(.tab-reset-button,.tab-reset-pin-button,.tab-close-button) { display:none!important; }
    .ztt-action-tip:popover-open { display:flex; align-items:center; gap:3px; position:fixed; inset:auto; margin:0; pointer-events:none;
      padding:5px 10px; border:none; border-radius:18px; color:CanvasText;
      background:color-mix(in srgb,Canvas 94%,var(--zen-primary-color,AccentColor)); box-shadow:0 2px 10px #0003;
      font:600 13px system-ui; }
    .ztt-action-tip span + kbd { margin-inline-start:5px; }
    .ztt-action-tip kbd { font:650 11px system-ui; min-width:19px; line-height:18px; text-align:center; box-sizing:border-box; padding:0 4px; border-bottom-width:2px; border-radius:4px;
      color:color-mix(in srgb,CanvasText 65%,var(--zen-primary-color,AccentColor)); border:1px solid currentColor;
      border-bottom-width:2px; background:color-mix(in srgb,currentColor 13%,transparent); }
    @keyframes ztt-tab-spin { to { transform:rotate(1turn); } }
    @media(prefers-reduced-motion:reduce) {
      #tabbrowser-tabs .tabbrowser-tab[zen-essential][busy]::after,
      #tabbrowser-tabs[expanded] .tabbrowser-tab[busy] .tab-content::after { animation:none; }
    }
    #tabbrowser-tabs .tabbrowser-tab[zen-essential]:is([selected],[visuallyselected]) .tab-background {
      background:var(--tab-selected-bgcolor,light-dark(#fafafa,#47474b))!important;
      border-color:transparent!important; outline:none!important;
      box-shadow:var(--tab-selected-shadow,0 1px 2px rgb(0 0 0 / .16))!important;
      &::before, &::after { opacity:0!important; }
    }
    #tabbrowser-tabs tab[zen-essential] :is(.tab-audio-button,.tab-icon-overlay:is([soundplaying],[muted]):not([crashed],[activemedia-blocked])) { display:none!important; }
    #tabbrowser-tabs tab[zen-essential]:is([soundplaying],[muted]) .tab-icon-image { opacity:1!important; visibility:visible!important; }
    #tabbrowser-tabs[expanded] tab:not([zen-essential],[crashed]) .tab-audio-button {
      display:flex!important; overflow:hidden; min-inline-size:0!important; flex:none!important;
      inline-size:0!important; margin-inline:0!important; opacity:0; visibility:hidden;
      transition:inline-size 220ms ease 180ms,margin-inline-end 220ms ease 180ms,opacity 160ms ease 180ms,visibility 0s 400ms;
    }
    #tabbrowser-tabs[expanded] tab:not([zen-essential],[crashed]):is([ztt-playing], [soundplaying]:not([ztt-has-controller]),[activemedia-blocked]) .tab-audio-button {
      inline-size:var(--tab-content-button-size,16px)!important; margin-inline-end:9px!important;
      opacity:1; visibility:visible; transition-delay:0s;
    }
    #tabbrowser-tabs[expanded] tab:not([zen-essential]):not([soundplaying],[muted],[activemedia-blocked]) .tab-audio-button::part(button) {
      background-image:var(--ztt-playing-icon); background-position:center; background-size:16px; background-repeat:no-repeat;
      -moz-context-properties:fill; fill:currentColor;
    }
    #tabbrowser-tabs[expanded] tab[ztt-playing]:not([zen-essential],[muted]) .tab-audio-button::part(button) {
      background-image:var(--ztt-playing-icon)!important; background-size:16px!important;
      background-position:center!important; background-repeat:no-repeat!important;
      -moz-context-properties:fill; fill:currentColor;
    }
    @media(prefers-reduced-motion:reduce) { #tabbrowser-tabs .tab-audio-button { transition:none!important; } }
    #zen-media-controls-toolbar {
      position:fixed!important; left:var(--ztt-player-left)!important; right:auto!important;
      bottom:var(--ztt-player-bottom)!important; width:var(--ztt-player-width)!important; max-width:none!important;
      box-sizing:border-box!important; margin:0!important; padding:0!important; z-index:3;
      .zen-media-card { margin-inline:0!important; width:100%!important; max-width:none!important; }
      --zia-media-ring-size:26px; --zia-media-art-size:26px; --zia-squircle-grow:1; --zia-squircle:squircle;
      .zen-media-card {
        border-radius:22px!important; corner-shape:squircle!important; padding:10px!important; box-sizing:border-box;
        background:light-dark(#fffefe,#2c2b30)!important; color:light-dark(#171619,#f5f3f7); box-shadow:0 2px 9px rgb(0 0 0 / .12),0 0 1px rgb(0 0 0 / .15)!important;
      }
  .zen-media-main-vbox {
    height: 100% !important;
    align-content: center;
    display: grid !important;

    grid-template-columns:26px minmax(0,1fr) repeat(3,auto) minmax(0,1fr) 26px;
    grid-template-rows: auto auto auto;
    column-gap: 0;
    row-gap: 0;
    align-items: center;
  }

  .zen-media-main-vbox > vbox,
  .zen-media-info-container,
  .zen-media-buttons-hbox,
  .zen-media-controls-hbox,
  .zen-media-playback-buttons {
    display: contents !important;
  }

  .zen-media-focus-button {
    grid-column: 1;
    grid-row: 1;
    align-self: center !important;
    position: relative;
    width: var(--zia-media-ring-size) !important;
    height: var(--zia-media-ring-size) !important;
    min-width: var(--zia-media-ring-size) !important;
    padding: 0 !important;
    margin: 0 !important;
    justify-content: center !important;
    align-items: center !important;
    background: transparent !important;

    & > .toolbarbutton-icon,
    & image {
      width: var(--zia-media-art-size) !important;
      height: var(--zia-media-art-size) !important;
      min-width: var(--zia-media-art-size) !important;
      min-height: var(--zia-media-art-size) !important;
      padding: 0 !important;
      border-radius: calc(7px * var(--zia-squircle-grow)) !important;
      corner-shape: var(--zia-squircle) !important;
      transition: opacity 0.2s ease, filter 0.2s ease;
    }

  }
  .zen-media-info-vbox {
    grid-column: 2 / 7;
    grid-row: 1;
    min-width: 0;
    padding-inline: 8px 4px;
    justify-content: center;
    gap: 2px;

    &::before {
      display: none !important;
    }

    & label {
      min-height: 0 !important;
      height: auto !important;
      line-height: 1.25;
    }
  }

  .zen-media-mute-button { grid-column: 7; grid-row: 1; }
  .zen-media-previoustrack-button { grid-column: 3; grid-row: 3; }
  .zen-media-playpause-button { grid-column: 4; grid-row: 3; }
  .zen-media-nexttrack-button { grid-column: 5; grid-row: 3; }

      .zen-media-main-vbox { height:auto!important; row-gap:3px; }
      .zen-media-info-vbox { display:flex!important; opacity:1!important; overflow:hidden;
        mask-image:linear-gradient(to right,transparent,#000 8px,#000 calc(100% - 8px),transparent)!important; }
      .zen-media-title { font-weight:600; }
      .zen-media-artist { opacity:.68; }
      .zen-media-progress-hbox { grid-column:1/-1; grid-row:2; }
      .zen-media-pip-button { grid-column:1; grid-row:3; }
      .zen-media-close-button { grid-column:7; grid-row:3; }
      .media-device-buttons { grid-column:1/3; grid-row:3; }
      .toolbarbutton-1:hover { background-color:color-mix(in srgb,currentColor 8%,transparent)!important; }
      .zen-media-mute-button { list-style-image:var(--ztt-muted-icon)!important; }
      .zen-media-card.playing:not([muted]) .zen-media-mute-button { list-style-image:var(--ztt-playing-icon)!important; }
      .zen-media-mute-button > .toolbarbutton-icon { -moz-context-properties:fill; fill:currentColor!important; }
      :is(.zen-media-current-time,.zen-media-duration) { display:none!important; }
      .zen-media-progress-hbox { width:100%!important; min-width:0; margin-inline:0!important; padding-inline:0!important; box-sizing:border-box; }
      .zen-media-progress-bar { flex:1 1 0%!important; width:100%!important; min-width:0!important; margin-inline:0!important; }
      --zia-media-art-size:16px;
      .zen-media-card {
        box-sizing:border-box!important; height:auto!important; min-height:0!important;
        --progress-row:0px; --buttons-row:0px; --controls-opacity:0;
        &:is(:hover,:focus-within) { --progress-row:28px; --buttons-row:26px; --controls-opacity:1; }
      }
      .zen-media-main-vbox {
        grid-template-rows:auto var(--progress-row) var(--buttons-row)!important;
        row-gap:0!important; align-content:start!important;
        transition:grid-template-rows 155ms cubic-bezier(.2,.8,.2,1)!important;
      }
      .zen-media-progress-hbox {
        align-self:center; transform:translateY(4px); height:100%!important; min-height:0!important; margin:0!important;
        display:flex!important; align-items:center!important; overflow:hidden;
      }
      :is(.zen-media-progress-hbox,.zen-media-pip-button,.zen-media-close-button,.zen-media-previoustrack-button,.zen-media-playpause-button,.zen-media-nexttrack-button) {
        opacity:var(--controls-opacity)!important; transition:opacity 140ms ease!important;
      }
      .zen-media-card:not(:hover):not(:focus-within) :is(.zen-media-progress-hbox,.zen-media-pip-button,.zen-media-close-button,.zen-media-previoustrack-button,.zen-media-playpause-button,.zen-media-nexttrack-button) {
        pointer-events:none!important; visibility:hidden;
      }
      :is(.zen-media-mute-button,.zen-media-pip-button,.zen-media-close-button,.zen-media-previoustrack-button,.zen-media-playpause-button,.zen-media-nexttrack-button) {
        justify-self:center; align-self:center; box-sizing:border-box!important;
        width:26px!important; height:26px!important; min-width:0!important; min-height:0!important;
        padding:0!important; margin:0!important; justify-content:center!important; align-items:center!important;
        &:not(.zen-media-pip-button) > .toolbarbutton-icon { width:16px!important; height:16px!important; padding:0!important; object-fit:contain; }
      }
      @media(prefers-reduced-motion:reduce) { .zen-media-main-vbox, .zen-media-main-vbox * { transition:none!important; } }
      .toolbarbutton-1:is(:hover,:active) > .toolbarbutton-icon { background-color:transparent!important; box-shadow:none!important; }
      .zen-media-playpause-button { margin-inline:3px!important; }
      :is(.zen-media-nexttrack-button,.zen-media-previoustrack-button):is(:disabled,[disabled],[aria-disabled="true"]) { opacity:calc(var(--controls-opacity) * .32)!important; }
      .zen-media-notes { display:none!important; }
    }
    :root[ztt-hide-player] #zen-media-controls-toolbar { display:none!important; }
    :root:has(#ztt-create-panel:popover-open) #zen-media-controls-toolbar { visibility:hidden!important; pointer-events:none!important; }
:root {
  --zia-active-glow-blur: 20px;
  --zia-active-glow-reach: 4px;
  --zia-active-glow-spread: 4px;
  --zia-essential-height: 41px;
  --zia-essential-max-width: 120px;
  --zia-essential-min-width: 54px;
  --zia-essential-radius: 12px;
  --zia-folder-hover-bg: rgba(255, 255, 255, 0.1);
  --zia-folder-wash: 31%;
  --zia-loading-color: rgb(90, 185, 245);
  --zia-split-card-radius: 14px;
  --zia-spring: cubic-bezier(0.3, 1.4, 0.5, 1);
  --zia-spring-time: 0.42s;
  --zia-squircle: superellipse(1.93);
  --zia-squircle-grow: 1.5;
  --zia-tab-hover-bg: rgba(255, 255, 255, 0.115);
  --zia-tab-radius: 9.5px;
  --zia-text-size: calc(1.22rem - 0.4px);
}
.tabbrowser-tab[drag-image] {
  margin: 0 !important;
  translate: none !important;
  scale: none !important;
  animation: none !important;
  transition: none !important;
}

.tabbrowser-tab[drag-image] * {
  animation: none !important;
  transition: none !important;
}

.tabbrowser-tab[drag-image] > .tab-stack > .tab-background {
  box-shadow: none !important;
}

.tabbrowser-tab[drag-image] > .tab-stack > .tab-background::after {
  display: none !important;
}

/* Zen's drop line: Zia's gap shows where a tab lands instead. The Library's
   drags are Zen's, and keep it (Zen puts it inside the space's column there) */
#zen-drag-indicator:not(.zen-library-space-tabs > #zen-drag-indicator) {
  display: none !important;
}

#tabbrowser-tabs[movingtab] :is(.tabbrowser-tab, .tab-group-label-container, tab-group, zen-folder):is([zia-dragging], [zia-shift]) {
  opacity: 1 !important;
  visibility: visible !important;
}

/* ...a split's tabs too, which a closed folder it's dragged out of had
   hidden (it's the split that's dragged, not its tabs) */
#tabbrowser-tabs[movingtab] tab-group[split-view-group]:is([zia-dragging], [zia-shift]):not([zia-to-essential]) .tabbrowser-tab {
  opacity: 1 !important;
  visibility: visible !important;
}

/* ...and while it lands (a folder's parts included), whatever Firefox has
   hidden for its own drop animation */
#tabbrowser-tabs :is(zen-folder, tab-group)[zia-landing],
#tabbrowser-tabs :is(zen-folder, tab-group)[zia-landing] > :is(.tab-group-label-container, .tab-group-container) {
  visibility: visible !important;
}

:root[zia-dragging-tab] :is(zen-folder, tab-group:not([split-view-group])):has(:is(.tabbrowser-tab, tab-group[split-view-group])[zia-dragging]) {
  z-index: 41 !important;

  /* (a collapsed folder's clip too: dragging its open tab out of it, the
     tab vanished as soon as it left the folder) */
  & > .tab-group-container {
    overflow: visible !important;
    clip-path: none !important;
  }
}

/* A collapsed folder showing its open tab clips its other tabs away (the
   ones above are pushed up out of it). The open tab's glow reaches further
   than that clip allowed, so the clip gives it the glow's full reach all
   round, and the hidden tabs are see-through so none peeks into it. The
   same while Zen opens or shuts a folder holding the open tab: it clips
   the folder's contents then, and the tab's glow was cut off for a moment
   (a folder Zia's own opening holds is clipped by its height). */
zen-folder[collapsed][has-active] > .tab-group-container,
zen-folder:has(> .tab-group-container > :is(.tabbrowser-tab, tab-group[split-view-group]):is([selected], [visuallyselected], :has(.tabbrowser-tab[selected]))) > .tab-group-container:not([zia-folder-holding]) {
  --zia-glow-room: calc(-1 * (var(--zia-active-glow-blur) + var(--zia-active-glow-spread) + var(--zia-active-glow-reach)));
  overflow: visible !important;
  clip-path: inset(var(--zia-glow-room));
}

/* Growing back from nothing as a folder opens, a tab's name and icon
   spilled out of it, so the tabs showed piled up for a moment */
:is(zen-folder, tab-group:not([split-view-group])) > .tab-group-container > .tabbrowser-tab:not([selected], [visuallyselected]) {
  overflow-y: clip;
}

zen-folder[collapsed][has-active] .tabbrowser-tab:not([selected], [visuallyselected], [folder-active="true"], [atg-folder-active], tab-group[split-view-group]:has(.tabbrowser-tab:is([selected], [visuallyselected], [folder-active="true"])) .tabbrowser-tab, :is([zia-open-in-closed], [zia-closing-in-closed]) .tabbrowser-tab) {
  opacity: 0 !important;
  /* (fading as Zen shrinks them, rather than gone at once, which showed as
     an empty gap closing up) */
  transition: opacity 0.18s ease-in-out;
}

/* Unloaded (the selection moves out), its tabs stay see-through while Zen
   shuts it, the one that was showing fading (zia.uc.js) */
zen-folder[collapsed][zia-was-active] .tabbrowser-tab {
  opacity: 0 !important;
  transition: opacity 0.15s ease-in !important;
}

/* That margin lets the active tab's glow show, but it also left the
   folder's hidden tabs reachable just below it: hovering there brought up
   the last tab's card and a click opened it. Only the tabs a collapsed
   folder shows can be pointed at. */
zen-folder[collapsed] .tabbrowser-tab:not([selected], [visuallyselected], [folder-active="true"], [atg-folder-active], :is([zia-open-in-closed], [zia-closing-in-closed]) .tabbrowser-tab) {
  pointer-events: none;
}

:root[zia-dragging-tab] .tabbrowser-tab[zen-essential] {
  visibility: inherit !important;
}

#zia-essential-proxy,
#zia-essential-proxy > .tab-stack,
#zia-essential-proxy > .tab-stack > .tab-background,
#zia-essential-proxy > .tab-stack > .tab-content {
  opacity: 1 !important;
}

.tabbrowser-tab[zia-essential-proxy],
.tabbrowser-tab[zia-essential-proxy] > .tab-stack {
  overflow: visible !important;
  contain: none !important;
}

.tabbrowser-tab[zia-essential-proxy] > .tab-stack,
.tabbrowser-tab[zia-essential-proxy] > .tab-stack > .tab-background {
  width: 100% !important;
  height: 100% !important;
  min-height: 0 !important;
  max-height: none !important;
  margin: 0 !important;
}

.tabbrowser-tab[zia-essential-proxy] :is(.tab-reset-pin-button, .tab-reset-pin-label, .tab-group-line) {
  display: none !important;
}

zen-essentials-promo {
  display: none !important;
}

:is(#tabs-newtab-button, #vertical-tabs-newtab-button)[zia-shift] {
  position: relative !important;
  transform: translateY(var(--zia-drag-y)) !important;
  transition: transform 100ms ease-out !important;
}

.zen-essentials-container > vbox:not(.tabbrowser-tab) {
  min-height: var(--zia-essential-height);
}

@media -moz-pref("zia.essentials.zia-width") {
  .zen-essentials-container > vbox:not(.tabbrowser-tab) {
    min-width: var(--zia-essential-min-width);
    max-width: var(--zia-essential-max-width);
  }
}

.tabbrowser-tab[zen-essential][zia-essential-dragged] {
  opacity: 0 !important;
}

/* ...and out over the list, it gives up its cell: the others close up */
.tabbrowser-tab[zen-essential][zia-essential-dragged][zia-essential-out] {
  display: none !important;
}

:is(#zen-sidebar-splitter, #sidebar-splitter, .zen-sidebar-splitter),
:is(#zen-sidebar-splitter, #sidebar-splitter, .zen-sidebar-splitter)::before,
:is(#zen-sidebar-splitter, #sidebar-splitter, .zen-sidebar-splitter)::after {
  background: transparent !important;
  border-color: transparent !important;
  box-shadow: none !important;
  outline: none !important;
}

.tabbrowser-tab:is([label=""], :not([label])) .tab-reset-pin-label {
  display: none !important;
}

:root[zia-dragging-tab] :is(#zen-essentials, .zen-essentials-container) {
  transition: min-height 140ms ease-out;
}

/* (and the list under them moves at once as Zen's drop cell opens or
   closes a row of essentials: Zen's slide trailed the dragged tab, which
   lagged and dipped the top of the list) */
:root[zia-dragging-tab] zen-workspace {
  transition: none !important;
}

:is(#zen-essentials, .zen-essentials-container)[zia-make-room] {
  min-height: var(--zia-room) !important;
}

.tabbrowser-tab[zia-no-glow],
.tabbrowser-tab[zia-no-glow] > .tab-stack > .tab-background,
tab-group[split-view-group][zia-no-glow],
tab-group[split-view-group][zia-no-glow] > .tab-group-container {
  --zia-active-glow-color: transparent !important;
}

.pinned-tabs-container-separator[zia-sep-open] {
  display: flex !important;
  visibility: visible !important;
  height: 22px !important;
  opacity: 1 !important;
}

.pinned-tabs-container-separator[zia-shift],
#tabbrowser-tabs :is(.tabbrowser-tab, .tab-group-label-container, zen-folder)[zia-shift] {
  position: relative !important;
  transform: translateY(var(--zia-drag-y)) !important;
  transition: transform 100ms ease-out !important;
  z-index: 1 !important;
}

/* The section a dragged tab or folder comes from goes above the
   essentials while it's dragged: otherwise the essentials' icons, drawn on
   a layer of their own, showed through it when it was dragged up over them.
   Not while it's going into the essentials: raised, the section covered
   them, and Zen saw the tab list under the pointer and refused the drop
   (the row is hidden then anyway, its tile shown instead) */
:root[zia-dragging-tab]:not([zia-drag-over-essentials]) :is(zen-workspace, .zen-workspace-pinned-tabs-section, .zen-workspace-normal-tabs-section):has([zia-dragging]) {
  position: relative;
  z-index: 50 !important;
}

#tabbrowser-tabs :is(.tabbrowser-tab, .tab-group-label-container, zen-folder)[zia-dragging] {
  position: relative !important;
  transform: translateY(var(--zia-drag-y)) !important;
  transition: none !important;
  z-index: 40 !important;
  pointer-events: none !important;
}

[zia-drop-lock]:not([zia-landing]),
#tabbrowser-tabs[zia-settling] :is(.tabbrowser-tab, .tab-group-label-container, tab-group, zen-folder):not([zia-landing]) {
  transition: none !important;
  transform: none !important;
  translate: none !important;
  top: 0 !important;
}

[zia-drop-lock] {
  visibility: visible !important;
  opacity: 1 !important;
}

/* A row landing is moved by Zia's glide alone: a transition on its own
   transform (Firefox's or Zen's, which Zen's drop used to switch off) ran
   under the glide and showed for a frame as it ended, a 7px jump back */
#tabbrowser-tabs :is(.tabbrowser-tab, tab-group[split-view-group])[zia-landing] {
  transition: none !important;
}

/* (not on the row being dragged, which stays under the pointer) */
:root[zia-dragging-tab] .tabbrowser-tab:not([zia-hover-held], [zia-dragging], [zia-dragging] *) :is(.tab-close-button, .tab-reset-button),
#tabbrowser-tabs[zia-settling] .tabbrowser-tab:not([zia-hover-held], :hover) :is(.tab-close-button, .tab-reset-button) {
  opacity: 0 !important;
  transition: none !important;
}

#tabbrowser-tabs[zia-settling] .tabbrowser-tab {
  animation: none !important;
}

#zia-tab-card[zia-anchor="essential"]::before {
  content: "";
  position: absolute;
  width: 22px;
  height: 22px;
  top: -14px;
  left: -14px;
  pointer-events: none;
}

#zia-tab-card[zia-anchor="essential"][zia-side="right"]::before {
  left: auto;
  right: -14px;
}

.tabbrowser-tab[zia-opening="true"]:not([zen-essential]) {
  animation: zia-tab-open 0.22s ease-out !important;
}

@keyframes zia-tab-open {
  from { max-height: 0; min-height: 0; opacity: 0; }
  to { max-height: 50px; opacity: 1; }
}

.tabbrowser-tab[zia-essential-enter="true"] > .tab-stack {
  animation: zia-essential-enter 0.3s cubic-bezier(0.2, 0.9, 0.3, 1) both !important;
}

@keyframes zia-essential-enter {
  from { scale: 0.5; filter: blur(8px); opacity: 0.4; }
  to { scale: 1; filter: blur(0); opacity: 1; }
}

/* A tab just dropped keeps its hover wash until the pointer leaves it
   (zia-hover-held, zia.uc.js) */
.tabbrowser-tab:not([zen-essential], [visuallyselected])[zia-hover-held] > .tab-stack > .tab-background {
  background: var(--zia-tab-hover-bg) !important;
}

/* ...and its x: Firefox forgets the hover until the pointer next moves,
   and Zen only shows the x on hover. (The x only while it isn't pinned
   and the - only once it is: pinned a moment after, the x held from
   before showed beside the -) */
.tabbrowser-tab:not([zen-essential], [pinned], [zia-held-pinned])[zia-hover-held] .tab-close-button,
/* (ids only to outrank Zen's split rule that hides them unless hovered) */
.tabbrowser-tab:not([zen-essential], [pinned], [zia-held-pinned]) .tab-close-button[zia-held-shown]:not(#zia-a):not(#zia-b),
.tabbrowser-tab:not([zen-essential]):is([pinned], [zia-held-pinned]) .tab-reset-button[zia-held-shown]:not(#zia-a):not(#zia-b) {
  display: flex !important;
  opacity: 1 !important;
  /* (Zen 1.23 hides them unhovered with visibility, not display) */
  visibility: visible !important;
  /* (a tab dropped into a folder swaps its x for a -: straight away, not
     fading in) */
  transition: none !important;
}

/* a split essential dragged back to the list, until it's removed */
.tabbrowser-tab[zia-split-gone] {
  display: none !important;
}

/* Zen's drop-to-split marker (hold a tab over one side of another tab):
   gone, it flashed as a split landed */
zen-split-fake-tab {
  display: none !important;
}

/* the list measured again mid-drag (a dragged folder that has just shut) */
#tabbrowser-tabs[zia-measuring],
#tabbrowser-tabs[zia-measuring] * {
  transition: none !important;
}

/* A split's own label stays hidden (Zen hides it), whatever the drag and
   landing rules above show: it's a blue block Firefox draws for groups */
#tabbrowser-tabs tab-group[split-view-group] > .tab-group-label-container:not(#zia-a):not(#zia-b) {
  visibility: hidden !important;
  opacity: 0 !important;
}

/* One of a split's two tabs closing goes at once, taking no room, so the
   one left stays where the split was (zia.uc.js) */
.tabbrowser-tab[zia-split-closing] {
  height: 0 !important;
  min-height: 0 !important;
  max-height: 0 !important;
  margin-block: 0 !important;
  padding-block: 0 !important;
  overflow: hidden !important;
  opacity: 0 !important;
  visibility: hidden !important;
}

/* The copy a dragged essential (or a tab going into the essentials) is drawn
   as sits among the real tabs, and Firefox clears every tab's offset as a
   drag ends: its centring went, and it showed shifted half its size (over
   the essentials) until it was gone */
.tabbrowser-tab[zia-essential-proxy] {
  translate: -50% -50% !important;
}

/* Several selected tabs dragged together (28-tab-dragging.js): the others are
   folded into the dragged one, out of the list, and it shows how many, and
   as a small stack (the edges of the tabs under it) */
.tabbrowser-tab[zia-drag-companion] {
  display: none !important;
}

.tabbrowser-tab[zia-drag-count] > .tab-stack > .tab-background {
  box-shadow:
    0 3px 0 -1px color-mix(in srgb, currentColor 16%, transparent),
    0 6px 0 -2px color-mix(in srgb, currentColor 9%, transparent) !important;
}

/* (its close button out of the way, so the count has room: squeezed past it,
   it showed as a dot) */
.tabbrowser-tab[zia-drag-count] .tab-close-button {
  display: none !important;
}

/* (macOS counts what's dragged itself, in its red badge by the pointer: Zia's own on
   the dragged tab only doubled it there, a blue dot squeezed past its close button) */
@media (-moz-platform: macos) {
  .tabbrowser-tab[zia-drag-count] > .tab-stack > .tab-content::after {
    display: none !important;
  }
}

.tabbrowser-tab[zia-drag-count] > .tab-stack > .tab-content::after {
  content: attr(zia-drag-count);
  flex: none;
  min-width: 16px;
  height: 16px;
  margin-inline-start: 6px;
  padding: 0 5px;
  box-sizing: border-box;
  border-radius: 8px;
  background: var(--zia-loading-color);
  color: rgb(255, 255, 255);
  font: 600 10px/16px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  text-align: center;
}
/* Split essentials (zia.uc.js): the tile holds both sites, each in a small
   half of its own, the half you're in lit; the split it opens is hidden
   from the tab list. */
.tabbrowser-tab[zia-split-of],
tab-group[split-view-group]:has(.tabbrowser-tab[zia-split-of]) {
  display: none !important;
}

/* no wider than the other essentials, whatever its halves want */
.tabbrowser-tab[zen-essential][zia-split-tile] {
  min-width: 0 !important;
}

.tabbrowser-tab[zen-essential][zia-split-tile] > .tab-stack {
  min-width: 0 !important;
  overflow: hidden;
}

.tabbrowser-tab[zen-essential][zia-split-tile] > .tab-stack > .tab-content {
  position: relative;
  z-index: 1;
  min-width: 0 !important;
  max-width: 100% !important;
  overflow: hidden;
  display: flex !important;
  align-items: stretch !important;
  justify-content: center !important;
  gap: 5px !important;
  width: 100% !important;
  height: 100% !important;
  padding: 8px !important;
  margin: 0 !important;

  & > .tab-icon-stack {
    display: none !important;
  }

  & > .zia-split-half {
    flex: 0 1 auto !important;
    min-width: 0 !important;
    max-width: calc(50% - 3px) !important;
    height: 100% !important;
    aspect-ratio: 4 / 5;
    display: grid !important;
    place-items: center !important;
    border-radius: calc(var(--zia-essential-radius) * var(--zia-squircle-grow));
    corner-shape: var(--zia-squircle) !important;
    background-color: rgba(0, 0, 0, 0.18);
    transition: background-color 0.2s ease, box-shadow 0.2s ease;
  }

  & > .zia-split-half > image {
    width: 16px;
    height: 16px;
  }

  & > .zia-split-half > .zia-split-title {
    display: none;
  }
}

/* a stand-in, not an essential's size: halves as tall as the real ones
   (zia.uc.js), centred */
.tabbrowser-tab[zen-essential][zia-split-tile][zia-essential-proxy] > .tab-stack > .tab-content {
  padding-block: 0 !important;
  align-items: center !important;

  & > .zia-split-half {
    height: var(--zia-split-half-height, calc(100% - 16px)) !important;
  }
}

.tabbrowser-tab[zen-essential][zia-split-tile][zia-essential-proxy][style*="--zia-split-half-width"] > .tab-stack > .tab-content > .zia-split-half {
  flex: none !important;
  width: var(--zia-split-half-width) !important;
  max-width: none !important;
  aspect-ratio: auto !important;
}

.tabbrowser-tab[zen-essential][zia-split-tile][zia-split-focus="a"] > .tab-stack > .tab-content > .zia-split-half[side="a"],
.tabbrowser-tab[zen-essential][zia-split-tile][zia-split-focus="b"] > .tab-stack > .tab-content > .zia-split-half[side="b"] {
  background-color: rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.22);
}

/* Dragged off the essentials, the tile turns into the split's row: both
   sites, icon and title, side by side */
.tabbrowser-tab[zia-split-tile]:not([zen-essential]) > .tab-stack > .tab-content {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;

  & > :not(.zia-split-half) {
    display: none !important;
  }

  & > .zia-split-half {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  & > .zia-split-half > image {
    width: 16px;
    height: 16px;
    flex: none;
  }

  & > .zia-split-half > .zia-split-title {
    margin: 0;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: var(--zia-text-size, 13px);
  }
}

/* The glow and tint: the half you're in, over the whole tile */
@media -moz-pref("zen.theme.essentials-favicon-bg") {
  .tabbrowser-tab[zen-essential][zia-split-tile][visuallyselected] > .tab-stack > .tab-background::after {
    background-image: var(--zia-split-glow, var(--zen-essential-tab-icon)) !important;
  }
}
:root[zen-sidebar-expanded="true"] :is(zen-folder, tab-group:not([split-view-group]))[zia-bg-shift] {
  overflow: visible !important;

  &::before,
  &::after {
    top: calc(var(--zia-folder-box-top) + var(--zia-drag-bg-top, 0px)) !important;
    bottom: calc(var(--zia-folder-box-bottom) - var(--zia-folder-bottom-extra, 0px) - var(--zia-drag-bg-grow, 0px)) !important;
    transition: top 100ms ease-out, bottom 100ms ease-out !important;
  }
}

:root[zen-sidebar-expanded="true"] :is(zen-folder, tab-group:not([split-view-group]))[zia-drop-slot]::before {
  background-color: var(--zia-folder-hover-bg) !important;
}

:root[zen-sidebar-expanded="true"] :is(zen-folder, tab-group:not([split-view-group]))[zia-drop-slot]::after {
  opacity: 1 !important;
}

/* The folder a tab was dragged out of isn't highlighted, though Firefox
   keeps it hovered until the mouse next moves (tab dragging) */
:root[zen-sidebar-expanded="true"]:not(#zia-none) :is(zen-folder, tab-group:not([split-view-group]))[zia-left]:not([zia-drop-slot]) {
  &::before {
    background-color: transparent !important;
  }

  &::after {
    opacity: 0 !important;
  }
}

:root #tabbrowser-tabs:is([zia-settling], [movingtab]) .tabbrowser-tab[zia-drag-away],
:root #tabbrowser-tabs .tabbrowser-tab[zia-drag-away][zia-dragging],
.tabbrowser-tab[zia-drag-away] {
  opacity: 0 !important;
}

:root #tabbrowser-tabs:is([zia-settling], [movingtab]) .tabbrowser-tab[zia-to-essential],
:root #tabbrowser-tabs .tabbrowser-tab[zia-to-essential][zia-dragging],
.tabbrowser-tab[zia-to-essential],
[split-view-group][zia-to-essential],
[split-view-group][zia-to-essential] .tabbrowser-tab {
  opacity: 0 !important;
}

/* a split's tabs are kept showing while they're dragged (05-tab-dragging),
   which outranked the fade above as the split turns into a tile */
:root #tabbrowser-tabs [split-view-group][zia-to-essential],
:root #tabbrowser-tabs[movingtab] [split-view-group][zia-to-essential] :is(.tabbrowser-tab, .tab-group-label-container, tab-group),
:root #tabbrowser-tabs[movingtab] [split-view-group][zia-to-essential] :is(.tabbrowser-tab, .tab-group-label-container):is([zia-dragging], [zia-shift]) {
  opacity: 0 !important;
}

.tabbrowser-tab[zia-essential-proxy] {
  display: flex !important;
  visibility: visible !important;
  opacity: 1 !important;
}

/* out over the page, where its page's picture stands in (an inline style
   can't hide it against the rule above: this sheet's !important wins) */
.tabbrowser-tab[zia-essential-proxy][zia-over-page] {
  visibility: hidden !important;
}
@font-face {
  font-family: "Zia Slot Arrow";
  src: url(data:font/ttf;base64,AAEAAAAKAIAAAwAgT1MvMiXaNTQAAAEoAAAAYGNtYXAADOBTAAABkAAAADRnbHlmo0LvdAAAAcwAAADSaGVhZDD+a24AAACsAAAANmhoZWEG3AQ3AAAA5AAAACRobXR4BgQAAAAAAYgAAAAIbG9jYQBpAAAAAAHEAAAABm1heHAABwBKAAABCAAAACBuYW1lF2PtXwAAAqAAAAB1cG9zdHN4dNgAAAMYAAAALAABAAAAAQAAgO7sOl8PPPUAAQPoAAAAAObsk+kAAAAA5uyT6QCP/8QDgQL4AAAAAwACAAAAAAAAAAEAAAPo/wYAAAQQAAABHgLyAAEAAAAAAAAAAAAAAAAAAAACAAEAAAACAEgABAAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAwMCAZAABQAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAPz8/PwAA4ADgAAPo/wYAAAPoAPoAAAAAAAAAAAAAAAAAAAAgAAAB9AAABBAAAAAAAAIAAAADAAAAFAADAAEAAAAUAAQAIAAAAAQABAABAADgAP//AADgAP//IAEAAQAAAAAAAAAAAGkAAAAEAI//xAOBAvgAEQAjADUARwAAJQ8DLwMRPwMfAwMXFw8DLwQ/AxcXITc3HwMPBC8DNzcFHwMPAyEvAz8DAjwECxEUFBELBAQLERQUEQsEDwsEBAsRFBQR0AsEBAsRFBQRAVYRFBQRCwQEC9ARFBQRCwQECwFqFBELBAQLERT9dhQRCwQECxEUvBQRDAQEDBEUAggTEQwEBAwRE/4PERMUEQwEBAzQERMUEQwDAwwMAwMMERQTEdAMBAQMERQTEaYEDBEUExEMBAQMERMUEQwEAAAAAAAABAA2AAEAAAAAAAEADgAAAAEAAAAAAAIABwAOAAMAAQQJAAEAHAAVAAMAAQQJAAIADgAxWmlhIFNsb3QgQXJyb3dSZWd1bGFyAFoAaQBhACAAUwBsAG8AdAAgAEEAcgByAG8AdwBSAGUAZwB1AGwAYQByAAAAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAQIFYXJyb3c=) format("truetype");
  unicode-range: U+E000;
}

/* An open empty folder shows a dashed "Drag tabs here" slot exactly where
 * the first tab will sit (sized from a real tab by zia.uc.js), outlined in
 * the folder's colour, or a soft white for white and uncoloured folders.
 * (A folder emptied by moving its last tab out collapses, zia.uc.js.)
 * While a tab is dragged in, open or collapsed, the tab wears the dashes.
 * The slot is drawn on the container so Zen's own folder code never sees an
 * extra element; it shrinks away alongside the folder's collapse (the same
 * spring, zia.uc.js), and --zia-slot-y moves it with its folder's header
 * while rows slide aside for a drag. */
/* The slot's dashes, drawn: a 1px line round the tab's corner, in the
   colour given as stroke (--zia-slot-dash). Firefox's own dashed border or
   outline spread its dashes to fit each side, so their gaps fell between
   pixels and ran grey along the top and bottom. zia.uc.js draws each
   slot's to its size (two dashes centred on each corner, the sides' spaced
   evenly between, every one on a whole pixel); this is the stand-in until
   it has. The slot itself shows its folder's dashes live, from a canvas
   redrawn to size at every step of a sidebar resize
   (--zia-slot-dashes-live), so they never stretch. */
:root {
  --zia-slot-dashes-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHJ4PSI5LjUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY29udGV4dC1zdHJva2UiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWRhc2hhcnJheT0iMyAzIi8+PC9zdmc+Cg==");
}

:root[zen-sidebar-expanded="true"] zen-folder[zia-empty] {
  --zia-slot-dash: rgba(255, 255, 255, 0.13);
  --zia-slot-ink: rgba(255, 255, 255, 0.5);
  --zia-slot-glint: rgba(255, 255, 255, 0.88);

  /* lightened, so it still stands out against the folder's own tint */
  &[zia-folder-color]:not([zia-folder-color="white"]) {
    --zia-slot-dash: color-mix(in srgb, color-mix(in srgb, var(--zia-folder-swatch), white 45%) 35%, transparent);
  }

  & > .tab-group-container::after {
    content: "\\E000\\2002 Drag tabs here";
    font-family: "Zia Slot Arrow", system-ui, sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    height: var(--zia-slot-h, var(--tab-min-height, 35px));
    margin-block: var(--zia-slot-mt, 2px) var(--zia-slot-mb, 2px);
    margin-inline: var(--zia-slot-ms, 16px) var(--zia-slot-me, 7px);
    overflow: hidden;
    background: var(--zia-slot-dashes-live, var(--zia-slot-dashes-image)) 0 0 / 100% 100% no-repeat;
    -moz-context-properties: stroke;
    stroke: var(--zia-slot-dash);
    border-radius: var(--zia-tab-radius);
    color: var(--zia-slot-ink);
    font-size: 12.5px;
    white-space: nowrap;
    translate: 0 var(--zia-slot-y, 0px);
    pointer-events: none;
    /* (there at once as the folder opens, as its tabs are; it fades as it
       closes, below) */
    transition:
      opacity 0s,
      translate 100ms ease-out;
  }

  /* As the folder opens, a light passes once through the words, left to
     right, the way an AI's answer shines while it's written, then they rest
     in their usual grey (the light is the words' background, cut to their
     letters, the arrow's among them; the dashes stay as they are) */
  &:not([collapsed]) > .tab-group-container::after {
    background:
      linear-gradient(100deg, var(--zia-slot-ink) 40%, var(--zia-slot-glint) 50%, var(--zia-slot-ink) 60%) 0 0 / 300% 100% no-repeat,
      var(--zia-slot-dashes-live, var(--zia-slot-dashes-image)) 0 0 / 100% 100% no-repeat;
    background-clip: text, border-box;
    color: transparent;
    animation: zia-slot-shine 1.6s cubic-bezier(0.45, 0, 0.25, 1) 0.15s both;

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  }

  /* Like a tab, it stays where it sits while the folder opens over it or
     closes on it (fading out as it closes), and only gives up its room once
     the folder has shut: the folder's own time, the spring's with folders'
     spring on, otherwise Zen's (0.18s) */
  @media -moz-pref("zia.folders.bounce") {
    & > .tab-group-container::after {
      --zia-slot-time: var(--zia-spring-time);
    }
  }

  /* (a folder inside a closed folder keeps it hidden too: with a tab
     selected in the outer folder, Zen shows that tab alone) */
  /* (it fades as the folder's tabs do as it closes over them, 06-tab-
     animations: quicker, it was gone before the folder had moved, a snap) */
  &[collapsed] > .tab-group-container::after,
  :is(zen-folder, tab-group:not([split-view-group]))[collapsed] & > .tab-group-container::after {
    height: 0;
    margin-block: 0;
    opacity: 0;
    transition:
      height 0s var(--zia-slot-time, 0.18s),
      margin 0s var(--zia-slot-time, 0.18s),
      opacity 220ms ease-in,
      translate 100ms ease-out;
  }
  /* (there it shrinks away with the rest Zen hides, rather than waiting
     for a folder of its own to shut) */
  :is(zen-folder, tab-group:not([split-view-group]))[collapsed] &:not([collapsed]) > .tab-group-container::after {
    transition:
      height var(--zia-slot-time, 0.18s) cubic-bezier(0.42, 0, 0.58, 1),
      margin var(--zia-slot-time, 0.18s) cubic-bezier(0.42, 0, 0.58, 1),
      opacity var(--zia-slot-time, 0.18s) ease-out,
      translate 100ms ease-out;
  }

  /* A tab dragged in takes the slot's place: the slot fades but keeps its
   * room (the layout never changes mid-drag), and the tab, which would
   * cover it anyway, carries its dashes instead (below). */
  &[zia-drop-slot]:not([collapsed]) > .tab-group-container::after {
    opacity: 0;
    transition: opacity 100ms ease;
  }

  /* (back as a tab dragged in goes out again, it fades in) */
  :root[zia-dragging-tab] &:not([collapsed]) > .tab-group-container::after {
    transition:
      opacity 100ms ease,
      translate 100ms ease-out;
  }

  &:has(> .tab-group-label-container[zia-dragging]) > .tab-group-container::after {
    transition: none;
  }
}

/* A tab dragged into an empty folder, open or collapsed, wears the slot's
 * dashes, so the drop spot stays marked while the tab is over it. */
:root[zen-sidebar-expanded="true"] .tabbrowser-tab[zia-dragging][zia-into-empty] > .tab-stack > .tab-background {
  background-image: var(--zia-slot-dashes-image) !important;
  background-size: 100% 100% !important;
  background-repeat: no-repeat !important;
  -moz-context-properties: stroke !important;
  stroke: var(--zia-slot-dash) !important;
}

:root[zen-sidebar-expanded="true"] tab-group[split-view-group][zia-dragging][zia-into-empty] > .tab-group-container {
  outline: 1px dashed var(--zia-slot-dash) !important;
  outline-offset: -1px !important;
}

/* A coloured folder keeps its usual colour while a tab is dragged into it
 * (its shine marks it as the target): not the plain hover wash, and not the
 * hover tint either, which flickered off and on again as the tab dropped. */
:root[zen-sidebar-expanded="true"] zen-folder[zia-folder-color]:not([zia-folder-color="white"])[zia-drop-slot]::before {
  background-color: color-mix(in srgb, var(--zia-folder-swatch) var(--zia-folder-wash), transparent) !important;
}
:root[zen-sidebar-expanded="true"] zen-folder[zia-holding]::before,
:root[zen-sidebar-expanded="true"] zen-folder[zia-holding]::after {
  bottom: var(--zia-hold-inset) !important;
}
@keyframes zia-slot-shine {
  from {
    background-position: 100% 0;
  }

  to {
    background-position: 0 0;
  }
}

    #tabbrowser-tabs :is(.tabbrowser-tab,tab-group[split-view-group])[zia-dragging],
    .tabbrowser-tab[zia-essential-proxy]:not([zen-essential]) {
      box-sizing:border-box!important;
      transition:padding-inline 180ms cubic-bezier(.2,.8,.2,1)!important;
    }
    #tabbrowser-tabs :is(.tabbrowser-tab,tab-group[split-view-group])[zia-dragging][ztt-folder-target],
    .tabbrowser-tab[zia-essential-proxy][ztt-folder-target]:not([zen-essential]) {
      padding-inline:var(--ztt-folder-inset)!important;
    }
    @media (prefers-reduced-motion:reduce) {
      #tabbrowser-tabs [zia-dragging], .tabbrowser-tab[zia-essential-proxy] { transition:none!important; }
    }
    :root[ztt-moving-topic] .ztt-header[ztt-pin-preview] ~ .tabbrowser-tab[zia-dragging] { visibility:hidden!important; }
    .ztt-header { user-select:none; touch-action:none; }
    #tabbrowser-tabs .ztt-header[zia-shift] { transition:transform 100ms ease-out!important; }
    #tabbrowser-tabs .ztt-header[zia-dragging] { transition:none!important; }
    .tabbrowser-tab[zia-essential-proxy][zen-essential]:not([zia-split-tile]) {
      border:0!important; outline:0!important; box-shadow:none!important;
      background:light-dark(#e0e0e0,#333)!important; border-radius:var(--border-radius-medium)!important;
      & > .tab-stack { visibility:hidden!important; }
      &::after { color:light-dark(#929292,#aaa); }
    }
    [ztt-drag-width] {
      box-sizing:border-box!important; inline-size:var(--ztt-drag-width)!important;
      min-inline-size:var(--ztt-drag-width)!important; max-inline-size:var(--ztt-drag-width)!important;
    }
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
    .ztt-create-shortcut { margin-inline-start:auto; color:#b8b8b8!important;
      opacity:1; font-weight:550; white-space:nowrap; }
    .ztt-create-divider { border:0; border-top:1px solid color-mix(in srgb,currentColor 12%,transparent); margin:8px 4px; }
    #zen-create-new-button .toolbarbutton-icon { rotate:0deg; transition:rotate .2s ease-out; }
    #zen-create-new-button[ztt-create-open] .toolbarbutton-icon { rotate:45deg; }
    @media(prefers-reduced-motion:reduce) { #zen-create-new-button .toolbarbutton-icon { transition:none; } }
    .tab-reset-pin-button { display:none!important; }
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
    :root[zen-single-toolbar="true"] .zen-essentials-container:not(:empty) {
      padding-block:5px 8px!important; }
    :is(#back-button,#forward-button,#reload-button,#stop-button) > .toolbarbutton-icon {
      border-radius:11px!important; corner-shape:squircle; }
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
    :root[zen-sidebar-expanded="true"] zen-folder > .tab-group-label-container .tab-group-folder-icon {
      left:9px!important; }
    :root[zen-sidebar-expanded="true"] zen-folder > .tab-group-label-container > :is(label,#tab-label-input) {
      padding-inline-start:36px!important; }
    @media(prefers-reduced-motion:no-preference) {
      #urlbar #urlbar-input, #urlbar #urlbar-input::placeholder { transition:color 110ms ease-out!important; }
    }
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
  const CREATE_ICONS = {"space": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAAAXNSR0IArs4c6QAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAASKADAAQAAAABAAAASAAAAACz+WTVAAAIcElEQVR4Ae2ZebDVYxjHC8mSKLS53IqUESGUZSyRZUpkYsYSkjS20TKTyBKDaZiJWyRDTX8YjHXEiISxhDZLItG0DVNSJFFJ+Hwav+b0m/c91XV/99zq98x8Oue87znv8rzP833e361WrdxyD+QeyD2QeyD3QO6B3AO5B3IP5B7IPZB7oLo9sHN1TxiZbw/aW0AbqA9r/4OXHdvK2H5vmAi/wT+wGqbCjXAA1IYdzvZhx5fB+/AH6Jg0q2ibBv2gKewQVpddng7Pwwr4G9KOSX/+ne9Mgh6wF2yXZpq0hQr4HtZD2hHFPuvIn+EpOAnqwHZj6swgmAV/QsgRK2n/EJ6EN2A5hL73F+0L4QFoDdu0PjVgA9fAFCimMzrmWmgMblh9Mp0mQCLcaWdZ5T6D/qCQb1OmzpwDRkLMMevo+wSugv0hfd3QUQrzpaCjYuMYkY5zOXg9qNG2E6s7GsbAMogJ8Bz6BkNzSDuGpk3MMRuBkWhFM8XS0eQ8VrxX4HSokfp0EAsbCvMgtAk3tRgq4CjYFbbGduHLLeEOmAtpJ/lZ4f8RRsHhUCOsIavoC59DTIB/pc+yfgZ4Y/4/Zvq2B52gM0KO8oCM0luhDEpiLvRcmARrIbTQNbSrQxeAwquuVJXtyUBnw0vgAYTm11EzoCdUqz61ZsLR8AuEdMY2F9YLjLCqdAzDbTTHrQfnwdsQOijXosDryI6QuR3DDC9CLJ3UoCFQDpsTYL5SJaaQ7wdeFUz10KEZTR+AUZeZ7cbIiqQVIx3SVq3HoB2Uqop4IAr53bAQ0ms05UdAU8jEmjHqSEiH8mLaBkFV6wxDVsosBL1gNhQ6yah/Fo6ATGxzEfQ4sx4FpYygg5n/HlgEhc7xfeYRxBwbLoLFNGg+37kdyqE6NcjbuBo0E0Ia5M1dDToLMrekiq1gptBibPsUDPN9oTZkYY5rFTsfrGKhwuFaqrWKMd8Gq8u/XSBWXpOQfpPvdIeq1qctvQd5UFdCtd6DmG+jec+5Dr6A0AnqqKq+SR/LmFbMpeD4aSzp38JtUAY1wspZxd0wH1xgetF+ttpVgEJe2Wcx9W0uhMZfT7tO03ltIavUZujKmRc2L5JjYTmE9MmNzYFboDlsTsgdsxH0hmkQcr7zeDcbD52gVFWUqbfMvA74nKb+KJCh07aqfAxXghVIRxSap98ULoHXITaOaT0FesLeUHLzkjUMBkEZpDdG00ZTnyy9nnxsg5685bcPNAYdo6BfCDqm2F8U1b2B4Dpi5niuoxc8DKdBZmbl8jlrJZjv0yE5ORcSMzdgSn0NMSF3TP/0anoaeaZoKPJMsUXwILSG2Ly2J5E8iffO60VRJzWCTKwZo6YfNZzUk/YC5hU/tmAjzejz9z+ADg45INamzvjXg6fhZCimMxaAE+ApsIImY+qkZ8F1ZGI64C7w/6mSSZNXF+/pW4KLLd4oPANeABfvxpMxYq/O9w5cBMXuMwr+oaAEeAjp8dbS9ggcAJlZB0Z+FWKpspC+odACXHDMGtBheppWqyG9GT+rTzNgABi9MTM6TRvvY7MgNJapqZh3hczNEB0H6kYoAmzzBns17AuxtKOr1oHQBybCb+DmdNhUuAk87djvba8H3cAIix2akaMMnAKxseiqWjPdesBksGSHTk19mgA+K1mZii3O8dqA+uIBFEslumv5qNEZklQNzW/UGFFGVkMoiRnapsBsiDlqBX3PwGmgI/6PKcBHg2K/BGKOWUDfvdASaoS1YhWW3u8hVqHs8zttoQ5sjaln5TAI5kDIMab2chgH7UFtqlHmJiyvltJYhXIThv3NoL4UE3K6N6SlOnY5TIaYzqhb6lgX2A1KZp7KXqAGxDTFvgvhPVCHQqetcL4Llu6YPu1PnwL8IiQCnh7LtP4c+oKODJnr9HqhoG9t5IbGK9p2Ab2WSzffHYo5qjH9/WAmxBy1gj6F/BJIhNSNnAPPg/ertFP8bCSpe3dCMZ3RIafCy/AN9IHMUm8fBh8GyWZX8f45MK12gZi1oOMemAsxIf+ZPh01HKxMiyHkGPXNvlHQDmKb1TFq3UhYBo5l1I6FQyATa8KoFZA4KNnAEtoeAhcUc5RacxyMgaWgFiW/39JXdc1I6AwxnXGeg2AIzIPCsY06H1UOh0zMyW8ATzC0wW9pHwiKb+xkLfNdwYubEVi4gdj71XxvMlwFSRrydhNTZxrAFTAd0pXU9apjQ6EeZGbee+4DUyLkJC9nbuZi2BtceMgUYC9wbiYdkYmjdMxXcCeUQ8yMpjPhVfA3ye8LX/+g/QloBZmbwnwZzAAdUriQ5L3RYfU5BawgMVMP+sNH4Cb8vanwJQyGlmDkhmx3GtvDKFgGydyFr0aSke0c+0G1Whmz3QULIB3SySLVp9FwPMR0g64Npf5YXrvCieBmYmlah742YCQvgmSuwlfX8yM8CodBycwUspo8Di4o5qh59N0BB0NMyOkqajqsKVwPX0BoLtN+JVhdT4LKzsVPq9Y81U4wHkwvF1p4or43HadBb1CDYhFC1ybmIdQH72BvQUxnLOPvw0WQqRAzfqVNYe4Jn4BaknaSn3+H16ALbG4jpqUpNw4sDKHx1tE+GwZAE9gmTH0aAt9BTMh/ok99OhmMkEJTgG1XQxZCzDE/0DcCSqozzF8pMzWOhApYBDFHea9SwzqA9yQ3qwCrW6FUtU3njgXFv8boDGuplKlPRoO3WNMktmn75sNSiDlTfZsA3WBP2K6sPrtRQN8BdSiUNrG2NXzfe9d10Ai2a7NUK6gzwcoTc4rtRtJ8uB9awQ5j6pNaMxwU4XTF844zF0ZCR9jmdYY9VMrUJx01GKaAjwyzYBj4GFHsMYXu3HIP5B7IPZB7IPdA7oHcA7kHsvLAvxxRtqokcoeMAAAAAElFTkSuQmCC", "boost": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAAAXNSR0IArs4c6QAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAASKADAAQAAAABAAAASAAAAACz+WTVAAAH6ElEQVR4Ae2YCaxV1RWGqUUtglMdMAFBsc5SrXFGRE0VqbNWoyEWbePQJhoTU8eo1dTEMRHHtgSE1llUbJxK1DghWodqnQlScEgFxBlnq9/XvJWsbO99AyrvvHfPn3w5++yzzzl7/2fttfe9ffrUqh2oHagdqB2oHagdqB2oHagdaODADxrUdVfVMrx4bxgDA+BpmAILoeXVDwfuhK8K3uJ8F2h5jceB0pw4f5trRlXLakVG/i6EIeXxf1x7A0ZDS8q8owmlMfk8TPpFKzp0bmHOq5xr2t1FvYb9F/aCltLDjDZHy9mc94WVYVpxzXZvwj7QEnL1+hiyQdunka9E+e/F9TBpv9Su1xZHFIN3xVq2GO1Azm8t2mnSfDgQerV+z+hy9NzSZLRrUj+1aBsmHdzknl5RXeaY45qMyh3/UCgjydVtHpjUe53ML+5vcgRt0M4oNWkI3Fzco0kvw77Qq+SAFkMY9BJlV6/2pElrw40Q93n8EjTpAOg1up6RfA4x0As6ObIw6dp0b5g0i7pfdvI5lW62Cb1bAGGOx6260GNNGgTXQH6GkTQbenzivopBfJYG9zjlcnmnql2FSbfRqpFJh7Z7dycvdjTnO/mYDpuNpIV7ltVhEewP2ZDLOXe6dUWa4r7J/VCW/yutC38Ey0ZZZeVX/i0YIQ4kBuTKE1/dvLEGLIn8Y81nx7PyUcOfBD9GJeXXOx5egWxIHoT142BJ5PP9WfIR5GfmsiY9BZXbcdv538FcaGaOA/F32NawJOrHTRMhG9KoHCbtuCQv+b7u0RynTjbH8ryi7gvO74eNoCv6IY3HgFM2m2LifwbKzaT114E/Wbpdu9GD58AlNzqvEefBCDgH8i94v/AD4NLfGZnXhsBjEM/36DP9KbItbAEakq/P4fxX0O2aQg+yAZrjijIYHNxa8AfIbTTpYdgMOtIqNJgMRkUY4H9Ep8P6YHSJU9doijbvUb4Cul2uKpoSHXuQ8lDQnNBACg4oJ1jvmQGbQzP158J4cLA+/1PwB+8eUE4ftxT5HwDfdTV0SSbT71rmBfNNaCUKfeOk7Tifo9MhcoXVfnV30+avdaCUff0p7Nl2YSbHS2ECPAQLIOSzBsGwqOBoxLkH65J80HetFXngCFih7cGrcuwHL4BfPuSAZoF7oI3BCLM/mqCpz8M7EPK6bT3eATeBv+f+DU7RkM/wX4ETYDeIIHid8iSwH90qc8yV8CHENDO8rVsPHGDWppyYUHNS92tPBNuX0uxm0pxNQCM+gXi/5T+BBldCG9KLP0PupEnZup9AaZKDugaySUbFVdDIJKq/Ic0xyU+B/F7z1HTYEiolw9wB5s5angBeK01yL2QSzQlek8JUik2lOcPhb5Dfpzn/gF2hfB9V3S8H7VQxeiLc7bRTwCW57LSR91fIJnlvmErxG/IZ5i3N9dnxHo26C3aGSstocYDmlei85YvgR1BK4yaD0RPtNUmjNTDLBGyd07M053bqRkHltTw9/A0shhiwx+fBFa+RtqHyccg56QPOT4RItEbOmm11eVoZfc/AWKi0HMBg2BdmQJ42GmRu6A/N5J7oMcgmafIpoDFyMpTmPE3dIVBp+XNga7gY3oUcOQ7IvcvPweTanlx5jKRs7kecnwWnQjbHKak5B0FlZU5x03csPAvuqMMcI2EeTIMdIMyJSDOXNJpy21NvJGWTfFbOaZrzJBwIlZTJcm04AKZD/rIa5K75ITgG3CWHNMcouRxMqkfBapDls7eDRyGblI1/gmtO5UpqAL1yOl0G5XTyp8W/wCmhgRqSNYSTf0IM1qg4CVaHLE3aBmZCXt28z3fsA5XUQHp1GJhT8td1oLPhL7AFOMBSrm4XQpgTRw0wETcyaSvqXaGircfXoYw6qrpfThVzzULIHV7M+XNwBCwHzTScC/Mh3xtlTToSVoAsTT0Zop3HD8EpWCmZjO1onlIm5LdgAqwDjaKG6v/L+2+APF281+Qbg/fa0RBbAafnunAPRBuP9uFnUBk58L0gR47Tay4cDv2gI+1JAyMtBqo5TtUXIJvkc42kVWEY3A5xj0fbPgLtRSqXl67W4HV3QwzEyHFKjQI7qkFOjWYRtDLXXJHifvPVCaA2BZ8V1zTBfc+V8CBkc3zvHBgJldKv6c1ciM66hO8E5oehMA5ssyGUJrn30Qx/W8X97rKXhdBGFJ4FoyfalEfNeQXGQOU0kR6ZGKPT51M2KobCTIi88iLl9cDcEVqfwmvgAL3f54yAUppbrozxPqNrNowub6rKeZ5edtoNmlPrDHBPEgPxeCYsD8ppdx2EgZo0CZppAy64O865ysh7CXaHpaJyCnT0UqPBe3JUaIQaAOXzjKy4Z2/Kbuj6gnoHjL5mmsUF20+Dt2ER3AtjYTpUVpPpWf6qDnIV2BHmgEnXKHkfRoKGOGXy1DK/uE2I6KLYrmznB+gROopezoOYSn7ZHcBEOxpugjtgf7BuLcirlvc9AS7dvVKDGNV9YA4Jk1yat4P+4DQT85JtnQ55RTIxjwJXtF4r88ACCIM8LoRzwGjaHI6EWZCN/Izz06GzU4umPVNGyCVgos0mtVfWHKdfj8kl9PVbySgYD+agHCWNTHJ5ngo/hpaSkXQcvAnNTPqEa+eC+6CW1WBGfho8Bf52cjr9B5yGG4NG1mpzQDPyRrI2pnagdqB2oHagdqB2oHagdqAHOvA1/X30V/PMcC4AAAAASUVORK5CYII=", "split view": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAAAXNSR0IArs4c6QAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAASKADAAQAAAABAAAASAAAAACz+WTVAAADWElEQVR4Ae2aO4sUQRSF1/f7sYIrBpoYKGJgoIIKBmsgioGBbGpk5E/wPxiYmBkJGqqBGC6+Ak1MREzE3VQEFV186/lkGotipm/31MBOr+fCobu6um7d+up2zcLeiQmbCZiACZiACZiACZiACZiACZiACYwZgWUF8TC2ZHzB1K2H/tYI1NraLnC9ZtgkbZQmpS3SSmmc7buC+yi9kz5Ln6QFaaQGyJ3SJemhxIS/pGpnxv1KrB+kWemiNCW1TQ4NGWx71HVfYjfGHUYU3zet4a60SxqJrZEXHJKWXcqaQaBYA5/aTWm1VGtN0uy0PNyROGuq95mcSaqM0m2R4Xtz5oHP+Ef2bJgmMQOC8zONn9hPSo+kgdbkgJ3R6FWJB+C8lm5LL6UvUokt1+C90uXMyRW1mYcdLzHAHJDOSbt7jiporK0WUO/92gsQ0nR9q/a0xC8ZOwO8EvEJ4y+dg/tjEn0lvhlLjGTnWem9lM7zVO1i4/RPnd5Qe3ux138OVuj2hJTOwf0Riewale2QI87SdJ75yHmTADZkTubU5pega0bMb7Kg83Mv6262Q+xwal/VYBe6ZsRM7KmFCRK+kHrr3XcRTrWM1rEPA6ia7L+4GlCwzQZkQAGBoNsZZEABgaDbGWRAAYGg2xlkQAGBoNsZZEABgaDbGWRAAYGg2xlkQAGBoNsZZEABgaDbGWRAAYGg2xlkQAGBoNsZZEABgaB7mAyqSkgC12PZ3Tr2JoB+Zktdq3briTIfi9Ek5nXZxPnasu5m/5unkCm1/WpQc9M1I2ZiT43KlVprUkA1Jw+TiZdp3VOZdU9akFr/v1tjUqM4ol8pHM/I1nCXU2d97skcapnOSEezftZWa00APZaHg4kXyoCp/jovvZLyigk9amUsoF9B5QU9PyWVbgCf1T7puARwDJ/M+4RGnfFSZBQyPZDY0fR9wIyqRpEsyj9bsrM0e+Tib8zEjioDEKWDh6UX1cNhr5SxXZdwiOOlINZyVWryBem12Kb0yjVpKUBiDRwR26TQ0k8mepmD+pA007tybmyV8go0PRoro5SY4s156Zl0S3ou8Sy0NoBwxt9NfMukJvdtx2vIohjHAuXEwKJWkXubCZiACZiACZiACZiACZiACZiACXSTwB/IKms6iWXW/wAAAABJRU5ErkJggg==", "folder": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAAAXNSR0IArs4c6QAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAASKADAAQAAAABAAAASAAAAACz+WTVAAAEV0lEQVR4Ae2azctUVRyAtbKMrBaWpRkVKWIUGEKBLXThtmjhLmqRi2pTu9JdgYJ/gbuoRS4ECxeCRIEEQUIEZbWI/CDKIg37/v58HpkD5z3NmXtn7sz73ld+P3g4c8/MPR/P+bgzc++SJRFhIAyEgTAQBsJAGAgDYSAMhIEwEAZ6ZmBpx/bUzv+3Y7m9Ob3WwVoDl/PGCjC9Aq6EWvzNG38M+In0V/gHLtm4gZ49Aq/C5/AnOFNG8S3vvwVPw0a4Ci7JWE2vDsMoGU3vvcf5D8P1MO7M5ZT+xjKa9hL8Dk0SRr3vjPsMnoRbwCXa+2gzklvoxTEo95u/yHOPGbavXDb4fCnBz7ofHYSX4QwozlDuLMI6xQFOg9y6njaC9lPaU0WJP3J8YsAvpHnnlONG7p6zHty7clF+VrE/wCn4GpIkXk410oCco9QP4R04Dw7S1OJ9SrJTCWfO82DHrwavaCXmXwsPwttgg2xsKsPUY8UoK43uLNLfKF8c1JOwC2z71OICJeUdc9RXtSzdmXM7vAJe+ZSblzWfrx0Qv3p8DwfgGphKlJ06QqnjFO4ydjY9Bm+AohxNZ44NtuGzpBwE67Lu3dAYbfYgK8jjNQ4eBfeecUKp62AbbILV4NJs0wY+NlFczlnWe/OAvJBPOLAdLr9quATGjVJY2/N/5oMfgUvUK6J1z1IOxV8s/ybSh+AZWAkpHKwN8EHKGJZOImhYOW3zXFJu2PMZ56nsS7gNdmYVO7vugpkL8ueD346tcNYzgioaI+05Lp3vwEHxJ8+bkAvisPlq1nUGuVS2wmbwu09fwk3YWXMUvgCl+X2rjMbfhl0F3UGNL8Aa6NMMUoRL2f1njweEV68yGmd8V0H3UOPd4JWisbKydTM+dmlthyTIWTR2dBXk+U5lvzn3LRQ08hLepsFdBR2nkmfB3199DH/vdYqugs5S+zfQt+WlFJdUvu8syBLzx+asfonbyQWPvi6NBReTGhCCkolKGoIqYlJ2CEomKmkIqohJ2SEomaikIagiJmWHoGSikoagipiUHYKSiUoagipiUnYISiYqaQiqiEnZISiZqKQhqCImZYegZKKSTiKoj/8eVro3J3uSvrb6L7n8x7CPdzDmmBhy4KDa7jLKvpXvtxLk3ck8vM1zHSymmeQNzvvyTgxe+yjMyGjzp/1pSrgxK8WnMp6DfeBdg4n+DOe8+YplVHQ/PF5UaLtPFXn/O2wzCxShkDx8UuNT8GkN72D2VZJy1sK94ENfeX8d3Fth5K2h/AQ+OzQ2kvsulGs4PYiU31oZWsACZto/b4m7xFI4mPIiPDF4TTJ5WMFeSAUv9tQ7rl/BOphauCkryacmFrMg5XwM26DVZb/NEqOsi6EkHzjaAQ/AneBzQfn05bB34aBeAPfL1+EQnIXGSzyfmbNpedwUClWIV7++PO7S1Gbfd9Y7e5SisIgwEAbCQBgIA2EgDISBMBAGwkAY6LGB/wDJ1JG2jgbY3wAAAABJRU5ErkJggg==", "new tab": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAAAXNSR0IArs4c6QAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAASKADAAQAAAABAAAASAAAAACz+WTVAAAEmklEQVR4Ae2az8tVRRyHLdOyLNNQkbSNQmItXGgkLkRd6apA3ImrIuj/cKlgC3eugnTTDxcWuBHNEN2IUP5YyPu+UGE/1KTEMsvngTswzHvve85577nnzpX5wMM5Z+45M9/5nDkzc+bcBQuKigPFgeJAcaA4UBwoDhQHigPFgeJAcaA4kJkDzwwRj9cOc/0QRTe+9H+ukMZqWsEXKeFlWArLYRk8BznrEcHdh9/hL/gTHkCr0sg18DGcBwv8D8KdyX1rrH/AWfgAVkHTxsElg7Wen74B70buZlTF9w91OAXroBU9Ty5maLOcpFYzyCjr4KP2GSyGOVWnme0hh6/Aviacb+EWEloUu9nKmDXC/jOO39h3w7cwUHU62P1cvSjKQXNuwZdwDR5CztKYt+E9eKMXaDDNug1t0Lu9TMPG0eBDuAQ+zxrWhsLdDXm1me8LZHoGPgVH3qC0biG90dbe32ADFrKyUQ55nLyaMOxLQz3czlSF9mzVCfz+UnLONMe2nEmTMU8lQb+SHM86rGPQwuSqvznW/UmTMRt7rMr6V54Q59bbH6U5YZbep9hWkhrHXmcUayWyiky8URtgOzhPcbY+1dtnMz7lYpDvdodgJ3iXnbV/BL43jVXzecTaDtjh3VFxL6yA1+B9eBXGrlwMsgUtidxwcmdaOjeKTulmNweDrGk6Ug5K68aVqJRcDIpCymu3GFRxP4pBFQZ1Ncy7pvQ6+KKY3hQ74jch1Vsk2HGnkzvnSffgJ0hnxiS1qy4McqlkI7i04HJD2iFr0HJIdZCE+5Aa9C9pU3ASboDHI1MXBvn6sAMOgC+HaQsiaZZppnmNrSVVaEE/8oPYmkamLgwKj9daatFkXpOuIsQmaPQaiBfy4t9b2+/CINeyXXm8CvZBqUkeW1ErHOtnDvotq4QWdJ3fH8YXjGK/C4N8nzoHzozXQ1qmBvmqYR8V6ywHdyDtg1xLvgkXwXXxkSoNdhSFPSbTGfgcNKJfJ+0olhr0BWm3IDXI/H6BX6FfH0Vye+rCIKN1pHFYllR22qkJnvNDj36/+Xsn6jeidFLwpBRSDKq4U8WgCTHIzjbua9y3Mx67cmhBmuPHyLugMR7/BuF7HLvjUw4GWXsN+QRmYBqOgIaNXV0N81UVdUZ8DL4GW9AUjPxNnTIqlYtBPlq3e1QG3eUJ83nE0nepLuMdtqzGsdcxKB1N/KdE44KGrVkL1xtz/OXELNO6zSqmjkEuWsXaxIGfZSZNxmzssRwp51SdPmiaHOIVv10c74bT8ADi+QuH81baKtvM15WEvbAtic66zak6Bl0gh81RLq4QHoZ9cAOyGG2IY5B8rFzy9bu/3YPSfG/Idx7MpfSu9Tv3HRLPwWKIz9cY12bautNkNRIZs7FLkDE7tdgK34fE+W5d7TsOZmjGTwPW5SjUeYI4rVqrOMWJ3NNgknWwi1gBlYofmaqT7ai3wP7edh1b/4GRrhCSlJVcrPPLxwxchhNwBUyrVBODzMxpgc+yTdP9ptdzyVhkt+ArjGb5IcD9ouJAcaA4UBwoDhQHigPFgeJAcaA4UBwoDkymA08AAbyr4RrK0EcAAAAASUVORK5CYII="};
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
    // Use the same viewport coordinates for the card and the create menu.
    const footer=document.getElementById('zen-sidebar-foot-buttons');
    const plusAnchor=document.getElementById('zen-create-new-button');
    function footerGeometry() {
      const anchor=document.getElementById('zen-create-new-button');
      const bar=anchor.closest('#zen-sidebar-foot-buttons').getBoundingClientRect(), button=anchor.getBoundingClientRect();
      const width=Math.min(224,Math.max(1,bar.width-8));
      const left=Math.max(bar.left+4,Math.min(button.right-width,bar.right-4-width));
      return {button,width,left};
    }
    if (footer && plusAnchor) {
      const alignPlayer=()=>{
        if (!document.getElementById('zen-create-new-button')?.closest('#zen-sidebar-foot-buttons')) return;
        const {button}=footerGeometry();
        const bar=footer.getBoundingClientRect();
        const width=Math.max(1,bar.width-8), left=bar.left+4;
        const root=document.documentElement.style;
        root.setProperty('--ztt-player-width',width+'px');
        root.setProperty('--ztt-player-left',left+'px');
        root.setProperty('--ztt-player-bottom',(window.innerHeight-button.top+12)+'px');
      };
      const resize=new ResizeObserver(alignPlayer);
      resize.observe(footer); resize.observe(plusAnchor);
      window.addEventListener('resize',alignPlayer,{signal:abort.signal});
      abort.signal.addEventListener('abort',()=>resize.disconnect(),{once:true});
      alignPlayer();
    }
    function positionMenu() {
      const plus = document.getElementById('zen-create-new-button');
      if (!plus || !panel.matches(':popover-open')) return;
      const {button,width,left}=footerGeometry();
      panel.style.width = width+'px';
      panel.style.left = left+'px';
      panel.style.transformOrigin = (button.left + button.width/2 - left)+'px bottom';
      panel.style.top = Math.max(4,button.top-panel.offsetHeight-12)+'px';
    }
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
  function installPinnedBehavior() {
    const manager = gZenPinnedTabManager;
    const original = manager.pinHasChangedUrl;
    const suppressReset = function(tab) {
      this.resetPinChangedUrl(tab);
      tab.removeAttribute('had-zen-pinned-changed');
    };
    manager.pinHasChangedUrl = suppressReset;
    for (const tab of gBrowser.tabs) if (tab.pinned) suppressReset.call(manager,tab);
    abort.signal.addEventListener('abort',()=>{
      if (manager.pinHasChangedUrl === suppressReset) manager.pinHasChangedUrl = original;
    },{once:true});
  }
  function installPlaybackIndicators() {
    const watched = new Map();
    function release(tab) {
      watched.get(tab)?.listener.abort();
      watched.delete(tab);
      tab.removeAttribute('ztt-playing');
      tab.removeAttribute('ztt-has-controller');
    }
    function sync(tab) {
      if (!tab.linkedPanel || tab.matches('[pending],[zen-unloaded],[discarded]')) { release(tab); return; }
      const controller = tab.linkedBrowser?.browsingContext?.mediaController;
      if (controller && watched.get(tab)?.controller === controller) return;
      release(tab);
      if (!controller) return;
      tab.setAttribute('ztt-has-controller','');
      const listener = new AbortController();
      watched.set(tab, {controller,listener});
      const update = () => tab.toggleAttribute('ztt-playing', controller.isPlaying);
      for (const event of ['playbackstatechange','activated','deactivated']) {
        controller.addEventListener(event, update, {signal:listener.signal});
      }
      update();
    }
    const tabs = gBrowser.tabContainer;
    for (const event of ['TabAttrModified','TabOpen','SSTabRestored','TabSelect','TabBrowserInserted']) {
      tabs.addEventListener(event, e => sync(e.target), {signal:abort.signal});
    }
    tabs.addEventListener('TabClose', event => release(event.target), {signal:abort.signal});
    abort.signal.addEventListener('abort', () => { for (const tab of watched.keys()) release(tab); }, {once:true});
    for (const tab of gBrowser.tabs) sync(tab);
  }
  function installTabActions() {
    const menu = document.getElementById('tabContextMenu');
    const owned = [];
    function entry(parent, type, id, label) {
      const el = document.createXULElement(type);
      if (id) el.id = id;
      if (label) el.setAttribute('label',label);
      parent.append(el);
      if (parent === menu) owned.push(el);
      return el;
    }
    const tab = () => TabContextMenu.contextTab;
    const targets = () => tab().multiselected ? gBrowser.selectedTabs : [tab()];
    const copy = entry(menu,'menuitem','ztt-copy','Copy Link');
    copy.addEventListener('command',() => Cc['@mozilla.org/widget/clipboardhelper;1'].getService(Ci.nsIClipboardHelper).copyString(targets().map(t => t.linkedBrowser.currentURI.spec).join('\n')));
    const unload = entry(menu,'menuitem','ztt-unload','Unload Tab');
    unload.addEventListener('command',() => gBrowser.explicitUnloadTabs(targets()));
    const profiles = entry(menu,'menu','ztt-profiles','Move to Profile');
    const profileList = entry(profiles,'menupopup');
    profileList.addEventListener('popupshowing',async e => {
      if (e.target !== profileList) return;
      profileList.replaceChildren();
      const tabs = [...targets()];
      const urls = tabs.map(t => t.linkedBrowser.currentURI.spec);
      try {
        const {SelectableProfileService:service} = ChromeUtils.importESModule('resource:///modules/profiles/SelectableProfileService.sys.mjs');
        if (service.currentProfile && urls.every(url => /^https?:/i.test(url))) {
          for (const profile of await service.getAllProfiles()) {
            if (profile.id === service.currentProfile.id) continue;
            const option = entry(profileList,'menuitem',null,profile.name);
            option.addEventListener('command',async () => {
              await service.launchInstance(profile,urls);
              for (const [i,t] of tabs.entries()) {
                if (t.isConnected && t.linkedBrowser.currentURI.spec === urls[i]) gBrowser.removeTab(t);
              }
            });
          }
        }
      } catch (error) { report(error); }
      if (!profileList.childElementCount) entry(profileList,'menuitem',null,'No available profiles').disabled=true;
    });
    const bookmark = entry(menu,'menu','ztt-bookmark-folder','Add Bookmark to Folder');
    const folders = entry(bookmark,'menupopup');
    const {PlacesUtils} = ChromeUtils.importESModule('resource://gre/modules/PlacesUtils.sys.mjs');
    async function fillFolders(popup,guid) {
      const tree = await PlacesUtils.promiseBookmarksTree(guid,{excludeItemsCallback:item => !!item.uri});
      popup.replaceChildren();
      for (const folder of tree?.children || []) {
        if (!folder.guid || folder.uri || folder.typeCode !== PlacesUtils.bookmarks.TYPE_FOLDER) continue;
        const option = entry(popup,'menu',null,folder.title);
        const list = entry(option,'menupopup');
        const add = entry(list,'menuitem',null,'Add Here');
        add.addEventListener('command',async () => {
          for (const t of targets()) await PlacesUtils.bookmarks.insert({parentGuid:folder.guid,url:t.linkedBrowser.currentURI.spec,title:t.label});
        });
        const children = folder.children || [];
        function appendChildFolders(parent,items) {
          for (const child of items.filter(c => c.typeCode === PlacesUtils.bookmarks.TYPE_FOLDER)) {
            const sub=entry(parent,'menu',null,child.title), inner=entry(sub,'menupopup');
            entry(inner,'menuitem',null,'Add Here').addEventListener('command',async () => {
              for (const t of targets()) await PlacesUtils.bookmarks.insert({parentGuid:child.guid,url:t.linkedBrowser.currentURI.spec,title:t.label});
            });
            appendChildFolders(inner,child.children || []);
          }
        }
        appendChildFolders(list,children);
      }
    }
    folders.addEventListener('popupshowing',e => { if (e.target===folders) fillFolders(folders,PlacesUtils.bookmarks.rootGuid).catch(report); });
    const groups = [
      ['context_pinTab','context_unpinTab','context_pinSelectedTabs','context_unpinSelectedTabs','context_zen-reset-pinned-tab'],
      ['context_zenSplitTabs','context_duplicateTab','context_duplicateTabs'],
      ['ztt-group-selection','ztt-profiles'],
      ['context_bookmarkTab','context_bookmarkSelectedTabs','ztt-bookmark-folder'],
      ['ztt-copy'],
      ['context_zen-edit-tab-title','context_zen-edit-tab-icon','context_zen-edit-pinned-page','context_toggleMuteTab','context_toggleMuteSelectedTabs'],
      ['ztt-unload','context_closeTab']
    ];
    const original = new Map();
    function restore() {
      for (const [el,[next,hidden]] of [...original].reverse()) {
        el.hidden=hidden;
        menu.insertBefore(el,next?.parentNode===menu ? next : null);
        el.removeAttribute('ztt-omit');
      }
      original.clear();
      menu.querySelectorAll('.ztt-action-separator').forEach(el => el.remove());
    }
    menu.addEventListener('popupshowing',e => {
      if (e.target!==menu) return;
      for (const el of menu.children) { original.set(el,[el.nextSibling,el.hidden]); el.setAttribute('ztt-omit',''); }
      let first=true;
      for (const group of groups) {
        const items=group.map(id=>document.getElementById(id)).filter(el=>el?.parentNode===menu && !el.hidden);
        if (!items.length) continue;
        if (!first) {
          const divider=document.createXULElement('menuseparator');
          divider.classList.add('ztt-action-separator'); menu.append(divider);
        }
        first=false;
        for (const el of items) { el.removeAttribute('ztt-omit'); menu.append(el); }
      }
      for (const el of menu.querySelectorAll(':scope > [ztt-omit]')) el.hidden=true;
      profiles.disabled=document.documentElement.hasAttribute('privatebrowsingmode');
      const shortcuts = {context_closeTab:'key_close',context_duplicateTab:'zen-duplicate-tab',context_pinTab:'zen-toggle-pin-tab',context_unpinTab:'zen-toggle-pin-tab',context_bookmarkTab:'addBookmarkAsKb'};
      for (const [id,keyId] of Object.entries(shortcuts)) {
        const command=document.getElementById(id), key=document.getElementById(keyId);
        if (command && key && !command.hasAttribute('key')) command.setAttribute('key',keyId);
      }
      unload.disabled=targets().every(t => !t.linkedPanel || t.hasAttribute('pending'));
    },{signal:abort.signal});
    menu.addEventListener('popuphidden',e=>{if(e.target===menu) restore();},{signal:abort.signal});
    abort.signal.addEventListener('abort',()=>{restore();owned.forEach(el=>el.remove());},{once:true});
  }
  function installActionTips() {
    const tip=node('div','ztt-action-tip');
    tip.setAttribute('popover','manual'); tip.setAttribute('role','tooltip');
    document.documentElement.append(tip);
    const rules=[
      ['.tabbrowser-tab[zen-essential]','',''],
      ['.zen-glance-sidebar-close,.tab-close-button','Close','key_close'],
      ['.zen-glance-sidebar-open','Expand','zen-glance-expand'],
      ['#zen-expand-sidebar-button','Toggle sidebar','zen-toggle-sidebar'],
      ['#zen-library-button','View Library','zen-library-toggle'],
      ['#zen-workspaces-button [zen-workspace-id]','',''],
      ['#zen-create-new-button','Create',''],
      ['#back-button','Go back one page','goBackKb'],
      ['#forward-button','Go forward one page','goForwardKb'],
      ['.zen-workspace-close-unpinned-tabs-button','Close all unpinned tabs',''],
      ['#reload-button','Reload current page','key_reload'],
      ['.tab-audio-button','',''],
      ['.tabbrowser-tab','',''],
      ['[tooltiptext],[title],toolbarbutton[aria-label]','','']
    ];
    const silent=document.createXULElement('tooltip');
    silent.id='ztt-silent-tooltip';
    silent.addEventListener('popupshowing',event=>event.preventDefault());
    document.documentElement.append(silent);
    let anchor, timer, previousTooltip;
    const nativeLabels=[];
    function hide() { clearTimeout(timer);
      if(anchor?.getAttribute('tooltip')===silent.id) {
        if(previousTooltip===null) anchor.removeAttribute('tooltip');
        else anchor.setAttribute('tooltip',previousTooltip);
      }
      for(const [el,name,value] of nativeLabels.splice(0)) {
        if(!el.hasAttribute(name)) el.setAttribute(name,value);
      }
      anchor=null; if(tip.matches(':popover-open')) tip.hidePopover(); }
    function renderCaption(caption) {
      const match=String(caption).match(/^(.*?)\s*\(([⌘⌃⇧⌥]+)([^()]*)\)([\s\S]*)$/u);
      tip.replaceChildren(node('span','',match ? match[1]+match[4] : caption));
      if(match) for(const key of [...match[2],match[3]].filter(Boolean)) tip.append(node('kbd','',key));
    }
    let dragging=false;
    function hover(e) {
      if (dragging) return;
      const path=e.composedPath();
      for (const [selector,label,keyId] of rules) {
        const el=path.find(n=>n.matches?.(selector));
        if (!el) continue;
        if(el===anchor) return;
        const caption=label || el.getAttribute('tooltiptext') || el.getAttribute('title') || el.getAttribute('aria-label') || el.label;
        if(!caption && !el.matches('.tabbrowser-tab,[zen-workspace-id]')) continue;
        hide(); anchor=el;
        for(const target of path) {
          for(const name of ['tooltiptext','title']) if(target.hasAttribute?.(name)) {
            nativeLabels.push([target,name,target.getAttribute(name)]);
            target.removeAttribute(name);
          }
          if(target===el) break;
        }
        previousTooltip=el.getAttribute('tooltip');
        el.setAttribute('tooltip',silent.id);
        if(el.matches('.tabbrowser-tab')) return;
        timer=setTimeout(async ()=>{
          if (!el.isConnected) return hide();
          const workspace=el.closest('#zen-workspaces-button') && el.getAttribute('zen-workspace-id');
          const spaces=workspace ? await gZenWorkspaces.getWorkspaces() : [];
          if(anchor!==el) return;
          const index=workspace ? spaces.findIndex(s=>s.uuid===workspace) : -1;
          renderCaption(index>=0 ? spaces[index].name : caption);
          const key=document.getElementById(index>=0 ? 'zen-workspace-switch-'+(index+1) : keyId);
          const letter=key?.getAttribute('key') || ({VK_LEFT:'←',VK_RIGHT:'→'})[key?.getAttribute('keycode')];
          if(letter && !key.disabled) {
            const mac=AppConstants.platform==='macosx';
            const mods={accel:mac?'⌘':'Ctrl',shift:mac?'⇧':'Shift',alt:mac?'⌥':'Alt',control:mac?'⌃':'Ctrl',meta:'⌘'};
            for(const mod of (key.getAttribute('modifiers')||'').split(/[ ,]+/).filter(Boolean))
              tip.append(node('kbd','',mods[mod]||mod));
            tip.append(node('kbd','',letter.toUpperCase()));
          }
          tip.showPopover();
          const r=el.getBoundingClientRect(), w=tip.offsetWidth, h=tip.offsetHeight;
          if (el.matches('.zen-glance-sidebar-close,.zen-glance-sidebar-open') && r.right+w+8<innerWidth) {
            tip.style.left=(r.right+5)+'px';
            tip.style.top=Math.max(4,r.top+(r.height-h)/2)+'px';
            return;
          }
          tip.style.left=Math.max(4,Math.min(innerWidth-w-4,r.left+(r.width-w)/2))+'px';
          tip.style.top=(r.bottom+h+8<innerHeight ? r.bottom+5 : r.top-h-5)+'px';
        },360);
        return;
      }
      hide();
    }
    const opts={capture:true,signal:abort.signal};
    window.addEventListener('dragstart',()=>{ dragging=true; hide(); },opts);
    for(const event of ['drop','dragend','pointerdown','pointerup'])
      window.addEventListener(event,()=>{dragging=false;},opts);
    window.addEventListener('pointerover',hover,opts);
    window.addEventListener('pointerout',e=>{if(anchor && !anchor.contains(e.relatedTarget)) hide();},opts);
    for(const event of ['pointerdown','keydown','dragstart','blur']) window.addEventListener(event,hide,opts);
    window.addEventListener('popupshowing',e=>{if((anchor || dragging) && e.target.localName==='tooltip') e.preventDefault();},opts);
    // Some chrome controls populate an anonymous tooltip only as it opens.
    window.addEventListener('popupshowing',event=>{
      const popup=event.target;
      if(dragging || anchor || popup.localName!=='tooltip' || popup===silent) return;
      const target=popup.triggerNode || document.tooltipNode;
      if(!target?.closest?.('#navigator-toolbox,#browser') || target.localName==='browser') return;
      const caption=popup.getAttribute('label') || target.getAttribute('tooltiptext') ||
        target.getAttribute('title') || popup.textContent.trim();
      if(!caption) return;
      event.preventDefault();
      anchor=target;
      renderCaption(caption);
      tip.showPopover();
      const box=target.getBoundingClientRect();
      tip.style.left=Math.max(4,Math.min(innerWidth-tip.offsetWidth-4,box.left))+'px';
      tip.style.top=(box.bottom+tip.offsetHeight+8<innerHeight ? box.bottom+5 : box.top-tip.offsetHeight-5)+'px';
    },{signal:abort.signal});
    abort.signal.addEventListener('abort',()=>{hide();tip.remove();silent.remove();},{once:true});
  }
  function installPlayerSettings() {
    const pref = 'zen-tidy-tabs.show-mini-player';
    const refresh = () => document.documentElement.toggleAttribute('ztt-hide-player', !Services.prefs.getBoolPref(pref,true));
    Services.prefs.addObserver(pref,refresh);
    refresh();

    function attach(doc) {
      if (doc.documentElement.getAttribute('windowtype') !== 'Zen:Settings') return;
      const list = doc.getElementById('zen-settings-categories');
      const panes = doc.getElementById('zen-settings-panes');
      if (!list || !panes || doc.getElementById('ztt-settings-pane')) return;
      const win = doc.defaultView;
      const make = (tag, cls) => {
        const el = doc.createElementNS(NS,tag);
        el.className = cls;
        return el;
      };
      const category = list.querySelector('[data-pane="advanced"]').cloneNode(true);
      category.dataset.pane = 'ztt';
      category.tabIndex = -1;
      category.setAttribute('aria-selected','false');
      category.setAttribute('aria-controls','ztt-settings-pane');
      category.id = 'ztt-settings-category';
      // Zen reads a Fluent key from every category when switching panes.
      category.querySelector('[data-l10n-id]').hidden = true;
      category.append('Zen Tidy Tabs');
      list.append(category);
      const pane = make('section','zen-settings-pane');
      pane.id = 'ztt-settings-pane';
      pane.hidden = true;
      pane.dataset.pane = 'ztt';
      pane.setAttribute('role','tabpanel');
      pane.setAttribute('aria-labelledby',category.id);
      const card = make('div','zen-settings-card');
      const row = make('div','zen-settings-row zen-settings-toggle-row');
      const text = make('span','zen-settings-row-text');
      text.textContent = Services.locale.appLocaleAsBCP47.startsWith('uk') ? 'Показувати мініплеєр' : 'Show mini player';
      const toggle = make('moz-toggle','zen-settings-toggle');
      toggle.ariaLabel = text.textContent;
      toggle.pressed = Services.prefs.getBoolPref(pref,true);
      toggle.addEventListener('toggle',() => Services.prefs.setBoolPref(pref,toggle.pressed));
      row.append(text,toggle);
      card.append(row);
      pane.append(card);
      panes.append(pane);
      const titleObserver = new win.MutationObserver(() => {
        if (doc.documentElement.dataset.pane !== 'ztt') return;
        const title = doc.getElementById('zen-settings-title');
        title.removeAttribute('data-l10n-id');
        title.textContent = 'Zen Tidy Tabs';
      });
      titleObserver.observe(doc.documentElement,{attributes:true,attributeFilter:['data-pane']});
      win.addEventListener('unload',() => titleObserver.disconnect(),{once:true});
    }
    const opened = doc => {
      if (doc.documentElement.getAttribute('windowtype') === 'Zen:Settings')
        attach(doc);
    };
    Services.obs.addObserver(opened,'chrome-document-loaded');
    for (const win of Services.wm.getEnumerator('Zen:Settings')) attach(win.document);
    abort.signal.addEventListener('abort',() => {
      Services.obs.removeObserver(opened,'chrome-document-loaded');
      Services.prefs.removeObserver(pref,refresh);
      document.documentElement.removeAttribute('ztt-hide-player');
    },{once:true});
  }

  function init() {
    if (destroyed) return;
    if (!window.gBrowser || !window.gZenWorkspaces) { startupTimer = setTimeout(init, 250); return; }
    document.documentElement.append(style);
    Services.prefs.setStringPref('zen.urlbar.behavior','float');
    Services.prefs.setBoolPref('zen.splitView.enable-drag-over-split',false);
    Services.prefs.setBoolPref('zen.pinned-tab-manager.restore-pinned-tabs-to-pinned-url',true);
    gBrowser.tabContainer.tabDragAndDrop._clearDragOverSplit?.();
    installPlayerSettings();
    installPlaybackIndicators();
    installPinnedBehavior();
    installCreateMenu();
    installInsertionHook();
    installActionTips();
    installSidebarMotion();
    installSelectionMenu();
    installTabActions();
    for (const event of ['SSTabRestored','SSTabRestoring','TabOpen','TabClose','TabMove','TabPinned','TabUnpinned','TabAttrModified','TabSelect','TabGroupCreate','TabGroupRemoved']) {
      gBrowser.tabContainer.addEventListener(event, schedule, { signal:abort.signal });
    }
    // Observe only browser workspace attributes, not our header mutations.
    observer = new MutationObserver(schedule);
    observer.observe(document.documentElement, { subtree:true, attributes:true, attributeFilter:['zen-workspace-id','active','zen-active','zen-sidebar-expanded','zen-essential'] });
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
