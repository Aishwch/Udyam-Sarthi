/* UDYAM SARTHI Deep Business Analytics View */
import { renderSidebar } from '../../components/Sidebar.js';
import { renderTopbar } from '../../components/Topbar.js';
import { renderLineChart, renderBarChart } from '../../components/ChartEngine.js';
import { renderTagBadge } from '../../components/TagBadge.js';
import { getIcon } from '../../components/IconLibrary.js';
import { dataService } from '../../services/dataService.js';

export const AnalyticsView = () => {
  const kpis = dataService.getKPIs();
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
            ${renderTagBadge('Synthetic')}
          </div>

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
                <h4 class="text-sm font-bold mb-3">Production Summary</h4>
                <div class="mb-4">
                  <span class="text-xs text-muted display-block">Total Actual Production</span>
                  <strong class="text-2xl font-bold text-main">${kpis.actualOutput} Units</strong>
                </div>
                <div class="mb-4">
                  <span class="text-xs text-muted display-block">Output Variance</span>
                  <strong class="text-lg font-bold text-warning">${kpis.variancePercent}%</strong>
                </div>
                <p class="text-xs text-dim">
                  *Expected values are estimated based on rated capacity.
                </p>
              </div>
            </div>
          </div>

          <!-- TAB 2: MACHINE -->
          <div class="analytics-tab-pane" id="tab-pane-machine" style="display: none;">
            <div class="glass-card mb-6">
              ${renderBarChart({
                title: 'Machine Utilization Rate (%)',
                labels: ['Machine A', 'Machine B', 'Machine C'],
                data: [80, 94, 98],
                color: '#3b82f6',
                height: 220
              })}
            </div>
          </div>

          <!-- TAB 3: ENERGY -->
          <div class="analytics-tab-pane" id="tab-pane-energy" style="display: none;">
            <div class="glass-card mb-6">
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
              ${renderBarChart({
                title: 'Downtime Hours by Cause',
                labels: ['Breakdown', 'Maintenance', 'Power', 'Material', 'Operator'],
                data: [4.2, 2.5, 1.8, 1.0, 0.5],
                color: '#ef4444',
                height: 220
              })}
            </div>
          </div>

          <!-- TAB 5: WASTE -->
          <div class="analytics-tab-pane" id="tab-pane-waste" style="display: none;">
            <div class="glass-card mb-6">
              ${renderBarChart({
                title: 'Daily Scrap Quantity (Kg)',
                labels: ['Aug 25', 'Aug 26', 'Aug 27', 'Aug 28', 'Aug 29'],
                data: [5.1, 4.0, 3.8, 7.3, 7.3],
                color: '#8b5cf6',
                height: 220
              })}
            </div>
          </div>

        </div>
      </main>
    </div>
  `;
};