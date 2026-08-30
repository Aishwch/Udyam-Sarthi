/* UDYAM SARTHI System Admin Overview View */
import { renderSidebar } from '../../components/Sidebar.js';
import { renderTopbar } from '../../components/Topbar.js';
import { getIcon } from '../../components/IconLibrary.js';
import { store } from '../../store.js';

export const AdminView = () => {
  const { machines, operations, alerts } = store.getState();

  return `
    <div class="app-layout">
      ${renderSidebar('/admin')}

      <main class="app-main">
        ${renderTopbar()}

        <div class="app-page-content">
          <div class="page-header">
            <div>
              <h1 class="page-title">System Admin Overview</h1>
              <p class="page-subtitle">Platform health indicators, registered reference databases, and log record counts.</p>
            </div>
          </div>

          <div class="grid grid-cols-4 gap-6 mb-6">
            <div class="glass-card">
              <span class="text-xs text-muted display-block">Total Registered Machines</span>
              <strong class="text-2xl font-bold text-main">${machines.length}</strong>
            </div>
            <div class="glass-card">
              <span class="text-xs text-muted display-block">Recorded Operations Logs</span>
              <strong class="text-2xl font-bold text-main">${operations.length}</strong>
            </div>
            <div class="glass-card">
              <span class="text-xs text-muted display-block">Alerts Generated</span>
              <strong class="text-2xl font-bold text-warning">${alerts.length}</strong>
            </div>
            <div class="glass-card">
              <span class="text-xs text-muted display-block">Backend API Target</span>
              <strong class="text-sm font-bold text-accent">FastAPI (Ready)</strong>
            </div>
          </div>

        </div>
      </main>
    </div>
  `;
};