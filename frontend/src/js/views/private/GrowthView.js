/* UDYAM SARTHI Business Growth Opportunities & Recommendations View */
import { renderSidebar } from '../../components/Sidebar.js';
import { renderTopbar } from '../../components/Topbar.js';
import { renderTagBadge } from '../../components/TagBadge.js';
import { getIcon } from '../../components/IconLibrary.js';
import { dataService } from '../../services/dataService.js';
import { recommendationService } from '../../services/recommendationService.js';

let activeRecs = [];

export const GrowthView = () => {
  const kpis = dataService.getKPIs();

  setTimeout(() => {
    recommendationService.getRecommendations().then(recs => {
      activeRecs = recs;
      const listContainer = document.getElementById('growth-recs-grid');
      if (listContainer) {
        listContainer.innerHTML = renderRecommendationsList(recs);
      }
    });
  }, 0);

  return `
    <div class="app-layout">
      ${renderSidebar('/growth')}

      <main class="app-main">
        ${renderTopbar()}

        <div class="app-page-content">
          <div class="page-header">
            <div>
              <h1 class="page-title">Business Growth & Operational Recommendations</h1>
              <p class="page-subtitle">Explainable, rule-based recommendations derived from actual plant downtime, utilization, scrap, and energy intensity.</p>
            </div>
            ${renderTagBadge('Data-Driven Engine', 'Rule-Based')}
          </div>

          <!-- KPI Context Banner -->
          <div class="glass-card mb-6" style="padding: 1rem 1.25rem; border-left: 4px solid var(--accent-500);">
            <div class="flex items-center justify-between flex-wrap gap-4 text-xs">
              <div>
                <strong class="text-sm text-main display-block mb-1">Operational Metrics Basis:</strong>
                <span class="text-muted">Evaluated against ${kpis.reportingPeriod} (${kpis.recordCount} shift logs).</span>
              </div>
              <div class="flex items-center gap-4 text-center">
                <div>
                  <span class="text-dim display-block text-xxs">Downtime</span>
                  <strong class="text-warning">${kpis.downtimeHours} hrs</strong>
                </div>
                <div>
                  <span class="text-dim display-block text-xxs">Utilization</span>
                  <strong class="text-accent">${kpis.utilizationRate}%</strong>
                </div>
                <div>
                  <span class="text-dim display-block text-xxs">Energy</span>
                  <strong class="text-main">${kpis.energyPerUnit} kWh/u</strong>
                </div>
                <div>
                  <span class="text-dim display-block text-xxs">Scrap</span>
                  <strong class="text-main">${kpis.totalScrapKg} kg</strong>
                </div>
              </div>
            </div>
          </div>

          <!-- Recommendations Grid -->
          <div class="grid grid-cols-2 gap-6" id="growth-recs-grid">
            ${renderRecommendationsList(activeRecs.length ? activeRecs : getDefaultRecs(kpis))}
          </div>

        </div>
      </main>
    </div>
  `;
};

function renderRecommendationsList(recs) {
  if (!recs || recs.length === 0) {
    return `<div class="glass-card text-center col-span-2 py-8"><p class="text-muted">Loading recommendations...</p></div>`;
  }

  return recs.map(rec => `
    <div class="glass-card flex-col justify-between" style="border-top: 4px solid ${rec.priority === 'High' ? 'var(--warning)' : rec.priority === 'Medium' ? 'var(--primary)' : 'var(--accent-500)'};">
      <div>
        <div class="flex items-center justify-between mb-2">
          <span class="badge ${rec.priority === 'High' ? 'badge-warning' : rec.priority === 'Medium' ? 'badge-info' : 'badge-success'}">
            ${rec.priority} Priority
          </span>
          <span class="text-xs text-muted font-semibold">${rec.category}</span>
        </div>

        <h3 class="text-lg font-bold text-main mb-2">${rec.title}</h3>

        <!-- Trigger and Benchmark -->
        <div class="grid grid-cols-2 gap-3 mb-4 text-xs" style="background: rgba(15, 23, 42, 0.5); padding: 0.875rem; border-radius: var(--radius-md);">
          <div>
            <span class="text-dim display-block">Observed Metric:</span>
            <strong class="text-warning">${rec.current_value}</strong>
          </div>
          <div>
            <span class="text-dim display-block">Target Benchmark:</span>
            <strong class="text-accent">${rec.benchmark_threshold}</strong>
          </div>
        </div>

        <!-- Trigger Condition -->
        <div class="mb-3 text-xs">
          <span class="text-dim display-block mb-1 font-semibold">Trigger Condition:</span>
          <p class="text-main font-semibold">${rec.trigger_condition}</p>
        </div>

        <!-- Why It Matters -->
        <div class="mb-4 text-xs">
          <span class="text-dim display-block mb-1 font-semibold">Why It Matters:</span>
          <p class="text-muted" style="line-height: 1.5;">${rec.why_it_matters}</p>
        </div>

        <!-- Practical Suggested Action -->
        <div class="glass-card mb-4" style="padding: 0.875rem; background: rgba(37, 99, 235, 0.08); border-color: rgba(59, 130, 246, 0.2);">
          <strong class="text-xs text-primary display-block mb-1 flex items-center gap-1">
            ${getIcon('zap', 14)} Practical Suggested Action:
          </strong>
          <p class="text-xs text-main" style="line-height: 1.5;">${rec.suggested_action}</p>
        </div>
      </div>

      <div class="flex justify-end pt-3" style="border-top: 1px solid var(--border-color);">
        <a href="${rec.cta_route || '#/analytics'}" class="btn btn-primary btn-sm">
          <span>Take Action</span>
          ${getIcon('chevronRight', 14)}
        </a>
      </div>
    </div>
  `).join('');
}

function getDefaultRecs(kpis) {
  return [
    {
      id: "rec-dt-1",
      title: "Mitigate Unplanned Machine Stoppages",
      priority: "High",
      category: "Downtime Reduction",
      trigger_condition: `Downtime recorded at ${kpis.downtimeHours} hrs (Threshold: > 2.5 hrs)`,
      current_value: `${kpis.downtimeHours} Hours`,
      benchmark_threshold: "≤ 1.5 Hours / Shift",
      why_it_matters: "Unplanned downtime bottlenecks production throughput, idles downstream stages, and increases indirect operating costs.",
      suggested_action: "Schedule 15-minute autonomous maintenance purge at shift handover and verify pneumatic line pressure stability.",
      cta_route: "#/diagnosis"
    },
    {
      id: "rec-ut-1",
      title: "Improve Plant Capacity Utilization",
      priority: "Medium",
      category: "Capacity Optimization",
      trigger_condition: `Plant utilization is ${kpis.utilizationRate}% (Threshold: < 85.0%)`,
      current_value: `${kpis.utilizationRate}%`,
      benchmark_threshold: "≥ 85.0% Plant Utilization",
      why_it_matters: "Sub-optimal machine runtime inflates fixed asset amortization per unit and ties up factory floor capital.",
      suggested_action: "Pre-stage raw materials 30 minutes prior to shift commencement and cross-train operators on rapid changeover procedures.",
      cta_route: "#/machines"
    },
    {
      id: "rec-en-1",
      title: "Reduce Peak Specific Energy Consumption",
      priority: "Medium",
      category: "Energy Efficiency",
      trigger_condition: `Energy intensity reached ${kpis.energyPerUnit} kWh/unit (Threshold: ≥ 3.5 kWh/unit)`,
      current_value: `${kpis.energyPerUnit} kWh/Unit`,
      benchmark_threshold: "≤ 3.20 kWh / Unit",
      why_it_matters: "Elevated energy consumption per unit points to process heat loss, motor idling, or uncompensated power factor penalties.",
      suggested_action: "Inspect pre-treatment thermal chamber insulation gaskets and evaluate TEQUP government scheme energy audit subsidies.",
      cta_route: "#/analytics"
    },
    {
      id: "rec-sc-1",
      title: "Monetize Scrap & Re-evaluate Line Tolerance",
      priority: "High",
      category: "Material Circularity",
      trigger_condition: `Scrap generation reached ${kpis.totalScrapKg} kg (Threshold: ≥ 15.0 kg)`,
      current_value: `${kpis.totalScrapKg} Kg`,
      benchmark_threshold: "≤ 10.0 Kg / Week",
      why_it_matters: "Scrap losses directly destroy bill-of-materials margin and create solid industrial disposal liabilities.",
      suggested_action: "Recalibrate powder coating dispenser nozzle pressure and list off-spec by-product on the Industrial Symbiosis exchange.",
      cta_route: "#/symbiosis"
    }
  ];
}