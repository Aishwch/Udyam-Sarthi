/* UDYAM SARTHI Main MSME Business Dashboard View */
import { renderSidebar } from '../../components/Sidebar.js';
import { renderTopbar } from '../../components/Topbar.js';
import { renderKpiCard } from '../../components/KpiCard.js';
import { renderLineChart } from '../../components/ChartEngine.js';
import { getIcon } from '../../components/IconLibrary.js';
import { renderTagBadge } from '../../components/TagBadge.js';
import { store } from '../../store.js';
import { dataService } from '../../services/dataService.js';

export const DashboardView = () => {
  const { business, alerts, growthOpportunities } = store.getState();
  const kpis = dataService.getKPIs();
  const machinePerf = dataService.getMachinePerformance();
  const unackAlerts = alerts.filter(a => !a.acknowledged);

  return `
    <div class="app-layout">
      ${renderSidebar('/dashboard')}
      
      <main class="app-main">
        ${renderTopbar()}

        <div class="app-page-content">
          <!-- Page Header -->
          <div class="page-header">
            <div>
              <h1 class="page-title">Good Morning, ${business.name} 👋</h1>
              <p class="page-subtitle">Here is your digital business companion operational breakdown for Peenya Plant 1.</p>
            </div>

            <div class="flex items-center gap-3">
              <select class="form-select text-xs" style="width: auto; padding: 0.4rem 0.8rem;">
                <option value="7">Last 7 Days</option>
                <option value="30" selected>This Month (Aug 2026)</option>
                <option value="90">Quarter 3</option>
              </select>

              <a href="#/operations" class="btn btn-primary btn-sm">
                ${getIcon('plus', 14)}
                <span>Add Daily Data</span>
              </a>
            </div>
          </div>

          <!-- Attention Required Banner -->
          ${unackAlerts.length ? `
            <div class="glass-card mb-6" style="border-left: 4px solid var(--warning); background: rgba(245, 158, 11, 0.08);">
              <div class="flex items-center justify-between flex-wrap gap-3">
                <div class="flex items-center gap-3">
                  <span class="text-warning">${getIcon('alertTriangle', 22)}</span>
                  <div>
                    <strong class="text-sm text-main display-block">Operational Attention Required (${unackAlerts.length} Unacknowledged Alert)</strong>
                    <p class="text-xs text-muted">${unackAlerts[0].summary}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <a href="#/alerts" class="btn btn-secondary btn-sm">View Alert Details</a>
                  <a href="#/diagnosis" class="btn btn-primary btn-sm">Diagnose Root Cause</a>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Top KPI Grid (6 KPI Cards) -->
          <div class="grid grid-cols-3 gap-6 mb-6">
            ${renderKpiCard({
              title: 'Actual Production',
              value: kpis.actualOutput.toLocaleString(),
              unit: 'Units',
              target: `${kpis.expectedOutput.toLocaleString()} Units`,
              trend: { value: `${kpis.variancePercent}% variance`, type: kpis.variancePercent >= 0 ? 'up' : 'down' },
              iconName: 'barChart3',
              provenance: 'User-entered'
            })}

            ${renderKpiCard({
              title: 'Expected Production',
              value: kpis.expectedOutput.toLocaleString(),
              unit: 'Units',
              subtitle: 'Rated Capacity Estimate',
              iconName: 'trendingUp',
              provenance: 'Estimated'
            })}

            ${renderKpiCard({
              title: 'Plant Utilization',
              value: `${kpis.utilizationRate}%`,
              unit: '',
              target: '90.0%',
              trend: { value: '+2.1%', type: 'up' },
              iconName: 'factory',
              provenance: 'Synthetic'
            })}

            ${renderKpiCard({
              title: 'Line Efficiency',
              value: `${kpis.efficiencyRate}%`,
              unit: '',
              trend: { value: '-4.5% vs last week', type: 'down' },
              iconName: 'cpu',
              provenance: 'Model-based'
            })}

            ${renderKpiCard({
              title: 'Total Downtime',
              value: kpis.downtimeHours,
              unit: 'Hours',
              subtitle: '65% Unplanned Breakdown',
              iconName: 'alertTriangle',
              provenance: 'User-entered'
            })}

            ${renderKpiCard({
              title: 'Energy per Unit',
              value: kpis.energyPerUnit,
              unit: 'kWh/Unit',
              target: '3.20 kWh',
              trend: { value: '+0.42 spike', type: 'down' },
              iconName: 'zap',
              provenance: 'Synthetic'
            })}
          </div>

          <!-- Main Grid: Production Chart + Quick Actions -->
          <div class="grid grid-cols-3 gap-6 mb-6">
            <!-- Expected vs Actual Production Chart (Col 1-2) -->
            <div class="glass-card" style="grid-column: span 2;">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="text-base font-bold">Production Trend: Expected vs Actual</h3>
                  <p class="text-xs text-muted">Daily output comparisons for Machine A, B, and C</p>
                </div>
                ${renderTagBadge('Synthetic')}
              </div>
              ${renderLineChart({
                title: '',
                labels: ['Aug 23', 'Aug 24', 'Aug 25', 'Aug 26', 'Aug 27', 'Aug 28', 'Aug 29'],
                series: [
                  { name: 'Actual Output', data: [310, 325, 340, 335, 331, 317, 322], color: '#3b82f6' },
                  { name: 'Expected Output', data: [350, 350, 350, 350, 350, 350, 350], color: '#93c5fd' }
                ],
                height: 220
              })}
            </div>

            <!-- Quick Actions & Companion Preview (Col 3) -->
            <div class="flex-col gap-4 flex">
              <div class="glass-card flex-1">
                <h3 class="text-base font-bold mb-3 flex items-center gap-2">
                  <span class="text-primary">${getIcon('zap', 18)}</span>
                  Quick Plant Actions
                </h3>
                <div class="flex-col gap-2 flex">
                  <a href="#/operations" class="btn btn-secondary btn-sm justify-between">
                    <span>Log Daily Machine Run</span>
                    ${getIcon('chevronRight', 14)}
                  </a>
                  <a href="#/machines" class="btn btn-secondary btn-sm justify-between">
                    <span>Manage Line Machinery</span>
                    ${getIcon('chevronRight', 14)}
                  </a>
                  <a href="#/analytics" class="btn btn-secondary btn-sm justify-between">
                    <span>Deep Analytics Breakdown</span>
                    ${getIcon('chevronRight', 14)}
                  </a>
                  <a href="#/assistant" class="btn btn-primary btn-sm justify-between">
                    <span>Consult AI Companion</span>
                    ${getIcon('bot', 14)}
                  </a>
                </div>
              </div>

              <!-- Growth Opportunity Preview -->
              <div class="glass-card" style="background: rgba(16, 185, 129, 0.08); border-color: rgba(16, 185, 129, 0.3);">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-bold text-accent">TOP GROWTH OPPORTUNITY</span>
                  ${renderTagBadge('Estimated')}
                </div>
                <h4 class="text-sm font-bold text-main mb-1">${growthOpportunities[0].title}</h4>
                <p class="text-xs text-muted mb-3">${growthOpportunities[0].estimatedValue}</p>
                <a href="#/growth" class="btn btn-accent btn-sm w-full">Explore Growth Details</a>
              </div>
            </div>
          </div>

          <!-- Machine Performance Table -->
          <div class="glass-card">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="text-base font-bold">Line Machinery Performance Overview</h3>
                <p class="text-xs text-muted">Individual status and efficiency breakdown for registered machines</p>
              </div>
              <a href="#/machines" class="btn btn-secondary btn-sm">View All Machines</a>
            </div>

            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Machine Name</th>
                    <th>Type</th>
                    <th>Rated Capacity</th>
                    <th>Runtime</th>
                    <th>Downtime</th>
                    <th>Efficiency</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${machinePerf.map(m => `
                    <tr>
                      <td><strong>${m.name}</strong></td>
                      <td class="text-muted text-xs">${m.type}</td>
                      <td>${m.ratedCapacity} ${m.capacityUnit}</td>
                      <td>${m.totalRuntime} hrs</td>
                      <td class="text-warning">${m.totalDowntime} hrs</td>
                      <td>
                        <div class="flex items-center gap-2">
                          <div style="flex: 1; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; min-width: 60px;">
                            <div style="width: ${m.efficiency}%; height: 100%; background: ${m.efficiency < 85 ? 'var(--warning)' : 'var(--success)'}; border-radius: 3px;"></div>
                          </div>
                          <span class="text-xs font-bold">${m.efficiency}%</span>
                        </div>
                      </td>
                      <td>
                        <span class="badge badge-success">${m.status}</span>
                      </td>
                      <td>
                        <a href="#/machines" class="btn btn-secondary btn-sm">Details</a>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  `;
};