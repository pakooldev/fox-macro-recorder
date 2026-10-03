// Fox Macro Recorder - Toast/Snackbar System

let foxToastActive = null;

const TOAST_ICONS = { success: 'check', error: 'alert', info: 'info' };

function showToast(message, type = 'info', duration = 2000) {
  if (foxToastActive) foxToastActive.remove();

  const toast = document.createElement('div');
  toast.className = `fox-toast ${type}`;
  toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
  toast.innerHTML = html`<span class="fox-toast-icon">${icon(TOAST_ICONS[type] || TOAST_ICONS.info)}</span><span class="fox-toast-text">${message}</span>`;

  state.root.appendChild(toast);
  foxToastActive = toast;
  placeToast(toast);

  requestAnimationFrame(() => toast.classList.add('visible'));
  toast.addEventListener('click', () => dismissToast(toast));
  setTimeout(() => dismissToast(toast), duration);
}

function dismissToast(toast) {
  if (!toast.parentNode) return;
  toast.classList.remove('visible');
  setTimeout(() => {
    toast.remove();
    if (foxToastActive === toast) foxToastActive = null;
  }, 200);
}

// Toasts hang off the main panel (where the user is looking), not the page:
// under it, else above it, else (a panel as tall as the window) inside its bottom
// edge; above/below the FAB when minimized; top centre as a last resort.
function placeToast(toast) {
  const gap = 6;
  const { width, height } = viewport();
  const anchor = [state.panel, foxFab].find(el => el?.offsetWidth);
  if (!anchor) {
    moveTo(toast, (width - toast.offsetWidth) / 2, 12);
    return;
  }
  const r = layoutRect(anchor);
  const isPanel = anchor === state.panel;
  if (isPanel) toast.style.width = `${r.width}px`;
  const h = toast.offsetHeight;
  let left = isPanel ? r.left : r.right - toast.offsetWidth;
  let top = r.bottom + gap;
  if (top + h > height - EDGE) top = r.top - gap - h;
  if (top < 0 && isPanel) {
    toast.style.width = `${r.width - 16}px`;
    left = r.left + 8;
    top = r.bottom - h - 8;
  }
  moveTo(toast, left, top);
  toast.classList.toggle('from-above', top < r.top);
}
