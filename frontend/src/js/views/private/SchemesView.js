/* UDYAM SARTHI Government Scheme Discovery View */
import { renderSidebar } from '../../components/Sidebar.js';
import { renderTopbar } from '../../components/Topbar.js';
import { getIcon } from '../../components/IconLibrary.js';
import { GOVERNMENT_SCHEMES } from '../../data/schemesData.js';

export const SchemesView = () => {
  return `
    <div class="app-layout">
      ${renderSidebar('/schemes')}

      <main class="app-main">
        ${renderTopbar()}

        <div class="app-page-content">
          <div class="page-header">
            <div>
              <h1 class="page-title">Government & MSME Support Schemes</h1>
              <p class="page-subtitle">Discover financial subsidies, credit guarantee schemes, and technology upgradation programs.</p>
            </div>
          </div>

          <!-- Informational Banner -->
          <div class="glass-card mb-6" style="background: rgba(59, 130, 246, 0.08); border-color: rgba(59, 130, 246, 0.3);">
            <div class="flex items-center gap-3">
              <span class="text-primary">${getIcon('info', 22)}</span>
              <p class="text-xs text-muted">
                Recommendations are informational. Please verify eligibility and official application guidelines directly with the respective government department before applying.
              </p>
            </div>
          </div>

          <!-- Scheme Cards Grid -->
          <div class="flex-col gap-6 flex">
            ${GOVERNMENT_SCHEMES.map(sch => `
              <div class="glass-card scheme-card">
                <div class="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <div>
                    <span class="badge badge-info mb-1">${sch.category}</span>
                    <h3 class="text-lg font-bold text-main">${sch.name}</h3>
                    <span class="text-xs text-muted">Provider: ${sch.provider}</span>
                  </div>
                  <span class="badge badge-success">${sch.verifiedStatus}</span>
                </div>

                <p class="text-xs text-main mb-3" style="line-height: 1.6;">${sch.benefitSummary}</p>

                <div class="grid grid-cols-2 gap-4 text-xs mb-4" style="background: rgba(15, 23, 42, 0.5); padding: 0.875rem; border-radius: var(--radius-md);">
                  <div>
                    <span class="text-dim display-block">Eligibility Summary:</span>
                    <strong class="text-muted">${sch.eligibilitySummary}</strong>
                  </div>
                  <div>
                    <span class="text-dim display-block">Why Relevant to Your Plant:</span>
                    <strong class="text-accent">${sch.relevanceReason}</strong>
                  </div>
                </div>

                <div class="flex items-center justify-between pt-3" style="border-top: 1px solid var(--border-color);">
                  <span class="text-xs text-dim">Last Verified: ${sch.lastVerified}</span>
                  <a href="${sch.officialSource}" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">
                    <span>Official Portal</span>
                    ${getIcon('externalLink', 14)}
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