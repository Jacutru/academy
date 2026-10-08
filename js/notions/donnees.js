// Domain "Données & probabilités": reading charts (6e), probabilities (6e), statistics (5e),
// tables of values and graphs (5e), probability vocabulary and frequencies (5e).
(function () {
  'use strict';
  const M = globalThis.M;
  const { fmt, add, sub, mul, div, gcd, range } = M.u;
  const { frac, table, hole } = M.h;
  const { Q, num, choice, fixedChoice } = M.kit;
  const { svg, text, line, dot } = M.svg.raw;
  const S = M.svg;

  const F = (n, d) => ({ kind: 'fraction', n, d });
  const simp = (n, d) => { const g = gcd(n, d); return [n / g, d / g]; };
  const fr = (n, d) => (d === 1 ? fmt(n) : frac(n, d));
  // "6/8 = 3/4" when it simplifies, "3/8" otherwise.
  const frs = (n, d) => { const [a, b] = simp(n, d); return a === n ? fr(n, d) : `${fr(n, d)} = ${fr(a, b)}`; };
  const total = arr => arr.reduce((s, v) => add(s, v), 0);
  const r1 = x => Math.round(x * 10) / 10;
  const rect = (x, y, w, h, cls) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="${cls}"/>`;
  const que = p => (/^[aàâeéèiouy]/i.test(p) ? `qu’${p}` : `que ${p}`);
  const ptable = rows => table(rows, { head: false, cls: 'prop' });

  // ===================== SVG CHARTS =====================

  // Bar chart: horizontal gridlines every `minor`, graduations every `major`.
  function barChart(cats, values, { max, minor, major, axis }) {
    const left = 52, top = 34, ih = 180, bw = 44, gap = 28;
    const W = left + cats.length * (bw + gap) + 14, H = top + ih + 34;
    const Y = v => r1(top + ih - (v / max) * ih);
    let b = text(4, 16, axis, { anchor: 'start', size: 13, cls: 's-text s-bold' });
    for (let v = 0; v <= max; v = add(v, minor)) {
      b += line(left, Y(v), W - 8, Y(v), 's-grid');
      if (v % major === 0) b += text(left - 8, Y(v) + 5, fmt(v), { anchor: 'end', size: 13 });
    }
    cats.forEach((c, i) => {
      const x = left + gap / 2 + i * (bw + gap);
      b += rect(x, Y(values[i]), bw, r1(top + ih - Y(values[i])), 's-fill');
      b += text(x + bw / 2, top + ih + 20, c, { size: 13 });
    });
    b += line(left, top - 10, left, top + ih) + line(left, top + ih, W - 8, top + ih);
    return svg(W, H, b);
  }

  // Pie chart: parts [{ label, u, cls?, short? }] out of `whole` units. Each sector carries its
  // name (never colour alone); small ticks every 1/ticks of a turn help to read halves, quarters, eighths.
  const PIE_CLS = ['s-fill', 's-soft s-line', 's-soft2 s-line', 's-empty'];
  function pieChart(parts, whole, { ticks = 8, legend } = {}) {
    const r = 100, cx = 112, cy = 112, L = r * 0.64;
    const at = (u, rad) => {
      const a = (u / whole) * 2 * Math.PI - Math.PI / 2;
      return [r1(cx + rad * Math.cos(a)), r1(cy + rad * Math.sin(a))];
    };
    let b = '', lab = '', acc = 0;
    parts.forEach((p, i) => {
      const cls = p.cls || PIE_CLS[i % 4];
      const [x1, y1] = at(acc, r), [x2, y2] = at(acc + p.u, r), [lx, ly] = at(acc + p.u / 2, L);
      b += `<path d="M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${p.u * 2 > whole ? 1 : 0} 1 ${x2},${y2} Z" class="${cls}"/>`;
      lab += text(lx, ly + 5, p.short || p.label, { size: 13, cls: 's-text s-bold' });
      acc += p.u;
    });
    for (let k = 0; k < ticks; k++) b += line(...at((k * whole) / ticks, r), ...at((k * whole) / ticks, r + 8));
    const items = legend || parts.map((p, i) => ({ label: p.label, cls: p.cls || PIE_CLS[i % 4] }));
    let leg = '';
    items.forEach((it, i) => {
      const y = 34 + i * 30;
      leg += rect(244, y - 15, 20, 20, it.cls) + text(272, y + 1, it.label, { anchor: 'start', size: 14 });
    });
    return svg(380, Math.max(232, items.length * 30 + 30), b + lab + leg);
  }

  // Line graph: points (xs[i], ys[i]) joined, gridlines on every x and every `minor` in y.
  function lineChart(xs, ys, { yMin = 0, yMax, minor, major, xLabel = '', yLabel = '', xFmt = fmt }) {
    const left = 58, top = 36, iw = Math.max(280, (xs.length - 1) * 50), ih = 200;
    const W = left + iw + 30, H = top + ih + 48;
    const X = v => r1(left + ((v - xs[0]) / (xs[xs.length - 1] - xs[0])) * iw);
    const Y = v => r1(top + ih - ((v - yMin) / (yMax - yMin)) * ih);
    let b = text(4, 18, yLabel, { anchor: 'start', size: 13, cls: 's-text s-bold' });
    for (let v = yMin; v <= yMax; v += minor) {
      b += line(left, Y(v), left + iw, Y(v), 's-grid');
      if (v % major === 0) b += text(left - 8, Y(v) + 5, fmt(v), { anchor: 'end', size: 13 });
    }
    xs.forEach(x => { b += line(X(x), top, X(x), top + ih, 's-grid') + text(X(x), top + ih + 20, xFmt(x), { size: 13 }); });
    const y0 = Y(yMin < 0 ? 0 : yMin);
    b += line(left, top - 10, left, top + ih) + line(left, y0, left + iw + 12, y0);
    b += text(left + iw + 12, top + ih + 42, xLabel, { anchor: 'end', size: 13, cls: 's-text s-bold' });
    b += `<polyline points="${xs.map((x, i) => `${X(x)},${Y(ys[i])}`).join(' ')}" class="s-accent-line"/>`;
    b += xs.map((x, i) => dot(X(x), Y(ys[i]), 's-accent')).join('');
    return svg(W, H, b);
  }

  // Unit grid with labelled points (for "placer des points").
  function repere(points, { xMax, yMax, xLabel = 'x', yLabel = 'y' }) {
    const c = 24, left = 40, top = 30, W = left + xMax * c + 34, H = top + yMax * c + 34;
    const P = (x, y) => [left + x * c, top + (yMax - y) * c];
    let b = '';
    for (let i = 0; i <= xMax; i++) { b += line(...P(i, 0), ...P(i, yMax), 's-grid'); if (i % 2 === 0) b += text(P(i, 0)[0], P(i, 0)[1] + 20, fmt(i), { size: 13 }); }
    for (let j = 0; j <= yMax; j++) { b += line(...P(0, j), ...P(xMax, j), 's-grid'); if (j % 2 === 0 && j) b += text(left - 8, P(0, j)[1] + 5, fmt(j), { anchor: 'end', size: 13 }); }
    b += line(...P(0, 0), left + xMax * c + 14, P(0, 0)[1], 's-line') + line(...P(0, 0), left, top - 14, 's-line');
    b += text(left + xMax * c + 24, P(0, 0)[1] + 5, xLabel, { cls: 's-text s-bold' }) + text(left, top - 18, yLabel, { cls: 's-text s-bold' });
    points.forEach(p => {
      const [x, y] = P(p.x, p.y);
      b += `<circle cx="${x}" cy="${y}" r="5" class="s-accent"/>` + text(x + 8, y - 7, p.label, { anchor: 'start', cls: 's-text s-bold' });
    });
    return svg(W, H, b);
  }

  // ===================== DONNÉES (6e) =====================

  const BAR_THEMES = [
    { id: 'clubs', title: 'Inscriptions aux clubs du collège', axis: 'Nombre d’élèves', s1: [1, 2, 5], s2: [10, 20],
      cats: [['Échecs', 'au club échecs'], ['Théâtre', 'au club théâtre'], ['Chorale', 'à la chorale'], ['Robotique', 'au club robotique'], ['Dessin', 'au club dessin']],
      ask: p => `Combien d’élèves sont inscrits ${p} ?`, diff: (a, b) => `Combien d’élèves de plus sont inscrits ${a} ${que(b)} ?`,
      tot: 'Combien d’inscriptions y a-t-il en tout ?', most: 'Quel club a le plus d’inscrits ?', least: 'Quel club a le moins d’inscrits ?' },
    { id: 'cdi', title: 'Livres empruntés au CDI', axis: 'Nombre de livres', s1: [2, 5, 10], s2: [10, 20],
      cats: [['Lundi', 'le lundi'], ['Mardi', 'le mardi'], ['Jeudi', 'le jeudi'], ['Vendredi', 'le vendredi']],
      ask: p => `Combien de livres ont été empruntés ${p} ?`, diff: (a, b) => `Combien de livres de plus ont été empruntés ${a} ${que(b)} ?`,
      tot: 'Combien de livres ont été empruntés en tout sur ces quatre jours ?', most: 'Quel jour a-t-on emprunté le plus de livres ?', least: 'Quel jour a-t-on emprunté le moins de livres ?' },
    { id: 'pluie', title: 'Hauteur de pluie tombée chaque mois', axis: 'Pluie (mm)', unit: 'mm', s1: [5, 10], s2: [20, 50],
      cats: [['Janv.', 'en janvier'], ['Févr.', 'en février'], ['Mars', 'en mars'], ['Avril', 'en avril'], ['Mai', 'en mai'], ['Juin', 'en juin']],
      ask: p => `Quelle hauteur de pluie est tombée ${p} ?`, diff: (a, b) => `Combien de millimètres de pluie de plus sont tombés ${a} ${que(b)} ?`,
      tot: 'Quelle hauteur de pluie est tombée en tout sur ces six mois ?', most: 'Quel mois a été le plus pluvieux ?', least: 'Quel mois a été le moins pluvieux ?' },
    { id: 'oiseaux', title: 'Oiseaux observés dans le jardin du collège', axis: 'Nombre d’oiseaux', s1: [1, 2, 5], s2: [10],
      cats: [['Mésange', 'mésanges'], ['Moineau', 'moineaux'], ['Merle', 'merles'], ['Pigeon', 'pigeons'], ['Pie', 'pies']],
      ask: p => `Combien a-t-on observé de ${p} ?`, diff: (a, b) => `Combien a-t-on observé de ${a} de plus que de ${b} ?`,
      tot: 'Combien d’oiseaux a-t-on observés en tout ?', most: 'Quelle espèce a été la plus observée ?', least: 'Quelle espèce a été la moins observée ?' },
    { id: 'tri', title: 'Déchets triés au collège en un mois', axis: 'Masse (kg)', unit: 'kg', s1: [5, 10], s2: [20, 50, 100],
      cats: [['Papier', 'de papier'], ['Verre', 'de verre'], ['Plastique', 'de plastique'], ['Métal', 'de métal']],
      ask: p => `Quelle masse ${p} a été triée ?`, diff: (a, b) => `Quelle masse ${a} de plus ${que(b)} a-t-on triée ?`,
      tot: 'Quelle masse de déchets a été triée en tout ?', most: 'Quel déchet a la plus grande masse triée ?', least: 'Quel déchet a la plus petite masse triée ?' },
  ];
  const withUnit = (v, u) => `${fmt(v)}${u ? ` ${u}` : ''}`;

  function dBar(level, rng) {
    const th = rng.pick(BAR_THEMES), cats = th.cats;
    let major, minor, lines;
    if (level === 1) { major = minor = rng.pick(th.s1); lines = rng.int(6, 9); }
    else { major = rng.pick(th.s2); minor = level === 3 && rng.chance(0.5) ? major / 5 : major / 2; lines = (rng.int(4, 6) * major) / minor; }
    const max = minor * lines;
    const values = rng.sample(range(level === 1 ? 1 : 2, lines), cats.length).map(k => k * minor);
    const head = `<b>${th.title}</b>${barChart(cats.map(c => c[0]), values, { max, minor, major, axis: th.axis })}`;
    const key = `db:${th.id}:${values}`;
    if (level === 1 && rng.chance(0.35)) {
      const most = rng.chance(0.6), idx = values.indexOf(most ? Math.max(...values) : Math.min(...values));
      return Q(`${key}:${most}`, head + (most ? th.most : th.least), choice(rng, cats[idx][0], cats.filter((_, j) => j !== idx).map(c => c[0])),
        `Cherche la barre la plus ${most ? 'haute' : 'basse'}.`,
        `La barre la plus ${most ? 'haute' : 'basse'} est celle de « ${cats[idx][0]} » (${withUnit(values[idx], th.unit)}) : <b>${cats[idx][0]}</b>.`);
    }
    if (level < 3) {
      const i = rng.int(0, cats.length - 1), v = values[i];
      return Q(`${key}:${i}`, head + th.ask(cats[i][1]), num(v, th.unit),
        level === 1 ? 'Suis le haut de la barre, horizontalement, jusqu’à l’axe gradué.' : `Seules certaines lignes sont graduées : chaque ligne du quadrillage ajoute ${fmt(minor)}.`,
        `Le haut de la barre « ${cats[i][0]} » est au niveau de ${fmt(v)} sur l’axe : <b>${withUnit(v, th.unit)}</b>.`);
    }
    if (rng.chance(0.5)) {
      const t = total(values);
      return Q(`${key}:tot`, head + th.tot, num(t, th.unit), 'Lis la valeur de chaque barre, puis additionne.',
        `${values.map(fmt).join(' + ')} = <b>${withUnit(t, th.unit)}</b>.`);
    }
    const [i, j] = rng.sample(range(0, cats.length - 1), 2).sort((a, b) => values[b] - values[a]);
    const d = values[i] - values[j];
    return Q(`${key}:${i}-${j}`, head + th.diff(cats[i][1], cats[j][1]), num(d, th.unit), 'Lis les deux barres, puis calcule l’écart entre elles.',
      `« ${cats[i][0]} » : ${fmt(values[i])} ; « ${cats[j][0]} » : ${fmt(values[j])}. ${fmt(values[i])} − ${fmt(values[j])} = <b>${withUnit(d, th.unit)}</b>.`);
  }

  const PIE_THEMES = [
    { id: 'sport', q: 'Quel est ton sport préféré ?', who: 'élèves', cats: [['Foot', 'le foot'], ['Judo', 'le judo'], ['Danse', 'la danse'], ['Tennis', 'le tennis'], ['Basket', 'le basket']],
      ask: p => `Combien d’élèves ont choisi ${p} ?`, pct: p => `Quel pourcentage des élèves a choisi ${p} ?`, most: 'Quel sport a été le plus choisi ?', half: 'Quel sport a été choisi par la moitié des élèves ?' },
    { id: 'transport', q: 'Comment viens-tu au collège ?', who: 'élèves', cats: [['À pied', 'à pied'], ['Vélo', 'à vélo'], ['Bus', 'en bus'], ['Voiture', 'en voiture']],
      ask: p => `Combien d’élèves viennent ${p} ?`, pct: p => `Quel pourcentage des élèves vient ${p} ?`, most: 'Quel moyen de transport est le plus utilisé ?', half: 'Quel moyen de transport la moitié des élèves utilise-t-elle ?' },
    { id: 'fruit', q: 'Quel est ton fruit préféré ?', who: 'personnes', cats: [['Pomme', 'la pomme'], ['Fraise', 'la fraise'], ['Banane', 'la banane'], ['Kiwi', 'le kiwi'], ['Poire', 'la poire']],
      ask: p => `Combien de personnes ont choisi ${p} ?`, pct: p => `Quel pourcentage des personnes a choisi ${p} ?`, most: 'Quel fruit a été le plus choisi ?', half: 'Quel fruit a été choisi par la moitié des personnes ?' },
  ];
  const PIE_COMPS = {
    1: [[4, 2, 2], [4, 2, 1, 1], [4, 3, 1], [5, 2, 1], [3, 2, 2, 1], [6, 1, 1], [4, 1, 1, 2]],
    2: [[4, 2, 2], [6, 2], [4, 2, 1, 1], [2, 4, 2], [2, 4, 1, 1], [4, 3, 1], [5, 2, 1]],
    3: [[3, 2, 2, 1], [3, 3, 2], [5, 2, 1], [3, 1, 4], [1, 3, 2, 2], [5, 3], [3, 4, 1]],
  };
  const PART_WORD = { 1: 'un huitième', 2: 'un quart', 3: 'trois huitièmes', 4: 'la moitié', 5: 'cinq huitièmes', 6: 'trois quarts' };

  function dPie(level, rng) {
    const th = rng.pick(PIE_THEMES), units = rng.shuffle(rng.pick(PIE_COMPS[level])), names = rng.sample(th.cats, units.length);
    const parts = units.map((u, i) => ({ label: names[i][0], u }));
    const head = `On a demandé à des ${th.who} : « ${th.q} ». Voici les résultats.${pieChart(parts, 8)}`;
    const key = `dp:${th.id}:${units}:${names.map(n => n[0])}`;
    if (level === 1) {
      const hi = units.indexOf(4), useHalf = hi >= 0 && rng.chance(0.5), idx = useHalf ? hi : units.indexOf(Math.max(...units));
      return Q(`${key}:${useHalf}`, head + (useHalf ? th.half : th.most), choice(rng, names[idx][0], names.filter((_, j) => j !== idx).map(n => n[0])),
        useHalf ? 'Cherche le secteur qui occupe un demi-disque.' : 'Cherche le plus grand secteur.',
        useHalf ? `Le secteur « ${names[idx][0]} » occupe la moitié du disque (4 huitièmes) : <b>${names[idx][0]}</b>.`
          : `Le plus grand secteur est « ${names[idx][0]} » : <b>${names[idx][0]}</b>.`);
    }
    const cand = units.map((u, i) => i).filter(i => (level === 2 ? units[i] % 2 === 0 : units[i] % 2 === 1));
    const i = rng.pick(cand), u = units[i], [a, b] = simp(u, 8);
    if (level === 3 && rng.chance(0.5)) {
      const p = mul(u, 12.5);
      return Q(`${key}:${i}:pct`, head + th.pct(names[i][1]), num(p, '%'), 'Le disque entier représente 100 %. Combien vaut un huitième du disque ?',
        `Le secteur « ${names[i][0]} » représente ${frac(u, 8)} du disque. Un huitième, c’est 100 % ÷ 8 = 12,5 %, donc ${u} × 12,5 % = <b>${fmt(p)} %</b>.`);
    }
    const N = 8 * rng.int(3, 10), v = (N * u) / 8;
    return Q(`${key}:${i}:${N}`, `${head}${fmt(N)} ${th.who} ont répondu. ${th.ask(names[i][1])}`, num(v),
      'Quelle fraction du disque représente ce secteur ? Aide-toi des petits traits autour du disque.',
      `Le secteur « ${names[i][0]} » représente ${PART_WORD[u]} du disque (${frs(u, 8)}). ${frac(a, b)} de ${fmt(N)} : ${fmt(N)} ÷ ${b}${a > 1 ? ` × ${a}` : ''} = <b>${fmt(v)}</b>.`);
  }

  const HOURS = [6, 8, 10, 12, 14, 16, 18, 20];
  function dLine(level, rng) {
    let t, peak;
    do {
      peak = rng.int(3, 5); t = [rng.int(2, 6) * 2];
      for (let i = 1; i < HOURS.length; i++) t.push(t[i - 1] + (i <= peak ? 1 : -1) * rng.pick([2, 2, 4]));
    } while (Math.min(...t) < 0);
    const yMax = Math.ceil((Math.max(...t) + 1) / 4) * 4;
    const head = `<b>Température relevée dans la cour du collège au cours d’une journée</b>${lineChart(HOURS, t, { yMax, minor: 2, major: 4, yLabel: 'Température (°C)', xLabel: 'Heure', xFmt: h => `${h} h` })}`;
    const key = `dl:${t}`;
    if (level === 2) {
      const i = rng.int(0, HOURS.length - 1);
      return Q(`${key}:${i}`, `${head}Quelle température faisait-il à ${HOURS[i]} h ?`, num(t[i], '°C'),
        'Pars de l’heure demandée sur l’axe horizontal, monte jusqu’au point, puis lis sur l’axe vertical (chaque ligne vaut 2 °C).',
        `Le point placé à ${HOURS[i]} h est au niveau de ${fmt(t[i])} sur l’axe vertical : <b>${fmt(t[i])} °C</b>.`);
    }
    const k = rng.int(0, 2);
    if (k === 0) {
      const h = HOURS[peak];
      return Q(`${key}:max`, `${head}À quelle heure la température a-t-elle été la plus élevée ?`, num(h, 'h'), 'Cherche le point le plus haut de la courbe.',
        `Le point le plus haut est à ${fmt(t[peak])} °C, à <b>${fmt(h)} h</b>.`);
    }
    if (k === 1) {
      const hi = Math.max(...t), lo = Math.min(...t), d = hi - lo;
      return Q(`${key}:ecart`, `${head}Quel est l’écart entre la température la plus haute et la température la plus basse de cette journée ?`, num(d, '°C'),
        'Lis la température du point le plus haut et celle du point le plus bas.',
        `Plus haute : ${fmt(hi)} °C ; plus basse : ${fmt(lo)} °C. ${fmt(hi)} − ${fmt(lo)} = <b>${fmt(d)} °C</b>.`);
    }
    const up = rng.chance(0.5);
    const [i, j] = up ? rng.sample(range(0, peak), 2).sort((a, b) => a - b) : rng.sample(range(peak, HOURS.length - 1), 2).sort((a, b) => a - b);
    const d = Math.abs(t[j] - t[i]);
    return Q(`${key}:${i}-${j}`, `${head}De combien de degrés la température a-t-elle ${up ? 'augmenté' : 'baissé'} entre ${HOURS[i]} h et ${HOURS[j]} h ?`, num(d, '°C'),
      'Lis la température aux deux heures, puis calcule l’écart.',
      `À ${HOURS[i]} h : ${fmt(t[i])} °C ; à ${HOURS[j]} h : ${fmt(t[j])} °C. ${fmt(Math.max(t[i], t[j]))} − ${fmt(Math.min(t[i], t[j]))} = <b>${fmt(d)} °C</b>.`);
  }

  const T2_THEMES = [
    { id: 'transport', title: 'Comment les élèves de 6e viennent-ils au collège ?', rows: [['À pied', 'viennent à pied'], ['À vélo', 'viennent à vélo'], ['En bus', 'viennent en bus'], ['En voiture', 'viennent en voiture']], cols: [['Filles', 'filles'], ['Garçons', 'garçons']] },
    { id: 'cantine', title: 'Élèves de 6e et cantine', rows: [['6e A', 'sont en 6e A'], ['6e B', 'sont en 6e B'], ['6e C', 'sont en 6e C'], ['6e D', 'sont en 6e D']], cols: [['Demi-pensionnaires', 'demi-pensionnaires'], ['Externes', 'externes']] },
  ];
  function dTable2(level, rng) {
    const th = rng.pick(T2_THEMES), vals = th.rows.map(() => [rng.int(2, 16), rng.int(2, 16)]);
    const head = `<b>${th.title}</b>${table([['', th.cols[0][0], th.cols[1][0]], ...th.rows.map((r, i) => [r[0], ...vals[i]])])}`;
    const key = `dt:${th.id}:${vals}`;
    if (level === 1) {
      const i = rng.int(0, 3), j = rng.int(0, 1), v = vals[i][j];
      return Q(`${key}:${i}${j}`, `${head}Combien de ${th.cols[j][1]} ${th.rows[i][1]} ?`, num(v), 'Trouve la bonne ligne et la bonne colonne : la réponse est dans la case où elles se croisent.',
        `Ligne « ${th.rows[i][0]} », colonne « ${th.cols[j][0]} » : <b>${fmt(v)}</b>.`);
    }
    if (rng.chance(0.5)) {
      const i = rng.int(0, 3), v = vals[i][0] + vals[i][1];
      return Q(`${key}:r${i}`, `${head}Combien d’élèves ${th.rows[i][1]} en tout ?`, num(v), 'Il faut additionner les deux cases de la ligne.',
        `${th.cols[0][0]} : ${vals[i][0]} ; ${th.cols[1][0].toLowerCase()} : ${vals[i][1]}. ${vals[i][0]} + ${vals[i][1]} = <b>${fmt(v)}</b>.`);
    }
    const j = rng.int(0, 1), col = vals.map(r => r[j]), v = total(col);
    return Q(`${key}:c${j}`, `${head}Combien de ${th.cols[j][1]} y a-t-il en tout ?`, num(v), 'Il faut additionner toutes les cases de la colonne.',
      `${col.join(' + ')} = <b>${fmt(v)}</b>.`);
  }

  const DRIVERS = ['Inès', 'Hugo', 'Malik', 'Zoé', 'Léon', 'Nora', 'Yanis', 'Chloé', 'Sacha', 'Lina'];
  const hm = m => `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}`;
  const uniqueMin = (rows, f) => { const m = Math.min(...rows.map(f)); return rows.filter(r => f(r) === m).length === 1 ? rows.find(r => f(r) === m) : null; };
  function dFilter(level, rng) {
    const trips = () => rng.sample(DRIVERS, 5).map(n => ({ n, dep: rng.int(7, 13), dur: rng.int(15, 26) * 10, prix: rng.int(15, 35), pl: rng.int(1, 4) }));
    const show = rows => `<b>Trajets en covoiturage de Paris aux Sables-d’Olonne</b>${table([['Conducteur', 'Départ', 'Durée', 'Prix (€)', 'Places libres'], ...rows.map(r => [r.n, `${r.dep} h`, hm(r.dur), r.prix, r.pl])])}`;
    const names = rows => rows.map(r => r.n);
    if (level === 2) {
      const k = rng.int(0, 2);
      for (;;) {
        const rows = trips();
        if (k === 2) {
          const P = rng.pick([20, 25, 30]), c = rows.filter(r => r.prix < P).length;
          if (rows.some(r => r.prix === P) || c < 1 || c > 4) continue;
          return Q(`df:${JSON.stringify(rows)}:${P}`, `${show(rows)}Combien de trajets coûtent moins de ${P} € ?`, num(c), 'Regarde seulement la colonne des prix.',
            `Prix inférieurs à ${P} € : ${rows.filter(r => r.prix < P).map(r => `${r.prix} € (${r.n})`).join(', ')}. Il y en a <b>${fmt(c)}</b>.`);
        }
        const f = k === 0 ? r => r.prix : r => r.dur, best = uniqueMin(rows, f);
        if (!best) continue;
        return Q(`df:${JSON.stringify(rows)}:${k}`, `${show(rows)}${k === 0 ? 'Tu veux payer le moins cher possible. Quel trajet choisis-tu ?' : 'Tu veux arriver le plus vite possible (trajet le plus court). Quel trajet choisis-tu ?'}`,
          choice(rng, best.n, names(rows).filter(n => n !== best.n), { keepOrder: false }),
          `Regarde seulement la colonne « ${k === 0 ? 'Prix' : 'Durée'} ».`,
          `${k === 0 ? `Le prix le plus bas est ${best.prix} €` : `La durée la plus courte est ${hm(best.dur)}`} : c’est le trajet de <b>${best.n}</b>.`);
      }
    }
    const crit = [
      { id: 'dep', txt: H => `Tu veux partir à ${H} h ou plus tard, et payer le moins cher possible.`, keep: H => r => r.dep >= H, f: r => r.prix, why: (H, b) => `Trajets qui partent à ${H} h ou après : ${'%'}. Parmi eux, le moins cher coûte ${b.prix} €`, H: () => rng.int(9, 11) },
      { id: 'pl', txt: () => 'Tu voyages avec une autre personne : il faut au moins 2 places libres. Tu veux le trajet le plus court.', keep: () => r => r.pl >= 2, f: r => r.dur, why: (H, b) => `Trajets avec au moins 2 places : ${'%'}. Parmi eux, le plus court dure ${hm(b.dur)}`, H: () => 0 },
      { id: 'prix', txt: H => `Tu veux dépenser moins de ${H} € et partir le plus tôt possible.`, keep: H => r => r.prix < H, f: r => r.dep, why: (H, b) => `Trajets à moins de ${H} € : ${'%'}. Parmi eux, le premier part à ${b.dep} h`, H: () => rng.pick([25, 30]) },
    ];
    const c = rng.pick(crit);
    for (;;) {
      const rows = trips(), H = c.H(), kept = rows.filter(c.keep(H));
      if (c.id === 'prix' && rows.some(r => r.prix === H)) continue;
      if (kept.length < 2 || kept.length > 4) continue;
      const best = uniqueMin(kept, c.f), globalBest = Math.min(...rows.map(c.f));
      if (!best || c.f(best) === globalBest) continue;
      return Q(`df3:${JSON.stringify(rows)}:${c.id}:${H}`, `${show(rows)}${c.txt(H)} Quel trajet choisis-tu ?`, choice(rng, best.n, names(rows).filter(n => n !== best.n)),
        'Barre d’abord les trajets qui ne respectent pas la première condition, puis compare ceux qui restent.',
        `${c.why(H, best).replace('%', names(kept).join(', '))} : c’est le trajet de <b>${best.n}</b>.`);
    }
  }

  function dBuild(level, rng) {
    const hours = [8, 10, 12, 16], temp = [rng.int(8, 14)], hum = [rng.int(70, 85)];
    for (let i = 1; i < 4; i++) { temp.push(temp[i - 1] + (i < 3 ? rng.int(3, 6) : -rng.int(1, 3))); hum.push(hum[i - 1] - rng.int(4, 14)); }
    const txt = `Des élèves ont relevé la température et l’humidité de l’air dans la cour. À 8 h, il faisait ${temp[0]} °C et il y avait ${hum[0]} % d’humidité ; à 10 h, ${temp[1]} °C et ${hum[1]} % ; à 12 h, ${temp[2]} °C et ${hum[2]} % ; enfin à 16 h, ${temp[3]} °C et ${hum[3]} %.`;
    const row = rng.int(0, 1), col = rng.int(0, 3), v = row ? hum[col] : temp[col];
    const cells = arr => arr.map((x, i) => (i === col ? hole : x));
    const tab = ptable([['Heure', ...hours.map(h => `${h} h`)], ['Température (°C)', ...(row ? temp : cells(temp))], ['Humidité (%)', ...(row ? cells(hum) : hum)]]);
    return Q(`dbu:${temp}:${hum}:${row}${col}`, `<i>${txt}</i><br>On range ces données dans un tableau.${tab}Quel nombre faut-il écrire à la place du « ? » ?`, num(v),
      'Repère l’heure de la colonne et la grandeur de la ligne, puis retrouve la phrase correspondante dans le texte.',
      `À ${hours[col]} h, ${row ? `l’humidité était de ${hum[col]} %` : `il faisait ${temp[col]} °C`} : on écrit <b>${fmt(v)}</b>.`);
  }

  const D_GEN = { bar: dBar, pie: dPie, line: dLine, table2: dTable2, filter: dFilter, build: dBuild };
  const D_KINDS = { 1: ['bar', 'bar', 'table2', 'pie', 'build'], 2: ['bar', 'pie', 'line', 'filter', 'table2'], 3: ['bar', 'pie', 'line', 'filter'] };

  const exBar = barChart(['Lun.', 'Mar.', 'Jeu.', 'Ven.'], [12, 8, 18, 10], { max: 20, minor: 2, major: 4, axis: 'Livres empruntés' });
  const exPie = pieChart([{ label: 'Foot', u: 4 }, { label: 'Danse', u: 2 }, { label: 'Judo', u: 1 }, { label: 'Tennis', u: 1 }], 8);
  const exLine = lineChart([8, 10, 12, 14, 16, 18], [10, 14, 20, 22, 18, 14], { yMax: 24, minor: 2, major: 4, yLabel: 'Température (°C)', xLabel: 'Heure', xFmt: h => `${h} h` });

  M.notion('donnees', {
    lesson: {
      retenir: 'Pour lire un <b>tableau</b>, on croise une ligne et une colonne. Dans un <b>diagramme en barres</b>, la hauteur de chaque barre se lit sur l’axe gradué. Dans un <b>diagramme circulaire</b>, chaque secteur représente une part du total (un demi-disque = la moitié, un quart de disque = le quart). Une <b>courbe</b> montre comment une grandeur évolue, par exemple la température au fil des heures.',
      explication: `<p><b>Diagramme en barres</b> : le jeudi, la barre arrive à 18, donc 18 livres ont été empruntés.</p>${exBar}<p><b>Diagramme circulaire</b> : le secteur « Foot » occupe un demi-disque. Si 40 élèves ont répondu, la moitié, soit 20 élèves, a choisi le foot. « Danse » occupe un quart du disque : 40 ÷ 4 = 10 élèves.</p>${exPie}`,
      methode: [
        'Lis d’abord le <b>titre</b>, puis ce que représentent les axes, les lignes et les colonnes (et les unités !).',
        'Regarde de combien en combien est gradué l’axe : une ligne non numérotée du quadrillage a aussi une valeur.',
        'Pour une barre ou un point : suis une ligne horizontale jusqu’à l’axe gradué.',
        'Pour un diagramme circulaire : repère la fraction du disque (moitié, quart, huitième…), puis prends cette fraction du total.',
        'Pour choisir dans un tableau selon un critère : barre d’abord les lignes qui ne conviennent pas, puis compare celles qui restent.',
      ],
      exemples: [
        { q: `${exLine}Quelle température faisait-il à 12 h ? De combien a-t-elle baissé entre 14 h et 18 h ?`, r: 'À 12 h, le point est au niveau de <b>20 °C</b>. À 14 h : 22 °C ; à 18 h : 14 °C ; 22 − 14 = <b>8 °C</b> de baisse.' },
        { q: `${table([['', 'Filles', 'Garçons'], ['Bus', 12, 9], ['Vélo', 4, 7]])}Combien d’élèves viennent à vélo ?`, r: 'Ligne « Vélo » : 4 filles et 7 garçons, donc 4 + 7 = <b>11 élèves</b>.' },
      ],
      astuces: ['Dans un diagramme circulaire, compare chaque secteur au demi-disque et au quart de disque : c’est souvent suffisant pour répondre.'],
      erreurs: [
        'Croire que chaque ligne du quadrillage vaut 1 : vérifie toujours la graduation de l’axe.',
        'Oublier l’unité (°C, mm, kg…) lue sur l’axe.',
      ],
    },
    generate(level, rng) {
      return D_GEN[rng.pick(D_KINDS[level])](level, rng);
    },
  });

  // ===================== PROBABILITÉS (6e) =====================

  const SCALE = ['Impossible', 'Peu probable', 'Une chance sur deux', 'Très probable', 'Certain'];
  const SCALE_EVENTS = [
    ['Obtenir 7 en lançant un dé à six faces numérotées de 1 à 6.', 0, 'Aucune face ne porte le 7 : la probabilité est 0.'],
    ['Tirer une boule rouge dans un sac qui ne contient que des boules bleues.', 0, 'Il n’y a aucune boule rouge : la probabilité est 0.'],
    ['Obtenir un nombre plus grand que 10 en lançant un dé à six faces.', 0, 'Le plus grand nombre du dé est 6 : la probabilité est 0.'],
    ['Obtenir 10 fois de suite le 1 en lançant un dé à six faces.', 1, 'C’est possible, mais extrêmement rare.'],
    ['Tirer l’as de cœur dans un jeu de 32 cartes.', 1, `Une seule carte sur 32 convient : 1 chance sur 32, c’est ${frac(1, 32)}.`],
    ['Obtenir 6 en lançant un dé à six faces.', 1, `Une face sur 6 : la probabilité est ${frac(1, 6)}, c’est peu.`],
    ['Obtenir pile en lançant une pièce équilibrée.', 2, `Pile ou face : une chance sur deux, la probabilité est ${frac(1, 2)}.`],
    ['Obtenir un nombre pair en lançant un dé à six faces.', 2, `3 faces sur 6 (2, 4, 6) : ${frac(3, 6)} = ${frac(1, 2)}.`],
    ['Tirer une carte rouge dans un jeu de 32 cartes.', 2, `16 cartes rouges sur 32 : ${frac(16, 32)} = ${frac(1, 2)}.`],
    ['Ne pas trouver la bonne combinaison au loto.', 3, 'Il y a des millions de combinaisons : on perd presque à tous les coups.'],
    ['Ne pas obtenir 6 en lançant un dé à six faces.', 3, `5 faces sur 6 conviennent : ${frac(5, 6)}, c’est proche de 1.`],
    ['Tirer une boule verte dans un sac de 9 boules vertes et 1 boule jaune.', 3, `9 boules sur 10 sont vertes : ${frac(9, 10)}.`],
    ['Obtenir un nombre entre 1 et 6 en lançant un dé à six faces numérotées de 1 à 6.', 4, 'Toutes les faces conviennent : la probabilité est 1.'],
    ['Tirer une boule bleue dans un sac qui ne contient que des boules bleues.', 4, 'Toutes les boules sont bleues : la probabilité est 1.'],
  ];
  // Positions on a 0–1 scale for the letter version.
  const POS = [0, 1 / 6, 1 / 2, 5 / 6, 1];
  const POS_EVENTS = [
    ['Obtenir 7 en lançant un dé à six faces numérotées de 1 à 6', 'Tirer une boule rouge dans un sac de boules bleues'],
    ['Obtenir 6 en lançant un dé à six faces', 'Obtenir 1 en lançant un dé à six faces'],
    ['Obtenir pile en lançant une pièce équilibrée', 'Obtenir un nombre pair en lançant un dé à six faces'],
    ['Ne pas obtenir 6 en lançant un dé à six faces', 'Obtenir un nombre plus petit que 6 en lançant un dé à six faces'],
    ['Obtenir un nombre entre 1 et 6 en lançant un dé à six faces', 'Tirer une boule bleue dans un sac de boules bleues'],
  ];
  const POS_TXT = ['0 (impossible)', `${frac(1, 6)} (une chance sur six)`, `${frac(1, 2)} (une chance sur deux)`, `${frac(5, 6)} (cinq chances sur six)`, '1 (certain)'];

  const COLORS = [['rouge', 'rouges'], ['bleue', 'bleues'], ['verte', 'vertes'], ['jaune', 'jaunes'], ['noire', 'noires'], ['blanche', 'blanches']];
  const bagText = (cols, counts) => counts.map((c, i) => `${c} boule${c > 1 ? 's' : ''} ${c > 1 ? cols[i][1] : cols[i][0]}`).join(', ').replace(/, ([^,]*)$/, ' et $1');
  function bag(rng, sizes) {
    const k = rng.int(2, 3), cols = rng.sample(COLORS, k);
    let counts;
    do counts = cols.map(() => rng.int(1, 9)); while (sizes && !sizes.includes(total(counts)));
    return { cols, counts, n: total(counts) };
  }
  const DIE_EVENTS = [
    ['un nombre pair', [2, 4, 6]], ['un nombre impair', [1, 3, 5]], ['un nombre supérieur ou égal à 5', [5, 6]], ['un multiple de 3', [3, 6]],
    ['un nombre plus petit que 3', [1, 2]], ['un nombre plus grand que 2', [3, 4, 5, 6]], ['un nombre différent de 6', [1, 2, 3, 4, 5]], ['le 4', [4]], ['un nombre plus petit que 5', [1, 2, 3, 4]],
  ];
  const CARDS = [['un cœur', 8, 'il y a 8 cœurs'], ['un roi', 4, 'il y a 4 rois'], ['une carte rouge', 16, 'il y a 16 cartes rouges (cœurs et carreaux)'],
    ['une figure (valet, dame ou roi)', 12, 'il y a 3 figures dans chacune des 4 couleurs, soit 12'], ['un as noir', 2, 'il y a 2 as noirs (pique et trèfle)'], ['une carte qui n’est pas un pique', 24, 'il y a 32 − 8 = 24 cartes qui ne sont pas des piques']];
  const SPIN = [['rouge', 'R', 's-fill'], ['bleu', 'B', 's-soft s-line'], ['vert', 'V', 's-soft2 s-line'], ['jaune', 'J', 's-empty']];

  const probaGen = {
    1(rng) {
      const k = rng.int(0, 3);
      if (k === 0) {
        const [txt, i, why] = rng.pick(SCALE_EVENTS);
        return Q(`p1s:${txt}`, `Où places-tu cet évènement sur l’échelle des probabilités ?<br><i>${txt}</i>`, fixedChoice(SCALE, SCALE[i]),
          'Combien de cas conviennent, sur combien de cas possibles ?', `<b>${SCALE[i]}</b>. ${why}`);
      }
      if (k === 1) {
        const p = rng.int(0, 4), txt = rng.pick(POS_EVENTS[p]), L = ['A', 'B', 'C', 'D', 'E'];
        const fig = S.numberLine({ from: 0, to: 1, major: 0.5, minor: 3, marks: POS.map((v, i) => ({ v, label: L[i] })), width: 520 });
        return Q(`p1l:${txt}`, `${fig}Quelle lettre de l’échelle correspond à la probabilité de l’évènement suivant ?<br><i>${txt}.</i>`, fixedChoice(L, L[p]),
          'L’échelle va de 0 (impossible) à 1 (certain), et elle est partagée en sixièmes.',
          `Sa probabilité est ${POS_TXT[p]} : c’est la lettre <b>${L[p]}</b>.`);
      }
      if (k === 2) {
        const d = rng.int(2, 10), n = rng.int(1, d - 1);
        return Q(`p1c:${n}/${d}`, `À un jeu, tu as « ${n === 1 ? 'une chance' : `${n} chances`} sur ${d} » de gagner. Écris la probabilité de gagner sous forme de fraction.`, F(n, d),
          '« a chances sur b » se traduit par la fraction a sur b.', `« ${n} chance${n > 1 ? 's' : ''} sur ${d} » : la probabilité est <b>${frac(n, d)}</b>.`);
      }
      if (rng.chance(0.4)) {
        const imp = rng.chance(0.5);
        const txt = imp ? rng.pick(['obtenir 0 en lançant un dé à six faces numérotées de 1 à 6', 'tirer une boule noire dans un sac qui ne contient que des boules blanches'])
          : rng.pick(['obtenir pile ou face en lançant une pièce', 'tirer une boule blanche dans un sac qui ne contient que des boules blanches']);
        return Q(`p1n:${txt}`, `Quelle est la probabilité de l’évènement : « ${txt} » ?`, num(imp ? 0 : 1), 'Cet évènement est-il impossible, certain, ou entre les deux ?',
          `Cet évènement est ${imp ? 'impossible : sa probabilité est <b>0</b>' : 'certain : sa probabilité est <b>1</b>'}.`);
      }
      const coin = rng.chance(0.3), face = rng.int(1, 6);
      return Q(`p1d:${coin ? 'coin' : face}`, coin ? 'On lance une pièce équilibrée. Quelle est la probabilité d’obtenir face ? (fraction)' : `On lance un dé équilibré à six faces. Quelle est la probabilité d’obtenir ${face} ? (fraction)`,
        F(1, coin ? 2 : 6), 'Combien de résultats possibles ? Combien conviennent ?',
        coin ? `2 résultats possibles (pile, face), 1 seul convient : <b>${frac(1, 2)}</b>.` : `6 faces possibles, une seule porte le ${face} : <b>${frac(1, 6)}</b>.`);
    },
    2(rng) {
      const k = rng.int(0, 2);
      if (k === 0) {
        const { cols, counts, n } = bag(rng), i = rng.int(0, cols.length - 1);
        return Q(`p2b:${counts}:${cols.map(c => c[0])}:${i}`, `Un sac contient ${bagText(cols, counts)}. On tire une boule au hasard, sans regarder. Quelle est la probabilité de tirer une boule ${cols[i][0]} ?`,
          F(counts[i], n), 'Compte toutes les boules, puis celles de la bonne couleur.',
          `Il y a ${counts.join(' + ')} = ${n} boules, dont ${counts[i]} ${counts[i] > 1 ? cols[i][1] : cols[i][0]}. La probabilité est <b>${frs(counts[i], n)}</b>.`);
      }
      if (k === 1) {
        const [txt, ok] = rng.pick(DIE_EVENTS);
        return Q(`p2d:${txt}`, `On lance un dé équilibré à six faces numérotées de 1 à 6. Quelle est la probabilité d’obtenir ${txt} ?`, F(ok.length, 6),
          'Écris la liste des faces qui conviennent.', `Faces qui conviennent : ${ok.join(', ')}, soit ${ok.length} sur 6. La probabilité est <b>${frs(ok.length, 6)}</b>.`);
      }
      const n = rng.pick([4, 5, 6, 8, 10]), cols = rng.sample(SPIN, rng.int(2, 3));
      let counts;
      do counts = cols.map(() => rng.int(1, n - 1)); while (total(counts) !== n);
      const sectors = rng.shuffle(cols.flatMap((c, i) => Array(counts[i]).fill(c)));
      const fig = pieChart(sectors.map(c => ({ label: c[0], short: c[1], cls: c[2], u: 1 })), n, { ticks: 0, legend: cols.map(c => ({ label: `${c[1]} : ${c[0]}`, cls: c[2] })) });
      const i = rng.int(0, cols.length - 1);
      return Q(`p2r:${sectors.map(c => c[1]).join('')}:${i}`, `${fig}On fait tourner cette roue, partagée en ${n} secteurs identiques. Quelle est la probabilité que la flèche s’arrête sur le ${cols[i][0]} ?`,
        F(counts[i], n), 'Compte tous les secteurs, puis ceux de la bonne couleur.',
        `${counts[i]} secteur${counts[i] > 1 ? 's' : ''} ${cols[i][0]}${counts[i] > 1 ? 's' : ''} sur ${n} : la probabilité est <b>${frs(counts[i], n)}</b>.`);
    },
    3(rng) {
      const k = rng.int(0, 3);
      if (k === 0) {
        const { cols, counts, n } = bag(rng, [4, 5, 8, 10, 20, 25]), i = rng.int(0, cols.length - 1), pct = rng.chance(0.5);
        const p = div(counts[i], n), v = pct ? mul(p, 100) : p;
        return Q(`p3b:${counts}:${cols.map(c => c[0])}:${i}:${pct}`, `Un sac contient ${bagText(cols, counts)}. On tire une boule au hasard. Quelle est la probabilité de tirer une boule ${cols[i][0]} ? Donne-la ${pct ? 'en pourcentage' : 'sous forme décimale'}.`,
          num(v, pct ? '%' : undefined), `Écris d’abord la fraction, puis ${pct ? 'transforme-la en fraction sur 100' : 'divise le numérateur par le dénominateur'}.`,
          `${counts[i]} boule${counts[i] > 1 ? 's' : ''} sur ${n} : ${frac(counts[i], n)} = ${counts[i]} ÷ ${n} = ${fmt(p)}${pct ? ` = ${frac(fmt(v), 100)} = <b>${fmt(v)} %</b>` : ` ; la probabilité est <b>${fmt(v)}</b>`}.`);
      }
      if (k === 1) {
        const [txt, c, why] = rng.pick(CARDS), form = c < 4 ? rng.pick(['f', 'd']) : rng.pick(['f', 'd', 'p']);
        const p = div(c, 32);
        if (form === 'f') return Q(`p3c:${txt}:f`, `On tire une carte au hasard dans un jeu de 32 cartes. Quelle est la probabilité de tirer ${txt} ? (fraction)`, F(c, 32),
          'Combien de cartes conviennent, sur 32 ?', `Sur 32 cartes, ${why} : la probabilité est <b>${frs(c, 32)}</b>.`);
        const v = form === 'p' ? mul(p, 100) : p;
        return Q(`p3c:${txt}:${form}`, `On tire une carte au hasard dans un jeu de 32 cartes. Quelle est la probabilité de tirer ${txt} ? Donne-la ${form === 'p' ? 'en pourcentage' : 'sous forme décimale'}.`,
          num(v, form === 'p' ? '%' : undefined), 'Écris d’abord la fraction (sur 32), simplifie-la si tu peux, puis effectue la division.',
          `Sur 32 cartes, ${why} : ${frs(c, 32)} = ${fmt(p)}${form === 'p' ? ` = <b>${fmt(v)} %</b>` : `. La probabilité est <b>${fmt(v)}</b>`}.`);
      }
      if (k === 2) {
        let a, b;
        do { a = { r: rng.int(1, 8), t: rng.int(3, 12) }; b = { r: rng.int(1, 8), t: rng.int(3, 12) }; } while (a.r >= a.t || b.r >= b.t || a.t === b.t);
        const cmp = a.r * b.t - b.r * a.t, ans = cmp > 0 ? 'Le sac A' : cmp < 0 ? 'Le sac B' : 'Autant de chances avec les deux';
        const den = M.u.lcm(a.t, b.t);
        return Q(`p3k:${a.r}/${a.t}:${b.r}/${b.t}`, `Sac A : ${a.r} boule${a.r > 1 ? 's' : ''} rouge${a.r > 1 ? 's' : ''} sur ${a.t} boules. Sac B : ${b.r} boule${b.r > 1 ? 's' : ''} rouge${b.r > 1 ? 's' : ''} sur ${b.t} boules. Dans quel sac a-t-on le plus de chances de tirer une boule rouge ?`,
          fixedChoice(['Le sac A', 'Le sac B', 'Autant de chances avec les deux'], ans), 'Écris les deux probabilités sous forme de fractions, puis compare-les (même dénominateur).',
          `Sac A : ${frac(a.r, a.t)} = ${frac(a.r * den / a.t, den)} ; sac B : ${frac(b.r, b.t)} = ${frac(b.r * den / b.t, den)}. Réponse : <b>${ans}</b>.`);
      }
      const r = rng.int(2, 6), kk = rng.int(2, 5), bl = r * (kk - 1);
      return Q(`p3a:${r}:${kk}`, `Un sac contient ${r} boules rouges et des boules bleues. On veut que la probabilité de tirer une boule rouge soit ${frac(1, kk)}. Combien faut-il de boules bleues ?`,
        num(bl), `Une chance sur ${kk} : combien faut-il de boules en tout ?`,
        `Il faut ${kk} fois plus de boules que de rouges : ${r} × ${kk} = ${r * kk} boules en tout, donc ${r * kk} − ${r} = <b>${fmt(bl)}</b> boules bleues.`);
    },
  };

  M.notion('probabilites', {
    lesson: {
      retenir: `La <b>probabilité</b> d’un évènement est un nombre <b>compris entre 0 et 1</b>. Un évènement <b>impossible</b> a une probabilité de 0 ; un évènement <b>certain</b>, une probabilité de 1. Quand tous les résultats ont la même chance, « a chances sur b » donne la probabilité ${frac('a', 'b')}, qu’on peut aussi écrire en nombre décimal ou en pourcentage.`,
      explication: `${S.numberLine({ from: 0, to: 1, major: 0.25, marks: [{ v: 0, label: 'impossible' }, { v: 0.5, label: 'pile' }, { v: 1, label: 'certain' }], width: 520 })}<p>Avec une pièce équilibrée, « obtenir pile », c’est <b>une chance sur deux</b> : ${frac(1, 2)} = 0,5 = 50 %.</p><p>Un sac contient 3 boules noires et 7 blanches. On a <b>3 chances sur 10</b> de tirer une noire : la probabilité est ${frac(3, 10)} = 0,3 = 30 %.</p>`,
      methode: [
        'Vérifie que tous les résultats ont la même chance (dé équilibré, tirage au hasard sans regarder…).',
        'Compte le nombre total de résultats possibles : c’est le dénominateur.',
        'Compte les résultats qui conviennent : c’est le numérateur.',
        'Si on le demande, transforme la fraction en nombre décimal (division) ou en pourcentage (fraction sur 100).',
      ],
      exemples: [
        { q: 'On lance un dé à six faces. Probabilité d’obtenir un nombre pair ?', r: `Faces paires : 2, 4, 6 → 3 sur 6. La probabilité est ${frac(3, 6)} = ${frac(1, 2)} = <b>0,5</b>.` },
        { q: 'Un sac contient 1 boule bleue et 3 rouges. Probabilité de tirer la bleue ?', r: `Une chance sur quatre : ${frac(1, 4)} = 0,25 = <b>25 %</b>.` },
        { q: 'Obtenir 7 avec un dé à six faces ?', r: 'Impossible : la probabilité est <b>0</b>.' },
      ],
      astuces: ['Une probabilité ne dépasse jamais 1 : si tu trouves plus, tu as inversé numérateur et dénominateur.'],
      erreurs: [
        'Dans un sac de 3 rouges et 7 blanches, la probabilité de tirer une rouge n’est pas 3/7 : il faut diviser par le nombre <b>total</b> de boules (10).',
        'Croire qu’après plusieurs « pile », « face » devient plus probable : la pièce ne se souvient de rien !',
      ],
    },
    generate(level, rng) { return probaGen[level](rng); },
  });

  // ===================== STATISTIQUES (5e) =====================

  const SERIES = [
    { what: 'le nombre de frères et sœurs de chaque élève de la classe', label: 'Frères et sœurs', vals: [0, 1, 2, 3, 4], pq: k => `Quel pourcentage des élèves ont au moins ${k} frère${k > 1 ? 's' : ''} ou sœur${k > 1 ? 's' : ''} ?` },
    { what: 'la pointure de chaque élève de la classe', label: 'Pointure', vals: [35, 36, 37, 38, 39, 40], pq: k => `Quel pourcentage des élèves chaussent du ${k} ou plus ?` },
    { what: 'le nombre de buts marqués par une équipe à chaque match', label: 'Buts marqués', vals: [0, 1, 2, 3, 4, 5], pq: k => `Dans quel pourcentage des matchs l’équipe a-t-elle marqué au moins ${k} but${k > 1 ? 's' : ''} ?` },
    { what: 'la note sur 10 de chaque élève à un quiz', label: 'Note sur 10', vals: [4, 5, 6, 7, 8, 9, 10], pq: k => `Quel pourcentage des élèves ont eu au moins ${k} sur 10 ?` },
  ];
  const listHtml = arr => `<div class="calc-line">${arr.join(' ; ')}</div>`;
  function effectifs(rng, k, N) {
    const e = Array(k).fill(1);
    for (let i = k; i < N; i++) e[rng.int(0, k - 1)]++;
    return e;
  }
  const MEAN_CTX = [
    { txt: 'Voici les notes (sur 20) de Sam ce trimestre', lo: 6, hi: 19, u: '' },
    { txt: 'Voici le temps (en minutes) mis par Lou pour venir au collège chaque jour', lo: 8, hi: 25, u: 'min' },
    { txt: 'Voici le nombre de pages lues par Noé chaque soir', lo: 5, hi: 30, u: '' },
    { txt: 'Voici les températures (en °C) relevées à midi plusieurs jours de suite', lo: 12, hi: 28, u: '°C' },
  ];

  const statGen = {
    1(rng) {
      const k = rng.int(0, 2), sr = rng.pick(SERIES);
      if (k === 0) {
        const list = Array.from({ length: rng.int(12, 18) }, () => rng.pick(sr.vals)), v = rng.pick(list), c = list.filter(x => x === v).length;
        return Q(`s1e:${list}:${v}`, `On a relevé ${sr.what} :${listHtml(list)}Quel est l’effectif de la valeur ${v} (le nombre de fois où elle apparaît) ?`, num(c),
          'Barre les valeurs au fur et à mesure que tu les comptes.', `La valeur ${v} apparaît <b>${fmt(c)}</b> fois : son effectif est ${fmt(c)}.`);
      }
      if (k === 1) {
        const N = rng.int(18, 30), e = effectifs(rng, sr.vals.length, N);
        return Q(`s1t:${sr.label}:${e}`, `On a relevé ${sr.what}.${ptable([[sr.label, ...sr.vals], ['Effectif', ...e]])}Quel est l’effectif total ?`, num(N),
          'L’effectif total, c’est le nombre total de valeurs relevées.', `On additionne les effectifs : ${e.join(' + ')} = <b>${fmt(N)}</b>.`);
      }
      const c = rng.pick(MEAN_CTX), n = rng.int(3, 4), vals = Array.from({ length: n - 1 }, () => rng.int(c.lo, c.hi - 3));
      const last0 = rng.int(c.lo, c.hi - 3), s0 = total(vals) + last0;
      vals.push(last0 + ((n - (s0 % n)) % n));
      const s = total(vals), m = s / n;
      return Q(`s1m:${c.txt}:${vals}`, `${c.txt} : ${vals.join(' ; ')}. Calcule la moyenne.`, num(m, c.u || undefined), 'Additionne toutes les valeurs, puis divise par le nombre de valeurs.',
        `(${vals.join(' + ')}) ÷ ${n} = ${s} ÷ ${n} = <b>${fmt(m)}</b>${c.u ? ` ${c.u}` : ''}.`);
    },
    2(rng) {
      const k = rng.int(0, 2);
      if (k === 0) {
        const sr = rng.pick(SERIES), N = rng.pick([20, 25, 40, 50]), e = effectifs(rng, sr.vals.length, N), i = rng.int(0, sr.vals.length - 1), form = rng.pick(['f', 'd', 'p']);
        const head = `On a relevé ${sr.what} (${N} valeurs).${ptable([[sr.label, ...sr.vals], ['Effectif', ...e]])}`;
        if (form === 'f') return Q(`s2f:${sr.label}:${e}:${i}:f`, `${head}Quelle est la fréquence de la valeur ${sr.vals[i]} ? (fraction)`, F(e[i], N),
          'Fréquence = effectif de la valeur ÷ effectif total.', `Effectif ${e[i]}, effectif total ${N} : la fréquence est <b>${frs(e[i], N)}</b>.`);
        const f = div(e[i], N), v = form === 'p' ? mul(f, 100) : f;
        return Q(`s2f:${sr.label}:${e}:${i}:${form}`, `${head}Quelle est la fréquence de la valeur ${sr.vals[i]} ? Donne-la ${form === 'p' ? 'en pourcentage' : 'sous forme décimale'}.`, num(v, form === 'p' ? '%' : undefined),
          'Fréquence = effectif de la valeur ÷ effectif total.', `${frac(e[i], N)} = ${e[i]} ÷ ${N} = ${fmt(f)}${form === 'p' ? ` = <b>${fmt(v)} %</b>` : ` : la fréquence est <b>${fmt(v)}</b>`}.`);
      }
      if (k === 1) {
        const c = rng.pick(MEAN_CTX), n = rng.int(4, 5), vals = Array.from({ length: n }, () => rng.int(c.lo, c.hi)), s = total(vals), m = div(s, n);
        return Q(`s2m:${c.txt}:${vals}`, `${c.txt} : ${vals.join(' ; ')}. Calcule la moyenne.`, num(m, c.u || undefined), 'Additionne toutes les valeurs, puis divise par le nombre de valeurs.',
          `(${vals.join(' + ')}) ÷ ${n} = ${s} ÷ ${n} = <b>${fmt(m)}</b>${c.u ? ` ${c.u}` : ''}.`);
      }
      const N = rng.pick([20, 25, 40, 50]), act = rng.pick(['font du sport en club', 'ont un animal de compagnie', 'mangent à la cantine', 'jouent d’un instrument']);
      let e; do e = rng.int(1, N - 1); while (!M.u.isNice(div(e, N), 2));
      const f = div(e, N), pct = rng.chance(0.5);
      return Q(`s2r:${N}:${e}:${act}:${pct}`, `On a interrogé ${N} élèves. La fréquence des élèves qui ${act} est ${pct ? `${fmt(mul(f, 100))} %` : fmt(f)}. Combien d’élèves ${act} ?`, num(e),
        `Fréquence = effectif ÷ ${N}, donc effectif = fréquence × ${N}.`, `${pct ? `${fmt(mul(f, 100))} % = ${fmt(f)} ; ` : ''}${fmt(f)} × ${N} = <b>${fmt(e)}</b> élèves.`);
    },
    3(rng) {
      const k = rng.int(0, 3);
      if (k === 0) {
        for (;;) {
          const n = rng.int(3, 4), vals = Array.from({ length: n }, () => rng.int(7, 18)), m = rng.int(10, 15), x = m * (n + 1) - total(vals);
          if (x < 0 || x > 20) continue;
          return Q(`s3x:${vals}:${m}`, `Les ${n} premières notes (sur 20) de Sam sont : ${vals.join(' ; ')}. Quelle note doit-il obtenir au contrôle suivant pour avoir exactement ${m} de moyenne sur les ${n + 1} notes ?`,
            num(x), `Avec ${n + 1} notes et une moyenne de ${m}, quelle doit être la somme de toutes les notes ?`,
            `Somme nécessaire : ${m} × ${n + 1} = ${m * (n + 1)}. Somme actuelle : ${vals.join(' + ')} = ${total(vals)}. Note à obtenir : ${m * (n + 1)} − ${total(vals)} = <b>${fmt(x)}</b>.`);
        }
      }
      if (k === 1 || k === 2) {
        const c = rng.pick(MEAN_CTX), n = rng.pick([5, 8, 10]), vals = Array.from({ length: n }, () => rng.int(c.lo, c.hi)), s = total(vals), m = div(s, n);
        if (k === 1) return Q(`s3m:${c.txt}:${vals}`, `${c.txt} : ${vals.join(' ; ')}. Calcule la moyenne de cette série.`, num(m, c.u || undefined),
          'Additionne toutes les valeurs (compte-les bien), puis divise par leur nombre.', `Il y a ${n} valeurs, de somme ${s}. Moyenne : ${s} ÷ ${n} = <b>${fmt(m)}</b>${c.u ? ` ${c.u}` : ''}.`);
        const above = vals.filter(v => v > m).length;
        return Q(`s3a:${c.txt}:${vals}`, `${c.txt} : ${vals.join(' ; ')}. Combien de valeurs sont strictement supérieures à la moyenne de la série ?`, num(above),
          'Calcule d’abord la moyenne, puis compare chaque valeur à cette moyenne.', `Moyenne : ${s} ÷ ${n} = ${fmt(m)}. Valeurs plus grandes que ${fmt(m)} : ${vals.filter(v => v > m).join(', ') || 'aucune'} → <b>${fmt(above)}</b>.`);
      }
      const sr = rng.pick(SERIES), N = rng.pick([20, 25, 50]), e = effectifs(rng, sr.vals.length, N), t = rng.int(1, sr.vals.length - 2);
      const kept = e.slice(t), c = total(kept), p = div(c * 100, N);
      return Q(`s3g:${sr.label}:${e}:${t}`, `On a relevé ${sr.what} (${N} valeurs).${ptable([[sr.label, ...sr.vals], ['Effectif', ...e]])}${sr.pq(sr.vals[t])}`,
        num(p, '%'), 'Additionne d’abord les effectifs concernés, puis calcule la fréquence en pourcentage.',
        `Effectif concerné : ${kept.join(' + ')} = ${c}. Fréquence : ${frac(c, N)} = ${frac(fmt(p), 100)} = <b>${fmt(p)} %</b>.`);
    },
  };

  M.notion('statistiques', {
    lesson: {
      retenir: `L’<b>effectif</b> d’une valeur est le nombre de fois où elle apparaît ; l’<b>effectif total</b> est le nombre de données. La <b>fréquence</b> d’une valeur est ${frac('effectif de la valeur', 'effectif total')} : on l’écrit en fraction, en nombre décimal ou en pourcentage. La <b>moyenne</b> d’une série est ${frac('somme des valeurs', 'nombre de valeurs')}.`,
      explication: `<p>On demande leur nombre de frères et sœurs à 20 élèves :</p>${ptable([['Frères et sœurs', 0, 1, 2, 3], ['Effectif', 4, 9, 5, 2]])}<p>Effectif total : 4 + 9 + 5 + 2 = 20. Fréquence de la valeur 1 : ${frac(9, 20)} = 0,45 = <b>45 %</b>.</p><p>Notes de Lina : 12, 15, 9, 14. Moyenne : (12 + 15 + 9 + 14) ÷ 4 = 50 ÷ 4 = <b>12,5</b>. Si toutes ses notes étaient égales, elles vaudraient 12,5 : c’est ce que veut dire la moyenne.</p>`,
      methode: [
        'Pour un effectif : compte la valeur dans la liste (barre-la au fur et à mesure).',
        'Pour une fréquence : divise l’effectif de la valeur par l’effectif total. Pour un pourcentage, écris la fraction sur 100 (ou multiplie le décimal par 100).',
        'Pour une moyenne : additionne toutes les valeurs, puis divise par le nombre de valeurs.',
        'Vérifie : la somme des fréquences fait 1 (100 %), et la moyenne est entre la plus petite et la plus grande valeur.',
      ],
      exemples: [
        { q: 'Sur 25 élèves, 7 ont un chat. Fréquence en pourcentage ?', r: `${frac(7, 25)} = ${frac(28, 100)} = <b>28 %</b>.` },
        { q: 'Moyenne de 8 ; 11 ; 13 ; 10 ; 12', r: '(8 + 11 + 13 + 10 + 12) ÷ 5 = 54 ÷ 5 = <b>10,8</b>.' },
      ],
      astuces: ['Une fréquence est toujours comprise entre 0 et 1 (entre 0 % et 100 %).'],
      erreurs: [
        'Diviser par le nombre de valeurs <b>différentes</b> au lieu du nombre total de valeurs pour la moyenne.',
        'Calculer « effectif total ÷ effectif » : la fréquence, c’est la partie divisée par le tout.',
      ],
    },
    generate(level, rng) { return statGen[level](rng); },
  });

  // ===================== TABLEAUX DE VALEURS ET GRAPHIQUES (5e) =====================

  // Formula contexts: y computed "en fonction de" x. calc(x) shows the substituted computation.
  const FORMULAS = [
    r => { const a = r.int(5, 9); return { id: `cine${a}`, txt: `Au cinéma, une place coûte ${a} €. Le prix P à payer (en €) en fonction du nombre n de places est donné par la formule`, show: `P = ${a} × n`, x: 'n', y: 'P', xr: [1, 12], f: n => a * n, calc: n => `${a} × ${n}`,
      alts: [[`P = n + ${a}`, n => n + a], [`P = ${a + 1} × n`, n => (a + 1) * n], [`P = ${a} × n + ${a}`, n => a * n + a]] }; },
    r => { const a = r.int(4, 9), b = r.int(2, 6) * 5; return { id: `esc${a}-${b}`, txt: `Une salle d’escalade fait payer une carte à ${b} €, puis ${a} € par séance. Le prix P (en €) en fonction du nombre n de séances est`, show: `P = ${a} × n + ${b}`, x: 'n', y: 'P', xr: [1, 12], f: n => a * n + b, calc: n => `${a} × ${n} + ${b} = ${a * n} + ${b}`,
      alts: [[`P = ${b} × n + ${a}`, n => b * n + a], [`P = ${a} × n`, n => a * n], [`P = ${a + b} × n`, n => (a + b) * n]] }; },
    () => ({ id: 'carreP', txt: 'Le périmètre P (en cm) d’un carré en fonction de la longueur c de son côté (en cm) est donné par la formule', show: 'P = 4 × c', x: 'c', y: 'P', xr: [1, 15], f: c => 4 * c, calc: c => `4 × ${c}`,
      alts: [['P = c × c', c => c * c], ['P = c + 4', c => c + 4], ['P = 2 × c', c => 2 * c]] }),
    () => ({ id: 'carreA', txt: 'L’aire A (en cm²) d’un carré en fonction de la longueur c de son côté (en cm) est donnée par la formule', show: 'A = c × c', x: 'c', y: 'A', xr: [1, 12], f: c => c * c, calc: c => `${c} × ${c}`,
      alts: [['A = 4 × c', c => 4 * c], ['A = 2 × c', c => 2 * c], ['A = c + c', c => c + c]] }),
    r => { const a = r.int(2, 4), b = r.pick([16, 18, 20, 22, 24]); return { id: `cong${a}-${b}`, txt: `Un congélateur est à ${b} °C quand on l’allume. La température T (en °C) en fonction du temps t (en minutes) pendant le premier quart d’heure est`, show: `T = ${b} − ${a} × t`, x: 't', y: 'T', xr: [0, 15], f: t => b - a * t, calc: t => `${b} − ${a} × ${t} = ${b} − ${a * t}`,
      alts: [[`T = ${b} + ${a} × t`, t => b + a * t], [`T = ${b} − t`, t => b - t], [`T = ${a} × t − ${b}`, t => a * t - b]] }; },
    r => { const a = r.int(2, 3), b = a * r.int(6, 9); return { id: `boug${a}-${b}`, txt: `Une bougie mesure ${b} cm. Elle raccourcit de ${a} cm par heure. Sa hauteur h (en cm) en fonction du temps t (en heures) est`, show: `h = ${b} − ${a} × t`, x: 't', y: 'h', xr: [0, b / a], f: t => b - a * t, calc: t => `${b} − ${a} × ${t} = ${b} − ${a * t}`,
      alts: [[`h = ${b} + ${a} × t`, t => b + a * t], [`h = ${a} × t`, t => a * t], [`h = ${b} − t`, t => b - t]] }; },
    r => { const w = r.int(2, 6); return { id: `rect${w}`, txt: `Un rectangle a une largeur de ${w} cm. Son périmètre P (en cm) en fonction de sa longueur L (en cm) est`, show: `P = 2 × L + ${2 * w}`, x: 'L', y: 'P', xr: [w + 1, w + 12], f: L => 2 * L + 2 * w, calc: L => `2 × ${L} + ${2 * w} = ${2 * L} + ${2 * w}`,
      alts: [[`P = L × ${w}`, L => L * w], [`P = L + ${2 * w}`, L => L + 2 * w], [`P = 2 × L + ${w}`, L => 2 * L + w]] }; },
  ];

  // Graph contexts for reading a curve.
  function graphCtx(rng) {
    const k = rng.int(0, 2);
    if (k === 0) {
      const xs = range(0, 8), ys = [rng.int(1, 3) * 2];
      for (let i = 1; i < xs.length; i++) ys.push(ys[i - 1] + rng.pick([2, 2, 4]));
      return { id: 'plante', xs, ys, yMin: 0, yMax: Math.ceil((Math.max(...ys) + 1) / 4) * 4, minor: 2, major: 4, title: 'Hauteur d’une plante en fonction du temps', yLabel: 'Hauteur (cm)', xLabel: 'Temps (semaines)', xFmt: fmt, uy: 'cm', ux: 'semaines',
        askY: x => `Quelle est la hauteur de la plante au bout de ${x} semaine${x > 1 ? 's' : ''} ?`, askX: y => `Au bout de combien de semaines la plante mesure-t-elle ${fmt(y)} cm ?`,
        var: (a, b) => `De combien de centimètres la plante a-t-elle grandi entre la semaine ${a} et la semaine ${b} ?` };
    }
    if (k === 1) {
      const xs = [0, 2, 4, 6, 8, 10, 12];
      let ys, lo;
      do {
        lo = rng.int(2, 4); ys = [rng.int(1, 4)];
        for (let i = 1; i < xs.length; i++) ys.push(ys[i - 1] + (i <= lo ? -rng.int(1, 3) : rng.int(1, 4)));
      } while (Math.min(...ys) >= 0);
      return { id: 'nuit', xs, ys, yMin: Math.floor((Math.min(...ys) - 1) / 2) * 2, yMax: Math.ceil((Math.max(...ys) + 1) / 2) * 2, minor: 1, major: 2, title: 'Température une nuit d’hiver en fonction de l’heure', yLabel: 'Température (°C)', xLabel: 'Heure', xFmt: h => `${h} h`, uy: '°C', ux: 'h', lo,
        askY: x => `Quelle est la température à ${x} h ?`, askX: y => `À quelle heure la température est-elle de ${fmt(y)} °C ?`,
        var: (a, b) => `De combien de degrés la température a-t-elle augmenté entre ${a} h et ${b} h ?` };
    }
    const xs = [0, 10, 20, 30, 40, 50, 60], ys = [0];
    for (let i = 1; i < xs.length; i++) ys.push(ys[i - 1] + rng.pick([0, 2, 4, 4, 6]));
    if (ys[6] === 0) ys[6] = 4;
    return { id: 'velo', xs, ys, yMin: 0, yMax: Math.max(8, Math.ceil((Math.max(...ys) + 1) / 4) * 4), minor: 2, major: 4, title: 'Distance parcourue par Jade à vélo en fonction du temps', yLabel: 'Distance (km)', xLabel: 'Temps (min)', xFmt: fmt, uy: 'km', ux: 'min',
      askY: x => `Quelle distance Jade a-t-elle parcourue au bout de ${x} min ?`, askX: y => `Au bout de combien de minutes Jade a-t-elle parcouru ${fmt(y)} km ?`,
      var: (a, b) => `Quelle distance Jade a-t-elle parcourue entre ${a} min et ${b} min ?` };
  }
  // All x where the broken line reaches y (Infinity if a whole segment sits at y).
  function solutions(xs, ys, y) {
    const out = new Set();
    for (let i = 0; i < xs.length - 1; i++) {
      const [a, b] = [ys[i], ys[i + 1]];
      if (a === y && b === y) return [Infinity];
      if ((a - y) * (b - y) <= 0) out.add(xs[i] + ((y - a) / (b - a)) * (xs[i + 1] - xs[i]));
    }
    return [...out];
  }

  function formulaTable(c, xs) {
    return ptable([[c.x, ...xs], [c.y, ...xs.map(c.f)]]);
  }

  const fonctGen = {
    1(rng) {
      const c = rng.pick(FORMULAS)(rng), k = rng.int(0, 2);
      if (k === 0) {
        const x = rng.int(c.xr[0], c.xr[1]), v = c.f(x);
        return Q(`f1c:${c.id}:${x}`, `${c.txt} <b>${c.show}</b>.<br>Calcule ${c.y} pour ${c.x} = ${x}.`, num(v), `Remplace ${c.x} par ${x} dans la formule.`,
          `${c.y} = ${c.calc(x)} = <b>${fmt(v)}</b>.`);
      }
      const xs = rng.sample(range(c.xr[0], c.xr[1]), 5).sort((a, b) => a - b), i = rng.int(0, 4);
      if (k === 1) return Q(`f1t:${c.id}:${xs}:${i}`, `${c.txt} <b>${c.show}</b>. Voici un tableau de valeurs :${formulaTable(c, xs)}Quelle est la valeur de ${c.y} quand ${c.x} = ${xs[i]} ?`,
        num(c.f(xs[i])), `Cherche ${xs[i]} dans la ligne de ${c.x}, puis lis la case juste en dessous.`, `Sous ${c.x} = ${xs[i]}, on lit ${c.y} = <b>${fmt(c.f(xs[i]))}</b>.`);
      return Q(`f1i:${c.id}:${xs}:${i}`, `${c.txt} <b>${c.show}</b>. Voici un tableau de valeurs :${formulaTable(c, xs)}Pour quelle valeur de ${c.x} obtient-on ${c.y} = ${fmt(c.f(xs[i]))} ?`,
        num(xs[i]), `Cherche cette valeur dans la ligne de ${c.y}, puis lis la case juste au-dessus.`, `Au-dessus de ${c.y} = ${fmt(c.f(xs[i]))}, on lit ${c.x} = <b>${fmt(xs[i])}</b>.`);
    },
    2(rng) {
      if (rng.chance(0.35)) {
        const c = rng.pick(FORMULAS)(rng), xs = rng.sample(range(c.xr[0], c.xr[1]), 5).sort((a, b) => a - b), i = rng.int(0, 4), v = c.f(xs[i]);
        const tab = ptable([[c.x, ...xs], [c.y, ...xs.map((x, j) => (j === i ? hole : c.f(x)))]]);
        return Q(`f2t:${c.id}:${xs}:${i}`, `${c.txt} <b>${c.show}</b>. Complète le tableau de valeurs :${tab}`, num(v), `Remplace ${c.x} par ${xs[i]} dans la formule.`,
          `${c.y} = ${c.calc(xs[i])} = <b>${fmt(v)}</b>.`);
      }
      const g = graphCtx(rng), fig = `<b>${g.title}</b>${lineChart(g.xs, g.ys, g)}`;
      if (rng.chance(0.5)) {
        const cand = g.ys.map((y, i) => i).filter(i => { const s = solutions(g.xs, g.ys, g.ys[i]); return s.length === 1 && s[0] === g.xs[i]; });
        if (cand.length) {
          const i = rng.pick(cand);
          return Q(`f2x:${g.id}:${g.ys}:${i}`, fig + g.askX(g.ys[i]), num(g.xs[i], g.ux), `Pars de ${fmt(g.ys[i])} sur l’axe vertical, va horizontalement jusqu’à la courbe, puis descends lire l’axe horizontal.`,
            `La courbe atteint ${fmt(g.ys[i])} ${g.uy} pour <b>${g.xFmt(g.xs[i])}</b>${g.ux === 'h' ? '' : ` ${g.ux}`} (on lit ${fmt(g.xs[i])} sur l’axe horizontal).`);
        }
      }
      const i = rng.int(0, g.xs.length - 1);
      return Q(`f2y:${g.id}:${g.ys}:${i}`, fig + g.askY(g.xs[i]), num(g.ys[i], g.uy), `Pars de ${fmt(g.xs[i])} sur l’axe horizontal, monte (ou descends) jusqu’à la courbe, puis lis l’axe vertical.`,
        `Le point d’abscisse ${fmt(g.xs[i])} est au niveau de ${fmt(g.ys[i])} sur l’axe vertical : <b>${fmt(g.ys[i])} ${g.uy}</b>.`);
    },
    3(rng) {
      const k = rng.int(0, 3);
      if (k === 0) {
        const c = rng.pick(FORMULAS)(rng), xs = rng.sample(range(c.xr[0], c.xr[1]), 4).sort((a, b) => a - b);
        const alts = c.alts.filter(([, f]) => !xs.every(x => f(x) === c.f(x))).map(a => a[0]);
        return Q(`f3f:${c.id}:${xs}`, `${c.txt.replace(/ (est donnée? par la formule|est)$/, '')}. Quelle formule permet de calculer ${c.y} en fonction de ${c.x}, sachant que le tableau suivant est juste ?${formulaTable(c, xs)}`,
          choice(rng, c.show, alts), `Teste chaque formule avec une colonne du tableau, par exemple ${c.x} = ${xs[0]}.`,
          `Avec ${c.x} = ${xs[0]} : ${c.calc(xs[0])} = ${fmt(c.f(xs[0]))}, ce qui correspond au tableau (vérifie aussi les autres colonnes). La formule est <b>${c.show}</b>.`);
      }
      if (k === 1) {
        for (;;) {
          const a = rng.int(1, 2), b = rng.int(0, 3), xs = range(0, 4), x = rng.int(1, 4), y = a * x + b;
          const cands = [[y, x], [x, y + 1], [x + 1, y], [x, y - 1], [x - 1, y], [x + 1, y + 1]].filter(([px, py]) => px >= 0 && py >= 0 && px <= 11 && py <= 11 && !(px === x && py === y));
          const uniq = cands.filter((p, i) => cands.findIndex(q => q[0] === p[0] && q[1] === p[1]) === i);
          if (uniq.length < 3) continue;
          const pts = rng.shuffle([[x, y], ...rng.sample(uniq, 3)]), L = ['A', 'B', 'C', 'D'], ans = L[pts.findIndex(p => p[0] === x && p[1] === y)];
          const fig = repere(pts.map((p, i) => ({ x: p[0], y: p[1], label: L[i] })), { xMax: 11, yMax: 11 });
          return Q(`f3p:${a}:${b}:${x}:${pts}`, `Voici un tableau de valeurs :${ptable([['x', ...xs], ['y', ...xs.map(v => a * v + b)]])}On place un point pour chaque colonne (x en abscisse, y en ordonnée). Quel point représente la colonne x = ${x} ?${fig}`,
            fixedChoice(L, ans), 'L’abscisse se lit sur l’axe horizontal, l’ordonnée sur l’axe vertical.',
            `La colonne x = ${x} donne y = ${y} : c’est le point de coordonnées (${x} ; ${y}), le point <b>${ans}</b>.`);
        }
      }
      if (k === 2) {
        const g = graphCtx(rng), fig = `<b>${g.title}</b>${lineChart(g.xs, g.ys, g)}`;
        if (g.id === 'nuit' && rng.chance(0.4)) {
          const lo = Math.min(...g.ys);
          return Q(`f3n:${g.ys}`, `${fig}Quelle a été la température la plus basse de la nuit ?`, num(lo, '°C'), 'Cherche le point le plus bas de la courbe. Attention aux nombres sous le zéro !',
            `Le point le plus bas est au niveau de ${fmt(lo)} sur l’axe vertical : <b>${fmt(lo)} °C</b>.`);
        }
        const start = g.id === 'nuit' ? g.lo : 0;
        const [i, j] = rng.sample(range(start, g.xs.length - 1), 2).sort((a, b) => a - b), d = g.ys[j] - g.ys[i];
        return Q(`f3v:${g.id}:${g.ys}:${i}-${j}`, fig + g.var(g.xs[i], g.xs[j]), num(d, g.uy), 'Lis les deux valeurs sur la courbe, puis calcule l’écart.',
          `On lit ${fmt(g.ys[i])} ${g.uy} puis ${fmt(g.ys[j])} ${g.uy}. ${fmt(g.ys[j])} − ${g.ys[i] < 0 ? `(${fmt(g.ys[i])})` : fmt(g.ys[i])} = <b>${fmt(d)} ${g.uy}</b>.`);
      }
      const c = FORMULAS[4](rng), t = rng.int(8, 15), v = c.f(t);
      return Q(`f3c:${c.id}:${t}`, `${c.txt} <b>${c.show}</b>.<br>Calcule la température T au bout de ${t} minutes.`, num(v, '°C'), `Remplace t par ${t}. Le résultat peut être négatif.`,
        `T = ${c.calc(t)} = <b>${fmt(v)}</b> °C.`);
    },
  };

  const exG = lineChart([0, 2, 4, 6, 8, 10, 12], [2, -1, -3, -2, 0, 3, 5], { yMin: -4, yMax: 6, minor: 1, major: 2, yLabel: 'Température (°C)', xLabel: 'Heure', xFmt: h => `${h} h` });

  M.notion('fonctions-intro', {
    lesson: {
      retenir: `Quand une grandeur se calcule à partir d’une autre, on dit qu’elle s’exprime <b>en fonction de</b> cette autre grandeur. On peut traduire cette dépendance par une <b>formule</b> (par exemple P = 4 × c), par un <b>tableau de valeurs</b> ou par un <b>graphique</b> dans un repère : l’abscisse (axe horizontal) donne la première grandeur, l’ordonnée (axe vertical) la seconde.`,
      explication: `<p>Le périmètre P d’un carré en fonction de son côté c : <b>P = 4 × c</b>.</p>${ptable([['c (cm)', 1, 2, 3, 5], ['P (cm)', 4, 8, 12, 20]])}<p>Chaque colonne donne un point : (1 ; 4), (2 ; 8)… Sur un graphique, on lit une valeur en partant d’un axe, en allant jusqu’à la courbe, puis en lisant l’autre axe.</p>${exG}<p>Ici, à 4 h, la température est de <b>−3 °C</b> ; elle vaut 0 °C à 8 h.</p>`,
      methode: [
        'Formule → valeur : remplace la lettre par le nombre, puis calcule en respectant les priorités.',
        'Tableau de valeurs : chaque colonne associe une valeur de la 1<sup>re</sup> grandeur à la valeur correspondante de la 2<sup>de</sup>.',
        'Lire un graphique : pars de la valeur connue sur son axe, va jusqu’à la courbe, puis lis l’autre axe.',
        'Trouver une formule : cherche ce qu’on fait à la 1<sup>re</sup> grandeur pour obtenir la 2<sup>de</sup>, et vérifie sur toutes les colonnes.',
      ],
      exemples: [
        { q: 'P = 3 × n + 5. Calcule P pour n = 4.', r: 'P = 3 × 4 + 5 = 12 + 5 = <b>17</b>.' },
        { q: 'Dans le graphique ci-dessus, à quelle heure fait-il 5 °C ?', r: 'On part de 5 sur l’axe vertical, on rejoint la courbe : on lit <b>12 h</b>.' },
        { q: `${ptable([['n', 1, 2, 3], ['P', 7, 9, 11]])}Formule : P = 2 × n + 5 ou P = 5 × n + 2 ?`, r: 'Avec n = 1 : 2 × 1 + 5 = 7 ✓ et 5 × 1 + 2 = 7 ✓ ; avec n = 2 : 2 × 2 + 5 = 9 ✓ mais 5 × 2 + 2 = 12 ✗. C’est <b>P = 2 × n + 5</b>.' },
      ],
      astuces: ['Une seule colonne ne suffit pas pour vérifier une formule : teste-la sur toutes les colonnes.'],
      erreurs: [
        'Inverser abscisse et ordonnée : le point (2 ; 5) est à 2 sur l’axe horizontal et à 5 sur l’axe vertical.',
        'Oublier la priorité de la multiplication : 3 × 4 + 5 = 17, pas 27.',
      ],
    },
    generate(level, rng) { return fonctGen[level](rng); },
  });

  // ===================== PROBABILITÉS : VOCABULAIRE (5e) =====================

  const ALEA = ['Lancer un dé et noter le nombre obtenu', 'Tirer une carte au hasard dans un jeu', 'Lancer une pièce de monnaie et noter le côté visible', 'Tirer au sort le nom d’un élève de la classe', 'Faire tourner une roue de loterie'];
  const NON_ALEA = ['Calculer 25 × 4', 'Mesurer la longueur de ta table', 'Compter les fenêtres de ta classe', 'Peser un litre d’eau', 'Lire le numéro de ta salle de classe', 'Calculer le périmètre d’un carré de 3 cm de côté'];
  const WORDS = ['BANANE', 'ANANAS', 'HASARD', 'CAROTTE', 'PARAPLUIE', 'ABRACADABRA', 'MISSISSIPPI', 'CHOCOLAT'];
  const VOWELS = 'AEIOUY';
  const CONCEPTS = [
    { q: 'On a lancé une pièce équilibrée 5 fois et obtenu 5 fois « pile ». Quelle est la probabilité d’obtenir « pile » au 6<sup>e</sup> lancer ?', opts: [frac(1, 2), 'Moins de ' + frac(1, 2), 'Plus de ' + frac(1, 2), '0'], ok: 0, why: `La pièce ne se souvient pas des lancers précédents : la probabilité reste <b>${frac(1, 2)}</b>.` },
    { q: 'On lance 10 fois une pièce équilibrée et on obtient 7 fois « pile ». Que peut-on dire ?', opts: ['La pièce est forcément truquée', 'C’est tout à fait possible : sur peu de lancers, la fréquence peut s’éloigner de la probabilité', `La probabilité d’obtenir « pile » est ${frac(7, 10)}`], ok: 1, why: 'Avec seulement 10 lancers, les fréquences varient beaucoup. <b>C’est tout à fait possible</b> avec une pièce équilibrée.' },
    { q: 'On lance un dé équilibré un très grand nombre de fois (10 000 fois). La fréquence d’apparition du 6 sera…', opts: [`proche de ${frac(1, 6)}`, `exactement égale à ${frac(1, 6)}`, 'proche de 0,6', 'proche de 1'], ok: 0, why: `Quand on répète beaucoup l’expérience, la fréquence se rapproche de la probabilité : <b>proche de ${frac(1, 6)}</b>, mais pas forcément exactement égale.` },
    { q: 'Quelle phrase est juste ?', opts: ['La fréquence se calcule à partir des résultats obtenus en répétant l’expérience', 'La fréquence et la probabilité sont toujours égales', 'La probabilité change à chaque nouvelle expérience'], ok: 0, why: 'La fréquence est <b>observée</b> (elle dépend des résultats obtenus) ; la probabilité est <b>calculée</b> et ne change pas.' },
    { q: 'Léo lance un dé 12 fois et n’obtient jamais de 6. Il en conclut que le 6 ne peut pas sortir. A-t-il raison ?', opts: ['Non : 12 lancers, c’est trop peu pour conclure ; la probabilité d’obtenir 6 reste ' + frac(1, 6), 'Oui, le 6 est impossible avec ce dé', 'Oui, le 6 a une probabilité de 0'], ok: 0, why: `<b>Non</b> : avec si peu de lancers, ne jamais obtenir 6 peut arriver. Avec un dé équilibré, la probabilité reste ${frac(1, 6)}.` },
  ];

  const p5Gen = {
    1(rng) {
      const k = rng.int(0, 2);
      if (k === 0) {
        const t = rng.int(0, 4);
        if (t === 0) { const n = rng.pick([4, 6, 8, 10, 12, 20]); return Q(`v1n:de${n}`, `On lance un dé équilibré à ${n} faces numérotées de 1 à ${n} et on note le nombre obtenu. Combien cette expérience aléatoire a-t-elle d’issues ?`, num(n), 'Une issue, c’est un résultat possible de l’expérience.', `Les issues sont 1, 2, …, ${n} : il y en a <b>${fmt(n)}</b>.`); }
        if (t === 1) { const { cols, counts } = bag(rng); return Q(`v1n:sac${counts}:${cols.map(c => c[0])}`, `Un sac contient ${bagText(cols, counts)}. On tire une boule et on note sa <b>couleur</b>. Combien cette expérience a-t-elle d’issues ?`, num(cols.length), 'On note la couleur : combien de couleurs différentes peut-on obtenir ?', `Les issues sont les couleurs possibles (boule ${cols.map(c => c[0]).join(', boule ')}) : il y en a <b>${fmt(cols.length)}</b>, quel que soit le nombre de boules.`); }
        if (t === 2) { const w = rng.pick(WORDS), letters = [...new Set(w)]; return Q(`v1n:mot${w}`, `On écrit chaque lettre du mot ${w} sur une carte, on retourne les cartes et on en tire une au hasard. On note la lettre obtenue. Combien cette expérience a-t-elle d’issues ?`, num(letters.length), 'Les issues sont les lettres différentes qu’on peut obtenir.', `Lettres différentes : ${letters.join(', ')}. Il y a <b>${fmt(letters.length)}</b> issues.`); }
        if (t === 3) return Q('v1n:piece', 'On lance une pièce de monnaie et on note le côté visible. Combien cette expérience a-t-elle d’issues ?', num(2), 'Quels sont les résultats possibles ?', 'Les issues sont « pile » et « face » : <b>2</b> issues.');
        return Q('v1n:jour', 'On choisit au hasard un jour de la semaine. Combien cette expérience a-t-elle d’issues ?', num(7), 'Combien y a-t-il de jours dans une semaine ?', 'Lundi, mardi, …, dimanche : <b>7</b> issues.');
      }
      if (k === 1) {
        const yes = rng.chance(0.6);
        const good = rng.pick(yes ? ALEA : NON_ALEA), bad = rng.sample(yes ? NON_ALEA : ALEA, 3);
        return Q(`v1a:${yes}:${good}:${bad}`, yes ? 'Laquelle de ces expériences est une expérience aléatoire ?' : 'Laquelle de ces expériences n’est <b>pas</b> une expérience aléatoire ?', choice(rng, good, bad),
          'Une expérience est aléatoire si on connaît tous les résultats possibles, mais qu’on ne peut pas prévoir lequel va se produire.',
          `<b>${good}</b> : ${yes ? 'on ne peut pas prévoir le résultat, c’est une expérience aléatoire' : 'le résultat est connu d’avance, ce n’est pas une expérience aléatoire'}.`);
      }
      const evs = rng.sample(DIE_EVENTS.filter(e => e[1].length < 6), 4), [txt, ok] = evs[0];
      const show = e => e[1].join(', ');
      return Q(`v1e:${txt}:${evs.map(e => e[0])}`, `On lance un dé à six faces numérotées de 1 à 6. Quelles sont les issues qui réalisent l’évènement « obtenir ${txt} » ?`,
        choice(rng, show(evs[0]), evs.slice(1).map(show)), 'Teste chaque face du dé : réalise-t-elle l’évènement ?',
        `L’évènement « obtenir ${txt} » est réalisé par les issues <b>${ok.join(', ')}</b>.`);
    },
    2(rng) {
      const k = rng.int(0, 2);
      if (k === 0) {
        const n = rng.pick([4, 8, 10, 12, 20]), evs = [
          ['un nombre pair', Math.floor(n / 2), 'les nombres pairs'], ['un multiple de 3', Math.floor(n / 3), 'les multiples de 3'], ['un multiple de 4', Math.floor(n / 4), 'les multiples de 4'],
          [`un nombre supérieur ou égal à ${n - 2}`, 3, `${n - 2}, ${n - 1} et ${n}`], ['un nombre plus petit que 4', 3, '1, 2 et 3'], ['un multiple de 5', Math.floor(n / 5), 'les multiples de 5'],
        ].filter(e => e[1] > 0);
        const [txt, c, who] = rng.pick(evs);
        return Q(`v2d:${n}:${txt}`, `On lance un dé équilibré à ${n} faces numérotées de 1 à ${n}. Quelle est la probabilité de l’évènement « obtenir ${txt} » ?`, F(c, n),
          'Compte les issues possibles, puis celles qui réalisent l’évènement.', `Il y a ${n} issues équiprobables ; ${who} : ${c} issue${c > 1 ? 's' : ''} réalisent l’évènement. Probabilité : <b>${frs(c, n)}</b>.`);
      }
      if (k === 1) {
        const w = rng.pick(WORDS), letters = [...new Set(w)], vow = rng.chance(0.3);
        const L = rng.pick(letters), c = vow ? [...w].filter(x => VOWELS.includes(x)).length : [...w].filter(x => x === L).length;
        return Q(`v2w:${w}:${vow ? 'V' : L}`, `On écrit chaque lettre du mot ${w} sur une carte (une lettre par carte), puis on tire une carte au hasard. Quelle est la probabilité de l’évènement « obtenir ${vow ? 'une voyelle' : `la lettre ${L}`} » ?`,
          F(c, w.length), 'Combien y a-t-il de cartes en tout ? Combien réalisent l’évènement ?',
          `Il y a ${w.length} cartes, dont ${c} ${vow ? `voyelle${c > 1 ? 's' : ''}` : `avec la lettre ${L}`}. Probabilité : <b>${frs(c, w.length)}</b>.`);
      }
      const { cols, counts, n } = bag(rng), i = rng.int(0, cols.length - 1), not = rng.chance(0.5), c = not ? n - counts[i] : counts[i];
      return Q(`v2b:${counts}:${cols.map(x => x[0])}:${i}:${not}`, `Un sac contient ${bagText(cols, counts)}. On tire une boule au hasard. Quelle est la probabilité de l’évènement « ${not ? `ne pas tirer une boule ${cols[i][0]}` : `tirer une boule ${cols[i][0]}`} » ?`,
        F(c, n), 'Les boules sont des issues équiprobables : compte celles qui réalisent l’évènement.',
        `${n} boules en tout ; ${not ? `${n} − ${counts[i]} = ${c} ne sont pas ${cols[i][1]}` : `${c} sont ${counts[i] > 1 ? cols[i][1] : cols[i][0]}`}. Probabilité : <b>${frs(c, n)}</b>.`);
    },
    3(rng) {
      const k = rng.int(0, 2);
      if (k === 0) {
        const c = rng.pick(CONCEPTS);
        return Q(`v3c:${c.q}`, c.q, fixedChoice(c.opts, c.opts[c.ok]), 'Distingue ce qu’on observe (la fréquence) de ce qu’on calcule (la probabilité).', c.why);
      }
      const N = rng.pick([20, 25, 50, 100, 200]), e = effectifs(rng, 6, N), faces = [1, 2, 3, 4, 5, 6];
      const head = `On a lancé un dé ${N} fois. Voici les résultats :${ptable([['Face', ...faces], ['Effectif', ...e]])}`;
      const pct = rng.chance(0.5);
      if (k === 1) {
        const i = rng.int(0, 5), f = div(e[i], N), v = pct ? mul(f, 100) : f;
        return Q(`v3f:${N}:${e}:${i}:${pct}`, `${head}Quelle est la fréquence d’apparition de la face ${i + 1} ? Donne-la ${pct ? 'en pourcentage' : 'sous forme décimale'}.`, num(v, pct ? '%' : undefined),
          'Fréquence = effectif ÷ nombre total de lancers.', `${frac(e[i], N)} = ${e[i]} ÷ ${N} = ${fmt(f)}${pct ? ` = <b>${fmt(v)} %</b>` : ` : la fréquence est <b>${fmt(v)}</b>`}. (La probabilité, elle, vaut ${frac(1, 6)}.)`);
      }
      const even = rng.chance(0.5), idx = even ? [1, 3, 5] : [0, 2, 4], cnt = total(idx.map(i => e[i])), f = div(cnt, N), v = pct ? mul(f, 100) : f;
      return Q(`v3g:${N}:${e}:${even}:${pct}`, `${head}Quelle est la fréquence de l’évènement « obtenir un nombre ${even ? 'pair' : 'impair'} » ? Donne-la ${pct ? 'en pourcentage' : 'sous forme décimale'}.`, num(v, pct ? '%' : undefined),
        'Additionne les effectifs des faces qui réalisent l’évènement, puis divise par le nombre de lancers.',
        `Faces ${even ? '2, 4, 6' : '1, 3, 5'} : ${idx.map(i => e[i]).join(' + ')} = ${cnt}. ${frac(cnt, N)} = ${fmt(f)}${pct ? ` = <b>${fmt(v)} %</b>` : ` : la fréquence est <b>${fmt(v)}</b>`}. (La probabilité est ${frac(1, 2)} = 0,5.)`);
    },
  };

  M.notion('probabilites-5e', {
    lesson: {
      retenir: `Une <b>expérience aléatoire</b> a plusieurs résultats possibles, appelés <b>issues</b>, et on ne peut pas prévoir lequel va se produire. Un <b>évènement</b> est réalisé par une ou plusieurs issues. Si les issues sont <b>équiprobables</b> (elles ont toutes la même chance), la probabilité d’un évènement est ${frac('nombre d’issues qui le réalisent', 'nombre total d’issues')}. Quand on répète l’expérience, la <b>fréquence</b> observée se rapproche de la probabilité si le nombre d’essais est grand.`,
      explication: `<p>Expérience : on lance un dé à six faces. Les issues sont 1, 2, 3, 4, 5, 6 (équiprobables si le dé est équilibré).</p><p>L’évènement « obtenir un multiple de 3 » est réalisé par les issues 3 et 6 : sa probabilité est ${frac(2, 6)} = ${frac(1, 3)}.</p><p>On lance réellement le dé 60 fois et on obtient 22 multiples de 3 : la <b>fréquence</b> observée est ${frac(22, 60)} ≈ 0,37. Elle n’est pas exactement égale à ${frac(1, 3)} ≈ 0,33, mais elle s’en rapprochera si on lance le dé beaucoup plus de fois.</p>`,
      methode: [
        'Décris l’expérience et écris la liste de toutes les issues.',
        'Vérifie qu’elles sont équiprobables (dé équilibré, tirage au hasard…).',
        'Repère les issues qui réalisent l’évènement et compte-les.',
        'Probabilité = issues favorables ÷ issues possibles. Fréquence = effectif observé ÷ nombre d’essais.',
      ],
      exemples: [
        { q: 'On tire une carte parmi les lettres du mot BANANE. Probabilité d’obtenir A ?', r: `6 cartes, dont 2 avec un A : ${frac(2, 6)} = <b>${frac(1, 3)}</b>.` },
        { q: 'Sur 50 lancers d’une pièce, on obtient 28 « pile ». Fréquence de « pile » ?', r: `${frac(28, 50)} = <b>0,56</b> (la probabilité, elle, est 0,5).` },
      ],
      astuces: ['Quand on note une couleur, les issues sont les couleurs, pas les boules : un sac de 3 rouges et 5 vertes donne 2 issues… qui ne sont pas équiprobables !'],
      erreurs: [
        'Confondre fréquence et probabilité : la fréquence dépend des essais réalisés, la probabilité est fixe.',
        'Penser qu’un résultat « doit » sortir parce qu’il n’est pas sorti depuis longtemps.',
      ],
    },
    generate(level, rng) { return p5Gen[level](rng); },
  });

  // ===================== EXPLICATIONS =====================
  const B = M.cat.BASE;
  M.explain('donnees', [
    ['dessin', B],
    ['vie', `<p>Au supermarché, ton ticket de caisse est un <b>tableau</b> : une ligne par article, une colonne pour le prix. La météo à la télévision montre souvent une <b>courbe</b> des températures de la journée, et les résultats d’une élection sont présentés en <b>diagramme circulaire</b> : on voit d’un coup d’œil qui a obtenu plus de la moitié des voix.</p>`],
    ['etapes', '<ol><li>Je lis le <b>titre</b> : de quoi parle-t-on ?</li><li>Je lis les <b>axes</b> ou les en-têtes : quelles grandeurs, quelles unités ?</li><li>Je regarde la <b>graduation</b> : de combien en combien ?</li><li>Je trouve la barre, le point, la case ou le secteur qui m’intéresse, et je lis sa valeur.</li><li>Je fais le calcul demandé (écart, total, moitié…) et je n’oublie pas l’unité.</li></ol>'],
  ]);
  M.explain('probabilites', [
    ['dessin', B],
    ['vie', '<p>Pour désigner qui commence une partie, tu tires à pile ou face : chacun a <b>une chance sur deux</b>. À la tombola, si 100 tickets sont vendus et que tu en as acheté 5, tu as 5 chances sur 100 de gagner le gros lot : 5 %. Et le loto ? Il y a des millions de combinaisons : la probabilité de gagner est très proche de 0.</p>'],
    ['lien', `<p>Une probabilité, c’est une <b>fraction</b>, comme une part de gâteau : « 3 chances sur 4 », c’est ${frac(3, 4)} du gâteau des possibilités. Tu sais déjà écrire ${frac(3, 4)} = 0,75 = 75 %. Et comme on ne peut pas avoir plus que le gâteau entier, une probabilité ne dépasse jamais 1.</p>`],
  ]);
  M.explain('statistiques', [
    ['etapes', B],
    ['vie', '<p>La <b>moyenne</b>, c’est le partage équitable. Trois amis ont 4, 7 et 10 billes. S’ils mettent tout en commun (21 billes) et se partagent équitablement, chacun en a 21 ÷ 3 = <b>7</b> : c’est la moyenne. La <b>fréquence</b>, elle, répond à « quelle part du groupe ? » : 6 élèves sur 24 portent des lunettes, soit un quart, 25 %.</p>'],
    ['lien', `<p>Une fréquence, c’est une <b>proportion</b>, comme dans les pourcentages : « 9 élèves sur 20 », c’est ${frac(9, 20)} = ${frac(45, 100)} = 45 %. Et une moyenne, c’est une <b>division</b> : la somme des valeurs partagée par le nombre de valeurs, exactement comme quand on partage une somme d’argent.</p>`],
  ]);
  M.explain('fonctions-intro', [
    ['dessin', B],
    ['vie', '<p>Au marché, le prix que tu paies <b>dépend</b> de la masse de fraises : le prix est fonction de la masse. Sur ton carnet de santé, la courbe de taille montre ta taille <b>en fonction de</b> ton âge. Une formule, un tableau ou un graphique racontent la même histoire : comment une grandeur change quand l’autre change.</p>'],
    ['etapes', '<p>Pour remplir un tableau de valeurs avec P = 3 × n + 2 :</p><ol><li>Je prends la première valeur de n, par exemple n = 4.</li><li>Je remplace n par 4 : P = 3 × 4 + 2.</li><li>Je calcule en commençant par la multiplication : 12 + 2 = 14.</li><li>J’écris 14 sous le 4, puis je recommence pour chaque colonne.</li><li>Pour le graphique, chaque colonne devient un point : (4 ; 14).</li></ol>'],
  ]);
  M.explain('probabilites-5e', [
    ['lien', B],
    ['dessin', `${pieChart([{ label: 'rouge', short: 'R', cls: 's-fill', u: 1 }, { label: 'bleu', short: 'B', cls: 's-soft s-line', u: 1 }, { label: 'rouge', short: 'R', cls: 's-fill', u: 1 }, { label: 'vert', short: 'V', cls: 's-soft2 s-line', u: 1 }], 4, { ticks: 0, legend: [{ label: 'R : rouge', cls: 's-fill' }, { label: 'B : bleu', cls: 's-soft s-line' }, { label: 'V : vert', cls: 's-soft2 s-line' }] })}<p>On fait tourner cette roue : les 4 secteurs identiques sont les issues équiprobables. L’évènement « tomber sur rouge » est réalisé par 2 secteurs sur 4 : sa probabilité est ${frac(2, 4)} = ${frac(1, 2)}. Si on tourne la roue 100 fois, on tombera sur rouge environ 50 fois, mais rarement exactement 50.</p>`],
    ['vie', '<p>Les météorologues disent « 70 % de risque de pluie » : c’est une probabilité, calculée à partir de nombreuses journées semblables observées dans le passé (des fréquences !). Au basket, si une joueuse a réussi 80 lancers francs sur 100 cette saison, sa fréquence de réussite est 0,8 : on s’en sert pour estimer ses chances au prochain tir.</p>'],
  ]);
})();
