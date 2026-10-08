// Chapter "Fractions".
(function () {
  'use strict';
  const M = globalThis.M;
  const { fmt, gcd, lcm, div, range } = M.u;
  const { frac, hole } = M.h;
  const { Q, num, choice, fixedChoice } = M.kit;
  const S = M.svg;

  const F = (n, d) => ({ kind: 'fraction', n, d });
  const Fs = (n, d) => ({ kind: 'fraction', n, d, simplified: true });
  const simp = (n, d) => { const g = gcd(n, d); return [n / g, d / g]; };
  const fr = (n, d) => (d === 1 ? fmt(n) : frac(n, d));

  M.notion('frac-partage', {
    lesson: {
      retenir: `Dans la fraction ${frac('a', 'b')}, le <b>dénominateur</b> b (en bas) indique en combien de parts <b>égales</b> on partage l’unité ; le <b>numérateur</b> a (en haut) indique combien de parts on prend.`,
      explication: `<p>${frac(3, 4)} : on partage en 4 parts égales et on en prend 3.</p>${S.fractionBar(3, 4)}<p>${frac(5, 4)} : on prend 5 quarts, c’est plus qu’une unité (${frac(5, 4)} = 1 + ${frac(1, 4)}).</p>${S.fractionBar(5, 4)}`,
      methode: [
        'Compte le nombre de parts égales dans une unité : c’est le dénominateur.',
        'Compte le nombre de parts coloriées (sur toutes les unités) : c’est le numérateur.',
      ],
      exemples: [
        { q: `${S.fractionDisc(2, 6, { r: 40 })}`, r: `2 parts sur 6 : ${frac(2, 6)} (qui est égal à ${frac(1, 3)}).` },
      ],
      erreurs: [
        'Les parts doivent être <b>égales</b> !',
        `Lire « parts coloriées sur parts blanches » : 3 coloriées et 1 blanche, c’est ${frac(3, 4)}, pas ${frac(3, 1)}.`,
      ],
    },
    generate(level, rng) {
      if (level === 3 && rng.chance(0.5)) {
        const d = rng.pick([4, 5, 6, 8, 10]), n = rng.int(1, d - 1), parts = d * rng.int(2, 3);
        return Q(`fpq:${n}/${d}:${parts}`, `Une barre est partagée en ${parts} parts égales. Combien de parts faut-il colorier pour représenter ${frac(n, d)} de la barre ?`, num((parts / d) * n), `${parts} parts, c’est ${parts / d} fois plus de parts que ${d}.`, `${frac(n, d)} = ${frac(n * (parts / d), parts)} → <b>${n * (parts / d)}</b> parts.`);
      }
      const d = level === 1 ? rng.int(2, 8) : rng.int(3, 10);
      const n = level === 1 ? rng.int(1, d - 1) : level === 2 ? rng.int(d + 1, 2 * d - 1) : rng.int(1, d - 1);
      const white = level === 3;
      const fig = level === 1 && rng.chance(0.5) ? S.fractionDisc(n, d, { r: 55 }) : S.fractionBar(n, d);
      const shownN = white ? d - n : n;
      return Q(`fp:${n}/${d}:${white}`, `${fig}Quelle fraction de l’unité est <b>${white ? 'non coloriée' : 'coloriée'}</b> ?`, F(shownN, d),
        'Combien de parts égales dans une unité ? Combien de parts sont concernées ?',
        `Chaque unité est partagée en ${d} parts égales, ${white ? `${shownN} ne sont pas coloriées` : `${n} sont coloriées`} : <b>${frac(shownN, d)}</b>.`);
    },
  });

  M.notion('frac-quotient', {
    lesson: {
      retenir: `${frac('a', 'b')} est le <b>quotient</b> de a par b : c’est le nombre qui, multiplié par b, donne a. <b>b × ${frac('a', 'b')} = a</b>. On a aussi ${frac('a', 'b')} = a ÷ b.`,
      explication: `<p>${frac(7, 4)} = 7 ÷ 4 = <b>1,75</b>. Et 4 × ${frac(7, 4)} = 7.</p><p>${frac(7, 3)} = 7 ÷ 3 = 2,333… n’a pas d’écriture décimale exacte : la fraction est alors la seule écriture exacte.</p><p>${frac(17, 5)} = ${frac(15, 5)} + ${frac(2, 5)} = 3 + ${frac(2, 5)}.</p>`,
      methode: [
        'Pour l’écriture décimale : effectue la division du numérateur par le dénominateur.',
        'Pour trouver le nombre manquant dans b × ? = a : la réponse est la fraction a/b.',
        'Pour décomposer : cherche combien de fois le dénominateur « rentre » dans le numérateur (division euclidienne).',
      ],
      exemples: [
        { q: `${frac(3, 4)} en écriture décimale`, r: '3 ÷ 4 = <b>0,75</b>.' },
        { q: `3 × ${hole} = 7`, r: `${frac(7, 3)}` },
        { q: '2,5 sous forme de fraction', r: `${frac(25, 10)} = ${frac(5, 2)}.` },
      ],
      erreurs: [`${frac(1, 4)} ≠ 1,4 : c’est 1 ÷ 4 = 0,25.`],
    },
    generate(level, rng) {
      if (level === 1) {
        const d = rng.pick([2, 4, 5, 10, 20]);
        let n; do n = rng.int(1, 4 * d); while (n % d === 0);
        const r = div(n, d);
        return Q(`fq:${n}/${d}`, `Écriture décimale de ${frac(n, d)} ?`, num(r), `Calcule ${n} ÷ ${d}.`, `${frac(n, d)} = ${n} ÷ ${d} = <b>${fmt(r)}</b>`);
      }
      if (level === 2) {
        if (rng.chance(0.5)) {
          const b = rng.int(3, 9); let a; do a = rng.int(2, 30); while (a % b === 0);
          return Q(`fqm:${b}:${a}`, `${b} × ${hole} = ${a} <small>(réponse sous forme de fraction)</small>`, F(a, b), `C’est le quotient de ${a} par ${b}.`, `${b} × ${frac(a, b)} = ${a} : la réponse est <b>${frac(a, b)}</b>.`);
        }
        const b = rng.int(3, 12), a = rng.int(2, 30);
        return Q(`fqp:${a}/${b}`, `${b} × ${frac(a, b)} = ?`, num(a), 'Par définition du quotient…', `${b} × ${frac(a, b)} = <b>${a}</b>`);
      }
      if (rng.chance(0.5)) {
        const d = rng.int(3, 9), e = rng.int(1, 6), r = rng.int(1, d - 1), n = e * d + r;
        return Q(`fqd:${n}/${d}`, `${frac(n, d)} = ${hole} + ${frac(r, d)}`, num(e), `Combien de fois ${d} dans ${n} ?`, `${n} = ${d} × ${e} + ${r}, donc ${frac(n, d)} = <b>${e}</b> + ${frac(r, d)}.`);
      }
      const x = rng.pick([0.5, 1.5, 2.5, 0.25, 0.75, 1.25, 0.2, 0.4, 0.6, 3.5, 1.2]);
      const [n, d] = simp(Math.round(x * 100), 100);
      return Q(`fqf:${x}`, `Écris ${fmt(x)} sous forme de fraction.`, F(n, d), `${fmt(x)} = … centièmes`, `${fmt(x)} = ${frac(Math.round(x * 100), 100)} = <b>${frac(n, d)}</b>`);
    },
  });

  M.notion('frac-droite', {
    lesson: {
      retenir: `Pour placer ${frac('a', 'b')} sur une droite graduée : on partage <b>chaque unité</b> en <b>b</b> parts égales, et on compte <b>a</b> parts à partir de 0.`,
      explication: `${S.numberLine({ from: 0, to: 2, major: 1, minor: 3, marks: [{ v: 5 / 3, label: 'A' }] })}<p>Chaque unité est partagée en 3 : une graduation vaut ${frac(1, 3)}. A est à 5 graduations de 0 : son abscisse est ${frac(5, 3)}.</p>`,
      methode: [
        'Compte en combien de parts est partagée une unité (entre 0 et 1) : c’est le dénominateur.',
        'Compte le nombre de graduations de 0 jusqu’au point : c’est le numérateur.',
      ],
      exemples: [
        { q: 'Placer 7/4', r: `Unités partagées en 4 ; on compte 7 quarts : entre 1 et 2, à 3 graduations après 1.` },
      ],
      erreurs: ['Compter à partir de 1 au lieu de 0.'],
    },
    generate(level, rng) {
      const d = level === 1 ? rng.int(2, 5) : rng.int(3, 8), to = level === 1 ? 2 : 3;
      let n; do n = rng.int(1, to * d - 1); while (n % d === 0);
      if (level === 3) {
        const pts = new Set([n]);
        while (pts.size < 4) { const m = rng.int(1, to * d - 1); if (m % d) pts.add(m); }
        const letters = ['A', 'B', 'C', 'D'], vals = rng.shuffle([...pts]);
        const fig = S.numberLine({ from: 0, to, major: 1, minor: d, marks: vals.map((v, i) => ({ v: v / d, label: letters[i] })) });
        return Q(`fdr3:${d}:${vals.join(',')}`, `${fig}Quel point a pour abscisse ${frac(n, d)} ?`, fixedChoice(letters, letters[vals.indexOf(n)]), `Une graduation vaut ${frac(1, d)} : compte ${n} graduations depuis 0.`, `Point <b>${letters[vals.indexOf(n)]}</b> : ${n} graduations de ${frac(1, d)} depuis 0.`);
      }
      const fig = S.numberLine({ from: 0, to, major: 1, minor: d, marks: [{ v: n / d, label: 'A' }] });
      return Q(`fdr:${n}/${d}`, `${fig}Quelle est l’abscisse du point A (sous forme de fraction) ?`, F(n, d), 'En combien de parts est partagée chaque unité ?', `Chaque unité est partagée en ${d} : une graduation vaut ${frac(1, d)}. A est à ${n} graduations de 0 → <b>${frac(n, d)}</b>.`);
    },
  });

  M.notion('frac-egales', {
    lesson: {
      retenir: `On ne change pas une fraction en <b>multipliant</b> (ou en <b>divisant</b>) son numérateur et son dénominateur <b>par le même nombre</b> (non nul) : ${frac(2, 3)} = ${frac('2 × 4', '3 × 4')} = ${frac(8, 12)}. <b>Simplifier</b>, c’est diviser les deux par un même nombre pour obtenir une fraction plus simple.`,
      explication: `${S.fractionBar(2, 3)}${S.fractionBar(8, 12)}<p>Les deux barres ont la même partie coloriée : ${frac(2, 3)} = ${frac(8, 12)}.</p>`,
      methode: [
        'Pour compléter ? : trouve par quel nombre on est passé d’un dénominateur à l’autre (3 → 12 : × 4), et fais pareil au numérateur.',
        'Pour simplifier : cherche un diviseur commun (2, 3, 5… grâce aux critères de divisibilité) et divise les deux. Recommence tant que c’est possible.',
        'Une fraction est simplifiée au maximum quand le seul diviseur commun est 1.',
      ],
      exemples: [
        { q: `${frac(3, 5)} = ${frac('?', 20)}`, r: `5 × 4 = 20, donc 3 × 4 = <b>12</b>.` },
        { q: `Simplifie ${frac(18, 24)}`, r: `÷ 2 : ${frac(9, 12)}, puis ÷ 3 : <b>${frac(3, 4)}</b> (ou directement ÷ 6).` },
      ],
      erreurs: [`Ajouter le même nombre en haut et en bas : ${frac(1, 2)} ≠ ${frac(2, 3)} ! Seules × et ÷ marchent.`],
    },
    generate(level, rng) {
      const d0 = rng.int(2, 9); let n0; do n0 = rng.int(1, 2 * d0); while (gcd(n0, d0) !== 1);
      const k = rng.int(2, level === 1 ? 5 : 9);
      if (level === 1) {
        return Q(`fe1:${n0}/${d0}:${k}`, `${frac(n0, d0)} = ${frac(hole, d0 * k)}`, num(n0 * k), `${d0} × ? = ${d0 * k}`, `${d0} × ${k} = ${d0 * k}, donc ${n0} × ${k} = <b>${n0 * k}</b>.`);
      }
      if (level === 2) {
        if (rng.chance(0.5)) return Q(`fe2:${n0 * k}/${d0 * k}`, `${frac(n0 * k, d0 * k)} = ${frac(hole, d0)}`, num(n0), `${d0 * k} ÷ ? = ${d0}`, `${d0 * k} ÷ ${k} = ${d0}, donc ${n0 * k} ÷ ${k} = <b>${n0}</b>.`);
        return Q(`fe2s:${n0 * k}/${d0 * k}`, `Simplifie au maximum ${frac(n0 * k, d0 * k)}`, Fs(n0, d0), `Divise par ${k} le numérateur et le dénominateur.`, `${frac(n0 * k, d0 * k)} = ${frac(`${n0 * k} ÷ ${k}`, `${d0 * k} ÷ ${k}`)} = <b>${frac(n0, d0)}</b>`);
      }
      if (rng.chance(0.5)) {
        const kk = rng.pick([4, 6, 8, 9, 12, 15]);
        return Q(`fe3s:${n0 * kk}/${d0 * kk}`, `Simplifie au maximum ${frac(n0 * kk, d0 * kk)}`, Fs(n0, d0), 'Utilise les critères de divisibilité, simplifie plusieurs fois si besoin.', `${frac(n0 * kk, d0 * kk)} = ${frac(`${n0 * kk} ÷ ${kk}`, `${d0 * kk} ÷ ${kk}`)} = <b>${frac(n0, d0)}</b>`);
      }
      const good = frac(n0 * k, d0 * k);
      const bads = [[n0 + k, d0 + k], [n0 * k, d0 + k], [n0 + 1, d0 * k], [n0 * k, d0 * k + 1]]
        .filter(([a, b]) => a * d0 !== n0 * b).map(([a, b]) => frac(a, b));
      return Q(`fe3c:${n0}/${d0}:${k}`, `Quelle fraction est égale à ${frac(n0, d0)} ?`, choice(rng, good, bads), 'On multiplie le numérateur ET le dénominateur par le même nombre.', `${frac(n0, d0)} = ${frac(`${n0} × ${k}`, `${d0} × ${k}`)} = <b>${good}</b>`);
    },
  });

  const cmp = (a, b, c, d) => (a * d < b * c ? '<' : a * d > b * c ? '>' : '=');
  M.notion('frac-comparer', {
    lesson: {
      retenir: `<ul><li>Une fraction est <b>plus petite que 1</b> si son numérateur est plus petit que son dénominateur (${frac(3, 5)} &lt; 1), plus grande si c’est l’inverse (${frac(7, 5)} &gt; 1).</li><li>Avec le <b>même dénominateur</b>, la plus grande est celle qui a le plus grand numérateur : ${frac(4, 7)} &lt; ${frac(5, 7)}.</li><li>Sinon, on les écrit d’abord avec le <b>même dénominateur</b>.</li></ul>`,
      methode: [
        'Compare d’abord chaque fraction à 1 : si l’une est plus petite et l’autre plus grande, c’est fini.',
        'Si les dénominateurs sont différents, transforme une des fractions pour avoir le même dénominateur (3/4 = 6/8).',
        'Compare les numérateurs.',
      ],
      exemples: [
        { q: `${frac(3, 4)} … ${frac(5, 8)}`, r: `${frac(3, 4)} = ${frac(6, 8)} et 6 &gt; 5, donc ${frac(3, 4)} <b>&gt;</b> ${frac(5, 8)}.` },
        { q: `${frac(7, 9)} … ${frac(10, 9)}`, r: `${frac(7, 9)} &lt; 1 &lt; ${frac(10, 9)} → <b>&lt;</b>.` },
      ],
      erreurs: [`Comparer seulement les dénominateurs : ${frac(1, 3)} est plus grand que ${frac(1, 4)} (un tiers de pizza est plus gros qu’un quart).`],
    },
    generate(level, rng) {
      let a, b, c, d;
      if (level === 1) {
        if (rng.chance(0.5)) { d = rng.int(2, 12); a = rng.int(1, 2 * d); while (a === d) a = rng.int(1, 2 * d); return Q(`fc1:${a}/${d}`, `Compare : ${frac(a, d)} &nbsp;…&nbsp; 1`, fixedChoice(['<', '=', '>'], a < d ? '<' : '>'), 'Compare le numérateur et le dénominateur.', `${a} ${a < d ? '&lt;' : '&gt;'} ${d}, donc ${frac(a, d)} <b>${a < d ? '&lt;' : '&gt;'}</b> 1.`); }
        b = d = rng.int(3, 12); a = rng.int(1, 2 * b); do c = rng.int(1, 2 * b); while (c === a);
      } else {
        b = rng.int(2, 6); d = b * rng.int(2, level === 2 ? 3 : 4);
        a = rng.int(1, 2 * b); c = rng.int(1, 2 * d);
        if (level === 3 && rng.chance(0.3)) c = a * (d / b);
        if (rng.chance(0.5)) [a, b, c, d] = [c, d, a, b];
      }
      const s = cmp(a, b, c, d), m = lcm(b, d);
      const corr = b === d ? `Même dénominateur : on compare ${a} et ${c}.` : `${frac(a, b)} = ${frac(a * m / b, m)} et ${frac(c, d)} = ${frac(c * m / d, m)}.`;
      return Q(`fc:${a}/${b}:${c}/${d}`, `Compare : ${frac(a, b)} &nbsp;…&nbsp; ${frac(c, d)}`, fixedChoice(['<', '=', '>'], s), b === d ? 'Même dénominateur : compare les numérateurs.' : 'Écris-les avec le même dénominateur.', `${corr} Donc ${frac(a, b)} <b>${s === '<' ? '&lt;' : s === '>' ? '&gt;' : '='}</b> ${frac(c, d)}.`);
    },
  });

  M.notion('frac-somme', {
    lesson: {
      retenir: `Pour additionner (ou soustraire) des fractions de <b>même dénominateur</b>, on additionne (ou soustrait) les <b>numérateurs</b> et on <b>garde</b> le dénominateur : ${frac(2, 7)} + ${frac(3, 7)} = ${frac(5, 7)}. Si les dénominateurs sont différents, on se ramène d’abord au même dénominateur.`,
      explication: `<p>2 septièmes + 3 septièmes = 5 septièmes, comme 2 pommes + 3 pommes = 5 pommes. Le dénominateur est « l’unité de compte » : il ne change pas.</p>`,
      methode: [
        'Si les dénominateurs sont différents, transforme celui qui est plus petit (1/4 = 2/8).',
        'Additionne ou soustrais les numérateurs, garde le dénominateur.',
        'Simplifie le résultat si possible.',
        'Un entier s’écrit aussi comme une fraction : 2 = 8/4.',
      ],
      exemples: [
        { q: `${frac(1, 4)} + ${frac(3, 8)}`, r: `${frac(2, 8)} + ${frac(3, 8)} = <b>${frac(5, 8)}</b>` },
        { q: `1 − ${frac(3, 8)}`, r: `${frac(8, 8)} − ${frac(3, 8)} = <b>${frac(5, 8)}</b>` },
        { q: `2 + ${frac(3, 4)}`, r: `${frac(8, 4)} + ${frac(3, 4)} = <b>${frac(11, 4)}</b>` },
      ],
      erreurs: [`Additionner les dénominateurs : ${frac(1, 4)} + ${frac(1, 4)} ≠ ${frac(2, 8)} ! C’est ${frac(2, 4)} = ${frac(1, 2)}.`],
    },
    generate(level, rng) {
      const res = (n, d) => { const [sn, sd] = simp(n, d); return sd === d ? `<b>${fr(n, d)}</b>` : `${frac(n, d)} = <b>${fr(sn, sd)}</b>`; };
      if (level === 1) {
        const d = rng.int(3, 12), a = rng.int(1, d), b = rng.int(1, d), plus = rng.chance(0.6) || a === b;
        const [x, y] = plus ? [a, b] : [Math.max(a, b), Math.min(a, b)];
        const n = plus ? x + y : x - y;
        return Q(`fs1:${x}${plus ? '+' : '-'}${y}/${d}`, `${frac(x, d)} ${plus ? '+' : '−'} ${frac(y, d)} = ?`, F(n, d), 'Même dénominateur : on ajoute (ou soustrait) les numérateurs.', `${frac(`${x} ${plus ? '+' : '−'} ${y}`, d)} = ${res(n, d)}`);
      }
      if (level === 2) {
        const b = rng.int(2, 6), k = rng.int(2, 3), d = b * k, a = rng.int(1, 2 * b), c = rng.int(1, 2 * d);
        const plus = rng.chance(0.6) || a * k <= c;
        const n = plus ? a * k + c : a * k - c;
        return Q(`fs2:${a}/${b}${plus ? '+' : '-'}${c}/${d}`, `${frac(a, b)} ${plus ? '+' : '−'} ${frac(c, d)} = ?`, F(n, d), `Écris ${frac(a, b)} avec le dénominateur ${d}.`, `${frac(a * k, d)} ${plus ? '+' : '−'} ${frac(c, d)} = ${res(n, d)}`);
      }
      const d = rng.int(2, 9), e = rng.int(1, 3), a = rng.int(1, d - 1);
      if (rng.chance(0.5)) return Q(`fs3:${e}+${a}/${d}`, `${e} + ${frac(a, d)} = ? <small>(une seule fraction)</small>`, F(e * d + a, d), `${e} = ${frac(e * d, d)}`, `${frac(e * d, d)} + ${frac(a, d)} = <b>${frac(e * d + a, d)}</b>`);
      return Q(`fs3:${e}-${a}/${d}`, `${e} − ${frac(a, d)} = ? <small>(une seule fraction)</small>`, F(e * d - a, d), `${e} = ${frac(e * d, d)}`, `${frac(e * d, d)} − ${frac(a, d)} = ${res(e * d - a, d)}`);
    },
  });

  const contexts = [
    (q, n, d) => [`Un paquet contient ${q} bonbons. Léa en mange ${frac(n, d)}. Combien de bonbons mange-t-elle ?`, 'bonbons'],
    (q, n, d) => [`Une classe compte ${q} élèves ; ${frac(n, d)} d’entre eux viennent à vélo. Combien d’élèves viennent à vélo ?`, 'élèves'],
    (q, n, d) => [`Un trajet mesure ${q} km. Hugo en a parcouru ${frac(n, d)}. Combien de km a-t-il parcourus ?`, 'km'],
    (q, n, d) => [`Un jeu coûte ${q} €. Il est remboursé aux ${frac(n, d)}. Combien d’euros sont remboursés ?`, '€'],
  ];
  M.notion('frac-quantite', {
    lesson: {
      retenir: `Prendre ${frac('a', 'b')} d’une quantité, c’est la <b>partager en b</b> parts égales et en <b>prendre a</b>. On calcule : <b>(quantité ÷ b) × a</b>.`,
      explication: `<p>${frac(3, 4)} de 20 : 20 ÷ 4 = 5 (un quart), puis 5 × 3 = <b>15</b>.</p>${S.fractionBar(3, 4)}`,
      methode: [
        'Divise la quantité par le dénominateur (la valeur d’une part).',
        'Multiplie par le numérateur (le nombre de parts prises).',
      ],
      exemples: [
        { q: `${frac(2, 3)} de 45 €`, r: '45 ÷ 3 = 15 ; 15 × 2 = <b>30 €</b>.' },
        { q: `${frac(1, 5)} de 1 h (en minutes)`, r: '60 ÷ 5 = <b>12 min</b>.' },
      ],
      astuces: [`La moitié = ${frac(1, 2)}, le tiers = ${frac(1, 3)}, le quart = ${frac(1, 4)}.`],
      erreurs: [`Multiplier par le dénominateur au lieu de diviser : ${frac(1, 4)} de 20 n’est pas 80.`],
    },
    generate(level, rng) {
      const d = level === 1 ? rng.pick([2, 3, 4, 5, 10]) : rng.int(3, 10);
      const n = level === 1 ? 1 : rng.int(2, d - 1);
      const unit = rng.int(2, level === 3 ? 25 : 12), q = unit * d, r = unit * n;
      const corr = `${q} ÷ ${d} = ${unit}${n > 1 ? ` ; ${unit} × ${n} = ${r}` : ''} → <b>${r}</b>`;
      if (level === 3) {
        const [txt, u] = rng.pick(contexts)(q, n, d);
        return Q(`fqt3:${n}/${d}:${q}:${u}`, txt, num(r, u), `Combien vaut ${frac(1, d)} de ${q} ?`, corr + ` ${u}.`);
      }
      return Q(`fqt:${n}/${d}:${q}`, `${frac(n, d)} de ${q} = ?`, num(r), `Combien vaut ${frac(1, d)} de ${q} ?`, corr);
    },
  });
})();
