/* UDYAM SARTHI Reusable Glass Modal Component */
import { getIcon } from './IconLibrary.js';

export const renderModal = ({ id, title, contentHtml, footerHtml = '' }) => {
  return `
    <div class="modal-overlay" id="${id}" style="display: none;">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="text-lg font-bold">${title}</h3>
          <button class="btn-icon modal-close-btn" data-modal-id="${id}">
            ${getIcon('x', 20)}
          </button>
        </div>
        <div class="modal-body">
          ${contentHtml}
        </div>
        ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
      </div>
    </div>
  `;
};

export const openModal = (id) => {
  const el = document.getElementById(id);
  if (el) el.style.display = 'flex';
};

export const closeModal = (id) => {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
};
