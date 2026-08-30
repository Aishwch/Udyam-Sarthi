/* UDYAM SARTHI Private Application Topbar Header Component */
import { store } from '../store.js';
import { getIcon } from './IconLibrary.js';
import { renderBreadcrumb } from './Breadcrumb.js';

export const renderTopbar = () => {
  const { alerts } = store.getState();
  const unackAlerts = alerts.filter(a => !a.acknowledged);
  const hash = window.location.hash.slice(1) || '/dashboard';
  const cleanPath = hash.split('?')[0];

  return `
    <header class="app-topbar">
      <div class="flex items-center gap-4">
        <button class="btn-icon lg:hidden" id="mobile-menu-toggle" title="Toggle Navigation">
          ${getIcon('filter', 20)}
        </button>

        ${renderBreadcrumb(cleanPath)}
      </div>

      <div class="topbar-actions">
        <a href="#/operations" class="btn btn-secondary btn-sm">
          ${getIcon('plus', 14)}
          <span>+ Add Daily Data</span>
        </a>

        <a href="#/assistant" class="btn btn-primary btn-sm">
          ${getIcon('bot', 14)}
          <span>Ask AI Assistant</span>
        </a>

        <a href="#/alerts" class="btn-icon relative" title="Notifications & Alerts">
          ${getIcon('bell', 18)}
          ${unackAlerts.length ? `<span class="badge-count" style="position: absolute; top: 2px; right: 2px;">${unackAlerts.length}</span>` : ''}
        </a>

        <button class="btn-icon" id="theme-toggle-btn" title="Toggle Light/Dark Theme">
          ${getIcon('sparkles', 18)}
        </button>
      </div>
    </header>
  `;
};