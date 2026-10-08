// Inline SVG figures shared by lessons and questions. Colours come from CSS classes
// (s-line, s-fill, s-soft, s-accent, s-text…) so both themes work.
(function () {
  'use strict';
  const M = globalThis.M;
  const { fmt, add, mul } = M.u;

  const svg = (w, h, body, cls = '') =>
    `<svg class="fig ${cls}" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img">${body}</svg>`;
  const text = (x, y, s, { cls = 's-text', anchor = 'middle', size = 15 } = {}) =>
    `<text x="${x}" y="${y}" class="${cls}" text-anchor="${anchor}" font-size="${size}">${s}</text>`;
  const line = (x1, y1, x2, y2, cls = 's-line') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"/>`;
  const poly = (pts, cls = 's-line s-nofill') => `<polygon points="${pts.map(p => p.join(',')).join(' ')}" class="${cls}"/>`;
  const dot = (x, y, cls = 's-dot') => `<circle cx="${x}" cy="${y}" r="4" class="${cls}"/>`;

  // ---------- Number line ----------
  // marks: [{ v, label, cls }]  — label shown above, e.g. a letter or "?".
  // labels: 'major' (every major tick), 'ends', or [{ v, text }].
  function numberLine({ from, to, major, minor = 0, labels = 'major', marks = [], width = 600 }) {
    const pad = 30, W = width, H = 86, y = 50;
    const X = v => pad + ((v - from) / (to - from)) * (W - 2 * pad);
    let body = line(pad - 12, y, W - pad + 14, y) + `<polygon points="${W - pad + 14},${y - 5} ${W - pad + 22},${y} ${W - pad + 14},${y + 5}" class="s-solid"/>`;
    const count = Math.round((to - from) / major);
    for (let i = 0; i <= count; i++) {
      const v = add(from, mul(i, major));
      body += line(X(v), y - 9, X(v), y + 9);
      if (labels === 'major' || (labels === 'ends' && (i === 0 || i === count))) body += text(X(v), y + 28, fmt(v));
      if (minor && i < count) {
        for (let j = 1; j < minor; j++) {
          const xv = X(v) + (j / minor) * (X(add(v, major)) - X(v));
          body += line(xv, y - 5, xv, y + 5);
        }
      }
    }
    if (Array.isArray(labels)) labels.forEach(l => { body += text(X(l.v), y + 28, l.text); });
    marks.forEach(m => {
      body += `<circle cx="${X(m.v)}" cy="${y}" r="5" class="${m.cls || 's-accent'}"/>`;
      if (m.label) body += text(X(m.v), y - 16, m.label, { cls: 's-text s-bold' });
    });
    return svg(W, H, body, 'numberline');
  }

  // ---------- Fractions ----------
  function fractionBar(n, d, { w = 360, h = 34 } = {}) {
    const wholes = Math.max(1, Math.ceil(n / d));
    let body = '';
    for (let b = 0; b < wholes; b++) {
      for (let i = 0; i < d; i++) {
        const filled = b * d + i < n;
        body += `<rect x="${10 + (i * w) / d}" y="${10 + b * (h + 10)}" width="${w / d}" height="${h}" class="${filled ? 's-fill' : 's-empty'}"/>`;
      }
    }
    return svg(w + 20, wholes * (h + 10) + 10, body);
  }

  function fractionDisc(n, d, { r = 60 } = {}) {
    const cx = r + 10, cy = r + 10;
    let body = '';
    for (let i = 0; i < d; i++) {
      const a1 = (i / d) * 2 * Math.PI - Math.PI / 2, a2 = ((i + 1) / d) * 2 * Math.PI - Math.PI / 2;
      const p1 = [cx + r * Math.cos(a1), cy + r * Math.sin(a1)], p2 = [cx + r * Math.cos(a2), cy + r * Math.sin(a2)];
      const large = a2 - a1 > Math.PI ? 1 : 0;
      const path = d === 1
        ? `<circle cx="${cx}" cy="${cy}" r="${r}" class="${i < n ? 's-fill' : 's-empty'}"/>`
        : `<path d="M${cx},${cy} L${p1[0].toFixed(2)},${p1[1].toFixed(2)} A${r},${r} 0 ${large} 1 ${p2[0].toFixed(2)},${p2[1].toFixed(2)} Z" class="${i < n ? 's-fill' : 's-empty'}"/>`;
      body += path;
    }
    return svg(2 * r + 20, 2 * r + 20, body);
  }

  // ---------- Distributivity: area model k × (a + b) ----------
  function areaModel(k, a, b, { op = '+' } = {}) {
    const W = 360, H = 110, left = 40, top = 30;
    const wa = Math.max(80, Math.min(220, (a / (a + b)) * 300)), wb = 300 - wa;
    let body = `<rect x="${left}" y="${top}" width="${wa}" height="${H - 40}" class="s-fill"/>`;
    body += `<rect x="${left + wa}" y="${top}" width="${wb}" height="${H - 40}" class="${op === '+' ? 's-soft' : 's-empty s-dash'}"/>`;
    body += text(left + wa / 2, top - 8, fmt(a)) + text(left + wa + wb / 2, top - 8, (op === '−' ? '− ' : '') + fmt(b));
    body += text(left - 14, top + (H - 40) / 2 + 5, fmt(k));
    body += text(left + wa / 2, top + (H - 40) / 2 + 5, `${fmt(k)} × ${fmt(a)}`, { cls: 's-text s-bold' });
    body += text(left + wa + wb / 2, top + (H - 40) / 2 + 5, `${fmt(k)} × ${fmt(b)}`, { cls: 's-text s-bold' });
    return svg(W + 20, H + 10, body);
  }

  // ---------- Measured figures ----------
  function rect(wLabel, hLabel, { w = 200, h = 110, square = false } = {}) {
    if (square) h = w = 130;
    let body = `<rect x="40" y="20" width="${w}" height="${h}" class="s-soft s-line"/>`;
    body += text(40 + w / 2, 14, wLabel) + text(30, 20 + h / 2 + 5, hLabel, { anchor: 'end' });
    if (square) body += [[40 + w / 2, 20], [40 + w / 2, 20 + h], [40, 20 + h / 2], [40 + w, 20 + h / 2]]
      .map(([x, y]) => (y === 20 || y === 20 + h ? line(x, y - 5, x, y + 5) : line(x - 5, y, x + 5, y))).join('');
    return svg(w + 80, h + 40, body);
  }

  function triangle(baseLabel, heightLabel, { right = false, sides } = {}) {
    const A = [40, 150], B = [260, 150], C = right ? [40, 30] : [170, 30], Hf = [C[0], 150];
    let body = poly([A, B, C], 's-soft s-line');
    if (sides) {
      body += text((A[0] + B[0]) / 2, 172, sides[0]) + text((B[0] + C[0]) / 2 + 22, (B[1] + C[1]) / 2, sides[1]) + text((A[0] + C[0]) / 2 - 22, (A[1] + C[1]) / 2, sides[2]);
    } else {
      body += text((A[0] + B[0]) / 2, 172, baseLabel);
      if (!right) body += line(C[0], C[1], Hf[0], Hf[1], 's-line s-dash') + `<rect x="${Hf[0]}" y="${Hf[1] - 10}" width="10" height="10" class="s-line s-nofill"/>`;
      else body += `<rect x="${A[0]}" y="${A[1] - 12}" width="12" height="12" class="s-line s-nofill"/>`;
      body += text(C[0] + (right ? -10 : 8), 95, heightLabel, { anchor: right ? 'end' : 'start' });
    }
    return svg(300, 185, body);
  }

  function circle(label, { diameter = false } = {}) {
    const cx = 110, cy = 90, r = 70;
    let body = `<circle cx="${cx}" cy="${cy}" r="${r}" class="s-soft s-line"/>` + dot(cx, cy, 's-dot');
    body += diameter
      ? line(cx - r, cy, cx + r, cy, 's-accent-line') + text(cx, cy - 8, label)
      : line(cx, cy, cx + r, cy, 's-accent-line') + text(cx + r / 2, cy - 8, label);
    return svg(220, 180, body);
  }

  function pave(l, w, h) {
    const x0 = 40, y0 = 60, L = 180, H = 90, dx = 60, dy = -40;
    const f = [[x0, y0], [x0 + L, y0], [x0 + L, y0 + H], [x0, y0 + H]];
    let body = poly(f, 's-soft s-line');
    body += poly([[x0, y0], [x0 + dx, y0 + dy], [x0 + L + dx, y0 + dy], [x0 + L, y0]], 's-soft2 s-line');
    body += poly([[x0 + L, y0], [x0 + L + dx, y0 + dy], [x0 + L + dx, y0 + H + dy], [x0 + L, y0 + H]], 's-soft2 s-line');
    body += line(x0, y0 + H, x0 + dx, y0 + H + dy, 's-line s-dash') + line(x0 + dx, y0 + H + dy, x0 + dx, y0 + dy, 's-line s-dash') + line(x0 + dx, y0 + H + dy, x0 + L + dx, y0 + H + dy, 's-line s-dash');
    body += text(x0 + L / 2, y0 + H + 20, l) + text(x0 + L + dx + 8, y0 + H / 2 + dy + 10, h, { anchor: 'start' }) + text(x0 + L + dx / 2 + 14, y0 + H + dy / 2 + 14, w, { anchor: 'start' });
    return svg(320, 170, body);
  }

  // ---------- Grid (symmetry) ----------
  // points: [{x,y,label,cls}], axis: [x1,y1,x2,y2] in grid units, polys: [[[x,y],...]], segs: [[x1,y1,x2,y2]]
  function grid({ cols = 10, rows = 8, cell = 30, points = [], axis, polys = [], segs = [] }) {
    const W = cols * cell + 20, H = rows * cell + 20, P = (x, y) => [10 + x * cell, 10 + y * cell];
    let body = '';
    for (let i = 0; i <= cols; i++) body += line(...P(i, 0), ...P(i, rows), 's-grid');
    for (let j = 0; j <= rows; j++) body += line(...P(0, j), ...P(cols, j), 's-grid');
    polys.forEach(p => { body += poly(p.map(([x, y]) => P(x, y)), 's-soft s-line'); });
    segs.forEach(([x1, y1, x2, y2]) => { body += line(...P(x1, y1), ...P(x2, y2), 's-line s-thick'); });
    if (axis) body += line(...P(axis[0], axis[1]), ...P(axis[2], axis[3]), 's-axis');
    points.forEach(p => {
      const [x, y] = P(p.x, p.y);
      body += `<circle cx="${x}" cy="${y}" r="5" class="${p.cls || 's-accent'}"/>`;
      if (p.label) body += text(x + 9, y - 8, p.label, { anchor: 'start', cls: 's-text s-bold' });
    });
    return svg(W, H, body, 'grid');
  }

  // ---------- Shapes without grid (axes of symmetry) ----------
  function shape(pts, { axes = [], size = 200 } = {}) {
    let body = poly(pts, 's-soft s-line');
    axes.forEach(a => { body += line(a[0], a[1], a[2], a[3], 's-axis'); });
    return svg(size, size, body);
  }

  // ---------- Angles ----------
  function angle(deg, { label = '', rot = 0, len = 120 } = {}) {
    const cx = 90, cy = 150;
    const r0 = (-rot * Math.PI) / 180, r1 = (-(rot + deg) * Math.PI) / 180;
    const p0 = [cx + len * Math.cos(r0), cy + len * Math.sin(r0)];
    const p1 = [cx + len * Math.cos(r1), cy + len * Math.sin(r1)];
    let body = line(cx, cy, ...p0, 's-line s-thick') + line(cx, cy, ...p1, 's-line s-thick');
    if (deg === 90) {
      const s = 16, u = [Math.cos(r0), Math.sin(r0)], v = [Math.cos(r1), Math.sin(r1)];
      body += `<polyline points="${cx + s * u[0]},${cy + s * u[1]} ${cx + s * (u[0] + v[0])},${cy + s * (u[1] + v[1])} ${cx + s * v[0]},${cy + s * v[1]}" class="s-accent-line s-nofill"/>`;
    } else {
      const ar = 30, a0 = [cx + ar * Math.cos(r0), cy + ar * Math.sin(r0)], a1 = [cx + ar * Math.cos(r1), cy + ar * Math.sin(r1)];
      body += `<path d="M${a0[0].toFixed(1)},${a0[1].toFixed(1)} A${ar},${ar} 0 ${deg > 180 ? 1 : 0} 0 ${a1[0].toFixed(1)},${a1[1].toFixed(1)}" class="s-accent-line s-nofill"/>`;
    }
    body += dot(cx, cy);
    if (label) body += text(cx + 40, cy - 12, label, { anchor: 'start' });
    return svg(240, 170, body);
  }

  // ---------- Lines, segments, rays ----------
  // kind: 'droite' | 'segment' | 'demi-droite'
  function lineKind(kind, A = 'A', B = 'B') {
    const y = 40, xa = 80, xb = 240;
    let body = '';
    if (kind === 'segment') body += line(xa, y, xb, y, 's-line s-thick');
    if (kind === 'droite') body += line(10, y, 310, y, 's-line s-thick');
    if (kind === 'demi-droite') body += line(xa, y, 310, y, 's-line s-thick');
    body += line(xa - 6, y - 6, xa + 6, y + 6) + line(xa - 6, y + 6, xa + 6, y - 6);
    body += line(xb - 6, y - 6, xb + 6, y + 6) + line(xb - 6, y + 6, xb + 6, y - 6);
    body += text(xa, y - 14, A, { cls: 's-text s-bold' }) + text(xb, y - 14, B, { cls: 's-text s-bold' });
    return svg(320, 60, body);
  }

  // Two lines: 'perp' | 'para' | 'secantes'
  function twoLines(kind) {
    let body = '';
    if (kind === 'para') body += line(20, 40, 300, 70, 's-line s-thick') + line(20, 110, 300, 140, 's-line s-thick');
    if (kind === 'perp') body += line(44.6, 152.5, 255.4, 37.5, 's-line s-thick') + line(114.1, 29.2, 185.9, 160.8, 's-line s-thick') +
      '<polyline points="160.5,89.3 166.3,99.8 155.7,105.5" class="s-accent-line s-nofill"/>';
    if (kind === 'secantes') body += line(20, 150, 300, 40, 's-line s-thick') + line(40, 40, 290, 130, 's-line s-thick');
    return svg(320, 180, body);
  }

  M.svg = { numberLine, fractionBar, fractionDisc, areaModel, rect, triangle, circle, pave, grid, shape, angle, lineKind, twoLines, raw: { svg, text, line, poly, dot } };
})();
