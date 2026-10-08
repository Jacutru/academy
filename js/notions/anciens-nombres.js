// Optional lessons from older programmes (2005/2008 collège, 2015–2020 cycles), numbers & data side:
// divisibility by 4, multiplying fractions, approximate quotients, grouping data into classes.
(function () {
  'use strict';
  const M = globalThis.M;
  const { fmt, fmtK, gcd, dec, div } = M.u;
  const { frac, hole, table } = M.h;
  const { Q, num, choice, fixedChoice } = M.kit;
  const { svg, text, line } = M.svg.raw;
  const S = M.svg;
  const B = M.cat.BASE;

  const F = (n, d) => ({ kind: 'fraction', n, d });
  const Fs = (n, d) => ({ kind: 'fraction', n, d, simplified: true });
  const simp = (n, d) => { const g = gcd(n, d); return [n / g, d / g]; };
  const fr = (n, d) => (d === 1 ? fmt(n) : frac(n, d));
  // Result in bold, with its simplification when there is one: "6/8 = **3/4**".
  const res = (n, d) => { const [a, b] = simp(n, d); return a === n ? `<b>${fr(n, d)}</b>` : `${frac(n, d)} = <b>${fr(a, b)}</b>`; };
  // Product of factors, leaving out the 1s: [3, 1, 7] → "3 × 7".
  const prod = fs => (fs.filter(f => f !== 1).join(' × ') || '1');
  const yesNo = b => fixedChoice(['Oui', 'Non'], b ? 'Oui' : 'Non');
  const NNBSP = ' ';
  const rect = (x, y, w, h, cls) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="${cls}"/>`;
  const ptable = rows => table(rows, { head: false, cls: 'prop' });

  // ===================== DIVISIBILITÉ PAR 4 =====================

  const two = n => String(n % 100).padStart(2, '0');
  const d4Why = n => {
    const t = n % 100;
    return t % 4 === 0
      ? `les deux derniers chiffres forment ${two(n)}, et ${t} = 4 × ${t / 4} est divisible par 4`
      : `les deux derniers chiffres forment ${two(n)}, et ${t} = 4 × ${Math.floor(t / 4)} + ${t % 4} n’est pas divisible par 4`;
  };
  // Last two digits: a multiple of 4 or not (even traps: 14, 30, 58…).
  const tail4 = rng => { const t = rng.int(0, 9); return t * 10 + (t % 2 ? rng.pick([2, 6]) : rng.pick([0, 4, 8])); };
  const tailEvenNot4 = rng => { const t = rng.int(0, 9); return t * 10 + (t % 2 ? rng.pick([0, 4, 8]) : rng.pick([2, 6])); };
  const digitSum = n => String(n).split('').reduce((s, c) => s + Number(c), 0);

  const D4_SETS = [
    { lab: 'aucun des quatre', make: r => r.int(0, 9) * 10 + r.pick([1, 3, 7, 9]) },
    { lab: '5 seulement', make: r => r.int(0, 9) * 10 + 5 },
    { lab: '2 seulement', make: r => { const t = r.int(0, 9); return t * 10 + (t % 2 ? r.pick([4, 8]) : r.pick([2, 6])); } },
    { lab: '2 et 4 seulement', make: r => { const t = r.int(0, 9); return t * 10 + (t % 2 ? r.pick([2, 6]) : r.pick([4, 8])); } },
    { lab: '2, 5 et 10 seulement', make: r => r.pick([1, 3, 5, 7, 9]) * 10 },
    { lab: '2, 4, 5 et 10', make: r => r.pick([0, 2, 4, 6, 8]) * 10 },
  ];

  M.notion('divisibilite-4', {
    lesson: {
      retenir: 'Un nombre entier est divisible par <b>4</b> si le nombre formé par ses <b>deux derniers chiffres</b> (dizaines et unités) est divisible par 4. Exemple : 3 716 se termine par 16 = 4 × 4, donc 3 716 est divisible par 4.',
      explication: '<p>Pourquoi seulement les deux derniers chiffres ? Parce que 100 = 4 × 25 : une centaine est toujours un multiple de 4, donc 200, 3 700, 51 200… aussi.</p><p>3 716 = 3 700 + 16. La partie 3 700 est divisible par 4 ; il reste à regarder 16 = 4 × 4. Donc 3 716 est divisible par 4.</p><p>3 718 = 3 700 + 18 et 18 = 4 × 4 + 2 : il reste 2, donc 3 718 n’est <b>pas</b> divisible par 4 (et le reste de sa division par 4 est 2).</p>',
      methode: [
        'Isole les deux derniers chiffres du nombre (dizaines et unités).',
        'Regarde si ce petit nombre est dans la table de 4 : 0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40…',
        'Si oui, le nombre entier est divisible par 4 ; sinon, il ne l’est pas.',
      ],
      exemples: [
        { q: '5 132 est-il divisible par 4 ?', r: '32 = 4 × 8 : <b>oui</b>.' },
        { q: '2 714 est-il divisible par 4 ?', r: '14 = 4 × 3 + 2 : <b>non</b>, même s’il est pair.' },
        { q: '1 900 est-il divisible par 4 ?', r: '00, c’est 0 = 4 × 0 : <b>oui</b>.' },
      ],
      astuces: [
        'Si le chiffre des dizaines est pair, le nombre est divisible par 4 quand il se termine par 0, 4 ou 8 ; si le chiffre des dizaines est impair, quand il se termine par 2 ou 6.',
        'Un nombre divisible par 4 est forcément pair. Mais un nombre pair n’est pas toujours divisible par 4.',
      ],
      erreurs: [
        'Regarder seulement le chiffre des unités : 34 se termine par 4, pourtant 34 n’est pas divisible par 4.',
        'Croire que tout nombre pair est divisible par 4 : 2 018 est pair, mais 18 n’est pas dans la table de 4.',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        const yes = rng.chance(0.5);
        const t = yes ? tail4(rng) : (rng.chance(0.75) ? tailEvenNot4(rng) : rng.int(0, 9) * 10 + rng.pick([1, 3, 5, 7, 9]));
        const n = rng.int(1, 99) * 100 + t;
        return Q(`d4:${n}`, `${fmt(n)} est-il divisible par 4 ?`, yesNo(yes), 'Regarde le nombre formé par les deux derniers chiffres.',
          `<b>${yes ? 'Oui' : 'Non'}</b> : ${d4Why(n)}.`);
      }
      if (level === 2) {
        if (rng.chance(0.5)) {
          const good = rng.int(10, 99) * 100 + tail4(rng), bads = [];
          while (bads.length < 3) { const x = rng.int(10, 99) * 100 + tailEvenNot4(rng); if (!bads.includes(x)) bads.push(x); }
          return Q(`d4c:${good}:${bads}`, 'Lequel de ces nombres est divisible par 4 ?', choice(rng, fmt(good), bads.map(fmt)),
            'Ils sont tous pairs : regarde les deux derniers chiffres de chacun.',
            `Pour ${fmt(good)}, ${d4Why(good)} → <b>${fmt(good)}</b>. Les autres se terminent par ${bads.map(two).join(', ')}, qui ne sont pas dans la table de 4.`);
        }
        const h = rng.int(10, 999), t = rng.int(0, 99), n = h * 100 + t, r = t % 4;
        return Q(`d4r:${n}`, `Quel est le reste de la division euclidienne de ${fmt(n)} par 4 ?`, num(r),
          'Les centaines sont des multiples de 4 : seul le nombre formé par les deux derniers chiffres compte.',
          `${fmt(n)} = ${fmt(h * 100)} + ${t}. ${fmt(h * 100)} est divisible par 4 (car 100 = 4 × 25), et ${t} = 4 × ${Math.floor(t / 4)} + ${r}. Le reste est <b>${fmt(r)}</b>.`);
      }
      const k = rng.int(0, 2);
      if (k === 0) {
        const set = rng.pick(D4_SETS), n = rng.int(10, 99) * 100 + set.make(rng), u = n % 10;
        const others = rng.sample(D4_SETS.filter(s => s !== set).map(s => s.lab), 3);
        return Q(`d4s:${n}`, `Par quels nombres parmi 2, 4, 5 et 10 le nombre ${fmt(n)} est-il divisible ?`, choice(rng, set.lab, others),
          'Pour 2, 5 et 10, regarde le chiffre des unités ; pour 4, les deux derniers chiffres.',
          `Chiffre des unités : ${u}, donc ${n % 2 ? 'pas divisible' : 'divisible'} par 2, ${n % 5 ? 'pas divisible' : 'divisible'} par 5, ${n % 10 ? 'pas divisible' : 'divisible'} par 10. Pour 4 : ${d4Why(n)}. Réponse : <b>${set.lab}</b>.`);
      }
      if (k === 1) {
        const hundreds = rng.int(10, 99), first = Math.floor(hundreds / 10), second = hundreds % 10;
        if (rng.chance(0.5)) {
          // Missing units digit, tens digit known.
          const t = rng.int(0, 9), valid = t % 2 ? [2, 6] : [0, 4, 8];
          const good = rng.pick(valid), badEven = (t % 2 ? [0, 4, 8] : [2, 6]), bad = [...rng.sample(badEven, 2), rng.pick([1, 3, 5, 7, 9])];
          const shown = `${first}${NNBSP}${second}${t}${hole}`;
          return Q(`d4m:${hundreds}:${t}u:${good}:${bad}`, `Par quel chiffre peut-on remplacer ${hole} pour que le nombre ${shown} soit divisible par 4 ?`, choice(rng, String(good), bad.map(String)),
            'Essaie chaque chiffre : le nombre formé par les deux derniers chiffres doit être dans la table de 4.',
            `Avec ${good}, les deux derniers chiffres forment ${t}${good} = 4 × ${(t * 10 + good) / 4} : le chiffre est <b>${good}</b>. Avec les autres, on obtient ${bad.map(b => `${t}${b}`).join(', ')}, qui ne sont pas dans la table de 4.`);
        }
        // Missing tens digit, units digit known (even).
        const u = rng.pick([0, 2, 4, 6, 8]), valid = [2, 6].includes(u) ? [1, 3, 5, 7, 9] : [0, 2, 4, 6, 8];
        const good = rng.pick(valid), bad = rng.sample([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(d => !valid.includes(d)), 3);
        const shown = `${first}${NNBSP}${second}${hole}${u}`;
        return Q(`d4m:${hundreds}:${u}t:${good}:${bad}`, `Par quel chiffre peut-on remplacer ${hole} pour que le nombre ${shown} soit divisible par 4 ?`, choice(rng, String(good), bad.map(String)),
          'Essaie chaque chiffre : le nombre formé par les deux derniers chiffres doit être dans la table de 4.',
          `Avec ${good}, les deux derniers chiffres forment ${good}${u} = 4 × ${(good * 10 + u) / 4} : le chiffre est <b>${good}</b>. Avec les autres, on obtient ${bad.map(b => `${b}${u}`).join(', ')}, qui ne sont pas dans la table de 4.`);
      }
      // Divisible by 4 and by 3 (or 9).
      const m = rng.pick([3, 9]);
      const draw = test => { let x; do x = rng.int(1000, 9999); while (!test(x)); return x; };
      const good = draw(x => x % (4 * m) === 0);
      const only4 = draw(x => x % 4 === 0 && x % m !== 0);
      const onlyM = draw(x => x % m === 0 && x % 2 === 0 && x % 4 !== 0);
      const neither = draw(x => x % 2 === 0 && x % 4 !== 0 && x % m !== 0);
      const why = x => `${fmt(x)} : somme des chiffres ${digitSum(x)} → ${digitSum(x) % m ? 'non' : 'oui'} pour ${m}, fin ${two(x)} → ${x % 4 ? 'non' : 'oui'} pour 4`;
      return Q(`d4x:${m}:${good}:${only4}:${onlyM}:${neither}`, `Lequel de ces nombres est divisible à la fois par 4 et par ${m} ?`, choice(rng, fmt(good), [only4, onlyM, neither].map(fmt)),
        `Pour ${m}, additionne les chiffres ; pour 4, regarde les deux derniers chiffres. Il faut les deux.`,
        `${[good, only4, onlyM, neither].map(why).join(' ; ')}. Seul <b>${fmt(good)}</b> convient.`);
    },
  });

  // ===================== MULTIPLIER DES FRACTIONS =====================

  const unitSquare = (() => {
    // 2/3 of the unit (2 columns out of 3), then 3/4 of that part (3 rows out of 4).
    const x0 = 50, y0 = 20, W = 240, H = 160, cw = W / 3, rh = H / 4;
    let b = '';
    for (let c = 0; c < 3; c++) {
      for (let r = 0; r < 4; r++) {
        const cls = c < 2 && r < 3 ? 's-fill' : c < 2 ? 's-soft s-line' : 's-empty';
        b += rect(x0 + c * cw, y0 + r * rh, cw, rh, cls);
      }
    }
    b += line(x0, y0 + H + 10, x0 + 2 * cw, y0 + H + 10, 's-accent-line') + text(x0 + cw, y0 + H + 28, '2/3 de l’unité', { size: 13 });
    b += line(x0 - 10, y0, x0 - 10, y0 + 3 * rh, 's-accent-line') + text(x0 - 16, y0 + 1.5 * rh + 5, '3/4', { anchor: 'end', size: 13 });
    return svg(310, 230, b);
  })();

  const FF_CTX = [
    (a, b, c, d) => `Les ${frac(c, d)} des élèves d’un collège mangent à la cantine. Parmi eux, ${frac(a, b)} prennent un dessert. Quelle fraction des élèves du collège prend un dessert à la cantine ?`,
    (a, b, c, d) => `Un potager occupe ${frac(c, d)} d’un jardin. Les tomates occupent ${frac(a, b)} du potager. Quelle fraction du jardin occupent les tomates ?`,
    (a, b, c, d) => `Une bouteille est remplie aux ${frac(c, d)}. On boit ${frac(a, b)} de son contenu. Quelle fraction de la bouteille a-t-on bue ?`,
    (a, b, c, d) => `Inès a déjà lu ${frac(c, d)} de son livre. Elle a lu ${frac(a, b)} de cette partie pendant les vacances. Quelle fraction du livre a-t-elle lue pendant les vacances ?`,
  ];
  const FQ_CTX = [
    { u: 'carreaux', t: (q, a, b, c, d) => `Une tablette de chocolat a ${q} carreaux. Zoé en garde ${frac(c, d)} pour elle, puis donne ${frac(a, b)} de sa part à son frère. Combien de carreaux reçoit son frère ?` },
    { u: 'm²', t: (q, a, b, c, d) => `Un terrain mesure ${q} m². On cultive ${frac(c, d)} du terrain, et ${frac(a, b)} de la partie cultivée est plantée de pommes de terre. Quelle aire est plantée de pommes de terre ?` },
    { u: 'élèves', t: (q, a, b, c, d) => `Un collège compte ${q} élèves. Les ${frac(c, d)} sont externes, et ${frac(a, b)} des externes viennent à vélo. Combien d’élèves externes viennent à vélo ?` },
  ];

  M.notion('frac-produit', {
    lesson: {
      retenir: `Pour multiplier deux fractions, on multiplie les <b>numérateurs entre eux</b> et les <b>dénominateurs entre eux</b> : ${frac('a', 'b')} × ${frac('c', 'd')} = ${frac('a × c', 'b × d')}. Pour multiplier une fraction par un entier, on multiplie seulement le numérateur : k × ${frac('a', 'b')} = ${frac('k × a', 'b')}. Prendre ${frac(2, 3)} de ${frac(3, 4)}, c’est calculer ${frac(2, 3)} × ${frac(3, 4)}.`,
      explication: `<p>Prenons ${frac(3, 4)} de ${frac(2, 3)} d’un carré. On colorie d’abord 2 colonnes sur 3 (${frac(2, 3)}), puis, dans cette partie, 3 lignes sur 4 (${frac(3, 4)} de la partie).</p>${unitSquare}<p>Le carré est partagé en 3 × 4 = 12 cases, et on a pris 2 × 3 = 6 cases : ${frac(3, 4)} × ${frac(2, 3)} = ${frac('3 × 2', '4 × 3')} = ${frac(6, 12)} = ${frac(1, 2)}.</p>`,
      methode: [
        'Écris le produit sur une seule barre de fraction : numérateurs multipliés en haut, dénominateurs multipliés en bas.',
        'Avant d’effectuer les multiplications, cherche s’il y a un même facteur en haut et en bas : barre-le (c’est simplifier).',
        'Effectue les multiplications qui restent, puis vérifie que la fraction obtenue est simplifiée.',
        'Un entier k s’écrit aussi k/1 : 5 × 2/7 = 10/7.',
      ],
      exemples: [
        { q: `${frac(2, 5)} × ${frac(3, 7)}`, r: `${frac('2 × 3', '5 × 7')} = <b>${frac(6, 35)}</b>` },
        { q: `${frac(2, 3)} de ${frac(3, 4)}`, r: `${frac(2, 3)} × ${frac(3, 4)} = ${frac('2 × 3', '3 × 4')} = ${frac(6, 12)} = <b>${frac(1, 2)}</b>` },
        { q: `${frac(14, 15)} × ${frac(5, 21)}`, r: `${frac('2 × 7 × 5', '3 × 5 × 3 × 7')} : on barre 7 et 5 → <b>${frac(2, 9)}</b>` },
      ],
      astuces: ['Multiplier par une fraction plus petite que 1 donne un résultat plus petit : 3/4 de quelque chose, c’est moins que le tout.'],
      erreurs: [
        `Mettre au même dénominateur comme pour une addition : c’est inutile pour un produit.`,
        `Multiplier aussi le dénominateur par l’entier : 3 × ${frac(2, 7)} = ${frac(6, 7)}, pas ${frac(6, 21)}.`,
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        if (rng.chance(0.6)) {
          const b = rng.int(2, 9), d = rng.int(2, 9);
          let a, c; do { a = rng.int(1, 9); c = rng.int(1, 9); } while (a % b === 0 || c % d === 0);
          return Q(`fp1:${a}/${b}x${c}/${d}`, `${frac(a, b)} × ${frac(c, d)} = ?`, F(a * c, b * d),
            'Numérateur × numérateur, dénominateur × dénominateur.',
            `${frac(a, b)} × ${frac(c, d)} = ${frac(`${a} × ${c}`, `${b} × ${d}`)} = ${res(a * c, b * d)}`);
        }
        const k = rng.int(2, 9), b = rng.int(3, 11), a = rng.int(1, b - 1);
        return Q(`fp1k:${k}x${a}/${b}`, `${k} × ${frac(a, b)} = ? <small>(sous forme de fraction)</small>`, F(k * a, b),
          'On multiplie seulement le numérateur par l’entier.',
          `${k} × ${frac(a, b)} = ${frac(`${k} × ${a}`, b)} = ${res(k * a, b)}`);
      }
      if (level === 2) {
        if (rng.chance(0.5)) {
          const b = rng.int(2, 8), d = rng.int(2, 8), a = rng.int(1, b - 1), c = rng.int(1, d - 1);
          const ctx = rng.int(0, FF_CTX.length);
          const prompt = ctx === FF_CTX.length ? `Combien font ${frac(a, b)} de ${frac(c, d)} ? <small>(sous forme de fraction)</small>` : FF_CTX[ctx](a, b, c, d);
          return Q(`fp2d:${ctx}:${a}/${b}:${c}/${d}`, prompt, F(a * c, b * d),
            `Prendre ${frac(a, b)} d’une fraction, c’est multiplier par ${frac(a, b)}.`,
            `${frac(a, b)} de ${frac(c, d)} : ${frac(a, b)} × ${frac(c, d)} = ${frac(`${a} × ${c}`, `${b} × ${d}`)} = ${res(a * c, b * d)}`);
        }
        let a, b, c, d;
        do { b = rng.int(2, 9); d = rng.int(2, 12); a = rng.int(1, 9); c = rng.int(1, 9); } while (gcd(a * c, b * d) === 1 || gcd(a, b) !== 1 || gcd(c, d) !== 1);
        const [p, q] = simp(a * c, b * d);
        return Q(`fp2s:${a}/${b}x${c}/${d}`, `Calcule ${frac(a, b)} × ${frac(c, d)} et donne le résultat sous forme de fraction simplifiée.`, Fs(p, q),
          'Multiplie, puis simplifie (ou simplifie avant de multiplier).',
          `${frac(`${a} × ${c}`, `${b} × ${d}`)} = ${frac(a * c, b * d)} = <b>${fr(p, q)}</b>`);
      }
      const k = rng.int(0, 2);
      if (k === 0) {
        let n1, d1, n2, d2;
        do { n1 = rng.int(2, 30); d1 = rng.int(2, 30); n2 = rng.int(2, 30); d2 = rng.int(2, 30); }
        while (gcd(n1, d1) !== 1 || gcd(n2, d2) !== 1 || gcd(n1, d2) === 1 || gcd(n2, d1) === 1);
        const g1 = gcd(n1, d2), g2 = gcd(n2, d1), p = (n1 / g1) * (n2 / g2), q = (d1 / g2) * (d2 / g1);
        return Q(`fp3c:${n1}/${d1}x${n2}/${d2}`, `Calcule ${frac(n1, d1)} × ${frac(n2, d2)} et donne le résultat sous forme de fraction simplifiée.`, Fs(p, q),
          'Avant de multiplier, cherche un nombre qui divise à la fois un numérateur et un dénominateur.',
          `${frac(`${n1} × ${n2}`, `${d1} × ${d2}`)} = ${frac(prod([g1, n1 / g1, g2, n2 / g2]), prod([g2, d1 / g2, g1, d2 / g1]))}. On simplifie par ${g1} et par ${g2} : ${frac(prod([n1 / g1, n2 / g2]), prod([d1 / g2, d2 / g1]))} = <b>${fr(p, q)}</b>`);
      }
      if (k === 1) {
        const a = rng.int(2, 9), b = rng.int(2, 9), c = rng.int(1, 9), d = rng.int(2, 9);
        return Q(`fp3m:${a}/${b}:${c}/${d}`, `${frac(a, b)} × ${hole} = ${frac(a * c, b * d)} <small>(réponse sous forme de fraction)</small>`, F(c, d),
          'Le numérateur du résultat est le produit des numérateurs ; le dénominateur, le produit des dénominateurs.',
          `${a} × ${c} = ${a * c} et ${b} × ${d} = ${b * d}, donc ${frac(a, b)} × ${frac(c, d)} = ${frac(a * c, b * d)} : ${hole} = <b>${frac(c, d)}</b>`);
      }
      const b = rng.pick([2, 3, 4, 5]), d = rng.pick([2, 3, 4, 5, 6]), a = rng.int(1, b - 1), c = rng.int(1, d - 1);
      const q = b * d * rng.int(1, 4) * (b * d < 10 ? 2 : 1), ctx = rng.pick(FQ_CTX), v = (q / (b * d)) * a * c;
      return Q(`fp3q:${ctx.u}:${q}:${a}/${b}:${c}/${d}`, ctx.t(q, a, b, c, d), num(v, ctx.u),
        `Calcule d’abord ${frac(a, b)} de ${frac(c, d)} sous forme d’une seule fraction.`,
        `${frac(a, b)} × ${frac(c, d)} = ${frac(a * c, b * d)}. Puis ${frac(a * c, b * d)} de ${q} : ${q} ÷ ${b * d} = ${q / (b * d)} ; ${q / (b * d)} × ${a * c} = <b>${fmt(v)}</b> ${ctx.u}.`);
    },
  });

  // ===================== QUOTIENT APPROCHÉ, NOMBRES NON DÉCIMAUX =====================

  // a, b positive integers: floor(a ÷ b × 10^k), then truncation, excess and rounding to k decimals.
  const fl = (a, b, k) => Math.floor((a * 10 ** k) / b);
  const qDef = (a, b, k) => dec(fl(a, b, k), k);
  const qExc = (a, b, k) => dec(fl(a, b, k) + 1, k);
  const qArr = (a, b, k) => dec(Math.floor((2 * a * 10 ** k + b) / (2 * b)), k);
  const dots = (a, b, k) => `${fmtK(qDef(a, b, k), k)}…`;
  const isDecFrac = (a, b) => { let d = b / gcd(a, b); while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5; return d === 1; };
  const RANK = ['à l’unité', 'au dixième', 'au centième', 'au millième'];
  const KIND = { def: 'par défaut', exc: 'par excès', arr: 'arrondie' };
  const approx = (kind, a, b, k) => (kind === 'def' ? qDef(a, b, k) : kind === 'exc' ? qExc(a, b, k) : qArr(a, b, k));
  // A non-decimal quotient a ÷ b with b among bs.
  const nonDec = (rng, bs, lo, hi) => { let a, b; do { b = rng.pick(bs); a = rng.int(lo, hi); } while (isDecFrac(a, b)); return [a, b]; };
  const approxHint = kind => (kind === 'def' ? 'Calcule la division jusqu’au rang demandé, puis coupe : la valeur par défaut est juste en dessous du quotient.'
    : kind === 'exc' ? 'Calcule la division jusqu’au rang demandé : la valeur par excès est juste au-dessus du quotient.'
      : 'Calcule un chiffre de plus que le rang demandé, puis arrondis.');
  const approxCorr = (kind, a, b, k, shown = `${a} ÷ ${b}`) => {
    const lo = qDef(a, b, k), hi = qExc(a, b, k), v = approx(kind, a, b, k);
    const why = kind === 'arr' ? ` Le chiffre suivant est ${fl(a, b, k + 1) % 10}${fl(a, b, k + 1) % 10 >= 5 ? ' (5 ou plus) : on prend la valeur par excès.' : ' (moins de 5) : on garde la valeur par défaut.'}` : '';
    return `${shown} = ${dots(a, b, k + 2)} donc ${fmt(lo)} &lt; ${shown} &lt; ${fmt(hi)}.${why} ${kind === 'arr' ? 'Arrondi' : `Valeur approchée ${KIND[kind]}`} ${RANK[k]} : <b>${fmt(v)}</b>.`;
  };
  const askApprox = (kind, k, shown) => (kind === 'arr' ? `Donne l’arrondi ${RANK[k]} de ${shown}.` : `Donne la valeur approchée ${KIND[kind]} ${RANK[k]} de ${shown}.`);
  const KNOWN = [[1, 3], [2, 3], [1, 6], [5, 6], [1, 7], [2, 7], [1, 9], [4, 9], [1, 11], [7, 3], [10, 3]];

  const decLine = (() => {
    const third = 10 / 3;
    return S.numberLine({ from: 3.3, to: 3.4, major: 0.1, minor: 10, marks: [{ v: third, label: '10 ÷ 3' }] });
  })();

  M.notion('quotient-approche', {
    lesson: {
      retenir: `Certaines divisions ne se terminent jamais : 10 ÷ 3 = 3,333… Le quotient ${frac(10, 3)} n’est <b>pas un nombre décimal</b> ; sa seule écriture exacte est la fraction. On en donne alors une <b>valeur approchée</b> : <b>par défaut</b> (juste en dessous), <b>par excès</b> (juste au-dessus) ou l’<b>arrondi</b> (la plus proche). Au centième : 3,33 &lt; ${frac(10, 3)} &lt; 3,34. À connaître : ${frac(1, 3)} ≈ 0,33 ; ${frac(2, 3)} ≈ 0,67 ; π ≈ 3,14.`,
      explication: `<p>Posons 10 ÷ 3 : 10 = 3 × 3 + <b>1</b>. On continue après la virgule : 10 dixièmes ÷ 3 = 3, reste <b>1</b> ; 10 centièmes ÷ 3 = 3, reste <b>1</b>… Le reste est toujours 1 : la division recommence à l’identique et ne s’arrête jamais.</p><p>Pour 10 ÷ 3 = 3,333… :</p><ul><li>au dixième : 3,3 &lt; 10 ÷ 3 &lt; 3,4 → par défaut <b>3,3</b>, par excès <b>3,4</b> ;</li><li>l’arrondi au dixième est 3,3, car le chiffre suivant (3) est plus petit que 5.</li></ul><p>Dès qu’un reste déjà rencontré revient, on sait que la division ne se terminera pas.</p>`,
      methode: [
        'Pose la division et continue après la virgule en ajoutant des zéros.',
        'Si un reste revient, les chiffres du quotient se répètent : le quotient n’est pas décimal.',
        'Pour une valeur approchée par défaut à un rang donné, coupe le quotient à ce rang ; par excès, ajoute 1 au dernier chiffre gardé.',
        'Pour l’arrondi, regarde le chiffre suivant : moins de 5, on garde la valeur par défaut ; 5 ou plus, on prend la valeur par excès.',
      ],
      exemples: [
        { q: 'Valeurs approchées au centième de 2 ÷ 3', r: '2 ÷ 3 = 0,666… : par défaut <b>0,66</b>, par excès <b>0,67</b>, arrondi <b>0,67</b>.' },
        { q: `${frac(3, 8)} est-il un nombre décimal ?`, r: '3 ÷ 8 = 0,375, la division se termine : <b>oui</b>.' },
        { q: `${frac(5, 7)} est-il un nombre décimal ?`, r: '5 ÷ 7 = 0,714285714… les restes se répètent : <b>non</b>.' },
      ],
      astuces: [
        'Une fraction simplifiée est un nombre décimal seulement si son dénominateur n’a pas d’autres facteurs que 2 et 5 (2, 4, 5, 8, 10, 20, 25…). Avec 3, 7, 9, 11… dans le dénominateur, la division ne se termine pas.',
        'La valeur par défaut et la valeur par excès encadrent le quotient : elles diffèrent d’une unité du rang choisi.',
      ],
      erreurs: [
        'Écrire 10 ÷ 3 = 3,33 : c’est faux, ce n’est qu’une valeur approchée. On écrit 10 ÷ 3 ≈ 3,33.',
        'Confondre arrondi et valeur par défaut : l’arrondi au dixième de 2 ÷ 3 = 0,666… est 0,7, pas 0,6.',
      ],
    },
    generate(level, rng) {
      if (level === 1) {
        if (rng.chance(0.45)) {
          const want = rng.chance(0.5);
          let a, b;
          do { b = rng.pick([3, 4, 6, 7, 8, 9, 11, 12, 15, 20, 25]); a = rng.int(1, 60); } while (a % b === 0 || isDecFrac(a, b) !== want);
          return Q(`qa1d:${a}/${b}`, `Le quotient ${a} ÷ ${b} est-il un nombre décimal ? <small>(la division se termine-t-elle ?)</small>`, yesNo(want),
            'Pose la division : finit-on par trouver un reste égal à 0, ou un reste déjà rencontré revient-il ?',
            want ? `<b>Oui</b> : la division se termine, ${a} ÷ ${b} = ${fmt(div(a, b))}.`
              : `<b>Non</b> : ${a} ÷ ${b} = ${dots(a, b, 6)} Les restes se répètent, la division ne se termine jamais.`);
        }
        const [a, b] = nonDec(rng, [3, 6, 7, 9], 2, 60), kind = rng.pick(['def', 'exc']), k = rng.int(0, 1);
        return Q(`qa1a:${a}/${b}:${kind}${k}`, askApprox(kind, k, `${a} ÷ ${b}`), num(approx(kind, a, b, k)), approxHint(kind), approxCorr(kind, a, b, k));
      }
      if (level === 2) {
        const v = rng.int(0, 2);
        if (v === 0) {
          const [a, b] = nonDec(rng, [3, 6, 7, 9, 11, 12], 2, 80), kind = rng.pick(['def', 'exc', 'arr']), k = rng.int(1, 2);
          const shown = rng.chance(0.5) ? `${a} ÷ ${b}` : frac(a, b);
          return Q(`qa2a:${a}/${b}:${kind}${k}`, askApprox(kind, k, shown), num(approx(kind, a, b, k)), approxHint(kind), approxCorr(kind, a, b, k, shown));
        }
        if (v === 1) {
          const [a, b] = nonDec(rng, [3, 6, 7, 9, 11], 13, 90), lo = qDef(a, b, 2), hi = qExc(a, b, 2), s = `${a} ÷ ${b}`;
          const enc = (x, y) => `${fmt(x)} &lt; ${s} &lt; ${fmt(y)}`;
          const good = enc(lo, hi);
          return Q(`qa2e:${a}/${b}`, `Quel est l’encadrement de ${s} au centième ?`, choice(rng, good, [enc(dec(fl(a, b, 2) - 1, 2), lo), enc(hi, dec(fl(a, b, 2) + 2, 2))]),
            'Calcule la division jusqu’aux centièmes (et même un chiffre de plus).',
            `${s} = ${dots(a, b, 4)} : il est entre ${fmt(lo)} et ${fmt(hi)}. L’encadrement est <b>${good}</b>.`);
        }
        const k = rng.int(1, 3);
        if (rng.chance(0.25)) {
          const pi = [3.1, 3.14, 3.142][k - 1];
          return Q(`qa2pi:${k}`, `π = 3,14159265… Quel est l’arrondi ${RANK[k]} de π ?`, num(pi), 'Regarde le chiffre juste après le rang demandé.',
            `π = 3,14159… ; le chiffre après le rang demandé est ${[4, 1, 5][k - 1]}, donc l’arrondi ${RANK[k]} est <b>${fmt(pi)}</b>.`);
        }
        const [a, b] = rng.pick(KNOWN), shown = frac(a, b);
        return Q(`qa2k:${a}/${b}:${k}`, askApprox('arr', k, shown), num(qArr(a, b, k)), approxHint('arr'), approxCorr('arr', a, b, k, shown));
      }
      const v = rng.int(0, 3);
      if (v === 0) {
        const decs = [], bad = (() => {
          const d = rng.pick([3, 6, 7, 9, 12, 15]); let n; do n = rng.int(1, 2 * d); while (gcd(n, d) !== 1); const m = rng.pick(d < 10 ? [1, 2, 5] : [1, 2]); return [n * m, d * m];
        })();
        while (decs.length < 3) {
          const d = rng.pick([2, 4, 5, 8, 20, 25]); let n; do n = rng.int(1, Math.min(2 * d, 30)); while (gcd(n, d) !== 1);
          const m = rng.pick(d < 10 ? [1, 3, 3, 7] : [1, 3]), f = [n * m, d * m];
          if (!decs.some(x => x[0] === f[0] && x[1] === f[1])) decs.push(f);
        }
        const show = ([n, d]) => frac(n, d);
        const exp = ([n, d]) => { const [p, q] = simp(n, d); return `${frac(n, d)}${p !== n ? ` = ${frac(p, q)}` : ''} = ${isDecFrac(n, d) ? fmt(div(n, d)) : dots(n, d, 4)}`; };
        return Q(`qa3n:${bad}:${decs.join(';')}`, 'Lequel de ces nombres n’est <b>pas</b> un nombre décimal ?', choice(rng, show(bad), decs.map(show)),
          'Simplifie chaque fraction, puis regarde son dénominateur : la division peut-elle se terminer ?',
          `${decs.map(exp).join(' ; ')} : ces divisions se terminent. Mais ${exp(bad)} ne se termine jamais : la réponse est <b>${show(bad)}</b>.`);
      }
      if (v === 1) {
        const c = rng.int(0, 2);
        if (c === 0) {
          const [s, n] = nonDec(rng, [3, 6, 7, 9, 11, 12], 10, 200), val = qDef(s, n, 2);
          return Q(`qa3m:${s}:${n}`, `On partage équitablement ${s} € entre ${n} personnes. Chacune reçoit la même somme, au centime près (sans dépasser). Combien reçoit chaque personne ?`, num(val, '€'),
            'Divise jusqu’aux centièmes : on ne peut pas donner plus que la part exacte.',
            `${s} ÷ ${n} = ${dots(s, n, 4)} On garde la valeur approchée par défaut au centième : <b>${fmt(val)}</b> €.`);
        }
        if (c === 1) {
          const [L, n] = nonDec(rng, [3, 6, 7, 9, 11], 50, 300), val = qArr(L, n, 1);
          return Q(`qa3f:${L}:${n}`, `Une ficelle de ${L} cm est coupée en ${n} morceaux de même longueur. Quelle est la longueur d’un morceau, arrondie au millimètre (au dixième de cm) ?`, num(val, 'cm'),
            approxHint('arr'), `${L} ÷ ${n} = ${dots(L, n, 3)} Le chiffre des centièmes est ${fl(L, n, 2) % 10}, donc l’arrondi au dixième (au millimètre) est <b>${fmt(val)}</b> cm.`);
        }
        let C, n; do { n = rng.pick([3, 6, 7, 9]); C = rng.int(150, 900); } while (isDecFrac(C, n));
        const cents = Math.floor((2 * C + n) / (2 * n)), val = dec(cents, 2);
        return Q(`qa3p:${C}:${n}`, `Un lot de ${n} bouteilles coûte ${fmt(dec(C, 2))} €. Quel est le prix d’une bouteille, arrondi au centime ?`, num(val, '€'),
          'Calcule un chiffre de plus que les centièmes, puis arrondis.',
          `${fmt(dec(C, 2))} ÷ ${n} = ${dots(C, 100 * n, 4)} Le chiffre des millièmes est ${fl(C, 100 * n, 3) % 10}, donc l’arrondi au centime est <b>${fmt(val)}</b> €.`);
      }
      if (v === 2) {
        const [a, b] = nonDec(rng, [7, 11, 13, 14, 21], 1, 99), kind = rng.pick(['def', 'exc', 'arr']);
        return Q(`qa3k:${a}/${b}:${kind}`, askApprox(kind, 3, frac(a, b)), num(approx(kind, a, b, 3)), approxHint(kind), approxCorr(kind, a, b, 3, frac(a, b)));
      }
      const [a, b] = nonDec(rng, [3, 6, 7, 9, 11], 4, 60), lo = qDef(a, b, 1), others = [];
      let guard = 0;
      while (others.length < 3 && guard++ < 200) {
        const [x, y] = nonDec(rng, [3, 6, 7, 9, 11], 4, 60);
        if (qDef(x, y, 1) !== lo && !others.some(o => o[0] === x && o[1] === y)) others.push([x, y]);
      }
      const show = ([x, y]) => frac(x, y);
      return Q(`qa3r:${a}/${b}:${others.join(';')}`, `Un quotient a pour valeur approchée par défaut au dixième ${fmt(lo)} et pour valeur approchée par excès au dixième ${fmt(qExc(a, b, 1))}. Lequel de ces nombres peut-il être ?`,
        choice(rng, show([a, b]), others.map(show)),
        'Calcule chaque quotient jusqu’aux centièmes et regarde entre quels dixièmes il se trouve.',
        `${[[a, b], ...others].map(([x, y]) => `${frac(x, y)} = ${dots(x, y, 2)}`).join(' ; ')} Seul <b>${show([a, b])}</b> est entre ${fmt(lo)} et ${fmt(qExc(a, b, 1))}.`);
    },
  });

  // ===================== REGROUPER EN CLASSES, HISTOGRAMME =====================

  const CL_THEMES = [
    { id: 'taille', intro: 'On a mesuré la taille (en cm) d’élèves du collège', noun: 'une taille', v: 't', unit: 'cm', lo: 130, w: 10, k: 5, axis: 'Taille (cm)' },
    { id: 'masse', intro: 'On a relevé la masse (en kg) des élèves d’une classe', noun: 'une masse', v: 'm', unit: 'kg', lo: 30, w: 5, k: 5, axis: 'Masse (kg)' },
    { id: 'trajet', intro: 'On a demandé aux élèves d’une classe la durée (en minutes) de leur trajet pour venir au collège', noun: 'un trajet', v: 'd', unit: 'min', lo: 0, w: 10, k: 4, axis: 'Durée (min)' },
    { id: 'lancer', intro: 'Au cours d’EPS, on a mesuré la longueur (en m) du lancer de balle de chaque élève', noun: 'un lancer', v: 'ℓ', unit: 'm', lo: 10, w: 5, k: 5, axis: 'Longueur (m)' },
  ];
  const bound = (th, i) => th.lo + i * th.w;
  const clsLab = (th, i) => `${bound(th, i)} ≤ ${th.v} &lt; ${bound(th, i + 1)}`;
  // Random effectifs (each ≥ 1) adding up to N.
  function effs(rng, k, N) {
    const e = Array(k).fill(1);
    for (let i = k; i < N; i++) e[rng.int(0, k - 1)]++;
    return e;
  }
  // Raw values matching the effectifs, with some values right on a class boundary.
  function rawData(rng, th, e) {
    const vals = [];
    e.forEach((c, i) => {
      for (let j = 0; j < c; j++) vals.push(j === 0 && i > 0 && rng.chance(0.6) ? bound(th, i) : bound(th, i) + rng.int(0, th.w - 1));
    });
    return rng.shuffle(vals);
  }
  const listHtml = arr => `<div class="calc-line">${arr.join(' ; ')}</div>`;
  const clsTable = (th, e) => ptable([[`Classe (${th.unit})`, ...e.map((_, i) => clsLab(th, i))], ['Effectif', ...e]]);

  // Histogram: adjacent bars on the classes, effectif on the vertical axis (gridline every unit).
  function histogram(th, e, { title = '', small = false } = {}) {
    const maxE = Math.max(...e), yMax = maxE + (maxE % 2 ? 1 : 2), u = small ? 9 : Math.max(11, Math.min(16, Math.floor(200 / yMax)));
    const bw = small ? 40 : 56, left = 44, top = title ? 46 : 30, ih = yMax * u;
    const W = left + e.length * bw + 70, H = top + ih + 46;
    const Y = v => top + ih - v * u;
    let b = title ? text(4, 18, title, { anchor: 'start', size: 16, cls: 's-text s-bold' }) : '';
    b += text(4, top - 14, 'Effectif', { anchor: 'start', size: 13, cls: 's-text s-bold' });
    for (let v = 0; v <= yMax; v++) {
      b += line(left, Y(v), left + e.length * bw + 16, Y(v), 's-grid');
      if (v % 2 === 0) b += text(left - 8, Y(v) + 5, fmt(v), { anchor: 'end', size: 12 });
    }
    e.forEach((c, i) => { if (c) b += rect(left + i * bw, Y(c), bw, c * u, 's-fill'); });
    for (let i = 0; i <= e.length; i++) b += text(left + i * bw, top + ih + 18, fmt(bound(th, i)), { size: 12 });
    b += line(left, top - 6, left, top + ih) + line(left, top + ih, left + e.length * bw + 22, top + ih);
    b += text(left + e.length * bw + 66, top + ih + 38, th.axis, { anchor: 'end', size: 13, cls: 's-text s-bold' });
    return svg(W, H, b);
  }

  // Pie chart from angles in degrees (labels inside the sectors).
  function pie(parts) {
    const r = 90, cx = 110, cy = 105, cls = ['s-fill', 's-soft s-line', 's-soft2 s-line', 's-empty', 's-soft s-line'];
    const P = (deg, rad) => { const a = (deg / 180) * Math.PI - Math.PI / 2; return [(cx + rad * Math.cos(a)).toFixed(1), (cy + rad * Math.sin(a)).toFixed(1)]; };
    let b = '', lab = '', acc = 0;
    parts.forEach((p, i) => {
      const [x1, y1] = P(acc, r), [x2, y2] = P(acc + p.deg, r), [lx, ly] = P(acc + p.deg / 2, r * 0.66);
      b += `<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${p.deg > 180 ? 1 : 0} 1 ${x2},${y2} Z" class="${cls[i % cls.length]}"/>`;
      lab += text(lx, Number(ly) + 5, p.label, { size: 12, cls: 's-text s-bold' });
      acc += p.deg;
    });
    return svg(220, 210, b + lab);
  }

  const EX_TH = CL_THEMES[0], EX_E = [2, 5, 8, 4, 1];
  const exHisto = histogram(EX_TH, EX_E);
  const exPie = pie(EX_E.map((c, i) => ({ deg: c * 18, label: `${c * 18}°` })));
  const PIE_N = [18, 20, 24, 30, 36, 40, 45, 60];

  M.notion('stats-classes', {
    lesson: {
      retenir: `Quand les valeurs sont nombreuses et presque toutes différentes, on les <b>regroupe en classes</b> de même amplitude, par exemple 140 ≤ t &lt; 150 (de 140 inclus à 150 exclu). L’<b>effectif d’une classe</b> est le nombre de valeurs qu’elle contient. On représente la série par un <b>histogramme</b> : des rectangles accolés, un par classe, de hauteur égale à l’effectif. Dans un <b>diagramme circulaire</b>, l’angle d’un secteur est proportionnel à l’effectif : angle = ${frac('effectif', 'effectif total')} × 360°.`,
      explication: `<p>Tailles (en cm) de 20 élèves, regroupées en classes d’amplitude 10 :</p>${clsTable(EX_TH, EX_E)}${exHisto}<p>Les rectangles se touchent car les classes se suivent : 150 est la fin de la classe 140 ≤ t &lt; 150 et le début de la suivante. Une taille de 150 cm compte dans la classe 150 ≤ t &lt; 160.</p><p>Pour le diagramme circulaire, 20 élèves correspondent à 360°, donc 1 élève correspond à 360° ÷ 20 = 18°. La classe 150 ≤ t &lt; 160 (8 élèves) a un secteur de 8 × 18° = 144°.</p>${exPie}`,
      methode: [
        'Pour trouver l’effectif d’une classe, barre les valeurs une à une et range chacune dans sa classe (attention aux bornes : la borne de droite est exclue).',
        'Vérifie que la somme des effectifs est égale à l’effectif total.',
        'Pour lire un histogramme, repère le rectangle posé sur la classe et lis sa hauteur sur l’axe des effectifs.',
        'Pour un diagramme circulaire : angle = effectif ÷ effectif total × 360°. La somme des angles fait 360°.',
      ],
      exemples: [
        { q: 'Tailles : 142 ; 150 ; 138 ; 149 ; 155 ; 140. Effectif de la classe 140 ≤ t &lt; 150 ?', r: '142, 149 et 140 → <b>3</b> (150 va dans la classe suivante, 138 dans la précédente).' },
        { q: 'Sur 30 élèves, 12 sont dans une classe. Angle de son secteur ?', r: `${frac(12, 30)} × 360° = <b>144°</b>.` },
      ],
      astuces: ['Dans un diagramme circulaire, calcule d’abord l’angle pour 1 individu : 360° ÷ effectif total.'],
      erreurs: [
        'Ranger une valeur égale à la borne de droite dans la classe : 150 n’est pas dans 140 ≤ t &lt; 150.',
        'Laisser des espaces entre les rectangles d’un histogramme : les classes se suivent, les rectangles sont accolés.',
        'Calculer effectif × 360° sans diviser par l’effectif total.',
      ],
    },
    generate(level, rng) {
      const th = rng.pick(CL_THEMES), k = th.k;
      if (level === 1) {
        const N = rng.int(14, 20), e = effs(rng, k, N), j = rng.int(0, k - 1);
        if (rng.chance(0.5)) {
          const vals = rawData(rng, th, e), inside = vals.filter(x => x >= bound(th, j) && x < bound(th, j + 1));
          const edge = vals.includes(bound(th, j + 1)) ? ` (${bound(th, j + 1)} n’en fait pas partie : il va dans la classe suivante)` : '';
          return Q(`sc1r:${th.id}:${vals}:${j}`, `${th.intro} :${listHtml(vals)}Quel est l’effectif de la classe ${clsLab(th, j)} ?`, num(inside.length),
            `Compte les valeurs au moins égales à ${bound(th, j)} et strictement inférieures à ${bound(th, j + 1)}.`,
            `Valeurs de la classe : ${inside.join(' ; ')}${edge}. L’effectif est <b>${fmt(inside.length)}</b>.`);
        }
        return Q(`sc1h:${th.id}:${e}:${j}`, `${th.intro}. Voici l’histogramme obtenu.${histogram(th, e)}Quel est l’effectif de la classe ${clsLab(th, j)} ?`, num(e[j]),
          `Repère le rectangle posé entre ${bound(th, j)} et ${bound(th, j + 1)}, puis lis sa hauteur.`,
          `Le rectangle entre ${bound(th, j)} et ${bound(th, j + 1)} monte jusqu’à ${e[j]} : l’effectif est <b>${fmt(e[j])}</b>.`);
      }
      if (level === 2) {
        const v = rng.int(0, 2);
        if (v === 0) {
          const N = rng.int(18, 28), e = effs(rng, k, N), t = rng.int(1, k - 1), below = rng.chance(0.5);
          const part = below ? e.slice(0, t) : e.slice(t), s = part.reduce((a, x) => a + x, 0);
          const ask = below ? `${th.v} &lt; ${bound(th, t)}` : `${th.v} ≥ ${bound(th, t)}`;
          return Q(`sc2s:${th.id}:${e}:${t}:${below}`, `${th.intro}. Voici l’histogramme obtenu.${histogram(th, e)}Combien d’élèves ont ${th.noun} ${ask} ?`, num(s),
            'Repère toutes les classes concernées, puis additionne leurs effectifs.',
            `Classes concernées : ${(below ? e.slice(0, t).map((_, i) => clsLab(th, i)) : e.slice(t).map((_, i) => clsLab(th, i + t))).join(' ; ')}. Total : ${part.join(' + ')} = <b>${fmt(s)}</b>.`);
        }
        if (v === 1) {
          let e;
          do e = effs(rng, k, rng.int(18, 24)); while (e.filter(x => x === Math.max(...e)).length !== 1);
          const vals = rawData(rng, th, e), j = e.indexOf(Math.max(...e)), labs = e.map((_, i) => clsLab(th, i));
          return Q(`sc2m:${th.id}:${vals}`, `${th.intro} :${listHtml(vals)}Quelle classe a le plus grand effectif ?`, fixedChoice(labs, labs[j]),
            'Range chaque valeur dans sa classe (fais un tableau), puis compare les effectifs.',
            `Effectifs : ${labs.map((l, i) => `${l} : ${e[i]}`).join(' ; ')}. La classe la plus fournie est <b>${labs[j]}</b>.`);
        }
        const N = rng.pick(PIE_N), e = effs(rng, k, N), j = rng.int(0, k - 1), deg = (e[j] * 360) / N;
        return Q(`sc2a:${th.id}:${e}:${j}`, `${th.intro} (${N} élèves).${clsTable(th, e)}On veut représenter ces données par un diagramme circulaire. Quel est l’angle du secteur de la classe ${clsLab(th, j)} ?`, num(deg, '°'),
          'Le disque entier (360°) représente l’effectif total : combien de degrés pour 1 élève ?',
          `1 élève correspond à 360° ÷ ${N} = ${fmt(360 / N)}°. Pour ${e[j]} élèves : ${frac(e[j], N)} × 360° = ${e[j]} × ${fmt(360 / N)}° = <b>${fmt(deg)}°</b>.`);
      }
      const v = rng.int(0, 2);
      if (v === 0) {
        let e; do e = effs(rng, k, rng.int(16, 26)); while (e.every(x => x === e[0]));
        let i1, i2; do { i1 = rng.int(0, k - 1); i2 = rng.int(0, k - 1); } while (i1 === i2 || e[i1] === e[i2]);
        const swapped = e.slice(); [swapped[i1], swapped[i2]] = [e[i2], e[i1]];
        const changed = e.slice(), c = rng.int(0, k - 1); changed[c] = e[c] + (e[c] > 2 && rng.chance(0.5) ? -2 : 2);
        const letters = ['A', 'B', 'C'], order = rng.shuffle([e, swapped, changed]), good = letters[order.indexOf(e)];
        const figs = `<div class="nets">${order.map((x, i) => `<div class="net">${histogram(th, x, { title: letters[i], small: true })}</div>`).join('')}</div>`;
        return Q(`sc3h:${th.id}:${e}:${i1}${i2}:${c}`, `${th.intro}.${clsTable(th, e)}Quel histogramme représente ce tableau ?${figs}`, fixedChoice(letters, good),
          'Vérifie la hauteur de chaque rectangle, classe par classe.',
          `Il faut des rectangles de hauteurs ${e.join(', ')} de gauche à droite : c’est l’histogramme <b>${good}</b>.`);
      }
      if (v === 1) {
        const N = rng.pick([20, 25, 40, 50]), e = effs(rng, k, N), t = rng.int(1, k - 1), above = rng.chance(0.5);
        const part = above ? e.slice(t) : e.slice(0, t), s = part.reduce((a, x) => a + x, 0), p = div(s * 100, N);
        const ask = above ? `${th.v} ≥ ${bound(th, t)}` : `${th.v} &lt; ${bound(th, t)}`;
        return Q(`sc3p:${th.id}:${e}:${t}:${above}`, `${th.intro} (${N} élèves). Voici l’histogramme obtenu.${histogram(th, e)}Quel pourcentage des élèves ont ${th.noun} ${ask} ?`, num(p, '%'),
          'Additionne les effectifs des classes concernées, puis calcule la fréquence en pourcentage.',
          `Effectif concerné : ${part.join(' + ')} = ${s}. Fréquence : ${frac(s, N)} = ${frac(fmt(p), 100)} = <b>${fmt(p)} %</b>.`);
      }
      const N = rng.pick(PIE_N), e = effs(rng, k, N), j = rng.int(0, k - 1), deg = (e[j] * 360) / N;
      return Q(`sc3a:${th.id}:${N}:${e[j]}:${j}`, `${th.intro} (${N} élèves), puis on a regroupé les valeurs en classes et tracé un diagramme circulaire. Le secteur de la classe ${clsLab(th, j)} mesure ${fmt(deg)}°. Combien d’élèves sont dans cette classe ?`, num(e[j]),
        `Le disque entier (360°) représente les ${N} élèves : combien de degrés pour 1 élève ?`,
        `1 élève correspond à 360° ÷ ${N} = ${fmt(360 / N)}°. Donc ${fmt(deg)}° ÷ ${fmt(360 / N)}° = <b>${fmt(e[j])}</b> élèves.`);
    },
  });

  // ===================== EXPLANATIONS =====================

  M.explain('divisibilite-4', [
    ['lien', B],
    ['vie', '<p>Les années <b>bissextiles</b> (celles qui ont un 29 février) sont, en général, les années divisibles par 4. 2028 se termine par 28 = 4 × 7 : ce sera une année bissextile. 2030 se termine par 30, qui n’est pas dans la table de 4 : pas de 29 février cette année-là. (Exception : les années comme 1900, divisibles par 100 mais pas par 400, ne sont pas bissextiles.)</p>'],
    ['etapes', '<p>Pour 7 524 :</p><ol><li>Je cache tout sauf les deux derniers chiffres : 24.</li><li>Je cherche 24 dans la table de 4 : 4 × 6 = 24.</li><li>24 est divisible par 4, donc 7 524 aussi.</li></ol><p>Pour 7 542 : 42 = 4 × 10 + 2, donc 7 542 n’est pas divisible par 4.</p>'],
  ]);
  M.explain('frac-produit', [
    ['dessin', B],
    ['vie', `<p>Une recette demande ${frac(3, 4)} de litre de lait, mais tu ne fais que la <b>moitié</b> de la recette. Il te faut la moitié de ${frac(3, 4)} L, c’est-à-dire ${frac(1, 2)} × ${frac(3, 4)} = ${frac(3, 8)} L. Le mot « de » dans « la moitié de », « les deux tiers de » se traduit par une multiplication.</p>`],
    ['etapes', `<p>Pour ${frac(10, 9)} × ${frac(3, 25)} :</p><ol><li>J’écris une seule fraction : ${frac('10 × 3', '9 × 25')}.</li><li>Je décompose : ${frac('2 × 5 × 3', '3 × 3 × 5 × 5')}.</li><li>Je barre ce qui est en haut et en bas (un 5 et un 3) : ${frac(2, 15)}.</li></ol><p>C’est plus rapide que de calculer ${frac(30, 225)} puis de simplifier.</p>`],
  ]);
  M.explain('quotient-approche', [
    ['etapes', B],
    ['vie', '<p>Trois amis se partagent 10 € à parts égales. Chacun devrait recevoir 10 ÷ 3 = 3,333… €, mais il n’existe pas de pièce plus petite que le centime. Chacun reçoit donc <b>3,33 €</b> (valeur par défaut au centième), et il reste 1 centime qu’on ne peut pas partager.</p>'],
    ['dessin', `${decLine}<p>Entre 3,3 et 3,4, on a placé 10 ÷ 3 = 3,333… Il est juste après 3,33 et avant 3,34. 3,3 est sa valeur approchée par défaut au dixième, 3,4 sa valeur par excès. Il est plus proche de 3,3 : c’est l’arrondi au dixième.</p>`],
  ]);
  M.explain('stats-classes', [
    ['dessin', B],
    ['vie', '<p>Un médecin scolaire mesure 200 élèves : presque toutes les tailles sont différentes, un tableau avec chaque taille serait illisible. En regroupant par tranches de 10 cm (de 140 à 150, de 150 à 160…), on voit tout de suite quelle tranche est la plus fréquente. C’est comme ranger des chaussettes dans des tiroirs : chaque valeur va dans un seul tiroir.</p>'],
    ['etapes', `<p>Pour le secteur d’une classe de 9 élèves sur 30 :</p><ol><li>Le disque entier (360°) représente les 30 élèves.</li><li>Pour 1 élève : 360° ÷ 30 = 12°.</li><li>Pour 9 élèves : 9 × 12° = <b>108°</b>.</li><li>Je vérifie à la fin que la somme des angles de tous les secteurs fait 360°.</li></ol>`],
  ]);
})();
