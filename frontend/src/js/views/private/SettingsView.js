/* UDYAM SARTHI Settings View */
import { renderSidebar } from '../../components/Sidebar.js';
import { renderTopbar } from '../../components/Topbar.js';
import { getIcon } from '../../components/IconLibrary.js';
import { store } from '../../store.js';

export const SettingsView = () => {
  const { theme } = store.getState();

  setTimeout(() => {
    const themeBtn = document.getElementById('settings-theme-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => store.toggleTheme());
    }

    const resetBtn = document.getElementById('settings-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to reset prototype data back to defaults?")) {
          store.resetDemoData();
          window.location.hash = '#/dashboard';
        }
      });
    }
  }, 0);

  return `
    <div class="app-layout">
      ${renderSidebar('/settings')}

      <main class="app-main">
        ${renderTopbar()}

        <div class="app-page-content">
          <div class="page-header">
            <div>
              <h1 class="page-title">Application Settings</h1>
              <p class="page-subtitle">Configure theme preferences, notification triggers, and prototype state reset.</p>
            </div>
          </div>

          <div class="glass-card mb-6" style="max-width: 600px;">
            <h3 class="text-base font-bold mb-4">Display & Visual Preferences</h3>
            <div class="flex items-center justify-between py-3" style="border-bottom: 1px solid var(--border-color);">
              <div>
                <strong class="text-sm display-block">Color Theme Mode</strong>
                <span class="text-xs text-muted">Currently active: ${theme.toUpperCase()}</span>
              </div>
              <button class="btn btn-secondary btn-sm" id="settings-theme-btn">
                Toggle ${theme === 'dark' ? 'Light' : 'Dark'} Mode
              </button>
            </div>

            <div class="flex items-center justify-between py-3" style="border-bottom: 1px solid var(--border-color);">
              <div>
                <strong class="text-sm display-block">Reset Prototype Demo State</strong>
                <span class="text-xs text-muted">Restores original synthetic dataset and profile</span>
              </div>
              <button class="btn btn-danger btn-sm" id="settings-reset-btn">
                Reset Demo State
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  `;
};