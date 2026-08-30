/* UDYAM SARTHI Business Onboarding Flow View */
import { renderPublicNavbar } from '../../components/Navbar.js';
import { renderPublicFooter } from '../../components/Footer.js';
import { getIcon } from '../../components/IconLibrary.js';
import { store } from '../../store.js';

export const OnboardingView = () => {
  let currentStep = 1;

  setTimeout(() => {
    const updateSteps = () => {
      document.querySelectorAll('.onboarding-step-pane').forEach((pane, idx) => {
        pane.style.display = (idx + 1 === currentStep) ? 'block' : 'none';
      });

      document.querySelectorAll('.step-indicator-item').forEach((item, idx) => {
        if (idx + 1 === currentStep) {
          item.classList.add('active');
          item.classList.remove('completed');
        } else if (idx + 1 < currentStep) {
          item.classList.add('completed');
          item.classList.remove('active');
        } else {
          item.classList.remove('active', 'completed');
        }
      });
    };

    document.querySelectorAll('.next-step-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (currentStep < 4) {
          currentStep++;
          updateSteps();
        }
      });
    });

    document.querySelectorAll('.prev-step-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (currentStep > 1) {
          currentStep--;
          updateSteps();
        }
      });
    });

    const finishBtn = document.getElementById('finish-onboarding-btn');
    if (finishBtn) {
      finishBtn.addEventListener('click', () => {
        const name = document.getElementById('ob-name')?.value || 'ABC Coating & Engineering';
        const industry = document.getElementById('ob-industry')?.value || 'Fan Paint & Coating';
        const location = document.getElementById('ob-location')?.value || 'Peenya Industrial Area, Bengaluru';

        store.updateBusinessProfile({
          name,
          industry,
          location,
          onboardingCompleted: true
        });

        window.location.hash = '#/dashboard';
      });
    }

    updateSteps();
  }, 0);

  return `
    ${renderPublicNavbar('/onboarding')}

    <div class="container" style="padding: 3rem 1.5rem; min-height: calc(100vh - 200px);">
      <div style="max-width: 760px; margin: 0 auto;">
        
        <!-- Progress Stepper Header -->
        <div class="glass-card mb-6" style="padding: 1.25rem 2rem;">
          <div class="flex items-center justify-between">
            <div class="step-indicator-item active flex items-center gap-2">
              <span class="step-num" style="width: 28px; height: 28px; border-radius: 50%; background: var(--primary-600); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700;">1</span>
              <span class="text-xs font-semibold">Business Info</span>
            </div>
            <div style="flex: 1; height: 2px; background: var(--border-color); margin: 0 1rem;"></div>
            <div class="step-indicator-item flex items-center gap-2">
              <span class="step-num" style="width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.1); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700;">2</span>
              <span class="text-xs font-semibold">Operations</span>
            </div>
            <div style="flex: 1; height: 2px; background: var(--border-color); margin: 0 1rem;"></div>
            <div class="step-indicator-item flex items-center gap-2">
              <span class="step-num" style="width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.1); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700;">3</span>
              <span class="text-xs font-semibold">Machine Setup</span>
            </div>
            <div style="flex: 1; height: 2px; background: var(--border-color); margin: 0 1rem;"></div>
            <div class="step-indicator-item flex items-center gap-2">
              <span class="step-num" style="width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,0.1); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700;">4</span>
              <span class="text-xs font-semibold">Review & Launch</span>
            </div>
          </div>
        </div>

        <div class="glass-card" style="padding: 2.5rem;">
          
          <!-- STEP 1 -->
          <div class="onboarding-step-pane" id="pane-step-1">
            <h3 class="text-xl font-bold mb-1">Step 1: Tell Us About Your Business</h3>
            <p class="text-xs text-muted mb-6">Enter basic information about your MSME enterprise.</p>

            <div class="form-group">
              <label class="form-label">Business / Unit Name</label>
              <input type="text" id="ob-name" class="form-input" value="ABC Coating & Engineering Works" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="form-group">
                <label class="form-label">Industry Sector</label>
                <select id="ob-industry" class="form-select">
                  <option value="Fan Paint & Coating Manufacturing" selected>Fan Paint & Coating Manufacturing</option>
                  <option value="General Metal Fabrication">General Metal Fabrication</option>
                  <option value="Auto Components">Auto Components</option>
                  <option value="Plastic Injection Molding">Plastic Injection Molding</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">MSME Category</label>
                <select class="form-select">
                  <option value="Micro Enterprise">Micro Enterprise</option>
                  <option value="Small Enterprise" selected>Small Enterprise</option>
                  <option value="Medium Enterprise">Medium Enterprise</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Plant Location</label>
              <input type="text" id="ob-location" class="form-input" value="Peenya Industrial Area, Bengaluru, Karnataka" />
            </div>

            <div class="flex justify-end mt-6">
              <button type="button" class="btn btn-primary next-step-btn">
                <span>Continue to Operations</span>
                ${getIcon('chevronRight', 16)}
              </button>
            </div>
          </div>

          <!-- STEP 2 -->
          <div class="onboarding-step-pane" id="pane-step-2" style="display: none;">
            <h3 class="text-xl font-bold mb-1">Step 2: Define Plant Operations</h3>
            <p class="text-xs text-muted mb-6">Set your standard working schedule and production units.</p>

            <div class="grid grid-cols-2 gap-4">
              <div class="form-group">
                <label class="form-label">Working Days per Week</label>
                <input type="number" class="form-input" value="6" min="1" max="7" />
              </div>
              <div class="form-group">
                <label class="form-label">Working Hours per Shift</label>
                <input type="number" class="form-input" value="8" min="1" max="24" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="form-group">
                <label class="form-label">Shifts per Day</label>
                <input type="number" class="form-input" value="1" min="1" max="3" />
              </div>
              <div class="form-group">
                <label class="form-label">Primary Output Unit</label>
                <input type="text" class="form-input" value="Units" />
              </div>
            </div>

            <div class="flex justify-between mt-6">
              <button type="button" class="btn btn-secondary prev-step-btn">Back</button>
              <button type="button" class="btn btn-primary next-step-btn">
                <span>Continue to Machines</span>
                ${getIcon('chevronRight', 16)}
              </button>
            </div>
          </div>

          <!-- STEP 3 -->
          <div class="onboarding-step-pane" id="pane-step-3" style="display: none;">
            <h3 class="text-xl font-bold mb-1">Step 3: Initial Machine Setup</h3>
            <p class="text-xs text-muted mb-6">Register your primary plant machinery.</p>

            <div class="table-container mb-4">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Machine Name</th>
                    <th>Type</th>
                    <th>Rated Capacity</th>
                    <th>Age</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Machine A</strong></td>
                    <td>Automated Powder Coater</td>
                    <td>120 Units/hr</td>
                    <td>5 yrs</td>
                  </tr>
                  <tr>
                    <td><strong>Machine B</strong></td>
                    <td>Manual Spray Booth 2</td>
                    <td>80 Units/hr</td>
                    <td>3 yrs</td>
                  </tr>
                  <tr>
                    <td><strong>Machine C</strong></td>
                    <td>Pre-treatment & Oven</td>
                    <td>150 Units/hr</td>
                    <td>4 yrs</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="flex justify-between mt-6">
              <button type="button" class="btn btn-secondary prev-step-btn">Back</button>
              <button type="button" class="btn btn-primary next-step-btn">
                <span>Review & Finish</span>
                ${getIcon('chevronRight', 16)}
              </button>
            </div>
          </div>

          <!-- STEP 4 -->
          <div class="onboarding-step-pane" id="pane-step-4" style="display: none;">
            <h3 class="text-xl font-bold mb-1">Step 4: Review & Complete Setup</h3>
            <p class="text-xs text-muted mb-6">Review your setup summary before entering Udyam Sarthi Business Dashboard.</p>

            <div class="glass-card mb-6" style="background: rgba(15, 23, 42, 0.6);">
              <div class="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span class="text-muted display-block">Business Name:</span>
                  <strong class="text-sm text-main">ABC Coating & Engineering Works</strong>
                </div>
                <div>
                  <span class="text-muted display-block">Industry Sector:</span>
                  <strong class="text-sm text-main">Fan Paint & Coating Manufacturing</strong>
                </div>
                <div>
                  <span class="text-muted display-block">Location:</span>
                  <strong class="text-sm text-main">Peenya, Bengaluru</strong>
                </div>
                <div>
                  <span class="text-muted display-block">Machines Registered:</span>
                  <strong class="text-sm text-main">3 Active Lines (Machine A, B, C)</strong>
                </div>
              </div>
            </div>

            <div class="flex justify-between mt-6">
              <button type="button" class="btn btn-secondary prev-step-btn">Back</button>
              <button type="button" id="finish-onboarding-btn" class="btn btn-accent btn-lg">
                <span>Complete Setup & Enter Dashboard</span>
                ${getIcon('check', 18)}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>

    ${renderPublicFooter()}
  `;
};