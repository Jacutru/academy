// Physique-chimie, énergie et électricité : sources et conversions d’énergie, ordres de grandeur,
// symboles normalisés, circuits ouverts ou fermés, série et dérivation, intensité, tension, sécurité.
(function () {
  'use strict';
  const M = globalThis.M;
  const { fmt, mul, div } = M.u;
  const { Q, num, choice, fixedChoice, order, sequence } = M.kit;
  const { svg, text, line, poly } = M.svg.raw;

  const yesNo = b => fixedChoice(['Oui', 'Non'], b ? 'Oui' : 'Non');
  const trueFalse = b => fixedChoice(['Vrai', 'Faux'], b ? 'Vrai' : 'Faux');
  const cap = s => s[0].toUpperCase() + s.slice(1);
  const listFr = arr => (arr.length < 2 ? arr.join('') : `${arr.slice(0, -1).join(', ')} et ${arr[arr.length - 1]}`);

  // ===================== FIGURES : CIRCUITS =====================
  const R = 20;   // half-length of the gap a component takes on a wire
  const circle = (x, y, r, cls = 's-line') => `<circle cx="${x}" cy="${y}" r="${r}" class="${cls}"/>`;
  const LETTER = { moteur: 'M', amp: 'A', volt: 'V' };
  // What a symbol looks like, in words (text alternative that does not give its name).
  const LOOK = {
    pile: 'un grand trait fin et un petit trait épais, côte à côte',
    lampe: 'un cercle contenant une croix',
    moteur: 'un cercle contenant la lettre M',
    amp: 'un cercle contenant la lettre A',
    volt: 'un cercle contenant la lettre V',
    'int-o': 'un trait relevé qui ne touche pas le second point',
    'int-f': 'un trait qui relie deux points',
    del: 'un triangle pointé contre un trait, avec deux petites flèches qui sortent',
    fil: 'un simple trait continu',
  };
  // Component in local coordinates, horizontal, wire ends at x = ±R. dir: DEL pointing to +x (1) or −x (−1).
  function body(t, dir = 1) {
    const leads = r => line(-R, 0, -r, 0) + line(r, 0, R, 0);
    switch (t) {
      case 'pile': return leads(4) + line(-4, -16, -4, 16) + '<rect x="3" y="-8" width="5" height="16" class="s-solid"/>';
      case 'lampe': return leads(11) + circle(0, 0, 11) + line(-7.8, -7.8, 7.8, 7.8) + line(-7.8, 7.8, 7.8, -7.8);
      case 'moteur': case 'amp': case 'volt': return leads(11) + circle(0, 0, 11);
      case 'int-o': return leads(12) + circle(-12, 0, 2.5, 's-dot') + circle(12, 0, 2.5, 's-dot') + line(-12, 0, 10, -13);
      case 'int-f': return leads(12) + circle(-12, 0, 2.5, 's-dot') + circle(12, 0, 2.5, 's-dot') + line(-12, 0, 12, 0);
      case 'coupe': return leads(7) + circle(-7, 0, 2.5, 's-dot') + circle(7, 0, 2.5, 's-dot');
      case 'del': {
        const d = dir, arrow = x => line(x, -11, x + 6, -19) + line(x + 6, -19, x + 1.5, -18) + line(x + 6, -19, x + 5, -14.5);
        return line(-R, 0, R, 0) + poly([[-7 * d, -8], [-7 * d, 8], [7 * d, 0]], 's-line s-nofill') + line(7 * d, -8, 7 * d, 8) + arrow(-3) + arrow(4);
      }
      default: return line(-R, 0, R, 0);   // fil
    }
  }
  // One component centred at (cx, cy); vert: on a vertical wire (rotated a quarter turn, '+' of the pile upwards).
  function part(t, cx, cy, vert = false, dir = 1) {
    let s = `<g transform="translate(${cx} ${cy})${vert ? ' rotate(90)' : ''}">${body(t, dir)}</g>`;
    if (LETTER[t]) s += text(cx, cy + 5, LETTER[t], { size: 13, cls: 's-text s-bold' });
    if (t === 'pile') s += vert ? text(cx + 14, cy - 8, '+', { size: 14 }) : text(cx - 13, cy - 10, '+', { size: 14 });
    return s;
  }
  // Wire from (x1, y1) to (x2, y2), horizontal or vertical and going right or down, with components evenly spaced.
  // A component may carry lab (label), v (voltmeter or ammeter across it) or short (a wire across it).
  // out (−1 or 1): side where those brackets are drawn; the label goes on the other side.
  function seg(x1, y1, x2, y2, comps, out) {
    const vert = x1 === x2, len = vert ? y2 - y1 : x2 - x1, n = comps.length;
    const at = (u, w = 0) => (vert ? [x1 + w, y1 + u] : [x1 + u, y1 + w]);
    const L = (u1, w1, u2, w2, cls) => line(...at(u1, w1), ...at(u2, w2), cls);
    let s = '', from = 0;
    comps.forEach((c, i) => {
      const m = (len * (i + 1)) / (n + 1), [cx, cy] = at(m);
      s += L(from, 0, m - R, 0) + part(c.t, cx, cy, vert, c.dir || 1);
      if (c.lab) s += vert ? text(cx - out * 32, cy + 5, c.lab, { size: 14 }) : text(cx, cy - out * 32 + 5, c.lab, { size: 14 });
      if (c.v || c.short) {
        const k = m - 32, l = m + 32, h = 42 * out;
        s += L(k, 0, k, h) + L(l, 0, l, h) + circle(...at(k), 3.5, 's-dot') + circle(...at(l), 3.5, 's-dot');
        if (c.v) { const [vx, vy] = at(m, h); s += L(k, h, m - R, h) + part(c.v, vx, vy, vert) + L(m + R, h, l, h); }
        else s += L(k, h, l, h, 's-accent-line');
      }
      from = m + R;
    });
    return s + L(from, 0, len, 0);
  }
  // DEL direction for a side of the loop: the current leaves the '+' of the pile (top left) and goes clockwise.
  const delDir = (c, side) => ((c.ok !== false) === (side !== 'bottom') ? 1 : -1);
  // Series loop: pile on the left, comps (in the order of the current) on top, right then bottom.
  function serieFig(comps, label, pile = { t: 'pile' }) {
    const n = comps.length, sides = { top: [], right: [], bottom: [] };
    const plan = n <= 3 ? ['top', 'right', 'bottom'] : n === 4 ? ['top', 'top', 'right', 'bottom'] : ['top', 'top', 'right', 'bottom', 'bottom'];
    comps.forEach((c, i) => { const side = plan[i]; sides[side].push(Object.assign({}, c, { dir: c.t === 'del' ? delDir(c, side) : 1 })); });
    sides.bottom.reverse();
    const nH = Math.max(sides.top.length, sides.bottom.length, 1);
    const x0 = 64, x1 = x0 + Math.max(210, 100 * (nH + 1)), y0 = 62, y1 = 212;
    const body = seg(x0, y0, x1, y0, sides.top, -1) + seg(x1, y0, x1, y1, sides.right, 1) + seg(x0, y1, x1, y1, sides.bottom, 1) + seg(x0, y0, x0, y1, [pile], -1);
    return svg(x1 + 70, y1 + 62, body, 'pc-circuit', label);
  }
  // Parallel circuit: pile on the left, optional comps on the main branch (top), then one vertical branch per array.
  function deriveFig(branches, label, top = []) {
    const x0 = 64, y0 = 62, y1 = 222, gap = 130, x00 = x0 + (top.length ? 60 : 0);
    const xb = branches.map((_, k) => x00 + gap * (k + 1)), last = xb[xb.length - 1];
    let s = seg(x0, y0, x0, y1, [{ t: 'pile' }], -1) + seg(x0, y0, xb[0], y0, top, -1) + line(xb[0], y0, last, y0) + line(x0, y1, last, y1);
    branches.forEach((b, k) => {
      s += seg(xb[k], y0, xb[k], y1, b, 1);
      if (k < branches.length - 1) s += circle(xb[k], y0, 3.5, 's-dot') + circle(xb[k], y1, 3.5, 's-dot');
    });
    return svg(last + 70, y1 + 40, s, 'pc-circuit', label);
  }
  // A lone symbol, with a bit of wire on each side.
  const symFig = t => svg(110, 56, line(5, 30, 55 - R, 30) + line(55 + R, 30, 105, 30) + part(t, 55, 30, false, 1), 'pc-sym', `Symbole : ${LOOK[t]}`);

  // Words for circuits.
  const NAME = { pile: 'une pile', lampe: 'une lampe', moteur: 'un moteur', del: 'une DEL', 'int-o': 'un interrupteur ouvert', 'int-f': 'un interrupteur fermé', amp: 'un ampèremètre', volt: 'un voltmètre', coupe: 'un fil débranché', fil: 'un fil' };
  const say = c => `${NAME[c.t]}${c.lab ? ' ' + c.lab : ''}${c.t === 'del' ? (c.ok === false ? ' branchée dans le sens bloquant' : ' branchée dans le sens passant') : ''}${c.short ? ` (court-circuitée par un fil branché à ses bornes)` : ''}${c.v ? ` (avec ${NAME[c.v]} branché à ses bornes)` : ''}`;
  const sayLoop = (comps, pile = 'une pile') => `Le circuit comporte, en série : ${listFr([pile, ...comps.map(say)])}.`;
  const sayPath = comps => `En partant de la pile, le courant traverse ${comps.map(say).join(', puis ')}, puis revient à la pile.`;

  // ===================== FIGURES : CHAÎNE D’ÉNERGIE =====================
  const arrowR = (x1, x2, y) => line(x1, y, x2 - 8, y) + poly([[x2, y], [x2 - 9, y - 5], [x2 - 9, y + 5]], 's-solid');
  function chainFig(inp, box, outs) {
    const W = 560, H = outs.length > 1 ? 110 : 80, cy = H / 2;
    let s = text(78, cy + 5, `énergie ${inp}`, { size: 14 }) + arrowR(150, 200, cy) + `<rect x="200" y="${cy - 22}" width="160" height="44" rx="8" class="s-fill"/>` + text(280, cy + 5, box, { size: 14, cls: 's-text s-bold' });
    outs.forEach((o, i) => {
      const y = outs.length > 1 ? 28 + i * 54 : cy;
      s += line(360, cy, 380, cy) + line(380, cy, 380, y) + arrowR(380, 420, y) + text(490, y + 5, `énergie ${o}`, { size: 14 });
    });
    return svg(W, H, s, 'pc-chain', `Chaîne d’énergie : énergie ${inp}, puis ${box}, puis ${outs.map(o => 'énergie ' + o).join(' et ')}`);
  }

  // ===================== SOURCES D’ÉNERGIE =====================
  const SOURCES = [
    { n: 'le Soleil', r: true, w: 'il rayonne chaque jour, et pour encore des milliards d’années' },
    { n: 'le vent', r: true, w: 'il souffle sans cesse, entretenu par le Soleil qui chauffe l’air' },
    { n: 'l’eau des rivières', r: true, w: 'l’eau s’évapore puis retombe en pluie : c’est le cycle de l’eau' },
    { n: 'les marées', r: true, w: 'elles reviennent deux fois par jour, grâce à la Lune' },
    { n: 'le bois (biomasse)', r: true, w: 'les arbres repoussent en quelques dizaines d’années, à condition de replanter' },
    { n: 'la chaleur du sous-sol (géothermie)', r: true, w: 'la chaleur de l’intérieur de la Terre est immense et se renouvelle' },
    { n: 'le pétrole', r: false, f: true, w: 'il s’est formé en des millions d’années : les réserves s’épuisent' },
    { n: 'le charbon', r: false, f: true, w: 'il s’est formé en des millions d’années : les réserves s’épuisent' },
    { n: 'le gaz naturel', r: false, f: true, w: 'il s’est formé en des millions d’années : les réserves s’épuisent' },
    { n: 'l’uranium', r: false, f: false, w: 'c’est un minerai extrait du sol, en quantité limitée' },
  ];
  const PLANTS = [['une éolienne', 1], ['un panneau solaire', 0], ['un barrage hydroélectrique', 2], ['une usine marémotrice', 3], ['une chaudière à granulés', 4], ['une centrale géothermique', 5], ['une centrale nucléaire', 9], ['une voiture à essence', 6], ['une gazinière', 8], ['un moulin à eau', 2]];
  const RENEW_HINT = 'Une source renouvelable se reconstitue rapidement, à l’échelle d’une vie humaine.';
  const renewWord = s => (s.r ? 'renouvelable' : 'non renouvelable');
  const SRC_TRAPS = [
    ['L’uranium est une énergie fossile.', false, 'L’uranium est un minerai : il est <b>non renouvelable</b>, mais il ne vient pas de restes d’êtres vivants, ce n’est <b>pas</b> une énergie fossile.'],
    ['Le pétrole se reforme en quelques années.', false, 'Il faut des <b>millions d’années</b> pour former du pétrole : il est non renouvelable.'],
    ['Le bois est renouvelable, à condition de replanter les arbres coupés.', true, 'Les arbres repoussent : le bois est renouvelable <b>si l’on replante</b> autant qu’on coupe.'],
    ['L’électricité est une source d’énergie qu’on trouve telle quelle dans la nature.', false, 'L’électricité est <b>produite</b> par les centrales à partir d’une source (vent, uranium, eau…) : ce n’est pas une source.'],
    ['Une centrale nucléaire utilise une source d’énergie renouvelable.', false, 'Elle utilise l’<b>uranium</b>, une source non renouvelable.'],
    ['Le Soleil est à l’origine de l’énergie du vent.', true, 'Le Soleil chauffe l’air de façon inégale : l’air se met en mouvement, c’est le vent. <b>Vrai</b>.'],
    ['Le gaz naturel est renouvelable, puisqu’on le trouve dans la nature.', false, 'Être « naturel » ne suffit pas : le gaz s’est formé en des millions d’années, il est <b>non renouvelable</b>.'],
    ['Le charbon, le pétrole et le gaz naturel viennent de restes d’êtres vivants enfouis il y a des millions d’années.', true, 'Ce sont les énergies <b>fossiles</b>. <b>Vrai</b>.'],
    ['Une source non renouvelable finira par s’épuiser si on continue à l’utiliser.', true, 'Ses réserves sont limitées : <b>vrai</b>.'],
  ];

  M.notion('pc-sources-energie', {
    lesson: {
      retenir: 'Une <b>source d’énergie</b> est ce que l’on trouve dans la nature et dont on tire de l’énergie. Une source est <b>renouvelable</b> si elle se reconstitue rapidement, à l’échelle d’une vie humaine : Soleil, vent, eau des rivières, marées, bois (biomasse), chaleur du sous-sol (géothermie). Elle est <b>non renouvelable</b> si ses réserves s’épuisent : pétrole, charbon, gaz naturel (les énergies <b>fossiles</b>) et uranium.',
      methode: [
        'Repère la source utilisée (une éolienne utilise le vent, une centrale nucléaire l’uranium…).',
        'Demande-toi si cette source se reconstitue en quelques années ou s’il a fallu des millions d’années pour la former.',
        'Conclus : renouvelable ou non renouvelable.',
      ],
      exemples: [
        { q: 'Un barrage hydroélectrique utilise-t-il une source renouvelable ?', r: 'Il utilise l’eau des rivières, renouvelée par la pluie : <b>oui, renouvelable</b>.' },
        { q: 'Une voiture à essence ?', r: 'L’essence vient du pétrole : <b>non renouvelable</b>.' },
      ],
      astuces: ['Fossile = formé à partir de restes d’êtres vivants enfouis il y a des millions d’années : pétrole, charbon, gaz naturel.'],
      erreurs: [
        'Croire que l’électricité est une source d’énergie : elle est produite à partir d’une source.',
        'Croire que l’uranium est une énergie fossile : il est non renouvelable, mais pas fossile.',
        'Confondre « naturel » et « renouvelable » : le gaz naturel est non renouvelable.',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        if (rng.chance(0.55)) {
          const i = rng.int(0, SOURCES.length - 1), s = SOURCES[i];
          return Q(`pse1:${i}`, `Cette source d’énergie est-elle renouvelable : <b>${s.n}</b> ?`, fixedChoice(['Renouvelable', 'Non renouvelable'], cap(renewWord(s))), RENEW_HINT, `${cap(s.n)} : ${s.w}. Source <b>${renewWord(s)}</b>.`);
        }
        const p = rng.int(0, PLANTS.length - 1), [plant, si] = PLANTS[p], others = SOURCES.map((s, i) => i).filter(i => i !== si);
        return Q(`pse1p:${p}`, `Quelle source d’énergie utilise ${plant} ?`, choice(rng, cap(SOURCES[si].n), rng.sample(others, 3).map(i => cap(SOURCES[i].n))), 'Demande-toi ce qui fait fonctionner cet appareil ou cette installation.', `${cap(plant)} utilise <b>${SOURCES[si].n}</b>.`);
      }
      if (level === 2) {
        const r = rng.next();
        if (r < 0.4) {
          const want = rng.chance(0.5), good = SOURCES.map((s, i) => i).filter(i => SOURCES[i].r === want), bad = SOURCES.map((s, i) => i).filter(i => SOURCES[i].r !== want);
          const c = rng.pick(good), d = rng.sample(bad, 3);
          return Q(`pse2a:${want}:${c}:${d}`, `Parmi ces sources d’énergie, laquelle est ${want ? 'renouvelable' : '<b>non</b> renouvelable'} ?`, choice(rng, cap(SOURCES[c].n), d.map(i => cap(SOURCES[i].n))), RENEW_HINT, `${cap(SOURCES[c].n)} : ${SOURCES[c].w}. C’est donc <b>${SOURCES[c].n}</b>.`);
        }
        if (r < 0.7) {
          const idx = rng.sample(SOURCES.map((s, i) => i), 5), n = idx.filter(i => SOURCES[i].r).length;
          const names = idx.map(i => SOURCES[i].n);
          return Q(`pse2c:${idx}`, `Combien de ces sources d’énergie sont renouvelables ? ${listFr(names)}.`, num(n), 'Pour chaque source, demande-toi si elle se reconstitue à l’échelle d’une vie humaine.', `Renouvelables : ${idx.filter(i => SOURCES[i].r).map(i => SOURCES[i].n).join(', ') || 'aucune'}. Il y en a <b>${fmt(n)}</b>.`);
        }
        const p = rng.int(0, PLANTS.length - 1), [plant, si] = PLANTS[p], s = SOURCES[si];
        return Q(`pse2p:${p}`, `La source d’énergie utilisée par ${plant} est-elle renouvelable ?`, yesNo(s.r), 'Trouve d’abord la source utilisée, puis demande-toi si elle s’épuise.', `${cap(plant)} utilise ${s.n} : ${s.w}. <b>${s.r ? 'Oui' : 'Non'}</b>, elle est ${renewWord(s)}.`);
      }
      if (rng.chance(0.6)) {
        const i = rng.int(0, SRC_TRAPS.length - 1), [st, v, c] = SRC_TRAPS[i];
        return Q(`pse3t:${i}`, `Vrai ou faux ? « ${st} »`, trueFalse(v), 'Distingue bien source renouvelable, non renouvelable et fossile.', `<b>${v ? 'Vrai' : 'Faux'}</b>. ${c}`);
      }
      const idx = [9, ...rng.sample([0, 1, 2, 3, 4, 5, 6, 7, 8], 4)].sort((a, b) => a - b), n = idx.filter(i => SOURCES[i].f).length;
      return Q(`pse3f:${idx}`, `Combien de ces sources sont des énergies <b>fossiles</b> ? ${listFr(idx.map(i => SOURCES[i].n))}.`, num(n), 'Une énergie fossile vient de restes d’êtres vivants enfouis il y a des millions d’années. Toute source non renouvelable n’est pas forcément fossile.', `Fossiles : ${idx.filter(i => SOURCES[i].f).map(i => SOURCES[i].n).join(', ') || 'aucune'} (l’uranium est non renouvelable mais pas fossile). Il y en a <b>${fmt(n)}</b>.`);
    },
  });

  // ===================== CONVERSIONS D’ÉNERGIE =====================
  const FORM = { e: 'électrique', l: 'lumineuse', t: 'thermique', m: 'mécanique', c: 'chimique' };
  const FORMS = Object.keys(FORM);
  // n: name, s: short name (for diagrams), i: energy received, o: useful energies given, p: energy lost (heat).
  const CONV = [
    { n: 'une lampe', s: 'lampe', i: 'e', o: ['l'], p: 't' },
    { n: 'un moteur électrique', s: 'moteur', i: 'e', o: ['m'], p: 't' },
    { n: 'un panneau solaire photovoltaïque', s: 'panneau solaire', i: 'l', o: ['e'], p: 't' },
    { n: 'une éolienne', s: 'éolienne', i: 'm', o: ['e'], p: 't' },
    { n: 'une pile', s: 'pile', i: 'c', o: ['e'], p: 't' },
    { n: 'un radiateur électrique', s: 'radiateur', i: 'e', o: ['t'] },
    { n: 'une dynamo de vélo', s: 'dynamo', i: 'm', o: ['e'], p: 't' },
    { n: 'un chauffe-eau solaire', s: 'chauffe-eau solaire', i: 'l', o: ['t'] },
    { n: 'un ventilateur', s: 'ventilateur', i: 'e', o: ['m'], p: 't' },
    { n: 'un grille-pain', s: 'grille-pain', i: 'e', o: ['t'] },
    { n: 'un sèche-cheveux', s: 'sèche-cheveux', i: 'e', o: ['t', 'm'] },
    { n: 'le corps humain', s: 'corps humain', i: 'c', o: ['m', 't'] },
    { n: 'une bougie', s: 'bougie', i: 'c', o: ['l', 't'] },
  ];
  const single = CONV.map((c, i) => i).filter(i => CONV[i].o.length === 1);
  const en = f => `énergie ${FORM[f]}`;
  const Fen = f => `Énergie ${FORM[f]}`;
  const outsWords = c => c.o.map(en).join(' et ');

  M.notion('pc-conversions-energie', {
    lesson: {
      retenir: 'L’énergie existe sous plusieurs <b>formes</b> : électrique, lumineuse (ou rayonnante), thermique, mécanique (de mouvement), chimique (stockée dans les aliments, les combustibles, les piles). Un <b>convertisseur</b> reçoit de l’énergie sous une forme et la fournit sous une autre forme : une lampe convertit l’énergie électrique en énergie lumineuse. On représente cela par une <b>chaîne d’énergie</b> : énergie reçue → convertisseur → énergie fournie. Une partie de l’énergie fournie est souvent <b>perdue</b>, en général sous forme thermique (la lampe chauffe).',
      methode: [
        'Repère le convertisseur (l’objet qui transforme l’énergie).',
        'Cherche ce qui le fait fonctionner : c’est l’énergie <b>reçue</b> (branché sur une prise ou une pile → électrique ; le Soleil → lumineuse ; le vent ou l’eau qui coule → mécanique ; un aliment ou un combustible → chimique).',
        'Cherche ce qu’il produit d’utile : c’est l’énergie <b>fournie</b>. Il peut y en avoir plusieurs.',
        'Écris la chaîne : énergie reçue → convertisseur → énergie fournie.',
      ],
      exemples: [
        { q: 'Chaîne d’énergie d’une éolienne.', r: '<b>Énergie mécanique</b> (du vent) → éolienne → <b>énergie électrique</b>.' },
        { q: 'Que fournit un sèche-cheveux ?', r: 'Il reçoit de l’énergie électrique et fournit de l’<b>énergie thermique</b> (air chaud) et de l’<b>énergie mécanique</b> (le ventilateur souffle).' },
      ],
      astuces: ['Un objet qui chauffe sans que ce soit son but perd de l’énergie thermique : c’est de l’énergie perdue, pas utile.', 'Une pile stocke de l’énergie chimique et fournit de l’énergie électrique.'],
      erreurs: [
        'Confondre panneau solaire photovoltaïque (fournit de l’énergie électrique) et chauffe-eau solaire (fournit de l’énergie thermique).',
        'Croire que l’énergie disparaît : elle change de forme, une partie est seulement perdue (chaleur).',
        'Croire qu’un convertisseur ne fournit qu’une seule forme d’énergie : un sèche-cheveux en fournit deux.',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        if (rng.chance(0.5)) {
          const k = rng.int(0, CONV.length - 1), c = CONV[k];
          return Q(`pce1r:${k}`, `Quelle forme d’énergie est <b>reçue</b> par ${c.n} ?`, choice(rng, Fen(c.i), rng.sample(FORMS.filter(f => f !== c.i), 3).map(Fen)), 'Demande-toi ce qui fait fonctionner cet objet.', `${cap(c.n)} reçoit de l’<b>${en(c.i)}</b>.`);
        }
        const k = rng.pick(single), c = CONV[k];
        return Q(`pce1f:${k}`, `Quelle forme d’énergie utile est <b>fournie</b> par ${c.n} ?`, choice(rng, Fen(c.o[0]), rng.sample(FORMS.filter(f => f !== c.o[0] && f !== c.i), 3).map(Fen)), 'Demande-toi à quoi sert cet objet.', `${cap(c.n)} fournit de l’<b>${en(c.o[0])}</b>.`);
      }
      if (level === 2) {
        if (rng.chance(0.5)) {
          const k = rng.pick(single), c = CONV[k], d = single.filter(j => CONV[j].i !== c.i || CONV[j].o[0] !== c.o[0]);
          const fig = chainFig(FORM[c.i], '?', [FORM[c.o[0]]]);
          return Q(`pce2c:${k}`, `${fig}Quel convertisseur reçoit de l’${en(c.i)} et fournit de l’${en(c.o[0])} ?`, choice(rng, cap(c.n), rng.sample(d, 3).map(j => cap(CONV[j].n))), 'Pour chaque proposition, cherche l’énergie reçue et l’énergie utile fournie.', `${en(c.i)} → <b>${c.s}</b> → ${en(c.o[0])}.`);
        }
        const pairs = [];
        [2, 3, 4, 6].forEach(a => [0, 1, 5, 8, 9].forEach(b => { if (CONV[a].i !== CONV[b].o[0]) pairs.push([a, b]); }));
        const [a, b] = rng.pick(pairs), A = CONV[a], Bc = CONV[b];
        const items = [Fen(A.i), cap(A.s), 'Énergie électrique', cap(Bc.s), Fen(Bc.o[0])];
        return Q(`pce2s:${a}:${b}`, `${cap(A.n)} alimente ${Bc.n}. Range les éléments de la chaîne d’énergie, de l’énergie de départ à l’énergie utile finale.`, sequence(rng, items, { label: 'les éléments de la chaîne', how: 'dans l’ordre de la chaîne d’énergie' }), 'Commence par ce qui fait fonctionner le premier convertisseur ; une énergie, puis un convertisseur, puis une énergie…', `<b>${items.join(' → ')}</b>.`);
      }
      const r = rng.next();
      if (r < 0.35) {
        const k = rng.pick([10, 11, 12]), c = CONV[k], [x, y] = c.o, z = FORMS.find(f => f !== x && f !== y && f !== c.i);
        const right = `${Fen(x)} et ${en(y)}`;
        return Q(`pce3m:${k}`, `Quelles formes d’énergie utiles sont fournies par ${c.n} ?`, choice(rng, right, [`${Fen(x)} seulement`, `${Fen(y)} seulement`, `${Fen(x)} et ${en(z)}`]), 'Cet objet fournit plusieurs formes d’énergie : pense à tout ce qu’il produit.', `${cap(c.n)} reçoit de l’${en(c.i)} et fournit de l’<b>${outsWords(c)}</b>.`);
      }
      if (r < 0.8) {
        const k = rng.pick(CONV.map((c, i) => i).filter(i => i < 10 && (CONV[i].p || CONV[i].o[0] === 't'))), c = CONV[k], useful = c.o[0] === 't';
        return Q(`pce3u:${k}`, `${cap(c.n)} chauffe en fonctionnant. Pour cet objet, l’énergie thermique produite est-elle utile ou perdue ?`, fixedChoice(['Utile', 'Perdue'], useful ? 'Utile' : 'Perdue'), 'Demande-toi à quoi sert l’objet : la chaleur est-elle son but ?', useful ? `Le rôle ${c.n === 'un chauffe-eau solaire' ? 'du chauffe-eau solaire' : c.n === 'un grille-pain' ? 'du grille-pain' : 'du radiateur'} est justement de chauffer : l’énergie thermique est <b>utile</b>.` : `${cap(c.n)} sert à fournir de l’${en(c.o[0])} ; la chaleur est de l’énergie <b>perdue</b>.`);
      }
      const want = rng.pick(['e', 't']), right = want === 'e' ? 'Le panneau solaire photovoltaïque' : 'Le chauffe-eau solaire', other = want === 'e' ? 'Le chauffe-eau solaire' : 'Le panneau solaire photovoltaïque';
      return Q(`pce3s:${want}`, `Un panneau solaire photovoltaïque et un chauffe-eau solaire reçoivent tous les deux l’énergie lumineuse du Soleil. Lequel fournit de l’${en(want)} ?`, choice(rng, right, [other, 'Les deux', 'Aucun des deux']), 'L’un produit du courant électrique, l’autre de l’eau chaude.', `<b>${right}</b> fournit de l’${en(want)}.`);
    },
  });

  // ===================== ORDRES DE GRANDEUR D’ÉNERGIE =====================
  // [situation, énergie en J, valeur affichée, unité]
  const ENER = [
    ['soulever une pomme d’un mètre', 1, 1, 'J'],
    ['une pile AA neuve', 10000, 10, 'kJ'],
    ['la batterie chargée d’un smartphone', 50000, 50, 'kJ'],
    ['faire bouillir 1 L d’eau', 300000, 300, 'kJ'],
    ['un yaourt', 400000, 400, 'kJ'],
    ['une barre chocolatée', 1000000, 1000, 'kJ'],
    ['un repas', 3000000, 3000, 'kJ'],
    ['l’alimentation d’un adolescent pendant une journée', 10000000, 10, 'MJ'],
    ['un litre d’essence', 30000000, 30, 'MJ'],
  ];
  const UNIT = { J: 1, kJ: 1000, MJ: 1000000 };
  const showE = j => ENER[j][0] + ' : ' + fmt(ENER[j][2]) + ' ' + ENER[j][3];
  const convHint = 'Rappelle-toi : 1 kJ = 1 000 J et 1 MJ = 1 000 kJ.';

  M.notion('pc-ordres-grandeur-energie', {
    lesson: {
      retenir: 'L’unité d’énergie est le <b>joule</b> (J). On utilise aussi le <b>kilojoule</b> : 1 kJ = 1 000 J, et le <b>mégajoule</b> : 1 MJ = 1 000 kJ = 1 000 000 J. Quelques ordres de grandeur : soulever une pomme d’un mètre ≈ 1 J ; une pile AA ≈ 10 kJ ; une barre chocolatée ≈ 1 000 kJ ; un repas ≈ 3 000 kJ ; l’alimentation d’une journée ≈ 10 MJ ; un litre d’essence ≈ 30 MJ.',
      methode: [
        'Pour passer des kJ aux J, multiplie par 1 000 ; des J aux kJ, divise par 1 000.',
        'Même chose entre MJ et kJ : 1 MJ = 1 000 kJ.',
        'Pour comparer des énergies, convertis-les d’abord toutes dans la même unité.',
      ],
      exemples: [
        { q: '2,5 kJ en J', r: '2,5 × 1 000 = <b>2 500 J</b>.' },
        { q: '1 500 kJ en MJ', r: '1 500 ÷ 1 000 = <b>1,5 MJ</b>.' },
        { q: 'Combien de barres chocolatées (1 000 kJ) pour l’énergie d’une journée (10 000 kJ) ?', r: '10 000 ÷ 1 000 = <b>10 barres</b>.' },
      ],
      astuces: ['Sur les emballages alimentaires, l’énergie est donnée en kJ (et en kcal) pour 100 g.', 'Méga = million, kilo = mille.'],
      erreurs: [
        'Comparer 3 MJ et 800 kJ sans convertir : 3 MJ = 3 000 kJ, c’est bien plus que 800 kJ.',
        'Confondre le joule (énergie) avec le volt (tension) ou l’ampère (intensité).',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        const r = rng.next();
        if (r < 0.35) {
          const a = rng.int(2, 30);
          return Q(`pog1a:${a}`, `Convertis en joules : ${fmt(a)} kJ = ? J`, num(a * 1000, 'J'), convHint, `${fmt(a)} × 1 000 = <b>${fmt(a * 1000)}</b> J.`);
        }
        if (r < 0.65) {
          const a = rng.int(2, 30);
          return Q(`pog1b:${a}`, `Convertis en kilojoules : ${fmt(a * 1000)} J = ? kJ`, num(a, 'kJ'), convHint, `${fmt(a * 1000)} ÷ 1 000 = <b>${fmt(a)}</b> kJ.`);
        }
        if (r < 0.75) return Q('pog1u', 'Quelle est l’unité de l’énergie ?', choice(rng, 'Le joule (J)', ['Le volt (V)', 'L’ampère (A)', 'Le kilogramme (kg)']), 'Elle porte le nom d’un physicien anglais.', 'L’énergie se mesure en <b>joules (J)</b>.');
        const [i, j] = rng.sample([1, 2, 3, 4, 5, 6], 2), big = ENER[i][1] > ENER[j][1] ? i : j;
        return Q(`pog1c:${i}:${j}`, `Lequel représente le plus d’énergie ? ${cap(ENER[i][0])} (${fmt(ENER[i][2])} kJ) ou ${ENER[j][0]} (${fmt(ENER[j][2])} kJ) ?`, choice(rng, cap(ENER[big][0]), [cap(ENER[big === i ? j : i][0]), 'Les deux sont égales']), 'Les deux énergies sont dans la même unité : compare les nombres.', `${fmt(ENER[big][2])} kJ &gt; ${fmt(ENER[big === i ? j : i][2])} kJ : <b>${ENER[big][0]}</b>.`);
      }
      if (level === 2) {
        const r = rng.next();
        if (r < 0.5) {
          const kind = rng.int(0, 3);
          if (kind === 0) { const a = rng.int(11, 99) / 10; return Q(`pog2a:${a}`, `Convertis en joules : ${fmt(a)} kJ = ? J`, num(mul(a, 1000), 'J'), convHint, `${fmt(a)} × 1 000 = <b>${fmt(mul(a, 1000))}</b> J.`); }
          if (kind === 1) { const a = rng.int(11, 99) * 10, v = div(a, 1000); return Q(`pog2b:${a}`, `Convertis en kilojoules : ${fmt(a)} J = ? kJ`, num(v, 'kJ'), convHint, `${fmt(a)} ÷ 1 000 = <b>${fmt(v)}</b> kJ.`); }
          if (kind === 2) { const a = rng.int(11, 99) / 10; return Q(`pog2c:${a}`, `Convertis en kilojoules : ${fmt(a)} MJ = ? kJ`, num(mul(a, 1000), 'kJ'), convHint, `${fmt(a)} × 1 000 = <b>${fmt(mul(a, 1000))}</b> kJ.`); }
          const a = rng.int(11, 99) * 100, v = div(a, 1000);
          return Q(`pog2d:${a}`, `Convertis en mégajoules : ${fmt(a)} kJ = ? MJ`, num(v, 'MJ'), convHint, `${fmt(a)} ÷ 1 000 = <b>${fmt(v)}</b> MJ.`);
        }
        if (r < 0.8) {
          const idx = rng.sample([0, 1, 2, 3, 4, 5, 6, 7, 8], 4);
          return Q(`pog2o:${idx}`, 'Range ces énergies de la plus petite à la plus grande.', order(idx.map(j => ENER[j][1]), (v, k) => showE(idx[k])), 'Attention aux unités : convertis tout dans la même unité avant de comparer.', `En joules : ${idx.slice().sort((a, b) => ENER[a][1] - ENER[b][1]).map(j => fmt(ENER[j][1]) + ' J').join(' &lt; ')}. Donc <b>${idx.slice().sort((a, b) => ENER[a][1] - ENER[b][1]).map(j => ENER[j][0]).join(' &lt; ')}</b>.`);
        }
        const [big, small] = rng.pick([[6, 5], [6, 4], [7, 5], [7, 4], [2, 1], [5, 4], [3, 2]]);
        const B = ENER[big][1] / 1000, S = ENER[small][1] / 1000, v = div(B, S);
        return Q(`pog2n:${big}:${small}`, `${cap(ENER[big][0])} représente environ ${fmt(B)} kJ et ${ENER[small][0]} environ ${fmt(S)} kJ. Combien de fois plus d’énergie pour ${ENER[big][0]} ?`, num(v), 'Divise la plus grande énergie par la plus petite (dans la même unité).', `${fmt(B)} ÷ ${fmt(S)} = <b>${fmt(v)}</b>.`);
      }
      const r = rng.next();
      if (r < 0.4) {
        let vals;
        do vals = [0, 0, 0, 0].map(() => rng.int(2, 40) * 100000); while (new Set(vals).size < 4);
        const units = vals.map(() => rng.pick(['J', 'kJ', 'MJ'])), shown = vals.map((v, k) => `${fmt(div(v, UNIT[units[k]]))} ${units[k]}`);
        const sorted = vals.map((v, k) => k).sort((a, b) => vals[a] - vals[b]);
        return Q(`pog3o:${vals}:${units}`, 'Range ces énergies de la plus petite à la plus grande.', order(vals, (v, k) => shown[k]), 'Convertis-les toutes dans la même unité (par exemple en kJ) avant de comparer.', `En kJ : ${sorted.map(k => fmt(vals[k] / 1000) + ' kJ').join(' &lt; ')}. Donc <b>${sorted.map(k => shown[k]).join(' &lt; ')}</b>.`);
      }
      if (r < 0.7) {
        const n = rng.int(2, 6), x = rng.pick([900, 950, 1050, 1100, 1200, 1250]), v = div(n * x, 1000);
        const who = rng.pick(['Léa', 'Hugo', 'Inès', 'Noah', 'Sam']);
        return Q(`pog3m:${n}:${x}:${who}`, `Une barre de céréales apporte ${fmt(x)} kJ. ${who} en mange ${n} pendant une randonnée. Quelle énergie, en MJ, cela lui apporte-t-il ?`, num(v, 'MJ'), 'Calcule d’abord l’énergie totale en kJ, puis convertis en MJ.', `${n} × ${fmt(x)} = ${fmt(n * x)} kJ, et ${fmt(n * x)} ÷ 1 000 = <b>${fmt(v)}</b> MJ.`);
      }
      const k = rng.pick([0, 1, 5, 8]), opts = ['Environ 1 J', 'Environ 10 000 J', 'Environ 1 000 000 J', 'Environ 30 000 000 J'].map(s => s.replace(/(\d) (\d)/g, '$1 $2'));
      const right = opts[[0, 1, 5, 8].indexOf(k)];
      return Q(`pog3g:${k}`, `Quel est l’ordre de grandeur de l’énergie pour ${ENER[k][0] === 'une pile AA neuve' ? 'une pile AA neuve (énergie stockée)' : ENER[k][0] === 'une barre chocolatée' ? 'une barre chocolatée (énergie apportée)' : ENER[k][0] === 'un litre d’essence' ? 'un litre d’essence (énergie libérée en brûlant)' : ENER[k][0]} ?`, fixedChoice(opts, right), 'Repère-toi : une barre chocolatée apporte environ 1 000 kJ.', `${cap(ENER[k][0])} : environ ${fmt(ENER[k][2])} ${ENER[k][3]}, soit <b>${right.toLowerCase()}</b>.`);
    },
  });

  // ===================== SYMBOLES NORMALISÉS =====================
  const SYMS = ['pile', 'lampe', 'int-o', 'int-f', 'moteur', 'del', 'amp', 'volt', 'fil'];
  const SNAME = { pile: 'pile (générateur)', lampe: 'lampe', 'int-o': 'interrupteur ouvert', 'int-f': 'interrupteur fermé', moteur: 'moteur', del: 'diode électroluminescente (DEL)', amp: 'ampèremètre', volt: 'voltmètre', fil: 'fil de connexion' };
  const CONFUSE = { pile: ['del', 'int-f', 'lampe'], lampe: ['moteur', 'amp', 'volt'], 'int-o': ['int-f', 'del', 'fil'], 'int-f': ['int-o', 'fil', 'pile'], moteur: ['amp', 'volt', 'lampe'], del: ['pile', 'lampe', 'int-o'], amp: ['volt', 'moteur', 'lampe'], volt: ['amp', 'moteur', 'lampe'], fil: ['int-f', 'int-o', 'pile'] };

  M.notion('pc-symboles', {
    lesson: {
      retenir: `Pour schématiser un circuit, on remplace chaque dipôle par son <b>symbole normalisé</b>, le même dans tous les pays, et on trace les fils par des traits droits. ${symFig('pile')} pile (générateur) : le grand trait fin est la borne +. ${symFig('lampe')} lampe. ${symFig('int-o')} interrupteur ouvert. ${symFig('int-f')} interrupteur fermé. ${symFig('moteur')} moteur. ${symFig('del')} DEL : le triangle pointe dans le sens passant. ${symFig('amp')} ampèremètre. ${symFig('volt')} voltmètre.`,
      methode: [
        'Regarde la forme : un cercle (lampe, moteur, appareil de mesure), des traits (pile, interrupteur), un triangle (DEL).',
        'Dans un cercle : une croix pour la lampe, une lettre M, A ou V pour le moteur, l’ampèremètre, le voltmètre.',
        'Pour un interrupteur, regarde si le trait relie les deux points (fermé) ou non (ouvert).',
      ],
      exemples: [
        { q: 'Un cercle avec une croix ?', r: 'C’est une <b>lampe</b>.' },
        { q: 'Un cercle avec la lettre A ?', r: 'C’est un <b>ampèremètre</b> (A comme ampère).' },
      ],
      astuces: ['A comme Ampère → ampèremètre ; V comme Volt → voltmètre ; M comme Moteur.'],
      erreurs: [
        'Confondre l’interrupteur ouvert (trait relevé, le courant ne passe pas) et l’interrupteur fermé.',
        'Confondre le symbole de la lampe (croix) et celui du moteur (lettre M).',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        const t = rng.pick(SYMS);
        return Q(`psy1:${t}`, `${symFig(t)}Description du symbole : ${LOOK[t]}. Que représente-t-il ?`, choice(rng, cap(SNAME[t]), CONFUSE[t].map(u => cap(SNAME[u]))), 'Regarde la forme générale, puis le détail à l’intérieur.', `C’est le symbole d’un${t === 'pile' || t === 'lampe' || t === 'del' ? 'e' : ''} <b>${SNAME[t]}</b>.`);
      }
      if (level === 2) {
        const t = rng.pick(SYMS);
        return Q(`psy2:${t}`, `Quel est le symbole normalisé d’un${t === 'pile' || t === 'lampe' || t === 'del' ? 'e' : ''} <b>${SNAME[t]}</b> ?`, choice(rng, symFig(t), CONFUSE[t].map(symFig)), 'Pense à la lettre ou au dessin qu’on met dans le symbole.', `Le symbole est ${LOOK[t]} : ${symFig(t)}<b>${SNAME[t]}</b>.`);
      }
      // Level 3: count a kind of dipole in a circuit, or open/closed switch.
      if (rng.chance(0.65)) {
        const pool = ['lampe', 'lampe', 'moteur', 'int-f', 'int-o', 'amp', 'del'], comps = rng.sample(pool, rng.int(3, 4)).map(t => ({ t }));
        const what = rng.pick(['lampe', 'moteur', 'int-o', 'amp']), n = comps.filter(c => c.t === what).length;
        const word = { lampe: 'lampes', moteur: 'moteurs', 'int-o': 'interrupteurs ouverts', amp: 'ampèremètres' }[what];
        const fig = serieFig(comps, 'Circuit en série à analyser');
        return Q(`psy3c:${comps.map(c => c.t)}:${what}`, `${fig}Ce circuit en série comporte, après la pile, des dipôles formés de : ${comps.map(c => LOOK[c.t]).join(' ; ')}. Combien y a-t-il de <b>${word}</b> ?`, num(n), 'Reconnais chaque symbole un par un.', `Le circuit contient ${listFr(comps.map(c => NAME[c.t]))} : <b>${fmt(n)}</b> ${n > 1 ? word : word.replace(/s\b/g, '')}.`);
      }
      const open = rng.chance(0.5), t2 = open ? 'int-o' : 'int-f';
      return Q(`psy3i:${open}`, `${symFig(t2)}Description du symbole : ${LOOK[t2]}. Le courant peut-il traverser ce dipôle ?`, yesNo(!open), 'Regarde si le trait relie les deux points.', open ? 'C’est un interrupteur <b>ouvert</b> : le courant ne passe pas. <b>Non</b>.' : 'C’est un interrupteur <b>fermé</b> : le courant passe. <b>Oui</b>.');
    },
  });

  // ===================== CIRCUIT OUVERT, FERMÉ, COURT-CIRCUIT =====================
  const REC = {
    lampe: { the: 'la lampe', ask: 'La lampe brille-t-elle ?', on: 'brille' },
    moteur: { the: 'le moteur', ask: 'Le moteur tourne-t-il ?', on: 'tourne' },
  };
  const SHORT_OPTS = ['L1 et L2', 'L1 seulement', 'L2 seulement', 'Aucune'];

  M.notion('pc-circuit-ferme', {
    lesson: {
      retenir: 'Un dipôle ne fonctionne que s’il fait partie d’une <b>boucle continue</b> qui part d’une borne de la pile et revient à l’autre : le circuit est alors <b>fermé</b> et le courant circule. Si la boucle est coupée (interrupteur ouvert, fil débranché, lampe dévissée), le circuit est <b>ouvert</b> : aucun courant ne circule. Une <b>DEL</b> ne laisse passer le courant que dans un sens, le <b>sens passant</b>. Un fil branché directement aux bornes d’un dipôle le <b>court-circuite</b> : le courant passe par le fil et plus par le dipôle. Un fil branché aux bornes de la pile la met en court-circuit : elle chauffe, c’est <b>dangereux</b>.',
      methode: [
        'Pars de la borne + de la pile et suis les fils avec ton doigt.',
        'Vérifie que tu peux revenir à la borne − sans rencontrer d’interrupteur ouvert ni de coupure.',
        'Vérifie le sens des DEL : le courant sort par la borne + de la pile et doit aller dans le sens de la pointe du triangle.',
        'Cherche les fils qui « sautent » un dipôle : ce dipôle est court-circuité, il ne fonctionne pas.',
      ],
      exemples: [
        { q: 'Pile, lampe et interrupteur ouvert en série : la lampe brille-t-elle ?', r: 'La boucle est coupée : <b>non</b>.' },
        { q: 'Pile, DEL dans le sens bloquant, lampe et interrupteur fermé en série ?', r: 'La DEL bloque le courant dans toute la boucle : <b>ni la DEL ni la lampe ne s’allument</b>.' },
        { q: 'Deux lampes en série, un fil branché aux bornes de L2 ?', r: 'L2 est court-circuitée : <b>seule L1 brille</b>.' },
      ],
      astuces: ['Un interrupteur ouvert, une coupure ou une DEL dans le sens bloquant ont le même effet : la boucle est coupée partout.'],
      erreurs: [
        'Croire qu’une lampe placée « avant » l’interrupteur ouvert brille quand même : dans une boucle, tout s’arrête.',
        'Croire qu’un court-circuit fait briller plus fort le dipôle court-circuité : il s’éteint.',
        'Confondre circuit ouvert et circuit fermé : « ouvert » veut dire coupé, comme une porte ouverte qu’on ne peut pas traverser… à l’envers de ce qu’on croit !',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        const rec = rng.pick(['lampe', 'moteur']), closed = rng.chance(0.5), swap = rng.chance(0.5), R0 = REC[rec];
        let comps = [{ t: rec }, { t: closed ? 'int-f' : 'int-o' }];
        if (swap) comps = comps.reverse();
        const fig = serieFig(comps, `Pile, ${NAME[rec]} et ${NAME[closed ? 'int-f' : 'int-o']} en série`), words = sayLoop(comps);
        const why = closed ? 'L’interrupteur est fermé : la boucle est continue, le courant circule.' : 'L’interrupteur est ouvert : la boucle est coupée, aucun courant ne circule.';
        if (rng.chance(0.55)) return Q(`pcf1:${rec}:${closed}:${swap}`, `${fig}${words} ${R0.ask}`, yesNo(closed), 'Suis la boucle avec ton doigt depuis la pile.', `${why} <b>${closed ? 'Oui' : 'Non'}</b>, ${R0.the} ${closed ? '' : 'ne '}${R0.on}${closed ? '' : ' pas'}.`);
        return Q(`pcf1o:${rec}:${closed}:${swap}`, `${fig}${words} Ce circuit est-il ouvert ou fermé ?`, fixedChoice(['Ouvert', 'Fermé'], closed ? 'Fermé' : 'Ouvert'), 'Un circuit fermé forme une boucle continue, sans coupure.', `${why} Le circuit est <b>${closed ? 'fermé' : 'ouvert'}</b>.`);
      }
      if (level === 2) {
        const r = rng.next();
        if (r < 0.35) {
          const rec = rng.pick(['lampe', 'moteur']), k1 = rng.chance(0.5), k2 = rng.chance(0.5), R0 = REC[rec], lit = k1 && k2;
          const comps = [{ t: k1 ? 'int-f' : 'int-o', lab: 'K1' }, { t: rec }, { t: k2 ? 'int-f' : 'int-o', lab: 'K2' }];
          return Q(`pcf2k:${rec}:${k1}:${k2}`, `${serieFig(comps, 'Circuit en série avec deux interrupteurs K1 et K2')}${sayLoop(comps)} ${R0.ask}`, yesNo(lit), 'Le courant doit pouvoir traverser tous les dipôles de la boucle.', lit ? `K1 et K2 sont fermés : la boucle est continue. <b>Oui</b>, ${R0.the} ${R0.on}.` : `Au moins un interrupteur est ouvert : la boucle est coupée. <b>Non</b>, ${R0.the} ne ${R0.on} pas.`);
        }
        if (r < 0.7) {
          const ok = rng.chance(0.5), comps = rng.shuffle([{ t: 'del', ok }, { t: 'lampe' }, { t: 'int-f' }]), askDel = rng.chance(0.5);
          return Q(`pcf2d:${ok}:${comps.map(c => c.t)}:${askDel}`, `${serieFig(comps, `Circuit en série avec une DEL dans le sens ${ok ? 'passant' : 'bloquant'}`)}${sayLoop(comps)} ${askDel ? 'La DEL s’allume-t-elle ?' : 'La lampe brille-t-elle ?'}`, yesNo(ok), 'Le courant sort par la borne + de la pile : va-t-il dans le sens de la pointe du triangle de la DEL ?', ok ? `La DEL est dans le sens passant et l’interrupteur est fermé : le courant circule. <b>Oui</b>.` : `La DEL est dans le sens bloquant : aucun courant ne circule dans la boucle, ni dans la DEL ni dans la lampe. <b>Non</b>.`);
        }
        const cut = rng.chance(0.6), rec = rng.pick(['lampe', 'moteur']), R0 = REC[rec];
        const comps = rng.shuffle([{ t: rec }, { t: 'int-f' }, { t: cut ? 'coupe' : 'fil' }]);
        return Q(`pcf2c:${cut}:${rec}:${comps.map(c => c.t)}`, `${serieFig(comps, cut ? 'Circuit avec un fil débranché' : 'Circuit complet')}${sayLoop(comps)} ${R0.ask}`, yesNo(!cut), 'Vérifie qu’aucun endroit de la boucle n’est coupé.', cut ? `Un fil est débranché : le circuit est ouvert. <b>Non</b>, ${R0.the} ne ${R0.on} pas.` : `L’interrupteur est fermé et tous les fils sont branchés : <b>oui</b>, ${R0.the} ${R0.on}.`);
      }
      if (rng.chance(0.55)) {
        const s = rng.int(0, 2), closed = rng.chance(0.7), comps = rng.shuffle([{ t: 'lampe', lab: 'L1', short: s === 1 }, { t: 'lampe', lab: 'L2', short: s === 2 }, { t: closed ? 'int-f' : 'int-o' }]);
        const right = !closed ? 'Aucune' : s === 0 ? 'L1 et L2' : s === 1 ? 'L2 seulement' : 'L1 seulement';
        const fig = serieFig(comps, 'Deux lampes en série, avec peut-être un fil aux bornes de l’une d’elles');
        const corr = !closed ? 'L’interrupteur est ouvert : aucun courant ne circule. <b>Aucune</b> lampe ne brille.' : s === 0 ? 'La boucle est fermée et aucune lampe n’est court-circuitée : <b>L1 et L2</b> brillent.' : `L${s} est court-circuitée : le courant passe par le fil et non par elle. <b>${right}</b> brille.`;
        return Q(`pcf3s:${s}:${closed}:${comps.map(c => c.t + (c.lab || ''))}`, `${fig}${sayLoop(comps)} Quelles lampes brillent ?`, fixedChoice(SHORT_OPTS, right), 'Un fil branché aux bornes d’une lampe offre un chemin plus facile au courant.', corr);
      }
      const rec = rng.pick(['lampe', 'moteur']), closed = rng.chance(0.5), comps = rng.shuffle([{ t: rec }, { t: closed ? 'int-f' : 'int-o' }]);
      const right = 'La pile est en court-circuit : elle chauffe, c’est dangereux';
      return Q(`pcf3g:${rec}:${closed}:${comps.map(c => c.t)}`, `${serieFig(comps, 'Circuit avec un fil branché directement aux bornes de la pile', { t: 'pile', short: true })}Un circuit comporte une pile, ${NAME[rec]} et ${NAME[closed ? 'int-f' : 'int-o']} en série. Un fil relie en plus directement les deux bornes de la pile. Que se passe-t-il ?`, choice(rng, right, [`${cap(REC[rec].the)} fonctionne plus fort`, `${cap(REC[rec].the)} fonctionne normalement, sans danger`, 'Rien : la pile est protégée par le fil']), 'Par où passe le courant qui sort de la pile ? Un simple fil ne freine presque pas le courant.', `Le fil relie directement les deux bornes de la pile : <b>la pile est en court-circuit</b>, le courant y est très intense, elle chauffe (risque de brûlure ou d’incendie) et ${REC[rec].the} ne fonctionne pas.`);
    },
  });

  // ===================== SÉRIE OU DÉRIVATION =====================
  const labs = n => Array.from({ length: n }, (_, k) => `L${k + 1}`);
  const deriv = (n, opts = {}) => deriveFig(labs(n).map(l => [{ t: 'lampe', lab: l }]), `Circuit en dérivation : ${n} branches contenant chacune une lampe`, opts.top || []);
  const sayDeriv = (n, extra = '') => `La pile alimente ${n} branches en dérivation, chacune avec une lampe (${listFr(labs(n))})${extra}.`;
  const litText = (lit, n) => (lit.length === 0 ? 'Aucune' : lit.length === n ? (n === 2 ? 'L1 et L2' : 'Toutes') : listFr(lit) + (lit.length === 1 ? ' seulement' : ''));
  const CONTEXTS = [
    ['Dans une guirlande ancienne, quand une ampoule grille, toutes les autres s’éteignent.', 'série'],
    ['Dans une maison, on peut allumer la lampe du salon sans allumer celle de la cuisine.', 'dérivation'],
    ['Dans une lampe de poche, la pile, l’interrupteur et l’ampoule forment une seule boucle.', 'série'],
    ['Quand Hugo débranche le grille-pain, le réfrigérateur continue de fonctionner.', 'dérivation'],
    ['Sur la voiture de Chloé, un phare a grillé, mais l’autre est resté allumé.', 'dérivation'],
    ['Le circuit ne comporte qu’une seule boucle.', 'série'],
    ['Le circuit comporte des nœuds, d’où partent plusieurs branches.', 'dérivation'],
    ['Un seul interrupteur, placé n’importe où, éteint toutes les lampes du circuit.', 'série'],
    ['Avec une multiprise, Inès peut allumer sa lampe de bureau sans allumer son ordinateur.', 'dérivation'],
  ];

  M.notion('pc-serie-derivation', {
    lesson: {
      retenir: `Dans un circuit <b>en série</b>, tous les dipôles sont dans une <b>seule boucle</b> : si un dipôle est retiré ou grille, la boucle est coupée et plus rien ne fonctionne. Dans un circuit <b>en dérivation</b>, il y a <b>plusieurs boucles</b> qui passent par la pile ; elles se séparent et se rejoignent en des points appelés <b>nœuds</b>. Chaque branche fonctionne <b>indépendamment</b> : si on dévisse une lampe, les autres branches restent allumées. Un interrupteur placé dans une branche ne commande que cette branche ; placé dans la branche principale, il commande tout. Les appareils d’une maison sont branchés en dérivation.`,
      methode: [
        'Pars de la borne + de la pile et suis le courant avec ton doigt.',
        'Si tu n’as jamais à choisir de chemin, c’est un circuit en série (une seule boucle).',
        'Si le chemin se sépare à un nœud, les dipôles des différentes branches sont en dérivation.',
        'Pour prévoir l’effet d’une coupure, regarde quelles boucles passant par la pile restent complètes.',
      ],
      exemples: [
        { q: 'Deux lampes en série, on dévisse L1 : que fait L2 ?', r: 'La seule boucle est coupée : <b>L2 s’éteint</b>.' },
        { q: 'Deux lampes en dérivation, on dévisse L1 : que fait L2 ?', r: 'La boucle de L2 est intacte : <b>L2 reste allumée</b>.' },
      ],
      astuces: ['Compte les boucles qui passent par la pile : une seule → série ; plusieurs → dérivation.'],
      erreurs: [
        'Croire que des lampes alignées sur le dessin sont forcément en série : seul le chemin du courant compte.',
        'Croire qu’en dérivation, dévisser une lampe éteint toutes les autres.',
        'Croire qu’un interrupteur dans une branche commande toutes les lampes.',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        const isSerie = rng.chance(0.5), n = rng.int(2, 3), mot = rng.chance(0.4);
        let fig, words;
        if (isSerie) {
          const comps = labs(n).map((l, k) => ({ t: mot && k === n - 1 ? 'moteur' : 'lampe', lab: mot && k === n - 1 ? 'M' : l }));
          fig = serieFig(comps, `Circuit à analyser : ${n} dipôles et une pile`); words = sayPath(comps);
        } else {
          const br = labs(n).map((l, k) => [{ t: mot && k === n - 1 ? 'moteur' : 'lampe', lab: mot && k === n - 1 ? 'M' : l }]);
          fig = deriveFig(br, `Circuit à analyser : ${n} dipôles et une pile`); words = `En partant de la pile, le courant arrive à un point d’où partent ${n} chemins, contenant ${listFr(br.map(b => say(b[0])))} ; ces chemins se rejoignent avant de revenir à la pile.`;
        }
        if (rng.chance(0.5)) return Q(`psd1:${isSerie}:${n}:${mot}`, `${fig}${words} Ces dipôles sont-ils branchés en série ou en dérivation ?`, fixedChoice(['En série', 'En dérivation'], isSerie ? 'En série' : 'En dérivation'), 'Suis le courant depuis la pile : dois-tu choisir un chemin ?', isSerie ? 'Il n’y a qu’une seule boucle : <b>en série</b>.' : `Le courant se partage à un nœud en plusieurs branches : <b>en dérivation</b>.`);
        return Q(`psd1b:${isSerie}:${n}:${mot}`, `${fig}${words} Combien de boucles différentes passent par la pile ?`, num(isSerie ? 1 : n), 'Une boucle part de la pile et y revient. Compte les chemins possibles.', isSerie ? 'Tous les dipôles sont sur le même chemin : <b>1</b> boucle.' : `Chaque branche forme une boucle avec la pile : <b>${fmt(n)}</b> boucles.`);
      }
      if (level === 2) {
        if (rng.chance(0.5)) {
          const isSerie = rng.chance(0.5), n = rng.int(2, 3), k = rng.int(1, n);
          const fig = isSerie ? serieFig(labs(n).map(l => ({ t: 'lampe', lab: l })), `${n} lampes en série`) : deriv(n);
          const words = isSerie ? `Les lampes ${listFr(labs(n))} sont en série avec la pile.` : sayDeriv(n);
          const right = isSerie ? 'Elles s’éteignent toutes' : 'Elles restent allumées';
          return Q(`psd2u:${isSerie}:${n}:${k}`, `${fig}${words} Toutes les lampes brillent. On dévisse la lampe L${k}. Que deviennent les autres lampes ?`, fixedChoice(['Elles s’éteignent toutes', 'Elles restent allumées', 'Seules les lampes situées avant L' + k + ' restent allumées'], right), 'Regarde quelles boucles passant par la pile restent complètes.', isSerie ? `Dévisser L${k} coupe la seule boucle : <b>les autres lampes s’éteignent</b>.` : `Les autres branches forment toujours une boucle avec la pile : <b>elles restent allumées</b>.`);
        }
        const n = rng.int(2, 3), where = rng.int(0, n);   // 0: main branch, j: branch j
        const br = labs(n).map((l, k) => (k + 1 === where ? [{ t: 'int-o', lab: 'K' }, { t: 'lampe', lab: l }] : [{ t: 'lampe', lab: l }]));
        const fig = deriveFig(br, `Circuit en dérivation avec un interrupteur ouvert K`, where === 0 ? [{ t: 'int-o', lab: 'K' }] : []);
        const lit = where === 0 ? [] : labs(n).filter((l, k) => k + 1 !== where), right = litText(lit, n);
        const dis = [litText(labs(n), n), 'Aucune', where ? `L${where} seulement` : 'L1 seulement', litText(labs(n).slice(1), n)];
        return Q(`psd2k:${n}:${where}`, `${fig}${sayDeriv(n, where === 0 ? ', et un interrupteur ouvert K est placé dans la branche principale, à côté de la pile' : `, et un interrupteur ouvert K est placé dans la branche de L${where}`)} Quelles lampes brillent ?`, choice(rng, right, dis), 'Un interrupteur ne coupe que la ou les boucles dans lesquelles il se trouve.', where === 0 ? 'K est dans la branche principale : toutes les boucles sont coupées. <b>Aucune</b> lampe ne brille.' : `K ne coupe que la branche de L${where}. Brillent : <b>${right}</b>.`);
      }
      if (rng.chance(0.55)) {
        const k = rng.int(1, 3), m = rng.chance(0.4);
        const top = [{ t: 'lampe', lab: 'L1' }], br = [[{ t: 'lampe', lab: 'L2' }], [{ t: m ? 'moteur' : 'lampe', lab: m ? 'M' : 'L3' }]];
        const names = ['L1', 'L2', m ? 'le moteur M' : 'L3'];
        const fig = deriveFig(br, 'Circuit mixte : L1 dans la branche principale, puis deux branches en dérivation', top);
        const on = k === 1 ? [] : names.filter((x, i) => i !== k - 1), other = names[k === 2 ? 2 : 1];
        const right = on.length ? `${cap(listFr(on))} fonctionnent` : 'Plus rien ne fonctionne';
        const dis = k === 1 ? [`${cap(listFr(names.slice(1)))} fonctionnent`, 'Seule L2 fonctionne', 'Tout fonctionne encore'] : ['Plus rien ne fonctionne', 'Seule L1 fonctionne', `${cap(other)} seul${m && other !== 'L2' ? '' : 'e'} fonctionne`];
        const act = k === 3 && m ? 'On débranche le moteur M' : `On dévisse L${k}`;
        return Q(`psd3m:${k}:${m}`, `${fig}La lampe L1 est dans la branche principale, à côté de la pile ; ensuite le courant se partage entre une branche avec L2 et une branche avec ${names[2]}. Tout fonctionne. ${act}. Que se passe-t-il ?`, choice(rng, right, dis), 'Le courant de toutes les branches passe par la branche principale.', k === 1 ? 'L1 est dans la branche principale : toutes les boucles sont coupées. <b>Plus rien ne fonctionne</b>.' : `La boucle qui passe par L1 et l’autre branche reste complète : <b>${right}</b>.`);
      }
      const i = rng.int(0, CONTEXTS.length - 1), [ctx, ans] = CONTEXTS[i];
      return Q(`psd3c:${i}`, `${ctx} Les dipôles sont-ils branchés en série ou en dérivation ?`, fixedChoice(['En série', 'En dérivation'], 'En ' + ans), 'En série, tout dépend de la même boucle ; en dérivation, chaque branche est indépendante.', `${ans === 'série' ? 'Une seule boucle commune' : 'Des branches indépendantes'} : <b>en ${ans}</b>.`);
    },
  });

  // ===================== INTENSITÉ =====================
  const I_FACTS = [
    ['Quelle est l’unité de l’intensité du courant électrique ?', 'L’ampère (A)', ['Le volt (V)', 'Le joule (J)', 'Le kilogramme (kg)']],
    ['Quel appareil mesure l’intensité du courant ?', 'L’ampèremètre', ['Le voltmètre', 'Le thermomètre', 'La balance']],
    ['Comment branche-t-on un ampèremètre ?', 'En série, dans la boucle', ['En dérivation, aux bornes d’un dipôle', 'Directement aux bornes de la pile', 'N’importe comment']],
    ['Quelle lettre porte le symbole de l’ampèremètre ?', 'A', ['V', 'M', 'I']],
  ];
  const mA = v => `${fmt(v)} mA`;

  M.notion('pc-intensite', {
    lesson: {
      retenir: 'L’<b>intensité</b> du courant électrique se note <i>I</i> et se mesure en <b>ampères</b> (A) avec un <b>ampèremètre</b>, branché <b>en série</b> dans la boucle (le courant doit le traverser). On utilise aussi le <b>milliampère</b> : 1 A = 1 000 mA. Dans un circuit en série, l’intensité est <b>la même en tout point</b> : on parle d’unicité de l’intensité.',
      methode: [
        'Pour mesurer l’intensité, ouvre la boucle là où tu veux mesurer et insère l’ampèremètre dans la boucle.',
        'Pour convertir des A en mA, multiplie par 1 000 ; des mA en A, divise par 1 000.',
        'Dans un circuit en série, une seule mesure suffit : la valeur est la même partout dans la boucle.',
      ],
      exemples: [
        { q: '0,25 A en mA', r: '0,25 × 1 000 = <b>250 mA</b>.' },
        { q: 'Circuit en série : l’ampèremètre placé avant la lampe indique 180 mA. Intensité dans le moteur ?', r: 'Même boucle, même intensité : <b>180 mA</b>.' },
      ],
      astuces: ['L’ampèremètre se branche comme un dipôle de plus dans la boucle ; le voltmètre, lui, se branche « en pont » aux bornes d’un dipôle.'],
      erreurs: [
        'Croire que le courant « s’use » en traversant une lampe : en série, l’intensité est la même avant et après.',
        'Brancher l’ampèremètre en dérivation aux bornes d’un dipôle.',
        'Confondre 0,5 A et 5 mA : 0,5 A = 500 mA.',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        const r = rng.next();
        if (r < 0.3) {
          const i = rng.int(0, I_FACTS.length - 1), [q, a, d] = I_FACTS[i];
          return Q(`pin1f:${i}`, q, choice(rng, a, d), 'Ampère, ampèremètre : tout part du même nom.', `<b>${a}</b>.`);
        }
        if (r < 0.65) {
          if (rng.chance(0.5)) { const a = rng.int(1, 9) / 10, v = mul(a, 1000); return Q(`pin1a:${a}`, `Convertis : ${fmt(a)} A = ? mA`, num(v, 'mA'), '1 A = 1 000 mA.', `${fmt(a)} × 1 000 = <b>${fmt(v)}</b> mA.`); }
          const v = rng.int(1, 9) * 100, a = div(v, 1000);
          return Q(`pin1b:${v}`, `Convertis : ${mA(v)} = ? A`, num(a, 'A'), '1 A = 1 000 mA.', `${fmt(v)} ÷ 1 000 = <b>${fmt(a)}</b> A.`);
        }
        const rec = rng.pick(['lampe', 'moteur']), good = rng.chance(0.5), swap = rng.chance(0.5);
        let comps = good ? [{ t: 'amp' }, { t: rec }, { t: 'int-f' }] : [{ t: rec, v: 'amp' }, { t: 'int-f' }];
        if (swap) comps = comps.reverse();
        const words = good ? `L’ampèremètre est placé dans la boucle, en série avec ${NAME[rec]} et l’interrupteur.` : `L’ampèremètre est branché en dérivation, aux bornes ${rec === 'lampe' ? 'de la lampe' : 'du moteur'}.`;
        return Q(`pin1c:${rec}:${good}:${swap}`, `${serieFig(comps, words)}${words} L’ampèremètre est-il correctement branché ?`, yesNo(good), 'Le courant à mesurer doit traverser l’ampèremètre.', good ? 'Il est dans la boucle, en série : <b>oui</b>.' : 'Il est en dérivation : <b>non</b>, un ampèremètre se branche en série.');
      }
      if (level === 2) {
        if (rng.chance(0.55)) {
          const I = rng.int(6, 45) * 10, swap = rng.chance(0.5), ask = rng.pick(['la lampe', 'le moteur', 'l’interrupteur']);
          const comps = [{ t: 'amp' }, { t: swap ? 'moteur' : 'lampe' }, { t: 'int-f' }, { t: swap ? 'lampe' : 'moteur' }];
          return Q(`pin2u:${I}:${swap}:${ask}`, `${serieFig(comps, 'Circuit en série avec un ampèremètre, une lampe, un moteur et un interrupteur fermé')}${sayLoop(comps)} L’ampèremètre indique ${mA(I)}. Quelle est l’intensité du courant qui traverse ${ask} ?`, num(I, 'mA'), 'Combien de boucles dans ce circuit ? Que sais-tu de l’intensité dans une boucle ?', `Le circuit est en série : l’intensité est la même en tout point, <b>${fmt(I)}</b> mA.`);
        }
        if (rng.chance(0.5)) { const a = rng.int(1, 99) / 1000, v = mul(a, 1000); return Q(`pin2a:${a}`, `Convertis : ${fmt(a)} A = ? mA`, num(v, 'mA'), '1 A = 1 000 mA : décale la virgule de trois rangs.', `${fmt(a)} × 1 000 = <b>${fmt(v)}</b> mA.`); }
        const v = rng.int(101, 2500) * 10, a = div(v, 1000);
        return Q(`pin2b:${v}`, `Convertis : ${mA(v)} = ? A`, num(a, 'A'), '1 A = 1 000 mA : décale la virgule de trois rangs.', `${fmt(v)} ÷ 1 000 = <b>${fmt(a)}</b> A.`);
      }
      if (rng.chance(0.5)) {
        const I = rng.int(5, 60) * 5, a = div(I, 1000), who = rng.pick(['Léa', 'Hugo', 'Inès', 'Noah', 'Chloé']);
        const comps = [{ t: 'amp', lab: 'A1' }, { t: 'lampe' }, { t: 'amp', lab: 'A2' }, { t: 'int-f' }];
        return Q(`pin3a:${I}:${who}`, `${serieFig(comps, 'Circuit en série avec deux ampèremètres A1 et A2')}${who} réalise un circuit en série : ${listFr(['une pile', ...comps.map(say)])}. L’ampèremètre A1 indique ${mA(I)}. Quelle valeur, en ampères, indique A2 ?`, num(a, 'A'), 'Deux étapes : que sais-tu de l’intensité dans une boucle unique ? Puis convertis.', `En série, l’intensité est la même partout : ${mA(I)}, soit ${fmt(I)} ÷ 1 000 = <b>${fmt(a)}</b> A.`);
      }
      const I1 = rng.int(2, 60) * 10, f = rng.pick([1, 1, 10, 0.1]), I2 = div(mul(I1, f), 1000);
      const rel = f === 1 ? '=' : f > 1 ? '&lt;' : '&gt;';
      return Q(`pin3c:${I1}:${f}`, `Compare les intensités <i>I</i><sub>1</sub> = ${mA(I1)} et <i>I</i><sub>2</sub> = ${fmt(I2)} A.`, fixedChoice(['<i>I</i><sub>1</sub> &lt; <i>I</i><sub>2</sub>', '<i>I</i><sub>1</sub> = <i>I</i><sub>2</sub>', '<i>I</i><sub>1</sub> &gt; <i>I</i><sub>2</sub>'], `<i>I</i><sub>1</sub> ${rel} <i>I</i><sub>2</sub>`), 'Convertis d’abord les deux intensités dans la même unité.', `<i>I</i><sub>2</sub> = ${fmt(I2)} A = ${mA(mul(I2, 1000))}. Donc <b><i>I</i><sub>1</sub> ${rel} <i>I</i><sub>2</sub></b>.`);
    },
  });

  // ===================== TENSION =====================
  const U_FACTS = [
    ['Quelle est l’unité de la tension électrique ?', 'Le volt (V)', ['L’ampère (A)', 'Le joule (J)', 'Le mètre (m)']],
    ['Quel appareil mesure la tension électrique ?', 'Le voltmètre', ['L’ampèremètre', 'Le thermomètre', 'Le chronomètre']],
    ['Comment branche-t-on un voltmètre ?', 'En dérivation, aux bornes du dipôle', ['En série, dans la boucle', 'À la place de la pile', 'N’importe comment']],
  ];
  const PILES = [1.5, 4.5, 9];

  M.notion('pc-tension', {
    lesson: {
      retenir: 'La <b>tension électrique</b> se note <i>U</i> et se mesure en <b>volts</b> (V) avec un <b>voltmètre</b>, branché <b>en dérivation</b>, c’est-à-dire aux bornes du dipôle (sans ouvrir la boucle). On utilise aussi le <b>millivolt</b> : 1 V = 1 000 mV. La tension indiquée sur une pile (1,5 V, 4,5 V, 9 V) est la tension entre ses bornes. La tension aux bornes d’un <b>fil</b> ou d’un <b>interrupteur fermé</b> est <b>nulle</b> (0 V).',
      methode: [
        'Repère les deux bornes du dipôle étudié.',
        'Relie la borne V du voltmètre à l’une, la borne COM à l’autre : le voltmètre forme un « pont » à côté du dipôle.',
        'Lis la valeur ; si elle est négative, inverse simplement les deux fils.',
        'Pour convertir des V en mV, multiplie par 1 000 ; des mV en V, divise par 1 000.',
      ],
      exemples: [
        { q: '4,5 V en mV', r: '4,5 × 1 000 = <b>4 500 mV</b>.' },
        { q: 'Tension aux bornes d’un interrupteur fermé ?', r: '<b>0 V</b> : c’est comme un simple fil.' },
      ],
      astuces: ['Intensité : on <b>ouvre</b> la boucle pour y mettre l’ampèremètre (série). Tension : on se branche <b>à côté</b> du dipôle (dérivation).'],
      erreurs: [
        'Brancher le voltmètre en série dans la boucle.',
        'Confondre tension (en V) et intensité (en A).',
        'Croire que la tension aux bornes d’un interrupteur ouvert est nulle : elle ne l’est pas, le courant ne passe pas mais la tension existe.',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        const r = rng.next();
        if (r < 0.3) {
          if (rng.chance(0.6)) { const i = rng.int(0, U_FACTS.length - 1), [q, a, d] = U_FACTS[i]; return Q(`pte1f:${i}`, q, choice(rng, a, d), 'Volt, voltmètre : tout part du même nom.', `<b>${a}</b>.`); }
          const u = rng.pick(PILES);
          return Q(`pte1p:${u}`, `Sur une pile, on lit l’indication « ${fmt(u)} V ». Que représente cette valeur ?`, choice(rng, 'La tension entre ses bornes', ['L’intensité du courant qu’elle produit', 'L’énergie qu’elle contient', 'Sa durée de vie']), 'Regarde l’unité : V comme…', `V est le symbole du volt, l’unité de <b>tension</b> : ${fmt(u)} V est la tension entre les bornes de la pile.`);
        }
        if (r < 0.65) {
          if (rng.chance(0.5)) { const u = rng.pick([1, 2, 3, 4, 5, 6, 9, 12]) + rng.pick([0, 0.5]), v = mul(u, 1000); return Q(`pte1a:${u}`, `Convertis : ${fmt(u)} V = ? mV`, num(v, 'mV'), 'Pour passer des volts aux millivolts, on multiplie par mille.', `${fmt(u)} × 1 000 = <b>${fmt(v)}</b> mV.`); }
          const v = rng.int(1, 9) * 500, u = div(v, 1000);
          return Q(`pte1b:${v}`, `Convertis : ${fmt(v)} mV = ? V`, num(u, 'V'), '1 V = 1 000 mV.', `${fmt(v)} ÷ 1 000 = <b>${fmt(u)}</b> V.`);
        }
        const rec = rng.pick(['lampe', 'moteur']), good = rng.chance(0.5), swap = rng.chance(0.5);
        let comps = good ? [{ t: rec, v: 'volt' }, { t: 'int-f' }] : [{ t: 'volt' }, { t: rec }, { t: 'int-f' }];
        if (swap) comps = comps.reverse();
        const words = good ? `Le voltmètre est branché aux bornes ${rec === 'lampe' ? 'de la lampe' : 'du moteur'}, en dérivation.` : `Le voltmètre est placé dans la boucle, en série avec ${NAME[rec]} et l’interrupteur.`;
        return Q(`pte1c:${rec}:${good}:${swap}`, `${serieFig(comps, words)}${words} Le voltmètre est-il correctement branché pour mesurer la tension aux bornes ${rec === 'lampe' ? 'de la lampe' : 'du moteur'} ?`, yesNo(good), 'Un voltmètre se branche « en pont », aux deux bornes du dipôle étudié.', good ? 'Il est en dérivation aux bornes du dipôle : <b>oui</b>.' : 'Il est en série dans la boucle : <b>non</b>, un voltmètre se branche en dérivation.');
      }
      if (level === 2) {
        if (rng.chance(0.55)) {
          const target = rng.pick(['int-f', 'fil', 'pile']), u = rng.pick(PILES), rec = rng.pick(['lampe', 'moteur']), opts = ['0 V', `Environ ${fmt(u)} V`, `Environ ${fmt(u * 2)} V`];
          let fig, words;
          if (target === 'pile') {
            const comps = [{ t: rec }, { t: 'int-o' }];
            fig = serieFig(comps, `Voltmètre aux bornes de la pile de ${fmt(u)} V`, { t: 'pile', v: 'volt' });
            words = `Un voltmètre est branché aux bornes d’une pile neuve marquée ${fmt(u)} V, dans un circuit avec ${NAME[rec]} et un interrupteur ouvert.`;
          } else {
            const comps = [{ t: rec }, { t: target, v: 'volt' }];
            fig = serieFig(comps, `Voltmètre aux bornes ${target === 'fil' ? 'd’un fil' : 'de l’interrupteur fermé'}`);
            words = `Le circuit comporte une pile de ${fmt(u)} V, ${NAME[rec]} et ${target === 'fil' ? 'des fils' : 'un interrupteur fermé'}, en série. Un voltmètre est branché aux bornes ${target === 'fil' ? 'd’un fil de connexion' : 'de l’interrupteur fermé'}.`;
          }
          const right = target === 'pile' ? opts[1] : opts[0];
          return Q(`pte2v:${target}:${u}:${rec}`, `${fig}${words} Que peut indiquer le voltmètre ?`, fixedChoice(opts, right), target === 'pile' ? 'Que signifie l’indication écrite sur une pile ?' : 'Ce dipôle se comporte comme un simple fil.', target === 'pile' ? `La tension aux bornes d’une pile neuve est proche de la valeur indiquée : <b>environ ${fmt(u)} V</b>.` : `La tension aux bornes ${target === 'fil' ? 'd’un fil' : 'd’un interrupteur fermé'} est nulle : <b>0 V</b>.`);
        }
        if (rng.chance(0.5)) { const u = rng.int(1, 99) / 100, v = mul(u, 1000); return Q(`pte2a:${u}`, `Convertis : ${fmt(u)} V = ? mV`, num(v, 'mV'), '1 V = 1 000 mV : décale la virgule de trois rangs.', `${fmt(u)} × 1 000 = <b>${fmt(v)}</b> mV.`); }
        const v = rng.int(11, 999) * 10, u = div(v, 1000);
        return Q(`pte2b:${v}`, `Convertis : ${fmt(v)} mV = ? V`, num(u, 'V'), '1 V = 1 000 mV : décale la virgule de trois rangs.', `${fmt(v)} ÷ 1 000 = <b>${fmt(u)}</b> V.`);
      }
      const r = rng.next();
      if (r < 0.4) {
        const u = rng.pick(PILES), target = rng.pick(['int-o', 'lampe']), comps = target === 'int-o' ? [{ t: 'lampe' }, { t: 'int-o', v: 'volt' }] : [{ t: 'lampe', v: 'volt' }, { t: 'int-o' }];
        const fig = serieFig(comps, `Circuit ouvert, voltmètre aux bornes ${target === 'int-o' ? 'de l’interrupteur ouvert' : 'de la lampe'}`);
        const right = target === 'int-o' ? 'Non nulle' : 'Nulle';
        return Q(`pte3o:${u}:${target}`, `${fig}Une pile de ${fmt(u)} V, une lampe et un interrupteur <b>ouvert</b> sont en série. Le voltmètre est branché aux bornes ${target === 'int-o' ? 'de l’interrupteur ouvert' : 'de la lampe'}. La tension mesurée est-elle nulle ou non nulle ?`, fixedChoice(['Nulle', 'Non nulle'], right), 'Aucun courant ne circule. Mais le voltmètre est-il relié, par des fils, aux deux bornes de la pile ?', target === 'int-o' ? `Par l’intermédiaire de la lampe et des fils, le voltmètre est relié aux deux bornes de la pile : on mesure environ ${fmt(u)} V, une tension <b>non nulle</b>.` : 'La lampe éteinte d’un circuit ouvert a une tension <b>nulle</b> à ses bornes.');
      }
      if (r < 0.75) {
        const U1 = rng.int(3, 95) * 100, f = rng.pick([1, 1, 10, 0.1]), U2 = div(mul(U1, f), 1000), rel = f === 1 ? '=' : f > 1 ? '&lt;' : '&gt;';
        return Q(`pte3c:${U1}:${f}`, `Compare les tensions <i>U</i><sub>1</sub> = ${fmt(U1)} mV et <i>U</i><sub>2</sub> = ${fmt(U2)} V.`, fixedChoice(['<i>U</i><sub>1</sub> &lt; <i>U</i><sub>2</sub>', '<i>U</i><sub>1</sub> = <i>U</i><sub>2</sub>', '<i>U</i><sub>1</sub> &gt; <i>U</i><sub>2</sub>'], `<i>U</i><sub>1</sub> ${rel} <i>U</i><sub>2</sub>`), 'Convertis d’abord les deux tensions dans la même unité.', `<i>U</i><sub>2</sub> = ${fmt(U2)} V = ${fmt(mul(U2, 1000))} mV. Donc <b><i>U</i><sub>1</sub> ${rel} <i>U</i><sub>2</sub></b>.`);
      }
      const u = rng.pick(PILES), who = rng.pick(['Sam', 'Léa', 'Hugo', 'Inès', 'Noah']);
      return Q(`pte3n:${u}:${who}`, `${who} mesure la tension aux bornes d’une pile de ${fmt(u)} V. Le voltmètre affiche « −${fmt(u)} ». Que faut-il en conclure ?`, choice(rng, 'Les fils sont branchés à l’envers sur le voltmètre : il suffit de les inverser', ['La pile est cassée', 'Le voltmètre est branché en série', 'La tension de la pile est négative, il faut la jeter']), 'Que change le fait d’échanger les fils sur les bornes V et COM ?', `Le signe « − » indique que les bornes V et COM sont <b>inversées</b> : en échangeant les fils, on lit ${fmt(u)} V.`);
    },
  });

  // ===================== SÉCURITÉ ÉLECTRIQUE =====================
  const SITU = [
    ['Brancher le circuit de la classe sur une prise de courant', true],
    ['Introduire un objet métallique dans une prise', true],
    ['Utiliser un sèche-cheveux branché au bord de la baignoire', true],
    ['Toucher un appareil branché avec les mains mouillées', true],
    ['Relier directement les deux bornes d’une pile par un fil', true],
    ['Débrancher un appareil en tirant sur son câble', true],
    ['Faire voler un cerf-volant près d’une ligne électrique', true],
    ['Toucher les deux bornes d’une pile de 4,5 V avec les doigts secs', false],
    ['Réaliser un circuit avec une pile de 9 V, une lampe et un interrupteur', false],
    ['Changer les piles d’une lampe de poche', false],
    ['Allumer une lampe avec un interrupteur, les mains sèches', false],
  ];
  const ROLES = [
    ['un fusible', 'Couper le courant quand l’intensité devient trop grande (court-circuit, surcharge)'],
    ['un disjoncteur différentiel', 'Couper le courant en cas de fuite de courant, par exemple à travers une personne'],
    ['la prise de terre', 'Évacuer vers le sol le courant de fuite d’un appareil à carcasse métallique'],
    ['un cache-prise', 'Empêcher les jeunes enfants d’introduire un objet dans la prise'],
  ];
  const VOLTS = [1.5, 4.5, 9, 230, 400, 20000, 63000];
  const SAFE_TRAPS = [
    ['Un appareil éteint mais branché sur la prise ne présente plus aucun danger.', false, 'Les fils et la prise restent sous tension 230 V : on <b>débranche</b> avant de réparer ou nettoyer.'],
    ['Le corps humain conduit le courant électrique, encore mieux quand il est mouillé.', true, 'C’est pour cela qu’on ne touche jamais un appareil électrique les mains mouillées.'],
    ['Une pile de 4,5 V mise en court-circuit ne risque rien.', false, 'En court-circuit, la pile et les fils <b>chauffent</b> : risque de brûlure, la pile s’abîme.'],
    ['Si quelqu’un est électrisé, il faut d’abord couper le courant avant de le toucher.', true, 'Sinon le courant peut aussi traverser le sauveteur. Ensuite, on appelle les secours (15, 18 ou 112).'],
    ['On peut tester le circuit de la classe sur une prise si l’on porte des gants.', false, 'La tension du secteur (230 V) est dangereuse : on n’utilise <b>jamais</b> une prise pour les expériences.'],
    ['Une tension de 230 V peut être mortelle.', true, 'Le secteur peut provoquer une électrocution.'],
    ['Un court-circuit sur l’installation de la maison peut provoquer un incendie.', true, 'Les fils traversés par un courant très intense chauffent ; fusibles et disjoncteurs coupent alors le courant.'],
    ['La prise de terre sert à faire fonctionner l’appareil.', false, 'Elle sert à la <b>sécurité</b> : elle évacue vers le sol un éventuel courant de fuite.'],
    ['Les tensions des piles utilisées en classe (moins de 24 V) ne sont pas dangereuses pour le corps humain.', true, 'Les très basses tensions, inférieures à 24 V, ne présentent pas de danger d’électrocution.'],
  ];

  M.notion('pc-securite-elec', {
    lesson: {
      retenir: 'Le corps humain <b>conduit</b> le courant électrique, surtout s’il est mouillé. Le courant qui traverse le corps peut provoquer brûlures, arrêt du cœur : c’est l’<b>électrisation</b> (l’<b>électrocution</b> si elle est mortelle). La tension du <b>secteur</b> (les prises de la maison) est de <b>230 V</b> : elle est dangereuse. Les piles utilisées en classe (moins de 24 V) ne le sont pas pour le corps, mais une pile en <b>court-circuit</b> chauffe. Pour se protéger, on utilise des <b>fusibles</b> et <b>disjoncteurs</b> (ils coupent le courant s’il devient trop intense), un <b>disjoncteur différentiel</b> (il coupe le courant en cas de fuite, par exemple à travers une personne) et la <b>prise de terre</b>.',
      methode: [
        'Ne branche jamais un montage de la classe sur une prise.',
        'Ne touche jamais un appareil branché avec les mains mouillées ; éloigne les appareils de l’eau.',
        'Débranche un appareil en tenant la fiche, jamais en tirant sur le câble ; débranche-le avant de le nettoyer.',
        'Si quelqu’un est électrisé : coupe le courant d’abord, puis appelle les secours.',
      ],
      exemples: [
        { q: 'Un circuit avec une pile de 4,5 V est-il dangereux pour le corps ?', r: 'Non : la tension est inférieure à 24 V. Mais <b>pas de court-circuit</b>, la pile chaufferait.' },
        { q: 'Que fait un disjoncteur différentiel ?', r: 'Il <b>coupe le courant</b> dès qu’une partie du courant s’échappe, par exemple à travers une personne.' },
      ],
      astuces: ['Eau + électricité = danger.', 'Secteur 230 V : jamais d’expérience. Piles : expériences autorisées.'],
      erreurs: [
        'Croire qu’un appareil éteint mais branché est sans danger.',
        'Croire que le disjoncteur sert à faire fonctionner les appareils : il sert à couper le courant en cas de problème.',
        'Confondre électrisation (passage du courant dans le corps) et électrocution (électrisation mortelle).',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        if (rng.chance(0.7)) {
          const i = rng.int(0, SITU.length - 1), [s, d] = SITU[i];
          return Q(`pse_1:${i}`, `Cette situation est-elle dangereuse ? « ${s}. »`, fixedChoice(['Dangereuse', 'Sans danger'], d ? 'Dangereuse' : 'Sans danger'), 'Pense à la tension en jeu (secteur ou pile), à l’eau et aux courts-circuits.', d ? `<b>Dangereuse</b> : ${/pile/.test(s) ? 'la pile en court-circuit chauffe fortement' : /tirant/.test(s) ? 'le câble peut s’abîmer et laisser apparaître les fils sous tension' : /ligne/.test(s) ? 'les lignes électriques sont à très haute tension' : 'on risque d’être traversé par le courant du secteur, à 230 V'}.` : '<b>Sans danger</b> : les piles fournissent une tension faible, inférieure à 24 V, et il n’y a pas de court-circuit.');
        }
        return Q('pse_1v', 'Quelle est la tension du secteur, aux prises d’une maison en France ?', choice(rng, '230 V', ['4,5 V', '24 V', '2 300 V']), 'Elle est bien plus grande que celle d’une pile.', 'La tension du secteur est de <b>230 V</b>.');
      }
      if (level === 2) {
        if (rng.chance(0.5)) {
          const i = rng.int(0, ROLES.length - 1), [who, role] = ROLES[i];
          return Q(`pse_2r:${i}`, `À quoi sert ${who} ?`, choice(rng, role, ROLES.filter((x, j) => j !== i).map(x => x[1])), 'Chaque dispositif de sécurité protège contre un danger précis.', `${cap(who)} sert à : <b>${role.toLowerCase()}</b>.`);
        }
        const u = rng.pick(VOLTS), d = u > 24;
        return Q(`pse_2u:${u}`, `Une tension de ${fmt(u)} V est-elle dangereuse pour le corps humain ?`, yesNo(d), 'Compare avec la limite des très basses tensions, sans danger.', d ? `${fmt(u)} V est bien au-delà de 24 V : <b>oui</b>, danger d’électrocution.` : `${fmt(u)} V est inférieure à 24 V : <b>non</b> (mais attention aux courts-circuits).`);
      }
      const i = rng.int(0, SAFE_TRAPS.length - 1), [s, v, c] = SAFE_TRAPS[i];
      return Q(`pse_3:${i}`, `Vrai ou faux ? « ${s} »`, trueFalse(v), 'Lis chaque mot de la phrase : un seul détail peut la rendre fausse.', `<b>${v ? 'Vrai' : 'Faux'}</b>. ${c}`);
    },
  });

  // ===================== EXPLICATIONS =====================
  const E = M.explain;
  E('pc-sources-energie', [
    ['vie', '<p>Chloé et Noah regardent leur facture d’électricité. Une partie vient d’éoliennes : demain, le vent soufflera encore, la source ne s’épuise pas, elle est <b>renouvelable</b>. Le chauffage de leur immeuble, lui, brûle du gaz naturel : ce gaz s’est formé sous terre en des <b>millions d’années</b>. Chaque mètre cube brûlé est perdu pour toujours à l’échelle humaine : il est <b>non renouvelable</b>.</p>'],
    ['etapes', '<p>Pour classer une source :</p><ol><li>Je cherche d’où vient l’énergie (le vent, l’uranium, le pétrole…).</li><li>Je me demande : est-ce que cela revient tout seul en quelques années ?</li><li>Oui (Soleil, vent, pluie, marées, arbres replantés, chaleur de la Terre) → <b>renouvelable</b>.</li><li>Non (pétrole, charbon, gaz, uranium) → <b>non renouvelable</b>. Parmi elles, pétrole, charbon et gaz sont <b>fossiles</b>.</li></ol>'],
  ]);
  E('pc-conversions-energie', [
    ['dessin', `${chainFig('électrique', 'sèche-cheveux', ['thermique', 'mécanique'])}<p>On dessine le convertisseur dans un cadre, l’énergie reçue à gauche et les énergies fournies à droite. Le sèche-cheveux reçoit de l’énergie <b>électrique</b> et fournit deux formes d’énergie utiles : <b>thermique</b> (l’air chaud) et <b>mécanique</b> (l’air soufflé).</p>`],
    ['experience', '<p>On branche une petite lampe à incandescence sur une pile et on approche la main sans toucher : la lampe éclaire, mais elle <b>chauffe</b> aussi. L’énergie électrique reçue est convertie en énergie lumineuse (utile) et en énergie thermique (perdue). Avec une DEL, on sent beaucoup moins de chaleur : elle perd moins d’énergie.</p>'],
    ['vie', '<p>Inès pédale : les aliments de son petit-déjeuner (énergie <b>chimique</b>) font travailler ses muscles (énergie <b>mécanique</b>). La roue fait tourner la dynamo, qui fournit de l’énergie <b>électrique</b> à la lampe du vélo, qui fournit de l’énergie <b>lumineuse</b>. C’est une chaîne d’énergie avec trois convertisseurs !</p>'],
  ]);
  E('pc-ordres-grandeur-energie', [
    ['vie', '<p>Sur l’emballage de la barre chocolatée de Hugo, on lit « 1 000 kJ ». C’est environ un tiers d’un repas (3 000 kJ) et un dixième de ce qu’un adolescent dépense dans une journée (10 000 kJ, soit 10 MJ). Pour soulever une pomme d’un mètre, il ne faut qu’environ <b>1 J</b> : un million de fois moins que la barre !</p>'],
    ['etapes', '<p>Pour comparer 2,5 MJ et 800 kJ :</p><ol><li>Je choisis une unité commune : le kJ.</li><li>2,5 MJ = 2,5 × 1 000 = 2 500 kJ.</li><li>Je compare : 2 500 kJ &gt; 800 kJ.</li><li>Donc <b>2,5 MJ est la plus grande</b>.</li></ol>'],
  ]);
  E('pc-symboles', [
    ['dessin', `${serieFig([{ t: 'lampe' }, { t: 'int-f' }], 'Schéma : pile, lampe et interrupteur fermé en série')}<p>Voici le schéma d’une lampe de poche : la pile à gauche (le grand trait est la borne +), la lampe en haut (cercle avec une croix) et l’interrupteur fermé à droite. Les fils sont des traits droits, tracés à la règle.</p>`],
    ['lien', '<p>Comme les panneaux du code de la route, les symboles électriques sont les mêmes dans tous les pays : un électricien japonais lit un schéma français sans problème. Les appareils de mesure portent l’initiale de l’unité qu’ils mesurent : <b>A</b> pour l’ampèremètre (ampère), <b>V</b> pour le voltmètre (volt). Le moteur porte un <b>M</b>.</p>'],
  ]);
  E('pc-circuit-ferme', [
    ['experience', '<p>On réalise un circuit : pile, lampe, interrupteur. Interrupteur fermé, la lampe brille. On l’ouvre : elle s’éteint. On le referme et on débranche un fil n’importe où : elle s’éteint aussi. Enfin, on retourne une DEL placée dans la boucle : plus rien ne s’allume. Dans tous ces cas, la <b>boucle est coupée</b>.</p>'],
    ['dessin', `${serieFig([{ t: 'lampe', lab: 'L1' }, { t: 'lampe', lab: 'L2', short: true }, { t: 'int-f' }], 'Deux lampes en série, L2 court-circuitée par un fil')}<p>Le fil (en couleur) relie les deux bornes de L2. Le courant prend ce chemin sans obstacle au lieu de traverser L2 : <b>L2 s’éteint</b>, L1 continue de briller. Si ce fil reliait directement les bornes de la pile, ce serait un court-circuit dangereux.</p>`],
  ]);
  E('pc-serie-derivation', [
    ['dessin', `${deriv(2)}<p>Le courant sort de la pile et, au premier nœud (point noir), se partage : une partie traverse L1, l’autre L2. Il y a <b>deux boucles</b> passant par la pile. Dévisser L1 coupe sa boucle, mais pas celle de L2.</p>`],
    ['vie', '<p>Chez Léa, quand l’ampoule de la cuisine grille, la télévision et les autres lampes continuent de fonctionner : les appareils de la maison sont en <b>dérivation</b>. Sur la vieille guirlande de son grand-père, au contraire, une seule ampoule grillée éteint tout : les ampoules sont en <b>série</b>.</p>'],
  ]);
  E('pc-intensite', [
    ['experience', '<p>On réalise un circuit en série : pile, lampe, moteur. On place l’ampèremètre successivement avant la lampe, entre la lampe et le moteur, puis après le moteur. Il affiche à chaque fois la <b>même valeur</b>, par exemple 120 mA : le courant ne « s’use » pas en traversant les dipôles.</p>'],
    ['lien', '<p>Imagine une ronde de cyclistes sur une piste fermée : il passe autant de cyclistes par minute devant chaque spectateur, où qu’il soit placé. Dans une boucle unique, c’est pareil pour le courant : l’intensité est <b>la même partout</b>. Pour la compter, l’ampèremètre doit être <b>sur la piste</b>, en série.</p>'],
  ]);
  E('pc-tension', [
    ['experience', '<p>On branche un voltmètre aux bornes d’une pile neuve marquée 4,5 V : il affiche environ 4,5 V. On le branche ensuite aux bornes d’un interrupteur fermé : <b>0 V</b>. On ouvre l’interrupteur : le voltmètre affiche à nouveau environ 4,5 V. Si on inverse ses fils, il affiche « −4,5 » : le signe indique juste le sens du branchement.</p>'],
    ['dessin', `${serieFig([{ t: 'lampe', v: 'volt' }, { t: 'int-f' }], 'Voltmètre branché en dérivation aux bornes de la lampe')}<p>Le voltmètre est branché « en pont » au-dessus de la lampe : ses deux fils touchent les deux bornes de la lampe. On n’a pas ouvert la boucle : il est <b>en dérivation</b>.</p>`],
  ]);
  E('pc-securite-elec', [
    ['vie', '<p>Sam veut réparer la lampe de chevet qui ne s’allume plus. Il ne suffit pas de l’éteindre : il <b>débranche la prise</b> d’abord, car le câble reste sous 230 V tant que la lampe est branchée. Il le fait les mains sèches, en tenant la fiche et non le câble.</p>'],
    ['etapes', '<p>Avant une expérience d’électricité :</p><ol><li>Je vérifie que j’utilise une pile (moins de 24 V), jamais une prise.</li><li>Je vérifie qu’aucun fil ne relie directement les deux bornes de la pile.</li><li>Je garde les mains sèches et l’eau loin du montage.</li><li>Si un fil chauffe, j’ouvre le circuit tout de suite.</li></ol>'],
  ]);
})();
