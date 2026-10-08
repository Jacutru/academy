// Chapters "Tables et calcul mental" and "Nombres décimaux".
(function () {
  'use strict';
  const M = globalThis.M;
  const { fmt, fmtK, dec, mul, add, sub, div, round, trunc, range } = M.u;
  const { frac, box, steps, table, placeTable, hole } = M.h;
  const { Q, num, choice, fixedChoice, order } = M.kit;
  const S = M.svg;

  // ===================== TABLES =====================
  const pythagore = (() => {
    const rows = [['×', ...range(1, 10)]];
    range(1, 10).forEach(a => rows.push([`<b>${a}</b>`, ...range(1, 10).map(b => a * b)]));
    return table(rows, { cls: 'pyth' });
  })();

  // Strategy for a × b; `reveal` adds the intermediate results (used in the correction, not the hint).
  function multTip(a, b, reveal = false) {
    const [s, l] = a < b ? [a, b] : [b, a];
    const r = x => (reveal ? x : '…');
    if (s === 9 || l === 9) { const o = s === 9 ? l : s; return `Astuce ×9 : ${o} × 10 − ${o} = ${r(`${o * 10} − ${o} = ${o * 9}`)}.`; }
    if (s === 5 || l === 5) { const o = s === 5 ? l : s; return `Astuce ×5 : la moitié de ${o} × 10, soit ${r(`${o * 10} ÷ 2 = ${o * 5}`)}.`; }
    if (s === 4 || l === 4) { const o = s === 4 ? l : s; return `Astuce ×4 : le double du double de ${o}${reveal ? ` : ${o * 2}, puis ${o * 4}` : ''}.`; }
    if (s === 7 && l === 8) return reveal ? 'Retiens « 5, 6, 7, 8 » : 56 = 7 × 8.' : 'Pense à la suite « 5, 6, 7, 8 ».';
    return `${a} × ${b} = ${b} × ${a} : tu peux retourner la multiplication et chercher dans la table de ${s}.`;
  }

  M.notion('tables-mult', {
    lesson: {
      retenir: `Il faut connaître <b>par cœur</b> et <b>sans compter</b> les produits des tables de 1 à 10. Comme ${'a × b = b × a'}, il n'y a en fait que <b>36 résultats</b> vraiment difficiles (de 2 × 2 à 9 × 9).`,
      explication: `<p>La table de Pythagore : le résultat se lit au croisement de la ligne et de la colonne. Elle est symétrique : 6 × 8 et 8 × 6 donnent la même case.</p>${pythagore}`,
      methode: [
        'Apprends les tables par petits blocs (par exemple les produits de 6, 7, 8 et 9 entre eux).',
        'Si tu hésites, retrouve le résultat à partir d’un produit que tu connais (double, ×10, ×5…).',
        'Puis entraîne-toi en chrono : le but est de répondre en moins de 3 secondes.',
      ],
      exemples: [
        { q: '7 × 8 = ?', r: '<b>56</b>. Moyen mnémotechnique : « 5, 6, 7, 8 » → 56 = 7 × 8.' },
        { q: '6 × 9 = ?', r: '6 × 10 = 60, et on enlève une fois 6 : 60 − 6 = <b>54</b>.' },
        { q: '8 × 4 = ?', r: 'Double de 8 : 16, double de 16 : <b>32</b>.' },
      ],
      astuces: [
        '<b>×2</b> : le double. <b>×4</b> : le double du double. <b>×8</b> : le double du double du double.',
        '<b>×5</b> : la moitié de ×10 (8 × 5 = 80 ÷ 2 = 40).',
        '<b>×9</b> : ×10 puis on enlève le nombre (7 × 9 = 70 − 7 = 63). Les chiffres du résultat font toujours 9 : 6 + 3 = 9.',
        '<b>×6</b> : ×5 plus une fois le nombre (7 × 6 = 35 + 7 = 42).',
      ],
      erreurs: [
        'Confondre 6 × 8 = <b>48</b> et 7 × 7 = <b>49</b>.',
        'Confondre 7 × 8 = <b>56</b> et 6 × 9 = <b>54</b>.',
        'Croire que 6 × 7 = 36 (c’est <b>42</b> ; 36 = 6 × 6).',
      ],
    },
    generate(level, rng) {
      if (level === 3 && rng.chance(0.35)) {
        const a = rng.int(6, 9), b = rng.int(3, 9);
        return Q(`multmiss:${a}x${b}`, `${a} × ${hole} = ${a * b}`, num(b), `Dans quelle table trouve-t-on ${a * b} ?`, `${a} × ${b} = ${a * b}, donc le nombre manquant est <b>${b}</b>.`);
      }
      const pool = level === 1 ? [2, 3, 4, 5, 10] : level === 2 ? range(2, 9) : [6, 7, 8, 9];
      const a = rng.pick(pool), b = level === 1 ? rng.int(1, 10) : rng.int(level === 3 ? 6 : 2, 9);
      const [x, y] = rng.chance(0.5) ? [a, b] : [b, a];
      return Q(`mult:${x}x${y}`, `${x} × ${y} = ?`, num(x * y), multTip(x, y), `${x} × ${y} = <b>${x * y}</b>. ${multTip(x, y, true)}`);
    },
  });

  M.notion('tables-div', {
    lesson: {
      retenir: 'Diviser, c’est chercher le nombre manquant dans une multiplication : <b>56 ÷ 8 = 7</b> car <b>7 × 8 = 56</b>. Chaque résultat des tables donne deux divisions.',
      explication: '<p>Avec le « triangle » 7 – 8 – 56, on peut écrire quatre égalités :</p><p class="center">7 × 8 = 56 &nbsp;·&nbsp; 8 × 7 = 56 &nbsp;·&nbsp; 56 ÷ 8 = 7 &nbsp;·&nbsp; 56 ÷ 7 = 8</p>',
      methode: [
        'Lis la division « 56 ÷ 8 » comme une question : « 8 fois combien font 56 ? »',
        'Récite la table de 8 dans ta tête jusqu’à trouver 56.',
        'Vérifie en multipliant : 7 × 8 = 56.',
      ],
      exemples: [
        { q: '42 ÷ 6 = ?', r: '6 × <b>7</b> = 42, donc 42 ÷ 6 = <b>7</b>.' },
        { q: '72 ÷ 9 = ?', r: '9 × <b>8</b> = 72, donc 72 ÷ 9 = <b>8</b>.' },
      ],
      astuces: ['Diviser par 2, c’est prendre la moitié ; diviser par 4, c’est prendre la moitié de la moitié.'],
      erreurs: ['Diviser dans le mauvais sens : 8 ÷ 56 n’est pas égal à 56 ÷ 8.'],
    },
    generate(level, rng) {
      const pool = level === 1 ? [2, 5, 10] : range(2, 9);
      const b = rng.pick(pool), q = rng.int(level === 3 ? 6 : 2, level === 1 ? 10 : 9), p = b * q;
      if (level === 3 && rng.chance(0.5)) {
        return Q(`divmiss:${p}/${q}`, `${p} ÷ ${hole} = ${q}`, num(b), `${q} × ? = ${p}`, `${p} ÷ ${b} = ${q} car ${b} × ${q} = ${p}. Réponse : <b>${b}</b>.`);
      }
      return Q(`div:${p}/${b}`, `${p} ÷ ${b} = ?`, num(q), `${b} fois combien font ${p} ?`, `${b} × ${q} = ${p}, donc ${p} ÷ ${b} = <b>${q}</b>.`);
    },
  });

  // ---------- ×/÷ 10, 100, 1000 ----------
  const P10 = [10, 100, 1000];
  const zeros = p => String(p).length - 1;
  M.notion('mult-10', {
    lesson: {
      retenir: 'Multiplier par 10, 100 ou 1 000, c’est rendre chaque chiffre <b>10, 100 ou 1 000 fois plus grand</b> : les chiffres se décalent de <b>1, 2 ou 3 rangs vers la gauche</b>. Diviser, c’est les décaler vers la <b>droite</b>.',
      explication: `<p>Dans 3,45 × 100, le chiffre 3 passe des unités aux centaines :</p>${placeTable(['centaines', 'dizaines', 'unités', 'dixièmes', 'centièmes'], ['', '', '3', '4', '5'])}${placeTable(['centaines', 'dizaines', 'unités', 'dixièmes', 'centièmes'], ['3', '4', '5', '', ''])}<p>3,45 × 100 = <b>345</b>. On dit souvent « la virgule se déplace », mais en réalité ce sont les chiffres qui bougent !</p>`,
      methode: [
        'Compte les zéros : 10 → 1 rang, 100 → 2 rangs, 1 000 → 3 rangs.',
        '× : décale les chiffres vers la gauche (le nombre grandit). ÷ : vers la droite (le nombre rapetisse).',
        'Complète avec des zéros si nécessaire (4,2 × 100 = 420 ; 7 ÷ 100 = 0,07).',
      ],
      exemples: [
        { q: '4,2 × 100', r: '2 rangs vers la gauche : 4,2 → 42 → <b>420</b>.' },
        { q: '58 ÷ 1 000', r: '3 rangs vers la droite : 58 → 5,8 → 0,58 → <b>0,058</b>.' },
        { q: '0,3 × 10', r: '<b>3</b>' },
      ],
      astuces: ['Vérifie l’ordre de grandeur : en multipliant par 100, le résultat doit être beaucoup plus grand.'],
      erreurs: [
        '« Ajouter un zéro » ne marche pas avec les décimaux : 2,5 × 10 = 25, pas 2,50 !',
        'Oublier le zéro devant la virgule : 7 ÷ 100 = 0,07 (et pas 0,7).',
      ],
    },
    generate(level, rng) {
      const p = rng.pick(P10);
      if (level === 1) {
        const x = rng.int(2, 99) * (rng.chance(0.3) ? 10 : 1);
        if (rng.chance(0.6)) return Q(`m10:${x}x${p}`, `${fmt(x)} × ${fmt(p)} = ?`, num(x * p), `${zeros(p)} rang(s) vers la gauche.`, `${fmt(x)} × ${fmt(p)} = <b>${fmt(x * p)}</b>`);
        const y = x * p;
        return Q(`d10:${y}/${p}`, `${fmt(y)} ÷ ${fmt(p)} = ?`, num(x), `${zeros(p)} rang(s) vers la droite.`, `${fmt(y)} ÷ ${fmt(p)} = <b>${fmt(x)}</b>`);
      }
      const k = rng.int(1, 3), x = dec(rng.int(1, 9999), k);
      if (level === 2 || rng.chance(0.4)) {
        const r = mul(x, p);
        return Q(`m10:${x}x${p}`, `${fmt(x)} × ${fmt(p)} = ?`, num(r), `Les chiffres se décalent de ${zeros(p)} rang(s) vers la gauche.`, `${fmt(x)} × ${fmt(p)} = <b>${fmt(r)}</b> (décalage de ${zeros(p)} rang(s) vers la gauche).`);
      }
      const r = div(x, p);
      if (rng.chance(0.3)) return Q(`m10miss:${r}x${p}`, `${fmt(r)} × ${hole} = ${fmt(x)}`, num(p), 'Combien de rangs les chiffres ont-ils bougé ?', `${fmt(r)} × ${fmt(p)} = ${fmt(x)} : réponse <b>${fmt(p)}</b>.`);
      return Q(`d10:${x}/${p}`, `${fmt(x)} ÷ ${fmt(p)} = ?`, num(r), `Les chiffres se décalent de ${zeros(p)} rang(s) vers la droite.`, `${fmt(x)} ÷ ${fmt(p)} = <b>${fmt(r)}</b> (décalage de ${zeros(p)} rang(s) vers la droite).`);
    },
  });

  M.notion('mult-01', {
    lesson: {
      retenir: '<b>× 0,1</b> revient à <b>÷ 10</b>. <b>× 0,01</b> revient à <b>÷ 100</b>. <b>× 0,5</b> revient à prendre <b>la moitié</b>. Multiplier par un nombre plus petit que 1 donne un résultat <b>plus petit</b> !',
      explication: '<p>0,1 = un dixième = 1/10. Prendre « 0,1 fois » un nombre, c’est en prendre un dixième, donc le diviser par 10. De même, 0,5 = 5/10 = 1/2 : c’est la moitié.</p>',
      methode: [
        'Repère le multiplicateur : 0,1 ; 0,01 ou 0,5.',
        'Remplace par l’opération équivalente : ÷ 10 ; ÷ 100 ou « moitié ».',
        'Calcule, puis vérifie que le résultat est plus petit que le nombre de départ.',
      ],
      exemples: [
        { q: '45 × 0,1', r: '45 ÷ 10 = <b>4,5</b>' },
        { q: '320 × 0,01', r: '320 ÷ 100 = <b>3,2</b>' },
        { q: '17 × 0,5', r: 'La moitié de 17 : <b>8,5</b>' },
      ],
      erreurs: ['Penser que multiplier « agrandit » toujours : 8 × 0,5 = 4, c’est plus petit que 8.'],
    },
    generate(level, rng) {
      const m = level === 1 ? rng.pick([0.1, 0.5]) : level === 2 ? rng.pick([0.1, 0.01, 0.5]) : rng.pick([0.1, 0.01, 0.5, 0.5]);
      const x = level === 1 ? rng.int(2, 99) * (m === 0.5 ? 2 : 1) : level === 2 ? rng.int(2, 999) : dec(rng.int(11, 999), rng.int(0, 1));
      const r = mul(x, m);
      const eqv = m === 0.1 ? '÷ 10' : m === 0.01 ? '÷ 100' : 'prendre la moitié';
      return Q(`m01:${x}x${m}`, `${fmt(x)} × ${fmt(m)} = ?`, num(r), `× ${fmt(m)}, c’est ${eqv}.`, `× ${fmt(m)} revient à ${eqv} : ${fmt(x)} × ${fmt(m)} = <b>${fmt(r)}</b>.`);
    },
  });

  M.notion('complements', {
    lesson: {
      retenir: 'Le <b>complément</b> d’un nombre à 10 (ou 100, ou 1), c’est ce qu’il faut lui <b>ajouter</b> pour obtenir 10 (ou 100, ou 1). Exemple : le complément de 37 à 100 est 63 car 37 + 63 = 100.',
      methode: [
        'Pour 100 : complète d’abord les unités à la dizaine, puis les dizaines à 100. 37 → +3 → 40 → +60 → 100 : 63.',
        'Pour 1 : raisonne en centièmes. 0,37 = 37 centièmes ; il manque 63 centièmes = 0,63.',
        'Vérifie en additionnant.',
      ],
      exemples: [
        { q: 'Complément de 46 à 100', r: '46 + 4 = 50, 50 + 50 = 100 → 4 + 50 = <b>54</b>.' },
        { q: 'Complément de 0,7 à 1', r: '7 dixièmes + 3 dixièmes = 10 dixièmes → <b>0,3</b>.' },
        { q: 'Complément de 0,25 à 1', r: '25 centièmes + 75 centièmes = 100 centièmes → <b>0,75</b>.' },
      ],
      astuces: ['Pour 100 : les dizaines font 9 et les unités font 10. 37 → 6 et 3 (3 + 6 = 9, 7 + 3 = 10) → 63.'],
      erreurs: ['Complément de 37 à 100 : 73 est faux ! Les dizaines doivent faire 9 (3 + 6) et les unités 10 (7 + 3) → 63.'],
    },
    generate(level, rng) {
      let target, x;
      if (level === 1) {
        if (rng.chance(0.5)) { target = 10; x = rng.int(1, 9); } else { target = 100; x = rng.int(1, 9) * 10; }
      } else if (level === 2) {
        if (rng.chance(0.7)) { target = 100; x = rng.int(11, 89); } else { target = 1000; x = rng.int(1, 9) * 100 + (rng.chance(0.5) ? rng.int(1, 9) * 10 : 0); }
      } else {
        const t = rng.int(0, 2);
        if (t === 0) { target = 1; x = dec(rng.int(1, 9), 1); }
        else if (t === 1) { target = 1; x = dec(rng.int(11, 99), 2); }
        else { target = 10; x = dec(rng.int(11, 99), 1); }
      }
      const r = sub(target, x);
      return Q(`comp:${x}to${target}`, `${fmt(x)} + ${hole} = ${fmt(target)}`, num(r), 'Que faut-il ajouter ? Complète par étapes.', `${fmt(x)} + <b>${fmt(r)}</b> = ${fmt(target)}`);
    },
  });

  M.notion('calcul-malin', {
    lesson: {
      retenir: 'Pour calculer vite de tête, on <b>transforme</b> le calcul en un calcul plus simple qui donne le même résultat.',
      explication: `${table([['Pour…', 'on fait…', 'exemple'],
        ['× 5', '× 10 puis ÷ 2', '48 × 5 = 480 ÷ 2 = 240'],
        ['× 9', '× 10 puis − le nombre', '23 × 9 = 230 − 23 = 207'],
        ['× 11', '× 10 puis + le nombre', '34 × 11 = 340 + 34 = 374'],
        ['× 25', '× 100 puis ÷ 4', '36 × 25 = 3 600 ÷ 4 = 900'],
        ['× 50', '× 100 puis ÷ 2', '18 × 50 = 1 800 ÷ 2 = 900'],
        ['+ plusieurs nombres', 'regrouper ceux qui font des dizaines rondes', '37 + 48 + 63 = (37 + 63) + 48 = 148']])}`,
      methode: [
        'Regarde le nombre « gênant » (5, 9, 11, 25…) et cherche un nombre rond à côté (10, 100).',
        'Fais le calcul avec le nombre rond, puis corrige.',
        'Dans une suite d’additions ou de multiplications, change l’ordre pour former des nombres ronds (4 × 25 = 100, 2 × 5 = 10).',
      ],
      exemples: [
        { q: '4 × 17 × 25', r: '4 × 25 = 100, donc 100 × 17 = <b>1 700</b>.' },
        { q: '99 × 6', r: '100 × 6 − 6 = 600 − 6 = <b>594</b>.' },
      ],
      astuces: ['Ces astuces utilisent la distributivité : 23 × 9 = 23 × (10 − 1) = 230 − 23.'],
    },
    generate(level, rng) {
      const v = level === 1 ? rng.pick(['x5', 'x9']) : level === 2 ? rng.pick(['x11', 'x25', 'x5', 'x9']) : rng.pick(['x50', 'x99', 'assoc', 'regroup', 'x25']);
      let a, r, corr, prompt, hint;
      switch (v) {
        case 'x5': a = rng.int(6, 49) * 2; r = a * 5; prompt = `${a} × 5`; hint = '× 10 puis ÷ 2'; corr = `${a} × 10 = ${fmt(a * 10)}, puis ÷ 2 : <b>${fmt(r)}</b>`; break;
        case 'x9': a = rng.int(12, 89); r = a * 9; prompt = `${a} × 9`; hint = '× 10 puis − le nombre'; corr = `${a} × 10 − ${a} = ${fmt(a * 10)} − ${a} = <b>${fmt(r)}</b>`; break;
        case 'x11': a = rng.int(12, 89); r = a * 11; prompt = `${a} × 11`; hint = '× 10 puis + le nombre'; corr = `${a} × 10 + ${a} = ${fmt(a * 10)} + ${a} = <b>${fmt(r)}</b>`; break;
        case 'x25': a = rng.int(3, 30) * 4; r = a * 25; prompt = `${a} × 25`; hint = '× 100 puis ÷ 4'; corr = `${a} × 100 = ${fmt(a * 100)}, puis ÷ 4 : <b>${fmt(r)}</b>`; break;
        case 'x50': a = rng.int(6, 49) * 2; r = a * 50; prompt = `${a} × 50`; hint = '× 100 puis ÷ 2'; corr = `${a} × 100 = ${fmt(a * 100)}, puis ÷ 2 : <b>${fmt(r)}</b>`; break;
        case 'x99': a = rng.int(3, 15); r = a * 99; prompt = `${a} × 99`; hint = '× 100 puis − le nombre'; corr = `${a} × 100 − ${a} = ${fmt(a * 100)} − ${a} = <b>${fmt(r)}</b>`; break;
        case 'assoc': {
          const [p, q] = rng.pick([[4, 25], [2, 50], [5, 20], [2, 5]]); a = rng.int(12, 99); r = p * q * a;
          prompt = rng.chance(0.5) ? `${p} × ${a} × ${q}` : `${q} × ${a} × ${p}`; hint = `Commence par ${p} × ${q}.`;
          corr = `${p} × ${q} = ${p * q}, puis ${p * q} × ${a} = <b>${fmt(r)}</b>`; break;
        }
        default: {
          a = rng.int(11, 89); const b = (100 - (a % 100)) % 100 || 50, c = rng.int(12, 89); r = a + b + c;
          prompt = `${a} + ${c} + ${b}`; hint = `Cherche deux nombres qui font une centaine ronde.`;
          corr = `(${a} + ${b}) + ${c} = ${a + b} + ${c} = <b>${fmt(r)}</b>`;
        }
      }
      return Q(`malin:${prompt}`, `${prompt} = ?`, num(r), hint, corr);
    },
  });

  // ===================== DÉCIMAUX =====================
  const PLACES = { 3: 'milliers', 2: 'centaines', 1: 'dizaines', 0: 'unités', [-1]: 'dixièmes', [-2]: 'centièmes', [-3]: 'millièmes' };
  const SING = { 3: 'millier', 2: 'centaine', 1: 'dizaine', 0: 'unité', [-1]: 'dixième', [-2]: 'centième', [-3]: 'millième' };
  const placeHeaders = ['milliers', 'centaines', 'dizaines', 'unités', 'dixièmes', 'centièmes', 'millièmes'];
  // Random decimal with distinct non-zero digits at positions hi..lo.
  function digitsNumber(rng, hi, lo) {
    const ds = rng.sample(range(1, 9), hi - lo + 1);
    const map = {};
    let n = 0;
    for (let p = hi, i = 0; p >= lo; p--, i++) { map[p] = ds[i]; n = n * 10 + ds[i]; }
    return { x: dec(n, Math.max(0, -lo)), map };
  }

  M.notion('dec-position', {
    lesson: {
      retenir: 'Dans un nombre décimal, chaque chiffre a une <b>valeur</b> qui dépend de sa <b>place</b>. Après la virgule : <b>dixièmes</b>, <b>centièmes</b>, <b>millièmes</b>. 1 unité = 10 dixièmes = 100 centièmes = 1 000 millièmes.',
      explication: `<p>Le nombre 4 527,368 dans le tableau de numération :</p>${placeTable(placeHeaders, [4, 5, 2, 7, 3, 6, 8])}<p>Le chiffre des dixièmes est 3 ; le chiffre des centaines est 5.</p><p>Attention : le <b>chiffre</b> des dizaines est 2, mais le <b>nombre</b> de dizaines est 452 (il y a 452 dizaines dans 4 527).</p>`,
      methode: [
        'Repère la virgule : le chiffre juste à sa gauche est celui des unités.',
        'Avance vers la gauche (dizaines, centaines, milliers) ou vers la droite (dixièmes, centièmes, millièmes).',
        'Pour « le nombre de … », on garde tous les chiffres jusqu’à ce rang : nombre de dixièmes dans 34,56 → 345.',
      ],
      exemples: [
        { q: 'Chiffre des centièmes de 12,079', r: 'Après la virgule : 0 (dixièmes), <b>7</b> (centièmes), 9 (millièmes).' },
        { q: 'Écris en chiffres : 3 unités et 7 centièmes', r: 'Il n’y a pas de dixièmes : on met un 0 → <b>3,07</b>.' },
        { q: 'Nombre de dixièmes dans 34,56', r: '<b>345</b> dixièmes (et il reste 6 centièmes).' },
      ],
      erreurs: [
        'Les noms sont symétriques autour des <b>unités</b>, pas de la virgule : dizaines ↔ dixièmes, centaines ↔ centièmes.',
        'Oublier les zéros : « 3 unités et 7 centièmes » s’écrit 3,07 et pas 3,7.',
      ],
    },
    generate(level, rng) {
      if (level === 3 && rng.chance(0.6)) {
        if (rng.chance(0.5)) {
          // "Nombre de dixièmes / dizaines dans …"
          const { x } = digitsNumber(rng, 2, -2);
          const p = rng.pick([1, -1, -2]);
          const r = Math.floor(round(x / 10 ** p, 6) + 1e-9);
          return Q(`nbde:${x}:${p}`, `Combien y a-t-il de <b>${PLACES[p]}</b> en tout dans ${fmt(x)} ?`, num(r), `Garde tous les chiffres jusqu’au rang des ${PLACES[p]}.`, `Dans ${fmt(x)}, il y a <b>${fmt(r)}</b> ${PLACES[p]}.`);
        }
        // Write from a decomposition, with a missing place.
        const used = rng.sample([2, 1, 0, -1, -2, -3], 3);
        const parts = used.map(p => ({ p, d: rng.int(1, 9) })).sort((a, b) => b.p - a.p);
        const value = parts.reduce((s, { p, d }) => add(s, mul(d, 10 ** p)), 0);
        const txt = parts.map(({ p, d }) => `${d} ${d > 1 ? PLACES[p] : SING[p]}`).join(' et ');
        return Q(`ecr:${value}`, `Écris en chiffres : ${txt}.`, num(value), 'Place chaque chiffre dans le tableau, mets des 0 dans les cases vides.', `On obtient <b>${fmt(value)}</b>.`);
      }
      const [hi, lo] = level === 1 ? [2, -2] : [3, -3];
      const { x, map } = digitsNumber(rng, hi, lo);
      const p = rng.pick(Object.keys(map).map(Number));
      const digits = placeHeaders.map((h, i) => map[3 - i]);
      return Q(`pos:${x}:${p}`, `Quel est le chiffre des <b>${PLACES[p]}</b> dans ${fmt(x)} ?`, num(map[p]), 'Repère d’abord le chiffre des unités, juste avant la virgule.', `${placeTable(placeHeaders, digits)}Le chiffre des ${PLACES[p]} est <b>${map[p]}</b>.`);
    },
  });

  M.notion('dec-fraction', {
    lesson: {
      retenir: `Une <b>fraction décimale</b> a pour dénominateur 10, 100, 1 000… Elle peut s’écrire avec une virgule : ${frac(7, 10)} = 0,7 &nbsp; ${frac(253, 100)} = 2,53 &nbsp; ${frac(9, 1000)} = 0,009.`,
      explication: `<p>Le dénominateur indique le rang du <b>dernier chiffre</b> : /10 → dixièmes, /100 → centièmes, /1000 → millièmes.</p><p>2,53 = 2 + ${frac(5, 10)} + ${frac(3, 100)} = ${frac(253, 100)}</p>`,
      methode: [
        'Fraction → décimal : le dénominateur 100 veut dire « 2 chiffres après la virgule ». 253/100 = 2,53.',
        'Décimal → fraction : compte les chiffres après la virgule. 4,25 a 2 chiffres → 425/100.',
        'Complète avec des zéros si besoin : 9/1000 = 0,009.',
      ],
      exemples: [
        { q: `${frac(37, 10)} = ?`, r: '1 chiffre après la virgule : <b>3,7</b>.' },
        { q: `0,08 = ${frac('?', 100)}`, r: '8 centièmes : <b>8</b>/100.' },
        { q: `3 + ${frac(4, 10)} + ${frac(5, 1000)} = ?`, r: 'Pas de centièmes → 0 : <b>3,405</b>.' },
      ],
      erreurs: ['Écrire 7/100 = 0,7 : c’est 0,07 (7 centièmes).'],
    },
    generate(level, rng) {
      if (level === 1) {
        const d = rng.pick([10, 100, 1000]), n = rng.int(1, d === 10 ? 99 : 999);
        const r = div(n, d);
        return Q(`fd:${n}/${d}`, `${frac(n, d)} = ? <small>(écriture décimale)</small>`, num(r), `/${d} → ${String(d).length - 1} chiffre(s) après la virgule.`, `${frac(n, d)} = <b>${fmt(r)}</b>`);
      }
      if (level === 2) {
        const k = rng.int(1, 3), x = dec(rng.int(1, 9999), k), d = 10 ** k, nn = Math.round(x * d);
        if (rng.chance(0.5)) return Q(`df:${x}`, `${fmt(x)} = ${frac(hole, fmt(d))}`, num(nn), 'Combien de chiffres après la virgule ?', `${fmt(x)} = ${frac(fmt(nn), fmt(d))} : réponse <b>${fmt(nn)}</b>.`);
        const k2 = Math.min(3, k + 1), d2 = 10 ** k2, n2 = Math.round(x * d2);
        return Q(`df2:${x}:${d2}`, `${fmt(x)} = ${frac(hole, fmt(d2))}`, num(n2), `Exprime ${fmt(x)} en ${PLACES[-k2]}.`, `${fmt(x)} = ${frac(fmt(n2), fmt(d2))} : réponse <b>${fmt(n2)}</b>.`);
      }
      const e = rng.int(0, 20), places = rng.sample([1, 2, 3], 2).sort(), parts = places.map(k => ({ k, d: rng.int(1, 9) }));
      const value = parts.reduce((s, { k, d }) => add(s, dec(d, k)), e);
      const expr = [e ? fmt(e) : null, ...parts.map(({ k, d }) => frac(d, fmt(10 ** k)))].filter(Boolean).join(' + ');
      return Q(`dfdec:${value}`, `${expr} = ? <small>(écriture décimale)</small>`, num(value), 'Place chaque fraction au bon rang ; mets un 0 dans les rangs vides.', `${expr} = <b>${fmt(value)}</b>`);
    },
  });

  // --- Comparing decimals: build trap pairs.
  function trapPair(rng, level) {
    const kind = level === 1 ? rng.pick(['len', 'tenth']) : level === 2 ? rng.pick(['len', 'zero', 'eq', 'tenth']) : rng.pick(['zero', 'int', 'eq', 'deep', 'len']);
    const e = rng.int(0, 30);
    switch (kind) {
      case 'len': { const a = rng.int(2, 8); return [add(e, dec(a, 1)), add(e, dec(a * 10 - rng.int(1, 9), 2))]; } // 3,5 vs 3,45
      case 'tenth': return rng.sample(range(1, 9), 2).map(d => add(e, dec(d, 1)));
      case 'zero': { const d = rng.int(1, 9); return [add(e, dec(d, 2)), add(e, dec(d, 1))]; } // 7,08 vs 7,8
      case 'eq': { const d = rng.int(1, 9); return [add(e, dec(d, 1)), add(e, dec(d, 1))]; }
      case 'int': return [add(rng.int(10, 30), dec(rng.int(1, 9), 1)), add(rng.int(2, 9), dec(rng.int(900, 999), 3))]; // 15,3 vs 9,999
      default: { const d = rng.int(1, 8); return [add(e, dec(d * 10 + 9, 3)), add(e, dec(d + 1, 2))]; } // 0,099 vs 0,1→ 0,019 vs 0,02
    }
  }
  const sign = (a, b) => (a < b ? '<' : a > b ? '>' : '=');

  M.notion('dec-comparer', {
    lesson: {
      retenir: 'Pour comparer deux décimaux : on compare d’abord les <b>parties entières</b>. Si elles sont égales, on compare les <b>dixièmes</b>, puis les <b>centièmes</b>, etc. Le nombre de chiffres après la virgule ne compte pas !',
      explication: `<p>3,5 et 3,45 : on peut ajouter des zéros inutiles pour avoir autant de chiffres : 3,50 et 3,45. Alors 50 centièmes > 45 centièmes, donc <b>3,5 > 3,45</b>.</p>${placeTable(['unités', 'dixièmes', 'centièmes'], [3, 5, 0])}${placeTable(['unités', 'dixièmes', 'centièmes'], [3, 4, 5])}`,
      methode: [
        'Compare les parties entières. La plus grande donne le plus grand nombre.',
        'Si elles sont égales, compare chiffre par chiffre, de gauche à droite après la virgule.',
        'Astuce : complète avec des zéros pour avoir le même nombre de décimales.',
      ],
      exemples: [
        { q: '12,09 … 12,1', r: 'Dixièmes : 0 < 1, donc 12,09 <b>&lt;</b> 12,1.' },
        { q: '4,50 … 4,5', r: 'Un zéro à la fin ne change rien : 4,50 <b>=</b> 4,5.' },
        { q: '15,3 … 9,999', r: 'Parties entières : 15 > 9, donc 15,3 <b>&gt;</b> 9,999.' },
      ],
      erreurs: [
        '« 3,45 est plus grand que 3,5 car 45 > 5 » : FAUX. On compare chiffre par chiffre : 4 dixièmes < 5 dixièmes.',
        '« Le plus long est le plus grand » : FAUX pour la partie décimale.',
      ],
    },
    generate(level, rng) {
      let [a, b] = trapPair(rng, level);
      if (rng.chance(0.5)) [a, b] = [b, a];
      // For "=", show one of them with a trailing zero.
      const s = sign(a, b);
      const da = s === '=' ? fmtK(a, 2) : fmt(a), db = fmt(b);
      return Q(`cmp:${da}:${db}`, `Compare : ${da} &nbsp;…&nbsp; ${db}`, fixedChoice(['<', '=', '>'], s), 'Compare d’abord les parties entières, puis les dixièmes, puis les centièmes.', `${da} <b>${s}</b> ${db}. ${s === '=' ? 'Un zéro à la fin de la partie décimale ne change pas la valeur.' : `Comparaison rang par rang : ${fmtK(a, 3)} et ${fmtK(b, 3)}.`}`);
    },
  });

  M.notion('dec-ranger', {
    lesson: {
      retenir: '<b>Ranger dans l’ordre croissant</b> : du plus petit au plus grand (symbole &lt;). <b>Ordre décroissant</b> : du plus grand au plus petit (symbole &gt;).',
      methode: [
        'Écris tous les nombres avec le même nombre de décimales (ajoute des zéros).',
        'Range d’abord selon la partie entière, puis compare les parties décimales comme des entiers.',
        'Vérifie le sens demandé : croissant (&lt;) ou décroissant (&gt;).',
      ],
      exemples: [
        { q: 'Ranger dans l’ordre croissant : 0,7 ; 0,07 ; 0,707 ; 0,77', r: '0,700 ; 0,070 ; 0,707 ; 0,770 → <b>0,07 &lt; 0,7 &lt; 0,707 &lt; 0,77</b>.' },
      ],
      astuces: ['Croissant = ça « croît », ça grandit.'],
      erreurs: ['Se tromper de sens : relis bien la consigne.'],
    },
    generate(level, rng) {
      const n = level === 1 ? 4 : 5;
      const set = new Set();
      if (level === 3) {
        const d = rng.int(1, 8), e = rng.int(0, 5);
        [dec(d, 1), dec(d, 2), dec(d * 101, 3), dec(d * 11, 2), dec(d * 11, 3), dec(d * 10 + d + 1, 3)].forEach(v => set.add(add(e, v)));
      } else {
        const e = rng.int(0, 20);
        while (set.size < n) set.add(add(e + (level === 2 ? rng.int(0, 1) : 0), dec(rng.int(1, 99), rng.int(1, 2))));
      }
      const values = rng.sample([...set], n);
      const desc = level >= 2 && rng.chance(0.4);
      const ans = order(values, fmt, { desc });   // values come from rng.sample: already shuffled
      return Q(`rng:${values.slice().sort().join(';')}:${desc}`, `Range dans l’ordre <b>${desc ? 'décroissant' : 'croissant'}</b> :`, ans, 'Écris-les tous avec le même nombre de décimales.',
        `Avec le même nombre de décimales : ${ans.correct.map(i => fmtK(values[i], Math.max(...values.map(M.u.decimals)))).join(` ${ans.sep} `)}<br>donc <b>${M.answer.show(ans)}</b>`);
    },
  });

  M.notion('dec-arrondir', {
    lesson: {
      retenir: '<b>Arrondir</b> à l’unité (au dixième, au centième…), c’est remplacer un nombre par la valeur la plus <b>proche</b> à l’unité (au dixième…) près. On regarde le chiffre <b>juste après</b> : de 0 à 4 → on garde ; de 5 à 9 → on augmente de 1.',
      explication: `${S.numberLine({ from: 7, to: 8, major: 1, minor: 10, marks: [{ v: 7.6, label: '7,6' }] })}<p>7,6 est plus près de 8 que de 7 : l’arrondi à l’unité de 7,6 est <b>8</b>. L’encadrement à l’unité est 7 &lt; 7,6 &lt; 8. La <b>troncature</b> (on coupe) à l’unité est 7.</p>`,
      methode: [
        'Repère le rang demandé (unité, dixième, centième).',
        'Regarde le chiffre juste à sa droite.',
        'Moins de 5 : on coupe. 5 ou plus : on ajoute 1 au rang demandé, puis on coupe.',
      ],
      exemples: [
        { q: 'Arrondi au dixième de 12,347', r: 'Chiffre après les dixièmes : 4 &lt; 5 → <b>12,3</b>.' },
        { q: 'Arrondi au centième de 2,996', r: '6 ≥ 5 → 2,99 + 0,01 = <b>3,00</b> (on peut écrire 3).' },
        { q: 'Encadre 5,82 entre deux entiers consécutifs', r: '<b>5 &lt; 5,82 &lt; 6</b>.' },
      ],
      erreurs: ['Arrondir « en cascade » : pour arrondir 3,46 à l’unité, on regarde seulement le 4 → 3 (et pas 3,5 puis 4).'],
    },
    generate(level, rng) {
      const k = level === 1 ? 0 : level === 2 ? 1 : 2;
      const lab = ['à l’unité', 'au dixième', 'au centième'][k];
      if (level === 1 && rng.chance(0.4)) {
        let x;
        do x = dec(rng.int(101, 9989), rng.int(1, 2)); while (Number.isInteger(x));
        const lo = Math.floor(x);
        return Q(`enc:${x}`, `Encadre entre deux entiers consécutifs : ${hole} &lt; ${fmt(x)} &lt; ${fmt(lo + 1)}`, num(lo), 'Quel est l’entier juste en dessous ?', `<b>${fmt(lo)}</b> &lt; ${fmt(x)} &lt; ${fmt(lo + 1)}`);
      }
      let x = dec(rng.int(1, 99999), k + rng.int(1, 2));
      if (level === 3 && rng.chance(0.3)) x = dec(rng.int(1, 9) * 1000 + 996, 3); // 2,996-type
      if (k === 1 && rng.chance(0.3)) {
        const t = trunc(x, 1);
        return Q(`tr:${x}`, `Troncature au dixième de ${fmt(x)} ?`, num(t), 'Tronquer, c’est couper sans arrondir.', `On coupe après les dixièmes : <b>${fmt(t)}</b>.`);
      }
      const r = round(x, k);
      return Q(`arr:${x}:${k}`, `Arrondi ${lab} de ${fmt(x)} ?`, num(r), `Regarde le chiffre juste après le rang ${['des unités', 'des dixièmes', 'des centièmes'][k]}.`, `L’arrondi ${lab} de ${fmt(x)} est <b>${fmtK(r, k)}</b>.`);
    },
  });

  M.notion('dec-droite', {
    lesson: {
      retenir: 'Sur une droite graduée, chaque point a une <b>abscisse</b> (un nombre). Pour la lire, il faut d’abord trouver <b>la valeur d’une petite graduation</b>.',
      explication: `${S.numberLine({ from: 2, to: 3, major: 1, minor: 10, marks: [{ v: 2.7, label: 'A' }] })}<p>Entre 2 et 3, il y a 10 petits intervalles : chacun vaut 1 ÷ 10 = 0,1. A est 7 graduations après 2 : son abscisse est <b>2,7</b>.</p>`,
      methode: [
        'Prends deux nombres écrits sur la droite et calcule l’écart entre eux.',
        'Compte le nombre de petits intervalles entre ces deux nombres.',
        'Valeur d’une graduation = écart ÷ nombre d’intervalles. Puis compte à partir du nombre le plus proche.',
      ],
      exemples: [
        { q: 'Entre 0 et 2, il y a 4 intervalles', r: 'Une graduation vaut 2 ÷ 4 = <b>0,5</b>.' },
      ],
      erreurs: ['Compter les traits au lieu des intervalles : entre 0 et 1 avec 10 intervalles, il y a 11 traits.'],
    },
    generate(level, rng) {
      let from, to, major, minor, v;
      if (level === 1) { from = rng.int(0, 20); to = from + 3; major = 1; minor = 10; }
      else if (level === 2) { from = dec(rng.int(0, 90), 1); to = add(from, 0.4); major = 0.1; minor = 10; }
      else { [major, minor] = rng.pick([[2, 4], [5, 5], [2, 5], [10, 4], [1, 4]]); from = major * rng.int(0, 5); to = from + 3 * major; }
      const stepv = div(major, minor);
      do { v = add(from, mul(stepv, rng.int(1, Math.round((to - from) / stepv) - 1))); } while (Number.isInteger(div(sub(v, from), major)));
      const fig = S.numberLine({ from, to, major, minor, marks: [{ v, label: 'A' }] });
      return Q(`dr:${from}:${major}:${v}`, `${fig}Quelle est l’abscisse du point A ?`, num(v), `Une petite graduation vaut ${fmt(major)} ÷ ${minor}.`, `Une graduation vaut ${fmt(major)} ÷ ${minor} = ${fmt(stepv)}. A a pour abscisse <b>${fmt(v)}</b>.`);
    },
  });
})();
