/* UDYAM SARTHI Daily Operations Input & History View */
import { renderSidebar } from '../../components/Sidebar.js';
import { renderTopbar } from '../../components/Topbar.js';
import { getIcon } from '../../components/IconLibrary.js';
import { store } from '../../store.js';

export const OperationsView = () => {
  const { machines, operations } = store.getState();

  setTimeout(() => {
    const form = document.getElementById('daily-operations-form');
    const errorBox = document.getElementById('op-form-error');

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        errorBox.style.display = 'none';

        const runtimeHours = Number(document.getElementById('op-runtime').value || 0);
        const downtimeHours = Number(document.getElementById('op-downtime').value || 0);
        const actualOutput = Number(document.getElementById('op-output').value || 0);
        const energyConsumedKwh = Number(document.getElementById('op-energy').value || 0);
        const scrapQuantityKg = Number(document.getElementById('op-scrap').value || 0);
        const machineId = document.getElementById('op-machine').value;
        const targetMachine = machines.find(m => m.id === machineId);

        // Validations
        if (runtimeHours < 0 || downtimeHours < 0 || actualOutput < 0 || energyConsumedKwh < 0 || scrapQuantityKg < 0) {
          errorBox.textContent = "Values cannot be negative!";
          errorBox.style.display = 'block';
          return;
        }

        if (runtimeHours + downtimeHours > 24) {
          errorBox.textContent = "Total runtime + downtime cannot exceed 24 hours in a single day!";
          errorBox.style.display = 'block';
          return;
        }

        const expectedOutput = Math.round((targetMachine ? targetMachine.ratedCapacity : 100) * runtimeHours);

        const newLog = {
          date: document.getElementById('op-date').value,
          machineId,
          machineName: targetMachine ? targetMachine.name : 'Machine',
          runtimeHours,
          downtimeHours,
          plannedDowntimeHours: Number(document.getElementById('op-planned-down').value || 0),
          actualOutput,
          expectedOutput,
          energyConsumedKwh,
          scrapQuantityKg,
          maintenanceFlag: document.getElementById('op-maintenance').checked,
          downtimeReason: document.getElementById('op-reason').value,
          notes: document.getElementById('op-notes').value
        };

        store.addOperationLog(newLog);
        form.reset();
        document.getElementById('op-date').value = new Date().toISOString().split('T')[0];
        window.location.hash = '#/operations';
      });
    }
  }, 0);

  const todayStr = new Date().toISOString().split('T')[0];

  return `
    <div class="app-layout">
      ${renderSidebar('/operations')}

      <main class="app-main">
        ${renderTopbar()}

        <div class="app-page-content">
          <div class="page-header">
            <div>
              <h1 class="page-title">Daily Operations Tracking</h1>
              <p class="page-subtitle">Record daily runtime, downtime reasons, production output, and energy consumption.</p>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-6">
            <!-- Operational Log Form (Col 1-2) -->
            <div class="glass-card" style="grid-column: span 2;">
              <h3 class="text-base font-bold mb-4 flex items-center gap-2">
                ${getIcon('clipboardList', 18)}
                Log Daily Operations Data Entry
              </h3>

              <div id="op-form-error" class="form-error mb-4" style="display: none; padding: 0.75rem; background: var(--danger-bg); border-radius: var(--radius-sm); border: 1px solid var(--danger);"></div>

              <form id="daily-operations-form">
                <div class="grid grid-cols-2 gap-4">
                  <div class="form-group">
                    <label class="form-label">Entry Date</label>
                    <input type="date" id="op-date" class="form-input" value="${todayStr}" required />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Select Machine</label>
                    <select id="op-machine" class="form-select" required>
                      ${machines.map(m => `<option value="${m.id}">${m.name} (${m.ratedCapacity} Units/hr)</option>`).join('')}
                    </select>
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-4">
                  <div class="form-group">
                    <label class="form-label">Runtime (Hours)</label>
                    <input type="number" id="op-runtime" class="form-input" placeholder="7.0" step="0.1" min="0" max="24" required />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Unplanned Downtime (Hrs)</label>
                    <input type="number" id="op-downtime" class="form-input" placeholder="1.0" step="0.1" min="0" max="24" required />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Planned Downtime (Hrs)</label>
                    <input type="number" id="op-planned-down" class="form-input" placeholder="0.2" step="0.1" min="0" max="24" />
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-4">
                  <div class="form-group">
                    <label class="form-label">Actual Output (Units)</label>
                    <input type="number" id="op-output" class="form-input" placeholder="96" min="0" required />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Energy Consumed (kWh)</label>
                    <input type="number" id="op-energy" class="form-input" placeholder="295" step="0.1" min="0" required />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Scrap / Waste (Kg)</label>
                    <input type="number" id="op-scrap" class="form-input" placeholder="4.2" step="0.1" min="0" />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="form-group">
                    <label class="form-label">Primary Downtime Reason</label>
                    <select id="op-reason" class="form-select">
                      <option value="None">None (Smooth Operation)</option>
                      <option value="Machine breakdown">Machine breakdown</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Material shortage">Material shortage</option>
                      <option value="Power issue">Power issue</option>
                      <option value="Operator issue">Operator issue</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div class="form-group flex items-center gap-2" style="margin-top: 1.8rem;">
                    <input type="checkbox" id="op-maintenance" style="width: 18px; height: 18px;" />
                    <label for="op-maintenance" class="form-label" style="margin: 0; cursor: pointer;">Flag for Maintenance Audit</label>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Shift Notes / Observations</label>
                  <input type="text" id="op-notes" class="form-input" placeholder="e.g. Nozzle clog caused short stoppage at 11:30 AM" />
                </div>

                <div class="flex justify-end mt-4">
                  <button type="submit" class="btn btn-primary">
                    ${getIcon('check', 16)}
                    <span>Record Operations Data</span>
                  </button>
                </div>
              </form>
            </div>

            <!-- Operations Data Input Guidance (Col 3) -->
            <div class="glass-card">
              <h3 class="text-base font-bold mb-3">Validation & Data Guidance</h3>
              <ul class="text-xs text-muted" style="list-style: disc; padding-left: 1.25rem; display: flex; flex-direction: column; gap: 0.6rem;">
                <li>Runtime + Downtime should equal standard shift hours.</li>
                <li>Expected output is automatically calculated from machine rated capacity.</li>
                <li>Tag downtime accurately to enable root cause diagnosis in AI assistant.</li>
              </ul>
            </div>
          </div>

          <!-- Operations History Table -->
          <div class="glass-card mt-6">
            <h3 class="text-base font-bold mb-4">Operations Input History</h3>
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Machine</th>
                    <th>Runtime</th>
                    <th>Downtime</th>
                    <th>Actual Output</th>
                    <th>Expected</th>
                    <th>Energy (kWh)</th>
                    <th>Downtime Reason</th>
                  </tr>
                </thead>
                <tbody>
                  ${operations.map(op => `
                    <tr>
                      <td><strong>${op.date}</strong></td>
                      <td>${op.machineName}</td>
                      <td>${op.runtimeHours} hrs</td>
                      <td class="${op.downtimeHours > 0 ? 'text-warning' : ''}">${op.downtimeHours} hrs</td>
                      <td><strong>${op.actualOutput}</strong></td>
                      <td class="text-dim">${op.expectedOutput}</td>
                      <td>${op.energyConsumedKwh} kWh</td>
                      <td><span class="badge ${op.downtimeReason === 'None' ? 'badge-success' : 'badge-warning'}">${op.downtimeReason}</span></td>
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