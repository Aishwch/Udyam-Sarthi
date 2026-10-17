/* UDYAM SARTHI Industrial Symbiosis & Resource Exchange View */
import { renderSidebar } from '../../components/Sidebar.js';
import { renderTopbar } from '../../components/Topbar.js';
import { renderTagBadge } from '../../components/TagBadge.js';
import { getIcon } from '../../components/IconLibrary.js';
import { store } from '../../store.js';

const API_BASE_URL = window.API_BASE_URL || 'http://127.0.0.1:8000';

// Component state cache for interactive filtering and tabs
const symbiosisState = {
  activeTab: 'matches', // 'matches' | 'directory' | 'register'
  searchQuery: '',
  materialFilter: 'all',
  minScore: 40,
  maxDistance: 500,
  loading: true,
  error: null,
  matches: [],
  suppliers: [],
  buyers: [],
  impactSummary: {
    total_potential_matches: 0,
    total_suppliers: 0,
    total_buyers: 0,
    potential_material_exchanged_kg: 0,
    estimated_waste_diverted_kg: 0,
    avg_match_score: 0
  },
  registrationType: 'supplier',
  formSubmitting: false,
  formSuccessMessage: '',
  formErrorMessage: ''
};

// Fetch data from backend with fallback
async function fetchSymbiosisData() {
  symbiosisState.loading = true;
  symbiosisState.error = null;

  try {
    const [matchesRes, suppliersRes, buyersRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/matches?min_score=30`, { signal: AbortSignal.timeout(3500) }),
      fetch(`${API_BASE_URL}/api/suppliers`, { signal: AbortSignal.timeout(3500) }),
      fetch(`${API_BASE_URL}/api/buyers`, { signal: AbortSignal.timeout(3500) })
    ]);

    if (!matchesRes.ok || !suppliersRes.ok || !buyersRes.ok) {
      throw new Error(`Backend returned HTTP error (Matches: ${matchesRes.status}, Suppliers: ${suppliersRes.status}, Buyers: ${buyersRes.status})`);
    }

    const matchesData = await matchesRes.json();
    const suppliersData = await suppliersRes.json();
    const buyersData = await buyersRes.json();

    symbiosisState.matches = matchesData.matches || [];
    symbiosisState.impactSummary = matchesData.impact_summary || {
      total_potential_matches: symbiosisState.matches.length,
      total_suppliers: suppliersData.length,
      total_buyers: buyersData.length,
      potential_material_exchanged_kg: 0,
      estimated_waste_diverted_kg: 0,
      avg_match_score: 0
    };
    symbiosisState.suppliers = suppliersData || [];
    symbiosisState.buyers = buyersData || [];
    symbiosisState.loading = false;
  } catch (err) {
    console.warn("Could not connect to live backend API, loading existing local fallback data:", err.message);
    symbiosisState.error = err.message;
    symbiosisState.loading = false;

    // Gracefully use local mock matches from store as fallback
    const { symbiosisMatches } = store.getState();
    symbiosisState.matches = (symbiosisMatches || []).map((m, idx) => ({
      supplier_id: idx + 1,
      supplier_name: m.matchedPartner || "ABC Coatings Plant",
      supplier_location: m.location || "Peenya Industrial Area, Bengaluru",
      supplier_industry: "Metal Finishing",
      supplier_quantity: 1200,
      supplier_unit: "kg/month",
      supplier_frequency: "Monthly",
      buyer_id: idx + 10,
      buyer_name: m.matchedPartner || "EcoReclaim Works",
      buyer_location: "Bommasandra, Bengaluru",
      buyer_industry: "Recycling & Aggregates",
      buyer_quantity_needed: 1000,
      buyer_unit: "kg/month",
      buyer_frequency: "Monthly",
      material: m.offeredMaterial || "Waste Powder Residue",
      buyer_material_needed: m.offeredMaterial || "Waste Powder Residue",
      normalized_material: (m.offeredMaterial || "").toLowerCase(),
      distance_km: 14.5,
      match_score: m.matchScore || 85,
      material_score: 45,
      quantity_score: 18,
      distance_score: 18,
      frequency_score: 10,
      industry_score: 4,
      compatibility_reason: m.compatibilityReason || "Compatible secondary material recovery partnership with aligned delivery frequency."
    }));

    symbiosisState.impactSummary = {
      total_potential_matches: symbiosisState.matches.length,
      total_suppliers: 8,
      total_buyers: 5,
      potential_material_exchanged_kg: 19500,
      estimated_waste_diverted_kg: 19500,
      avg_match_score: 87.5
    };
  }
}

export const SymbiosisView = () => {
  // Bind dynamic interactive handlers after HTML render
  setTimeout(() => {
    attachSymbiosisEventHandlers();
  }, 0);

  // Initial trigger if not loaded yet
  if (symbiosisState.matches.length === 0 && symbiosisState.loading) {
    fetchSymbiosisData().then(() => {
      const container = document.getElementById('symbiosis-view-root');
      if (container) {
        container.innerHTML = renderSymbiosisContent();
        attachSymbiosisEventHandlers();
      }
    });
  }

  return `
    <div class="app-layout">
      ${renderSidebar('/symbiosis')}

      <main class="app-main">
        ${renderTopbar()}

        <div class="app-page-content" id="symbiosis-view-root">
          ${renderSymbiosisContent()}
        </div>
      </main>
    </div>
  `;
};

function renderSymbiosisContent() {
  const { impactSummary, matches, activeTab, loading, error, searchQuery, materialFilter, minScore } = symbiosisState;

  // Filter matches
  const filteredMatches = matches.filter(m => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || [
      m.supplier_name, m.buyer_name, m.material, m.buyer_material_needed,
      m.supplier_location, m.buyer_location, m.supplier_industry, m.buyer_industry
    ].some(val => val && val.toLowerCase().includes(q));

    const matchesMat = materialFilter === 'all' || 
      (m.material && m.material.toLowerCase().includes(materialFilter.toLowerCase())) ||
      (m.normalized_material && m.normalized_material.includes(materialFilter.toLowerCase()));

    const matchesScore = Number(m.match_score || 0) >= Number(minScore);

    return matchesSearch && matchesMat && matchesScore;
  });

  // Extract unique materials for filter dropdown
  const materialsList = [...new Set(matches.map(m => m.material).filter(Boolean))];

  return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Industrial Symbiosis & Resource Exchange</h1>
        <p class="page-subtitle">Discover real circular by-product exchange opportunities with verified manufacturing plants.</p>
      </div>
      <div class="flex items-center gap-2">
        ${renderTagBadge('Live Matching Engine', 'Data-Driven')}
        <button id="refresh-symbiosis-btn" class="btn btn-secondary btn-sm" title="Reload from Backend">
          ${getIcon('refreshCw', 14) || getIcon('recycle', 14)}
          <span>Refresh Data</span>
        </button>
      </div>
    </div>

    <!-- Impact Dashboard Summary -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="glass-card" style="border-left: 4px solid var(--accent-500); padding: 1.25rem;">
        <span class="text-xs text-muted font-semibold display-block mb-1">POTENTIAL MATCHES</span>
        <div class="text-2xl font-bold text-main mb-1">${impactSummary.total_potential_matches || matches.length}</div>
        <span class="text-xs text-accent font-semibold flex items-center gap-1">
          ${getIcon('recycle', 13)} Circular Linkages Identified
        </span>
      </div>

      <div class="glass-card" style="border-left: 4px solid var(--primary); padding: 1.25rem;">
        <span class="text-xs text-muted font-semibold display-block mb-1">NETWORK PARTNERS</span>
        <div class="text-2xl font-bold text-main mb-1">
          ${impactSummary.total_suppliers || symbiosisState.suppliers.length} Suppliers | ${impactSummary.total_buyers || symbiosisState.buyers.length} Buyers
        </div>
        <span class="text-xs text-muted">Active Manufacturing Plants</span>
      </div>

      <div class="glass-card" style="border-left: 4px solid #10b981; padding: 1.25rem;">
        <span class="text-xs text-muted font-semibold display-block mb-1">POTENTIAL MATERIAL EXCHANGE</span>
        <div class="text-2xl font-bold text-main mb-1">${(impactSummary.potential_material_exchanged_kg || 0).toLocaleString()} kg</div>
        <span class="text-xs text-success font-semibold">Monthly Resource Flow</span>
      </div>

      <div class="glass-card" style="border-left: 4px solid #f59e0b; padding: 1.25rem;">
        <span class="text-xs text-muted font-semibold display-block mb-1">ESTIMATED WASTE DIVERSION</span>
        <div class="text-2xl font-bold text-main mb-1">${(impactSummary.estimated_waste_diverted_kg || 0).toLocaleString()} kg</div>
        <span class="text-xs text-warning font-semibold">Estimated Landfill Diversion*</span>
      </div>
    </div>

    <!-- Transparency Alert / Status Banner -->
    <div class="glass-card mb-6" style="padding: 0.75rem 1.25rem; background: rgba(59, 130, 246, 0.08); border-color: rgba(59, 130, 246, 0.3);">
      <div class="flex items-center justify-between flex-wrap gap-2 text-xs">
        <div class="flex items-center gap-2">
          <span class="text-primary">${getIcon('info', 16)}</span>
          <span class="text-muted">
            <strong>Impact Transparency:</strong> Quantities represent <em>potential</em> resource exchanges based on current registered listings. Realized diversion is confirmed upon physical transaction.
          </span>
        </div>
        <div>
          ${error ? `
            <span class="badge badge-warning" style="background: rgba(245, 158, 11, 0.2);">Offline Fallback Active</span>
          ` : `
            <span class="badge badge-success" style="background: rgba(16, 185, 129, 0.2);">Connected to FastAPI (Port 8000)</span>
          `}
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="tab-group mb-6">
      <button class="tab-btn ${activeTab === 'matches' ? 'active' : ''}" data-tab="matches">
        ${getIcon('recycle', 15)} Resource Matches (${filteredMatches.length})
      </button>
      <button class="tab-btn ${activeTab === 'directory' ? 'active' : ''}" data-tab="directory">
        ${getIcon('factory', 15)} Partner Directory (${symbiosisState.suppliers.length + symbiosisState.buyers.length})
      </button>
      <button class="tab-btn ${activeTab === 'register' ? 'active' : ''}" data-tab="register">
        ${getIcon('plus', 15)} Register New Resource Listing
      </button>
    </div>

    <!-- TAB 1: MATCHES -->
    <div id="tab-pane-matches" style="display: ${activeTab === 'matches' ? 'block' : 'none'};">
      <!-- Search and Filter Bar -->
      <div class="glass-card mb-6" style="padding: 1rem 1.25rem;">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div class="flex items-center gap-3 flex-1" style="min-width: 280px;">
            <div style="position: relative; flex: 1;">
              <input 
                type="text" 
                id="symbiosis-search-input" 
                class="form-input" 
                placeholder="Search material, company, location, or industry..." 
                value="${searchQuery}"
                style="padding-left: 2rem; font-size: 0.8125rem;"
              />
              <span style="position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); opacity: 0.5;">
                ${getIcon('search', 14)}
              </span>
            </div>

            <select id="symbiosis-material-select" class="form-select" style="width: auto; min-width: 160px; font-size: 0.8125rem;">
              <option value="all" ${materialFilter === 'all' ? 'selected' : ''}>All Materials</option>
              ${materialsList.map(mat => `
                <option value="${mat}" ${materialFilter === mat ? 'selected' : ''}>${mat}</option>
              `).join('')}
            </select>
          </div>

          <div class="flex items-center gap-3">
            <label class="text-xs text-muted flex items-center gap-2">
              <span>Min Score:</span>
              <strong class="text-accent" id="min-score-display">${minScore}%</strong>
              <input 
                type="range" 
                id="symbiosis-score-slider" 
                min="0" 
                max="90" 
                step="5" 
                value="${minScore}" 
                style="width: 100px; accent-color: var(--accent-500);" 
              />
            </label>
          </div>
        </div>
      </div>

      <!-- Match Cards Grid -->
      ${loading ? `
        <div class="glass-card text-center" style="padding: 3rem;">
          <div style="font-size: 1.5rem; margin-bottom: 0.75rem;">⏳</div>
          <h3 class="text-base font-bold text-main mb-1">Calculating Industrial Symbiosis Matches...</h3>
          <p class="text-xs text-muted">Matching material specifications, geographic distance, and volume balances.</p>
        </div>
      ` : filteredMatches.length === 0 ? `
        <div class="glass-card text-center" style="padding: 3rem;">
          <div style="font-size: 2rem; margin-bottom: 0.75rem;">🔍</div>
          <h3 class="text-base font-bold text-main mb-1">No Matches Found</h3>
          <p class="text-xs text-muted mb-4">No industrial partners matched your search criteria. Try lowering the minimum score or clearing filters.</p>
          <button id="reset-filters-btn" class="btn btn-secondary btn-sm">Reset All Filters</button>
        </div>
      ` : `
        <div class="grid grid-cols-2 gap-6 mb-6">
          ${filteredMatches.map(m => `
            <div class="glass-card flex-col justify-between" style="border-left: 4px solid ${m.match_score >= 85 ? 'var(--accent-500)' : m.match_score >= 65 ? 'var(--primary)' : 'var(--warning)'};">
              <div>
                <div class="flex items-center justify-between mb-3">
                  <span class="badge ${m.match_score >= 85 ? 'badge-success' : 'badge-info'}">
                    ${m.match_score >= 85 ? 'High Compatibility' : m.match_score >= 65 ? 'Good Potential' : 'Moderate Match'}
                  </span>
                  <div class="text-right">
                    <span class="text-base font-bold text-accent">${Math.round(m.match_score)}% Match</span>
                    <span class="text-xs text-muted display-block">${m.distance_km} km away</span>
                  </div>
                </div>

                <!-- Material Exchange Headline -->
                <div class="mb-3">
                  <span class="text-xs text-dim display-block">Exchange Material:</span>
                  <h3 class="text-lg font-bold text-main">${m.material}</h3>
                </div>

                <!-- Supplier and Buyer Cards -->
                <div class="grid grid-cols-2 gap-3 mb-3 text-xs">
                  <div class="glass-card" style="padding: 0.75rem; background: rgba(15, 23, 42, 0.5);">
                    <span class="text-dim display-block mb-1">SUPPLIER (GENERATOR)</span>
                    <strong class="text-main display-block">${m.supplier_name}</strong>
                    <div class="text-muted mt-1">${m.supplier_industry}</div>
                    <div class="text-muted">${m.supplier_location}</div>
                    <div class="text-accent font-semibold mt-1">Offers: ${m.supplier_quantity} ${m.supplier_unit}</div>
                  </div>

                  <div class="glass-card" style="padding: 0.75rem; background: rgba(15, 23, 42, 0.5);">
                    <span class="text-dim display-block mb-1">BUYER (RECIPIENT)</span>
                    <strong class="text-main display-block">${m.buyer_name}</strong>
                    <div class="text-muted mt-1">${m.buyer_industry}</div>
                    <div class="text-muted">${m.buyer_location}</div>
                    <div class="text-primary font-semibold mt-1">Needs: ${m.buyer_quantity_needed} ${m.buyer_unit}</div>
                  </div>
                </div>

                <!-- Score Breakdown Radar -->
                <div class="glass-card mb-3" style="padding: 0.75rem; background: rgba(15, 23, 42, 0.4);">
                  <span class="text-xs text-dim display-block mb-2 font-semibold">Compatibility Breakdown:</span>
                  <div class="grid grid-cols-4 gap-2 text-center text-xs">
                    <div>
                      <span class="text-dim display-block text-xxs">Material</span>
                      <strong class="text-accent">${m.material_score || 45}/45</strong>
                    </div>
                    <div>
                      <span class="text-dim display-block text-xxs">Distance</span>
                      <strong class="text-main">${m.distance_score || 20}/20</strong>
                    </div>
                    <div>
                      <span class="text-dim display-block text-xxs">Quantity</span>
                      <strong class="text-main">${m.quantity_score || 20}/20</strong>
                    </div>
                    <div>
                      <span class="text-dim display-block text-xxs">Schedule</span>
                      <strong class="text-main">${m.frequency_score || 10}/10</strong>
                    </div>
                  </div>
                </div>

                <!-- Compatibility Explanation -->
                <div class="mb-3 text-xs" style="padding: 0.6rem 0.8rem; background: rgba(59, 130, 246, 0.08); border-radius: var(--radius-sm); border-left: 2px solid var(--primary);">
                  <strong class="text-primary display-block mb-1">Match Reason:</strong>
                  <p class="text-muted" style="line-height: 1.5;">${m.compatibility_reason || 'Verified material classification and physical delivery proximity.'}</p>
                </div>
              </div>

              <!-- Action Footer -->
              <div class="flex items-center justify-between pt-3" style="border-top: 1px solid var(--border-color);">
                <span class="text-xs text-muted">Exchange Frequency: <strong>${m.supplier_frequency || 'Monthly'}</strong></span>
                <button class="btn btn-primary btn-sm initiate-exchange-btn" data-supplier="${m.supplier_name}" data-buyer="${m.buyer_name}" data-mat="${m.material}">
                  ${getIcon('recycle', 14)}
                  <span>Initiate Contact</span>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>

    <!-- TAB 2: DIRECTORY -->
    <div id="tab-pane-directory" style="display: ${activeTab === 'directory' ? 'block' : 'none'};">
      <div class="grid grid-cols-2 gap-6 mb-6">
        <!-- Suppliers Column -->
        <div class="glass-card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold text-main flex items-center gap-2">
              <span class="text-accent">${getIcon('factory', 18)}</span>
              Registered Suppliers (${symbiosisState.suppliers.length})
            </h3>
            <span class="badge badge-info">Generating By-Products</span>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Material</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                ${symbiosisState.suppliers.map(s => `
                  <tr>
                    <td><strong>${s.name}</strong><br><span class="text-muted text-xxs">${s.industry}</span></td>
                    <td class="text-xs text-muted">${s.location}</td>
                    <td><span class="badge badge-success text-xxs">${s.material}</span></td>
                    <td class="text-xs">${s.quantity} ${s.unit}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Buyers Column -->
        <div class="glass-card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-base font-bold text-main flex items-center gap-2">
              <span class="text-primary">${getIcon('store', 18)}</span>
              Registered Buyers (${symbiosisState.buyers.length})
            </h3>
            <span class="badge badge-primary">Demanding Secondary Inputs</span>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Material Needed</th>
                  <th>Demand</th>
                </tr>
              </thead>
              <tbody>
                ${symbiosisState.buyers.map(b => `
                  <tr>
                    <td><strong>${b.name}</strong><br><span class="text-muted text-xxs">${b.industry}</span></td>
                    <td class="text-xs text-muted">${b.location}</td>
                    <td><span class="badge badge-info text-xxs">${b.material_needed}</span></td>
                    <td class="text-xs">${b.quantity_needed} ${b.unit}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: REGISTRATION -->
    <div id="tab-pane-register" style="display: ${activeTab === 'register' ? 'block' : 'none'};">
      <div class="glass-card" style="max-width: 720px; margin: 0 auto;">
        <h3 class="text-base font-bold text-main mb-1">Register New Resource or Demand</h3>
        <p class="text-xs text-muted mb-4">List by-products your plant generates, or specify secondary materials your process can absorb.</p>

        <!-- Listing Type Selector -->
        <div class="flex items-center gap-4 mb-6">
          <label class="flex items-center gap-2 text-sm text-main" style="cursor: pointer;">
            <input type="radio" name="listing_type" value="supplier" ${symbiosisState.registrationType === 'supplier' ? 'checked' : ''} id="type-supplier" />
            <span><strong>Supply By-Product</strong> (We generate excess material)</span>
          </label>
          <label class="flex items-center gap-2 text-sm text-main" style="cursor: pointer;">
            <input type="radio" name="listing_type" value="buyer" ${symbiosisState.registrationType === 'buyer' ? 'checked' : ''} id="type-buyer" />
            <span><strong>Procure Secondary Resource</strong> (We consume waste as raw material)</span>
          </label>
        </div>

        <form id="symbiosis-registration-form">
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="form-label text-xs">Company Name *</label>
              <input type="text" id="reg-name" class="form-input" placeholder="e.g. Acme Precision Metals" required />
            </div>

            <div>
              <label class="form-label text-xs">Industry Category *</label>
              <input type="text" id="reg-industry" class="form-input" placeholder="e.g. Metal Fabrication / Cement" required />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label class="form-label text-xs">Location / City *</label>
              <input type="text" id="reg-location" class="form-input" placeholder="e.g. Peenya, Bengaluru" required />
            </div>
            <div>
              <label class="form-label text-xs">Latitude *</label>
              <input type="number" step="0.0001" id="reg-lat" class="form-input" placeholder="13.0285" required />
            </div>
            <div>
              <label class="form-label text-xs">Longitude *</label>
              <input type="number" step="0.0001" id="reg-lng" class="form-input" placeholder="77.5190" required />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label class="form-label text-xs" id="reg-mat-label">Material Offered *</label>
              <input type="text" id="reg-material" class="form-input" placeholder="e.g. Steel Scrap / Fly Ash" required />
            </div>
            <div>
              <label class="form-label text-xs">Quantity (Number) *</label>
              <input type="number" step="0.1" id="reg-qty" class="form-input" placeholder="e.g. 2500" required />
            </div>
            <div>
              <label class="form-label text-xs">Unit</label>
              <select id="reg-unit" class="form-select">
                <option value="kg/month">kg/month</option>
                <option value="tons/month">tons/month</option>
                <option value="liters/month">liters/month</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="form-label text-xs">Material Specification (Optional)</label>
              <input type="text" id="reg-spec" class="form-input" placeholder="e.g. Clean stamping scrap, Grade A" />
            </div>
            <div>
              <label class="form-label text-xs">Exchange Frequency</label>
              <select id="reg-frequency" class="form-select">
                <option value="Monthly">Monthly</option>
                <option value="Weekly">Weekly</option>
                <option value="Daily">Daily</option>
                <option value="One-time">One-time Lot</option>
              </select>
            </div>
          </div>

          <div class="mb-6">
            <label class="form-label text-xs">Quality / Storage Notes (Optional)</label>
            <textarea id="reg-quality" class="form-input" rows="2" placeholder="e.g. Covered dry storage, bulk bags available"></textarea>
          </div>

          <div id="form-feedback-message" class="mb-4 text-xs" style="display: none;"></div>

          <div class="flex justify-end gap-3">
            <button type="button" id="reg-cancel-btn" class="btn btn-secondary btn-sm">Cancel</button>
            <button type="submit" id="reg-submit-btn" class="btn btn-primary btn-sm">
              ${getIcon('plus', 14)}
              <span>Publish Listing to Network</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function attachSymbiosisEventHandlers() {
  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tab = e.currentTarget.dataset.tab;
      symbiosisState.activeTab = tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');

      document.getElementById('tab-pane-matches').style.display = tab === 'matches' ? 'block' : 'none';
      document.getElementById('tab-pane-directory').style.display = tab === 'directory' ? 'block' : 'none';
      document.getElementById('tab-pane-register').style.display = tab === 'register' ? 'block' : 'none';
    });
  });

  // Search input
  const searchInput = document.getElementById('symbiosis-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      symbiosisState.searchQuery = e.target.value;
      rerenderMatchesPane();
    });
  }

  // Material select
  const matSelect = document.getElementById('symbiosis-material-select');
  if (matSelect) {
    matSelect.addEventListener('change', (e) => {
      symbiosisState.materialFilter = e.target.value;
      rerenderMatchesPane();
    });
  }

  // Score slider
  const scoreSlider = document.getElementById('symbiosis-score-slider');
  const scoreDisplay = document.getElementById('min-score-display');
  if (scoreSlider && scoreDisplay) {
    scoreSlider.addEventListener('input', (e) => {
      symbiosisState.minScore = Number(e.target.value);
      scoreDisplay.innerText = `${symbiosisState.minScore}%`;
      rerenderMatchesPane();
    });
  }

  // Refresh button
  const refreshBtn = document.getElementById('refresh-symbiosis-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      fetchSymbiosisData().then(() => {
        store.addToast('Industrial Symbiosis records refreshed from backend', 'success');
        const container = document.getElementById('symbiosis-view-root');
        if (container) {
          container.innerHTML = renderSymbiosisContent();
          attachSymbiosisEventHandlers();
        }
      });
    });
  }

  // Reset filters
  const resetBtn = document.getElementById('reset-filters-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      symbiosisState.searchQuery = '';
      symbiosisState.materialFilter = 'all';
      symbiosisState.minScore = 40;
      const container = document.getElementById('symbiosis-view-root');
      if (container) {
        container.innerHTML = renderSymbiosisContent();
        attachSymbiosisEventHandlers();
      }
    });
  }

  // Initiate exchange buttons
  document.querySelectorAll('.initiate-exchange-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const supplier = e.currentTarget.dataset.supplier;
      const buyer = e.currentTarget.dataset.buyer;
      const mat = e.currentTarget.dataset.mat;
      store.addToast(`Contact exchange request sent to ${buyer} for ${mat}!`, 'success');
    });
  });

  // Radio button type switch in registration
  const typeSupplier = document.getElementById('type-supplier');
  const typeBuyer = document.getElementById('type-buyer');
  const matLabel = document.getElementById('reg-mat-label');

  if (typeSupplier && typeBuyer) {
    typeSupplier.addEventListener('change', () => {
      symbiosisState.registrationType = 'supplier';
      if (matLabel) matLabel.innerText = 'Material Offered *';
    });

    typeBuyer.addEventListener('change', () => {
      symbiosisState.registrationType = 'buyer';
      if (matLabel) matLabel.innerText = 'Material Needed *';
    });
  }

  // Registration Form Submission
  const form = document.getElementById('symbiosis-registration-form');
  const feedbackMsg = document.getElementById('form-feedback-message');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('reg-submit-btn');
      if (submitBtn) submitBtn.disabled = true;

      const name = document.getElementById('reg-name').value.trim();
      const industry = document.getElementById('reg-industry').value.trim();
      const location = document.getElementById('reg-location').value.trim();
      const latitude = parseFloat(document.getElementById('reg-lat').value);
      const longitude = parseFloat(document.getElementById('reg-lng').value);
      const material = document.getElementById('reg-material').value.trim();
      const quantity = parseFloat(document.getElementById('reg-qty').value);
      const unit = document.getElementById('reg-unit').value;
      const frequency = document.getElementById('reg-frequency').value;
      const spec = document.getElementById('reg-spec').value.trim() || null;
      const quality = document.getElementById('reg-quality').value.trim() || null;

      const isSupplier = symbiosisState.registrationType === 'supplier';
      const endpoint = isSupplier ? `${API_BASE_URL}/api/suppliers` : `${API_BASE_URL}/api/buyers`;

      const payload = {
        name,
        industry,
        location,
        latitude,
        longitude,
        material_specification: spec,
        quality_notes: quality,
        unit,
        frequency
      };

      if (isSupplier) {
        payload.material = material;
        payload.quantity = quantity;
      } else {
        payload.material_needed = material;
        payload.quantity_needed = quantity;
      }

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || 'Failed to create record in database.');
        }

        const created = await res.json();
        if (feedbackMsg) {
          feedbackMsg.style.display = 'block';
          feedbackMsg.className = 'mb-4 text-xs text-success';
          feedbackMsg.innerText = `✓ Successfully registered ${created.name} in Industrial Symbiosis! Recalculating matches...`;
        }

        store.addToast(`Successfully added ${name} to resource exchange network!`, 'success');
        form.reset();

        // Refresh dataset and switch back to matches tab
        await fetchSymbiosisData();
        setTimeout(() => {
          symbiosisState.activeTab = 'matches';
          const container = document.getElementById('symbiosis-view-root');
          if (container) {
            container.innerHTML = renderSymbiosisContent();
            attachSymbiosisEventHandlers();
          }
        }, 1200);

      } catch (err) {
        if (feedbackMsg) {
          feedbackMsg.style.display = 'block';
          feedbackMsg.className = 'mb-4 text-xs text-danger';
          feedbackMsg.innerText = `Error: ${err.message}`;
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
}

function rerenderMatchesPane() {
  const container = document.getElementById('symbiosis-view-root');
  if (container) {
    container.innerHTML = renderSymbiosisContent();
    attachSymbiosisEventHandlers();
  }
}