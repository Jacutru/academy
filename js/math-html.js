// Tiny maths typesetting helpers, shared by lessons, prompts and corrections.
(function () {
  'use strict';
  const M = globalThis.M;
  const { fmt } = M.u;

  const n = x => (typeof x === 'number' ? fmt(x) : x);
  const frac = (a, b) => `<span class="frac"><span>${n(a)}</span><span>${n(b)}</span></span>`;
  // Mixed notation helpers.
  const x = ' × ', div = ' ÷ ', minus = ' − ', plus = ' + ';
  const eq = ' = ';
  const box = s => `<span class="box">${s}</span>`;           // highlighted value
  const hole = '<span class="hole">?</span>';                 // the value to find
  const hl = s => `<mark>${s}</mark>`;
  const steps = arr => `<ol class="steps">${arr.map(s => `<li>${s}</li>`).join('')}</ol>`;
  const lines = arr => arr.map(s => `<div class="calc-line">${s}</div>`).join('');

  // A simple table: rows of cells (first row is the header when `head` is true).
  function table(rows, { head = true, cls = '' } = {}) {
    const tr = (r, tag) => `<tr>${r.map(c => `<${tag}>${n(c)}</${tag}>`).join('')}</tr>`;
    const [first, ...rest] = rows;
    return `<table class="mtable ${cls}">${head ? `<thead>${tr(first, 'th')}</thead>` : tr(first, 'td')}<tbody>${rest.map(r => tr(r, 'td')).join('')}</tbody></table>`;
  }

  // Place-value table for a decimal (used for decimals and unit conversions).
  function placeTable(headers, digits) {
    return table([headers, digits.map(d => (d === undefined || d === null ? '' : d))], { cls: 'place' });
  }

  // Column operation ("opération posée") rendered as monospace lines.
  function posee(linesArr) {
    return `<pre class="posee">${linesArr.join('\n')}</pre>`;
  }

  M.h = { n, frac, x, div, minus, plus, eq, box, hole, hl, steps, lines, table, placeTable, posee };
})();
