/* UDYAM SARTHI Public Landing Page View — Refined Classy, Creative & Professional Structure */
import { renderPublicNavbar } from '../../components/Navbar.js';
import { renderPublicFooter } from '../../components/Footer.js';
import { getIcon } from '../../components/IconLibrary.js';

export const HomeView = () => {
  setTimeout(() => {
    // Feature Pillar Tab Switcher
    const featureTabs = document.querySelectorAll('.feature-pillar-tab');
    featureTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const pillarId = e.currentTarget.dataset.pillar;
        
        featureTabs.forEach(t => t.classList.remove('active'));
        e.currentTarget.classList.add('active');

        document.querySelectorAll('.feature-pillar-pane').forEach(pane => {
          pane.style.display = (pane.id === `pillar-pane-${pillarId}`) ? 'grid' : 'none';
        });
      });
    });

    // View All Toggle
    const toggleViewAllBtn = document.getElementById('toggle-view-all-features');
    if (toggleViewAllBtn) {
      toggleViewAllBtn.addEventListener('click', () => {
        const allPane = document.getElementById('pillar-pane-all');
        if (allPane) {
          const isHidden = allPane.style.display === 'none';
          allPane.style.display = isHidden ? 'grid' : 'none';
          document.querySelectorAll('.feature-pillar-pane').forEach(p => {
            if (p.id !== 'pillar-pane-all') p.style.display = isHidden ? 'none' : 'none';
          });
          if (isHidden) {
            featureTabs.forEach(t => t.classList.remove('active'));
            toggleViewAllBtn.textContent = 'Switch to Tabbed Suite';
          } else {
            document.querySelector('[data-pillar="1"]').click();
            toggleViewAllBtn.textContent = 'View All 12 Modules Grid';
          }
        }
      });
    }
  }, 0);

  return `
    ${renderPublicNavbar('/')}

    <!-- Hero Section -->
    <section class="hero-section" id="home">
      <div class="hero-glow"></div>
      <div class="container hero-grid">
        <div>
          <div class="hero-badge">
            ${getIcon('sparkles', 16)}
            <span>AI-POWERED DIGITAL BUSINESS COMPANION</span>
          </div>

          <h1 class="hero-title">UDYAM SARTHI</h1>
          
          <p class="hero-sub">
            Your AI-powered digital business companion for smarter MSME growth. Monitor performance, understand problems, discover opportunities, and make data-driven decisions.
          </p>

          <div class="flex items-center gap-4 flex-wrap mb-6">
            <a href="#/register" class="btn btn-primary btn-lg">
              <span>Get Started</span>
              ${getIcon('chevronRight', 18)}
            </a>
            <a href="#/about" class="btn btn-secondary btn-lg">
              <span>Explore Udyam Sarthi</span>
            </a>
          </div>

          <!-- Key Metrics Counter Ribbon -->
          <div style="display: flex; gap: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(255, 255, 255, 0.08); font-size: 0.875rem; color: var(--text-muted);">
            <div>
              <strong style="color: var(--text-main); font-size: 1.35rem; display: block; font-family: var(--font-heading);">100%</strong>
              <span>MSME Focused</span>
            </div>
            <div style="border-left: 1px solid var(--border-color); padding-left: 1.75rem;">
              <strong style="color: var(--text-main); font-size: 1.35rem; display: block; font-family: var(--font-heading);">Real-time</strong>
              <span>Operational Analytics</span>
            </div>
            <div style="border-left: 1px solid var(--border-color); padding-left: 1.75rem;">
              <strong style="color: var(--text-main); font-size: 1.35rem; display: block; font-family: var(--font-heading);">Actionable</strong>
              <span>AI Recommendations</span>
            </div>
          </div>
        </div>

        <!-- High-Tech Interactive Dashboard Mockup Preview -->
        <div class="hero-visual">
          <div class="flex items-center justify-between mb-3 pb-2" style="border-bottom: 1px solid var(--border-color);">
            <div class="flex items-center gap-2">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--success); display: inline-block; box-shadow: 0 0 8px var(--success);"></span>
              <span class="text-xs font-semibold text-main">PEENYA PLANT LINE 1 — LIVE MONITORING</span>
            </div>
            <span class="tag-badge tag-synthetic">${getIcon('cpu', 12)} Synthetic</span>
          </div>

          <div class="hero-card-mock">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs text-muted">Weekly Plant Utilization</span>
              <span class="text-xs text-success font-bold">+2.1% vs last week</span>
            </div>
            <div class="flex items-baseline gap-3">
              <div class="text-3xl font-bold" style="color: var(--accent-400);">94.2%</div>
              <div class="text-xs text-muted">Target: 90.0%</div>
            </div>
          </div>

          <!-- Machine Chips Preview -->
          <div class="grid grid-cols-3 gap-2 mb-3">
            <div class="glass-card text-center" style="padding: 0.6rem; background: rgba(15, 23, 42, 0.9);">
              <span class="text-xs text-dim display-block">Machine A</span>
              <span class="text-xs font-bold text-warning">80% Eff</span>
            </div>
            <div class="glass-card text-center" style="padding: 0.6rem; background: rgba(15, 23, 42, 0.9);">
              <span class="text-xs text-dim display-block">Machine B</span>
              <span class="text-xs font-bold text-success">95% Eff</span>
            </div>
            <div class="glass-card text-center" style="padding: 0.6rem; background: rgba(15, 23, 42, 0.9);">
              <span class="text-xs text-dim display-block">Machine C</span>
              <span class="text-xs font-bold text-success">98% Eff</span>
            </div>
          </div>

          <!-- AI Companion Popover -->
          <div class="hero-card-mock" style="background: rgba(37, 99, 235, 0.12); border-color: rgba(59, 130, 246, 0.35);">
            <div class="flex items-center justify-between mb-1">
              <div class="flex items-center gap-1.5 text-primary text-xs font-bold">
                ${getIcon('sparkles', 14)}
                <span>AI BUSINESS COMPANION INSIGHT</span>
              </div>
              <span class="badge badge-info" style="font-size: 0.65rem;">Model-based</span>
            </div>
            <p class="text-xs text-main" style="line-height: 1.5;">
              "Machine A nozzle clog detected as root cause for 20% output drop. Cleaning pre-shift will boost output capacity by <strong>+140 units/week</strong>."
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Industry Sectors Ribbon -->
    <div class="industry-ribbon">
      <div class="container industry-ribbon-track">
        <div class="industry-item"><span class="dot"></span> Fan Paint & Coating</div>
        <div class="industry-item"><span class="dot"></span> Sheet Metal Stamping</div>
        <div class="industry-item"><span class="dot"></span> Plastic Injection Molding</div>
        <div class="industry-item"><span class="dot"></span> Precision Engineering</div>
        <div class="industry-item"><span class="dot"></span> Auto Components</div>
        <div class="industry-item"><span class="dot"></span> Die Casting</div>
      </div>
    </div>

    <!-- SECTION 1: WHAT IS UDYAM SARTHI? (Operational Pipeline) -->
    <section class="container" style="padding: 6rem 1.5rem;" id="about">
      <div class="text-center mb-8">
        <span class="text-xs font-bold text-primary uppercase letter-spacing-1 display-block mb-2">END-TO-END INTELLIGENCE FLOW</span>
        <h2 class="text-3xl font-bold mb-3">What is Udyam Sarthi?</h2>
        <p class="text-muted" style="max-width: 700px; margin: 0 auto; line-height: 1.6;">
          Udyam Sarthi is a digital business companion that transforms raw plant and operational information into clear, explainable insights and growth actions for MSME owners.
        </p>
      </div>

      <div class="pipeline-grid">
        <div class="pipeline-card">
          <div class="pipeline-icon">${getIcon('clipboardList', 22)}</div>
          <strong class="text-sm display-block text-main mb-1">1. BUSINESS DATA</strong>
          <p class="text-xs text-muted">Daily runtime, downtime, output & energy inputs.</p>
        </div>

        <div class="pipeline-card">
          <div class="pipeline-icon">${getIcon('barChart3', 22)}</div>
          <strong class="text-sm display-block text-main mb-1">2. ANALYTICS ENGINE</strong>
          <p class="text-xs text-muted">Capacity utilization & variance comparison.</p>
        </div>

        <div class="pipeline-card">
          <div class="pipeline-icon">${getIcon('cpu', 22)}</div>
          <strong class="text-sm display-block text-main mb-1">3. AI / ML MODELS</strong>
          <p class="text-xs text-muted">Pattern recognition & anomaly detection.</p>
        </div>

        <div class="pipeline-card">
          <div class="pipeline-icon">${getIcon('helpCircle', 22)}</div>
          <strong class="text-sm display-block text-main mb-1">4. DIAGNOSIS</strong>
          <p class="text-xs text-muted">Explainable root cause analysis.</p>
        </div>

        <!-- UNIFORM STYLING MATCHING CARDS 1-4 -->
        <div class="pipeline-card">
          <div class="pipeline-icon" style="color: var(--accent-400);">${getIcon('trendingUp', 22)}</div>
          <strong class="text-sm display-block text-main mb-1">5. ACTION & GROWTH</strong>
          <p class="text-xs text-muted">Quantified production capacity boost.</p>
        </div>
      </div>
    </section>

    <!-- SECTION 2: WHY UDYAM SARTHI? (Pain Points vs Solution) -->
    <section style="background: rgba(17, 24, 39, 0.5); padding: 6rem 0;" id="why">
      <div class="container">
        <div class="text-center mb-8">
          <span class="text-xs font-bold text-accent uppercase letter-spacing-1 display-block mb-2">SOLVING REAL MSME CHALLENGES</span>
          <h2 class="text-3xl font-bold mb-3">Why MSMEs Need Udyam Sarthi</h2>
          <p class="text-muted" style="max-width: 620px; margin: 0 auto;">
            Bridging operational gaps for small and medium manufacturing enterprises across India.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-6">
          <div class="glass-card" style="border-left: 4px solid var(--danger);">
            <div class="flex items-center gap-2 mb-2 text-danger">
              ${getIcon('alertTriangle', 20)}
              <h4 class="text-base font-bold text-main">1. Unplanned Machine Downtime</h4>
            </div>
            <p class="text-xs text-muted" style="line-height: 1.6;">
              <strong>The Problem:</strong> Frequent unmonitored breakdown stoppages lead to lost capacity and missed customer deadlines.<br/>
              <strong>Udyam Sarthi Solution:</strong> Real-time downtime cause logging, anomaly alerts, and preventive maintenance reminders.
            </p>
          </div>

          <div class="glass-card" style="border-left: 4px solid var(--warning);">
            <div class="flex items-center gap-2 mb-2 text-warning">
              ${getIcon('zap', 20)}
              <h4 class="text-base font-bold text-main">2. Energy & Scrap Losses</h4>
            </div>
            <p class="text-xs text-muted" style="line-height: 1.6;">
              <strong>The Problem:</strong> High electricity consumption per unit and unmonitored scrap cut into slim profit margins.<br/>
              <strong>Udyam Sarthi Solution:</strong> Specific energy tracking, scrap rate monitoring, and industrial symbiosis resource exchange.
            </p>
          </div>

          <div class="glass-card" style="border-left: 4px solid var(--primary-500);">
            <div class="flex items-center gap-2 mb-2 text-primary">
              ${getIcon('barChart3', 20)}
              <h4 class="text-base font-bold text-main">3. Data Complexity</h4>
            </div>
            <p class="text-xs text-muted" style="line-height: 1.6;">
              <strong>The Problem:</strong> MSME owners struggle to extract actionable insights from manual shift logbooks.<br/>
              <strong>Udyam Sarthi Solution:</strong> Conversational AI Business Companion that answers natural language plant questions.
            </p>
          </div>

          <div class="glass-card" style="border-left: 4px solid var(--accent-500);">
            <div class="flex items-center gap-2 mb-2 text-accent">
              ${getIcon('award', 20)}
              <h4 class="text-base font-bold text-main">4. Missed Support Schemes</h4>
            </div>
            <p class="text-xs text-muted" style="line-height: 1.6;">
              <strong>The Problem:</strong> Difficulty identifying applicable MSME government subsidies and credit guarantee schemes.<br/>
              <strong>Udyam Sarthi Solution:</strong> Curated discovery portal matching schemes like CGTMSE and ZED to plant profile.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 3: PROFESSIONAL FEATURE SHOWCASE MATRIX (12 Digital Companion Modules) -->
    <section class="container" style="padding: 6rem 1.5rem;" id="features">
      <div class="text-center mb-6">
        <span class="text-xs font-bold text-primary uppercase letter-spacing-1 display-block mb-2">MODULAR MSME PLATFORM SUITE</span>
        <h2 class="text-3xl font-bold mb-3">12 Powerful Digital Companion Capabilities</h2>
        <p class="text-muted" style="max-width: 680px; margin: 0 auto;">
          An integrated suite engineered specifically for Indian small & medium manufacturing enterprises.
        </p>
      </div>

      <!-- Professional Feature Suite Tab Bar -->
      <div class="feature-suite-header mb-8">
        <div class="feature-suite-tabs">
          <button class="feature-pillar-tab active" data-pillar="1">
            ${getIcon('barChart3', 18)}
            <span>Pillar 1: Core Operations & Analytics</span>
          </button>
          <button class="feature-pillar-tab" data-pillar="2">
            ${getIcon('bot', 18)}
            <span>Pillar 2: Intelligent Diagnosis & AI</span>
          </button>
          <button class="feature-pillar-tab" data-pillar="3">
            ${getIcon('recycle', 18)}
            <span>Pillar 3: Industrial Ecosystem</span>
          </button>
        </div>

        <button class="btn btn-secondary btn-sm" id="toggle-view-all-features">
          View All 12 Modules Grid
        </button>
      </div>

      <!-- PANE 1: CORE OPERATIONS -->
      <div class="feature-pillar-pane grid grid-cols-2 gap-6" id="pillar-pane-1">
        <div class="feature-card-professional">
          <div class="feature-prof-header">
            <div class="feature-prof-icon">${getIcon('barChart3', 22)}</div>
            <div>
              <span class="feature-prof-badge">MODULE 01</span>
              <h4 class="text-lg font-bold text-main">Business Analytics</h4>
            </div>
          </div>
          <p class="text-xs text-muted mb-4" style="line-height: 1.6;">
            Track plant-wide production output, line efficiency trends, and capacity utilization rates in real time.
          </p>
          <div class="feature-prof-tags">
            <span class="feature-prof-tag">${getIcon('check', 12)} Actual vs Target Variance</span>
            <span class="feature-prof-tag">${getIcon('check', 12)} Plant Utilization Rate</span>
          </div>
        </div>

        <div class="feature-card-professional">
          <div class="feature-prof-header">
            <div class="feature-prof-icon">${getIcon('cpu', 22)}</div>
            <div>
              <span class="feature-prof-badge">MODULE 02</span>
              <h4 class="text-lg font-bold text-main">Machine Performance</h4>
            </div>
          </div>
          <p class="text-xs text-muted mb-4" style="line-height: 1.6;">
            Monitor individual machine runtimes, rated capacities, power ratings, and maintenance age factors.
          </p>
          <div class="feature-prof-tags">
            <span class="feature-prof-tag">${getIcon('check', 12)} Rated Capacity Audit</span>
            <span class="feature-prof-tag">${getIcon('check', 12)} Power Consumption Tracker</span>
          </div>
        </div>

        <div class="feature-card-professional">
          <div class="feature-prof-header">
            <div class="feature-prof-icon">${getIcon('clipboardList', 22)}</div>
            <div>
              <span class="feature-prof-badge">MODULE 03</span>
              <h4 class="text-lg font-bold text-main">Daily Operations Tracking</h4>
            </div>
          </div>
          <p class="text-xs text-muted mb-4" style="line-height: 1.6;">
            Streamlined daily entry logs for shift runtime, downtime reasons, actual output, energy, and scrap quantity.
          </p>
          <div class="feature-prof-tags">
            <span class="feature-prof-tag">${getIcon('check', 12)} Validated Data Logging</span>
            <span class="feature-prof-tag">${getIcon('check', 12)} Downtime Reason Categorization</span>
          </div>
        </div>

        <div class="feature-card-professional">
          <div class="feature-prof-header">
            <div class="feature-prof-icon">${getIcon('trendingUp', 22)}</div>
            <div>
              <span class="feature-prof-badge">MODULE 04</span>
              <h4 class="text-lg font-bold text-main">Predictive Insights</h4>
            </div>
          </div>
          <p class="text-xs text-muted mb-4" style="line-height: 1.6;">
            Forecast upcoming weekly production output and plant line efficiency using model-based trend extrapolation.
          </p>
          <div class="feature-prof-tags">
            <span class="feature-prof-tag">${getIcon('check', 12)} Forecast Output Volume</span>
            <span class="feature-prof-tag">${getIcon('check', 12)} Confidence Score Rating</span>
          </div>
        </div>
      </div>

      <!-- PANE 2: INTELLIGENT DIAGNOSIS & AI -->
      <div class="feature-pillar-pane grid grid-cols-2 gap-6" id="pillar-pane-2" style="display: none;">
        <div class="feature-card-professional">
          <div class="feature-prof-header">
            <div class="feature-prof-icon">${getIcon('alertTriangle', 22)}</div>
            <div>
              <span class="feature-prof-badge">MODULE 05</span>
              <h4 class="text-lg font-bold text-main">Smart Operational Alerts</h4>
            </div>
          </div>
          <p class="text-xs text-muted mb-4" style="line-height: 1.6;">
            Instant alert notifications on unusual operational behavior, high downtime, and severe output drops.
          </p>
          <div class="feature-prof-tags">
            <span class="feature-prof-tag">${getIcon('check', 12)} Severity Level Badges</span>
            <span class="feature-prof-tag">${getIcon('check', 12)} Anomaly Root Cause Factors</span>
          </div>
        </div>

        <div class="feature-card-professional">
          <div class="feature-prof-header">
            <div class="feature-prof-icon">${getIcon('helpCircle', 22)}</div>
            <div>
              <span class="feature-prof-badge">MODULE 06</span>
              <h4 class="text-lg font-bold text-main">Performance Diagnosis</h4>
            </div>
          </div>
          <p class="text-xs text-muted mb-4" style="line-height: 1.6;">
            Explainable cause-and-effect breakdown mapping operational symptoms to potential root causes and steps.
          </p>
          <div class="feature-prof-tags">
            <span class="feature-prof-tag">${getIcon('check', 12)} Cause Timeline Analysis</span>
            <span class="feature-prof-tag">${getIcon('check', 12)} Investigation Action Checklist</span>
          </div>
        </div>

        <div class="feature-card-professional">
          <div class="feature-prof-header">
            <div class="feature-prof-icon">${getIcon('bot', 22)}</div>
            <div>
              <span class="feature-prof-badge">MODULE 07</span>
              <h4 class="text-lg font-bold text-main">AI Business Assistant</h4>
            </div>
          </div>
          <p class="text-xs text-muted mb-4" style="line-height: 1.6;">
            Conversational digital business companion to ask natural language questions about your plant anytime.
          </p>
          <div class="feature-prof-tags">
            <span class="feature-prof-tag">${getIcon('check', 12)} Natural Query Interface</span>
            <span class="feature-prof-tag">${getIcon('check', 12)} Plant Contextual Answers</span>
          </div>
        </div>

        <div class="feature-card-professional">
          <div class="feature-prof-header">
            <div class="feature-prof-icon">${getIcon('zap', 22)}</div>
            <div>
              <span class="feature-prof-badge">MODULE 08</span>
              <h4 class="text-lg font-bold text-main">Business Growth Opportunities</h4>
            </div>
          </div>
          <p class="text-xs text-muted mb-4" style="line-height: 1.6;">
            Quantified recommendations to boost production capacity, reduce energy intensity, and improve margin.
          </p>
          <div class="feature-prof-tags">
            <span class="feature-prof-tag">${getIcon('check', 12)} Estimated Capacity Boost</span>
            <span class="feature-prof-tag">${getIcon('check', 12)} Energy Saving Targets</span>
          </div>
        </div>
      </div>

      <!-- PANE 3: INDUSTRIAL ECOSYSTEM -->
      <div class="feature-pillar-pane grid grid-cols-2 gap-6" id="pillar-pane-3" style="display: none;">
        <div class="feature-card-professional">
          <div class="feature-prof-header">
            <div class="feature-prof-icon">${getIcon('recycle', 22)}</div>
            <div>
              <span class="feature-prof-badge">MODULE 09</span>
              <h4 class="text-lg font-bold text-main">Industrial Symbiosis</h4>
            </div>
          </div>
          <p class="text-xs text-muted mb-4" style="line-height: 1.6;">
            Discover potential opportunities to exchange or reuse industrial by-products with nearby manufacturing plants.
          </p>
          <div class="feature-prof-tags">
            <span class="feature-prof-tag">${getIcon('check', 12)} Partner Compatibility Score</span>
            <span class="feature-prof-tag">${getIcon('check', 12)} Material Matching Engine</span>
          </div>
        </div>

        <div class="feature-card-professional">
          <div class="feature-prof-header">
            <div class="feature-prof-icon">${getIcon('store', 22)}</div>
            <div>
              <span class="feature-prof-badge">MODULE 10</span>
              <h4 class="text-lg font-bold text-main">Material / Scrap Marketplace</h4>
            </div>
          </div>
          <p class="text-xs text-muted mb-4" style="line-height: 1.6;">
            Browse and list manufacturing cut-offs, scrap metals, oversized powders, and reusable steel containers.
          </p>
          <div class="feature-prof-tags">
            <span class="feature-prof-tag">${getIcon('check', 12)} Direct Scrap Listing</span>
            <span class="feature-prof-tag">${getIcon('check', 12)} Buyer Contact Exchange</span>
          </div>
        </div>

        <div class="feature-card-professional">
          <div class="feature-prof-header">
            <div class="feature-prof-icon">${getIcon('award', 22)}</div>
            <div>
              <span class="feature-prof-badge">MODULE 11</span>
              <h4 class="text-lg font-bold text-main">Government Scheme Discovery</h4>
            </div>
          </div>
          <p class="text-xs text-muted mb-4" style="line-height: 1.6;">
            Curated MSME government support schemes covering credit guarantees (CGTMSE), ZED certification, and subsidies.
          </p>
          <div class="feature-prof-tags">
            <span class="feature-prof-tag">${getIcon('check', 12)} Eligibility Verification</span>
            <span class="feature-prof-tag">${getIcon('check', 12)} Direct Official Portal Links</span>
          </div>
        </div>

        <div class="feature-card-professional">
          <div class="feature-prof-header">
            <div class="feature-prof-icon">${getIcon('fileText', 22)}</div>
            <div>
              <span class="feature-prof-badge">MODULE 12</span>
              <h4 class="text-lg font-bold text-main">Reports & Data Export</h4>
            </div>
          </div>
          <p class="text-xs text-muted mb-4" style="line-height: 1.6;">
            Generate exportable CSV operational spreadsheets and print-ready PDF reports for bank and audit submission.
          </p>
          <div class="feature-prof-tags">
            <span class="feature-prof-tag">${getIcon('check', 12)} Instant CSV File Export</span>
            <span class="feature-prof-tag">${getIcon('check', 12)} PDF Print Format</span>
          </div>
        </div>
      </div>

      <!-- FULL 12 MODULES OVERVIEW PANE (Hidden by default) -->
      <div class="feature-pillar-pane grid grid-cols-3 gap-6" id="pillar-pane-all" style="display: none;">
        <!-- All 12 cards in 3 columns for full view -->
        <div class="feature-card-professional">
          <div class="feature-prof-header">
            <div class="feature-prof-icon">${getIcon('barChart3', 20)}</div>
            <div><span class="feature-prof-badge">MODULE 01</span><h4 class="text-base font-bold text-main">Business Analytics</h4></div>
          </div>
          <p class="text-xs text-muted">Production trends, plant capacity utilization, and efficiency.</p>
        </div>
        <div class="feature-card-professional">
          <div class="feature-prof-header">
            <div class="feature-prof-icon">${getIcon('cpu', 20)}</div>
            <div><span class="feature-prof-badge">MODULE 02</span><h4 class="text-base font-bold text-main">Machine Performance</h4></div>
          </div>
          <p class="text-xs text-muted">Machine runtime, rated capacity, power, and age factors.</p>
        </div>
        <div class="feature-card-professional">
          <div class="feature-prof-header">
            <div class="feature-prof-icon">${getIcon('clipboardList', 20)}</div>
            <div><span class="feature-prof-badge">MODULE 03</span><h4 class="text-base font-bold text-main">Daily Operations</h4></div>
          </div>
          <p class="text-xs text-muted">Fast daily input logs for runtime, downtime, output, energy & scrap.</p>
        </div>
        <div class="feature-card-professional">
          <div class="feature-prof-header">
            <div class="feature-prof-icon">${getIcon('trendingUp', 20)}</div>
            <div><span class="feature-prof-badge">MODULE 04</span><h4 class="text-base font-bold text-main">Predictive Insights</h4></div>
          </div>
          <p class="text-xs text-muted">Forecast upcoming weekly production output and efficiency.</p>
        </div>
        <div class="feature-card-professional">
          <div class="feature-prof-header">
            <div class="feature-prof-icon">${getIcon('alertTriangle', 20)}</div>
            <div><span class="feature-prof-badge">MODULE 05</span><h4 class="text-base font-bold text-main">Smart Alerts</h4></div>
          </div>
          <p class="text-xs text-muted">Warnings on unusual operational behaviour and output drops.</p>
        </div>
        <div class="feature-card-professional">
          <div class="feature-prof-header">
            <div class="feature-prof-icon">${getIcon('helpCircle', 20)}</div>
            <div><span class="feature-prof-badge">MODULE 06</span><h4 class="text-base font-bold text-main">Performance Diagnosis</h4></div>
          </div>
          <p class="text-xs text-muted">Explainable root cause analysis for production underperformance.</p>
        </div>
        <div class="feature-card-professional">
          <div class="feature-prof-header">
            <div class="feature-prof-icon">${getIcon('bot', 20)}</div>
            <div><span class="feature-prof-badge">MODULE 07</span><h4 class="text-base font-bold text-main">AI Business Assistant</h4></div>
          </div>
          <p class="text-xs text-muted">Conversational AI companion to ask business questions directly.</p>
        </div>
        <div class="feature-card-professional">
          <div class="feature-prof-header">
            <div class="feature-prof-icon">${getIcon('zap', 20)}</div>
            <div><span class="feature-prof-badge">MODULE 08</span><h4 class="text-base font-bold text-main">Growth Opportunities</h4></div>
          </div>
          <p class="text-xs text-muted">Quantified potential capacity and energy cost saving recommendations.</p>
        </div>
        <div class="feature-card-professional">
          <div class="feature-prof-header">
            <div class="feature-prof-icon">${getIcon('recycle', 20)}</div>
            <div><span class="feature-prof-badge">MODULE 09</span><h4 class="text-base font-bold text-main">Industrial Symbiosis</h4></div>
          </div>
          <p class="text-xs text-muted">Exchange industrial material by-products with nearby partner plants.</p>
        </div>
        <div class="feature-card-professional">
          <div class="feature-prof-header">
            <div class="feature-prof-icon">${getIcon('store', 20)}</div>
            <div><span class="feature-prof-badge">MODULE 10</span><h4 class="text-base font-bold text-main">Scrap Marketplace</h4></div>
          </div>
          <p class="text-xs text-muted">Buy and sell manufacturing scrap, cut-offs, and drums online.</p>
        </div>
        <div class="feature-card-professional">
          <div class="feature-prof-header">
            <div class="feature-prof-icon">${getIcon('award', 20)}</div>
            <div><span class="feature-prof-badge">MODULE 11</span><h4 class="text-base font-bold text-main">Government Schemes</h4></div>
          </div>
          <p class="text-xs text-muted">Discover verified MSME subsidy and credit guarantee support programs.</p>
        </div>
        <div class="feature-card-professional">
          <div class="feature-prof-header">
            <div class="feature-prof-icon">${getIcon('fileText', 20)}</div>
            <div><span class="feature-prof-badge">MODULE 12</span><h4 class="text-base font-bold text-main">Reports & Data Export</h4></div>
          </div>
          <p class="text-xs text-muted">Generate exportable PDF & CSV reports for plant review.</p>
        </div>
      </div>
    </section>

    <!-- SECTION 4: HOW IT WORKS (7-Step Journey) -->
    <section style="background: rgba(17, 24, 39, 0.5); padding: 6rem 0;" id="how-it-works">
      <div class="container">
        <div class="text-center mb-8">
          <span class="text-xs font-bold text-primary uppercase letter-spacing-1 display-block mb-2">SIMPLE ONBOARDING & USE</span>
          <h2 class="text-3xl font-bold mb-3">How Udyam Sarthi Works</h2>
          <p class="text-muted">A seamless 7-step journey to elevate MSME plant performance.</p>
        </div>

        <div class="step-journey-grid">
          <div class="step-node-card">
            <div class="step-node-num">1</div>
            <strong class="text-xs display-block text-main mb-1">Register Business</strong>
            <p class="text-xs text-muted">Enter plant details & location</p>
          </div>

          <div class="step-node-card">
            <div class="step-node-num">2</div>
            <strong class="text-xs display-block text-main mb-1">Add Machines</strong>
            <p class="text-xs text-muted">Setup capacity & power ratings</p>
          </div>

          <div class="step-node-card">
            <div class="step-node-num">3</div>
            <strong class="text-xs display-block text-main mb-1">Log Daily Data</strong>
            <p class="text-xs text-muted">Enter daily runtime & output</p>
          </div>

          <div class="step-node-card">
            <div class="step-node-num">4</div>
            <strong class="text-xs display-block text-main mb-1">Analytics</strong>
            <p class="text-xs text-muted">Track utilization & variance</p>
          </div>

          <div class="step-node-card">
            <div class="step-node-num">5</div>
            <strong class="text-xs display-block text-main mb-1">AI/ML Pattern</strong>
            <p class="text-xs text-muted">Detect output anomalies</p>
          </div>

          <div class="step-node-card">
            <div class="step-node-num">6</div>
            <strong class="text-xs display-block text-main mb-1">Receive Action</strong>
            <p class="text-xs text-muted">Get actionable diagnosis</p>
          </div>

          <!-- UNIFORM STYLING MATCHING CARDS 1-6 -->
          <div class="step-node-card">
            <div class="step-node-num">7</div>
            <strong class="text-xs display-block text-main mb-1">Boost Growth</strong>
            <p class="text-xs text-muted">Improve overall capacity</p>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 5: SDG ALIGNMENT (Sustainable Development Goals) -->
    <section class="container" style="padding: 6rem 1.5rem;" id="sdg">
      <div class="text-center mb-8">
        <span class="text-xs font-bold text-accent uppercase letter-spacing-1 display-block mb-2">SUSTAINABLE MSME FUTURE</span>
        <h2 class="text-3xl font-bold mb-3">Sustainable Development Goals (SDG) Alignment</h2>
        <p class="text-muted" style="max-width: 620px; margin: 0 auto;">
          Supporting sustainable, resilient, and inclusive manufacturing growth in line with United Nations SDGs.
        </p>
      </div>

      <div class="grid grid-cols-3 gap-6">
        <div class="sdg-card-premium">
          <div class="sdg-stripe" style="background: #a21942;"></div>
          <div class="flex items-center justify-between mb-3">
            <span class="badge" style="background: rgba(162, 25, 66, 0.18); color: #f43f5e;">UNITED NATIONS SDG 8</span>
            ${getIcon('trendingUp', 20)}
          </div>
          <h4 class="text-lg font-bold text-main mb-2">Decent Work & Economic Growth</h4>
          <p class="text-xs text-muted" style="line-height: 1.6;">
            Promotes sustained, inclusive economic growth and higher levels of MSME productivity through technological upgrading and operational efficiency.
          </p>
        </div>

        <div class="sdg-card-premium">
          <div class="sdg-stripe" style="background: #f36e26;"></div>
          <div class="flex items-center justify-between mb-3">
            <span class="badge" style="background: rgba(243, 110, 38, 0.18); color: #fb923c;">UNITED NATIONS SDG 9</span>
            ${getIcon('factory', 20)}
          </div>
          <h4 class="text-lg font-bold text-main mb-2">Industry, Innovation & Infrastructure</h4>
          <p class="text-xs text-muted" style="line-height: 1.6;">
            Fosters resilient MSME industrial infrastructure by encouraging digital adoption, AI-assisted diagnosis, and predictive analytics.
          </p>
        </div>

        <div class="sdg-card-premium">
          <div class="sdg-stripe" style="background: #bf8b2e;"></div>
          <div class="flex items-center justify-between mb-3">
            <span class="badge" style="background: rgba(191, 139, 46, 0.18); color: #facc15;">UNITED NATIONS SDG 12</span>
            ${getIcon('recycle', 20)}
          </div>
          <h4 class="text-lg font-bold text-main mb-2">Responsible Consumption & Production</h4>
          <p class="text-xs text-muted" style="line-height: 1.6;">
            Ensures sustainable manufacturing practices through industrial symbiosis, material byproduct reuse, and reduced energy intensity per unit.
          </p>
        </div>
      </div>
    </section>

    <!-- SECTION 6: FINAL HIGH-IMPACT CTA BANNER -->
    <section class="container" style="padding-bottom: 6rem;">
      <div class="cta-banner">
        <span class="hero-badge mb-3">
          ${getIcon('sparkles', 16)}
          <span>TRANSFORM YOUR MSME TODAY</span>
        </span>
        <h2 class="text-4xl font-bold mb-3" style="letter-spacing: -0.02em;">Ready to Understand & Grow Your Business?</h2>
        <p class="text-muted mb-6" style="max-width: 600px; margin-left: auto; margin-right: auto; font-size: 1.1rem; line-height: 1.6;">
          Join Udyam Sarthi today and experience an AI-powered digital business companion built specifically for small and medium manufacturing enterprises.
        </p>
        <a href="#/register" class="btn btn-primary btn-lg">
          <span>Start with Udyam Sarthi</span>
          ${getIcon('chevronRight', 18)}
        </a>
      </div>
    </section>

    ${renderPublicFooter()}
  `;
};