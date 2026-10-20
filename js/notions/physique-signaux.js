// Physique-chimie 5e — Lumière & son: sources de lumière, propagation rectiligne et ombres,
// vitesse de la lumière, propagation du son, fréquence (Hz) et niveau sonore (dB).
(function () {
  'use strict';
  const M = globalThis.M;
  const { fmt, mul, div, sub } = M.u;
  const { Q, num, choice, fixedChoice, order, sequence } = M.kit;
  const { svg, text, line, poly, dot } = M.svg.raw;

  const yesNo = b => fixedChoice(['Oui', 'Non'], b ? 'Oui' : 'Non');
  const vf = b => fixedChoice(['Vrai', 'Faux'], b ? 'Vrai' : 'Faux');
  const cap = s => s[0].toUpperCase() + s.slice(1);
  const NAMES = ['Sam', 'Inès', 'Chloé', 'Noah', 'Léa', 'Hugo', 'Lucas', 'Jade', 'Adam', 'Lina', 'Yanis', 'Emma'];
  const r1 = x => Math.round(x * 10) / 10;

  // ===================== FIGURES =====================
  // Light ray with an arrowhead in the middle (direction of propagation).
  function ray(x1, y1, x2, y2, at = 0.55) {
    const L = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / L, uy = (y2 - y1) / L;
    const px = x1 + (x2 - x1) * at, py = y1 + (y2 - y1) * at;
    const head = [[px + ux * 7, py + uy * 7], [px - ux * 4 - uy * 5, py - uy * 4 + ux * 5], [px - ux * 4 + uy * 5, py - uy * 4 - ux * 5]].map(p => p.map(r1));
    return line(r1(x1), r1(y1), r1(x2), r1(y2), 's-accent-line') + poly(head, 's-solid');
  }

  // Point source S, opaque ball, screen. labels: { lit, dark, cast, screen } (letters or words).
  // The ball's labels sit above the rays, with a leader line to each half of the ball.
  function shadowFig(labels, ballName = 'une balle') {
    const words = Object.values(labels).some(s => s.length > 1);
    const W = words ? 500 : 400, top = 30, H = 210, Sx = 30, Y = 105 + top, xo = 150, r = 22, Xs = 350;
    const d = xo - Sx, L2 = d * d - r * r, tan = r / Math.sqrt(L2), hs = (Xs - Sx) * tan;
    const chord = xo - (r * r) / d, y0 = 12 + top, y1 = 198 + top;
    let b = '';
    // Lit part of the screen, then the cast shadow (hatched).
    b += `<rect x="${Xs}" y="${y0}" width="10" height="${r1(Y - hs - y0)}" class="s-soft"/><rect x="${Xs}" y="${r1(Y + hs)}" width="10" height="${r1(y1 - Y - hs)}" class="s-soft"/>`;
    for (let y = Y - hs + 3; y < Y + hs; y += 4) b += line(Xs, r1(y), Xs + 10, r1(y), 's-hatch');
    b += `<rect x="${Xs}" y="${y0}" width="10" height="${y1 - y0}" class="s-line s-nofill"/>`;
    // Rays: the two limit rays (tangent to the ball) and two rays reaching the lit screen.
    [-1, 1].forEach(s => {
      b += ray(Sx, Y, Xs, Y + s * hs, 0.3);
      b += ray(Sx, Y, Xs, Y + s * (hs + 55), 0.45);
    });
    // Ball: lit side light, dark side (ombre propre) hatched.
    b += `<circle cx="${xo}" cy="${Y}" r="${r}" class="s-soft"/>`;
    for (let x = chord + 2; x < xo + r; x += 3) {
      const h = Math.sqrt(r * r - (x - xo) * (x - xo));
      b += line(r1(x), r1(Y - h), r1(x), r1(Y + h), 's-hatch');
    }
    b += `<circle cx="${xo}" cy="${Y}" r="${r}" class="s-line s-nofill"/>`;
    b += dot(Sx, Y) + text(Sx, Y - 14, 'S', { cls: 's-text s-bold' });
    const sz = words ? 13 : 16, cls = 's-text s-bold';
    // Leader lines from above the rays to a point inside each half of the ball.
    [[labels.lit, -1, 'end'], [labels.dark, 1, 'start']].forEach(([lb, s, anchor]) => {
      const lx = xo + s * 10;
      b += text(lx + s * 2, 16, lb, { cls, anchor, size: sz });
      b += line(lx, 22, r1(xo + s * r * 0.45), r1(Y - r * 0.45), 's-line s-dash');
    });
    b += text(Xs + 18, Y + 5, labels.cast, { cls, anchor: 'start', size: sz });
    b += text(Xs + 18, r1(Y - hs - 25), labels.screen, { cls, anchor: 'start', size: sz });
    b += text(Xs + 5, y1 + 10, 'écran', { size: 12 });
    return svg(W, H + top + 6, b, '', `Une source ponctuelle S éclaire ${ballName} opaque placée devant un écran ; la face de l’objet tournée vers S est éclairée, la face opposée est sombre ; derrière l’objet, une zone de l’écran ne reçoit pas de lumière`);
  }

  // Sun, Earth and Moon. kind: 'soleil' (Soleil–Lune–Terre), 'lune' (Soleil–Terre–Lune), 'aucune' (Moon off the line).
  function eclipseFig(kind, sunLeft = true) {
    const W = 360, Y = 62, X = x => (sunLeft ? x : W - x);
    const mid = kind === 'soleil' ? 'Lune' : 'Terre', far = kind === 'soleil' ? 'Terre' : 'Lune';
    const body = (name, x, y) => (name === 'Terre' ? `<circle cx="${X(x)}" cy="${y}" r="14" class="s-fill"/>` : `<circle cx="${X(x)}" cy="${y}" r="7" class="s-empty"/>`);
    const moonUp = kind === 'aucune';
    let b = line(X(10), Y, X(345), Y, 's-line s-dash');
    b += `<circle cx="${X(45)}" cy="${Y}" r="32" class="s-accent"/>`;
    b += body(mid, 190, Y) + body(far, 300, moonUp ? 18 : Y);
    b += text(X(45), 122, 'Soleil', { size: 13 }) + text(X(190), 122, mid, { size: 13 });
    b += text(X(300), moonUp ? 44 : 122, far, { size: 13 });
    const desc = moonUp ? 'Soleil, Terre et Lune : la Lune n’est pas sur la droite Soleil–Terre' : `Soleil, ${mid} et ${far} alignés dans cet ordre`;
    return svg(W, 132, b, '', desc);
  }

  // Sound signal: n vibrations drawn over the width w.
  const wavePath = (x0, y0, w, n, amp) => {
    const pts = [];
    for (let i = 0; i <= 240; i++) pts.push(`${r1(x0 + (w * i) / 240)},${r1(y0 - amp * Math.sin((2 * Math.PI * n * i) / 240))}`);
    return `<polyline points="${pts.join(' ')}" class="s-accent-line"/>`;
  };
  function waveFig(n, dur) {
    let b = line(20, 55, 322, 55) + poly([[322, 50], [330, 55], [322, 60]], 's-solid') + text(330, 75, 't', { size: 13 });
    b += wavePath(20, 55, 280, n, 32);
    b += line(20, 108, 300, 108) + line(20, 102, 20, 114) + line(300, 102, 300, 114) + text(160, 128, dur, { size: 13 });
    return svg(340, 134, b, '', `Signal sonore : ${n} vibrations pendant ${dur}`);
  }
  function twoWaves(nA, nB) {
    let b = '';
    [[nA, 'A', 40], [nB, 'B', 120]].forEach(([n, l, y]) => {
      b += line(30, y, 320, y, 's-grid') + text(14, y + 5, l, { cls: 's-text s-bold' }) + wavePath(30, y, 280, n, 26);
    });
    return svg(330, 160, b, '', `Deux sons pendant la même durée : A fait ${nA} vibrations, B en fait ${nB}`);
  }

  // Sound level scale 0–130 dB.
  function dbScale() {
    const X = v => r1(20 + (v * 320) / 130);
    let b = `<rect x="${X(0)}" y="60" width="${X(85) - X(0)}" height="16" class="s-soft"/><rect x="${X(85)}" y="60" width="${X(120) - X(85)}" height="16" class="s-soft2"/><rect x="${X(120)}" y="60" width="${X(130) - X(120)}" height="16" class="s-fill"/>`;
    b += `<rect x="${X(0)}" y="60" width="${X(130) - X(0)}" height="16" class="s-line s-nofill"/>`;
    for (let v = 0; v <= 120; v += 20) b += line(X(v), 76, X(v), 82) + text(X(v), 96, fmt(v), { size: 12 });
    b += text(X(130), 96, 'dB', { size: 12 });
    [[30, 'chuchotement', 22], [60, 'conversation', 42], [85, 'danger', 22], [120, 'douleur', 42]].forEach(([v, s, y]) => {
      b += line(X(v), y + 4, X(v), 60) + text(X(v), y, s, { size: 12 });
    });
    return svg(360, 104, b, '', 'Échelle des niveaux sonores : chuchotement 30 dB, conversation 60 dB, danger à partir d’environ 85 dB, douleur à 120 dB');
  }

  // Lamp → book → eye.
  function visionFig() {
    let b = `<circle cx="40" cy="40" r="12" class="s-accent"/>` + text(40, 70, 'lampe', { size: 12 });
    b += `<rect x="150" y="108" width="60" height="14" class="s-fill"/>` + text(180, 140, 'livre', { size: 12 });
    b += `<ellipse cx="330" cy="42" rx="16" ry="9" class="s-empty"/>` + dot(324, 42) + text(330, 70, 'œil', { size: 12 });
    b += ray(50, 48, 165, 108) + ray(195, 108, 314, 46) + ray(180, 108, 160, 60, 0.6) + ray(185, 108, 245, 70, 0.6);
    return svg(360, 148, b, '', 'La lumière va de la lampe au livre, qui la diffuse dans toutes les directions ; une partie entre dans l’œil');
  }

  // ===================== SOURCES DE LUMIÈRE =====================
  const PRIMARY = ['le Soleil', 'une lampe allumée', 'la flamme d’une bougie', 'un écran de télévision allumé', 'une étoile', 'un ver luisant', 'un feu de camp', 'un éclair d’orage', 'une lampe torche allumée', 'un écran de téléphone allumé'];
  const DIFFUS = ['la Lune', 'un mur blanc', 'un livre', 'la planète Vénus', 'une lampe éteinte', 'un nuage', 'une feuille de papier', 'un vélo', 'la planète Mars', 'un écran éteint', 'une pomme', 'un tee-shirt rouge'];
  const SKY = ['la Lune', 'la planète Vénus', 'la planète Mars', 'un nuage'];
  const SRC_HINT = 'Une source primaire produit elle-même sa lumière ; un objet diffusant ne fait que renvoyer la lumière qu’il reçoit.';

  M.notion('pc-sources-lumiere', {
    lesson: {
      retenir: `Une <b>source primaire</b> de lumière produit elle-même la lumière qu’elle émet : le Soleil, les étoiles, une flamme, une lampe allumée, un écran allumé, un ver luisant. Un <b>objet diffusant</b> ne produit pas de lumière : il <b>renvoie dans toutes les directions</b> une partie de la lumière qu’il reçoit (la Lune, les planètes, un mur, un livre, une lampe éteinte). On voit un objet seulement si de la lumière venant de cet objet <b>entre dans l’œil</b>. L’œil reçoit la lumière, il n’en envoie pas.`,
      methode: [
        'Demande-toi : cet objet <b>produit</b>-il de la lumière, même dans le noir complet ? Si oui, c’est une source primaire.',
        'S’il brille seulement quand il est éclairé, c’est un objet diffusant : cherche quelle source l’éclaire.',
        'Pour expliquer comment on voit, trace le trajet de la lumière : source → objet diffusant → œil.',
      ],
      exemples: [
        { q: 'La Lune brille la nuit. Est-ce une source primaire ?', r: 'Non : elle renvoie la lumière du Soleil, c’est un <b>objet diffusant</b>.' },
        { q: 'Comment Léa voit-elle son livre sous la lampe ?', r: 'La lumière va <b>de la lampe au livre</b>, qui la diffuse, puis <b>du livre à l’œil</b> de Léa.' },
        { q: 'Un écran de téléphone allumé ?', r: 'Il produit sa lumière : c’est une <b>source primaire</b>. Éteint, il devient un simple objet diffusant.' },
      ],
      astuces: ['Le test du noir complet : dans une pièce sans aucune lumière, seules les sources primaires restent visibles.', 'Vénus, « l’étoile du berger », n’est pas une étoile : c’est une planète qui diffuse la lumière du Soleil.'],
      erreurs: [
        'Croire que la Lune produit sa propre lumière : elle est éclairée par le Soleil.',
        'Croire que l’œil envoie de la lumière (ou un « regard ») vers les objets : c’est la lumière qui <b>entre</b> dans l’œil.',
        'Confondre « qui brille » et « qui produit de la lumière » : un gilet jaune brille dans les phares, mais il ne fait que renvoyer leur lumière.',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        const r = rng.next();
        if (r < 0.5) {
          const prim = rng.chance(0.45), item = rng.pick(prim ? PRIMARY : DIFFUS);
          const from = SKY.includes(item) ? ' du Soleil' : '';
          return Q(`pcs1:${item}`, `${cap(item)} : source primaire de lumière ou objet diffusant ?`, fixedChoice(['Source primaire', 'Objet diffusant'], prim ? 'Source primaire' : 'Objet diffusant'), SRC_HINT,
            prim ? `${cap(item)} produit sa propre lumière : c’est une <b>source primaire</b>.` : `${cap(item)} : cet objet ne produit pas de lumière, il renvoie seulement la lumière qu’il reçoit${from}. C’est un <b>objet diffusant</b>.`);
        }
        if (r < 0.75) {
          const good = rng.pick(PRIMARY), bads = rng.sample(DIFFUS, 3);
          return Q(`pcs1p:${good}:${bads}`, 'Lequel de ces objets est une source primaire de lumière ?', choice(rng, cap(good), bads.map(cap)), SRC_HINT, `<b>${cap(good)}</b> produit sa propre lumière. Les autres renvoient seulement la lumière qu’ils reçoivent.`);
        }
        const odd = rng.pick(DIFFUS), goods = rng.sample(PRIMARY, 3);
        return Q(`pcs1d:${odd}:${goods}`, 'Lequel de ces objets n’est <b>pas</b> une source primaire de lumière ?', choice(rng, cap(odd), goods.map(cap)), SRC_HINT, `<b>${cap(odd)}</b> ne produit pas de lumière : c’est un objet diffusant. Les trois autres produisent leur lumière.`);
      }
      if (level === 2) {
        const r = rng.next(), nm = rng.pick(NAMES);
        if (r < 0.35) {
          const [src, obj, e] = rng.pick([['la lampe', 'le livre', ''], ['le Soleil', 'l’arbre', ''], ['la lampe du bureau', 'le cahier', ''], ['le Soleil', 'la Lune', 'e'], ['le lampadaire', 'le vélo', ''], ['la lampe torche', 'le chat', ''], ['le plafonnier', 'le tableau', ''], ['le Soleil', 'la planète Vénus', 'e']]);
          return Q(`pcs2t:${src}:${obj}:${nm}`, `${nm} voit ${obj}, éclairé${e} par ${src}. Range dans l’ordre le trajet suivi par la lumière.`, sequence(rng, [cap(src), obj, `l’œil de ${nm}`], { label: 'les étapes du trajet', sep: '→', how: 'dans l’ordre du trajet de la lumière' }),
            'Qui produit la lumière ? Où doit-elle arriver pour que l’on voie quelque chose ?', `La lumière part de la source, est diffusée par ${obj} puis entre dans l’œil : <b>${src} → ${obj} → œil de ${nm}</b>. L’œil reçoit la lumière, il n’en envoie pas.`);
        }
        if (r < 0.7) {
          const prim = rng.chance(0.5);
          const item = rng.pick(prim ? ['une lampe allumée', 'la flamme d’une bougie', 'un écran de télévision allumé', 'un ver luisant', 'une lampe torche allumée', 'un écran de téléphone allumé'] : ['un livre', 'un mur blanc', 'une pomme', 'un tee-shirt rouge', 'une feuille de papier', 'un vélo', 'une lampe éteinte', 'un écran éteint']);
          return Q(`pcs2n:${item}`, `Dans une pièce plongée dans le noir total, sans aucune lumière, peut-on voir ${item} ?`, yesNo(prim), 'Pour voir un objet, de la lumière venant de cet objet doit entrer dans l’œil. D’où viendrait-elle ici ?',
            prim ? `${cap(item)} produit sa propre lumière, qui peut entrer dans l’œil : <b>oui</b>.` : `${cap(item)} ne produit pas de lumière ; sans rien à diffuser, aucune lumière ne part de cet objet vers l’œil : <b>non</b>.`);
        }
        const [item, src, pr] = rng.pick([['la Lune', 'du Soleil', 'elle'], ['la planète Vénus', 'du Soleil', 'elle'], ['la planète Mars', 'du Soleil', 'elle'], ['un nuage', 'du Soleil', 'il'], ['le tableau de la classe', 'des lampes de la classe', 'il'], ['un livre', 'de la lampe', 'il'], ['un mur blanc', 'du Soleil', 'il'], ['une affiche dans la rue', 'des lampadaires', 'elle']]);
        const qu = `qu’${pr}`;
        return Q(`pcs2w:${item}`, `Pourquoi voit-on ${item} ?`, choice(rng, `Parce ${qu} diffuse la lumière ${src}`, [`Parce ${qu} produit sa propre lumière`, `Parce que nos yeux envoient de la lumière sur ${pr === 'il' ? 'lui' : 'elle'}`, `Parce ${qu} brille même dans le noir complet`]),
          'Cet objet produit-il de la lumière ? Sinon, d’où vient celle qui arrive dans l’œil ?', `${cap(item)} est un objet diffusant : <b>${pr} renvoie une partie de la lumière ${src}</b>, et cette lumière entre dans notre œil.`);
      }
      // Level 3: traps.
      const r = rng.next();
      if (r < 0.4) {
        const S = [
          ['La Lune produit sa propre lumière.', false, 'La Lune est un objet diffusant : elle renvoie la lumière du Soleil.'],
          ['Un objet diffusant renvoie dans toutes les directions une partie de la lumière qu’il reçoit.', true, 'C’est ce qui permet de le voir de partout.'],
          ['Nos yeux envoient de la lumière vers les objets que nous regardons.', false, 'L’œil est un récepteur : il reçoit la lumière, il n’en émet pas.'],
          ['Pour voir un objet, il faut que de la lumière venant de cet objet entre dans l’œil.', true, 'Sans lumière qui entre dans l’œil, on ne voit rien.'],
          ['Un écran de téléphone éteint est une source primaire de lumière.', false, 'Éteint, il ne produit pas de lumière : c’est un objet diffusant.'],
          ['Une étoile est une source primaire de lumière.', true, 'Une étoile produit sa lumière, comme le Soleil, qui est lui-même une étoile.'],
          ['Dans le noir total, un chat voit une souris immobile.', false, 'Même un chat a besoin d’un peu de lumière : sans lumière diffusée par la souris, rien n’entre dans son œil.'],
          ['Vénus, très brillante le soir, est une étoile qui produit sa lumière.', false, 'Vénus est une planète : elle diffuse la lumière du Soleil.'],
          ['Le Soleil est une étoile.', true, 'C’est l’étoile la plus proche de la Terre.'],
          ['Un gilet jaune qui brille dans les phares d’une voiture est une source primaire.', false, 'Il renvoie la lumière des phares : c’est un objet diffusant.'],
        ];
        const i = rng.int(0, S.length - 1), [s, t, why] = S[i];
        return Q(`pcs3v:${i}`, `Vrai ou faux ? « ${s} »`, vf(t), 'Distingue bien ce qui produit la lumière et ce qui la reçoit.', `<b>${t ? 'Vrai' : 'Faux'}</b>. ${why}`);
      }
      if (r < 0.7) {
        const n = rng.int(1, 4), list = rng.shuffle([...rng.sample(PRIMARY, n), ...rng.sample(DIFFUS, 5 - n)]);
        const prims = list.filter(x => PRIMARY.includes(x));
        return Q(`pcs3c:${list}`, `Combien y a-t-il de sources primaires de lumière dans cette liste : ${list.join(' ; ')} ?`, num(n), 'Pour chaque objet, demande-toi s’il resterait visible dans le noir complet.', `Sources primaires : ${prims.join(', ')}. Les autres sont des objets diffusants. Il y en a <b>${fmt(n)}</b>.`);
      }
      const trap = rng.pick(['les yeux d’un chat qui brillent dans les phares', 'la Lune qui brille la nuit', 'la planète Vénus, très brillante le soir', 'un gilet jaune qui brille dans les phares', 'un panneau routier éclairé par les phares']);
      const goods = rng.sample(['une étoile', 'un ver luisant', 'la flamme d’une bougie', 'un écran de téléphone allumé', 'un feu de camp', 'le Soleil'], 3);
      return Q(`pcs3i:${trap}:${goods}`, 'Lequel de ces objets n’est <b>pas</b> une source primaire de lumière, même s’il paraît briller ?', choice(rng, cap(trap), goods.map(cap)), 'Briller ne suffit pas : produit-il lui-même sa lumière ?', `<b>${cap(trap)}</b> : cet objet ne fait que renvoyer la lumière d’une autre source. C’est un objet diffusant.`);
    },
  });

  // ===================== PROPAGATION RECTILIGNE, OMBRES =====================
  const BALLS = [['une balle', 'e'], ['un globe', ''], ['une pomme', 'e'], ['une boule de pétanque', 'e'], ['une orange', 'e'], ['un ballon', '']];
  const FIGS = [['une figurine', 'e'], ['un personnage en carton', ''], ['un crayon posé debout', ''], ['une petite bouteille', 'e'], ['un pion de jeu', ''], ['une tasse', 'e']];

  M.notion('pc-propagation-lumiere', {
    lesson: {
      retenir: `Dans un milieu <b>transparent et homogène</b> (air, eau, verre, vide), la lumière se propage <b>en ligne droite</b> : c’est la propagation rectiligne. On représente son trajet par un <b>rayon lumineux</b> : un segment de droite muni d’une <b>flèche</b> dans le sens de propagation. Un objet <b>opaque</b> éclairé a une partie éclairée et une partie sombre, son <b>ombre propre</b> ; derrière lui, la zone que la lumière n’atteint pas forme sur un écran son <b>ombre portée</b>. Une <b>éclipse</b> est une histoire d’ombre : éclipse de Soleil quand la Lune passe entre le Soleil et la Terre, éclipse de Lune quand la Lune passe dans l’ombre de la Terre.`,
      explication: `<p>Avec une petite lampe S, on trace les deux rayons qui frôlent la balle : la lumière allant en ligne droite, tout ce qui est entre ces deux rayons, derrière la balle, reste dans le noir.</p>${shadowFig({ lit: 'partie éclairée', dark: 'ombre propre', cast: 'ombre portée', screen: 'zone éclairée' })}<p>L’ombre propre est <b>sur l’objet</b> ; l’ombre portée est <b>sur l’écran</b>. Comme les rayons s’écartent en partant de la lampe, l’ombre portée est plus grande que l’objet.</p>`,
      methode: [
        'Repère la source, l’objet opaque et l’écran.',
        'Trace à la règle les deux rayons qui partent de la source et frôlent les bords de l’objet, jusqu’à l’écran.',
        'Hachure la face de l’objet non éclairée (ombre propre) et la zone de l’écran entre les deux rayons (ombre portée).',
        'Pour la taille de l’ombre : regarde combien de fois l’écran est plus loin de la source que l’objet ; l’ombre est ce nombre de fois plus grande.',
      ],
      exemples: [
        { q: 'Une figurine de 5 cm est à 20 cm d’une lampe ; l’écran est à 60 cm de la lampe. Hauteur de l’ombre ?', r: 'L’écran est 3 fois plus loin, donc l’ombre est 3 fois plus grande : <b>15 cm</b>.' },
        { q: 'On rapproche l’objet de la lampe. Que devient l’ombre portée ?', r: 'Elle devient <b>plus grande</b>.' },
        { q: 'Soleil – Terre – Lune alignés dans cet ordre ?', r: 'La Lune est dans l’ombre de la Terre : <b>éclipse de Lune</b>.' },
      ],
      astuces: ['L’ombre portée a la forme du contour de l’objet, vu depuis la source.', 'Éclipse de « ce qu’on ne voit plus » : de Soleil quand le Soleil est caché par la Lune, de Lune quand la Lune est dans l’ombre de la Terre.', 'La nuit, c’est l’ombre propre de la Terre : la moitié de la Terre non éclairée par le Soleil.'],
      erreurs: [
        'Confondre ombre propre (sur l’objet) et ombre portée (sur l’écran ou le sol).',
        'Croire que l’ombre portée a toujours la taille de l’objet : avec une petite lampe proche, elle est plus grande.',
        'Inverser les éclipses : lors d’une éclipse de Lune, c’est la <b>Terre</b> qui est au milieu.',
        'Dessiner un rayon lumineux sans flèche, ou avec une flèche qui part de l’œil.',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        const r = rng.next();
        if (r < 0.45) {
          const [obj, e] = rng.pick(BALLS), L = rng.shuffle(['A', 'B', 'C', 'D']);
          const target = rng.pick(['propre', 'portée']), ans = target === 'propre' ? L[1] : L[2];
          const fig = shadowFig({ lit: L[0], dark: L[1], cast: L[2], screen: L[3] }, obj);
          return Q(`pcp1z:${obj}:${L.join('')}:${target}`, `Une petite lampe S éclaire ${obj} opaque placé${e} devant un écran.${fig}${L[0]} est sur la face de l’objet tournée vers la lampe, ${L[1]} sur la face opposée, ${L[2]} sur l’écran derrière l’objet, là où la lumière n’arrive pas, et ${L[3]} sur l’écran, là où la lumière arrive. Quelle lettre désigne l’<b>ombre ${target}</b> ?`,
            fixedChoice(['A', 'B', 'C', 'D'], ans), 'L’une des ombres est sur l’objet lui-même, l’autre sur l’écran.', `L’ombre propre est la partie non éclairée de l’objet (${L[1]}) ; l’ombre portée est la zone sombre sur l’écran (${L[2]}). Réponse : <b>${ans}</b>.`);
        }
        if (r < 0.7) {
          const V = [
            ['la partie d’un objet opaque qui n’est pas éclairée', 'l’ombre propre'],
            ['la zone sombre, sur un écran, derrière un objet opaque éclairé', 'l’ombre portée'],
            ['le segment fléché qui représente le trajet de la lumière', 'un rayon lumineux'],
            ['un objet qui ne laisse pas passer la lumière', 'un objet opaque'],
            ['un objet qui laisse passer la lumière, comme une vitre', 'un objet transparent'],
            ['l’ensemble des rayons qui sortent d’une lampe torche', 'un faisceau lumineux'],
          ];
          const i = rng.int(0, V.length - 1), others = V.filter((_, j) => j !== i).map(v => v[1]);
          return Q(`pcp1v:${i}`, `Comment appelle-t-on ${V[i][0]} ?`, choice(rng, cap(V[i][1]), rng.sample(others, 3).map(cap)), 'Relis le vocabulaire de la leçon : où se trouve chaque ombre ? que représente une flèche ?', `On l’appelle <b>${V[i][1]}</b>.`);
        }
        const m = rng.pick(['l’air', 'l’eau', 'le verre', 'le vide de l’espace', 'l’huile']);
        return Q(`pcp1m:${m}`, `Dans ${m} (un milieu transparent et homogène), comment la lumière se propage-t-elle ?`, choice(rng, 'En ligne droite', ['En zigzag', 'En faisant des vagues', 'En contournant les obstacles']), 'Pense au faisceau d’un laser ou aux rayons du Soleil dans la brume.', `Dans un milieu transparent et homogène, la lumière se propage <b>en ligne droite</b>.`);
      }
      if (level === 2) {
        const r = rng.next();
        if (r < 0.45) {
          const [obj, e] = rng.pick(FIGS), k = rng.pick([2, 3, 4, 5, 1.5, 2.5]), d1 = rng.pick([20, 30, 40, 50, 60]);
          const h = k % 1 ? rng.pick([2, 4, 6, 8, 10]) : rng.pick([2, 3, 4, 5, 6, 8, 10]), d2 = mul(d1, k), H = mul(h, k);
          return Q(`pcp2s:${obj}:${h}:${d1}:${k}`, `Une petite lampe éclaire ${obj} de ${fmt(h)} cm de haut, placé${e} à ${fmt(d1)} cm de la lampe. L’écran est à ${fmt(d2)} cm de la lampe. La taille de l’ombre est proportionnelle à la distance depuis la lampe. Quelle est la hauteur de l’ombre portée sur l’écran ?`, num(H, 'cm'),
            'Combien de fois l’écran est-il plus loin de la lampe que l’objet ?', `L’écran est ${fmt(d2)} ÷ ${fmt(d1)} = ${fmt(k)} fois plus loin de la lampe que l’objet, donc l’ombre est ${fmt(k)} fois plus grande que l’objet : ${fmt(h)} × ${fmt(k)} = <b>${fmt(H)}</b> cm.`);
        }
        if (r < 0.75) {
          const [obj] = rng.pick(FIGS);
          const A = [
            [`On rapproche ${obj} de la lampe.`, 'plus grande', 'Plus l’objet est près de la lampe, plus les rayons qui le frôlent s’écartent avant d’atteindre l’écran.'],
            [`On éloigne ${obj} de la lampe, en l’approchant de l’écran.`, 'plus petite', 'Collé à l’écran, l’objet aurait une ombre presque de sa taille.'],
            ['On recule l’écran, plus loin de l’objet.', 'plus grande', 'Les rayons qui frôlent l’objet continuent de s’écarter jusqu’à l’écran.'],
            ['On rapproche l’écran de l’objet.', 'plus petite', 'Les rayons qui frôlent l’objet ont moins de distance pour s’écarter.'],
          ];
          const i = rng.int(0, 3);
          return Q(`pcp2e:${i}:${obj}`, `Une petite lampe éclaire ${obj} ; son ombre portée se forme sur un écran. ${A[i][0]} Que devient l’ombre portée ?`, fixedChoice(['Elle devient plus grande', 'Elle devient plus petite', 'Elle ne change pas', 'Elle disparaît'], `Elle devient ${A[i][1]}`),
            'Dessine la lampe, l’objet, l’écran et les deux rayons qui frôlent l’objet : ils s’écartent en partant de la lampe.', `${A[i][2]} L’ombre devient <b>${A[i][1]}</b>.`);
        }
        const nm = rng.pick(NAMES);
        const C = [
          `${nm} voit la flamme d’une bougie à travers trois cartons percés d’un trou, seulement quand les trois trous sont alignés.`,
          `${nm} voit une lampe à travers un tuyau droit, mais pas à travers un tuyau coudé.`,
          `Dans un aquarium à l’eau légèrement troublée, le faisceau du laser de ${nm} forme un trait bien droit.`,
          `Dans une forêt brumeuse, ${nm} voit les rayons du Soleil passer entre les feuilles en traits droits.`,
          `Pour viser une cible, ${nm} aligne son œil, le guidon et la cible.`,
          `Dans une salle de cinéma un peu poussiéreuse, ${nm} voit le faisceau du projecteur en ligne droite.`,
        ];
        const i = rng.int(0, C.length - 1);
        return Q(`pcp2a:${i}:${nm}`, `${C[i]} Quelle propriété de la lumière cette observation montre-t-elle ?`, choice(rng, 'La lumière se propage en ligne droite', ['La lumière contourne les obstacles', 'La lumière part de l’œil', 'La lumière ne se propage que dans l’air']), 'Quelle forme a le trajet de la lumière dans cette observation ?', 'Le trajet observé est un trait droit : dans un milieu transparent et homogène, <b>la lumière se propage en ligne droite</b>.');
      }
      // Level 3: eclipses, two-step shadow sizes, true/false.
      const r = rng.next();
      if (r < 0.4) {
        const t = rng.next();
        if (t < 0.6) {
          const kind = rng.pick(['soleil', 'lune', 'aucune']), left = rng.chance(0.5);
          const words = { soleil: 'Les trois astres sont alignés dans l’ordre Soleil – Lune – Terre.', lune: 'Les trois astres sont alignés dans l’ordre Soleil – Terre – Lune.', aucune: 'La Terre est sur la droite qui part du Soleil, mais la Lune est au-dessus de cette droite.' }[kind];
          const ans = { soleil: 'Une éclipse de Soleil', lune: 'Une éclipse de Lune', aucune: 'Aucune éclipse' }[kind];
          const why = { soleil: 'La Lune, au milieu, cache le Soleil et son ombre tombe sur la Terre', lune: 'La Terre, au milieu, projette son ombre sur la Lune', aucune: 'Les astres ne sont pas alignés : aucun ne passe dans l’ombre d’un autre' }[kind];
          return Q(`pcp3e:${kind}:${left}`, `${eclipseFig(kind, left)}${words} Que peut-on observer depuis la Terre ?`, fixedChoice(['Une éclipse de Soleil', 'Une éclipse de Lune', 'Aucune éclipse'], ans), 'Quel astre est au milieu ? Dans l’ombre de qui se trouve le troisième ?', `${why} : <b>${ans[0].toLowerCase() + ans.slice(1)}</b>.`);
        }
        if (t < 0.8) {
          const kind = rng.pick(['Soleil', 'Lune']);
          const items = kind === 'Lune' ? ['le Soleil', 'la Terre', 'la Lune'] : ['le Soleil', 'la Lune', 'la Terre'];
          return Q(`pcp3o:${kind}`, `Lors d’une éclipse de ${kind}, range les trois astres dans l’ordre de leur alignement, en partant du Soleil.`, sequence(rng, items.map(cap), { label: 'les astres', sep: '–', how: 'en partant du Soleil' }), 'Quel astre est caché, ou plongé dans l’ombre de quel autre ?', `Éclipse de ${kind} : <b>${items.join(' – ')}</b>. ${kind === 'Lune' ? 'La Lune entre dans l’ombre de la Terre.' : 'La Lune cache le Soleil et son ombre tombe sur la Terre.'}`);
        }
        const kind = rng.pick(['Soleil', 'Lune']);
        const ans = kind === 'Soleil' ? 'L’ombre de la Lune tombe sur la Terre' : 'L’ombre de la Terre tombe sur la Lune';
        return Q(`pcp3w:${kind}`, `Que se passe-t-il lors d’une éclipse de ${kind} ?`, choice(rng, ans, [kind === 'Soleil' ? 'L’ombre de la Terre tombe sur la Lune' : 'L’ombre de la Lune tombe sur la Terre', 'Le Soleil s’éteint quelques minutes', 'Des nuages épais cachent le ciel']), 'Une éclipse est une histoire d’ombre et d’alignement : quel astre est au milieu ?', `<b>${ans}</b>.`);
      }
      if (r < 0.75) {
        const [obj, e] = rng.pick(FIGS), k = rng.pick([2, 3, 4, 5, 1.5, 2.5]), d1 = rng.pick([20, 30, 40, 60]);
        const h = k % 1 ? rng.pick([2, 4, 6, 8, 10, 12]) : rng.pick([2, 3, 4, 5, 6, 8, 10, 12]), d2 = mul(d1, k), H = mul(h, k);
        if (rng.chance(0.5)) {
          return Q(`pcp3h:${obj}:${h}:${d1}:${k}`, `${cap(obj)}, placé${e} à ${fmt(d1)} cm d’une petite lampe, donne sur un écran situé à ${fmt(d2)} cm de la lampe une ombre portée de ${fmt(H)} cm de haut. La taille de l’ombre est proportionnelle à la distance depuis la lampe. Quelle est la hauteur de l’objet ?`, num(h, 'cm'),
            'L’ombre est-elle plus grande ou plus petite que l’objet ? Combien de fois ?', `L’écran est ${fmt(d2)} ÷ ${fmt(d1)} = ${fmt(k)} fois plus loin que l’objet : l’ombre est ${fmt(k)} fois plus grande que l’objet. L’objet mesure donc ${fmt(H)} ÷ ${fmt(k)} = <b>${fmt(h)}</b> cm.`);
        }
        return Q(`pcp3d:${obj}:${h}:${d1}:${k}`, `${cap(obj)} de ${fmt(h)} cm est placé${e} à ${fmt(d1)} cm d’une petite lampe. On veut obtenir une ombre portée de ${fmt(H)} cm de haut. La taille de l’ombre est proportionnelle à la distance depuis la lampe. À quelle distance de la lampe faut-il placer l’écran ?`, num(d2, 'cm'),
          'Combien de fois l’ombre doit-elle être plus grande que l’objet ? L’écran doit être autant de fois plus loin.', `L’ombre doit être ${fmt(H)} ÷ ${fmt(h)} = ${fmt(k)} fois plus grande que l’objet, donc l’écran doit être ${fmt(k)} fois plus loin de la lampe : ${fmt(d1)} × ${fmt(k)} = <b>${fmt(d2)}</b> cm.`);
      }
      if (rng.chance(0.3)) {
        const n = rng.int(2, 4);
        return Q(`pcp3n:${n}`, `Un objet opaque est éclairé par ${fmt(n)} petites lampes placées à des endroits différents. Combien d’ombres portées voit-on sur l’écran ?`, num(n), 'Chaque source envoie ses propres rayons en ligne droite : trace les rayons d’une lampe à la fois.', `Chaque lampe crée sa propre ombre portée, dans une direction différente : <b>${fmt(n)}</b> ombres (souvent plus ou moins sombres là où elles se chevauchent).`);
      }
      const S = [
        ['L’ombre portée d’un objet a toujours la même taille que l’objet.', false, 'Avec une petite lampe, elle est d’autant plus grande que l’écran est loin.'],
        ['La lumière contourne les objets opaques.', false, 'Elle va en ligne droite : derrière un objet opaque, elle ne passe pas.'],
        ['Un rayon lumineux se dessine avec une flèche dans le sens de propagation de la lumière.', true, 'La flèche part de la source.'],
        ['L’ombre propre se trouve sur l’écran.', false, 'L’ombre propre est sur l’objet ; sur l’écran, c’est l’ombre portée.'],
        ['L’ombre portée a la forme du contour de l’objet.', true, 'Les rayons qui frôlent le contour délimitent l’ombre.'],
        ['Lors d’une éclipse de Lune, la Lune se trouve entre le Soleil et la Terre.', false, 'C’est la Terre qui est au milieu : la Lune passe dans son ombre.'],
        ['Une éclipse de Soleil se produit quand la Lune cache le Soleil, vu depuis la Terre.', true, 'L’ombre de la Lune balaie alors une partie de la Terre.'],
        ['La nuit, c’est l’ombre propre de la Terre.', true, 'La moitié de la Terre non éclairée par le Soleil est dans la nuit.'],
        ['Une vitre bien propre donne une ombre aussi sombre qu’un carton.', false, 'Une vitre est transparente : elle laisse passer la lumière.'],
      ];
      const i = rng.int(0, S.length - 1), [s, t, why] = S[i];
      return Q(`pcp3v:${i}`, `Vrai ou faux ? « ${s} »`, vf(t), 'Imagine les rayons tracés en ligne droite depuis la source.', `<b>${t ? 'Vrai' : 'Faux'}</b>. ${why}`);
    },
  });

  // ===================== VITESSE DE LA LUMIÈRE =====================
  const C = 300000;
  const ms = s => `${Math.floor(s / 60)} min${s % 60 ? ` ${s % 60} s` : ''}`;
  const PLANETS = [['Mercure', 57600000], ['Vénus', 108000000], ['la Terre', 150000000], ['Mars', 228000000], ['Jupiter', 780000000]];

  M.notion('pc-vitesse-lumiere', {
    lesson: {
      retenir: `Dans le vide (et presque autant dans l’air), la lumière se propage à environ <b>300 000 km/s</b> : en une seconde, elle parcourt 300 000 km, plus de sept fois le tour de la Terre. C’est beaucoup plus rapide que le son (environ 340 m/s dans l’air). Comme pour tout mouvement à vitesse constante, on calcule la <b>distance d = v × t</b> et la <b>durée t = d ÷ v</b>. La lumière du Soleil, à 150 000 000 km, met <b>500 s</b>, soit 8 min 20 s, pour nous parvenir ; celle de la Lune, à 384 000 km, environ 1,28 s.`,
      methode: [
        'Vérifie les unités : avec une vitesse en km/s, la distance doit être en km et la durée en s.',
        'Pour une distance, multiplie : d = 300 000 × t.',
        'Pour une durée, divise : t = d ÷ 300 000 (supprime d’abord les zéros communs).',
        'Pour convertir des secondes en min et s : cherche combien de fois 60 s, puis ce qui reste.',
      ],
      exemples: [
        { q: 'Durée du trajet Soleil → Terre (150 000 000 km) ?', r: '150 000 000 ÷ 300 000 = 1 500 ÷ 3 = <b>500 s</b>, soit <b>8 min 20 s</b>.' },
        { q: 'Distance parcourue par la lumière en 2 s ?', r: '300 000 × 2 = <b>600 000 km</b>.' },
        { q: 'Un laser fait l’aller-retour Terre–Lune en 2,56 s. Distance Terre–Lune ?', r: 'Aller simple : 1,28 s, donc 300 000 × 1,28 = <b>384 000 km</b>.' },
      ],
      astuces: ['Pour diviser par 300 000, divise par 100 000 (supprime 5 zéros), puis par 3.', 'Sur Terre, à notre échelle, la lumière arrive quasi instantanément : on peut négliger sa durée de trajet devant celle du son.'],
      erreurs: [
        'Confondre 300 000 km/s (lumière) avec 340 m/s (son dans l’air).',
        'Écrire 300 000 km/h : c’est bien par <b>seconde</b>.',
        'Croire qu’on voit les étoiles « en direct » : leur lumière est partie il y a longtemps.',
        'Oublier de diviser par 2 dans un aller-retour.',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        const r = rng.next();
        if (r < 0.3) {
          const m = rng.pick(['le vide', 'l’air', 'l’espace']);
          return Q(`pcl1v:${m}`, `Quelle est, environ, la vitesse de la lumière dans ${m} ?`, choice(rng, '300 000 km/s', ['340 m/s', '300 000 km/h', '1 500 m/s']), 'C’est la vitesse la plus grande que l’on connaisse : attention à l’unité de temps.', `La lumière se propage à environ <b>300 000 km/s</b> (340 m/s est la vitesse du son dans l’air).`);
        }
        if (r < 0.6) {
          const nm = rng.pick(NAMES);
          const X = [['un orage au loin', 'l’éclair', 'le tonnerre'], ['un feu d’artifice', 'l’éclat lumineux de la fusée', 'le bruit de l’explosion'], ['une course : le starter tire au pistolet', 'l’éclair du coup de pistolet', 'la détonation'], ['un bûcheron qui fend du bois au loin', 'la hache qui frappe le bois', 'le bruit du choc'], ['un match dans un grand stade', 'le joueur qui frappe le ballon', 'le bruit de la frappe']];
          const i = rng.int(0, X.length - 1), [ctx, seen, heard] = X[i];
          return Q(`pcl1f:${i}:${nm}`, `${nm} observe de loin ${ctx}. Que perçoit-${['Inès', 'Chloé', 'Léa', 'Jade', 'Lina', 'Emma'].includes(nm) ? 'elle' : 'il'} en premier ?`, choice(rng, `On voit d’abord ${seen}`, [`On entend d’abord ${heard}`, 'Les deux arrivent en même temps']), 'Compare la vitesse de la lumière et celle du son.', `La lumière (300 000 km/s) va bien plus vite que le son (340 m/s) : <b>on voit d’abord ${seen}</b>, puis on entend ${heard}.`);
        }
        const t = rng.pick([1, 2, 3, 4, 5, 0.5, 0.1, 10]), d = mul(C, t);
        return Q(`pcl1d:${t}`, `La lumière se propage à environ 300 000 km/s. Quelle distance parcourt-elle en ${fmt(t)} s ?`, num(d, 'km'), 'La vitesse en km/s indique la distance parcourue en une seconde : multiplie par la durée.', `d = v × t = 300 000 × ${fmt(t)} = <b>${fmt(d)}</b> km.`);
      }
      if (level === 2) {
        const r = rng.next();
        if (r < 0.4) {
          const [from, to, d] = rng.pick([['de la Lune', 'à la Terre', 384000], ['du Soleil', 'à la Terre', 150000000], ['du Soleil', 'à Vénus', 108000000], ['du Soleil', 'à Mars', 228000000], ['du Soleil', 'à Jupiter', 780000000], ['d’un satellite géostationnaire', 'au sol', 36000], ['du Soleil', 'à Mercure', 57600000], ['d’un satellite GPS', 'au sol', 20100]]);
          const t = div(d, C);
          return Q(`pcl2t:${d}`, `La lumière se propage à environ 300 000 km/s. Il y a environ ${fmt(d)} km ${from} ${to}. Combien de temps (en s) met la lumière pour aller ${from} ${to} ?`, num(t, 's'), 'Durée = distance ÷ vitesse, avec la distance en km et la vitesse en km/s.', `t = d ÷ v = ${fmt(d)} ÷ 300 000 = <b>${fmt(t)}</b> s.`);
        }
        if (r < 0.75) {
          const t = rng.pick([0.5, 2, 3, 4, 1.5, 0.2, 0.01, 6, 20, 60]), d = mul(C, t);
          if (rng.chance(0.5)) return Q(`pcl2d:${t}`, `Un signal lumineux voyage dans le vide spatial à 300 000 km/s pendant ${fmt(t)} s. Quelle distance parcourt-il ?`, num(d, 'km'), 'Distance = vitesse × durée.', `d = 300 000 × ${fmt(t)} = <b>${fmt(d)}</b> km.`);
          return Q(`pcl2r:${t}`, `Un signal lumineux parcourt ${fmt(d)} km dans le vide, à 300 000 km/s. Combien de temps (en s) dure son trajet ?`, num(t, 's'), 'Durée = distance ÷ vitesse.', `t = ${fmt(d)} ÷ 300 000 = <b>${fmt(t)}</b> s.`);
        }
        const [p, d] = rng.pick(PLANETS), s = d / C;
        return Q(`pcl2c:${p}`, `La lumière du Soleil met ${fmt(s)} s pour atteindre ${p}. Convertis cette durée en minutes et secondes.`, { kind: 'duration', s, units: 'ms' }, 'Combien de fois 60 s dans cette durée ? Que reste-t-il ?', `${fmt(s)} s = ${Math.floor(s / 60)} × 60 s + ${s % 60} s = <b>${ms(s)}</b>.`);
      }
      // Level 3: two steps, round trip, traps.
      const r = rng.next();
      if (r < 0.35) {
        const [p, d] = rng.pick(PLANETS), s = d / C;
        return Q(`pcl3c:${p}`, `${cap(p)} est à environ ${fmt(d)} km du Soleil. La lumière se propage à 300 000 km/s. Combien de temps sa lumière met-elle pour aller du Soleil à ${p} ? (Réponds en min et s.)`, { kind: 'duration', s, units: 'ms' }, 'Calcule d’abord la durée en secondes, puis convertis : 1 min = 60 s.',
          `t = ${fmt(d)} ÷ 300 000 = ${fmt(s)} s = ${Math.floor(s / 60)} × 60 s + ${s % 60} s, soit <b>${ms(s)}</b>.`);
      }
      if (r < 0.65) {
        const t = rng.pick([2.4, 2.44, 2.5, 2.52, 2.56, 2.6, 2.64, 2.7]), d = mul(150000, t), half = div(t, 2);
        return Q(`pcl3l:${t}`, `Un faisceau laser envoyé depuis la Terre se réfléchit sur un miroir posé sur la Lune et revient : l’aller-retour dure ${fmt(t)} s. La lumière va à 300 000 km/s. Quelle est, ce jour-là, la distance Terre–Lune ?`, num(d, 'km'), 'Attention : la durée donnée correspond à un aller ET un retour.', `Aller simple : ${fmt(t)} ÷ 2 = ${fmt(half)} s. Distance : 300 000 × ${fmt(half)} = <b>${fmt(d)}</b> km.`);
      }
      const T = [
        ['Quand on observe une étoile lointaine, on la voit…', 'telle qu’elle était quand sa lumière est partie, il y a longtemps', ['telle qu’elle est à cet instant précis', 'avec un retard d’une seconde seulement', 'en avance sur le présent'], 'Sa lumière a mis des années à nous parvenir.'],
        ['Si le Soleil s’éteignait d’un coup, quand le verrait-on s’éteindre depuis la Terre ?', 'environ 8 min 20 s plus tard', ['immédiatement', 'environ 1 s plus tard', 'un an plus tard'], 'La dernière lumière émise mettrait 500 s à arriver.'],
        ['Inès allume la lumière dans une salle de 30 m de long. La lumière atteint le fond de la salle…', 'quasi instantanément', ['une seconde plus tard', 'trente secondes plus tard', 'seulement si la salle est vide'], '30 m ÷ 300 000 000 m/s : un dix-millionième de seconde.'],
        ['La vitesse de la lumière, 300 000 km/s, s’écrit aussi :', '300 000 000 m/s', ['300 000 m/s', '3 000 km/s', '340 m/s'], '1 km = 1 000 m, donc 300 000 km = 300 000 000 m.'],
      ];
      const i = rng.int(0, T.length - 1), [qq, good, bad, why] = T[i];
      return Q(`pcl3t:${i}`, qq, choice(rng, cap(good), bad.map(cap)), 'La lumière est très rapide, mais pas infiniment : compare la distance à parcourir et sa vitesse.', `<b>${cap(good)}</b>. ${why}`);
    },
  });

  // ===================== LE SON A BESOIN DE MATIÈRE =====================
  const MEDIA = { air: ['l’air', 340], eau: ['l’eau', 1500], acier: ['l’acier', 5000] };

  M.notion('pc-propagation-son', {
    lesson: {
      retenir: `Un son est produit par un objet qui <b>vibre</b> ; la vibration se transmet de proche en proche à la matière qui l’entoure. Le son a donc besoin d’un <b>milieu matériel</b> (gaz, liquide ou solide) pour se propager : il ne se propage <b>pas dans le vide</b>, ni dans l’espace entre les astres. Sa vitesse dépend du milieu : environ <b>340 m/s dans l’air</b>, <b>1 500 m/s dans l’eau</b>, <b>5 000 m/s dans l’acier</b>. On utilise d = v × t : un orage dont on entend le tonnerre 3 s après l’éclair est à environ 340 × 3 = 1 020 m, soit à peu près 1 km.`,
      methode: [
        'Repère le milieu traversé (air, eau, acier…) et la vitesse du son correspondante.',
        'Pour une distance : d = v × t ; pour une durée : t = d ÷ v (distance en m, vitesse en m/s, durée en s).',
        'Pour un écho ou un sonar, le son fait l’aller ET le retour : divise la distance parcourue par 2.',
        'Pour un orage, la lumière arrive presque instantanément : seule compte la durée du son.',
      ],
      exemples: [
        { q: 'Tonnerre entendu 6 s après l’éclair ?', r: '340 × 6 = <b>2 040 m</b>, environ 2 km.' },
        { q: 'Écho revenu 2 s après le cri, devant une falaise ?', r: 'Le son parcourt 340 × 2 = 680 m aller-retour, la falaise est à <b>340 m</b>.' },
        { q: 'On pompe l’air sous une cloche où sonne un réveil ?', r: 'Le son devient de plus en plus faible : <b>sans matière, pas de son</b>.' },
      ],
      astuces: ['Règle de l’orage : compte les secondes entre l’éclair et le tonnerre, divise par 3 : tu as la distance en km, environ.', 'Plus le milieu est « serré » (solide), plus le son y va vite : air &lt; eau &lt; acier.'],
      erreurs: [
        'Croire que le son se propage dans l’espace : les explosions des films de science-fiction devraient être silencieuses.',
        'Croire que le tonnerre est produit après l’éclair : ils sont produits en même temps, le son arrive juste plus tard.',
        'Oublier de diviser par 2 pour un écho.',
        'Confondre les vitesses du son (340 m/s) et de la lumière (300 000 km/s).',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        const r = rng.next();
        if (r < 0.35) {
          const [m, ok] = rng.pick([['l’air', true], ['l’eau', true], ['l’acier', true], ['le bois d’une table', true], ['un mur en béton', true], ['le vide', false], ['l’espace, entre les planètes', false], ['le sol', true], ['une vitre', true]]);
          return Q(`pcn1m:${m}`, `Le son peut-il se propager dans ${m} ?`, yesNo(ok), 'Le son est une vibration transmise de proche en proche : y a-t-il de la matière pour la transmettre ?', ok ? `C’est un milieu matériel : la vibration s’y transmet. <b>Oui</b>.` : `Il n’y a pas de matière pour transmettre la vibration. <b>Non</b>.`);
        }
        if (r < 0.6) {
          const dev = rng.pick(['un réveil', 'un téléphone', 'une sonnette', 'un buzzer', 'un petit haut-parleur']);
          return Q(`pcn1c:${dev}`, `On place ${dev} qui sonne sous une cloche en verre, puis on pompe l’air pour faire le vide. Qu’entend-on ?`, choice(rng, 'Le son devient de plus en plus faible, jusqu’à presque disparaître', ['Le son devient plus fort', 'Le son ne change pas', 'Le son devient plus aigu']), 'De quoi le son a-t-il besoin pour arriver jusqu’à l’oreille ?', `En retirant l’air, on retire la matière qui transmet le son : <b>le son devient de plus en plus faible, jusqu’à presque disparaître</b>.`);
        }
        if (rng.chance(0.5)) {
          const k = rng.pick(['air', 'eau', 'acier']), [m, v] = MEDIA[k];
          return Q(`pcn1s:${k}`, `Quelle est, environ, la vitesse du son dans ${m} ?`, choice(rng, `${fmt(v)} m/s`, [340, 1500, 5000].filter(x => x !== v).map(x => `${fmt(x)} m/s`).concat('300 000 km/s')), 'Le son va plus vite dans les liquides que dans les gaz, et encore plus vite dans les solides.', `Dans ${m}, le son se propage à environ <b>${fmt(v)} m/s</b>.`);
        }
        const fast = rng.chance(0.5), k = fast ? 'acier' : 'air', w = fast ? 'le plus vite' : 'le moins vite';
        return Q(`pcn1f:${fast}`, `Dans quel milieu le son se propage-t-il ${w} : l’air, l’eau ou l’acier ?`, fixedChoice(['L’air', 'L’eau', 'L’acier'], cap(MEDIA[k][0])), 'Gaz, liquide ou solide : dans lequel la matière est-elle la plus serrée ?', `Air ≈ 340 m/s, eau ≈ 1 500 m/s, acier ≈ 5 000 m/s : <b>${MEDIA[k][0]}</b>.`);
      }
      if (level === 2) {
        const r = rng.next();
        if (r < 0.4) {
          const nm = rng.pick(NAMES), t = rng.int(2, 12), d = 340 * t;
          return Q(`pcn2o:${t}:${nm}`, `${nm} voit un éclair, puis entend le tonnerre ${fmt(t)} s plus tard. Le son se propage dans l’air à environ 340 m/s. À quelle distance (en m) l’orage se trouve-t-il ? (On néglige la durée du trajet de la lumière.)`, num(d, 'm'), 'Distance = vitesse × durée.', `d = 340 × ${fmt(t)} = <b>${fmt(d)}</b> m.`);
        }
        if (r < 0.75) {
          const k = rng.pick(['air', 'eau', 'acier']), [m, v] = MEDIA[k], t = rng.pick(k === 'acier' ? [0.1, 0.2, 0.3, 0.4, 0.5, 0.6] : [0.5, 2, 3, 4, 6, 1.5]), d = mul(v, t);
          const ctx = { air: `Le son d’une cloche parcourt ${fmt(d)} m dans l’air`, eau: `Le bruit d’un bateau parcourt ${fmt(d)} m dans l’eau jusqu’à un plongeur`, acier: `Un ouvrier frappe un rail en acier : le son parcourt ${fmt(d)} m dans le rail` }[k];
          return Q(`pcn2t:${k}:${t}`, `${ctx}, à environ ${fmt(v)} m/s. Combien de temps (en s) dure ce trajet ?`, num(t, 's'), 'Durée = distance ÷ vitesse.', `t = ${fmt(d)} ÷ ${fmt(v)} = <b>${fmt(t)}</b> s.`);
        }
        const t = rng.pick([2, 3, 4, 5, 6, 8, 10, 0.4]), d = mul(1500, t), who = rng.pick(['le chant d’une baleine', 'le cri d’un dauphin', 'le bruit d’un sous-marin']);
        return Q(`pcn2w:${t}:${who}`, `Dans l’eau, le son se propage à environ 1 500 m/s. Un micro sous-marin capte ${who} ${fmt(t)} s après son émission. À quelle distance (en m) se trouve la source ?`, num(d, 'm'), 'Distance = vitesse × durée, avec la vitesse du son dans l’eau.', `d = 1 500 × ${fmt(t)} = <b>${fmt(d)}</b> m.`);
      }
      // Level 3: echo, thunder in km, two media, traps.
      const r = rng.next();
      if (r < 0.35) {
        if (rng.chance(0.5)) {
          const t = rng.pick([1, 2, 3, 4, 0.5, 1.5, 2.5, 5]), tot = mul(340, t), d = div(tot, 2), nm = rng.pick(NAMES);
          return Q(`pcn3e:${t}:${nm}`, `${nm} crie face à une falaise et entend l’écho ${fmt(t)} s plus tard. Le son va à 340 m/s dans l’air. À quelle distance (en m) se trouve la falaise ?`, num(d, 'm'), 'Le son fait l’aller jusqu’à la falaise ET le retour.', `En ${fmt(t)} s, le son parcourt 340 × ${fmt(t)} = ${fmt(tot)} m. C’est un aller-retour : ${fmt(tot)} ÷ 2 = <b>${fmt(d)}</b> m.`);
        }
        const t = rng.pick([0.2, 0.4, 0.8, 1, 2, 4, 0.6, 3]), tot = mul(1500, t), d = div(tot, 2);
        return Q(`pcn3s:${t}`, `Le sonar d’un bateau envoie un son vers le fond de la mer ; l’écho revient ${fmt(t)} s plus tard. Le son va à 1 500 m/s dans l’eau. Quelle est la profondeur (en m) ?`, num(d, 'm'), 'La durée mesurée correspond à un aller ET un retour.', `En ${fmt(t)} s, le son parcourt 1 500 × ${fmt(t)} = ${fmt(tot)} m. Aller-retour : ${fmt(tot)} ÷ 2 = <b>${fmt(d)}</b> m.`);
      }
      if (r < 0.55) {
        const t = rng.int(3, 15), m = 340 * t, km = div(m, 1000);
        return Q(`pcn3k:${t}`, `Le tonnerre arrive ${fmt(t)} s après l’éclair. Le son va à 340 m/s dans l’air. À quelle distance de l’orage est-on, en <b>km</b> ?`, num(km, 'km'), 'Calcule la distance en mètres, puis convertis : 1 km = 1 000 m.', `340 × ${fmt(t)} = ${fmt(m)} m = <b>${fmt(km)}</b> km.`);
      }
      if (r < 0.75) {
        const d = rng.pick([170, 340, 510, 680, 850, 1020]), ta = div(d, 340), ts = div(d, 5000), diff = sub(ta, ts), [a, b] = rng.sample(NAMES, 2);
        return Q(`pcn3d:${d}:${a}`, `${a} colle son oreille contre un long tuyau en acier de ${fmt(d)} m ; ${b} frappe l’autre bout. ${a} entend deux sons : l’un arrive par l’acier (5 000 m/s), l’autre par l’air (340 m/s). Combien de secondes séparent les deux sons ?`, num(diff, 's'), 'Calcule la durée du trajet dans chaque milieu, puis fais la différence.', `Dans l’air : ${fmt(d)} ÷ 340 = ${fmt(ta)} s. Dans l’acier : ${fmt(d)} ÷ 5 000 = ${fmt(ts)} s. Écart : ${fmt(ta)} − ${fmt(ts)} = <b>${fmt(diff)}</b> s.`);
      }
      const T = [
        ['Dans un film, un vaisseau explose dans l’espace avec un énorme « BOUM ». Est-ce réaliste ?', 'Non : dans le vide spatial, aucune matière ne transmet le son', ['Oui : le son se propage partout', 'Oui : le son va aussi vite que la lumière', 'Non : l’explosion est trop loin pour être vue']],
        ['Deux astronautes, dans le vide spatial et sans radio, collent leurs casques l’un contre l’autre. Peuvent-ils s’entendre parler ?', 'Oui, faiblement : le son passe par la matière des casques', ['Non, jamais : on est dans l’espace', 'Oui, grâce au vide qui transmet le son', 'Non, car le son ne traverse aucun solide']],
        ['Pourquoi entend-on le tonnerre après avoir vu l’éclair ?', 'La lumière va beaucoup plus vite que le son', ['Le tonnerre est produit après l’éclair', 'Le son va plus vite que la lumière', 'Nos oreilles réagissent plus lentement que nos yeux']],
        ['Pour entendre arriver un train de loin, mieux vaudrait coller l’oreille au rail (à ne jamais faire !). Pourquoi ?', 'Le son va plus vite dans l’acier que dans l’air', ['Le son ne se propage pas dans l’air', 'L’acier rend le son plus aigu', 'La lumière du train passe par le rail']],
        ['Sur la Lune, sans air, deux astronautes à 5 m l’un de l’autre crient sans radio. S’entendent-ils ?', 'Non : il n’y a pas d’air pour transporter le son', ['Oui, s’ils crient assez fort', 'Oui, car 5 m c’est très près', 'Non, car la Lune est trop froide']],
      ];
      const i = rng.int(0, T.length - 1), [qq, good, bad] = T[i];
      return Q(`pcn3t:${i}`, qq, choice(rng, good, bad), 'Le son est une vibration de la matière : où y a-t-il de la matière pour la transmettre ?', `<b>${good}</b>.`);
    },
  });

  // ===================== FRÉQUENCE : AIGU OU GRAVE =====================
  const kind = f => (f < 20 ? 'Un infrason' : f > 20000 ? 'Un ultrason' : 'Un son audible');
  const KINDS = ['Un infrason', 'Un son audible', 'Un ultrason'];
  const hz = f => (f >= 1000 && f % 100 === 0 && f < 1000000 ? `${fmt(f / 1000)} kHz` : `${fmt(f)} Hz`);

  M.notion('pc-frequence-son', {
    lesson: {
      retenir: `La <b>fréquence</b> d’un son est le nombre de vibrations de la source <b>par seconde</b>. Elle s’exprime en <b>hertz (Hz)</b> : 1 Hz = 1 vibration par seconde, et 1 kHz = 1 000 Hz. Plus la fréquence est <b>élevée</b>, plus le son est <b>aigu</b> ; plus elle est basse, plus le son est <b>grave</b>. L’oreille humaine entend environ de <b>20 Hz à 20 kHz</b>. En dessous de 20 Hz, ce sont des <b>infrasons</b> (éléphants, baleines) ; au-dessus de 20 kHz, des <b>ultrasons</b> (chauves-souris, dauphins, échographie).`,
      explication: `<p>Pendant la même durée, la source du son A vibre 3 fois, celle du son B 8 fois :</p>${twoWaves(3, 8)}<p>B a une fréquence plus élevée que A : <b>B est plus aigu</b>, A est plus grave. La hauteur (aigu ou grave) ne dit rien sur la force du son.</p>`,
      methode: [
        'Pour calculer une fréquence : divise le nombre de vibrations par la durée en secondes.',
        'Pour comparer deux sons, exprime leurs fréquences dans la même unité (Hz ou kHz).',
        'Pour savoir si un son est audible, compare sa fréquence à 20 Hz et à 20 kHz (20 000 Hz).',
      ],
      exemples: [
        { q: 'Une corde vibre 880 fois en 2 s. Fréquence ?', r: '880 ÷ 2 = <b>440 Hz</b> (le « la » du diapason).' },
        { q: '2,5 kHz en Hz ?', r: '2,5 × 1 000 = <b>2 500 Hz</b>.' },
        { q: 'Une chauve-souris émet à 50 kHz. L’entend-on ?', r: '50 kHz &gt; 20 kHz : c’est un ultrason, <b>on ne l’entend pas</b>.' },
      ],
      astuces: ['« Infra » veut dire « en dessous », « ultra » veut dire « au-delà » : infrasons trop graves, ultrasons trop aigus pour nous.', 'Avec l’âge, on entend de moins en moins bien les sons très aigus.'],
      erreurs: [
        'Confondre aigu et fort : un son peut être aigu et faible, ou grave et très fort.',
        'Comparer 900 Hz et 2,5 kHz sans convertir : 2,5 kHz = 2 500 Hz, c’est le plus aigu.',
        'Croire que les ultrasons sont des sons très forts : ils sont très aigus.',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        const r = rng.next();
        if (r < 0.4) {
          const f = rng.pick([5, 8, 12, 16, 50, 100, 440, 1000, 3000, 8000, 15000, 25000, 30000, 40000, 80000]), k = kind(f);
          return Q(`pcf1k:${f}`, `Un son a une fréquence de ${fmt(f)} Hz. Pour l’oreille humaine, c’est :`, fixedChoice(KINDS, k), 'L’oreille humaine entend environ de 20 Hz à 20 000 Hz.', `${fmt(f)} Hz ${f < 20 ? 'est en dessous de 20 Hz' : f > 20000 ? 'est au-dessus de 20 000 Hz' : 'est entre 20 Hz et 20 000 Hz'} : <b>${k.toLowerCase()}</b>.`);
        }
        if (r < 0.75) {
          const fs = rng.sample([100, 200, 300, 440, 600, 800, 1000, 2000, 3500, 5000, 8000, 12000], 3), hi = rng.chance(0.5);
          const best = hi ? Math.max(...fs) : Math.min(...fs);
          return Q(`pcf1c:${fs}:${hi}`, `Lequel de ces sons est le plus <b>${hi ? 'aigu' : 'grave'}</b> ?`, choice(rng, `${fmt(best)} Hz`, fs.filter(f => f !== best).map(f => `${fmt(f)} Hz`)), 'Aigu ou grave dépend de la fréquence : haute ou basse ?', `Le son le plus ${hi ? 'aigu a la fréquence la plus élevée' : 'grave a la fréquence la plus basse'} : <b>${fmt(best)} Hz</b>.`);
        }
        const D = [
          ['Dans quelle unité exprime-t-on une fréquence ?', 'Le hertz (Hz)', ['Le décibel (dB)', 'Le mètre par seconde (m/s)', 'La seconde (s)']],
          ['Une fréquence de 1 Hz correspond à…', 'une vibration par seconde', ['une vibration par minute', 'un son très fort', 'un mètre par seconde']],
          ['Un son de fréquence élevée est…', 'aigu', ['grave', 'forcément fort', 'forcément faible']],
          ['Un son de basse fréquence est…', 'grave', ['aigu', 'forcément fort', 'inaudible']],
          ['Entre quelles fréquences l’oreille humaine entend-elle, environ ?', 'De 20 Hz à 20 kHz', ['De 0 Hz à 100 Hz', 'De 20 kHz à 200 kHz', 'De 340 Hz à 1 500 Hz']],
        ];
        const i = rng.int(0, D.length - 1), [qq, good, bad] = D[i];
        return Q(`pcf1d:${i}`, qq, choice(rng, cap(good), bad.map(cap)), 'La fréquence compte des vibrations pendant une durée.', `<b>${cap(good)}</b>.`);
      }
      if (level === 2) {
        const r = rng.next();
        if (r < 0.3) {
          const k = rng.pick([2, 2.5, 4, 0.5, 1.2, 15, 20, 0.44, 3.5, 8]), f = mul(k, 1000);
          if (rng.chance(0.5)) return Q(`pcf2h:${k}`, `Convertis ${fmt(k)} kHz en Hz.`, num(f, 'Hz'), 'Un kilohertz vaut mille hertz.', `${fmt(k)} kHz = ${fmt(k)} × 1 000 Hz = <b>${fmt(f)}</b> Hz.`);
          return Q(`pcf2k:${k}`, `Convertis ${fmt(f)} Hz en kHz.`, num(k, 'kHz'), 'Un kilohertz vaut mille hertz.', `${fmt(f)} Hz = ${fmt(f)} ÷ 1 000 kHz = <b>${fmt(k)}</b> kHz.`);
        }
        if (r < 0.55) {
          const f = rng.pick([50, 100, 200, 220, 440, 250, 500, 150]), t = rng.pick([2, 0.5, 0.1, 10, 3]), n = mul(f, t);
          const src = rng.pick(['La membrane d’un haut-parleur', 'Une corde de guitare', 'Un diapason', 'La lame d’une règle']);
          return Q(`pcf2n:${f}:${t}:${src}`, `${src} effectue ${fmt(n)} vibrations en ${fmt(t)} s. Quelle est la fréquence du son émis ?`, num(f, 'Hz'), 'La fréquence est le nombre de vibrations en une seconde.', `f = ${fmt(n)} ÷ ${fmt(t)} = <b>${fmt(f)}</b> Hz (vibrations par seconde).`);
        }
        if (r < 0.8) {
          const n = rng.int(2, 8), dur = rng.pick([0.01, 0.02]), f = div(n, dur);
          return Q(`pcf2w:${n}:${dur}`, `Le signal ci-dessous représente un son enregistré pendant ${fmt(dur)} s ; on y compte ${n} vibrations (motifs qui se répètent).${waveFig(n, `${fmt(dur)} s`)}Quelle est la fréquence de ce son ?`, num(f, 'Hz'), 'Divise le nombre de vibrations par la durée en secondes.', `f = ${n} ÷ ${fmt(dur)} = <b>${fmt(f)}</b> Hz.`);
        }
        const A = [['une chauve-souris', 50000], ['un dauphin', 120000], ['un éléphant', 14], ['une baleine bleue', 15], ['un grillon', 4000], ['un moustique', 600], ['un sifflet pour chien', 30000], ['une souris', 70000], ['un chat qui miaule', 700], ['un appareil d’échographie', 3000000]];
        const [a, f] = rng.pick(A), ok = f >= 20 && f <= 20000;
        return Q(`pcf2a:${a}`, `${cap(a)} émet un son de ${hz(f)}. Un humain peut-il l’entendre ?`, yesNo(ok), 'Convertis si besoin en Hz, puis compare à 20 Hz et à 20 000 Hz.', `${hz(f)}${f >= 1000 ? ` = ${fmt(f)} Hz` : ''} : ${kind(f).toLowerCase()}. <b>${ok ? 'Oui' : 'Non'}</b>.`);
      }
      // Level 3: mixed units, two steps, traps.
      const r = rng.next();
      if (r < 0.4) {
        const fs = rng.sample([80, 250, 440, 900, 1200, 2500, 3000, 8000, 12000, 500, 1500, 600], 4);
        const show = f => (f >= 1000 || rng.chance(0.3) ? `${fmt(f / 1000)} kHz` : `${fmt(f)} Hz`);
        const shown = fs.map(show);
        return Q(`pcf3o:${shown}`, 'Range ces sons du plus grave au plus aigu.', { ...order(fs, (f, i) => shown[i]), label: 'les sons', how: 'du plus grave au plus aigu' }, 'Exprime d’abord toutes les fréquences dans la même unité.', `En Hz : ${fs.slice().sort((x, y) => x - y).map(f => `${fmt(f)} Hz`).join(' &lt; ')}. Du plus grave au plus aigu : <b>${fs.slice().sort((x, y) => x - y).map(f => shown[fs.indexOf(f)]).join(' → ')}</b>.`);
      }
      if (r < 0.65) {
        const [f, t] = rng.pick([[10, 2], [15, 2], [8, 0.5], [12, 3], [200, 0.5], [440, 2], [1000, 0.1], [25000, 0.1], [40000, 0.5], [30000, 0.01]]), n = mul(f, t), k = kind(f);
        return Q(`pcf3n:${f}:${t}`, `Une source sonore effectue ${fmt(n)} vibrations en ${fmt(t)} s. Pour l’oreille humaine, ce son est :`, fixedChoice(KINDS, k), 'Calcule d’abord la fréquence (vibrations par seconde), puis compare-la à 20 Hz et à 20 000 Hz.', `f = ${fmt(n)} ÷ ${fmt(t)} = ${fmt(f)} Hz : <b>${k.toLowerCase()}</b>.`);
      }
      const T = [
        ['Hugo monte le volume de sa musique. La note jouée devient-elle plus aiguë ?', 'Non : le son est plus fort, mais sa fréquence ne change pas', ['Oui : plus fort veut dire plus aigu', 'Non : elle devient plus grave', 'Oui : la fréquence double']],
        ['Une chauve-souris crie très fort près de Léa, qui n’entend rien. Pourquoi ?', 'Ses cris sont des ultrasons, trop aigus pour l’oreille humaine', ['Ses cris sont trop faibles', 'Le son ne se propage pas la nuit', 'Ce sont des infrasons, trop graves']],
        ['Compare un son de 20 000 Hz et un son de 20 kHz.', 'C’est la même fréquence', ['20 000 Hz est plus aigu', '20 kHz est plus aigu', 'On ne peut pas comparer des Hz et des kHz']],
        ['Une corde de guitare vibre plus de fois par seconde qu’une autre. Son son est…', 'plus aigu', ['plus grave', 'forcément plus fort', 'forcément inaudible']],
        ['L’échographie utilise des ultrasons. Pourquoi la personne examinée ne les entend-elle pas ?', 'Leur fréquence est supérieure à 20 kHz', ['Leur fréquence est inférieure à 20 Hz', 'Ils ne se propagent pas dans le corps', 'Ils sont trop forts pour l’oreille']],
      ];
      const i = rng.int(0, T.length - 1), [qq, good, bad] = T[i];
      return Q(`pcf3t:${i}`, qq, choice(rng, cap(good), bad.map(cap)), 'Ne confonds pas la hauteur (aigu ou grave, liée à la fréquence) et la force du son.', `<b>${cap(good)}</b>.`);
    },
  });

  // ===================== NIVEAU SONORE EN DÉCIBELS =====================
  const SITU = [['le seuil d’audibilité', 0], ['un chuchotement', 30], ['une bibliothèque calme', 40], ['une conversation', 60], ['un aspirateur', 70], ['une rue très passante', 80], ['une cantine bruyante', 85], ['une tondeuse à gazon', 90], ['un marteau-piqueur', 100], ['un concert de rock', 105], ['le seuil de douleur', 120], ['un avion au décollage, de près', 130]];
  const DANGER = ['Sans danger pour l’audition', 'Dangereux si l’exposition dure', 'Douloureux, danger immédiat'];
  const danger = L => DANGER[L >= 120 ? 2 : L >= 85 ? 1 : 0];

  M.notion('pc-niveau-sonore', {
    lesson: {
      retenir: `Le <b>niveau sonore</b> indique si un son est fort ou faible. Il se mesure avec un <b>sonomètre</b> et s’exprime en <b>décibels (dB)</b>. Repères : 0 dB, le plus faible son audible ; chuchotement 30 dB ; conversation 60 dB ; à partir d’environ <b>85 dB</b>, une exposition prolongée <b>abîme l’audition</b> ; vers <b>120 dB</b>, c’est le <b>seuil de douleur</b>. Les lésions de l’oreille sont souvent <b>irréversibles</b> : on se protège (bouchons, casque antibruit, distance, pauses, volume modéré). Attention, les décibels ne s’additionnent pas : deux sons de 60 dB ensemble ne font pas 120 dB, mais environ 63 dB.`,
      methode: [
        'Lis la valeur du sonomètre en dB.',
        'Compare-la aux repères : moins de 85 dB, pas de danger ; à partir de 85 dB, danger si l’exposition dure ; 120 dB, douleur.',
        'Plus le niveau est élevé, plus le temps d’exposition sans risque est court : protège-toi ou éloigne-toi.',
      ],
      exemples: [
        { q: 'Un concert à 105 dB : dangereux ?', r: '105 dB &gt; 85 dB : <b>dangereux</b> si on y reste ; bouchons d’oreilles et pauses.' },
        { q: 'Range : conversation, chuchotement, marteau-piqueur.', r: '<b>Chuchotement (30 dB) &lt; conversation (60 dB) &lt; marteau-piqueur (100 dB)</b>.' },
        { q: 'Deux aspirateurs de 70 dB fonctionnent ensemble.', r: 'Pas 140 dB ! Environ <b>73 dB</b> : un peu plus fort qu’un seul.' },
      ],
      astuces: ['Si tu dois crier pour te faire entendre à 1 m, le niveau sonore est probablement dangereux.', 'Des sifflements dans les oreilles après un concert sont un signal d’alerte.'],
      erreurs: [
        'Additionner les décibels : 60 dB + 60 dB ne font pas 120 dB.',
        'Croire que 0 dB veut dire « aucun son » : c’est le son le plus faible que l’oreille perçoit.',
        'Confondre niveau sonore (fort ou faible, en dB) et fréquence (aigu ou grave, en Hz).',
        'Croire que l’oreille se répare toujours : certaines lésions sont définitives.',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        const r = rng.next();
        if (r < 0.3) {
          const D = [
            ['Dans quelle unité exprime-t-on le niveau sonore ?', 'Le décibel (dB)', ['Le hertz (Hz)', 'Le mètre par seconde (m/s)', 'Le degré Celsius (°C)']],
            ['Quel appareil mesure le niveau sonore ?', 'Un sonomètre', ['Un thermomètre', 'Un chronomètre', 'Un ampèremètre']],
            ['Plus le nombre de décibels est grand, plus le son est…', 'fort', ['aigu', 'grave', 'lent']],
          ];
          const i = rng.int(0, 2), [qq, good, bad] = D[i];
          return Q(`pcd1d:${i}`, qq, choice(rng, cap(good), bad.map(cap)), 'Le niveau sonore dit si un son est fort ou faible.', `<b>${cap(good)}</b>.`);
        }
        if (r < 0.7) {
          let pick;
          do pick = rng.sample(SITU.filter(s => !s[0].startsWith('le seuil')), 4); while (pick.some((a, i) => pick.some((b, j) => i !== j && Math.abs(a[1] - b[1]) < 20)));
          const vals = pick.map(p => p[1]);
          return Q(`pcd1o:${pick.map(p => p[0])}`, 'Range ces situations du niveau sonore le plus faible au plus fort.', { ...order(vals, (v, i) => pick[i][0]), label: 'les situations', how: 'du plus faible au plus fort' }, 'Imagine chaque situation : faut-il crier pour se parler ? Peut-on y rester longtemps ?', `${pick.slice().sort((a, b) => a[1] - b[1]).map(p => `${p[0]} (≈ ${p[1]} dB)`).join(' &lt; ')} : <b>${pick.slice().sort((a, b) => a[1] - b[1]).map(p => p[0]).join(' → ')}</b>.`);
        }
        const L = rng.pick([20, 30, 40, 50, 60, 70, 75, 90, 95, 100, 105, 110, 120, 130]);
        return Q(`pcd1n:${L}`, `Un sonomètre affiche ${fmt(L)} dB. Ce niveau sonore est :`, fixedChoice(DANGER, danger(L)), 'Repères : seuil de danger vers 85 dB, seuil de douleur vers 120 dB.', `${fmt(L)} dB ${L >= 120 ? 'atteint le seuil de douleur (120 dB)' : L >= 85 ? 'dépasse le seuil de danger (85 dB)' : 'reste sous le seuil de danger (85 dB)'} : <b>${danger(L).toLowerCase()}</b>.`);
      }
      if (level === 2) {
        const r = rng.next();
        if (r < 0.35) {
          const pick = rng.sample(SITU.filter(s => s[1] > 0 && s[1] < 120 && s[1] !== 85), 5), n = pick.filter(p => p[1] >= 85).length;
          return Q(`pcd2c:${pick.map(p => p[1])}`, `Un sonomètre a mesuré : ${pick.map(p => `${p[0]} ${fmt(p[1])} dB`).join(' ; ')}. Combien de ces situations atteignent ou dépassent le seuil de danger de 85 dB ?`, num(n), 'Compare chaque valeur à 85 dB.', n ? `Au moins 85 dB : ${pick.filter(p => p[1] >= 85).map(p => `${p[0]} (${fmt(p[1])} dB)`).join(', ')}. Il y en a <b>${fmt(n)}</b>.` : `Toutes les valeurs sont sous 85 dB : <b>${fmt(n)}</b>.`);
        }
        if (r < 0.65) {
          const G = ['porter des bouchons d’oreilles', 's’éloigner des enceintes', 'baisser le volume du casque', 'faire des pauses dans un endroit calme', 'porter un casque antibruit'];
          const Bd = ['se coller aux enceintes pour mieux entendre', 'monter le son du casque pour couvrir le bruit de la rue', 'rester toute la soirée au pied de la scène', 'écouter de la musique à fond pendant des heures'];
          if (rng.chance(0.5)) {
            const g = rng.pick(G), b = rng.sample(Bd, 3);
            return Q(`pcd2g:${g}:${b}`, 'Lequel de ces gestes protège l’audition ?', choice(rng, cap(g), b.map(cap)), 'Pour protéger l’oreille : moins fort, moins longtemps, ou plus loin.', `<b>${cap(g)}</b> : cela diminue le niveau sonore reçu ou la durée d’exposition.`);
          }
          const b = rng.pick(Bd), g = rng.sample(G, 3);
          return Q(`pcd2b:${b}:${g}`, 'Lequel de ces gestes met l’audition en danger ?', choice(rng, cap(b), g.map(cap)), 'Qu’est-ce qui augmente le niveau sonore reçu, ou la durée d’exposition ?', `<b>${cap(b)}</b> : cela expose l’oreille à un niveau sonore élevé, souvent longtemps.`);
        }
        const L = rng.pick([75, 85, 90, 95, 100, 105]), nm = rng.pick(NAMES), away = rng.chance(0.5);
        return Q(`pcd2d:${L}:${nm}:${away}`, `Près d’une enceinte, le sonomètre de ${nm} affiche ${fmt(L)} dB. ${nm} ${away ? 's’éloigne' : 'se rapproche'} de l’enceinte. Que devient le niveau sonore mesuré ?`, fixedChoice(['Il diminue', 'Il augmente', 'Il ne change pas'], away ? 'Il diminue' : 'Il augmente'), 'Le son s’étale en s’éloignant de sa source.', `Plus on est loin de la source, plus le niveau sonore est faible : il <b>${away ? 'diminue' : 'augmente'}</b>.${away ? ' S’éloigner est une bonne protection.' : ''}`);
      }
      // Level 3: decibels do not add, gaps to a threshold, true/false.
      const r = rng.next();
      if (r < 0.35) {
        const L = rng.pick([40, 50, 60, 70, 80]), what = rng.pick(['aspirateurs', 'ventilateurs', 'tondeuses', 'sèche-cheveux', 'climatiseurs', 'haut-parleurs identiques']);
        return Q(`pcd3a:${L}:${what}`, `Un seul de ces ${what} produit ${fmt(L)} dB. On en fait fonctionner deux ensemble, au même endroit. Quel niveau sonore mesure-t-on ?`, choice(rng, `Environ ${fmt(L + 3)} dB`, [`${fmt(2 * L)} dB`, `${fmt(L / 2)} dB`, `Environ ${fmt(L - 3)} dB`]), 'Les décibels ne s’additionnent pas comme des longueurs : deux sources, est-ce deux fois plus « fort » à l’oreille ?', `Les décibels ne s’additionnent pas : ${fmt(L)} dB + ${fmt(L)} dB ne font pas ${fmt(2 * L)} dB. Doubler une source identique n’ajoute qu’environ 3 dB : <b>environ ${fmt(L + 3)} dB</b>.`);
      }
      if (r < 0.6) {
        const nm = rng.pick(NAMES);
        if (rng.chance(0.6)) {
          const [ctx, L] = rng.pick([['un concert', 105], ['une discothèque', 100], ['un match dans un stade', 95], ['une cantine très bruyante', 90], ['un feu d’artifice, de près', 115], ['une salle de cinéma pendant une explosion', 110], ['un atelier de menuiserie', 98]]);
          return Q(`pcd3g:${L}:${nm}`, `Dans ${ctx}, le sonomètre de ${nm} affiche ${fmt(L)} dB. De combien de décibels ce niveau dépasse-t-il le seuil de danger de 85 dB ?`, num(L - 85, 'dB'), 'Calcule l’écart entre la mesure et le seuil de danger.', `${fmt(L)} − 85 = <b>${fmt(L - 85)}</b> dB au-dessus du seuil : il faut se protéger (bouchons, pauses, distance).`);
        }
        const L = rng.pick([60, 70, 75, 80, 90, 100]);
        return Q(`pcd3p:${L}:${nm}`, `Le sonomètre de ${nm} affiche ${fmt(L)} dB. De combien de décibels faudrait-il que le niveau augmente pour atteindre le seuil de douleur de 120 dB ?`, num(120 - L, 'dB'), 'Calcule l’écart entre le seuil de douleur et la mesure.', `120 − ${fmt(L)} = <b>${fmt(120 - L)}</b> dB.`);
      }
      const S = [
        ['0 dB signifie qu’il n’y a aucun son.', false, '0 dB est le son le plus faible que l’oreille humaine perçoit.'],
        ['Un son très aigu est forcément très fort.', false, 'Aigu ou grave dépend de la fréquence (Hz), fort ou faible du niveau sonore (dB).'],
        ['Le niveau sonore se mesure avec un sonomètre.', true, 'Il affiche le niveau en décibels.'],
        ['À partir d’environ 85 dB, une exposition prolongée abîme l’audition.', true, 'Plus le niveau est élevé, plus la durée sans risque est courte.'],
        ['Les lésions de l’oreille dues au bruit guérissent toujours.', false, 'Elles sont souvent définitives : on ne peut pas les réparer.'],
        ['Deux sons de 60 dB ensemble donnent 120 dB.', false, 'Les décibels ne s’additionnent pas : on obtient environ 63 dB.'],
        ['Écouter de la musique au casque à fond pendant des heures est sans risque.', false, 'Un casque peut dépasser 100 dB, juste à côté de l’oreille.'],
        ['Le seuil de douleur est d’environ 120 dB.', true, 'À ce niveau, le son fait mal et abîme l’oreille très vite.'],
      ];
      const i = rng.int(0, S.length - 1), [s, t, why] = S[i];
      return Q(`pcd3v:${i}`, `Vrai ou faux ? « ${s} »`, vf(t), 'Repense aux repères de l’échelle des décibels et à ce que mesure un décibel.', `<b>${t ? 'Vrai' : 'Faux'}</b>. ${why}`);
    },
  });

  // ===================== EXPLICATIONS =====================
  const B = M.cat.BASE, E = M.explain;
  E('pc-sources-lumiere', [
    ['dessin', `<p>Pour que tu voies le livre, la lumière fait ce trajet : elle part de la lampe (source primaire), arrive sur le livre, qui la renvoie dans toutes les directions ; une partie entre dans ton œil.</p>${visionFig()}<p>Aucune flèche ne part de l’œil : il <b>reçoit</b> la lumière.</p>`],
    ['experience', '<p>On place dans une boîte en carton fermée une balle blanche et une petite lampe éteinte, puis on regarde par un petit trou : on ne voit <b>rien</b>. On allume la lampe : on voit la lampe <b>et</b> la balle. La lampe allumée produit sa lumière (source primaire) ; la balle ne devient visible que quand elle reçoit de la lumière à renvoyer (objet diffusant).</p>'],
    ['vie', '<p>Un soir, Inès dit à Noah : « Regarde comme la Lune brille ! » Noah répond : « Elle ne brille pas toute seule, c’est le Soleil qui l’éclaire, même s’il est passé de l’autre côté de la Terre. » La Lune est comme un grand mur blanc dans le ciel : un <b>objet diffusant</b>. C’est aussi pour ça qu’on voit ses phases : on voit seulement sa partie éclairée.</p>'],
  ]);
  E('pc-propagation-lumiere', [
    ['dessin', B],
    ['experience', '<p>On perce un petit trou au même endroit dans trois cartons, on les pose debout les uns derrière les autres, et on place une bougie allumée au bout. Quand les trous sont <b>alignés</b>, on voit la flamme ; si on décale un seul carton, on ne la voit plus. La lumière ne peut pas faire de détour : elle va <b>en ligne droite</b>.</p>'],
    ['vie', '<p>Hugo fait des ombres chinoises avec une lampe de poche. Quand il approche sa main de la lampe, le lapin projeté sur le mur devient <b>géant</b> ; quand il approche sa main du mur, le lapin rapetisse jusqu’à la taille de sa main. Les rayons qui frôlent sa main partent de la lampe en s’écartant : plus ils ont de chemin à faire après la main, plus l’ombre est grande.</p>'],
  ]);
  E('pc-vitesse-lumiere', [
    ['etapes', '<p>Combien de temps met la lumière du Soleil pour arriver jusqu’à moi ?</p><ol><li>Je note : d = 150 000 000 km et v = 300 000 km/s.</li><li>Je calcule t = d ÷ v = 150 000 000 ÷ 300 000.</li><li>Je supprime 5 zéros de chaque côté : 1 500 ÷ 3 = <b>500 s</b>.</li><li>Je convertis : 500 = 8 × 60 + 20, donc <b>8 min 20 s</b>.</li></ol>'],
    ['vie', '<p>Chloé regarde une étoile très lointaine. Sa lumière a voyagé pendant des centaines d’années avant d’arriver dans son œil : Chloé voit l’étoile <b>telle qu’elle était</b> quand cette lumière est partie. Regarder loin dans l’espace, c’est regarder dans le passé.</p>'],
    ['lien', '<p>Tu sais déjà qu’une voiture à 90 km/h parcourt 90 km en 1 h, et qu’on calcule d = v × t. La lumière suit la même règle, seulement ses nombres sont énormes : 300 000 km en 1 <b>seconde</b>. En 2 s : 600 000 km ; pour 384 000 km (la Lune) : 384 000 ÷ 300 000 = <b>1,28 s</b>.</p>'],
  ]);
  E('pc-propagation-son', [
    ['experience', '<p>On pose un réveil qui sonne sous une cloche en verre reliée à une pompe. On aspire l’air petit à petit : le son devient de plus en plus faible, alors qu’on voit toujours le marteau du réveil vibrer. On laisse rentrer l’air : le son revient. Le son a besoin de <b>matière</b> (ici l’air) pour se propager ; la lumière, elle, traverse le vide, puisqu’on voit toujours le réveil.</p>'],
    ['vie', '<p>Pendant un orage, Noah voit l’éclair et compte : « 1, 2, 3, 4, 5, 6… » avant le tonnerre. L’éclair lui arrive presque instantanément, le son met 6 s. Il calcule 340 × 6 = 2 040 m : l’orage est à environ <b>2 km</b>. Si les secondes diminuent d’un éclair à l’autre, l’orage se rapproche !</p>'],
    ['etapes', '<p>Léa crie devant une falaise et entend l’écho 2 s plus tard.</p><ol><li>Je calcule la distance parcourue par le son : 340 × 2 = 680 m.</li><li>Je remarque que le son est allé jusqu’à la falaise <b>et</b> revenu.</li><li>Je divise par 2 : la falaise est à <b>340 m</b>.</li></ol>'],
  ]);
  E('pc-frequence-son', [
    ['dessin', B],
    ['experience', '<p>On tient une règle en plastique sur le bord d’une table, une partie dépassant dans le vide, et on la fait vibrer. Avec une grande partie qui dépasse, elle vibre lentement : le son est <b>grave</b>. On raccourcit la partie qui dépasse : elle vibre beaucoup plus vite, le son devient <b>aigu</b>. Plus il y a de vibrations par seconde, plus la fréquence est élevée.</p>'],
    ['vie', '<p>Le chien de Sam dresse les oreilles alors que Sam n’entend rien : son voisin utilise un sifflet à <b>ultrasons</b> (30 kHz). Le chien entend jusqu’à environ 45 kHz, l’humain seulement jusqu’à 20 kHz. À l’inverse, les éléphants communiquent par <b>infrasons</b>, trop graves pour nous, sous 20 Hz.</p>'],
  ]);
  E('pc-niveau-sonore', [
    ['dessin', `<p>L’échelle des décibels, avec quelques repères :</p>${dbScale()}<p>Dans la zone claire, pas de danger ; à partir de <b>85 dB</b>, l’oreille s’abîme si l’on reste longtemps ; vers <b>120 dB</b>, le son fait mal.</p>`],
    ['vie', '<p>Au concert, Chloé est collée aux enceintes : le sonomètre de son téléphone affiche 105 dB. En sortant, ses oreilles sifflent : c’est un signal d’alerte. La prochaine fois, elle mettra des <b>bouchons d’oreilles</b>, se placera <b>plus loin</b> de la scène et fera des <b>pauses</b> au calme.</p>'],
    ['etapes', '<p>Deux tondeuses de 90 dB travaillent ensemble dans le jardin. Quel niveau sonore ?</p><ol><li>Je ne fais pas 90 + 90 = 180 dB : les décibels ne s’additionnent pas.</li><li>Je retiens que doubler une source identique ajoute environ <b>3 dB</b>.</li><li>Le niveau est d’environ <b>93 dB</b> : au-dessus de 85 dB, je me protège.</li></ol>'],
  ]);
})();
