// Domain "Espace & géométrie" (multiple choice with SVG figures).
(function () {
  'use strict';
  const M = globalThis.M;
  const { fmt, dec, mul, div } = M.u;
  const { hole } = M.h;
  const { Q, num, choice, fixedChoice } = M.kit;
  const S = M.svg;
  const TF = b => fixedChoice(['Vrai', 'Faux'], b ? 'Vrai' : 'Faux');

  // ===================== VOCABULAIRE =====================
  const KINDS = {
    segment: { name: 'le segment', not: (a, b) => `[${a}${b}]`, def: 'limité par deux points (ses extrémités)' },
    droite: { name: 'la droite', not: (a, b) => `(${a}${b})`, def: 'illimitée des deux côtés' },
    'demi-droite': { name: 'la demi-droite', not: (a, b) => `[${a}${b})`, def: 'limitée d’un seul côté, par son origine' },
  };
  const facts = [
    ['Par deux points distincts, il passe une seule droite.', true],
    ['Une droite a une longueur que l’on peut mesurer.', false],
    ['Un segment a une longueur que l’on peut mesurer.', true],
    ['[AB) et [BA) désignent la même demi-droite.', false],
    ['[AB] et [BA] désignent le même segment.', true],
    ['(AB) et (BA) désignent la même droite.', true],
    ['Le milieu d’un segment est à égale distance de ses deux extrémités.', true],
    ['Trois points sont toujours alignés.', false],
    ['Une demi-droite a une origine.', true],
  ];

  M.notion('geo-vocabulaire', {
    lesson: {
      retenir: `<ul><li>La <b>droite (AB)</b> passe par A et B et est <b>illimitée</b> des deux côtés.</li><li>Le <b>segment [AB]</b> est la portion de droite <b>limitée</b> par A et B ; sa longueur se note AB.</li><li>La <b>demi-droite [AB)</b> a pour <b>origine</b> A et passe par B ; elle est illimitée du côté de B.</li></ul>`,
      explication: `${S.lineKind('droite')}<p class="center">droite (AB)</p>${S.lineKind('segment')}<p class="center">segment [AB]</p>${S.lineKind('demi-droite')}<p class="center">demi-droite [AB)</p>`,
      methode: [
        'Le crochet [ veut dire « on s’arrête au point » ; la parenthèse ( veut dire « on continue ».',
        'Pour la demi-droite, l’origine est toujours écrite en premier, du côté du crochet.',
        'Le symbole ∈ signifie « appartient à » : A ∈ (d).',
      ],
      exemples: [{ q: 'Quelle est la différence entre [AB] et AB ?', r: '[AB] est le <b>segment</b> (un objet) ; AB est sa <b>longueur</b> (un nombre).' }],
      erreurs: ['Écrire [BA) pour la demi-droite d’origine A : l’origine est la lettre à côté du crochet.'],
    },
    generate(level, rng) {
      const pts = rng.sample(['A', 'B', 'C', 'E', 'M', 'R', 'S', 'T'], 2);
      const k = rng.pick(Object.keys(KINDS)), fig = S.lineKind(k, pts[0], pts[1]);
      if (level === 1) {
        const opts = Object.keys(KINDS).map(x => KINDS[x].name);
        return Q(`gv1:${k}`, `${fig}Comment s’appelle cette figure ?`, fixedChoice(opts, KINDS[k].name), 'Est-elle limitée ? d’un côté, des deux côtés ?', `C’est <b>${KINDS[k].name}</b> : elle est ${KINDS[k].def}.`);
      }
      if (level === 2) {
        const [a, b] = pts;
        const correct = KINDS[k].not(a, b);
        const opts = [`[${a}${b}]`, `(${a}${b})`, `[${a}${b})`, `[${b}${a})`];
        return Q(`gv2:${k}:${a}${b}`, `${fig}Quelle est la bonne notation ?`, fixedChoice(opts, correct), 'Crochet = on s’arrête ; parenthèse = on continue.', `C’est ${KINDS[k].name} <b>${correct}</b>.`);
      }
      const [txt, val] = rng.pick(facts);
      return Q(`gv3:${txt}`, `Vrai ou faux ?<br><i>${txt}</i>`, TF(val), 'Pense à la définition de chaque objet.', `<b>${val ? 'Vrai' : 'Faux'}</b>.`);
    },
  });

  // ===================== PERPENDICULAIRES / PARALLÈLES =====================
  const REL = { perp: 'perpendiculaires', para: 'parallèles', secantes: 'sécantes (non perpendiculaires)' };
  M.notion('geo-perp-para', {
    lesson: {
      retenir: `<ul><li>Deux droites <b>perpendiculaires</b> se coupent en formant un <b>angle droit</b> : (d) ⊥ (d’).</li><li>Deux droites <b>parallèles</b> ne se coupent jamais : (d) // (d’).</li><li>Si deux droites sont <b>perpendiculaires à une même droite</b>, alors elles sont <b>parallèles</b> entre elles.</li><li>Si deux droites sont <b>parallèles</b>, toute droite <b>perpendiculaire à l’une</b> est <b>perpendiculaire à l’autre</b>.</li></ul>`,
      explication: `${S.twoLines('perp')}<p class="center">perpendiculaires</p>${S.twoLines('para')}<p class="center">parallèles</p>`,
      methode: [
        'Pour vérifier une perpendicularité, on utilise l’équerre.',
        'Pour appliquer une propriété : écris ce que tu sais (données), la propriété, puis la conclusion.',
        'Fais un petit schéma à main levée avec les codages.',
      ],
      exemples: [{ q: '(d1) ⊥ (d3) et (d2) ⊥ (d3). Que dire de (d1) et (d2) ?', r: 'Deux droites perpendiculaires à une même droite sont parallèles : <b>(d1) // (d2)</b>.' }],
      erreurs: ['Croire que deux droites qui ne se coupent pas « sur le dessin » sont forcément parallèles : il faut les prolonger !'],
    },
    generate(level, rng) {
      if (level === 1) {
        const k = rng.pick(Object.keys(REL));
        return Q(`gp1:${k}`, `${S.twoLines(k)}Ces deux droites sont :`, fixedChoice(Object.values(REL), REL[k]), 'Y a-t-il un angle droit ? Les droites se coupent-elles ?', `Elles sont <b>${REL[k]}</b>.`);
      }
      const [a, b, c] = rng.shuffle(['(d1)', '(d2)', '(d3)']);
      const t = rng.int(0, 2);
      const opts = ['parallèles', 'perpendiculaires', 'on ne peut pas savoir'];
      const sym = level === 3;
      const P = sym ? ' ⊥ ' : ' est perpendiculaire à ', Pa = sym ? ' // ' : ' est parallèle à ';
      let txt, ans, why;
      if (t === 0) { txt = `${a}${P}${c} et ${b}${P}${c}.`; ans = 'parallèles'; why = 'Deux droites perpendiculaires à une même droite sont parallèles entre elles.'; }
      else if (t === 1) { txt = `${a}${Pa}${c} et ${b}${P}${c}.`; ans = 'perpendiculaires'; why = 'Si deux droites sont parallèles, toute perpendiculaire à l’une est perpendiculaire à l’autre.'; }
      else { txt = `${a}${Pa}${c} et ${b}${Pa}${c}.`; ans = 'parallèles'; why = 'Deux droites parallèles à une même droite sont parallèles entre elles.'; }
      return Q(`gp:${t}:${a}${b}${c}:${sym}`, `${txt}<br>Que peut-on dire de ${a} et ${b} ?`, fixedChoice(opts, ans), 'Fais un schéma à main levée.', `${why} Donc ${a} et ${b} sont <b>${ans}</b>.`);
    },
  });

  // ===================== CERCLE =====================
  M.notion('geo-cercle', {
    lesson: {
      retenir: 'Le <b>cercle</b> de centre O et de rayon r est formé de <b>tous les points situés à la distance r de O</b>. Un <b>rayon</b> relie le centre à un point du cercle ; un <b>diamètre</b> est un segment qui passe par le centre et dont les extrémités sont sur le cercle : <b>diamètre = 2 × rayon</b>. Une <b>corde</b> relie deux points du cercle.',
      explication: `${S.circle('r')}<p>Le <b>disque</b> est la surface délimitée par le cercle (l’intérieur compris).</p>`,
      methode: [
        'Pour savoir si un point M est sur le cercle : compare OM au rayon.',
        'OM &lt; r : M est à l’intérieur ; OM = r : M est sur le cercle ; OM &gt; r : à l’extérieur.',
      ],
      exemples: [{ q: 'Rayon 3,5 cm. Diamètre ?', r: '2 × 3,5 = <b>7 cm</b>.' }],
      erreurs: ['Confondre rayon et diamètre.', 'Confondre cercle (la ligne) et disque (la surface).'],
    },
    generate(level, rng) {
      if (level === 1) {
        const r = dec(rng.int(2, 150), rng.int(0, 1));
        if (rng.chance(0.5)) return Q(`gc1:r${r}`, `Un cercle a un rayon de ${fmt(r)} cm. Quel est son diamètre ?`, num(mul(2, r), 'cm'), 'Diamètre = 2 × rayon', `2 × ${fmt(r)} = <b>${fmt(mul(2, r))} cm</b>`);
        const d = mul(2, r);
        return Q(`gc1:d${d}`, `Un cercle a un diamètre de ${fmt(d)} cm. Quel est son rayon ?`, num(r, 'cm'), 'Rayon = diamètre ÷ 2', `${fmt(d)} ÷ 2 = <b>${fmt(r)} cm</b>`);
      }
      if (level === 2) {
        const r = rng.int(3, 8), om = rng.pick([r - rng.int(1, 2), r, r + rng.int(1, 3)]);
        const opts = ['à l’intérieur du cercle', 'sur le cercle', 'à l’extérieur du cercle'];
        const a = om < r ? opts[0] : om === r ? opts[1] : opts[2];
        return Q(`gc2:${r}:${om}`, `Le cercle (C) a pour centre O et pour rayon ${r} cm. Un point M est tel que OM = ${om} cm. Le point M est :`, fixedChoice(opts, a), 'Compare OM et le rayon.', `OM = ${om} cm et r = ${r} cm : M est <b>${a}</b>.`);
      }
      const qs = [
        ['Un segment qui joint deux points du cercle en passant par le centre est :', 'un diamètre', ['un rayon', 'une corde quelconque', 'un arc']],
        ['Un segment qui joint le centre à un point du cercle est :', 'un rayon', ['un diamètre', 'une corde', 'un arc']],
        ['La plus longue corde d’un cercle est :', 'un diamètre', ['un rayon', 'un arc', 'il n’y en a pas']],
        ['Tous les points situés à 3 cm d’un point O forment :', 'un cercle de centre O et de rayon 3 cm', ['un disque de rayon 3 cm', 'un cercle de diamètre 3 cm', 'un segment de 3 cm']],
        ['La surface délimitée par un cercle s’appelle :', 'un disque', ['un rayon', 'un arc', 'une corde']],
      ];
      const [txt, good, bads] = rng.pick(qs);
      return Q(`gc3:${txt}`, txt, choice(rng, good, bads), 'Rappelle-toi les définitions : centre, rayon, diamètre, corde.', `Réponse : <b>${good}</b>.`);
    },
  });

  // ===================== QUADRILATÈRES / TRIANGLES =====================
  const SHAPE_DEFS = [
    ['un quadrilatère qui a 4 angles droits', 'un rectangle'],
    ['un quadrilatère qui a 4 côtés de même longueur', 'un losange'],
    ['un quadrilatère qui a 4 angles droits et 4 côtés de même longueur', 'un carré'],
    ['un triangle qui a deux côtés de même longueur', 'un triangle isocèle'],
    ['un triangle qui a trois côtés de même longueur', 'un triangle équilatéral'],
    ['un triangle qui a un angle droit', 'un triangle rectangle'],
  ];
  const QUAD_TF = [
    ['Un carré est un rectangle particulier.', true],
    ['Un carré est un losange particulier.', true],
    ['Un rectangle est toujours un carré.', false],
    ['Un losange a toujours 4 angles droits.', false],
    ['Les diagonales d’un rectangle ont la même longueur.', true],
    ['Les diagonales d’un losange sont perpendiculaires.', true],
    ['Les diagonales d’un rectangle sont toujours perpendiculaires.', false],
    ['Un triangle équilatéral est aussi isocèle.', true],
    ['Un triangle rectangle peut avoir deux angles droits.', false],
    ['Les côtés opposés d’un rectangle sont parallèles.', true],
  ];
  M.notion('geo-quadrilateres', {
    lesson: {
      retenir: `${M.h.table([['Figure', 'Côtés', 'Angles', 'Diagonales'],
        ['Rectangle', 'opposés de même longueur', '4 angles droits', 'même longueur, même milieu'],
        ['Losange', '4 côtés de même longueur', '—', 'perpendiculaires, même milieu'],
        ['Carré', '4 côtés de même longueur', '4 angles droits', 'même longueur, perpendiculaires, même milieu'],
        ['Triangle isocèle', '2 côtés de même longueur', '2 angles égaux', ''],
        ['Triangle équilatéral', '3 côtés de même longueur', '3 angles de 60°', ''],
        ['Triangle rectangle', '—', '1 angle droit', '']])}`,
      explication: '<p>Un carré est à la fois un rectangle (4 angles droits) et un losange (4 côtés égaux). Un triangle équilatéral est un triangle isocèle particulier.</p>',
      methode: ['Pour reconnaître une figure, vérifie les côtés (règle, compas), les angles (équerre) ou les diagonales.'],
      exemples: [{ q: 'Un losange qui a un angle droit est…', r: '… un <b>carré</b>.' }],
      erreurs: ['Penser qu’un carré « n’est pas » un rectangle : il en a toutes les propriétés.'],
    },
    generate(level, rng) {
      if (level === 1) {
        const [def, name] = rng.pick(SHAPE_DEFS), others = SHAPE_DEFS.map(d => d[1]).filter(n => n !== name);
        return Q(`gq1:${name}`, `Comment s’appelle ${def} ?`, choice(rng, name, rng.sample(others, 3)), 'Relis le tableau des propriétés.', `C’est <b>${name}</b>.`);
      }
      if (level === 2) {
        const [def, name] = rng.pick(SHAPE_DEFS), others = SHAPE_DEFS.map(d => d[0]).filter(n => n !== def);
        const cap = name.charAt(0).toUpperCase() + name.slice(1);
        return Q(`gq2:${name}`, `${cap}, c’est :`, choice(rng, def, rng.sample(others, 3)), 'Pense à la définition.', `${cap}, c’est <b>${def}</b>.`);
      }
      const [txt, val] = rng.pick(QUAD_TF);
      return Q(`gq3:${txt}`, `Vrai ou faux ?<br><i>${txt}</i>`, TF(val), 'Relis le tableau des propriétés.', `<b>${val ? 'Vrai' : 'Faux'}</b>.`);
    },
  });

  // ===================== ANGLES =====================
  const natureOf = d => (d < 90 ? 'aigu' : d === 90 ? 'droit' : d < 180 ? 'obtus' : 'plat');
  M.notion('angles-nature', {
    lesson: {
      retenir: '<ul><li>Angle <b>aigu</b> : entre 0° et 90°.</li><li>Angle <b>droit</b> : 90° exactement.</li><li>Angle <b>obtus</b> : entre 90° et 180°.</li><li>Angle <b>plat</b> : 180° (ses côtés forment une droite).</li></ul>',
      explication: `${S.angle(50)}${S.angle(90)}${S.angle(130)}<p>aigu · droit · obtus</p>`,
      methode: ['Compare l’angle à un angle droit (le coin d’une feuille ou l’équerre) : plus petit → aigu, plus grand → obtus.'],
      exemples: [{ q: 'Un angle de 135°', r: '135 est entre 90 et 180 : angle <b>obtus</b>.' }],
      erreurs: ['La longueur des côtés dessinés ne change rien à l’angle : seul l’écartement compte.'],
    },
    generate(level, rng) {
      const pick = () => rng.pick([rng.int(15, 75), 90, rng.int(105, 165), ...(level >= 2 ? [180] : [])]);
      const opts = level === 1 ? ['aigu', 'droit', 'obtus'] : ['aigu', 'droit', 'obtus', 'plat'];
      if (level === 2 && rng.chance(0.5)) {
        const d = pick();
        return Q(`an2:${d}`, `Un angle mesure ${d}°. Il est :`, fixedChoice(opts, natureOf(d)), 'Compare à 90° et à 180°.', `${d}° : angle <b>${natureOf(d)}</b>.`);
      }
      const d = pick(), rot = level === 3 ? rng.int(0, 60) : 0;
      return Q(`an:${d}:${rot}`, `${S.angle(d, { rot })}Cet angle est :`, fixedChoice(opts, natureOf(d)), 'Compare-le à un angle droit.', `C’est un angle <b>${natureOf(d)}</b>${d === 90 ? ' (le petit carré code l’angle droit)' : ''}.`);
    },
  });

  M.notion('angles-mesure', {
    lesson: {
      retenir: 'On mesure un angle en <b>degrés</b> (°) avec un <b>rapporteur</b>. Pour estimer, on se repère avec l’angle droit (90°), sa moitié (45°) et l’angle plat (180°).',
      explication: `${S.angle(45)}${S.angle(120)}<p>45° est la moitié d’un angle droit. 120° est un angle droit plus un tiers d’angle droit.</p>`,
      methode: [
        'Place le centre du rapporteur sur le sommet de l’angle.',
        'Aligne le zéro d’une graduation sur un côté de l’angle.',
        'Lis la mesure sur la même graduation (celle qui part de 0) là où passe l’autre côté.',
        'Vérifie avec la nature de l’angle : aigu → moins de 90°.',
      ],
      exemples: [{ q: 'Un angle un peu plus grand que l’angle droit', r: 'Environ 100° ou 110°, sûrement pas 70°.' }],
      erreurs: ['Lire sur la mauvaise graduation du rapporteur : un angle aigu de 40° lu « 140° ».'],
    },
    generate(level, rng) {
      const gap = level === 1 ? 45 : level === 2 ? 30 : 20;
      const d = rng.int(1, Math.floor(170 / 5)) * 5;
      const opts = new Set([d]);
      [-2, -1, 1, 2, 3, -3].forEach(k => { const v = d + k * gap; if (v > 0 && v < 180 && opts.size < 4) opts.add(v); });
      const rot = level === 3 ? rng.int(0, 90) : 0;
      return Q(`am:${d}:${rot}:${level}`, `${S.angle(d, { rot })}Quelle est la mesure la plus proche de cet angle ?`, choice(rng, `${d}°`, [...opts].filter(v => v !== d).map(v => `${v}°`)), 'Compare avec un angle droit (90°) et sa moitié (45°).', `L’angle mesure environ <b>${d}°</b> (il est ${natureOf(d)}).`);
    },
  });

  // ===================== SYMÉTRIE =====================
  const reg = (n, r = 80, c = 100, start = -Math.PI / 2) => Array.from({ length: n }, (_, i) => [c + r * Math.cos(start + (2 * Math.PI * i) / n), c + r * Math.sin(start + (2 * Math.PI * i) / n)].map(v => +v.toFixed(1)));
  const FIGS = {
    1: [['un carré', [[30, 30], [170, 30], [170, 170], [30, 170]], 4], ['un rectangle', [[20, 55], [180, 55], [180, 145], [20, 145]], 2], ['un triangle isocèle', [[100, 20], [160, 180], [40, 180]], 1], ['un triangle équilatéral', reg(3, 90, 110), 3]],
    2: [['un losange', [[100, 15], [160, 100], [100, 185], [40, 100]], 2], ['un parallélogramme', [[50, 50], [180, 50], [150, 150], [20, 150]], 0], ['un trapèze isocèle', [[60, 50], [140, 50], [180, 150], [20, 150]], 1], ['un rectangle', [[20, 55], [180, 55], [180, 145], [20, 145]], 2]],
    3: [['un hexagone régulier', reg(6), 6], ['un pentagone régulier', reg(5, 85, 105), 5], ['un triangle quelconque', [[30, 170], [180, 150], [70, 30]], 0], ['un octogone régulier', reg(8, 85, 100, -Math.PI / 8), 8]],
  };
  M.notion('sym-axes', {
    lesson: {
      retenir: 'Une droite est un <b>axe de symétrie</b> d’une figure si, en pliant le long de cette droite, les deux moitiés se <b>superposent exactement</b>.',
      explication: `${M.h.table([['Figure', 'Nombre d’axes'], ['Triangle isocèle', 1], ['Triangle équilatéral', 3], ['Rectangle', 2], ['Losange', 2], ['Carré', 4], ['Parallélogramme', 0], ['Cercle', 'une infinité']])}${S.shape([[30, 30], [170, 30], [170, 170], [30, 170]], { axes: [[100, 5, 100, 195], [5, 100, 195, 100], [10, 10, 190, 190], [190, 10, 10, 190]] })}<p>Les 4 axes de symétrie du carré.</p>`,
      methode: ['Imagine le pliage : les deux parties doivent coïncider exactement.', 'Pense aux médiatrices des côtés et aux diagonales.'],
      exemples: [{ q: 'Les diagonales d’un rectangle sont-elles des axes de symétrie ?', r: '<b>Non</b> ! En pliant le long d’une diagonale, les deux moitiés ne se superposent pas.' }],
      erreurs: ['Croire que le parallélogramme a des axes de symétrie : il n’en a aucun.'],
    },
    generate(level, rng) {
      const [name, pts, n] = rng.pick(FIGS[level]);
      return Q(`sa:${name}`, `${S.shape(pts)}Combien d’axes de symétrie a ${name} ?`, num(n), 'Imagine tous les pliages possibles.', `${name.charAt(0).toUpperCase() + name.slice(1)} a <b>${n}</b> axe${n > 1 ? 's' : ''} de symétrie.`);
    },
  });

  M.notion('sym-point', {
    lesson: {
      retenir: 'Le symétrique d’un point A par rapport à une droite (d) est le point A’ tel que (d) est la <b>médiatrice</b> du segment [AA’] : A’ est <b>de l’autre côté</b> de (d), <b>à la même distance</b>, sur la <b>perpendiculaire</b> à (d) passant par A.',
      explication: `${S.grid({ cols: 10, rows: 6, axis: [5, 0, 5, 6], points: [{ x: 2, y: 2, label: 'A' }, { x: 8, y: 2, label: 'A’', cls: 's-dot' }] })}<p>A est à 3 carreaux de l’axe : A’ est à 3 carreaux de l’autre côté, sur la même ligne.</p>`,
      methode: [
        'Compte la distance (en carreaux) du point à l’axe, perpendiculairement à l’axe.',
        'Reporte la même distance de l’autre côté.',
        'Pour un axe oblique (diagonale des carreaux), avance en diagonale, perpendiculairement à l’axe.',
      ],
      exemples: [{ q: 'Un point sur l’axe', r: 'Il est son propre symétrique.' }],
      erreurs: ['Reporter la distance dans le mauvais sens ou décaler le point le long de l’axe.'],
    },
    generate(level, rng) {
      const cols = 12, rows = 10;
      let axis, A, sym, wrongs;
      const inside = p => p[0] >= 0 && p[0] <= cols && p[1] >= 0 && p[1] <= rows;
      for (;;) {
        if (level === 3) {
          const c = rng.int(-2, 2);           // axis y = x + c
          axis = [...(c >= 0 ? [0, c] : [-c, 0]), rows - c, rows];
          A = [rng.int(1, cols - 1), rng.int(1, rows - 1)];
          sym = [A[1] - c, A[0] + c];
          wrongs = [[A[0] + (sym[0] - A[0]), A[1]], [sym[0] + 1, sym[1] - 1], [2 * A[0] - sym[0], 2 * A[1] - sym[1]]];
        } else if (level === 2 && rng.chance(0.5)) {
          const b = rng.int(3, rows - 3); axis = [0, b, cols, b];
          A = [rng.int(1, cols - 1), rng.int(0, rows)];
          sym = [A[0], 2 * b - A[1]];
          wrongs = [[A[0], sym[1] + (sym[1] > b ? 1 : -1)], [A[0] + 2, sym[1]], [A[0], 2 * b - A[1] + (A[1] < b ? -2 : 2)]];
        } else {
          const a = rng.int(4, cols - 4); axis = [a, 0, a, rows];
          A = [rng.int(0, cols), rng.int(1, rows - 1)];
          sym = [2 * a - A[0], A[1]];
          wrongs = [[sym[0] + (sym[0] > a ? 1 : -1), A[1]], [sym[0], A[1] + rng.pick([-2, 2])], [A[0] + (a - A[0]), A[1] + 1]];
        }
        const all = [sym, ...wrongs];
        const keys = all.map(p => p.join(','));
        if (A.join(',') !== sym.join(',') && all.every(inside) && new Set([...keys, A.join(',')]).size === 5) break;
      }
      const letters = ['B', 'C', 'D', 'E'], pts = rng.shuffle([sym, ...wrongs]);
      const fig = S.grid({ cols, rows, axis, points: [{ x: A[0], y: A[1], label: 'A' }, ...pts.map((p, i) => ({ x: p[0], y: p[1], label: letters[i], cls: 's-dot' }))] });
      const good = letters[pts.indexOf(sym)];
      return Q(`sp:${axis}:${A}`, `${fig}Quel point est le symétrique de A par rapport à la droite rouge ?`, fixedChoice(letters, good), 'Même distance à l’axe, de l’autre côté, perpendiculairement à l’axe.', `Le symétrique de A est le point <b>${good}</b>.`);
    },
  });
})();
