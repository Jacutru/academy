// Persistence: one versioned localStorage key, re-read before every write, in-memory fallback.
// Stores raw facts only: per-notion level/history/box, active days, chrono bests, lessons seen,
// and an append-only answer log (for analytics / CSV export).
(function () {
  'use strict';
  const M = globalThis.M;
  const { today } = M.u;
  const P = M.progress;

  const KEY = 'maths6e';
  const VERSION = 1;
  const LOG_CAP = 50000;
  const DAYS_CAP = 365;

  let memory = null;      // used when localStorage is unavailable
  let available = true;

  const blank = () => ({ v: VERSION, name: '', target: { ...M.programmes.DEFAULT }, notions: {}, days: [], chronoBest: {}, seen: {}, explain: {}, log: [] });
  const cleanName = n => String(n).trim().replace(/\s+/g, ' ').slice(0, 30);
  const cleanTarget = t => ({
    version: M.programmes.versions.some(v => v.id === t.version) ? t.version : M.programmes.DEFAULT.version,
    classe: M.programmes.targetClasses.includes(t.classe) ? t.classe : M.programmes.DEFAULT.classe,
  });

  // Upgrade any older/partial state to the current schema.
  function migrate(s) {
    if (!s || typeof s !== 'object' || Array.isArray(s)) return blank();
    const out = { ...blank(), ...s, v: VERSION };
    out.notions = {};
    Object.entries(s.notions || {}).forEach(([id, np]) => {
      if (!np || !Array.isArray(np.hist)) return;
      out.notions[id] = {
        level: Math.min(3, Math.max(1, np.level | 0 || 1)),
        box: Math.min(P.INTERVALS.length - 1, Math.max(0, np.box | 0)),
        hist: np.hist.filter(h => h && typeof h.ok === 'boolean' && Number.isFinite(h.at)).slice(-P.HIST_CAP),
      };
    });
    out.days = Array.isArray(s.days) ? s.days.filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)).slice(-DAYS_CAP) : [];
    out.log = Array.isArray(s.log) ? s.log.filter(Array.isArray).slice(-LOG_CAP) : [];
    out.chronoBest = s.chronoBest && typeof s.chronoBest === 'object' ? s.chronoBest : {};
    out.seen = s.seen && typeof s.seen === 'object' ? s.seen : {};
    out.name = typeof s.name === 'string' ? cleanName(s.name) : '';
    out.target = cleanTarget(s.target || {});
    out.explain = {};
    Object.entries(s.explain || {}).forEach(([id, st]) => { if (typeof st === 'string' && M.cat.STYLES[st]) out.explain[id] = st; });
    return out;
  }

  function read() {
    if (available) {
      try {
        const raw = globalThis.localStorage.getItem(KEY);
        return raw ? migrate(JSON.parse(raw)) : blank();
      } catch (e) {
        if (e instanceof SyntaxError) return blank(); // corrupted value: start fresh rather than crash
        available = false;
      }
    }
    return memory ? migrate(JSON.parse(JSON.stringify(memory))) : blank();
  }

  function write(s) {
    memory = s;
    if (available) {
      try { globalThis.localStorage.setItem(KEY, JSON.stringify(s)); }
      catch (e) {
        // Quota full: drop the oldest half of the answer log (analytics only) rather than stop saving progress.
        let saved = false;
        if (s.log.length > 1) {
          s.log.splice(0, s.log.length >> 1);
          try { globalThis.localStorage.setItem(KEY, JSON.stringify(s)); saved = true; } catch (e2) { /* still full */ }
        }
        if (!saved) available = false;
      }
    }
  }

  // Read-modify-write, so two open tabs never overwrite each other's progress.
  function update(fn) {
    const s = read();
    fn(s);
    write(s);
    return s;
  }

  function addDay(s, at) {
    const d = P.dayOf(at);
    if (!s.days.includes(d)) { s.days.push(d); if (s.days.length > DAYS_CAP) s.days.splice(0, s.days.length - DAYS_CAP); }
  }

  // ok/ms are for the FIRST try only. mode: 'diag' | 'session' | 'free' | 'chrono'.
  function recordAnswer(id, { ok, ms, lvl, mode, at = Date.now() }) {
    return update(s => {
      const meta = M.cat.byId[id];
      s.notions[id] = P.applyAnswer(s.notions[id], { ok, ms: Math.round(ms), at, lvl }, { meta, diag: mode === 'diag' });
      addDay(s, at);
      s.log.push([at, id, lvl, ok ? 1 : 0, Math.round(ms), mode]);
      if (s.log.length > LOG_CAP) s.log.splice(0, s.log.length - LOG_CAP);
    });
  }

  const setLevel = (id, level) => update(s => { s.notions[id] = { ...(s.notions[id] || P.emptyNotion()), level }; });
  const markSeen = id => update(s => { s.seen[id] = 1; });
  function setChronoBest(key, score) {
    let record = false;
    update(s => { if (score > (s.chronoBest[key] || 0)) { s.chronoBest[key] = score; record = true; } });
    return record;
  }

  const setName = n => update(s => { s.name = cleanName(n); });
  const setTarget = (version, classe) => update(s => { s.target = cleanTarget({ version, classe }); });
  const setExplainPref = (id, style) => update(s => { s.explain[id] = style; });
  // File names for exports: "academy-lea-2026-10-08".
  const fileStem = () => ['academy', M.u.norm(read().name).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')].filter(Boolean).join('-');

  // ---------- Export / import ----------
  const exportJSON = () => JSON.stringify(read(), null, 1);
  function importJSON(text) {
    const parsed = JSON.parse(text);               // throws on invalid JSON
    if (!parsed || typeof parsed !== 'object' || !('notions' in parsed)) throw new Error('Ce fichier ne contient pas une sauvegarde valide.');
    const s = migrate(parsed);
    write(s);
    return s;
  }
  function exportCSV() {
    const pad = n => String(n).padStart(2, '0');
    const { name, log } = read();
    const rows = [['eleve', 'date', 'heure', 'notion', 'titre', 'domaine', 'chapitre', 'niveau', 'correct', 'temps_s', 'mode']];
    log.forEach(([at, id, lvl, ok, ms, mode]) => {
      const d = new Date(at), no = M.cat.byId[id];
      rows.push([name, today(d), `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`, id, no ? no.title : '', no ? no.domain.title : '', no ? no.chapter.title : '', lvl, ok, (ms / 1000).toFixed(1).replace('.', ','), mode]);
    });
    const esc = v => { const t = String(v); return /[;"\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; };
    return '﻿' + rows.map(r => r.map(esc).join(';')).join('\r\n');   // BOM + ';' so Excel (fr) opens it correctly
  }
  const reset = () => write(blank());

  M.store = {
    KEY, VERSION, blank, migrate, read, update, recordAnswer, setLevel, markSeen, setChronoBest, setName, setTarget, setExplainPref, fileStem,
    exportJSON, importJSON, exportCSV, reset,
    isPersistent: () => (read(), available),
  };
})();
