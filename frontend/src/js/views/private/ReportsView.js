/* UDYAM SARTHI Reports & Data Export View */
import { renderSidebar } from '../../components/Sidebar.js';
import { renderTopbar } from '../../components/Topbar.js';
import { getIcon } from '../../components/IconLibrary.js';
import { store } from '../../store.js';
import { dataService } from '../../services/dataService.js';

export const ReportsView = () => {
  const { operations, business } = store.getState();

  setTimeout(() => {
    const csvBtn = document.getElementById('export-csv-btn');
    if (csvBtn) {
      csvBtn.addEventListener('click', () => {
        dataService.exportToCSV(`${business.name.replace(/\s+/g, '_')}_Operations_Report`, operations);
        store.addToast('Exported CSV operations log report', 'success');
      });
    }

    const pdfBtn = document.getElementById('export-pdf-btn');
    if (pdfBtn) {
      pdfBtn.addEventListener('click', () => {
        window.print();
      });
    }
  }, 0);

  return `
    <div class="app-layout">
      ${renderSidebar('/reports')}

      <main class="app-main">
        ${renderTopbar()}

        <div class="app-page-content">
          <div class="page-header">
            <div>
              <h1 class="page-title">Reports & Data Export</h1>
              <p class="page-subtitle">Generate exportable PDF and CSV reports for plant review and bank documentation.</p>
            </div>

            <div class="flex items-center gap-3">
              <button class="btn btn-secondary btn-sm" id="export-csv-btn">
                ${getIcon('download', 14)}
                <span>Export CSV</span>
              </button>
              <button class="btn btn-primary btn-sm" id="export-pdf-btn">
                ${getIcon('fileText', 14)}
                <span>Export PDF / Print</span>
              </button>
            </div>
          </div>

          <!-- Report Filter & Preview Card -->
          <div class="glass-card mb-6">
            <h3 class="text-base font-bold mb-4">Operations Summary Preview</h3>
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Machine</th>
                    <th>Runtime</th>
                    <th>Actual Output</th>
                    <th>Expected</th>
                    <th>Energy (kWh)</th>
                    <th>Scrap (Kg)</th>
                  </tr>
                </thead>
                <tbody>
                  ${operations.map(op => `
                    <tr>
                      <td>${op.date}</td>
                      <td>${op.machineName}</td>
                      <td>${op.runtimeHours} hrs</td>
                      <td><strong>${op.actualOutput}</strong></td>
                      <td>${op.expectedOutput}</td>
                      <td>${op.energyConsumedKwh} kWh</td>
                      <td>${op.scrapQuantityKg} Kg</td>
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