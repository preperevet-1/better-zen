// ==UserScript==
// @name           Zen Tidy Tabs
// @description    Local rule-based temporary tab groups with native Zen folders.
// @include        main
// @version        0.5.0
// ==/UserScript==
(() => {
  'use strict';
  const ICONS = {"broom": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNCAxNCI+PGcgdHJhbnNmb3JtPSJyb3RhdGUoMjUgNyA3KSI+PHBhdGggZD0iTTcgLjc1VjciIGZpbGw9Im5vbmUiIHN0cm9rZT0iYmxhY2siIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48cmVjdCB4PSI0LjUiIHk9IjYuNSIgd2lkdGg9IjUiIGhlaWdodD0iMiIgcng9Ii43NSIvPjxwYXRoIGQ9Ik00LjI1IDlIOS43NUwxMS41IDEzLjVIMi41WiIvPjwvZz48L3N2Zz4=", "close": "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCEtLUdlbmVyYXRvcjogQXBwbGUgTmF0aXZlIENvcmVTVkcgMzYyLS0+CjwhRE9DVFlQRSBzdmcKUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIKICAgICAgICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmlld0JveD0iMCAwIDE5Ljc2MzkgMTkuNzgzMSI+CiA8Zz4KICA8cmVjdCBoZWlnaHQ9IjE5Ljc4MzEiIG9wYWNpdHk9IjAiIHdpZHRoPSIxOS43NjM5IiB4PSIwIiB5PSIwIi8+CiAgPHBhdGggZD0iTTE4LjEzODcgMC4zMDcwNjdMMC4yODM4OTEgMTguMTU2NEMtMC4wNzY5Mzg5IDE4LjUxNzItMC4wODc0OTE2IDE5LjEzNzMgMC4yODM4OTEgMTkuNTA4N0MwLjY2MDI5NSAxOS44NzQ2IDEuMjY5ODggMTkuODc0NiAxLjY0MTI2IDE5LjUwODdMMTkuNDg1NSAxLjY2NDQ0QzE5Ljg1MTQgMS4yOTMwNSAxOS44NjE5IDAuNjcyOTE4IDE5LjQ4NTUgMC4zMDcwNjdDMTkuMTAzNi0wLjA1Mzc2MzYgMTguNTA0Ni0wLjA2NDMxNjIgMTguMTM4NyAwLjMwNzA2N1pNMTkuNDg1NSAxOC4xNTY0TDEuNjQxMjYgMC4zMDcwNjdDMS4yNjk4OC0wLjA1Mzc2MzYgMC42NDk3NDMtMC4wNjQzMTYyIDAuMjgzODkxIDAuMzA3MDY3Qy0wLjA3NjkzODkgMC42ODM0NzEtMC4wNzY5Mzg5IDEuMjkzMDUgMC4yODM4OTEgMS42NjQ0NEwxOC4xMzg3IDE5LjUwODdDMTguNDk0IDE5Ljg3NDYgMTkuMTE0MiAxOS44NzQ2IDE5LjQ4NTUgMTkuNTA4N0MxOS44NTE0IDE5LjEyNjggMTkuODUxNCAxOC41MTcyIDE5LjQ4NTUgMTguMTU2NFoiIGZpbGw9ImJsYWNrIiBmaWxsLW9wYWNpdHk9IjAuODUiLz4KIDwvZz4KPC9zdmc+Cg==", "folder": "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCEtLUdlbmVyYXRvcjogQXBwbGUgTmF0aXZlIENvcmVTVkcgMzYyLS0+CjwhRE9DVFlQRSBzdmcKUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIKICAgICAgICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPgo8c3ZnIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmlld0JveD0iMCAwIDQyLjIwMjUgMjYuOTY0NCI+CiA8Zz4KICA8cmVjdCBoZWlnaHQ9IjI2Ljk2NDQiIG9wYWNpdHk9IjAiIHdpZHRoPSI0Mi4yMDI1IiB4PSIwIiB5PSIwIi8+CiAgPHBhdGggZD0iTTE2LjUxODUgMi45NDc4TDE3LjI2MTkgMy41ODAxQzE3LjkwNjMgNC4xMzk1NSAxOC40MDk5IDQuMzMxNTMgMTkuMzMwOCA0LjMzMTUzTDI3LjMxNDkgNC4zMzE1M0MyNy4wMzAxIDQuODcyMTggMjYuODEzNiA1LjQ1MjE5IDI2LjY3NjEgNi4wNjEzMUwxOC45MDIxIDYuMDYxMzFDMTcuNjQxIDYuMDYxMzEgMTYuOTk0MSA1LjgyNjA5IDE2LjIwMTUgNS4xMzk1TDE1LjQ1MjYgNC41MDcyQzE0Ljc5MTcgMy45MzExNiAxNC4yOTkxIDMuNzMzNjQgMTMuNDA1OSAzLjczMzY0TDEwLjU5MiAzLjczMzY0QzkuMzE3ODQgMy43MzM2NCA4LjY0NjgzIDQuMzgzNTUgOC42NDY4MyA1LjY4NDM5TDguNjQ2ODMgMjAuOTYwOEM4LjY0NjgzIDIyLjM2NTcgOS4zODkyNCAyMy4wNzY0IDEwLjc1MTkgMjMuMDc2NEwzMS40NTA2IDIzLjA3NjRDMzIuNzkxMiAyMy4wNzY0IDMzLjU1NTcgMjIuMzY1NyAzMy41NTU3IDIwLjk3MTNMMzMuNTU1NyAxNS43MDMyQzMzLjgxMDcgMTUuNzI5OCAzNC4wNjk1IDE1Ljc0MjggMzQuMzMxMSAxNS43NDI4QzM0LjY1NDMgMTUuNzQyOCAzNC45NzM0IDE1LjcyMjUgMzUuMjg1NSAxNS42NzY3TDM1LjI4NTUgMjEuMDQ1N0MzNS4yODU1IDIzLjUzMjEgMzQuMDExOSAyNC44MTY4IDMxLjc4ODggMjQuODE2OEwxMC43MTk4IDI0LjgxNjhDOC4yMDEyMiAyNC44MTY4IDYuOTE3MDUgMjMuNTQzMSA2LjkxNzA1IDIxLjA0NTdMNi45MTcwNSA1LjU4Mjg3QzYuOTE3MDUgMy4xOTU1MyA4LjExMzIzIDIuMDE0OTMgMTAuMjQyOCAyLjAxNDkzTDEzLjgzNDUgMi4wMTQ5M0MxNS4wODQ2IDIuMDE0OTMgMTUuNjg3NyAyLjIyMyAxNi41MTg1IDIuOTQ3OFpNMjYuNDU1NCA3Ljg0OTAyTDI2LjQ1NDIgNy44NzEzOEMyNi40NTQyIDguNTEyODggMjYuNTMyMyA5LjEzNzExIDI2LjY4NzggOS43MzE3OUwxMC4wNDE1IDkuNzMxNzlMMTAuMDQxNSA5LjEwODE2QzEwLjA0MTUgOC4yOTE4OCAxMC40ODgzIDcuODQ5MDIgMTEuNDA1MiA3Ljg0OTAyWiIgZmlsbD0iYmxhY2siIGZpbGwtb3BhY2l0eT0iMC44NSIvPgogIDxwYXRoIGQ9Ik00MC42NDE1IDcuODcxMzhDNDAuNjQxNSAxMS4zMjY5IDM3Ljc1NDUgMTQuMTgxOCAzNC4zMzExIDE0LjE4MThDMzAuODcwNiAxNC4xODE4IDI4LjAwNDcgMTEuMzQ4IDI4LjAwNDcgNy44NzEzOEMyOC4wMDQ3IDQuNDEwODYgMzAuODcwNiAxLjU2MTAxIDM0LjMzMTEgMS41NjEwMUMzNy43OTE3IDEuNTYxMDEgNDAuNjQxNSA0LjQwNTMyIDQwLjY0MTUgNy44NzEzOFpNMzMuNjE2NSA0LjU5ODc2TDMzLjYxNjUgNy4xNTY3MUwzMS4wNDc1IDcuMTU2NzFDMzAuNjM3NCA3LjE1NjcxIDMwLjMzODMgNy40MzkxNiAzMC4zMzgzIDcuODcxMzhDMzAuMzM4MyA4LjMwMzYxIDMwLjYzNzQgOC41ODA1MyAzMS4wNDc1IDguNTgwNTNMMzMuNjE2NSA4LjU4MDUzTDMzLjYxNjUgMTEuMTQ5NUMzMy42MTY1IDExLjU3MDcgMzMuODg4NCAxMS44NjQyIDM0LjMzMTEgMTEuODY0MkMzNC43NTc4IDExLjg2NDIgMzUuMDQwMyAxMS41NzA3IDM1LjA0MDMgMTEuMTQ5NUwzNS4wNDAzIDguNTgwNTNMMzcuNjAzOCA4LjU4MDUzQzM4LjAxOTQgOC41ODA1MyAzOC4zMDI0IDguMzAzNjEgMzguMzAyNCA3Ljg3MTM4QzM4LjMwMjQgNy40MzkxNiAzOC4wMTk0IDcuMTU2NzEgMzcuNjAzOCA3LjE1NjcxTDM1LjA0MDMgNy4xNTY3MUwzNS4wNDAzIDQuNTk4NzZDMzUuMDQwMyA0LjE4MzEzIDM0Ljc1NzggMy44ODQwOSAzNC4zMzExIDMuODg0MDlDMzMuODg4NCAzLjg4NDA5IDMzLjYxNjUgNC4xODMxMyAzMy42MTY1IDQuNTk4NzZaIiBmaWxsPSJibGFjayIgZmlsbC1vcGFjaXR5PSIwLjg1Ii8+CiA8L2c+Cjwvc3ZnPgo="};
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
    const b = node('button', 'ztt-button' + (text === '×' ? ' ztt-close' : ''), text);
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
    if (!states.has(strip)) states.set(strip, { assignments: new Map(), revealed: new Set(), headers: [], separator: null, tidyButton: null });
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
      const smooth = value => value * value * (3 - 2 * value);
      const draw = now => {
        if (destroyed || !line.isConnected) { finish(); return; }
        const elapsed = now - start;
        const strength = smooth(Math.max(0, Math.min(1, elapsed / 300, (900 - elapsed) / 300)));
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
        if (elapsed >= 900) finish();
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
      const { groups, loose } = groupTabs(tabs,
        tab => ({ url: tab.linkedBrowser?.currentURI?.spec, title: tab.label }),
        host => Services.eTLD.getBaseDomainFromHost(host));
      s.assignments.clear();
      s.revealed.clear();
      for (const [name, items] of groups) for (const tab of items) s.assignments.set(tab, name);
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
    // A group is a snapshot from the last Tidy click. New tabs stay above
    // all headers, even when Zen inserts them next to the selected tab.
    const counts = new Map();
    for (const name of s.assignments.values()) counts.set(name, (counts.get(name) || 0) + 1);
    for (const [tab, name] of s.assignments) if (counts.get(name) < 2) s.assignments.delete(tab);
    const current = tabsIn(strip);
    const loose = current.filter(tab => !s.assignments.has(tab));
    const grouped = current.filter(tab => s.assignments.has(tab));
    const ordered = [...loose, ...grouped];
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
          header.append(label,
            button('⊞', 'Create pinned folder: ' + name, () => folder(strip, name)),
            button('×', 'Close group: ' + name, () => clear(strip, name)));
          if (!s.revealed.has(name)) {
            s.revealed.add(name);
            label.classList.add('ztt-title-enter');
            label.style.animationDelay = Math.min(revealIndex++ * 55, 165) + 'ms';
            label.addEventListener('animationend', () => {
              label.classList.remove('ztt-title-enter'); label.style.removeProperty('animation-delay');
            }, { once:true });
          }
        }
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
    .ztt-label { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:12px; font-weight:600; opacity:.68; }
    .ztt-button { appearance:none; border:0; border-radius:6px; background:transparent;
      color:inherit; font:inherit; font-size:11px; font-weight:600; padding:5px 6px;
      min-width:22px; min-height:20px; cursor:pointer; white-space:nowrap; }
    .ztt-icon { display:block; width:14px; height:14px; background:currentColor; mask-size:contain; mask-repeat:no-repeat; mask-position:center; }
    .ztt-header .ztt-button:not(.ztt-close) .ztt-icon { width:19px; height:15px; }
    .ztt-header .ztt-close .ztt-icon { width:9px; height:9px; margin:auto; }
    .ztt-header .ztt-close { width:20px; min-width:20px; padding:2px!important; display:grid; place-items:center; }
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
      position:relative; overflow:visible; border-color:transparent!important;
      background:none!important; }
    .ztt-native-separator.ztt-working::before { display:none!important; }
    .ztt-wave { position:absolute; left:0; top:50%; transform:translateY(-50%);
      display:block; width:100%; height:9px; overflow:hidden; pointer-events:none;
      color:var(--zen-pinned-separator-color); }
    .ztt-native-separator.ztt-working > toolbarbutton { pointer-events:auto; }
    .ztt-native-separator.ztt-working > toolbarbutton > :is(.toolbarbutton-icon,.toolbarbutton-text) { opacity:.5; }
    .ztt-title-enter { animation:ztt-title-enter 420ms cubic-bezier(.2,.7,.2,1) both; }
    @keyframes ztt-title-enter {
      from { opacity:0; transform:translateY(4px); filter:blur(2px); }
      to { opacity:.68; transform:translateY(0); filter:blur(0); }
    }
    :root:not([zen-sidebar-expanded='true']) .ztt-header,
    :root:not([zen-sidebar-expanded='true']) .ztt-tidy { display:none; }
    @media(prefers-reduced-motion:reduce) { .ztt-title-enter,.ztt-wave { animation:none!important; } }
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
