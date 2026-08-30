/* UDYAM SARTHI Scrap & Material Marketplace View */
import { renderSidebar } from '../../components/Sidebar.js';
import { renderTopbar } from '../../components/Topbar.js';
import { renderModal, openModal, closeModal } from '../../components/Modal.js';
import { getIcon } from '../../components/IconLibrary.js';
import { store } from '../../store.js';

export const MarketplaceView = () => {
  const { marketplaceListings } = store.getState();

  setTimeout(() => {
    const addBtn = document.getElementById('open-create-listing-modal');
    if (addBtn) addBtn.addEventListener('click', () => openModal('modal-create-listing'));

    document.querySelectorAll('.modal-close-btn').forEach(b => {
      b.addEventListener('click', (e) => closeModal(e.currentTarget.dataset.modalId));
    });

    const form = document.getElementById('create-listing-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const item = {
          material: document.getElementById('mkt-mat').value,
          quantity: Number(document.getElementById('mkt-qty').value),
          unit: document.getElementById('mkt-unit').value,
          pricePerUnit: document.getElementById('mkt-price').value,
          location: document.getElementById('mkt-loc').value,
          availability: document.getElementById('mkt-avail').value
        };
        store.addMarketplaceListing(item);
        closeModal('modal-create-listing');
        window.location.hash = '#/marketplace';
      });
    }
  }, 0);

  const createListingModalHtml = `
    <form id="create-listing-form">
      <div class="form-group">
        <label class="form-label">Material / Scrap Name</label>
        <input type="text" id="mkt-mat" class="form-input" placeholder="e.g. Aluminium Sheet Trimmings" required />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">Quantity</label>
          <input type="number" id="mkt-qty" class="form-input" placeholder="200" required />
        </div>
        <div class="form-group">
          <label class="form-label">Unit</label>
          <input type="text" id="mkt-unit" class="form-input" value="Kg" required />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="form-group">
          <label class="form-label">Expected Price</label>
          <input type="text" id="mkt-price" class="form-input" placeholder="₹160 / Kg" required />
        </div>
        <div class="form-group">
          <label class="form-label">Availability</label>
          <input type="text" id="mkt-avail" class="form-input" value="Immediate" />
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Location</label>
        <input type="text" id="mkt-loc" class="form-input" value="Peenya, Bengaluru" required />
      </div>

      <div class="flex justify-end gap-2 mt-4">
        <button type="button" class="btn btn-secondary modal-close-btn" data-modal-id="modal-create-listing">Cancel</button>
        <button type="submit" class="btn btn-primary">Publish Scrap Listing</button>
      </div>
    </form>
  `;

  return `
    <div class="app-layout">
      ${renderSidebar('/marketplace')}

      <main class="app-main">
        ${renderTopbar()}

        <div class="app-page-content">
          <div class="page-header">
            <div>
              <h1 class="page-title">Industrial Material & Scrap Marketplace</h1>
              <p class="page-subtitle">Buy and sell manufacturing cut-offs, scrap metals, and reusable industrial containers.</p>
            </div>

            <button class="btn btn-primary btn-sm" id="open-create-listing-modal">
              ${getIcon('plus', 14)}
              <span>Create Scrap Listing</span>
            </button>
          </div>

          <div class="grid grid-cols-3 gap-6">
            ${marketplaceListings.map(item => `
              <div class="glass-card listing-card">
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="badge badge-success">${item.status}</span>
                    <span class="text-xs text-dim">${item.createdAt}</span>
                  </div>

                  <h3 class="text-base font-bold text-main mb-1">${item.material}</h3>
                  <p class="text-xs text-muted mb-3">Quantity: ${item.quantity} ${item.unit} | ${item.location}</p>

                  <div class="listing-price mb-3">${item.pricePerUnit}</div>
                  <span class="text-xs text-dim display-block">Seller: ${item.seller}</span>
                </div>

                <div class="flex justify-end pt-3" style="border-top: 1px solid var(--border-color);">
                  <button class="btn btn-secondary btn-sm">Contact Seller</button>
                </div>
              </div>
            `).join('')}
          </div>

          ${renderModal({ id: 'modal-create-listing', title: 'Publish Scrap / Material Listing', contentHtml: createListingModalHtml })}
        </div>
      </main>
    </div>
  `;
};