// Physique-chimie: mouvement. Trajectoires, mouvement uniforme / accéléré / ralenti
// (chronophotographies), relativité du mouvement, vitesse v = d ÷ t.
(function () {
  'use strict';
  const M = globalThis.M;
  const { fmt, add, mul, div } = M.u;
  const { Q, num, choice, fixedChoice } = M.kit;
  const { svg, text, line, dot } = M.svg.raw;

  const NAMES = ['Sam', 'Inès', 'Chloé', 'Noah', 'Léa', 'Hugo', 'Lina', 'Tom', 'Jade', 'Adam', 'Emma', 'Yanis'];
  const P = x => x.toFixed(1);
  const sum = arr => arr.reduce((a, b) => add(a, b), 0);
  const list = arr => arr.map(fmt).join(' ; ');
  // « de » + noun group: d’un…, du…, de la…, de l’…
  const de = g => (/^le /.test(g) ? 'du ' + g.slice(3) : /^les /.test(g) ? 'des ' + g.slice(4) : /^(la |l’)/.test(g) ? 'de ' + g : /^[AEIOUÉÈaeiouéè]/.test(g) || /^une? /.test(g) ? 'd’' + g : 'de ' + g);
  // « à » + noun group: au…, aux…, à la…
  const au = g => (/^le /.test(g) ? 'au ' + g.slice(3) : /^les /.test(g) ? 'aux ' + g.slice(4) : 'à ' + g);
  const FEM = new Set(['Inès', 'Chloé', 'Léa', 'Lina', 'Jade', 'Emma']);

  // ===================== FIGURES =====================
  // Point on a trajectory shape, s in [0, 1].
  const SHAPES = {
    rectiligne: [
      s => [30 + 240 * s, 75],
      s => [40 + 220 * s, 130 - 105 * s],
      s => [150, 15 + 120 * s],
    ],
    circulaire: [
      s => [150 + 58 * Math.cos(2 * Math.PI * s), 75 + 58 * Math.sin(2 * Math.PI * s)],
      s => [150 + 45 * Math.cos(-Math.PI / 2 + 2 * Math.PI * s), 75 + 45 * Math.sin(-Math.PI / 2 + 2 * Math.PI * s)],
      s => [150 + 58 * Math.cos(Math.PI + 1.5 * Math.PI * s), 75 + 58 * Math.sin(Math.PI + 1.5 * Math.PI * s)],
    ],
    curviligne: [
      s => [30 + 240 * s, 135 - 400 * s * (1 - s)],
      s => [30 + 240 * s, 75 - 42 * Math.sin(3 * Math.PI * s)],
      s => [30 + 240 * s, 18 + 115 * s * s],
    ],
  };
  // Words describing a trajectory figure, for the prompt (accessibility).
  const SHAPE_WORDS = {
    rectiligne: ['les positions sont toutes sur une même ligne horizontale', 'les positions sont toutes sur une même ligne qui monte en biais', 'les positions sont toutes sur une même ligne verticale'],
    circulaire: ['les positions sont toutes à la même distance d’un point O et font le tour complet de ce point', 'les positions sont toutes à la même distance d’un point O et font le tour complet de ce point', 'les positions sont toutes à la même distance d’un point O, sur les trois quarts d’un tour'],
    curviligne: ['les positions montent puis redescendent en forme d’arche', 'les positions forment des vagues qui montent et descendent', 'les positions partent vers la droite en plongeant de plus en plus vers le bas'],
  };
  // Full circles: the last dot must not land on the first one.
  const isLoop = (kind, v) => kind === 'circulaire' && v < 2;
  function trajPoints(kind, v, n) {
    const f = SHAPES[kind][v];
    return Array.from({ length: n }, (_, i) => f(isLoop(kind, v) ? i / n : i / (n - 1)));
  }
  const drawDots = pts => pts.map((p, i) => dot(P(p[0]), P(p[1]), i === 0 ? 's-accent' : 's-dot')).join('');
  const center = (kind, v) => (kind === 'circulaire' ? line(145, 75, 155, 75) + line(150, 70, 150, 80) + text(150, 95, 'O', { size: 13 }) : '');

  // A trajectory drawn as dots; the first position is highlighted.
  function trajFig(kind, v, n, label) {
    return svg(300, 150, center(kind, v) + drawDots(trajPoints(kind, v, n)), '', label || `Trajectoire formée de ${n} positions successives`);
  }
  // Three small trajectories labelled A, B, C.
  function trioFig(items, label) {
    let body = '';
    items.forEach(([kind, v], i) => {
      const pts = trajPoints(kind, v, 9).map(([x, y]) => [i * 110 + 5 + x * 0.33, 10 + y * 0.6]);
      if (kind === 'circulaire') body += line(i * 110 + 5 + 150 * 0.33 - 3, 55, i * 110 + 5 + 150 * 0.33 + 3, 55);
      body += pts.map(p => `<circle cx="${P(p[0])}" cy="${P(p[1])}" r="3" class="s-dot"/>`).join('');
      body += text(i * 110 + 54, 118, 'ABC'[i], { cls: 's-text s-bold' });
    });
    return svg(330, 125, body, '', label);
  }

  // Arc-length lookup so that equal gaps look equal on a curve.
  function arcPoint(f, frac) {
    const N = 200, pts = Array.from({ length: N + 1 }, (_, i) => f(i / N));
    const len = [0];
    for (let i = 1; i <= N; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const target = frac * len[N];
    let i = 1;
    while (i < N && len[i] < target) i++;
    const r = (target - len[i - 1]) / (len[i] - len[i - 1] || 1);
    return [pts[i - 1][0] + r * (pts[i][0] - pts[i - 1][0]), pts[i - 1][1] + r * (pts[i][1] - pts[i - 1][1])];
  }
  const CHRONO_SHAPES = {
    droite: s => [25 + 260 * s, 45],
    cercle: s => [150 + 60 * Math.cos(-Math.PI / 2 + 1.75 * Math.PI * s), 75 + 60 * Math.sin(-Math.PI / 2 + 1.75 * Math.PI * s)],
    courbe: s => [25 + 255 * s, 125 - 360 * s * (1 - s)],
  };
  // Chronophotograph: positions at equal time intervals, gaps = distances between successive positions.
  function chrono(gaps, shape = 'droite', label = '') {
    const total = sum(gaps), cum = [0];
    gaps.forEach(g => cum.push(add(cum[cum.length - 1], g)));
    const pts = cum.map(c => (shape === 'cercle' ? CHRONO_SHAPES.cercle(c / total) : arcPoint(CHRONO_SHAPES[shape], c / total)));
    const h = shape === 'droite' ? 80 : 150;
    let body = drawDots(pts);
    pts.forEach((p, i) => { body += text(P(p[0]), P(shape === 'droite' ? p[1] + 24 : p[1] - 10), String(i + 1), { size: 11 }); });
    return svg(310, h, body, '', label || `Chronophotographie : ${pts.length} positions successives numérotées de 1 à ${pts.length}`);
  }
  // Gap patterns.
  function gapsOf(rng, type) {
    const k = rng.int(4, 6);
    if (type === 'uniforme') { const g = rng.pick([1, 1.5, 2, 2.5]); return Array(k).fill(g); }
    const a = rng.pick([0.5, 1]), s = rng.pick([0.5, 1]);
    const up = Array.from({ length: k }, (_, i) => add(a, mul(i, s)));
    return type === 'accéléré' ? up : up.reverse();
  }

  // ===================== TRAJECTOIRES =====================
  const KINDS = ['rectiligne', 'circulaire', 'curviligne'];
  const TRAJ_CTX = [
    ['un ascenseur qui monte dans sa cage', 'rectiligne'],
    ['une bille lâchée sans élan, qui tombe', 'rectiligne'],
    ['un sprinteur sur la ligne droite du 100 m', 'rectiligne'],
    ['un train sur une voie parfaitement droite', 'rectiligne'],
    ['une boule de bowling lancée bien droit', 'rectiligne'],
    ['un enfant assis sur un cheval de manège, vu par ses parents', 'circulaire'],
    ['le bout de la grande aiguille d’une horloge', 'circulaire'],
    ['la Lune qui tourne autour de la Terre', 'circulaire'],
    ['la valve d’une roue de vélo, vue par le cycliste', 'circulaire'],
    ['le bout d’une pale d’éolienne', 'circulaire'],
    ['une balle de tennis lancée à un ami', 'curviligne'],
    ['un ballon de basket tiré vers le panier', 'curviligne'],
    ['un skieur qui descend en slalom', 'curviligne'],
    ['une feuille morte qui tombe en virevoltant', 'curviligne'],
    ['une goutte du jet d’un tuyau d’arrosage tenu à l’horizontale', 'curviligne'],
    ['une voiture sur une route de montagne pleine de virages', 'curviligne'],
  ];
  const KIND_DEF = {
    rectiligne: 'une portion de <b>droite</b>',
    circulaire: 'un <b>cercle</b> ou un arc de cercle',
    curviligne: 'une <b>courbe</b> qui n’est pas un cercle',
  };
  // Same object, two observers. 'immobile' = no trajectory.
  const OBS = [
    { obj: 'la valve d’une roue de vélo qui avance', a: ['le cycliste', 'circulaire'], b: ['un piéton au bord de la route', 'curviligne'], why: 'Pour le cycliste, la valve tourne autour de l’axe de la roue. Pour le piéton, elle tourne <b>et</b> avance avec le vélo : elle décrit des arches successives.' },
    { obj: 'une balle lâchée par un passager dans un train qui roule', a: ['le passager', 'rectiligne'], b: ['une personne sur le quai', 'curviligne'], why: 'Pour le passager, la balle tombe droit à ses pieds. Pour la personne sur le quai, la balle tombe <b>et</b> avance avec le train : sa trajectoire est une courbe.' },
    { obj: 'le centre (l’axe) d’une roue de vélo qui avance tout droit', a: ['le cycliste', 'immobile'], b: ['un piéton au bord de la route', 'rectiligne'], why: 'L’axe reste toujours au même endroit par rapport au cycliste. Pour le piéton, il avance en ligne droite avec le vélo.' },
    { obj: 'un enfant assis sur un cheval de manège qui tourne', a: ['un autre enfant assis sur le cheval voisin', 'immobile'], b: ['ses parents assis sur un banc', 'circulaire'], why: 'Les deux enfants tournent ensemble : l’un ne bouge pas par rapport à l’autre. Pour les parents, l’enfant tourne autour du centre du manège.' },
    { obj: 'le bout d’une pale d’éolienne', a: ['un technicien debout au pied de l’éolienne', 'circulaire'], b: ['une coccinelle posée sur ce bout de pale', 'immobile'], why: 'Pour le technicien, le bout de pale tourne autour de l’axe. La coccinelle tourne avec la pale : par rapport à elle, le bout de pale ne bouge pas.' },
  ];
  const OBS_OPTS = { rectiligne: 'rectiligne', circulaire: 'circulaire', curviligne: 'curviligne', immobile: 'aucune : l’objet est immobile pour lui' };
  // Classic traps.
  const TRAPS = [
    ['un ballon lancé verticalement vers le haut, qui monte puis retombe au même endroit', 'rectiligne', 'Le ballon monte puis descend, mais toujours sur la <b>même droite verticale</b> : changer de sens ne courbe pas la trajectoire.'],
    ['un ascenseur qui monte au 5<sup>e</sup> étage puis redescend', 'rectiligne', 'L’ascenseur change de sens, mais reste sur la <b>même droite verticale</b>.'],
    ['une balançoire qui va et vient', 'circulaire', 'Le siège reste toujours à la même distance du point d’attache des chaînes : il décrit un <b>arc de cercle</b>.'],
    ['une voiture qui fait un tour complet de rond-point', 'circulaire', 'Le rond-point est un cercle : la voiture reste à la même distance de son centre.'],
    ['une bille au bout d’une ficelle qu’on fait tourner au-dessus de sa tête', 'circulaire', 'La ficelle garde la même longueur : la bille reste à la même distance de la main.'],
    ['le balancier d’une vieille horloge', 'circulaire', 'Le bout du balancier reste à la même distance du point où il est accroché : c’est un <b>arc de cercle</b>.'],
  ];

  M.notion('pc-trajectoires', {
    lesson: {
      retenir: `La <b>trajectoire</b> d’un objet est l’ensemble des positions successives occupées par un point de cet objet au cours de son mouvement. On distingue trois types de trajectoires :<ul><li><b>rectiligne</b> : les positions sont sur une droite ;</li><li><b>circulaire</b> : les positions sont sur un cercle (ou un arc de cercle) ;</li><li><b>curviligne</b> : les positions sont sur une autre courbe.</li></ul>On décrit toujours une trajectoire <b>pour un observateur donné</b>.`,
      explication: `<p>Imagine un objet qui laisse une trace derrière lui, comme un avion qui laisse une traînée blanche dans le ciel. Cette trace, c’est sa <b>trajectoire</b>.</p>${svg(330, 125, [['rectiligne', 0], ['circulaire', 0], ['curviligne', 0]].map(([k, v], i) => trajPoints(k, v, 9).map(([x, y]) => `<circle cx="${P(i * 110 + 5 + x * 0.33)}" cy="${P(10 + y * 0.6)}" r="3" class="s-dot"/>`).join('') + text(i * 110 + 54, 118, k, { size: 12 })).join(''), '', 'Trois trajectoires : une droite (rectiligne), un cercle (circulaire), une arche (curviligne)')}<p>Une droite : <b>rectiligne</b>. Un cercle : <b>circulaire</b>. Toute autre courbe : <b>curviligne</b>.</p>`,
      methode: [
        'Repère le point de l’objet que tu suis (la valve, le centre de la balle…).',
        'Précise l’observateur : qui regarde le mouvement ?',
        'Imagine ou observe les positions successives de ce point.',
        'Les positions sont alignées → rectiligne ; sur un cercle → circulaire ; sur une autre courbe → curviligne.',
      ],
      exemples: [
        { q: 'Une bille lâchée sans élan, qui tombe.', r: 'Elle tombe tout droit : trajectoire <b>rectiligne</b>.' },
        { q: 'Le bout de la grande aiguille d’une horloge.', r: 'Il reste à la même distance du centre : trajectoire <b>circulaire</b>.' },
        { q: 'Un ballon de basket tiré vers le panier.', r: 'Il monte puis redescend en arche : trajectoire <b>curviligne</b>.' },
      ],
      astuces: [
        'Circulaire : le point reste toujours <b>à la même distance</b> d’un centre.',
        'Une chronophotographie (plusieurs photos superposées, prises à intervalles de temps égaux) montre très bien la trajectoire.',
      ],
      erreurs: [
        'Croire qu’un objet qui monte puis redescend a forcément une trajectoire courbe : un ballon lancé tout droit vers le haut a une trajectoire rectiligne.',
        'Oublier l’observateur : la valve d’une roue tourne en rond pour le cycliste, mais fait des arches pour un piéton.',
        'Confondre « circulaire » et « curviligne » : un arc de cercle (balançoire) est circulaire.',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        if (rng.chance(0.5)) {
          const kind = rng.pick(KINDS), v = rng.int(0, 2), n = rng.int(8, 12);
          const words = SHAPE_WORDS[kind][v];
          return Q(`pct1f:${kind}:${v}:${n}`, `On a repéré les positions successives d’un objet (la première est en couleur) : ${words}.${trajFig(kind, v, n, `Positions successives d’un objet : ${words}`)}Quelle est la nature de sa trajectoire ?`, fixedChoice(KINDS, kind), 'Les positions sont-elles alignées ? Restent-elles à la même distance d’un point ?', `La trajectoire est ${KIND_DEF[kind]} : elle est <b>${kind}</b>.`);
        }
        const [ctx, kind] = rng.pick(TRAJ_CTX);
        const moon = ctx.includes('Lune') ? ' (presque un cercle parfait)' : '';
        return Q(`pct1c:${ctx}`, `Quelle est la trajectoire ${de(ctx)} ?`, fixedChoice(KINDS, kind), 'Imagine la trace laissée par l’objet : une droite, un cercle ou une autre courbe ?', `La trace laissée est ${KIND_DEF[kind]}${moon} : trajectoire <b>${kind}</b>.`);
      }
      if (level === 2) {
        const r = rng.next();
        if (r < 0.4) {
          const kind = rng.pick(KINDS);
          const good = rng.pick(TRAJ_CTX.filter(c => c[1] === kind));
          const others = rng.sample(TRAJ_CTX.filter(c => c[1] !== kind), 3);
          const cap = s => s[0].toUpperCase() + s.slice(1);
          return Q(`pct2c:${kind}:${good[0]}:${others.map(o => o[0]).join('|')}`, `Lequel de ces mouvements a une trajectoire <b>${kind}</b> ?`, choice(rng, cap(good[0]), others.map(o => cap(o[0]))), `Une trajectoire ${kind}, c’est ${KIND_DEF[kind].replace(/<\/?b>/g, '')}.`, `${cap(good[0])} : la trace laissée est ${KIND_DEF[kind]}. Réponse : <b>${good[0]}</b>.`);
        }
        if (r < 0.8) {
          const order = rng.shuffle(KINDS), vs = order.map(() => rng.int(0, 2)), asked = rng.pick(KINDS);
          const letter = 'ABC'[order.indexOf(asked)];
          const desc = order.map((k, i) => `${'ABC'[i]} : ${SHAPE_WORDS[k][vs[i]]}`).join(' ; ');
          return Q(`pct2abc:${order.join('-')}:${vs.join('')}:${asked}`, `Voici les positions successives de trois objets A, B et C (${desc}).${trioFig(order.map((k, i) => [k, vs[i]]), `Trois trajectoires A, B et C. ${desc}`)}Quelle trajectoire est <b>${asked}</b> ?`, fixedChoice(['A', 'B', 'C'], letter), `Cherche la trajectoire qui est ${KIND_DEF[asked].replace(/<\/?b>/g, '')}.`, `${letter} est ${KIND_DEF[asked]} : la trajectoire ${asked} est la <b>${letter}</b>.`);
        }
        const [ctx, kind, why] = rng.pick(TRAPS);
        return Q(`pct2t:${ctx}`, `Quelle est la trajectoire ${de(ctx)} ?`, fixedChoice(KINDS, kind), 'Attention au piège : regarde si le point reste sur une droite, ou à la même distance d’un centre.', `${why} Trajectoire <b>${kind}</b>.`);
      }
      // Level 3: the trajectory depends on the observer.
      if (rng.chance(0.7)) {
        const o = rng.pick(OBS), side = rng.pick(['a', 'b']), [who, ans] = o[side];
        const opts = ['rectiligne', 'circulaire', 'curviligne', 'immobile'].map(k => OBS_OPTS[k]);
        return Q(`pct3o:${o.obj}:${side}`, `On étudie ${o.obj}. Quelle est sa trajectoire pour <b>${who}</b> ?`, fixedChoice(opts, OBS_OPTS[ans]), `Mets-toi à la place ${de(who)} : le point bouge-t-il par rapport à lui ? Si oui, quelle trace laisse-t-il ?`, `${o.why} Pour ${who} : <b>${OBS_OPTS[ans]}</b>.`);
      }
      const name = rng.pick(NAMES), [ctx, kind, why] = rng.pick(TRAPS);
      return Q(`pct3t:${name}:${ctx}`, `${name} affirme : « La trajectoire ${de(ctx)} est curviligne. » A-t-${FEM.has(name) ? 'elle' : 'il'} raison ? Choisis la bonne trajectoire.`, fixedChoice(KINDS, kind), 'Regarde si le point reste sur une même droite, ou toujours à la même distance d’un centre.', `${why} ${name} se trompe : la trajectoire est <b>${kind}</b>.`);
    },
  });

  // ===================== UNIFORME, ACCÉLÉRÉ, RALENTI =====================
  const TYPES = ['uniforme', 'accéléré', 'ralenti'];
  const TYPE_WHY = {
    uniforme: 'les écarts entre deux positions successives sont <b>égaux</b> : la vitesse est constante',
    accéléré: 'les écarts entre deux positions successives sont <b>de plus en plus grands</b> : la vitesse augmente',
    ralenti: 'les écarts entre deux positions successives sont <b>de plus en plus petits</b> : la vitesse diminue',
  };
  const SPEED_CTX = [
    ['un TGV qui démarre et quitte la gare', 'accéléré'],
    ['une voiture qui freine à l’approche d’un feu rouge', 'ralenti'],
    ['une bille lâchée qui tombe', 'accéléré'],
    ['un avion qui roule sur la piste pour décoller', 'accéléré'],
    ['un cycliste qui roule toujours à 20 km/h sur une route droite', 'uniforme'],
    ['une balle qui roule sur l’herbe et finit par s’arrêter', 'ralenti'],
    ['un ballon lancé vers le haut, pendant sa montée', 'ralenti'],
    ['une voiture dont le compteur reste bloqué à 90 km/h', 'uniforme'],
    ['un skieur qui s’élance dans une pente raide', 'accéléré'],
    ['un tapis roulant de supermarché', 'uniforme'],
    ['un bateau qui arrive au port en coupant son moteur', 'ralenti'],
    ['la grande aiguille d’une horloge', 'uniforme'],
  ];
  const TRAJ_OF = { droite: 'rectiligne', cercle: 'circulaire', courbe: 'curviligne' };
  const SHAPE_SAY = { droite: 'sur une droite', cercle: 'sur un cercle', courbe: 'sur une courbe en forme d’arche' };

  M.notion('pc-uniforme-varie', {
    lesson: {
      retenir: `Pour décrire un mouvement, on précise sa <b>trajectoire</b> et l’évolution de sa <b>vitesse</b>. Le mouvement est :<ul><li><b>uniforme</b> si la valeur de la vitesse reste constante ;</li><li><b>accéléré</b> si elle augmente ;</li><li><b>ralenti</b> si elle diminue.</li></ul>Sur une <b>chronophotographie</b>, les positions sont enregistrées à <b>intervalles de temps égaux</b> : des écarts égaux montrent un mouvement uniforme, des écarts qui grandissent un mouvement accéléré, des écarts qui rétrécissent un mouvement ralenti.`,
      explication: `<p>Sur une chronophotographie, l’objet est photographié par exemple toutes les 0,1 s. Entre deux photos, il s’écoule toujours la même durée. Plus l’objet va vite, plus il parcourt de distance pendant cette durée, donc plus les points sont écartés.</p>${chrono([1, 1, 1, 1, 1], 'droite', 'Positions également espacées')}<p>Écarts égaux : <b>uniforme</b>.</p>${chrono([0.5, 1, 1.5, 2, 2.5], 'droite', 'Positions de plus en plus espacées')}<p>Écarts de plus en plus grands : <b>accéléré</b>.</p>${chrono([2.5, 2, 1.5, 1, 0.5], 'droite', 'Positions de plus en plus rapprochées')}<p>Écarts de plus en plus petits : <b>ralenti</b>.</p>`,
      methode: [
        'Vérifie que les positions sont prises à intervalles de temps égaux.',
        'Mesure (ou compare) les écarts entre deux positions successives.',
        'Écarts égaux → uniforme ; de plus en plus grands → accéléré ; de plus en plus petits → ralenti.',
        'Ajoute la nature de la trajectoire : par exemple « rectiligne accéléré ».',
        'Pour une durée : compte les <b>intervalles</b> (le nombre de positions moins 1), pas les positions.',
      ],
      exemples: [
        { q: 'Écarts successifs : 2 cm ; 2 cm ; 2 cm ; 2 cm, sur une droite.', r: 'Mouvement <b>rectiligne uniforme</b>.' },
        { q: 'Une voiture freine au feu rouge.', r: 'Sa vitesse diminue : mouvement <b>ralenti</b>.' },
        { q: '6 positions prises toutes les 0,2 s. Durée entre la première et la dernière ?', r: '5 intervalles × 0,2 s = <b>1 s</b>.' },
      ],
      astuces: [
        'Un mouvement peut être circulaire <b>et</b> uniforme : le bout de l’aiguille d’une horloge tourne toujours à la même vitesse.',
        'Pense à un compteur de vitesse : il monte → accéléré ; il descend → ralenti ; il ne bouge pas → uniforme.',
      ],
      erreurs: [
        'Croire qu’un mouvement uniforme est forcément rectiligne : « uniforme » parle de la vitesse, pas de la trajectoire.',
        'Compter les positions au lieu des intervalles : 6 positions, c’est seulement 5 intervalles de temps.',
        'Confondre « accéléré » et « rapide » : une voiture rapide qui roule à vitesse constante a un mouvement uniforme.',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        if (rng.chance(0.6)) {
          const type = rng.pick(TYPES), gaps = gapsOf(rng, type);
          return Q(`pcu1f:${type}:${gaps.join('-')}`, `Voici la chronophotographie d’un palet sur une table (une position toutes les 0,1 s). Les écarts entre deux positions successives mesurent, dans l’ordre : ${list(gaps)} (en cm).${chrono(gaps)}Le mouvement est :`, fixedChoice(TYPES, type), 'Compare les écarts entre deux positions successives : sont-ils égaux, de plus en plus grands, ou de plus en plus petits ?', `Ici, ${TYPE_WHY[type]}. Le mouvement est <b>${type}</b>.`);
        }
        const [ctx, type] = rng.pick(SPEED_CTX);
        return Q(`pcu1c:${ctx}`, `Comment évolue la vitesse ${de(ctx)} ? Le mouvement est :`, fixedChoice(TYPES, type), 'Demande-toi si la vitesse augmente, diminue ou reste la même.', `${{ uniforme: 'La vitesse reste la même', accéléré: 'La vitesse augmente', ralenti: 'La vitesse diminue' }[type]} : mouvement <b>${type}</b>.`);
      }
      if (level === 2) {
        const r = rng.next();
        if (r < 0.45) {
          const shape = rng.pick(['droite', 'cercle', 'courbe']), type = rng.pick(TYPES), gaps = gapsOf(rng, type);
          const traj = TRAJ_OF[shape], good = `${traj} ${type}`;
          const otherT = TYPES.filter(t => t !== type), otherS = KINDS.filter(k => k !== traj);
          const opts = [`${traj} ${otherT[0]}`, `${traj} ${otherT[1]}`, `${rng.pick(otherS)} ${type}`];
          return Q(`pcu2c:${shape}:${type}:${gaps.join('-')}`, `Chronophotographie d’une balle (une position toutes les 0,04 s) : les positions sont ${SHAPE_SAY[shape]}, et les écarts entre deux positions successives mesurent ${list(gaps)} (en cm).${chrono(gaps, shape)}Comment décrire ce mouvement ?`, choice(rng, good, opts), 'Décris d’abord la forme de la trajectoire, puis l’évolution des écarts entre deux positions.', `La trajectoire est ${traj} et ${TYPE_WHY[type]}. Mouvement <b>${good}</b>.`);
        }
        if (r < 0.75) {
          const n = rng.int(5, 10), dt = rng.pick([0.04, 0.1, 0.2, 0.5, 1, 2]), T = mul(n - 1, dt);
          const obj = rng.pick(['d’un palet', 'd’une bille', 'd’un chariot', 'd’une balle', 'd’un skateur']);
          return Q(`pcu2d:${n}:${dt}`, `Sur la chronophotographie ${obj}, on compte ${n} positions, enregistrées toutes les ${fmt(dt)} s. Quelle durée s’est écoulée entre la première et la dernière position ?`, num(T, 's'), 'Compte les intervalles de temps entre les positions : il y en a un de moins que de positions.', `${n} positions → ${n - 1} intervalles. Durée : ${n - 1} × ${fmt(dt)} = <b>${fmt(T)}</b> s.`);
        }
        const type = rng.pick(TYPES), v0 = rng.pick([20, 30, 40, 50]), st = rng.pick([5, 10]);
        const vals = Array.from({ length: 4 }, (_, i) => (type === 'uniforme' ? v0 + 20 : type === 'accéléré' ? v0 + i * st : v0 + 3 * st - i * st));
        const who = rng.pick(['Hugo', 'Emma', 'Yanis', 'Lina']);
        return Q(`pcu2v:${type}:${vals.join('-')}:${who}`, `Dans la voiture, ${who} relève le compteur de vitesse toutes les 5 secondes : ${vals.map(v => `${v} km/h`).join(' ; ')}. Pendant ces relevés, le mouvement de la voiture est :`, fixedChoice(TYPES, type), 'Regarde comment évolue la valeur affichée.', `La vitesse ${{ uniforme: 'reste la même', accéléré: 'augmente', ralenti: 'diminue' }[type]} : mouvement <b>${type}</b>.`);
      }
      // Level 3: distances and durations from a chronophotograph.
      const r = rng.next();
      if (r < 0.4) {
        const k = rng.int(4, 7), g = rng.pick([1, 1.5, 2, 2.5]), sc = rng.pick([0.5, 1, 2, 5]);
        const gaps = Array(k).fill(g), real = mul(g, sc), tot = mul(k, real);
        const step = rng.chance(0.4);
        const scale = `1 cm sur le document représente ${fmt(sc)} m en réalité`;
        if (step) return Q(`pcu3s:${g}:${sc}:${k}`, `Chronophotographie d’un cycliste en mouvement rectiligne uniforme : sur le document, deux positions successives sont écartées de ${fmt(g)} cm, et ${scale}.${chrono(gaps)}Quelle distance réelle le cycliste parcourt-il entre deux positions successives ?`, num(real, 'm'), 'Utilise l’échelle : chaque centimètre du document correspond à la même distance réelle.', `${fmt(g)} × ${fmt(sc)} = <b>${fmt(real)}</b> m.`);
        return Q(`pcu3t:${g}:${sc}:${k}`, `Chronophotographie d’un cycliste en mouvement rectiligne uniforme : ${k + 1} positions, deux positions successives sont écartées de ${fmt(g)} cm sur le document, et ${scale}.${chrono(gaps)}Quelle distance réelle sépare la première position de la dernière ?`, num(tot, 'm'), 'Attention : compte les intervalles entre les positions, pas les positions. Puis utilise l’échelle.', `${k + 1} positions → ${k} intervalles de ${fmt(g)} cm, soit ${fmt(mul(k, g))} cm sur le document. En réalité : ${fmt(mul(k, g))} × ${fmt(sc)} = <b>${fmt(tot)}</b> m.`);
      }
      if (r < 0.7) {
        const type = rng.pick(['accéléré', 'ralenti']), gaps = gapsOf(rng, type);
        const n = gaps.length + 1, j = rng.int(3, n), part = gaps.slice(0, j - 1), d = sum(part);
        return Q(`pcu3a:${gaps.join('-')}:${j}`, `Une bille roule en ligne droite. Ses positions sont numérotées de 1 à ${n} ; les distances réelles entre deux positions successives sont, dans l’ordre : ${list(gaps)} (en m).${chrono(gaps)}Quelle distance la bille parcourt-elle entre la position 1 et la position ${j} ?`, num(d, 'm'), `Additionne les écarts un par un, de la position 1 jusqu’à la position ${j}.`, `De 1 à ${j}, il y a ${j - 1} écarts : ${part.map(fmt).join(' + ')} = <b>${fmt(d)}</b> m. (Le mouvement est ${type}.)`);
      }
      const n = rng.int(5, 11), dt = rng.pick([0.1, 0.2, 0.25, 0.5]), T = mul(n - 1, dt);
      const obj = rng.pick(['d’une balle de ping-pong', 'd’un palet de hockey', 'd’un ballon', 'd’une petite voiture']);
      return Q(`pcu3r:${n}:${dt}`, `La chronophotographie ${obj} comporte ${n} positions. Entre la première et la dernière, il s’est écoulé ${fmt(T)} s. Combien de temps s’écoule-t-il entre deux positions successives ?`, num(dt, 's'), 'Combien y a-t-il d’intervalles entre les positions ? Partage la durée totale entre eux.', `${n} positions → ${n - 1} intervalles. ${fmt(T)} ÷ ${n - 1} = <b>${fmt(dt)}</b> s.`);
    },
  });

  // ===================== RELATIVITÉ DU MOUVEMENT =====================
  const REL = [
    { who: 'Léa', where: 'est assise dans un train qui roule', veh: 'le train', other: 'son voisin de siège', g1: 'le quai d’une gare', g2: 'une vache dans un pré' },
    { who: 'Noah', where: 'est assis dans un bus qui roule', veh: 'le bus', other: 'le chauffeur du bus', g1: 'le trottoir', g2: 'un arbre au bord de la route' },
    { who: 'Inès', where: 'est assise dans une voiture qui roule sur l’autoroute', veh: 'la voiture', other: 'sa sœur assise à côté d’elle', g1: 'un panneau au bord de l’autoroute', g2: 'un pont au-dessus de l’autoroute' },
    { who: 'Hugo', where: 'est assis dans un avion en vol', veh: 'l’avion', other: 'le pilote', g1: 'la tour de contrôle de l’aéroport', g2: 'une maison en dessous' },
    { who: 'Chloé', where: 'est assise sur un cheval de bois d’un manège qui tourne', veh: 'le cheval de bois', other: 'le manège', g1: 'ses parents assis sur un banc', g2: 'le vendeur de glaces' },
    { who: 'Sam', where: 'se tient immobile sur un escalator qui monte', veh: 'les marches de l’escalator', other: 'la personne immobile sur la marche juste devant lui', g1: 'le sol du magasin', g2: 'un vendeur derrière son comptoir' },
    { who: 'Jade', where: 'est assise dans un bateau qui descend la rivière', veh: 'le bateau', other: 'le capitaine à la barre', g1: 'la rive', g2: 'un pêcheur assis sur un rocher' },
    { who: 'Adam', where: 'se tient debout, immobile, dans un ascenseur qui monte', veh: 'l’ascenseur', other: 'le miroir de l’ascenseur', g1: 'le hall de l’immeuble', g2: 'la boîte aux lettres du rez-de-chaussée' },
  ];
  const MOV = ['immobile', 'en mouvement'];
  const cap = s => s[0].toUpperCase() + s.slice(1);

  M.notion('pc-relativite', {
    lesson: {
      retenir: `Un objet n’est pas « en mouvement » ou « immobile » tout court : on décrit toujours son mouvement <b>par rapport à un objet de référence</b> (un observateur). Un passager assis dans un train qui roule est <b>immobile par rapport au train</b>, mais <b>en mouvement par rapport au quai</b>. La trajectoire et la vitesse dépendent aussi de l’objet de référence choisi.`,
      methode: [
        'Repère l’objet étudié (par exemple le passager).',
        'Repère l’objet de référence (le train, le quai…).',
        'Demande-toi : la distance et la position entre les deux changent-elles au cours du temps ?',
        'Si elles ne changent pas → immobile par rapport à cette référence ; sinon → en mouvement.',
      ],
      exemples: [
        { q: 'Léa est assise dans un train qui roule. Par rapport au train ?', r: 'Elle reste à la même place : <b>immobile</b>.' },
        { q: 'Même situation, par rapport au quai ?', r: 'Elle s’éloigne du quai : <b>en mouvement</b>.' },
        { q: 'Tu es assis sur ton canapé. Par rapport au Soleil ?', r: 'La Terre tourne autour du Soleil, et toi avec : <b>en mouvement</b>.' },
      ],
      astuces: [
        'Pose-toi la question : « Si j’étais assis sur l’objet de référence, verrais-je l’objet bouger ? »',
        'Dire « il ne bouge pas » sans préciser par rapport à quoi, c’est une phrase incomplète en physique.',
      ],
      erreurs: [
        'Croire qu’un objet est immobile ou en mouvement « dans l’absolu », sans objet de référence.',
        'Croire que le sol est la seule référence possible : on peut tout à fait étudier un mouvement par rapport à un train ou à une voiture.',
        'Confondre « je ne bouge pas par rapport à mon siège » et « je ne bouge pas du tout ».',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        const c = rng.pick(REL), refKey = rng.pick(['veh', 'other', 'g1', 'g2']), ref = c[refKey];
        const ans = refKey === 'veh' || refKey === 'other' ? 'immobile' : 'en mouvement';
        const why = ans === 'immobile' ? `${c.who} se déplace avec ${ref} : sa position par rapport ${au(ref)} ne change pas` : `${c.who} change de position par rapport ${au(ref)}, qui ne suit pas son déplacement`;
        return Q(`pcr1:${c.who}:${refKey}`, `${c.who} ${c.where}. Par rapport ${au(ref).replace(/^(au|aux|à) /, '$1 <b>')}</b>, ${c.who} est :`, fixedChoice(MOV, ans), `La position ${de(c.who)} par rapport ${au(ref)} change-t-elle au cours du temps ?`, `${why}. Par rapport ${au(ref)}, ${c.who} est <b>${ans}</b>.`);
      }
      if (level === 2) {
        const r = rng.next(), c = rng.pick(REL);
        if (r < 0.6) {
          const want = rng.pick(MOV);
          const mov = [c.g1, c.g2], imm = [c.veh, c.other];
          const good = want === 'immobile' ? rng.pick(imm) : rng.pick(mov);
          const opts = (want === 'immobile' ? mov : imm).map(cap);
          return Q(`pcr2o:${c.who}:${want}:${good}`, `${c.who} ${c.where}. Par rapport auquel de ces objets de référence ${c.who} est-${FEM.has(c.who) ? 'elle' : 'il'} <b>${want}</b> ?`, choice(rng, cap(good), opts), 'Pour chaque objet de référence, demande-toi si la position de l’objet change par rapport à lui.', `${want === 'immobile' ? `${cap(good)} se déplace avec ${c.who}` : `${c.who} change de position par rapport ${au(good)}`}. Réponse : <b>${good}</b>.`);
        }
        const friend = rng.pick(NAMES.filter(n => n !== c.who));
        const opts = [`${c.who}`, `${friend}`, 'Les deux : cela dépend de l’objet de référence', 'Aucun des deux'];
        return Q(`pcr2d:${c.who}:${friend}`, `${c.who} ${c.where} et dit : « Je suis immobile. » ${friend}, qui regarde depuis ${c.g1}, répond : « Mais non, tu bouges ! » Qui a raison ?`, fixedChoice(opts, opts[2]), 'Par rapport à quoi chacun décrit-il le mouvement ?', `${c.who} est immobile par rapport ${au(c.veh)}, et en mouvement par rapport ${au(c.g1)}. <b>Les deux ont raison</b>, chacun avec son objet de référence.`);
      }
      // Level 3: traps.
      const name = rng.pick(NAMES), il = FEM.has(name) ? 'elle' : 'il', s = FEM.has(name) ? 'e' : '';
      const r = rng.next();
      if (r < 0.2) {
        return Q(`pcr3e:${name}`, `${name} descend un escalator qui monte, en marchant exactement à la même vitesse que les marches, mais dans l’autre sens. Par rapport au sol du magasin, ${name} est :`, fixedChoice(MOV, 'immobile'), 'Les marches l’emportent vers le haut, ses pas l’emmènent vers le bas, aussi vite. Que voit un vendeur immobile ?', `Ses pas compensent exactement le mouvement des marches : par rapport au sol, ${il} reste au même endroit. ${name} est <b>immobile</b> par rapport au sol (mais en mouvement par rapport aux marches).`);
      }
      if (r < 0.4) {
        const v = rng.pick([90, 110, 130]);
        return Q(`pcr3v:${name}:${v}`, `Sur l’autoroute, la voiture ${de(name)} et un camion roulent côte à côte, tous les deux à ${v} km/h, dans le même sens. Par rapport au camion, la voiture ${de(name)} est :`, fixedChoice(MOV, 'immobile'), 'La distance entre la voiture et le camion change-t-elle ?', `Ils vont aussi vite, dans le même sens : la voiture reste toujours à côté du camion. Par rapport au camion, elle est <b>immobile</b> (mais en mouvement par rapport à la route).`);
      }
      if (r < 0.6) {
        const opts = ['immobile, car la maison ne bouge pas', 'en mouvement, car la Terre tourne autour du Soleil', 'immobile, car on ne sent rien', 'on ne peut pas savoir'];
        return Q(`pcr3s:${name}`, `${name} est assis${s} sur le canapé du salon. Par rapport au <b>Soleil</b>, ${name} est :`, fixedChoice(opts, opts[1]), 'Que fait la Terre, avec tout ce qui est posé dessus, par rapport au Soleil ?', `Par rapport à la maison, ${name} est immobile. Mais la Terre tourne autour du Soleil en emportant la maison : par rapport au Soleil, ${name} est <b>${opts[1]}</b>.`);
      }
      if (r < 0.8) {
        const opts = ['Le train ' + de(name) + ' a démarré', 'Le train voisin a démarré', 'Les deux trains ont démarré', 'Aucun train ne bouge'];
        return Q(`pcr3t:${name}`, `${name} est assis${s} dans un train arrêté en gare. Par la fenêtre, ${il} voit le train voisin défiler et croit que son propre train démarre. Pourtant, par rapport au quai, son train n’a pas bougé. Que s’est-il passé ?`, fixedChoice(opts, opts[1]), 'Par rapport au quai, quel train change de position ?', `${name} prend le train voisin comme référence sans s’en rendre compte : par rapport à ce train, ${il} est en mouvement. Par rapport au quai, seul l’autre train bouge : <b>le train voisin a démarré</b>.`);
      }
      const opts = ['une droite verticale', 'une courbe', 'un cercle', 'aucune : la balle est immobile'];
      const quai = rng.chance(0.5);
      const ans = quai ? opts[1] : opts[0];
      return Q(`pcr3b:${name}:${quai ? 'quai' : 'train'}`, `${name}, assis${s} dans un train qui roule tout droit à vitesse constante, lâche une balle. Pour ${quai ? 'une personne immobile sur le quai' : `${name} ${il}-même`}, la trajectoire de la balle est :`, fixedChoice(opts, ans), quai ? 'La balle tombe, mais avance-t-elle aussi avec le train pour la personne sur le quai ?' : `Pour ${name}, la balle avance avec le train, comme lui : où tombe-t-elle par rapport à ${il} ?`, quai ? `Pour la personne sur le quai, la balle tombe <b>et</b> avance avec le train : sa trajectoire est <b>une courbe</b>.` : `Pour ${name}, la balle tombe droit à ses pieds : la trajectoire est <b>une droite verticale</b>.`);
    },
  });

  // ===================== VITESSE =====================
  const MOVERS_KMH = [
    ['Un cycliste', [12, 15, 18, 20, 24]],
    ['Une voiture', [50, 60, 80, 90]],
    ['Un train', [120, 150, 200, 250]],
    ['Une coureuse', [8, 10, 12]],
    ['Un car scolaire', [40, 50, 70]],
  ];
  const MOVERS_MS = [
    ['Un sprinteur', [8, 9, 10], [5, 10]],
    ['Une nageuse', [2], [25, 50, 100]],
    ['Un chat', [4, 5, 6], [3, 4, 5]],
    ['Un skateur', [3, 4, 5], [10, 20, 30]],
    ['Un escargot', [0.002, 0.001], [100, 200, 500]],
  ];
  // Friendly fractions of an hour.
  const HOUR = { 15: 0.25, 30: 0.5, 45: 0.75, 90: 1.5, 6: 0.1, 12: 0.2 };
  const hm = s => { const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return h ? (m ? `${h} h ${String(m).padStart(2, '0')} min` : `${h} h`) : `${m} min`; };
  const CONV = [5, 10, 12.5, 15, 20, 25, 30, 35, 40, 50];
  const ANIMALS = [['un guépard', 30], ['un lièvre', 20], ['un cheval au galop', 15], ['un sprinteur', 10], ['un dauphin', 12.5]];

  M.notion('pc-vitesse', {
    lesson: {
      retenir: `La <b>vitesse moyenne</b> d’un objet est la distance parcourue divisée par la durée du parcours : <b>v = d ÷ t</b>. On en déduit <b>d = v × t</b> et <b>t = d ÷ v</b>. Si d est en km et t en h, v est en <b>km/h</b> ; si d est en m et t en s, v est en <b>m/s</b>. On a <b>1 m/s = 3,6 km/h</b>. Une vitesse se décrit par sa <b>direction</b> (horizontale, verticale…), son <b>sens</b> (vers le haut, vers la droite…) et sa <b>valeur</b>.`,
      explication: `<p>Une vitesse de 60 km/h veut dire : « 60 km parcourus en 1 heure ». C’est une situation de proportionnalité entre la durée et la distance :</p>${M.h.table([['durée (h)', '0,5', '1', '2', '3'], ['distance (km)', '30', '60', '120', '180']], { head: false, cls: 'prop' })}<p>Le coefficient de proportionnalité, c’est la vitesse : d = 60 × t. Et pour passer des m/s aux km/h : 1 m en 1 s, c’est 3 600 m en 1 h, soit <b>3,6 km/h</b>.</p>`,
      methode: [
        'Repère ce que tu cherches : la vitesse v, la distance d ou la durée t.',
        'Vérifie que les unités vont ensemble : km et h, ou m et s. Convertis les minutes en heures si besoin (30 min = 0,5 h).',
        'Applique la bonne relation : v = d ÷ t, d = v × t ou t = d ÷ v.',
        'Écris l’unité du résultat et vérifie qu’il est vraisemblable.',
        'Pour convertir : m/s → km/h, multiplie par 3,6 ; km/h → m/s, divise par 3,6.',
      ],
      exemples: [
        { q: 'Un cycliste parcourt 45 km en 3 h. Sa vitesse ?', r: 'v = 45 ÷ 3 = <b>15 km/h</b>.' },
        { q: 'Une voiture roule à 80 km/h pendant 30 min. Distance ?', r: '30 min = 0,5 h ; d = 80 × 0,5 = <b>40 km</b>.' },
        { q: 'Convertir 20 m/s en km/h.', r: '20 × 3,6 = <b>72 km/h</b>.' },
      ],
      astuces: [
        'Valeurs à connaître : 10 m/s = 36 km/h ; 20 m/s = 72 km/h ; 25 m/s = 90 km/h ; 30 m/s = 108 km/h.',
        'Pour comparer deux vitesses, exprime-les d’abord dans la même unité.',
      ],
      erreurs: [
        'Croire que 30 min = 0,30 h : 30 min = une demi-heure = <b>0,5 h</b>.',
        'Comparer 90 km/h et 30 m/s directement : 30 m/s = 108 km/h, c’est plus rapide !',
        'Croire que celui qui va le plus loin est forcément le plus rapide : il faut aussi tenir compte de la durée.',
        'Confondre direction et sens : « verticale » est une direction, « vers le bas » est un sens.',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        const r = rng.next();
        if (r < 0.4) {
          const [who, vs] = rng.pick(MOVERS_KMH), v = rng.pick(vs), t = rng.int(2, 4), d = v * t;
          return Q(`pcv1k:${who}:${d}:${t}`, `${who} parcourt ${fmt(d)} km en ${t} h. Quelle est sa vitesse moyenne ?`, num(v, 'km/h'), 'La vitesse, c’est la distance divisée par la durée.', `v = d ÷ t = ${fmt(d)} ÷ ${t} = <b>${fmt(v)}</b> km/h.`);
        }
        if (r < 0.75) {
          const [who, vs, ts] = rng.pick(MOVERS_MS), v = rng.pick(vs), t = rng.pick(ts), d = mul(v, t);
          return Q(`pcv1m:${who}:${d}:${t}`, `${who} parcourt ${fmt(d)} m en ${t} s. Quelle est sa vitesse moyenne ?`, num(v, 'm/s'), 'Divise la distance (en m) par la durée (en s).', `v = d ÷ t = ${fmt(d)} ÷ ${t} = <b>${fmt(v)}</b> m/s.`);
        }
        if (r < 0.9) {
          const want = rng.pick(['v', 'd', 't']);
          const good = { v: 'v = d ÷ t', d: 'd = v × t', t: 't = d ÷ v' }[want];
          const bad = { v: ['v = d × t', 'v = t ÷ d', 'v = d + t'], d: ['d = v ÷ t', 'd = t ÷ v', 'd = v + t'], t: ['t = d × v', 't = v ÷ d', 't = d − v'] }[want];
          const what = { v: 'la vitesse v', d: 'la distance d', t: 'la durée t' }[want];
          const ctx = rng.pick(['un randonneur', 'un train', 'une fusée', 'un cycliste']);
          return Q(`pcv1f:${want}:${ctx}`, `Pour ${ctx}, on note d la distance parcourue, t la durée et v la vitesse moyenne. Quelle relation permet de calculer ${what} ?`, choice(rng, good, bad), 'Pense à un exemple : 100 km en 2 h, c’est 50 km/h.', `Exemple : 100 km en 2 h → 50 km/h. La bonne relation est <b>${good}</b>.`);
        }
        const unit = rng.pick(['km/h', 'm/s']), bad = rng.sample(['km', 'h', 'm', 's', 'kg', 'min'], 3);
        return Q(`pcv1u:${unit}:${bad.join(',')}`, 'Laquelle de ces unités est une unité de <b>vitesse</b> ?', choice(rng, unit, bad), 'Une vitesse, c’est une distance divisée par une durée.', `Une vitesse s’exprime en unité de distance « par » unité de durée : <b>${unit}</b>.`);
      }
      if (level === 2) {
        const r = rng.next();
        if (r < 0.25) {
          const min = rng.pick([15, 30, 45, 90]), t = HOUR[min];
          let v; do v = rng.pick([20, 40, 60, 80, 100, 120]); while (!Number.isInteger(mul(v, t)));
          const d = mul(v, t), who = rng.pick(['Une voiture', 'Un train', 'Un scooter', 'Un car']);
          return Q(`pcv2d:${v}:${min}:${who}`, `${who} roule à ${v} km/h pendant ${min} min. Quelle distance parcourt-${who.startsWith('Une') ? 'elle' : 'il'} ?`, num(d, 'km'), 'Convertis d’abord la durée en heures, puis utilise d = v × t.', `${min} min = ${fmt(t)} h. d = v × t = ${v} × ${fmt(t)} = <b>${fmt(d)}</b> km.`);
        }
        if (r < 0.5) {
          const t = rng.pick([0.25, 0.5, 0.75, 1.5, 2]), v = rng.pick([12, 20, 40, 60, 80]), d = mul(v, t), min = t * 60;
          const who = rng.pick(['Noah, à vélo,', 'Le bus', 'Emma, en roller,', 'La voiture de Chloé']);
          return Q(`pcv2t:${d}:${v}:${who}`, `${who} parcourt ${fmt(d)} km à la vitesse moyenne de ${v} km/h. Combien de minutes dure le trajet ?`, num(min, 'min'), 't = d ÷ v donne une durée en heures ; convertis-la ensuite en minutes (1 h = 60 min).', `t = d ÷ v = ${fmt(d)} ÷ ${v} = ${fmt(t)} h = ${fmt(t)} × 60 min = <b>${fmt(min)}</b> min.`);
        }
        if (r < 0.75) {
          const [a, b] = rng.sample(NAMES, 2);
          const va = rng.pick([4, 5, 6, 8]), vb = rng.chance(0.2) ? va : rng.pick([4, 5, 6, 8].filter(x => x !== va));
          const ta = rng.pick([10, 15, 20, 25]), tb = rng.pick([10, 15, 20, 25].filter(x => x !== ta));
          const da = va * ta, db = vb * tb;
          const good = va === vb ? 'Ils vont aussi vite' : va > vb ? a : b;
          return Q(`pcv2c:${a}:${b}:${da}/${ta}:${db}/${tb}`, `${a} court ${da} m en ${ta} s. ${b} court ${db} m en ${tb} s. Qui court le plus vite ?`, fixedChoice([a, b, 'Ils vont aussi vite'], good), 'Calcule la vitesse de chacun en m/s : la distance ne suffit pas.', `${a} : ${da} ÷ ${ta} = ${va} m/s. ${b} : ${db} ÷ ${tb} = ${vb} m/s. Réponse : <b>${good}</b>.`);
        }
        const S = [
          ['un ascenseur qui monte', 'verticale', 'vers le haut'],
          ['une bille lâchée qui tombe', 'verticale', 'vers le bas'],
          ['un ascenseur qui descend', 'verticale', 'vers le bas'],
          ['une voiture qui roule vers la droite sur une route horizontale', 'horizontale', 'vers la droite'],
          ['un train qui part vers la gauche sur une voie horizontale', 'horizontale', 'vers la gauche'],
          ['une fusée qui décolle tout droit', 'verticale', 'vers le haut'],
        ];
        const [ctx, dir, sens] = rng.pick(S), ask = rng.pick(['direction', 'sens']);
        const otherDir = dir === 'verticale' ? 'horizontale' : 'verticale';
        const good = ask === 'direction' ? dir : sens;
        const opts = ask === 'direction' ? [dir, otherDir, sens] : [sens, dir, { 'vers le haut': 'vers le bas', 'vers le bas': 'vers le haut', 'vers la droite': 'vers la gauche', 'vers la gauche': 'vers la droite' }[sens]];
        return Q(`pcv2s:${ctx}:${ask}`, `On étudie la vitesse ${de(ctx)}. ${ask === 'direction' ? 'Quelle est la <b>direction</b>' : 'Quel est le <b>sens</b>'} de cette vitesse ?`, choice(rng, good, opts.slice(1)), 'La direction, c’est la « ligne » suivie (horizontale, verticale…) ; le sens, c’est de quel côté on va sur cette ligne.', `Direction : ${dir} ; sens : ${sens}. ${ask === 'direction' ? 'La direction' : 'Le sens'} est <b>${good}</b>.`);
      }
      // Level 3: conversions, comparisons in different units, durations.
      const r = rng.next();
      if (r < 0.3) {
        const ms = rng.pick(CONV), kmh = mul(ms, 3.6);
        if (rng.chance(0.5)) return Q(`pcv3a:${ms}`, `Convertis ${fmt(ms)} m/s en km/h.`, num(kmh, 'km/h'), '1 m/s = 3,6 km/h.', `${fmt(ms)} m/s = ${fmt(ms)} × 3,6 km/h = <b>${fmt(kmh)}</b> km/h.`);
        return Q(`pcv3b:${kmh}`, `Convertis ${fmt(kmh)} km/h en m/s.`, num(ms, 'm/s'), 'Pour passer des km/h aux m/s, on divise par 3,6.', `${fmt(kmh)} km/h = ${fmt(kmh)} ÷ 3,6 m/s = <b>${fmt(ms)}</b> m/s.`);
      }
      if (r < 0.55) {
        const [an, ms] = rng.pick(ANIMALS), kmh = mul(ms, 3.6);
        let car; do car = rng.pick([36, 45, 50, 54, 60, 72, 80, 90, 100]); while (car === kmh);
        const who = rng.pick(['une voiture', 'un scooter', 'une moto']);
        const good = kmh > car ? cap(an) : cap(who);
        const opts = [cap(an), cap(who), 'Ils vont aussi vite'];
        return Q(`pcv3c:${an}:${car}:${who}`, `${cap(an)} court à ${fmt(ms)} m/s ; ${who} roule à ${car} km/h. Lequel est le plus rapide ?`, fixedChoice(opts, good), 'Exprime les deux vitesses dans la même unité avant de comparer.', `${fmt(ms)} m/s = ${fmt(ms)} × 3,6 = ${fmt(kmh)} km/h, à comparer à ${car} km/h. Le plus rapide : <b>${good.toLowerCase()}</b>.`);
      }
      if (r < 0.8) {
        const v = rng.pick([20, 40, 60, 80, 100]), mins = rng.pick([45, 90, 150, 135, 75].filter(m => Number.isInteger((v * m) / 60)));
        const d = (v * mins) / 60, s = mins * 60, t = div(mins, 60, 6);
        const who = rng.pick(['La famille de Léa', 'Le car de l’équipe de Hugo', 'Tom et son père', 'Le camion de livraison']);
        return Q(`pcv3t:${d}:${v}`, `${who} doit parcourir ${fmt(d)} km à la vitesse moyenne de ${v} km/h. Combien de temps dure le trajet ? (réponds en h et min)`, { kind: 'duration', s, units: 'hm' }, 't = d ÷ v donne des heures, parfois avec une virgule : 0,5 h = 30 min, 0,25 h = 15 min.', `t = d ÷ v = ${fmt(d)} ÷ ${v} = ${fmt(t)} h = <b>${hm(s)}</b>.`);
      }
      const min = rng.pick([6, 12, 15, 45]), t = HOUR[min];
      let v; do v = rng.pick([10, 15, 20, 30, 40, 60]); while (!Number.isInteger(mul(v, t) * 2));
      const d = mul(v, t), who = rng.pick(['Inès', 'Yanis', 'Lina', 'Adam']);
      const conv = { 6: '6 min = 0,1 h (un dixième d’heure)', 12: '12 min = 0,2 h (60 ÷ 12 = 5, donc un cinquième d’heure)', 15: '15 min = 0,25 h (un quart d’heure)', 45: '45 min = 0,75 h (trois quarts d’heure)' }[min];
      return Q(`pcv3d:${who}:${v}:${min}`, `${who} roule à vélo à ${v} km/h pendant ${min} min. Quelle distance parcourt-${FEM.has(who) ? 'elle' : 'il'} ?`, num(d, 'km'), 'Attention aux unités : la vitesse est en km/h, convertis la durée en heures avant de multiplier.', `${conv}. d = ${v} × ${fmt(t)} = <b>${fmt(d)}</b> km.`);
    },
  });

  // ===================== EXPLICATIONS =====================
  const B = M.cat.BASE, E = M.explain;
  E('pc-trajectoires', [
    ['dessin', B],
    ['experience', '<p>On fixe une petite lampe sur la valve d’une roue de vélo, dans une pièce sombre, et on prend une photo avec un long temps de pose. Si le vélo est retourné et que la roue tourne sur place, la photo montre un <b>cercle</b> lumineux : trajectoire circulaire. Si quelqu’un roule avec le vélo devant l’appareil photo, la lampe dessine des <b>arches</b> successives : trajectoire curviligne. Même valve, deux trajectoires : tout dépend de ce qu’on prend comme référence.</p>'],
    ['vie', '<p>Au parc, Chloé fait du manège pendant que Hugo lance une balle à Noah. Le cheval de bois de Chloé tourne autour du centre du manège : trajectoire <b>circulaire</b>. La balle de Hugo monte puis redescend en arche : trajectoire <b>curviligne</b>. Et quand Noah lâche la balle sans élan, elle tombe tout droit : trajectoire <b>rectiligne</b>.</p>'],
  ]);
  E('pc-uniforme-varie', [
    ['dessin', B],
    ['experience', '<p>On fait rouler une bille sur une table, puis le long d’une pente, et on la filme. Image par image, on marque au feutre sur une feuille transparente la position de la bille toutes les 0,1 s. Sur la table, les points sont régulièrement espacés : mouvement <b>uniforme</b>. Dans la pente, ils s’écartent de plus en plus : mouvement <b>accéléré</b>. Sur le tapis en bas de la pente, ils se resserrent jusqu’à l’arrêt : mouvement <b>ralenti</b>.</p>'],
    ['vie', '<p>Léa prend le bus. Au départ de l’arrêt, le bus prend de la vitesse : mouvement <b>accéléré</b>. Sur le boulevard tout droit, le compteur reste sur 50 km/h : mouvement <b>rectiligne uniforme</b>. À l’arrêt suivant, le chauffeur freine : mouvement <b>ralenti</b>. Et dans le rond-point, à vitesse constante : mouvement <b>circulaire uniforme</b>.</p>'],
  ]);
  E('pc-relativite', [
    ['vie', '<p>Noah est assis dans le train et lit un livre. Pour sa voisine Inès, Noah ne bouge pas du tout : il est <b>immobile par rapport au train</b>. Mais pour Sam, resté sur le quai, Noah file à toute vitesse : il est <b>en mouvement par rapport au quai</b>. Inès et Sam ont raison tous les deux : ils ne regardent pas depuis le même endroit.</p>'],
    ['etapes', '<p>Pour savoir si un objet bouge :</p><ol><li>Je choisis l’objet de référence (le train, le sol, une voiture…).</li><li>Je me demande : la position de l’objet par rapport à cette référence change-t-elle au cours du temps ?</li><li>Si non : il est <b>immobile</b> par rapport à cette référence.</li><li>Si oui : il est <b>en mouvement</b> par rapport à cette référence.</li><li>Je n’oublie jamais de dire « par rapport à quoi ».</li></ol>'],
    ['experience', '<p>On pose une petite voiture sur une planche, et on tire la planche lentement sur la table. Un élève qui suit la planche des yeux voit la voiture <b>immobile</b> : elle reste au même endroit sur la planche. Un élève qui regarde la table voit la voiture <b>avancer</b>. Même voiture, deux descriptions : la planche et la table sont deux objets de référence différents.</p>'],
  ]);
  E('pc-vitesse', [
    ['lien', B],
    ['vie', '<p>Hugo part en vacances : 240 km jusqu’à la mer, en 3 h. Sa vitesse moyenne : 240 ÷ 3 = <b>80 km/h</b>. Sur l’autoroute, la voiture allait plus vite, dans les bouchons beaucoup moins vite : la vitesse <b>moyenne</b> fait comme si la vitesse avait été la même tout le long. Le retour dure 4 h à cause des bouchons : 240 ÷ 4 = 60 km/h.</p>'],
    ['etapes', '<p>Une voiture roule à 90 km/h pendant 30 min. Quelle distance parcourt-elle ?</p><ol><li>Je cherche une distance : d = v × t.</li><li>La vitesse est en km/h, donc je mets la durée en heures : 30 min = 0,5 h.</li><li>Je calcule : 90 × 0,5 = 45.</li><li>J’écris l’unité : <b>45 km</b>. C’est vraisemblable : en une demi-heure, la moitié de 90 km.</li></ol>'],
  ]);
})();
