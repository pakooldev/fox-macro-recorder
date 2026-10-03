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
// Dragging
// ==========================================
// Drags `element` by `handle`. A click right after a drag is swallowed, so a
// draggable button (the FAB) doesn't fire when it is dropped.
function makeDraggable(element, handle = element) {
  let start = null, offsetX = 0, offsetY = 0, dragged = false;

  handle.addEventListener('mousedown', (e) => {
    dragged = false;
    if (e.target !== handle && e.target.closest('button, input, select')) return;
    const rect = element.getBoundingClientRect();
    start = { x: e.clientX, y: e.clientY };
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!start) return;
    if (Math.abs(e.clientX - start.x) > 3 || Math.abs(e.clientY - start.y) > 3) dragged = true;
    Object.assign(element.style, {
      left: `${e.clientX - offsetX}px`,
      top: `${e.clientY - offsetY}px`,
      right: 'auto',
      bottom: 'auto'
    });
  });

  document.addEventListener('mouseup', () => { start = null; });

  element.addEventListener('click', (e) => {
    if (dragged) {
      e.stopImmediatePropagation();
      dragged = false;
    }
  }, true);
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

// Show visual feedback for clicks (rendered OUTSIDE shadow root for correct positioning)
function showClickFeedback(x, y, color, isPlayback = false) {
  if (!document.getElementById('fox-click-feedback-styles')) {
    const style = document.createElement('style');
    style.id = 'fox-click-feedback-styles';
    style.textContent = `
      @keyframes foxClickPulse {
        0% { transform: scale(1); opacity: 0.7; }
        100% { transform: scale(2); opacity: 0; }
      }
      @keyframes foxClickRipple {
        0% { transform: scale(0.5); opacity: 1; }
        50% { transform: scale(1.5); opacity: 0.6; }
        100% { transform: scale(3); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  const spawn = (size, css, duration) => {
    const el = document.createElement('div');
    el.style.cssText = `
      position: fixed; left: ${x - size / 2}px; top: ${y - size / 2}px;
      width: ${size}px; height: ${size}px; border-radius: 50%;
      pointer-events: none; z-index: 2147483646; ${css}
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), duration);
  };

  if (isPlayback) {
    spawn(60, `border: 4px solid ${color}; animation: foxClickRipple 0.8s ease-out forwards;`, 800);
    spawn(24, `background: ${color}; box-shadow: 0 0 20px ${color}; animation: foxClickPulse 0.6s ease-out forwards;`, 600);
  } else {
    spawn(20, `background: ${color}; opacity: 0.7; animation: foxClickPulse 0.5s ease-out forwards;`, 500);
  }
}

function switchTab(tabName) {
  state.activeTab = tabName;
  qa('.fox-tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabName));
  qa('.fox-tab-content').forEach(content => content.classList.toggle('active', content.dataset.tab === tabName));
}
