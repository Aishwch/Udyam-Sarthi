/* UDYAM SARTHI KPI Metric Card Component */
import { getIcon } from './IconLibrary.js';
import { renderTagBadge } from './TagBadge.js';

export const renderKpiCard = ({
  title,
  value,
  unit = '',
  target = null,
  trend = null, // e.g. { value: "+12%", type: "up" | "down" | "neutral" }
  iconName = 'barChart3',
  provenance = 'Synthetic',
  subtitle = null
}) => {
  let trendClass = 'trend-neutral';
  let trendIcon = '';

  if (trend) {
    if (trend.type === 'up') {
      trendClass = 'trend-up';
      trendIcon = getIcon('trendingUp', 14);
    } else if (trend.type === 'down') {
      trendClass = 'trend-down';
      trendIcon = getIcon('trendingUp', 14); // flipped or styled via CSS
    }
  }

  return `
    <div class="glass-card kpi-card">
      <div class="kpi-header">
        <div class="flex items-center gap-2">
          <div style="color: var(--primary-400);">
            ${getIcon(iconName, 18)}
          </div>
          <span class="kpi-title">${title}</span>
        </div>
        ${renderTagBadge(provenance)}
      </div>

      <div class="kpi-value">
        ${value} <span style="font-size: 1rem; font-weight: 500; color: var(--text-muted);">${unit}</span>
      </div>

      <div class="kpi-sub">
        ${trend ? `<span class="${trendClass} flex items-center gap-1">${trendIcon} ${trend.value}</span>` : ''}
        ${target ? `<span class="text-dim">Target: ${target}</span>` : ''}
        ${subtitle ? `<span class="text-dim">${subtitle}</span>` : ''}
      </div>
    </div>
  `;
};
