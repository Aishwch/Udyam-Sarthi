/* UDYAM SARTHI Alerts & Operational Anomalies View */
import { renderSidebar } from '../../components/Sidebar.js';
import { renderTopbar } from '../../components/Topbar.js';
import { renderTagBadge } from '../../components/TagBadge.js';
import { getIcon } from '../../components/IconLibrary.js';
import { store } from '../../store.js';

export const AlertsView = () => {
  const { alerts } = store.getState();

  setTimeout(() => {
    document.querySelectorAll('.ack-alert-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const altId = e.currentTarget.dataset.alertId;
        store.acknowledgeAlert(altId);
        window.location.hash = '#/alerts';
      });
    });
  }, 0);

  return `
    <div class="app-layout">
      ${renderSidebar('/alerts')}

      <main class="app-main">
        ${renderTopbar()}

        <div class="app-page-content">
          <div class="page-header">
            <div>
              <h1 class="page-title">Smart Operational Alerts & Anomalies</h1>
              <p class="page-subtitle">Real-time detection of unusual operational behaviour, output drops, and high downtime.</p>
            </div>
            ${renderTagBadge('Synthetic')}
          </div>

          <div class="flex-col gap-4 flex">
            ${alerts.map(alt => `
              <div class="glass-card" style="border-left: 4px solid ${alt.severity === 'High' ? 'var(--danger)' : 'var(--warning)'}; opacity: ${alt.acknowledged ? '0.7' : '1'};">
                <div class="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <div class="flex items-center gap-2">
                    <span class="badge ${alt.severity === 'High' ? 'badge-danger' : 'badge-warning'}">${alt.severity} Severity</span>
                    <strong class="text-base text-main">${alt.title}</strong>
                  </div>
                  <span class="text-xs text-dim">${alt.date}</span>
                </div>

                <p class="text-xs text-muted mb-3">${alt.summary}</p>

                <div class="grid grid-cols-2 gap-4 mb-3 text-xs" style="background: rgba(15, 23, 42, 0.5); padding: 0.875rem; border-radius: var(--radius-md);">
                  <div>
                    <span class="text-dim display-block">Observed Variance:</span>
                    <strong class="text-main">${alt.metricChanged}</strong>
                  </div>
                  <div>
                    <span class="text-dim display-block">Normal vs Abnormal Rate:</span>
                    <strong class="text-main">${alt.normalVsAbnormal}</strong>
                  </div>
                </div>

                <div class="mb-4">
                  <span class="text-xs font-semibold text-muted display-block mb-1">Possible Contributing Factors Identified:</span>
                  <ul class="text-xs text-muted" style="list-style: disc; padding-left: 1.25rem;">
                    ${alt.possibleFactors.map(f => `<li>${f}</li>`).join('')}
                  </ul>
                </div>

                <div class="flex items-center justify-between pt-3" style="border-top: 1px solid var(--border-color);">
                  <a href="#/diagnosis" class="btn btn-secondary btn-sm">
                    ${getIcon('helpCircle', 14)}
                    <span>Full Performance Diagnosis</span>
                  </a>

                  ${!alt.acknowledged ? `
                    <button class="btn btn-primary btn-sm ack-alert-btn" data-alert-id="${alt.id}">
                      ${getIcon('check', 14)}
                      <span>Acknowledge Alert</span>
                    </button>
                  ` : `
                    <span class="badge badge-success">${getIcon('check', 12)} Acknowledged</span>
                  `}
                </div>
              </div>
            `).join('')}
          </div>

        </div>
      </main>
    </div>
  `;
};