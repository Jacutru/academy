// Shared helpers: seeded RNG, arithmetic, exact decimals, French formatting, local dates.
(function () {
  'use strict';
  const M = globalThis.M = globalThis.M || {};

  // ---------- Seeded RNG (mulberry32) ----------
  function rng(seed) {
    let s = (seed >>> 0) || 1;
    function next() {
      s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    const r = {
      next,
      int: (a, b) => a + Math.floor(next() * (b - a + 1)),
      pick: arr => arr[Math.floor(next() * arr.length)],
      chance: p => next() < p,
      shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(next() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
      },
      sample: (arr, n) => r.shuffle(arr).slice(0, n),
    };
    return r;
  }
  const newSeed = () => (Math.random() * 4294967296) >>> 0;

  // ---------- Integers ----------
  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) [a, b] = [b, a % b];
    return a;
  }
  const lcm = (a, b) => (a / gcd(a, b)) * b;
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  function divisors(n) {
    const out = [];
    for (let i = 1; i <= n; i++) if (n % i === 0) out.push(i);
    return out;
  }

  // ---------- Exact decimals ----------
  // A decimal is always built as (integer / 10^k): that gives the double nearest to the
  // decimal value, which prints exactly. Operations go through scaled integers.
  const pow10 = k => 10 ** k;
  const dec = (n, k = 0) => n / pow10(k);
  function decimals(x) {
    if (!Number.isFinite(x)) return 0;
    const s = String(Math.abs(x));
    if (s.includes('e')) {
      const [m, e] = s.split('e');
      const md = m.includes('.') ? m.length - m.indexOf('.') - 1 : 0;
      return Math.max(0, md - Number(e));
    }
    const i = s.indexOf('.');
    return i < 0 ? 0 : s.length - i - 1;
  }
  const toInt = (x, k) => Math.round(x * pow10(k));
  function add(a, b) {
    const k = Math.max(decimals(a), decimals(b));
    return dec(toInt(a, k) + toInt(b, k), k);
  }
  const sub = (a, b) => add(a, -b);
  function mul(a, b) {
    const ka = decimals(a), kb = decimals(b);
    return dec(toInt(a, ka) * toInt(b, kb), ka + kb);
  }
  // Exact quotient when it is a decimal with at most `maxK` digits, otherwise null.
  function div(a, b, maxK = 6) {
    const ka = decimals(a), kb = decimals(b);
    const den = toInt(b, kb) * pow10(ka);
    for (let k = 0; k <= maxK; k++) {
      const num = toInt(a, ka) * pow10(kb + k);
      if (num % den === 0) return dec(num / den, k);
    }
    return null;
  }
  // Round half away from zero to k decimals, exactly.
  function round(x, k) {
    const d = decimals(x);
    if (d <= k) return x;
    const N = toInt(x, d), f = pow10(d - k);
    const q = Math.floor((Math.abs(N) + f / 2) / f) * Math.sign(N);
    return dec(q, k);
  }
  // Truncate (round toward zero) to k decimals, exactly.
  function trunc(x, k) {
    const d = decimals(x);
    if (d <= k) return x;
    const N = toInt(x, d), f = pow10(d - k);
    return dec(Math.trunc(N / f), k);
  }
  // Tolerates float noise only (relative 1e-12): large integers must match exactly.
  const eq = (a, b) => Math.abs(a - b) <= 1e-12 * Math.max(1, Math.abs(a), Math.abs(b));
  const isNice = (x, maxK = 6) => Number.isFinite(x) && decimals(x) <= maxK;

  // ---------- French formatting ----------
  const NF = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 10, useGrouping: true });
  const fmt = x => NF.format(x).replace(/-/g, '−');
  // Fixed number of decimals, keeps trailing zeros ("4,50").
  const NFK = new Map();
  const fmtK = (x, k) => {
    if (!NFK.has(k)) NFK.set(k, new Intl.NumberFormat('fr-FR', { minimumFractionDigits: k, maximumFractionDigits: k }));
    return NFK.get(k).format(x).replace(/-/g, '−');
  };
  const plural =(n, word, pl) => `${fmt(n)} ${n > 1 ? (pl || word + 's') : word}`;
  const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  // ---------- Local calendar days (never UTC) ----------
  const pad = n => String(n).padStart(2, '0');
  const today = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  function parseDay(s) { const [y, m, d] = s.split('-').map(Number); return { y, m, d }; }
  function addDays(s, n) {
    const { y, m, d } = parseDay(s);
    return today(new Date(y, m - 1, d + n));
  }
  function diffDays(a, b) { // b - a, in days
    const A = parseDay(a), B = parseDay(b);
    return Math.round((Date.UTC(B.y, B.m - 1, B.d) - Date.UTC(A.y, A.m - 1, A.d)) / 86400000);
  }

  M.u = {
    rng, newSeed, gcd, lcm, range, divisors,
    pow10, dec, decimals, add, sub, mul, div, round, trunc, eq, isNice,
    fmt, fmtK, plural, norm, today, addDays, diffDays,
  };
})();
