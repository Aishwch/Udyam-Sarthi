/* UDYAM SARTHI Public Website Footer Component */
import { getIcon } from './IconLibrary.js';

export const renderPublicFooter = () => {
  return `
    <footer class="public-footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <div class="brand-logo mb-4">
              <div class="brand-icon">
                ${getIcon('sparkles', 22)}
              </div>
              <span>UDYAM SARTHI</span>
            </div>
            <p style="max-width: 320px; font-size: 0.9rem; line-height: 1.6;">
              An AI-powered digital business companion designed for MSMEs. Monitor operational performance, discover efficiency opportunities, and drive sustainable growth.
            </p>
          </div>

          <div>
            <h4 style="color: var(--text-main); font-size: 0.95rem; margin-bottom: 1rem;">Platform</h4>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.875rem;">
              <li><a href="#/features">Business Analytics</a></li>
              <li><a href="#/features">Machine Analytics</a></li>
              <li><a href="#/features">Predictive Insights</a></li>
              <li><a href="#/features">AI Assistant</a></li>
            </ul>
          </div>

          <div>
            <h4 style="color: var(--text-main); font-size: 0.95rem; margin-bottom: 1rem;">Ecosystem</h4>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.875rem;">
              <li><a href="#/features">Industrial Symbiosis</a></li>
              <li><a href="#/features">Scrap Marketplace</a></li>
              <li><a href="#/features">Government Schemes</a></li>
              <li><a href="#/sdg">SDG Goals</a></li>
            </ul>
          </div>

          <div>
            <h4 style="color: var(--text-main); font-size: 0.95rem; margin-bottom: 1rem;">Account</h4>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.875rem;">
              <li><a href="#/login">Login to Platform</a></li>
              <li><a href="#/register">Register Business</a></li>
              <li><a href="#/onboarding">Business Onboarding</a></li>
            </ul>
          </div>
        </div>

        <div style="border-top: 1px solid var(--border-color); padding-top: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; font-size: 0.8125rem;">
          <div>
            © 2026 <strong>UDYAM SARTHI</strong> — AI-Powered Digital Business Companion for MSMEs. Major Project Prototype.
          </div>
          <div class="flex items-center gap-4">
            <span>Aligned with SDG 8, 9 & 12</span>
            <span>Made for Indian MSMEs</span>
          </div>
        </div>
      </div>
    </footer>
  `;
};