// 5e notions: diviser par un décimal, fractions de dénominateurs quelconques,
// divisibilité par 3 et 9, coefficient et graphique de proportionnalité.
(function () {
  'use strict';
  const M = globalThis.M;
  const { fmt, fmtK, dec, decimals, add, mul, div, gcd, lcm, pow10 } = M.u;
  const { frac, table, hole } = M.h;
  const { Q, num, choice, fixedChoice } = M.kit;
  const { svg, text, line, poly } = M.svg.raw;

  const yesNo = b => fixedChoice(['Oui', 'Non'], b ? 'Oui' : 'Non');

  // ===================== DIVISER PAR UN DÉCIMAL =====================
  // a ÷ b written with an integer divisor: (a × 10^k) ÷ (b × 10^k).
  const shifted = (a, b) => { const k = decimals(b); return { k, A: mul(a, pow10(k)), B: mul(b, pow10(k)) }; };
  const shiftText = (a, b) => {
    const { k, A, B } = shifted(a, b);
    return `On multiplie le dividende et le diviseur par ${fmt(pow10(k))} : ${fmt(a)} ÷ ${fmt(b)} = ${fmt(A)} ÷ ${fmt(B)}`;
  };
  // Integers (A, B) with a ÷ b = A ÷ B.
  const asInts = (a, b) => { const K = Math.max(decimals(a), decimals(b)); return [Math.round(a * pow10(K)), Math.round(b * pow10(K))]; };

  M.notion('div-par-decimal', {
    lesson: {
      retenir: `Un quotient <b>ne change pas</b> quand on multiplie le dividende et le diviseur <b>par le même nombre</b> (non nul). Pour diviser par un nombre décimal, on multiplie les deux par 10, 100, 1 000… pour que le <b>diviseur devienne un nombre entier</b>, puis on divise comme d’habitude : 4,8 ÷ 0,6 = 48 ÷ 6 = 8.`,
      explication: `<p>Pourquoi a-t-on le droit ? Le quotient 4,8 ÷ 0,6, c’est le nombre qui, multiplié par 0,6, donne 4,8 : c’est 8, car 0,6 × 8 = 4,8.</p><p>Si on multiplie tout par 10 : 6 × 8 = 48. Le même 8 marche pour 48 ÷ 6. Multiplier les deux nombres par 10, c’est comme compter en dixièmes : « combien de fois 6 dixièmes dans 48 dixièmes ? » → <b>8 fois</b>.</p>`,
      methode: [
        'Compte les chiffres après la virgule du <b>diviseur</b> : 1 chiffre → × 10 ; 2 chiffres → × 100.',
        'Multiplie le dividende <b>et</b> le diviseur par ce même nombre.',
        'Effectue la division par l’entier obtenu (posée si besoin), en plaçant la virgule au quotient.',
        'Vérifie l’ordre de grandeur : diviser par un nombre plus petit que 1 donne un résultat <b>plus grand</b> que le dividende.',
      ],
      exemples: [
        { q: '7,2 ÷ 0,9', r: '× 10 : 72 ÷ 9 = <b>8</b>.' },
        { q: '3 ÷ 0,25', r: '× 100 : 300 ÷ 25 = <b>12</b>.' },
        { q: '2,5 kg de cerises coûtent 9,75 €. Prix d’un kilogramme ?', r: '9,75 ÷ 2,5 = 97,5 ÷ 25 = <b>3,90 €</b>.' },
      ],
      astuces: ['Diviser par 0,5, c’est multiplier par 2 ; diviser par 0,25, c’est multiplier par 4 ; diviser par 0,1, c’est multiplier par 10.'],
      erreurs: [
        'Multiplier seulement le diviseur : 4,8 ÷ 0,6 ≠ 4,8 ÷ 6 ! On multiplie <b>les deux</b> nombres.',
        'Croire qu’une division donne toujours un résultat plus petit : 6 ÷ 0,5 = 12.',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        const b = dec(rng.pick([2, 3, 4, 5, 6, 7, 8, 9, 12, 15, 25]), 1);
        const q = rng.pick([2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15]), a = mul(q, b);
        if (rng.chance(0.4)) {
          const { A, B } = shifted(a, b);
          return Q(`dpd1e:${a}/${b}`, `Complète : ${fmt(a)} ÷ ${fmt(b)} = ${hole} ÷ ${fmt(B)}`, num(A), `Par combien a-t-on multiplié ${fmt(b)} pour obtenir ${fmt(B)} ? Fais pareil pour ${fmt(a)}.`, `${fmt(b)} × 10 = ${fmt(B)}, donc ${fmt(a)} × 10 = <b>${fmt(A)}</b> : ${fmt(a)} ÷ ${fmt(b)} = ${fmt(A)} ÷ ${fmt(B)}.`);
        }
        const { A, B } = shifted(a, b);
        return Q(`dpd1:${a}/${b}`, `${fmt(a)} ÷ ${fmt(b)} = ?`, num(q), 'Multiplie les deux nombres par 10 pour avoir un diviseur entier.', `${shiftText(a, b)} = <b>${fmt(q)}</b>. Vérification : ${fmt(b)} × ${fmt(q)} = ${fmt(a)}.`);
      }
      if (level === 2) {
        if (rng.chance(0.4)) {
          // Price per kg (official example).
          const [item, unit] = rng.pick([['pommes', 'kg'], ['tomates', 'kg'], ['cerises', 'kg'], ['fromage', 'kg'], ['jus d’orange', 'L'], ['essence', 'L']]);
          let m; do m = rng.int(12, 48); while (m % 10 === 0);
          m = dec(m, 1);
          const p = dec(rng.int(12, 60), 1), tot = mul(m, p);
          const uw = unit === 'kg' ? 'kilogramme' : 'litre';
          const of = /^[aeiouéj]/.test(item) && item !== 'jus d’orange' ? 'd’' : 'de ';
          return Q(`dpd2p:${m}:${p}:${item}`, `${fmt(m)} ${unit} ${of}${item} coûtent ${fmtK(tot, 2)} €. Quel est le prix d’un ${uw} (en €) ?`, num(p, '€'), `Le prix d’un ${uw} s’obtient par une division. Rends le diviseur entier.`, `Prix d’un ${uw} : ${fmtK(tot, 2)} ÷ ${fmt(m)}. ${shiftText(tot, m)} = <b>${fmt(p)}</b> €.`);
        }
        let b, q;
        if (rng.chance(0.5)) { b = dec(rng.pick([25, 5, 4, 12, 15, 75, 125, 2, 35, 45]), 2); q = rng.int(2, 40); }
        else { b = dec(rng.pick([2, 4, 5, 6, 8, 12, 15, 16, 24, 25]), 1); q = dec(rng.int(11, 99), 1); }
        const a = mul(b, q);
        return Q(`dpd2:${a}/${b}`, `${fmt(a)} ÷ ${fmt(b)} = ?`, num(q), `Combien de chiffres après la virgule dans ${fmt(b)} ? Multiplie les deux nombres en conséquence.`, `${shiftText(a, b)} = <b>${fmt(q)}</b>. Vérification : ${fmt(b)} × ${fmt(q)} = ${fmt(a)}.`);
      }
      // Level 3: rounded quotient, or a problem.
      const r = rng.next();
      if (r < 0.4) {
        const p = rng.int(1, 2), lab = p === 1 ? 'au dixième' : 'au centième';
        let a, b;
        do { a = dec(rng.int(10, 999), rng.int(0, 1)); b = dec(rng.pick([3, 6, 7, 9, 11, 12, 13, 21, 14]), rng.pick([1, 1, 2])); } while (div(a, b, p + 2) !== null);
        const [Ai, Bi] = asInts(a, b);
        const val = dec(Math.floor((2 * Ai * pow10(p) + Bi) / (2 * Bi)), p);
        const approx = dec(Math.floor((Ai * pow10(p + 2)) / Bi), p + 2);
        const { A, B } = shifted(a, b);
        return Q(`dpd3r:${a}/${b}:${p}`, `Donne l’arrondi ${lab} de ${fmt(a)} ÷ ${fmt(b)}.`, num(val), 'Rends d’abord le diviseur entier, puis calcule un chiffre de plus que la précision demandée.', `${fmt(a)} ÷ ${fmt(b)} = ${fmt(A)} ÷ ${fmt(B)} = ${fmtK(approx, p + 2)}… donc l’arrondi ${lab} est <b>${fmt(val)}</b>.`);
      }
      if (r < 0.7) {
        const [what, cont] = rng.pick([['jus', 'bouteilles de'], ['eau', 'gourdes de'], ['sirop', 'flacons de'], ['lait', 'pichets de']]);
        const size = dec(rng.pick([75, 25, 33, 15, 35, 40, 60, 45, 125, 150]), 2);
        let T, n, Ti, Si;
        do { T = dec(rng.int(30, 250), rng.int(0, 1)); [Ti, Si] = asInts(T, size); n = Math.floor(Ti / Si); } while (Ti % Si === 0 || n < 3);
        const exact = div(T, size, 6), approx = dec(Math.floor((Ti * 100) / Si), 2);
        return Q(`dpd3b:${T}:${size}:${what}`, `On a ${fmt(T)} L de ${what}. Combien de ${cont} ${fmt(size)} L peut-on remplir <b>entièrement</b> ?`, num(n), 'Combien de fois la contenance d’un récipient dans la quantité totale ? Attention, la réponse est un nombre entier.', `${fmt(T)} ÷ ${fmt(size)} = ${fmt(shifted(T, size).A)} ÷ ${fmt(shifted(T, size).B)} ${exact !== null ? `= ${fmt(exact)}` : `≈ ${fmtK(approx, 2)}…`} On peut remplir entièrement <b>${fmt(n)}</b> récipients (le dernier ne serait pas plein).`);
      }
      // Price per kg rounded to the cent.
      let m, tot, Ti, Mi;
      do { m = dec(rng.int(12, 49), 1); tot = dec(rng.int(30, 200), rng.int(0, 1)); [Ti, Mi] = asInts(tot, m); } while (m % 1 === 0 || div(tot, m, 3) !== null);
      const val = dec(Math.floor((2 * Ti * 100 + Mi) / (2 * Mi)), 2);
      const approx = dec(Math.floor((Ti * 10000) / Mi), 4);
      return Q(`dpd3p:${tot}:${m}`, `Un sac de ${fmt(m)} kg de pommes de terre coûte ${fmtK(tot, 2)} €. Quel est le prix d’un kilogramme, arrondi au centime ?`, num(val, '€'), 'Divise le prix par la masse, puis arrondis au centième (au centime).', `${fmtK(tot, 2)} ÷ ${fmt(m)} = ${fmt(shifted(tot, m).A)} ÷ ${fmt(shifted(tot, m).B)} ≈ ${fmtK(approx, 4)}… → environ <b>${fmt(val)}</b> € le kg.`);
    },
  });

  // ===================== FRACTIONS DE DÉNOMINATEURS QUELCONQUES =====================
  const F = (n, d) => ({ kind: 'fraction', n, d });
  const simp = (n, d) => { const g = gcd(n, d); return [n / g, d / g]; };
  const fr = (n, d) => (d === 1 ? fmt(n) : frac(n, d));
  const res = (n, d) => { const [sn, sd] = simp(n, d); return sd === d ? `<b>${fr(n, d)}</b>` : `${frac(n, d)} = <b>${fr(sn, sd)}</b>`; };
  // Numerator in [lo, hi] making an irreducible fraction n/d that is not an integer.
  const irr = (rng, lo, hi, d) => { let n; do n = rng.int(lo, hi); while (gcd(n, d) !== 1 || n % d === 0); return n; };
  const to = (n, d, m) => (d === m ? frac(n, d) : `${frac(`${n} × ${m / d}`, `${d} × ${m / d}`)}`);

  M.notion('frac-somme-5e', {
    lesson: {
      retenir: `Pour additionner ou soustraire deux fractions de dénominateurs <b>quelconques</b>, on les écrit d’abord avec un <b>dénominateur commun</b> : un <b>multiple commun</b> des deux dénominateurs (le produit des deux convient toujours ; le plus petit est plus pratique). Ensuite on additionne (ou soustrait) les numérateurs et on garde ce dénominateur : ${frac(2, 5)} + ${frac(1, 4)} = ${frac(8, 20)} + ${frac(5, 20)} = ${frac(13, 20)}.`,
      explication: `<p>Peut-on ajouter des cinquièmes et des quarts ? Pas directement, ce ne sont pas les mêmes « parts ». Il faut découper l’unité en parts qui conviennent aux deux : 20 parts, car 20 est un multiple de 5 et de 4.</p>${M.svg.fractionBar(8, 20, { w: 320, h: 26 })}${M.svg.fractionBar(5, 20, { w: 320, h: 26 })}<p>${frac(2, 5)} = ${frac(8, 20)} et ${frac(1, 4)} = ${frac(5, 20)}. Maintenant on compte des vingtièmes : 8 + 5 = 13 vingtièmes.</p>`,
      methode: [
        'Cherche un multiple commun aux deux dénominateurs : récite la table du plus grand jusqu’à trouver un multiple du plus petit (pour 6 et 4 : 6, 12 → 12). À défaut, prends le produit.',
        'Transforme chaque fraction : multiplie son numérateur et son dénominateur par le même nombre.',
        'Additionne ou soustrais les numérateurs, garde le dénominateur commun.',
        'Simplifie le résultat si c’est possible.',
        'Pour comparer deux fractions, on fait pareil : même dénominateur, puis on compare les numérateurs.',
      ],
      exemples: [
        { q: `${frac(5, 6)} − ${frac(3, 4)}`, r: `Dénominateur commun 12 : ${frac(10, 12)} − ${frac(9, 12)} = <b>${frac(1, 12)}</b>.` },
        { q: `${frac(2, 3)} + ${frac(1, 2)}`, r: `${frac(4, 6)} + ${frac(3, 6)} = <b>${frac(7, 6)}</b>.` },
        { q: `Compare ${frac(3, 4)} et ${frac(5, 7)}`, r: `${frac(21, 28)} et ${frac(20, 28)} : ${frac(3, 4)} <b>&gt;</b> ${frac(5, 7)}.` },
      ],
      astuces: ['Avec le produit des dénominateurs, ça marche toujours ; avec le plus petit multiple commun (le PPCM), les nombres restent plus petits.'],
      erreurs: [
        `Additionner les numérateurs entre eux et les dénominateurs entre eux : ${frac(1, 2)} + ${frac(1, 3)} ≠ ${frac(2, 5)} ! C’est ${frac(3, 6)} + ${frac(2, 6)} = ${frac(5, 6)}.`,
        'Changer le dénominateur sans changer le numérateur : on multiplie toujours <b>les deux</b> par le même nombre.',
      ],
    },
    generate(level, rng) {
      const sum = (a, b, c, d, plus) => {
        const m = lcm(b, d), n = plus ? a * (m / b) + c * (m / d) : a * (m / b) - c * (m / d);
        const op = plus ? '+' : '−';
        const corr = `Dénominateur commun : ${m}. ${frac(a, b)} ${op} ${frac(c, d)} = ${to(a, b, m)} ${op} ${to(c, d, m)} = ${frac(a * (m / b), m)} ${op} ${frac(c * (m / d), m)} = ${res(n, m)}`;
        return { n, m, corr, op };
      };
      if (level === 1) {
        const [b, d] = rng.shuffle(rng.pick([[2, 3], [2, 5], [3, 4], [3, 5], [4, 5], [2, 7], [3, 7], [5, 6], [2, 9], [4, 7]]));
        const a = irr(rng, 1, b - 1, b), c = irr(rng, 1, d - 1, d);
        let plus = rng.chance(0.6);
        if (!plus && a * d <= c * b) plus = true;
        const { n, m, corr, op } = sum(a, b, c, d, plus);
        return Q(`fq1:${a}/${b}${op}${c}/${d}`, `${frac(a, b)} ${op} ${frac(c, d)} = ?`, F(n, m), `Quel nombre est à la fois un multiple de ${b} et de ${d} ?`, corr);
      }
      if (level === 2) {
        const [b, d] = rng.shuffle(rng.pick([[4, 6], [6, 8], [6, 9], [4, 10], [6, 10], [8, 12], [9, 12], [10, 15], [6, 15], [8, 10], [12, 18], [4, 14]]));
        const a = irr(rng, 1, b + 2, b), c = irr(rng, 1, d - 1, d);
        if (rng.chance(0.4)) {
          const s = a * d < c * b ? '<' : a * d > c * b ? '>' : '=', m = lcm(b, d);
          const sym = { '<': '&lt;', '>': '&gt;', '=': '=' }[s];
          return Q(`fq2c:${a}/${b}:${c}/${d}`, `Compare : ${frac(a, b)} &nbsp;…&nbsp; ${frac(c, d)}`, fixedChoice(['<', '=', '>'], s), 'Écris les deux fractions avec un même dénominateur.', `Dénominateur commun ${m} : ${frac(a, b)} = ${frac(a * m / b, m)} et ${frac(c, d)} = ${frac(c * m / d, m)}. Donc ${frac(a, b)} <b>${sym}</b> ${frac(c, d)}.`);
        }
        let plus = rng.chance(0.55);
        if (!plus && a * d <= c * b) plus = true;
        const { n, m, corr, op } = sum(a, b, c, d, plus);
        return Q(`fq2:${a}/${b}${op}${c}/${d}`, `${frac(a, b)} ${op} ${frac(c, d)} = ?`, F(n, m), `Cherche le plus petit multiple commun de ${b} et ${d}.`, corr);
      }
      // Level 3: problem (what remains of the whole) or three terms.
      if (rng.chance(0.5)) {
        const ctx = rng.pick([
          (p, q) => [`Pendant une journée, Sam passe ${p} du temps à dormir et ${q} au collège.`, 'Quelle fraction de la journée lui reste-t-il pour ses autres activités ?', 'de la journée'],
          (p, q) => [`Dans un jardin, ${p} de la surface est occupée par la pelouse et ${q} par le potager. Le reste est fleuri.`, 'Quelle fraction du jardin est fleurie ?', 'du jardin'],
          (p, q) => [`Lors d’un trajet, Inès fait ${p} du chemin à vélo et ${q} en bus. Elle termine à pied.`, 'Quelle fraction du trajet fait-elle à pied ?', 'du trajet'],
          (p, q) => [`Dans une classe, ${p} des élèves pratiquent le football, ${q} le basket, et chaque autre élève pratique la natation (un seul sport chacun).`, 'Quelle fraction des élèves pratique la natation ?', 'des élèves'],
        ]);
        let b, d, a, c;
        do {
          [b, d] = rng.sample([2, 3, 4, 5, 6, 8, 10, 12], 2);
          a = irr(rng, 1, b - 1, b); c = irr(rng, 1, d - 1, d);
        } while (a * d + c * b >= b * d || ((b % d === 0 || d % b === 0) && rng.chance(0.7)));
        const m = lcm(b, d), n = m - a * (m / b) - c * (m / d);
        const [intro, question] = ctx(frac(a, b), frac(c, d));
        return Q(`fq3p:${a}/${b}:${c}/${d}:${intro.slice(0, 12)}`, `${intro} ${question}`, F(n, m), 'Le tout correspond à 1. Additionne les deux fractions, puis cherche ce qu’il manque pour aller jusqu’à 1.', `Dénominateur commun ${m} : ${frac(a, b)} + ${frac(c, d)} = ${frac(a * m / b, m)} + ${frac(c * m / d, m)} = ${frac(m - n, m)}. Il reste 1 − ${frac(m - n, m)} = ${frac(m, m)} − ${frac(m - n, m)} = ${res(n, m)}.`);
      }
      let b, d, f, a, c, e, m, n;
      do {
        [b, d, f] = rng.sample([2, 3, 4, 5, 6, 8, 9, 10, 12], 3);
        a = irr(rng, 1, b + 1, b); c = irr(rng, 1, d - 1, d); e = irr(rng, 1, f - 1, f);
        m = lcm(lcm(b, d), f); n = a * (m / b) + c * (m / d) - e * (m / f);
      } while (n < 0 || m > 72);
      return Q(`fq3:${a}/${b}+${c}/${d}-${e}/${f}`, `${frac(a, b)} + ${frac(c, d)} − ${frac(e, f)} = ?`, F(n, m), `Cherche un multiple commun à ${b}, ${d} et ${f}.`, `Dénominateur commun ${m} : ${frac(a * m / b, m)} + ${frac(c * m / d, m)} − ${frac(e * m / f, m)} = ${res(n, m)}`);
    },
  });

  // ===================== DIVISIBILITÉ PAR 3 ET 9 =====================
  const digits = n => String(n).split('').map(Number);
  const dsum = n => digits(n).reduce((s, x) => s + x, 0);
  const sumText = n => `${digits(n).join(' + ')} = ${dsum(n)}`;
  // A random integer in [lo, hi] passing `test` (rejection sampling).
  const pickMod = (rng, lo, hi, test) => { let x; do x = rng.int(lo, hi); while (!test(x)); return x; };
  const plain = n => fmt(n);

  M.notion('divisibilite-3-9', {
    lesson: {
      retenir: `Un nombre entier est divisible :<ul><li>par <b>3</b> si la <b>somme de ses chiffres</b> est divisible par 3 ;</li><li>par <b>9</b> si la <b>somme de ses chiffres</b> est divisible par 9.</li></ul>Exemple : 4 572 → 4 + 5 + 7 + 2 = 18, qui est dans la table de 9 : 4 572 est divisible par 9 (et donc aussi par 3).`,
      explication: `<p>Pourquoi la somme des chiffres ? Parce que 10 = 9 + 1, 100 = 99 + 1, 1 000 = 999 + 1… et 9, 99, 999 sont divisibles par 3 et par 9.</p><p>Ainsi 372 = 3 × 100 + 7 × 10 + 2 = 3 × 99 + 7 × 9 + (<b>3 + 7 + 2</b>). Les deux premiers morceaux sont dans la table de 9 ; il reste à regarder la somme des chiffres 3 + 7 + 2 = 12 : divisible par 3, pas par 9. Donc 372 est divisible par 3, pas par 9.</p>`,
      methode: [
        'Additionne tous les chiffres du nombre.',
        'Si la somme est encore grande, tu peux recommencer avec ses chiffres (18 → 1 + 8 = 9).',
        'Regarde si la somme est dans la table de 3, de 9.',
        'Pour 2, 5 et 10, on regarde seulement le chiffre des unités ; pour 3 et 9, on regarde <b>tous</b> les chiffres.',
      ],
      exemples: [
        { q: '2 715 est-il divisible par 3 ? par 9 ?', r: '2 + 7 + 1 + 5 = 15 : dans la table de 3, pas dans celle de 9 → divisible par <b>3</b>, <b>pas par 9</b>.' },
        { q: '81 954 est-il divisible par 9 ?', r: '8 + 1 + 9 + 5 + 4 = 27 = 9 × 3 → <b>oui</b>.' },
        { q: 'Quel chiffre écrire dans 5 ? 1 pour obtenir un multiple de 9 ?', r: '5 + 1 = 6 ; il faut arriver à 9 : le chiffre <b>3</b> (531).' },
      ],
      astuces: ['Un nombre divisible par 9 est toujours divisible par 3, mais pas l’inverse (12 est divisible par 3, pas par 9).', 'L’ordre des chiffres ne compte pas : 372, 237 et 723 ont la même somme de chiffres.'],
      erreurs: ['Regarder le chiffre des unités : 13 et 23 se terminent par 3 mais ne sont pas divisibles par 3 ; 27 se termine par 7 et il l’est !'],
    },
    generate(level, rng) {
      if (level === 1) {
        const d = rng.chance(0.75) ? 3 : 9, yes = rng.chance(0.5);
        const n = pickMod(rng, d === 3 ? 20 : 100, 999, x => (x % d === 0) === yes);
        return Q(`d391:${n}:${d}`, `${plain(n)} est-il divisible par ${d} ?`, yesNo(yes), 'Additionne tous ses chiffres.', `${sumText(n)}. ${dsum(n)} ${yes ? 'est' : 'n’est pas'} dans la table de ${d}, donc ${plain(n)} <b>${yes ? 'est' : 'n’est pas'}</b> divisible par ${d}.`);
      }
      if (level === 2) {
        const opts = ['Il est divisible par 3 et par 9.', 'Il est divisible par 3, mais pas par 9.', 'Il n’est divisible ni par 3 ni par 9.'];
        const says = ['est divisible par 3 et par 9', 'est divisible par 3, mais pas par 9', 'n’est divisible ni par 3 ni par 9'];
        const cat = rng.int(0, 2);
        const n = pickMod(rng, 1000, 99999, x => (cat === 0 ? x % 9 === 0 : cat === 1 ? x % 3 === 0 && x % 9 !== 0 : x % 3 !== 0));
        const s = dsum(n);
        const why = cat === 0 ? `${s} est dans la table de 9 (donc aussi de 3)` : cat === 1 ? `${s} est dans la table de 3 mais pas dans celle de 9` : `${s} n’est pas dans la table de 3 (donc pas non plus dans celle de 9)`;
        return Q(`d392:${n}`, `Que peut-on dire du nombre ${plain(n)} ?`, fixedChoice(opts, opts[cat]), 'Calcule la somme des chiffres et compare-la aux tables de 3 et de 9.', `${sumText(n)} : ${why}. Donc ${plain(n)} <b>${says[cat]}</b>.`);
      }
      // Level 3: missing digit, or mixed criteria (2, 5, 10 with 3, 9).
      if (rng.chance(0.45)) {
        const d = rng.chance(0.5) ? 9 : 3;
        let ds, pos, rest;
        do {
          ds = digits(rng.int(1000, 9999));
          pos = rng.int(1, 3);
          rest = ds.reduce((s, x, i) => (i === pos ? s : s + x), 0);
        } while (d === 9 && rest % 9 === 0);
        const ans = (d - (rest % d)) % d;
        const shown = ds.map((x, i) => (i === pos ? hole : x)).join('');
        const all = [];
        for (let k = ans; k <= 9; k += d) all.push(k);
        const ask = d === 9 ? `Quel chiffre faut-il écrire à la place de ${hole} pour que le nombre soit divisible par 9 ?` : `Quel est le <b>plus petit</b> chiffre que l’on peut écrire à la place de ${hole} pour que le nombre soit divisible par 3 ?`;
        return Q(`d393m:${ds.join('')}:${pos}:${d}`, `Le nombre <b>${shown}</b> est incomplet. ${ask}`, num(ans), `Additionne les chiffres connus, puis cherche ce qu’il faut ajouter pour tomber dans la table de ${d}.`, `Somme des chiffres connus : ${rest}. ${rest} + ${ans} = ${rest + ans}, qui est dans la table de ${d}.${d === 3 && all.length > 1 ? ` Les chiffres possibles sont ${all.join(', ')} : le plus petit est <b>${fmt(ans)}</b>.` : ` Le chiffre est <b>${fmt(ans)}</b>.`}`);
      }
      const [p, q] = rng.pick([[3, 5], [9, 2], [9, 5], [3, 10], [3, 2], [9, 10]]);
      const has = (x, k) => x % k === 0;
      const good = pickMod(rng, 100, 9999, x => has(x, p) && has(x, q));
      const bads = new Set();
      const kinds = [x => has(x, p) && !has(x, q), x => !has(x, p) && has(x, q), x => !has(x, p) && !has(x, q) && (x % 10 === p % 10 || x % 10 === q % 10 || has(x, p === 9 ? 3 : 2))];
      kinds.forEach(t => { let x; do x = rng.int(100, 9999); while (!t(x) || bads.has(x) || x === good); bads.add(x); });
      const crit = k => ({ 2: 'son chiffre des unités est pair', 5: 'il se termine par 0 ou 5', 10: 'il se termine par 0', 3: `la somme de ses chiffres (${dsum(good)}) est dans la table de 3`, 9: `la somme de ses chiffres (${dsum(good)}) est dans la table de 9` })[k];
      return Q(`d393c:${p}:${q}:${good}:${[...bads]}`, `Lequel de ces nombres est divisible <b>à la fois</b> par ${p} et par ${q} ?`, choice(rng, plain(good), [...bads].map(plain)), `Vérifie les deux critères pour chaque nombre : ${p === 3 || p === 9 ? 'somme des chiffres' : 'chiffre des unités'} et ${q === 3 || q === 9 ? 'somme des chiffres' : 'chiffre des unités'}.`, `<b>${plain(good)}</b> : ${crit(p)} et ${crit(q)}. Chacun des autres nombres échoue à au moins un des deux critères.`);
    },
  });

  // ===================== COEFFICIENT ET GRAPHIQUE DE PROPORTIONNALITÉ =====================
  // Simple cartesian graph. pts: [[x, y]], grid every xstep / ystep, labels on every grid line.
  function graph({ pts, xmax, ymax, xstep, ystep, xlab = '', ylab = '', join = false, through0 = false, read }) {
    const ox = 50, oy = 200, gw = 250, gh = 160;
    const X = x => ox + (x / xmax) * gw, Y = y => oy - (y / ymax) * gh;
    let b = '';
    const nx = Math.round(xmax / xstep), ny = Math.round(ymax / ystep);
    for (let i = 1; i <= nx; i++) { const v = mul(i, xstep); b += line(X(v), oy, X(v), Y(ymax), 's-grid') + text(X(v), oy + 18, fmt(v), { size: 12 }); }
    for (let j = 1; j <= ny; j++) { const v = mul(j, ystep); b += line(ox, Y(v), X(xmax), Y(v), 's-grid') + text(ox - 7, Y(v) + 4, fmt(v), { anchor: 'end', size: 12 }); }
    b += line(ox, oy, X(xmax) + 16, oy) + poly([[X(xmax) + 16, oy - 5], [X(xmax) + 24, oy], [X(xmax) + 16, oy + 5]], 's-solid');
    b += line(ox, oy, ox, Y(ymax) - 16) + poly([[ox - 5, Y(ymax) - 16], [ox, Y(ymax) - 24], [ox + 5, Y(ymax) - 16]], 's-solid');
    b += text(ox - 7, oy + 18, '0', { anchor: 'end', size: 12 });
    b += text(318, oy + 38, xlab, { anchor: 'end', size: 13, cls: 's-text s-bold' });
    b += text(ox + 8, Y(ymax) - 18, ylab, { anchor: 'start', size: 13, cls: 's-text s-bold' });
    if (join && pts.length > 1) {
      const xs = pts.map(p => p[0]), x0 = through0 ? 0 : Math.min(...xs), x1 = Math.max(...xs);
      const slope = (pts[1][1] - pts[0][1]) / (pts[1][0] - pts[0][0]), y0 = pts[0][1] - slope * pts[0][0];
      b += line(X(x0), Y(y0 + slope * x0), X(x1), Y(y0 + slope * x1), 's-accent-line');
    }
    if (read) b += line(X(read[0]), oy, X(read[0]), Y(read[1]), 's-line s-dash') + line(ox, Y(read[1]), X(read[0]), Y(read[1]), 's-line s-dash');
    pts.forEach(([x, y]) => { b += `<circle cx="${X(x).toFixed(1)}" cy="${Y(y).toFixed(1)}" r="5" class="s-accent"/>`; });
    return svg(320, 250, b, 'graph');
  }
  // Grid step so that the axis has at most 8 graduations.
  const niceStep = maxV => [1, 2, 5, 10, 20, 25, 50, 100].find(s => maxV / s <= 8);
  const ptable = (head, r1, r2) => table([[head[0], ...r1], [head[1], ...r2]], { head: false, cls: 'prop' });
  const mover = v => (v <= 6 ? 'Une randonneuse' : v <= 30 ? 'Un cycliste' : v <= 60 ? 'Un bus' : 'Une voiture');
  const pt = (x, y) => `(${fmt(x)} ; ${fmt(y)})`;

  const readCtx = [
    { xl: 'Masse (kg)', yl: 'Prix (€)', ks: [2, 3, 4, 5], ask: x => `le prix de ${fmt(x)} kg`, back: y => `la masse achetée pour ${fmt(y)} €`, ux: 'kg', uy: '€' },
    { xl: 'Durée (h)', yl: 'Distance (km)', ks: [10, 15, 20, 25], ask: x => `la distance parcourue en ${fmt(x)} h`, back: y => `la durée nécessaire pour parcourir ${fmt(y)} km`, ux: 'h', uy: 'km' },
    { xl: 'Volume (L)', yl: 'Masse (kg)', ks: [2, 3, 4], ask: x => `la masse de ${fmt(x)} L de sable`, back: y => `le volume de sable qui pèse ${fmt(y)} kg`, ux: 'L', uy: 'kg' },
    { xl: 'Nombre de places', yl: 'Prix (€)', ks: [5, 10, 15], ask: x => `le prix de ${fmt(x)} places de concert`, back: y => `le nombre de places achetées pour ${fmt(y)} €`, ux: '', uy: '€' },
  ];

  M.notion('proportionnalite-5e', {
    lesson: {
      retenir: `<ul><li>Quand deux grandeurs sont proportionnelles, on passe de l’une à l’autre en multipliant par un même nombre : le <b>coefficient de proportionnalité</b>. Ce peut être un <b>prix unitaire</b> (€ par kg), une <b>vitesse moyenne</b> (km par heure), une <b>échelle</b>…</li><li>Dans un repère, une situation de proportionnalité est représentée par des <b>points alignés avec l’origine</b> du repère. Réciproquement, si les points sont alignés avec l’origine, c’est une situation de proportionnalité.</li><li>Un <b>pourcentage</b> est une proportion écrite « sur 100 » : 6 sur 24, c’est ${frac(6, 24)} = ${frac(25, 100)} = 25 %.</li></ul>`,
      explication: `<p>Des pommes à 3 € le kg : le prix est proportionnel à la masse, de coefficient 3.</p>${ptable(['Masse (kg)', 'Prix (€)'], [1, 2, 4, 5], [3, 6, 12, 15])}${graph({ pts: [[1, 3], [2, 6], [4, 12], [5, 15]], xmax: 6, ymax: 18, xstep: 1, ystep: 3, xlab: 'Masse (kg)', ylab: 'Prix (€)', join: true, through0: true, read: [4, 12] })}<p>Les points sont <b>alignés</b> sur une droite qui passe par l’<b>origine</b> (0 kg → 0 €). On lit par exemple que 4 kg coûtent 12 €.</p>`,
      methode: [
        'Pour trouver le coefficient : divise une valeur de la 2<sup>e</sup> grandeur par la valeur correspondante de la 1<sup>re</sup> (prix ÷ masse, distance ÷ durée).',
        'Pour utiliser le coefficient : multiplie (masse × prix unitaire, durée × vitesse).',
        'Sur un graphique : vérifie que les points sont alignés <b>et</b> que la droite passe par l’origine. Les deux conditions sont nécessaires.',
        'Pour lire un graphique : pars de la valeur sur un axe, monte (ou va à droite) jusqu’au point, puis lis sur l’autre axe.',
        'Pour un pourcentage : écris la proportion sous forme de fraction, puis cherche la fraction égale de dénominateur 100.',
      ],
      exemples: [
        { q: 'Une voiture parcourt 180 km en 2 h à vitesse constante. Vitesse moyenne ? Distance en 3 h ?', r: '180 ÷ 2 = <b>90 km/h</b> (coefficient). En 3 h : 3 × 90 = <b>270 km</b>.' },
        { q: 'Les tomates coûtent 2,40 € le kg. Prix de 4,3 kg ?', r: '4,3 × 2,40 = <b>10,32 €</b>.' },
        { q: 'Élection : Chloé a 12 voix sur 24. Pourcentage ?', r: `${frac(12, 24)} = ${frac(1, 2)} = ${frac(50, 100)} → <b>50 %</b>.` },
      ],
      astuces: ['La vitesse moyenne se calcule avec une durée en heures : 30 min = 0,5 h ; 15 min = 0,25 h. Ou par linéarité : 15 min, c’est 4 fois moins qu’une heure.'],
      erreurs: [
        'Croire que des points alignés suffisent : si la droite ne passe pas par l’origine, ce n’est <b>pas</b> proportionnel (exemple : un abonnement + un prix par séance).',
        'Diviser dans le mauvais sens : un prix au kg, c’est prix ÷ masse, pas masse ÷ prix.',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        if (rng.chance(0.5)) {
          const c = rng.pick(readCtx), k = rng.pick(c.ks), xmax = 6;
          const xs = rng.sample([1, 2, 3, 4, 5, 6], 3).sort((a, b) => a - b), pts = xs.map(x => [x, x * k]);
          const i = rng.int(0, 2), [x, y] = pts[i];
          const fig = graph({ pts, xmax, ymax: k * xmax, xstep: 1, ystep: k, xlab: c.xl, ylab: c.yl, join: true, through0: true });
          if (rng.chance(0.5)) return Q(`p5g1:${c.xl}:${k}:${xs}:${i}`, `${fig}Ce graphique représente une situation de proportionnalité. Lis ${c.ask(x)}.`, num(y, c.uy || undefined), `Pars de ${fmt(x)} sur l’axe horizontal, monte jusqu’au point, puis lis sur l’axe vertical.`, `Le point d’abscisse ${fmt(x)} a pour ordonnée ${fmt(y)} : ${c.ask(x)} est <b>${fmt(y)}</b>${c.uy ? ' ' + c.uy : ''}.`);
          return Q(`p5g1b:${c.xl}:${k}:${xs}:${i}`, `${fig}Ce graphique représente une situation de proportionnalité. Lis ${c.back(y)}.`, num(x, c.ux || undefined), `Pars de ${fmt(y)} sur l’axe vertical, va jusqu’au point, puis lis sur l’axe horizontal.`, `Le point d’ordonnée ${fmt(y)} a pour abscisse ${fmt(x)} : ${c.back(y)} est <b>${fmt(x)}</b>${c.ux ? ' ' + c.ux : ''}.`);
        }
        if (rng.chance(0.5)) {
          const v = rng.pick([4, 5, 12, 15, 18, 20, 45, 50, 60, 70, 80, 90]), t = rng.int(2, 5), d = v * t;
          const who = mover(v);
          return Q(`p5v1:${v}:${t}`, `${who} parcourt ${fmt(d)} km en ${t} h, à vitesse constante. Quelle est sa vitesse moyenne (en km/h) ?`, num(v, 'km/h'), 'La vitesse moyenne, c’est la distance parcourue en 1 heure.', `En 1 h : ${fmt(d)} ÷ ${t} = <b>${fmt(v)}</b> km/h. C’est le coefficient de proportionnalité entre la durée et la distance.`);
        }
        const [item, unit] = rng.pick([['cahiers', 'cahier'], ['places de cinéma', 'place'], ['croissants', 'croissant'], ['stylos', 'stylo']]);
        const p = dec(rng.int(3, 30) * 5, 2), n = rng.int(3, 8), tot = mul(p, n);
        return Q(`p5u1:${item}:${p}:${n}`, `${n} ${item} coûtent ${fmtK(tot, 2)} €. Quel est le prix unitaire (le prix d’un ${unit}) en € ?`, num(p, '€'), `Le prix d’un seul objet : partage le prix total en ${n}.`, `${fmtK(tot, 2)} ÷ ${n} = <b>${fmt(p)}</b> € : c’est le coefficient qui permet de passer du nombre de ${item} au prix.`);
      }
      if (level === 2) {
        const r = rng.next();
        if (r < 0.4) {
          // Recognise proportionality on a graph.
          const type = rng.pick(['prop', 'prop', 'prop', 'affine', 'curve', 'outlier']);
          const k = rng.int(1, 4), xs = rng.sample([1, 2, 3, 4, 5, 6], 4).sort((a, b) => a - b);
          let ys;
          if (type === 'prop') ys = xs.map(x => k * x);
          if (type === 'affine') { const c0 = rng.int(1, 4); ys = xs.map(x => k * x + c0); }
          if (type === 'curve') ys = xs.map(x => (x * (x + 1)) / 2);
          if (type === 'outlier') { const j = rng.int(1, 3); ys = xs.map((x, i) => k * x + (i === j ? rng.pick([2, 3]) * (rng.chance(0.5) || k * x <= 3 ? 1 : -1) : 0)); }
          const maxY = Math.max(...ys), ystep = niceStep(maxY), ymax = Math.ceil(maxY / ystep) * ystep + (maxY % ystep === 0 ? ystep : 0);
          const pts = xs.map((x, i) => [x, ys[i]]);
          const join = (type === 'prop' || type === 'affine') && rng.chance(0.5);
          const fig = graph({ pts, xmax: 7, ymax, xstep: 1, ystep, xlab: 'x', ylab: 'y', join, through0: true });
          const yes = type === 'prop';
          const why = ({
            prop: () => `Les points sont alignés avec l’origine du repère : c’est une situation de proportionnalité (on multiplie toujours par ${k}).`,
            affine: () => `Les points sont alignés, mais la droite <b>ne passe pas par l’origine</b> (pour x = 0, on aurait y = ${ys[0] - k * xs[0]}, pas 0).`,
            curve: () => 'Les points ne sont <b>pas alignés</b> : ils forment une courbe.',
            outlier: () => `Les points ne sont <b>pas tous alignés</b> avec l’origine : le point ${pt(...pts.find((p, i) => ys[i] !== k * xs[i]))} n’est pas sur la droite.`,
          })[type]();
          return Q(`p5r2:${type}:${xs}:${ys}:${join}`, `${fig}Ce graphique représente-t-il une situation de proportionnalité ?`, yesNo(yes), 'Deux conditions : les points sont-ils alignés ? La droite passe-t-elle par l’origine ?', `<b>${yes ? 'Oui' : 'Non'}</b>. ${why}`);
        }
        if (r < 0.7) {
          // Coefficient read from a graph.
          const k = rng.pick([0.5, 1.5, 2.5, 3.5, 3, 4]), xs = rng.sample([2, 4, 6, 8], 3).sort((a, b) => a - b);
          const pts = xs.map(x => [x, mul(x, k)]), ystep = mul(2, k);
          const fig = graph({ pts, xmax: 10, ymax: mul(10, k), xstep: 2, ystep, xlab: 'Tours de piste', ylab: 'Distance (km)', join: rng.chance(0.5), through0: true });
          const [x0, y0] = pts[0];
          return Q(`p5c2:${k}:${xs}`, `${fig}La distance parcourue est proportionnelle au nombre de tours de piste. Quel est le coefficient de proportionnalité (la distance pour 1 tour, en km) ?`, num(k, 'km'), 'Lis les coordonnées d’un point, puis divise la distance par le nombre de tours.', `Le point ${pt(x0, y0)} : ${fmt(y0)} ÷ ${fmt(x0)} = <b>${fmt(k)}</b> km par tour.`);
        }
        // Apply a decimal coefficient (prix unitaire or vitesse).
        if (rng.chance(0.5)) {
          const [item, unit] = rng.pick([['tomates', 'kg'], ['carottes', 'kg'], ['essence', 'L'], ['raisin', 'kg'], ['tissu', 'm']]);
          const p = dec(rng.int(11, 49), 1), m = dec(rng.int(12, 89), 1), tot = mul(p, m);
          const label = { kg: 'le kilogramme', L: 'le litre', m: 'le mètre' }[unit];
          return Q(`p5a2:${item}:${p}:${m}`, `Le prix est proportionnel à la quantité achetée. ${item[0].toUpperCase() + item.slice(1)} : ${fmtK(p, 2)} € ${label}. Combien coûtent ${fmt(m)} ${unit} (en €) ?`, num(tot, '€'), `Le coefficient est le prix d’un ${unit} : multiplie-le par la quantité.`, `${fmt(m)} × ${fmtK(p, 2)} = <b>${fmt(tot)}</b> €.`);
        }
        const vv = rng.pick([35, 45, 55, 65, 125, 4.5, 5.5, 12.5, 15.5, 7.5]), t = rng.pick([1.5, 2.5, 3, 0.5, 4]), d = mul(vv, t);
        return Q(`p5a2v:${vv}:${t}`, `${mover(vv)} avance à la vitesse moyenne constante de ${fmt(vv)} km/h. Quelle distance (en km) parcourt-il en ${fmt(t)} h ?`, num(d, 'km'), 'La vitesse est le coefficient : distance = vitesse × durée (en heures).', `${fmt(t)} × ${fmt(vv)} = <b>${fmt(d)}</b> km.`);
      }
      // Level 3: percentages (proportions), speed with minutes, points on the graph.
      const r = rng.next();
      if (r < 0.3) {
        const T = rng.pick([20, 25, 40, 50]), names = ['Alexis', 'Chloé', 'Salma', 'Djibril'];
        const cuts = rng.sample(M.u.range(1, T - 1), 3).sort((a, b) => a - b);
        const votes = [cuts[0], cuts[1] - cuts[0], cuts[2] - cuts[1], T - cuts[2]];
        const i = rng.int(0, 3), pc = div(votes[i] * 100, T);
        const tbl = table([[...names, 'Total'], [...votes, T]]);
        return Q(`p5p3:${votes}:${i}`, `Élection des délégués : voici le nombre de voix de chaque candidat.${tbl}Quel pourcentage des voix a obtenu ${names[i]} ?`, num(pc, '%'), `Écris la proportion de voix sous forme de fraction, puis avec le dénominateur 100.`, `${names[i]} : ${votes[i]} voix sur ${T}, soit ${frac(votes[i], T)} = ${frac(fmt(pc), 100)} → <b>${fmt(pc)} %</b>.`);
      }
      if (r < 0.5) {
        const t = rng.pick([4, 8, 12, 16, 24, 32, 36, 44]), q = rng.pick([3, 5, 6, 7, 9, 11, 13, 15, 17, 19, 22, 26, 31, 37]) * 25, val = div(t * q, 100);
        const ctx = rng.pick([['Dans un collège de', 'élèves,', 'sont externes'], ['Un festival accueille', 'spectateurs ;', 'sont venus en train'], ['Une ville compte', 'arbres ;', 'sont des platanes']]);
        return Q(`p5q3:${t}:${q}:${ctx[0]}`, `${ctx[0]} ${fmt(q)} ${ctx[1]} ${t} % ${ctx[2]}. Combien cela représente-t-il ?`, num(val), `${t} %, c’est ${frac(t, 100)} : multiplie la quantité par ${t} puis divise par 100.`, `${t} % de ${fmt(q)} = ${fmt(q)} × ${t} ÷ 100 = <b>${fmt(val)}</b>.`);
      }
      if (r < 0.75) {
        const min = rng.pick([15, 20, 30, 45, 90]), v = 12 * rng.int(1, 8), d = (v * min) / 60;
        const lin = { 15: 'Une heure, c’est 4 fois 15 min', 20: 'Une heure, c’est 3 fois 20 min', 30: 'Une heure, c’est 2 fois 30 min', 45: '45 min = 3 × 15 min et 1 h = 4 × 15 min', 90: '90 min = 1 h 30 min = 1,5 h' }[min];
        const steps = { 15: `${fmt(d)} × 4`, 20: `${fmt(d)} × 3`, 30: `${fmt(d)} × 2`, 45: `${fmt(d)} ÷ 3 × 4`, 90: `${fmt(d)} ÷ 1,5` }[min];
        return Q(`p5v3:${min}:${v}`, `${mover(v)} parcourt ${fmt(d)} km en ${min} min, à vitesse constante. Quelle est sa vitesse moyenne en km/h ?`, num(v, 'km/h'), 'Une vitesse en km/h, c’est la distance parcourue en 1 heure. Compare la durée donnée à une heure.', `${lin}. Vitesse : ${steps} = <b>${fmt(v)}</b> km/h.`);
      }
      // Which point belongs to the graph?
      const k = rng.pick([1.5, 2.5, 0.5, 1.2, 3.5, 0.8, 4]), xs = rng.sample([2, 3, 4, 5, 6, 8, 10], 4);
      const good = pt(xs[0], mul(xs[0], k));
      const bads = [[xs[1], add(mul(xs[1], k), 1)], [mul(xs[2], k), xs[2]], [xs[3], add(xs[3], k)]].filter(([x, y]) => y !== mul(x, k)).map(p => pt(...p));
      return Q(`p5pt3:${k}:${xs}`, `Le prix (en €) est proportionnel à la masse (en kg), avec un prix de ${fmtK(k, 2)} € le kg. On représente cette situation dans un repère (masse en abscisse, prix en ordonnée). Lequel de ces points est sur la représentation graphique ?`, choice(rng, good, bads), 'Pour chaque point, multiplie l’abscisse (la masse) par le prix d’un kg et compare avec l’ordonnée.', `${fmt(xs[0])} × ${fmtK(k, 2)} = ${fmt(mul(xs[0], k))} : le point <b>${good}</b> convient.`);
    },
  });

  // ===================== EXPLICATIONS =====================
  const B = M.cat.BASE, E = M.explain;
  E('div-par-decimal', [
    ['lien', B],
    ['vie', '<p>Des sachets de bonbons coûtent <b>0,50 €</b>. Avec <b>6 €</b>, combien peux-tu en acheter ? Compte en centimes : 600 centimes ÷ 50 centimes = <b>12 sachets</b>. Changer d’unité (euros → centimes), c’est exactement multiplier les deux nombres par 100 : 6 ÷ 0,5 = 600 ÷ 50.</p>'],
    ['etapes', '<p>Pour 9,36 ÷ 0,12 :</p><ol><li>Le diviseur 0,12 a <b>2 chiffres</b> après la virgule → je multiplie par 100.</li><li>9,36 × 100 = 936 et 0,12 × 100 = 12.</li><li>Je calcule 936 ÷ 12 = <b>78</b>.</li><li>Je vérifie : 0,12 × 78 = 9,36. ✔</li></ol>'],
  ]);
  E('frac-somme-5e', [
    ['dessin', B],
    ['vie', `<p>Une recette demande ${frac(1, 2)} litre de lait, puis ${frac(1, 3)} litre de plus. Avec un verre doseur gradué en <b>sixièmes</b> de litre, c’est facile : ${frac(1, 2)} = 3 graduations et ${frac(1, 3)} = 2 graduations. En tout : 5 graduations, soit ${frac(5, 6)} litre. Le dénominateur commun, c’est choisir une graduation qui convient aux deux quantités.</p>`],
    ['lien', `<p>Tu sais déjà additionner ${frac(1, 4)} + ${frac(3, 8)} : on transforme ${frac(1, 4)} en ${frac(2, 8)}, car 8 est un multiple de 4. Quand aucun dénominateur n’est multiple de l’autre (4 et 6), on cherche un <b>troisième</b> nombre multiple des deux : 12. Puis on transforme <b>les deux</b> fractions : ${frac(1, 4)} = ${frac(3, 12)} et ${frac(1, 6)} = ${frac(2, 12)}.</p>`],
  ]);
  E('divisibilite-3-9', [
    ['lien', B],
    ['etapes', '<p>Pour 52 461 :</p><ol><li>J’additionne les chiffres : 5 + 2 + 4 + 6 + 1 = 18.</li><li>18 est dans la table de 3 → divisible par 3.</li><li>18 est aussi dans la table de 9 → divisible par 9.</li><li>Son chiffre des unités est 1 → pas divisible par 2, ni par 5, ni par 10.</li></ol>'],
    ['vie', '<p>Tu veux ranger <b>327 billes</b> dans 3 sacs avec exactement le même nombre dans chacun, sans en laisser. Est-ce possible sans poser la division ? 3 + 2 + 7 = 12, qui est dans la table de 3 : <b>oui</b> (109 billes par sac). Avec 9 sacs, non : 12 n’est pas dans la table de 9.</p>'],
  ]);
  E('proportionnalite-5e', [
    ['dessin', B],
    ['vie', '<p>Sur l’autoroute, un compteur indique <b>110 km/h</b>. Cela veut dire : si on gardait cette vitesse, on ferait 110 km en 1 h, 220 km en 2 h, 55 km en une demi-heure. La vitesse est le <b>coefficient</b> qui transforme une durée en distance. De même, le prix au kilogramme affiché au marché transforme une masse en prix.</p>'],
    ['etapes', `<p>Pour savoir si un graphique montre une situation de proportionnalité :</p><ol><li>Les points sont-ils <b>alignés</b> (pose ta règle) ? Sinon : non.</li><li>La droite passe-t-elle par l’<b>origine</b> (le point 0 ; 0) ? Sinon : non.</li><li>Si oui aux deux : c’est proportionnel. Le coefficient se trouve en divisant l’ordonnée d’un point par son abscisse.</li></ol>`],
    ['lien', `<p>Tu connais déjà le tableau de proportionnalité : ${ptable(['x', 'y'], [1, 2, 3], [2, 4, 6])} Chaque colonne du tableau devient un point du graphique : (1 ; 2), (2 ; 4), (3 ; 6). Et la colonne « 0 → 0 », toujours vraie quand c’est proportionnel, donne l’origine. Voilà pourquoi tous les points sont sur une même droite qui passe par l’origine.</p>`],
  ]);
})();
