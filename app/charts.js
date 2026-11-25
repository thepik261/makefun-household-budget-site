// Home Ledger charts: small SVG builders, no library. Every chart is drawn
// from the figures passed in, so the pictures always match the tables.

import { categoryColor, formatMoney } from './data.js';

function polar(cx, cy, r, angleDeg) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function donutSlice(cx, cy, rOuter, rInner, start, end) {
  const [x1, y1] = polar(cx, cy, rOuter, start);
  const [x2, y2] = polar(cx, cy, rOuter, end);
  const [x3, y3] = polar(cx, cy, rInner, end);
  const [x4, y4] = polar(cx, cy, rInner, start);
  const large = end - start > 180 ? 1 : 0;
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${rOuter} ${rOuter} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} L ${x3.toFixed(1)} ${y3.toFixed(1)} A ${rInner} ${rInner} 0 ${large} 0 ${x4.toFixed(1)} ${y4.toFixed(1)} Z`;
}

// Donut of spending by category, with a legend and the month's total in
// the middle. `parts` is [{category, amount}] sorted largest first.
export function donutChart(parts, total) {
  if (!parts.length) {
    return '<p class="empty">No spending recorded this month yet.</p>';
  }
  const cx = 110;
  const cy = 110;
  const rOuter = 100;
  const rInner = 62;
  let angle = 0;
  const slices = parts.map((p) => {
    const share = p.amount / total;
    const start = angle;
    const end = angle + share * 360;
    angle = end;
    // A full circle needs two arcs; shave a hair off the end so the path closes.
    const path = share >= 0.999
      ? donutSlice(cx, cy, rOuter, rInner, 0, 359.99)
      : donutSlice(cx, cy, rOuter, rInner, start, end);
    return `<path d="${path}" fill="${categoryColor(p.category)}"><title>${p.category}: ${formatMoney(p.amount)}</title></path>`;
  }).join('');
  const legend = parts.map((p) => {
    const pct = Math.round((p.amount / total) * 100);
    return `<li><span class="swatch" style="background:${categoryColor(p.category)}"></span>` +
      `<span class="legend-name">${p.category}</span>` +
      `<span class="legend-amount">${formatMoney(p.amount)}</span>` +
      `<span class="legend-pct">${pct}%</span></li>`;
  }).join('');
  return `<div class="donut-wrap">
    <svg class="donut" viewBox="0 0 220 220" role="img" aria-label="Spending by category">
      ${slices}
      <text x="110" y="104" text-anchor="middle" class="donut-total">${formatMoney(total)}</text>
      <text x="110" y="126" text-anchor="middle" class="donut-label">spent</text>
    </svg>
    <ul class="legend">${legend}</ul>
  </div>`;
}

// Grouped bars: income vs spending for a list of months.
// `months` is [{label, income, spending}].
export function monthBars(months) {
  const max = Math.max(1, ...months.flatMap((m) => [m.income, m.spending]));
  const barW = 34;
  const gap = 26;
  const groupW = barW * 2 + gap;
  const width = months.length * groupW + 20;
  const height = 220;
  const base = 190;
  const scale = 160 / max;
  const bars = months.map((m, i) => {
    const x = 20 + i * groupW;
    const ih = Math.max(2, Math.round(m.income * scale));
    const sh = Math.max(2, Math.round(m.spending * scale));
    return `<rect x="${x}" y="${base - ih}" width="${barW}" height="${ih}" rx="3" fill="#2f6b4f"><title>${m.label} income ${formatMoney(m.income)}</title></rect>` +
      `<rect x="${x + barW + 6}" y="${base - sh}" width="${barW}" height="${sh}" rx="3" fill="#b4552d"><title>${m.label} spending ${formatMoney(m.spending)}</title></rect>` +
      `<text x="${x + barW}" y="${base + 18}" text-anchor="middle" class="bar-label">${m.label}</text>`;
  }).join('');
  return `<svg class="bars" viewBox="0 0 ${width} ${height + 24}" role="img" aria-label="Income versus spending by month">
    <line x1="10" y1="${base}" x2="${width - 10}" y2="${base}" class="bar-axis" />
    ${bars}
  </svg>
  <p class="chart-key"><span class="key-dot" style="background:#2f6b4f"></span> Income <span class="key-dot" style="background:#b4552d"></span> Spending</p>`;
}

// Horizontal progress bar used for budgets and goals.
export function progressBar(fraction, tone) {
  const pct = Math.max(0, Math.min(100, Math.round(fraction * 100)));
  const cls = tone === 'over' ? 'bar over' : tone === 'warn' ? 'bar warn' : 'bar';
  return `<div class="${cls}" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div>`;
}
