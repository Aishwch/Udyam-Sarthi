/* UDYAM SARTHI Predictive Insights View */
import { renderSidebar } from '../../components/Sidebar.js';
import { renderTopbar } from '../../components/Topbar.js';
import { renderTagBadge } from '../../components/TagBadge.js';
import { getIcon } from '../../components/IconLibrary.js';

export const PredictionsView = () => {
  return `
    <div class="app-layout">
      ${renderSidebar('/predictions')}

      <main class="app-main">
        ${renderTopbar()}

        <div class="app-page-content">
          <div class="page-header">
            <div>
              <h1 class="page-title">Predictive Insights</h1>
              <p class="page-subtitle">Machine learning model forecasts for upcoming production output and plant efficiency.</p>
            </div>
            ${renderTagBadge('Model-based')}
          </div>

          <div class="grid grid-cols-3 gap-6 mb-6">
            <!-- Prediction Card 1 -->
            <div class="glass-card">
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-semibold text-muted">PREDICTED PRODUCTION (NEXT 7 DAYS)</span>
                ${renderTagBadge('Model-based')}
              </div>
              <div class="text-3xl font-bold text-main mb-1">2,240 Units</div>
              <div class="text-xs text-success mb-3 flex items-center gap-1">
                ${getIcon('trendingUp', 14)} +3.5% projected output growth
              </div>

              <div style="background: rgba(15, 23, 42, 0.5); padding: 0.875rem; border-radius: var(--radius-md);" class="text-xs">
                <div class="flex justify-between mb-1">
                  <span class="text-muted">Confidence Level:</span>
                  <strong class="text-accent">Moderate (82%)</strong>
                </div>
                <div class="flex justify-between mb-1">
                  <span class="text-muted">Data Basis:</span>
                  <span>Last 30 Days Operations</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted">Prediction Method:</span>
                  <span>Model-based forecasting</span>
                </div>
              </div>
            </div>

            <!-- Prediction Card 2 -->
            <div class="glass-card">
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-semibold text-muted">FORECASTED LINE EFFICIENCY</span>
                ${renderTagBadge('Model-based')}
              </div>
              <div class="text-3xl font-bold text-main mb-1">87.5%</div>
              <div class="text-xs text-warning mb-3 flex items-center gap-1">
                ${getIcon('alertTriangle', 14)} Subject to Machine A nozzle maintenance
              </div>

              <div style="background: rgba(15, 23, 42, 0.5); padding: 0.875rem; border-radius: var(--radius-md);" class="text-xs">
                <div class="flex justify-between mb-1">
                  <span class="text-muted">Confidence Level:</span>
                  <strong class="text-primary">High (89%)</strong>
                </div>
                <div class="flex justify-between mb-1">
                  <span class="text-muted">Data Basis:</span>
                  <span>Downtime Log History</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted">Prediction Method:</span>
                  <span>Trend extrapolation</span>
                </div>
              </div>
            </div>

            <!-- Data Transparency Box -->
            <div class="glass-card" style="background: rgba(59, 130, 246, 0.08); border-color: rgba(59, 130, 246, 0.3);">
              <h4 class="text-sm font-bold text-main mb-2 flex items-center gap-2">
                ${getIcon('info', 18)}
                Transparency Disclaimer
              </h4>
              <p class="text-xs text-muted mb-3" style="line-height: 1.6;">
                Predictive insights are estimates generated using available machine and operational information. They provide decision support for MSME owners and should be evaluated alongside plant floor conditions.
              </p>
              <div class="badge badge-info">Prototype Synthetic Demonstration</div>
            </div>
          </div>

        </div>
      </main>
    </div>
  `;
};