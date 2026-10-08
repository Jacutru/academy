// 6e: "Quarts, demis, nombres mixtes", "Motifs et schémas en barres", "Suivre un programme".
(function () {
  'use strict';
  const M = globalThis.M;
  const { fmt, dec, div, gcd } = M.u;
  const { frac, hole, table } = M.h;
  const { Q, num, choice, fixedChoice, order } = M.kit;
  const R = M.svg.raw;

  const F = (n, d) => ({ kind: 'fraction', n, d });

  // ===================== QUARTS, DEMIS, NOMBRES MIXTES =====================
  // A number of quarters shown in its usual form: 2/4 → 1/2, 4/4 → 1, 6/4 → 3/2…
  const quarter = q => (q % 4 === 0 ? fmt(q / 4) : q % 2 === 0 ? frac(q / 2, 2) : frac(q, 4));
  // Mixed form of n/d (n not a multiple of d): "e + r/d" (or just "r/d" when e = 0).
  const mixed = (n, d) => {
    const e = Math.floor(n / d), r = n % d;
    if (!r) return fmt(e);
    return e ? `${fmt(e)} + ${frac(r, d)}` : frac(r, d);
  };
  const D600 = 600;   // lcm of every denominator used for ordering: exact comparisons with integers.

  M.notion('fractions-reperes', {
    lesson: {
      retenir: `<ul><li>${frac(1, 2)} + ${frac(1, 2)} = 1 ; ${frac(1, 4)} + ${frac(1, 4)} = ${frac(1, 2)} ; ${frac(1, 4)} + ${frac(3, 4)} = 1.</li><li>${frac(1, 4)} = 0,25 ; ${frac(1, 2)} = 0,5 ; ${frac(3, 4)} = 0,75 ; ${frac(3, 2)} = 1,5 ; ${frac(4, 2)} = 2 ; ${frac(5, 2)} = 2,5.</li><li>1 = ${frac(10, 10)} = ${frac(100, 100)} = ${frac(1000, 1000)} ; ${frac(1, 10)} = ${frac(10, 100)} = 0,1 ; ${frac(1, 100)} = ${frac(10, 1000)} = 0,01.</li><li>Une fraction plus grande que 1 peut s’écrire comme un <b>nombre mixte</b> : un entier + une fraction plus petite que 1. ${frac(17, 5)} = 3 + ${frac(2, 5)}.</li><li>a ⩽ b se lit « a est <b>inférieur ou égal</b> à b » ; a ⩾ b se lit « a est <b>supérieur ou égal</b> à b ».</li></ul>`,
      explication: `${M.svg.fractionBar(3, 4)}<p>La barre vaut 1. Trois quarts sont coloriés : ${frac(3, 4)}. Il manque un quart pour faire 1 : 1 − ${frac(1, 4)} = ${frac(3, 4)}. Deux quarts, c’est la moitié : ${frac(2, 4)} = ${frac(1, 2)}.</p>${M.svg.fractionBar(11, 4)}<p>Ici, 2 barres entières et 3 quarts : ${frac(11, 4)} = 2 + ${frac(3, 4)}, car 2 = ${frac(8, 4)}.</p>`,
      methode: [
        `Pour calculer avec des demis et des quarts, pense en <b>quarts</b> : ${frac(1, 2)} = ${frac(2, 4)} et 1 = ${frac(4, 4)}.`,
        `Pour passer d’une fraction à un nombre mixte : cherche combien de fois le dénominateur « rentre » dans le numérateur. ${frac(17, 5)} : 17 = 3 × 5 + 2, donc ${frac(17, 5)} = 3 + ${frac(2, 5)}.`,
        `Pour passer d’un nombre mixte à une fraction : écris l’entier avec le même dénominateur. 2 + ${frac(3, 4)} = ${frac(8, 4)} + ${frac(3, 4)} = ${frac(11, 4)}.`,
        'Pour ranger des fractions et des nombres mixtes : situe d’abord chaque nombre entre deux entiers qui se suivent, puis compare ceux qui sont entre les mêmes entiers.',
      ],
      exemples: [
        { q: `${frac(1, 2)} + ${frac(3, 4)}`, r: `${frac(2, 4)} + ${frac(3, 4)} = ${frac(5, 4)} = <b>1 + ${frac(1, 4)}</b>.` },
        { q: `${frac(1, 10)} = ${frac(hole, 100)}`, r: `1 dixième = 10 centièmes : ${frac(1, 10)} = ${frac('<b>10</b>', 100)}.` },
        { q: `Range : ${frac(7, 4)} ; 1,5 ; 1 + ${frac(1, 3)}`, r: `1,5 = 1 + ${frac(1, 2)} et ${frac(7, 4)} = 1 + ${frac(3, 4)}. Tous sont entre 1 et 2 ; ${frac(1, 3)} &lt; ${frac(1, 2)} &lt; ${frac(3, 4)}, donc 1 + ${frac(1, 3)} &lt; 1,5 &lt; ${frac(7, 4)}.` },
      ],
      astuces: [`${frac(1, 4)} est la moitié de la moitié : 0,5 ÷ 2 = 0,25.`, 'Pense aux pièces : 4 pièces de 25 centimes font 1 €.'],
      erreurs: [`${frac(1, 4)} ≠ 1,4 et ${frac(3, 4)} ≠ 3,4 : ${frac(1, 4)} = 1 ÷ 4 = 0,25.`, `${frac(1, 2)} + ${frac(1, 4)} ≠ ${frac(2, 6)} : on n’additionne pas les dénominateurs. C’est ${frac(3, 4)}.`],
    },
    generate(level, rng) {
      if (level === 1) {
        if (rng.chance(0.6)) {
          // Relations between 1/4, 1/2, 3/4 and 1, all counted in quarters.
          const plus = rng.chance(0.5);
          let a, b;
          do { a = rng.int(1, 4); b = rng.int(1, 4); } while (plus ? a + b > 7 : a <= b);
          const r = plus ? a + b : a - b, op = plus ? '+' : '−';
          const shown = quarter(r), inQuarters = frac(r, 4);
          const extra = r > 4 && r % 4 ? ` = 1 + ${quarter(r - 4)}` : '';
          return Q(`fr1:${a}${op}${b}`, `${quarter(a)} ${op} ${quarter(b)} = ?`, F(r / gcd(r, 4), 4 / gcd(r, 4)),
            `Pense en quarts : ${frac(1, 2)} = ${frac(2, 4)} et 1 = ${frac(4, 4)}.`,
            `${frac(a, 4)} ${op} ${frac(b, 4)} = ${shown !== inQuarters ? `${inQuarters} = <b>${shown}</b>` : `<b>${inQuarters}</b>`}${extra}.`);
        }
        const [n, d] = rng.pick([[1, 4], [1, 2], [3, 4], [3, 2], [4, 2], [5, 2], [1, 10], [5, 4]]);
        const v = div(n, d);
        if (rng.chance(0.3) && d === 4 && n < 4) {
          return Q(`fr1r:${n}/${d}`, `${fmt(v)} = ${frac(hole, 4)}`, num(n), `Combien de fois 0,25 dans ${fmt(v)} ?`, `${fmt(v)} = ${fmt(n)} × 0,25, donc ${fmt(v)} = ${frac(`<b>${fmt(n)}</b>`, 4)}.`);
        }
        return Q(`fr1d:${n}/${d}`, `Écriture décimale de ${frac(n, d)} ?`, num(v), d === 4 ? `Un quart, c’est la moitié d’un demi.` : d === 2 ? 'Un demi, c’est 0,5.' : 'Un dixième…',
          `${frac(n, d)} = ${fmt(n)} ÷ ${fmt(d)} = <b>${fmt(v)}</b>.`);
      }
      if (level === 2) {
        const t = rng.int(0, 2);
        if (t === 0) {
          // Tenths, hundredths, thousandths and 1.
          const forms = [
            () => { const d = rng.pick([10, 100, 1000]); return [`1 = ${frac(hole, d)}`, d, `1 = ${frac(d, d)} : il faut <b>${fmt(d)}</b> ${d === 10 ? 'dixièmes' : d === 100 ? 'centièmes' : 'millièmes'} pour faire une unité.`, `fr2u:${d}`]; },
            () => { const k = rng.int(1, 9); return [`${frac(k, 10)} = ${frac(hole, 100)}`, 10 * k, `1 dixième = 10 centièmes, donc ${frac(k, 10)} = ${frac(10 * k, 100)} : <b>${fmt(10 * k)}</b>.`, `fr2t:${k}`]; },
            () => { const k = rng.int(1, 9); return [`${frac(k, 100)} = ${frac(hole, 1000)}`, 10 * k, `1 centième = 10 millièmes, donc ${frac(k, 100)} = ${frac(10 * k, 1000)} : <b>${fmt(10 * k)}</b>.`, `fr2h:${k}`]; },
            () => { const [k, d] = rng.pick([[1, 10], [1, 100], [1, 1000], [rng.int(2, 9), 10], [rng.int(2, 9), 100], [rng.int(11, 99), 100], [rng.int(2, 9), 1000]]); const v = div(k, d); return [`Écriture décimale de ${frac(k, d)} ?`, v, `${frac(k, d)} = ${fmt(k)} ${d === 10 ? 'dixième' : d === 100 ? 'centième' : 'millième'}${k > 1 ? 's' : ''} = <b>${fmt(v)}</b>.`, `fr2d:${k}/${d}`]; },
            () => { return [`${frac(1, 10)} = ${frac(hole, 1000)}`, 100, `1 dixième = 10 centièmes = 100 millièmes : <b>${fmt(100)}</b>.`, 'fr2m']; },
          ];
          const [prompt, v, corr, key] = rng.pick(forms)();
          return Q(key, prompt, num(v), 'Pense aux rangs : unités, dixièmes, centièmes, millièmes. Chaque rang vaut dix fois le rang suivant.', corr);
        }
        if (t === 1) {
          const d = rng.pick([2, 3, 4, 5, 6, 8, 10]), e = rng.int(1, 5), r = rng.int(1, d - 1), n = e * d + r;
          if (rng.chance(0.5)) {
            return Q(`fr2a:${n}/${d}`, `${frac(n, d)} = ${hole} + ${frac(r, d)}`, num(e), `Combien de fois ${d} dans ${n} ?`,
              `${n} = ${e} × ${d} + ${r}, donc ${frac(n, d)} = ${frac(e * d, d)} + ${frac(r, d)} = <b>${fmt(e)}</b> + ${frac(r, d)}.`);
          }
          return Q(`fr2b:${e}+${r}/${d}`, `${e} + ${frac(r, d)} = ${frac(hole, d)}`, num(n), `Écris ${e} avec le dénominateur ${d}.`,
            `${e} = ${frac(e * d, d)}, donc ${e} + ${frac(r, d)} = ${frac(e * d, d)} + ${frac(r, d)} = ${frac(`<b>${fmt(n)}</b>`, d)}.`);
        }
        // True or false with ⩽ / ⩾ (equality included).
        const [n, d] = rng.pick([[1, 4], [1, 2], [3, 4], [3, 2], [5, 2], [5, 4], [7, 4], [7, 2], [1, 10], [9, 10], [3, 10]]);
        const v = div(n, d);
        const w = rng.pick([v, v, dec(Math.round(v * 100) + rng.pick([-25, -10, 10, 25, 50]), 2)].filter(x => x > 0));
        const sym = rng.pick(['⩽', '⩾']);
        const truth = sym === '⩽' ? v <= w : v >= w;
        const rel = v === w ? '=' : v < w ? '&lt;' : '&gt;';
        return Q(`fr2c:${n}/${d}${sym}${w}`, `Vrai ou faux ? &nbsp; ${frac(n, d)} ${sym} ${fmt(w)}`, fixedChoice(['Vrai', 'Faux'], truth ? 'Vrai' : 'Faux'),
          `Écris d’abord ${frac(n, d)} en écriture décimale. Attention : « ${sym} » veut dire « ${sym === '⩽' ? 'inférieur' : 'supérieur'} <b>ou égal</b> ».`,
          `${frac(n, d)} = ${fmt(v)} et ${fmt(v)} ${rel} ${fmt(w)}. « ${sym} » veut dire « ${sym === '⩽' ? 'inférieur' : 'supérieur'} ou égal », donc c’est <b>${truth ? 'vrai' : 'faux'}</b>.`);
      }
      if (rng.chance(0.6)) {
        // Order a list mixing fractions, mixed numbers, decimals and integers.
        const count = rng.int(4, 5), seen = new Map();
        let guard = 0;
        while (seen.size < count && guard++ < 200) {
          const d = rng.pick([2, 3, 4, 5, 6, 8, 10, 100]);
          const n = d === 100 ? rng.pick([rng.int(90, 110), rng.int(140, 260)]) : rng.int(Math.ceil(d / 2), 3 * d);
          const v = (n * D600) / d;
          if (seen.has(v) || (n % d && gcd(n, d) !== 1)) continue;
          let html;
          if (n % d === 0) html = fmt(n / d);
          else {
            const forms = ['frac', 'mixed'];
            if ([2, 4, 5, 10].includes(d)) forms.push('dec');
            const f = rng.pick(forms);
            html = f === 'frac' ? frac(n, d) : f === 'dec' ? fmt(div(n, d)) : mixed(n, d);
          }
          seen.set(v, { html, n, d });
        }
        const values = [...seen.keys()];
        const desc = rng.chance(0.4);
        const ans = order(values, v => seen.get(v).html, { desc });
        const sorted = values.slice().sort((a, b) => (desc ? b - a : a - b));
        const detail = sorted.map(v => { const { html, n, d } = seen.get(v); const m = mixed(n, d); return m === html || n % d === 0 ? html : `${html} = ${m}`; });
        return Q(`fr3o:${values.join(',')}:${desc}`, `Range dans l’ordre <b>${desc ? 'décroissant' : 'croissant'}</b>.`, ans,
          'Situe chaque nombre entre deux entiers qui se suivent (écris les fractions comme des nombres mixtes).',
          `${detail.join(' ; ')}.<br>Donc <b>${sorted.map(v => seen.get(v).html).join(desc ? ' &gt; ' : ' &lt; ')}</b>.`);
      }
      // Compare a fraction with a mixed number.
      const d = rng.pick([3, 4, 5, 6, 8, 10]), e = rng.int(1, 4), r = rng.int(1, d - 1);
      const k = rng.pick([1, 1, 2]), d2 = d * k;
      const n2 = (e * d + r) * k + rng.pick([-1, 0, 0, 1]);
      const L = e * d2 + r * k, s = n2 < L ? '<' : n2 > L ? '>' : '=';
      const sh = s === '<' ? '&lt;' : s === '>' ? '&gt;' : '=';
      return Q(`fr3c:${n2}/${d2}:${e}+${r}/${d}`, `Compare : ${frac(n2, d2)} &nbsp;…&nbsp; ${e} + ${frac(r, d)}`, fixedChoice(['<', '=', '>'], s),
        `Écris ${e} + ${frac(r, d)} comme une seule fraction de dénominateur ${d2}.`,
        `${e} + ${frac(r, d)} = ${frac(e * d2, d2)} + ${frac(r * k, d2)} = ${frac(L, d2)}. Donc ${frac(n2, d2)} <b>${sh}</b> ${e} + ${frac(r, d)}.`);
    },
  });

  // ===================== MOTIFS ET SCHÉMAS EN BARRES =====================
  // Matchstick patterns: a row of squares (3n + 1) or of little houses (5n + 1).
  function matchStep(kind, n, x0, base) {
    const c = 22, roof = 14;
    let b = '';
    for (let i = 0; i < n; i++) {
      const x = x0 + i * c;
      b += R.line(x, base, x + c, base, 's-line s-thick') + R.line(x, base - c, x + c, base - c, 's-line s-thick');
      if (kind === 'maisons') b += R.line(x, base - c, x + c / 2, base - c - roof, 's-line s-thick') + R.line(x + c / 2, base - c - roof, x + c, base - c, 's-line s-thick');
    }
    for (let i = 0; i <= n; i++) b += R.line(x0 + i * c, base, x0 + i * c, base - c, 's-line s-thick');
    return b;
  }
  function matchFigure(kind, steps = 3) {
    let x = 14, body = '';
    for (let n = 1; n <= steps; n++) {
      body += matchStep(kind, n, x, 62) + R.text(x + (n * 22) / 2, 84, `Étape ${n}`, { size: 13 });
      x += n * 22 + 40;
    }
    return R.svg(x - 20, 92, body);
  }
  const PATTERNS = [
    { kind: 'carres', s: 4, k: 3, what: 'allumettes', intro: 'On aligne des carrés faits avec des allumettes.' },
    { kind: 'maisons', s: 6, k: 5, what: 'allumettes', intro: 'On fabrique des petites maisons avec des allumettes.' },
  ];
  const UNITS = ['jetons', 'cubes', 'perles', 'carreaux'];
  function pattern(rng) {
    if (rng.chance(0.4)) {
      const p = rng.pick(PATTERNS);
      return { ...p, fig: matchFigure(p.kind) };
    }
    const s = rng.int(2, 9), k = rng.int(2, 6), what = rng.pick(UNITS);
    const fig = table([['Étape', 1, 2, 3], [`Nombre ${de(what)}`, s, s + k, s + 2 * k]]);
    return { kind: `t${s}-${k}`, s, k, what, intro: `Voici une suite de motifs : à chaque étape, on ajoute toujours le même nombre ${de(what)}.`, fig };
  }

  // Balance: items are 'box' (unknown) or a number of kg.
  function balance(left, right) {
    const W = 400, by = 96;
    let body = R.line(10, by, W - 10, by, 's-line s-thick') + R.poly([[W / 2, by], [W / 2 - 18, by + 34], [W / 2 + 18, by + 34]], 's-soft s-line');
    const side = (items, cx) => {
      const ws = items.map(it => (it === 'box' ? 30 : 52));
      let x = cx - (ws.reduce((a, b) => a + b, 0) - 4) / 2, out = '';
      items.forEach((it, i) => {
        const w = ws[i] - 4, h = it === 'box' ? 26 : 34;
        out += `<rect x="${x}" y="${by - h}" width="${w}" height="${h}" class="${it === 'box' ? 's-soft s-line' : 's-soft2 s-line'}"/>`;
        out += R.text(x + w / 2, by - h / 2 + 5, it === 'box' ? '?' : `${fmt(it)} kg`, { size: 13, cls: 's-text s-bold' });
        x += ws[i];
      });
      return out;
    };
    body += side(left, W / 4 + 5) + side(right, (3 * W) / 4 - 5);
    return R.svg(W, by + 40, body);
  }
  const boxes = n => Array(n).fill('box');

  // Bar model: rows [{ label, parts:[{w, text, cls}] }], optional total brace on the right.
  function bars(rows, total) {
    const unit = 34, x0 = 70, rh = 30, gap = 12;
    let body = '', maxX = 0;
    rows.forEach((row, i) => {
      const y = 10 + i * (rh + gap);
      body += R.text(x0 - 8, y + rh / 2 + 5, row.label, { anchor: 'end', size: 14 });
      let x = x0;
      row.parts.forEach(p => {
        const w = p.w * unit;
        body += `<rect x="${x}" y="${y}" width="${w}" height="${rh}" class="${p.cls || 's-soft'} s-line"/>`;
        if (p.text) body += R.text(x + w / 2, y + rh / 2 + 5, p.text, { size: 13 });
        x += w;
      });
      maxX = Math.max(maxX, x);
    });
    const H = 10 + rows.length * (rh + gap);
    if (total) {
      body += R.line(maxX + 10, 10, maxX + 18, 10) + R.line(maxX + 18, 10, maxX + 18, H - gap) + R.line(maxX + 10, H - gap, maxX + 18, H - gap);
      body += R.text(maxX + 24, (H - gap) / 2 + 15, total, { anchor: 'start', size: 14, cls: 's-text s-bold' });
    }
    return R.svg(maxX + (total ? 90 : 20), H + 6, body);
  }
  const de = w => (/^[aeiouyéèêàâîôûh]/i.test(w) ? `d’${w}` : `de ${w}`);
  const que = w => (/^[aeiouyéèêàâîôûh]/i.test(w) ? `qu’${w}` : `que ${w}`);
  const NAMES = [['Léa', 'Tom'], ['Inès', 'Hugo'], ['Sami', 'Jade'], ['Noé', 'Lina'], ['Emma', 'Adam']];
  const THINGS = ['billes', 'cartes', 'timbres', 'images', 'coquillages'];

  M.notion('pre-algebre', {
    lesson: {
      retenir: `<ul><li>Dans un <b>motif évolutif</b>, on cherche ce qui se répète : souvent, on ajoute <b>toujours le même nombre</b> d’éléments d’une étape à la suivante. Pour aller loin, on n’a pas besoin de tout dessiner : il suffit de compter combien de fois on ajoute.</li><li>Un <b>schéma en barres</b> représente les quantités par des barres : une même quantité inconnue est représentée par des barres de même longueur. Il aide à voir le calcul à faire.</li><li>Une <b>balance</b> en équilibre porte la même masse des deux côtés ; si on enlève la même chose des deux côtés, elle reste en équilibre.</li></ul>`,
      explication: `<p>Léa a 3 fois plus de billes que Tom. À eux deux, ils en ont 48. Combien Tom en a-t-il ?</p>${bars([{ label: 'Tom', parts: [{ w: 1, text: '?', cls: 's-fill' }] }, { label: 'Léa', parts: [{ w: 1, text: '?' }, { w: 1, text: '?' }, { w: 1, text: '?' }] }], '48')}<p>On voit 4 barres identiques pour 48 billes : une barre vaut 48 ÷ 4 = 12. Tom a 12 billes, Léa en a 3 × 12 = 36. Vérification : 12 + 36 = 48.</p>`,
      methode: [
        'Motif : compte les éléments aux premières étapes et regarde de combien ils augmentent à chaque fois.',
        'Pour l’étape 10 : de l’étape 1 à l’étape 10, on ajoute 9 fois. Nombre = (nombre à l’étape 1) + 9 × (ce qu’on ajoute).',
        'Schéma en barres : dessine une barre par quantité, de même longueur pour des quantités égales, puis cherche ce que vaut une barre.',
        'Balance : enlève la même chose des deux côtés jusqu’à ce qu’il ne reste que des boîtes d’un côté et des kilogrammes de l’autre.',
        'Vérifie toujours ta réponse avec l’énoncé.',
      ],
      exemples: [
        { q: `${matchFigure('carres')}Combien d’allumettes à l’étape 10 ?`, r: 'On commence à 4 et on ajoute 3 allumettes à chaque étape. De l’étape 1 à l’étape 10, on ajoute 9 fois 3 : 4 + 9 × 3 = <b>31</b> allumettes.' },
        { q: `${balance(['box', 'box', 'box', 2], [14])}Combien pèse une boîte ?`, r: 'On enlève 2 kg de chaque côté : 3 boîtes pèsent 12 kg. Une boîte pèse 12 ÷ 3 = <b>4 kg</b>.' },
      ],
      astuces: ['Un tableau (étape, nombre d’éléments) aide à voir la régularité.'],
      erreurs: ['Pour l’étape 10, faire 10 × 3 + 4 : on n’ajoute que 9 fois, car l’étape 1 est déjà comptée.', '« 3 fois plus » : ne pas oublier la barre de l’autre personne. Ici, il y a 3 + 1 = 4 barres.'],
    },
    generate(level, rng) {
      const motif = rng.chance(level === 1 ? 0.55 : 0.4);
      if (motif) {
        const p = pattern(rng);
        const at = n => p.s + (n - 1) * p.k;
        if (level === 3 && rng.chance(0.5)) {
          const n = rng.int(8, 30);
          return Q(`pa3i:${p.kind}:${n}`, `${p.intro}${p.fig}À quelle étape faut-il exactement ${fmt(at(n))} ${p.what} ?`, num(n),
            `Enlève d’abord le nombre ${de(p.what)} de l’étape 1, puis cherche combien de fois on a ajouté.`,
            `${fmt(at(n))} − ${p.s} = ${fmt(at(n) - p.s)} ; ${fmt(at(n) - p.s)} ÷ ${p.k} = ${n - 1} : on a ajouté ${n - 1} fois ${p.k}. C’est donc l’étape <b>${fmt(n)}</b>.`);
        }
        const n = level === 1 ? rng.int(4, 6) : level === 2 ? rng.int(10, 20) : rng.pick([25, 30, 40, 50, 100]);
        const corr = level === 1
          ? `On ajoute ${p.k} ${p.what} à chaque étape : ${[...Array(n).keys()].map(i => fmt(at(i + 1))).join(' ; ')}. À l’étape ${n}, il y a <b>${fmt(at(n))}</b> ${p.what}.`
          : `On commence avec ${p.s} ${p.what} et on ajoute ${p.k} à chaque étape. De l’étape 1 à l’étape ${n}, on ajoute ${n - 1} fois : ${p.s} + ${n - 1} × ${p.k} = <b>${fmt(at(n))}</b> ${p.what}.`;
        return Q(`pa:${p.kind}:${n}`, `${p.intro}${p.fig}Combien ${de(p.what)} faut-il pour l’étape ${n} ?`, num(at(n)),
          level === 1 ? `Combien ${de(p.what)} ajoute-t-on d’une étape à la suivante ?` : `Combien de fois ajoute-t-on des ${p.what} entre l’étape 1 et l’étape ${n} ?`, corr);
      }
      if (level === 1) {
        const n = rng.int(2, 5), c = rng.int(2, 12), w = rng.pick([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].filter(v => v !== c)), tot = n * c + w;
        return Q(`pa1b:${n}:${c}:${w}`, `${balance([...boxes(n), w], [tot])}La balance est en équilibre. Les boîtes sont identiques. Combien pèse une boîte (en kg) ?`, num(c, 'kg'),
          `Enlève ${fmt(w)} kg de chaque côté.`,
          `On enlève ${fmt(w)} kg de chaque côté : ${n} boîtes pèsent ${fmt(tot)} − ${fmt(w)} = ${fmt(n * c)} kg. Une boîte pèse ${fmt(n * c)} ÷ ${n} = <b>${fmt(c)} kg</b>.`);
      }
      const [A, B] = rng.pick(NAMES), thing = rng.pick(THINGS);
      if (level === 2) {
        if (rng.chance(0.5)) {
          const k = rng.int(2, 5), x = rng.int(4, 25), tot = x * (k + 1), askBig = rng.chance(0.5);
          const fig = bars([{ label: B, parts: [{ w: 1, text: fmt(x), cls: 's-fill' }] }, { label: A, parts: Array(k).fill({ w: 1, text: fmt(x) }) }], fmt(tot));
          const v = askBig ? k * x : x;
          return Q(`pa2k:${k}:${x}:${askBig}`, `${A} a ${k} fois plus ${de(thing)} ${que(B)}. À eux deux, ils en ont ${fmt(tot)}. Combien ${de(thing)} possède ${askBig ? A : B} ?`, num(v),
            `Dessine une barre pour ${B} et ${k} barres de même longueur pour ${A}.`,
            `${fig}Il y a ${k} + 1 = ${k + 1} barres identiques : une barre vaut ${fmt(tot)} ÷ ${k + 1} = ${fmt(x)}. ${B} a ${fmt(x)} ${thing}${askBig ? `, et ${A} en a ${k} × ${fmt(x)}` : ''} : <b>${fmt(v)}</b>.`);
        }
        const x = rng.int(5, 40), dd = rng.int(3, 20), tot = 2 * x + dd, askBig = rng.chance(0.5), v = askBig ? x + dd : x;
        const fig = bars([{ label: B, parts: [{ w: 3, text: '?', cls: 's-fill' }] }, { label: A, parts: [{ w: 3, text: '?', cls: 's-fill' }, { w: 1.4, text: fmt(dd), cls: 's-soft2' }] }], fmt(tot));
        return Q(`pa2d:${x}:${dd}:${askBig}`, `${A} a ${fmt(dd)} ${thing} de plus ${que(B)}. À eux deux, ils en ont ${fmt(tot)}. Combien ${de(thing)} possède ${askBig ? A : B} ?`, num(v),
          `Dessine deux barres de même longueur, et ajoute un morceau à celle de ${A}.`,
          `${fig}Sans le morceau de ${fmt(dd)}, il reste ${fmt(tot)} − ${fmt(dd)} = ${fmt(2 * x)}, soit deux barres égales : ${fmt(2 * x)} ÷ 2 = ${fmt(x)}. ${B} a ${fmt(x)} ${thing}${askBig ? `, et ${A} en a ${fmt(x)} + ${fmt(dd)}` : ''} : <b>${fmt(v)}</b>.`);
      }
      if (rng.chance(0.5)) {
        // Three prizes (Eduscol example): gold = silver + a, bronze = silver − b.
        const s = 10 * rng.int(6, 20), a = 10 * rng.int(2, 9), b = 10 * rng.int(1, 5), tot = 3 * s + a - b;
        const ask = rng.pick(['or', 'argent', 'bronze']), v = { or: s + a, argent: s, bronze: s - b }[ask];
        const fig = bars([
          { label: 'Or', parts: [{ w: 3, text: '?', cls: 's-fill' }, { w: 1.4, text: `${fmt(a)} €`, cls: 's-soft2' }] },
          { label: 'Argent', parts: [{ w: 3, text: '?', cls: 's-fill' }] },
          { label: 'Bronze', parts: [{ w: 1.6, text: '', cls: 's-fill' }, { w: 1.4, text: `− ${fmt(b)} €`, cls: 's-empty s-dash' }] },
        ], `${fmt(tot)} €`);
        return Q(`pa3p:${s}:${a}:${b}:${ask}`, `Une prime de ${fmt(tot)} € est partagée entre les trois premiers d’une course. La prime d’or vaut ${fmt(a)} € de plus que la prime d’argent ; la prime de bronze vaut ${fmt(b)} € de moins que la prime d’argent. Combien vaut la prime ${ask === 'or' ? 'd’or' : ask === 'argent' ? 'd’argent' : 'de bronze'} (en €) ?`, num(v, '€'),
          'Dessine trois barres à partir de celle de la prime d’argent.',
          `${fig}Si on enlève les ${fmt(a)} € de plus et qu’on rajoute les ${fmt(b)} € qui manquent, on a 3 fois la prime d’argent : ${fmt(tot)} − ${fmt(a)} + ${fmt(b)} = ${fmt(3 * s)}. Prime d’argent : ${fmt(3 * s)} ÷ 3 = ${fmt(s)} €. Prime d’or : ${fmt(s + a)} € ; prime de bronze : ${fmt(s - b)} €. Réponse : <b>${fmt(v)} €</b>.`);
      }
      // Balance with boxes on both sides.
      const c = rng.int(2, 9), b2 = rng.int(1, 3), a2 = b2 + rng.int(1, 3), w1 = rng.int(1, 9), w2 = w1 + (a2 - b2) * c;
      return Q(`pa3b:${a2}:${b2}:${c}:${w1}`, `${balance([...boxes(a2), w1], [...boxes(b2), w2])}La balance est en équilibre. Les boîtes sont identiques. Combien pèse une boîte (en kg) ?`, num(c, 'kg'),
        'Enlève la même chose des deux côtés : d’abord des boîtes, puis des kilogrammes.',
        `On enlève ${b2} boîte${b2 > 1 ? 's' : ''} de chaque côté : ${a2 - b2} boîte${a2 - b2 > 1 ? 's' : ''} + ${fmt(w1)} kg = ${fmt(w2)} kg. On enlève ${fmt(w1)} kg : ${a2 - b2} boîte${a2 - b2 > 1 ? 's pèsent' : ' pèse'} ${fmt(w2 - w1)} kg. Une boîte pèse <b>${fmt(c)} kg</b>.`);
    },
  });

  // ===================== SUIVRE UN PROGRAMME =====================
  const OPS = {
    '+': { say: v => `ajoute ${fmt(v)}`, run: (x, v) => x + v, sym: '+' },
    '−': { say: v => `soustrais ${fmt(v)}`, run: (x, v) => x - v, sym: '−' },
    '×': { say: v => `multiplie par ${fmt(v)}`, run: (x, v) => x * v, sym: '×' },
  };
  // Runs a programme [[op, v], …] from x; returns the list of successive values.
  const runProg = (x, prog) => prog.reduce((acc, [op, v]) => acc.concat(OPS[op].run(acc[acc.length - 1], v)), [x]);
  const progList = (x, prog) => `<ol><li>Choisis ${x === null ? 'un nombre' : `le nombre ${fmt(x)}`}.</li>${prog.map(([op, v]) => `<li>${OPS[op].say(v).replace(/^./, c => c.toUpperCase())}.</li>`).join('')}<li>Écris le résultat.</li></ol>`;
  const trace = (vals, prog) => prog.map(([op, v], i) => `${fmt(vals[i])} ${OPS[op].sym} ${fmt(v)} = ${fmt(vals[i + 1])}`).join(' ; ');
  const progShort = prog => prog.map(([op, v]) => `${OPS[op].sym} ${fmt(v)}`).join(', puis ');

  // Robot on a grid. Directions: 0 up, 1 right, 2 down, 3 left (screen).
  const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  const DIR_NAMES = ['le haut', 'la droite', 'le bas', 'la gauche'];
  const COLS = 7, ROWS = 6, CELL = 36;
  const inGrid = ([x, y]) => x >= 0 && y >= 0 && x < COLS && y < ROWS;
  // instrs: ['F', n] | ['R'] | ['L']; flip swaps left and right (a classic mistake).
  function robotRun(start, dir, instrs, flip = false) {
    let [x, y] = start, d = dir, ok = true;
    const steps = [];
    instrs.forEach(([a, n]) => {
      if (a === 'F') {
        for (let i = 0; i < n; i++) { x += DIRS[d][0]; y += DIRS[d][1]; if (!inGrid([x, y])) ok = false; }
        steps.push(`avance de ${n} case${n > 1 ? 's' : ''} vers ${DIR_NAMES[d]}`);
      } else {
        const right = (a === 'R') !== flip;
        d = (d + (right ? 1 : 3)) % 4;
        steps.push(`se tourne vers ${DIR_NAMES[d]}`);
      }
    });
    return { end: [x, y], ok, steps };
  }
  const say = ([a, n]) => (a === 'F' ? `avance de ${n} case${n > 1 ? 's' : ''}` : a === 'R' ? 'tourne à droite' : 'tourne à gauche');
  function robotFigure(start, dir, labels) {
    const P = (x, y) => [10 + x * CELL, 10 + y * CELL];
    let body = '';
    for (let i = 0; i <= COLS; i++) body += R.line(...P(i, 0), ...P(i, ROWS), 's-grid');
    for (let j = 0; j <= ROWS; j++) body += R.line(...P(0, j), ...P(COLS, j), 's-grid');
    const [cx, cy] = P(start[0] + 0.5, start[1] + 0.5), s = 12;
    const tri = [[0, -s], [s * 0.8, s * 0.7], [-s * 0.8, s * 0.7]].map(([px, py]) => {
      const a = (dir * Math.PI) / 2;
      return [+(cx + px * Math.cos(a) - py * Math.sin(a)).toFixed(1), +(cy + px * Math.sin(a) + py * Math.cos(a)).toFixed(1)];
    });
    body += R.poly(tri, 's-accent');
    labels.forEach(([x, y, l]) => { const [lx, ly] = P(x + 0.5, y + 0.5); body += R.text(lx, ly + 6, l, { cls: 's-text s-bold', size: 17 }); });
    return R.svg(COLS * CELL + 20, ROWS * CELL + 20, body, 'grid');
  }
  function robotQuestion(level, rng) {
    let start, dir, instrs, flat, run, reps = 0, body = [];
    for (let tries = 0; tries < 300; tries++) {
      start = [rng.int(0, COLS - 1), rng.int(0, ROWS - 1)]; dir = rng.int(0, 3);
      const turn = () => [rng.pick(['R', 'L'])];
      if (level === 2) {
        instrs = [['F', rng.int(1, 3)], turn(), ['F', rng.int(1, 3)]];
        if (rng.chance(0.5)) instrs.push(turn(), ['F', rng.int(1, 2)]);
        flat = instrs; reps = 0;
      } else {
        reps = rng.int(2, 3);
        body = [['F', rng.int(1, 2)], turn()];
        if (rng.chance(0.4)) body = [['F', rng.int(1, 2)], turn(), ['F', 1]];
        const tail = rng.chance(0.5) ? [['F', rng.int(1, 2)]] : [];
        instrs = { reps, body, tail };
        flat = [...Array(reps).fill(body).flat(), ...tail];
      }
      run = robotRun(start, dir, flat);
      if (run.ok && (run.end[0] !== start[0] || run.end[1] !== start[1])) break;
      run = null;
    }
    if (!run) { start = [1, 3]; dir = 1; flat = instrs = [['F', 2]]; reps = 0; run = robotRun(start, dir, flat); }
    const key = c => c.join(',');
    const taken = new Set([key(start), key(run.end)]);
    const cands = [robotRun(start, dir, flat, true).end];
    if (flat.length > 1) cands.push(robotRun(start, dir, flat.slice(0, -1)).end);
    const lastF = flat.map(i => i[0]).lastIndexOf('F');
    cands.push(robotRun(start, dir, flat.map((ins, i) => (i === lastF ? ['F', ins[1] + 1] : ins))).end);
    if (reps) cands.push(robotRun(start, dir, [...Array(reps - 1).fill(instrs.body).flat(), ...instrs.tail]).end);
    const distract = [];
    cands.forEach(c => { if (inGrid(c) && !taken.has(key(c)) && distract.length < 3) { taken.add(key(c)); distract.push(c); } });
    while (distract.length < 3) {
      const c = [run.end[0] + rng.int(-2, 2), run.end[1] + rng.int(-2, 2)];
      if (inGrid(c) && !taken.has(key(c))) { taken.add(key(c)); distract.push(c); }
    }
    const letters = ['A', 'B', 'C', 'D'];
    const cells = rng.shuffle([run.end, ...distract]);
    const good = letters[cells.indexOf(run.end)];
    const fig = robotFigure(start, dir, cells.map((c, i) => [c[0], c[1], letters[i]]));
    const list = reps
      ? `<ol><li>Répète ${reps} fois : ${instrs.body.map(say).join(', ')}.</li>${instrs.tail.map(i => `<li>${say(i).replace(/^./, c => c.toUpperCase())}.</li>`).join('')}</ol>`
      : `<ol>${flat.map(i => `<li>${say(i).replace(/^./, c => c.toUpperCase())}.</li>`).join('')}</ol>`;
    return Q(`rob:${key(start)}:${dir}:${flat.map(i => i.join('')).join('')}`,
      `${fig}Le robot (le triangle) regarde vers ${DIR_NAMES[dir]}. « Tourner » veut dire faire un quart de tour sur place. Il exécute ce programme :${list}Sur quelle case arrive-t-il ?`,
      fixedChoice(letters, good),
      reps ? 'Écris toutes les instructions une par une (la répétition en entier), puis suis-les avec ton doigt.' : 'Suis le trajet avec ton doigt, une instruction après l’autre. Pour tourner, mets-toi à la place du robot.',
      `Le robot ${run.steps.join(', puis ')}. Il arrive sur la case <b>${good}</b>.`);
  }

  M.notion('programmes', {
    lesson: {
      retenir: `<ul><li>Une <b>instruction</b> est un ordre simple : « ajoute 3 », « avance de 2 cases », « tourne à droite »…</li><li>Un <b>programme</b> est une <b>séquence d’instructions</b> que l’on exécute <b>dans l’ordre</b>, une par une.</li><li>Ce qu’on donne au départ s’appelle l’<b>entrée</b> ; ce qu’on obtient à la fin s’appelle la <b>sortie</b>.</li><li>« <b>Répète</b> 4 fois … » veut dire qu’on exécute 4 fois de suite les mêmes instructions.</li></ul>`,
      explication: `<p>Programme de calcul : <b>entrée</b> 5.</p>${M.h.steps(['Choisis un nombre : 5.', 'Multiplie par 3 : 5 × 3 = 15.', 'Ajoute 2 : 15 + 2 = 17.'])}<p><b>Sortie</b> : 17. Si on change l’ordre (ajouter 2, puis multiplier par 3), on obtient (5 + 2) × 3 = 21 : l’ordre des instructions compte !</p>`,
      methode: [
        'Exécute les instructions dans l’ordre, en écrivant le résultat de chaque étape.',
        'Pour une répétition, écris chaque passage : 1 → 2 → 4 → 8… Pour obtenir le 11<sup>e</sup> terme de 1 ; 2 ; 4 ; 8…, on répète 10 fois « multiplie par 2 ».',
        'Pour un déplacement : mets-toi à la place du robot. « Tourne à droite » le fait tourner sur place, il ne change pas de case.',
        'Pour retrouver l’entrée à partir de la sortie : remonte le programme en faisant les opérations contraires (− au lieu de +, ÷ au lieu de ×), en partant de la fin.',
      ],
      exemples: [
        { q: 'Pars de 3. Répète 4 fois : ajoute 5.', r: '3 → 8 → 13 → 18 → <b>23</b>.' },
        { q: 'Choisis un nombre, multiplie-le par 4, ajoute 1. On obtient 29. Quel nombre a-t-on choisi ?', r: 'On remonte : 29 − 1 = 28, puis 28 ÷ 4 = <b>7</b>. Vérification : 7 × 4 + 1 = 29.' },
      ],
      erreurs: ['Changer l’ordre des instructions : « × 3 puis + 2 » ne donne pas le même résultat que « + 2 puis × 3 ».', 'Pour remonter un programme, commencer par la première instruction au lieu de la dernière.'],
    },
    generate(level, rng) {
      if (level === 1) {
        if (rng.chance(0.6)) {
          const x = rng.int(2, 12), a = rng.int(2, 5), b = rng.int(1, 10);
          const prog = rng.pick([[['×', a], ['+', b]], [['+', b], ['×', a]], [['×', a], ['−', Math.min(b, 2 * a - 1)]]]);
          const vals = runProg(x, prog), out = vals[vals.length - 1];
          return Q(`pg1:${x}:${progShort(prog)}`, `Exécute ce programme de calcul :${progList(x, prog)}`, num(out), 'Fais les instructions dans l’ordre, en écrivant chaque résultat.',
            `${trace(vals, prog)}. Sortie : <b>${fmt(out)}</b>.`);
        }
        const mult = rng.chance(0.35), s = mult ? rng.int(1, 5) : rng.int(0, 20), k = mult ? 2 : rng.int(2, 9), n = mult ? rng.int(2, 4) : rng.int(3, 6);
        const vals = [s];
        for (let i = 0; i < n; i++) vals.push(mult ? vals[i] * k : vals[i] + k);
        const out = vals[n];
        return Q(`pg1r:${s}:${mult}:${k}:${n}`, `Pars de ${fmt(s)}. <b>Répète ${n} fois</b> : ${mult ? `multiplie par ${k}` : `ajoute ${k}`}. Quel nombre obtiens-tu ?`, num(out),
          'Écris le résultat après chaque passage.', `${vals.map(fmt).join(' → ')} : on obtient <b>${fmt(out)}</b>.`);
      }
      if (level === 2) {
        const t = rng.int(0, 3);
        if (t === 0) return robotQuestion(2, rng);
        if (t === 1) {
          // Three instructions (CM2/6e style).
          const x = rng.int(2, 12), a = rng.int(1, 9), b = rng.int(2, 6), c = rng.int(1, 9);
          const prog = rng.pick([[['+', a], ['×', b], ['−', c]], [['×', b], ['+', a], ['×', 2]], [['−', Math.min(a, x - 1)], ['×', b], ['+', c]]]);
          const vals = runProg(x, prog), out = vals[vals.length - 1];
          return Q(`pg2:${x}:${progShort(prog)}`, `Exécute ce programme de calcul :${progList(x, prog)}`, num(out), 'Chaque instruction s’applique au résultat de l’instruction précédente.',
            `${trace(vals, prog)}. Sortie : <b>${fmt(out)}</b>.`);
        }
        if (t === 2) {
          // Repeating by hand: n-th term of a sequence.
          const geo = rng.chance(0.5);
          const first = geo ? rng.int(1, 3) : rng.int(1, 9), k = geo ? 2 : rng.int(2, 9), n = geo ? rng.int(6, 8) : rng.int(8, 12);
          const terms = [first];
          for (let i = 1; i < n; i++) terms.push(geo ? terms[i - 1] * k : terms[i - 1] + k);
          const out = terms[n - 1];
          return Q(`pg2s:${first}:${geo}:${k}:${n}`, `Voici le début d’une suite de nombres : ${terms.slice(0, 4).map(fmt).join(' ; ')} ; … Quel est le ${n}<sup>e</sup> nombre de cette suite ?`, num(out),
            'Trouve l’instruction qui permet de passer d’un nombre au suivant, puis répète-la.',
            `On passe d’un nombre au suivant en ${geo ? `multipliant par ${k}` : `ajoutant ${k}`}. Pour le ${n}<sup>e</sup> nombre, on répète ${n - 1} fois cette instruction : ${terms.map(fmt).join(' ; ')}. Réponse : <b>${fmt(out)}</b>.`);
        }
        // Which programme turns x into the target?
        const x = rng.int(2, 9);
        const progs = [];
        const seen = new Set();
        let guard = 0;
        while (progs.length < 4 && guard++ < 100) {
          const a = rng.int(2, 5), b = rng.int(1, 9);
          const p = rng.pick([[['×', a], ['+', b]], [['+', b], ['×', a]], [['×', a], ['−', Math.min(b, a * x - 1)]]]);
          const out = runProg(x, p).pop();
          if (seen.has(out) || progs.some(q => progShort(q.p) === progShort(p))) continue;
          seen.add(out); progs.push({ p, out });
        }
        const target = progs[0];
        const opts = progs.map(q => progShort(q.p).replace(/^./, c => c.toUpperCase()));
        return Q(`pg2c:${x}:${opts.join('|')}`, `Quel programme transforme l’entrée ${fmt(x)} en la sortie ${fmt(target.out)} ?`, choice(rng, opts[0], opts.slice(1)),
          `Teste chaque programme en partant de ${fmt(x)}.`,
          `${progs.map(q => `${progShort(q.p)} : ${trace(runProg(x, q.p), q.p)}`).join('<br>')}<br>C’est <b>${opts[0]}</b>.`);
      }
      const t = rng.int(0, 2);
      if (t === 0) return robotQuestion(3, rng);
      if (t === 1) {
        // Find the input from the output.
        const x = rng.int(2, 20), a = rng.int(2, 9), b = rng.int(1, 15);
        const addFirst = rng.chance(0.4);
        const prog = addFirst ? [['+', b], ['×', a]] : [['×', a], ['+', b]];
        const out = runProg(x, prog).pop();
        const back = addFirst
          ? `${fmt(out)} ÷ ${a} = ${fmt(x + b)}, puis ${fmt(x + b)} − ${b} = ${fmt(x)}`
          : `${fmt(out)} − ${b} = ${fmt(a * x)}, puis ${fmt(a * x)} ÷ ${a} = ${fmt(x)}`;
        return Q(`pg3i:${x}:${progShort(prog)}`, `${progList(null, prog)}La sortie est ${fmt(out)}. Quel nombre a-t-on choisi au départ ?`, num(x),
          'Remonte le programme en partant de la fin, avec les opérations contraires.',
          `On remonte : ${back}. Vérification : ${trace(runProg(x, prog), prog)}. L’entrée est <b>${fmt(x)}</b>.`);
      }
      // Long repetition (Eduscol: 11th term of 1, 2, 4, 8…).
      const first = rng.int(1, 3), k = rng.pick([2, 2, 3]), n = k === 2 ? rng.int(9, 12) : rng.int(6, 8);
      const terms = [first];
      for (let i = 1; i < n; i++) terms.push(terms[i - 1] * k);
      const out = terms[n - 1];
      if (rng.chance(0.3)) {
        return Q(`pg3n:${first}:${k}:${n}`, `On part de ${fmt(first)} et on répète l’instruction « multiplie par ${k} ». Combien de fois faut-il la répéter pour obtenir ${fmt(out)} ?`, num(n - 1),
          'Écris les résultats successifs et compte les passages.',
          `${terms.map(fmt).join(' → ')} : on a répété <b>${fmt(n - 1)}</b> fois l’instruction.`);
      }
      return Q(`pg3s:${first}:${k}:${n}`, `Voici le début d’une suite de nombres : ${terms.slice(0, 4).map(fmt).join(' ; ')} ; … Quel est le ${n}<sup>e</sup> nombre ?`, num(out),
        `Combien de fois faut-il répéter l’instruction pour passer du 1<sup>er</sup> au ${n}<sup>e</sup> nombre ?`,
        `On multiplie par ${k} pour passer au suivant ; pour le ${n}<sup>e</sup> nombre, on répète ${n - 1} fois : ${terms.map(fmt).join(' ; ')}. Réponse : <b>${fmt(out)}</b>.`);
    },
  });

  // ===================== EXPLICATIONS =====================
  const B = M.cat.BASE;
  M.explain('fractions-reperes', [
    ['dessin', B],
    ['vie', `<p>Pense à l’argent : 1 € = 100 centimes. Un quart d’euro, c’est 25 centimes (0,25 €) ; un demi-euro, 50 centimes (0,5 €) ; trois quarts d’euro, 75 centimes (0,75 €). Avec 11 pièces de 25 centimes, tu as 11 quarts d’euro : ${frac(11, 4)} € = 2 € et 75 centimes, c’est-à-dire 2 + ${frac(3, 4)}.</p>`],
    ['lien', `<p>Tu sais déjà qu’une fraction est un quotient : ${frac(3, 4)} = 3 ÷ 4 = 0,75. Et tu sais faire une division euclidienne : 17 = 3 × 5 + 2. Écrire ${frac(17, 5)} = 3 + ${frac(2, 5)}, c’est exactement cette division : 3 unités entières, et il reste 2 cinquièmes.</p>`],
  ]);
  M.explain('pre-algebre', [
    ['dessin', B],
    ['etapes', '<p>Pour un motif évolutif :</p><ol><li>Je compte les éléments aux étapes 1, 2, 3 (par exemple 4, 7, 10).</li><li>Je trouve ce qu’on ajoute à chaque fois : 3.</li><li>Pour l’étape 20, on a ajouté 3 dix-neuf fois depuis l’étape 1 : 4 + 19 × 3 = 61.</li><li>Je vérifie sur une petite étape : étape 3 → 4 + 2 × 3 = 10. ✔</li></ol>'],
    ['vie', '<p>Imagine une balance de cuisine avec 3 paquets de sucre identiques et un poids de 2 kg d’un côté, et 14 kg de l’autre. Si tu retires le poids de 2 kg d’un côté, tu dois retirer 2 kg de l’autre pour garder l’équilibre : 3 paquets pèsent 12 kg, donc un paquet pèse 4 kg.</p>'],
  ]);
  M.explain('programmes', [
    ['etapes', B],
    ['vie', '<p>Une recette de cuisine est un programme : « casse 3 œufs, ajoute 100 g de farine, mélange, fais cuire 20 minutes ». Les ingrédients sont les <b>entrées</b>, le gâteau est la <b>sortie</b>. Si tu fais cuire avant de mélanger, le résultat n’est pas le même : l’ordre des instructions compte.</p>'],
    ['dessin', `${robotFigure([1, 4], 0, [[1, 1, '★']])}<p>Le robot regarde vers le haut. « Avance de 3 cases » : il monte de 3 cases et arrive sur l’étoile. S’il fait ensuite « tourne à droite », il reste sur l’étoile mais regarde maintenant vers la droite.</p>`],
  ]);
})();
