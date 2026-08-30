/* UDYAM SARTHI Industrial Symbiosis View */
import { renderSidebar } from '../../components/Sidebar.js';
import { renderTopbar } from '../../components/Topbar.js';
import { renderTagBadge } from '../../components/TagBadge.js';
import { getIcon } from '../../components/IconLibrary.js';
import { store } from '../../store.js';

export const SymbiosisView = () => {
  const { symbiosisMatches } = store.getState();

  return `
    <div class="app-layout">
      ${renderSidebar('/symbiosis')}

      <main class="app-main">
        ${renderTopbar()}

        <div class="app-page-content">
          <div class="page-header">
            <div>
              <h1 class="page-title">Industrial Symbiosis & Resource Exchange</h1>
              <p class="page-subtitle">Discover opportunities to exchange or reuse industrial by-products with nearby manufacturing plants.</p>
            </div>
            ${renderTagBadge('Synthetic', 'Synthetic Partner Data')}
          </div>

          <div class="grid grid-cols-2 gap-6 mb-6">
            ${symbiosisMatches.map(match => `
              <div class="glass-card flex-col justify-between" style="border-left: 4px solid var(--accent-500);">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="badge badge-success">${match.status}</span>
                    <span class="text-xs font-bold text-accent">${match.matchScore}% Match Score</span>
                  </div>

                  <h3 class="text-base font-bold text-main mb-1">${match.offeredMaterial}</h3>
                  <p class="text-xs text-muted mb-3">Quantity: ${match.quantity} | Location: ${match.location}</p>

                  <div class="glass-card mb-3" style="padding: 0.875rem; background: rgba(15, 23, 42, 0.6);">
                    <span class="text-xs text-dim display-block mb-1">Matched Industrial Partner:</span>
                    <strong class="text-sm text-main display-block">${match.matchedPartner}</strong>
                    <p class="text-xs text-muted mt-1">${match.compatibilityReason}</p>
                  </div>
                </div>

                <div class="flex justify-end pt-3" style="border-top: 1px solid var(--border-color);">
                  <button class="btn btn-primary btn-sm">
                    ${getIcon('recycle', 14)}
                    <span>Initiate Contact Exchange</span>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>

        </div>
      </main>
    </div>
  `;
};