/* UDYAM SARTHI SVG Chart Visualization Engine */

export const renderLineChart = ({
  title,
  labels = [],
  series = [], // [{ name: 'Actual', data: [...], color: '#3b82f6' }, { name: 'Expected', data: [...], color: '#93c5fd' }]
  height = 240
}) => {
  if (!labels.length || !series.length) return `<div class="empty-state">No chart data available</div>`;

  const padding = { top: 20, right: 30, bottom: 40, left: 45 };
  const width = 600; // viewBox SVG coordinate system
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  let maxVal = 0;
  series.forEach(s => {
    s.data.forEach(val => { if (val > maxVal) maxVal = val; });
  });
  maxVal = Math.ceil((maxVal * 1.15) / 10) * 10 || 100;

  const pointsPerSeries = series.map(s => {
    return s.data.map((val, idx) => {
      const x = padding.left + (idx / (labels.length - 1 || 1)) * chartW;
      const y = padding.top + chartH - (val / maxVal) * chartH;
      return { x, y, val, label: labels[idx] };
    });
  });

  const paths = pointsPerSeries.map((pts, idx) => {
    const d = pts.reduce((acc, pt, i) => i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`, '');
    return `
      <path d="${d}" fill="none" stroke="${series[idx].color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      ${pts.map(pt => `<circle cx="${pt.x}" cy="${pt.y}" r="4" fill="${series[idx].color}" stroke="#0b0f19" stroke-width="2" />`).join('')}
    `;
  }).join('');

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(ratio => {
    const y = padding.top + chartH - ratio * chartH;
    const val = Math.round(ratio * maxVal);
    return `
      <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="4 4" />
      <text x="${padding.left - 8}" y="${y + 4}" text-anchor="end" fill="var(--text-dim)" font-size="10">${val}</text>
    `;
  }).join('');

  const xAxis = labels.map((lbl, idx) => {
    const x = padding.left + (idx / (labels.length - 1 || 1)) * chartW;
    return `<text x="${x}" y="${height - 12}" text-anchor="middle" fill="var(--text-dim)" font-size="10">${lbl}</text>`;
  }).join('');

  const legend = series.map(s => `
    <div class="flex items-center gap-1 text-xs">
      <span style="width: 10px; height: 10px; border-radius: 2px; background: ${s.color}; display: inline-block;"></span>
      <span>${s.name}</span>
    </div>
  `).join('');

  return `
    <div class="chart-container-wrapper">
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-sm font-semibold">${title}</h4>
        <div class="flex items-center gap-4">${legend}</div>
      </div>
      <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto; display: block;">
        ${gridLines}
        ${xAxis}
        ${paths}
      </svg>
    </div>
  `;
};

export const renderBarChart = ({
  title,
  labels = [],
  data = [],
  color = '#3b82f6',
  height = 220
}) => {
  if (!labels.length) return `<div class="empty-state">No bar chart data available</div>`;

  const width = 500;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  let maxVal = Math.max(...data, 10);
  maxVal = Math.ceil(maxVal * 1.2);

  const barWidth = Math.min((chartW / labels.length) * 0.55, 36);

  const bars = data.map((val, idx) => {
    const x = padding.left + (idx + 0.5) * (chartW / labels.length) - barWidth / 2;
    const h = (val / maxVal) * chartH;
    const y = padding.top + chartH - h;
    return `
      <rect x="${x}" y="${y}" width="${barWidth}" height="${h}" rx="4" fill="${color}" opacity="0.9" />
      <text x="${x + barWidth / 2}" y="${y - 6}" text-anchor="middle" fill="var(--text-main)" font-size="11" font-weight="600">${val}</text>
      <text x="${x + barWidth / 2}" y="${height - 12}" text-anchor="middle" fill="var(--text-dim)" font-size="10">${labels[idx]}</text>
    `;
  }).join('');

  return `
    <div class="chart-container-wrapper">
      <h4 class="text-sm font-semibold mb-2">${title}</h4>
      <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: auto;">
        <line x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}" stroke="var(--border-color)" />
        ${bars}
      </svg>
    </div>
  `;
};