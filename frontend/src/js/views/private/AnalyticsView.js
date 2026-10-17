/* UDYAM SARTHI Deep Business Analytics View */
import { renderSidebar } from '../../components/Sidebar.js';
import { renderTopbar } from '../../components/Topbar.js';
import { renderLineChart, renderBarChart } from '../../components/ChartEngine.js';
import { renderTagBadge } from '../../components/TagBadge.js';
import { getIcon } from '../../components/IconLibrary.js';
import { dataService } from '../../services/dataService.js';

export const AnalyticsView = () => {
  const kpis = dataService.getKPIs();
  const machinePerf = dataService.getMachinePerformance();
  let currentTab = 'production';

  setTimeout(() => {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        currentTab = e.currentTarget.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');

        document.querySelectorAll('.analytics-tab-pane').forEach(p => p.style.display = 'none');
        const target = document.getElementById(`tab-pane-${currentTab}`);
        if (target) target.style.display = 'block';
      });
    });
  }, 0);

  return `
    <div class="app-layout">
      ${renderSidebar('/analytics')}

      <main class="app-main">
        ${renderTopbar()}

        <div class="app-page-content">
          <div class="page-header">
            <div>
              <h1 class="page-title">Business Analytics & Trends</h1>
              <p class="page-subtitle">Deep dive analytics across production, machine utilization, energy intensity, downtime, and scrap losses.</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="badge badge-info text-xs">${kpis.reportingPeriod}</span>
              ${renderTagBadge('Operational KPI Engine')}
            </div>
          </div>

          <!-- Empty Dataset Guard -->
          ${!kpis.hasData ? `
            <div class="glass-card text-center mb-6" style="padding: 3rem;">
              <div style="font-size: 2rem; margin-bottom: 0.75rem;">📊</div>
              <h3 class="text-base font-bold text-main mb-1">No Operations Data Logged Yet</h3>
              <p class="text-xs text-muted mb-4">Start logging daily machine runs, downtime, and energy on the Daily Operations page to generate real-time analytics.</p>
              <a href="#/operations" class="btn btn-primary btn-sm">
                ${getIcon('plus', 14)} Add Shift Operation Log
              </a>
            </div>
          ` : `
            <!-- Tabs Header -->
            <div class="tab-group">
              <button class="tab-btn active" data-tab="production">Production Output</button>
              <button class="tab-btn" data-tab="machine">Machine Performance</button>
              <button class="tab-btn" data-tab="energy">Energy Consumption</button>
              <button class="tab-btn" data-tab="downtime">Downtime Breakdown</button>
              <button class="tab-btn" data-tab="waste">Waste & Scrap</button>
            </div>

            <!-- TAB 1: PRODUCTION -->
            <div class="analytics-tab-pane" id="tab-pane-production">
              <div class="grid grid-cols-3 gap-6 mb-6">
                <div class="glass-card" style="grid-column: span 2;">
                  ${renderLineChart({
                    title: 'Daily Production Output vs Expected Target',
                    labels: ['Aug 23', 'Aug 24', 'Aug 25', 'Aug 26', 'Aug 27', 'Aug 28', 'Aug 29'],
                    series: [
                      { name: 'Actual Units', data: [310, 325, 340, 335, 331, 317, 322], color: '#3b82f6' },
                      { name: 'Target Units', data: [350, 350, 350, 350, 350, 350, 350], color: '#10b981' }
                    ],
                    height: 240
                  })}
                </div>

                <div class="glass-card">
                  <h4 class="text-sm font-bold mb-3">Production KPI Summary</h4>
                  <div class="mb-4">
                    <span class="text-xs text-muted display-block">Total Actual Production</span>
                    <strong class="text-2xl font-bold text-main">${kpis.actualOutput.toLocaleString()} Units</strong>
                  </div>
                  <div class="mb-4">
                    <span class="text-xs text-muted display-block">Rated Target Output</span>
                    <strong class="text-xl font-bold text-accent">${kpis.expectedOutput.toLocaleString()} Units</strong>
                  </div>
                  <div class="mb-4">
                    <span class="text-xs text-muted display-block">Production Variance</span>
                    <strong class="text-lg font-bold ${Number(kpis.variancePercent) >= 0 ? 'text-success' : 'text-warning'}">
                      ${kpis.variancePercent}%
                    </strong>
                  </div>
                  <p class="text-xs text-dim">
                    *Derived directly from ${kpis.recordCount} operational shift logs.
                  </p>
                </div>
              </div>
            </div>

            <!-- TAB 2: MACHINE PERFORMANCE (DATA-DRIVEN) -->
            <div class="analytics-tab-pane" id="tab-pane-machine" style="display: none;">
              <div class="glass-card mb-6">
                ${renderBarChart({
                  title: 'Machine Line Efficiency (%) from Operations Logs',
                  labels: machinePerf.map(m => m.name),
                  data: machinePerf.map(m => m.efficiency),
                  color: '#3b82f6',
                  height: 220
                })}
              </div>

              <div class="grid grid-cols-3 gap-4 mb-6">
                ${machinePerf.map(m => `
                  <div class="glass-card text-xs">
                    <div class="flex items-center justify-between mb-2">
                      <strong class="text-sm text-main">${m.name}</strong>
                      <span class="badge ${m.efficiency >= 85 ? 'badge-success' : 'badge-warning'}">${m.efficiency}% Eff</span>
                    </div>
                    <div class="text-muted mb-1">Runtime: <strong>${m.totalRuntime} hrs</strong> | Downtime: <strong class="text-warning">${m.totalDowntime} hrs</strong></div>
                    <div class="text-muted">Total Output: <strong>${m.actualOutputTotal}</strong> / ${m.expectedOutputTotal} Units</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- TAB 3: ENERGY -->
            <div class="analytics-tab-pane" id="tab-pane-energy" style="display: none;">
              <div class="glass-card mb-6">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs text-muted">Average Energy Intensity: <strong class="text-warning">${kpis.energyPerUnit} kWh/Unit</strong></span>
                  <span class="badge badge-info">Benchmark: ≤ 3.20 kWh</span>
                </div>
                ${renderBarChart({
                  title: 'Specific Energy Intensity (kWh / Unit)',
                  labels: ['Aug 25', 'Aug 26', 'Aug 27', 'Aug 28', 'Aug 29'],
                  data: [3.1, 3.2, 3.3, 3.9, 3.4],
                  color: '#f59e0b',
                  height: 220
                })}
              </div>
            </div>

            <!-- TAB 4: DOWNTIME -->
            <div class="analytics-tab-pane" id="tab-pane-downtime" style="display: none;">
              <div class="glass-card mb-6">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs text-muted">Recorded Plant Downtime: <strong class="text-warning">${kpis.downtimeHours} Hours</strong></span>
                  <span class="badge badge-warning">Target: ≤ 1.5 Hours / Shift</span>
                </div>
                ${renderBarChart({
                  title: 'Downtime Hours by Cause',
                  labels: ['Breakdown', 'Maintenance', 'Power', 'Material', 'Operator'],
                  data: [4.2, 2.5, 1.8, 1.0, 0.5],
                  color: '#ef4444',
                  height: 220
                })}
              </div>
            </div>

            <!-- TAB 5: WASTE & SCRAP -->
            <div class="analytics-tab-pane" id="tab-pane-waste" style="display: none;">
              <div class="glass-card mb-6">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs text-muted">Total Solid Scrap: <strong class="text-main">${kpis.totalScrapKg} Kg</strong> (${kpis.hasMaterialInput ? `Scrap Mass: <strong class="text-main">${kpis.scrapMassPct}%</strong>` : `Intensity: <strong class="text-main">${kpis.scrapIntensityKgPerUnit} kg/unit</strong>`})</span>
                  <a href="#/symbiosis" class="btn btn-accent btn-sm">Monetize on Symbiosis Exchange →</a>
                </div>
                ${renderBarChart({
                  title: 'Daily Scrap Generation (Kg)',
                  labels: ['Aug 25', 'Aug 26', 'Aug 27', 'Aug 28', 'Aug 29'],
                  data: [5.1, 4.0, 3.8, 7.3, 7.3],
                  color: '#8b5cf6',
                  height: 220
                })}
              </div>
            </div>
          `}

        </div>
      </main>
    </div>
  `;
};