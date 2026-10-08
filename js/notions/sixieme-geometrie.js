// Domain "Espace & géométrie", 6e: distances, angles (vocabulaire, bissectrice), angles du triangle, assemblages de cubes.
(function () {
  'use strict';
  const M = globalThis.M;
  const { fmt, dec, add, sub, mul, div } = M.u;
  const { Q, num, fixedChoice } = M.kit;
  const S = M.svg;
  const { svg: rawSvg, text: T, line: Ln, dot: Dt } = S.raw;
  const YN = b => fixedChoice(['Oui', 'Non'], b ? 'Oui' : 'Non');
  const deg = x => `${fmt(x)}°`;
  const cm = x => `${fmt(x)} cm`;
  // Angle notation: hat on the vertex letter (xÔy, BÂC).
  const hat = (a, b, c) => `${a}${b}̂${c}`;
  const bold = s => T(s[0], s[1], s[2], { cls: 's-text s-bold' });

  // ---------- Plane geometry helpers (math angles in degrees, counter-clockwise, SVG y downwards) ----------
  const RAD = Math.PI / 180;
  const r1 = v => Math.round(v * 10) / 10;
  const pol = (c, r, a) => [r1(c[0] + r * Math.cos(a * RAD)), r1(c[1] - r * Math.sin(a * RAD))];
  const dirOf = (P, Q2) => Math.atan2(P[1] - Q2[1], Q2[0] - P[0]) / RAD;
  const norm360 = a => ((a % 360) + 360) % 360;
  function arc(c, r, a0, span, cls = 's-accent-line') {
    const p0 = pol(c, r, a0), p1 = pol(c, r, a0 + span);
    return `<path d="M${p0[0]},${p0[1]} A${r},${r} 0 ${span > 180 ? 1 : 0} 0 ${p1[0]},${p1[1]}" class="${cls}"/>`;
  }
  // Small strokes across an arc: equal angles carry the same number of strokes.
  function arcCode(c, r, a0, span, n) {
    let b = '';
    for (let k = 0; k < n; k++) {
      const a = a0 + span / 2 + (k - (n - 1) / 2) * Math.min(6, span / 4);
      b += Ln(...pol(c, r - 5, a), ...pol(c, r + 5, a), 's-accent-line');
    }
    return b;
  }
  function rightMark(c, a0, s = 13) {
    const p1 = pol(c, s, a0), p2 = pol(c, s * Math.SQRT2, a0 + 45), p3 = pol(c, s, a0 + 90);
    return `<polyline points="${p1} ${p2} ${p3}" class="s-accent-line"/>`;
  }
  const label = (c, r, a, s, size = 14) => { const p = pol(c, r, a); return T(p[0], r1(p[1] + 5), s, { size }); };
  // Equal-length coding: n small strokes across the middle of [PQ].
  function ticks(P, Q2, n = 1) {
    const L = Math.hypot(Q2[0] - P[0], Q2[1] - P[1]), ux = (Q2[0] - P[0]) / L, uy = (Q2[1] - P[1]) / L;
    const mx = (P[0] + Q2[0]) / 2, my = (P[1] + Q2[1]) / 2;
    let b = '';
    for (let k = 0; k < n; k++) {
      const o = (k - (n - 1) / 2) * 5;
      b += Ln(r1(mx + o * ux + 7 * uy), r1(my + o * uy - 7 * ux), r1(mx + o * ux - 7 * uy), r1(my + o * uy + 7 * ux), 's-line');
    }
    return b;
  }
  const nameOut = (P, G, s, d = 15) => {
    const L = Math.hypot(P[0] - G[0], P[1] - G[1]) || 1;
    return bold([r1(P[0] + ((P[0] - G[0]) / L) * d), r1(P[1] + ((P[1] - G[1]) / L) * d + 5), s]);
  };

  // =====================================================================
  // DISTANCES
  // =====================================================================
  // Points on a horizontal segment: pts [{t (0..1), n}], codes [[i, j, strokes]].
  function segFig(pts, codes = []) {
    const X = t => r1(30 + t * 260), y = 40;
    let b = Ln(X(pts[0].t), y, X(pts[pts.length - 1].t), y, 's-line s-thick');
    codes.forEach(([i, j, n]) => { b += ticks([X(pts[i].t), y], [X(pts[j].t), y], n); });
    pts.forEach(p => { b += Dt(X(p.t), y) + bold([X(p.t), y - 14, p.n]); });
    return rawSvg(320, 60, b);
  }
  const SEG_NAMES = [['A', 'B', 'I'], ['E', 'F', 'M'], ['R', 'S', 'K'], ['C', 'D', 'O'], ['M', 'N', 'P']];
  const distFig = (() => {
    const A = [40, 130], B = [280, 130], C = [150, 40];
    let b = Ln(...A, ...B, 's-accent-line') + Ln(...A, ...C, 's-line s-dash') + Ln(...C, ...B, 's-line s-dash');
    b += [A, B, C].map(p => Dt(...p)).join('') + bold([A[0] - 14, A[1] + 5, 'A']) + bold([B[0] + 14, B[1] + 5, 'B']) + bold([C[0], C[1] - 12, 'C']);
    return rawSvg(320, 150, b);
  })();

  M.notion('distances', {
    lesson: {
      retenir: `<ul><li>La <b>distance</b> entre deux points A et B est la <b>longueur du segment [AB]</b>. On la note <b>AB</b>.</li><li>Le chemin le plus court pour aller de A à B est le segment [AB]. Donc, pour <b>tout point C</b> : <b>AC + CB ⩾ AB</b>.</li><li><b>AC + CB = AB</b> lorsque C appartient au segment [AB], et uniquement dans ce cas.</li><li>Le <b>milieu</b> I du segment [AB] est le point du segment [AB] situé à la même distance de A et de B : <b>IA = IB = AB ÷ 2</b>.</li><li>On peut construire un triangle avec trois longueurs seulement si <b>la plus grande est plus petite que la somme des deux autres</b>.</li></ul>`,
      explication: `${distFig}<p>Pour aller de A à B, le trajet en rouge (tout droit) est plus court que le détour par C (en pointillés) : AC + CB est plus grand que AB. Le détour n’a la même longueur que si C est <b>sur</b> le segment [AB].</p>`,
      methode: [
        'Pour savoir si C est sur le segment [AB] : calcule AC + CB et compare avec AB. Égal → C est sur [AB] ; plus grand → C n’est pas sur [AB].',
        'Pour placer le milieu de [AB] : mesure AB, divise par 2, et reporte cette longueur depuis A sur le segment (ou plie la feuille pour superposer A et B).',
        'Pour savoir si un triangle est constructible : repère la plus grande longueur et compare-la à la somme des deux autres.',
      ],
      exemples: [
        { q: 'I est le milieu de [AB] et AB = 7,4 cm. Combien mesure AI ?', r: 'AI = 7,4 ÷ 2 = <b>3,7 cm</b>.' },
        { q: 'AC = 3 cm, CB = 5 cm et AB = 8 cm. Le point C est-il sur le segment [AB] ?', r: 'AC + CB = 3 + 5 = 8 = AB, donc <b>oui</b>, C appartient à [AB].' },
        { q: 'Peut-on construire un triangle de côtés 3 cm, 4 cm et 9 cm ?', r: '3 + 4 = 7 et 7 &lt; 9 : les deux petits côtés ne peuvent pas se rejoindre. <b>Non</b>.' },
      ],
      astuces: ['Avec le compas, on peut reporter une distance sans la mesurer : on prend l’écartement AB et on le pose ailleurs.'],
      erreurs: [
        'Croire qu’un point situé à égale distance de A et de B est forcément le milieu de [AB] : il doit aussi être <b>sur</b> le segment.',
        'Pour un triangle, oublier le cas « égal » : avec 3 cm, 5 cm et 8 cm, les trois points sont alignés, ce n’est pas un vrai triangle.',
      ],
    },
    generate(level, rng) {
      const [P1, P2, Pm] = rng.pick(SEG_NAMES);
      if (level === 1) {
        const v = rng.int(0, 3);
        if (v === 0) {
          const ab = dec(rng.int(21, 199), 1), ai = div(ab, 2);
          const fig = segFig([{ t: 0, n: P1 }, { t: 0.5, n: Pm }, { t: 1, n: P2 }], [[0, 1, 1], [1, 2, 1]]);
          return Q(`di1m:${ab}`, `${fig}${Pm} est le milieu du segment [${P1}${P2}] et ${P1}${P2} = ${cm(ab)}. Combien mesure ${P1}${Pm} ?`, num(ai, 'cm'), 'Le milieu partage le segment en deux longueurs égales.', `${P1}${Pm} = ${P1}${P2} ÷ 2 = ${fmt(ab)} ÷ 2 = <b>${cm(ai)}</b>.`);
        }
        if (v === 1) {
          const am = dec(rng.int(11, 95), 1), ab = mul(am, 2);
          const fig = segFig([{ t: 0, n: P1 }, { t: 0.5, n: Pm }, { t: 1, n: P2 }], [[0, 1, 1], [1, 2, 1]]);
          return Q(`di1d:${am}`, `${fig}${Pm} est le milieu du segment [${P1}${P2}] et ${Pm}${P2} = ${cm(am)}. Combien mesure ${P1}${P2} ?`, num(ab, 'cm'), 'Le segment entier est formé de deux moitiés de même longueur.', `${P1}${Pm} = ${Pm}${P2} = ${cm(am)}, donc ${P1}${P2} = 2 × ${fmt(am)} = <b>${cm(ab)}</b>.`);
        }
        const a = rng.int(10, 80), b = rng.int(10, 80), ac = dec(a, 1), cb = dec(b, 1), ab = add(ac, cb);
        const fig = segFig([{ t: 0, n: P1 }, { t: a / (a + b), n: Pm }, { t: 1, n: P2 }]);
        if (v === 2) return Q(`di1s:${ac}:${cb}`, `${fig}Le point ${Pm} appartient au segment [${P1}${P2}]. ${P1}${Pm} = ${cm(ac)} et ${Pm}${P2} = ${cm(cb)}. Combien mesure ${P1}${P2} ?`, num(ab, 'cm'), `Le point ${Pm} est sur le segment : les deux morceaux mis bout à bout forment [${P1}${P2}].`, `${Pm} est sur [${P1}${P2}], donc ${P1}${P2} = ${P1}${Pm} + ${Pm}${P2} = ${fmt(ac)} + ${fmt(cb)} = <b>${cm(ab)}</b>.`);
        return Q(`di1r:${ac}:${cb}`, `${fig}Le point ${Pm} appartient au segment [${P1}${P2}]. ${P1}${P2} = ${cm(ab)} et ${P1}${Pm} = ${cm(ac)}. Combien mesure ${Pm}${P2} ?`, num(cb, 'cm'), `Le point ${Pm} est sur le segment : ${P1}${Pm} + ${Pm}${P2} = ${P1}${P2}.`, `${Pm}${P2} = ${P1}${P2} − ${P1}${Pm} = ${fmt(ab)} − ${fmt(ac)} = <b>${cm(cb)}</b>.`);
      }
      if (level === 2) {
        const v = rng.int(0, 2);
        if (v === 0) {
          const ac = dec(rng.int(15, 90), 1), cb = dec(rng.int(15, 90), 1), on = rng.chance(0.5);
          const s = add(ac, cb), ab = on ? s : sub(s, dec(rng.int(2, 15), 1));
          return Q(`di2o:${ac}:${cb}:${ab}`, `On sait que ${P1}${P2} = ${cm(ab)}, ${P1}${Pm} = ${cm(ac)} et ${Pm}${P2} = ${cm(cb)}.<br>Le point ${Pm} appartient-il au segment [${P1}${P2}] ?`, YN(on), `Compare ${P1}${Pm} + ${Pm}${P2} avec ${P1}${P2}.`,
            `${P1}${Pm} + ${Pm}${P2} = ${fmt(ac)} + ${fmt(cb)} = ${cm(s)}. ${on ? `C’est égal à ${P1}${P2} : <b>oui</b>, ${Pm} appartient au segment [${P1}${P2}].` : `C’est plus grand que ${P1}${P2} = ${cm(ab)} : le chemin qui passe par ${Pm} est un détour. <b>Non</b>, ${Pm} n’appartient pas au segment [${P1}${P2}].`}`);
        }
        if (v === 1) {
          const ac = dec(rng.int(10, 90), rng.int(0, 1)), cb = dec(rng.int(10, 90), rng.int(0, 1)), s = add(ac, cb);
          return Q(`di2x:${ac}:${cb}`, `${P1}${Pm} = ${cm(ac)} et ${Pm}${P2} = ${cm(cb)}. Le point ${Pm} peut être placé n’importe où.<br>Quelle est la <b>plus grande</b> valeur possible de la distance ${P1}${P2} ?`, num(s, 'cm'), 'Le chemin tout droit est toujours le plus court.', `Pour tout point ${Pm}, ${P1}${P2} ⩽ ${P1}${Pm} + ${Pm}${P2} = ${fmt(ac)} + ${fmt(cb)} = ${cm(s)}. On atteint cette valeur quand ${Pm} est sur le segment [${P1}${P2}] : la plus grande valeur est <b>${cm(s)}</b>.`);
        }
        const ab = dec(rng.int(20, 200), 1), far = rng.chance(0.5), J = Pm === 'K' ? 'L' : 'J';
        const val = far ? div(mul(ab, 3), 4) : div(ab, 4);
        const fig = segFig([{ t: 0, n: P1 }, { t: 0.25, n: J }, { t: 0.5, n: Pm }, { t: 1, n: P2 }], [[0, 1, 2], [1, 2, 2], [2, 3, 1]]);
        return Q(`di2j:${ab}:${far}`, `${fig}${Pm} est le milieu de [${P1}${P2}] et ${J} est le milieu de [${P1}${Pm}]. ${P1}${P2} = ${cm(ab)}. Combien mesure ${far ? `${J}${P2}` : `${P1}${J}`} ?`, num(val, 'cm'), `Calcule d’abord ${P1}${Pm}, puis utilise le deuxième milieu.`,
          `${P1}${Pm} = ${fmt(ab)} ÷ 2 = ${cm(div(ab, 2))}, puis ${P1}${J} = ${J}${Pm} = ${fmt(div(ab, 2))} ÷ 2 = ${cm(div(ab, 4))}.${far ? ` Enfin ${J}${P2} = ${J}${Pm} + ${Pm}${P2} = ${fmt(div(ab, 4))} + ${fmt(div(ab, 2))} = <b>${cm(val)}</b>.` : ` Donc ${P1}${J} = <b>${cm(val)}</b>.`}`);
      }
      // Level 3: constructing a triangle from three lengths.
      const v = rng.int(0, 2);
      const [A, B, C] = rng.pick([['A', 'B', 'C'], ['E', 'F', 'G'], ['R', 'S', 'T'], ['M', 'N', 'P']]);
      if (v === 0) {
        const k = rng.int(0, 1), a = rng.int(2, 12) * (k ? 10 : 1), b = rng.int(2, 12) * (k ? 10 : 1);
        const kind = rng.pick(['ok', 'ok', 'plat', 'non']);
        const c = kind === 'ok' ? rng.int(Math.abs(a - b) + 1, a + b - 1) : kind === 'plat' ? a + b : a + b + rng.int(1, 4) * (k ? 3 : 1);
        const L = [a, b, c].map(x => dec(x, k)), shown = rng.shuffle(L);
        const big = Math.max(...L), rest = L.slice().sort((x, y) => x - y).slice(0, 2), s = add(rest[0], rest[1]);
        const why = kind === 'ok' ? `${fmt(rest[0])} + ${fmt(rest[1])} = ${fmt(s)} et ${fmt(s)} &gt; ${fmt(big)} : la plus grande longueur est plus petite que la somme des deux autres. <b>Oui</b>, on peut construire ce triangle.`
          : kind === 'plat' ? `${fmt(rest[0])} + ${fmt(rest[1])} = ${fmt(s)} = ${fmt(big)} : les trois points seraient alignés (le troisième sommet tombe sur le plus grand côté). <b>Non</b>, ce n’est pas un vrai triangle.`
            : `${fmt(rest[0])} + ${fmt(rest[1])} = ${fmt(s)} et ${fmt(s)} &lt; ${fmt(big)} : les deux petits côtés sont trop courts pour se rejoindre. <b>Non</b>.`;
        return Q(`di3c:${shown.join(':')}`, `Peut-on construire un triangle dont les côtés mesurent ${cm(shown[0])}, ${cm(shown[1])} et ${cm(shown[2])} ?`, YN(kind === 'ok'), 'Repère la plus grande longueur et compare-la à la somme des deux autres.', why);
      }
      const a = rng.int(3, 15);
      let b = rng.int(3, 15);
      if (v === 2 && b === a) b = a + rng.int(1, 4);
      if (v === 1) {
        const ans = a + b - 1;
        return Q(`di3M:${a}:${b}`, `On veut construire un triangle ${A}${B}${C} avec ${A}${B} = ${cm(a)} et ${B}${C} = ${cm(b)}.<br>Quelle est la <b>plus grande</b> longueur ${A}${C}, en nombre entier de centimètres, qui permet de construire ce triangle ?`, num(ans, 'cm'), `Pour aller de ${A} à ${C}, passer par ${B} est un détour… qui doit rester un vrai détour.`,
          `Il faut ${A}${C} &lt; ${A}${B} + ${B}${C} = ${a} + ${b} = ${a + b} cm (si ${A}${C} = ${a + b} cm, le point ${B} serait sur le segment [${A}${C}]). La plus grande longueur entière possible est donc <b>${cm(ans)}</b>.`);
      }
      const big = Math.max(a, b), small = Math.min(a, b), ans = big - small + 1;
      return Q(`di3m:${a}:${b}`, `On veut construire un triangle ${A}${B}${C} avec ${A}${B} = ${cm(a)} et ${B}${C} = ${cm(b)}.<br>Quelle est la <b>plus petite</b> longueur ${A}${C}, en nombre entier de centimètres, qui permet de construire ce triangle ?`, num(ans, 'cm'), 'Chaque côté doit être plus petit que la somme des deux autres.',
        `Le côté de ${cm(big)} doit être plus petit que la somme des deux autres : ${big} &lt; ${small} + ${A}${C}, donc ${A}${C} doit dépasser ${big} − ${small} = ${big - small} cm. La plus petite longueur entière possible est <b>${cm(ans)}</b>.`);
    },
  });

  // =====================================================================
  // ANGLES : VOCABULAIRE
  // =====================================================================
  // Two secant lines through O; sector k (1..4) starts at rot; sector 1 measures x.
  function secantFig(x, rot, marks) {
    const O = [160, 105], R = 100;
    const starts = [rot, rot + x, rot + 180, rot + 180 + x], spans = [x, 180 - x, x, 180 - x];
    let b = Ln(...pol(O, R, rot), ...pol(O, R, rot + 180), 's-line s-thick') + Ln(...pol(O, R, rot + x), ...pol(O, R, rot + x + 180), 's-line s-thick');
    Object.keys(marks).forEach((k, i) => {
      const s = starts[k - 1], sp = spans[k - 1], r = i ? 30 : 24;
      b += arc(O, r, s, sp) + label(O, sp < 45 ? 62 : 50, s + sp / 2, marks[k]);
    });
    const free = [1, 2, 3, 4].filter(k => !(k in marks)).sort((u, w) => spans[w - 1] - spans[u - 1])[0], fa = starts[free - 1] + spans[free - 1] / 2;
    b += Dt(...O) + label(O, 22, fa, '<tspan font-weight="700">O</tspan>', 15);
    return rawSvg(320, 210, b);
  }
  // Half-lines from O with names; parts: [{a0, span, text}] arcs.
  function raysFig(O, rays, arcs, { w = 320, h = 190, base = null, oAt = null } = {}) {
    let b = base ? Ln(...base[0], ...base[1], 's-line s-thick') : '';
    rays.forEach(r => { b += Ln(...O, ...pol(O, r.len || 125, r.a), 's-line s-thick') + bold([...pol(O, (r.len || 125) + 14, r.a).map((v, i) => (i ? r1(v + 5) : v)), r.n]); });
    arcs.forEach(a => {
      b += arc(O, a.r, a.a0, a.span);
      if (a.code) b += arcCode(O, a.r, a.a0, a.span, a.code);
      if (a.text) b += label(O, a.lr || (a.span < 35 ? a.r + 34 : a.r + 20), a.a0 + a.span * (a.at || 0.5), a.text, 13);
    });
    b += Dt(...O) + (oAt === null ? bold([O[0], O[1] + 22, 'O']) : label(O, 15, oAt, '<tspan font-weight="700">O</tspan>', 14));
    return rawSvg(w, h, b);
  }
  const KIND_DEG = [['nul', 0], ['droit', 90], ['plat', 180], ['plein', 360]];
  const KINDS6 = ['nul', 'aigu', 'droit', 'obtus', 'plat', 'plein'];
  const kindOf = d => (d === 0 ? 'nul' : d < 90 ? 'aigu' : d === 90 ? 'droit' : d < 180 ? 'obtus' : d === 180 ? 'plat' : 'plein');
  const ANGLE_DEFS = [
    ['Deux angles dont la somme des mesures est égale à 180° sont…', 'supplémentaires'],
    ['Deux angles qui ont le même sommet, un côté commun, et qui sont situés de part et d’autre de ce côté sont…', 'adjacents'],
    ['Deux droites sécantes forment des angles qui ont le même sommet et dont les côtés sont dans le prolongement l’un de l’autre. Ces deux angles sont…', 'opposés par le sommet'],
  ];
  const vocabFig = (() => {
    const O = [160, 110];
    let b = Ln(...pol(O, 105, 20), ...pol(O, 105, 200), 's-line s-thick') + Ln(...pol(O, 105, 115), ...pol(O, 105, 295), 's-line s-thick');
    b += arc(O, 26, 20, 95) + arc(O, 26, 200, 95) + arcCode(O, 26, 20, 95, 1) + arcCode(O, 26, 200, 95, 1);
    b += label(O, 50, 67.5, '1') + label(O, 50, 247.5, '3') + label(O, 50, 157.5, '2', 13);
    b += Dt(...O);
    return rawSvg(320, 220, b);
  })();

  M.notion('angles-vocabulaire', {
    lesson: {
      retenir: `<ul><li>Angle <b>nul</b> : 0° ; angle <b>droit</b> : 90° ; angle <b>plat</b> : 180° (ses côtés forment une droite) ; angle <b>plein</b> : 360° (un tour complet). Un angle <b>aigu</b> mesure entre 0° et 90°, un angle <b>obtus</b> entre 90° et 180°.</li><li>Deux angles sont <b>adjacents</b> s’ils ont le <b>même sommet</b>, un <b>côté commun</b> et s’ils sont situés <b>de part et d’autre</b> de ce côté.</li><li>Deux droites sécantes forment deux paires d’angles <b>opposés par le sommet</b> : deux angles opposés par le sommet ont <b>la même mesure</b>.</li><li>Deux angles sont <b>supplémentaires</b> si la somme de leurs mesures est <b>180°</b>.</li></ul>`,
      explication: `${vocabFig}<p>Les angles 1 et 3 sont <b>opposés par le sommet</b> : ils ont la même mesure (même codage). Les angles 1 et 2 sont <b>adjacents</b>, et ensemble ils forment un angle plat : ils sont <b>supplémentaires</b>.</p>`,
      methode: [
        'Pour un angle opposé par le sommet à un angle connu : il a la même mesure.',
        'Pour deux angles adjacents qui forment un angle plat : l’angle cherché = 180° − l’angle connu.',
        'Plusieurs angles adjacents qui remplissent un angle plat font 180° en tout ; ceux qui font le tour d’un point font 360°.',
      ],
      exemples: [
        { q: 'Deux droites sécantes forment un angle de 65°. Combien mesure l’angle opposé par le sommet ? Et un angle adjacent ?', r: 'L’angle opposé mesure aussi <b>65°</b> ; un angle adjacent mesure 180 − 65 = <b>115°</b>.' },
        { q: 'Un angle mesure 72°. Combien mesure un angle qui lui est supplémentaire ?', r: '180 − 72 = <b>108°</b>.' },
      ],
      astuces: ['Plie une feuille en deux (angle plat), puis encore en deux : tu obtiens un angle droit. Déplie : quatre angles droits font un angle plein.'],
      erreurs: ['Croire que deux angles adjacents sont toujours supplémentaires : il faut en plus que leur somme fasse 180°.', 'Confondre « opposés par le sommet » (même mesure) et « adjacents » (côte à côte).'],
    },
    generate(level, rng) {
      if (level === 1) {
        const v = rng.int(0, 2);
        if (v === 0) {
          const d = rng.pick([0, 360, 180, 90, rng.int(5, 85), rng.int(95, 175)]);
          return Q(`av1k:${d}`, `Un angle mesure ${deg(d)}. C’est un angle :`, fixedChoice(KINDS6, kindOf(d)), 'Repères : 0°, 90°, 180° et 360°.', `${deg(d)} : c’est un angle <b>${kindOf(d)}</b>.`);
        }
        if (v === 1) {
          const [k, d] = rng.pick(KIND_DEG);
          return Q(`av1m:${k}`, `Combien mesure un angle <b>${k}</b> ?`, num(d, '°'), 'Pense à un quart de tour, un demi-tour, un tour complet…', `Un angle ${k} mesure <b>${deg(d)}</b>${k === 'plein' ? ' (un tour complet)' : k === 'plat' ? ' (un demi-tour)' : k === 'droit' ? ' (un quart de tour)' : ''}.`);
        }
        const [txt, good] = rng.pick(ANGLE_DEFS);
        return Q(`av1d:${good}`, txt, fixedChoice(['adjacents', 'opposés par le sommet', 'supplémentaires'], good), 'Relis les définitions de la leçon.', `Ce sont des angles <b>${good}</b>.`);
      }
      if (level === 2) {
        let x = rng.int(25, 155);
        if (x > 80 && x < 100) x += 25;
        const rot = rng.int(0, 179), g = rng.int(1, 4), k = rng.pick([1, 2, 3, 4].filter(n => n !== g));
        const xg = g % 2 ? x : 180 - x, opp = (k - g) % 2 === 0;
        if (rng.chance(0.3)) {
          const good = opp ? 'opposés par le sommet' : 'adjacents et supplémentaires';
          return Q(`av2i:${x}:${rot}:${g}:${k}`, `${secantFig(x, rot, { [g]: '1', [k]: '2' })}Les deux droites sont sécantes en O. Les angles 1 et 2 sont :`, fixedChoice(['adjacents et supplémentaires', 'opposés par le sommet'], good), 'Ont-ils un côté commun ?', opp ? 'Ils ont le même sommet et leurs côtés sont dans le prolongement l’un de l’autre : ils sont <b>opposés par le sommet</b> (et donc de même mesure).' : 'Ils ont un côté commun et sont de part et d’autre de ce côté : ils sont <b>adjacents</b>. Ensemble ils forment un angle plat, ils sont aussi <b>supplémentaires</b>.');
        }
        const ans = opp ? xg : 180 - xg;
        return Q(`av2:${x}:${rot}:${g}:${k}`, `${secantFig(x, rot, { [g]: deg(xg), [k]: '?' })}Les deux droites sont sécantes en O. Combien mesure l’angle marqué « ? » ?`, num(ans, '°'), 'Les deux angles sont-ils opposés par le sommet ou adjacents ?',
          opp ? `Les deux angles sont <b>opposés par le sommet</b> : ils ont la même mesure, <b>${deg(ans)}</b>.` : `Les deux angles sont adjacents et forment ensemble un angle plat : ils sont <b>supplémentaires</b>. 180 − ${xg} = <b>${deg(ans)}</b>.`);
      }
      const v = rng.int(0, 2);
      if (v === 0) {
        let p1, p2, p3;
        do { p1 = rng.int(25, 110); p2 = rng.int(25, 130); p3 = 180 - p1 - p2; } while (p3 < 25);
        const ask = rng.int(0, 2), parts = [p1, p2, p3];
        const names = [hat('B', 'O', 'C'), hat('C', 'O', 'D'), hat('D', 'O', 'A')];
        const O = [160, 165];
        const fig = raysFig(O, [{ a: 0, n: 'B', len: 130 }, { a: 180, n: 'A', len: 130 }, { a: p1, n: 'C', len: 120 }, { a: p1 + p2, n: 'D', len: 120 }],
          [{ a0: 0, span: p1, r: 28, text: ask === 0 ? '?' : deg(p1) }, { a0: p1, span: p2, r: 34, text: ask === 1 ? '?' : deg(p2) }, { a0: p1 + p2, span: p3, r: 28, text: ask === 2 ? '?' : deg(p3) }], { h: 195 });
        const known = [0, 1, 2].filter(i => i !== ask);
        return Q(`av3p:${p1}:${p2}:${ask}`, `${fig}Les points A, O et B sont alignés. ${names[known[0]]} = ${deg(parts[known[0]])} et ${names[known[1]]} = ${deg(parts[known[1]])}. Combien mesure ${names[ask]} ?`, num(parts[ask], '°'), 'Que vaut l’angle formé par A, O et B, qui sont alignés ?',
          `A, O et B sont alignés : ${hat('A', 'O', 'B')} est un angle plat (180°), rempli par les trois angles adjacents. ${names[ask]} = 180 − ${parts[known[0]]} − ${parts[known[1]]} = <b>${deg(parts[ask])}</b>.`);
      }
      if (v === 1) {
        let p;
        do { p = [rng.int(40, 140), rng.int(40, 140), rng.int(40, 140)]; p.push(360 - p[0] - p[1] - p[2]); } while (p[3] < 40 || p[3] > 150);
        const rot = rng.int(0, 89), ask = rng.int(0, 3), L = ['E', 'F', 'G', 'H'];
        const starts = [rot, rot + p[0], rot + p[0] + p[1], rot + p[0] + p[1] + p[2]];
        const names = [0, 1, 2, 3].map(i => hat(L[i], 'O', L[(i + 1) % 4]));
        const fig = raysFig([160, 110], L.map((n, i) => ({ a: starts[i], n, len: 85 })), p.map((s, i) => ({ a0: starts[i], span: s, r: i % 2 ? 30 : 24, text: i === ask ? '?' : deg(s), lr: 55 })), { h: 220, oAt: (() => { const m = p.indexOf(Math.max(...p)); return starts[m] + p[m] / 2; })() });
        const known = [0, 1, 2, 3].filter(i => i !== ask);
        return Q(`av3t:${p.join(':')}:${ask}:${rot}`, `${fig}${known.map(i => `${names[i]} = ${deg(p[i])}`).join(', ')}. Combien mesure ${names[ask]} ?`, num(p[ask], '°'), 'Les quatre angles font le tour complet du point O.',
          `Les quatre angles adjacents font le tour du point O : ensemble, ils forment un angle plein de 360°. ${names[ask]} = 360 − ${known.map(i => p[i]).join(' − ')} = <b>${deg(p[ask])}</b>.`);
      }
      if (rng.chance(0.5)) {
        const x = add(rng.int(15, 170), rng.pick([0.5, 0.5, 0.2, 0.8])), ans = sub(180, x);
        return Q(`av3s:${x}`, `Deux angles sont supplémentaires. L’un mesure ${deg(x)}. Combien mesure l’autre ?`, num(ans, '°'), 'Deux angles supplémentaires totalisent un angle plat.', `La somme doit faire 180° : 180 − ${fmt(x)} = <b>${deg(ans)}</b>.`);
      }
      const k = rng.int(2, 5), small = 180 / (k + 1), big = k * small, askBig = rng.chance(0.5);
      const word = { 2: 'deux fois', 3: 'trois fois', 4: 'quatre fois', 5: 'cinq fois' }[k];
      return Q(`av3k:${k}:${askBig}`, `Les angles ${hat('x', 'O', 'y')} et ${hat('y', 'O', 'z')} sont supplémentaires, et ${hat('x', 'O', 'y')} est ${word} plus grand que ${hat('y', 'O', 'z')} (${hat('x', 'O', 'y')} = ${k} × ${hat('y', 'O', 'z')}). Combien mesure ${askBig ? hat('x', 'O', 'y') : hat('y', 'O', 'z')} ?`, num(askBig ? big : small, '°'), 'Compte combien de « petits angles » il faut pour faire 180°.',
        `${hat('y', 'O', 'z')} compte pour 1 part et ${hat('x', 'O', 'y')} pour ${k} parts : ${k + 1} parts font 180°. Une part : 180 ÷ ${k + 1} = ${small}°, donc ${hat('y', 'O', 'z')} = ${small}° et ${hat('x', 'O', 'y')} = ${k} × ${small} = ${big}°. Réponse : <b>${deg(askBig ? big : small)}</b>.`);
    },
  });

  // =====================================================================
  // BISSECTRICE
  // =====================================================================
  const bisLesson = (() => {
    const O = [160, 150], a = 100, r0 = 40;
    return raysFig(O, [{ a: r0, n: 'x' }, { a: r0 + a, n: 'y' }, { a: r0 + a / 2, n: 'z' }],
      [{ a0: r0, span: a / 2, r: 36, code: 1 }, { a0: r0 + a / 2, span: a / 2, r: 36, code: 1 }], { h: 175 });
  })();

  M.notion('bissectrice', {
    lesson: {
      retenir: `La <b>bissectrice</b> d’un angle est la droite qui partage cet angle en <b>deux angles adjacents de même mesure</b>.<br>Si [Oz) est la bissectrice de ${hat('x', 'O', 'y')}, alors <b>${hat('x', 'O', 'z')} = ${hat('z', 'O', 'y')} = ${hat('x', 'O', 'y')} ÷ 2</b>. La bissectrice est l’<b>axe de symétrie</b> de l’angle.`,
      explication: `${bisLesson}<p>La demi-droite [Oz) coupe l’angle ${hat('x', 'O', 'y')} en deux angles égaux (même codage) : elle est portée par la bissectrice. Si on plie la feuille le long de [Oz), [Ox) vient se poser exactement sur [Oy).</p>`,
      methode: [
        'Par pliage : plie la feuille en passant par le sommet O pour que les deux côtés de l’angle se superposent ; le pli est la bissectrice.',
        'Au rapporteur : mesure l’angle, divise la mesure par 2, puis place la demi-droite qui fait cet angle avec l’un des côtés.',
        'Dans un calcul : la moitié de l’angle = l’angle ÷ 2, et l’angle entier = 2 × la moitié.',
      ],
      exemples: [
        { q: `[Oz) est la bissectrice de ${hat('x', 'O', 'y')} et ${hat('x', 'O', 'y')} = 70°. Combien mesure ${hat('x', 'O', 'z')} ?`, r: `70 ÷ 2 = <b>35°</b>.` },
        { q: `[Oz) est la bissectrice de ${hat('x', 'O', 'y')} et ${hat('z', 'O', 'y')} = 42°. Combien mesure ${hat('x', 'O', 'y')} ?`, r: `2 × 42 = <b>84°</b>.` },
        { q: 'Que fait la bissectrice d’un angle plat ?', r: 'Elle le coupe en deux angles de 180 ÷ 2 = 90° : elle est <b>perpendiculaire</b> à la droite.' },
      ],
      erreurs: ['Croire qu’une demi-droite tracée « au milieu » à l’œil est la bissectrice : il faut que les deux angles aient exactement la même mesure.', 'Oublier de diviser par 2 (ou de multiplier par 2) selon ce que l’on cherche.'],
    },
    generate(level, rng) {
      const O = [160, 150], xOy = hat('x', 'O', 'y'), xOz = hat('x', 'O', 'z'), zOy = hat('z', 'O', 'y');
      const fig3 = (a, rot, zAt, arcs) => raysFig(O, [{ a: rot, n: 'x' }, { a: rot + a, n: 'y' }, { a: rot + zAt, n: 'z' }], arcs, { h: 175 });
      const half = a => div(a, 2);
      if (level === 1 || (level === 2 && rng.chance(0.34))) {
        const fromWhole = level === 2 || rng.chance(0.5);
        if (fromWhole) {
          const a = level === 1 ? 2 * rng.int(15, 85) : 2 * rng.int(15, 84) + 1, rot = rng.int(0, 180 - a);
          const fig = fig3(a, rot, a / 2, [{ a0: rot, span: a / 2, r: 30, code: 1 }, { a0: rot + a / 2, span: a / 2, r: 30, code: 1 }, { a0: rot, span: a, r: 62, text: deg(a), at: 0.75, lr: 84 }]);
          return Q(`bi1w:${a}:${rot}`, `${fig}[Oz) est la bissectrice de l’angle ${xOy}, qui mesure ${deg(a)}. Combien mesure ${xOz} ?`, num(half(a), '°'), 'La bissectrice partage l’angle en deux angles égaux.', `${xOz} = ${xOy} ÷ 2 = ${a} ÷ 2 = <b>${deg(half(a))}</b>.`);
        }
        const b = rng.int(12, 85), a = 2 * b, rot = rng.int(0, 180 - a);
        const fig = fig3(a, rot, b, [{ a0: rot, span: b, r: 30, code: 1, text: deg(b), lr: b < 35 ? 80 : 58 }, { a0: rot + b, span: b, r: 30, code: 1 }, { a0: rot, span: a, r: 62, text: '?', at: 0.75, lr: 84 }]);
        return Q(`bi1h:${b}:${rot}`, `${fig}[Oz) est la bissectrice de l’angle ${xOy}, et ${xOz} = ${deg(b)}. Combien mesure ${xOy} ?`, num(a, '°'), 'L’angle entier est formé de deux angles égaux.', `${zOy} = ${xOz} = ${b}°, donc ${xOy} = 2 × ${b} = <b>${deg(a)}</b>.`);
      }
      if (level === 2) {
        if (rng.chance(0.5)) {
          const p = rng.int(20, 80), same = rng.chance(0.5), q = same ? p : p + rng.pick([-1, 1]) * rng.int(3, 8), rot = rng.int(0, 180 - p - q);
          const fig = fig3(p + q, rot, p, [{ a0: rot, span: p, r: 32, text: deg(p), lr: p < 35 ? 82 : 60 }, { a0: rot + p, span: q, r: 40, text: deg(q), lr: q < 35 ? 88 : 66 }]);
          return Q(`bi2a:${p}:${q}:${rot}`, `${fig}${xOz} = ${deg(p)} et ${zOy} = ${deg(q)}. La demi-droite [Oz) est-elle portée par la bissectrice de ${xOy} ?`, YN(same), 'Compare les deux angles situés de part et d’autre de [Oz).', same ? `Les deux angles adjacents ont la même mesure (${p}°) : <b>oui</b>, [Oz) partage ${xOy} en deux angles égaux.` : `${p}° ≠ ${q}° : les deux angles n’ont pas la même mesure. <b>Non</b>.`);
        }
        const a = 2 * rng.int(25, 85), h = a / 2, same = rng.chance(0.5), p = same ? h : h + rng.pick([-1, 1]) * rng.int(2, 6), rot = rng.int(0, 180 - a);
        const fig = fig3(a, rot, p, [{ a0: rot, span: p, r: 30, text: deg(p), lr: 56 }, { a0: rot, span: a, r: 62, text: deg(a), at: 0.8, lr: 84 }]);
        return Q(`bi2b:${a}:${p}:${rot}`, `${fig}${xOy} = ${deg(a)} et ${xOz} = ${deg(p)}. La demi-droite [Oz) est-elle portée par la bissectrice de ${xOy} ?`, YN(same), 'Quelle devrait être la mesure de chaque moitié ?', `Pour la bissectrice, il faudrait ${xOz} = ${a} ÷ 2 = ${h}°. ${same ? `C’est le cas : <b>oui</b>.` : `Ici ${xOz} = ${p}° et ${zOy} = ${a} − ${p} = ${a - p}° : <b>non</b>.`}`);
      }
      // Level 3: two-step problems.
      const v = rng.int(0, 2);
      if (v === 0) {
        const a = rng.int(40, 170), rot = rng.int(0, 180 - a), q = div(a, 4);
        const fig = raysFig(O, [{ a: rot, n: 'x' }, { a: rot + a, n: 'y' }, { a: rot + a / 2, n: 'z' }, { a: rot + a / 4, n: 't', len: 105 }],
          [{ a0: rot, span: a / 4, r: 26, code: 2 }, { a0: rot + a / 4, span: a / 4, r: 26, code: 2 }, { a0: rot, span: a / 2, r: 44, code: 1 }, { a0: rot + a / 2, span: a / 2, r: 44, code: 1 }, { a0: rot, span: a, r: 66, text: deg(a), at: 0.75, lr: 86 }], { h: 175 });
        return Q(`bi3q:${a}:${rot}`, `${fig}[Oz) est la bissectrice de ${xOy} et [Ot) est la bissectrice de ${xOz}. ${xOy} = ${deg(a)}. Combien mesure ${hat('x', 'O', 't')} ?`, num(q, '°'), `Calcule d’abord ${xOz}.`, `${xOz} = ${a} ÷ 2 = ${fmt(half(a))}°, puis ${hat('x', 'O', 't')} = ${fmt(half(a))} ÷ 2 = <b>${deg(q)}</b>.`);
      }
      const base = [[20, 150], [300, 150]];
      if (v === 1) {
        const a = 2 * rng.int(15, 75), b = 180 - a;
        const fig = raysFig(O, [{ a: 0, n: 'x', len: 140 }, { a: 180, n: 'w', len: 140 }, { a, n: 'y' }, { a: a / 2, n: 'z', len: 110 }, { a: a + b / 2, n: 't', len: 110 }],
          [{ a0: 0, span: a / 2, r: 30, code: 1 }, { a0: a / 2, span: a / 2, r: 30, code: 1 }, { a0: a, span: b / 2, r: 42, code: 2 }, { a0: a + b / 2, span: b / 2, r: 42, code: 2 }], { h: 175, base });
        return Q(`bi3r:${a}`, `${fig}Les demi-droites [Ox) et [Ow) forment un angle plat. ${xOy} = ${deg(a)}. [Oz) est la bissectrice de ${xOy} et [Ot) celle de ${hat('y', 'O', 'w')}. Combien mesure ${hat('z', 'O', 't')} ?`, num(90, '°'), `Calcule ${hat('y', 'O', 'w')}, puis les deux moitiés qui forment ${hat('z', 'O', 't')}.`,
          `${zOy} = ${a} ÷ 2 = ${a / 2}°. ${hat('y', 'O', 'w')} = 180 − ${a} = ${b}°, donc ${hat('y', 'O', 't')} = ${b} ÷ 2 = ${b / 2}°. ${hat('z', 'O', 't')} = ${a / 2} + ${b / 2} = <b>${deg(90)}</b>. (C’est toujours 90° : la moitié de 180°.)`);
      }
      const b = rng.int(20, 80), ans = 180 - 2 * b;
      const fig = raysFig(O, [{ a: 0, n: 'x', len: 140 }, { a: 180, n: 'w', len: 140 }, { a: 2 * b, n: 'y' }, { a: b, n: 'z', len: 115 }],
        [{ a0: 0, span: b, r: 30, code: 1, text: deg(b), lr: b < 35 ? 80 : 56 }, { a0: b, span: b, r: 30, code: 1 }, { a0: 2 * b, span: ans, r: 40, text: '?', lr: 62 }], { h: 175, base });
      return Q(`bi3w:${b}`, `${fig}Les demi-droites [Ox) et [Ow) forment un angle plat. [Oz) est la bissectrice de ${xOy} et ${xOz} = ${deg(b)}. Combien mesure ${hat('y', 'O', 'w')} ?`, num(ans, '°'), `Commence par trouver ${xOy}.`,
        `${xOy} = 2 × ${b} = ${2 * b}°. ${xOy} et ${hat('y', 'O', 'w')} forment l’angle plat ${hat('x', 'O', 'w')} : ${hat('y', 'O', 'w')} = 180 − ${2 * b} = <b>${deg(ans)}</b>.`);
    },
  });

  // =====================================================================
  // SOMME DES ANGLES D’UN TRIANGLE
  // =====================================================================
  // ang: [a0, a1, a2] at vertices 0, 1, 2 (sum 180). Drawn to scale, rotated, fitted in 320×220.
  function triFig(names, ang, { labels = ['', '', ''], ticks: tk = [], rot = 0, ext = null } = {}) {
    const [al, be] = ang, k = Math.sin(be * RAD) / Math.sin((al + be) * RAD);
    let P = [[0, 0], [1, 0], [k * Math.cos(al * RAD), k * Math.sin(al * RAD)]];
    if (ext) P.push([P[2][0] + 0.4 * (P[2][0] - P[1][0]), P[2][1] + 0.4 * (P[2][1] - P[1][1])]);
    P = P.map(([x, y]) => [x * Math.cos(rot * RAD) - y * Math.sin(rot * RAD), x * Math.sin(rot * RAD) + y * Math.cos(rot * RAD)]);
    const W = 320, H = 220, m = 36, xs = P.map(p => p[0]), ys = P.map(p => p[1]);
    const bw = Math.max(...xs) - Math.min(...xs), bh = Math.max(...ys) - Math.min(...ys);
    const sc = Math.min((W - 2 * m) / bw, (H - 2 * m) / bh);
    const ox = (W - sc * bw) / 2 - sc * Math.min(...xs), oy = (H - sc * bh) / 2 + sc * Math.max(...ys);
    const V = P.map(([x, y]) => [r1(ox + sc * x), r1(oy - sc * y)]);
    const G = [(V[0][0] + V[1][0] + V[2][0]) / 3, (V[0][1] + V[1][1] + V[2][1]) / 3];
    let b = `<polygon points="${V.slice(0, 3).map(p => p.join(',')).join(' ')}" class="s-soft s-line"/>`;
    if (ext) b += Ln(...V[2], ...V[3], 's-line s-thick') + Dt(...V[3]) + nameOut(V[3], V[2], ext.name);
    tk.forEach(([i, j, n]) => { b += ticks(V[i], V[j], n); });
    for (let i = 0; i < 3; i++) {
      const j = (i + 1) % 3, l = (i + 2) % 3;
      let a0 = dirOf(V[i], V[j]), a1 = dirOf(V[i], V[l]);
      if (norm360(a1 - a0) > 180) [a0, a1] = [a1, a0];
      const span = norm360(a1 - a0);
      if (!labels[i]) continue;
      const near = Math.min(Math.hypot(V[j][0] - V[i][0], V[j][1] - V[i][1]), Math.hypot(V[l][0] - V[i][0], V[l][1] - V[i][1]));
      if (ang[i] === 90) b += rightMark(V[i], a0);
      else b += arc(V[i], Math.min(20, r1(0.22 * near)), a0, span);
      if (labels[i] !== '∟') b += label(V[i], r1(Math.min(ang[i] < 40 ? 56 : ang[i] < 60 ? 44 : 36, 0.36 * near)), a0 + span / 2, labels[i], 13);
    }
    if (ext) {
      const a0 = dirOf(V[2], V[3]), a1 = dirOf(V[2], V[0]), span = norm360(a1 - a0);
      b += arc(V[2], 18, a0, span) + label(V[2], 180 - ang[2] < 40 ? 50 : 38, a0 + span / 2, ext.label, 13);
    }
    V.slice(0, 3).forEach((p, i) => { b += nameOut(p, G, names[i]); });
    return rawSvg(W, H, b);
  }
  const TRI_NAMES = [['A', 'B', 'C'], ['E', 'F', 'G'], ['R', 'S', 'T'], ['M', 'N', 'P'], ['I', 'J', 'K']];
  const angAt = (n, i) => hat(n[(i + 1) % 3], n[i], n[(i + 2) % 3]);
  // Three copies of one triangle side by side: the three different angles meet at one point and fill a straight angle.
  const triLesson = (() => {
    const S0 = ([x, y]) => [20 + x, 125 - y];
    const P = [0, 0], Qp = [110, 0], R = [40, 80], P2 = [110, 0], Q2 = [220, 0], R2 = [150, 80];
    const tri = (pts, cl) => `<polygon points="${pts.map(S0).map(p => p.join(',')).join(' ')}" class="${cl} s-line"/>`;
    let b = Ln(10, 125, 310, 125, 's-line') + tri([P, Qp, R], 's-soft') + tri([R, R2, P2], 's-soft2') + tri([P2, Q2, R2], 's-soft');
    const C = S0(P2), a1 = Math.atan2(80, 40) / RAD, a2 = Math.atan2(80, -70) / RAD;
    b += arc(C, 22, 0, a1) + arc(C, 28, a1, a2 - a1) + arcCode(C, 28, a1, a2 - a1, 1) + arc(C, 22, a2, 180 - a2) + arcCode(C, 22, a2, 180 - a2, 2);
    b += arc(S0(P), 22, 0, a1) + arc(S0(R), 22, a1 + 180, a2 - a1) + arcCode(S0(R), 22, a1 + 180, a2 - a1, 1);   // same three angles in the first triangle
    return rawSvg(320, 140, b);
  })();
  const CONSTRUCT_FACTS = [
    ['Un triangle peut avoir deux angles obtus.', false, 'Deux angles obtus font déjà plus de 180°.'],
    ['Un triangle peut avoir deux angles droits.', false, 'Deux angles droits font déjà 180° : il ne resterait rien pour le troisième angle.'],
    ['Un triangle rectangle peut aussi être isocèle.', true, 'Ses deux angles aigus mesurent alors 45° chacun.'],
    ['Les deux angles aigus d’un triangle rectangle ont une somme de 90°.', true, '180 − 90 = 90.'],
    ['Un triangle équilatéral peut avoir un angle droit.', false, 'Ses trois angles mesurent 60°.'],
    ['Un triangle peut avoir trois angles aigus.', true, 'Par exemple 60°, 60° et 60°, ou 50°, 60° et 70°.'],
  ];

  M.notion('triangles-angles', {
    lesson: {
      retenir: `<ul><li>Dans un triangle, la <b>somme des mesures des trois angles</b> est égale à <b>180°</b>.</li><li>Triangle <b>rectangle</b> : un angle droit, et les deux autres angles ont une somme de 90°.</li><li>Triangle <b>isocèle</b> : ses deux <b>angles à la base</b> ont la même mesure.</li><li>Triangle <b>équilatéral</b> : ses trois angles mesurent <b>60°</b> chacun.</li><li>On peut construire un triangle si on connaît : les <b>trois longueurs</b> (lorsque c’est possible), <b>deux longueurs et l’angle compris</b> entre ces deux côtés, ou <b>une longueur et les deux angles</b> qui lui sont adjacents.</li></ul>`,
      explication: `${triLesson}<p>Trois triangles identiques accolés : les trois angles différents (marqués) se retrouvent côte à côte au même sommet et forment un <b>angle plat</b>. La somme des angles d’un triangle est donc 180°.</p>`,
      methode: [
        'Pour trouver le troisième angle : 180° − (somme des deux angles connus).',
        'Triangle isocèle, angle au sommet connu : (180° − angle au sommet) ÷ 2 pour chaque angle à la base.',
        'Triangle isocèle, un angle à la base connu : angle au sommet = 180° − 2 × angle à la base.',
        'Fais toujours un schéma à main levée avec les codages de l’énoncé.',
      ],
      exemples: [
        { q: `Dans le triangle ABC, ${hat('B', 'A', 'C')} = 50° et ${hat('A', 'B', 'C')} = 60°. Combien mesure ${hat('A', 'C', 'B')} ?`, r: '180 − 50 − 60 = <b>70°</b>.' },
        { q: `ABC est isocèle en A et ${hat('B', 'A', 'C')} = 40°. Combien mesure ${hat('A', 'B', 'C')} ?`, r: '180 − 40 = 140, et 140 ÷ 2 = <b>70°</b>.' },
        { q: 'Peut-on construire un triangle avec des angles de 100° et 90° ?', r: '<b>Non</b> : 100 + 90 = 190, c’est déjà plus que 180°.' },
      ],
      astuces: ['Vérifie ton résultat : les trois angles doivent faire 180° pile.'],
      erreurs: ['Dans un triangle isocèle, confondre l’angle au sommet (entre les deux côtés égaux) et les angles à la base.', 'Croire qu’on peut construire un triangle à partir de trois angles quelconques : leur somme doit faire 180°.'],
    },
    generate(level, rng) {
      const names = rng.pick(TRI_NAMES), rot = rng.int(0, 359);
      if (level === 1) {
        let a, b, c;
        do { a = rng.int(25, 130); b = rng.int(25, 130); c = 180 - a - b; } while (c < 25);
        const ang = [a, b, c], u = rng.int(0, 2), kn = [0, 1, 2].filter(i => i !== u);
        const fig = triFig(names, ang, { labels: ang.map((x, i) => (i === u ? '?' : deg(x))), rot });
        return Q(`ta1:${ang.join(':')}:${u}`, `${fig}Dans le triangle ${names.join('')}, ${angAt(names, kn[0])} = ${deg(ang[kn[0]])} et ${angAt(names, kn[1])} = ${deg(ang[kn[1]])}. Combien mesure ${angAt(names, u)} ?`, num(ang[u], '°'), 'Que vaut la somme des trois angles d’un triangle ?',
          `La somme des angles d’un triangle est 180° : ${angAt(names, u)} = 180 − ${ang[kn[0]]} − ${ang[kn[1]]} = <b>${deg(ang[u])}</b>.`);
      }
      // Place angle list so that vertex `top` gets `apexAng` (vertex order 0,1,2 stays cyclic).
      const place = (top, apexAng, other1, other2) => { const r = []; r[top] = apexAng; r[(top + 1) % 3] = other1; r[(top + 2) % 3] = other2; return r; };
      const isoFig = (top, ang, labels) => triFig(names, ang, { labels, rot, ticks: [[top, (top + 1) % 3, 1], [top, (top + 2) % 3, 1]] });
      if (level === 2) {
        const v = rng.pick([0, 0, 1, 1, 2, 2, 3]), top = rng.int(0, 2);
        if (v === 0) {
          const a = rng.int(25, 65), ang = place(top, 90, a, 90 - a), side = rng.chance(0.5) ? 1 : 2;
          const known = (top + side) % 3, ask = (top + 3 - side) % 3;
          const labels = ['', '', '']; labels[top] = '∟'; labels[known] = deg(ang[known]); labels[ask] = '?';
          return Q(`ta2r:${a}:${top}:${side}:${rot}`, `${triFig(names, ang, { labels, rot })}Le triangle ${names.join('')} est rectangle en ${names[top]} et ${angAt(names, known)} = ${deg(ang[known])}. Combien mesure ${angAt(names, ask)} ?`, num(ang[ask], '°'), 'Que mesure l’angle droit ? Et la somme des trois angles ?',
            `L’angle droit mesure 90°. ${angAt(names, ask)} = 180 − 90 − ${ang[known]} = <b>${deg(ang[ask])}</b>.`);
        }
        if (v === 1) {
          const a = 2 * rng.int(15, 65), bs = (180 - a) / 2, ang = place(top, a, bs, bs), ask = (top + rng.int(1, 2)) % 3;
          const labels = ['', '', '']; labels[top] = deg(a); labels[ask] = '?';
          return Q(`ta2a:${a}:${top}:${ask}:${rot}`, `${isoFig(top, ang, labels)}Le triangle ${names.join('')} est isocèle en ${names[top]} et ${angAt(names, top)} = ${deg(a)}. Combien mesure ${angAt(names, ask)} ?`, num(bs, '°'), 'Dans un triangle isocèle, que sais-tu des deux angles à la base ?',
            `Les deux angles à la base sont égaux et font ensemble 180 − ${a} = ${180 - a}°. Chacun mesure ${180 - a} ÷ 2 = <b>${deg(bs)}</b>.`);
        }
        if (v === 2) {
          const bs = rng.int(25, 75), a = 180 - 2 * bs, ang = place(top, a, bs, bs), kn = (top + rng.int(1, 2)) % 3;
          const labels = ['', '', '']; labels[top] = '?'; labels[kn] = deg(bs);
          return Q(`ta2b:${bs}:${top}:${kn}:${rot}`, `${isoFig(top, ang, labels)}Le triangle ${names.join('')} est isocèle en ${names[top]} et ${angAt(names, kn)} = ${deg(bs)}. Combien mesure ${angAt(names, top)} ?`, num(a, '°'), 'Les deux angles à la base ont la même mesure.',
            `Les deux angles à la base mesurent ${bs}° chacun. ${angAt(names, top)} = 180 − 2 × ${bs} = 180 − ${2 * bs} = <b>${deg(a)}</b>.`);
        }
        const ask = rng.int(0, 2), labels = ['', '', '']; labels[ask] = '?';
        return Q(`ta2e:${names.join('')}:${ask}`, `${triFig(names, [60, 60, 60], { labels, rot, ticks: [[0, 1, 1], [1, 2, 1], [2, 0, 1]] })}Le triangle ${names.join('')} est équilatéral. Combien mesure ${angAt(names, ask)} ?`, num(60, '°'), 'Les trois angles sont égaux, et leur somme est connue.',
          `Ses trois angles sont égaux et leur somme vaut 180° : 180 ÷ 3 = <b>${deg(60)}</b>.`);
      }
      // Level 3.
      const v = rng.int(0, 2);
      if (v === 0) {
        const top = rng.int(0, 2);
        if (rng.chance(0.5)) {
          const a = 2 * rng.int(15, 59) + 1, bs = div(180 - a, 2), ask = (top + rng.int(1, 2)) % 3;
          const labels = ['', '', '']; labels[top] = deg(a); labels[ask] = '?';
          return Q(`ta3a:${a}:${top}:${ask}:${rot}`, `${isoFig(top, place(top, a, bs, bs), labels)}Le triangle ${names.join('')} est isocèle en ${names[top]} et ${angAt(names, top)} = ${deg(a)}. Combien mesure ${angAt(names, ask)} ?`, num(bs, '°'), 'Que reste-t-il pour les deux angles à la base ? Partage équitablement.',
            `Les deux angles à la base font ensemble 180 − ${a} = ${180 - a}°. Chacun mesure ${180 - a} ÷ 2 = <b>${deg(bs)}</b>.`);
        }
        const bs = add(rng.int(30, 74), 0.5), a = sub(180, mul(2, bs)), kn = (top + rng.int(1, 2)) % 3;
        const labels = ['', '', '']; labels[top] = '?'; labels[kn] = deg(bs);
        return Q(`ta3b:${bs}:${top}:${kn}:${rot}`, `${isoFig(top, place(top, a, bs, bs), labels)}Le triangle ${names.join('')} est isocèle en ${names[top]} et ${angAt(names, kn)} = ${deg(bs)}. Combien mesure ${angAt(names, top)} ?`, num(a, '°'), 'Les deux angles à la base ont la même mesure.',
          `${angAt(names, top)} = 180 − 2 × ${fmt(bs)} = 180 − ${fmt(mul(2, bs))} = <b>${deg(a)}</b>.`);
      }
      if (v === 1) {
        const [A, B, C] = names, t = rng.int(0, 4);
        if (t === 4) {
          const [txt, val, why] = rng.pick(CONSTRUCT_FACTS);
          return Q(`ta3f:${txt}`, `Vrai ou faux ?<br><i>${txt}</i>`, fixedChoice(['Vrai', 'Faux'], val ? 'Vrai' : 'Faux'), 'Pense à la somme des angles d’un triangle.', `<b>${val ? 'Vrai' : 'Faux'}</b>. ${why}`);
        }
        let txt, ok, why;
        if (t === 0) {
          const a = rng.int(30, 100), b = rng.int(20, 120 - Math.min(a, 90)), s0 = 180 - a - b, ok0 = rng.chance(0.5);
          const c = ok0 && s0 > 0 ? s0 : s0 + rng.pick([-1, 1]) * rng.int(5, 20);
          const cc = c > 0 ? c : s0 + rng.int(5, 20);
          ok = a + b + cc === 180;
          txt = `${angAt(names, 0)} = ${deg(a)}, ${angAt(names, 1)} = ${deg(b)} et ${angAt(names, 2)} = ${deg(cc)}`;
          why = `${a} + ${b} + ${cc} = ${a + b + cc}. ${ok ? 'La somme fait bien 180° : <b>oui</b>.' : `La somme des angles d’un triangle doit faire 180°, pas ${a + b + cc}° : <b>non</b>.`}`;
        } else if (t === 1) {
          const L = rng.int(3, 9), ok0 = rng.chance(0.5), a = rng.int(40, 120), b = ok0 ? rng.int(15, 175 - a) : rng.int(Math.max(181 - a, 20), 200 - a);
          ok = a + b < 180;
          txt = `${A}${B} = ${cm(L)}, ${angAt(names, 0)} = ${deg(a)} et ${angAt(names, 1)} = ${deg(b)}`;
          why = `Les deux angles adjacents au côté [${A}${B}] font ${a} + ${b} = ${a + b}°. ${ok ? `C’est moins de 180° : il reste ${180 - a - b}° pour le troisième angle. <b>Oui</b>.` : 'C’est déjà au moins 180° : il ne reste rien pour le troisième angle, les deux côtés ne se rejoignent pas. <b>Non</b>.'}`;
        } else if (t === 2) {
          const x = rng.int(2, 9), y = rng.int(2, 9), kind = rng.pick(['ok', 'plat', 'non']);
          const z = kind === 'ok' ? rng.int(Math.abs(x - y) + 1, x + y - 1) : kind === 'plat' ? x + y : x + y + rng.int(1, 3);
          ok = kind === 'ok';
          const big = Math.max(x, y, z), s = x + y + z - big;
          txt = `${A}${B} = ${cm(x)}, ${B}${C} = ${cm(y)} et ${A}${C} = ${cm(z)}`;
          why = `Le plus grand côté mesure ${big} cm et la somme des deux autres ${s} cm. ${ok ? `${s} &gt; ${big} : <b>oui</b>.` : kind === 'plat' ? `${s} = ${big} : les trois points seraient alignés. <b>Non</b>.` : `${s} &lt; ${big} : <b>non</b>.`}`;
        } else {
          const x = rng.int(3, 9), y = rng.int(3, 9), a = rng.int(20, 160);
          ok = true;
          txt = `${A}${B} = ${cm(x)}, ${A}${C} = ${cm(y)} et ${angAt(names, 0)} = ${deg(a)}`;
          why = `On connaît deux côtés et l’angle compris entre eux : on trace l’angle de ${a}°, on reporte ${x} cm et ${y} cm sur ses côtés, puis on relie. <b>Oui</b>, c’est toujours possible.`;
        }
        return Q(`ta3c:${t}:${txt}`, `Peut-on construire un triangle ${A}${B}${C} tel que ${txt} ?`, YN(ok), 'Somme des angles, ou plus grand côté : vérifie ce qui est possible.', why);
      }
      let a, b;
      do { a = rng.int(30, 95); b = rng.int(30, 95); } while (a + b > 145);
      const c = 180 - a - b, ans = a + b, D = names[2] === 'K' ? 'L' : 'D';
      const fig = triFig(names, [a, b, c], { labels: [deg(a), deg(b), ''], rot: rng.int(-20, 20), ext: { name: D, label: '?' } });
      return Q(`ta3e:${a}:${b}`, `${fig}Les points ${names[1]}, ${names[2]} et ${D} sont alignés. ${angAt(names, 0)} = ${deg(a)} et ${angAt(names, 1)} = ${deg(b)}. Combien mesure ${hat(names[0], names[2], D)} ?`, num(ans, '°'), `Calcule d’abord le troisième angle du triangle, puis pense à l’angle plat en ${names[2]}.`,
        `${angAt(names, 2)} = 180 − ${a} − ${b} = ${c}°. ${names[1]}, ${names[2]} et ${D} sont alignés, donc ${angAt(names, 2)} et ${hat(names[0], names[2], D)} sont supplémentaires : ${hat(names[0], names[2], D)} = 180 − ${c} = <b>${deg(ans)}</b>.`);
    },
  });

  // =====================================================================
  // ASSEMBLAGES DE CUBES
  // =====================================================================
  // Height map h[i][j]: i = column from left to right, j = row from front (0) to back.
  // Heights never increase toward the front or toward the right, so the top of every column is visible.
  function heightMap(rng, nI, nJ, maxH, allowZero) {
    const h = Array.from({ length: nI }, () => Array(nJ).fill(0));
    for (let i = 0; i < nI; i++) {
      for (let j = nJ - 1; j >= 0; j--) {
        const ub = Math.min(i > 0 ? h[i - 1][j] : maxH, j < nJ - 1 ? h[i][j + 1] : maxH);
        const lo = !allowZero || i === 0 || j === nJ - 1 ? 1 : 0;
        h[i][j] = rng.int(Math.min(lo, ub), ub);
      }
    }
    return h;
  }
  const total = h => h.flat().reduce((s, x) => s + x, 0);
  // Cavalier perspective (receding edges at 45°), painter's algorithm: back to front, left to right, bottom to top.
  function cubesFig(h, s = 30) {
    const nI = h.length, nJ = h[0].length, maxH = Math.max(...h.flat()), d = Math.round(0.42 * s);
    const W = nI * s + nJ * d + 20, H = maxH * s + nJ * d + 20;
    const X = (i, j) => 10 + i * s + j * d, Y = (j, z) => H - 10 - z * s - j * d;
    const P = pts => `<polygon points="${pts.map(p => p.join(',')).join(' ')}" class="CL"/>`;
    let b = '';
    for (let j = nJ - 1; j >= 0; j--) {
      for (let i = 0; i < nI; i++) {
        for (let z = 0; z < h[i][j]; z++) {
          b += P([[X(i, j), Y(j, z)], [X(i, j) + s, Y(j, z)], [X(i, j) + s, Y(j, z + 1)], [X(i, j), Y(j, z + 1)]]).replace('CL', 's-soft s-line');
          b += P([[X(i, j), Y(j, z + 1)], [X(i, j) + s, Y(j, z + 1)], [X(i, j + 1) + s, Y(j + 1, z + 1)], [X(i, j + 1), Y(j + 1, z + 1)]]).replace('CL', 's-empty');
          b += P([[X(i, j) + s, Y(j, z)], [X(i, j + 1) + s, Y(j + 1, z)], [X(i, j + 1) + s, Y(j + 1, z + 1)], [X(i, j) + s, Y(j, z + 1)]]).replace('CL', 's-soft2 s-line');
        }
      }
    }
    return rawSvg(W, H, b);
  }
  // Top view: grid with the front row at the bottom; numbers = heights.
  function topView(h, { numbers = true, c = 26 } = {}) {
    const nI = h.length, nJ = h[0].length;
    let b = '';
    for (let i = 0; i < nI; i++) {
      for (let j = 0; j < nJ; j++) {
        const x = 5 + i * c, y = 5 + (nJ - 1 - j) * c;
        b += `<rect x="${x}" y="${y}" width="${c}" height="${c}" class="${h[i][j] ? 's-soft s-line' : 's-grid s-nofill'}"/>`;
        if (numbers && h[i][j]) b += T(x + c / 2, y + c / 2 + 5, h[i][j], { size: 14 });
      }
    }
    b += T(5 + (nI * c) / 2, nJ * c + 22, 'devant', { size: 12 });
    return rawSvg(nI * c + 10, nJ * c + 28, b);
  }
  // Side views: list of column heights from left to right.
  function sideView(cols, c = 22) {
    const H = Math.max(...cols);
    let b = '';
    cols.forEach((n, i) => { for (let z = 0; z < n; z++) b += `<rect x="${5 + i * c}" y="${5 + (H - 1 - z) * c}" width="${c}" height="${c}" class="s-soft s-line"/>`; });
    return rawSvg(cols.length * c + 10, H * c + 10, b);
  }
  const VIEWS = {
    face: h => h.map(col => Math.max(...col)),
    gauche: h => h[0].map((_, j) => Math.max(...h.map(col => col[j]))).reverse(),   // seen from the left: the back is on the left
    droite: h => h[0].map((_, j) => Math.max(...h.map(col => col[j]))),             // seen from the right: the front is on the left
  };
  const LETTERS = ['A', 'B', 'C', 'D'];
  const cubesNote = '<i>Les cubes sont empilés sans trou caché : chaque pile va jusqu’au sol, et on voit le dessus de chaque pile.</i><br>';
  const countCorrection = h => `${topView(h)}<p>Nombre de cubes de chaque pile (vue de dessus, le devant en bas) : ${h.flat().filter(x => x).join(' + ')} = <b>${fmt(total(h))}</b> cubes.</p>`;
  const lessonCubes = [[3, 2], [2, 1], [1, 1]];

  M.notion('vues-cubes', {
    lesson: {
      retenir: `<ul><li>Un assemblage de cubes peut être dessiné en <b>perspective cavalière</b> : les faces de devant sont dessinées en vraie grandeur, les arêtes qui partent vers l’arrière sont dessinées en biais et raccourcies.</li><li>On peut aussi le représenter par ses <b>vues</b> : <b>vue de dessus</b>, <b>vue de face</b>, <b>vue de gauche</b>, <b>vue de droite</b>. Une vue montre ce qu’on voit en regardant l’assemblage bien en face, de ce côté.</li><li>Une vue de dessus où l’on écrit dans chaque case le <b>nombre de cubes de la pile</b> décrit entièrement l’assemblage.</li></ul>`,
      explication: `<div class="nets"><div class="net"><b>Assemblage</b>${cubesFig(lessonCubes)}</div><div class="net"><b>Vue de dessus</b>${topView(lessonCubes)}</div><div class="net"><b>Vue de face</b>${sideView(VIEWS.face(lessonCubes))}</div></div><p>Dans la vue de dessus, chaque case est une pile : 3 + 2 + 2 + 1 + 1 + 1 = 10 cubes. La vue de face montre la hauteur de la pile la plus haute de chaque colonne.</p>`,
      methode: [
        'Pour compter les cubes : compte pile par pile (hauteur de chaque pile), puis additionne. Une vue de dessus avec les hauteurs aide beaucoup.',
        'Pour la vue de face : pour chaque colonne (de gauche à droite), dessine la hauteur de la pile la plus haute.',
        'Pour la vue de gauche ou de droite : imagine-toi de ce côté ; ce qui est devant l’assemblage se retrouve à ta droite (vue de gauche) ou à ta gauche (vue de droite).',
      ],
      exemples: [
        { q: 'Une vue de dessus porte les nombres 3, 2, 1 et 1. Combien y a-t-il de cubes ?', r: '3 + 2 + 1 + 1 = <b>7 cubes</b>.' },
        { q: 'Un assemblage de 7 cubes tient dans un pavé de 2 × 2 × 3 cubes. Combien de cubes faut-il ajouter pour remplir ce pavé ?', r: '2 × 2 × 3 = 12, et 12 − 7 = <b>5 cubes</b>.' },
      ],
      astuces: ['Commence par les piles de derrière : elles sont souvent en partie cachées, mais on voit leur dessus.'],
      erreurs: ['Ne compter que les faces visibles et oublier les cubes cachés sous ou derrière les autres.', 'Inverser gauche et droite dans les vues de côté.'],
    },
    generate(level, rng) {
      if (level === 1) {
        const nI = rng.int(2, 3), nJ = rng.int(1, 2), h = heightMap(rng, nI, nJ, 3, false), n = total(h);
        return Q(`vc1:${JSON.stringify(h)}`, `${cubesFig(h)}${cubesNote}Combien de cubes y a-t-il dans cet assemblage ?`, num(n), 'Compte pile par pile : combien de cubes dans chaque pile ?', countCorrection(h));
      }
      if (level === 2) {
        const nI = rng.int(3, 4), nJ = rng.int(2, 3), h = heightMap(rng, nI, nJ, rng.int(3, 4), true), n = total(h);
        const v = rng.int(0, 2);
        if (v === 0) return Q(`vc2:${JSON.stringify(h)}`, `${cubesFig(h, 26)}${cubesNote}Combien de cubes y a-t-il dans cet assemblage ?`, num(n), 'Compte pile par pile, sans oublier les piles de derrière.', countCorrection(h));
        if (v === 1) {
          const H = Math.max(...h.flat()), full = nI * nJ * H, add2 = full - n;
          return Q(`vc2p:${JSON.stringify(h)}`, `${cubesFig(h, 26)}${cubesNote}On veut compléter cet assemblage pour obtenir un pavé droit de ${nI} cubes de large, ${nJ} cubes de profondeur et ${H} cubes de haut. Combien de cubes faut-il ajouter ?`, num(add2), 'Combien de cubes faut-il pour le pavé entier ? Combien y en a-t-il déjà ?',
            `${countCorrection(h)}<p>Le pavé contient ${nI} × ${nJ} × ${H} = ${full} cubes. Il faut en ajouter ${full} − ${n} = <b>${fmt(add2)}</b>.</p>`);
        }
        const k = h.flat().filter(x => x).length;
        return Q(`vc2d:${JSON.stringify(h)}`, `${cubesFig(h, 26)}${cubesNote}Combien de carrés voit-on sur la <b>vue de dessus</b> de cet assemblage ?`, num(k), 'Sur la vue de dessus, chaque pile apparaît comme un seul carré.', `${topView(h, { numbers: false })}<p>Chaque pile donne un carré, quelle que soit sa hauteur : il y a <b>${fmt(k)}</b> carrés.</p>`);
      }
      // Level 3: pick the right view among drawings.
      const nI = rng.int(3, 4), nJ = rng.int(2, 3);
      let h, opts, good, kind;
      for (let tries = 0; ; tries++) {
        h = heightMap(rng, nI, nJ, rng.int(3, 4), tries < 20);
        kind = rng.pick(['dessus', 'dessus', 'face', 'gauche', 'droite']);
        let cands;
        if (kind === 'dessus') {
          const flipV = h.map(col => col.slice().reverse()), flipH = h.slice().reverse();
          const bump = h.map(col => col.slice()), bi = rng.int(0, nI - 1), bj = rng.int(0, nJ - 1);
          bump[bi][bj] = bump[bi][bj] > 1 ? bump[bi][bj] - 1 : bump[bi][bj] + 1;
          cands = [h, flipV, flipH, bump];
        } else {
          const right = VIEWS[kind](h), others = Object.keys(VIEWS).filter(k => k !== kind).map(k => VIEWS[k](h));
          const bump = right.slice(), bi = rng.int(0, right.length - 1);
          bump[bi] = bump[bi] > 1 ? bump[bi] - 1 : bump[bi] + 1;
          cands = [right, right.slice().reverse(), ...others, bump];
        }
        const seen = new Set(), uniq = [];
        cands.forEach(c => { const key = JSON.stringify(c); if (!seen.has(key)) { seen.add(key); uniq.push(c); } });
        if (uniq.length >= 3 || tries > 40) { opts = rng.shuffle(uniq.slice(0, 4)); good = LETTERS[opts.indexOf(uniq[0])]; break; }
      }
      const letters = LETTERS.slice(0, opts.length);
      const draw = kind === 'dessus' ? o => topView(o) : o => sideView(o);
      const what = { dessus: 'la vue de dessus (avec le nombre de cubes de chaque pile)', face: 'la vue de face', gauche: 'la vue de gauche', droite: 'la vue de droite' }[kind];
      const hint = { dessus: 'Le devant de l’assemblage est en bas de la vue de dessus. Compte la hauteur de chaque pile.', face: 'Regarde l’assemblage de face : pour chaque colonne, quelle est la pile la plus haute ?', gauche: 'Place-toi à gauche de l’assemblage : le devant se retrouve à ta droite.', droite: 'Place-toi à droite de l’assemblage : le devant se retrouve à ta gauche.' }[kind];
      const why = { dessus: 'Chaque case donne la hauteur de la pile ; le devant est en bas.', face: 'De face, on voit pour chaque colonne (de gauche à droite) la pile la plus haute.', gauche: 'Vue de gauche, l’arrière de l’assemblage est à gauche et le devant à droite.', droite: 'Vue de droite, le devant de l’assemblage est à gauche et l’arrière à droite.' }[kind];
      return Q(`vc3:${kind}:${JSON.stringify(h)}`, `${cubesFig(h, 26)}${cubesNote}Quelle figure représente ${what} de cet assemblage ?<div class="nets">${opts.map((o, i) => `<div class="net"><b>${letters[i]}</b>${draw(o)}</div>`).join('')}</div>`, fixedChoice(letters, good), hint, `C’est la figure <b>${good}</b>. ${why}`);
    },
  });

  // =====================================================================
  // EXPLANATIONS
  // =====================================================================
  const B = M.cat.BASE;
  M.explain('distances', [
    ['dessin', B],
    ['vie', '<p>Pour traverser un parc en diagonale, tout le monde coupe par la pelouse plutôt que de suivre les deux allées : le chemin <b>tout droit</b> est le plus court. Passer par un autre point (le kiosque, la fontaine…) ne raccourcit jamais le trajet, sauf si ce point est déjà sur le chemin direct.</p>'],
    ['etapes', '<p>Peut-on construire un triangle de côtés 4 cm, 6 cm et 11 cm ?</p><ol><li>Je repère la plus grande longueur : 11 cm.</li><li>J’additionne les deux autres : 4 + 6 = 10 cm.</li><li>Je compare : 10 &lt; 11, les deux petits côtés sont trop courts pour se rejoindre. <b>Non</b>.</li></ol><p>Avec 4, 6 et 10 : 4 + 6 = 10, les points seraient alignés : non plus. Avec 4, 6 et 9 : 10 &gt; 9, oui.</p>'],
  ]);
  M.explain('angles-vocabulaire', [
    ['dessin', B],
    ['vie', '<p>Ouvre une paire de ciseaux : les deux lames forment deux droites sécantes. Quand l’ouverture entre les poignées grandit, celle entre les lames grandit exactement autant : ce sont des angles <b>opposés par le sommet</b>. Et une lame avec la poignée voisine forme un demi-tour (180°) : deux angles côte à côte sur une droite sont <b>supplémentaires</b>.</p>'],
    ['lien', '<p>Tu connais déjà les angles droits (90°) et plats (180°). Tout le reste en découle : un tour complet, ce sont deux demi-tours, donc l’angle plein mesure 2 × 180 = 360°. Et si un angle plat est coupé en deux angles adjacents, l’un vaut 180° moins l’autre : 180 − 65 = 115.</p>'],
  ]);
  M.explain('bissectrice', [
    ['dessin', B],
    ['vie', '<p>Prends une part de pizza et coupe-la exactement en deux parts identiques en passant par la pointe : ton coup de couteau suit la <b>bissectrice</b> de l’angle de la part. Si la part fait un angle de 60°, chaque moitié fait 30°.</p>'],
    ['etapes', `<p>Pour tracer la bissectrice d’un angle de 130° au rapporteur :</p><ol><li>Je mesure l’angle : 130°.</li><li>Je divise par 2 : 130 ÷ 2 = 65°.</li><li>Je place le rapporteur sur le sommet, le zéro sur un côté, et je marque 65°.</li><li>Je trace la demi-droite depuis le sommet : je vérifie que l’autre moitié mesure aussi 65°.</li></ol>`],
  ]);
  M.explain('triangles-angles', [
    ['dessin', B],
    ['etapes', '<p>Découpe un triangle en papier, puis déchire ses trois coins. Pose les trois coins côte à côte, les pointes au même endroit : ils forment une ligne droite, un angle plat. C’est pour ça que la somme fait toujours 180°, quel que soit le triangle.</p>'],
    ['lien', '<p>Avec la somme 180°, on retrouve les angles des triangles particuliers. Équilatéral : trois angles égaux, donc 180 ÷ 3 = 60°. Rectangle : 180 − 90 = 90° pour les deux autres angles ensemble. Isocèle avec un angle au sommet de 40° : il reste 140° pour les deux angles à la base, soit 70° chacun.</p>'],
  ]);
  M.explain('vues-cubes', [
    ['dessin', B],
    ['vie', '<p>Imagine une ville vue depuis un hélicoptère : tu vois le toit de chaque immeuble, c’est la <b>vue de dessus</b>. Si tu écris sur chaque toit le nombre d’étages, tu sais tout de la ville. Depuis la rue, en face, tu vois les façades : c’est la <b>vue de face</b>, où seul l’immeuble le plus haut de chaque rangée dépasse.</p>'],
    ['etapes', '<p>Pour compter les cubes d’un assemblage :</p><ol><li>Je dessine la vue de dessus : une case par pile.</li><li>Dans chaque case, j’écris la hauteur de la pile (en comptant les cubes sur le côté visible).</li><li>J’additionne tous les nombres.</li></ol><p>Ainsi, je n’oublie pas les cubes cachés sous les autres.</p>'],
  ]);
})();
