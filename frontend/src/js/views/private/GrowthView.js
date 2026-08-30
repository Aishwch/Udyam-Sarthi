/* UDYAM SARTHI Business Growth Opportunities View */
import { renderSidebar } from '../../components/Sidebar.js';
import { renderTopbar } from '../../components/Topbar.js';
import { renderTagBadge } from '../../components/TagBadge.js';
import { getIcon } from '../../components/IconLibrary.js';
import { store } from '../../store.js';

export const GrowthView = () => {
  const { growthOpportunities } = store.getState();

  return `
    <div class="app-layout">
      ${renderSidebar('/growth')}

      <main class="app-main">
        ${renderTopbar()}

        <div class="app-page-content">
          <div class="page-header">
            <div>
              <h1 class="page-title">Business Growth Opportunities</h1>
              <p class="page-subtitle">Actionable recommendations to boost plant capacity, reduce energy intensity, and improve profitability.</p>
            </div>
            ${renderTagBadge('Estimated')}
          </div>

          <div class="grid grid-cols-2 gap-6">
            ${growthOpportunities.map(opp => `
              <div class="glass-card flex-col justify-between" style="border-top: 4px solid var(--accent-500);">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="badge badge-success">${opp.category}</span>
                    ${renderTagBadge(opp.provenance || 'Estimated')}
                  </div>

                  <h3 class="text-lg font-bold text-main mb-2">${opp.title}</h3>

                  <div class="grid grid-cols-2 gap-3 mb-4 text-xs" style="background: rgba(15, 23, 42, 0.5); padding: 0.875rem; border-radius: var(--radius-md);">
                    <div>
                      <span class="text-dim display-block">Current Metric:</span>
                      <strong class="text-warning">${opp.currentMetric}</strong>
                    </div>
                    <div>
                      <span class="text-dim display-block">Potential Target:</span>
                      <strong class="text-accent">${opp.potentialImpact}</strong>
                    </div>
                  </div>

                  <div class="mb-4">
                    <span class="text-xs font-semibold text-muted display-block mb-1">Estimated Business Impact:</span>
                    <div class="text-base font-bold text-accent mb-2">${opp.estimatedValue}</div>
                    <p class="text-xs text-muted" style="line-height: 1.5;">${opp.reason}</p>
                  </div>

                  <div class="glass-card mb-4" style="padding: 0.875rem; background: rgba(37, 99, 235, 0.08); border-color: rgba(59, 130, 246, 0.2);">
                    <strong class="text-xs text-primary display-block mb-1 flex items-center gap-1">
                      ${getIcon('zap', 14)} Suggested Action Step:
                    </strong>
                    <p class="text-xs text-main">${opp.suggestedAction}</p>
                  </div>
                </div>

                <div class="flex justify-end pt-3" style="border-top: 1px solid var(--border-color);">
                  <a href="${opp.ctaRoute || '#/analytics'}" class="btn btn-primary btn-sm">
                    <span>View Analysis</span>
                    ${getIcon('chevronRight', 14)}
                  </a>
                </div>
              </div>
            `).join('')}
          </div>

        </div>
      </main>
    </div>
  `;
};