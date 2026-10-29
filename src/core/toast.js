import { Icons } from './icons.js';

let toastContainer = null;

export function showToast(message, type = 'info', duration = 3000) {
  if (!toastContainer) {
    toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'toast toast-top toast-end z-50';
      document.body.appendChild(toastContainer);
    }
  }

  const alertDiv = document.createElement('div');
  let alertClass = 'alert alert-info shadow-lg';
  let iconHtml = Icons.sparkles;

  if (type === 'success') {
    alertClass = 'alert alert-success text-white shadow-lg';
    iconHtml = Icons.check;
  } else if (type === 'danger' || type === 'error') {
    alertClass = 'alert alert-error text-white shadow-lg';
    iconHtml = Icons.alertCircle;
  } else if (type === 'warning') {
    alertClass = 'alert alert-warning text-white shadow-lg';
    iconHtml = Icons.alertCircle;
  }

  alertDiv.className = `${alertClass} flex items-center gap-2 py-2 px-4 text-sm transition-all duration-300`;
  alertDiv.innerHTML = `
    <span class="shrink-0">${iconHtml}</span>
    <span>${escapeHtml(message)}</span>
  `;

  toastContainer.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.style.opacity = '0';
    alertDiv.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      alertDiv.remove();
    }, 300);
  }, duration);
}

export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
