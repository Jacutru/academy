// 5e — Espace et géométrie : aires, volumes, parallélogrammes, angles et parallèles,
// hauteurs et médianes, symétrie centrale, repère.
(function () {
  'use strict';
  const M = globalThis.M;
  const { fmt, dec, add, sub, mul, div } = M.u;
  const { hole, table } = M.h;
  const { Q, num, choice, fixedChoice } = M.kit;
  const S = M.svg;
  const { svg, text, line, poly, dot } = S.raw;
  const TF = b => fixedChoice(['Vrai', 'Faux'], b ? 'Vrai' : 'Faux');
  const YN = b => fixedChoice(['Oui', 'Non'], b ? 'Oui' : 'Non');
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  const cm = v => `${fmt(v)} cm`;
  // Angle DAB written DÂB (circumflex on the vertex; primes allowed: A’B’C’).
  const ang = s => { const [a, b, c] = s.match(/[A-Z]’?/g); return `${a}${b[0]}\u0302${b.slice(1)}${c}`; };
  const co = (x, y) => `(${fmt(x)} ; ${fmt(y)})`;

  // ---------- Plane geometry helpers (screen coordinates, y pointing down) ----------
  const r1 = v => Math.round(v * 10) / 10;
  const seg = (p, q, cls = 's-line') => line(r1(p[0]), r1(p[1]), r1(q[0]), r1(q[1]), cls);
  const lab = (x, y, s, opt = {}) => text(r1(x), r1(y), s, { cls: 's-text s-bold', ...opt });
  const vsub = (p, q) => [p[0] - q[0], p[1] - q[1]];
  const unit = v => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
  const along = (p, v, t) => [p[0] + v[0] * t, p[1] + v[1] * t];
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const rad = d => (d * Math.PI) / 180;
  const rot = (p, deg, c) => {
    const a = rad(deg), x = p[0] - c[0], y = p[1] - c[1];
    return [c[0] + x * Math.cos(a) - y * Math.sin(a), c[1] + x * Math.sin(a) + y * Math.cos(a)];
  };
  // n small ticks across [PQ] at its midpoint (codage of equal lengths).
  function ticks(p, q, n) {
    const u = unit(vsub(q, p)), v = [-u[1], u[0]], m = mid(p, q);
    let out = '';
    for (let i = 0; i < n; i++) { const c = along(m, u, (i - (n - 1) / 2) * 5); out += seg(along(c, v, -6), along(c, v, 6)); }
    return out;
  }
  // Right-angle mark at o, between the directions of a and b.
  function rightMark(o, a, b, s = 11, cls = 's-line s-nofill') {
    const u = unit(vsub(a, o)), v = unit(vsub(b, o));
    const p1 = along(o, u, s), p3 = along(o, v, s), p2 = along(p1, v, s);
    return `<polyline points="${[p1, p2, p3].map(p => p.map(r1).join(',')).join(' ')}" class="${cls}"/>`;
  }
  // Vertex label just outside the figure, away from the centre c.
  const labOut = (p, c, s, d = 16) => { const u = unit(vsub(p, c)); return lab(p[0] + u[0] * d, p[1] + u[1] * d + 5, s); };
  // Part of the line through p (direction d) inside the box [m, W − m] × [m, H − m].
  function clip(p, d, W, H, m = 6) {
    let t0 = -1e9, t1 = 1e9;
    [[0, W], [1, H]].forEach(([k, size]) => {
      if (Math.abs(d[k]) < 1e-9) return;
      const a = (m - p[k]) / d[k], b = (size - m - p[k]) / d[k];
      t0 = Math.max(t0, Math.min(a, b)); t1 = Math.min(t1, Math.max(a, b));
    });
    return [along(p, d, t0), along(p, d, t1)];
  }
  // Arc of radius r centred at p, from angle a1 to a2 (degrees, counter-clockwise as in maths).
  function arc(p, a1, a2, r, cls = 's-accent-line') {
    const P = a => [p[0] + r * Math.cos(rad(a)), p[1] - r * Math.sin(rad(a))];
    const s = P(a1), e = P(a2), large = (((a2 - a1) % 360) + 360) % 360 > 180 ? 1 : 0;
    return `<path d="M${r1(s[0])},${r1(s[1])} A${r},${r} 0 ${large} 0 ${r1(e[0])},${r1(e[1])}" class="${cls}"/>`;
  }

  // ===================== AIRES =====================
  function paraFig(bLab, hLab, sLab) {
    const A = [40, 150], B = [220, 150], C = [280, 40], D = [100, 40], K = [100, 150];
    let b = poly([A, B, C, D], 's-soft s-line') + seg(D, K, 's-line s-dash') + rightMark(K, D, B);
    b += text(130, 172, bLab) + text(108, 100, hLab, { anchor: 'start' });
    if (sLab) b += text(62, 92, sLab, { anchor: 'end' });
    return svg(320, 185, b);
  }
  function triObtusFig(bLab, hLab) {
    const A = [30, 160], B = [170, 160], C = [260, 40], H = [260, 160];
    let b = poly([A, B, C], 's-soft s-line') + seg(B, H, 's-line s-dash') + seg(C, H, 's-line s-dash') + rightMark(H, C, A);
    b += text(100, 182, bLab) + text(268, 105, hLab, { anchor: 'start' });
    b += lab(20, 166, 'A') + lab(170, 180, 'B') + lab(262, 30, 'C') + lab(272, 178, 'H');
    return svg(340, 190, b);
  }
  function maisonFig(LLab, lLab, hLab) {
    const x0 = 60, x1 = 240, yt = 90, yb = 170, apex = [150, 20];
    let b = poly([[x0, yb], [x1, yb], [x1, yt], apex, [x0, yt]], 's-soft s-line') + seg([x0, yt], [x1, yt]);
    b += seg(apex, [150, yt], 's-line s-dash') + rightMark([150, yt], apex, [x1, yt]);
    b += text(150, 190, LLab) + text(52, 135, lLab, { anchor: 'end' }) + text(158, 62, hLab, { anchor: 'start' });
    return svg(300, 200, b);
  }
  function demiDisqueFig(LLab, dLab) {
    let b = '<path d="M70,50 L230,50 A50,50 0 0 1 230,150 L70,150 Z" class="s-soft s-line"/>' + seg([230, 50], [230, 150], 's-line s-dash');
    b += text(150, 42, LLab) + text(62, 105, dLab, { anchor: 'end' });
    return svg(300, 170, b);
  }
  function trouFig(cLab, rLab) {
    let b = '<path d="M40,25 h140 v140 h-140 Z M75,95 a35,35 0 1 0 70,0 a35,35 0 1 0 -70,0 Z" fill-rule="evenodd" class="s-soft s-line"/>';
    b += dot(110, 95) + seg([110, 95], [145, 95], 's-accent-line') + text(127, 88, rLab, { size: 13 }) + text(110, 18, cLab);
    return svg(220, 180, b);
  }

  M.notion('aires-5e', {
    lesson: {
      retenir: '<ul><li><b>Triangle</b> : A = base × hauteur ÷ 2. La hauteur relative à une base est perpendiculaire à cette base et passe par le sommet opposé.</li><li><b>Parallélogramme</b> : A = base × hauteur.</li><li><b>Disque</b> de rayon r : A = π × r × r (on prend π ≈ 3,14).</li><li><b>Figure complexe</b> : on la découpe en figures simples, puis on additionne (ou on soustrait) leurs aires.</li><li>Unités d’aire : 1 m² = 100 dm² = 10 000 cm² ; 1 dm² = 100 cm² ; 1 cm² = 100 mm².</li></ul>',
      explication: `${paraFig('base 6 cm', 'h = 4 cm')}<p>Découpe le petit triangle à gauche de la hauteur et recolle-le à droite : le parallélogramme devient un <b>rectangle</b> de même base et de même hauteur. Son aire vaut donc base × hauteur = 6 × 4 = <b>24 cm²</b>.</p><p>Une diagonale coupe un parallélogramme en <b>deux triangles identiques</b> : l’aire d’un triangle est la moitié, d’où le « ÷ 2 ».</p>`,
      methode: [
        'Repère la base et la <b>hauteur relative à cette base</b> (elle fait un angle droit avec la base). Un côté oblique ne sert pas.',
        'Vérifie que toutes les longueurs sont dans la même unité ; sinon, convertis d’abord.',
        'Pour un disque, si on te donne le diamètre, divise-le par 2 pour avoir le rayon.',
        'Pour une figure complexe : découpe-la, calcule chaque aire, puis additionne ou soustrais.',
      ],
      exemples: [
        { q: 'Triangle de base 9 cm et de hauteur 4 cm', r: '9 × 4 ÷ 2 = 36 ÷ 2 = <b>18 cm²</b>.' },
        { q: 'Disque de diamètre 10 cm', r: 'Rayon : 5 cm. A ≈ 3,14 × 5 × 5 = <b>78,5 cm²</b>.' },
        { q: '2,5 m² = ? cm²', r: '1 m² = 10 000 cm², donc 2,5 × 10 000 = <b>25 000 cm²</b>.' },
      ],
      astuces: ['Dans un triangle qui a un angle obtus, une hauteur peut tomber <b>à l’extérieur</b> du triangle : on prolonge la base.'],
      erreurs: [
        'Prendre le côté oblique du parallélogramme au lieu de la hauteur.',
        'Oublier le « ÷ 2 » pour le triangle.',
        'Calculer π × r × 2 (c’est la longueur du cercle !) au lieu de π × r × r.',
        'Convertir les aires avec 10 au lieu de 100 : 1 dm² = 100 cm².',
      ],
    },
    generate(level, rng) {
      const t = level === 1 ? rng.pick(['tri', 'para', 'disque'])
        : level === 2 ? rng.pick(['tri', 'para', 'disque-d', 'conv'])
          : rng.pick(['maison', 'demi', 'trou', 'obtus', 'pb', 'inv']);
      if (t === 'tri' || t === 'para') {
        const b = level === 1 ? rng.int(6, 20) : dec(rng.int(60, 150), 1);
        const h = rng.int(2, Math.min(12, Math.floor(b) - 1));
        if (t === 'tri') {
          const A = div(mul(b, h), 2);
          return Q(`a5t:${b}x${h}`, `${S.triangle(cm(b), cm(h))}Quelle est l’aire de ce triangle ? (la hauteur est en pointillés)`, num(A, 'cm²'), 'Aire du triangle = base × hauteur ÷ 2.', `A = ${fmt(b)} × ${h} ÷ 2 = ${fmt(mul(b, h))} ÷ 2 = <b>${fmt(A)} cm²</b>`);
        }
        const side = level === 1 ? 0 : add(h, dec(rng.int(5, 40), 1)), A = mul(b, h);
        return Q(`a5p:${b}x${h}:${side}`, `${paraFig(cm(b), cm(h), side ? cm(side) : '')}Quelle est l’aire de ce parallélogramme ?`, num(A, 'cm²'), 'Aire du parallélogramme = base × hauteur, avec la hauteur perpendiculaire à la base.', `A = base × hauteur = ${fmt(b)} × ${h} = <b>${fmt(A)} cm²</b>${side ? ` (le côté oblique de ${fmt(side)} cm ne sert pas).` : '.'}`);
      }
      if (t === 'disque') {
        const r = rng.int(1, 12), A = mul(3.14, r * r);
        return Q(`a5d:${r}`, `${S.circle(cm(r))}Quelle est l’aire de ce disque de rayon ${r} cm ? (prends π ≈ 3,14)`, num(A, 'cm²'), 'Aire du disque = π × r × r.', `A ≈ 3,14 × ${r} × ${r} = 3,14 × ${r * r} = <b>${fmt(A)} cm²</b>`);
      }
      if (t === 'disque-d') {
        const d = 2 * rng.int(1, 12), r = d / 2, A = mul(3.14, r * r);
        return Q(`a5dd:${d}`, `${S.circle(cm(d), { diameter: true })}Quelle est l’aire de ce disque de diamètre ${d} cm ? (prends π ≈ 3,14)`, num(A, 'cm²'), 'Commence par trouver le rayon.', `Rayon : ${d} ÷ 2 = ${r} cm. A ≈ 3,14 × ${r} × ${r} = 3,14 × ${r * r} = <b>${fmt(A)} cm²</b>`);
      }
      if (t === 'conv') {
        const U = ['m²', 'dm²', 'cm²', 'mm²'], i = rng.int(0, 2), down = rng.chance(0.5);
        const [from, to] = down ? [U[i], U[i + 1]] : [U[i + 1], U[i]];
        let x, y;
        do { x = dec(rng.int(1, 999), rng.int(0, 2)); y = down ? mul(x, 100) : div(x, 100); } while (y === 100);   // the hint shows 100
        return Q(`a5c:${x}${from}${to}`, `${fmt(x)} ${from} = ${hole} ${to}`, num(y, to), 'Une unité d’aire vaut 100 fois l’unité d’aire juste plus petite.', `1 ${U[i]} = 100 ${U[i + 1]}, donc on ${down ? 'multiplie' : 'divise'} par 100 : ${fmt(x)} ${from} = <b>${fmt(y)} ${to}</b>`);
      }
      if (t === 'maison') {
        const L = rng.int(6, 14), l = rng.int(3, Math.min(7, L - 2)), h = rng.int(2, 6);
        const Ar = L * l, At = div(L * h, 2), A = add(Ar, At);
        return Q(`a5m:${L}x${l}x${h}`, `${maisonFig(cm(L), cm(l), cm(h))}Cette figure est formée d’un rectangle et d’un triangle. Quelle est son aire ?`, num(A, 'cm²'), 'Calcule l’aire du rectangle, puis celle du triangle (sa base est la longueur du rectangle).', `Rectangle : ${L} × ${l} = ${Ar} cm². Triangle : ${L} × ${h} ÷ 2 = ${fmt(At)} cm². Total : ${Ar} + ${fmt(At)} = <b>${fmt(A)} cm²</b>`);
      }
      if (t === 'demi') {
        const L = rng.int(7, 15), d = 2 * rng.int(1, 6), r = d / 2;
        const Ar = L * d, Ad = mul(3.14, r * r), half = div(Ad, 2), A = add(Ar, half);
        return Q(`a5dm:${L}x${d}`, `${demiDisqueFig(cm(L), cm(d))}Cette figure est formée d’un rectangle et d’un demi-disque. Quelle est son aire ? (prends π ≈ 3,14)`, num(A, 'cm²'), 'Le diamètre du demi-disque est la largeur du rectangle. Un demi-disque, c’est la moitié d’un disque.', `Rectangle : ${L} × ${d} = ${Ar} cm². Demi-disque (rayon ${r} cm) : 3,14 × ${r} × ${r} ÷ 2 = ${fmt(Ad)} ÷ 2 = ${fmt(half)} cm². Total : ${Ar} + ${fmt(half)} = <b>${fmt(A)} cm²</b>`);
      }
      if (t === 'trou') {
        const c = rng.int(6, 20), r = rng.int(1, Math.min(8, Math.floor((c - 1) / 2)));
        const Ad = mul(3.14, r * r), A = sub(c * c, Ad);
        return Q(`a5h:${c}:${r}`, `${trouFig(cm(c), cm(r))}On découpe un disque de rayon ${r} cm dans une plaque carrée de ${c} cm de côté. Quelle est l’aire de la partie colorée ? (prends π ≈ 3,14)`, num(A, 'cm²'), 'Aire du carré moins aire du disque.', `Carré : ${c} × ${c} = ${c * c} cm². Disque : 3,14 × ${r} × ${r} = ${fmt(Ad)} cm². Reste : ${c * c} − ${fmt(Ad)} = <b>${fmt(A)} cm²</b>`);
      }
      if (t === 'obtus') {
        const b = rng.int(3, 12), h = rng.int(3, 12), A = div(b * h, 2);
        return Q(`a5o:${b}x${h}`, `${triObtusFig(cm(b), cm(h))}Quelle est l’aire du triangle ABC ? ([CH] est la hauteur issue de C ; elle tombe à l’extérieur du triangle.)`, num(A, 'cm²'), 'La formule ne change pas : base × hauteur ÷ 2, avec la base [AB].', `A = AB × CH ÷ 2 = ${b} × ${h} ÷ 2 = <b>${fmt(A)} cm²</b>`);
      }
      if (t === 'pb') {
        if (rng.chance(0.5)) {
          const bm = dec(rng.int(6, 30), 1), bcm = mul(bm, 100), hcm = rng.int(2, 9) * 10, Acm = div(bcm * hcm, 2), inM2 = rng.chance(0.5), Am2 = div(Acm, 10000);
          return Q(`a5pb:t${bm}:${hcm}:${inM2}`, `Une voile triangulaire a une base de ${fmt(bm)} m et une hauteur relative à cette base de ${hcm} cm. Quelle est son aire en ${inM2 ? 'm²' : 'cm²'} ?`, num(inM2 ? Am2 : Acm, inM2 ? 'm²' : 'cm²'), 'Convertis d’abord les deux longueurs dans la même unité.', `${fmt(bm)} m = ${fmt(bcm)} cm. A = ${fmt(bcm)} × ${hcm} ÷ 2 = ${inM2 ? fmt(Acm) : `<b>${fmt(Acm)}</b>`} cm²${inM2 ? `, et 1 m² = 10 000 cm², donc A = <b>${fmt(Am2)} m²</b>` : ''}.`);
        }
        const bm = dec(rng.int(20, 90), 1), hcm = rng.int(15, 60) * 10, hm = div(hcm, 100), A = mul(bm, hm);
        return Q(`a5pb:p${bm}:${hcm}`, `Une terrasse a la forme d’un parallélogramme de base ${fmt(bm)} m et de hauteur ${hcm} cm. Quelle est son aire en m² ?`, num(A, 'm²'), 'Exprime d’abord la hauteur en mètres.', `${hcm} cm = ${fmt(hm)} m. A = ${fmt(bm)} × ${fmt(hm)} = <b>${fmt(A)} m²</b>`);
      }
      const b = rng.int(4, 16), h = rng.int(2, 15), A = div(b * h, 2);
      return Q(`a5i:${b}x${h}`, `Un triangle a une aire de ${fmt(A)} cm² et une base de ${b} cm. Quelle est la hauteur relative à cette base ?`, num(h, 'cm'), 'Aire = base × hauteur ÷ 2, donc base × hauteur = 2 × aire.', `base × hauteur = 2 × ${fmt(A)} = ${b * h}, donc hauteur = ${b * h} ÷ ${b} = <b>${h} cm</b>`);
    },
  });

  // ===================== VOLUMES =====================
  function prismeFig(aLab, bLab, LLab) {
    const A = [70, 160], B = [180, 160], C = [70, 70], s = [120, -45];
    const A2 = along(A, s, 1), B2 = along(B, s, 1), C2 = along(C, s, 1);
    let b = poly([B, B2, C2, C], 's-soft2 s-line') + poly([A, B, C], 's-soft s-line');
    b += seg(A, A2, 's-line s-dash') + seg(A2, B2, 's-line s-dash') + seg(A2, C2, 's-line s-dash') + rightMark(A, B, C);
    b += text(125, 180, aLab) + text(62, 120, bLab, { anchor: 'end' }) + text(248, 152, LLab, { anchor: 'start' });
    return svg(350, 190, b);
  }
  function cylFig(rLab, hLab, diameter = false) {
    const cx = 110, rx = 70, ry = 18, yt = 35, yb = 145, xl = cx - rx, xr = cx + rx;
    let b = `<path d="M${xl},${yt} L${xl},${yb} A${rx},${ry} 0 0 0 ${xr},${yb} L${xr},${yt} A${rx},${ry} 0 0 0 ${xl},${yt} Z" class="s-soft s-line"/>`;
    b += `<path d="M${xl},${yb} A${rx},${ry} 0 0 1 ${xr},${yb}" class="s-line s-dash"/>`;
    b += `<ellipse cx="${cx}" cy="${yt}" rx="${rx}" ry="${ry}" class="s-soft2 s-line"/>` + dot(cx, yt);
    b += diameter ? seg([xl, yt], [xr, yt], 's-accent-line') + text(cx, yt + 15, rLab, { size: 13 })
      : seg([cx, yt], [xr, yt], 's-accent-line') + text(cx + rx / 2, yt + 15, rLab, { size: 13 });
    b += text(xr + 10, (yt + yb) / 2 + 5, hLab, { anchor: 'start' });
    return svg(270, 175, b);
  }
  // Volume / capacity units as powers of ten of the cm³.
  const VU = { 'm³': 6, 'dm³': 3, L: 3, dL: 2, cL: 1, 'cm³': 0, mL: 0, 'mm³': -3 };
  const CONV = {
    1: [['dm³', 'L'], ['L', 'dm³'], ['cm³', 'mL'], ['L', 'cL'], ['L', 'mL'], ['L', 'dL']],
    2: [['m³', 'dm³'], ['dm³', 'm³'], ['dm³', 'cm³'], ['cm³', 'dm³'], ['L', 'cm³'], ['cm³', 'L'], ['cL', 'L'], ['m³', 'L']],
    3: [['m³', 'L'], ['L', 'm³'], ['mL', 'dm³'], ['cm³', 'L'], ['dL', 'cm³'], ['mm³', 'cm³'], ['cL', 'cm³'], ['mL', 'L']],
  };
  function convFact(u, v) {
    const k = VU[u] - VU[v];
    if (k === 0) return `1 ${u} = 1 ${v}`;
    return k > 0 ? `1 ${u} = ${fmt(10 ** k)} ${v}` : `1 ${v} = ${fmt(10 ** -k)} ${u}`;
  }
  const CAPA = ['L', 'dL', 'cL', 'mL'];
  function convHint(u, v) {
    const cu = CAPA.includes(u), cv = CAPA.includes(v);
    if (cu && cv) return 'Rappelle-toi : 1 L = 10 dL = 100 cL = 1 000 mL.';
    if (cu || cv) return 'Rappelle-toi : 1 dm³ = 1 L et 1 cm³ = 1 mL.';
    return 'Une unité de volume vaut 1 000 fois l’unité de volume juste plus petite.';
  }
  function convert(x, u, v) {
    const k = VU[u] - VU[v];
    return k >= 0 ? mul(x, 10 ** k) : div(x, 10 ** -k);
  }

  M.notion('volumes-5e', {
    lesson: {
      retenir: '<ul><li><b>Prisme droit</b> : V = aire de la base × hauteur. Le pavé droit et le cube sont des prismes droits : V = L × l × h et V = c × c × c.</li><li><b>Cylindre</b> de rayon r et de hauteur h : V = π × r × r × h (π ≈ 3,14).</li><li>Unités de volume : 1 m³ = 1 000 dm³ ; 1 dm³ = 1 000 cm³ ; 1 cm³ = 1 000 mm³.</li><li>Contenances : <b>1 dm³ = 1 L</b> ; 1 cm³ = 1 mL ; 1 L = 10 dL = 100 cL = 1 000 mL ; 1 m³ = 1 000 L.</li></ul>',
      explication: `${prismeFig('4 cm', '3 cm', '10 cm')}<p>Un prisme droit, c’est sa base « empilée » sur toute sa hauteur. Ici la base est un triangle rectangle d’aire 4 × 3 ÷ 2 = 6 cm² ; empilée sur 10 cm, elle donne V = 6 × 10 = <b>60 cm³</b>.</p><p>Le cylindre, c’est pareil, avec un <b>disque</b> comme base : V = (π × r × r) × h.</p>`,
      methode: [
        'Repère la <b>base</b> du solide (les deux faces identiques et parallèles) et sa <b>hauteur</b> (la distance entre ces deux bases).',
        'Calcule l’aire de la base, puis multiplie par la hauteur.',
        'Vérifie que toutes les longueurs sont dans la même unité ; le résultat est en cm³, m³…',
        'Pour une contenance en litres : passe par les dm³ (1 dm³ = 1 L) ou par les cm³ (1 L = 1 000 cm³).',
      ],
      exemples: [
        { q: 'Prisme droit dont la base a une aire de 15 cm² et de hauteur 8 cm', r: 'V = 15 × 8 = <b>120 cm³</b>.' },
        { q: 'Cylindre de rayon 2 cm et de hauteur 10 cm', r: 'V ≈ 3,14 × 2 × 2 × 10 = <b>125,6 cm³</b>.' },
        { q: '2,5 m³ = ? L', r: '1 m³ = 1 000 dm³ = 1 000 L, donc <b>2 500 L</b>.' },
      ],
      astuces: ['Un prisme droit n’est pas toujours « posé » sur sa base : cherche les deux faces identiques et parallèles, c’est elles les bases.'],
      erreurs: [
        'Convertir les volumes avec 10 ou 100 au lieu de 1 000 : 1 dm³ = 1 000 cm³.',
        'Oublier le « ÷ 2 » dans l’aire d’une base triangulaire.',
        'Utiliser le diamètre à la place du rayon pour le cylindre.',
      ],
    },
    generate(level, rng) {
      const t = level === 1 ? rng.pick(['pave', 'cube', 'prisme-aire', 'conv'])
        : level === 2 ? rng.pick(['prisme-tri', 'cyl', 'pave', 'conv'])
          : rng.pick(['cyl-L', 'cyl-d', 'inv', 'conv', 'prisme-gen']);
      if (t === 'pave') {
        const L = level === 1 ? rng.int(3, 12) : dec(rng.int(25, 120), 1), l = rng.int(2, Math.min(9, Math.floor(L))), h = rng.int(2, 9);
        const V = mul(mul(L, l), h);
        return Q(`v5p:${L}x${l}x${h}`, `${S.pave(cm(L), cm(l), cm(h))}Quel est le volume de ce pavé droit ?`, num(V, 'cm³'), 'V = L × l × h (aire de la base × hauteur).', `V = ${fmt(L)} × ${l} × ${h} = <b>${fmt(V)} cm³</b>`);
      }
      if (t === 'cube') {
        const c = rng.int(2, 10), V = c * c * c;
        return Q(`v5c:${c}`, `Quel est le volume d’un cube de ${c} cm d’arête ?`, num(V, 'cm³'), 'V = c × c × c.', `V = ${c} × ${c} × ${c} = <b>${fmt(V)} cm³</b>`);
      }
      if (t === 'prisme-aire') {
        const Ab = rng.int(4, 60), h = rng.int(2, 15), V = Ab * h;
        return Q(`v5pa:${Ab}x${h}`, `Un prisme droit a une base d’aire ${Ab} cm² et une hauteur de ${h} cm. Quel est son volume ?`, num(V, 'cm³'), 'V = aire de la base × hauteur.', `V = ${Ab} × ${h} = <b>${fmt(V)} cm³</b>`);
      }
      if (t === 'prisme-tri') {
        const a = rng.int(3, 12), b = rng.int(2, 10), L = rng.int(3, 15), Ab = div(a * b, 2), V = mul(Ab, L);
        return Q(`v5pt:${a}x${b}x${L}`, `${prismeFig(cm(a), cm(b), cm(L))}Ce prisme droit a pour base un triangle rectangle. Quel est son volume ?`, num(V, 'cm³'), 'Calcule d’abord l’aire de la base (le triangle), puis multiplie par la hauteur du prisme.', `Aire de la base : ${a} × ${b} ÷ 2 = ${fmt(Ab)} cm². V = ${fmt(Ab)} × ${L} = <b>${fmt(V)} cm³</b>`);
      }
      if (t === 'prisme-gen') {
        const b = rng.int(3, 12), hb = rng.int(2, 10), H = rng.int(3, 20), Ab = div(b * hb, 2), V = mul(Ab, H);
        return Q(`v5pg:${b}x${hb}x${H}`, `La base d’un prisme droit est un triangle de base ${b} cm et de hauteur relative ${hb} cm. La hauteur du prisme est ${H} cm. Quel est son volume ?`, num(V, 'cm³'), 'Attention : il y a deux « hauteurs », celle du triangle et celle du prisme.', `Aire de la base : ${b} × ${hb} ÷ 2 = ${fmt(Ab)} cm². V = ${fmt(Ab)} × ${H} = <b>${fmt(V)} cm³</b>`);
      }
      if (t === 'cyl' || t === 'cyl-d') {
        const r = t === 'cyl' ? rng.int(1, 10) : rng.int(2, 10), h = rng.int(r + 1, 20), V = mul(3.14, r * r * h);
        const fig = t === 'cyl' ? cylFig(cm(r), cm(h)) : cylFig(cm(2 * r), cm(h), true);
        const given = t === 'cyl' ? `de rayon ${r} cm` : `de diamètre ${2 * r} cm`;
        return Q(`v5cy:${t}:${r}x${h}`, `${fig}Quel est le volume de ce cylindre ${given} et de hauteur ${h} cm ? (prends π ≈ 3,14)`, num(V, 'cm³'), t === 'cyl' ? 'V = aire du disque de base × hauteur = π × r × r × h.' : 'Commence par trouver le rayon, puis V = π × r × r × h.', `${t === 'cyl-d' ? `Rayon : ${2 * r} ÷ 2 = ${r} cm. ` : ''}V ≈ 3,14 × ${r} × ${r} × ${h} = 3,14 × ${r * r * h} = <b>${fmt(V)} cm³</b>`);
      }
      if (t === 'cyl-L') {
        const r = rng.int(5, 15), h = rng.int(10, 40), V = mul(3.14, r * r * h), VL = div(V, 1000);
        return Q(`v5cl:${r}x${h}`, `${cylFig(cm(r), cm(h))}Une casserole cylindrique a un rayon de ${r} cm et une hauteur de ${h} cm. Quelle est sa contenance en litres ? (prends π ≈ 3,14)`, num(VL, 'L'), 'Calcule le volume en cm³, puis souviens-toi que 1 L = 1 dm³ = 1 000 cm³.', `V ≈ 3,14 × ${r} × ${r} × ${h} = ${fmt(V)} cm³. Comme 1 L = 1 000 cm³ : ${fmt(V)} ÷ 1 000 = <b>${fmt(VL)} L</b>`);
      }
      if (t === 'inv') {
        const L = 10 * rng.int(3, 8), l = 10 * rng.int(2, 5), h = rng.int(10, 40), Vcm = L * l * h, VL = div(Vcm, 1000);
        return Q(`v5i:${L}x${l}x${h}`, `Un aquarium en forme de pavé droit a un fond de ${L} cm sur ${l} cm. On y verse ${fmt(VL)} L d’eau. Quelle hauteur l’eau atteint-elle ?`, num(h, 'cm'), 'Convertis le volume d’eau en cm³, puis divise par l’aire du fond.', `${fmt(VL)} L = ${fmt(VL)} dm³ = ${fmt(Vcm)} cm³. Aire du fond : ${L} × ${l} = ${fmt(L * l)} cm². Hauteur : ${fmt(Vcm)} ÷ ${fmt(L * l)} = <b>${h} cm</b>`);
      }
      const [u, v] = rng.pick(CONV[level]);
      let x, y;
      do {
        x = level === 1 ? rng.int(1, 99) : level === 2 ? dec(rng.int(1, 999), rng.int(0, 1)) : dec(rng.int(1, 9999), rng.int(0, 2));
        y = convert(x, u, v);
      } while ([10, 100, 1000].includes(y));   // the hint shows these numbers
      const k = VU[u] - VU[v];
      const how = k === 0 ? 'le nombre ne change pas' : `on ${k > 0 ? 'multiplie' : 'divise'} par ${fmt(10 ** Math.abs(k))}`;
      return Q(`v5cv:${x}${u}${v}`, `${fmt(x)} ${u} = ${hole} ${v}`, num(y, v), convHint(u, v), `${convFact(u, v)}, donc ${how} : ${fmt(x)} ${u} = <b>${fmt(y)} ${v}</b>`);
    },
  });

  // ===================== PARALLÉLOGRAMMES =====================
  const QUADS = {
    para: [[-90, 40], [60, 40], [90, -40], [-60, -40]],
    rect: [[-85, 45], [85, 45], [85, -45], [-85, -45]],
    los: [[-95, 0], [0, 55], [95, 0], [0, -55]],
    carre: [[-78, 0], [0, 78], [78, 0], [0, -78]],
  };
  const QNAME = { para: 'un parallélogramme', rect: 'un rectangle', los: 'un losange', carre: 'un carré' };
  // code: '' | 'diag' (codage on the diagonals) | 'sides' (codage on sides and angles).
  function quadFig(kind, { deg = 0, diag = false, code = '' } = {}) {
    const c = [170, 120], P = QUADS[kind].map(p => rot([p[0] + c[0], p[1] + c[1]], deg, c));
    const [A, B, C, D] = P;
    let b = poly(P, 's-soft s-line');
    if (diag || code === 'diag') b += seg(A, C) + seg(B, D) + dot(...c);
    if (code === 'diag') {
      const same = kind === 'rect' || kind === 'carre';
      b += ticks(A, c, 1) + ticks(c, C, 1) + ticks(B, c, same ? 1 : 2) + ticks(c, D, same ? 1 : 2);
      if (kind === 'los' || kind === 'carre') b += rightMark(c, C, D);   // away from the O label
    }
    if (code === 'sides') {
      if (kind === 'para') b += ticks(A, B, 1) + ticks(C, D, 1) + ticks(B, C, 2) + ticks(D, A, 2);
      if (kind === 'rect') b += rightMark(A, B, D) + rightMark(B, C, A) + rightMark(C, D, B);
      if (kind === 'los' || kind === 'carre') b += ticks(A, B, 1) + ticks(B, C, 1) + ticks(C, D, 1) + ticks(D, A, 1);
      if (kind === 'carre') b += rightMark(A, B, D);
    }
    b += ['A', 'B', 'C', 'D'].map((n, i) => labOut(P[i], c, n)).join('');
    if (diag || code === 'diag') {
      const u = unit(vsub(mid(B, C), c));
      b += lab(c[0] + u[0] * 18, c[1] + u[1] * 18 + 5, 'O');
    }
    return svg(340, 240, b);
  }
  const PARA_TF = [
    ['Un quadrilatère dont les côtés opposés sont parallèles deux à deux est un parallélogramme.', true, 'C’est la définition du parallélogramme.'],
    ['Les diagonales d’un parallélogramme ont le même milieu.', true, 'C’est une propriété caractéristique du parallélogramme.'],
    ['Les diagonales d’un parallélogramme ont toujours la même longueur.', false, 'Seulement si c’est un rectangle.'],
    ['Un quadrilatère dont les diagonales sont perpendiculaires est toujours un losange.', false, 'Il faut aussi que les diagonales aient le même milieu.'],
    ['Le point d’intersection des diagonales d’un parallélogramme est son centre de symétrie.', true, 'Un demi-tour autour de ce point échange A et C, B et D.'],
    ['Un parallélogramme quelconque a un axe de symétrie.', false, 'Il a un centre de symétrie, mais aucun axe.'],
    ['Un carré est à la fois un rectangle et un losange.', true, 'Il a quatre angles droits et quatre côtés de même longueur.'],
    ['Un losange est un parallélogramme particulier.', true, 'Ses côtés opposés sont parallèles.'],
    ['Un quadrilatère qui a seulement deux côtés opposés de même longueur est forcément un parallélogramme.', false, 'Il faut que les côtés opposés soient de même longueur deux à deux.'],
    ['Un quadrilatère non croisé dont les côtés opposés ont la même longueur deux à deux est un parallélogramme.', true, 'C’est une propriété caractéristique du parallélogramme.'],
    ['Les angles opposés d’un parallélogramme ont la même mesure.', true, 'Le demi-tour autour du centre les échange, et il conserve les angles.'],
    ['Les diagonales d’un rectangle sont toujours perpendiculaires.', false, 'Seulement si c’est un carré.'],
  ];
  const PARA_NATURE = [
    ['ABCD est un parallélogramme et AC = BD.', 'rect', 'Un parallélogramme dont les diagonales ont la même longueur est un rectangle.'],
    ['ABCD est un parallélogramme et (AC) ⊥ (BD).', 'los', 'Un parallélogramme dont les diagonales sont perpendiculaires est un losange.'],
    ['ABCD est un parallélogramme et AB = BC.', 'los', 'Un parallélogramme qui a deux côtés consécutifs de même longueur est un losange.'],
    [`ABCD est un parallélogramme et l’angle ${ang('ABC')} est droit.`, 'rect', 'Un parallélogramme qui a un angle droit est un rectangle.'],
    ['ABCD est un parallélogramme, AC = BD et (AC) ⊥ (BD).', 'carre', 'Ses diagonales ont la même longueur (rectangle) et sont perpendiculaires (losange) : c’est un carré.'],
    ['Les diagonales de ABCD ont le même milieu.', 'para', 'Un quadrilatère dont les diagonales ont le même milieu est un parallélogramme.'],
    ['Les diagonales de ABCD ont le même milieu et la même longueur.', 'rect', 'Même milieu : parallélogramme ; même longueur en plus : rectangle.'],
    ['Les diagonales de ABCD ont le même milieu et sont perpendiculaires.', 'los', 'Même milieu : parallélogramme ; perpendiculaires en plus : losange.'],
    ['ABCD est un rectangle et AB = BC.', 'carre', 'Un rectangle qui a deux côtés consécutifs de même longueur est un carré.'],
    [`ABCD est un losange et l’angle ${ang('ABC')} est droit.`, 'carre', 'Un losange qui a un angle droit est un carré.'],
    ['ABCD est un parallélogramme de centre O, avec OA = 3 cm et OB = 3 cm.', 'rect', 'AC = 2 × OA = 6 cm et BD = 2 × OB = 6 cm : les diagonales ont la même longueur, c’est un rectangle.'],
  ];
  const NATURE_OPTS = ['para', 'rect', 'los', 'carre'].map(k => QNAME[k]);

  M.notion('parallelogrammes', {
    lesson: {
      retenir: '<ul><li>Un <b>parallélogramme</b> est un quadrilatère dont les <b>côtés opposés sont parallèles</b> deux à deux.</li><li>Propriétés caractéristiques : un quadrilatère non croisé est un parallélogramme <b>si et seulement si</b> ses <b>côtés opposés ont la même longueur</b> deux à deux, et <b>si et seulement si</b> ses <b>diagonales ont le même milieu</b>. Ce milieu est le <b>centre de symétrie</b> du parallélogramme.</li><li>Ses angles opposés ont la même mesure.</li><li>Un <b>rectangle</b> est un parallélogramme qui a un angle droit ; ses diagonales ont la <b>même longueur</b>.</li><li>Un <b>losange</b> est un parallélogramme qui a deux côtés consécutifs de même longueur ; ses diagonales sont <b>perpendiculaires</b>.</li><li>Un <b>carré</b> est à la fois un rectangle et un losange.</li></ul>',
      explication: `${table([['Les diagonales…', 'Nature'], ['ont le même milieu', 'parallélogramme'], ['ont le même milieu et la même longueur', 'rectangle'], ['ont le même milieu et sont perpendiculaires', 'losange'], ['ont le même milieu, la même longueur et sont perpendiculaires', 'carré']])}${quadFig('los', { code: 'diag' })}<p>Codage d’un losange : OA = OC (un trait), OB = OD (deux traits) et un angle droit en O.</p>`,
      methode: [
        'Pour construire le parallélogramme ABCD à partir de A, B et C : trace la parallèle à (AB) passant par C et la parallèle à (BC) passant par A ; elles se coupent en D. Ou bien, au compas : CD = AB et AD = BC.',
        'Autre méthode : place le milieu O de [AC], puis D tel que O soit aussi le milieu de [BD].',
        'Pour donner la nature d’un quadrilatère, lis le codage : traits identiques = longueurs égales, petit carré = angle droit.',
        'Commence par prouver que c’est un parallélogramme, puis cherche s’il est particulier (rectangle, losange, carré).',
      ],
      exemples: [
        { q: 'ABCD est un parallélogramme de centre O et AO = 4,5 cm. Combien mesure AC ?', r: 'O est le milieu de [AC] : AC = 2 × 4,5 = <b>9 cm</b>.' },
        { q: 'Un parallélogramme a des diagonales perpendiculaires. Quelle est sa nature ?', r: 'C’est un <b>losange</b>.' },
        { q: 'Un quadrilatère a des diagonales de même longueur. Est-ce un rectangle ?', r: '<b>Pas forcément</b> : il faut d’abord que les diagonales aient le même milieu.' },
      ],
      erreurs: [
        'Oublier la condition « même milieu » : des diagonales de même longueur ne suffisent pas pour avoir un rectangle.',
        'Croire qu’un parallélogramme a un axe de symétrie : il a seulement un centre de symétrie.',
        'Nommer les sommets dans le désordre : dans ABCD, les sommets se suivent, [AC] et [BD] sont les diagonales.',
      ],
    },
    generate(level, rng) {
      const t = level === 1 ? rng.pick(['cote', 'diag', 'perim', 'def'])
        : level === 2 ? rng.pick(['code', 'code', 'angle-opp', 'diag'])
          : rng.pick(['nature', 'nature', 'tf', 'consec', 'code']);
      if (t === 'cote') {
        const x = dec(rng.int(20, 90), 1), [s1, s2] = rng.pick([['AB', 'CD'], ['BC', 'AD'], ['CD', 'AB'], ['AD', 'BC']]);
        return Q(`pg1c:${s1}:${x}`, `${quadFig('para')}ABCD est un parallélogramme et ${s1} = ${fmt(x)} cm. Combien mesure ${s2} ?`, num(x, 'cm'), `Quel côté est opposé à [${s1}] ?`, `[${s1}] et [${s2}] sont des côtés opposés, et les côtés opposés d’un parallélogramme ont la même longueur : ${s2} = <b>${fmt(x)} cm</b>.`);
      }
      if (t === 'diag') {
        const v = rng.int(0, 2), x = dec(rng.int(15, 90), 1), fig = quadFig('para', { diag: true, deg: level === 1 ? 0 : rng.int(-20, 20) });
        const intro = `${fig}ABCD est un parallélogramme de centre O.`;
        if (v === 0) return Q(`pg1d0:${x}`, `${intro} OA = ${fmt(x)} cm. Combien mesure OC ?`, num(x, 'cm'), 'Que représente O pour la diagonale [AC] ?', `Les diagonales d’un parallélogramme ont le même milieu O, donc OC = OA = <b>${fmt(x)} cm</b>.`);
        if (v === 1) return Q(`pg1d1:${x}`, `${intro} OA = ${fmt(x)} cm. Combien mesure AC ?`, num(mul(2, x), 'cm'), 'Que représente O pour la diagonale [AC] ?', `O est le milieu de [AC], donc AC = 2 × OA = 2 × ${fmt(x)} = <b>${fmt(mul(2, x))} cm</b>.`);
        const d = mul(2, x);
        return Q(`pg1d2:${d}`, `${intro} BD = ${fmt(d)} cm. Combien mesure OD ?`, num(x, 'cm'), 'Que représente O pour la diagonale [BD] ?', `O est le milieu de [BD], donc OD = BD ÷ 2 = ${fmt(d)} ÷ 2 = <b>${fmt(x)} cm</b>.`);
      }
      if (t === 'perim') {
        const ab = rng.int(40, 90), bc = rng.int(Math.ceil(ab / 3), ab - 10), AB = dec(ab, 1), BC = dec(bc, 1), P = mul(2, add(AB, BC));
        return Q(`pg1p:${ab}:${bc}`, `${quadFig('para')}ABCD est un parallélogramme avec AB = ${fmt(AB)} cm et BC = ${fmt(BC)} cm. Quel est son périmètre ?`, num(P, 'cm'), 'Quelles sont les longueurs de [CD] et de [AD] ?', `CD = AB et AD = BC (côtés opposés), donc P = 2 × (${fmt(AB)} + ${fmt(BC)}) = 2 × ${fmt(add(AB, BC))} = <b>${fmt(P)} cm</b>.`);
      }
      if (t === 'def') {
        const good = 'dont les côtés opposés sont parallèles deux à deux';
        return Q('pg1def', 'Un parallélogramme est un quadrilatère…', choice(rng, good, ['qui a quatre angles droits', 'dont les diagonales sont perpendiculaires', 'qui a quatre côtés de même longueur', 'qui a un axe de symétrie']), 'Le nom « parallélogramme » contient un indice.', `Un parallélogramme est un quadrilatère <b>${good}</b>.`);
      }
      if (t === 'code') {
        const kind = rng.pick(['para', 'rect', 'los', 'carre']), code = level === 2 ? rng.pick(['diag', 'sides']) : rng.pick(['diag', 'sides']);
        const deg = rng.int(-20, 20);
        const why = {
          diag: { para: 'Les diagonales ont le même milieu O : c’est un parallélogramme (rien de plus n’est codé).', rect: 'Les quatre demi-diagonales sont égales : les diagonales ont le même milieu et la même longueur, c’est un rectangle.', los: 'Les diagonales ont le même milieu et sont perpendiculaires : c’est un losange.', carre: 'Les diagonales ont le même milieu, la même longueur et sont perpendiculaires : c’est un carré.' },
          sides: { para: 'Les côtés opposés ont la même longueur deux à deux : c’est un parallélogramme.', rect: 'Un quadrilatère qui a trois angles droits a forcément quatre angles droits : c’est un rectangle.', los: 'Les quatre côtés ont la même longueur : c’est un losange.', carre: 'C’est un losange (quatre côtés égaux) qui a un angle droit : c’est un carré.' },
        }[code][kind];
        return Q(`pgcode:${kind}:${code}:${deg}`, `${quadFig(kind, { code, deg })}D’après le codage, quelle est la nature la plus précise du quadrilatère ABCD ?`, fixedChoice(NATURE_OPTS, QNAME[kind]), code === 'diag' ? 'Regarde ce que le codage dit des diagonales : milieu, longueur, angle droit.' : 'Regarde ce que le codage dit des côtés et des angles.', `${why} ABCD est <b>${QNAME[kind]}</b>.`);
      }
      if (t === 'angle-opp') {
        const acute = rng.chance(0.5), x = acute ? rng.int(55, 80) : rng.int(100, 125);
        const [given, asked] = acute ? rng.pick([['DAB', 'BCD'], ['BCD', 'DAB']]) : rng.pick([['ABC', 'CDA'], ['CDA', 'ABC']]);
        return Q(`pgao:${given}:${x}`, `${quadFig('para')}ABCD est un parallélogramme et l’angle ${ang(given)} mesure ${x}°. Combien mesure l’angle ${ang(asked)} ?`, num(x, '°'), 'Où sont placés ces deux angles l’un par rapport à l’autre ?', `${ang(given)} et ${ang(asked)} sont des angles opposés du parallélogramme : ils ont la même mesure, <b>${x}°</b>.`);
      }
      if (t === 'consec') {
        const x = rng.int(55, 80), y = 180 - x;
        return Q(`pgcs:${x}`, `${quadFig('para')}ABCD est un parallélogramme et l’angle ${ang('DAB')} mesure ${x}°. Combien mesure l’angle ${ang('ABC')} ?`, num(y, '°'), 'La somme des angles d’un quadrilatère vaut 360° (il se coupe en deux triangles), et les angles opposés sont égaux.', `${ang('BCD')} = ${ang('DAB')} = ${x}° et ${ang('CDA')} = ${ang('ABC')}. Comme la somme vaut 360° : 2 × ${ang('ABC')} = 360 − 2 × ${x} = ${360 - 2 * x}, donc ${ang('ABC')} = <b>${y}°</b> (et ${x} + ${y} = 180).`);
      }
      if (t === 'nature') {
        const [txt, k, why] = rng.pick(PARA_NATURE);
        return Q(`pgn:${txt}`, `${txt}<br>Quelle est la nature la plus précise de ABCD ?`, fixedChoice(NATURE_OPTS, QNAME[k]), 'Utilise les propriétés des diagonales ou des côtés des parallélogrammes particuliers.', `${why} ABCD est <b>${QNAME[k]}</b>.`);
      }
      const [txt, val, why] = rng.pick(PARA_TF);
      return Q(`pgtf:${txt}`, `Vrai ou faux ?<br><i>${txt}</i>`, TF(val), 'Pense aux propriétés caractéristiques : côtés opposés, diagonales.', `<b>${val ? 'Vrai' : 'Faux'}</b>. ${why}`);
    },
  });

  // ===================== ANGLES ET PARALLÈLES =====================
  // Two lines (d) (through E, horizontal) and (d’) (through F) cut by a secant (Δ).
  // alpha: angle between (d) and (Δ) in the "ur" corner at E; beta: same at F (beta = alpha ⇔ parallel).
  // Corners: ur (right of the line, above it), ul, dl, dr.
  const CORNERS = ['ur', 'ul', 'dl', 'dr'];
  const OPP = { ur: 'dl', dl: 'ur', ul: 'dr', dr: 'ul' };
  const cornerRange = (q, phi, tau) => ({ ur: [phi, tau], ul: [tau, phi + 180], dl: [phi + 180, tau + 180], dr: [tau + 180, phi + 360] }[q]);
  const cornerVal = (q, a) => (q === 'ur' || q === 'dl' ? a : 180 - a);
  function secFig(alpha, beta, marks) {
    const W = 330, H = 230, k = 90 / Math.sin(rad(alpha)), dx = k * Math.cos(rad(alpha));
    const E = [W / 2 + dx / 2, 80], F = [E[0] - dx, 170];
    const phi2 = alpha - beta, dT = [Math.cos(rad(alpha)), -Math.sin(rad(alpha))], d2 = [Math.cos(rad(phi2)), -Math.sin(rad(phi2))];
    const [a1, b1] = clip(E, [1, 0], W, H, 8), [a2, b2] = clip(F, d2, W, H, 8), [a3, b3] = clip(E, dT, W, H, 8);
    let b = seg(a1, b1, 's-line s-thick') + seg(a2, b2, 's-line s-thick') + seg(a3, b3);
    b += lab(b1[0] - 16, b1[1] - 9, '(d)') + lab(b2[0] - 16, b2[1] - 9, '(d’)') + lab(b3[0] + (alpha < 90 ? 18 : -18), b3[1] + 12, '(Δ)');
    b += dot(...E) + dot(...F);
    const used = { E: 0, F: 0 };
    marks.forEach(m => {
      const p = m.at === 'E' ? E : F, phi = m.at === 'E' ? 0 : phi2, [t1, t2] = cornerRange(m.q, phi, alpha);
      b += arc(p, t1, t2, used[m.at]++ ? 27 : 20);   // two arcs at the same point: different radii
      const tm = rad((t1 + t2) / 2), rr = 30 + 16 * (1 - (t2 - t1) / 180);
      b += lab(p[0] + rr * Math.cos(tm), p[1] - rr * Math.sin(tm) + 5, m.label, { size: 14 });
    });
    return svg(W, H, b);
  }
  const pickAlpha = rng => { const a = rng.int(40, 80); return rng.chance(0.5) ? a : 180 - a; };
  const PAIR_NAME = { corr: 'correspondants', alt: 'alternes-internes', opp: 'opposés par le sommet' };
  const ALT_PAIRS = [[{ at: 'E', q: 'dl' }, { at: 'F', q: 'ur' }], [{ at: 'E', q: 'dr' }, { at: 'F', q: 'ul' }]];

  M.notion('angles-paralleles', {
    lesson: {
      retenir: 'Deux droites (d) et (d’) coupées par une <b>sécante</b> (Δ) forment huit angles.<ul><li>Deux angles <b>correspondants</b> sont placés « au même endroit » à chacune des deux intersections : du même côté de la sécante, et chacun du même côté de sa droite.</li><li>Deux angles <b>alternes-internes</b> sont <b>entre</b> les deux droites (internes) et <b>de part et d’autre</b> de la sécante (alternes).</li><li>Si (d) et (d’) sont <b>parallèles</b>, alors les angles alternes-internes sont égaux et les angles correspondants sont égaux.</li><li>Réciproquement, si deux angles alternes-internes (ou correspondants) sont <b>égaux</b>, alors (d) et (d’) sont <b>parallèles</b>.</li></ul>',
      explication: `${secFig(60, 60, [{ at: 'E', q: 'ur', label: '1' }, { at: 'F', q: 'ur', label: '2' }])}<p>Les angles 1 et 2 sont <b>correspondants</b> : si on fait glisser la droite (d) le long de (Δ) jusqu’à (d’), l’angle 1 vient se poser exactement sur l’angle 2.</p>${secFig(60, 60, [{ at: 'E', q: 'dl', label: '3' }, { at: 'F', q: 'ur', label: '4' }])}<p>Les angles 3 et 4 sont <b>alternes-internes</b> : ils sont entre les deux droites, de part et d’autre de la sécante. Comme (d) // (d’), ils sont égaux.</p>`,
      methode: [
        'Repère la sécante, puis les deux points d’intersection.',
        'Pour chaque angle, regarde : de quel côté de la sécante ? au-dessus ou au-dessous de sa droite ? entre les deux droites ou à l’extérieur ?',
        'Pour calculer un angle, enchaîne les propriétés : angles opposés par le sommet (égaux), angles qui forment un angle plat (somme 180°), angles correspondants ou alternes-internes (égaux si les droites sont parallèles).',
        'Pour prouver que deux droites sont parallèles, montre que deux angles alternes-internes (ou correspondants) sont égaux.',
      ],
      exemples: [
        { q: '(d) // (d’). Un angle mesure 65°. Combien mesure l’angle qui lui est alterne-interne ?', r: 'Les droites sont parallèles : il mesure aussi <b>65°</b>.' },
        { q: 'Deux angles correspondants mesurent 72° et 74°. Les droites sont-elles parallèles ?', r: '<b>Non</b> : s’il l’étaient, ces angles seraient égaux.' },
      ],
      erreurs: [
        'Utiliser l’égalité des angles alternes-internes alors que les droites ne sont pas parallèles.',
        'Se fier au dessin : deux droites qui « ont l’air » parallèles ne le sont pas forcément. Seules les mesures permettent de conclure.',
      ],
    },
    generate(level, rng) {
      const alpha = pickAlpha(rng);
      if (level === 1) {
        const kind = rng.pick(['alt', 'corr', 'opp']);
        let m1, m2;
        if (kind === 'corr') { const q = rng.pick(CORNERS); m1 = { at: 'E', q }; m2 = { at: 'F', q }; }
        if (kind === 'alt') [m1, m2] = rng.pick(ALT_PAIRS);
        if (kind === 'opp') { const at = rng.pick(['E', 'F']), q = rng.pick(CORNERS); m1 = { at, q }; m2 = { at, q: OPP[q] }; }
        const fig = secFig(alpha, alpha, [{ ...m1, label: 'x' }, { ...m2, label: 'y' }]);
        const why = { corr: 'ils sont placés au même endroit à chacune des deux intersections', alt: 'ils sont entre les deux droites et de part et d’autre de la sécante', opp: 'ils ont le même sommet et leurs côtés sont dans le prolongement l’un de l’autre' }[kind];
        return Q(`ap1:${kind}:${m1.at}${m1.q}${m2.at}${m2.q}:${alpha}`, `${fig}Les angles x et y sont :`, fixedChoice(Object.values(PAIR_NAME), PAIR_NAME[kind]), 'Ont-ils le même sommet ? Sont-ils entre les deux droites ? Du même côté de la sécante ?', `Les angles x et y sont <b>${PAIR_NAME[kind]}</b> : ${why}.`);
      }
      if (level === 3 && rng.chance(0.5)) {
        const kind = rng.pick(['alt', 'corr']), par = rng.chance(0.5);
        const beta = par ? alpha : alpha + rng.pick([-1, 1]) * rng.int(2, 8);
        let m1, m2;
        if (kind === 'corr') { const q = rng.pick(CORNERS); m1 = { at: 'E', q }; m2 = { at: 'F', q }; } else [m1, m2] = rng.pick(ALT_PAIRS);
        const v1 = cornerVal(m1.q, alpha), v2 = cornerVal(m2.q, beta);
        const fig = secFig(alpha, beta, [{ ...m1, label: `${v1}°` }, { ...m2, label: `${v2}°` }]);
        return Q(`ap3p:${kind}:${m1.q}${m2.q}:${alpha}:${beta}`, `${fig}Les droites (d) et (d’) sont-elles parallèles ?`, YN(par), 'Comment sont placés les deux angles marqués ? Compare leurs mesures.', par ? `Les deux angles marqués sont ${PAIR_NAME[kind]} et ont la même mesure (${v1}°) : les droites (d) et (d’) sont <b>parallèles</b>. Réponse : <b>Oui</b>.` : `Les deux angles marqués sont ${PAIR_NAME[kind]}, mais ${v1}° ≠ ${v2}° : si les droites étaient parallèles, ils seraient égaux. Réponse : <b>Non</b>, (d) et (d’) ne sont pas parallèles.`);
      }
      // Compute an angle, (d) // (d’).
      let g, a, rel;
      if (level === 2) {
        rel = rng.pick(['corr', 'alt', 'opp', 'adj']);
        if (rel === 'corr') { const q = rng.pick(CORNERS); [g, a] = rng.shuffle([{ at: 'E', q }, { at: 'F', q }]); }
        if (rel === 'alt') [g, a] = rng.shuffle(rng.pick(ALT_PAIRS));
        if (rel === 'opp') { const at = rng.pick(['E', 'F']), q = rng.pick(CORNERS); g = { at, q }; a = { at, q: OPP[q] }; }
        if (rel === 'adj') { const at = rng.pick(['E', 'F']), i = rng.int(0, 3); g = { at, q: CORNERS[i] }; a = { at, q: CORNERS[(i + rng.pick([1, 3])) % 4] }; }
      } else {
        const at = rng.pick(['E', 'F']);
        g = { at, q: rng.pick(CORNERS) }; a = { at: at === 'E' ? 'F' : 'E', q: rng.pick(CORNERS) };
        rel = 'two';
      }
      const gv = cornerVal(g.q, alpha), av = cornerVal(a.q, alpha);
      const fig = secFig(alpha, alpha, [{ ...g, label: `${gv}°` }, { ...a, label: '?' }]);
      let corr;
      if (rel === 'corr' || rel === 'alt') corr = `Les droites sont parallèles et ces deux angles sont ${PAIR_NAME[rel]}, donc ils ont la même mesure : <b>${av}°</b>.`;
      else if (rel === 'opp') corr = `Ces deux angles sont opposés par le sommet, donc ils ont la même mesure : <b>${av}°</b>.`;
      else if (rel === 'adj') corr = `Ces deux angles forment ensemble un angle plat : ? = 180° − ${gv}° = <b>${av}°</b>.`;
      else if (g.q === a.q) corr = `Les droites sont parallèles et ces deux angles sont correspondants, donc ils ont la même mesure : <b>${av}°</b>.`;
      else {
        const step = OPP[g.q] === a.q ? `il est opposé par le sommet à l’angle de ${gv}°, donc il mesure aussi ${gv}°` : `il forme un angle plat avec l’angle de ${gv}°, donc il mesure 180° − ${gv}° = ${av}°`;
        corr = `À l’intersection où se trouve l’angle de ${gv}°, regarde l’angle placé au même endroit que « ? » : ${step}. Or il est correspondant à « ? », et les droites sont parallèles, donc « ? » mesure <b>${av}°</b>.`;
      }
      return Q(`ap:${level}:${g.at}${g.q}:${a.at}${a.q}:${alpha}`, `${fig}Les droites (d) et (d’) sont parallèles. Quelle est la mesure de l’angle marqué « ? » ?`, num(av, '°'), level === 2 ? 'Comment les deux angles sont-ils placés l’un par rapport à l’autre ?' : 'Passe par un angle intermédiaire : opposé par le sommet, angle plat, correspondant…', corr);
    },
  });

  // ===================== HAUTEURS ET MÉDIANES =====================
  const SHOWN = { hauteur: 'la hauteur issue de A', mediane: 'la médiane issue de A', mediatrice: 'la médiatrice de [BC]' };
  function triFig({ ax, ay, show, deg = 0 }) {
    const W = 320, Hh = 235, c = [160, 115], R = p => rot(p, deg, c);
    const B = R([50, 170]), C = R([270, 170]), A = R([ax, ay]), H = R([ax, 170]), I = R([160, 170]);
    const down = unit(vsub(R([0, 1]), R([0, 0]))), g = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3];
    let b = poly([A, B, C], 's-soft s-line');
    if (show === 'hauteur') b += seg(A, H, 's-accent-line') + rightMark(H, A, C) + lab(H[0] + down[0] * 18, H[1] + down[1] * 18 + 5, 'H');
    if (show === 'mediane' || show === 'aire') b += seg(A, I, 's-accent-line') + ticks(B, I, 1) + ticks(I, C, 1) + lab(I[0] + down[0] * 18, I[1] + down[1] * 18 + 5, 'I');
    if (show === 'mediatrice') {
      const [p, q] = clip(I, [-down[0], -down[1]], W, Hh, 6);
      b += seg(p, q, 's-accent-line') + rightMark(I, along(I, down, -10), C) + ticks(B, I, 1) + ticks(I, C, 1) + lab(I[0] + down[0] * 18 + 10, I[1] + down[1] * 18 + 5, 'I');
    }
    b += labOut(A, g, 'A') + labOut(B, g, 'B') + labOut(C, g, 'C');
    return svg(W, Hh, b);
  }
  const randTri = rng => ({ ax: rng.chance(0.5) ? rng.int(70, 120) : rng.int(200, 250), ay: rng.int(35, 60) });
  const HM_TF = [
    ['Dans un triangle ABC isocèle en A, la hauteur issue de A est aussi la médiane issue de A.', true, 'Par symétrie, son pied est le milieu de [BC].'],
    ['Dans un triangle ABC isocèle en A, la hauteur issue de A est portée par la médiatrice de [BC].', true, 'Elle est perpendiculaire à (BC) et passe par le milieu de [BC].'],
    ['Dans n’importe quel triangle ABC, la hauteur issue de A passe par le milieu de [BC].', false, 'C’est la médiane qui passe par le milieu ; la hauteur, elle, est perpendiculaire à (BC).'],
    ['Dans un triangle équilatéral, chaque hauteur est aussi une médiane.', true, 'Un triangle équilatéral est isocèle de trois façons.'],
    ['Le centre du cercle circonscrit à un triangle rectangle est le milieu de son hypoténuse.', true, 'C’est une propriété du triangle rectangle.'],
    ['Le centre du cercle circonscrit à un triangle est le point de concours de ses hauteurs.', false, 'C’est le point de concours des médiatrices des côtés.'],
    ['Une médiane partage un triangle en deux triangles de même aire.', true, 'Les deux triangles ont des bases égales et la même hauteur.'],
    ['Une médiane partage toujours un triangle en deux triangles superposables.', false, 'Ils ont la même aire, mais pas forcément la même forme.'],
    ['Dans un triangle qui a un angle obtus, deux des hauteurs tombent à l’extérieur du triangle.', true, 'On doit prolonger les côtés pour les tracer.'],
    ['Les trois hauteurs d’un triangle sont concourantes.', true, 'Elles se coupent en un même point.'],
  ];

  M.notion('hauteurs-medianes', {
    lesson: {
      retenir: '<ul><li>La <b>hauteur</b> issue de A est la droite qui passe par A et qui est <b>perpendiculaire</b> au côté opposé (BC). Elle coupe (BC) en H, le <b>pied</b> de la hauteur ; on appelle aussi hauteur le segment [AH] et sa longueur. Les trois hauteurs d’un triangle sont <b>concourantes</b> : elles se coupent en un même point.</li><li>La <b>médiane</b> issue de A est le segment qui joint A au <b>milieu</b> I du côté opposé [BC]. Elle partage le triangle en <b>deux triangles de même aire</b>.</li><li>Les trois <b>médiatrices</b> des côtés se coupent au centre du <b>cercle circonscrit</b> (le cercle qui passe par les trois sommets).</li><li>Triangles particuliers : si ABC est <b>isocèle</b> en A, la hauteur issue de A est aussi la médiane issue de A, et elle est portée par la médiatrice de [BC]. Si ABC est <b>rectangle</b>, le centre de son cercle circonscrit est le <b>milieu de l’hypoténuse</b>.</li></ul>',
      explication: `${triFig({ ax: 100, ay: 45, show: 'hauteur' })}<p class="center">[AH] : hauteur issue de A (angle droit en H)</p>${triFig({ ax: 100, ay: 45, show: 'mediane' })}<p class="center">[AI] : médiane issue de A (I milieu de [BC])</p><p>Les triangles ABI et AIC ont des bases égales (BI = IC) et la même hauteur [AH] : ils ont donc <b>la même aire</b>.</p>`,
      methode: [
        'Pour tracer la hauteur issue de A : place l’équerre le long de (BC), fais-la glisser jusqu’à A, trace. Si besoin, prolonge (BC).',
        'Pour tracer la médiane issue de A : place le milieu I de [BC] (règle graduée), puis trace [AI].',
        'Ne confonds pas : la hauteur passe par un sommet (angle droit) ; la médiatrice passe par un milieu (angle droit) ; la médiane passe par un sommet et un milieu.',
      ],
      exemples: [
        { q: 'I est le milieu de [BC] et l’aire du triangle ABC vaut 30 cm². Quelle est l’aire de ABI ?', r: '[AI] est une médiane : aire de ABI = 30 ÷ 2 = <b>15 cm²</b>.' },
        { q: 'ABC est rectangle en A et BC = 8 cm. Rayon du cercle circonscrit ?', r: 'Son centre est le milieu de [BC] : rayon = 8 ÷ 2 = <b>4 cm</b>.' },
      ],
      erreurs: [
        'Tracer la hauteur jusqu’au milieu du côté : c’est la médiane qui va au milieu, la hauteur fait un angle droit.',
        'Oublier qu’une hauteur peut être à l’extérieur du triangle quand il a un angle obtus.',
      ],
    },
    generate(level, rng) {
      const t = level === 1 ? rng.pick(['fig', 'fig', 'def'])
        : level === 2 ? rng.pick(['fig', 'mil', 'airemed', 'aireh', 'concours'])
          : rng.pick(['rectcirc', 'tf', 'tf', 'airemed2', 'centre']);
      if (t === 'fig') {
        const show = rng.pick(Object.keys(SHOWN)), tr = randTri(rng), deg = level === 1 ? 0 : rng.int(-25, 25);
        const why = { hauteur: 'elle passe par A et elle est perpendiculaire à (BC) (angle droit), mais elle ne passe pas par le milieu de [BC]', mediane: 'elle joint le sommet A au milieu I de [BC] (codage des longueurs égales)', mediatrice: 'elle passe par le milieu de [BC] et lui est perpendiculaire, mais elle ne passe pas par A' }[show];
        return Q(`hm:${show}:${tr.ax}:${tr.ay}:${deg}`, `${triFig({ ...tr, show, deg })}La ligne rouge est, pour le triangle ABC :`, fixedChoice(Object.values(SHOWN), SHOWN[show]), 'Regarde le codage : angle droit ? milieu ? passe-t-elle par un sommet ?', `C’est <b>${SHOWN[show]}</b> : ${why}.`);
      }
      if (t === 'def') {
        if (rng.chance(0.5)) {
          const good = 'au milieu du côté opposé';
          return Q('hm1dm', 'La médiane issue d’un sommet d’un triangle est le segment qui joint ce sommet…', choice(rng, good, ['au pied de la perpendiculaire au côté opposé', 'à un point quelconque du côté opposé', 'au centre du cercle circonscrit']), 'Le mot « médiane » ressemble au mot « milieu »… ou au mot « médiatrice ».', `La médiane joint un sommet <b>${good}</b>.`);
        }
        const good = 'passe par ce sommet et est perpendiculaire au côté opposé';
        return Q('hm1dh', 'La hauteur issue d’un sommet d’un triangle est la droite qui…', choice(rng, good, ['passe par ce sommet et par le milieu du côté opposé', 'est perpendiculaire au côté opposé en son milieu', 'est parallèle au côté opposé']), 'Pense à la hauteur d’un mur : elle est « bien droite » par rapport au sol.', `La hauteur <b>${good}</b>.`);
      }
      if (t === 'mil') {
        const bc = dec(rng.int(20, 150), 1), bi = div(bc, 2);
        return Q(`hm2m:${bc}`, `Dans le triangle ABC, [AI] est la médiane issue de A et BC = ${fmt(bc)} cm. Combien mesure BI ?`, num(bi, 'cm'), 'Où se trouve le point I sur [BC] ?', `I est le milieu de [BC] : BI = ${fmt(bc)} ÷ 2 = <b>${fmt(bi)} cm</b>.`);
      }
      if (t === 'airemed') {
        const A = rng.chance(0.5) ? rng.int(5, 60) * 2 : dec(rng.int(21, 199), 1), half = div(A, 2), tr = randTri(rng);
        return Q(`hm2a:${A}`, `${triFig({ ...tr, show: 'aire' })}L’aire du triangle ABC vaut ${fmt(A)} cm² et I est le milieu de [BC]. Quelle est l’aire du triangle ABI ?`, num(half, 'cm²'), 'Que fait la médiane [AI] au triangle ?', `[AI] est une médiane : elle partage ABC en deux triangles de même aire. Aire de ABI = ${fmt(A)} ÷ 2 = <b>${fmt(half)} cm²</b>.`);
      }
      if (t === 'aireh') {
        const b = rng.int(4, 20), h = rng.int(2, 12), A = div(b * h, 2), tr = randTri(rng);
        return Q(`hm2h:${b}x${h}`, `${triFig({ ...tr, show: 'hauteur' })}[AH] est la hauteur issue de A, BC = ${b} cm et AH = ${h} cm. Quelle est l’aire du triangle ABC ?`, num(A, 'cm²'), 'Aire du triangle = base × hauteur ÷ 2 : quelle base va avec la hauteur [AH] ?', `A = BC × AH ÷ 2 = ${b} × ${h} ÷ 2 = <b>${fmt(A)} cm²</b>.`);
      }
      if (t === 'concours') {
        const good = 'sont concourantes (elles se coupent en un même point)';
        return Q('hm2c', 'Les trois hauteurs d’un triangle…', choice(rng, good, ['sont parallèles', 'ont toujours la même longueur', 'passent par les milieux des côtés']), 'Trace les trois hauteurs d’un triangle à main levée.', `Les trois hauteurs d’un triangle <b>${good}</b>.`);
      }
      if (t === 'rectcirc') {
        const bc = dec(rng.int(30, 200), 1), r = div(bc, 2);
        return Q(`hm3r:${bc}`, `ABC est un triangle rectangle en A, avec BC = ${fmt(bc)} cm. Quel est le rayon de son cercle circonscrit ?`, num(r, 'cm'), 'Où se trouve le centre du cercle circonscrit à un triangle rectangle ?', `Le centre du cercle circonscrit est le milieu de l’hypoténuse [BC] : [BC] est un diamètre, donc le rayon vaut ${fmt(bc)} ÷ 2 = <b>${fmt(r)} cm</b>.`);
      }
      if (t === 'airemed2') {
        const b = rng.int(4, 20), h = rng.int(2, 12), A = div(b * h, 2), half = div(A, 2), tr = randTri(rng);
        return Q(`hm3a:${b}x${h}`, `${triFig({ ...tr, show: 'mediane' })}Dans le triangle ABC, BC = ${b} cm, la hauteur issue de A mesure ${h} cm et I est le milieu de [BC]. Quelle est l’aire du triangle ABI ?`, num(half, 'cm²'), 'Calcule d’abord l’aire de ABC, puis utilise la médiane [AI].', `Aire de ABC = ${b} × ${h} ÷ 2 = ${fmt(A)} cm². La médiane [AI] le partage en deux triangles de même aire : aire de ABI = ${fmt(A)} ÷ 2 = <b>${fmt(half)} cm²</b>.`);
      }
      if (t === 'centre') {
        const good = 'de ses trois médiatrices';
        return Q('hm3c', 'Le centre du cercle circonscrit à un triangle est le point de concours…', choice(rng, good, ['de ses trois hauteurs', 'de ses trois médianes', 'de ses trois côtés']), 'Le centre est à la même distance des trois sommets.', `C’est le point de concours <b>${good}</b> : il est à égale distance des trois sommets.`);
      }
      const [txt, val, why] = rng.pick(HM_TF);
      return Q(`hm3tf:${txt}`, `Vrai ou faux ?<br><i>${txt}</i>`, TF(val), 'Distingue bien hauteur (angle droit), médiane (milieu) et médiatrice (milieu et angle droit).', `<b>${val ? 'Vrai' : 'Faux'}</b>. ${why}`);
    },
  });

  // ===================== SYMÉTRIE CENTRALE =====================
  // pts: [{x, y, label, cls}] in grid units; centre: {p:[x,y], label} drawn as a cross.
  function gridFig({ cols = 12, rows = 10, cell = 30, pts = [], centre, segs = [] }) {
    const P = (x, y) => [10 + x * cell, 10 + y * cell];
    let b = '';
    for (let i = 0; i <= cols; i++) b += line(...P(i, 0), ...P(i, rows), 's-grid');
    for (let j = 0; j <= rows; j++) b += line(...P(0, j), ...P(cols, j), 's-grid');
    segs.forEach(([x1, y1, x2, y2, cls]) => { b += line(...P(x1, y1), ...P(x2, y2), cls || 's-line s-dash'); });
    if (centre) {
      const [x, y] = P(...centre.p);
      b += line(x - 6, y - 6, x + 6, y + 6, 's-line s-thick') + line(x - 6, y + 6, x + 6, y - 6, 's-line s-thick');
      b += text(x + 9, y - 8, centre.label, { anchor: 'start', cls: 's-text s-bold' });
    }
    pts.forEach(p => {
      const [x, y] = P(p.x, p.y);
      b += `<circle cx="${x}" cy="${y}" r="5" class="${p.cls || 's-accent'}"/>`;
      if (p.label) b += text(x + 9, y - 8, p.label, { anchor: 'start', cls: 's-text s-bold' });
    });
    return svg(cols * cell + 20, rows * cell + 20, b, 'grid');
  }
  const sgn = v => (v > 0 ? 1 : -1);
  const SC_PROPS = [
    ['Par une symétrie centrale, l’image d’une droite est…', 'une droite parallèle', ['une droite perpendiculaire', 'un segment', 'la même droite, toujours']],
    ['Par une symétrie centrale, l’image d’un segment est…', 'un segment de même longueur', ['un segment deux fois plus long', 'un segment deux fois plus court', 'une droite']],
    ['Le symétrique du point O par rapport à O est…', 'le point O lui-même', ['il n’existe pas', 'un point quelconque', 'le milieu de [OA]']],
    ['Par une symétrie centrale, l’image d’un angle de 50° est…', 'un angle de 50°', ['un angle de 130°', 'un angle de 100°', 'un angle de 310°']],
    ['Par une symétrie centrale, trois points alignés ont pour images…', 'trois points alignés', ['trois points qui forment un triangle', 'un seul point', 'trois points sur un cercle']],
  ];

  M.notion('symetrie-centrale', {
    lesson: {
      retenir: 'Le symétrique d’un point M par rapport à un point O est le point M’ tel que <b>O est le milieu de [MM’]</b>. Cette transformation s’appelle la <b>symétrie centrale</b> de centre O : c’est un <b>demi-tour</b> autour du point O. Le symétrique de O est O lui-même.<ul><li>Elle <b>conserve</b> les longueurs, les angles, l’alignement et les aires.</li><li>L’image d’une droite est une droite qui lui est <b>parallèle</b>.</li></ul>',
      explication: `${gridFig({ cols: 10, rows: 6, centre: { p: [5, 3], label: 'O' }, segs: [[2, 1, 8, 5]], pts: [{ x: 2, y: 1, label: 'M' }, { x: 8, y: 5, label: 'M’', cls: 's-dot' }] })}<p>Pour aller de M à O : 3 carreaux vers la droite et 2 vers le bas. On recommence <b>la même chose</b> à partir de O : 3 vers la droite, 2 vers le bas. On arrive en M’ : O est bien le milieu de [MM’].</p>`,
      methode: [
        'Sur quadrillage : compte le déplacement pour aller du point M au centre O (carreaux horizontaux et verticaux), puis refais exactement le même déplacement à partir de O.',
        'Sur feuille blanche : trace la demi-droite [MO), puis reporte au compas la longueur OM de l’autre côté de O.',
        'Pour une figure : construis le symétrique de chaque sommet, puis relie-les dans le même ordre.',
      ],
      exemples: [
        { q: 'A’ est le symétrique de A par rapport à O et OA = 3,5 cm. Combien mesure AA’ ?', r: 'O est le milieu de [AA’] : AA’ = 2 × 3,5 = <b>7 cm</b>.' },
        { q: '[A’B’] est le symétrique de [AB] par rapport à O et AB = 5 cm. A’B’ ?', r: 'La symétrie centrale conserve les longueurs : A’B’ = <b>5 cm</b>.' },
      ],
      erreurs: [
        'Confondre avec la symétrie axiale : ici, on tourne d’un demi-tour autour d’un point, on ne plie pas le long d’une droite.',
        'Reporter le déplacement dans le mauvais sens ou s’arrêter au point O.',
      ],
    },
    generate(level, rng) {
      const cols = 12, rows = 10;
      const inside = p => p[0] >= 0 && p[0] <= cols && p[1] >= 1 && p[1] <= rows;   // row 0 would push the label out
      const key = p => p.join(',');
      if (level === 3) {
        const t = rng.pick(['centre', 'centre', 'num', 'prop']);
        if (t === 'centre') {
          let A, A2, O, wrongs;
          for (;;) {
            const dx = rng.int(-3, 3), dy = rng.int(-3, 3);
            if (Math.abs(dx) + Math.abs(dy) < 2) continue;
            A = [rng.int(0, cols), rng.int(0, rows)]; O = [A[0] + dx, A[1] + dy]; A2 = [A[0] + 2 * dx, A[1] + 2 * dy];
            wrongs = rng.sample([[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]], 3).map(([u, v]) => [O[0] + u, O[1] + v]);
            const all = [O, ...wrongs];
            if ([A, A2, ...all].every(inside) && new Set([A, A2, ...all].map(key)).size === 6) break;
          }
          const letters = ['B', 'C', 'D', 'E'], pts = rng.shuffle([O, ...wrongs]), good = letters[pts.indexOf(O)];
          const fig = gridFig({ cols, rows, pts: [{ x: A[0], y: A[1], label: 'A' }, { x: A2[0], y: A2[1], label: 'A’' }, ...pts.map((p, i) => ({ x: p[0], y: p[1], label: letters[i], cls: 's-dot' }))] });
          return Q(`sc3c:${A}:${A2}:${pts.join('|')}`, `${fig}A’ est le symétrique de A par une symétrie centrale. Quel point est le centre de cette symétrie ?`, fixedChoice(letters, good), 'Le centre est un point bien particulier du segment [AA’].', `Le centre de symétrie est le milieu de [AA’] : c’est le point <b>${good}</b>.`);
        }
        if (t === 'num') {
          const v = rng.int(0, 3), x = dec(rng.int(15, 90), 1);
          if (v === 0) return Q(`sc3n0:${x}`, `A’ est le symétrique de A par rapport à O et OA = ${fmt(x)} cm. Combien mesure AA’ ?`, num(mul(2, x), 'cm'), 'Où se trouve O sur le segment [AA’] ?', `O est le milieu de [AA’] : AA’ = 2 × ${fmt(x)} = <b>${fmt(mul(2, x))} cm</b>.`);
          if (v === 1) { const d = mul(2, x); return Q(`sc3n1:${d}`, `A’ est le symétrique de A par rapport à O et AA’ = ${fmt(d)} cm. Combien mesure OA’ ?`, num(x, 'cm'), 'Où se trouve O sur le segment [AA’] ?', `O est le milieu de [AA’] : OA’ = ${fmt(d)} ÷ 2 = <b>${fmt(x)} cm</b>.`); }
          if (v === 2) return Q(`sc3n2:${x}`, `[A’B’] est le symétrique du segment [AB] par rapport au point O, et AB = ${fmt(x)} cm. Combien mesure A’B’ ?`, num(x, 'cm'), 'Que conserve une symétrie centrale ?', `La symétrie centrale conserve les longueurs : A’B’ = AB = <b>${fmt(x)} cm</b>.`);
          const a = rng.int(20, 160);
          return Q(`sc3n3:${a}`, `Le triangle A’B’C’ est le symétrique du triangle ABC par rapport au point O, et l’angle ${ang('ABC')} mesure ${a}°. Combien mesure l’angle ${ang('A’B’C’')} ?`, num(a, '°'), 'Que conserve une symétrie centrale ?', `La symétrie centrale conserve les angles : ${ang('A’B’C’')} = ${ang('ABC')} = <b>${a}°</b>.`);
        }
        const [txt, good, bads] = rng.pick(SC_PROPS);
        return Q(`sc3p:${txt}`, txt, choice(rng, good, bads), 'Une symétrie centrale est un demi-tour : la figure tourne sans se déformer.', `Réponse : <b>${good}</b>.`);
      }
      let A, O, sym, wrongs;
      for (;;) {
        O = [rng.int(2, cols - 2), rng.int(2, rows - 2)];
        if (level === 1) {
          const d = rng.pick([-1, 1]) * rng.int(1, 4), horiz = rng.chance(0.5), e = rng.pick([-2, 2]);
          const P = (u, v) => (horiz ? [O[0] + u, O[1] + v] : [O[0] + v, O[1] + u]);
          A = P(-d, 0); sym = P(d, 0);
          wrongs = [P(d + sgn(d), 0), P(d, e), P(0, d)];
        } else {
          const dx = rng.pick([-1, 1]) * rng.int(1, 4), dy = rng.pick([-1, 1]) * rng.int(1, 4);
          A = [O[0] - dx, O[1] - dy]; sym = [O[0] + dx, O[1] + dy];
          wrongs = rng.sample([[O[0] + dx, O[1] - dy], [O[0] - dx, O[1] + dy], [O[0] - dy, O[1] + dx], [O[0] + dy, O[1] - dx], [sym[0] + sgn(dx), sym[1]], [sym[0], sym[1] + sgn(dy)]], 3);
        }
        const all = [sym, ...wrongs];
        if ([A, ...all].every(inside) && new Set([A, O, ...all].map(key)).size === 6) break;
      }
      const letters = ['B', 'C', 'D', 'E'], pts = rng.shuffle([sym, ...wrongs]), good = letters[pts.indexOf(sym)];
      const fig = gridFig({ cols, rows, centre: { p: O, label: 'O' }, pts: [{ x: A[0], y: A[1], label: 'A' }, ...pts.map((p, i) => ({ x: p[0], y: p[1], label: letters[i], cls: 's-dot' }))] });
      const mv = [O[0] - A[0], O[1] - A[1]];
      const dir = [mv[0] ? `${Math.abs(mv[0])} carreau${Math.abs(mv[0]) > 1 ? 'x' : ''} vers la ${mv[0] > 0 ? 'droite' : 'gauche'}` : '', mv[1] ? `${Math.abs(mv[1])} carreau${Math.abs(mv[1]) > 1 ? 'x' : ''} vers le ${mv[1] > 0 ? 'bas' : 'haut'}` : ''].filter(Boolean).join(' et ');
      return Q(`sc:${level}:${O}:${A}:${pts.join('|')}`, `${fig}Quel point est le symétrique de A par rapport au point O ?`, fixedChoice(letters, good), 'Le centre O doit être le milieu du segment qui joint A à son symétrique.', `De A à O : ${dir}. On refait le même déplacement à partir de O et on arrive au point <b>${good}</b> : O est le milieu de [A${good}].`);
    },
  });

  // ===================== REPÈRE =====================
  // Points in real coordinates; sx, sy: value of one graduation on each axis.
  function repFig({ xmin = -6, xmax = 6, ymin = -5, ymax = 5, sx = 1, sy = 1, pts = [] }) {
    const cell = 28, W = (xmax - xmin) * cell + 40, H = (ymax - ymin) * cell + 40;
    const X = gx => 20 + (gx - xmin) * cell, Y = gy => 20 + (ymax - gy) * cell;
    let b = '';
    for (let i = xmin; i <= xmax; i++) b += line(X(i), Y(ymin), X(i), Y(ymax), 's-grid');
    for (let j = ymin; j <= ymax; j++) b += line(X(xmin), Y(j), X(xmax), Y(j), 's-grid');
    b += line(X(xmin) - 8, Y(0), X(xmax) + 8, Y(0), 's-line') + `<polygon points="${X(xmax) + 8},${Y(0) - 5} ${X(xmax) + 16},${Y(0)} ${X(xmax) + 8},${Y(0) + 5}" class="s-solid"/>`;
    b += line(X(0), Y(ymin) + 8, X(0), Y(ymax) - 8, 's-line') + `<polygon points="${X(0) - 5},${Y(ymax) - 8} ${X(0)},${Y(ymax) - 16} ${X(0) + 5},${Y(ymax) - 8}" class="s-solid"/>`;
    for (let i = xmin; i <= xmax; i++) if (i) b += line(X(i), Y(0) - 4, X(i), Y(0) + 4, 's-line') + text(X(i), Y(0) + 17, fmt(i * sx), { size: 11 });
    for (let j = ymin; j <= ymax; j++) if (j) b += line(X(0) - 4, Y(j), X(0) + 4, Y(j), 's-line') + text(X(0) - 7, Y(j) + 4, fmt(j * sy), { size: 11, anchor: 'end' });
    b += text(X(0) - 7, Y(0) + 17, 'O', { size: 12, anchor: 'end', cls: 's-text s-bold' });
    pts.forEach(p => {
      const x = X(p.x / sx), y = Y(p.y / sy);
      b += `<circle cx="${x}" cy="${y}" r="5" class="${p.cls || 's-accent'}"/>` + text(x + 8, p.y < 0 ? y + 18 : y - 8, p.label, { anchor: 'start', cls: 's-text s-bold' });
    });
    return svg(W, H, b);
  }
  const nz = (rng, a, b) => rng.pick([-1, 1]) * rng.int(a, b);

  M.notion('repere', {
    lesson: {
      retenir: 'Un <b>repère orthogonal</b> est formé de deux axes gradués perpendiculaires qui se coupent en l’<b>origine</b> O. Un point est repéré par ses <b>coordonnées</b> (x ; y) :<ul><li>l’<b>abscisse</b> x se lit sur l’axe horizontal (axe des abscisses) ;</li><li>l’<b>ordonnée</b> y se lit sur l’axe vertical (axe des ordonnées).</li></ul>On écrit toujours l’abscisse <b>en premier</b> : A(3 ; −2). À gauche de O, l’abscisse est négative ; en dessous de O, l’ordonnée est négative.',
      explication: `${repFig({ xmin: -4, xmax: 4, ymin: -3, ymax: 3, pts: [{ x: 3, y: -2, label: 'A' }, { x: -2, y: 1, label: 'B' }] })}<p>Pour A : depuis O, on avance de <b>3</b> vers la droite, puis on descend de <b>2</b> : A(3 ; −2). Pour B : 2 vers la gauche, puis 1 vers le haut : B(−2 ; 1).</p>`,
      methode: [
        'Pour lire les coordonnées d’un point : descends (ou monte) verticalement jusqu’à l’axe horizontal pour lire l’abscisse, puis va horizontalement jusqu’à l’axe vertical pour lire l’ordonnée.',
        'Pour placer le point (x ; y) : pars de O, avance de x horizontalement (vers la gauche si x est négatif), puis de y verticalement (vers le bas si y est négatif).',
        'Vérifie la graduation de chaque axe : un carreau ne vaut pas toujours 1, et les deux axes peuvent avoir des graduations différentes.',
      ],
      exemples: [
        { q: 'Le point M est à 4 carreaux à gauche de O, sur l’axe horizontal (graduation 1).', r: 'M(−4 ; 0).' },
        { q: 'Où placer N(0 ; 3) ?', r: 'Sur l’axe vertical, 3 graduations au-dessus de O.' },
      ],
      astuces: ['Pour retenir l’ordre : « on entre dans l’immeuble (abscisse) avant de prendre l’ascenseur (ordonnée) ».'],
      erreurs: ['Inverser abscisse et ordonnée : (2 ; 5) et (5 ; 2) ne sont pas le même point.', 'Oublier le signe « − » pour un point situé à gauche ou en dessous de O.'],
    },
    generate(level, rng) {
      if (level === 1) {
        let x, y;
        do { x = rng.int(1, 6); y = rng.int(1, 5); } while (x === y);
        const L = rng.pick(['A', 'B', 'M', 'P']);
        const fig = repFig({ pts: [{ x, y, label: L }] });
        return Q(`rp1:${x}:${y}`, `${fig}Quelles sont les coordonnées du point ${L} ?`, choice(rng, co(x, y), [co(y, x), co(x + 1, y), co(x, y - 1)]), 'D’abord l’abscisse (axe horizontal), ensuite l’ordonnée (axe vertical).', `${L} est à ${x} unité${x > 1 ? 's' : ''} vers la droite et ${y} vers le haut : ${L}<b>${co(x, y)}</b>.`);
      }
      if (level === 2) {
        let x, y;
        do { x = nz(rng, 1, 6); y = nz(rng, 1, 5); } while (Math.abs(x) === Math.abs(y) || (x > 0 && y > 0));
        const L = rng.pick(['A', 'B', 'M', 'P', 'R']);
        const fig = repFig({ pts: [{ x, y, label: L }] });
        const reading = `${L} est à ${Math.abs(x)} unité${Math.abs(x) > 1 ? 's' : ''} vers la ${x > 0 ? 'droite' : 'gauche'} et ${Math.abs(y)} vers le ${y > 0 ? 'haut' : 'bas'}`;
        if (rng.chance(0.35)) {
          const ab = rng.chance(0.5), v = ab ? x : y;
          return Q(`rp2n:${x}:${y}:${ab}`, `${fig}Quelle est l’${ab ? 'abscisse' : 'ordonnée'} du point ${L} ?`, num(v), ab ? 'L’abscisse se lit sur l’axe horizontal.' : 'L’ordonnée se lit sur l’axe vertical.', `${reading} : ${L}${co(x, y)}, donc son ${ab ? 'abscisse' : 'ordonnée'} est <b>${fmt(v)}</b>.`);
        }
        return Q(`rp2:${x}:${y}`, `${fig}Quelles sont les coordonnées du point ${L} ?`, choice(rng, co(x, y), rng.sample([co(y, x), co(-x, y), co(x, -y), co(-x, -y)], 3)), 'Attention aux signes : à gauche de O ou en dessous de O, c’est négatif.', `${reading} : ${L}<b>${co(x, y)}</b>.`);
      }
      const t = rng.pick(['place', 'place', 'axe', 'echelle']);
      const letters = ['A', 'B', 'C', 'D'];
      if (t === 'place' || t === 'axe') {
        let target, cands;
        if (t === 'place') {
          let x, y;
          do { x = nz(rng, 1, 5); y = nz(rng, 1, 5); } while (Math.abs(x) === Math.abs(y));
          target = [x, y]; cands = [target, ...rng.sample([[y, x], [-x, y], [x, -y], [-x, -y]], 3)];
        } else {
          const v = nz(rng, 1, 5), onY = rng.chance(0.5);
          target = onY ? [0, v] : [v, 0]; cands = [target, onY ? [v, 0] : [0, v], onY ? [0, -v] : [-v, 0], onY ? [-v, 0] : [0, -v]];
        }
        const pts = rng.shuffle(cands), good = letters[pts.indexOf(target)];
        const fig = repFig({ pts: pts.map((p, i) => ({ x: p[0], y: p[1], label: letters[i] })) });
        return Q(`rp3:${t}:${pts.join('|')}`, `${fig}Quel point a pour coordonnées ${co(...target)} ?`, fixedChoice(letters, good), 'Pars de O : d’abord le déplacement horizontal (abscisse), puis le vertical (ordonnée).', `${co(...target)} : abscisse ${fmt(target[0])}, ordonnée ${fmt(target[1])}. C’est le point <b>${good}</b>.`);
      }
      const big = rng.chance(0.5) ? 'x' : 'y', sx = big === 'x' ? 2 : 1, sy = big === 'y' ? 2 : 1;
      let gx, gy;
      do { gx = nz(rng, 1, 6); gy = nz(rng, 1, 5); } while (Math.abs(gx * sx) === Math.abs(gy * sy));
      const x = gx * sx, y = gy * sy, L = rng.pick(['A', 'B', 'M', 'P']);
      const fig = repFig({ sx, sy, pts: [{ x, y, label: L }] });
      return Q(`rp3e:${sx}:${x}:${y}`, `${fig}Quelles sont les coordonnées du point ${L} ? (attention aux graduations)`, choice(rng, co(x, y), [co(gx, gy), co(y, x), co(-x, y), co(x, -y)]), 'Sur l’un des axes, une graduation ne vaut pas 1 : regarde les nombres écrits.', `Sur l’axe ${big === 'x' ? 'horizontal' : 'vertical'}, une graduation vaut 2. ${L} est à ${Math.abs(gx)} graduation${Math.abs(gx) > 1 ? 's' : ''} ${gx > 0 ? 'à droite' : 'à gauche'} et ${Math.abs(gy)} graduation${Math.abs(gy) > 1 ? 's' : ''} ${gy > 0 ? 'au-dessus' : 'au-dessous'} de O : ${L}<b>${co(x, y)}</b>.`);
    },
  });

  // ===================== EXPLICATIONS =====================
  const B = M.cat.BASE, E = M.explain;
  E('aires-5e', [
    ['dessin', B],
    ['vie', '<p>Pour vernir une table ronde de <b>50 cm de rayon</b>, il faut connaître sa surface : 3,14 × 50 × 50 = <b>7 850 cm²</b>, soit 0,785 m². Si un pot de vernis couvre 2 m², il en reste largement ! Les aires servent dès qu’on peint, carrelle, sème ou découpe du tissu.</p>'],
    ['etapes', '<p>Aire d’une figure complexe (un rectangle surmonté d’un triangle) :</p><ol><li>Je découpe la figure en morceaux simples : un rectangle et un triangle.</li><li>Rectangle de 8 cm sur 5 cm : 8 × 5 = 40 cm².</li><li>Triangle de base 8 cm et de hauteur 3 cm : 8 × 3 ÷ 2 = 12 cm².</li><li>J’additionne : 40 + 12 = <b>52 cm²</b>.</li></ol>'],
  ]);
  E('volumes-5e', [
    ['dessin', B],
    ['vie', `${cylFig('r = 3 cm', 'h = 10 cm')}<p>Une canette est un cylindre. Avec un rayon de 3 cm et une hauteur de 10 cm : V ≈ 3,14 × 3 × 3 × 10 = 282,6 cm³, soit environ <b>28 cL</b> (1 cL = 10 cm³). C’est à peu près ce qu’on lit sur l’étiquette (une canette contient en général 33 cL).</p>`],
    ['lien', '<p>Tu connais déjà le pavé droit : V = L × l × h. Or L × l, c’est l’<b>aire de sa base</b> (le fond rectangulaire). Donc V = aire de la base × hauteur. Cette formule marche pour <b>tous</b> les prismes droits et pour le cylindre : il suffit de changer la forme de la base (triangle, disque…).</p>'],
  ]);
  E('parallelogrammes', [
    ['dessin', B],
    ['etapes', '<p>Pour trouver la nature d’un quadrilatère ABCD :</p><ol><li>Est-ce un parallélogramme ? (côtés opposés parallèles, ou de même longueur deux à deux, ou diagonales de même milieu)</li><li>Si oui, a-t-il un angle droit, ou des diagonales de même longueur ? → rectangle.</li><li>A-t-il deux côtés consécutifs égaux, ou des diagonales perpendiculaires ? → losange.</li><li>Les deux à la fois ? → <b>carré</b>.</li></ol>'],
    ['lien', '<p>Tu connais la symétrie centrale : le parallélogramme est la figure qui ne change pas quand on lui fait faire un <b>demi-tour</b> autour du milieu O de ses diagonales. Le demi-tour échange A et C, B et D : c’est pour ça que O est le milieu de [AC] et de [BD], que les côtés opposés ont la même longueur et que les angles opposés sont égaux.</p>'],
  ]);
  E('angles-paralleles', [
    ['dessin', B],
    ['vie', '<p>Sur un passage piéton, les bandes blanches sont parallèles, et la bordure du trottoir les coupe toutes. Chaque bande forme avec la bordure <b>exactement le même angle</b> : ce sont des angles correspondants. Si une bande était un peu tordue, son angle serait différent, et elle ne serait plus parallèle aux autres.</p>'],
    ['etapes', '<p>Pour calculer un angle marqué « ? » quand (d) // (d’) :</p><ol><li>Je repère l’angle connu et l’angle cherché.</li><li>S’ils sont correspondants ou alternes-internes : ils sont égaux.</li><li>S’ils sont au même sommet : opposés par le sommet → égaux ; côte à côte sur une droite → leur somme fait 180°.</li><li>Sinon, je passe par un angle intermédiaire, en enchaînant deux de ces règles.</li></ol>'],
  ]);
  E('hauteurs-medianes', [
    ['dessin', B],
    ['vie', '<p>Pour partager équitablement un terrain triangulaire entre deux personnes, il suffit de tracer une <b>médiane</b> : on joint un coin au milieu du côté d’en face. Les deux parts n’ont pas la même forme, mais elles ont <b>la même aire</b>. Et la <b>hauteur</b>, c’est comme un fil à plomb lâché depuis le sommet : il tombe perpendiculairement au côté d’en face.</p>'],
    ['lien', '<p>Tu connais déjà la <b>médiatrice</b> d’un segment (perpendiculaire en son milieu). Dans un triangle, il y a trois lignes à ne pas confondre :</p><ul><li>la médiatrice de [BC] : milieu + angle droit ;</li><li>la hauteur issue de A : sommet A + angle droit ;</li><li>la médiane issue de A : sommet A + milieu.</li></ul><p>Chacune garde deux des trois ingrédients !</p>'],
  ]);
  E('symetrie-centrale', [
    ['dessin', B],
    ['vie', '<p>Pose une carte à jouer (un roi, par exemple) sur la table, plante un doigt en son centre et fais-la tourner d’un <b>demi-tour</b>. Elle retombe exactement sur elle-même : le centre de la carte est un <b>centre de symétrie</b>. Les lettres N, S, Z ou le chiffre 8 ont aussi un centre de symétrie.</p>'],
    ['lien', '<p>Tu connais la symétrie axiale : on <b>plie</b> le long d’une droite. La symétrie centrale, elle, fait <b>tourner</b> d’un demi-tour autour d’un point. Toutes les deux conservent les longueurs, les angles et les aires. Mais avec la symétrie centrale, la figure n’est pas retournée « en miroir » : elle est seulement tête en bas.</p>'],
  ]);
  E('repere', [
    ['dessin', B],
    ['vie', '<p>Au jeu de la bataille navale, on repère une case par une lettre (la colonne) puis un chiffre (la ligne) : « B4 ». Un repère, c’est pareil, avec des nombres sur les deux axes, et on peut aussi aller « en négatif » à gauche et en bas de O. Les GPS repèrent de la même façon chaque lieu de la Terre avec deux nombres : la longitude et la latitude.</p>'],
    ['lien', '<p>Tu sais déjà repérer un nombre relatif sur une droite graduée : l’abscisse d’un point. Un repère du plan, ce sont <b>deux</b> droites graduées perpendiculaires : l’horizontale donne l’abscisse, la verticale l’ordonnée. Il faut donc deux nombres pour repérer un point : (abscisse ; ordonnée).</p>'],
  ]);
})();
