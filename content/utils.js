// Fox Macro Recorder - Utility Functions

// ==========================================
// Safe HTML
// ==========================================
// Every innerHTML in the extension goes through html`...`: interpolated values are
// escaped unless they are themselves html`...` results (or arrays of them).
// Macro names and recorded page text come from web pages / imported files, so never
// build markup with plain template strings.
class SafeHtml {
  constructor(value) { this.value = value; }
  toString() { return this.value; }
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function toHtml(value) {
  if (value instanceof SafeHtml) return value.value;
  if (Array.isArray(value)) return value.map(toHtml).join('');
  return escapeHtml(value);
}

function html(strings, ...values) {
  return new SafeHtml(strings.reduce((out, str, i) => out + str + (i < values.length ? toHtml(values[i]) : ''), ''));
}

// ==========================================
// Formatting
// ==========================================
function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatMacroInfo(clicks, durationMs) {
  return `${clicks} · ${formatDuration(durationMs)}`;
}

// Named domains alphabetically, '' (ungrouped) last
function compareDomains(a, b) {
  if (!a) return 1;
  if (!b) return -1;
  return a.localeCompare(b);
}

// ==========================================
// Positioning (fixed elements inside the shadow root)
// ==========================================
const EDGE = 6; // keep the hard shadow on screen too

// The visible area: clientWidth/Height leave out the page's scrollbars (innerWidth doesn't)
function viewport() {
  return { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight };
}

// Where a fixed element is laid out, ignoring transforms: the drop-in/slide animations
// move things for 120ms, and positioning must not copy that offset
function layoutRect(element) {
  const left = element.offsetLeft, top = element.offsetTop, width = element.offsetWidth, height = element.offsetHeight;
  return { left, top, width, height, right: left + width, bottom: top + height };
}

function moveTo(element, left, top) {
  const { width, height } = viewport();
  Object.assign(element.style, {
    left: `${Math.min(Math.max(0, left), Math.max(0, width - element.offsetWidth - EDGE))}px`,
    top: `${Math.min(Math.max(0, top), Math.max(0, height - element.offsetHeight - EDGE))}px`,
    right: 'auto',
    bottom: 'auto'
  });
}

// Pull a (visible) element back on screen, e.g. after it grew or the window shrank
function clampIntoView(element) {
  if (!element?.isConnected || !element.offsetWidth) return;
  const r = layoutRect(element);
  const { width, height } = viewport();
  if (r.left < 0 || r.top < 0 || r.right > width - EDGE || r.bottom > height - EDGE) moveTo(element, r.left, r.top);
}

// Open a floating panel next to the main panel: left of it, else right of it, else
// overlapping it with an offset. `cascade` shifts it when another one already sits there.
function placeBesideMain(element, cascade = 0) {
  const main = layoutRect(state.panel);
  const gap = 12;
  const { width } = viewport();
  const w = element.offsetWidth;
  let top = main.top + cascade;
  let left = main.left - gap - w - cascade;                   // left of the panel, cascading away from it
  if (left < 0) left = main.right + gap + cascade;            // else right of it
  if (left + w > width - EDGE) {                              // else on top of it, offset
    left = main.left + 24 + cascade;
    top = main.top + 24 + cascade;
  }
  moveTo(element, left, top);
}

// All our floating parts share one stacking context (the shadow host): the last one
// touched goes on top
let foxTopZ = 10;
function bringToFront(element) {
  element.style.zIndex = ++foxTopZ;
}

// ==========================================
// Dragging
// ==========================================
// Drags `element` by `handle`. The click that ends a drag is swallowed wherever it
// lands: on a draggable button (the FAB) it would fire it, and when the pointer is
// released off the panel Chrome sends it to the page, where recording would save it.
function makeDraggable(element, handle = element) {
  let start = null, offsetX = 0, offsetY = 0, dragged = false;

  element.addEventListener('pointerdown', () => bringToFront(element), true);

  handle.addEventListener('mousedown', (e) => {
    dragged = false;
    const control = e.target.closest('button, input, select');
    if (control && control !== handle) return; // a draggable button (FAB) drags from anywhere on it
    const rect = layoutRect(element);
    start = { x: e.clientX, y: e.clientY };
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!start) return;
    if (Math.abs(e.clientX - start.x) > 3 || Math.abs(e.clientY - start.y) > 3) dragged = true;
    moveTo(element, e.clientX - offsetX, e.clientY - offsetY);
  });

  document.addEventListener('mouseup', () => {
    start = null;
    if (!dragged) return;
    dragged = false;
    // The click (if any) is dispatched right after this mouseup, before any timer, so
    // a one-shot window capture listener catches it before anything else sees it
    // (including recording) and the next real click is never affected.
    const swallow = (e) => { e.stopImmediatePropagation(); e.preventDefault(); };
    window.addEventListener('click', swallow, true);
    setTimeout(() => window.removeEventListener('click', swallow, true), 0);
  });
}

// ==========================================
// Page helpers
// ==========================================
// Generate a unique CSS selector for an element (recorded with each click)
function getSelector(element) {
  if (element.id) return `#${element.id}`;
  if (element.tagName === 'BODY') return 'body';

  const path = [];
  let current = element;

  while (current && current.tagName !== 'BODY') {
    let selector = current.tagName.toLowerCase();

    if (current.id) {
      selector = `#${current.id}`;
      path.unshift(selector);
      break;
    }

    if (current.className && typeof current.className === 'string') {
      const classes = current.className.trim().split(/\s+/).filter(c => c);
      if (classes.length > 0) {
        selector += '.' + classes.slice(0, 2).join('.');
      }
    }

    const parent = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        child => child.tagName === current.tagName
      );
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }

    path.unshift(selector);
    current = current.parentElement;
  }

  return path.join(' > ');
}

// Pixel click feedback on the page itself (outside the shadow root, so it sits at the
// clicked point): a hollow square that grows in 4 steps; playback adds 4 flying sparks.
function showClickFeedback(x, y, color, isPlayback = false) {
  if (!document.getElementById('fox-click-feedback-styles')) {
    const style = document.createElement('style');
    style.id = 'fox-click-feedback-styles';
    style.textContent = `
      @keyframes foxPxRing { from { width: 12px; height: 12px; margin: -6px; } to { width: 40px; height: 40px; margin: -20px; } }
      @keyframes foxPxSpark { to { transform: translate(var(--dx), var(--dy)); } }
    `;
    document.head.appendChild(style);
  }

  const spawn = (css) => {
    const el = document.createElement('div');
    el.style.cssText = `position: fixed; left: ${x}px; top: ${y}px; box-sizing: border-box; pointer-events: none; z-index: 2147483646; ${css}`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 320);
  };

  spawn(`border: 2px solid ${color}; box-shadow: 2px 2px 0 #000; animation: foxPxRing 240ms steps(4) forwards;`);
  if (isPlayback) {
    for (const [dx, dy] of [[-16, -16], [16, -16], [-16, 16], [16, 16]]) {
      spawn(`width: 4px; height: 4px; margin: -2px; background: ${color}; --dx: ${dx}px; --dy: ${dy}px; animation: foxPxSpark 240ms steps(4) forwards;`);
    }
  }
}

// Dashed box over the element a playback click hit. Drawn as our own overlay, never
// by changing the page element's style (that could stick if one element was hit twice
// within the timeout, and page CSS could fight it). Clipped to the viewport.
function showTargetOutline(element) {
  const r = element.getBoundingClientRect();
  const { width, height } = viewport();
  const left = Math.max(0, r.left), top = Math.max(0, r.top);
  const box = document.createElement('div');
  box.style.cssText = `
    position: fixed; left: ${left}px; top: ${top}px;
    width: ${Math.max(0, Math.min(r.right, width) - left)}px; height: ${Math.max(0, Math.min(r.bottom, height) - top)}px;
    box-sizing: border-box; border: 2px dashed #29ADFF;
    pointer-events: none; z-index: 2147483646;
  `;
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 500);
}

function switchTab(tabName) {
  // Keep the panel's height when leaving Home, so the window (and its shadow) doesn't jump
  state.panel.style.minHeight = tabName === 'home' ? '' : `${state.panel.offsetHeight}px`;
  state.activeTab = tabName;
  qa('.fox-tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabName));
  qa('.fox-tab-content').forEach(content => content.classList.toggle('active', content.dataset.tab === tabName));
  clampIntoView(state.panel);
}
