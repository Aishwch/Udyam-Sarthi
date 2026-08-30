/* UDYAM SARTHI Performance Diagnosis View */
import { renderSidebar } from '../../components/Sidebar.js';
import { renderTopbar } from '../../components/Topbar.js';
import { renderTagBadge } from '../../components/TagBadge.js';
import { getIcon } from '../../components/IconLibrary.js';

export const DiagnosisView = () => {
  return `
    <div class="app-layout">
      ${renderSidebar('/diagnosis')}

      <main class="app-main">
        ${renderTopbar()}

        <div class="app-page-content">
          <div class="page-header">
            <div>
              <h1 class="page-title">Performance Diagnosis</h1>
              <p class="page-subtitle">Understand possible root causes of plant performance issues and recommended investigation steps.</p>
            </div>
            ${renderTagBadge('Estimated')}
          </div>

          <div class="glass-card mb-6" style="border-left: 4px solid var(--warning);">
            <div class="flex items-center gap-3">
              <span class="text-warning">${getIcon('alertTriangle', 24)}</span>
              <div>
                <h3 class="text-base font-bold text-main">Performance Issue Detected on Machine A</h3>
                <p class="text-xs text-muted">Machine A runtime was 7.0 hrs, but output was 96 units (-20% below 120 expected units).</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-6">
            <!-- Timeline Diagnosis Steps (Col 1-2) -->
            <div class="glass-card" style="grid-column: span 2;">
              <h3 class="text-base font-bold mb-4">Diagnostic Cause-and-Effect Analysis</h3>

              <div class="diagnosis-timeline">
                <div class="diagnosis-step">
                  <div class="diagnosis-step-dot"></div>
                  <h4 class="text-sm font-bold text-main">Symptom Observed</h4>
                  <p class="text-xs text-muted">Low production output (96 units) despite full shift runtime allocation.</p>
                </div>

                <div class="diagnosis-step">
                  <div class="diagnosis-step-dot" style="background: var(--warning);"></div>
                  <h4 class="text-sm font-bold text-main">Key Contributing Factor</h4>
                  <p class="text-xs text-muted">High unplanned downtime recorded (1.0 hr nozzle clog + 0.5 hr power trip).</p>
                </div>

                <div class="diagnosis-step">
                  <div class="diagnosis-step-dot" style="background: var(--accent-500);"></div>
                  <h4 class="text-sm font-bold text-main">Root Cause Pattern</h4>
                  <p class="text-xs text-muted">Powder residue buildup in automatic feed line causes spray blockage every ~14 operating hours.</p>
                </div>
              </div>

              <div style="margin-top: 2rem; border-top: 1px solid var(--border-color); padding-top: 1.5rem;">
                <h4 class="text-sm font-bold text-main mb-2">Recommended Investigation Steps</h4>
                <div class="grid grid-cols-3 gap-3">
                  <div class="glass-card text-xs" style="padding: 1rem; background: rgba(15, 23, 42, 0.6);">
                    <strong class="display-block text-primary mb-1">1. Check Nozzles</strong>
                    <p class="text-muted">Inspect spray nozzles for powder buildup prior to shift start.</p>
                  </div>

                  <div class="glass-card text-xs" style="padding: 1rem; background: rgba(15, 23, 42, 0.6);">
                    <strong class="display-block text-primary mb-1">2. Verify Voltage</strong>
                    <p class="text-muted">Verify plant main circuit breaker line voltage during peak load.</p>
                  </div>

                  <div class="glass-card text-xs" style="padding: 1rem; background: rgba(15, 23, 42, 0.6);">
                    <strong class="display-block text-primary mb-1">3. Clean Filters</strong>
                    <p class="text-muted">Replace secondary air suction filters on Machine B.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Disclaimer Box (Col 3) -->
            <div class="glass-card">
              <h3 class="text-base font-bold mb-3">Diagnosis Guidelines</h3>
              <p class="text-xs text-muted mb-4" style="line-height: 1.6;">
                These diagnostic insights represent suggestions derived from operational data patterns. They assist plant supervisors in prioritizing physical inspections on the factory floor.
              </p>

              <a href="#/assistant" class="btn btn-primary btn-sm w-full">
                ${getIcon('bot', 14)}
                <span>Ask AI Companion About Cause</span>
              </a>
            </div>
          </div>

        </div>
      </main>
    </div>
  `;
};