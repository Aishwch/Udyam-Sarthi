/* UDYAM SARTHI Main Application Bootstrapper */
import { initRouter } from './router.js';
import { store } from './store.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log("🚀 Initializing UDYAM SARTHI Digital Business Companion...");

  // Apply initial theme
  document.documentElement.setAttribute('data-theme', store.getState().theme);

  // Render Toast Notifications Container
  const toastContainer = document.createElement('div');
  toastContainer.className = 'toast-container';
  toastContainer.id = 'toast-container';
  document.body.appendChild(toastContainer);

  store.subscribe((state) => {
    // Render Toasts dynamically
    toastContainer.innerHTML = state.toasts.map(t => `
      <div class="toast toast-${t.type}">
        <span>${t.message}</span>
      </div>
    `).join('');
  });

  // Initialize SPA Hash Router
  initRouter();
});
