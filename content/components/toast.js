// Fox Macro Recorder - Toast/Snackbar System

let foxToastActive = null;

const TOAST_ICONS = { success: '✓', error: '⚠', info: 'ℹ' };

function showToast(message, type = 'info', duration = 2000) {
  if (foxToastActive) foxToastActive.remove();

  const toast = document.createElement('div');
  toast.className = `fox-toast ${type}`;
  toast.innerHTML = html`<span class="fox-toast-icon">${TOAST_ICONS[type] || TOAST_ICONS.info}</span><span>${message}</span>`;

  state.root.appendChild(toast);
  foxToastActive = toast;

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
