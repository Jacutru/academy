// Chapters "Proportionnalité" and "Problèmes".
(function () {
  'use strict';
  const M = globalThis.M;
  const { fmt, dec, mul, add, sub, div, round } = M.u;
  const { frac, table, hole } = M.h;
  const { Q, num, fixedChoice } = M.kit;

  const yesNo = b => fixedChoice(['Oui', 'Non'], b ? 'Oui' : 'Non');
  const ptable = (head, r1, r2) => table([[head[0], ...r1], [head[1], ...r2]], { head: false, cls: 'prop' });

  const situations = [
    ['Le prix payé et la masse de pommes achetées (2,40 € le kg).', true, 'Si on achète 2 fois plus de pommes, on paie 2 fois plus.'],
    ['Le périmètre d’un carré et la longueur de son côté.', true, 'Périmètre = 4 × côté : on multiplie toujours par 4.'],
    ['L’âge d’un enfant et sa taille.', false, 'À 10 ans, on ne mesure pas 2 fois plus qu’à 5 ans.'],
    ['Le prix d’une course en taxi (5 € de prise en charge + 1 € par km) et la distance.', false, 'Pour 0 km, on paie déjà 5 € : ce n’est pas proportionnel.'],
    ['La quantité d’essence et le prix payé à la pompe.', true, 'Le prix est toujours (prix d’un litre) × (nombre de litres).'],
    ['La distance parcourue à vitesse constante et la durée du trajet.', true, 'En 2 fois plus de temps, on va 2 fois plus loin.'],
    ['La pointure de chaussures et l’âge.', false, 'Il n’y a pas de coefficient multiplicateur entre les deux.'],
    ['Le nombre de tickets de cinéma achetés (8 € l’un) et le prix total.', true, 'Prix = 8 × nombre de tickets.'],
    ['L’aire d’un carré et la longueur de son côté.', false, 'Côté × 2 → aire × 4 : ce n’est pas proportionnel.'],
    ['La température extérieure et l’heure de la journée.', false, 'Aucun coefficient ne relie ces deux grandeurs.'],
    ['La masse de farine et le nombre de crêpes (même recette).', true, 'Pour 2 fois plus de crêpes, il faut 2 fois plus de farine.'],
    ['Le prix d’un abonnement de 10 € par mois plus 2 € par séance, et le nombre de séances.', false, 'Il y a une partie fixe (10 €) : ce n’est pas proportionnel.'],
  ];

  M.notion('prop-reconnaitre', {
    lesson: {
      retenir: 'Deux grandeurs sont <b>proportionnelles</b> si l’on passe de l’une à l’autre en <b>multipliant toujours par le même nombre</b>, appelé <b>coefficient de proportionnalité</b>.',
      explication: `${ptable(['Masse (kg)', 'Prix (€)'], [1, 2, 5], [3, 6, 15])}<p>On multiplie toujours par 3 : c’est un tableau de proportionnalité (coefficient 3).</p>${ptable(['Âge (ans)', 'Taille (cm)'], [5, 10, 15], [110, 140, 170])}<p>110 ÷ 5 = 22 mais 140 ÷ 10 = 14 : <b>pas</b> proportionnel.</p>`,
      methode: [
        'Dans un tableau : divise chaque nombre de la 2<sup>e</sup> ligne par celui du dessus.',
        'Si tous les quotients sont égaux, c’est proportionnel (ce quotient est le coefficient). Sinon, non.',
        'Dans une situation : demande-toi « si l’un double, est-ce que l’autre double aussi ? » et « pour 0, ai-je 0 ? ».',
      ],
      exemples: [
        { q: ptable(['Litres', 'Prix (€)'], [2, 5, 10], [3.4, 8.5, 17]), r: '3,4 ÷ 2 = 1,7 ; 8,5 ÷ 5 = 1,7 ; 17 ÷ 10 = 1,7 → <b>oui</b>, coefficient 1,7.' },
      ],
      erreurs: ['Croire que « quand l’un augmente, l’autre augmente » suffit : l’âge et la taille augmentent ensemble, mais ne sont pas proportionnels.'],
    },
    generate(level, rng) {
      if (level === 2) {
        const [txt, yes, why] = rng.pick(situations);
        return Q(`pr2:${txt}`, `Ces deux grandeurs sont-elles proportionnelles ?<br><i>${txt}</i>`, yesNo(yes), 'Si l’une double, est-ce que l’autre double ? Pour 0, a-t-on 0 ?', `<b>${yes ? 'Oui' : 'Non'}</b>. ${why}`);
      }
      if (level === 3 && rng.chance(0.5)) {
        const k = rng.pick([1.5, 2.5, 0.5, 1.2, 0.8, 3.5, 0.4]), xs = rng.sample([2, 4, 5, 6, 8, 10, 12, 20], 3).sort((a, b) => a - b);
        return Q(`pr3:${k}:${xs}`, `${ptable(['x', 'y'], xs, xs.map(x => mul(x, k)))}Quel est le coefficient de proportionnalité (pour passer de la 1<sup>re</sup> à la 2<sup>e</sup> ligne) ?`, num(k), `Calcule ${fmt(mul(xs[0], k))} ÷ ${xs[0]}.`, `${fmt(mul(xs[0], k))} ÷ ${xs[0]} = <b>${fmt(k)}</b>`);
      }
      const k = level === 1 ? rng.int(2, 9) : rng.pick([1.5, 2.5, 3, 4, 0.5]), xs = rng.sample([1, 2, 3, 4, 5, 6, 8, 10], 3).sort((a, b) => a - b);
      let ys = xs.map(x => mul(x, k)), yes = rng.chance(0.5);
      if (!yes) {
        const i = rng.int(1, 2);
        ys = level === 1 && rng.chance(0.5) ? xs.map(x => x + ys[0] - xs[0]) : ys.map((y, j) => (j === i ? add(y, rng.pick([1, 2, -1])) : y));
        if (ys.every((y, j) => y === mul(xs[j], k))) yes = true;
      }
      const qs = xs.map((x, j) => `${fmt(ys[j])} ÷ ${x} = ${fmt(round(ys[j] / x, 3))}`).join(' ; ');
      return Q(`pr:${xs}:${ys}`, `${ptable(['Grandeur A', 'Grandeur B'], xs, ys)}Ce tableau est-il un tableau de proportionnalité ?`, yesNo(yes), 'Divise chaque nombre du bas par celui du haut.', `${qs} → <b>${yes ? 'Oui' : 'Non'}</b>${yes ? `, coefficient ${fmt(k)}` : ', les quotients ne sont pas tous égaux'}.`);
    },
  });

  M.notion('prop-tableau', {
    lesson: {
      retenir: 'Pour compléter un tableau de proportionnalité, on peut : <b>multiplier par le coefficient</b> ; <b>passer par l’unité</b> ; utiliser la <b>linéarité</b> (additionner deux colonnes, ou multiplier une colonne par un nombre).',
      explication: `${ptable(['Cahiers', 'Prix (€)'], [3, 5, 8], ['7,50', '?', '?'])}<ul><li><b>Passage à l’unité</b> : 1 cahier coûte 7,50 ÷ 3 = 2,50 €, donc 5 cahiers coûtent 5 × 2,50 = 12,50 €.</li><li><b>Linéarité (addition)</b> : 8 = 3 + 5, donc 8 cahiers coûtent 7,50 + 12,50 = 20 €.</li><li><b>Coefficient</b> : on multiplie par 2,5 (3 × 2,5 = 7,5).</li></ul>`,
      methode: [
        'Cherche s’il y a un lien simple entre les colonnes (double, triple, somme…) : c’est souvent le plus rapide.',
        'Sinon, calcule la valeur pour 1 (passage à l’unité), puis multiplie.',
        'Vérifie que ton résultat est cohérent (plus d’objets → plus cher).',
      ],
      exemples: [
        { q: '4 kg coûtent 10 €. Combien coûtent 6 kg ?', r: '1 kg coûte 10 ÷ 4 = 2,50 € ; 6 kg coûtent 6 × 2,50 = <b>15 €</b>. (Ou : 6 = 4 + 2, et 2 kg coûtent 5 €.)' },
      ],
      erreurs: ['Ajouter la même chose en haut et en bas : si 3 cahiers coûtent 7,50 €, 5 cahiers ne coûtent pas 9,50 € !'],
    },
    generate(level, rng) {
      if (level === 1) {
        const k = rng.int(2, 9), xs = rng.sample([1, 2, 3, 4, 5, 6, 7, 8, 10], 4).sort((a, b) => a - b), i = rng.int(1, 3);
        const ys = xs.map((x, j) => (j === i ? hole : x * k));
        return Q(`pt1:${k}:${xs}:${i}`, `${ptable(['A', 'B'], xs, ys)}Complète ce tableau de proportionnalité.`, num(xs[i] * k), `Par combien multiplie-t-on ${xs[0]} pour obtenir ${xs[0] * k} ?`, `Coefficient : ${xs[0] * k} ÷ ${xs[0]} = ${k}. ${xs[i]} × ${k} = <b>${xs[i] * k}</b>`);
      }
      const item = rng.pick([['cahiers', 'Prix (€)'], ['kg de pommes', 'Prix (€)'], ['personnes', 'Farine (g)'], ['litres', 'Prix (€)']]);
      const unitPrice = level === 2 ? dec(rng.int(5, 40), 1) : dec(rng.int(105, 495), 2);
      let a = rng.int(2, 6), b;
      do b = rng.int(2, 12); while (b === a);
      if (level === 3 && rng.chance(0.4)) {
        // Missing value in the first row.
        const pb = mul(b, unitPrice), pa = mul(a, unitPrice);
        return Q(`pt3r:${a}:${b}:${unitPrice}`, `${ptable([item[0], item[1]], [a, hole], [fmt(pa), fmt(pb)])}Complète ce tableau de proportionnalité.`, num(b), `Valeur pour 1 : ${fmt(pa)} ÷ ${a}.`, `Pour 1 : ${fmt(pa)} ÷ ${a} = ${fmt(unitPrice)}. Puis ${fmt(pb)} ÷ ${fmt(unitPrice)} = <b>${b}</b>.`);
      }
      const pa = mul(a, unitPrice), pb = mul(b, unitPrice);
      return Q(`pt:${a}:${b}:${unitPrice}`, `${ptable([item[0], item[1]], [a, b], [fmt(pa), hole])}Complète ce tableau de proportionnalité.`, num(pb), `Passe par l’unité : combien pour 1 ?`, `Pour 1 : ${fmt(pa)} ÷ ${a} = ${fmt(unitPrice)}. Pour ${b} : ${b} × ${fmt(unitPrice)} = <b>${fmt(pb)}</b>.`);
    },
  });

  M.notion('pourcentages', {
    lesson: {
      retenir: `Prendre <b>t %</b> d’une quantité, c’est en prendre ${frac('t', 100)} : on calcule <b>quantité × t ÷ 100</b>. À connaître par cœur : 50 % = la moitié, 25 % = le quart, 10 % = le dixième, 75 % = les trois quarts.`,
      explication: `<p>20 % de 45 € : 10 % de 45 = 4,50 ; donc 20 % = 2 × 4,50 = <b>9 €</b>.</p><p>Un pourcentage est une proportion « sur 100 » : 15 élèves sur 25, c’est 60 sur 100, donc <b>60 %</b>.</p>`,
      methode: [
        'Pour 50 %, 25 %, 10 % : divise par 2, 4 ou 10.',
        'Pour les autres, passe par 10 % ou 1 % : 30 % = 3 × 10 % ; 5 % = la moitié de 10 %.',
        'Pour trouver un pourcentage : écris la proportion avec le dénominateur 100.',
      ],
      exemples: [
        { q: '75 % de 80', r: 'Le quart de 80 = 20, trois quarts = <b>60</b>.' },
        { q: 'Un article à 60 € est soldé à −20 %. Nouveau prix ?', r: '20 % de 60 = 12 ; 60 − 12 = <b>48 €</b>.' },
        { q: '6 sur 20 en pourcentage', r: `${frac(6, 20)} = ${frac(30, 100)} = <b>30 %</b>.` },
      ],
      erreurs: ['Une réduction de 20 % ne veut pas dire « enlever 20 € » !'],
    },
    generate(level, rng) {
      if (level === 1) {
        const t = rng.pick([50, 10, 25, 100]), q = t === 25 ? rng.int(2, 30) * 4 : t === 50 ? rng.int(2, 60) * 2 : rng.int(2, 99) * 10;
        const r = (q * t) / 100;
        return Q(`pc1:${t}:${q}`, `${t} % de ${q} = ?`, num(r), { 50: 'C’est la moitié.', 10: 'C’est le dixième.', 25: 'C’est le quart.', 100: 'C’est le tout.' }[t], `${t} % de ${q} = ${q} × ${t} ÷ 100 = <b>${fmt(r)}</b>`);
      }
      if (level === 2) {
        const t = rng.pick([75, 20, 30, 5, 40, 15, 60]), q = rng.int(2, 40) * 20, r = (q * t) / 100;
        return Q(`pc2:${t}:${q}`, `${t} % de ${q} = ?`, num(r), `Commence par 10 % de ${q}.`, `10 % de ${q} = ${fmt(q / 10)}, donc ${t} % de ${q} = <b>${fmt(r)}</b>.`);
      }
      if (rng.chance(0.5)) {
        const tot = rng.pick([20, 25, 50, 10, 4, 5]), part = rng.int(1, tot - 1), t = (part * 100) / tot;
        return Q(`pc3p:${part}/${tot}`, `Dans un club de ${tot} membres, ${part} sont des filles. Quel pourcentage des membres sont des filles ?`, num(t, '%'), `Écris ${frac(part, tot)} avec le dénominateur 100.`, `${frac(part, tot)} = ${frac(fmt(t), 100)} = <b>${fmt(t)} %</b>`);
      }
      const t = rng.pick([10, 20, 25, 30, 50]), p = rng.int(2, 30) * 4 * (t === 30 ? 10 : 1) / (t === 30 ? 4 : 1), red = (p * t) / 100, np = sub(p, red);
      return Q(`pc3r:${t}:${p}`, `Un article coûte ${fmt(p)} €. Il est soldé à −${t} %. Quel est son nouveau prix ?`, num(np, '€'), `Calcule d’abord ${t} % de ${fmt(p)}.`, `${t} % de ${fmt(p)} = ${fmt(red)} € ; ${fmt(p)} − ${fmt(red)} = <b>${fmt(np)} €</b>.`);
    },
  });

  M.notion('echelles', {
    lesson: {
      retenir: `Sur un plan à l’échelle ${frac(1, 'n')}, les longueurs réelles sont <b>n fois plus grandes</b> que sur le plan (dans la même unité). L’échelle ${frac(1, 25000)} signifie : 1 cm sur la carte représente 25 000 cm en réalité.`,
      explication: `${ptable(['Plan (cm)', 'Réalité (cm)'], [1, 4], ['25 000', '100 000'])}<p>C’est une situation de proportionnalité. 100 000 cm = 1 000 m = 1 km.</p>`,
      methode: [
        'Distance réelle = distance sur le plan × n (même unité !).',
        'Distance sur le plan = distance réelle ÷ n.',
        'Convertis ensuite dans l’unité demandée.',
      ],
      exemples: [
        { q: `Plan au ${frac(1, 100)} : une pièce mesure 4,5 cm. Longueur réelle ?`, r: '4,5 × 100 = 450 cm = <b>4,5 m</b>.' },
        { q: `Carte au ${frac(1, 50000)} : 3 cm représentent ?`, r: '3 × 50 000 = 150 000 cm = <b>1,5 km</b>.' },
      ],
      erreurs: ['Oublier de convertir : 150 000 cm, ce n’est pas 150 000 m !'],
    },
    generate(level, rng) {
      if (level === 1) {
        const n = rng.pick([100, 200, 50]), d = dec(rng.int(5, 80), 1), real = div(mul(d, n), 100);
        return Q(`ech1:${n}:${d}`, `Sur un plan à l’échelle ${frac(1, n)}, un mur mesure ${fmt(d)} cm. Quelle est sa longueur réelle en mètres ?`, num(real, 'm'), `${fmt(d)} × ${n} = … cm, puis convertis en m.`, `${fmt(d)} × ${n} = ${fmt(mul(d, n))} cm = <b>${fmt(real)} m</b>.`);
      }
      if (level === 2) {
        const n = rng.pick([10000, 25000, 50000, 100000]), d = rng.int(2, 12), real = div(mul(d, n), 100000);
        return Q(`ech2:${n}:${d}`, `Sur une carte à l’échelle ${frac(1, fmt(n))}, deux villages sont à ${d} cm. Quelle est la distance réelle en km ?`, num(real, 'km'), '1 km = 100 000 cm.', `${d} × ${fmt(n)} = ${fmt(d * n)} cm = <b>${fmt(real)} km</b>.`);
      }
      if (rng.chance(0.5)) {
        const n = rng.pick([1000, 2000, 5000, 10000]), meters = n / 100;
        return Q(`ech3s:${n}`, `Sur un plan, 1 cm représente ${fmt(meters)} m. Quelle est l’échelle ${frac(1, hole)} ?`, num(n), `Convertis ${fmt(meters)} m en cm.`, `${fmt(meters)} m = ${fmt(n)} cm : l’échelle est ${frac(1, `<b>${fmt(n)}</b>`)}.`);
      }
      const n = rng.pick([25000, 50000, 100000]), km = rng.pick([0.5, 1, 1.5, 2, 2.5, 3, 4, 5]), d = div(mul(km, 100000), n);
      return Q(`ech3:${n}:${km}`, `Carte à l’échelle ${frac(1, fmt(n))}. Deux points sont à ${fmt(km)} km dans la réalité. À combien de cm sont-ils sur la carte ?`, num(d, 'cm'), `Convertis ${fmt(km)} km en cm, puis divise par ${fmt(n)}.`, `${fmt(km)} km = ${fmt(mul(km, 100000))} cm ; ÷ ${fmt(n)} = <b>${fmt(d)} cm</b>.`);
    },
  });

  // ===================== PROBLÈMES =====================
  const problems = {
    1: [
      r => {
        const a = dec(r.int(12, 45) * 5, 2), n = r.int(2, 4), b = dec(r.int(5, 25) * 5, 2), billet = 20, tot = add(mul(n, a), b);
        if (tot >= billet) return null;
        return { txt: `Lina achète ${n} cahiers à ${fmt(a)} € l’un et une trousse à ${fmt(b)} €. Elle paie avec un billet de ${billet} €. Combien lui rend-on ?`, value: sub(billet, tot), unit: '€',
          corr: `Cahiers : ${n} × ${fmt(a)} = ${fmt(mul(n, a))} €. Total : ${fmt(mul(n, a))} + ${fmt(b)} = ${fmt(tot)} €. Monnaie : ${billet} − ${fmt(tot)} = <b>${fmt(sub(billet, tot))} €</b>.` };
      },
      r => {
        const n = r.int(3, 6), each = dec(r.int(500, 2500), 2), tot = mul(n, each);
        return { txt: `${n} amis se partagent équitablement une addition de ${fmt(tot)} €. Combien chacun paie-t-il ?`, value: each, unit: '€', corr: `${fmt(tot)} ÷ ${n} = <b>${fmt(each)} €</b>.` };
      },
    ],
    2: [
      r => {
        const c = r.int(3, 6), e = r.int(22, 29), places = r.pick([40, 50, 60]), total = c * e, bus = Math.ceil(total / places);
        return { txt: `${c} classes de ${e} élèves partent en sortie. Un car contient ${places} places. Combien de cars faut-il au minimum ?`, value: bus, unit: 'cars',
          corr: `${c} × ${e} = ${total} élèves. ${total} = ${places} × ${Math.floor(total / places)} + ${total % places}${total % places ? ' : il faut un car de plus pour les élèves restants' : ''} → <b>${bus} cars</b>.` };
      },
      r => {
        const p = r.pick([4, 6, 8]), g = r.pick([150, 200, 250, 300]), q = r.pick([2, 3, 6, 10, 12].filter(x => x !== p)), res = (g / p) * q;
        if (!Number.isInteger(res * 10)) return null;
        return { txt: `Pour ${p} personnes, une recette demande ${g} g de farine. Quelle masse de farine faut-il pour ${q} personnes ?`, value: res, unit: 'g', corr: `Pour 1 personne : ${g} ÷ ${p} = ${fmt(g / p)} g. Pour ${q} : ${q} × ${fmt(g / p)} = <b>${fmt(res)} g</b>.` };
      },
      r => {
        const s = r.int(10, 50), w = dec(r.int(4, 16) * 5, 1), n = r.int(4, 12), goal = add(s, mul(w, n));
        return { txt: `Tom a ${s} € d’économies. Il ajoute ${fmt(w)} € chaque semaine. Au bout de combien de semaines aura-t-il ${fmt(goal)} € ?`, value: n, unit: 'semaines', corr: `Il lui manque ${fmt(goal)} − ${s} = ${fmt(sub(goal, s))} €. ${fmt(sub(goal, s))} ÷ ${fmt(w)} = <b>${n} semaines</b>.` };
      },
    ],
    3: [
      r => {
        const v = r.pick([12, 15, 18, 20, 24]), h = r.int(1, 3), m = r.pick([15, 30, 45]), d = add(v * h, (v * m) / 60);
        return { txt: `Un cycliste roule à vitesse constante : ${v} km en 1 heure. Quelle distance parcourt-il en ${h} h ${m} min ?`, value: d, unit: 'km', corr: `${m} min = ${frac(m, 60)} h, donc ${fmt((v * m) / 60)} km. ${h} h → ${v * h} km. Total : <b>${fmt(d)} km</b>.` };
      },
      r => {
        const L = r.int(8, 25), l = r.int(4, L - 1), prix = dec(r.int(15, 60) * 5, 1), P = 2 * (L + l), tot = mul(P, prix);
        return { txt: `Un jardin rectangulaire mesure ${L} m sur ${l} m. On veut l’entourer d’un grillage à ${fmt(prix)} € le mètre. Quel sera le prix du grillage ?`, value: tot, unit: '€', corr: `Périmètre : 2 × (${L} + ${l}) = ${P} m. Prix : ${P} × ${fmt(prix)} = <b>${fmt(tot)} €</b>.` };
      },
      r => {
        const prix = r.int(30, 90), t = r.pick([10, 20, 25, 50]), n = r.int(2, 4), red = (prix * t) / 100, tot = n * (prix - red);
        if (!Number.isInteger(red * 100)) return null;
        return { txt: `Un jeu coûte ${prix} €. Pendant les soldes, il est à −${t} %. Combien paie-t-on pour ${n} jeux soldés ?`, value: round(tot, 2), unit: '€', corr: `Réduction : ${t} % de ${prix} = ${fmt(red)} €. Prix soldé : ${fmt(prix - red)} €. Pour ${n} jeux : <b>${fmt(round(tot, 2))} €</b>.` };
      },
    ],
  };

  M.notion('problemes', {
    lesson: {
      retenir: 'Pour résoudre un problème à plusieurs étapes : <b>comprendre</b> la question, <b>chercher</b> les étapes intermédiaires, <b>calculer</b>, puis <b>vérifier</b> que la réponse a du sens et <b>rédiger</b> une phrase réponse.',
      methode: [
        'Lis l’énoncé deux fois. Souligne la question et les données utiles.',
        'Demande-toi : « Que dois-je connaître d’abord pour répondre ? » Ce sont les étapes intermédiaires.',
        'Fais chaque calcul en notant ce qu’il représente (ex. : « prix des cahiers : 3 × 2,15 = 6,45 € »).',
        'Vérifie l’ordre de grandeur et l’unité, puis écris une phrase réponse.',
      ],
      exemples: [
        { q: '4 classes de 26 élèves partent en car (50 places). Combien de cars ?', r: '4 × 26 = 104 élèves ; 104 = 50 × 2 + 4 → 2 cars ne suffisent pas, il faut <b>3 cars</b>.' },
      ],
      astuces: ['Si tu bloques, fais un schéma ou essaie avec des nombres plus simples.'],
      erreurs: ['Arrondir sans réfléchir : 2,08 cars, ce n’est pas 2 cars !'],
    },
    generate(level, rng) {
      let p;
      do p = rng.pick(problems[level])(rng); while (!p);
      return Q(`pb:${p.txt}`, p.txt, num(p.value, p.unit), 'Quelle étape intermédiaire faut-il calculer d’abord ?', p.corr);
    },
  });
})();
