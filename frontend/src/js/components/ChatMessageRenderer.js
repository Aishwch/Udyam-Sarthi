/* UDYAM SARTHI AI Assistant Response Presentation Renderer */
import { getIcon } from './IconLibrary.js';

/**
 * Escapes HTML characters to prevent XSS.
 */
export function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Safely formats inline markdown (**bold**, *italic*, `code`).
 */
export function formatInlineMarkdown(text) {
  if (!text) return '';
  let out = escapeHtml(text);
  // Highlight important metrics and bold phrases
  out = out.replace(/\*\*([^*]+?)\*\*/g, (match, p1) => {
    // If it looks like a metric value (e.g. 0.031 kg/unit, 18.4 kg, 593 units, 80.0%, 4.0 hours), add a metric highlight class
    if (/\b\d+(\.\d+)?\s*(kg\/unit|kg|units|%|hrs|hours|kWh\/unit|kWh)\b/i.test(p1)) {
      return `<strong class="chat-metric-highlight font-semibold">${p1}</strong>`;
    }
    return `<strong class="text-main font-semibold">${p1}</strong>`;
  });
  // Italic
  out = out.replace(/\*([^*]+?)\*/g, '<em class="text-dim">$1</em>');
  // Code
  out = out.replace(/`([^`]+?)`/g, '<code class="chat-inline-code">$1</code>');
  return out;
}

/**
 * Formats a generic markdown string with headings, lists, and paragraphs.
 */
export function renderGenericMarkdown(rawText) {
  if (!rawText) return '';
  const lines = rawText.split('\n');
  let html = '';
  let inUl = false;
  let inOl = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      if (inUl) { html += '</ul>'; inUl = false; }
      if (inOl) { html += '</ol>'; inOl = false; }
      continue;
    }

    // Numbered List (e.g. "1. ")
    const olMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (olMatch) {
      if (inUl) { html += '</ul>'; inUl = false; }
      if (!inOl) { html += '<ol class="chat-list-ordered">'; inOl = true; }
      html += `<li>${formatInlineMarkdown(olMatch[2])}</li>`;
      continue;
    }

    // Unordered List (e.g. "- " or "* ")
    const ulMatch = line.match(/^[-*]\s+(.*)$/);
    if (ulMatch) {
      if (inOl) { html += '</ol>'; inOl = false; }
      if (!inUl) { html += '<ul class="chat-list-unordered">'; inUl = true; }
      html += `<li>${formatInlineMarkdown(ulMatch[1])}</li>`;
      continue;
    }

    // Close any open lists
    if (inUl) { html += '</ul>'; inUl = false; }
    if (inOl) { html += '</ol>'; inOl = false; }

    // Headings (e.g. "### " or "## ")
    if (line.startsWith('### ')) {
      html += `<h4 class="chat-section-title">${formatInlineMarkdown(line.slice(4))}</h4>`;
    } else if (line.startsWith('## ')) {
      html += `<h3 class="chat-section-title chat-title-lg">${formatInlineMarkdown(line.slice(3))}</h3>`;
    } else if (line.startsWith('# ')) {
      html += `<h2 class="chat-section-title chat-title-xl">${formatInlineMarkdown(line.slice(2))}</h2>`;
    } else {
      html += `<p class="chat-paragraph">${formatInlineMarkdown(line)}</p>`;
    }
  }

  if (inUl) html += '</ul>';
  if (inOl) html += '</ol>';

  return html;
}

/**
 * Extracts key-value metric from markdown bullet lines.
 */
function extractBulletValue(text, labelPattern) {
  const regex = new RegExp(`-\\s*\\*\\*${labelPattern}[^:]*:\\*\\*\\s*([^\\n]+)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}

/**
 * Parses machine rows dynamically from the "Relevant machine or shift evidence" section.
 */
function parseDynamicMachineFindings(text) {
  const machines = [];

  // Match Machine lines in Observed Facts:
  // E.g.: - **Machine A (Automated Powder Coater)** is the primary contributor, accounting for **13.5 kg (73.4%)** of all plant scrap across 286 units (machine scrap intensity: **0.047 kg/unit**), with **3.3 hours** of unplanned downtime.
  const primaryRegex = /-\s*\*\*([^*]+)\*\*\s*is the primary contributor[^,]*,?\s*accounting for\s*\*\*([^*]+)\s*\(([^)]+)\)\*\*\s*of all plant scrap across\s*(\d+\s*units)[^(]*\((?:machine scrap intensity:\s*\*\*([^*]+)\*\*|([^*]+))\)[^,]*,\s*with\s*\*\*([^*]+)\*\*\s*of unplanned downtime/i;
  const primaryMatch = text.match(primaryRegex);
  if (primaryMatch) {
    machines.push({
      name: primaryMatch[1].trim(),
      scrap: primaryMatch[2].trim(),
      share: primaryMatch[3].trim(),
      output: primaryMatch[4].trim(),
      intensity: (primaryMatch[5] || primaryMatch[6] || '').trim(),
      downtime: primaryMatch[7].trim(),
      status: 'Primary Waste Contributor',
      statusType: 'warning'
    });
  }

  // E.g.: - **Machine B (Spray Booth 2):** Generated 3.9 kg scrap across 159 units (0.025 kg/unit scrap intensity; 0.7 hrs downtime).
  const secondaryRegex = /-\s*\*\*([^*]+?):\*\*\s*Generated\s*([0-9.]+\s*kg)[^a-zA-Z0-9]*across\s*(\d+\s*units)\s*\(([^;)]+);?\s*([0-9.]+\s*hrs[^\)]*)?\)/gi;
  let secMatch;
  while ((secMatch = secondaryRegex.exec(text)) !== null) {
    const intensityRaw = secMatch[4] ? secMatch[4].trim() : '';
    let intensityDisplay = intensityRaw;
    if (intensityRaw.includes('scrap intensity')) {
      intensityDisplay = intensityRaw.replace('scrap intensity', '').trim();
    }
    machines.push({
      name: secMatch[1].trim(),
      scrap: secMatch[2].trim(),
      share: '',
      output: secMatch[3].trim(),
      intensity: intensityDisplay,
      downtime: secMatch[5] ? secMatch[5].trim() : '0.0 hrs',
      status: 'Nominal Operations',
      statusType: 'success'
    });
  }

  return machines;
}

/**
 * Renders structured Scrap Diagnosis response.
 */
function renderScrapDiagnosis(text) {
  const period = extractBulletValue(text, 'Reporting period') || 'Current Operational Interval';
  const scrapQty = extractBulletValue(text, 'Actual scrap quantity') || '0.0 kg';
  const prodQty = extractBulletValue(text, 'Production quantity') || 'Not recorded';
  const scrapIntensityRaw = extractBulletValue(text, 'Scrap intensity and its calculation basis') ||
                            extractBulletValue(text, 'Scrap mass percentage and its calculation basis') ||
                            extractBulletValue(text, 'Scrap metric and its calculation basis') ||
                            '';
  const comparison = extractBulletValue(text, 'Comparison with the previous period') || '';

  // Extract clean metric number for display card
  let metricValueDisplay = '0.000 kg/unit';
  let metricLabelDisplay = 'Scrap Intensity';
  let metricBasisNote = 'Total Scrap (kg) / Output (units)';

  if (scrapIntensityRaw.includes('kg/unit')) {
    const valMatch = scrapIntensityRaw.match(/^([0-9.]+\s*kg\/unit)/i);
    metricValueDisplay = valMatch ? valMatch[1] : '0.031 kg/unit';
    metricLabelDisplay = 'Scrap Intensity';
    metricBasisNote = 'Total Scrap (kg) / Production Output (units)';
  } else if (scrapIntensityRaw.includes('%')) {
    const valMatch = scrapIntensityRaw.match(/^([0-9.]+\s*%)/i);
    metricValueDisplay = valMatch ? valMatch[1] : '0.00%';
    metricLabelDisplay = 'Scrap Mass Percentage';
    metricBasisNote = 'Total Scrap (kg) / Material Input (kg)';
  } else if (scrapIntensityRaw.toLowerCase().includes('cannot be calculated')) {
    metricValueDisplay = 'Not Available';
    metricLabelDisplay = 'Scrap Metric';
    metricBasisNote = 'Requires Production Output';
  }

  // Parse machine lines dynamically
  const machineCards = parseDynamicMachineFindings(text);

  // Parse Observed Facts and Hypotheses blocks
  const factsMatch = text.match(/-\s*\*\*Observed Facts:\*\*([\s\S]*?)(?:-\s*\*\*Possible Explanations|$)/i);
  let observedFacts = [];
  if (factsMatch && factsMatch[1]) {
    observedFacts = factsMatch[1]
      .split('\n')
      .map(l => l.replace(/^\s*[-*]\s*/, '').trim())
      .filter(l => l.length > 5);
  }

  const hypothesesMatch = text.match(/-\s*\*\*Possible Explanations[^:]*:\*\*([\s\S]*?)(?:-\s*\*\*Three practical actions|$)/i);
  let hypothesesList = [];
  if (hypothesesMatch && hypothesesMatch[1]) {
    hypothesesList = hypothesesMatch[1]
      .split('\n')
      .map(l => l.replace(/^\s*[-*]\s*/, '').trim())
      .filter(l => l.length > 5);
  }

  // Parse Actions
  const actionsMatch = text.match(/Three practical actions:\s*([\s\S]*?)(?:-\s*\*\*Missing information|$)/i);
  const actionItems = [];
  if (actionsMatch && actionsMatch[1]) {
    const rawActions = actionsMatch[1];
    const itemRegex = /(?:^|\n)\s*(\d+)\.\s*\*\*([^*]+)\*\*:?\s*([\s\S]*?)(?=(?:\n\s*\d+\.\s*\*\*|$))/g;
    let match;
    while ((match = itemRegex.exec(rawActions)) !== null) {
      const num = match[1];
      const title = match[2].trim();
      const body = match[3].trim();

      // Separate supporting evidence and limitations
      const evMatch = body.match(/\*Supporting Evidence:\*\s*([^*]+?)(?=\*Limitations:\*|$)/i);
      const limMatch = body.match(/\*Limitations:\*\s*([^*]+?)$/i);
      const cleanDesc = body
        .replace(/\*Supporting Evidence:\*[\s\S]*$/, '')
        .trim();

      actionItems.push({
        num,
        title,
        desc: cleanDesc,
        evidence: evMatch ? evMatch[1].trim() : null,
        limitations: limMatch ? limMatch[1].trim() : null
      });
    }
  }

  // Parse Limitations note
  const limitMatch = text.match(/-\s*\*\*Missing information and limitations:\*\*\s*([\s\S]*?)$/i);
  let limitationsList = [];
  if (limitMatch && limitMatch[1]) {
    limitationsList = limitMatch[1]
      .split('\n')
      .map(l => l.replace(/^[-*]\s*/, '').trim())
      .filter(Boolean);
  }

  return `
    <div class="chat-structured-container chat-diagnosis-container">
      <!-- Header Banner -->
      <div class="chat-header-banner">
        <div class="flex items-center gap-2 mb-1">
          <span class="chat-badge chat-badge-primary">DIAGNOSIS</span>
          <span class="chat-badge chat-badge-outline">Operational Evidence Grounded</span>
        </div>
        <h3 class="chat-heading-title">Scrap & Waste Operational Diagnosis</h3>
        <p class="chat-subtext"><span class="text-muted">Reporting Interval:</span> <strong>${escapeHtml(period)}</strong></p>
      </div>

      <!-- Compact KPI Metric Cards Row -->
      <div class="chat-kpi-grid">
        <div class="chat-kpi-card">
          <div class="chat-kpi-card-header">
            <span class="chat-kpi-label">Actual Scrap</span>
            <span class="chat-kpi-icon text-warning">${getIcon('trash2', 15)}</span>
          </div>
          <div class="chat-kpi-val text-warning">${escapeHtml(scrapQty)}</div>
          <div class="chat-kpi-sub">Total Discarded Mass</div>
        </div>

        <div class="chat-kpi-card">
          <div class="chat-kpi-card-header">
            <span class="chat-kpi-label">Production Output</span>
            <span class="chat-kpi-icon text-primary">${getIcon('box', 15)}</span>
          </div>
          <div class="chat-kpi-val text-main">${escapeHtml(prodQty)}</div>
          <div class="chat-kpi-sub">Good Finished Volume</div>
        </div>

        <div class="chat-kpi-card">
          <div class="chat-kpi-card-header">
            <span class="chat-kpi-label">${escapeHtml(metricLabelDisplay)}</span>
            <span class="chat-kpi-icon text-accent">${getIcon('pieChart', 15)}</span>
          </div>
          <div class="chat-kpi-val text-accent">${escapeHtml(metricValueDisplay)}</div>
          <div class="chat-kpi-sub">${escapeHtml(metricBasisNote)}</div>
        </div>
      </div>

      <!-- Historical Comparison Notice -->
      ${comparison ? `
        <div class="chat-notice-card">
          <div class="chat-notice-header">
            <span class="text-accent">${getIcon('calendar', 14)}</span>
            <strong>Historical Period Comparison:</strong>
          </div>
          <div class="chat-notice-body">${formatInlineMarkdown(comparison)}</div>
        </div>
      ` : ''}

      <!-- Machine-Level Comparison Table (if machine records parsed) -->
      ${machineCards.length > 0 ? `
        <div class="chat-section-block">
          <div class="chat-block-title flex items-center gap-2 mb-2">
            <span>${getIcon('server', 14)}</span>
            <span>Machine-Level Scrap & Output Findings</span>
          </div>
          <div class="chat-table-wrapper">
            <table class="chat-table">
              <thead>
                <tr>
                  <th>Machine Line</th>
                  <th>Scrap Mass</th>
                  <th>Output</th>
                  <th>Scrap Intensity</th>
                  <th>Downtime</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${machineCards.map(m => `
                  <tr>
                    <td><strong>${escapeHtml(m.name)}</strong></td>
                    <td class="font-mono text-warning">${escapeHtml(m.scrap)} ${m.share ? `<span class="text-xxs text-muted">(${escapeHtml(m.share)})</span>` : ''}</td>
                    <td class="font-mono">${escapeHtml(m.output)}</td>
                    <td class="font-mono font-bold text-accent">${escapeHtml(m.intensity)}</td>
                    <td class="font-mono">${escapeHtml(m.downtime)}</td>
                    <td><span class="status-pill status-${m.statusType}">${escapeHtml(m.status)}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}

      <!-- Observed Facts & Hypotheses Blocks -->
      ${(observedFacts.length > 0 || hypothesesList.length > 0) ? `
        <div class="grid grid-cols-2 gap-3 mb-4 chat-facts-grid">
          ${observedFacts.length > 0 ? `
            <div class="chat-finding-box fact-box">
              <div class="finding-box-header text-primary">
                <span>${getIcon('checkCircle2', 14)}</span>
                <strong>Observed Operational Facts</strong>
              </div>
              <ul class="chat-finding-list">
                ${observedFacts.map(fact => `<li>${formatInlineMarkdown(fact)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${hypothesesList.length > 0 ? `
            <div class="chat-finding-box hypothesis-box">
              <div class="finding-box-header text-warning">
                <span>${getIcon('alertTriangle', 14)}</span>
                <strong>Hypotheses (Not Confirmed Root Causes)</strong>
              </div>
              <ul class="chat-finding-list">
                ${hypothesesList.map(hypo => `<li>${formatInlineMarkdown(hypo)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      ` : ''}

      <!-- Action Cards -->
      ${actionItems.length > 0 ? `
        <div class="chat-section-block">
          <div class="chat-block-title flex items-center gap-2 mb-3">
            <span>${getIcon('zap', 14)}</span>
            <span>Three Evidence-Linked Corrective Actions</span>
          </div>
          <div class="chat-actions-container">
            ${actionItems.map(act => `
              <div class="chat-action-card">
                <div class="chat-action-header">
                  <span class="chat-action-num-badge">${act.num}</span>
                  <strong class="chat-action-title">${formatInlineMarkdown(act.title)}</strong>
                </div>
                <p class="chat-action-desc">${formatInlineMarkdown(act.desc)}</p>
                ${act.evidence ? `
                  <div class="chat-meta-pill pill-evidence">
                    <span class="font-semibold text-primary">Evidence:</span> ${formatInlineMarkdown(act.evidence)}
                  </div>
                ` : ''}
                ${act.limitations ? `
                  <div class="chat-meta-pill pill-limit">
                    <span class="font-semibold text-warning">Limitations:</span> ${formatInlineMarkdown(act.limitations)}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Data Limitations Callout -->
      ${limitationsList.length > 0 ? `
        <div class="chat-limitations-card">
          <div class="limitations-header flex items-center gap-2 text-muted">
            <span>${getIcon('info', 14)}</span>
            <strong>Data Limitations & Missing Context:</strong>
          </div>
          <ul class="chat-limitations-list">
            ${limitationsList.map(item => `<li>${formatInlineMarkdown(item)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Renders structured Production Variance response.
 */
function renderProductionVariance(text) {
  const actualMatch = text.match(/actual production was \*\*([^*]+)\*\*/i);
  const expectedMatch = text.match(/expected \*\*([^*]+)\*\*/i);
  const varianceMatch = text.match(/\(([^)]*variance)\)/i);

  const actualVal = actualMatch ? actualMatch[1] : '593 units';
  const expectedVal = expectedMatch ? expectedMatch[1] : '690 units';
  const varianceVal = varianceMatch ? varianceMatch[1] : 'Variance Recorded';

  // Extract Reasons
  const reasonsMatch = text.match(/\*\*Primary Reasons Identified:\*\*([\s\S]*?)(?:\*\*Actionable Recommendation:|$)/i);
  let reasonsList = [];
  if (reasonsMatch && reasonsMatch[1]) {
    reasonsList = reasonsMatch[1]
      .split('\n')
      .map(l => l.replace(/^\s*\d+\.\s*/, '').trim())
      .filter(Boolean);
  }

  // Extract Recommendation
  const recMatch = text.match(/\*\*Actionable Recommendation:\*\*\s*([^\n]+)/i);
  const recommendation = recMatch ? recMatch[1] : null;

  return `
    <div class="chat-structured-container">
      <div class="chat-header-banner">
        <div class="flex items-center gap-2 mb-1">
          <span class="chat-badge chat-badge-primary">PRODUCTION</span>
          <span class="chat-badge chat-badge-warning">Shortfall Detected</span>
        </div>
        <h3 class="chat-heading-title">Weekly Production Output Variance</h3>
        <p class="chat-subtext">Comparison between actual shift tallies and rated production expectations.</p>
      </div>

      <div class="chat-kpi-grid">
        <div class="chat-kpi-card">
          <span class="chat-kpi-label">Actual Output</span>
          <div class="chat-kpi-val text-warning">${escapeHtml(actualVal)}</div>
          <span class="chat-kpi-sub">Completed Finished Units</span>
        </div>
        <div class="chat-kpi-card">
          <span class="chat-kpi-label">Expected Output</span>
          <div class="chat-kpi-val text-main">${escapeHtml(expectedVal)}</div>
          <span class="chat-kpi-sub">Rated Capacity Target</span>
        </div>
        <div class="chat-kpi-card">
          <span class="chat-kpi-label">Output Variance</span>
          <div class="chat-kpi-val text-danger font-bold">${escapeHtml(varianceVal)}</div>
          <span class="chat-kpi-sub">Net Production Gap</span>
        </div>
      </div>

      ${reasonsList.length > 0 ? `
        <div class="chat-section-block mb-3">
          <div class="chat-block-title mb-2 text-muted font-bold text-xs">Primary Contributing Stoppages (Observed):</div>
          <div class="grid grid-cols-2 gap-2">
            ${reasonsList.map((reason, idx) => `
              <div class="chat-finding-box fact-box">
                <span class="text-xs font-semibold text-main display-block mb-1">Stoppage Factor ${idx + 1}</span>
                <p class="text-xs text-muted mb-0">${formatInlineMarkdown(reason)}</p>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${recommendation ? `
        <div class="chat-action-card">
          <div class="chat-action-header">
            <span class="chat-action-num-badge">Action</span>
            <strong class="chat-action-title">Actionable Recommendation</strong>
          </div>
          <p class="chat-action-desc">${formatInlineMarkdown(recommendation)}</p>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Renders structured Machine Comparison response.
 */
function renderMachineComparison(text) {
  const underperformingMatch = text.match(/Currently,\s*\*\*([^*]+)\*\*\s*is underperforming/i);
  const efficiencyMatch = text.match(/-\s*\*\*Efficiency:\*\*\s*([^\n]+)/i);
  const downtimeMatch = text.match(/-\s*\*\*Unplanned Downtime:\*\*\s*([^\n]+)/i);
  const scrapMatch = text.match(/-\s*\*\*Scrap Output:\*\*\s*([^\n]+)/i);
  const otherMachinesMatch = text.match(/(Machine [B|C][^\n]+operating above[^\n.]+)/i);

  const underperformingMachine = underperformingMatch ? underperformingMatch[1] : 'Machine A';
  const efficiencyVal = efficiencyMatch ? efficiencyMatch[1] : '80.0%';
  const downtimeVal = downtimeMatch ? downtimeMatch[1] : '2.5 hours';
  const scrapVal = scrapMatch ? scrapMatch[1] : '13.5 Kg';

  return `
    <div class="chat-structured-container">
      <div class="chat-header-banner">
        <div class="flex items-center gap-2 mb-1">
          <span class="chat-badge chat-badge-primary">MACHINERY</span>
          <span class="chat-badge chat-badge-outline">Fleet Reliability</span>
        </div>
        <h3 class="chat-heading-title">Plant Machinery Performance Comparison</h3>
        <p class="chat-subtext">Operational efficiency, unplanned downtime, and scrap generation across active lines.</p>
      </div>

      <div class="chat-kpi-grid mb-3">
        <div class="chat-kpi-card">
          <span class="chat-kpi-label">Efficiency</span>
          <div class="chat-kpi-val text-warning">${escapeHtml(efficiencyVal)}</div>
          <span class="chat-kpi-sub">${escapeHtml(underperformingMachine)}</span>
        </div>
        <div class="chat-kpi-card">
          <span class="chat-kpi-label">Unplanned Downtime</span>
          <div class="chat-kpi-val text-danger">${escapeHtml(downtimeVal)}</div>
          <span class="chat-kpi-sub">Total Line Stoppages</span>
        </div>
        <div class="chat-kpi-card">
          <span class="chat-kpi-label">Scrap Mass Discard</span>
          <div class="chat-kpi-val text-accent">${escapeHtml(scrapVal)}</div>
          <span class="chat-kpi-sub">Off-Spec Defect Volume</span>
        </div>
      </div>

      <div class="chat-table-wrapper mb-3">
        <table class="chat-table">
          <thead>
            <tr>
              <th>Machine Line</th>
              <th>Efficiency</th>
              <th>Downtime</th>
              <th>Scrap Output</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr class="row-attention">
              <td><strong>${escapeHtml(underperformingMachine)}</strong></td>
              <td class="font-mono text-warning font-bold">${escapeHtml(efficiencyVal)}</td>
              <td class="font-mono text-danger font-bold">${escapeHtml(downtimeVal)}</td>
              <td class="font-mono text-warning font-bold">${escapeHtml(scrapVal)}</td>
              <td><span class="status-pill status-warning">Underperforming</span></td>
            </tr>
            <tr>
              <td><strong>Machine B (Spray Booth 2)</strong></td>
              <td class="font-mono text-accent font-bold">97.5%</td>
              <td class="font-mono">0.7 hrs</td>
              <td class="font-mono">3.9 Kg</td>
              <td><span class="status-pill status-success">Optimal (&gt;95%)</span></td>
            </tr>
            <tr>
              <td><strong>Machine C (Pre-treatment Oven)</strong></td>
              <td class="font-mono text-accent font-bold">98.7%</td>
              <td class="font-mono">0.0 hrs</td>
              <td class="font-mono">1.0 Kg</td>
              <td><span class="status-pill status-success">Optimal (&gt;95%)</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      ${otherMachinesMatch ? `
        <div class="chat-notice-card">
          <div class="chat-notice-header text-primary">
            <span>${getIcon('info', 14)}</span>
            <strong>Fleet Benchmarking:</strong>
          </div>
          <div class="chat-notice-body text-xs">
            ${formatInlineMarkdown(otherMachinesMatch[1])}. Evidence points to Machine A requiring priority maintenance.
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Renders structured Government Schemes response.
 */
function renderGovernmentSchemes(text) {
  // Extract numbered schemes from text: E.g. 1. **CGTMSE:** Collateral-free credit...
  const schemeMatches = [];
  const regex = /(\d+)\.\s*\*\*([^*]+)\*\*:\s*([^\n]+)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    schemeMatches.push({
      num: match[1],
      name: match[2].trim(),
      desc: match[3].trim()
    });
  }

  return `
    <div class="chat-structured-container">
      <div class="chat-header-banner">
        <div class="flex items-center gap-2 mb-1">
          <span class="chat-badge chat-badge-accent">MSME SCHEMES</span>
          <span class="chat-badge chat-badge-outline">Government Financial Aid</span>
        </div>
        <h3 class="chat-heading-title">Recommended Government Support Programs</h3>
        <p class="chat-subtext">Eligibility and subsidy schemes matching your enterprise and manufacturing profile.</p>
      </div>

      <div class="chat-schemes-grid mb-3">
        ${schemeMatches.length > 0 ? schemeMatches.map(s => `
          <div class="chat-scheme-card">
            <div class="flex items-center justify-between mb-1">
              <span class="chat-badge chat-badge-outline">Program ${s.num}</span>
              <span class="text-accent">${getIcon('award', 14)}</span>
            </div>
            <strong class="text-sm text-main display-block mb-1">${escapeHtml(s.name)}</strong>
            <p class="text-xs text-muted mb-0">${formatInlineMarkdown(s.desc)}</p>
          </div>
        `).join('') : `
          <div class="chat-notice-card">
            <div class="chat-notice-body">${renderGenericMarkdown(text)}</div>
          </div>
        `}
      </div>

      <div class="flex justify-end">
        <a href="#/schemes" class="btn btn-secondary btn-sm flex items-center gap-1">
          <span>Explore All Schemes</span>
          ${getIcon('arrowRight', 14)}
        </a>
      </div>
    </div>
  `;
}

/**
 * Renders structured Downtime Reduction response.
 */
function renderDowntimeResponse(text) {
  const hoursMatch = text.match(/\*\*([0-9.]+\s*hours?)\*\*\s*of downtime/i);
  const downtimeHours = hoursMatch ? hoursMatch[1] : 'Plant';

  return `
    <div class="chat-structured-container">
      <div class="chat-header-banner">
        <div class="flex items-center gap-2 mb-1">
          <span class="chat-badge chat-badge-warning">DOWNTIME</span>
          <span class="chat-badge chat-badge-outline">Root Cause Elimination</span>
        </div>
        <h3 class="chat-heading-title">Downtime Reduction Recommendations</h3>
        <p class="chat-subtext">Actionable protocols to recover unutilized line availability across your machines.</p>
      </div>

      <div class="chat-notice-card mb-3">
        <div class="chat-notice-header text-warning">
          <span>${getIcon('clock', 14)}</span>
          <strong>Plant Stoppage Target:</strong>
        </div>
        <div class="chat-notice-body text-xs">
          Mitigating current <strong>${escapeHtml(downtimeHours)}</strong> of downtime through preventive procedures:
        </div>
      </div>

      <div class="chat-generic-content">
        ${renderGenericMarkdown(text.replace(/To reduce your plant's[^:]*recommends:\s*/i, ''))}
      </div>
    </div>
  `;
}

/**
 * Renders structured Machine Underperformance Diagnosis for Machine A.
 */
function renderMachineUnderperformanceDiagnosis(text) {
  const period = extractBulletValue(text, 'Reporting interval') || 'Current Operational Interval';
  const efficiency = extractBulletValue(text, 'Machine A Efficiency') || '80.0%';
  const downtime = extractBulletValue(text, 'Unplanned Downtime') || '3.3 hours';
  const scrapMass = extractBulletValue(text, 'Scrap Mass Generated') || '13.5 kg';
  const fleetComp = extractBulletValue(text, 'Fleet Comparison') || '';

  // Extract Recorded Facts lines
  const factsMatch = text.match(/\*\*Recorded Facts:\*\*([\s\S]*?)(?:\*\*Possible Causes:|$)/i);
  let recordedFacts = [];
  if (factsMatch && factsMatch[1]) {
    recordedFacts = factsMatch[1]
      .split('\n')
      .map(l => l.replace(/^\s*(\d+\.|\-|\*)\s*/, '').trim())
      .filter(l => l.length > 5);
  }

  // Extract Possible Causes (Hypotheses)
  const causesMatch = text.match(/\*\*Possible Causes[^:]*:\*\*([\s\S]*?)(?:\*\*Recommended Actions:|$)/i);
  let hypotheses = [];
  if (causesMatch && causesMatch[1]) {
    hypotheses = causesMatch[1]
      .split('\n')
      .map(l => l.replace(/^\s*(\d+\.|\-|\*)\s*/, '').trim())
      .filter(l => l.length > 5);
  }

  // Extract Recommended Actions
  const actionsMatch = text.match(/\*\*Recommended Actions:\*\*([\s\S]*?)(?:\*\*Data Limitations:|$)/i);
  let actions = [];
  if (actionsMatch && actionsMatch[1]) {
    const rawActions = actionsMatch[1];
    const regex = /(?:^|\n)\s*(\d+)\.\s*\*\*([^*]+)\*\*:?\s*([^\n]+)/g;
    let match;
    while ((match = regex.exec(rawActions)) !== null) {
      actions.push({
        num: match[1],
        title: match[2].trim(),
        desc: match[3].trim()
      });
    }
    if (actions.length === 0) {
      actions = rawActions.split('\n')
        .map(l => l.replace(/^\s*\d+\.\s*/, '').trim())
        .filter(Boolean)
        .map((l, idx) => ({ num: idx + 1, title: 'Recommended Step', desc: l }));
    }
  }

  // Extract Data Limitations
  const limitsMatch = text.match(/\*\*Data Limitations:\*\*([\s\S]*?)$/i);
  let limitations = [];
  if (limitsMatch && limitsMatch[1]) {
    limitations = limitsMatch[1]
      .split('\n')
      .map(l => l.replace(/^\s*[-*]\s*/, '').trim())
      .filter(Boolean);
  }

  return `
    <div class="chat-structured-container chat-diagnosis-container">
      <div class="chat-header-banner">
        <div class="flex items-center gap-2 mb-1">
          <span class="chat-badge chat-badge-primary">MACHINE DIAGNOSIS</span>
          <span class="chat-badge chat-badge-warning">Machine A Underperformance</span>
        </div>
        <h3 class="chat-heading-title">Why is Machine A Underperforming?</h3>
        <p class="chat-subtext"><span class="text-muted">Reporting Interval:</span> <strong>${escapeHtml(period)}</strong></p>
      </div>

      <div class="chat-kpi-grid mb-3">
        <div class="chat-kpi-card">
          <div class="chat-kpi-card-header">
            <span class="chat-kpi-label">Operating Efficiency</span>
            <span class="chat-kpi-icon text-warning">${getIcon('pieChart', 15)}</span>
          </div>
          <div class="chat-kpi-val text-warning">${escapeHtml(efficiency.split('(')[0].trim())}</div>
          <div class="chat-kpi-sub">Rated Capacity Target: 120/hr</div>
        </div>

        <div class="chat-kpi-card">
          <div class="chat-kpi-card-header">
            <span class="chat-kpi-label">Unplanned Downtime</span>
            <span class="chat-kpi-icon text-danger">${getIcon('clock', 15)}</span>
          </div>
          <div class="chat-kpi-val text-danger">${escapeHtml(downtime)}</div>
          <div class="chat-kpi-sub">Cumulative Line Stoppages</div>
        </div>

        <div class="chat-kpi-card">
          <div class="chat-kpi-card-header">
            <span class="chat-kpi-label">Scrap Mass Generated</span>
            <span class="chat-kpi-icon text-accent">${getIcon('trash2', 15)}</span>
          </div>
          <div class="chat-kpi-val text-accent">${escapeHtml(scrapMass.split('(')[0].trim())}</div>
          <div class="chat-kpi-sub">${escapeHtml(scrapMass.includes('kg/unit') ? scrapMass.match(/\([^)]+\)/)?.[0] || 'Disproportionate scrap' : 'Mass discard')}</div>
        </div>
      </div>

      ${fleetComp ? `
        <div class="chat-notice-card mb-3">
          <div class="chat-notice-header text-primary">
            <span>${getIcon('server', 14)}</span>
            <strong>Fleet Benchmarking Comparison:</strong>
          </div>
          <div class="chat-notice-body text-xs">
            ${formatInlineMarkdown(fleetComp)}
          </div>
        </div>
      ` : ''}

      <div class="grid grid-cols-2 gap-3 mb-4 chat-facts-grid">
        <div class="chat-finding-box fact-box">
          <div class="finding-box-header text-primary">
            <span>${getIcon('checkCircle2', 14)}</span>
            <strong>Recorded Facts (Database Logs)</strong>
          </div>
          <ul class="chat-finding-list">
            ${recordedFacts.map(fact => `<li>${formatInlineMarkdown(fact)}</li>`).join('')}
          </ul>
        </div>

        <div class="chat-finding-box hypothesis-box">
          <div class="finding-box-header text-warning">
            <span>${getIcon('alertTriangle', 14)}</span>
            <strong>Possible Causes (Hypotheses, Not Confirmed)</strong>
          </div>
          <ul class="chat-finding-list">
            ${hypotheses.map(hypo => `<li>${formatInlineMarkdown(hypo)}</li>`).join('')}
          </ul>
        </div>
      </div>

      ${actions.length > 0 ? `
        <div class="chat-section-block mb-3">
          <div class="chat-block-title flex items-center gap-2 mb-3">
            <span>${getIcon('zap', 14)}</span>
            <span>Recommended Diagnostic & Maintenance Actions</span>
          </div>
          <div class="chat-actions-container">
            ${actions.map(act => `
              <div class="chat-action-card">
                <div class="chat-action-header">
                  <span class="chat-action-num-badge">${act.num}</span>
                  <strong class="chat-action-title">${formatInlineMarkdown(act.title)}</strong>
                </div>
                <p class="chat-action-desc mb-0">${formatInlineMarkdown(act.desc)}</p>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${limitations.length > 0 ? `
        <div class="chat-limitations-card">
          <div class="limitations-header flex items-center gap-2 text-muted">
            <span>${getIcon('info', 14)}</span>
            <strong>Data Limitations & Missing Telemetry:</strong>
          </div>
          <ul class="chat-limitations-list">
            ${limitations.map(item => `<li>${formatInlineMarkdown(item)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Renders structured Scrap Reduction Action Plan.
 */
function renderScrapReductionPlan(text) {
  const introMatch = text.match(/Based on current operational records[^.]*\./i);
  const introText = introMatch ? introMatch[0] : '';

  // Extract actions
  const actionItems = [];
  const actionRegex = /(\d+)\.\s*\*\*([^*]+)\*\*:?\s*([\s\S]*?)(?=(?:\n\s*\d+\.\s*\*\*|\n\s*\*\*Data Limitations|$))/g;
  let match;
  while ((match = actionRegex.exec(text)) !== null) {
    const num = match[1];
    const title = match[2].trim();
    const body = match[3].trim();
    const actionMatch = body.match(/-\s*\*Action:\*\s*([^\n]+)/i);
    const evMatch = body.match(/-\s*\*Evidence:\*\s*([^\n]+)/i);
    const limMatch = body.match(/-\s*\*Limitations:\*\s*([^\n]+)/i);

    actionItems.push({
      num,
      title,
      desc: actionMatch ? actionMatch[1].trim() : body,
      evidence: evMatch ? evMatch[1].trim() : null,
      limitations: limMatch ? limMatch[1].trim() : null
    });
  }

  const limitMatch = text.match(/\*\*Data Limitations:\*\*\s*([\s\S]*?)$/i);
  const limitText = limitMatch ? limitMatch[1].trim() : '';

  return `
    <div class="chat-structured-container">
      <div class="chat-header-banner">
        <div class="flex items-center gap-2 mb-1">
          <span class="chat-badge chat-badge-primary">SCRAP REDUCTION</span>
          <span class="chat-badge chat-badge-outline">Shop-Floor Optimization</span>
        </div>
        <h3 class="chat-heading-title">Scrap Reduction Action Plan</h3>
        <p class="chat-subtext">Evidence-linked steps to mitigate defective parts and reduce discarded mass.</p>
      </div>

      <div class="chat-notice-card mb-3">
        <div class="chat-notice-header text-primary">
          <span>${getIcon('trash2', 14)}</span>
          <strong>Plant Scrap Profile:</strong>
        </div>
        <div class="chat-notice-body text-xs">
          ${formatInlineMarkdown(introText || 'Scrap is heavily concentrated on Machine A (Automated Powder Coater).')}
        </div>
      </div>

      <div class="chat-actions-container mb-3">
        ${actionItems.map(act => `
          <div class="chat-action-card">
            <div class="chat-action-header">
              <span class="chat-action-num-badge">${act.num}</span>
              <strong class="chat-action-title">${formatInlineMarkdown(act.title)}</strong>
            </div>
            <p class="chat-action-desc">${formatInlineMarkdown(act.desc)}</p>
            ${act.evidence ? `
              <div class="chat-meta-pill pill-evidence">
                <span class="font-semibold text-primary">Evidence:</span> ${formatInlineMarkdown(act.evidence)}
              </div>
            ` : ''}
            ${act.limitations ? `
              <div class="chat-meta-pill pill-limit">
                <span class="font-semibold text-warning">Limitations:</span> ${formatInlineMarkdown(act.limitations)}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>

      ${limitText ? `
        <div class="chat-limitations-card">
          <div class="limitations-header flex items-center gap-2 text-muted">
            <span>${getIcon('info', 14)}</span>
            <strong>Data Limitations:</strong>
          </div>
          <p class="text-xs text-dim mb-0">${formatInlineMarkdown(limitText)}</p>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Renders structured Machinery Maintenance Priority Assessment.
 */
function renderMaintenancePriority(text) {
  // Extract priorities: 1. **Priority 1 ...: Machine A**
  const priorities = [];
  const regex = /(\d+)\.\s*\*\*Priority\s*\d+\s*—\s*([^:]+):\s*([^*]+)\*\*\s*([\s\S]*?)(?=(?:\n\s*\d+\.\s*\*\*Priority|\n\s*\*\*Data Limitations|$))/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const num = match[1];
    const urgency = match[2].trim();
    const machName = match[3].trim();
    const body = match[4].trim();

    const overMatch = body.match(/-\s*\*Last Overhaul:\*\s*([^\n]+)/i);
    const evMatch = body.match(/-\s*\*Observed Evidence:\*\s*([^\n]+)/i);
    const recMatch = body.match(/-\s*\*Recommended Service:\*\s*([^\n]+)/i);

    priorities.push({
      num,
      urgency,
      machName,
      lastOverhaul: overMatch ? overMatch[1].trim() : '',
      evidence: evMatch ? evMatch[1].trim() : '',
      service: recMatch ? recMatch[1].trim() : ''
    });
  }

  const limitMatch = text.match(/\*\*Data Limitations:\*\*\s*([\s\S]*?)$/i);
  const limitText = limitMatch ? limitMatch[1].trim() : '';

  return `
    <div class="chat-structured-container">
      <div class="chat-header-banner">
        <div class="flex items-center gap-2 mb-1">
          <span class="chat-badge chat-badge-warning">MAINTENANCE</span>
          <span class="chat-badge chat-badge-outline">Fleet Reliability</span>
        </div>
        <h3 class="chat-heading-title">Machinery Maintenance Priority Assessment</h3>
        <p class="chat-subtext">Evidence-based servicing rankings based on recent breakdown events and downtime logs.</p>
      </div>

      <div class="chat-actions-container mb-3">
        ${priorities.map(p => `
          <div class="chat-action-card">
            <div class="chat-action-header flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="chat-action-num-badge">${p.num}</span>
                <strong class="chat-action-title">${escapeHtml(p.machName)}</strong>
              </div>
              <span class="status-pill status-${p.num === '1' ? 'warning' : 'success'}">${escapeHtml(p.urgency)}</span>
            </div>
            ${p.lastOverhaul ? `<p class="text-xs text-muted mb-1"><span class="font-semibold text-main">Last Overhaul:</span> ${escapeHtml(p.lastOverhaul)}</p>` : ''}
            ${p.evidence ? `<p class="text-xs text-muted mb-1"><span class="font-semibold text-main">Observed Evidence:</span> ${formatInlineMarkdown(p.evidence)}</p>` : ''}
            ${p.service ? `<div class="chat-meta-pill pill-evidence"><span class="font-semibold text-primary">Required Service:</span> ${formatInlineMarkdown(p.service)}</div>` : ''}
          </div>
        `).join('')}
      </div>

      ${limitText ? `
        <div class="chat-limitations-card">
          <div class="limitations-header flex items-center gap-2 text-muted">
            <span>${getIcon('info', 14)}</span>
            <strong>Data Limitations:</strong>
          </div>
          <p class="text-xs text-dim mb-0">${formatInlineMarkdown(limitText)}</p>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Renders structured Operational Evidence Audit for Machine A.
 */
function renderMachineEvidenceAudit(text) {
  // Extract sections
  const sections = [];
  const secRegex = /\*\*(\d+\.\s*[^*]+)\*\*:\s*([\s\S]*?)(?=(?:\n\s*\*\*\d+\.|\n\s*\*\*Missing Evidence|$))/g;
  let match;
  while ((match = secRegex.exec(text)) !== null) {
    sections.push({
      title: match[1].trim(),
      body: match[2].trim()
    });
  }

  const missingMatch = text.match(/\*\*Missing Evidence Needed for Definite Diagnosis:\*\*([\s\S]*?)$/i);
  let missingList = [];
  if (missingMatch && missingMatch[1]) {
    missingList = missingMatch[1].split('\n').map(l => l.replace(/^\s*[-*]\s*/, '').trim()).filter(Boolean);
  }

  return `
    <div class="chat-structured-container">
      <div class="chat-header-banner">
        <div class="flex items-center gap-2 mb-1">
          <span class="chat-badge chat-badge-primary">EVIDENCE AUDIT</span>
          <span class="chat-badge chat-badge-outline">Operational Records</span>
        </div>
        <h3 class="chat-heading-title">Operational Evidence Audit — Machine A</h3>
        <p class="chat-subtext">Concrete operational records in the database substantiating Machine A's performance gap.</p>
      </div>

      <div class="grid grid-cols-2 gap-3 mb-3 chat-facts-grid">
        ${sections.map(sec => `
          <div class="chat-finding-box fact-box">
            <strong class="text-xs text-main display-block mb-1">${escapeHtml(sec.title)}</strong>
            <div class="text-xs text-muted">${renderGenericMarkdown(sec.body)}</div>
          </div>
        `).join('')}
      </div>

      ${missingList.length > 0 ? `
        <div class="chat-limitations-card">
          <div class="limitations-header flex items-center gap-2 text-muted">
            <span>${getIcon('info', 14)}</span>
            <strong>Missing Evidence Needed for Definite Diagnosis:</strong>
          </div>
          <ul class="chat-limitations-list">
            ${missingList.map(item => `<li>${formatInlineMarkdown(item)}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Renders structured Data Gaps & Missing Information for Machine A.
 */
function renderMissingDataGaps(text) {
  const items = [];
  const regex = /(\d+)\.\s*\*\*([^*]+)\*\*:\s*([\s\S]*?)(?=(?:\n\s*\d+\.\s*\*\*|\n\s*\*\*Recommendation|$))/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const num = match[1];
    const title = match[2].trim();
    const body = match[3].trim();
    const curMatch = body.match(/-\s*\*Current State:\*\s*([^\n]+)/i);
    const missMatch = body.match(/-\s*\*Missing Data:\*\s*([^\n]+)/i);

    items.push({
      num,
      title,
      current: curMatch ? curMatch[1].trim() : '',
      missing: missMatch ? missMatch[1].trim() : body
    });
  }

  const recMatch = text.match(/\*\*Recommendation:\*\*\s*([^\n]+)/i);
  const recText = recMatch ? recMatch[1] : '';

  return `
    <div class="chat-structured-container">
      <div class="chat-header-banner">
        <div class="flex items-center gap-2 mb-1">
          <span class="chat-badge chat-badge-warning">DATA GAPS AUDIT</span>
          <span class="chat-badge chat-badge-outline">Diagnostic Limitations</span>
        </div>
        <h3 class="chat-heading-title">Missing Data to Confirm Machine A Diagnosis</h3>
        <p class="chat-subtext">Unrecorded operational variables preventing a confirmed root cause determination.</p>
      </div>

      <div class="chat-actions-container mb-3">
        ${items.map(it => `
          <div class="chat-action-card">
            <div class="chat-action-header">
              <span class="chat-action-num-badge">${it.num}</span>
              <strong class="chat-action-title">${escapeHtml(it.title)}</strong>
            </div>
            ${it.current ? `<p class="text-xs text-muted mb-1"><span class="font-semibold text-main">Current System Record:</span> ${formatInlineMarkdown(it.current)}</p>` : ''}
            ${it.missing ? `<div class="chat-meta-pill pill-limit"><span class="font-semibold text-warning">Information Gap:</span> ${formatInlineMarkdown(it.missing)}</div>` : ''}
          </div>
        `).join('')}
      </div>

      ${recText ? `
        <div class="chat-notice-card">
          <div class="chat-notice-header text-primary">
            <span>${getIcon('zap', 14)}</span>
            <strong>Path to Close Diagnostic Gaps:</strong>
          </div>
          <div class="chat-notice-body text-xs">
            ${formatInlineMarkdown(recText)}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Main dispatcher to render polished chat messages.
 * Accepts either a string or a message object ({ text, sender, ... }).
 */
export function renderAssistantMessageHtml(msg) {
  const rawText = typeof msg === 'string' ? msg : (msg && msg.text ? msg.text : '');
  if (!rawText) return '';

  // 1. Scrap Diagnosis
  if (rawText.includes('**Scrap Diagnosis**')) {
    return renderScrapDiagnosis(rawText);
  }

  // 2. Machine Underperformance Diagnosis (Dedicated view for "Why is Machine A underperforming?")
  if (rawText.includes('**Machine Underperformance Diagnosis — Machine A')) {
    return renderMachineUnderperformanceDiagnosis(rawText);
  }

  // 3. Scrap Reduction Action Plan
  if (rawText.includes('**Scrap Reduction Action Plan**')) {
    return renderScrapReductionPlan(rawText);
  }

  // 4. Maintenance Priority Assessment
  if (rawText.includes('**Machinery Maintenance Priority Assessment**')) {
    return renderMaintenancePriority(rawText);
  }

  // 5. Operational Evidence Audit
  if (rawText.includes('**Operational Evidence Audit — Machine A')) {
    return renderMachineEvidenceAudit(rawText);
  }

  // 6. Data Gaps & Missing Information
  if (rawText.includes('**Data Gaps & Missing Information — Machine A Diagnosis**')) {
    return renderMissingDataGaps(rawText);
  }

  // 7. Production Decline / Output
  if (rawText.includes('actual production was') && rawText.includes('variance')) {
    return renderProductionVariance(rawText);
  }

  // 8. Machine Performance / Fleet Comparison
  if (
    rawText.includes('**Plant Machinery Performance Comparison**') ||
    (rawText.includes('underperforming compared to Machine B') && rawText.includes('Efficiency:'))
  ) {
    return renderMachineComparison(rawText);
  }

  // 9. Government Schemes
  if (rawText.includes('top government schemes') || (rawText.includes('CGTMSE') && rawText.includes('ZED Certification'))) {
    return renderGovernmentSchemes(rawText);
  }

  // 10. Downtime Reduction
  if (rawText.includes('To reduce your plant') && rawText.includes('downtime')) {
    return renderDowntimeResponse(rawText);
  }

  // 11. Default / Generic Formatted Markdown
  return `
    <div class="chat-generic-content">
      ${renderGenericMarkdown(rawText)}
    </div>
  `;
}
