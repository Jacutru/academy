// Domain "Grandeurs & mesures".
(function () {
  'use strict';
  const M = globalThis.M;
  const { fmt, dec, mul, add, sub, div, pow10 } = M.u;
  const { table, frac, hole } = M.h;
  const { Q, num } = M.kit;
  const { formatDuration } = M.answer;
  const S = M.svg;

  // ===================== CONVERSIONS =====================
  const SYSTEMS = {
    longueur: { units: ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'], step: 1 },
    masse: { units: ['kg', 'hg', 'dag', 'g', 'dg', 'cg', 'mg'], step: 1 },
    contenance: { units: ['hL', 'daL', 'L', 'dL', 'cL', 'mL'], step: 1 },
    aire: { units: ['km²', 'hm²', 'dam²', 'm²', 'dm²', 'cm²', 'mm²'], step: 2 },
    volume: { units: ['m³', 'dm³', 'cm³', 'mm³'], step: 3 },
  };
  // Exact conversion: value × 10^(step × (index(to) − index(from))).
  function convert(x, sys, from, to) {
    const S_ = SYSTEMS[sys], e = S_.step * (S_.units.indexOf(to) - S_.units.indexOf(from));
    return e >= 0 ? mul(x, pow10(e)) : div(x, pow10(-e), 12);
  }
  function factorText(sys, from, to) {
    const S_ = SYSTEMS[sys], d = S_.units.indexOf(to) - S_.units.indexOf(from), f = pow10(S_.step * Math.abs(d));
    return d >= 0 ? `1 ${from} = ${fmt(f)} ${to}, donc on multiplie par ${fmt(f)}` : `1 ${to} = ${fmt(f)} ${from}, donc on divise par ${fmt(f)}`;
  }
  function convQ(rng, sys, from, to, x, keyPrefix) {
    const r = convert(x, sys, from, to);
    return Q(`${keyPrefix}:${x}${from}>${to}`, `${fmt(x)} ${from} = ${hole} ${to}`, num(r, to), factorText(sys, from, to).split(',')[0] + '.', `${factorText(sys, from, to)} : ${fmt(x)} ${from} = <b>${fmt(r)} ${to}</b>.`);
  }
  // Pick two units at most `maxGap` apart.
  function pickUnits(rng, units, maxGap) {
    const i = rng.int(0, units.length - 1);
    let j; do j = rng.int(Math.max(0, i - maxGap), Math.min(units.length - 1, i + maxGap)); while (j === i);
    return [units[i], units[j]];
  }
  // A "nice" value for converting from→to: result stays readable.
  function niceValue(rng, sys, from, to, level) {
    const S_ = SYSTEMS[sys], d = S_.units.indexOf(to) - S_.units.indexOf(from);
    if (d > 0) return level === 1 ? rng.int(2, 30) : dec(rng.int(11, 999), rng.int(1, 2));
    const f = pow10(S_.step * -d);
    return level === 1 ? rng.int(1, 30) * f : rng.int(11, 999) * pow10(Math.max(0, S_.step * -d - 2));
  }
  const convTable = (units) => table([units, units.map(() => '')], { cls: 'conv' });

  M.notion('conv-longueurs', {
    lesson: {
      retenir: 'Pour les longueurs (m), les masses (g) et les contenances (L), on passe d’une unité à la suivante en multipliant ou divisant par <b>10</b>. Préfixes : <b>kilo</b> = 1 000, <b>hecto</b> = 100, <b>déca</b> = 10, <b>déci</b> = 1/10, <b>centi</b> = 1/100, <b>milli</b> = 1/1 000.',
      explication: `${convTable(SYSTEMS.longueur.units)}<p>On écrit le nombre dans le tableau, le chiffre des unités dans la colonne de l’unité de départ, puis on lit le nombre en plaçant la virgule après la colonne de l’unité d’arrivée (on complète avec des zéros).</p><p>Exemple : 4,5 km = 4 500 m (k → m : 3 colonnes, × 1 000).</p>`,
      methode: [
        'Repère les deux unités et compte les colonnes qui les séparent.',
        'Vers une unité plus petite : on multiplie (× 10 par colonne). Vers une unité plus grande : on divise.',
        'Vérifie : le nombre est plus grand quand l’unité est plus petite.',
      ],
      exemples: [
        { q: '3,5 m = ? cm', r: '1 m = 100 cm : 3,5 × 100 = <b>350 cm</b>.' },
        { q: '1 250 g = ? kg', r: '1 kg = 1 000 g : 1 250 ÷ 1 000 = <b>1,25 kg</b>.' },
        { q: '0,75 L = ? cL', r: '1 L = 100 cL : <b>75 cL</b>.' },
      ],
      astuces: ['Pour retenir l’ordre : « <b>K</b>ing <b>H</b>enri <b>D</b>onne <b>U</b>n <b>D</b>ernier <b>C</b>hocolat <b>M</b>ou » (k, h, da, unité, d, c, m).'],
      erreurs: ['Multiplier au lieu de diviser : 250 cm ne font pas 25 000 m ! Une unité plus grande donne un nombre plus petit.'],
    },
    generate(level, rng) {
      const sys = rng.pick(['longueur', 'longueur', 'masse', 'contenance']);
      const units = level === 1 ? SYSTEMS[sys].units.filter(u => ['km', 'm', 'cm', 'mm', 'kg', 'g', 'mg', 'L', 'cL', 'mL', 'dL'].includes(u)) : SYSTEMS[sys].units;
      if (level === 3 && rng.chance(0.4) && sys === 'longueur') {
        const m = rng.int(1, 9), cm = rng.int(1, 99), r = add(m, dec(cm, 2));
        return Q(`cl3:${m}m${cm}`, `${m} m ${cm} cm = ${hole} m`, num(r, 'm'), `${cm} cm = ${fmt(dec(cm, 2))} m.`, `${cm} cm = ${fmt(dec(cm, 2))} m, donc ${m} m ${cm} cm = <b>${fmt(r)} m</b>.`);
      }
      const [from, to] = pickUnits(rng, units, level === 1 ? 3 : 4);
      return convQ(rng, sys, from, to, niceValue(rng, sys, from, to, level), 'cl');
    },
  });

  M.notion('conv-aires', {
    lesson: {
      retenir: 'Pour les aires, on passe d’une unité à la suivante en multipliant ou divisant par <b>100</b> : 1 m² = 100 dm² = 10 000 cm². Unités agraires : <b>1 a = 1 dam² = 100 m²</b> et <b>1 ha = 1 hm² = 10 000 m²</b>.',
      explication: `<p>Un carré de 1 m de côté contient 10 × 10 = <b>100</b> carrés de 1 dm de côté. C’est pour ça qu’on a 2 colonnes par unité dans le tableau :</p>${table([['km²', 'hm² (ha)', 'dam² (a)', 'm²', 'dm²', 'cm²', 'mm²'], ['· ·', '· ·', '· ·', '· ·', '· ·', '· ·', '· ·']], { cls: 'conv' })}`,
      methode: [
        'Compte le nombre d’unités entre les deux (m² → cm² : 2 unités).',
        'Multiplie ou divise par 100 pour chaque unité (2 unités → 10 000).',
      ],
      exemples: [
        { q: '3 m² = ? dm²', r: '× 100 → <b>300 dm²</b>.' },
        { q: '2,5 ha = ? m²', r: '1 ha = 10 000 m² → <b>25 000 m²</b>.' },
        { q: '450 cm² = ? dm²', r: '÷ 100 → <b>4,5 dm²</b>.' },
      ],
      erreurs: ['Multiplier par 10 comme pour les longueurs : 1 m² = 100 dm², pas 10 dm².'],
    },
    generate(level, rng) {
      if (level === 3 && rng.chance(0.5)) {
        if (rng.chance(0.5)) {
          const x = dec(rng.int(1, 99), rng.int(0, 1)), r = mul(x, 10000);
          return Q(`ca3:${x}ha`, `${fmt(x)} ha = ${hole} m²`, num(r, 'm²'), '1 ha = 10 000 m².', `1 ha = 10 000 m², donc ${fmt(x)} ha = <b>${fmt(r)} m²</b>.`);
        }
        const x = rng.int(2, 99) * 100 + (rng.chance(0.5) ? rng.int(1, 9) * 10 : 0), r = div(x, 100);
        return Q(`ca3:${x}a`, `${fmt(x)} m² = ${hole} a`, num(r, 'a'), '1 a = 100 m².', `1 a = 100 m², donc ${fmt(x)} m² = <b>${fmt(r)} a</b>.`);
      }
      const units = SYSTEMS.aire.units.slice(level === 1 ? 3 : 1, 7);
      const [from, to] = pickUnits(rng, units, level === 1 ? 1 : 2);
      return convQ(rng, 'aire', from, to, niceValue(rng, 'aire', from, to, level), 'ca');
    },
  });

  M.notion('conv-volumes', {
    lesson: {
      retenir: 'Pour les volumes, on passe d’une unité à la suivante en multipliant ou divisant par <b>1 000</b> : 1 m³ = 1 000 dm³ = 1 000 000 cm³. Lien avec les contenances : <b>1 dm³ = 1 L</b> et <b>1 cm³ = 1 mL</b>.',
      explication: '<p>Un cube de 1 dm de côté contient 10 × 10 × 10 = <b>1 000</b> petits cubes de 1 cm de côté. Et ce cube de 1 dm³ contient exactement 1 litre d’eau.</p>',
      methode: [
        'Entre m³, dm³, cm³ : × ou ÷ 1 000 à chaque unité.',
        'Pour passer aux litres, convertis d’abord en dm³ (1 dm³ = 1 L), ou en cm³ (1 cm³ = 1 mL).',
      ],
      exemples: [
        { q: '2,5 m³ = ? L', r: '2,5 m³ = 2 500 dm³ = <b>2 500 L</b>.' },
        { q: '750 cm³ = ? L', r: '750 cm³ = 750 mL = <b>0,75 L</b>.' },
      ],
      erreurs: ['1 m³ = 1 000 L (et non 100 L) : un mètre cube, c’est énorme !'],
    },
    generate(level, rng) {
      if (level === 1) {
        const pairs = [['dm³', 'L', 1], ['L', 'dm³', 1], ['cm³', 'mL', 1], ['mL', 'cm³', 1], ['dm³', 'cm³', 1000], ['m³', 'dm³', 1000]];
        const [from, to, f] = rng.pick(pairs), x = rng.int(2, 50), r = x * f;
        return Q(`cv1:${x}${from}>${to}`, `${fmt(x)} ${from} = ${hole} ${to}`, num(r, to), f === 1 ? `1 ${from} = 1 ${to}.` : `1 ${from} = 1 000 ${to}.`, `<b>${fmt(r)} ${to}</b>`);
      }
      const opts = level === 2
        ? [['m³', 'L', 1000], ['cm³', 'dm³', 0.001], ['dm³', 'cm³', 1000], ['cm³', 'L', 0.001], ['L', 'cm³', 1000]]
        : [['m³', 'L', 1000], ['L', 'm³', 0.001], ['cm³', 'L', 0.001], ['mL', 'dm³', 0.001], ['m³', 'cm³', 1000000], ['hL', 'm³', 0.1]];
      const [from, to, f] = rng.pick(opts);
      const x = f >= 1 ? dec(rng.int(1, 99), rng.int(0, 2)) : rng.int(1, 999) * (f < 0.01 ? 10 : 1);
      const r = mul(x, f);
      return Q(`cv:${x}${from}>${to}`, `${fmt(x)} ${from} = ${hole} ${to}`, num(r, to), 'Rappel : 1 dm³ = 1 L et 1 cm³ = 1 mL.', `1 ${from} = ${fmt(f)} ${to} : ${fmt(x)} × ${fmt(f)} = <b>${fmt(r)} ${to}</b>.`);
    },
  });

  // ===================== DURÉES =====================
  const hm = (h, m) => `${h} h ${String(m).padStart(2, '0')}`;
  const D = (s, units = 'hm') => ({ kind: 'duration', s, units });

  M.notion('durees-conv', {
    lesson: {
      retenir: '<b>1 h = 60 min</b> et <b>1 min = 60 s</b> (donc 1 h = 3 600 s). Les durées ne fonctionnent <b>pas</b> en base 10 : 1,5 h = 1 h 30 min (et pas 1 h 50 min) !',
      explication: `${table([['Fraction d’heure', 'en minutes', 'en heures décimales'], [`${frac(1, 4)} h`, '15 min', '0,25 h'], [`${frac(1, 2)} h`, '30 min', '0,5 h'], [`${frac(3, 4)} h`, '45 min', '0,75 h'], [`${frac(1, 10)} h`, '6 min', '0,1 h']])}`,
      methode: [
        'h → min : multiplie par 60. min → s : multiplie par 60.',
        'min → h et min : cherche combien de fois 60 dans le nombre (division euclidienne). 150 min = 2 × 60 + 30 = 2 h 30 min.',
        'Heures décimales : la partie décimale est une fraction d’heure. 2,25 h = 2 h + 0,25 × 60 min = 2 h 15 min.',
      ],
      exemples: [
        { q: '2 h 15 min = ? min', r: '2 × 60 + 15 = <b>135 min</b>.' },
        { q: '200 s = ?', r: '200 = 3 × 60 + 20 → <b>3 min 20 s</b>.' },
        { q: '1,5 h = ? min', r: '1,5 × 60 = <b>90 min</b>.' },
      ],
      erreurs: ['Lire 1,5 h comme « 1 h 50 » : c’est 1 h 30 min.', 'Calculer avec 100 au lieu de 60.'],
    },
    generate(level, rng) {
      if (level === 1) {
        const t = rng.int(0, 2);
        if (t === 0) { const h = rng.int(2, 9); return Q(`dc1:${h}h`, `${h} h = ${hole} min`, num(h * 60, 'min'), '1 h = 60 min.', `${h} × 60 = <b>${h * 60} min</b>`); }
        if (t === 1) { const m = rng.int(2, 9); return Q(`dc1:${m}min`, `${m} min = ${hole} s`, num(m * 60, 's'), '1 min = 60 s.', `${m} × 60 = <b>${m * 60} s</b>`); }
        const h = rng.int(1, 4), m = rng.int(1, 11) * 5;
        return Q(`dc1:${h}h${m}`, `${hm(h, m)} min = ${hole} min`, num(h * 60 + m, 'min'), `${h} h = ${h * 60} min.`, `${h} × 60 + ${m} = <b>${h * 60 + m} min</b>`);
      }
      if (level === 2) {
        if (rng.chance(0.5)) { const m = rng.int(61, 299); return Q(`dc2:${m}min`, `Convertis ${m} min en heures et minutes.`, D(m * 60, 'hm'), `Combien de fois 60 dans ${m} ?`, `${m} = ${Math.floor(m / 60)} × 60 + ${m % 60} → <b>${formatDuration(m * 60)}</b>`); }
        const s = rng.int(61, 599);
        return Q(`dc2:${s}s`, `Convertis ${s} s en minutes et secondes.`, D(s, 'ms'), `Combien de fois 60 dans ${s} ?`, `${s} = ${Math.floor(s / 60)} × 60 + ${s % 60} → <b>${formatDuration(s)}</b>`);
      }
      if (rng.chance(0.6)) {
        const q = rng.pick([0.25, 0.5, 0.75, 0.1, 0.2]), h = rng.int(0, 4), x = add(h, q), m = Math.round(x * 60);
        return Q(`dc3:${x}h`, `${fmt(x)} h = ${hole} min`, num(m, 'min'), `1 h = 60 min, donc multiplie ${fmt(x)} par 60.`, `${fmt(x)} × 60 = <b>${m} min</b> (soit ${formatDuration(m * 60)}).`);
      }
      const s = rng.int(1, 2) * 3600 + rng.int(1, 59) * 60 + rng.int(1, 59);
      return Q(`dc3:${s}s`, `Convertis ${fmt(s)} s en h, min et s.`, D(s, 'hms'), '1 h = 3 600 s.', `${fmt(s)} = ${Math.floor(s / 3600)} × 3 600 + ${s % 3600} ; ${s % 3600} = ${Math.floor((s % 3600) / 60)} × 60 + ${s % 60} → <b>${formatDuration(s)}</b>`);
    },
  });

  M.notion('durees-calc', {
    lesson: {
      retenir: 'Pour calculer une durée ou un horaire, on calcule <b>séparément les heures et les minutes</b>, et on se rappelle que <b>60 min = 1 h</b>. Astuce : passer par l’<b>heure ronde</b>.',
      explication: `<p>Durée entre 9 h 45 et 11 h 20 :</p><p class="center">9 h 45 <b>→ +15 min →</b> 10 h 00 <b>→ +1 h →</b> 11 h 00 <b>→ +20 min →</b> 11 h 20</p><p>Durée : 15 min + 1 h + 20 min = <b>1 h 35 min</b>.</p>`,
      methode: [
        'Horaire de fin = début + durée. Additionne les heures, puis les minutes ; si on dépasse 60 min, on retire 60 min et on ajoute 1 h.',
        'Durée = fin − début. Le plus simple : avancer du début jusqu’à l’heure ronde, puis jusqu’à la fin, et additionner les sauts.',
        'Horaire de début = fin − durée.',
      ],
      exemples: [
        { q: 'Un film commence à 20 h 45 et dure 1 h 50 min. Heure de fin ?', r: '20 h 45 + 1 h = 21 h 45 ; + 50 min = 21 h 95 = <b>22 h 35</b>.' },
        { q: '2 h 45 min + 1 h 30 min', r: '3 h 75 min = <b>4 h 15 min</b>.' },
      ],
      erreurs: ['Écrire 21 h 95 : il faut convertir 95 min = 1 h 35 min.', 'Poser la soustraction 11,20 − 9,45 comme des décimaux : ça donne 1,75 et c’est faux !'],
    },
    generate(level, rng) {
      const start = rng.int(7, 19) * 60 + rng.int(0, 11) * 5;
      const dur = level === 1 ? rng.int(1, 11) * 5 : rng.int(4, 40) * 5;
      const end = start + dur;
      const t = (m) => hm(Math.floor(m / 60), m % 60);
      if (level === 1) {
        return Q(`dt1:${start}+${dur}`, `Il est ${t(start)}. Quelle heure sera-t-il dans ${dur} min ?`, D(end * 60), 'Passe par l’heure ronde si besoin.', `${t(start)} + ${dur} min = <b>${t(end)}</b>`);
      }
      const v = level === 2 ? rng.pick(['between', 'end']) : rng.pick(['between', 'start', 'sum', 'end']);
      if (v === 'between') {
        const toRound = (60 - (start % 60)) % 60;
        return Q(`dt:${start}-${end}`, `Quelle durée s’écoule entre ${t(start)} et ${t(end)} ?`, D(dur * 60), 'Avance jusqu’à l’heure ronde, puis jusqu’à l’heure d’arrivée.', `${toRound ? `${t(start)} → ${t(start + toRound)} : ${toRound} min ; ` : ''}en tout : <b>${formatDuration(dur * 60)}</b>.`);
      }
      if (v === 'end') return Q(`dte:${start}+${dur}`, `Un trajet commence à ${t(start)} et dure ${formatDuration(dur * 60)}. À quelle heure se termine-t-il ?`, D(end * 60), 'Ajoute d’abord les heures, puis les minutes.', `${t(start)} + ${formatDuration(dur * 60)} = <b>${t(end)}</b>`);
      if (v === 'start') return Q(`dts:${end}-${dur}`, `Un film se termine à ${t(end)}. Il a duré ${formatDuration(dur * 60)}. À quelle heure a-t-il commencé ?`, D(start * 60), 'Retire la durée à l’heure de fin.', `${t(end)} − ${formatDuration(dur * 60)} = <b>${t(start)}</b>`);
      const a = rng.int(1, 3) * 60 + rng.int(1, 11) * 5, b = rng.int(0, 2) * 60 + rng.int(1, 11) * 5;
      return Q(`dtsum:${a}+${b}`, `${formatDuration(a * 60)} + ${formatDuration(b * 60)} = ?`, D((a + b) * 60), 'Additionne les heures et les minutes séparément, puis convertis si on dépasse 60 min.', `${Math.floor(a / 60) + Math.floor(b / 60)} h ${(a % 60) + (b % 60)} min = <b>${formatDuration((a + b) * 60)}</b>`);
    },
  });

  // ===================== PÉRIMÈTRES, AIRES, VOLUMES =====================
  M.notion('perimetres', {
    lesson: {
      retenir: `Le <b>périmètre</b> d’une figure est la <b>longueur de son contour</b>.<ul><li>Rectangle : P = 2 × (L + l)</li><li>Carré : P = 4 × c</li><li>Cercle : P = 2 × π × r = π × d (avec π ≈ 3,14)</li><li>Polygone quelconque : on additionne les longueurs des côtés.</li></ul>`,
      explication: `${S.rect('L = 7 cm', 'l = 4 cm')}<p>P = 7 + 4 + 7 + 4 = 2 × (7 + 4) = <b>22 cm</b>.</p>${S.circle('r = 5 cm')}<p>P = 2 × 3,14 × 5 = <b>31,4 cm</b>.</p>`,
      methode: [
        'Vérifie que toutes les longueurs sont dans la même unité.',
        'Applique la formule (ou additionne tous les côtés).',
        'N’oublie pas l’unité de longueur (cm, m…) dans la réponse.',
      ],
      exemples: [
        { q: 'Carré de côté 6,5 cm', r: '4 × 6,5 = <b>26 cm</b>.' },
        { q: 'Cercle de diamètre 10 cm', r: '3,14 × 10 = <b>31,4 cm</b>.' },
      ],
      erreurs: ['Confondre rayon et diamètre : le diamètre est le double du rayon.', 'Confondre périmètre (contour, en cm) et aire (surface, en cm²).'],
    },
    generate(level, rng) {
      const t = level === 1 ? rng.pick(['rect', 'carre']) : level === 2 ? rng.pick(['rect', 'tri', 'carre']) : rng.pick(['cercle-r', 'cercle-d', 'inv']);
      const v = () => (level === 1 ? rng.int(2, 20) : dec(rng.int(15, 150), 1));
      if (t === 'rect') { let L, l; do { L = v(); l = v(); } while (l >= L); const P = mul(2, add(L, l)); return Q(`pe:r${L}x${l}`, `${S.rect(`${fmt(L)} cm`, `${fmt(l)} cm`)}Périmètre de ce rectangle ?`, num(P, 'cm'), 'P = 2 × (L + l)', `2 × (${fmt(L)} + ${fmt(l)}) = 2 × ${fmt(add(L, l))} = <b>${fmt(P)} cm</b>`); }
      if (t === 'carre') { const c = v(), P = mul(4, c); return Q(`pe:c${c}`, `${S.rect(`${fmt(c)} cm`, '', { square: true })}Périmètre de ce carré ?`, num(P, 'cm'), 'P = 4 × c', `4 × ${fmt(c)} = <b>${fmt(P)} cm</b>`); }
      if (t === 'tri') { let a, b, c; do { a = v(); b = v(); c = v(); } while (a + b <= c || a + c <= b || b + c <= a); const P = add(add(a, b), c); return Q(`pe:t${a},${b},${c}`, `${S.triangle('', '', { sides: [`${fmt(a)} cm`, `${fmt(b)} cm`, `${fmt(c)} cm`] })}Périmètre de ce triangle ?`, num(P, 'cm'), 'Additionne les trois côtés.', `${fmt(a)} + ${fmt(b)} + ${fmt(c)} = <b>${fmt(P)} cm</b>`); }
      if (t === 'cercle-r') { const r = rng.int(1, 20), P = mul(mul(2, 3.14), r); return Q(`pe:cr${r}`, `${S.circle(`${r} cm`)}Longueur de ce cercle de rayon ${r} cm ? (π ≈ 3,14)`, num(P, 'cm'), 'P = 2 × π × r', `2 × 3,14 × ${r} = <b>${fmt(P)} cm</b>`); }
      if (t === 'cercle-d') { const d = rng.int(2, 30), P = mul(3.14, d); return Q(`pe:cd${d}`, `${S.circle(`${d} cm`, { diameter: true })}Longueur de ce cercle de diamètre ${d} cm ? (π ≈ 3,14)`, num(P, 'cm'), 'P = π × d', `3,14 × ${d} = <b>${fmt(P)} cm</b>`); }
      const c = rng.int(3, 25), sq = rng.chance(0.5);
      if (sq) return Q(`pe:inv${c}`, `Un carré a un périmètre de ${4 * c} cm. Quelle est la longueur de son côté ?`, num(c, 'cm'), 'P = 4 × c, donc c = P ÷ 4.', `${4 * c} ÷ 4 = <b>${c} cm</b>`);
      const L = c + rng.int(1, 10);
      return Q(`pe:invr${L},${c}`, `Un rectangle a un périmètre de ${2 * (L + c)} cm et une longueur de ${L} cm. Quelle est sa largeur ?`, num(c, 'cm'), 'La moitié du périmètre = L + l.', `Demi-périmètre : ${2 * (L + c)} ÷ 2 = ${L + c} cm ; largeur : ${L + c} − ${L} = <b>${c} cm</b>`);
    },
  });

  M.notion('aires', {
    lesson: {
      retenir: `L’<b>aire</b> mesure la <b>surface</b> d’une figure (en cm², m²…).<ul><li>Rectangle : A = L × l</li><li>Carré : A = c × c</li><li>Triangle rectangle : A = (côté × côté) ÷ 2</li><li>Triangle : A = (base × hauteur) ÷ 2</li><li>Disque : A = π × r × r (π ≈ 3,14)</li></ul>`,
      explication: `<p>Un triangle rectangle est la moitié d’un rectangle : d’où le « ÷ 2 ».</p>${S.triangle('6 cm', '4 cm', { right: true })}<p>A = 6 × 4 ÷ 2 = <b>12 cm²</b>.</p><p>Pour un triangle quelconque, la <b>hauteur</b> est perpendiculaire à la base (en pointillés).</p>${S.triangle('base 8 cm', 'h = 5 cm')}<p>A = 8 × 5 ÷ 2 = <b>20 cm²</b>.</p>`,
      methode: [
        'Repère la formule correspondant à la figure.',
        'Vérifie que les longueurs sont dans la même unité.',
        'Calcule ; l’unité du résultat est une unité d’aire (cm², m²).',
      ],
      exemples: [
        { q: 'Rectangle 7 m × 3,5 m', r: '7 × 3,5 = <b>24,5 m²</b>.' },
        { q: 'Disque de rayon 10 cm', r: '3,14 × 10 × 10 = <b>314 cm²</b>.' },
      ],
      erreurs: ['Oublier le « ÷ 2 » pour le triangle.', 'Pour le triangle, utiliser un côté oblique au lieu de la hauteur.', 'Calculer π × r × 2 (c’est le périmètre !) au lieu de π × r × r.'],
    },
    generate(level, rng) {
      const t = level === 1 ? rng.pick(['rect', 'carre']) : level === 2 ? rng.pick(['trirect', 'tri', 'rect']) : rng.pick(['disque', 'inv', 'tri']);
      const v = () => (level === 1 ? rng.int(2, 15) : rng.chance(0.5) ? rng.int(2, 20) : dec(rng.int(15, 99), 1));
      if (t === 'rect') { let L, l; do { L = v(); l = v(); } while (l >= L); const A = mul(L, l); return Q(`ai:r${L}x${l}`, `${S.rect(`${fmt(L)} cm`, `${fmt(l)} cm`)}Aire de ce rectangle ?`, num(A, 'cm²'), 'A = L × l', `${fmt(L)} × ${fmt(l)} = <b>${fmt(A)} cm²</b>`); }
      if (t === 'carre') { const c = v(), A = mul(c, c); return Q(`ai:c${c}`, `${S.rect(`${fmt(c)} cm`, '', { square: true })}Aire de ce carré ?`, num(A, 'cm²'), 'A = c × c', `${fmt(c)} × ${fmt(c)} = <b>${fmt(A)} cm²</b>`); }
      if (t === 'trirect') { const b = rng.int(2, 20), h = rng.int(2, 20), A = div(b * h, 2); return Q(`ai:tr${b}x${h}`, `${S.triangle(`${b} cm`, `${h} cm`, { right: true })}Aire de ce triangle rectangle ?`, num(A, 'cm²'), 'C’est la moitié d’un rectangle.', `${b} × ${h} ÷ 2 = <b>${fmt(A)} cm²</b>`); }
      if (t === 'tri') { const b = rng.int(3, 20), h = rng.int(2, 15), A = div(b * h, 2); return Q(`ai:t${b}x${h}`, `${S.triangle(`${b} cm`, `${h} cm`)}Aire de ce triangle (la hauteur est en pointillés) ?`, num(A, 'cm²'), 'A = base × hauteur ÷ 2', `${b} × ${h} ÷ 2 = <b>${fmt(A)} cm²</b>`); }
      if (t === 'disque') { const r = rng.int(1, 12), A = mul(3.14, r * r); return Q(`ai:d${r}`, `${S.circle(`${r} cm`)}Aire de ce disque de rayon ${r} cm ? (π ≈ 3,14)`, num(A, 'cm²'), 'A = π × r × r', `3,14 × ${r} × ${r} = 3,14 × ${r * r} = <b>${fmt(A)} cm²</b>`); }
      const L = rng.int(3, 15), l = rng.int(2, L - 1);   // the width is shorter than the length
      return Q(`ai:inv${L}x${l}`, `Un rectangle a une aire de ${L * l} cm² et une longueur de ${L} cm. Quelle est sa largeur ?`, num(l, 'cm'), 'A = L × l, donc l = A ÷ L.', `${L * l} ÷ ${L} = <b>${l} cm</b>`);
    },
  });

  M.notion('volume-pave', {
    lesson: {
      retenir: '<b>Volume d’un pavé droit</b> : V = L × l × h. <b>Volume d’un cube</b> : V = c × c × c. Le résultat s’exprime en unités de volume (cm³, m³…). Rappel : 1 dm³ = 1 L.',
      explication: `${S.pave('L = 5 cm', 'l = 3 cm', 'h = 2 cm')}<p>Une couche contient 5 × 3 = 15 cubes de 1 cm³ ; il y a 2 couches : V = 15 × 2 = <b>30 cm³</b>.</p>`,
      methode: [
        'Vérifie que les trois longueurs sont dans la même unité.',
        'Multiplie longueur × largeur × hauteur.',
        'Pour une contenance en litres, convertis en dm³ (1 dm³ = 1 L).',
      ],
      exemples: [
        { q: 'Cube de 4 cm d’arête', r: '4 × 4 × 4 = <b>64 cm³</b>.' },
        { q: 'Aquarium 50 cm × 30 cm × 40 cm, en litres', r: '5 dm × 3 dm × 4 dm = 60 dm³ = <b>60 L</b>.' },
      ],
      erreurs: ['Additionner les longueurs au lieu de les multiplier.', 'Mélanger les unités (cm et m) dans le calcul.'],
    },
    generate(level, rng) {
      if (level === 3) {
        if (rng.chance(0.5)) {
          const L = rng.int(2, 8) * 10, l = rng.int(2, 6) * 10, h = rng.int(2, 6) * 10, V = (L * l * h) / 1000;
          return Q(`vp3:${L}x${l}x${h}`, `Un aquarium a la forme d’un pavé droit de ${L} cm × ${l} cm × ${h} cm. Quelle est sa contenance en litres ?`, num(V, 'L'), 'Convertis en dm, ou calcule en cm³ puis 1 L = 1 000 cm³.', `${L / 10} dm × ${l / 10} dm × ${h / 10} dm = ${fmt(V)} dm³ = <b>${fmt(V)} L</b>`);
        }
        const L = rng.int(2, 12), l = rng.int(2, 10), h = rng.int(2, 10);
        return Q(`vp3i:${L}x${l}x${h}`, `Un pavé droit a un volume de ${L * l * h} cm³, une longueur de ${L} cm et une largeur de ${l} cm. Quelle est sa hauteur ?`, num(h, 'cm'), `Aire de la base : ${L} × ${l}.`, `Base : ${L} × ${l} = ${L * l} cm² ; hauteur : ${L * l * h} ÷ ${L * l} = <b>${h} cm</b>`);
      }
      if (rng.chance(0.3)) {
        const c = level === 1 ? rng.int(2, 10) : dec(rng.int(11, 50), 1), V = mul(mul(c, c), c);
        return Q(`vc:${c}`, `Volume d’un cube de ${fmt(c)} cm d’arête ?`, num(V, 'cm³'), 'V = c × c × c', `${fmt(c)} × ${fmt(c)} × ${fmt(c)} = <b>${fmt(V)} cm³</b>`);
      }
      const L = level === 1 ? rng.int(2, 12) : dec(rng.int(15, 99), 1), l = rng.int(2, 10), h = rng.int(2, 10), V = mul(mul(L, l), h);
      return Q(`vp:${L}x${l}x${h}`, `${S.pave(`${fmt(L)} cm`, `${l} cm`, `${h} cm`)}Volume de ce pavé droit ?`, num(V, 'cm³'), 'V = L × l × h', `${fmt(L)} × ${l} × ${h} = <b>${fmt(V)} cm³</b>`);
    },
  });
})();
