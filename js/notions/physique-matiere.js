// Physique-chimie, « La matière » : états et changements d’état, modèle particulaire,
// mesures (volume, masse, pression, mesures répétées), mélanges et corps purs, transformations.
(function () {
  'use strict';
  const M = globalThis.M;
  const { fmt, add, sub, mul, div } = M.u;
  const { table } = M.h;
  const { Q, num, choice, fixedChoice, sequence } = M.kit;
  const { svg, text, line, poly } = M.svg.raw;

  const NAMES = ['Sam', 'Inès', 'Chloé', 'Noah', 'Léa', 'Hugo', 'Jade', 'Yanis', 'Lina', 'Malo'];
  const yesNo = b => fixedChoice(['Oui', 'Non'], b ? 'Oui' : 'Non');
  const vf = b => fixedChoice(['Vrai', 'Faux'], b ? 'Vrai' : 'Faux');
  const cap = s => s[0].toUpperCase() + s.slice(1);
  const deg = t => `${fmt(t)} °C`;
  const pct = (p, v) => div(mul(p, v), 100);
  const STATES = ['Solide', 'Liquide', 'Gaz'];
  // « de » + noun with its article: le fer → du fer, l’eau → de l’eau, la cire → de la cire.
  const de = n => n.replace(/^le /, 'du ').replace(/^(la |l’)/, 'de $1');
  const the = n => n.replace(/^un /, 'le ').replace(/^une /, 'la ');

  // ===================== FIGURES =====================
  // Box of particles: solide (packed, ordered), liquide (packed, disordered, at the bottom), gaz (far apart).
  const STATE_DESC = {
    solide: 'des particules collées les unes aux autres et rangées en rangs réguliers',
    liquide: 'des particules collées les unes aux autres mais en désordre, au fond de la boîte',
    gaz: 'des particules éloignées les unes des autres, en désordre, dans toute la boîte',
  };
  function particles(state, seed = 1, n = 7) {
    const r = M.u.rng(seed * 101 + state.length * 7), W = 130, R = 6.5, lo = 4 + R + 3, hi = W - 4 - R - 3;
    let pts = [];
    if (state === 'solide') {
      for (let j = 0; j < 4; j++) for (let i = 0; i < 5; i++) pts.push([W / 2 + (i - 2) * 14, W - 5 - R - j * 14]);
    } else if (state === 'liquide') {
      const skip = new Set(r.sample([...Array(21).keys()], 3));
      for (let j = 0; j < 3; j++) {
        for (let i = 0; i < 7; i++) if (!skip.has(j * 7 + i)) pts.push([lo + 1 + i * 14.5 + (j % 2) * 4 + r.int(-2, 2), W - 5 - R - j * 13 + r.int(-1, 1)]);
      }
    } else {
      for (let tries = 0; pts.length < n && tries < 50; tries++) {
        pts = [];
        for (let k = 0; k < 400 && pts.length < n; k++) {
          const p = [r.int(lo, hi), r.int(lo, hi)];
          if (pts.every(q => Math.hypot(p[0] - q[0], p[1] - q[1]) >= 30)) pts.push(p);
        }
      }
    }
    let b = `<rect x="4" y="4" width="${W - 8}" height="${W - 8}" class="s-line s-nofill"/>`;
    pts.forEach(([x, y]) => { b += `<circle cx="${x}" cy="${y}" r="${R}" class="s-fill"/>`; });
    return svg(W, W, b, '', `Boîte contenant ${STATE_DESC[state]}`);
  }

  // Temperature curve (heating or cooling): pts [[t (min), θ (°C)]].
  function courbe(pts, { tmax, ymin, ymax, ystep }, label) {
    const ox = 58, top = 28, gw = 262, gh = 170, oy = top + gh;
    const X = t => ox + (t / tmax) * gw, Y = v => top + ((ymax - v) / (ymax - ymin)) * gh;
    let b = '';
    const xl = tmax > 12 ? 2 : 1;
    for (let t = 1; t <= tmax; t++) {
      b += line(X(t), oy, X(t), top, 's-grid');
      if (t % xl === 0) b += text(X(t), oy + 17, fmt(t), { size: 12 });
    }
    for (let v = ymin; v <= ymax; v += ystep) {
      if (v > ymin) b += line(ox, Y(v), X(tmax), Y(v), 's-grid');
      b += text(ox - 7, Y(v) + 4, fmt(v), { anchor: 'end', size: 12 });
    }
    b += text(ox, oy + 17, '0', { size: 12 });
    b += line(ox, oy, X(tmax) + 14, oy) + poly([[X(tmax) + 14, oy - 5], [X(tmax) + 22, oy], [X(tmax) + 14, oy + 5]], 's-solid');
    b += line(ox, oy, ox, top - 12) + poly([[ox - 5, top - 12], [ox, top - 20], [ox + 5, top - 12]], 's-solid');
    b += text(336, oy + 36, 'Durée (min)', { anchor: 'end', size: 13, cls: 's-text s-bold' });
    b += text(ox + 8, top - 12, 'Température (°C)', { anchor: 'start', size: 13, cls: 's-text s-bold' });
    b += `<polyline points="${pts.map(([t, v]) => `${X(t).toFixed(1)},${Y(v).toFixed(1)}`).join(' ')}" class="s-accent-line"/>`;
    return svg(340, 250, b, '', label);
  }
  const ptsText = pts => pts.map(([t, v]) => `(${fmt(t)} min ; ${deg(v)})`).join(', ');

  // Graduated cylinder: volume V (bottom of the meniscus), small graduation `step`, capacity 50 × step.
  function eprouvette(V, step) {
    const capV = 50 * step, y = v => 285 - (v / capV) * 240, yv = y(V);
    let b = `<path d="M61,288 L61,${yv - 5} Q85,${yv + 5} 109,${yv - 5} L109,288 Z" class="s-soft"/>`;
    b += `<path d="M61,${yv - 5} Q85,${yv + 5} 109,${yv - 5}" class="s-accent-line"/>`;
    b += line(60, 22, 60, 290) + line(110, 22, 110, 290) + line(60, 290, 110, 290);
    b += poly([[40, 290], [130, 290], [130, 300], [40, 300]], 's-line s-nofill');
    for (let i = 0; i <= 50; i++) {
      const len = i % 10 === 0 ? 20 : i % 5 === 0 ? 13 : 7, yy = y(i * step).toFixed(1);
      b += `<line x1="60" y1="${yy}" x2="${60 + len}" y2="${yy}" class="s-line" style="stroke-width:${i % 5 === 0 ? 1.6 : 1}"/>`;
      if (i % 10 === 0 && i > 0) b += text(116, Number(yy) + 4, fmt(i * step), { anchor: 'start', size: 12 });
    }
    b += text(85, 16, 'mL', { size: 12, cls: 's-text s-bold' });
    return svg(170, 306, b, '', `Éprouvette graduée de 0 à ${fmt(capV)} mL contenant un liquide`);
  }
  // Words describing the reading (accessibility): numbered marks every 10 × step, and position of the meniscus.
  function eprouvetteText(V, step) {
    const L = 10 * step, base = Math.floor(V / L) * L, k = (V - base) / step;
    return `Les traits numérotés vont de ${fmt(L)} en ${fmt(L)} mL, avec 10 petites graduations entre deux traits numérotés ; le bas du ménisque est ${k ? `${k} petite${k > 1 ? 's' : ''} graduation${k > 1 ? 's' : ''} au-dessus du trait ${fmt(base)} mL` : `sur le trait ${fmt(base)} mL`}.`;
  }

  // ===================== SOLIDE, LIQUIDE, GAZ =====================
  const OBJETS = [
    ['un caillou', 'solide'], ['le lait', 'liquide'], ['l’air contenu dans un ballon', 'gaz'], ['la vapeur d’eau', 'gaz'],
    ['l’huile', 'liquide'], ['un glaçon', 'solide'], ['le sable', 'solide'], ['le jus d’orange', 'liquide'],
    ['le dioxygène', 'gaz'], ['une règle en bois', 'solide'], ['le sel', 'solide'], ['l’eau du robinet', 'liquide'],
    ['le gaz de la cuisinière', 'gaz'], ['une pièce de monnaie', 'solide'], ['le vinaigre', 'liquide'], ['la farine', 'solide'],
    ['le dioxyde de carbone des bulles d’un soda', 'gaz'], ['le miel', 'liquide'], ['le sucre en poudre', 'solide'], ['l’hélium d’un ballon de fête', 'gaz'],
  ];
  const POUDRES = ['le sable', 'le sel', 'la farine', 'le sucre en poudre'];
  const WHY_STATE = {
    solide: 'il a une <b>forme propre</b> et un volume propre : on peut le saisir',
    liquide: 'il n’a pas de forme propre (il prend la forme du récipient), mais il a un <b>volume propre</b> ; au repos, sa surface libre est plane et horizontale',
    gaz: 'il n’a ni forme propre ni volume propre : il <b>occupe tout l’espace</b> qui lui est offert, et on peut le comprimer',
  };
  const PROPS = [
    ['a une forme propre (il garde sa forme quand on le change de récipient)', 'Le solide'],
    ['prend la forme du récipient qui le contient', 'Le liquide et le gaz'],
    ['a une surface libre plane et horizontale au repos', 'Le liquide'],
    ['a un volume propre (son volume ne change pas quand on le transvase)', 'Le solide et le liquide'],
    ['occupe tout le volume qui lui est offert', 'Le gaz'],
    ['se comprime facilement (on peut réduire son volume en appuyant)', 'Le gaz'],
    ['peut être saisi avec les doigts', 'Le solide'],
    ['est presque impossible à comprimer', 'Le solide et le liquide'],
  ];
  const PROP_OPTS = ['Le solide', 'Le liquide', 'Le gaz', 'Le solide et le liquide', 'Le liquide et le gaz'];
  const ETATS_VF = [
    ['Le sable coule comme un liquide quand on le verse, donc c’est un liquide.', false, 'Le sable est un <b>solide</b> : chaque grain garde sa forme et son volume. Une poudre peut couler, mais elle est faite de petits solides.'],
    ['L’air est de la matière : il a une masse.', true, 'Un ballon gonflé est un peu plus lourd que le même ballon dégonflé : l’air a une masse (environ 1,2 g par litre).'],
    ['Un gaz n’a pas de volume propre : il occupe tout le récipient qui le contient.', true, 'Un gaz s’étale dans <b>tout</b> l’espace disponible.'],
    ['Dans une seringue bouchée, on comprime l’eau liquide aussi facilement que l’air.', false, 'L’air se comprime facilement ; l’eau liquide est presque <b>incompressible</b> : le piston ne bouge presque pas.'],
    ['Un liquide prend la forme du récipient, donc son volume change quand on le transvase.', false, 'Sa <b>forme</b> change, pas son volume : 200 mL d’eau restent 200 mL dans un bol ou dans un verre.'],
    ['Quand on penche un verre d’eau, la surface de l’eau reste horizontale.', true, 'Au repos, la surface libre d’un liquide est toujours <b>plane et horizontale</b>, même si le récipient est penché.'],
    ['Une éponge s’écrase quand on appuie dessus, donc ce n’est pas un solide.', false, 'L’éponge est un <b>solide</b> : ce sont les trous remplis d’air qui s’écrasent, la matière de l’éponge garde sa forme.'],
    ['La vapeur d’eau, c’est le petit nuage blanc qu’on voit au-dessus d’une casserole.', false, 'La vapeur d’eau est un gaz <b>invisible</b> ; le nuage blanc est fait de minuscules gouttelettes d’eau liquide.'],
    ['Si on bouche une seringue pleine d’air, on peut quand même enfoncer un peu le piston.', true, 'L’air est un gaz : il est <b>compressible</b>.'],
    ['Un gaz n’est pas de la matière, car on ne le voit pas.', false, 'Un gaz est de la matière : il occupe de la place et il a une <b>masse</b>, même invisible.'],
  ];

  M.notion('pc-etats-proprietes', {
    lesson: {
      retenir: `La matière existe dans trois états :<ul><li>un <b>solide</b> a une forme propre et un volume propre : on peut le saisir ;</li><li>un <b>liquide</b> n’a pas de forme propre (il prend la forme du récipient) mais il a un volume propre ; au repos, sa surface libre est <b>plane et horizontale</b> ;</li><li>un <b>gaz</b> n’a ni forme propre ni volume propre : il occupe tout l’espace offert, et il est <b>compressible</b>.</li></ul>Une poudre (sable, sel, farine) est un solide : chaque grain garde sa forme.`,
      methode: [
        'Demande-toi si on peut saisir l’objet avec les doigts et s’il garde sa forme : si oui, c’est un <b>solide</b>.',
        'S’il coule et prend la forme du récipient en gardant son volume, avec une surface horizontale : c’est un <b>liquide</b>.',
        'S’il remplit tout le récipient et se comprime : c’est un <b>gaz</b>.',
        'Pour une poudre, regarde un seul grain : il garde sa forme, c’est donc un solide.',
      ],
      exemples: [
        { q: 'Dans quel état est l’huile à 20 °C ?', r: 'Elle coule et prend la forme de la bouteille : <b>liquide</b>.' },
        { q: 'Lequel se comprime : l’air ou l’eau ?', r: '<b>L’air</b>, car c’est un gaz.' },
        { q: 'On verse 250 mL d’eau dans un bol. Quel volume d’eau dans le bol ?', r: 'Le volume ne change pas : <b>250 mL</b>.' },
      ],
      astuces: ['Un gaz est invisible la plupart du temps, mais c’est bien de la matière : un litre d’air a une masse d’environ 1,2 g.'],
      erreurs: [
        'Croire que le sable ou la farine sont des liquides parce qu’ils coulent.',
        'Croire que le volume d’un liquide change quand on le transvase : seule sa forme change.',
        'Confondre la vapeur d’eau (gaz invisible) avec la buée ou le « nuage » blanc (gouttelettes de liquide).',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        const [obj, st] = rng.pick(OBJETS);
        const extra = POUDRES.includes(obj) ? ' Une poudre peut couler, mais chaque grain est un petit solide qui garde sa forme.' : '';
        return Q(`pce1:${obj}`, `Dans quel état se trouve ${obj}, à température ambiante ?`, fixedChoice(['Solide', 'Liquide', 'Gaz'], cap(st)), 'Peut-on le saisir ? Prend-il la forme du récipient ? Remplit-il tout l’espace ?', `<b>${cap(st)}</b> : ${WHY_STATE[st]}.${extra}`);
      }
      if (level === 2) {
        if (rng.chance(0.6)) {
          const [p, ans] = rng.pick(PROPS);
          return Q(`pce2p:${p.slice(0, 20)}`, `Quel(s) état(s) de la matière ${p} ?`, fixedChoice(PROP_OPTS, ans), 'Pense à un caillou, à de l’eau et à l’air d’un ballon : lequel (ou lesquels) a cette propriété ?', `<b>${ans}</b>. Rappel : le solide a une forme et un volume propres ; le liquide a un volume propre mais prend la forme du récipient ; le gaz occupe tout l’espace et se comprime.`);
        }
        const n = rng.pick(NAMES), v = rng.pick([150, 200, 250, 330, 400, 500]);
        const [from, to] = rng.pick([['un verre', 'un bol'], ['une bouteille', 'une carafe'], ['un pichet', 'une assiette creuse'], ['une tasse', 'un saladier']]);
        return Q(`pce2v:${n}:${v}:${from}`, `${n} verse ${fmt(v)} mL d’eau d’${from} dans ${to}. Quel volume d’eau y a-t-il dans ${the(to)} (en mL) ?`, num(v, 'mL'), 'Quand on transvase un liquide, qu’est-ce qui change : sa forme ou son volume ?', `Un liquide prend la forme du récipient mais garde son volume propre : <b>${fmt(v)} mL</b>.`);
      }
      const [s, b, why] = rng.pick(ETATS_VF);
      return Q(`pce3:${s.slice(0, 24)}`, `Vrai ou faux ? « ${s} »`, vf(b), 'Rappelle-toi les propriétés de chaque état : forme propre, volume propre, compressibilité.', `<b>${b ? 'Vrai' : 'Faux'}</b>. ${why}`);
    },
  });

  // ===================== CHANGEMENTS D’ÉTAT =====================
  const CHGTS = [
    { n: 'la fusion', a: 'solide', b: 'liquide' },
    { n: 'la solidification', a: 'liquide', b: 'solide' },
    { n: 'la vaporisation', a: 'liquide', b: 'gaz' },
    { n: 'la liquéfaction', a: 'gaz', b: 'liquide' },
  ];
  const CH_OPTS = CHGTS.map(c => cap(c.n));
  const arrow = c => `${c.a} → ${c.b}`;
  const SITUATIONS = [
    ['La neige fond au soleil.', 0], ['Le chocolat fond dans la casserole.', 0], ['Le beurre fond dans la poêle chaude.', 0], ['La cire d’une bougie coule près de la flamme.', 0],
    ['Des glaçons se forment dans le congélateur.', 1], ['La lave d’un volcan refroidit et devient de la roche.', 1], ['Le métal liquide versé dans un moule durcit.', 1], ['Une flaque d’eau gèle pendant la nuit.', 1],
    ['Le linge mouillé sèche sur le fil.', 2], ['L’eau des pâtes bout dans la casserole.', 2], ['Une flaque d’eau disparaît au soleil.', 2], ['La sueur sèche sur la peau.', 2],
    ['De la buée se forme sur le miroir de la salle de bain.', 3], ['Des gouttes de rosée apparaissent sur l’herbe le matin.', 3], ['Un verre sorti du réfrigérateur se couvre de gouttelettes.', 3], ['Les lunettes de Noah s’embuent quand il entre dans la maison chaude.', 3],
  ];
  const EVAP = [
    ['Une flaque d’eau disparaît peu à peu au soleil.', 'evap'], ['Le linge sèche sur le fil à 20 °C.', 'evap'], ['Le parfum posé sur la peau disparaît.', 'evap'],
    ['De grosses bulles de vapeur se forment dans toute l’eau de la casserole à 100 °C.', 'ebul'], ['L’eau de la bouilloire bout.', 'ebul'], ['L’eau des pâtes bout à gros bouillons.', 'ebul'],
  ];
  const EV_OPTS = ['Une évaporation', 'Une ébullition', 'Une liquéfaction'];
  const SEQS = [
    ['Un glaçon à −10 °C est chauffé dans une casserole jusqu’à ce que l’eau bouille.', ['La glace se réchauffe jusqu’à 0 °C', 'La glace fond (fusion)', 'L’eau liquide se réchauffe jusqu’à 100 °C', 'L’eau bout (vaporisation)']],
    ['De la vapeur d’eau est refroidie jusqu’à −10 °C.', ['La vapeur se liquéfie (liquéfaction)', 'L’eau liquide refroidit jusqu’à 0 °C', 'L’eau se solidifie (solidification)', 'La glace refroidit jusqu’à −10 °C']],
    ['Léa fabrique des chocolats moulés.', ['Elle casse le chocolat solide en morceaux', 'Le chocolat fond au bain-marie (fusion)', 'Elle verse le chocolat liquide dans un moule', 'Le chocolat se solidifie au réfrigérateur (solidification)']],
    ['Le cycle de l’eau, à partir de la mer.', ['L’eau de mer se vaporise (évaporation)', 'La vapeur monte et se refroidit en altitude', 'Elle se liquéfie en gouttelettes : un nuage se forme', 'Les gouttes tombent en pluie']],
  ];

  M.notion('pc-changements-etat', {
    lesson: {
      retenir: `On appelle <b>changement d’état</b> le passage d’un état à un autre :<ul><li><b>fusion</b> : solide → liquide ; <b>solidification</b> : liquide → solide ;</li><li><b>vaporisation</b> : liquide → gaz ; <b>liquéfaction</b> : gaz → liquide.</li></ul>La vaporisation peut être lente, en surface, à toute température (<b>évaporation</b>), ou rapide, avec des bulles dans tout le liquide (<b>ébullition</b>). En chauffant, on va du solide vers le gaz ; en refroidissant, on fait le chemin inverse.`,
      methode: [
        'Repère l’état de départ et l’état d’arrivée.',
        'Nomme le changement : S → L fusion, L → S solidification, L → G vaporisation, G → L liquéfaction.',
        'Pour une vaporisation, cherche s’il y a des bulles dans tout le liquide (ébullition) ou non (évaporation).',
        'Souviens-toi : la vapeur d’eau est invisible ; la buée et les « nuages » sont de l’eau liquide.',
      ],
      exemples: [
        { q: 'Du beurre fond dans la poêle.', r: 'Solide → liquide : <b>fusion</b>.' },
        { q: 'De la buée apparaît sur une vitre froide.', r: 'La vapeur d’eau (gaz) devient liquide : <b>liquéfaction</b>.' },
        { q: 'Le linge sèche.', r: 'L’eau liquide devient gaz lentement : <b>vaporisation</b> (évaporation).' },
      ],
      astuces: [
        'Fusion et solidification sont inverses, comme vaporisation et liquéfaction.',
        'Pour aller plus loin : le passage direct solide → gaz s’appelle la sublimation (la neige carbonique), et gaz → solide la condensation (le givre).',
        'Dans la vie courante, on dit souvent « condensation » pour la buée ; en physique, c’est une liquéfaction.',
      ],
      erreurs: [
        'Confondre fusion et dissolution : le sucre ne « fond » pas dans le thé, il s’y dissout.',
        'Croire que l’eau doit bouillir pour se vaporiser : une flaque s’évapore à 20 °C.',
        'Croire que le nuage blanc au-dessus de la casserole est de la vapeur d’eau.',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        const i = rng.int(0, 3), c = CHGTS[i], mode = rng.int(0, 2);
        if (mode === 0) return Q(`pcc1n:${i}`, `Comment s’appelle le passage de l’état <b>${c.a}</b> à l’état <b>${c.b}</b> ?`, fixedChoice(CH_OPTS, cap(c.n)), 'Fusion, solidification, vaporisation, liquéfaction : lequel part de cet état ?', `${cap(arrow(c))} : c’est <b>${c.n}</b>.`);
        if (mode === 1) {
          const opts = ['solide → liquide', 'liquide → solide', 'liquide → gaz', 'gaz → liquide'];
          return Q(`pcc1t:${i}`, `${cap(c.n)}, c’est le passage…`, fixedChoice(opts, arrow(c)), 'Pense à un exemple de la vie courante qui porte ce nom.', `${cap(c.n)} : <b>${arrow(c)}</b>.`);
        }
        const inv = CHGTS[[1, 0, 3, 2][i]];
        return Q(`pcc1i:${i}`, `Quel est le changement d’état inverse de ${c.n} ?`, fixedChoice(CH_OPTS, cap(inv.n)), `Écris le passage d’état de ${c.n}, puis retourne la flèche.`, `${cap(c.n)} : ${arrow(c)}. L’inverse, ${arrow(inv)}, c’est <b>${inv.n}</b>.`);
      }
      if (level === 2) {
        const [s, i] = rng.pick(SITUATIONS), c = CHGTS[i];
        return Q(`pcc2:${s.slice(0, 28)}`, `${s} Quel changement d’état observe-t-on ?`, fixedChoice(CH_OPTS, cap(c.n)), 'Quel est l’état de la matière au début ? Et à la fin ?', `${cap(c.a)} → ${c.b} : <b>${c.n}</b>.${i === 3 ? ' C’est la vapeur d’eau de l’air, invisible, qui devient liquide au contact d’un objet froid.' : ''}`);
      }
      const r = rng.next();
      if (r < 0.45) {
        const [s, k] = rng.pick(EVAP), ans = k === 'evap' ? EV_OPTS[0] : EV_OPTS[1];
        return Q(`pcc3e:${s.slice(0, 24)}`, `${s} Cette vaporisation est-elle…`, fixedChoice(EV_OPTS, ans), 'Y a-t-il des bulles qui se forment dans tout le liquide ?', k === 'evap' ? `<b>${ans}</b> : la vaporisation est lente, se fait à la surface du liquide et sans bulles, à température ordinaire.` : `<b>${ans}</b> : la vaporisation est rapide, avec des bulles de vapeur dans tout le liquide (à 100 °C pour l’eau).`);
      }
      if (r < 0.8) {
        const [ctx, steps] = rng.pick(SEQS);
        return Q(`pcc3s:${ctx.slice(0, 20)}`, `${ctx} Range les étapes dans l’ordre.`, sequence(rng, steps, { label: 'les étapes', how: 'dans l’ordre chronologique' }), 'En chauffant : solide → liquide → gaz. En refroidissant : le chemin inverse.', `Dans l’ordre : <b>${steps.join(' → ')}</b>.`);
      }
      if (rng.chance(0.5)) {
        const ans = 'De minuscules gouttelettes d’eau liquide';
        return Q('pcc3n:nuage', 'Au-dessus d’une casserole d’eau qui bout, on voit un petit nuage blanc. De quoi est-il fait ?', choice(rng, ans, ['De la vapeur d’eau (un gaz)', 'De la fumée', 'De l’air chaud']), 'La vapeur d’eau est-elle visible ?', `<b>${ans}</b> : la vapeur d’eau, invisible, se liquéfie dès qu’elle rencontre l’air plus froid.`);
      }
      const ans = 'De la vapeur d’eau';
      return Q('pcc3b:bulles', 'Dans une casserole d’eau pure qui bout, de grosses bulles montent. Que contiennent-elles ?', choice(rng, ans, ['De l’air', 'Du dioxygène', 'Rien du tout (du vide)']), 'Quel changement d’état a lieu dans tout le liquide pendant l’ébullition ?', `<b>${ans}</b> : pendant l’ébullition, l’eau liquide se vaporise dans tout le liquide et forme des bulles de gaz.`);
    },
  });

  // ===================== TEMPÉRATURES DE FUSION ET D’ÉBULLITION =====================
  const SUBS = [
    { n: 'l’eau', f: 0, e: 100 }, { n: 'l’éthanol', f: -114, e: 78 }, { n: 'le mercure', f: -39, e: 357 },
    { n: 'le fer', f: 1538, e: 2862 }, { n: 'le plomb', f: 327, e: 1749 }, { n: 'l’acétone', f: -95, e: 56 },
    { n: 'le dioxygène', f: -218, e: -183 }, { n: 'le diazote', f: -210, e: -196 }, { n: 'l’aluminium', f: 660, e: 2519 }, { n: 'l’étain', f: 232, e: 2602 },
  ];
  const stateAt = (s, t) => (t < s.f ? 'solide' : t < s.e ? 'liquide' : 'gaz');
  const subTable = list => table([['Substance', 'Fusion (°C)', 'Ébullition (°C)'], ...list.map(s => [cap(s.n), s.f, s.e])]);
  const stateWhy = (s, t) => {
    const st = stateAt(s, t);
    if (st === 'solide') return `${deg(t)} est plus bas que la température de fusion (${deg(s.f)}) : ${s.n} est <b>solide</b>.`;
    if (st === 'gaz') return `${deg(t)} est plus haut que la température d’ébullition (${deg(s.e)}) : ${s.n} est à l’état de <b>gaz</b>.`;
    return `${deg(t)} est entre la température de fusion (${deg(s.f)}) et celle d’ébullition (${deg(s.e)}) : ${s.n} est <b>liquide</b>.`;
  };
  // A temperature (multiple of 5) where s is in state st, at least 3 °C away from the transitions.
  function tempIn(rng, s, st) {
    const lo = st === 'solide' ? s.f - 120 : st === 'liquide' ? s.f + 3 : s.e + 3;
    const hi = st === 'solide' ? s.f - 3 : st === 'liquide' ? s.e - 3 : s.e + 150;
    return 5 * rng.int(Math.ceil(lo / 5), Math.floor(hi / 5));
  }

  M.notion('pc-temperatures-etat', {
    lesson: {
      retenir: `Chaque corps pur change d’état à une température bien précise (sous la pression atmosphérique normale) : la <b>température de fusion</b> (c’est aussi celle de solidification) et la <b>température d’ébullition</b> (c’est aussi celle de liquéfaction). Pour l’eau : 0 °C et 100 °C.<ul><li>en dessous de la température de fusion, le corps est <b>solide</b> ;</li><li>entre les deux, il est <b>liquide</b> ;</li><li>au-dessus de la température d’ébullition, il est <b>gazeux</b>.</li></ul>`,
      methode: [
        'Lis dans le tableau la température de fusion et la température d’ébullition de la substance.',
        'Place la température donnée par rapport à ces deux valeurs (attention aux nombres négatifs : −50 est plus petit que −39).',
        'Plus froid que la fusion : solide ; entre les deux : liquide ; plus chaud que l’ébullition : gaz.',
      ],
      exemples: [
        { q: 'État de l’eau à −5 °C ?', r: '−5 &lt; 0 : <b>solide</b> (glace).' },
        { q: 'État de l’éthanol (fusion −114 °C, ébullition 78 °C) à 90 °C ?', r: '90 &gt; 78 : <b>gaz</b>.' },
        { q: 'Température de solidification du mercure (fusion −39 °C) ?', r: 'La même que la fusion : <b>−39 °C</b>.' },
      ],
      astuces: ['Dessine un axe vertical des températures : solide en bas, liquide au milieu, gaz en haut.', 'Un thermomètre à alcool sert pour les grands froids : l’éthanol reste liquide jusqu’à −114 °C, alors que le mercure gèle à −39 °C.'],
      erreurs: [
        'Croire que la température de solidification est différente de celle de fusion : c’est la même.',
        'Se tromper avec les nombres négatifs : −120 °C est plus froid que −114 °C.',
        'Croire que toutes les substances fondent à 0 °C et bouillent à 100 °C : ce sont les valeurs de l’eau.',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        if (rng.chance(0.2)) {
          const [q, v] = rng.pick([['fond la glace', 0], ['bout l’eau pure', 100], ['gèle l’eau pure', 0], ['la vapeur d’eau se liquéfie', 100]]);
          return Q(`pct1v:${q}`, `Sous la pression atmosphérique normale, à quelle température ${q} (en °C) ?`, num(v, '°C'), 'Ce sont les deux températures repères de l’échelle Celsius.', `L’eau pure fond (et gèle) à 0 °C et bout (et se liquéfie) à 100 °C : <b>${deg(v)}</b>.`);
        }
        const s = SUBS[0];
        let t; do t = 5 * rng.int(-6, 26); while (t === 0 || t === 100);
        return Q(`pct1:${t}`, `Dans quel état est l’eau pure à ${deg(t)} ?`, fixedChoice(STATES, cap(stateAt(s, t))), 'Compare cette température avec 0 °C (fusion) et 100 °C (ébullition).', stateWhy(s, t));
      }
      if (level === 2) {
        const s = rng.pick(SUBS.slice(1)), st = rng.pick(['solide', 'liquide', 'gaz']), t = tempIn(rng, s, st);
        return Q(`pct2:${s.n}:${t}`, `${subTable([s])}Dans quel état est ${s.n} à ${deg(t)} ?`, fixedChoice(STATES, cap(st)), 'Place la température entre la température de fusion et celle d’ébullition.', stateWhy(s, t));
      }
      const r = rng.next();
      if (r < 0.3) {
        const s = rng.pick(SUBS), liq = rng.chance(0.5);
        const v = liq ? s.e : s.f, what = liq ? 'liquéfaction' : 'solidification';
        return Q(`pct3s:${s.n}:${what}`, `${subTable([s])}Quelle est la température de ${what} ${de(s.n)} (en °C) ?`, num(v, '°C'), `La ${what} est l’inverse de quel changement d’état ?`, `La ${what} se fait à la même température que ${liq ? 'l’ébullition' : 'la fusion'} : <b>${deg(v)}</b>.`);
      }
      if (r < 0.6) {
        const list = rng.sample(SUBS, 4), t = rng.pick([-100, -50, -20, 20, 70, 90, 400, 1000]);
        const liquids = list.filter(s => stateAt(s, t) === 'liquide');
        if (liquids.length === 1) {
          const good = liquids[0];
          return Q(`pct3l:${list.map(s => s.n).join(',')}:${t}`, `${subTable(list)}Laquelle de ces substances est <b>liquide</b> à ${deg(t)} ?`, choice(rng, cap(good.n), list.filter(s => s !== good).map(s => cap(s.n))), 'Pour chaque substance, la température donnée doit être entre la fusion et l’ébullition.', `${stateWhy(good, t)} Les autres sont solides ou gazeuses à cette température : <b>${cap(good.n)}</b>.`);
        }
      }
      if (r < 0.8) {
        const s = rng.pick([SUBS[1], SUBS[2], SUBS[4], SUBS[5], SUBS[6], SUBS[7]]), v = s.e - s.f;
        return Q(`pct3d:${s.n}`, `${subTable([s])}Sur combien de degrés ${s.n} reste-t-il liquide ? (Calcule l’écart entre ses deux températures de changement d’état.)`, num(v, '°C'), 'Écart = température la plus haute − température la plus basse. Attention aux nombres négatifs.', `${fmt(s.e)} − (${fmt(s.f)}) = ${fmt(s.e)} + ${fmt(-s.f)} = <b>${fmt(v)}</b> °C.`);
      }
      const cold = rng.chance(0.5), t = cold ? rng.pick([-45, -50, -60, -80]) : rng.pick([90, 120, 150, 200]);
      const good = cold ? 'Le thermomètre à alcool' : 'Le thermomètre à mercure';
      return Q(`pct3t:${t}`, `${subTable([SUBS[1], SUBS[2]])}Un thermomètre à liquide ne marche que si son liquide reste liquide. Pour mesurer ${deg(t)}, lequel choisir : à alcool (éthanol) ou à mercure ?`, fixedChoice(['Le thermomètre à alcool', 'Le thermomètre à mercure', 'Les deux conviennent'], good), 'Dans quel état est chaque liquide à cette température ?', cold ? `À ${deg(t)}, le mercure est solide (il gèle à −39 °C) ; l’éthanol est encore liquide (jusqu’à −114 °C) : <b>${good.toLowerCase()}</b>.` : `À ${deg(t)}, l’éthanol est à l’état de gaz (il bout à 78 °C) ; le mercure est encore liquide (jusqu’à 357 °C) : <b>${good.toLowerCase()}</b>.`);
    },
  });

  // ===================== PALIER DE TEMPÉRATURE =====================
  const PUR_X = [{ n: 'l’eau', t: 0 }, { n: 'le gallium', t: 30 }, { n: 'l’acide stéarique', t: 70 }, { n: 'le naphtalène', t: 80 }];
  // Heating/cooling experiment. Pure substances show a plateau from t1 to t2 at tp.
  function experiment(rng, kind) {
    const t1 = rng.int(2, 5), d = rng.int(3, 8), t2 = t1 + d, tmax = t2 + rng.int(2, 4);
    if (kind === 'fusion-eau') {
      const a = rng.pick([-20, -10]), e = rng.pick([20, 30, 40]);
      return { kind, pts: [[0, a], [t1, 0], [t2, 0], [tmax, e]], g: { tmax, ymin: -20, ymax: 40, ystep: 10 }, pure: true, tp: 0, t1, t2, heat: true, what: 'de la glace sortie du congélateur', sub: 'l’eau', ch: 'la fusion', before: 'solide', mid: 'Solide et liquide en même temps' };
    }
    if (kind === 'solid-eau') {
      const a = rng.pick([10, 20, 30]), e = rng.pick([-10, -20]);
      return { kind, pts: [[0, a], [t1, 0], [t2, 0], [tmax, e]], g: { tmax, ymin: -20, ymax: 30, ystep: 10 }, pure: true, tp: 0, t1, t2, heat: false, what: 'de l’eau pure liquide (dans un mélange réfrigérant)', sub: 'l’eau', ch: 'la solidification', before: 'liquide', mid: 'Solide et liquide en même temps' };
    }
    if (kind === 'ebul-eau') {
      const a = rng.pick([20, 30, 40]);
      return { kind, pts: [[0, a], [t1, 100], [t2, 100]], g: { tmax: t2, ymin: 0, ymax: 120, ystep: 20 }, pure: true, tp: 100, t1, t2: null, heat: true, what: 'de l’eau pure liquide', sub: 'l’eau', ch: 'la vaporisation', before: 'liquide', mid: 'Liquide et gaz en même temps' };
    }
    if (kind === 'x') {
      const X = rng.pick(PUR_X.slice(1)), heat = rng.chance(0.5), hi = X.t + rng.pick([20, 30]), lo = X.t - rng.pick([20, 30]);
      const pts = heat ? [[0, lo], [t1, X.t], [t2, X.t], [tmax, hi]] : [[0, hi], [t1, X.t], [t2, X.t], [tmax, lo]];
      return { kind, X, pts, g: { tmax, ymin: lo - 10, ymax: hi + 10, ystep: 10 }, pure: true, tp: X.t, t1, t2, heat, what: heat ? `du ${X.n.replace(/^(le |l’)/, '')} solide`.replace('du acide', 'de l’acide') : `du ${X.n.replace(/^(le |l’)/, '')} liquide`.replace('du acide', 'de l’acide'), sub: X.n, ch: heat ? 'la fusion' : 'la solidification', before: heat ? 'solide' : 'liquide', mid: 'Solide et liquide en même temps' };
    }
    if (kind === 'sale') {
      const a = rng.pick([10, 20]), s = rng.pick([-2, -4]), e2 = s - rng.pick([4, 6, 8]);
      return { kind, pts: [[0, a], [t1, s], [t2, e2], [tmax, -20]], g: { tmax, ymin: -20, ymax: 20, ystep: 10 }, pure: false, start: s, heat: false, what: 'de l’eau salée', sub: 'l’eau salée' };
    }
    const s = rng.pick([45, 50]), e2 = s + rng.pick([8, 10]);
    return { kind, pts: [[0, 20], [t1, s], [t2, e2], [tmax, 90]], g: { tmax, ymin: 10, ymax: 100, ystep: 10 }, pure: false, start: s, heat: true, what: 'de la cire de bougie', sub: 'la cire' };
  }
  const expIntro = x => `${x.heat ? 'On chauffe' : 'On laisse refroidir'} ${x.what} et on relève sa température au cours du temps.${courbe(x.pts, x.g, `Courbe de la température en fonction du temps : ${ptsText(x.pts)}`)}Points remarquables de la courbe : ${ptsText(x.pts)}. `;
  const expKey = x => x.pts.map(p => p.join('/')).join(';');

  M.notion('pc-palier', {
    lesson: {
      retenir: `Pendant le changement d’état d’un <b>corps pur</b>, la température reste <b>constante</b> : la courbe présente un <b>palier</b> (une partie horizontale), même si on continue à chauffer ou à refroidir. Pendant le palier, les deux états coexistent (par exemple glace et eau liquide à 0 °C).<br>Un <b>mélange</b> (eau salée, cire de bougie…) change d’état sans palier : sa température continue à varier.`,
      explication: `<p>Voici la courbe obtenue en chauffant de la glace à −20 °C :</p>${courbe([[0, -20], [3, 0], [8, 0], [11, 30]], { tmax: 11, ymin: -20, ymax: 40, ystep: 10 }, 'Courbe de chauffage de la glace : de −20 °C à 0 °C en 3 min, palier à 0 °C de 3 à 8 min, puis montée jusqu’à 30 °C')}<p>De 3 à 8 min, la température reste à 0 °C : c’est le <b>palier de fusion</b>. La glace fond, et toute l’énergie reçue sert à faire fondre la glace au lieu de la réchauffer. Durée du palier : 8 − 3 = 5 min.</p>`,
      methode: [
        'Cherche sur la courbe une partie <b>horizontale</b> : s’il y en a une, c’est un corps pur.',
        'Lis la température du palier sur l’axe vertical : c’est la température de changement d’état.',
        'Lis le début et la fin du palier sur l’axe horizontal ; la durée du palier, c’est fin − début.',
        'Avant le palier, le corps est dans l’état de départ ; après, dans l’état d’arrivée ; pendant, les deux à la fois.',
      ],
      exemples: [
        { q: 'Palier à 0 °C de 4 min à 9 min en chauffant de la glace : durée ?', r: '9 − 4 = <b>5 min</b>.' },
        { q: 'On refroidit de l’eau salée : pas de partie horizontale.', r: 'C’est un <b>mélange</b>.' },
        { q: 'Palier à 70 °C en refroidissant un liquide : changement d’état ?', r: 'Liquide → solide : <b>solidification à 70 °C</b>.' },
      ],
      astuces: ['La température du palier permet d’identifier un corps pur : c’est comme une carte d’identité.'],
      erreurs: [
        'Croire que pendant le palier on ne chauffe plus : on chauffe toujours, mais l’énergie sert au changement d’état.',
        'Lire la durée du palier à partir de 0 au lieu de faire fin − début.',
        'Croire que l’eau salée gèle à 0 °C : elle commence à geler plus bas, et sans palier.',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        const x = experiment(rng, rng.pick(['fusion-eau', 'solid-eau', 'ebul-eau', 'x', 'x', 'sale', 'cire']));
        const r = rng.next();
        if (r < 0.35) return Q(`pcp1a:${x.kind}:${expKey(x)}`, `${expIntro(x)}La courbe présente-t-elle un palier (une partie horizontale) ?`, yesNo(x.pure), 'Cherche une partie de la courbe où la température ne change pas pendant plusieurs minutes.', x.pure ? `<b>Oui</b> : la température reste à ${deg(x.tp)} pendant un moment.` : '<b>Non</b> : la température change tout le temps ; elle varie seulement moins vite pendant le changement d’état.');
        if (r < 0.7 || !x.pure) return Q(`pcp1b:${x.kind}:${expKey(x)}`, `${expIntro(x)}D’après cette courbe, ${x.sub} est-${/^(la |l’e)/.test(x.sub) ? 'elle' : 'il'} un corps pur ou un mélange ?`, fixedChoice(['Un corps pur', 'Un mélange'], x.pure ? 'Un corps pur' : 'Un mélange'), 'Un corps pur change d’état à température constante.', x.pure ? `Il y a un palier à ${deg(x.tp)} : c’est <b>un corps pur</b>.` : 'Il n’y a pas de palier : c’est <b>un mélange</b>.');
        return Q(`pcp1c:${x.kind}:${expKey(x)}`, `${expIntro(x)}Pendant le palier, dans quel état est ${x.sub} ?`, fixedChoice(['Solide uniquement', 'Liquide uniquement', 'Solide et liquide en même temps', 'Liquide et gaz en même temps'], x.mid), 'Pendant le palier, le changement d’état est en train de se faire.', `Pendant ${x.ch}, les deux états coexistent : <b>${x.mid.toLowerCase()}</b>.`);
      }
      if (level === 2) {
        const x = experiment(rng, rng.pick(['fusion-eau', 'solid-eau', 'ebul-eau', 'x', 'x']));
        const r = rng.next();
        if (r < 0.35 || (r < 0.65 && !x.t2)) return Q(`pcp2t:${x.kind}:${expKey(x)}`, `${expIntro(x)}À quelle température se produit le changement d’état (en °C) ?`, num(x.tp, '°C'), 'Repère la partie horizontale et lis sa hauteur sur l’axe des températures.', `Le palier est à <b>${deg(x.tp)}</b> : c’est la température de ${x.ch.replace('la ', '')} ${de(x.sub)}.`);
        if (r < 0.65) return Q(`pcp2d:${x.kind}:${expKey(x)}`, `${expIntro(x)}Combien de temps dure le palier (en min) ?`, num(x.t2 - x.t1, 'min'), 'Lis l’instant où le palier commence et celui où il se termine.', `Le palier commence à ${x.t1} min et se termine à ${x.t2} min : ${x.t2} − ${x.t1} = <b>${fmt(x.t2 - x.t1)}</b> min.`);
        if (r < 0.85) return Q(`pcp2c:${x.kind}:${expKey(x)}`, `${expIntro(x)}Quel changement d’état se produit pendant le palier ?`, fixedChoice(CH_OPTS, cap(x.ch)), 'Chauffe-t-on ou refroidit-on ? Dans quel état est la substance au départ ?', `On ${x.heat ? 'chauffe' : 'refroidit'} ${x.sub} ${x.before} : c’est <b>${x.ch}</b>.`);
        return Q(`pcp2b:${x.kind}:${expKey(x)}`, `${expIntro(x)}Dans quel état est ${x.sub} au début de l’expérience (avant le palier) ?`, fixedChoice(STATES, cap(x.before)), 'Avant le palier, le changement d’état n’a pas encore commencé.', `Au début, ${x.sub} est <b>${x.before}</b> ; le palier correspond à ${x.ch}.`);
      }
      const r = rng.next();
      if (r < 0.35) {
        const x = experiment(rng, rng.pick(['x', 'x', 'fusion-eau', 'solid-eau']));
        const tbl = table([['Corps pur', ...PUR_X.map(p => cap(p.n))], ['Fusion (°C)', ...PUR_X.map(p => p.t)]], { head: false });
        x.what = x.heat ? 'un corps pur solide inconnu' : 'un corps pur liquide inconnu';
        return Q(`pcp3i:${x.kind}:${expKey(x)}`, `${expIntro(x)}${tbl}Quel est ce corps pur ?`, choice(rng, cap(x.sub), PUR_X.filter(p => p.n !== x.sub).map(p => cap(p.n))), 'Lis la température du palier et compare-la avec le tableau.', `Le palier est à ${deg(x.tp)} : c’est la température de fusion (ou de solidification) de <b>${x.sub}</b>.`);
      }
      if (r < 0.6) {
        const x = experiment(rng, 'sale');
        return Q(`pcp3s:${expKey(x)}`, `${expIntro(x)}À partir de quelle température la courbe change-t-elle de pente (début de la solidification), en °C ?`, num(x.start, '°C'), 'Cherche le point où la courbe commence à descendre moins vite.', `La pente change à <b>${deg(x.start)}</b> : l’eau salée commence à geler en dessous de 0 °C, et sans palier, car c’est un mélange.`);
      }
      if (r < 0.85) {
        const x = experiment(rng, rng.pick(['fusion-eau', 'solid-eau', 'x', 'sale']));
        const [a, e] = [x.pts[0][1], x.pts[x.pts.length - 1][1]], v = Math.abs(e - a);
        return Q(`pcp3v:${x.kind}:${expKey(x)}`, `${expIntro(x)}De combien de degrés la température a-t-elle ${e > a ? 'augmenté' : 'baissé'} entre le début et la fin de l’expérience ?`, num(v, '°C'), 'Fais la différence entre la plus grande et la plus petite des deux températures (attention aux nombres négatifs).', `Elle passe de ${deg(a)} à ${deg(e)} : ${fmt(Math.max(a, e))} − (${fmt(Math.min(a, e))}) = <b>${fmt(v)}</b> °C.`);
      }
      const x = experiment(rng, rng.pick(['fusion-eau', 'x', 'ebul-eau'])), ans = 'Elle sert à faire changer d’état la substance';
      return Q(`pcp3e:${x.kind}:${expKey(x)}`, `${expIntro(x)}Pendant le palier, on continue à chauffer, pourtant la température ne monte pas. Que devient l’énergie reçue ?`, choice(rng, ans, ['Elle est perdue : le chauffage ne marche plus', 'Elle fait baisser la masse de la substance', 'Elle s’accumule et la température montera d’un coup']), 'Que se passe-t-il pour la substance pendant le palier ?', `<b>${ans}</b> (${x.ch}) ; quand le changement d’état est terminé, la température recommence à monter.`);
    },
  });

  // ===================== CONSERVATION DE LA MASSE =====================
  M.notion('pc-conservation-masse', {
    lesson: {
      retenir: `Au cours d’un changement d’état, la <b>masse se conserve</b> : 50 g de glace donnent 50 g d’eau liquide. En revanche, le <b>volume change</b> : pour l’eau, 1 L d’eau liquide donne environ <b>1,1 L de glace</b> (la glace prend plus de place). C’est pourquoi une bouteille pleine d’eau peut éclater au congélateur.`,
      methode: [
        'Pour une masse : la masse après le changement d’état est la même qu’avant (si rien ne s’échappe).',
        'Pour une balance : additionne la masse du récipient et celle de la substance ; le total ne change pas.',
        'Pour le volume de la glace : multiplie le volume d’eau par 1,1 (environ).',
        'Si le récipient est ouvert et que de la vapeur s’échappe, la masse qui reste diminue : la différence est la masse de vapeur partie.',
      ],
      exemples: [
        { q: 'Un glaçon de 30 g fond. Masse d’eau obtenue ?', r: '<b>30 g</b>.' },
        { q: 'On fait geler 2 L d’eau. Volume de glace ?', r: '2 × 1,1 = <b>2,2 L</b>.' },
        { q: 'Bécher (100 g) + glaçons (40 g) : la balance affiche 140 g. Après la fusion ?', r: 'Toujours <b>140 g</b>.' },
      ],
      astuces: ['L’eau est une exception : la plupart des substances prennent moins de place à l’état solide qu’à l’état liquide.', '1 L d’eau liquide a une masse de 1 kg ; 1 L de glace a une masse plus faible (environ 0,92 kg), c’est pour ça que la glace flotte.'],
      erreurs: [
        'Croire que la glace est plus lourde que l’eau qui l’a formée parce qu’elle prend plus de place.',
        'Croire que la masse change quand le volume change.',
        'Oublier la masse du récipient sur la balance.',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        if (rng.chance(0.55)) {
          const n = rng.pick(NAMES), m = rng.int(12, 60), [obj, res] = rng.pick([['un glaçon', 'd’eau liquide'], ['un carré de chocolat', 'de chocolat fondu'], ['un morceau de beurre', 'de beurre fondu'], ['un bloc de glace', 'd’eau liquide']]);
          return Q(`pcm1:${n}:${m}:${obj}`, `${n} pèse ${obj} : ${fmt(m)} g. Il fond complètement dans un récipient fermé. Quelle masse ${res} obtient-on (en g) ?`, num(m, 'g'), 'Lors d’un changement d’état, que devient la masse ?', `La masse se conserve lors d’un changement d’état : <b>${fmt(m)}</b> g.`);
        }
        const [sit, q, ans, why] = rng.pick([
          ['Un glaçon fond.', 'sa masse', 'Elle reste la même', 'La masse se conserve lors d’un changement d’état.'],
          ['De l’eau gèle au congélateur.', 'sa masse', 'Elle reste la même', 'La masse se conserve lors d’un changement d’état.'],
          ['De l’eau gèle au congélateur.', 'son volume', 'Il augmente', 'L’eau prend plus de place à l’état solide : 1 L d’eau donne environ 1,1 L de glace.'],
          ['Un glaçon fond.', 'son volume', 'Il diminue', 'La glace prend plus de place que l’eau liquide : en fondant, le volume diminue.'],
          ['Du chocolat fond au bain-marie.', 'sa masse', 'Elle reste la même', 'La masse se conserve lors d’un changement d’état.'],
          ['De la cire liquide se solidifie.', 'sa masse', 'Elle reste la même', 'La masse se conserve lors d’un changement d’état.'],
        ]);
        const opts = q === 'sa masse' ? ['Elle augmente', 'Elle diminue', 'Elle reste la même'] : ['Il augmente', 'Il diminue', 'Il reste le même'];
        return Q(`pcm1c:${sit}:${q}`, `${sit} Que devient ${q} ?`, fixedChoice(opts, ans), 'Distingue bien la masse (ce que mesure la balance) et le volume (la place occupée).', `<b>${ans}</b>. ${why}`);
      }
      if (level === 2) {
        const r = rng.next();
        if (r < 0.35) {
          const b = 5 * rng.int(16, 40), g = rng.int(15, 80), [cont, obj] = rng.pick([['un bécher', 'des glaçons'], ['un bocal fermé', 'de la glace pilée'], ['un flacon bouché', 'un glaçon']]);
          return Q(`pcm2b:${b}:${g}:${cont}`, `On pose sur une balance ${cont} de ${fmt(b)} g contenant ${obj} de ${fmt(g)} g. Que affiche la balance quand toute la glace a fondu (en g) ?`.replace('Que affiche', 'Qu’affiche'), num(b + g, 'g'), 'Calcule la masse totale au départ. Change-t-elle pendant la fusion ?', `Au départ : ${fmt(b)} + ${fmt(g)} = ${fmt(b + g)} g. La masse se conserve pendant la fusion : la balance affiche toujours <b>${fmt(b + g)}</b> g.`);
        }
        if (r < 0.7) {
          const v = rng.pick([1, 2, 3, 4, 5, 6, 10, 20, 0.5, 1.5, 2.5]), ice = mul(v, 1.1);
          return Q(`pcm2v:${v}`, `On sait que 1 L d’eau liquide donne environ 1,1 L de glace. Quel volume de glace obtient-on en faisant geler ${fmt(v)} L d’eau (en L) ?`, num(ice, 'L'), 'Le volume de glace est proportionnel au volume d’eau : cherche par combien multiplier.', `${fmt(v)} × 1,1 = <b>${fmt(ice)}</b> L de glace (la masse, elle, ne change pas).`);
        }
        const v = rng.pick([0.5, 1, 1.5, 2, 2.5, 3, 5, 8]);
        return Q(`pcm2m:${v}`, `1 L d’eau liquide a une masse de 1 kg. On fait geler ${fmt(v)} L d’eau. Quelle est la masse de la glace obtenue (en kg) ?`, num(v, 'kg'), 'La masse change-t-elle lors de la solidification ?', `${fmt(v)} L d’eau ont une masse de ${fmt(v)} kg ; la masse se conserve : <b>${fmt(v)}</b> kg de glace (même si son volume est plus grand).`);
      }
      const r = rng.next();
      if (r < 0.3) {
        const w = rng.pick([1, 2, 3, 5, 10, 0.5, 1.5, 4]), ice = mul(w, 1.1);
        return Q(`pcm3r:${w}`, `1 L d’eau liquide donne environ 1,1 L de glace. Inès veut obtenir ${fmt(ice)} L de glace. Quel volume d’eau doit-elle faire geler (en L) ?`, num(w, 'L'), 'Ici on connaît le volume de glace : fais l’opération inverse de la multiplication.', `${fmt(ice)} ÷ 1,1 = <b>${fmt(w)}</b> L d’eau. Vérification : ${fmt(w)} × 1,1 = ${fmt(ice)}.`);
      }
      if (r < 0.55) {
        const m0 = 50 * rng.int(4, 10), lost = 10 * rng.int(2, 9), m1 = m0 - lost;
        return Q(`pcm3o:${m0}:${lost}`, `Hugo fait bouillir ${fmt(m0)} g d’eau dans une casserole <b>sans couvercle</b>. Après un moment, il reste ${fmt(m1)} g d’eau. Quelle masse d’eau est partie sous forme de vapeur (en g) ?`, num(lost, 'g'), 'L’eau n’a pas disparu : elle a changé d’état et s’est échappée dans l’air.', `${fmt(m0)} − ${fmt(m1)} = <b>${fmt(lost)}</b> g d’eau sont partis sous forme de vapeur. La masse totale (eau liquide + vapeur) s’est conservée.`);
      }
      if (r < 0.8) {
        const v = rng.pick([1, 2, 3, 5, 10, 4]), d = mul(v, 0.1);
        return Q(`pcm3d:${v}`, `1 L d’eau liquide donne environ 1,1 L de glace. De combien de litres le volume augmente-t-il quand ${fmt(v)} L d’eau gèlent ?`, num(d, 'L'), 'Calcule d’abord le volume de glace, puis compare avec le volume d’eau.', `Volume de glace : ${fmt(v)} × 1,1 = ${fmt(mul(v, 1.1))} L. Augmentation : ${fmt(mul(v, 1.1))} − ${fmt(v)} = <b>${fmt(d)}</b> L.`);
      }
      const [q, ans, ds, why] = rng.pick([
        ['Une bouteille en verre pleine d’eau et bien fermée éclate au congélateur. Pourquoi ?', 'Le volume de l’eau augmente quand elle gèle', ['La masse de l’eau augmente quand elle gèle', 'Le froid fait grossir le verre', 'L’eau se transforme en gaz'], 'La glace prend environ 10 % de place en plus que l’eau liquide ; la masse, elle, ne change pas.'],
        ['Un flacon bouché contient un peu d’eau. On le chauffe jusqu’à ce que toute l’eau se vaporise. La masse du flacon bouché…', 'reste la même', ['diminue, car le gaz ne pèse rien', 'augmente, car le gaz prend plus de place', 'devient nulle'], 'Le flacon est fermé : rien ne s’échappe, et la masse se conserve lors d’un changement d’état.'],
        ['Un glaçon flotte dans un verre d’eau fermé posé sur une balance. Quand le glaçon a fondu, la balance indique…', 'la même masse', ['une masse plus grande', 'une masse plus petite'], 'Rien n’entre ni ne sort : la masse se conserve pendant la fusion.'],
      ]);
      return Q(`pcm3c:${q.slice(0, 20)}`, q, choice(rng, ans, ds), 'Distingue ce qui change (le volume) de ce qui se conserve (la masse).', `<b>${cap(ans)}</b>. ${why}`);
    },
  });

  // ===================== MODÈLE PARTICULAIRE =====================
  const WHY_MODEL = [
    ['Pourquoi un gaz se comprime-t-il facilement ?', 'Ses particules sont éloignées : on peut les rapprocher', ['Ses particules rétrécissent quand on appuie', 'Des particules sortent du récipient', 'Ses particules sont collées les unes aux autres']],
    ['Pourquoi un solide garde-t-il sa forme ?', 'Ses particules sont liées et rangées : elles ne font que vibrer sur place', ['Ses particules sont immobiles et éloignées', 'Ses particules sont plus grosses', 'Ses particules sont collées mais glissent les unes sur les autres']],
    ['Pourquoi un liquide coule-t-il et prend-il la forme du récipient ?', 'Ses particules sont collées mais peuvent glisser les unes sur les autres', ['Ses particules sont éloignées les unes des autres', 'Ses particules sont rangées en rangs réguliers', 'Ses particules sont plus petites que celles du solide']],
    ['Pourquoi la masse se conserve-t-elle lors de la fusion de la glace ?', 'Le nombre de particules ne change pas', ['Les particules deviennent plus légères', 'Les particules fondent', 'De nouvelles particules apparaissent']],
    ['Pourquoi un liquide est-il presque incompressible ?', 'Ses particules sont déjà collées les unes aux autres', ['Ses particules sont rangées en rangs réguliers', 'Ses particules sont très éloignées', 'Ses particules ne bougent pas']],
    ['Pourquoi un gaz occupe-t-il tout le récipient ?', 'Ses particules se déplacent dans tous les sens et s’éloignent les unes des autres', ['Ses particules gonflent', 'Ses particules sont collées aux parois', 'Ses particules sont rangées']],
  ];
  const MODEL_VF = [
    ['Quand la glace fond, ses particules fondent.', false, 'Les particules ne changent pas : c’est leur <b>disposition</b> qui change (elles se mettent en désordre).'],
    ['Quand on chauffe un gaz, ses particules grossissent.', false, 'Les particules gardent la même taille ; elles bougent plus vite.'],
    ['Entre les particules d’un gaz, il y a de l’air.', false, 'L’air est lui-même fait de particules : entre les particules, il n’y a <b>rien</b> (du vide).'],
    ['Les particules d’un solide sont complètement immobiles.', false, 'Elles restent à leur place mais <b>vibrent</b> sur place.'],
    ['Lors de la vaporisation de l’eau dans un flacon fermé, le nombre de particules reste le même.', true, 'Les particules s’éloignent les unes des autres, mais aucune ne disparaît : c’est pour ça que la masse se conserve.'],
    ['Les particules de la glace, de l’eau liquide et de la vapeur d’eau sont les mêmes.', true, 'Ce sont les mêmes particules d’eau ; seules leur disposition et leur agitation changent.'],
    ['Dans un liquide, les particules sont éloignées les unes des autres.', false, 'Dans un liquide, les particules sont <b>collées</b> les unes aux autres, mais en désordre.'],
    ['Quand on comprime l’air d’une seringue bouchée, les particules se rapprochent.', true, 'Le nombre de particules ne change pas, mais elles disposent de moins de place.'],
  ];

  M.notion('pc-modele-particulaire', {
    lesson: {
      retenir: `La matière est faite de minuscules <b>particules</b>, invisibles même au microscope ordinaire. On modélise chaque état ainsi :<ul><li><b>solide</b> : particules <b>collées et rangées</b>, qui vibrent sur place ;</li><li><b>liquide</b> : particules <b>collées mais en désordre</b>, qui glissent les unes sur les autres ;</li><li><b>gaz</b> : particules <b>éloignées et en désordre</b>, qui se déplacent dans tous les sens (entre elles : du vide).</li></ul>Lors d’un changement d’état, le <b>nombre de particules ne change pas</b> : c’est pour ça que la masse se conserve.`,
      explication: `<p>Les trois états de l’eau vus « avec des lunettes magiques » :</p><div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center">${particles('solide', 1)}${particles('liquide', 1)}${particles('gaz', 1)}</div><p>De gauche à droite : glace (rangée), eau liquide (en vrac au fond), vapeur (dispersée). Ce sont <b>les mêmes particules</b> : seule leur disposition change.</p>`,
      methode: [
        'Regarde si les particules se touchent : non → gaz.',
        'Si elles se touchent, regarde si elles sont rangées : oui → solide ; non → liquide.',
        'Pour expliquer une propriété, relie-la à la disposition des particules (éloignées → compressible ; collées → volume propre).',
        'Lors d’un changement d’état, garde le même nombre de particules dans ton dessin.',
      ],
      exemples: [
        { q: 'Particules éloignées et en désordre :', r: '<b>gaz</b>.' },
        { q: 'Pourquoi peut-on comprimer l’air ?', r: 'Ses particules sont <b>éloignées</b> : on peut les rapprocher.' },
        { q: '12 particules de glace fondent. Combien de particules d’eau liquide ?', r: '<b>12</b>.' },
      ],
      astuces: ['Dessin d’un liquide : les particules restent au fond du récipient, collées, avec une surface horizontale.'],
      erreurs: [
        'Croire que les particules elles-mêmes fondent, grossissent ou changent de forme.',
        'Croire qu’il y a de l’air entre les particules d’un gaz.',
        'Dessiner moins de particules après une vaporisation : leur nombre se conserve.',
      ],
    },
    generate(level, rng) {
      const STS = ['solide', 'liquide', 'gaz'];
      if (level === 1) {
        if (rng.chance(0.6)) {
          const st = rng.pick(STS), seed = rng.int(1, 4);
          return Q(`pmp1:${st}:${seed}`, `${particles(st, seed)}Ce schéma montre ${STATE_DESC[st]}. Quel état de la matière représente-t-il ?`, fixedChoice(STATES, cap(st)), 'Les particules se touchent-elles ? Sont-elles rangées ?', `<b>${cap(st)}</b> : ${STATE_DESC[st].replace('des particules', 'particules')}.`);
        }
        const [d, st] = rng.pick([['éloignées les unes des autres', 'gaz'], ['collées et rangées régulièrement', 'solide'], ['collées mais en désordre', 'liquide'], ['en mouvement dans tous les sens, avec du vide entre elles', 'gaz'], ['qui vibrent sur place sans changer de voisines', 'solide'], ['qui glissent les unes sur les autres', 'liquide']]);
        return Q(`pmp1d:${d.slice(0, 14)}`, `Dans quel état les particules sont-elles ${d} ?`, fixedChoice(STATES, cap(st)), 'Pense à la glace, à l’eau liquide et à la vapeur d’eau.', `<b>${cap(st)}</b>.`);
      }
      if (level === 2) {
        if (rng.chance(0.55)) {
          const [what, st] = rng.pick([['de l’eau liquide', 'liquide'], ['de la vapeur d’eau', 'gaz'], ['un morceau de glace', 'solide'], ['de l’huile', 'liquide'], ['l’air d’un ballon', 'gaz'], ['un clou en fer', 'solide'], ['du dioxygène', 'gaz'], ['du jus de pomme', 'liquide']]);
          const seed = rng.int(1, 3);
          const opts = STS.map(s => particles(s, seed));
          return Q(`pmp2p:${what}:${seed}`, `Quel schéma représente ${what} ? (Un schéma montre des particules rangées et collées, un autre des particules collées en désordre au fond, le dernier des particules éloignées.)`, choice(rng, opts[STS.indexOf(st)], opts.filter((_, i) => STS[i] !== st)), `Dans quel état est ${what} ? Puis rappelle-toi la disposition des particules dans cet état.`, `${cap(what)} est à l’état ${st === 'gaz' ? 'de gaz' : st} : il faut le schéma avec <b>${STATE_DESC[st]}</b>.`);
        }
        const [q, ans, ds] = rng.pick(WHY_MODEL);
        return Q(`pmp2w:${q.slice(0, 24)}`, q, choice(rng, ans, ds), 'Utilise le modèle : particules collées ou éloignées ? Rangées ou en désordre ?', `<b>${ans}</b>.`);
      }
      if (rng.chance(0.45)) {
        const n = rng.int(5, 9), [ctx, after] = rng.pick([['On enfonce le piston d’une seringue bouchée', 'après la compression'], ['On chauffe le flacon fermé', 'après le chauffage'], ['On refroidit le flacon fermé jusqu’à ce que le gaz se liquéfie', 'après la liquéfaction'], ['On laisse le flacon fermé au soleil', 'une heure plus tard']]);
        return Q(`pmp3n:${n}:${ctx.slice(0, 16)}`, `${particles('gaz', n, n)}Ce récipient fermé contient ${n} particules de gaz. ${ctx}. Combien de particules contient-il ${after} ?`, num(n), 'Une particule peut-elle disparaître ou apparaître si le récipient est fermé ?', `Rien n’entre ni ne sort : le nombre de particules se conserve. Il y en a toujours <b>${fmt(n)}</b> (c’est pour ça que la masse se conserve).`);
      }
      const [s, b, why] = rng.pick(MODEL_VF);
      return Q(`pmp3:${s.slice(0, 24)}`, `Vrai ou faux ? « ${s} »`, vf(b), 'Dans le modèle, les particules ne changent jamais : seules leur disposition et leur agitation changent.', `<b>${b ? 'Vrai' : 'Faux'}</b>. ${why}`);
    },
  });

  // ===================== ÉPROUVETTE GRADUÉE =====================
  // A volume readable on a cylinder with small graduation `step` (never on a numbered mark).
  function volOn(rng, step) {
    const L = 10 * step;
    let V; do V = step * rng.int(11, 47); while (V % L === 0);
    return V;
  }
  const OBJS_V = ['un caillou', 'une clé', 'une figurine', 'un écrou', 'une bille de verre', 'un morceau de pâte à modeler', 'une petite statuette', 'un dé en métal'];

  M.notion('pc-lire-eprouvette', {
    lesson: {
      retenir: `On mesure le volume d’un liquide avec une <b>éprouvette graduée</b>, posée sur une table horizontale. La surface du liquide est un peu creusée : c’est le <b>ménisque</b>. On lit le volume <b>au bas du ménisque</b>, l’œil à sa hauteur.<br>Le volume d’un solide qui coule s’obtient par <b>déplacement d’eau</b> : V<sub>solide</sub> = V<sub>2</sub> − V<sub>1</sub> (niveau avec le solide − niveau sans).<br>Unités : <b>1 mL = 1 cm³</b> ; 1 L = 1 000 mL = 1 000 cm³ = 1 dm³ ; 1 cL = 10 mL.`,
      explication: `<p>Sur cette éprouvette, il y a 10 petites graduations entre deux traits numérotés (de 10 en 10 mL) : une graduation vaut 10 ÷ 10 = 1 mL.</p>${eprouvette(23, 1)}<p>Le bas du ménisque est 3 graduations au-dessus du trait 20 mL : V = 20 + 3 × 1 = <b>23 mL</b>.</p>`,
      methode: [
        'Trouve la valeur d’une petite graduation : écart entre deux traits numérotés ÷ nombre d’intervalles.',
        'Place ton œil à la hauteur du liquide et repère le <b>bas du ménisque</b>.',
        'Pars du trait numéroté juste en dessous et ajoute le nombre de petites graduations × leur valeur.',
        'Pour un solide : lis V<sub>1</sub> sans le solide, V<sub>2</sub> avec le solide, puis calcule V<sub>2</sub> − V<sub>1</sub>.',
      ],
      exemples: [
        { q: 'Traits de 20 en 20 mL, 10 intervalles entre deux traits : valeur d’une graduation ?', r: '20 ÷ 10 = <b>2 mL</b>.' },
        { q: 'Eau : 60 mL. Avec un caillou : 74 mL. Volume du caillou ?', r: '74 − 60 = <b>14 mL</b>, soit 14 cm³.' },
        { q: '0,25 L en mL ?', r: '0,25 × 1 000 = <b>250 mL</b>.' },
      ],
      astuces: ['Un millilitre et un centimètre cube, c’est exactement la même chose : un petit cube de 1 cm de côté.'],
      erreurs: [
        'Lire le haut du ménisque (sur les bords) au lieu du bas.',
        'Croire qu’une petite graduation vaut toujours 1 mL.',
        'Donner V<sub>2</sub> comme volume du solide en oubliant de retirer le volume d’eau V<sub>1</sub>.',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        const r = rng.next();
        if (r < 0.55) {
          const step = rng.pick([1, 1, 2]), V = volOn(rng, step);
          return Q(`pcl1r:${step}:${V}`, `${eprouvette(V, step)}${eprouvetteText(V, step)} Quel volume de liquide contient l’éprouvette (en mL) ?`, num(V, 'mL'), 'Trouve d’abord ce que vaut une petite graduation, puis pars du trait numéroté juste en dessous du ménisque.', `Une graduation vaut ${fmt(10 * step)} ÷ 10 = ${fmt(step)} mL. ${cap(eprouvetteText(V, step).split(' ; ')[1].replace(/\.$/, ''))} : V = <b>${fmt(V)}</b> mL.`);
        }
        if (r < 0.8) {
          const [L, n] = rng.pick([[10, 10], [10, 5], [20, 10], [20, 5], [50, 10], [50, 5], [100, 10], [100, 5], [5, 10], [25, 5]]), a = L * rng.int(1, 4), s = div(L, n);
          return Q(`pcl1g:${L}:${n}:${a}`, `Sur une éprouvette, entre le trait ${fmt(a)} mL et le trait ${fmt(a + L)} mL, il y a ${n} intervalles égaux. Que vaut une petite graduation (en mL) ?`, num(s, 'mL'), 'Calcule l’écart entre les deux traits numérotés, puis partage-le en parts égales.', `${fmt(a + L)} − ${fmt(a)} = ${fmt(L)} mL, partagés en ${n} : ${fmt(L)} ÷ ${n} = <b>${fmt(s)}</b> mL.`);
        }
        const [q, ans, ds] = rng.pick([
          ['Où lit-on le volume d’un liquide dans une éprouvette ?', 'Au bas du ménisque', ['En haut du ménisque, sur les bords', 'Au milieu entre le haut et le bas', 'Tout en haut de l’éprouvette']],
          ['Où doit-on placer son œil pour lire une éprouvette ?', 'À la hauteur du bas du ménisque', ['Au-dessus de l’éprouvette', 'En dessous du ménisque', 'N’importe où, cela ne change rien']],
          ['Comment doit être posée l’éprouvette pendant la lecture ?', 'Sur une table horizontale', ['Tenue penchée à la main', 'Posée sur le côté', 'Tenue en l’air au-dessus de la tête']],
        ]);
        return Q(`pcl1q:${q.slice(0, 20)}`, q, choice(rng, ans, ds), 'Pense au ménisque, la surface creusée du liquide.', `<b>${ans}</b> : on lit au bas du ménisque, l’œil à sa hauteur, l’éprouvette posée sur une table horizontale.`);
      }
      if (level === 2) {
        const r = rng.next();
        if (r < 0.4) {
          const step = rng.pick([2, 5]), V = volOn(rng, step);
          return Q(`pcl2r:${step}:${V}`, `${eprouvette(V, step)}${eprouvetteText(V, step)} Quel volume de liquide contient l’éprouvette (en mL) ?`, num(V, 'mL'), 'Une petite graduation ne vaut pas forcément 1 mL : calcule-la.', `Une graduation vaut ${fmt(10 * step)} ÷ 10 = ${fmt(step)} mL. Bas du ménisque : ${fmt(Math.floor(V / (10 * step)) * 10 * step)} + ${(V % (10 * step)) / step} × ${fmt(step)} = <b>${fmt(V)}</b> mL.`);
        }
        if (r < 0.7) {
          const n = rng.pick(NAMES), o = rng.pick(OBJS_V), v1 = 5 * rng.int(6, 16), v = rng.int(4, 35), v2 = v1 + v;
          return Q(`pcl2d:${o}:${v1}:${v}`, `${n} verse de l’eau dans une éprouvette et lit ${fmt(v1)} mL. Puis ${n} y plonge ${o}, qui coule au fond : le niveau monte à ${fmt(v2)} mL. Quel est le volume de l’objet (en cm³) ?`, num(v, 'cm³'), 'L’objet repousse l’eau : le niveau monte d’autant que le volume de l’objet. Et 1 mL = 1 cm³.', `V = V<sub>2</sub> − V<sub>1</sub> = ${fmt(v2)} − ${fmt(v1)} = ${fmt(v)} mL = <b>${fmt(v)}</b> cm³.`);
        }
        const [v, from, to, f] = rng.pick([
          [rng.pick([35, 120, 250, 8]), 'mL', 'cm³', 1], [rng.pick([0.5, 1.5, 2, 0.25, 0.75, 1.2]), 'L', 'mL', 1000], [rng.pick([25, 33, 50, 75, 20]), 'cL', 'mL', 10],
          [rng.pick([500, 1500, 250, 2000, 750]), 'mL', 'L', 0.001], [rng.pick([60, 125, 330]), 'cm³', 'mL', 1],
        ]);
        const res = mul(v, f);
        return Q(`pcl2c:${v}:${from}:${to}`, `Convertis : ${fmt(v)} ${from} = ? ${to}`, num(res, to), 'Rappel : 1 L = 1 000 mL, 1 cL = 10 mL, 1 mL = 1 cm³.', `${fmt(v)} ${from} = <b>${fmt(res)}</b> ${to}.`);
      }
      const r = rng.next();
      if (r < 0.35) {
        const vb = rng.pick([1.5, 2, 2.5, 3, 4, 5]), n = rng.pick([4, 5, 8, 10]), v1 = 10 * rng.int(4, 10), tot = mul(vb, n), v2 = add(v1, tot);
        const obj = rng.pick(['billes identiques', 'écrous identiques', 'dés identiques', 'cailloux de même taille']);
        return Q(`pcl3b:${vb}:${n}:${v1}:${obj}`, `Dans une éprouvette contenant ${fmt(v1)} mL d’eau, Noah plonge ${n} ${obj}. Le niveau monte à ${fmt(v2)} mL. Quel est le volume d’<b>un seul</b> objet (en cm³) ?`, num(vb, 'cm³'), 'Calcule d’abord le volume de tous les objets ensemble, puis partage.', `Volume des ${n} objets : ${fmt(v2)} − ${fmt(v1)} = ${fmt(tot)} mL. Un objet : ${fmt(tot)} ÷ ${n} = <b>${fmt(vb)}</b> cm³.`);
      }
      if (r < 0.65) {
        const step = 2, V2 = volOn(rng, step), v = 2 * rng.int(3, 12), V1 = V2 - v, o = rng.pick(OBJS_V);
        return Q(`pcl3f:${V2}:${v}:${o}`, `Avant d’y plonger ${o}, l’éprouvette contenait ${fmt(V1)} mL d’eau. Voici l’éprouvette après.${eprouvette(V2, step)}${eprouvetteText(V2, step)} Quel est le volume de l’objet (en cm³) ?`, num(v, 'cm³'), 'Lis d’abord le volume affiché (attention à la valeur d’une graduation), puis retire le volume d’eau du départ.', `Lecture : ${fmt(V2)} mL (une graduation vaut 2 mL). Volume de l’objet : ${fmt(V2)} − ${fmt(V1)} = <b>${fmt(v)}</b> cm³.`);
      }
      const [v, from, to, f] = rng.pick([
        [rng.pick([0.35, 1.25, 0.08, 2.5]), 'L', 'cm³', 1000], [rng.pick([75, 1500, 250, 40]), 'cm³', 'L', 0.001], [rng.pick([1.5, 0.2, 3, 0.75]), 'dm³', 'mL', 1000],
        [rng.pick([33, 7.5, 12, 70]), 'cL', 'cm³', 10], [rng.pick([450, 80, 1200]), 'mL', 'cL', 0.1],
      ]);
      const res = mul(v, f);
      return Q(`pcl3c:${v}:${from}:${to}`, `Convertis : ${fmt(v)} ${from} = ? ${to}`, num(res, to), 'Passe par le millilitre : 1 mL = 1 cm³, 1 L = 1 dm³ = 1 000 mL, 1 cL = 10 mL.', `${fmt(v)} ${from} = <b>${fmt(res)}</b> ${to}.`);
    },
  });

  // ===================== MASSE ET VOLUME =====================
  // m: mass (g) of 100 mL (liquids) or 100 cm³ (solids), rounded values.
  const MV = [
    { n: 'd’huile', s: 'l’huile', m: 92, u: 'mL' }, { n: 'd’eau', s: 'l’eau', m: 100, u: 'mL' }, { n: 'd’éthanol', s: 'l’éthanol', m: 79, u: 'mL' },
    { n: 'de lait', s: 'le lait', m: 103, u: 'mL' }, { n: 'de miel', s: 'le miel', m: 140, u: 'mL' }, { n: 'de sirop', s: 'le sirop', m: 130, u: 'mL' },
    { n: 'de fer', s: 'le fer', m: 790, u: 'cm³' }, { n: 'd’aluminium', s: 'l’aluminium', m: 270, u: 'cm³' }, { n: 'de glace', s: 'la glace', m: 92, u: 'cm³' },
  ];
  const LIQ = MV.slice(0, 6);

  M.notion('pc-masse-volume', {
    lesson: {
      retenir: `Pour une même substance, la <b>masse est proportionnelle au volume</b> : si le volume double, la masse double. Le coefficient de proportionnalité est la masse d’1 mL (ou d’1 cm³) de la substance. Il dépend de la substance : 100 mL d’eau ont une masse de 100 g, mais 100 mL d’huile seulement 92 g environ. Ainsi 1 L d’eau a une masse de 1 kg.`,
      methode: [
        'Écris un tableau de proportionnalité : volumes sur une ligne, masses sur l’autre.',
        'Trouve le coefficient : masse ÷ volume (par exemple 92 g ÷ 100 mL = 0,92 g par mL).',
        'Multiplie un volume par le coefficient pour trouver la masse ; divise une masse par le coefficient pour trouver le volume.',
        'Pour peser un liquide, retire la masse du récipient vide.',
      ],
      exemples: [
        { q: '100 mL d’huile ont une masse de 92 g. Masse de 300 mL ?', r: '92 × 3 = <b>276 g</b>.' },
        { q: '50 cm³ d’aluminium ont une masse de 135 g. Masse d’1 cm³ ?', r: '135 ÷ 50 = <b>2,7 g</b>.' },
        { q: 'Même volume d’huile et d’eau : lequel est le plus lourd ?', r: '<b>L’eau</b> (100 g contre 92 g pour 100 mL).' },
      ],
      astuces: ['En 4e, on appellera ce coefficient la « masse volumique ».', 'Un liquide plus léger que l’eau à volume égal flotte dessus quand ils ne se mélangent pas : l’huile flotte.'],
      erreurs: [
        'Croire que deux liquides de même volume ont toujours la même masse.',
        'Oublier de retirer la masse du récipient vide.',
        'Croire qu’un objet gros est forcément plus lourd : 1 L de fer est bien plus lourd que 1 L de glace.',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        const s = rng.pick(MV);
        if (rng.chance(0.7)) {
          const k = rng.pick([2, 3, 4, 5, 10, 0.5]), V = 100 * k, m = mul(s.m, k);
          return Q(`pcv1:${s.n}:${k}`, `100 ${s.u} ${s.n} ont une masse de ${fmt(s.m)} g. La masse est proportionnelle au volume. Quelle est la masse de ${fmt(V)} ${s.u} ${s.n} (en g) ?`, num(m, 'g'), `Par combien a-t-on multiplié le volume ? Fais pareil pour la masse.`, `${fmt(V)} ${s.u}, c’est 100 ${s.u} × ${fmt(k)} : ${fmt(s.m)} × ${fmt(k)} = <b>${fmt(m)}</b> g.`);
        }
        const [q, k] = rng.pick([['multiplié par 2', 'multipliée par 2'], ['multiplié par 3', 'multipliée par 3'], ['divisé par 2', 'divisée par 2'], ['multiplié par 10', 'multipliée par 10']]);
        const ds = ['ne change pas', 'augmente de 2 g', q.includes('divis') ? 'multipliée par 2' : 'divisée par 2'];
        return Q(`pcv1c:${s.n}:${q}`, `On prend un volume ${s.n} ${q}. Sa masse est…`, choice(rng, k, ds), 'Masse et volume d’une même substance sont proportionnels.', `La masse est proportionnelle au volume : elle est <b>${k}</b>.`);
      }
      if (level === 2) {
        const r = rng.next(), s = rng.pick(MV);
        if (r < 0.4) {
          const vs = rng.sample([50, 100, 150, 200, 250, 300, 400, 500], 4).sort((a, b) => a - b), j = rng.int(0, 3), coef = div(s.m, 100);
          const ms = vs.map(v => mul(v, coef)), row = ms.map((m, i) => (i === j ? '?' : m));
          return Q(`pcv2t:${s.n}:${vs}:${j}`, `Masse ${s.n} en fonction de son volume (proportionnalité) :${table([[`Volume (${s.u})`, ...vs], ['Masse (g)', ...row]], { head: false })}Quelle masse manque (en g) ?`, num(ms[j], 'g'), 'Cherche le coefficient : masse d’une colonne complète ÷ son volume.', `Coefficient : ${fmt(ms[(j + 1) % 4])} ÷ ${fmt(vs[(j + 1) % 4])} = ${fmt(coef)} g par ${s.u}. ${fmt(vs[j])} × ${fmt(coef)} = <b>${fmt(ms[j])}</b> g.`);
        }
        if (r < 0.7) {
          const V = rng.pick([20, 50, 200, 250, 500]), m = mul(V, div(s.m, 100)), c = div(s.m, 100);
          return Q(`pcv2c:${s.n}:${V}`, `${fmt(V)} ${s.u} ${s.n} ont une masse de ${fmt(m)} g. Quelle est la masse d’1 ${s.u} ${s.n} (en g) ?`, num(c, 'g'), 'Pour revenir à 1, on divise par le volume.', `${fmt(m)} ÷ ${fmt(V)} = <b>${fmt(c)}</b> g par ${s.u} : c’est le coefficient de proportionnalité.`);
        }
        const vs = rng.sample([10, 20, 50, 100, 200], 3).sort((a, b) => a - b), coef = div(s.m, 100), ok = rng.chance(0.5);
        const ms = vs.map(v => mul(v, coef)), j = rng.int(1, 2);
        if (!ok) ms[j] = add(ms[j], rng.pick([5, 10, -3]));
        return Q(`pcv2p:${s.n}:${vs}:${ms}`, `${cap(rng.pick(NAMES))} mesure la masse de plusieurs volumes ${s.n} :${table([[`Volume (${s.u})`, ...vs], ['Masse (g)', ...ms]], { head: false })}Ce tableau est-il un tableau de proportionnalité ?`, yesNo(ok), 'Calcule masse ÷ volume pour chaque colonne : obtiens-tu toujours le même nombre ?', ok ? `<b>Oui</b> : chaque masse vaut ${fmt(coef)} × le volume.` : `<b>Non</b> : ${fmt(ms[j])} ÷ ${fmt(vs[j])} ne donne pas ${fmt(coef)} comme les autres colonnes ; une mesure est fausse.`);
      }
      const r = rng.next();
      if (r < 0.35) {
        const s = rng.pick(MV), V = rng.pick([50, 150, 200, 250, 300, 500]), m = mul(V, div(s.m, 100));
        return Q(`pcv3v:${s.n}:${V}`, `100 ${s.u} ${s.n} ont une masse de ${fmt(s.m)} g. Quel volume ${s.n} a une masse de ${fmt(m)} g (en ${s.u}) ?`, num(V, s.u), 'Masse et volume sont proportionnels : par combien faut-il multiplier la masse de 100 unités pour obtenir la masse donnée ?', `${fmt(m)} ÷ ${fmt(s.m)} = ${fmt(div(V, 100))}, donc le volume est 100 × ${fmt(div(V, 100))} = <b>${fmt(V)}</b> ${s.u}.`);
      }
      if (r < 0.7) {
        const s = rng.pick(LIQ), mb = 5 * rng.int(12, 30), V = rng.pick([50, 100, 200]), m = mul(V, div(s.m, 100)), n = rng.pick(NAMES);
        const tbl = table([['Liquide', ...LIQ.map(l => cap(l.s.replace(/^(le |la |l’)/, '')))], ['Masse de 100 mL (g)', ...LIQ.map(l => l.m)]], { head: false });
        return Q(`pcv3i:${s.n}:${mb}:${V}`, `${n} pèse un bécher vide : ${fmt(mb)} g, puis y verse ${fmt(V)} mL d’un liquide inconnu : la balance affiche ${fmt(add(mb, m))} g.${tbl}Quel est ce liquide ?`, choice(rng, cap(s.s.replace(/^(le |la |l’)/, '')), rng.sample(LIQ.filter(l => l !== s), 3).map(l => cap(l.s.replace(/^(le |la |l’)/, '')))), 'Calcule d’abord la masse du liquide seul, puis la masse de 100 mL de ce liquide.', `Masse du liquide : ${fmt(add(mb, m))} − ${fmt(mb)} = ${fmt(m)} g pour ${fmt(V)} mL${V === 100 ? '' : `, soit ${fmt(s.m)} g pour 100 mL`} : c’est <b>${s.s}</b>.`);
      }
      const [a, b] = rng.sample(LIQ, 2), V = rng.pick([1, 2, 0.5]), ma = mul(a.m, mul(V, 10)), mb2 = mul(b.m, mul(V, 10)), d = Math.abs(ma - mb2);
      return Q(`pcv3d:${a.n}:${b.n}:${V}`, `100 mL ${a.n} ont une masse de ${fmt(a.m)} g et 100 mL ${b.n} une masse de ${fmt(b.m)} g. Quelle est la différence de masse entre ${fmt(V)} L ${a.n} et ${fmt(V)} L ${b.n} (en g) ?`, num(d, 'g'), `Convertis ${fmt(V)} L en mL, puis calcule les deux masses par proportionnalité.`, `${fmt(V)} L = ${fmt(mul(V, 1000))} mL = ${fmt(mul(V, 10))} × 100 mL. Masses : ${fmt(ma)} g et ${fmt(mb2)} g. Différence : <b>${fmt(d)}</b> g. Même volume ne veut pas dire même masse.`);
    },
  });

  // ===================== PRESSION D’UN GAZ =====================
  const COMPRESS = [
    ['On enfonce le piston d’une seringue bouchée remplie d’air.', 'Elle augmente', 'L’air est comprimé : ses particules ont moins de place et frappent plus souvent les parois.'],
    ['On tire le piston d’une seringue bouchée remplie d’air.', 'Elle diminue', 'L’air dispose de plus de place : il est détendu.'],
    ['On ajoute de l’air dans un pneu de vélo avec une pompe.', 'Elle augmente', 'Il y a plus d’air dans le même volume.'],
    ['On ouvre la valve d’un ballon de foot et un peu d’air s’échappe.', 'Elle diminue', 'Il y a moins d’air dans le ballon.'],
    ['On appuie sur une bouteille en plastique vide bien bouchée.', 'Elle augmente', 'L’air enfermé est comprimé.'],
    ['On gonfle un matelas pneumatique fermé avec un gonfleur.', 'Elle augmente', 'Il y a plus d’air dans le matelas.'],
  ];

  M.notion('pc-pression', {
    lesson: {
      retenir: `Un gaz enfermé appuie sur les parois de son récipient : c’est sa <b>pression</b>. On la mesure avec un <b>manomètre</b>. Son unité est le <b>pascal (Pa)</b> ; on utilise souvent l’hectopascal (<b>1 hPa = 100 Pa</b>) et le bar (<b>1 bar = 1 000 hPa</b>). La pression de l’air autour de nous, la <b>pression atmosphérique</b>, vaut environ <b>1 013 hPa</b> au niveau de la mer.<br>Quand on <b>comprime</b> un gaz (moins de volume) ou qu’on en ajoute dans le même récipient, sa pression <b>augmente</b>.`,
      methode: [
        'Pour convertir des hPa en Pa, multiplie par 100 ; des Pa en hPa, divise par 100.',
        'Pour convertir des bars en hPa, multiplie par 1 000 ; des hPa en bars, divise par 1 000.',
        'Si le gaz a moins de place (piston enfoncé) ou s’il y a plus de gaz, la pression augmente.',
        'Si le gaz a plus de place ou s’il en sort, la pression diminue.',
      ],
      exemples: [
        { q: '1 020 hPa en Pa ?', r: '1 020 × 100 = <b>102 000 Pa</b>.' },
        { q: 'Un pneu gonflé à 2,5 bar : en hPa ?', r: '2,5 × 1 000 = <b>2 500 hPa</b>.' },
        { q: 'On enfonce le piston d’une seringue bouchée.', r: 'La pression de l’air <b>augmente</b>.' },
      ],
      astuces: ['Le baromètre est un manomètre spécial qui mesure la pression atmosphérique : la météo l’annonce en hPa.', 'En montagne, il y a moins d’air au-dessus de nous : la pression atmosphérique est plus faible.'],
      erreurs: [
        'Confondre hPa et Pa : 1 013 hPa, c’est 101 300 Pa.',
        'Croire qu’un gaz comprimé devient plus lourd : sa masse ne change pas, seule sa pression augmente.',
        'Croire que l’air n’appuie sur rien : la pression atmosphérique agit sur tout ce qui nous entoure.',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        if (rng.chance(0.5)) {
          const [s, ans, why] = rng.pick(COMPRESS);
          return Q(`pcr1c:${s.slice(0, 24)}`, `${s} Que devient la pression de l’air à l’intérieur ?`, fixedChoice(['Elle augmente', 'Elle diminue', 'Elle ne change pas'], ans), 'Le gaz a-t-il moins de place ? Y a-t-il plus ou moins de gaz ?', `<b>${ans}</b>. ${why}`);
        }
        const [q, ans, ds] = rng.pick([
          ['Quelle est l’unité de pression du système international ?', 'Le pascal (Pa)', ['Le degré Celsius (°C)', 'Le gramme (g)', 'Le litre (L)']],
          ['Avec quel appareil mesure-t-on la pression d’un gaz ?', 'Un manomètre', ['Un thermomètre', 'Une balance', 'Une éprouvette graduée']],
          ['Quelle est environ la pression atmosphérique au niveau de la mer ?', '1 013 hPa', ['1 013 Pa', '13 hPa', '101 300 hPa']],
          ['Combien de pascals dans 1 hectopascal ?', '100 Pa', ['10 Pa', '1 000 Pa', '1 Pa']],
          ['Combien d’hectopascals dans 1 bar ?', '1 000 hPa', ['100 hPa', '10 hPa', '1 013 hPa']],
        ]);
        return Q(`pcr1q:${q.slice(0, 22)}`, q, choice(rng, ans, ds), 'Pense à la météo : la pression y est donnée en hectopascals.', `<b>${ans}</b>. Rappel : 1 hPa = 100 Pa, 1 bar = 1 000 hPa, pression atmosphérique ≈ 1 013 hPa.`);
      }
      if (level === 2) {
        const k = rng.int(0, 3);
        if (k === 0) { const v = rng.int(960, 1050); return Q(`pcr2a:${v}`, `Le baromètre indique ${fmt(v)} hPa. Combien cela fait-il en pascals (Pa) ?`, num(v * 100, 'Pa'), 'Combien de pascals dans un hectopascal ?', `1 hPa = 100 Pa : ${fmt(v)} × 100 = <b>${fmt(v * 100)}</b> Pa.`); }
        if (k === 1) { const v = rng.int(960, 1050) * 100; return Q(`pcr2b:${v}`, `Une pression vaut ${fmt(v)} Pa. Combien cela fait-il en hectopascals (hPa) ?`, num(v / 100, 'hPa'), 'Un hectopascal, c’est 100 pascals.', `${fmt(v)} ÷ 100 = <b>${fmt(v / 100)}</b> hPa.`); }
        if (k === 2) { const [obj, vs] = rng.pick([['un pneu de voiture', [1.8, 2, 2.2, 2.5, 2.8]], ['un pneu de vélo de route', [6, 6.5, 7, 7.5, 8]], ['un pneu de VTT', [1.5, 1.8, 2, 2.2, 2.5]], ['un ballon de basket', [0.5, 0.6, 0.7]]]), v = rng.pick(vs); return Q(`pcr2c:${v}:${obj}`, `Le manomètre branché sur ${obj} indique ${fmt(v)} bar. Combien cela fait-il en hPa ?`, num(mul(v, 1000), 'hPa'), 'Combien d’hectopascals dans un bar ?', `1 bar = 1 000 hPa : ${fmt(v)} × 1 000 = <b>${fmt(mul(v, 1000))}</b> hPa.`); }
        const v = rng.pick([1500, 2000, 2500, 3200, 4000, 800, 1200]);
        return Q(`pcr2d:${v}`, `Une pression vaut ${fmt(v)} hPa. Combien cela fait-il en bars ?`, num(div(v, 1000), 'bar'), 'Un bar, c’est 1 000 hectopascals.', `${fmt(v)} ÷ 1 000 = <b>${fmt(div(v, 1000))}</b> bar.`);
      }
      const r = rng.next();
      if (r < 0.3) {
        const a = rng.int(1005, 1040), b = rng.int(975, 1000), d = a - b;
        return Q(`pcr3d:${a}:${b}`, `Lundi, le baromètre indiquait ${fmt(a)} hPa (beau temps). Mardi, avant l’orage, il indique ${fmt(b)} hPa. De combien de pascals la pression a-t-elle baissé ?`, num(d * 100, 'Pa'), 'Calcule la baisse en hPa, puis convertis-la en Pa.', `Baisse : ${fmt(a)} − ${fmt(b)} = ${fmt(d)} hPa = ${fmt(d)} × 100 = <b>${fmt(d * 100)}</b> Pa.`);
      }
      if (r < 0.55) {
        const v = rng.pick([1, 2, 3, 5, 10, 20, 2.5, 4]), m = mul(v, 1.2);
        return Q(`pcr3m:${v}`, `Un litre d’air a une masse d’environ 1,2 g. Avec une pompe, Malo fait entrer ${fmt(v)} L d’air dans un ballon. De combien de grammes la masse du ballon augmente-t-elle ?`, num(m, 'g'), 'L’air a une masse proportionnelle à son volume.', `${fmt(v)} × 1,2 = <b>${fmt(m)}</b> g : l’air comprimé dans le ballon a une masse.`);
      }
      if (r < 0.75) {
        const v = rng.pick([1.8, 2, 2.2, 2.5, 3, 4, 5, 6, 7]), h = mul(v, 1000);
        return Q(`pcr3p:${v}`, `Le manomètre d’un pneu indique ${fmt(v)} bar. On arrondit la pression atmosphérique à 1 000 hPa. Combien de fois plus grande est la pression dans le pneu ?`, num(v), 'Exprime les deux pressions dans la même unité, puis divise.', `${fmt(v)} bar = ${fmt(h)} hPa ; ${fmt(h)} ÷ 1 000 = <b>${fmt(v)}</b> : la pression dans le pneu est environ ${fmt(v)} fois la pression atmosphérique.`);
      }
      const [s, b, why] = rng.pick([
        ['Quand on comprime l’air d’une seringue bouchée, sa masse augmente.', false, 'La quantité d’air ne change pas : sa <b>masse</b> reste la même, c’est sa <b>pression</b> qui augmente.'],
        ['En haut d’une montagne, la pression atmosphérique est plus faible qu’au bord de la mer.', true, 'Il y a moins d’air au-dessus de nous en altitude : la pression diminue.'],
        ['101 300 Pa et 1 013 hPa, c’est la même pression.', true, '1 013 × 100 = 101 300 : 1 013 hPa = 101 300 Pa.'],
        ['On peut comprimer de l’eau liquide pour augmenter beaucoup sa pression comme celle de l’air.', false, 'Un liquide est presque incompressible : son volume ne diminue presque pas.'],
        ['Un manomètre mesure la masse d’un gaz.', false, 'Un manomètre mesure la <b>pression</b> ; la masse se mesure avec une balance.'],
        ['2 bar, c’est 2 000 hPa.', true, '1 bar = 1 000 hPa, donc 2 bar = 2 000 hPa.'],
      ]);
      return Q(`pcr3v:${s.slice(0, 24)}`, `Vrai ou faux ? « ${s} »`, vf(b), 'Rappel : 1 hPa = 100 Pa et 1 bar = 1 000 hPa ; comprimer un gaz ne change pas sa masse.', `<b>${b ? 'Vrai' : 'Faux'}</b>. ${why}`);
    },
  });

  // ===================== RÉPÉTER UNE MESURE =====================
  // u: unit, d: decimals, lo..hi: mean range in units of 10^-d, sp: spread of the normal values.
  const MESURES = [
    { w: 'la durée de chute d’une balle lâchée du haut d’un escalier', u: 's', d: 2, lo: 60, hi: 140, sp: 5 },
    { w: 'la température d’ébullition de l’eau', u: '°C', d: 1, lo: 985, hi: 1000, sp: 4 },
    { w: 'la masse d’un caillou', u: 'g', d: 1, lo: 300, hi: 900, sp: 4 },
    { w: 'la durée de 10 allers-retours d’un pendule', u: 's', d: 1, lo: 120, hi: 200, sp: 4 },
    { w: 'le volume d’eau coulé d’un robinet en 10 s', u: 'mL', d: 0, lo: 150, hi: 400, sp: 6 },
    { w: 'la longueur d’une table', u: 'cm', d: 1, lo: 1200, hi: 1600, sp: 3 },
    { w: 'le temps de réaction de Léa (elle rattrape une règle qui tombe)', u: 's', d: 2, lo: 18, hi: 30, sp: 3 },
    { w: 'le nombre de battements de cœur de Hugo en une minute', u: 'battements', d: 0, lo: 65, hi: 90, sp: 4 },
  ];
  // n values (in units) with an exact mean `mean` (in units).
  function spread(rng, n, mean, sp) {
    let offs;
    do { offs = Array.from({ length: n - 1 }, () => rng.int(-sp, sp)); offs.push(-offs.reduce((a, b) => a + b, 0)); } while (Math.abs(offs[n - 1]) > sp + 1 || offs.every(o => o === 0));
    return rng.shuffle(offs).map(o => mean + o);
  }
  // A value clearly far from the others (never negative).
  const outlier = (rng, mean, sp) => {
    const off = rng.int(sp * 4 + 10, sp * 4 + 25);
    return mean + (mean - off > mean / 2 && rng.chance(0.5) ? -off : off);
  };
  const meanText = (vals, mean) => {
    const s = vals.reduce((a, b) => add(a, b), 0);
    return `(${vals.map(fmt).join(' + ')}) ÷ ${vals.length} = ${fmt(s)} ÷ ${vals.length} = <b>${fmt(mean)}</b>`;
  };
  const measTable = (vals, unit) => table([['Groupe', ...vals.map((_, i) => i + 1)], [`Mesure (${unit})`, ...vals]], { head: false });

  M.notion('pc-mesure-repetee', {
    lesson: {
      retenir: `Une mesure n’est jamais parfaite : si on la <b>répète</b>, on trouve des valeurs un peu différentes. On garde alors la <b>moyenne</b> des mesures (somme ÷ nombre de mesures), plus fiable qu’une mesure seule. Une valeur très éloignée des autres, une <b>valeur aberrante</b> (erreur de lecture, de manipulation…), doit être écartée avant de calculer la moyenne.`,
      methode: [
        'Regarde toutes les valeurs : l’une d’elles est-elle très éloignée des autres ? Si oui, écarte-la.',
        'Additionne les valeurs restantes.',
        'Divise la somme par le nombre de valeurs gardées.',
        'Vérifie que la moyenne est bien entre la plus petite et la plus grande valeur.',
      ],
      exemples: [
        { q: 'Mesures : 12 s ; 13 s ; 11 s ; 12 s. Moyenne ?', r: '48 ÷ 4 = <b>12 s</b>.' },
        { q: 'Mesures : 45,2 g ; 45,4 g ; 54,3 g ; 45,3 g.', r: '<b>54,3 g</b> est aberrante (sans doute une inversion de chiffres).' },
        { q: 'Pourquoi répéter une mesure ?', r: 'Pour <b>réduire l’effet des petites erreurs</b> et repérer une erreur grossière.' },
      ],
      astuces: ['La moyenne n’est pas forcément une des valeurs mesurées.'],
      erreurs: [
        'Garder une valeur aberrante dans la moyenne.',
        'Diviser par le mauvais nombre de valeurs (oublier qu’on en a écarté une).',
        'Croire qu’une seule mesure suffit toujours.',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        const r = rng.next();
        if (r < 0.45) {
          const c = rng.pick(MESURES.filter(x => x.d === 0)), mean = rng.int(c.lo, c.hi), vals = spread(rng, 4, mean, c.sp);
          return Q(`pcmr1m:${c.u}:${vals}`, `Quatre groupes mesurent ${c.w} :${measTable(vals, c.u)}Quelle est la moyenne de ces mesures (en ${c.u}) ?`, num(mean, c.u), 'Additionne toutes les mesures, puis divise par le nombre de mesures.', `Moyenne : ${meanText(vals, mean)} ${c.u}.`);
        }
        if (r < 0.75) {
          const c = rng.pick(MESURES), mean = rng.int(c.lo, c.hi), k = Math.pow(10, c.d);
          const vals = spread(rng, 4, mean, c.sp), j = rng.int(0, 3);
          vals[j] = outlier(rng, mean, c.sp);
          const shown = vals.map(v => v / k), bad = shown[j];
          return Q(`pcmr1a:${c.u}:${shown}`, `Quatre groupes mesurent ${c.w} : ${shown.map(v => `${fmt(v)} ${c.u}`).join(' ; ')}. Quelle valeur semble aberrante ?`, choice(rng, `${fmt(bad)} ${c.u}`, shown.filter((_, i) => i !== j).map(v => `${fmt(v)} ${c.u}`)), 'Cherche la valeur très éloignée de toutes les autres.', `<b>${fmt(bad)} ${c.u}</b> est très éloignée des autres valeurs, qui sont proches entre elles : c’est sans doute une erreur. On l’écarte.`);
        }
        const [q, ans, ds] = rng.pick([
          ['Pourquoi répète-t-on une mesure plusieurs fois ?', 'Pour obtenir un résultat plus fiable, en faisant la moyenne', ['Parce que le premier résultat est toujours faux', 'Pour avoir le plus grand résultat possible', 'Pour ne garder que la première valeur']],
          ['Les groupes trouvent des valeurs un peu différentes. Quelle valeur faut-il retenir ?', 'La moyenne des valeurs (sans les valeurs aberrantes)', ['La plus grande valeur', 'La plus petite valeur', 'La valeur du premier groupe']],
          ['Que faire d’une valeur très éloignée de toutes les autres ?', 'L’écarter avant de calculer la moyenne', ['La garder et la compter deux fois', 'Ne garder que celle-là', 'Arrondir toutes les autres vers elle']],
        ]);
        return Q(`pcmr1q:${q.slice(0, 20)}`, q, choice(rng, ans, ds), 'Une mesure seule peut contenir une petite erreur…', `<b>${ans}</b>.`);
      }
      if (level === 2) {
        const c = rng.pick(MESURES.filter(x => x.d > 0)), k = Math.pow(10, c.d), n = rng.int(4, 6), mean = rng.int(c.lo, c.hi);
        const vals = spread(rng, n, mean, c.sp).map(v => v / k), m = mean / k;
        return Q(`pcmr2:${c.u}:${vals}`, `${n} groupes mesurent ${c.w} :${measTable(vals, c.u)}Calcule la moyenne de ces mesures (en ${c.u}).`, num(m, c.u), 'Additionne toutes les mesures, puis divise par le nombre de groupes.', `Moyenne : ${meanText(vals, m)} ${c.u}.`);
      }
      const c = rng.pick(MESURES), k = Math.pow(10, c.d), n = rng.int(5, 6), mean = rng.int(c.lo, c.hi);
      const good = spread(rng, n - 1, mean, c.sp), j = rng.int(0, n - 1);
      const vals = [...good];
      vals.splice(j, 0, outlier(rng, mean, c.sp));
      const shown = vals.map(v => v / k), keep = good.map(v => v / k), m = mean / k;
      if (rng.chance(0.65)) {
        return Q(`pcmr3m:${c.u}:${shown}`, `${n} groupes mesurent ${c.w} :${measTable(shown, c.u)}Écarte la valeur aberrante, puis calcule la moyenne des autres mesures (en ${c.u}).`, num(m, c.u), 'Repère d’abord la valeur très éloignée des autres ; attention, tu divises ensuite par le nombre de valeurs gardées.', `On écarte ${fmt(shown[j])} ${c.u}. Moyenne des ${n - 1} autres : ${meanText(keep, m)} ${c.u}.`);
      }
      const lo = Math.min(...keep), hi = Math.max(...keep), e = sub(hi, lo);
      return Q(`pcmr3e:${c.u}:${shown}`, `${n} groupes mesurent ${c.w} :${measTable(shown, c.u)}Après avoir écarté la valeur aberrante, quel est l’écart entre la plus grande et la plus petite des mesures restantes (en ${c.u}) ?`, num(e, c.u), 'Écarte la valeur très éloignée, puis fais : plus grande − plus petite.', `On écarte ${fmt(shown[j])} ${c.u}. Écart : ${fmt(hi)} − ${fmt(lo)} = <b>${fmt(e)}</b> ${c.u}. Plus cet écart est petit, plus les mesures sont précises.`);
    },
  });

  // ===================== MÉLANGE HOMOGÈNE OU HÉTÉROGÈNE =====================
  const HOM = ['de l’eau salée', 'de l’eau sucrée', 'du sirop de menthe dilué dans l’eau', 'du thé filtré', 'du vinaigre', 'de l’air sans poussières', 'de l’eau minérale plate', 'du jus de pomme filtré', 'du café filtré', 'de l’eau du robinet'];
  const HET = ['de l’eau et du sable', 'de l’eau boueuse', 'de la vinaigrette', 'de l’eau et de l’huile', 'du jus d’orange avec de la pulpe', 'un mélange de sel et de poivre', 'du muesli', 'de la soupe aux vermicelles', 'de l’eau et des grains de riz'];
  const PHASES = [
    ['de l’eau et de l’huile', 2], ['de l’eau et du sable, après un moment de repos', 2], ['de l’eau, de l’huile et du sable', 3], ['de l’eau et du sel entièrement dissous', 1],
    ['de l’eau et du sirop de grenadine, bien mélangés', 1], ['de l’eau salée et de l’huile', 2], ['de l’eau, du sable et du sel entièrement dissous', 2], ['de l’eau et de l’alcool', 1],
    ['de l’eau, de l’huile et un caillou', 3], ['de l’eau sucrée, du sirop et de l’huile', 2],
  ];
  const HH_VF = [
    ['Un mélange homogène ne contient qu’une seule substance.', false, 'Un mélange contient toujours <b>plusieurs</b> substances ; « homogène » veut seulement dire qu’on ne les distingue pas à l’œil nu.'],
    ['L’eau salée est homogène, et pourtant c’est un mélange.', true, 'On ne voit plus le sel, mais il est toujours là : c’est un mélange homogène.'],
    ['Si on laisse reposer de l’eau boueuse, le liquide du dessus peut devenir limpide.', true, 'La terre tombe au fond : c’est la <b>décantation</b>.'],
    ['Si on ajoute beaucoup trop de sel dans un verre d’eau, le mélange peut devenir hétérogène.', true, 'Au-delà d’une certaine quantité, le sel ne se dissout plus et reste visible au fond.'],
    ['Une eau limpide et transparente ne contient forcément qu’une seule substance.', false, 'L’eau minérale est limpide, mais contient des substances dissoutes : c’est un mélange homogène.'],
    ['Une vinaigrette bien agitée reste homogène pour toujours.', false, 'Au repos, l’huile remonte : la vinaigrette redevient hétérogène.'],
    ['L’air (sans poussières) est un mélange homogène.', true, 'L’air est un mélange de gaz qu’on ne peut pas distinguer à l’œil nu.'],
    ['Un mélange de sel et de poivre est homogène, car ce sont deux poudres.', false, 'On distingue les grains blancs et noirs : il est <b>hétérogène</b>.'],
  ];

  M.notion('pc-homogene-heterogene', {
    lesson: {
      retenir: `Un <b>mélange</b> contient plusieurs constituants.<ul><li>Il est <b>homogène</b> si on ne peut pas distinguer ses constituants à l’œil nu (eau salée, sirop dilué, air).</li><li>Il est <b>hétérogène</b> si on distingue au moins deux constituants à l’œil nu (eau et sable, vinaigrette).</li></ul>Dans un mélange hétérogène de liquides, chaque partie distincte s’appelle une <b>phase</b>.`,
      methode: [
        'Observe le mélange à l’œil nu, éventuellement après un moment de repos.',
        'Si tu vois des grains, des couches, des bulles ou des morceaux : il est hétérogène.',
        'Si tout a le même aspect partout : il est homogène (ce qui ne veut pas dire qu’il est pur).',
        'Pour compter les phases, compte les parties d’aspect différent.',
      ],
      exemples: [
        { q: 'De l’eau sucrée.', r: 'On ne voit plus le sucre : <b>homogène</b>.' },
        { q: 'De l’eau boueuse.', r: 'On voit les particules de terre : <b>hétérogène</b>.' },
        { q: 'Eau + huile + sable : combien de phases ?', r: '<b>3</b> (sable au fond, eau, huile au-dessus).' },
      ],
      astuces: ['Le lait paraît homogène à l’œil nu, mais au microscope on voit des gouttelettes de matière grasse : l’œil nu est la règle au collège.'],
      erreurs: [
        'Croire qu’un mélange homogène est un corps pur.',
        'Croire qu’un liquide transparent ne contient rien de dissous.',
        'Confondre « homogène » et « bien mélangé pour l’instant » (la vinaigrette se sépare au repos).',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        const hom = rng.chance(0.5), m = rng.pick(hom ? HOM : HET);
        return Q(`pch1:${m}`, `Le mélange suivant est-il homogène ou hétérogène : ${m} ?`, fixedChoice(['Homogène', 'Hétérogène'], hom ? 'Homogène' : 'Hétérogène'), 'Peut-on distinguer au moins deux constituants à l’œil nu ?', hom ? `<b>Homogène</b> : on ne distingue pas ses constituants à l’œil nu (c’est pourtant un mélange).` : `<b>Hétérogène</b> : on distingue au moins deux constituants à l’œil nu.`);
      }
      if (level === 2) {
        if (rng.chance(0.75)) {
          const [m, n] = rng.pick(PHASES);
          return Q(`pch2:${m}`, `On verse dans un tube à essai ${m}, puis on laisse reposer. Combien de phases (parties d’aspect différent) voit-on ?`, num(n), 'Une substance dissoute ou un liquide miscible ne forme pas de phase à part. L’huile ne se mélange pas à l’eau.', `On voit <b>${fmt(n)}</b> phase${n > 1 ? 's' : ''} : ${n === 1 ? 'le mélange est homogène' : 'le mélange est hétérogène'}.`);
        }
        const [q, ans, ds] = rng.pick([
          ['Un mélange est homogène quand…', 'on ne distingue pas ses constituants à l’œil nu', ['il ne contient qu’une seule substance', 'il est transparent et incolore', 'il est liquide']],
          ['Un mélange est hétérogène quand…', 'on distingue au moins deux constituants à l’œil nu', ['il contient au moins deux substances', 'il est coloré', 'il contient un gaz']],
        ]);
        return Q(`pch2d:${q.slice(-12)}`, q, choice(rng, ans, ds), 'La définition repose sur ce qu’on voit à l’œil nu.', `Un mélange est ${q.includes('hétérogène') ? 'hétérogène' : 'homogène'} quand <b>${ans}</b>.`);
      }
      const [s, b, why] = rng.pick(HH_VF);
      return Q(`pch3:${s.slice(0, 24)}`, `Vrai ou faux ? « ${s} »`, vf(b), 'Homogène ou hétérogène, cela se juge à l’œil nu ; cela ne dit pas si c’est pur.', `<b>${b ? 'Vrai' : 'Faux'}</b>. ${why}`);
    },
  });

  // ===================== SÉPARER LES CONSTITUANTS =====================
  const METHODS = ['La décantation', 'La filtration', 'L’évaporation', 'La distillation'];
  const GOALS = [
    ['récupérer le sel dissous dans de l’eau salée', 2, 'en chauffant (ou au soleil), l’eau s’évapore et le sel reste'],
    ['obtenir une eau limpide à partir d’eau boueuse, en retenant la terre dans un papier', 1, 'le filtre retient les particules solides'],
    ['faire tomber le sable au fond d’une eau sableuse, simplement en attendant', 0, 'au repos, les particules lourdes tombent au fond'],
    ['obtenir de l’eau pure à partir d’eau salée', 3, 'l’eau se vaporise puis se liquéfie plus loin, le sel reste dans le ballon'],
    ['séparer l’huile et l’eau avec une ampoule à décanter', 0, 'au repos, l’huile reste au-dessus et on fait couler l’eau par le robinet'],
    ['retirer les feuilles de thé du thé', 1, 'le filtre retient les feuilles et laisse passer le thé'],
    ['récupérer le sucre dissous dans de l’eau sucrée', 2, 'l’eau s’évapore et le sucre reste'],
    ['obtenir de l’eau douce à partir d’eau de mer en récupérant l’eau', 3, 'seule l’eau se vaporise puis est liquéfiée et recueillie'],
  ];
  const TOOLS = [
    ['un entonnoir et un papier filtre', 1], ['une ampoule à décanter', 0], ['un ballon chauffé relié à un réfrigérant', 3], ['une coupelle chauffée (ou les marais salants au soleil)', 2],
  ];
  const SEP_SEQS = [
    ['Récupérer le sel d’un mélange de sel et de sable.', ['Ajouter de l’eau et agiter pour dissoudre le sel', 'Filtrer pour retenir le sable', 'Chauffer le filtrat pour évaporer l’eau', 'Récupérer le sel au fond du récipient']],
    ['Rendre limpide une eau boueuse.', ['Laisser reposer : la terre tombe au fond', 'Verser doucement le liquide du dessus dans un bécher', 'Filtrer ce liquide sur un papier filtre', 'Recueillir le filtrat limpide']],
    ['Distiller de l’eau salée.', ['Chauffer l’eau salée dans un ballon', 'L’eau se vaporise', 'La vapeur se liquéfie dans le réfrigérant', 'Recueillir l’eau pure (le distillat)']],
    ['Séparer l’eau et l’huile.', ['Verser le mélange dans l’ampoule à décanter', 'Attendre que les deux liquides se séparent', 'Ouvrir le robinet pour faire couler l’eau', 'Fermer le robinet quand l’huile arrive']],
    ['Rendre l’eau d’une rivière potable (station de traitement).', ['Retirer les gros déchets avec une grille', 'Laisser les particules tomber au fond (décantation)', 'Filtrer l’eau sur du sable', 'Désinfecter l’eau pour éliminer les microbes']],
  ];

  M.notion('pc-separer', {
    lesson: {
      retenir: `Pour séparer les constituants d’un mélange :<ul><li><b>décantation</b> : au repos, les solides lourds (ou le liquide le plus lourd) tombent au fond ;</li><li><b>filtration</b> : un filtre retient les particules solides ; le liquide qui passe est le <b>filtrat</b> ;</li><li><b>évaporation</b> : on fait partir l’eau pour récupérer le solide dissous ;</li><li><b>distillation</b> : on vaporise le liquide puis on le liquéfie pour le récupérer.</li></ul>La filtration ne retient pas ce qui est <b>dissous</b> : le filtrat d’une eau salée est encore salé.`,
      methode: [
        'Repère ce que tu veux récupérer : un solide non dissous, un solide dissous ou un liquide.',
        'Solide non dissous : décantation puis filtration.',
        'Solide dissous : évaporation (on perd l’eau) ; liquide pur : distillation (on récupère l’eau).',
        'Deux liquides qui ne se mélangent pas : décantation (ampoule à décanter).',
      ],
      exemples: [
        { q: 'Récupérer le sel de l’eau de mer.', r: '<b>Évaporation</b> (marais salants).' },
        { q: 'Enlever le sable d’une eau sableuse.', r: '<b>Décantation</b>, puis <b>filtration</b>.' },
        { q: 'Que contient le filtrat d’une eau salée boueuse ?', r: 'De l’eau <b>encore salée</b>, mais limpide.' },
      ],
      astuces: ['Ce qui reste dans le filtre s’appelle le résidu ; ce qui passe, le filtrat.'],
      erreurs: [
        'Croire que la filtration enlève le sel ou le sucre dissous.',
        'Confondre évaporation (on garde le solide) et distillation (on garde aussi le liquide).',
        'Croire qu’une eau filtrée et limpide est potable : elle peut contenir des microbes ou des substances dissoutes.',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        if (rng.chance(0.65)) {
          const [g, i, why] = rng.pick(GOALS);
          return Q(`pcs1:${g.slice(0, 24)}`, `Quelle technique utiliser pour ${g} ?`, fixedChoice(METHODS, METHODS[i]), 'Le constituant à récupérer est-il un solide non dissous, un solide dissous ou un liquide ?', `<b>${METHODS[i]}</b> : ${why}.`);
        }
        const [t, i] = rng.pick(TOOLS);
        return Q(`pcs1t:${t.slice(0, 18)}`, `On utilise ${t}. Quelle technique de séparation réalise-t-on ?`, fixedChoice(METHODS, METHODS[i]), 'Pense au rôle de chaque objet : retenir, laisser reposer, chauffer, refroidir.', `Avec ${t}, on réalise <b>${METHODS[i].toLowerCase()}</b>.`);
      }
      if (level === 2) {
        if (rng.chance(0.7)) {
          const [ctx, steps] = rng.pick(SEP_SEQS);
          return Q(`pcs2s:${ctx.slice(0, 20)}`, `${ctx} Range les étapes dans l’ordre.`, sequence(rng, steps, { label: 'les étapes', how: 'dans l’ordre' }), 'Commence par l’étape la plus grossière ; ce qui est dissous se sépare en dernier.', `Dans l’ordre : <b>${steps.join(' → ')}</b>.`);
        }
        const [q, ans, ds] = rng.pick([
          ['Comment appelle-t-on le liquide qui a traversé le filtre ?', 'Le filtrat', ['Le résidu', 'Le distillat', 'Le soluté']],
          ['Comment appelle-t-on ce qui reste dans le papier filtre ?', 'Le résidu', ['Le filtrat', 'Le solvant', 'Le distillat']],
          ['Comment appelle-t-on le liquide recueilli à la sortie d’une distillation ?', 'Le distillat', ['Le filtrat', 'Le résidu', 'La solution']],
        ]);
        return Q(`pcs2v:${ans}`, q, choice(rng, ans, ds), 'Le nom du produit rappelle le nom de la technique.', `<b>${ans}</b>.`);
      }
      const r = rng.next();
      if (r < 0.4) {
        const V = rng.pick([100, 200, 400, 500, 1000, 2000, 40, 600]), m = div(mul(35, V), 1000);
        return Q(`pcs3e:${V}`, `L’eau de mer contient environ 35 g de sel par litre. Quelle masse de sel récupère-t-on en faisant évaporer ${fmt(V)} mL d’eau de mer (en g) ?`, num(m, 'g'), 'Convertis le volume en litres (ou cherche combien de fois il est contenu dans 1 L), puis utilise la proportionnalité.', `${fmt(V)} mL = ${fmt(div(V, 1000))} L ; ${fmt(div(V, 1000))} × 35 = <b>${fmt(m)}</b> g de sel.`);
      }
      const [q, ans, ds, why] = rng.pick([
        ['On filtre de l’eau salée un peu boueuse. Le filtrat est-il encore salé ?', 'Oui, le sel dissous traverse le filtre', ['Non, le filtre retient le sel', 'Non, le sel est resté avec la boue', 'Oui, mais seulement s’il est chaud'], 'Le filtre ne retient que les particules solides non dissoutes.'],
        ['On veut récupérer à la fois l’eau pure et le sel d’une eau salée. Quelle technique choisir ?', 'La distillation', ['L’évaporation à l’air libre', 'La filtration', 'La décantation'], 'L’évaporation à l’air libre fait perdre l’eau ; la distillation la recueille.'],
        ['Une eau boueuse a été décantée puis filtrée : elle est limpide. Peut-on la boire sans risque ?', 'Non, elle peut contenir des microbes et des substances dissoutes', ['Oui, car elle est limpide', 'Oui, car elle a été filtrée deux fois', 'Oui, si elle est froide'], 'Limpide ne veut pas dire potable : il faut encore la désinfecter et la contrôler.'],
        ['Pourquoi décante-t-on souvent un mélange avant de le filtrer ?', 'Pour que le filtre ne se bouche pas trop vite', ['Pour dissoudre le sable', 'Pour rendre le mélange homogène', 'Pour faire évaporer l’eau'], 'Les plus grosses particules tombent au fond avant la filtration.'],
      ]);
      return Q(`pcs3c:${q.slice(0, 24)}`, q, choice(rng, ans, ds), 'Que retient un filtre ? Que garde-t-on lors d’une évaporation ? d’une distillation ?', `<b>${ans}</b>. ${why}`);
    },
  });

  // ===================== CORPS PUR OU MÉLANGE =====================
  const PURS = ['l’eau distillée', 'le dioxygène', 'le diazote', 'le sucre (saccharose)', 'le chlorure de sodium pur', 'le fer', 'le cuivre', 'l’éthanol pur', 'le dioxyde de carbone'];
  const MELS = ['l’eau minérale', 'l’air', 'le jus d’orange', 'le lait', 'l’eau du robinet', 'l’eau de mer', 'le vinaigre', 'le sirop de menthe', 'le laiton (cuivre et zinc)', 'le soda'];
  const IONS = [['Calcium', 40, 120], ['Magnésium', 5, 30], ['Sodium', 2, 20], ['Potassium', 1, 5], ['Hydrogénocarbonates', 100, 400], ['Sulfates', 10, 60], ['Chlorures', 2, 20], ['Nitrates', 1, 9]];
  const BRANDS = ['Source des Sapins', 'Eau du Puy', 'Fontaine Claire', 'Source du Val'];
  const label = (rng, k) => {
    const ions = rng.sample(IONS, k).map(([n, lo, hi]) => [n, rng.int(lo, hi)]);
    return { ions, html: table([['Composition (mg/L)', ''], ...ions], { cls: 'label' }) };
  };
  const CP_VF = [
    ['Une eau limpide et transparente est forcément un corps pur.', false, 'L’eau minérale est limpide mais contient des substances dissoutes : c’est un mélange.'],
    ['Quand une étiquette dit « eau pure », c’est un corps pur au sens de la chimie.', false, 'Sur une étiquette, « pure » veut dire « sans pollution » ; elle contient des sels minéraux : c’est un mélange.'],
    ['Un corps pur ne contient qu’une seule substance.', true, 'C’est la définition d’un corps pur.'],
    ['L’eau distillée laisse un dépôt solide quand on la fait évaporer.', false, 'L’eau distillée ne contient rien de dissous : elle ne laisse <b>aucun</b> dépôt.'],
    ['Un corps pur change d’état à température constante (palier).', true, 'C’est un moyen de reconnaître un corps pur.'],
    ['L’air est un corps pur, car c’est un gaz.', false, 'L’air est un mélange de gaz (diazote, dioxygène…).'],
    ['L’eau minérale laisse un dépôt blanc quand on la fait évaporer.', true, 'Les sels minéraux dissous restent : c’est la preuve que c’est un mélange.'],
  ];

  M.notion('pc-corps-pur-melange', {
    lesson: {
      retenir: `Un <b>corps pur</b> est constitué d’une <b>seule substance</b> (eau distillée, dioxygène, sucre). Un <b>mélange</b> en contient plusieurs (eau minérale, air, jus d’orange).<br>Pour les distinguer : un corps pur change d’état à température constante (palier) ; l’eau distillée ne laisse aucun dépôt quand on la fait évaporer, alors que l’eau minérale laisse un dépôt de sels minéraux.`,
      methode: [
        'Demande-toi si la matière contient une seule substance ou plusieurs.',
        'Lis l’étiquette : si elle liste plusieurs substances dissoutes, c’est un mélange.',
        'Ne te fie pas à l’aspect : limpide ne veut pas dire pur.',
        'Pour une quantité sur une étiquette (en mg/L), multiplie par le volume en litres.',
      ],
      exemples: [
        { q: 'L’eau minérale est-elle un corps pur ?', r: '<b>Non</b> : elle contient des sels minéraux dissous.' },
        { q: 'Calcium : 80 mg/L. Masse de calcium dans 1,5 L ?', r: '80 × 1,5 = <b>120 mg</b>.' },
        { q: 'Le dioxygène ?', r: 'Une seule substance : <b>corps pur</b>.' },
      ],
      astuces: ['Dans la vie courante, « pur » veut dire « propre » ; en chimie, cela veut dire « une seule substance ».'],
      erreurs: [
        'Croire que l’eau du robinet ou l’eau minérale est un corps pur.',
        'Confondre mélange homogène et corps pur.',
        'Oublier de multiplier par le volume quand l’étiquette donne des mg par litre.',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        const pur = rng.chance(0.5), m = rng.pick(pur ? PURS : MELS);
        return Q(`pcpm1:${m}`, `${cap(m)} est-${/^(l’eau|l’air|la )/.test(m) ? 'elle' : 'il'} un corps pur ou un mélange ?`.replace('l’air est-elle', 'l’air est-il').replace('L’air est-elle', 'L’air est-il'), fixedChoice(['Un corps pur', 'Un mélange'], pur ? 'Un corps pur' : 'Un mélange'), 'Contient-il une seule substance ou plusieurs ?', pur ? `<b>Un corps pur</b> : ${m} ne contient qu’une seule substance.` : `<b>Un mélange</b> : ${m} contient plusieurs substances.`);
      }
      if (level === 2) {
        const r = rng.next(), b = rng.pick(BRANDS);
        if (r < 0.35) {
          const k = rng.int(3, 6), L = label(rng, k);
          return Q(`pcpm2n:${b}:${L.ions.map(i => i[0])}`, `Voici l’étiquette de l’eau minérale « ${b} » :${L.html}Combien de substances dissoutes sont indiquées sur cette étiquette ?`, num(k), 'Compte les lignes de la composition.', `L’étiquette indique <b>${fmt(k)}</b> substances dissoutes, en plus de l’eau : c’est un mélange.`);
        }
        if (r < 0.75) {
          const L = label(rng, 4), [ion, c] = rng.pick(L.ions), V = rng.pick([0.5, 1.5, 2, 0.25, 1, 5]), m = mul(c, V);
          return Q(`pcpm2m:${b}:${ion}:${c}:${V}`, `Voici l’étiquette de l’eau minérale « ${b} » :${L.html}Quelle masse de ${ion.toLowerCase()} contient une bouteille de ${fmt(V)} L (en mg) ?`, num(m, 'mg'), 'L’étiquette donne la masse pour 1 litre. Combien de litres dans la bouteille ?', `${fmt(c)} mg par litre × ${fmt(V)} L = <b>${fmt(m)}</b> mg.`);
        }
        const [q, ans, ds] = rng.pick([
          ['On fait évaporer quelques gouttes d’eau distillée et d’eau minérale sur deux plaques. Que voit-on ?', 'Un dépôt seulement avec l’eau minérale', ['Un dépôt avec les deux eaux', 'Un dépôt seulement avec l’eau distillée', 'Aucun dépôt dans les deux cas']],
          ['On refroidit deux liquides jusqu’à leur solidification. Lequel est un corps pur ?', 'Celui dont la courbe présente un palier', ['Celui qui gèle le plus vite', 'Celui dont la température baisse sans arrêt', 'Celui qui est le plus transparent']],
        ]);
        return Q(`pcpm2c:${q.slice(0, 20)}`, q, choice(rng, ans, ds), 'Un corps pur contient une seule substance : pas de reste après évaporation, et un palier lors d’un changement d’état.', `<b>${ans}</b>.`);
      }
      const r = rng.next();
      if (r < 0.45) {
        const rs = 10 * rng.int(5, 60), V = rng.pick([0.5, 1.5, 2, 0.25, 0.75, 6]), m = mul(rs, V), b = rng.pick(BRANDS);
        return Q(`pcpm3r:${rs}:${V}`, `Sur l’étiquette de l’eau « ${b} », on lit : « résidu sec à 180 °C : ${fmt(rs)} mg/L ». C’est la masse de solide qui reste quand on fait évaporer 1 L d’eau. Quelle masse de dépôt obtiendrait-on en faisant évaporer ${fmt(V)} L de cette eau (en mg) ?`, num(m, 'mg'), 'La masse du dépôt est proportionnelle au volume d’eau évaporé.', `${fmt(rs)} × ${fmt(V)} = <b>${fmt(m)}</b> mg de dépôt : cette eau est bien un mélange.`);
      }
      const [s, b, why] = rng.pick(CP_VF);
      return Q(`pcpm3:${s.slice(0, 24)}`, `Vrai ou faux ? « ${s} »`, vf(b), 'En chimie, « pur » veut dire « une seule substance ».', `<b>${b ? 'Vrai' : 'Faux'}</b>. ${why}`);
    },
  });

  // ===================== SOLUBILITÉ =====================
  const DISS = [
    ['du sel', 'l’eau', 'l’eau salée', 'Hugo verse du sel dans une casserole d’eau et remue.'],
    ['du sucre', 'l’eau', 'l’eau sucrée', 'Léa dissout du sucre dans un verre d’eau.'],
    ['du sirop de menthe', 'l’eau', 'la boisson à la menthe', 'Noah verse un peu de sirop de menthe dans un grand verre d’eau.'],
    ['du sulfate de cuivre', 'l’eau', 'la solution bleue', 'Au laboratoire, Inès dissout des cristaux bleus de sulfate de cuivre dans de l’eau.'],
    ['du café soluble', 'l’eau chaude', 'le café', 'Sam dissout une cuillère de café soluble dans de l’eau chaude.'],
    ['du bicarbonate de sodium', 'l’eau', 'la solution de bicarbonate', 'Jade dissout du bicarbonate de sodium dans de l’eau.'],
  ];
  const SOLU = [{ n: 'sel', s: 360 }, { n: 'sucre', s: 2000 }, { n: 'bicarbonate de sodium', s: 100 }];
  const ofS = n => (/^[aeiou]/.test(n) ? `d’${n}` : `de ${n}`);
  const solTable = () => table([['Soluté', ...SOLU.map(s => cap(s.n))], ['Masse maximale dans 1 L d’eau (g)', ...SOLU.map(s => s.s)]], { head: false });

  M.notion('pc-solubilite', {
    lesson: {
      retenir: `Quand on dissout un <b>soluté</b> (sel, sucre…) dans un <b>solvant</b> (souvent l’eau), on obtient une <b>solution</b>, un mélange homogène. Masse de la solution = masse du solvant + masse du soluté.<br>On ne peut pas dissoudre une quantité illimitée de soluté : au-delà d’une masse maximale, la <b>solubilité</b>, le solide ne se dissout plus et reste au fond : la solution est <b>saturée</b>. À 20 °C, on peut dissoudre au maximum environ 360 g de sel dans 1 L d’eau. Cette masse maximale est proportionnelle au volume d’eau.`,
      methode: [
        'Repère le soluté (ce qu’on dissout), le solvant (ce qui dissout) et la solution (le mélange obtenu).',
        'Pour la masse maximale dans un autre volume d’eau, utilise la proportionnalité : 250 mL, c’est le quart d’1 L.',
        'Compare la masse ajoutée avec la masse maximale : si elle est plus grande, la solution est saturée et l’excédent reste au fond.',
        'Pour la masse de la solution, additionne : 1 mL d’eau a une masse de 1 g.',
      ],
      exemples: [
        { q: 'Sel : 360 g par litre au maximum. Dans 250 mL ?', r: '360 ÷ 4 = <b>90 g</b>.' },
        { q: '20 g de sucre dans 200 g d’eau : masse de la solution ?', r: '200 + 20 = <b>220 g</b>.' },
        { q: '100 g de sel dans 250 mL d’eau ?', r: 'Maximum 90 g : solution <b>saturée</b>, il reste 10 g au fond.' },
      ],
      astuces: ['Le sucre se dissout mieux dans l’eau chaude : la solubilité dépend de la température.'],
      erreurs: [
        'Dire que le sucre « fond » dans le thé : il se <b>dissout</b> (la fusion, c’est solide → liquide par chauffage).',
        'Croire que la masse disparaît quand le sucre se dissout : la masse de la solution est la somme des deux.',
        'Croire qu’on peut dissoudre autant de sel qu’on veut.',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        if (rng.chance(0.8)) {
          const [so0, sv, sn, ctx] = rng.pick(DISS), so = so0.replace(/^du /, 'le '), role = rng.int(0, 2), names = ['le soluté', 'le solvant', 'la solution'];
          const opts = [cap(so), cap(sv), cap(sn)];
          return Q(`pcsol1:${so}:${role}`, `${ctx} ${role === 2 ? 'Quelle' : 'Quel'} est ${names[role]} ?`, choice(rng, opts[role], opts.filter((_, i) => i !== role)), 'Le soluté est dissous, le solvant dissout, la solution est le mélange obtenu.', `Soluté : ${so} ; solvant : ${sv} ; solution : ${sn}. Ici, ${names[role]} est <b>${[so, sv, sn][role]}</b>.`);
        }
        const [q, ans, ds] = rng.pick([
          ['On ajoute du sel dans de l’eau en remuant. À partir d’un moment, le sel ne se dissout plus et reste au fond. La solution est…', 'saturée', ['diluée', 'pure', 'hétérogène dès le début']],
          ['Une solution d’eau sucrée bien limpide est…', 'un mélange homogène', ['un corps pur', 'un mélange hétérogène', 'un solide']],
        ]);
        return Q(`pcsol1c:${ans}`, q, choice(rng, ans, ds), 'Une quantité limitée de soluté peut se dissoudre dans un volume donné de solvant.', `<b>${cap(ans)}</b>.`);
      }
      if (level === 2) {
        const S = rng.pick(SOLU), V = rng.pick([50, 100, 200, 250, 500, 750]);
        if (rng.chance(0.55)) {
          const m = div(mul(S.s, V), 1000);
          return Q(`pcsol2m:${S.n}:${V}`, `${solTable()}Quelle masse maximale ${ofS(S.n)} peut-on dissoudre dans ${fmt(V)} mL d’eau (en g) ?`, num(m, 'g'), 'Quelle fraction d’un litre représente ce volume d’eau ? La masse maximale est proportionnelle au volume.', `${fmt(V)} mL = ${fmt(div(V, 1000))} L, donc ${fmt(S.s)} × ${fmt(div(V, 1000))} = <b>${fmt(m)}</b> g.`);
        }
        const m = rng.int(2, 9) * (S.n === 'sucre' ? 20 : 5), max = div(mul(S.s, V), 1000), mm = Math.min(m, max - 1);
        return Q(`pcsol2s:${S.n}:${V}:${mm}`, `On dissout complètement ${fmt(mm)} g ${ofS(S.n)} dans ${fmt(V)} mL d’eau (1 mL d’eau a une masse de 1 g). Quelle est la masse de la solution obtenue (en g) ?`, num(V + mm, 'g'), 'Que devient la masse du soluté quand il se dissout ?', `Masse d’eau : ${fmt(V)} g. Masse de la solution : ${fmt(V)} + ${fmt(mm)} = <b>${fmt(V + mm)}</b> g (rien ne disparaît).`);
      }
      const r = rng.next();
      if (r < 0.35) {
        const V = rng.pick([50, 100, 200, 250, 500]), max = div(mul(360, V), 1000), extra = rng.int(2, 30), m = max + extra;
        return Q(`pcsol3r:${V}:${m}`, `${solTable()}Chloé verse ${fmt(m)} g de sel dans ${fmt(V)} mL d’eau et remue longtemps. Quelle masse de sel reste au fond, non dissoute (en g) ?`, num(extra, 'g'), 'Calcule d’abord la masse maximale de sel qui peut se dissoudre dans ce volume.', `Au maximum : 360 × ${fmt(div(V, 1000))} = ${fmt(max)} g se dissolvent. Il reste ${fmt(m)} − ${fmt(max)} = <b>${fmt(extra)}</b> g au fond : la solution est saturée.`);
      }
      if (r < 0.6) {
        const V = rng.pick([50, 100, 150, 200, 250, 300, 500]), m = div(mul(36, V), 100);
        return Q(`pcsol3v:${V}`, `On peut dissoudre au maximum 36 g de sel dans 100 mL d’eau. Quel volume d’eau faut-il au minimum pour dissoudre ${fmt(m)} g de sel (en mL) ?`, num(V, 'mL'), 'Masse maximale et volume d’eau sont proportionnels : combien de fois 36 g dans la masse donnée ?', `${fmt(m)} ÷ 36 = ${fmt(div(V, 100))}, donc il faut ${fmt(div(V, 100))} × 100 = <b>${fmt(V)}</b> mL d’eau.`);
      }
      if (r < 0.8) {
        const V = rng.pick([100, 200, 250, 500]), max = div(mul(360, V), 1000), m = max + rng.pick([-20, -10, -5, 5, 10, 20]), sat = m > max;
        return Q(`pcsol3o:${V}:${m}`, `${solTable()}On met ${fmt(m)} g de sel dans ${fmt(V)} mL d’eau. Tout le sel va-t-il se dissoudre ?`, yesNo(!sat), 'Calcule la masse maximale de sel pour ce volume d’eau, puis compare.', `Maximum dans ${fmt(V)} mL : ${fmt(max)} g. ${sat ? `${fmt(m)} g &gt; ${fmt(max)} g : <b>Non</b>, la solution est saturée.` : `${fmt(m)} g &lt; ${fmt(max)} g : <b>Oui</b>, tout se dissout.`}`);
      }
      const [s, b, why] = rng.pick([
        ['Quand Inès met du sucre dans son thé, le sucre fond.', false, 'Le sucre se <b>dissout</b> : c’est une dissolution, pas une fusion (il n’est pas chauffé jusqu’à devenir liquide).'],
        ['Quand on dissout 10 g de sel dans 100 g d’eau, on obtient 110 g de solution.', true, 'La masse se conserve lors d’une dissolution : 100 + 10 = 110 g.'],
        ['Quand le sucre se dissout, il disparaît : la masse de la solution est égale à celle de l’eau.', false, 'Le sucre est toujours là (l’eau est sucrée) : la masse de la solution est la somme des deux.'],
        ['On dissout plus de sucre dans de l’eau chaude que dans de l’eau froide.', true, 'La solubilité du sucre augmente avec la température.'],
      ]);
      return Q(`pcsol3t:${s.slice(0, 24)}`, `Vrai ou faux ? « ${s} »`, vf(b), 'Dissoudre n’est pas fondre ; et la masse se conserve.', `<b>${b ? 'Vrai' : 'Faux'}</b>. ${why}`);
    },
  });

  // ===================== MISCIBILITÉ =====================
  // [a, b, miscible, liquid on top if not miscible, masses (g) of 100 mL of a and b]
  const PAIRS = [
    ['l’eau', 'l’huile', false, 'l’huile', 100, 92], ['l’eau', 'l’alcool (éthanol)', true], ['l’eau', 'le sirop de grenadine', true], ['l’eau', 'le vinaigre', true],
    ['l’eau', 'le white-spirit', false, 'le white-spirit', 100, 78], ['l’eau', 'le pétrole', false, 'le pétrole', 100, 80], ['l’huile', 'le vinaigre', false, 'l’huile', 92, 101],
    ['l’eau', 'le lait', true], ['l’eau', 'le cyclohexane', false, 'le cyclohexane', 100, 78], ['l’eau', 'le jus de citron', true],
    ['l’eau', 'le dichlorométhane', false, 'l’eau', 100, 133], ['l’huile', 'la glycérine', false, 'l’huile', 92, 126],
  ];
  const NON_MISC = PAIRS.filter(p => !p[2]);

  M.notion('pc-miscibilite', {
    lesson: {
      retenir: `Deux liquides sont <b>miscibles</b> s’ils se mélangent pour former un mélange <b>homogène</b> (eau et sirop, eau et alcool). Ils sont <b>non miscibles</b> s’ils forment deux couches séparées, un mélange <b>hétérogène</b> (eau et huile).<br>Le liquide qui reste au-dessus est le plus « léger » à volume égal : l’huile flotte sur l’eau, comme le pétrole lors d’une marée noire.`,
      methode: [
        'Verse les deux liquides dans un tube, agite, puis laisse reposer.',
        'Une seule phase : miscibles ; deux couches : non miscibles.',
        'Pour savoir lequel est au-dessus, compare les masses d’un même volume : le plus léger flotte.',
      ],
      exemples: [
        { q: 'Eau et huile ?', r: '<b>Non miscibles</b> : l’huile reste au-dessus.' },
        { q: 'Eau et sirop ?', r: '<b>Miscibles</b> : un seul liquide coloré.' },
        { q: '100 mL d’eau : 100 g ; 100 mL de dichlorométhane : 133 g.', r: 'Le dichlorométhane coule : <b>l’eau est au-dessus</b>.' },
      ],
      astuces: ['Une vinaigrette agitée semble mélangée, mais au repos l’huile remonte : huile et vinaigre ne sont pas miscibles.'],
      erreurs: [
        'Croire que tous les liquides se mélangent à l’eau.',
        'Croire que l’huile est toujours au-dessus de n’importe quel liquide : il faut comparer.',
        'Confondre « miscible » (deux liquides) et « soluble » (un solide dans un liquide).',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        const [a, b, mis] = rng.pick(PAIRS);
        return Q(`pcmi1:${b}:${a}`, `${cap(a)} et ${b} sont-ils miscibles ?`, yesNo(mis), 'Après agitation et repos, voit-on un seul liquide ou deux couches ?', mis ? `<b>Oui</b> : ils forment un mélange homogène, on ne voit qu’un seul liquide.` : `<b>Non</b> : ils forment deux couches séparées (mélange hétérogène) ; ${PAIRS.find(p => p[1] === b && p[0] === a)[3]} reste au-dessus.`);
      }
      if (level === 2) {
        if (rng.chance(0.6)) {
          const [a, b, , top] = rng.pick(NON_MISC.filter(p => p[1] !== 'le dichlorométhane'));
          return Q(`pcmi2t:${a}:${b}`, `On verse ${de(a)} et ${de(b)} dans un tube, on agite, puis on laisse reposer. Quel liquide se retrouve au-dessus ?`, fixedChoice([cap(a), cap(b), 'Aucun : ils se mélangent'], cap(top)), 'Ces deux liquides ne sont pas miscibles. Pense à une marée noire ou à une vinaigrette.', `<b>${cap(top)}</b> flotte au-dessus : à volume égal, ${top} est plus léger${top === 'l’huile' ? 'e' : ''}.`);
        }
        const [m, n] = rng.pick([['de l’eau et de l’huile', 2], ['de l’eau et du sirop', 1], ['de l’eau et de l’alcool', 1], ['de l’eau, du sirop et de l’huile', 2], ['de l’eau et du cyclohexane', 2], ['de l’eau, du vinaigre et de l’huile', 2], ['de l’eau et du lait', 1]]);
        return Q(`pcmi2n:${m}`, `On mélange ${m}, puis on laisse reposer. Combien de couches de liquide observe-t-on ?`, num(n), 'Les liquides miscibles ne forment qu’une seule couche.', `On observe <b>${fmt(n)}</b> couche${n > 1 ? 's' : ''}.`);
      }
      if (rng.chance(0.6)) {
        const [a, b, , top, ma, mb] = rng.pick(NON_MISC);
        return Q(`pcmi3:${a}:${b}`, `${cap(a)} et ${b} ne sont pas miscibles. 100 mL ${a.replace(/^l’/, 'd’').replace(/^le /, 'de ').replace(/^la /, 'de ')} ont une masse de ${fmt(ma)} g ; 100 mL ${b.replace(/^l’/, 'd’').replace(/^le /, 'de ').replace(/^la /, 'de ')}, ${fmt(mb)} g. Quel liquide est au-dessus ?`, fixedChoice([cap(a), cap(b)], cap(top)), 'À volume égal, le liquide le plus léger flotte sur l’autre.', `${fmt(Math.min(ma, mb))} g &lt; ${fmt(Math.max(ma, mb))} g : à volume égal, le liquide le plus léger est ${top}. C’est donc <b>${top}</b> qui reste au-dessus.`);
      }
      const [s, b, why] = rng.pick([
        ['Deux liquides miscibles forment un mélange homogène.', true, 'On ne voit plus qu’un seul liquide.'],
        ['Si on agite très fort de l’eau et de l’huile, elles restent mélangées pour toujours.', false, 'Au repos, l’huile remonte et forme à nouveau une couche au-dessus.'],
        ['Tous les liquides flottent sur l’eau.', false, 'Certains liquides non miscibles, comme le dichlorométhane, sont plus lourds que l’eau à volume égal et coulent.'],
        ['Le sirop et l’eau sont miscibles.', true, 'On obtient un seul liquide coloré.'],
        ['Lors d’une marée noire, le pétrole flotte sur la mer.', true, 'Le pétrole n’est pas miscible à l’eau et il est plus léger à volume égal.'],
      ]);
      return Q(`pcmi3v:${s.slice(0, 24)}`, `Vrai ou faux ? « ${s} »`, vf(b), 'Miscibles : une seule couche. Non miscibles : le plus léger à volume égal est au-dessus.', `<b>${b ? 'Vrai' : 'Faux'}</b>. ${why}`);
    },
  });

  // ===================== COMPOSITION DE L’AIR =====================
  const GAZ = { O: ['dioxygène', 21, 'O<sub>2</sub>'], N: ['diazote', 78, 'N<sub>2</sub>'], A: ['autres gaz', 1, ''] };

  M.notion('pc-air', {
    lesson: {
      retenir: `L’air est un <b>mélange</b> de gaz. En volume, il contient environ :<ul><li><b>78 %</b> de <b>diazote</b> (N<sub>2</sub>), soit environ 4/5 ;</li><li><b>21 %</b> de <b>dioxygène</b> (O<sub>2</sub>), soit environ 1/5 ;</li><li><b>1 %</b> d’autres gaz (argon, dioxyde de carbone, vapeur d’eau…).</li></ul>Le dioxygène est indispensable à la respiration et aux combustions.`,
      methode: [
        'Repère le gaz demandé et son pourcentage : 78 % (diazote), 21 % (dioxygène), 1 % (autres).',
        'Calcule le pourcentage d’un volume : volume × pourcentage ÷ 100.',
        'Si on connaît le volume d’un gaz et qu’on cherche le volume d’air, fais l’inverse : divise par le pourcentage puis multiplie par 100.',
      ],
      exemples: [
        { q: 'Volume de dioxygène dans 200 L d’air ?', r: '200 × 21 ÷ 100 = <b>42 L</b>.' },
        { q: 'Volume de diazote dans 50 L d’air ?', r: '50 × 78 ÷ 100 = <b>39 L</b>.' },
        { q: 'Le gaz le plus abondant ?', r: 'Le <b>diazote</b>.' },
      ],
      astuces: ['Retiens « 4/5 – 1/5 » : quatre cinquièmes de diazote, un cinquième de dioxygène.'],
      erreurs: [
        'Croire que l’air est surtout fait de dioxygène.',
        'Croire que l’air est un corps pur.',
        'Confondre le dioxygène (O<sub>2</sub>) et le dioxyde de carbone (CO<sub>2</sub>), qui ne représente qu’environ 0,04 % de l’air.',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        const [q, ans, ds] = rng.pick([
          ['Quel gaz est le plus abondant dans l’air ?', 'Le diazote', ['Le dioxygène', 'Le dioxyde de carbone', 'La vapeur d’eau']],
          ['Quel pourcentage de l’air (en volume) le dioxygène représente-t-il environ ?', '21 %', ['78 %', '50 %', '1 %']],
          ['Quel pourcentage de l’air (en volume) le diazote représente-t-il environ ?', '78 %', ['21 %', '100 %', '50 %']],
          ['L’air est…', 'un mélange de gaz', ['un corps pur', 'un seul gaz : le dioxygène', 'un liquide']],
          ['Quel gaz de l’air est indispensable à la respiration et aux combustions ?', 'Le dioxygène', ['Le diazote', 'L’argon', 'Le dioxyde de carbone']],
          ['Quelle est la formule du dioxygène ?', 'O<sub>2</sub>', ['N<sub>2</sub>', 'CO<sub>2</sub>', 'H<sub>2</sub>O']],
          ['Quelle est la formule du diazote ?', 'N<sub>2</sub>', ['O<sub>2</sub>', 'CO<sub>2</sub>', 'H<sub>2</sub>O']],
          ['Environ quelle fraction de l’air est du dioxygène ?', '1/5', ['4/5', '1/2', '1/10']],
          ['Environ quelle fraction de l’air est du diazote ?', '4/5', ['1/5', '1/2', '9/10']],
          ['Le dioxyde de carbone représente dans l’air…', 'moins de 1 %', ['environ 21 %', 'environ 78 %', 'la moitié']],
        ]);
        return Q(`pca1:${q.slice(0, 28)}`, q, choice(rng, ans, ds), 'Pense au « 4/5 – 1/5 » de l’air.', `<b>${cap(ans)}</b>. L’air contient environ 78 % de diazote (N<sub>2</sub>), 21 % de dioxygène (O<sub>2</sub>) et 1 % d’autres gaz.`);
      }
      if (level === 2) {
        const g = rng.pick(['O', 'O', 'N', 'A']), [name, p] = GAZ[g], m3 = rng.chance(0.3);
        const V = m3 ? rng.pick([50, 100, 150, 200, 250, 300]) : 50 * rng.int(1, 20), u = m3 ? 'm³' : 'L', v = pct(p, V);
        const ctx = m3 ? `Une salle de classe contient ${fmt(V)} m³ d’air.` : `Un ballon contient ${fmt(V)} L d’air.`;
        return Q(`pca2:${g}:${V}:${u}`, `${ctx} Quel volume ${g === 'A' ? 'd’autres gaz' : `de ${name}`} contient-${m3 ? 'elle' : 'il'} environ (en ${u}) ?`, num(v, u), `Quel est le pourcentage de ${name} dans l’air ? Applique-le au volume.`, `${name === 'autres gaz' ? 'Autres gaz' : cap(name)} : ${p} % de l’air. ${fmt(V)} × ${p} ÷ 100 = <b>${fmt(v)}</b> ${u}.`);
      }
      const r = rng.next();
      if (r < 0.35) {
        const V = 100 * rng.int(1, 12), o = pct(21, V);
        return Q(`pca3r:${V}`, `Un récipient d’air contient ${fmt(o)} L de dioxygène. Quel est le volume total d’air (en L) ?`, num(V, 'L'), 'Le dioxygène représente 21 % de l’air : cherche par combien multiplier le volume de dioxygène.', `${fmt(o)} ÷ 21 = ${fmt(V / 100)}, donc ${fmt(V / 100)} × 100 = <b>${fmt(V)}</b> L d’air.`);
      }
      if (r < 0.6) {
        const [L, l, h] = rng.pick([[5, 4, 2.5], [8, 5, 2.5], [10, 6, 3], [6, 5, 2], [4, 3, 2.5], [10, 8, 2.5]]), V = mul(mul(L, l), h), o = pct(21, V);
        return Q(`pca3p:${L}:${l}:${h}`, `Une pièce a la forme d’un pavé droit de ${fmt(L)} m × ${fmt(l)} m × ${fmt(h)} m. Quel volume de dioxygène contient-elle environ (en m³) ?`, num(o, 'm³'), 'Calcule d’abord le volume de la pièce, puis applique le pourcentage de dioxygène.', `Volume : ${fmt(L)} × ${fmt(l)} × ${fmt(h)} = ${fmt(V)} m³. Dioxygène : ${fmt(V)} × 21 ÷ 100 = <b>${fmt(o)}</b> m³.`);
      }
      if (r < 0.8) {
        const V = rng.pick([1, 2, 5, 10, 0.5]), rest = mul(V, 790);
        return Q(`pca3o:${V}`, `Une bougie brûle dans un bocal fermé de ${fmt(V)} L d’air et consomme tout le dioxygène (sans produire d’autre gaz, pour simplifier). Quel volume de gaz reste-t-il (en mL) ?`, num(rest, 'mL'), 'Quel pourcentage de l’air n’est pas du dioxygène ? Pense à convertir en mL.', `${fmt(V)} L = ${fmt(mul(V, 1000))} mL. Il reste 100 − 21 = 79 % : ${fmt(mul(V, 1000))} × 79 ÷ 100 = <b>${fmt(rest)}</b> mL.`);
      }
      const V = 100 * rng.int(1, 10), v = pct(99, V);
      return Q(`pca3s:${V}`, `Quel volume de diazote et de dioxygène <b>réunis</b> y a-t-il dans ${fmt(V)} L d’air (en L) ?`, num(v, 'L'), 'Additionne d’abord les deux pourcentages.', `78 % + 21 % = 99 % ; ${fmt(V)} × 99 ÷ 100 = <b>${fmt(v)}</b> L.`);
    },
  });

  // ===================== TRANSFORMATION PHYSIQUE OU CHIMIQUE =====================
  const CHIM = ['Une bûche brûle dans la cheminée.', 'Un clou rouille sous la pluie.', 'On fait cuire un œuf.', 'Du vinaigre versé sur du calcaire fait apparaître des bulles de gaz.', 'Une allumette brûle.', 'Le pain grille dans le grille-pain.', 'Un comprimé effervescent fait des bulles dans l’eau.', 'Le lait tourne et devient aigre.', 'Le gaz de la cuisinière brûle.', 'Du sucre chauffé très fort devient du caramel.', 'Le bois d’une vieille barrière pourrit.'];
  const PHYS = ['Un glaçon fond dans un verre.', 'Le sucre se dissout dans le thé.', 'On broie du poivre en poudre.', 'L’eau bout dans la casserole.', 'Le chocolat fond au bain-marie.', 'On découpe une feuille de papier.', 'De la buée se forme sur un miroir.', 'On mélange de l’eau et du sirop.', 'Le beurre fond dans la poêle.', 'On filtre de l’eau boueuse.', 'De l’eau gèle au congélateur.'];
  const TC = ['Transformation physique', 'Transformation chimique'];

  M.notion('pc-transfo-chimique', {
    lesson: {
      retenir: `Lors d’une <b>transformation chimique</b>, des substances disparaissent (les <b>réactifs</b>) et de <b>nouvelles substances</b> apparaissent (les <b>produits</b>) : combustion, rouille, cuisson, vinaigre sur du calcaire…<br>Lors d’une <b>transformation physique</b> (changement d’état, dissolution, broyage, découpage), les substances restent les mêmes : la glace fondue est toujours de l’eau, le sucre dissous est toujours du sucre.<br>Indices d’une transformation chimique : apparition d’un gaz, d’une couleur ou d’une odeur nouvelles, d’un solide nouveau…`,
      methode: [
        'Demande-toi : après la transformation, a-t-on encore les mêmes substances ?',
        'Si oui (même substance sous un autre état, en morceaux ou dissoute) : transformation physique.',
        'Si une nouvelle substance apparaît : transformation chimique.',
        'Pour identifier le dioxyde de carbone produit, on utilise l’eau de chaux : elle se trouble.',
      ],
      exemples: [
        { q: 'Le chocolat fond.', r: 'Toujours du chocolat : <b>physique</b>.' },
        { q: 'Un clou rouille.', r: 'La rouille est une nouvelle substance : <b>chimique</b>.' },
        { q: 'Combustion du charbon : réactifs ?', r: 'Le <b>carbone</b> et le <b>dioxygène</b> ; produit : le dioxyde de carbone.' },
      ],
      astuces: ['Les bulles d’une eau qui bout sont de la vapeur d’eau (physique) ; celles d’un comprimé effervescent sont un nouveau gaz (chimique).'],
      erreurs: [
        'Croire que le sucre qui se dissout « disparaît » et subit une transformation chimique.',
        'Croire que toute apparition de bulles est une transformation chimique.',
        'Confondre fusion (physique) et combustion (chimique) pour une bougie : les deux ont lieu.',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        const ch = rng.chance(0.5), s = rng.pick(ch ? CHIM : PHYS);
        return Q(`pctc1:${s.slice(0, 30)}`, `${s} Est-ce une transformation physique ou chimique ?`, fixedChoice(TC, ch ? TC[1] : TC[0]), 'Une nouvelle substance apparaît-elle ?', ch ? `<b>${TC[1]}</b> : une nouvelle substance apparaît.` : `<b>${TC[0]}</b> : la substance reste la même (elle change d’état, de forme, ou se mélange).`);
      }
      if (level === 2) {
        const [q, ans, ds, why] = rng.pick([
          ['Quel indice montre qu’une transformation chimique a eu lieu ?', 'Une nouvelle substance apparaît', ['La substance change d’état', 'La substance est coupée en morceaux', 'La substance se dissout']],
          ['Lors de la combustion du charbon de bois (carbone), quel gaz de l’air est consommé ?', 'Le dioxygène', ['Le diazote', 'Le dioxyde de carbone', 'La vapeur d’eau'], 'Une combustion a besoin de dioxygène.'],
          ['Lors de la combustion du carbone, quel gaz est produit ?', 'Le dioxyde de carbone', ['Le dioxygène', 'Le diazote', 'Le dihydrogène'], 'On le met en évidence avec l’eau de chaux qui se trouble.'],
          ['Quel gaz trouble l’eau de chaux ?', 'Le dioxyde de carbone', ['Le dioxygène', 'Le diazote', 'La vapeur d’eau'], 'C’est le test du dioxyde de carbone.'],
          ['Quand on verse du vinaigre sur du calcaire, quel gaz se forme ?', 'Le dioxyde de carbone', ['Le dioxygène', 'La vapeur d’eau', 'Le diazote'], 'Le gaz trouble l’eau de chaux.'],
          ['Pour rouiller, le fer réagit avec…', 'le dioxygène de l’air (en présence d’eau)', ['le diazote de l’air', 'la lumière seulement', 'rien : il se transforme tout seul'], 'Un clou dans de l’air sec rouille très peu.'],
          ['Pourquoi la fusion de la glace est-elle une transformation physique ?', 'C’est toujours de l’eau : aucune nouvelle substance', ['Parce qu’on la chauffe', 'Parce qu’elle produit un gaz', 'Parce que la masse change'], 'Seul l’état change.'],
          ['Lors d’une transformation chimique, comment appelle-t-on les substances qui disparaissent ?', 'Les réactifs', ['Les produits', 'Les solutés', 'Les solvants'], 'Les substances qui apparaissent sont les produits.'],
        ]);
        return Q(`pctc2:${q.slice(0, 28)}`, q, choice(rng, ans, ds), 'Transformation chimique = des substances disparaissent, d’autres apparaissent.', `<b>${cap(ans)}</b>.${why ? ' ' + why : ''}`);
      }
      const [s, b, why] = rng.pick([
        ['Le sucre a disparu dans l’eau : c’est une transformation chimique.', false, 'Le sucre est toujours là (l’eau est sucrée) : c’est une <b>dissolution</b>, transformation physique.'],
        ['Les bulles d’une eau qui bout montrent une transformation chimique.', false, 'Ce sont des bulles de vapeur d’eau : un simple changement d’état.'],
        ['Les bulles d’un comprimé effervescent montrent une transformation chimique.', true, 'Un nouveau gaz (du dioxyde de carbone) apparaît.'],
        ['Quand une bougie brûle, il y a à la fois une transformation physique et une transformation chimique.', true, 'La cire fond (physique) et la cire vaporisée brûle (chimique).'],
        ['Broyer un morceau de craie en poudre est une transformation chimique.', false, 'La poudre est toujours de la craie : transformation physique.'],
        ['Faire cuire un gâteau est une transformation chimique.', true, 'De nouvelles substances apparaissent (couleur, odeur, goût changent, et on ne peut pas revenir en arrière).'],
        ['La rouille est du fer qui a changé d’état.', false, 'La rouille est une <b>nouvelle substance</b> formée avec le dioxygène de l’air et l’eau.'],
        ['Faire fondre du beurre puis le laisser refroidir redonne du beurre solide.', true, 'C’est une transformation physique : la substance reste la même.'],
      ]);
      return Q(`pctc3:${s.slice(0, 24)}`, `Vrai ou faux ? « ${s} »`, vf(b), 'Cherche si une nouvelle substance apparaît vraiment.', `<b>${b ? 'Vrai' : 'Faux'}</b>. ${why}`);
    },
  });

  // ===================== EXPLICATIONS =====================
  const B = M.cat.BASE, E = M.explain;
  E('pc-etats-proprietes', [
    ['experience', '<p>On prend trois seringues. Dans la première, on met un petit morceau de pâte à modeler ; dans la deuxième, de l’eau ; dans la troisième, de l’air. On bouche le bout avec le doigt et on pousse le piston. Avec l’air, le piston s’enfonce : un <b>gaz se comprime</b>. Avec l’eau, il ne bouge presque pas : un liquide est presque incompressible. Puis on vide chaque seringue dans un verre : l’eau prend la forme du verre, mais garde son volume ; la pâte à modeler garde sa forme.</p>'],
    ['vie', '<p>Inès verse son jus d’orange de la bouteille dans un verre : le jus prend la forme du verre, mais il y en a toujours autant (c’est un <b>liquide</b>). Elle gonfle un ballon : l’air remplit tout le ballon, quelle que soit sa forme (c’est un <b>gaz</b>). Son stylo, lui, garde sa forme dans la trousse ou sur la table (c’est un <b>solide</b>).</p>'],
    ['etapes', '<p>Pour trouver l’état du sable :</p><ol><li>Je me demande s’il coule : oui… mais je regarde un seul grain.</li><li>Un grain garde sa forme et je peux le saisir : c’est un solide.</li><li>Donc le sable, fait de petits grains solides, est un <b>solide</b> en poudre.</li></ol>'],
  ]);
  E('pc-changements-etat', [
    ['experience', '<p>On sort un verre bien froid du réfrigérateur. En quelques secondes, il se couvre de petites gouttes. D’où vient cette eau ? Pas du verre : elle vient de la <b>vapeur d’eau invisible</b> de l’air, qui se <b>liquéfie</b> au contact de la paroi froide. On pose ensuite un glaçon dans une assiette au soleil : il fond (<b>fusion</b>), puis la flaque disparaît peu à peu (<b>évaporation</b>).</p>'],
    ['dessin', `<p>Les quatre changements d’état à connaître :</p>${svg(330, 150, text(45, 80, 'Solide', { cls: 's-text s-bold' }) + text(165, 80, 'Liquide', { cls: 's-text s-bold' }) + text(285, 80, 'Gaz', { cls: 's-text s-bold' }) + line(80, 62, 125, 62, 's-accent-line') + poly([[125, 57], [133, 62], [125, 67]], 's-solid') + text(105, 50, 'fusion', { size: 12 }) + line(133, 96, 88, 96, 's-line') + poly([[88, 91], [80, 96], [88, 101]], 's-solid') + text(105, 118, 'solidification', { size: 12 }) + line(205, 62, 252, 62, 's-accent-line') + poly([[252, 57], [260, 62], [252, 67]], 's-solid') + text(230, 50, 'vaporisation', { size: 12 }) + line(260, 96, 213, 96, 's-line') + poly([[213, 91], [205, 96], [213, 101]], 's-solid') + text(232, 118, 'liquéfaction', { size: 12 }) + text(165, 20, 'en chauffant →', { size: 12 }) + text(165, 145, '← en refroidissant', { size: 12 }), '', 'Schéma : solide, liquide, gaz ; fusion et vaporisation en chauffant, solidification et liquéfaction en refroidissant')}<p>Vers la droite : on chauffe. Vers la gauche : on refroidit.</p>`],
    ['vie', '<p>Le matin, Hugo prend sa douche : le miroir se couvre de buée (<b>liquéfaction</b> de la vapeur d’eau). Au petit-déjeuner, le beurre fond sur sa tartine chaude (<b>fusion</b>). L’hiver, la flaque devant le collège a gelé (<b>solidification</b>). Et son tee-shirt mouillé sèche sur le radiateur (<b>vaporisation</b>, par évaporation).</p>'],
  ]);
  E('pc-temperatures-etat', [
    ['dessin', `<p>Sur un thermomètre, on place les deux températures de l’éthanol :</p>${svg(260, 200, line(80, 20, 80, 185, 's-line s-thick') + line(70, 60, 90, 60) + line(70, 140, 90, 140) + text(100, 64, '78 °C : ébullition', { anchor: 'start', size: 13 }) + text(100, 144, '−114 °C : fusion', { anchor: 'start', size: 13 }) + text(40, 38, 'gaz', { cls: 's-text s-bold', size: 13 }) + text(40, 104, 'liquide', { cls: 's-text s-bold', size: 13 }) + text(40, 172, 'solide', { cls: 's-text s-bold', size: 13 }), '', 'Axe des températures de l’éthanol : solide en dessous de −114 °C, liquide entre −114 °C et 78 °C, gaz au-dessus de 78 °C')}<p>À 20 °C, on est dans la zone du milieu : l’éthanol est liquide.</p>`],
    ['vie', '<p>Chloé part en Laponie, où il fait −45 °C. Son vieux thermomètre à mercure affiche n’importe quoi : le mercure a <b>gelé</b> (il devient solide à −39 °C) ! Le thermomètre de l’hôtel, à alcool, marche très bien : l’alcool ne gèle qu’à −114 °C.</p>'],
    ['etapes', '<p>État du mercure à 400 °C :</p><ol><li>Je lis : fusion −39 °C, ébullition 357 °C.</li><li>Je compare : 400 est plus grand que 357.</li><li>Au-dessus de l’ébullition, c’est un <b>gaz</b>.</li></ol>'],
  ]);
  E('pc-palier', [
    ['dessin', B],
    ['experience', '<p>Au laboratoire, on met de la glace pilée dans un tube, avec un thermomètre, et on la laisse se réchauffer dans de l’eau tiède. Toutes les minutes, on note la température. Elle monte jusqu’à 0 °C… puis elle <b>reste bloquée à 0 °C</b> tant qu’il reste de la glace. On recommence avec de la glace d’eau salée : cette fois, la température continue à changer pendant la fusion. Pas de palier : c’est un <b>mélange</b>.</p>'],
    ['vie', '<p>Noah met des glaçons dans sa limonade. Tant qu’il reste des glaçons, la boisson reste à peu près à 0 °C, même en plein soleil : la chaleur sert à faire fondre la glace. C’est le <b>palier de fusion</b> à l’œuvre dans son verre.</p>'],
  ]);
  E('pc-conservation-masse', [
    ['experience', '<p>On pose un flacon fermé contenant des glaçons sur une balance : elle affiche 152 g. On attend que toute la glace fonde : la balance affiche toujours <b>152 g</b>. La glace est devenue de l’eau liquide, mais rien n’est entré ni sorti. En revanche, le niveau d’eau est un peu plus bas que le haut des glaçons : le <b>volume</b> a diminué.</p>'],
    ['vie', '<p>Léa oublie une bouteille d’eau pleine au congélateur. Le lendemain : la bouteille est déformée, voire fendue ! L’eau n’est pas devenue plus lourde, mais la glace prend environ <b>10 % de place en plus</b> : 1 L d’eau donne environ 1,1 L de glace.</p>'],
    ['etapes', '<p>Volume de glace obtenu avec 3 L d’eau :</p><ol><li>Je sais que 1 L d’eau donne 1,1 L de glace.</li><li>C’est proportionnel : je multiplie par 3.</li><li>3 × 1,1 = <b>3,3 L</b> de glace, pour une masse qui reste de 3 kg.</li></ol>'],
  ]);
  E('pc-modele-particulaire', [
    ['dessin', B],
    ['vie', '<p>Imagine la cour du collège. Pendant la photo de classe, les élèves sont serrés et rangés : c’est un <b>solide</b>. Dans le couloir à la sortie, ils sont serrés mais se faufilent dans tous les sens : c’est un <b>liquide</b>. Pendant la récréation, ils courent dans toute la cour, loin les uns des autres : c’est un <b>gaz</b>. Ce sont toujours les mêmes élèves, et ils sont toujours aussi nombreux !</p>'],
    ['etapes', '<p>Pour expliquer pourquoi l’air se comprime :</p><ol><li>L’air est un gaz : ses particules sont éloignées les unes des autres.</li><li>Entre elles, il y a du vide.</li><li>En poussant le piston, je rapproche les particules : le volume diminue, mais le nombre de particules (donc la masse) reste le même.</li></ol>'],
  ]);
  E('pc-lire-eprouvette', [
    ['dessin', B],
    ['experience', '<p>On verse de l’eau dans une éprouvette jusqu’à 60 mL. On y plonge doucement un caillou attaché à un fil : le niveau monte à 74 mL. Le caillou a pris la place de 74 − 60 = <b>14 mL</b> d’eau : son volume est 14 cm³. C’est la méthode par <b>déplacement d’eau</b>.</p>'],
    ['etapes', '<p>Pour lire une éprouvette :</p><ol><li>Je la pose sur la table et je me baisse : mon œil est à la hauteur de l’eau.</li><li>Je repère le <b>bas</b> du ménisque.</li><li>Je compte : 10 intervalles entre 20 et 40 mL, donc une graduation vaut 2 mL.</li><li>Le bas du ménisque est 3 graduations au-dessus de 40 : 40 + 3 × 2 = 46 mL.</li></ol>'],
  ]);
  E('pc-masse-volume', [
    ['experience', '<p>On pose un bécher vide sur une balance et on appuie sur « tare » (zéro). On verse 50 mL d’eau : 50 g. On ajoute 50 mL : 100 g. Encore 50 mL : 150 g. Chaque fois que le volume augmente de 50 mL, la masse augmente de 50 g : <b>la masse est proportionnelle au volume</b>. Avec de l’huile, on trouve 46 g, 92 g, 138 g : proportionnel aussi, mais avec un autre coefficient.</p>'],
    ['vie', `<p>Sam achète 1 L d’huile et 1 L d’eau. Les deux bouteilles ont le même volume, mais pas la même masse : 920 g pour l’huile, 1 000 g pour l’eau. Pour chaque substance, on a un tableau de proportionnalité :</p>${table([['Volume (mL)', 100, 200, 500, 1000], ['Masse d’huile (g)', 92, 184, 460, 920]], { head: false })}`],
  ]);
  E('pc-pression', [
    ['experience', '<p>On relie une seringue remplie d’air à un manomètre. Au départ, il indique environ 1 013 hPa : c’est la pression atmosphérique. On enfonce le piston : le volume d’air diminue et le manomètre monte, par exemple à 1 500 hPa. On tire le piston : la pression descend sous 1 013 hPa. <b>Comprimer un gaz augmente sa pression.</b></p>'],
    ['vie', '<p>Yanis gonfle les pneus de son vélo à la station-service. Le gonfleur affiche 3 bar, soit 3 000 hPa : environ trois fois la pression de l’air autour de lui. Plus il ajoute d’air dans le pneu, plus la pression monte et plus le pneu devient dur.</p>'],
  ]);
  E('pc-mesure-repetee', [
    ['vie', '<p>En TP, cinq groupes chronomètrent la chute d’une balle : 0,82 s ; 0,79 s ; 0,81 s ; 1,80 s ; 0,78 s. Le groupe de Lina a trouvé 1,80 s : ils ont démarré le chronomètre en retard. Cette valeur <b>aberrante</b> est écartée. Moyenne des quatre autres : (0,82 + 0,79 + 0,81 + 0,78) ÷ 4 = 3,2 ÷ 4 = <b>0,8 s</b>.</p>'],
    ['etapes', '<p>Pour donner un bon résultat de mesure :</p><ol><li>Je répète la mesure plusieurs fois (ou plusieurs groupes la font).</li><li>J’écarte une valeur très différente des autres.</li><li>Je calcule la moyenne des valeurs restantes : somme ÷ nombre de valeurs gardées.</li></ol>'],
  ]);
  E('pc-homogene-heterogene', [
    ['experience', '<p>Dans trois verres, on mélange de l’eau avec : du sel, du sable, de l’huile. On agite et on attend. Dans le premier verre, on ne voit plus le sel : mélange <b>homogène</b>. Dans le deuxième, le sable tombe au fond ; dans le troisième, l’huile remonte : mélanges <b>hétérogènes</b>.</p>'],
    ['vie', '<p>Au restaurant, Jade regarde la table : la carafe d’eau du robinet et le sirop dilué paraissent uniformes (homogènes). La vinaigrette, avec ses gouttes d’huile, et le jus d’orange avec sa pulpe montrent plusieurs constituants à l’œil nu (hétérogènes).</p>'],
  ]);
  E('pc-separer', [
    ['experience', '<p>On mélange du sel et du sable. On ajoute de l’eau et on agite : le sel se dissout. On filtre : le sable reste dans le filtre, l’eau salée passe (le filtrat). On chauffe doucement le filtrat dans une coupelle : l’eau s’évapore et il reste du <b>sel</b>. Trois techniques à la suite : dissolution, filtration, évaporation.</p>'],
    ['vie', '<p>Dans les marais salants, les paludiers laissent l’eau de mer dans de grands bassins peu profonds. Le soleil et le vent font <b>évaporer</b> l’eau ; le sel reste et on le récolte. À la maison, la cafetière à filtre réalise une <b>filtration</b> : le marc reste dans le filtre, le café passe.</p>'],
  ]);
  E('pc-corps-pur-melange', [
    ['experience', '<p>Sur deux coupelles, on fait évaporer la même quantité d’eau distillée et d’eau minérale. La coupelle d’eau distillée reste parfaitement propre : il n’y avait <b>qu’une seule substance</b>, l’eau. Sur l’autre, il reste une trace blanche : ce sont les sels minéraux dissous. L’eau minérale est un <b>mélange</b>.</p>'],
    ['vie', '<p>Sur l’étiquette de sa bouteille, Malo lit « eau naturellement pure », puis la liste : calcium, magnésium, sodium… En chimie, cette eau n’est pas un corps pur : elle contient plusieurs substances. « Pure » veut seulement dire ici qu’elle n’est pas polluée.</p>'],
  ]);
  E('pc-solubilite', [
    ['experience', '<p>On verse 100 mL d’eau dans un bécher et on ajoute du sel, une cuillère de 6 g à la fois, en remuant. Les premières cuillères disparaissent. Vers la sixième (environ 36 g), le sel ne se dissout plus et reste au fond : la solution est <b>saturée</b>. Avec 200 mL d’eau, on peut en dissoudre deux fois plus : c’est proportionnel.</p>'],
    ['vie', '<p>Inès sucre son thé : le sucre est le <b>soluté</b>, l’eau du thé le <b>solvant</b>, le thé sucré la <b>solution</b>. Si elle met dix morceaux dans une petite tasse froide, il en reste au fond : elle a dépassé la solubilité. En chauffant, le sucre restant se dissout mieux.</p>'],
  ]);
  E('pc-miscibilite', [
    ['experience', '<p>Dans un tube à essai, on verse de l’eau puis de l’huile, on bouche et on agite fort. On obtient un mélange trouble… mais après une minute, l’huile remonte et forme une couche au-dessus : eau et huile sont <b>non miscibles</b>. On recommence avec de l’eau et du sirop : une seule couche colorée, ils sont <b>miscibles</b>.</p>'],
    ['vie', '<p>Lors d’une marée noire, le pétrole s’étale à la surface de la mer en une nappe : il ne se mélange pas à l’eau et il est plus léger qu’elle à volume égal. C’est pour ça qu’on peut l’aspirer ou le retenir avec des barrages flottants.</p>'],
  ]);
  E('pc-air', [
    ['dessin', `<p>Imagine 100 billes qui représentent l’air :</p>${(() => { let b = ''; for (let i = 0; i < 100; i++) { const x = 14 + (i % 20) * 15, y = 14 + Math.floor(i / 20) * 15; b += `<circle cx="${x}" cy="${y}" r="5.5" class="${i < 78 ? 's-empty' : i < 99 ? 's-fill' : 's-accent'}"/>`; } return svg(310, 90, b, '', '100 billes : 78 de diazote, 21 de dioxygène, 1 pour les autres gaz'); })()}<p>78 billes claires (diazote), 21 foncées (dioxygène) et 1 de couleur (les autres gaz). Dans 200 L d’air, il y a donc 2 × 21 = <b>42 L de dioxygène</b>.</p>`],
    ['vie', '<p>Hugo respire environ 6 L d’air par minute au repos. Dans ces 6 L, il n’y a qu’environ 1,26 L de dioxygène (21 %) : le reste est surtout du diazote, que son corps n’utilise pas et rejette.</p>'],
  ]);
  E('pc-transfo-chimique', [
    ['experience', '<p>On pose un morceau de craie (du calcaire) dans un verre et on verse du vinaigre dessus : des bulles apparaissent et la craie diminue. On fait passer le gaz dans de l’eau de chaux : elle se trouble. Un gaz nouveau, le <b>dioxyde de carbone</b>, s’est formé : c’est une <b>transformation chimique</b>. À l’inverse, si on écrase la craie en poudre, c’est toujours de la craie : transformation physique.</p>'],
    ['vie', '<p>Dans la cuisine de Chloé : le beurre fond dans la poêle (physique, il redevient solide au frais) ; puis elle y fait cuire un œuf. Le blanc d’œuf, transparent, devient blanc et ferme, et on ne pourra jamais revenir en arrière : de nouvelles substances sont apparues, c’est une transformation <b>chimique</b>.</p>'],
    ['etapes', '<p>Pour classer une transformation :</p><ol><li>Je me demande quelles substances il y a avant.</li><li>Je me demande si ce sont les mêmes après (sous un autre état, en morceaux, dissoutes…).</li><li>Si oui : physique. Si une nouvelle substance apparaît (gaz, couleur, odeur…) : <b>chimique</b>.</li></ol>'],
  ]);
})();
