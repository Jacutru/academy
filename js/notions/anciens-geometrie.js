// Géométrie des anciens programmes (et du programme actuel) : construire un triangle, cercle circonscrit,
// prismes droits et cylindres (patrons, perspective), agrandissement et réduction.
(function () {
  'use strict';
  const M = globalThis.M;
  const { fmt, dec, add, sub, mul, div } = M.u;
  const { frac, table } = M.h;
  const { Q, num, choice, fixedChoice } = M.kit;
  const { svg, text, line, poly, dot } = M.svg.raw;
  const TF = b => fixedChoice(['Vrai', 'Faux'], b ? 'Vrai' : 'Faux');
  const cm = v => `${fmt(v)} cm`;
  const deg = v => `${fmt(v)}°`;
  // Angle BAC written BÂC (circumflex on the vertex letter).
  const hat = (a, b, c) => `${a}${b}̂${c}`;

  // ---------- Plane geometry helpers (screen coordinates, y pointing down) ----------
  const RAD = Math.PI / 180;
  const r1 = v => Math.round(v * 10) / 10;
  const pt = p => `${r1(p[0])},${r1(p[1])}`;
  const seg = (p, q, cls = 's-line') => line(r1(p[0]), r1(p[1]), r1(q[0]), r1(q[1]), cls);
  const lab = (x, y, s, opt = {}) => text(r1(x), r1(y), s, { cls: 's-text s-bold', ...opt });
  const vsub = (p, q) => [p[0] - q[0], p[1] - q[1]];
  const unit = v => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
  const along = (p, v, t) => [p[0] + v[0] * t, p[1] + v[1] * t];
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
  const centroid = P => [P.reduce((s, p) => s + p[0], 0) / P.length, P.reduce((s, p) => s + p[1], 0) / P.length];
  // Vertex label just outside the figure, away from the centre c.
  const labOut = (p, c, s, d = 14) => { const u = unit(vsub(p, c)); return lab(p[0] + u[0] * d, p[1] + u[1] * d + 5, s); };
  // Label of side [PQ], placed outside (away from c).
  function sideLab(p, q, c, s, d = 13) {
    const m = mid(p, q);
    let u = unit([-(q[1] - p[1]), q[0] - p[0]]);
    if ((m[0] - c[0]) * u[0] + (m[1] - c[1]) * u[1] < 0) u = [-u[0], -u[1]];
    // Steep side: the label sits beside it (anchored on the side), not centred across it.
    const anchor = Math.abs(u[0]) > 0.6 ? (u[0] > 0 ? 'start' : 'end') : 'middle', dd = anchor === 'middle' ? d : 7;
    return text(r1(m[0] + u[0] * dd), r1(m[1] + u[1] * dd + 5), s, { size: 13, anchor });
  }
  // Right-angle mark at o, between the directions of a and b.
  function rightMark(o, a, b, s = 10, cls = 's-accent-line') {
    const u = unit(vsub(a, o)), v = unit(vsub(b, o));
    const p1 = along(o, u, s), p3 = along(o, v, s), p2 = along(p1, v, s);
    return `<polyline points="${[p1, p2, p3].map(pt).join(' ')}" class="${cls}"/>`;
  }
  // Arc marking the angle UVW at V (inside the angle), with an optional label.
  function angArc(V, U, W, label = '', r = 20) {
    const a1 = Math.atan2(U[1] - V[1], U[0] - V[0]), a2 = Math.atan2(W[1] - V[1], W[0] - V[0]);
    let d = a2 - a1;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d <= -Math.PI) d += 2 * Math.PI;
    const p1 = [V[0] + r * Math.cos(a1), V[1] + r * Math.sin(a1)], p2 = [V[0] + r * Math.cos(a2), V[1] + r * Math.sin(a2)];
    let b = `<path d="M${pt(p1)} A${r},${r} 0 0 ${d > 0 ? 1 : 0} ${pt(p2)}" class="s-accent-line"/>`;
    if (label) {
      const am = a1 + d / 2, R = r + 15;
      b += text(r1(V[0] + R * Math.cos(am)), r1(V[1] + R * Math.sin(am) + 5), label, { size: 12 });
    }
    return b;
  }
  // Short arc of the circle (centre c, radius r) around the point P (compass mark).
  function arcAround(c, r, P, span) {
    const a0 = Math.atan2(P[1] - c[1], P[0] - c[0]), s = (span * RAD) / 2;
    const p1 = [c[0] + r * Math.cos(a0 - s), c[1] + r * Math.sin(a0 - s)], p2 = [c[0] + r * Math.cos(a0 + s), c[1] + r * Math.sin(a0 + s)];
    return `<path d="M${pt(p1)} A${r1(r)},${r1(r)} 0 0 1 ${pt(p2)}" class="s-accent-line"/>`;
  }
  // Part of the line through p (direction d) inside the box [m, W − m] × [m, H − m].
  function clip(p, d, W, H, m = 6) {
    let t0 = -1e9, t1 = 1e9;
    [[0, W], [1, H]].forEach(([k, size]) => {
      if (Math.abs(d[k]) < 1e-9) return;
      const a = (m - p[k]) / d[k], b = (size - m - p[k]) / d[k];
      t0 = Math.max(t0, Math.min(a, b)); t1 = Math.min(t1, Math.max(a, b));
    });
    return [along(p, d, t0), along(p, d, t1)];
  }
  // Fits points given in cm (maths orientation, y up) into a W × H box (screen coordinates).
  function fit(pts, W, H, m = 30, scale) {
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const s = scale || Math.min((W - 2 * m) / ((x1 - x0) || 1), (H - 2 * m) / ((y1 - y0) || 1));
    const ox = (W - (x1 - x0) * s) / 2, oy = (H - (y1 - y0) * s) / 2;
    return pts.map(p => [ox + (p[0] - x0) * s, H - oy - (p[1] - y0) * s]);
  }
  // Triangles in cm, maths orientation. sas: vertex, then the two other points.
  const sasPts = (p, q, a) => [[0, 0], [p, 0], [q * Math.cos(a * RAD), q * Math.sin(a * RAD)]];
  // asa: side [UV] of length x, angle a at U, angle b at V.
  const asaPts = (x, a, b) => { const t = (x * Math.sin(b * RAD)) / Math.sin((a + b) * RAD); return [[0, 0], [x, 0], [t * Math.cos(a * RAD), t * Math.sin(a * RAD)]]; };
  // sss: |P0P1| = c, |P0P2| = b, |P1P2| = a.
  const sssPts = (c, b, a) => { const x = (b * b + c * c - a * a) / (2 * c); return [[0, 0], [c, 0], [x, Math.sqrt(Math.max(0, b * b - x * x))]]; };
  // Reorders construction points: order[k] is the vertex index receiving coords[k].
  const place = (order, coords) => { const out = []; order.forEach((i, k) => { out[i] = coords[k]; }); return out; };

  // Triangle sketch: sides { '01': label }, angles { 0: label } (vertex indices).
  function triSketch(names, pts, { sides = {}, angles = {}, W = 190, H = 150 } = {}) {
    const S = fit(pts, W, H, 32), G = centroid(S);
    let b = poly(S, 's-soft s-line');
    Object.entries(angles).forEach(([k, l]) => { const i = +k; b += angArc(S[i], S[(i + 1) % 3], S[(i + 2) % 3], l); });
    Object.entries(sides).forEach(([k, l]) => { b += sideLab(S[+k[0]], S[+k[1]], G, l); });
    names.forEach((n, i) => { b += labOut(S[i], G, n); });
    return svg(W, H, b);
  }
  const FIG = ['Figure 1', 'Figure 2', 'Figure 3', 'Figure 4'];
  // Candidates [{ svg, ok }] → shuffled gallery + answer.
  function gallery(rng, cands) {
    const sh = rng.shuffle(cands), k = sh.findIndex(c => c.ok), opts = FIG.slice(0, sh.length);
    return { html: `<div class="nets">${sh.map((c, i) => `<div class="net"><b>${opts[i]}</b>${c.svg}</div>`).join('')}</div>`, answer: fixedChoice(opts, opts[k]), good: opts[k] };
  }

  const NAMES = [['A', 'B', 'C'], ['D', 'E', 'F'], ['R', 'S', 'T'], ['M', 'N', 'P'], ['I', 'J', 'K'], ['E', 'F', 'G'], ['U', 'V', 'W'], ['K', 'L', 'M']];
  // Names of a triangle: base = display order, n = roles (shuffled), sn = segment name in display order.
  function triNames(rng) {
    const base = rng.pick(NAMES), n = rng.shuffle(base);
    const sn = (p, q) => (base.indexOf(p) < base.indexOf(q) ? p + q : q + p);
    const angAt = i => hat(n[(i + 1) % 3], n[i], n[(i + 2) % 3]);
    return { base, n, tn: base.join(''), sn, angAt };
  }

  // =====================================================================
  // CONSTRUIRE UN TRIANGLE
  // =====================================================================
  const constrFig = (() => {
    const s = 30, A = [40, 165], B = [40 + 6 * s, 165];
    const C = [A[0] + 2.25 * s, A[1] - Math.sqrt(16 - 2.25 * 2.25) * s];
    let b = poly([A, B, C], 's-line s-nofill') + arcAround(A, 4 * s, C, 50) + arcAround(B, 5 * s, C, 40);
    b += dot(...A) + dot(...B) + dot(...C);
    b += text((A[0] + B[0]) / 2, 187, '6 cm', { size: 13 }) + text(r1((A[0] + C[0]) / 2 - 10), r1((A[1] + C[1]) / 2), '4 cm', { anchor: 'end', size: 13 }) + text(r1((B[0] + C[0]) / 2 + 10), r1((B[1] + C[1]) / 2), '5 cm', { anchor: 'start', size: 13 });
    b += lab(A[0] - 14, A[1] + 5, 'A') + lab(B[0] + 14, B[1] + 5, 'B') + lab(C[0], C[1] - 22, 'C');
    return svg(270, 195, b);
  })();
  const CASES = ['trois longueurs', 'deux longueurs et l’angle compris entre elles', 'une longueur et les deux angles qui lui sont adjacents'];
  const INSTR = { sss: 'une règle graduée et un compas', sas: 'une règle graduée et un rapporteur', asa: 'une règle graduée et un rapporteur' };
  const INSTR_BAD = ['une équerre et un compas', 'un rapporteur seulement', 'un compas seulement'];
  function sssVals(rng) {
    for (;;) {
      const x = rng.int(4, 9), y = rng.int(3, 8), z = rng.int(Math.abs(x - y) + 1, x + y - 1);
      if (new Set([x, y, z]).size === 3) return [x, y, z];
    }
  }
  function sasVals(rng) {
    let x, y;
    do { x = rng.int(3, 9); y = rng.int(3, 9); } while (Math.abs(x - y) < 2 || Math.max(x, y) > 2 * Math.min(x, y));
    let a;
    do { a = 5 * rng.int(6, 26); } while (a === 90 || a === 60);
    return [x, y, a];
  }
  function asaVals(rng) {
    let a, b;
    do { a = 5 * rng.int(5, 17); b = 5 * rng.int(5, 17); } while (Math.abs(a - b) < 15);
    return [rng.int(4, 9), a, b];
  }
  // Data sentence for each case; vertex roles: n[0] is the main vertex, [n0 n1] the first side.
  function dataText(kind, T, v) {
    const { n, sn, angAt } = T;
    if (kind === 'sss') return `${sn(n[0], n[1])} = ${cm(v[0])}, ${sn(n[0], n[2])} = ${cm(v[1])} et ${sn(n[1], n[2])} = ${cm(v[2])}`;
    if (kind === 'sas') return `${sn(n[0], n[1])} = ${cm(v[0])}, ${sn(n[0], n[2])} = ${cm(v[1])} et ${angAt(0)} = ${deg(v[2])}`;
    return `${sn(n[0], n[1])} = ${cm(v[0])}, ${angAt(0)} = ${deg(v[1])} et ${angAt(1)} = ${deg(v[2])}`;
  }
  const valsOf = (kind, rng) => (kind === 'sss' ? sssVals(rng) : kind === 'sas' ? sasVals(rng) : asaVals(rng));
  // Construction programme: [{ ok, bad: [...], why }].
  function constrSteps(kind, T, v) {
    const { n, sn } = T, [A, B, C] = n, AB = sn(A, B), AC = sn(A, C), BC = sn(B, C);
    if (kind === 'sss') {
      const [x, y, z] = v;
      return [
        { ok: `Tracer le segment [${AB}] de ${cm(x)}.`, bad: [`Placer le point ${C}.`, `Tracer un arc de cercle de centre ${C} et de rayon ${cm(y)}.`, `Tracer un angle de ${x}° avec le rapporteur.`], why: 'On commence par un côté en vraie grandeur : ses deux extrémités serviront de centres pour le compas.' },
        { ok: `Tracer un arc de cercle de centre ${A} et de rayon ${cm(y)}.`, bad: [`Tracer un arc de cercle de centre ${A} et de rayon ${cm(z)}.`, `Tracer un arc de cercle de centre ${A} et de rayon ${cm(x)}.`, `Tracer la perpendiculaire à (${AB}) passant par ${A}.`, `Tracer un angle de ${y}° en ${A} avec le rapporteur.`], why: `Le point ${C} est à ${cm(y)} de ${A} : il est sur le cercle de centre ${A} et de rayon ${cm(y)}.` },
        { ok: `Tracer un arc de cercle de centre ${B} et de rayon ${cm(z)}.`, bad: [`Tracer un arc de cercle de centre ${B} et de rayon ${cm(y)}.`, `Tracer un arc de cercle de centre ${C} et de rayon ${cm(z)}.`, `Tracer un arc de cercle de centre ${A} et de rayon ${cm(z)}.`, `Tracer la perpendiculaire à (${AB}) passant par ${B}.`], why: `Le point ${C} est aussi à ${cm(z)} de ${B} : il est sur le cercle de centre ${B} et de rayon ${cm(z)}.` },
        { ok: `Placer ${C} à l’intersection des deux arcs, puis tracer [${AC}] et [${BC}].`, bad: [`Placer ${C} au milieu de [${AB}], puis tracer [${AC}] et [${BC}].`, `Placer ${C} n’importe où sur le premier arc, puis tracer [${AC}] et [${BC}].`, `Tracer la médiatrice de [${AB}] et y placer ${C} n’importe où.`], why: `Seul le point commun aux deux arcs est à la fois à ${cm(y)} de ${A} et à ${cm(z)} de ${B}.` },
      ];
    }
    if (kind === 'sas') {
      const [x, y, a] = v;
      return [
        { ok: `Tracer le segment [${AB}] de ${cm(x)}.`, bad: [`Placer le point ${C}.`, `Tracer un arc de cercle de centre ${C} et de rayon ${cm(y)}.`, `Tracer le segment [${BC}] de ${cm(y)}.`], why: 'On commence par un des deux côtés connus, en vraie grandeur.' },
        { ok: `Placer le rapporteur en ${A} et tracer la demi-droite d’origine ${A} qui fait avec [${AB}) un angle de ${a}°.`, bad: [`Placer le rapporteur en ${B} et tracer la demi-droite d’origine ${B} qui fait avec [${B}${A}) un angle de ${a}°.`, `Tracer un arc de cercle de centre ${B} et de rayon ${cm(y)}.`, `Tracer la perpendiculaire à (${AB}) passant par ${A}.`], why: `L’angle connu est en ${A}, entre les côtés [${AB}] et [${AC}] : on le trace en ${A}.` },
        { ok: `Placer sur cette demi-droite le point ${C} tel que ${AC} = ${cm(y)}.`, bad: [`Placer sur cette demi-droite le point ${C} tel que ${AC} = ${cm(x)}.`, `Placer sur cette demi-droite le point ${C} tel que ${BC} = ${cm(y)}.`, `Placer ${C} au milieu de [${AB}].`], why: `${C} est sur le deuxième côté de l’angle, à ${cm(y)} de ${A} : on reporte la longueur avec la règle graduée.` },
        { ok: `Tracer le segment [${BC}].`, bad: [`Tracer la demi-droite d’origine ${B} qui fait avec [${B}${A}) un angle de ${a}°.`, `Tracer un arc de cercle de centre ${B} et de rayon ${cm(y)}.`, `Tracer la perpendiculaire à (${AC}) passant par ${C}.`], why: 'Les trois sommets sont placés : il ne reste qu’à fermer le triangle.' },
      ];
    }
    const [x, a, b] = v;
    return [
      { ok: `Tracer le segment [${AB}] de ${cm(x)}.`, bad: [`Placer le point ${C}.`, `Tracer un angle de ${a}° en ${C}.`, `Tracer un arc de cercle de centre ${A} et de rayon ${cm(a)}.`], why: 'On commence par le côté connu : les deux angles connus sont à ses extrémités.' },
      { ok: `En ${A}, tracer au rapporteur la demi-droite qui fait avec [${AB}) un angle de ${a}°.`, bad: [`En ${A}, tracer au rapporteur la demi-droite qui fait avec [${AB}) un angle de ${b}°.`, `Tracer un arc de cercle de centre ${A} et de rayon ${cm(x)}.`, `Tracer la perpendiculaire à (${AB}) passant par ${A}.`], why: `L’angle en ${A} mesure ${a}° (et non ${b}°, qui est l’angle en ${B}).` },
      { ok: `En ${B}, tracer au rapporteur la demi-droite qui fait avec [${B}${A}) un angle de ${b}°.`, bad: [`En ${B}, tracer au rapporteur la demi-droite qui fait avec [${B}${A}) un angle de ${a}°.`, `En ${A}, tracer une deuxième demi-droite qui fait avec [${AB}) un angle de ${b}°.`, `Tracer un arc de cercle de centre ${B} et de rayon ${cm(x)}.`], why: `L’autre angle connu est en ${B} : ${b}°, du même côté de [${AB}] que le premier.` },
      { ok: `Placer ${C} à l’intersection des deux demi-droites.`, bad: [`Placer ${C} au milieu de [${AB}].`, `Placer ${C} sur la première demi-droite, à ${cm(x)} de ${A}.`, `Tracer la médiatrice de [${AB}] et y placer ${C}.`], why: `${C} est sur les deux demi-droites à la fois : c’est leur point d’intersection.` },
    ];
  }
  const TC_TF = [
    ['Avec trois angles dont la somme fait 180°, on ne peut construire qu’un seul triangle.', false, 'On peut en construire une infinité, plus ou moins grands (ce sont des agrandissements ou des réductions les uns des autres). Il faut connaître au moins une longueur.'],
    ['Pour construire un triangle dont on connaît les trois longueurs, le rapporteur est inutile.', true, 'La règle graduée et le compas suffisent : un segment, puis deux arcs de cercle.'],
    ['On peut toujours construire un triangle dont on connaît deux côtés et l’angle compris entre eux (cet angle mesurant moins de 180°).', true, 'On trace l’angle, on reporte les deux longueurs sur ses côtés, puis on relie.'],
    ['Si on connaît un côté et les deux angles adjacents, on peut calculer le troisième angle.', true, 'Les trois angles font 180° : le troisième vaut 180° moins la somme des deux autres.'],
    ['Pour construire un triangle équilatéral de 5 cm de côté, il suffit d’une règle graduée et d’un compas.', true, 'On trace un segment de 5 cm, puis deux arcs de rayon 5 cm centrés aux extrémités.'],
    ['Pour construire un triangle, on peut commencer directement par le dessin en vraie grandeur, sans croquis.', false, 'On fait d’abord un croquis à main levée et codé : il permet de savoir quoi tracer, et dans quel ordre.'],
    ['Pour placer le troisième sommet avec deux angles, on trace deux demi-droites, et le sommet est leur point d’intersection.', true, 'Chaque demi-droite porte un côté du triangle : le sommet est sur les deux.'],
  ];

  M.notion('triangles-construction', {
    lesson: {
      retenir: `<p>On peut construire un triangle (en vraie grandeur) quand on connaît :</p><ul><li><b>ses trois longueurs</b> — avec la <b>règle graduée et le compas</b>. C’est possible seulement si la plus grande longueur est plus petite que la somme des deux autres ;</li><li><b>deux longueurs et l’angle compris</b> entre ces deux côtés — avec la <b>règle graduée et le rapporteur</b> ;</li><li><b>une longueur et les deux angles adjacents</b> à ce côté — avec la <b>règle et le rapporteur</b>. C’est possible seulement si ces deux angles ont une somme inférieure à 180°.</li></ul><p>On commence toujours par un <b>croquis à main levée</b>, codé avec les données.</p>`,
      explication: `${constrFig}<p>Pour construire ABC avec AB = 6 cm, AC = 4 cm et BC = 5 cm : on trace [AB]. Le point C est à 4 cm de A, donc sur le cercle de centre A et de rayon 4 cm ; il est aussi à 5 cm de B, donc sur le cercle de centre B et de rayon 5 cm. C est le <b>point d’intersection des deux arcs</b>.</p><p>Si 4 + 5 était plus petit que 6, les deux arcs seraient trop courts pour se rencontrer : pas de triangle.</p>`,
      methode: [
        'Fais un croquis à main levée et écris dessus les longueurs et les angles connus.',
        '<b>Trois longueurs</b> : trace un côté (souvent le plus grand) ; trace un arc de cercle centré à chaque extrémité, avec pour rayon la longueur du côté qui part de ce point ; le 3<sup>e</sup> sommet est à l’intersection des arcs.',
        '<b>Deux côtés et l’angle compris</b> : trace un des côtés ; au rapporteur, trace l’angle au sommet commun ; reporte la 2<sup>e</sup> longueur sur la demi-droite ; relie.',
        '<b>Un côté et deux angles adjacents</b> : trace le côté ; trace un angle à chaque extrémité, du même côté ; le 3<sup>e</sup> sommet est à l’intersection des deux demi-droites.',
        'Si l’angle connu n’est pas au bon endroit, calcule l’angle qui manque avec la somme des angles (180°).',
      ],
      exemples: [
        { q: 'Construire EFG avec EF = 7 cm, EG = 4 cm et FG = 5 cm : quels arcs tracer ?', r: 'Après avoir tracé [EF] : un arc de centre E et de rayon <b>4 cm</b> (car EG = 4 cm), et un arc de centre F et de rayon <b>5 cm</b> (car FG = 5 cm). G est à leur intersection.' },
        { q: `Construire RST avec RS = 6 cm, ${hat('S', 'R', 'T')} = 50° et ${hat('R', 'T', 'S')} = 70° : quel angle tracer en S ?`, r: `Il faut les deux angles adjacents à [RS]. ${hat('R', 'S', 'T')} = 180 − 50 − 70 = <b>60°</b>.` },
        { q: 'Peut-on construire un triangle de côtés 3 cm, 4 cm et 8 cm ?', r: '<b>Non</b> : 3 + 4 = 7 et 7 &lt; 8, les deux arcs ne se rencontrent pas.' },
      ],
      astuces: ['Dans le cas « deux côtés et l’angle compris », l’angle est toujours au <b>sommet commun</b> aux deux côtés : pour AB et AC, c’est l’angle en A.', 'Si l’angle connu est un angle droit, l’équerre remplace le rapporteur.'],
      erreurs: [
        'Prendre le mauvais rayon : l’arc de centre A a pour rayon la longueur du côté qui part de A.',
        'Tracer les deux angles de part et d’autre du segment : ils doivent être du même côté.',
        'Croire qu’avec trois angles on obtient un seul triangle : il manque une longueur.',
      ],
    },
    generate(level, rng) {
      const T = triNames(rng), { n, tn, sn, angAt } = T;
      const t = level === 1 ? rng.pick(['instr', 'case', 'compris', 'arc'])
        : level === 2 ? rng.pick(['next', 'next', 'croquis', 'why'])
          : rng.pick(['croquis', 'missing', 'iso', 'iso', 'tf', 'next']);
      if (t === 'instr' || t === 'case') {
        const kind = rng.pick(['sss', 'sas', 'asa']), v = valsOf(kind, rng), d = dataText(kind, T, v);
        const ci = { sss: 0, sas: 1, asa: 2 }[kind];
        if (t === 'instr') {
          return Q(`tc1i:${kind}:${tn}:${v.join(':')}`, `On veut construire le triangle ${tn} tel que ${d}.<br>De quels instruments as-tu besoin ?`, choice(rng, INSTR[kind], [kind === 'sss' ? INSTR.sas : INSTR.sss, ...INSTR_BAD]), 'Pour reporter une longueur depuis un point, quel instrument ? Pour tracer un angle ?',
            `On connaît ${CASES[ci]} : il faut <b>${INSTR[kind]}</b>. ${kind === 'sss' ? 'Le compas sert à reporter les longueurs depuis les extrémités du premier côté.' : 'Le rapporteur sert à tracer les angles, la règle graduée à tracer les côtés.'}`);
        }
        return Q(`tc1c:${kind}:${tn}:${v.join(':')}`, `On veut construire le triangle ${tn} tel que ${d}.<br>Dans quel cas de construction es-tu ?`, fixedChoice(CASES, CASES[ci]), 'Compte les longueurs et les angles connus, et regarde où se trouvent les angles.',
          `On connaît <b>${CASES[ci]}</b>${kind === 'sas' ? ` : l’angle ${angAt(0)} est en ${n[0]}, entre les côtés [${sn(n[0], n[1])}] et [${sn(n[0], n[2])}]` : kind === 'asa' ? ` : les angles en ${n[0]} et en ${n[1]} sont aux extrémités du côté [${sn(n[0], n[1])}]` : ''}.`);
      }
      if (t === 'compris') {
        if (rng.chance(0.5)) {
          return Q(`tc1a:${tn}:${n.join('')}`, `On connaît les longueurs ${sn(n[0], n[1])} et ${sn(n[0], n[2])} du triangle ${tn}. Quel angle faut-il connaître pour le construire (cas « deux côtés et l’angle compris ») ?`, choice(rng, angAt(0), [angAt(1), angAt(2)]), 'L’angle compris est « coincé » entre les deux côtés connus.',
            `Les côtés [${sn(n[0], n[1])}] et [${sn(n[0], n[2])}] ont en commun le sommet ${n[0]} : l’angle compris entre eux est <b>${angAt(0)}</b>.`);
        }
        const good = `${angAt(0)} et ${angAt(1)}`;
        return Q(`tc1b:${tn}:${n.join('')}`, `On connaît la longueur ${sn(n[0], n[1])} du triangle ${tn}. Quels angles faut-il connaître pour le construire (cas « un côté et les deux angles adjacents ») ?`, choice(rng, good, [`${angAt(0)} et ${angAt(2)}`, `${angAt(1)} et ${angAt(2)}`]), 'Les angles adjacents à un côté sont aux deux extrémités de ce côté.',
          `Les extrémités de [${sn(n[0], n[1])}] sont ${n[0]} et ${n[1]} : il faut les angles <b>${good}</b>.`);
      }
      if (t === 'arc') {
        const v = sssVals(rng), atA = rng.chance(0.5), P = atA ? n[0] : n[1], r = atA ? v[1] : v[2];
        return Q(`tc1r:${tn}:${n.join('')}:${v.join(':')}:${atA}`, `On veut construire le triangle ${tn} tel que ${dataText('sss', T, v)}. On a déjà tracé [${sn(n[0], n[1])}].<br>Pour placer ${n[2]}, on trace un arc de cercle de centre ${P}. Quel rayon faut-il prendre ?`, num(r, 'cm'), `Le point ${n[2]} doit être à la bonne distance de ${P}.`,
          `${n[2]} doit vérifier ${sn(P, n[2])} = ${cm(r)} : il est sur le cercle de centre ${P} et de rayon <b>${cm(r)}</b>.`);
      }
      if (t === 'next') {
        const kind = rng.pick(['sss', 'sas', 'asa']), v = valsOf(kind, rng), st = constrSteps(kind, T, v), k = rng.int(0, 3);
        const done = ['Faire un croquis à main levée et le coder.', ...st.slice(0, k).map(s => s.ok)];
        return Q(`tc2n:${kind}:${k}:${tn}:${n.join('')}:${v.join(':')}`, `On veut construire le triangle ${tn} tel que ${dataText(kind, T, v)}. Voici le début du programme de construction :<ol>${done.map(s => `<li>${s}</li>`).join('')}</ol>Quelle est l’étape suivante ?`, choice(rng, st[k].ok, rng.sample(st[k].bad, 3)), 'Demande-toi ce qui est déjà placé, et ce que tu sais du sommet qui manque.',
          `Étape suivante : <b>${st[k].ok}</b><br>${st[k].why}`);
      }
      if (t === 'croquis') {
        const kind = level === 2 ? 'sas' : rng.pick(['sas', 'asa']), v = valsOf(kind, rng), [A, B, C] = n;
        let cands;
        if (kind === 'sas') {
          const [x, y, a] = v;
          cands = [
            { ok: true, svg: triSketch(n, place([0, 1, 2], sasPts(x, y, a)), { sides: { '01': cm(x), '02': cm(y) }, angles: { 0: deg(a) } }) },
            { ok: false, svg: triSketch(n, place([1, 0, 2], sasPts(x, y, a)), { sides: { '01': cm(x), 12: cm(y) }, angles: { 1: deg(a) } }) },
            { ok: false, svg: triSketch(n, place([0, 1, 2], sasPts(y, x, a)), { sides: { '01': cm(y), '02': cm(x) }, angles: { 0: deg(a) } }) },
            { ok: false, svg: triSketch(n, place([2, 0, 1], sasPts(y, x, a)), { sides: { '02': cm(y), 12: cm(x) }, angles: { 2: deg(a) } }) },
          ];
        } else {
          const [x, a, b] = v;
          cands = [
            { ok: true, svg: triSketch(n, place([0, 1, 2], asaPts(x, a, b)), { sides: { '01': cm(x) }, angles: { 0: deg(a), 1: deg(b) } }) },
            { ok: false, svg: triSketch(n, place([0, 1, 2], asaPts(x, b, a)), { sides: { '01': cm(x) }, angles: { 0: deg(b), 1: deg(a) } }) },
            { ok: false, svg: triSketch(n, place([0, 2, 1], asaPts(x, a, b)), { sides: { '02': cm(x) }, angles: { 0: deg(a), 2: deg(b) } }) },
            { ok: false, svg: triSketch(n, place([1, 2, 0], asaPts(x, a, b)), { sides: { 12: cm(x) }, angles: { 1: deg(a), 2: deg(b) } }) },
          ];
        }
        const g = gallery(rng, cands);
        const why = kind === 'sas' ? `l’angle de ${v[2]}° est en ${A}, entre le côté [${sn(A, B)}] de ${cm(v[0])} et le côté [${sn(A, C)}] de ${cm(v[1])}`
          : `le côté [${sn(A, B)}] mesure ${cm(v[0])}, l’angle en ${A} mesure ${v[1]}° et l’angle en ${B} mesure ${v[2]}°`;
        return Q(`tc${level}k:${kind}:${tn}:${n.join('')}:${v.join(':')}:${g.good}`, `${g.html}Quel croquis correspond au triangle ${tn} tel que ${dataText(kind, T, v)} ?`, g.answer, 'Sur chaque croquis, lis à quel sommet est l’angle et quels côtés portent les longueurs.',
          `C’est la <b>${g.good}</b> : ${why}.`);
      }
      if (t === 'why') {
        const kind = rng.pick(['sss', 'sss', 'asa', 'asa', 'sas']), ok = kind === 'sas' || rng.chance(0.4);
        const CAN = 'On peut le construire.';
        let v, good, bad, d;
        if (kind === 'sss') {
          if (ok) v = sssVals(rng);
          else {
            const x = rng.int(2, 6), y = rng.int(2, 6), L = x + y + rng.int(0, 3);
            v = rng.shuffle([x, y, L]);
          }
          const big = Math.max(...v), rest = v.slice().sort((p, q) => p - q).slice(0, 2), s = rest[0] + rest[1];
          d = dataText('sss', T, v);
          good = ok ? CAN : s === big ? `${rest[0]} + ${rest[1]} = ${big} : les trois points seraient alignés.` : `${rest[0]} + ${rest[1]} = ${s}, plus petit que ${big} : les deux arcs ne se coupent pas.`;
          bad = [ok ? 'Il faudrait connaître au moins un angle.' : CAN, 'La somme des trois longueurs ne fait pas 180.', 'Les trois longueurs sont différentes.'];
        } else if (kind === 'asa') {
          const x = rng.int(3, 9), a = 5 * rng.int(6, 24), b = ok ? 5 * rng.int(4, Math.min(30, (175 - a) / 5)) : 5 * rng.int(Math.max(4, (180 - a) / 5), Math.min(30, (200 - a) / 5));
          v = [x, a, b]; d = dataText('asa', T, v);
          good = ok ? CAN : `${a} + ${b} = ${a + b} : c’est déjà ${a + b === 180 ? '180°' : 'plus de 180°'}, les deux demi-droites ne se coupent pas.`;
          bad = [ok ? `Il faudrait que ${a} + ${b} fasse 180°.` : CAN, `Il faudrait connaître la longueur ${sn(n[0], n[2])}.`, 'Les deux angles devraient être égaux.'];
        } else {
          v = sasVals(rng); d = dataText('sas', T, v);
          good = CAN;
          bad = [`Il faudrait connaître la longueur ${sn(n[1], n[2])}.`, 'Il faudrait connaître un deuxième angle.', 'Un des deux côtés est trop long.'];
        }
        const corr = good === CAN
          ? `<b>On peut le construire.</b> ${kind === 'sss' ? `La plus grande longueur (${Math.max(...v)} cm) est plus petite que la somme des deux autres.` : kind === 'asa' ? `${v[1]} + ${v[2]} = ${v[1] + v[2]}, moins de 180° : les deux demi-droites se coupent (et le troisième angle mesure ${180 - v[1] - v[2]}°).` : 'Avec deux côtés et l’angle compris entre eux, la construction est toujours possible.'}`
          : `<b>${good}</b>`;
        return Q(`tc2w:${kind}:${tn}:${n.join('')}:${v.join(':')}`, `On veut construire le triangle ${tn} tel que ${d}. Que peut-on dire ?`, choice(rng, good, bad), 'Fais le croquis, puis imagine la construction : les arcs ou les demi-droites vont-ils se rencontrer ?', corr);
      }
      if (t === 'missing') {
        const x = rng.int(4, 9);
        let a, c;
        do { a = 5 * rng.int(6, 20); c = 5 * rng.int(6, 20); } while (a + c > 150);
        const b = 180 - a - c;
        return Q(`tc3m:${tn}:${n.join('')}:${x}:${a}:${c}`, `On connaît ${sn(n[0], n[1])} = ${cm(x)}, ${angAt(0)} = ${deg(a)} et ${angAt(2)} = ${deg(c)}. Pour construire le triangle ${tn} à partir du segment [${sn(n[0], n[1])}], quel angle dois-tu tracer en ${n[1]} ?`, num(b, '°'), `Pour construire à partir de [${sn(n[0], n[1])}], il faut les deux angles à ses extrémités. Que sais-tu de la somme des angles d’un triangle ?`,
          `Il faut l’angle ${angAt(1)}, adjacent à [${sn(n[0], n[1])}]. Les trois angles font 180° : ${angAt(1)} = 180 − ${a} − ${c} = <b>${deg(b)}</b>.`);
      }
      if (t === 'iso') {
        const v = rng.int(0, 2), [A, B, C] = T.base, BC = `${B}${C}`;
        if (v === 0) {
          const s = rng.chance(0.6) ? rng.int(4, 9) : add(rng.int(3, 8), 0.5), b = rng.int(2, Math.floor(2 * s) - 1), p = add(mul(2, s), b);
          return Q(`tc3p:${tn}:${s}:${b}`, `Le triangle ${tn} est isocèle en ${A}, sa base [${BC}] mesure ${cm(b)} et son périmètre ${cm(p)}. On le construit à la règle et au compas à partir de [${BC}]. Quel rayon faut-il prendre pour les arcs de centres ${B} et ${C} ?`, num(s, 'cm'), 'Enlève la base du périmètre : que reste-t-il ?',
            `${A}${B} + ${A}${C} = ${fmt(p)} − ${b} = ${fmt(mul(2, s))} cm, et ${A}${B} = ${A}${C} (triangle isocèle en ${A}) : ${fmt(mul(2, s))} ÷ 2 = <b>${cm(s)}</b>.`);
        }
        if (v === 1) {
          const a = 2 * rng.int(10, 70), bs = (180 - a) / 2, x = rng.int(3, 9);
          return Q(`tc3a:${tn}:${a}:${x}`, `Le triangle ${tn} est isocèle en ${A}, avec ${BC} = ${cm(x)} et ${hat(B, A, C)} = ${deg(a)}. On le construit à partir du segment [${BC}]. Quel angle faut-il tracer en ${B} ?`, num(bs, '°'), 'Dans un triangle isocèle, les deux angles à la base sont égaux. Et la somme des trois angles ?',
            `Les angles en ${B} et en ${C} sont égaux et font ensemble 180 − ${a} = ${180 - a}°. Chacun mesure ${180 - a} ÷ 2 = <b>${deg(bs)}</b>.`);
        }
        const s = rng.chance(0.6) ? rng.int(3, 9) : add(rng.int(3, 8), 0.5), p = mul(3, s);
        return Q(`tc3e:${tn}:${s}`, `On veut construire un triangle équilatéral ${tn} de périmètre ${cm(p)}, à la règle et au compas. Quel écartement de compas faut-il prendre ?`, num(s, 'cm'), 'Les trois côtés d’un triangle équilatéral ont la même longueur.',
          `Chaque côté mesure ${fmt(p)} ÷ 3 = <b>${cm(s)}</b> : on trace un côté, puis deux arcs de ce rayon centrés à ses extrémités.`);
      }
      const i = rng.int(0, TC_TF.length - 1), [txt, val, why] = TC_TF[i];
      return Q(`tc3f:${i}`, `Vrai ou faux ?<br><i>${txt}</i>`, TF(val), 'Imagine la construction avec tes instruments.', `<b>${val ? 'Vrai' : 'Faux'}</b>. ${why}`);
    },
  });

  // =====================================================================
  // CERCLE CIRCONSCRIT
  // =====================================================================
  const onCircle = (c, R, th) => th.map(t => [c[0] + R * Math.cos(t * RAD), c[1] - R * Math.sin(t * RAD)]);
  // Acute triangle on a circle: arcs between consecutive vertices in [lo, hi] degrees (angles = arcs ÷ 2).
  function acuteTh(rng, lo = 80, hi = 150) {
    const g1 = rng.int(lo, hi), g2 = rng.int(Math.max(lo, 360 - g1 - hi), Math.min(hi, 360 - g1 - lo)), t0 = rng.int(0, 359);
    return [t0, t0 + g1, t0 + g1 + g2];
  }
  // Perpendicular bisectors of the three sides, clipped to the box, with right-angle marks.
  function medLines(P, W, H, cls = 's-line s-dash') {
    let b = '';
    [[0, 1], [1, 2], [2, 0]].forEach(([i, j]) => {
      const m = mid(P[i], P[j]), u = unit(vsub(P[j], P[i])), d = [-u[1], u[0]];
      const [p, q] = clip(m, d, W, H);
      b += seg(p, q, cls) + rightMark(m, P[j], along(m, d, 10), 8, 's-line s-nofill');
    });
    return b;
  }
  function circFig(names, P, c, R, { W = 240, H = 210, circle = true, med = false, centre = 'O', radius = '' } = {}) {
    let b = '';
    if (circle) b += `<circle cx="${r1(c[0])}" cy="${r1(c[1])}" r="${r1(R)}" class="s-accent-line"/>`;
    b += poly(P, 's-soft s-line');
    if (med) b += medLines(P, W, H);
    if (radius) b += seg(c, P[0], 's-accent-line');
    if (centre) {
      // Put the label in the widest free direction around O (away from the bisectors).
      const rays = med ? [[0, 1], [1, 2], [2, 0]].flatMap(([i, j]) => { const a = Math.atan2(P[j][1] - P[i][1], P[j][0] - P[i][0]) + Math.PI / 2; return [a, a + Math.PI]; }) : [];
      const gap = a => Math.min(...rays.map(r => { const d = Math.abs((((a - r) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI) - Math.PI); return d; }), 9);
      let best = (3 * Math.PI) / 4;
      if (med) for (let k = 0; k < 24; k++) { const a = (k * Math.PI) / 12; if (gap(a) > gap(best)) best = a; }
      b += dot(...c) + lab(c[0] + 15 * Math.cos(best), c[1] + 15 * Math.sin(best) + 5, centre);
    }
    names.forEach((nm, i) => { b += labOut(P[i], c, nm, 15); });
    return svg(W, H, b);
  }
  const CC_TF = [
    ['Les trois médiatrices d’un triangle se coupent toujours en un même point.', true, 'Elles sont concourantes : leur point commun est le centre du cercle circonscrit.'],
    ['Le centre du cercle circonscrit est toujours à l’intérieur du triangle.', false, 'Si le triangle a un angle obtus, le centre est à l’extérieur ; s’il est rectangle, il est au milieu de l’hypoténuse.'],
    ['Pour trouver le centre du cercle circonscrit, il suffit de tracer deux médiatrices.', true, 'Deux médiatrices se coupent en O ; la troisième passe forcément par O (elle sert seulement à vérifier).'],
    ['Le cercle circonscrit à un triangle passe par les milieux des trois côtés.', false, 'Il passe par les trois <b>sommets</b> du triangle.'],
    ['Si un triangle est rectangle, son hypoténuse est un diamètre de son cercle circonscrit.', true, 'Le centre est le milieu de l’hypoténuse, et les deux extrémités de l’hypoténuse sont sur le cercle.'],
    ['Le centre du cercle circonscrit est à la même distance des trois côtés du triangle.', false, 'Il est à la même distance des trois <b>sommets</b> : OA = OB = OC.'],
    ['Tout triangle a un cercle circonscrit.', true, 'Les trois médiatrices se coupent toujours en un point O, et le cercle de centre O passant par un sommet passe par les deux autres.'],
    ['Le centre du cercle circonscrit est le point de concours des trois hauteurs.', false, 'C’est le point de concours des trois <b>médiatrices</b>.'],
  ];
  const ccFig = (() => {
    const c = [120, 105], P = onCircle(c, 75, [125, 218, 330]);
    return circFig(['A', 'B', 'C'], P, c, 75, { med: true });
  })();

  M.notion('cercle-circonscrit', {
    lesson: {
      retenir: `<ul><li>Les trois <b>médiatrices</b> des côtés d’un triangle sont <b>concourantes</b> : elles se coupent en un même point O.</li><li>O est sur la médiatrice de [AB], donc OA = OB ; sur celle de [BC], donc OB = OC. Ainsi <b>OA = OB = OC</b>.</li><li>Le cercle de centre O et de rayon OA passe donc par A, B et C : c’est le <b>cercle circonscrit</b> au triangle.</li><li>Si le triangle est <b>rectangle</b>, le centre du cercle circonscrit est le <b>milieu de l’hypoténuse</b> ; son rayon est la moitié de l’hypoténuse.</li></ul>`,
      explication: `${ccFig}<p>Les pointillés sont les médiatrices des trois côtés : elles se coupent en O. Chaque point de la médiatrice de [AB] est à égale distance de A et de B ; O, qui est sur les trois médiatrices, est donc <b>à la même distance des trois sommets</b>. En piquant le compas en O avec l’écartement OA, le cercle passe par A, B et C.</p>`,
      methode: [
        'Trace la médiatrice de deux côtés (règle et équerre, ou compas). Elles se coupent en O.',
        'La troisième médiatrice passe aussi par O : tu peux la tracer pour vérifier ta construction.',
        'Pique le compas en O, prends l’écartement OA et trace le cercle : il doit passer par les trois sommets.',
        'Triangle rectangle : place directement le milieu de l’hypoténuse, c’est le centre. Rayon = hypoténuse ÷ 2.',
      ],
      exemples: [
        { q: 'O est le centre du cercle circonscrit au triangle ABC et OA = 3,5 cm. Combien mesure OC ?', r: 'OA = OB = OC, donc OC = <b>3,5 cm</b>.' },
        { q: 'DEF est rectangle en D et EF = 9 cm. Rayon de son cercle circonscrit ?', r: 'Le centre est le milieu de l’hypoténuse [EF] : rayon = 9 ÷ 2 = <b>4,5 cm</b>.' },
      ],
      astuces: ['Si le triangle a trois angles aigus, le centre est à l’intérieur ; s’il est rectangle, il est sur l’hypoténuse ; s’il a un angle obtus, il est à l’extérieur.'],
      erreurs: [
        'Confondre médiatrice (perpendiculaire en son milieu à un côté) et hauteur ou médiane (qui passent par un sommet).',
        'Croire que le cercle circonscrit passe par les milieux des côtés : il passe par les sommets.',
        'Donner l’hypoténuse comme rayon : c’est un diamètre, le rayon en est la moitié.',
      ],
    },
    generate(level, rng) {
      const T = triNames(rng), [A, B, C] = T.base, tn = T.tn;
      const t = level === 1 ? rng.pick(['def', 'dist', 'fig'])
        : level === 2 ? rng.pick(['rect', 'rectc', 'step', 'figchoice', 'diam'])
          : rng.pick(['perim', 'median', 'position', 'tf', 'figchoice']);
      if (t === 'def') {
        if (rng.chance(0.5)) {
          const good = 'passe par les trois sommets du triangle';
          return Q('cc1d', 'Le cercle circonscrit à un triangle est le cercle qui…', choice(rng, good, ['passe par les milieux des trois côtés', 'a pour centre un sommet du triangle', 'est tracé à l’intérieur du triangle']), '« Circonscrit » veut dire « tracé autour ».', `Le cercle circonscrit <b>${good}</b>.`);
        }
        const good = 'des trois médiatrices';
        return Q('cc1c', 'Le centre du cercle circonscrit à un triangle est le point d’intersection…', choice(rng, good, ['des trois hauteurs', 'des trois médianes', 'des trois côtés']), 'Le centre est à la même distance des trois sommets.', `C’est le point d’intersection <b>${good}</b> des côtés : chaque point d’une médiatrice est à égale distance des extrémités du côté.`);
      }
      if (t === 'dist') {
        const r = dec(rng.int(20, 90), 1), c = [120, 105], P = onCircle(c, 72, acuteTh(rng)), ask = rng.pick([B, C]);
        return Q(`cc1r:${r}:${ask}:${tn}`, `${circFig(T.base, P, c, 72, { radius: true })}O est le centre du cercle circonscrit au triangle ${tn} et O${A} = ${cm(r)}. Combien mesure O${ask} ?`, num(r, 'cm'), `${A}, ${B} et ${C} sont tous sur le cercle de centre O.`,
          `${A}, ${B} et ${C} sont sur le cercle de centre O, donc O${A} = O${B} = O${C} : O${ask} = <b>${cm(r)}</b>.`);
      }
      if (t === 'fig') {
        const W = 280, H = 250, c = [140, 125];
        let P, pts;
        for (let tries = 0; tries < 12 && !(pts && pts.length >= 3); tries++) {
          P = onCircle(c, 90, acuteTh(rng, 70, 160));
          const G = centroid(P), Hh = [P[0][0] + P[1][0] + P[2][0] - 2 * c[0], P[0][1] + P[1][1] + P[2][1] - 2 * c[1]], k = rng.int(0, 2), Mi = mid(P[k], P[(k + 1) % 3]);
          pts = [c];
          [G, Hh, Mi].forEach(p => { if (pts.every(q => dist(p, q) > 24)) pts.push(p); });
        }
        const letters = rng.sample(['Q', 'R', 'S', 'T', 'X', 'Y', 'Z'].filter(l => !T.base.includes(l)), pts.length), good = letters[0];
        let b = poly(P, 's-soft s-line') + medLines(P, W, H);
        pts.forEach((p, i) => { b += dot(...p) + lab(p[0] + 8, p[1] - 7, letters[i], { anchor: 'start', size: 14 }); });
        T.base.forEach((nm, i) => { b += labOut(P[i], c, nm, 15); });
        const opts = letters.slice().sort();
        return Q(`cc1f:${tn}:${pts.length}:${good}:${r1(P[0][0])}`, `${svg(W, H, b)}Les droites en pointillés sont les médiatrices des trois côtés du triangle ${tn}. Quel point est le centre de son cercle circonscrit ?`, fixedChoice(opts, good), 'Le centre est sur les trois médiatrices à la fois.',
          `C’est le point <b>${good}</b> : c’est là que les trois médiatrices se coupent. Il est à la même distance de ${A}, ${B} et ${C}.`);
      }
      if (t === 'rect' || t === 'rectc') {
        const top = rng.int(0, 2), R = T.base[top], h1 = T.base[(top + 1) % 3], h2 = T.base[(top + 2) % 3], hyp = [h1, h2].sort((p, q) => T.base.indexOf(p) - T.base.indexOf(q)).join('');
        if (t === 'rectc') {
          const good = `le milieu de [${hyp}]`, o1 = [R, h1].sort().join(''), o2 = [R, h2].sort().join('');
          return Q(`cc2c:${tn}:${top}`, `Le triangle ${tn} est rectangle en ${R}. Où se trouve le centre de son cercle circonscrit ?`, choice(rng, good, [`le sommet ${R}`, `le milieu de [${o1}]`, `le milieu de [${o2}]`]), 'Quel est le côté le plus long d’un triangle rectangle ?',
            `Le centre est <b>${good}</b>, l’hypoténuse (le côté opposé à l’angle droit).`);
        }
        if (rng.chance(0.6)) {
          const h = dec(rng.int(30, 200), 1), r = div(h, 2);
          return Q(`cc2r:${h}:${tn}:${top}`, `Le triangle ${tn} est rectangle en ${R} et ${hyp} = ${cm(h)}. Quel est le rayon de son cercle circonscrit ?`, num(r, 'cm'), 'Où se trouve le centre du cercle circonscrit d’un triangle rectangle ?',
            `Le centre est le milieu de l’hypoténuse [${hyp}] : [${hyp}] est un diamètre, donc le rayon vaut ${fmt(h)} ÷ 2 = <b>${cm(r)}</b>.`);
        }
        const r = dec(rng.int(15, 80), 1), h = mul(2, r);
        return Q(`cc2h:${r}:${tn}:${top}`, `Le triangle ${tn} est rectangle en ${R} et son cercle circonscrit a pour rayon ${cm(r)}. Combien mesure ${hyp} ?`, num(h, 'cm'), 'Quel segment du cercle est l’hypoténuse ?',
          `L’hypoténuse [${hyp}] est un diamètre du cercle circonscrit : ${hyp} = 2 × ${fmt(r)} = <b>${cm(h)}</b>.`);
      }
      if (t === 'diam') {
        const r = dec(rng.int(15, 80), 1), d = mul(2, r);
        if (rng.chance(0.5)) {
          return Q(`cc2d:${r}:${tn}`, `Le centre O du cercle circonscrit au triangle ${tn} est à ${cm(r)} de ${A}. Quel est le diamètre de ce cercle ?`, num(d, 'cm'), `O${A} est un rayon du cercle.`, `O${A} = ${cm(r)} est le rayon ; le diamètre vaut 2 × ${fmt(r)} = <b>${cm(d)}</b>.`);
        }
        return Q(`cc2e:${d}:${tn}`, `Le cercle circonscrit au triangle ${tn} a pour diamètre ${cm(d)} et pour centre O. Combien mesure O${B} ?`, num(r, 'cm'), `${B} est sur le cercle : O${B} est un rayon.`, `${B} est sur le cercle de centre O, donc O${B} est un rayon : ${fmt(d)} ÷ 2 = <b>${cm(r)}</b>.`);
      }
      if (t === 'step') {
        const k = rng.int(0, 2);
        const steps = [
          { ok: `Tracer la médiatrice de [${A}${B}].`, bad: [`Tracer la hauteur issue de ${C}.`, `Tracer la médiane issue de ${A}.`, `Tracer le cercle de diamètre [${A}${B}].`] },
          { ok: `Tracer la médiatrice de [${B}${C}] ; elle coupe la première en O.`, bad: [`Tracer la hauteur issue de ${A} ; elle coupe la médiatrice en O.`, `Tracer la parallèle à (${A}${B}) passant par ${C}.`, `Placer O au milieu de [${A}${B}].`] },
          { ok: `Piquer le compas en O, l’écarter jusqu’à ${A} et tracer le cercle.`, bad: [`Piquer le compas en O et tracer le cercle de rayon ${A}${B}.`, `Piquer le compas en ${A} et tracer le cercle qui passe par O.`, `Tracer le cercle de diamètre [${A}${B}].`] },
        ];
        const done = steps.slice(0, k).map(s => `<li>${s.ok}</li>`).join('');
        const why = [`Le centre est sur les médiatrices des côtés : on commence par l’une d’elles.`, `Le centre est sur deux médiatrices à la fois : c’est leur point d’intersection.`, `O est à la même distance des trois sommets : le cercle de centre O et de rayon O${A} passe par ${A}, ${B} et ${C}.`][k];
        return Q(`cc2s:${k}:${tn}`, `On veut construire le cercle circonscrit au triangle ${tn}.${k ? `<br>Déjà fait :<ol>${done}</ol>` : ''}Quelle est l’étape ${k ? 'suivante' : 'à faire en premier'} ?`, choice(rng, steps[k].ok, steps[k].bad), 'Le centre doit être à la même distance des trois sommets.', `<b>${steps[k].ok}</b><br>${why}`);
      }
      if (t === 'figchoice') {
        const W = 160, H = 160, c = [80, 80], R = 58;
        let P = null;
        for (let tries = 0; tries < 40 && !P; tries++) {
          const Q2 = onCircle(c, R, acuteTh(rng, 75, 155)), G = centroid(Q2), ds = Q2.map(p => dist(p, G)).sort((p, q) => p - q);
          if (ds[2] - ds[1] >= 10) P = Q2;
        }
        if (!P) P = onCircle(c, R, [30, 175, 270]);
        const G = centroid(P), sides = [dist(P[1], P[2]), dist(P[0], P[2]), dist(P[0], P[1])], per = sides[0] + sides[1] + sides[2];
        const I = [(sides[0] * P[0][0] + sides[1] * P[1][0] + sides[2] * P[2][0]) / per, (sides[0] * P[0][1] + sides[1] * P[1][1] + sides[2] * P[2][1]) / per];
        const area = Math.abs((P[1][0] - P[0][0]) * (P[2][1] - P[0][1]) - (P[2][0] - P[0][0]) * (P[1][1] - P[0][1])) / 2, rin = (2 * area) / per;
        const L = sides.indexOf(Math.max(...sides)), Mi = mid(P[(L + 1) % 3], P[(L + 2) % 3]);
        const fig = (cc, rr) => { let b = poly(P, 's-soft s-line') + `<circle cx="${r1(cc[0])}" cy="${r1(cc[1])}" r="${r1(rr)}" class="s-accent-line"/>` + dot(...cc); T.base.forEach((nm, i) => { b += labOut(P[i], c, nm, 13); }); return svg(W + 20, H + 20, `<g transform="translate(10,10)">${b}</g>`); };
        const g = gallery(rng, [
          { ok: true, svg: fig(c, R) },
          { ok: false, svg: fig(I, rin) },
          { ok: false, svg: fig(G, Math.max(...P.map(p => dist(p, G)))) },
          { ok: false, svg: fig(Mi, sides[L] / 2) },
        ]);
        return Q(`cc${level}g:${tn}:${r1(P[0][0])}:${r1(P[1][1])}:${g.good}`, `${g.html}Sur quelle figure le cercle tracé est-il le cercle circonscrit au triangle ${tn} ?`, g.answer, 'Le cercle circonscrit doit passer exactement par chacun des trois sommets.',
          `C’est la <b>${g.good}</b> : c’est le seul cercle qui passe par les trois sommets ${A}, ${B} et ${C}. Les autres ne passent que par un ou deux sommets, ou par aucun.`);
      }
      if (t === 'perim') {
        if (rng.chance(0.5)) {
          const h = rng.int(4, 20), L = mul(3.14, h);
          return Q(`cc3p:${h}:${tn}`, `Le triangle ${tn} est rectangle en ${A} et ${B}${C} = ${cm(h)}. Quelle est la longueur de son cercle circonscrit ? (prends π ≈ 3,14)`, num(L, 'cm'), 'Quel est le diamètre de ce cercle ? La longueur d’un cercle vaut π × diamètre.',
            `L’hypoténuse [${B}${C}] est un diamètre du cercle circonscrit (son centre est le milieu de [${B}${C}]). Longueur ≈ 3,14 × ${h} = <b>${cm(L)}</b>.`);
        }
        const r = rng.int(2, 15), L = mul(6.28, r);
        return Q(`cc3q:${r}:${tn}`, `O est le centre du cercle circonscrit au triangle ${tn} et O${B} = ${cm(r)}. Quelle est la longueur de ce cercle ? (prends π ≈ 3,14)`, num(L, 'cm'), 'O' + B + ' est un rayon. La longueur d’un cercle vaut 2 × π × rayon.',
          `${B} est sur le cercle, donc le rayon est O${B} = ${cm(r)}. Longueur ≈ 2 × 3,14 × ${r} = <b>${cm(L)}</b>.`);
      }
      if (t === 'median') {
        const h = dec(rng.int(30, 200), 1), m = div(h, 2);
        return Q(`cc3m:${h}:${tn}`, `Le triangle ${tn} est rectangle en ${A}, ${B}${C} = ${cm(h)} et M est le milieu de [${B}${C}]. Combien mesure ${A}M ?`, num(m, 'cm'), `Que représente M pour le cercle circonscrit au triangle ${tn} ?`,
          `M, milieu de l’hypoténuse, est le centre du cercle circonscrit : M${A} = M${B} = M${C}. Donc ${A}M = ${B}${C} ÷ 2 = ${fmt(h)} ÷ 2 = <b>${cm(m)}</b>.`);
      }
      if (t === 'position') {
        const kind = rng.pick(['aigu', 'rect', 'obtus']);
        let a, b;
        if (kind === 'aigu') { do { a = rng.int(40, 85); b = rng.int(40, 85); } while (180 - a - b < 35 || 180 - a - b > 85); }
        else if (kind === 'rect') { a = 90; b = rng.int(20, 70); }
        else { a = rng.int(100, 140); b = rng.int(15, 170 - a - 10); }
        const ang = rng.shuffle([a, b, 180 - a - b]);
        const OPTS = ['à l’intérieur du triangle', 'sur un côté du triangle', 'à l’extérieur du triangle'], good = OPTS[{ aigu: 0, rect: 1, obtus: 2 }[kind]];
        const why = { aigu: 'Les trois angles sont aigus : le centre du cercle circonscrit est à l’intérieur.', rect: 'Le triangle est rectangle : le centre est le milieu de l’hypoténuse, donc sur un côté.', obtus: 'Le triangle a un angle obtus : le centre du cercle circonscrit est à l’extérieur, du côté opposé à l’angle obtus.' }[kind];
        return Q(`cc3o:${ang.join(':')}`, `Les angles d’un triangle mesurent ${ang[0]}°, ${ang[1]}° et ${ang[2]}°. Où se trouve le centre de son cercle circonscrit ?`, fixedChoice(OPTS, good), 'Regarde s’il y a un angle droit, un angle obtus, ou seulement des angles aigus.', `Il est <b>${good}</b>. ${why}`);
      }
      const i = rng.int(0, CC_TF.length - 1), [txt, val, why] = CC_TF[i];
      return Q(`cc3f:${i}`, `Vrai ou faux ?<br><i>${txt}</i>`, TF(val), 'Le centre du cercle circonscrit est à égale distance des trois sommets.', `<b>${val ? 'Vrai' : 'Faux'}</b>. ${why}`);
    },
  });

  // =====================================================================
  // PRISMES DROITS ET CYLINDRES
  // =====================================================================
  const PRISM_BASES = {
    3: [[40, 160], [150, 160], [85, 85]],
    4: [[40, 160], [150, 160], [125, 95], [60, 95]],
    5: [[55, 160], [130, 160], [150, 112], [92, 75], [35, 112]],
    6: [[60, 160], [120, 160], [150, 120], [120, 80], [60, 80], [30, 120]],
  };
  // Strict convex hull (indices), monotone chain.
  function hull(pts) {
    const idx = pts.map((_, i) => i).sort((i, j) => pts[i][0] - pts[j][0] || pts[i][1] - pts[j][1]);
    const cross = (o, a, b) => (pts[a][0] - pts[o][0]) * (pts[b][1] - pts[o][1]) - (pts[a][1] - pts[o][1]) * (pts[b][0] - pts[o][0]);
    const half = list => { const h = []; list.forEach(i => { while (h.length >= 2 && cross(h[h.length - 2], h[h.length - 1], i) <= 0) h.pop(); h.push(i); }); h.pop(); return h; };
    return [...half(idx), ...half(idx.slice().reverse())];
  }
  // Right prism in cavalier perspective, front face = base. Hidden edges dashed.
  function prismFig(nb, { names, shift = [80, -42] } = {}) {
    const F = PRISM_BASES[nb], Bk = F.map(p => [p[0] + shift[0], p[1] + shift[1]]), all = [...F, ...Bk];
    const hl = hull(all), hid = Bk.map((_, i) => !hl.includes(nb + i));
    let solid = '', dashed = '';
    for (let i = 0; i < nb; i++) {
      const j = (i + 1) % nb, h1 = hid[i] || hid[j];
      if (h1) dashed += seg(Bk[i], Bk[j], 's-line s-dash'); else solid += seg(Bk[i], Bk[j]);
      if (hid[i]) dashed += seg(F[i], Bk[i], 's-line s-dash'); else solid += seg(F[i], Bk[i]);
    }
    let b = poly(F, 's-soft s-line') + solid + dashed;
    if (names) {
      const G = centroid(all);
      all.forEach((p, i) => { b += i >= nb && hid[i - nb] ? lab(p[0] + 20, p[1] + 16, names[i]) : labOut(p, G, names[i], 13); });
    }
    return svg(255, 185, b);
  }
  function cylFig({ W = 220, H = 175 } = {}) {
    const cx = W / 2, rx = 60, ry = 16, yt = 35, yb = 145, xl = cx - rx, xr = cx + rx;
    let b = `<path d="M${xl},${yt} L${xl},${yb} A${rx},${ry} 0 0 0 ${xr},${yb} L${xr},${yt} A${rx},${ry} 0 0 0 ${xl},${yt} Z" class="s-soft s-line"/>`;
    b += `<path d="M${xl},${yb} A${rx},${ry} 0 0 1 ${xr},${yb}" class="s-line s-dash"/>`;
    b += `<ellipse cx="${cx}" cy="${yt}" rx="${rx}" ry="${ry}" class="s-soft2 s-line"/>`;
    return svg(W, H, b);
  }
  function pyrFig() {
    const P = [[40, 160], [150, 160], [195, 122], [85, 122]], S = [115, 25];
    let b = poly([P[0], P[1], P[2], S], 's-soft s-line') + seg(S, P[1]);
    b += seg(P[0], P[3], 's-line s-dash') + seg(P[3], P[2], 's-line s-dash') + seg(S, P[3], 's-line s-dash');
    return svg(220, 175, b);
  }
  function coneFig() {
    const cx = 110, cy = 145, rx = 65, ry = 16, S = [110, 20];
    let b = `<path d="M${cx - rx},${cy} L${S[0]},${S[1]} L${cx + rx},${cy} A${rx},${ry} 0 0 1 ${cx - rx},${cy} Z" class="s-soft s-line"/>`;
    b += `<path d="M${cx - rx},${cy} A${rx},${ry} 0 0 1 ${cx + rx},${cy}" class="s-line s-dash"/>`;
    return svg(220, 175, b);
  }
  // Net of a triangular prism (equilateral bases): nr rectangles, triangles on top of rects `tops`, below `bots`.
  function prismNet(nr, tops, bots, s = 30, h = 46) {
    const th = (s * Math.sqrt(3)) / 2, x0 = 10, y0 = 10 + th;
    let b = '';
    for (let i = 0; i < nr; i++) b += `<rect x="${x0 + i * s}" y="${r1(y0)}" width="${s}" height="${h}" class="s-soft s-line"/>`;
    tops.forEach(i => { b += poly([[x0 + i * s, y0], [x0 + (i + 1) * s, y0], [x0 + (i + 0.5) * s, y0 - th]].map(p => p.map(r1)), 's-soft2 s-line'); });
    bots.forEach(i => { b += poly([[x0 + i * s, y0 + h], [x0 + (i + 1) * s, y0 + h], [x0 + (i + 0.5) * s, y0 + h + th]].map(p => p.map(r1)), 's-soft2 s-line'); });
    return svg(4 * s + 20, r1(h + 2 * th + 20), b);
  }
  // Net of a cylinder: rectangle of length L (px) and height h, discs of radius r at fractions of L (top / bottom).
  function cylNet(L, tops, bots, r = 12, h = 46) {
    const x0 = 10, y0 = 10 + 2 * r, W = Math.max(L, 2 * r) + 20;
    let b = `<rect x="${x0}" y="${y0}" width="${r1(L)}" height="${h}" class="s-soft s-line"/>`;
    tops.forEach(f => { b += `<circle cx="${r1(x0 + f * L)}" cy="${y0 - r}" r="${r}" class="s-soft2 s-line"/>`; });
    bots.forEach(f => { b += `<circle cx="${r1(x0 + f * L)}" cy="${y0 + h + r}" r="${r}" class="s-soft2 s-line"/>`; });
    return svg(r1(W), y0 + h + 2 * r + 10, b);
  }
  const BASE_NAMES = { 3: 'un triangle', 4: 'un quadrilatère', 5: 'un pentagone', 6: 'un hexagone', 7: 'un heptagone', 8: 'un octogone' };
  const COUNT_LAB = { faces: 'faces', aretes: 'arêtes', sommets: 'sommets' };
  const countOf = (nb, w) => ({ faces: nb + 2, aretes: 3 * nb, sommets: 2 * nb }[w]);
  const countWhy = (nb, w) => ({
    faces: `2 bases + ${nb} faces latérales (une par côté de la base) = ${nb + 2} faces`,
    aretes: `${nb} arêtes sur chaque base, donc 2 × ${nb} = ${2 * nb}, plus ${nb} arêtes latérales : ${3 * nb} arêtes`,
    sommets: `${nb} sommets sur chaque base : 2 × ${nb} = ${2 * nb} sommets`,
  }[w]);
  const PC_VOCAB = [
    ['Les faces latérales d’un prisme droit sont des…', 'rectangles', ['triangles', 'disques', 'losanges non carrés']],
    ['Les deux bases d’un prisme droit sont…', 'deux polygones identiques et parallèles', ['deux rectangles perpendiculaires', 'deux disques', 'deux triangles de tailles différentes']],
    ['Les deux bases d’un cylindre de révolution sont…', 'deux disques identiques et parallèles', ['deux disques de rayons différents', 'deux rectangles', 'un disque et un point']],
    ['La hauteur d’un prisme droit est…', 'la longueur d’une arête latérale', ['la longueur d’un côté de la base', 'le périmètre de la base', 'la longueur d’une diagonale de la base']],
    ['Déroulée à plat, la surface latérale d’un cylindre de révolution est…', 'un rectangle', ['un disque', 'un triangle', 'un losange']],
    ['Un pavé droit est…', 'un prisme droit dont les bases sont des rectangles', ['un cylindre', 'une pyramide', 'un prisme dont les bases sont des triangles']],
  ];
  const PC_TF = [
    ['En perspective cavalière, les arêtes cachées sont dessinées en pointillés.', true, 'On les dessine quand même, mais en pointillés.'],
    ['En perspective cavalière, deux arêtes parallèles dans la réalité sont dessinées parallèles.', true, 'C’est une des règles de la perspective cavalière.'],
    ['En perspective cavalière, toutes les faces rectangulaires sont dessinées comme des rectangles.', false, 'Les faces qui « fuient » vers l’arrière sont dessinées comme des parallélogrammes.'],
    ['En perspective cavalière, la face de devant est dessinée en vraie grandeur.', true, 'Les faces parallèles à la feuille (devant, derrière) gardent leur forme et leurs dimensions.'],
    ['En perspective cavalière, un angle droit est toujours dessiné comme un angle droit.', false, 'Seuls les angles des faces de devant et de derrière restent droits ; sur les faces fuyantes, ils sont déformés.'],
    ['Un prisme droit a toujours un nombre pair de sommets.', true, 'Ses deux bases ont le même nombre n de sommets : 2 × n sommets en tout.'],
    ['Sur le patron d’un cylindre, la longueur du rectangle est égale au diamètre du disque de base.', false, 'Elle est égale au <b>périmètre</b> du disque de base : 2 × π × rayon, environ 3 fois le diamètre.'],
    ['Les faces latérales d’un prisme droit sont perpendiculaires aux bases.', true, 'C’est ce que veut dire « droit ».'],
  ];
  const PRISM_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
  const pcExplFig = (() => {
    let b = prismFig(3).replace(/<\/svg>$/, '');
    b += text(95, 182, 'base', { size: 13 }) + text(198, 153, 'hauteur', { anchor: 'start', size: 13 });
    return `${b}</svg>`;
  })();

  M.notion('prismes-cylindres', {
    lesson: {
      retenir: `<ul><li>Un <b>prisme droit</b> a deux <b>bases</b> : deux polygones identiques et parallèles. Ses <b>faces latérales</b> sont des <b>rectangles</b>, perpendiculaires aux bases. La <b>hauteur</b> est la longueur d’une arête latérale (la distance entre les bases).</li><li>Si la base a n côtés : <b>n + 2 faces</b>, <b>3 × n arêtes</b>, <b>2 × n sommets</b>.</li><li>Un <b>cylindre de révolution</b> a deux bases qui sont des <b>disques</b> identiques et parallèles, et une surface latérale courbe. Sa hauteur est la distance entre les bases.</li><li><b>Patron du cylindre</b> : deux disques et un rectangle dont la longueur est le <b>périmètre du disque, 2 × π × r</b>, et la largeur la hauteur.</li><li>En <b>perspective cavalière</b>, la face de devant est en vraie grandeur, les arêtes parallèles restent parallèles et les arêtes cachées sont en <b>pointillés</b>.</li></ul>`,
      explication: `<div class="nets"><div class="net">${pcExplFig}</div><div class="net">${cylNet(2 * Math.PI * 14, [0.3], [0.7], 14, 50)}</div></div><p>À gauche, un prisme droit à base triangulaire : 2 bases + 3 faces latérales = 5 faces ; 3 + 3 + 3 = 9 arêtes ; 6 sommets. Les pointillés montrent les arêtes cachées.</p><p>À droite, le patron d’un cylindre : en enroulant le rectangle, sa longueur fait exactement le tour du disque. Elle vaut donc le périmètre du disque, 2 × π × r.</p>`,
      methode: [
        'Pour reconnaître les bases d’un prisme droit : cherche les deux faces identiques et parallèles (elles ne sont pas forcément « en bas » et « en haut »).',
        'Pour compter : faces = n + 2 ; arêtes = 3 × n ; sommets = 2 × n, où n est le nombre de côtés de la base.',
        'Patron d’un prisme : les faces latérales forment une bande de rectangles ; les deux bases sont accrochées de part et d’autre de cette bande.',
        'Patron d’un cylindre : rectangle de longueur 2 × π × r (π ≈ 3,14) et de largeur la hauteur, un disque de chaque côté.',
      ],
      exemples: [
        { q: 'Prisme droit à base hexagonale : faces, arêtes, sommets ?', r: '6 + 2 = <b>8 faces</b>, 3 × 6 = <b>18 arêtes</b>, 2 × 6 = <b>12 sommets</b>.' },
        { q: 'Cylindre de rayon 5 cm : longueur du rectangle de son patron ?', r: '2 × 3,14 × 5 = <b>31,4 cm</b>.' },
      ],
      astuces: ['Les arêtes latérales d’un prisme droit ont toutes la même longueur : la hauteur.', 'Le pavé droit et le cube sont des prismes droits particuliers.'],
      erreurs: [
        'Prendre le diamètre (au lieu du périmètre du disque) comme longueur du rectangle dans le patron d’un cylindre.',
        'Placer les deux bases du même côté de la bande des faces latérales dans un patron.',
        'Croire qu’une face dessinée en parallélogramme en perspective est un parallélogramme dans la réalité.',
      ],
    },
    generate(level, rng) {
      const t = level === 1 ? rng.pick(['count', 'vocab', 'solid'])
        : level === 2 ? rng.pick(['count', 'cyl', 'net', 'net', 'persp', 'tf'])
          : rng.pick(['inv', 'cylr', 'strip', 'aire', 'persp', 'net']);
      if (t === 'count') {
        const nb = level === 1 ? rng.pick([3, 4]) : rng.pick([5, 6, 7, 8]), w = rng.pick(['faces', 'aretes', 'sommets']), v = countOf(nb, w);
        const fig = PRISM_BASES[nb] ? prismFig(nb) : '';
        return Q(`pc${level}n:${nb}:${w}`, `${fig}Combien de <b>${COUNT_LAB[w]}</b> a un prisme droit dont la base est ${BASE_NAMES[nb]} ?`, num(v), 'Compte d’abord les côtés de la base ; chaque côté de la base donne une face latérale et une arête latérale.',
          `La base a ${nb} côtés : ${countWhy(nb, w)}. Réponse : <b>${fmt(v)}</b>.`);
      }
      if (t === 'vocab') {
        const i = rng.int(0, PC_VOCAB.length - 1), [q, good, bad] = PC_VOCAB[i];
        return Q(`pc1v:${i}`, q, choice(rng, good, bad), 'Pense à une boîte en forme de prisme, ou à une boîte de conserve.', `Réponse : <b>${good}</b>.`);
      }
      if (t === 'solid') {
        const ask = rng.pick(['prisme', 'cylindre']), base = rng.pick([3, 5, 6]);
        const g = gallery(rng, [
          { ok: ask === 'prisme', svg: prismFig(base) },
          { ok: ask === 'cylindre', svg: cylFig() },
          { ok: false, svg: pyrFig() },
          { ok: false, svg: coneFig() },
        ]);
        const why = ask === 'prisme' ? `il a deux bases identiques et parallèles (${BASE_NAMES[base].replace('un ', 'des ').replace('une ', 'des ')}s) reliées par des faces rectangulaires` : 'il a deux disques identiques et parallèles reliés par une surface courbe';
        return Q(`pc1s:${ask}:${base}:${g.good}`, `${g.html}Quelle figure représente ${ask === 'prisme' ? 'un prisme droit' : 'un cylindre de révolution'} ?`, g.answer, ask === 'prisme' ? 'Un prisme droit a deux bases identiques et parallèles, et des faces latérales rectangulaires.' : 'Un cylindre a deux bases en forme de disque.',
          `C’est la <b>${g.good}</b> : ${why}. Parmi les autres, la pyramide et le cône se terminent en pointe, et ${ask === 'prisme' ? 'le cylindre a des bases en forme de disque' : 'le prisme droit a des bases qui sont des polygones'}.`);
      }
      if (t === 'cyl') {
        if (rng.chance(0.6)) {
          const r = rng.int(2, 15), L = mul(6.28, r);
          return Q(`pc2c:${r}`, `Un cylindre de révolution a des bases de rayon ${cm(r)}. Quelle est la longueur du rectangle de son patron ? (prends π ≈ 3,14)`, num(L, 'cm'), 'Quand on l’enroule, la longueur du rectangle fait exactement le tour du disque de base.',
            `La longueur du rectangle est le périmètre du disque : 2 × 3,14 × ${r} = <b>${cm(L)}</b>.`);
        }
        const d = rng.int(2, 25), L = mul(3.14, d);
        return Q(`pc2d:${d}`, `Une boîte de conserve cylindrique a un diamètre de ${cm(d)}. On veut fabriquer son étiquette, qui fait exactement le tour de la boîte. Quelle est la longueur de l’étiquette ? (prends π ≈ 3,14)`, num(L, 'cm'), 'L’étiquette fait le tour du disque de base : c’est son périmètre.',
          `Périmètre du disque = π × diamètre ≈ 3,14 × ${d} = <b>${cm(L)}</b>.`);
      }
      if (t === 'net') {
        if (rng.chance(0.5)) {
          const i = rng.int(0, 2), j = rng.int(0, 2), sameTop = rng.chance(0.5);
          const g = gallery(rng, [
            { ok: true, svg: prismNet(3, [i], [j]) },
            { ok: false, svg: sameTop ? prismNet(3, [0, 2], []) : prismNet(3, [], [0, 2]) },
            { ok: false, svg: prismNet(4, [rng.int(0, 3)], [rng.int(0, 3)]) },
            { ok: false, svg: prismNet(2, [0], [1]) },
          ]);
          return Q(`pc${level}p:${i}:${j}:${sameTop}:${g.good}`, `${g.html}Laquelle de ces figures est le patron d’un prisme droit dont les bases sont des triangles équilatéraux ?`, g.answer, 'Il faut 2 bases et une face latérale par côté de la base ; une fois plié, rien ne doit se superposer.',
            `C’est la <b>${g.good}</b> : 3 rectangles (un par côté du triangle) et 2 triangles, un de chaque côté de la bande. Avec 4 ou 2 rectangles, le nombre de faces latérales ne va pas ; avec les deux triangles du même côté, ils se superposent une fois pliés.`);
        }
        const L = 2 * Math.PI * 12;
        const g = gallery(rng, [
          { ok: true, svg: cylNet(L, [0.3], [0.7]) },
          { ok: false, svg: cylNet(L, [0.22, 0.78], []) },
          { ok: false, svg: cylNet(24, [0.5], [0.5]) },
          { ok: false, svg: cylNet(L, [0.5], []) },
        ]);
        return Q(`pc${level}y:${g.good}`, `${g.html}Laquelle de ces figures est le patron d’un cylindre de révolution ?`, g.answer, 'Il faut deux disques, et la longueur du rectangle doit faire le tour d’un disque.',
          `C’est la <b>${g.good}</b> : deux disques de part et d’autre d’un rectangle dont la longueur est le périmètre du disque (2 × π × r, un peu plus de 6 fois le rayon). Un rectangle aussi long que le diamètre est bien trop court pour faire le tour.`);
      }
      if (t === 'persp') {
        const names = PRISM_LETTERS, fig = prismFig(3, { names }), v = rng.int(0, 3);
        const pre = `${fig}Le prisme droit ABCDEF est dessiné en perspective cavalière ; ses bases sont les triangles ABC et DEF.<br>`;
        if (v === 0) {
          const good = rng.pick(['[BE]', '[CF]']);
          return Q(`pc${level}a:${good}`, `${pre}Dans la réalité, quelle arête a <b>forcément</b> la même longueur que [AD] ?`, choice(rng, good, ['[AB]', '[DF]', '[AC]', '[EF]']), 'Que représente [AD] pour le prisme ?',
            `[AD] est une arête latérale : toutes les arêtes latérales ([AD], [BE], [CF]) mesurent la hauteur du prisme. Réponse : <b>${good}</b>.`);
        }
        if (v === 1) {
          return Q(`pc${level}b`, `${pre}Dans la réalité, quelle arête a forcément la même longueur que [AB] ?`, choice(rng, '[DE]', ['[BE]', '[AD]', '[EF]', '[BC]']), 'Les deux bases sont des triangles identiques.',
            `Les bases ABC et DEF sont identiques, et le côté qui correspond à [AB] est <b>[DE]</b>.`);
        }
        if (v === 2) {
          return Q(`pc${level}c`, `${pre}Quelles arêtes sont cachées (dessinées en pointillés) ?`, choice(rng, '[AD], [DE] et [DF]', ['[BE], [EF] et [DE]', '[AB], [BC] et [AC]', '[CF], [DF] et [EF]']), 'Cherche le sommet que l’on ne voit pas.',
            'Le sommet D est caché derrière le prisme : les trois arêtes qui en partent, <b>[AD], [DE] et [DF]</b>, sont en pointillés.');
        }
        const good = rng.pick([`${hat('D', 'A', 'B')}`, `${hat('A', 'B', 'E')}`, `${hat('B', 'C', 'F')}`]);
        return Q(`pc${level}d:${good}`, `${pre}Sur le dessin, l’angle ${good} n’est pas droit. Dans la réalité, cet angle est-il droit ?`, fixedChoice(['Oui', 'Non'], 'Oui'), 'Quelle est la forme réelle des faces latérales d’un prisme droit ?',
          `<b>Oui</b> : il appartient à une face latérale, et les faces latérales d’un prisme droit sont des rectangles. La perspective cavalière déforme les angles des faces fuyantes.`);
      }
      if (t === 'tf') {
        const i = rng.int(0, PC_TF.length - 1), [txt, val, why] = PC_TF[i];
        return Q(`pc2f:${i}`, `Vrai ou faux ?<br><i>${txt}</i>`, TF(val), 'Pense à un prisme ou à un cylindre que tu connais (boîte, canette…).', `<b>${val ? 'Vrai' : 'Faux'}</b>. ${why}`);
      }
      if (t === 'inv') {
        const nb = rng.int(3, 10), w = rng.pick(['faces', 'aretes', 'sommets']), v = countOf(nb, w);
        const calc = { faces: `${v} − 2 = ${nb}`, aretes: `${v} ÷ 3 = ${nb}`, sommets: `${v} ÷ 2 = ${nb}` }[w];
        return Q(`pc3i:${nb}:${w}`, `Un prisme droit a ${v} ${COUNT_LAB[w]}. Combien de côtés a chacune de ses bases ?`, num(nb), `Écris le nombre de ${COUNT_LAB[w]} en fonction du nombre n de côtés de la base.`,
          `Si la base a n côtés, le prisme a ${{ faces: 'n + 2 faces', aretes: '3 × n arêtes', sommets: '2 × n sommets' }[w]}. Donc n = ${calc} : la base a <b>${nb}</b> côtés.`);
      }
      if (t === 'cylr') {
        const r = rng.int(1, 12), L = mul(6.28, r);
        return Q(`pc3r:${r}`, `Le rectangle du patron d’un cylindre de révolution mesure ${cm(L)} de long. Quel est le rayon des bases ? (on a pris π ≈ 3,14)`, num(r, 'cm'), 'La longueur du rectangle est le périmètre du disque de base : 2 × π × rayon.',
          `${fmt(L)} = 2 × 3,14 × r = 6,28 × r, donc r = ${fmt(L)} ÷ 6,28 = <b>${cm(r)}</b>.`);
      }
      if (t === 'strip') {
        const [a, b, c] = sssVals(rng), h = rng.int(3, 15), P = a + b + c;
        return Q(`pc3s:${a}:${b}:${c}:${h}`, `Un prisme droit a pour bases des triangles de côtés ${cm(a)}, ${cm(b)} et ${cm(c)}, et pour hauteur ${cm(h)}. Sur son patron, les trois faces latérales forment un seul grand rectangle. Quelle est la longueur de ce rectangle ?`, num(P, 'cm'), 'Chaque face latérale est un rectangle dont une dimension est un côté de la base.',
          `Les trois rectangles ont pour longueurs les côtés de la base : ${a} + ${b} + ${c} = <b>${cm(P)}</b> (le périmètre de la base). Sa largeur est la hauteur, ${cm(h)}.`);
      }
      // t === 'aire'
      const r = rng.int(1, 9), h = rng.int(2, 15), L = mul(6.28, r), A = mul(L, h);
      return Q(`pc3a:${r}:${h}`, `Un cylindre de révolution a un rayon de ${cm(r)} et une hauteur de ${cm(h)}. Quelle est l’aire de sa surface latérale (le rectangle du patron) ? (prends π ≈ 3,14)`, num(A, 'cm²'), 'Calcule d’abord la longueur du rectangle (le tour du disque), puis l’aire du rectangle.',
        `Longueur du rectangle : 2 × 3,14 × ${r} = ${fmt(L)} cm. Largeur : ${h} cm. Aire : ${fmt(L)} × ${h} = <b>${fmt(A)} cm²</b>.`);
    },
  });

  // =====================================================================
  // AGRANDISSEMENT ET RÉDUCTION
  // =====================================================================
  const SHAPES = [
    [[0, 0], [2, 0], [2, 1], [1, 1], [1, 3], [0, 3]],
    [[0, 0], [3, 0], [2, 2], [0, 2]],
    [[0, 0], [2, 0], [0, 3]],
    [[0, 1], [1, 0], [2, 1], [2, 3], [0, 3]],
    [[0, 0], [3, 0], [3, 1], [1, 2], [0, 2]],
    [[1, 0], [2, 0], [3, 2], [0, 2]],
  ];
  // Polygon on a square grid (grid units, y down), cols × rows cells.
  function gridShape(pts, cols, rows, c = 10) {
    let b = '';
    for (let i = 0; i <= cols; i++) b += line(5 + i * c, 5, 5 + i * c, 5 + rows * c, 's-grid');
    for (let j = 0; j <= rows; j++) b += line(5, 5 + j * c, 5 + cols * c, 5 + j * c, 's-grid');
    b += poly(pts.map(([x, y]) => [5 + x * c, 5 + y * c]), 's-soft s-line');
    return svg(cols * c + 10, rows * c + 10, b);
  }
  const scaleXY = (pts, kx, ky) => pts.map(([x, y]) => [x * kx, y * ky]);
  const ext = pts => [Math.max(...pts.map(p => p[0])), Math.max(...pts.map(p => p[1]))];
  // Two triangles side by side, same scale: sides [AB, BC, AC] and coefficient k; labels per side (or '').
  function triPair(sides, k, labA, labB, namesA, namesB) {
    const [c, a, b] = sides, P0 = sssPts(c, b, a), P1 = P0.map(p => [p[0] * k, p[1] * k]);
    const w0 = Math.max(...P0.map(p => p[0])) - Math.min(0, ...P0.map(p => p[0])), h0 = Math.max(...P0.map(p => p[1]));
    const big = Math.max(1, k), s = Math.min(230 / (w0 * big), 130 / (h0 * big), 30);
    const H = h0 * big * s + 60, draw = (P, x0, labs, names) => {
      const minx = Math.min(0, ...P.map(p => p[0]));
      const S = P.map(p => [x0 + (p[0] - minx) * s, H - 30 - p[1] * s]), G = centroid(S);
      let o = poly(S, 's-soft s-line');
      [[0, 1], [1, 2], [0, 2]].forEach(([i, j], q) => { if (labs[q]) o += sideLab(S[i], S[j], G, labs[q]); });
      names.forEach((nm, i) => { o += labOut(S[i], G, nm); });
      return { o, right: Math.max(...S.map(p => p[0])) };
    };
    const first = draw(P0, 35, labA, namesA), second = draw(P1, first.right + 60, labB, namesB);
    return svg(r1(second.right + 35), r1(H), first.o + second.o);
  }
  const AG_TF = [
    ['Quand on multiplie toutes les longueurs d’une figure par 2, son aire est multipliée par 2.', false, 'Elle est multipliée par 2 × 2 = 4 : un carré de 1 cm de côté (1 cm²) devient un carré de 2 cm de côté (4 cm²).'],
    ['Dans un agrandissement, les angles sont multipliés par le coefficient.', false, 'Les angles ne changent pas : la figure garde sa forme.'],
    ['Dans une réduction de coefficient 0,5, le périmètre est divisé par 2.', true, 'Toutes les longueurs sont multipliées par 0,5, donc leur somme aussi.'],
    ['Si on ajoute 2 cm à chaque côté d’un rectangle, on obtient un agrandissement de ce rectangle.', false, 'Exemple : 1 cm × 2 cm devient 3 cm × 4 cm ; 3 ÷ 1 = 3 mais 4 ÷ 2 = 2 : les longueurs ne sont pas multipliées par un même nombre.'],
    ['L’agrandissement d’un carré est un carré.', true, 'Les angles droits sont conservés et les quatre côtés restent de même longueur.'],
    ['Dans un agrandissement, deux droites perpendiculaires restent perpendiculaires.', true, 'Les angles sont conservés, en particulier les angles droits.'],
    ['Un coefficient de 0,8 correspond à un agrandissement.', false, '0,8 est plus petit que 1 : les longueurs diminuent, c’est une réduction.'],
    ['Quand on divise toutes les longueurs par 3, l’aire est divisée par 9.', true, 'Elle est divisée par 3 × 3 = 9.'],
  ];
  const agExplFig = (() => {
    const s = SHAPES[0], big = scaleXY(s, 2, 2);
    return `<div class="nets"><div class="net"><b>Figure de départ</b>${gridShape(s, 6, 6, 14)}</div><div class="net"><b>Agrandissement × 2</b>${gridShape(big, 6, 6, 14)}</div></div>`;
  })();

  M.notion('agrandissement', {
    lesson: {
      retenir: `<ul><li>Agrandir ou réduire une figure de <b>coefficient k</b>, c’est <b>multiplier toutes ses longueurs par k</b>. Si k &gt; 1, c’est un <b>agrandissement</b> ; si k &lt; 1, une <b>réduction</b>.</li><li>Les <b>angles ne changent pas</b> : la figure garde sa forme (parallélisme et angles droits sont conservés).</li><li>Le coefficient se calcule avec deux longueurs correspondantes : <b>k = longueur obtenue ÷ longueur de départ</b>.</li><li>Le périmètre est lui aussi multiplié par k.</li><li><i>Pour aller plus loin</i> : les <b>aires</b> sont multipliées par <b>k × k</b> (k²).</li></ul>`,
      explication: `${agExplFig}<p>Chaque longueur a été multipliée par 2 : la figure a la même forme, ses angles n’ont pas changé. Mais chaque petit carreau de la figure de départ est devenu un carré de 2 × 2 = <b>4 carreaux</b> : l’aire est multipliée par 4, pas par 2.</p>`,
      methode: [
        'Repère deux longueurs qui se correspondent (même côté sur les deux figures).',
        'Calcule le coefficient : k = longueur sur la nouvelle figure ÷ longueur sur la figure de départ.',
        'Multiplie chaque autre longueur de départ par k ; recopie les angles tels quels.',
        'Pour une aire, multiplie par k puis encore par k.',
      ],
      exemples: [
        { q: 'Un triangle a des côtés de 3 cm, 4 cm et 5 cm. On l’agrandit avec le coefficient 1,5.', r: '3 × 1,5 = <b>4,5 cm</b> ; 4 × 1,5 = <b>6 cm</b> ; 5 × 1,5 = <b>7,5 cm</b>. Les angles ne changent pas.' },
        { q: 'Un côté de 8 cm devient 2 cm. Coefficient ?', r: 'k = 2 ÷ 8 = <b>0,25</b> : c’est une réduction.' },
        { q: 'Une figure de 5 cm² est agrandie avec le coefficient 3. Nouvelle aire ?', r: '5 × 3 × 3 = <b>45 cm²</b>.' },
      ],
      astuces: ['Sur un plan ou une carte, l’échelle est le coefficient de réduction : au 1/100, k = 0,01.', 'Une photocopie à 200 % est un agrandissement de coefficient 2 ; à 50 %, une réduction de coefficient 0,5.'],
      erreurs: [
        'Ajouter le même nombre à toutes les longueurs : il faut les multiplier par le même nombre.',
        'Multiplier les angles par k : ils restent les mêmes.',
        'Multiplier l’aire par k au lieu de k × k.',
      ],
    },
    generate(level, rng) {
      const t = level === 1 ? rng.pick(['mult', 'reduce', 'angle', 'kind'])
        : level === 2 ? rng.pick(['coef', 'complete', 'perim', 'grid'])
          : rng.pick(['aire', 'airinv', 'completedec', 'tf', 'grid']);
      if (t === 'mult') {
        const k = rng.pick([2, 3, 4, 5, 10]), L = rng.chance(0.5) ? rng.int(2, 15) : dec(rng.int(11, 95), 1), N = mul(L, k);
        return Q(`ag1m:${k}:${L}`, `On agrandit une figure : toutes ses longueurs sont multipliées par ${k}. Un côté mesure ${cm(L)} sur la figure de départ. Combien mesure-t-il sur la figure agrandie ?`, num(N, 'cm'), 'Dans un agrandissement, chaque longueur est multipliée par le même nombre.',
          `${fmt(L)} × ${k} = <b>${cm(N)}</b>.`);
      }
      if (t === 'reduce') {
        const d = rng.pick([2, 4, 5, 10]), N = rng.chance(0.5) ? rng.int(1, 12) : dec(rng.int(5, 60), 1), L = mul(N, d);
        const k = div(1, d);
        return Q(`ag1r:${d}:${L}`, `On réduit une figure avec le coefficient ${fmt(k)} : toutes ses longueurs sont divisées par ${d}. Un côté mesure ${cm(L)} sur la figure de départ. Combien mesure-t-il sur la figure réduite ?`, num(N, 'cm'), 'Dans une réduction, chaque longueur est divisée par le même nombre.',
          `${fmt(L)} × ${fmt(k)} = ${fmt(L)} ÷ ${d} = <b>${cm(N)}</b>.`);
      }
      if (t === 'angle') {
        const k = rng.pick([2, 3, 0.5, 1.5, 4]), a = rng.int(20, 150);
        return Q(`ag1a:${k}:${a}`, `On ${k > 1 ? 'agrandit' : 'réduit'} un triangle avec le coefficient ${fmt(k)}. Un de ses angles mesure ${deg(a)}. Combien mesure l’angle correspondant sur la nouvelle figure ?`, num(a, '°'), 'Un agrandissement ou une réduction change-t-il la forme de la figure ?',
          `Les angles ne changent pas : la figure garde sa forme. L’angle mesure toujours <b>${deg(a)}</b>.`);
      }
      if (t === 'kind') {
        const k = rng.pick([0.5, 0.75, 0.2, 0.9, 1.5, 2, 3, 1.25, 4, 0.25]), big = k > 1, OPTS = ['un agrandissement', 'une réduction'];
        return Q(`ag1k:${k}`, `On multiplie toutes les longueurs d’une figure par ${fmt(k)}. Obtient-on un agrandissement ou une réduction ?`, fixedChoice(OPTS, OPTS[big ? 0 : 1]), 'Compare le coefficient à 1.',
          `${fmt(k)} est ${big ? 'plus grand' : 'plus petit'} que 1 : les longueurs ${big ? 'augmentent' : 'diminuent'}, c’est <b>${OPTS[big ? 0 : 1]}</b>.`);
      }
      if (t === 'coef') {
        const k = rng.pick([1.5, 2, 2.5, 3, 4, 0.5, 0.25, 0.75, 1.2]), L = rng.int(2, 12), N = mul(L, k);
        const T = triNames(rng), [A, B] = T.base, tp = T.base.map(x => x + '’').join('');
        return Q(`ag2c:${k}:${L}`, `Le triangle ${tp} est ${k > 1 ? 'un agrandissement' : 'une réduction'} du triangle ${T.tn}. On a ${A}${B} = ${cm(L)} et ${A}’${B}’ = ${cm(N)}. Quel est le coefficient ${k > 1 ? 'd’agrandissement' : 'de réduction'} ?`, num(k), 'Divise une longueur de la nouvelle figure par la longueur correspondante de la figure de départ.',
          `k = ${A}’${B}’ ÷ ${A}${B} = ${fmt(N)} ÷ ${L} = <b>${fmt(k)}</b>. Vérification : ${L} × ${fmt(k)} = ${fmt(N)}.`);
      }
      if (t === 'complete' || t === 'completedec') {
        const k = t === 'complete' ? rng.pick([2, 3, 1.5, 0.5]) : rng.pick([1.2, 1.25, 2.5, 0.6, 0.4, 0.8, 1.4]);
        let s = sssVals(rng);
        while (2 * Math.max(...s) > 1.6 * (s[0] + s[1] + s[2] - Math.max(...s)) + 0) s = sssVals(rng);   // not too flat
        if (k === 0.5) s = s.map(x => 2 * x);
        const [c, b, a] = [s[0], s[1], s[2]], T = triNames(rng), [A, B, C] = T.base;
        const AB = c, AC = b, BC = a, AB2 = mul(AB, k), ask = rng.pick(['BC', 'AC']), val = ask === 'BC' ? BC : AC, ans = mul(val, k);
        const namesB = [`${A}’`, `${B}’`, `${C}’`];
        const nm = ask === 'BC' ? `${B}’${C}’` : `${A}’${C}’`, nm0 = ask === 'BC' ? `${B}${C}` : `${A}${C}`;
        const fig = t === 'complete'
          ? triPair([AB, BC, AC], k, [cm(AB), cm(BC), cm(AC)], [cm(AB2), ask === 'BC' ? '?' : '', ask === 'AC' ? '?' : ''], T.base, namesB)
          : table([['Triangle ' + T.tn, `${A}${B} = ${cm(AB)}`, `${B}${C} = ${cm(BC)}`, `${A}${C} = ${cm(AC)}`], [`Triangle ${A}’${B}’${C}’`, `${A}’${B}’ = ${cm(AB2)}`, ask === 'BC' ? `${B}’${C}’ = ?` : '', ask === 'AC' ? `${A}’${C}’ = ?` : '']]);
        return Q(`ag${level}t:${k}:${s.join(':')}:${ask}`, `${fig}Le triangle ${A}’${B}’${C}’ est ${k > 1 ? 'un agrandissement' : 'une réduction'} du triangle ${T.tn}. Combien mesure ${nm} ?`, num(ans, 'cm'), `Calcule d’abord le coefficient avec [${A}${B}] et [${A}’${B}’].`,
          `Coefficient : k = ${fmt(AB2)} ÷ ${fmt(AB)} = ${fmt(k)}. Donc ${nm} = ${nm0} × ${fmt(k)} = ${fmt(val)} × ${fmt(k)} = <b>${cm(ans)}</b>.`);
      }
      if (t === 'perim') {
        const k = rng.pick([2, 3, 1.5, 0.5, 2.5]), P = rng.int(8, 40), N = mul(P, k);
        return Q(`ag2p:${k}:${P}`, `Une figure a un périmètre de ${cm(P)}. On ${k > 1 ? 'l’agrandit' : 'la réduit'} avec le coefficient ${fmt(k)}. Quel est le périmètre de la nouvelle figure ?`, num(N, 'cm'), 'Le périmètre est une somme de longueurs : chacune est multipliée par le coefficient.',
          `Toutes les longueurs sont multipliées par ${fmt(k)}, donc leur somme aussi : ${P} × ${fmt(k)} = <b>${cm(N)}</b>.`);
      }
      if (t === 'grid') {
        const si = rng.int(0, SHAPES.length - 1), shp = SHAPES[si], [w, h] = ext(shp);
        const reduce = level === 3, k = reduce ? 3 : rng.pick([2, 3]);
        const orig = reduce ? scaleXY(shp, 3, 3) : shp;
        const cands = reduce
          ? [{ ok: true, p: shp }, { ok: false, p: scaleXY(shp, 2, 2) }, { ok: false, p: scaleXY(shp, 1, 3) }, { ok: false, p: scaleXY(shp, 3, 1) }]
          : [{ ok: true, p: scaleXY(shp, k, k) }, { ok: false, p: scaleXY(shp, k + 1, k + 1) }, { ok: false, p: scaleXY(shp, k, 1) }, { ok: false, p: scaleXY(shp, 1, k) }];
        const cols = Math.max(...cands.map(c => ext(c.p)[0]), ext(orig)[0]) + 1, rows = Math.max(...cands.map(c => ext(c.p)[1]), ext(orig)[1]) + 1;
        const g = gallery(rng, cands.map(c => ({ ok: c.ok, svg: gridShape(c.p, cols, rows) })));
        const start = `<div class="nets"><div class="net"><b>Figure de départ</b>${gridShape(orig, cols, rows)}</div></div>`;
        const ask = reduce ? `une réduction de la figure de départ où toutes les longueurs sont divisées par 3 (coefficient ${frac(1, 3)})` : `un agrandissement de coefficient ${k} de la figure de départ`;
        return Q(`ag${level}g:${si}:${k}:${g.good}`, `${start}${g.html}Quelle figure est ${ask} ?`, g.answer, 'Compare la largeur et la hauteur de chaque figure, en carreaux, avec celles de la figure de départ.',
          `C’est la <b>${g.good}</b> : la largeur passe de ${ext(orig)[0]} à ${reduce ? w : w * k} carreaux et la hauteur de ${ext(orig)[1]} à ${reduce ? h : h * k}, ${reduce ? 'toutes deux divisées par 3' : `toutes deux multipliées par ${k}`}, et la forme est conservée. Les autres figures sont déformées ou n’ont pas le bon coefficient.`);
      }
      if (t === 'aire') {
        const k = rng.pick([2, 3, 4, 10, 0.5, 1.5]), A = rng.chance(0.6) ? rng.int(2, 30) : dec(rng.int(11, 99), 1), k2 = mul(k, k), N = mul(A, k2);
        return Q(`ag3a:${k}:${A}`, `Une figure a une aire de ${fmt(A)} cm². On ${k > 1 ? 'l’agrandit' : 'la réduit'} avec le coefficient ${fmt(k)}. Quelle est l’aire de la nouvelle figure ?`, num(N, 'cm²'), 'Une aire, c’est « une longueur fois une longueur » : chacune des deux est multipliée par le coefficient.',
          `Les aires sont multipliées par ${fmt(k)} × ${fmt(k)} = ${fmt(k2)}. Nouvelle aire : ${fmt(A)} × ${fmt(k2)} = <b>${fmt(N)} cm²</b>.`);
      }
      if (t === 'airinv') {
        const k = rng.pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 0.5, 0.1]), k2 = mul(k, k);
        return Q(`ag3i:${k}`, `On ${k > 1 ? 'agrandit' : 'réduit'} une figure : son aire est multipliée par ${fmt(k2)}. Par quel nombre ses longueurs ont-elles été multipliées ?`, num(k), 'Cherche le nombre qui, multiplié par lui-même, donne le coefficient des aires.',
          `Les aires sont multipliées par k × k. Or ${fmt(k)} × ${fmt(k)} = ${fmt(k2)} : les longueurs ont été multipliées par <b>${fmt(k)}</b>.`);
      }
      const i = rng.int(0, AG_TF.length - 1), [txt, val, why] = AG_TF[i];
      return Q(`ag3f:${i}`, `Vrai ou faux ?<br><i>${txt}</i>`, TF(val), 'Teste avec un exemple simple, comme un carré de 1 cm de côté.', `<b>${val ? 'Vrai' : 'Faux'}</b>. ${why}`);
    },
  });

  // ===================== EXPLICATIONS =====================
  const BASE = M.cat.BASE, E = M.explain;
  E('triangles-construction', [
    ['dessin', BASE],
    ['etapes', `<p>Construire RST avec RS = 5 cm, ${hat('S', 'R', 'T')} = 40° et RT = 3 cm (deux côtés et l’angle compris) :</p><ol><li>Croquis à main levée : l’angle de 40° est en R, entre [RS] et [RT].</li><li>Je trace [RS] de 5 cm.</li><li>Je place le centre du rapporteur en R, le zéro sur [RS), et je trace la demi-droite à 40°.</li><li>Sur cette demi-droite, je place T à 3 cm de R.</li><li>Je trace [ST] : c’est fini.</li></ol>`],
    ['vie', '<p>Un menuisier veut fabriquer une étagère d’angle triangulaire. S’il connaît les trois longueurs des bords, il peut tracer la planche avec un mètre et une ficelle tendue (un compas géant !). S’il connaît deux bords et l’angle du coin du mur, il lui faut un rapporteur. Dans tous les cas, avec ces informations, il obtient <b>une seule</b> forme possible : l’étagère ira parfaitement dans le coin.</p>'],
  ]);
  E('cercle-circonscrit', [
    ['dessin', BASE],
    ['vie', '<p>Trois villages veulent construire un château d’eau <b>à la même distance</b> des trois. Le point à égale distance des villages A et B est sur la médiatrice de [AB] ; à égale distance de B et C, sur la médiatrice de [BC]. Le bon emplacement est donc à l’intersection des médiatrices : c’est le centre du cercle circonscrit au triangle formé par les villages.</p>'],
    ['lien', '<p>Tu connais la propriété de la médiatrice : un point est sur la médiatrice de [AB] si et seulement si il est à égale distance de A et de B. Le cercle circonscrit n’est que cette propriété appliquée <b>deux fois</b> : O est sur la médiatrice de [AB] (OA = OB) et sur celle de [BC] (OB = OC), donc OA = OC, et O est aussi sur la troisième médiatrice.</p>'],
  ]);
  E('prismes-cylindres', [
    ['dessin', BASE],
    ['vie', '<p>Décolle délicatement l’étiquette d’une boîte de conserve : tu obtiens un <b>rectangle</b>. Sa largeur est la hauteur de la boîte, et sa longueur fait exactement le tour du couvercle : c’est le périmètre du disque. Pour une boîte de 4 cm de rayon, l’étiquette mesure environ 2 × 3,14 × 4 ≈ 25 cm de long.</p>'],
    ['etapes', '<p>Pour fabriquer un prisme droit à base triangulaire (comme une boîte de barre chocolatée) :</p><ol><li>Je dessine une bande de 3 rectangles côte à côte, de même hauteur ; leurs largeurs sont les 3 côtés du triangle de base.</li><li>J’accroche un triangle sur le bord du haut d’un rectangle…</li><li>… et l’autre triangle sur le bord du bas (jamais les deux du même côté).</li><li>Je découpe, je plie le long des côtés communs et je colle.</li></ol>'],
  ]);
  E('agrandissement', [
    ['dessin', BASE],
    ['vie', '<p>À la photocopieuse, si tu choisis <b>200 %</b>, chaque longueur du dessin est multipliée par 2 : le dessin a exactement la même forme, en plus grand. Mais il occupe <b>4 fois</b> plus de place sur la feuille (2 × 2). Et à 50 %, chaque longueur est divisée par 2 : c’est une réduction.</p>'],
    ['lien', '<p>Agrandir une figure, c’est une situation de <b>proportionnalité</b> : les longueurs de la nouvelle figure sont proportionnelles à celles de la figure de départ, et le coefficient k est le coefficient de proportionnalité. Un plan à l’échelle, c’est pareil : une réduction dont le coefficient est l’échelle.</p>'],
  ]);
})();
