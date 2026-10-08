// Domain "Espace & géométrie" (multiple choice with SVG figures).
(function () {
  'use strict';
  const M = globalThis.M;
  const { fmt, dec, mul, div, add } = M.u;
  const { hole } = M.h;
  const { Q, num, choice, fixedChoice } = M.kit;
  const S = M.svg;
  const TF = b => fixedChoice(['Vrai', 'Faux'], b ? 'Vrai' : 'Faux');
  const TF_YN = b => fixedChoice(['Oui', 'Non'], b ? 'Oui' : 'Non');

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

  // ===================== MÉDIATRICE =====================
  const { svg: rawSvg, line: rawLine, text: rawText, dot: rawDot } = S.raw;
  const mediatriceFig = (() => {
    const A = [60, 130], B = [260, 130], I = [160, 130], Mp = [160, 40];
    let b = rawLine(...A, ...B, 's-line s-thick') + rawLine(160, 15, 160, 175, 's-axis');
    b += rawLine(...A, ...Mp, 's-accent-line s-dash') + rawLine(...B, ...Mp, 's-accent-line s-dash');
    b += '<polyline points="160,118 172,118 172,130" class="s-line s-nofill"/>';
    b += rawLine(105, 125, 115, 135) + rawLine(205, 125, 215, 135);   // equal halves
    b += [A, B, I, Mp].map(p => rawDot(...p)).join('');
    b += rawText(A[0] - 12, A[1] + 5, 'A', { cls: 's-text s-bold' }) + rawText(B[0] + 12, B[1] + 5, 'B', { cls: 's-text s-bold' });
    b += rawText(I[0] + 10, I[1] + 22, 'I', { cls: 's-text s-bold' }) + rawText(Mp[0] + 14, Mp[1], 'M', { cls: 's-text s-bold' });
    return rawSvg(320, 190, b);
  })();
  M.notion('mediatrice', {
    lesson: {
      retenir: 'La <b>médiatrice</b> d’un segment est la droite <b>perpendiculaire</b> à ce segment qui passe par son <b>milieu</b>. Propriété : un point est sur la médiatrice de [AB] <b>si et seulement si</b> il est <b>à égale distance</b> de A et de B (MA = MB).',
      explication: `${mediatriceFig}<p>La droite rouge est la médiatrice de [AB] : elle coupe [AB] en son milieu I, à angle droit. Le point M est dessus, donc MA = MB.</p>`,
      methode: [
        'Pour la tracer à la règle et à l’équerre : place le milieu I de [AB], puis trace la perpendiculaire à (AB) passant par I.',
        'Au compas : avec un même écartement (plus grand que la moitié de AB), trace deux arcs de centre A et deux arcs de centre B ; les deux points d’intersection sont sur la médiatrice.',
        'Pour savoir si un point M est sur la médiatrice : compare MA et MB.',
        'Dans un triangle ABC, les trois médiatrices se coupent en un même point O. Comme OA = OB = OC, le cercle de centre O qui passe par A passe aussi par B et C : c’est le <b>cercle circonscrit</b> au triangle.',
      ],
      exemples: [
        { q: 'M est sur la médiatrice de [AB] et MA = 4,5 cm. Combien mesure MB ?', r: 'MB = MA = <b>4,5 cm</b>.' },
        { q: 'NA = 3 cm et NB = 3,2 cm. N est-il sur la médiatrice de [AB] ?', r: '<b>Non</b>, car NA ≠ NB.' },
      ],
      erreurs: ['Tracer une perpendiculaire qui ne passe pas par le milieu, ou une droite qui passe par le milieu sans être perpendiculaire.'],
    },
    generate(level, rng) {
      if (level === 1) {
        if (rng.chance(0.5)) {
          const good = 'perpendiculaire au segment et passe par son milieu';
          return Q('me1d', 'La médiatrice d’un segment est la droite qui est…', choice(rng, good, ['parallèle au segment et passe par son milieu', 'perpendiculaire au segment et passe par une extrémité', 'qui passe par les deux extrémités du segment']), 'Deux conditions : un angle droit, et le milieu.', `Elle est <b>${good}</b>.`);
        }
        const ab = dec(rng.int(30, 150), 1), ai = div(ab, 2);
        return Q(`me1m:${ab}`, `I est le milieu de [AB] et AB = ${fmt(ab)} cm. Combien mesure AI ?`, num(ai, 'cm'), 'Le milieu partage le segment en deux longueurs égales.', `AI = AB ÷ 2 = ${fmt(ab)} ÷ 2 = <b>${fmt(ai)} cm</b>.`);
      }
      if (level === 2) {
        const d = dec(rng.int(15, 120), 1);
        return Q(`me2:${d}`, `M est un point de la médiatrice de [AB] et MA = ${fmt(d)} cm. Combien mesure MB ?`, num(d, 'cm'), 'Un point de la médiatrice est à égale distance des extrémités.', `M est sur la médiatrice, donc MB = MA = <b>${fmt(d)} cm</b>.`);
      }
      if (rng.chance(0.35)) {
        const r = dec(rng.int(20, 90), 1), P = rng.pick(['B', 'C']);
        return Q(`me3c:${r}:${P}`, `Les trois médiatrices du triangle ABC se coupent au point O, et OA = ${fmt(r)} cm. Combien mesure O${P} ?`, num(r, 'cm'), 'O est sur la médiatrice de [AB] et sur celle de [AC].', `O est sur les médiatrices, donc OA = OB = OC : O${P} = <b>${fmt(r)} cm</b>. Le cercle de centre O et de rayon ${fmt(r)} cm passe par A, B et C : c’est le cercle circonscrit.`);
      }
      const a = dec(rng.int(20, 80), 1), same = rng.chance(0.5), b = same ? a : add(a, rng.pick([0.1, 0.2, -0.1, 0.5]));
      return Q(`me3:${a}:${b}`, `NA = ${fmt(a)} cm et NB = ${fmt(b)} cm. Le point N est-il sur la médiatrice de [AB] ?`, TF_YN(same), 'Compare NA et NB.', same ? `<b>Oui</b> : NA = NB, donc N est à égale distance de A et B.` : `<b>Non</b> : NA ≠ NB.`);
    },
  });

  // ===================== SOLIDES =====================
  const SOLIDS = [
    { name: 'le cube', faces: 6, aretes: 12, sommets: 8, desc: '6 faces carrées identiques' },
    { name: 'le pavé droit', faces: 6, aretes: 12, sommets: 8, desc: '6 faces rectangulaires, opposées deux à deux identiques' },
    { name: 'la pyramide à base carrée', faces: 5, aretes: 8, sommets: 5, desc: 'une base carrée et 4 faces triangulaires qui se rejoignent en un sommet' },
    { name: 'le prisme droit à base triangulaire', faces: 5, aretes: 9, sommets: 6, desc: '2 bases triangulaires identiques et 3 faces rectangulaires' },
  ];
  const ROUND = [
    ['deux bases qui sont des disques et une surface courbe', 'un cylindre'],
    ['une base qui est un disque, une surface courbe et un sommet', 'un cône'],
    ['aucune face plane : tous ses points sont à la même distance du centre', 'une boule'],
    ['2 bases triangulaires identiques et 3 faces rectangulaires', 'un prisme droit'],
    ['une base polygonale et des faces triangulaires qui se rejoignent en un sommet', 'une pyramide'],
    ['6 faces carrées identiques', 'un cube'],
  ];
  // Cube nets drawn as unit squares [col, row].
  function netSvg(cells, label) {
    const c = 22, w = 6 * c + 10, h = 4 * c + 10;
    const body = cells.map(([x, y]) => `<rect x="${5 + x * c}" y="${5 + y * c}" width="${c}" height="${c}" class="s-soft s-line"/>`).join('');
    return `<div class="net"><b>${label}</b>${rawSvg(w, h, body)}</div>`;
  }
  const strip = [[0, 1], [1, 1], [2, 1], [3, 1]];
  function validNet(rng) { return [...strip, [rng.int(0, 3), 0], [rng.int(0, 3), 2]]; }   // 1-4-1: always a cube net
  function invalidNet(rng, k) {
    if (k === 0) { const [a, b] = rng.sample([0, 1, 2, 3], 2); return [...strip, [a, 0], [b, 0]]; }   // both flaps on the same side
    if (k === 1) return [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [rng.int(0, 4), 0]];                // 5 in a row
    return [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]];                                            // 2 × 3 block
  }
  M.notion('solides', {
    lesson: {
      retenir: `Un <b>polyèdre</b> est un solide dont toutes les faces sont des polygones. Vocabulaire : les <b>faces</b> (surfaces planes), les <b>arêtes</b> (côtés des faces), les <b>sommets</b> (coins). Un cube et un pavé droit ont <b>6 faces, 12 arêtes et 8 sommets</b>. Un <b>patron</b> est une figure plane qu’on peut plier pour fabriquer le solide.`,
      explication: `${S.pave('arête', '', '')}${M.h.table([['Solide', 'Faces', 'Arêtes', 'Sommets'], ...SOLIDS.map(s => [s.name.replace(/^le |^la /, ''), s.faces, s.aretes, s.sommets])])}<p>Solides « ronds » : le <b>cylindre</b>, le <b>cône</b> et la <b>boule</b> ne sont pas des polyèdres.</p>`,
      methode: [
        'Pour compter les arêtes d’un cube : 4 en haut, 4 en bas, 4 verticales = 12.',
        'Pour savoir si une figure est un patron de cube : il faut 6 carrés, et chaque face doit trouver sa place sans qu’il y en ait deux au même endroit une fois pliée.',
        'Patron classique : une bande de 4 carrés (les 4 côtés), avec un carré d’un côté de la bande (le dessus) et un carré de l’autre côté (le dessous).',
      ],
      exemples: [
        { q: 'Combien d’arêtes a une pyramide à base carrée ?', r: '4 autour de la base + 4 qui montent au sommet = <b>8</b>.' },
        { q: 'Une bande de 4 carrés avec 2 carrés du même côté est-elle un patron de cube ?', r: '<b>Non</b> : les 2 carrés se retrouvent tous les deux sur le dessus, et il manque le dessous.' },
      ],
      erreurs: ['Croire que 6 carrés accolés forment toujours un patron de cube (un rectangle 2 × 3 n’en est pas un).'],
    },
    generate(level, rng) {
      if (level === 1) {
        const s = rng.pick(SOLIDS.slice(0, 2)), what = rng.pick(['faces', 'aretes', 'sommets']);
        const lab = { faces: 'faces', aretes: 'arêtes', sommets: 'sommets' }[what];
        return Q(`so1:${s.name}:${what}`, `Combien de <b>${lab}</b> a ${s.name} ?`, num(s[what]), 'Imagine un dé à jouer.', `${s.name.charAt(0).toUpperCase() + s.name.slice(1)} a <b>${s[what]}</b> ${lab} (${s.faces} faces, ${s.aretes} arêtes, ${s.sommets} sommets).`);
      }
      if (level === 2) {
        if (rng.chance(0.5)) {
          const [desc, name] = rng.pick(ROUND), others = ROUND.map(r => r[1]).filter(n => n !== name);
          return Q(`so2:${name}`, `Quel solide a ${desc} ?`, choice(rng, name, rng.sample(others, 3)), 'Pense aux formes des faces.', `C’est <b>${name}</b>.`);
        }
        const s = rng.pick(SOLIDS.slice(2)), what = rng.pick(['faces', 'aretes', 'sommets']);
        const lab = { faces: 'faces', aretes: 'arêtes', sommets: 'sommets' }[what];
        return Q(`so2c:${s.name}:${what}`, `Combien de <b>${lab}</b> a ${s.name} ?`, num(s[what]), `Elle (ou il) a ${s.desc}.`, `${s.name.charAt(0).toUpperCase() + s.name.slice(1)} a <b>${s[what]}</b> ${lab} (${s.faces} faces, ${s.aretes} arêtes, ${s.sommets} sommets).`);
      }
      const letters = ['A', 'B', 'C', 'D'], kinds = rng.shuffle([0, 1, 2]);
      const nets = rng.shuffle([{ ok: true, cells: validNet(rng) }, ...kinds.map(k => ({ ok: false, cells: invalidNet(rng, k) }))]);
      const good = letters[nets.findIndex(n => n.ok)];
      return Q(`so3:${JSON.stringify(nets.map(n => n.cells))}`, `<div class="nets">${nets.map((n, i) => netSvg(n.cells, letters[i])).join('')}</div>Laquelle de ces figures est un patron de cube ?`, fixedChoice(letters, good), 'Cherche une bande de 4 carrés avec un carré de chaque côté.', `C’est la figure <b>${good}</b> : une bande de 4 carrés (les côtés), un carré au-dessus (le dessus) et un en dessous (le dessous). Les autres : deux carrés du même côté, 5 carrés alignés, ou un rectangle 2 × 3 ne se replient pas en cube.`);
    },
  });
})();
