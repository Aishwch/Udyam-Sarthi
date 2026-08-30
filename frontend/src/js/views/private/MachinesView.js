/* UDYAM SARTHI Machine Management View */
import { renderSidebar } from '../../components/Sidebar.js';
import { renderTopbar } from '../../components/Topbar.js';
import { getIcon } from '../../components/IconLibrary.js';
import { renderModal, openModal, closeModal } from '../../components/Modal.js';
import { store } from '../../store.js';
import { dataService } from '../../services/dataService.js';

export const MachinesView = () => {
  const machinePerf = dataService.getMachinePerformance();

  setTimeout(() => {
    // Open Add Machine Modal
    const addBtn = document.getElementById('open-add-machine-modal');
    if (addBtn) {
      addBtn.addEventListener('click', () => openModal('modal-add-machine'));
    }

    // Modal Close buttons
    document.querySelectorAll('.modal-close-btn').forEach(b => {
      b.addEventListener('click', (e) => {
        closeModal(e.currentTarget.dataset.modalId);
      });
    });

    // Handle Add Machine Form
    const form = document.getElementById('add-machine-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const newMachine = {
          name: document.getElementById('m-name').value,
          type: document.getElementById('m-type').value,
          manufacturer: document.getElementById('m-mfr').value,
          model: document.getElementById('m-model').value,
          ratedCapacity: Number(document.getElementById('m-cap').value),
          capacityUnit: document.getElementById('m-unit').value,
          powerRating: Number(document.getElementById('m-power').value),
          ageYears: Number(document.getElementById('m-age').value),
          status: document.getElementById('m-status').value
        };

        store.addMachine(newMachine);
        closeModal('modal-add-machine');
        window.location.hash = '#/machines';
      });
    }

    // Detail modal openers
    document.querySelectorAll('.view-machine-detail-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mId = e.currentTarget.dataset.machineId;
        const targetM = machinePerf.find(m => m.id === mId);
        if (targetM) {
          document.getElementById('detail-m-name').textContent = targetM.name;
          document.getElementById('detail-m-type').textContent = targetM.type;
          document.getElementById('detail-m-cap').textContent = `${targetM.ratedCapacity} ${targetM.capacityUnit}`;
          document.getElementById('detail-m-eff').textContent = `${targetM.efficiency}%`;
          document.getElementById('detail-m-down').textContent = `${targetM.totalDowntime} hrs`;
          openModal('modal-machine-detail');
        }
      });
    });

  }, 0);

  const addMachineModalHtml = `
    <form id="add-machine-form">
      <div class="form-group">
        <label class="form-label">Machine Name</label>
        <input type="text" id="m-name" class="form-input" placeholder="e.g. Machine D (Wet Coating Line)" required />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">Machine Type</label>
          <input type="text" id="m-type" class="form-input" placeholder="e.g. Powder Spray Line" required />
        </div>
        <div class="form-group">
          <label class="form-label">Manufacturer</label>
          <input type="text" id="m-mfr" class="form-input" placeholder="e.g. SurfaceTech" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">Rated Capacity</label>
          <input type="number" id="m-cap" class="form-input" placeholder="100" required />
        </div>
        <div class="form-group">
          <label class="form-label">Capacity Unit</label>
          <input type="text" id="m-unit" class="form-input" value="Units/hr" required />
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div class="form-group">
          <label class="form-label">Power Rating (kW)</label>
          <input type="number" id="m-power" class="form-input" value="30.0" step="0.1" />
        </div>
        <div class="form-group">
          <label class="form-label">Age (Years)</label>
          <input type="number" id="m-age" class="form-input" value="2" />
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select id="m-status" class="form-select">
            <option value="Active">Active</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div class="flex justify-end gap-2 mt-4">
        <button type="button" class="btn btn-secondary modal-close-btn" data-modal-id="modal-add-machine">Cancel</button>
        <button type="submit" class="btn btn-primary">Add Machine</button>
      </div>
    </form>
  `;

  const detailMachineModalHtml = `
    <div>
      <div class="glass-card mb-4" style="background: rgba(15, 23, 42, 0.6);">
        <h4 id="detail-m-name" class="text-base font-bold mb-1"></h4>
        <p id="detail-m-type" class="text-xs text-muted"></p>
      </div>

      <div class="grid grid-cols-3 gap-4 text-center">
        <div class="glass-card">
          <span class="text-xs text-muted display-block">Rated Capacity</span>
          <strong id="detail-m-cap" class="text-sm font-bold text-main"></strong>
        </div>
        <div class="glass-card">
          <span class="text-xs text-muted display-block">Efficiency</span>
          <strong id="detail-m-eff" class="text-sm font-bold text-accent"></strong>
        </div>
        <div class="glass-card">
          <span class="text-xs text-muted display-block">Total Downtime</span>
          <strong id="detail-m-down" class="text-sm font-bold text-warning"></strong>
        </div>
      </div>
    </div>
  `;

  return `
    <div class="app-layout">
      ${renderSidebar('/machines')}

      <main class="app-main">
        ${renderTopbar()}

        <div class="app-page-content">
          <div class="page-header">
            <div>
              <h1 class="page-title">Machine Management</h1>
              <p class="page-subtitle">Configure plant machinery, rated capacities, and track performance status.</p>
            </div>

            <button class="btn btn-primary btn-sm" id="open-add-machine-modal">
              ${getIcon('plus', 14)}
              <span>Add New Machine</span>
            </button>
          </div>

          <!-- Machine Grid Cards -->
          <div class="grid grid-cols-3 gap-6 mb-6">
            ${machinePerf.map(m => `
              <div class="glass-card glass-card-interactive flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="badge ${m.status === 'Active' ? 'badge-success' : 'badge-warning'}">${m.status}</span>
                    <span class="text-xs text-dim">Age: ${m.ageYears} yrs</span>
                  </div>

                  <h3 class="text-base font-bold mb-1">${m.name}</h3>
                  <p class="text-xs text-muted mb-4">${m.type} | ${m.manufacturer || 'Standard'}</p>

                  <div class="grid grid-cols-2 gap-2 text-xs mb-4" style="background: rgba(15, 23, 42, 0.4); padding: 0.75rem; border-radius: var(--radius-md);">
                    <div>
                      <span class="text-dim display-block">Rated Capacity:</span>
                      <strong>${m.ratedCapacity} ${m.capacityUnit}</strong>
                    </div>
                    <div>
                      <span class="text-dim display-block">Power Rating:</span>
                      <strong>${m.powerRating || 30} kW</strong>
                    </div>
                  </div>
                </div>

                <div class="flex items-center justify-between pt-2 style="border-top: 1px solid var(--border-color);">
                  <div>
                    <span class="text-xs text-muted">Efficiency: </span>
                    <strong class="text-xs font-bold ${m.efficiency < 85 ? 'text-warning' : 'text-success'}">${m.efficiency}%</strong>
                  </div>
                  <button class="btn btn-secondary btn-sm view-machine-detail-btn" data-machine-id="${m.id}">
                    View Details
                  </button>
                </div>
              </div>
            `).join('')}
          </div>

          ${renderModal({ id: 'modal-add-machine', title: 'Register New Plant Machine', contentHtml: addMachineModalHtml })}
          ${renderModal({ id: 'modal-machine-detail', title: 'Machine Analytics & Performance History', contentHtml: detailMachineModalHtml })}
        </div>
      </main>
    </div>
  `;
};