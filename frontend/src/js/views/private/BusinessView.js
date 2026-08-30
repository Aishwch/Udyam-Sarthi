/* UDYAM SARTHI Business Profile View */
import { renderSidebar } from '../../components/Sidebar.js';
import { renderTopbar } from '../../components/Topbar.js';
import { getIcon } from '../../components/IconLibrary.js';
import { store } from '../../store.js';

export const BusinessView = () => {
  const { business, user } = store.getState();

  setTimeout(() => {
    const form = document.getElementById('business-profile-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const updated = {
          name: document.getElementById('biz-name').value,
          industry: document.getElementById('biz-industry').value,
          product: document.getElementById('biz-product').value,
          location: document.getElementById('biz-location').value,
          msmeCategory: document.getElementById('biz-category').value,
          employeeCount: Number(document.getElementById('biz-employees').value),
          workingDaysPerWeek: Number(document.getElementById('biz-days').value),
          workingHoursPerDay: Number(document.getElementById('biz-hours').value),
          shiftsPerDay: Number(document.getElementById('biz-shifts').value)
        };
        store.updateBusinessProfile(updated);
      });
    }
  }, 0);

  return `
    <div class="app-layout">
      ${renderSidebar('/business')}

      <main class="app-main">
        ${renderTopbar()}

        <div class="app-page-content">
          <div class="page-header">
            <div>
              <h1 class="page-title">Business Profile & Capacity Parameters</h1>
              <p class="page-subtitle">Manage enterprise parameters for ${business.name}</p>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-6">
            <!-- Business Form (Col 1-2) -->
            <div class="glass-card" style="grid-column: span 2;">
              <h3 class="text-base font-bold mb-4 flex items-center gap-2">
                ${getIcon('factory', 18)}
                Enterprise Information & Operational Shifts
              </h3>

              <form id="business-profile-form">
                <div class="form-group">
                  <label class="form-label">Enterprise / Company Name</label>
                  <input type="text" id="biz-name" class="form-input" value="${business.name}" required />
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="form-group">
                    <label class="form-label">Industry Sector</label>
                    <input type="text" id="biz-industry" class="form-input" value="${business.industry}" required />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Primary Product</label>
                    <input type="text" id="biz-product" class="form-input" value="${business.product}" required />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="form-group">
                    <label class="form-label">Plant Location</label>
                    <input type="text" id="biz-location" class="form-input" value="${business.location}" required />
                  </div>
                  <div class="form-group">
                    <label class="form-label">MSME Category</label>
                    <select id="biz-category" class="form-select">
                      <option value="Micro Enterprise" ${business.msmeCategory === 'Micro Enterprise' ? 'selected' : ''}>Micro Enterprise</option>
                      <option value="Small Enterprise" ${business.msmeCategory === 'Small Enterprise' ? 'selected' : ''}>Small Enterprise</option>
                      <option value="Medium Enterprise" ${business.msmeCategory === 'Medium Enterprise' ? 'selected' : ''}>Medium Enterprise</option>
                    </select>
                  </div>
                </div>

                <div class="grid grid-cols-4 gap-4">
                  <div class="form-group">
                    <label class="form-label">Employee Count</label>
                    <input type="number" id="biz-employees" class="form-input" value="${business.employeeCount}" min="1" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Days / Week</label>
                    <input type="number" id="biz-days" class="form-input" value="${business.workingDaysPerWeek}" min="1" max="7" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Hours / Shift</label>
                    <input type="number" id="biz-hours" class="form-input" value="${business.workingHoursPerDay}" min="1" max="24" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Shifts / Day</label>
                    <input type="number" id="biz-shifts" class="form-input" value="${business.shiftsPerDay}" min="1" max="3" />
                  </div>
                </div>

                <div class="flex justify-end mt-4">
                  <button type="submit" class="btn btn-primary">
                    ${getIcon('check', 16)}
                    <span>Save Business Changes</span>
                  </button>
                </div>
              </form>
            </div>

            <!-- Profile Summary Card (Col 3) -->
            <div class="glass-card">
              <h3 class="text-base font-bold mb-4">Account Representative</h3>
              <div class="user-profile-badge mb-4" style="padding: 1rem;">
                <div class="user-avatar" style="width: 48px; height: 48px; font-size: 1.25rem;">${user.name.charAt(0)}</div>
                <div>
                  <strong class="text-sm display-block">${user.name}</strong>
                  <span class="text-xs text-muted">${user.role}</span>
                  <span class="text-xs text-dim display-block">${user.email}</span>
                </div>
              </div>

              <div style="border-top: 1px solid var(--border-color); padding-top: 1rem; margin-top: 1rem;">
                <span class="text-xs text-muted display-block mb-1">Standard Production Capacity:</span>
                <strong class="text-sm font-bold text-main">
                  ${business.workingDaysPerWeek * business.workingHoursPerDay * business.shiftsPerDay} Available Machine Hours / Week
                </strong>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  `;
};