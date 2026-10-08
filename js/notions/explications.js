// Several ways to explain each notion; the pupil picks the clearest one.
// BASE stands for the notion's own lesson.explication. Styles are defined in M.cat.STYLES.
(function () {
  'use strict';
  const M = globalThis.M;
  const { frac } = M.h;
  const S = M.svg;
  const B = M.cat.BASE;
  const E = M.explain;

  // ---------- Nombres entiers, tables, calcul mental ----------
  E('grands-nombres', [
    ['dessin', B],
    ['vie', '<p>La France compte environ <b>68 000 000</b> d’habitants : « soixante-huit <b>millions</b> ». La Terre, environ <b>8 000 000 000</b> : « huit <b>milliards</b> ». Chaque fois qu’on ajoute un groupe de 3 zéros, on change de nom : mille → million → milliard.</p>'],
    ['etapes', '<p>Pour lire 2305040018 :</p><ol><li>Je fais des paquets de 3 en partant de la droite : 2 | 305 | 040 | 018.</li><li>Je lis le 1<sup>er</sup> paquet + « milliards » : deux milliards.</li><li>Puis « trois cent cinq millions », « quarante mille », « dix-huit ».</li></ol>'],
  ]);
  E('tables-mult', [
    ['dessin', B],
    ['vie', '<p>Une salle a <b>7 rangées de 8 chaises</b>. Pour savoir combien il y a de chaises, pas besoin de compter une par une : 7 × 8 = <b>56</b>. Connaître ses tables, c’est pouvoir compter très vite des objets bien rangés.</p>'],
    ['lien', '<p>Si tu as oublié un résultat, pars d’un résultat que tu connais :</p><ul><li>7 × 8 ? Je sais que 7 × 10 = 70, j’enlève 2 fois 7 : 70 − 14 = <b>56</b>.</li><li>6 × 8 ? C’est le double de 3 × 8 = 24 : <b>48</b>.</li><li>9 × 7 ? 10 × 7 − 7 = <b>63</b>.</li></ul>'],
  ]);
  E('tables-div', [
    ['lien', B],
    ['vie', '<p>On partage <b>56 bonbons entre 8 enfants</b>. Combien chacun en aura-t-il ? On cherche « 8 fois combien font 56 » : 8 × 7 = 56, donc chacun a <b>7 bonbons</b>. Diviser, c’est partager en parts égales.</p>'],
    ['etapes', '<p>Pour 42 ÷ 6 :</p><ol><li>Je lis : « dans 42, combien de fois 6 ? »</li><li>Je récite la table de 6 : 6, 12, 18, 24, 30, 36, <b>42</b>.</li><li>J’ai compté 7 nombres : 42 ÷ 6 = <b>7</b>.</li></ol>'],
  ]);
  E('mult-10', [
    ['dessin', B],
    ['vie', '<p>Un cahier coûte 3,45 €. <b>100 cahiers</b> coûtent 100 fois plus : 345 €. Chaque euro devient 100 euros, chaque centime devient 1 euro : tous les chiffres « montent » de 2 rangs.</p>'],
    ['etapes', '<ol><li>Je compte les zéros : 100 → 2 zéros → 2 rangs.</li><li>Multiplier : le nombre grandit, les chiffres vont vers la gauche (la virgule semble aller à droite). 4,2 → 42 → <b>420</b>.</li><li>Diviser : le nombre rapetisse. 58 → 5,8 → 0,58 → <b>0,058</b> pour ÷ 1 000.</li></ol>'],
  ]);
  E('mult-01', [
    ['lien', B],
    ['vie', `<p>« Prendre 0,5 fois » une chose, c’est en prendre <b>la moitié</b> : 0,5 × 30 € = 15 €. « Prendre 0,1 fois », c’est en prendre <b>un dixième</b> : 0,1 × 30 € = 3 €. C’est pour ça que le résultat est plus petit.</p>`],
    ['dessin', `${S.fractionBar(1, 10)}<p>La barre entière vaut 1. Une case, c’est ${frac(1, 10)} = 0,1. Multiplier par 0,1, c’est garder <b>une seule case sur dix</b> : on divise par 10.</p>`],
  ]);
  E('complements', [
    ['dessin', `${S.numberLine({ from: 30, to: 100, major: 10, marks: [{ v: 37, label: '37' }, { v: 40, label: '+3' }, { v: 100, label: '+60' }] })}<p>De 37, je saute à 40 (+3), puis de 40 à 100 (+60). En tout : 3 + 60 = <b>63</b>.</p>`],
    ['vie', '<p>Tu achètes un livre à <b>37 €</b> avec un billet de <b>100 €</b>. La vendeuse rend la monnaie en comptant : « 38, 39, 40 » (3 €), puis « 50, 60… 100 » (60 €). Elle te rend <b>63 €</b>.</p>'],
    ['etapes', '<ol><li>Pour 100 : les unités doivent faire <b>10</b> (7 + 3), les dizaines doivent faire <b>9</b> (3 + 6).</li><li>Pour 1 avec 0,37 : pense en centièmes. 37 centièmes + 63 centièmes = 100 centièmes = 1.</li><li>Vérifie en additionnant.</li></ol>'],
  ]);
  E('calcul-malin', [
    ['etapes', B],
    ['vie', '<p>Une pièce de 25 centimes : <b>4 pièces font 1 €</b>. Donc 36 pièces de 25 centimes, c’est 36 ÷ 4 = 9 €. C’est exactement l’astuce « × 25 = × 100 puis ÷ 4 ».</p>'],
    ['lien', '<p>Toutes ces astuces viennent de la distributivité : 23 × 9 = 23 × (10 − 1) = 230 − 23. Et 34 × 11 = 34 × (10 + 1) = 340 + 34.</p>'],
  ]);

  // ---------- Décimaux ----------
  E('dec-position', [
    ['dessin', B],
    ['vie', '<p>Avec de l’argent : <b>3,07 €</b>, c’est 3 euros et 7 centimes. Les centimes sont les centièmes d’euro. Il n’y a pas de pièce de « dix centimes » dans ce prix, donc on écrit un 0 au rang des dixièmes.</p>'],
    ['lien', '<p>Avec les longueurs : <b>2,345 km</b> = 2 km 345 m. Le chiffre 3 compte les centaines de mètres, c’est-à-dire les dixièmes de kilomètre ; le 4, les dizaines de mètres (centièmes de km) ; le 5, les mètres (millièmes de km).</p>'],
  ]);
  E('dec-fraction', [
    ['lien', B],
    ['vie', `<p>1 € = 100 centimes. Donc 1 centime = ${frac(1, 100)} € = 0,01 €, et 253 centimes = ${frac(253, 100)} € = <b>2,53 €</b>.</p>`],
    ['dessin', `${S.fractionBar(7, 10)}<p>7 cases sur 10 : ${frac(7, 10)} = <b>0,7</b> (7 dixièmes).</p>`],
  ]);
  E('dec-comparer', [
    ['dessin', B],
    ['vie', '<p>À la course : Léo met <b>12,1 s</b>, Inès <b>12,09 s</b>. Qui a gagné ? 12,09 = 12 s et 9 centièmes ; 12,1 = 12 s et 10 centièmes. Inès est plus rapide : 12,09 &lt; 12,1. Le nombre « le plus long » n’est pas le plus grand !</p>'],
    ['etapes', '<ol><li>Je compare les parties entières.</li><li>Si elles sont égales, j’ajoute des zéros pour avoir autant de chiffres : 3,5 → 3,50.</li><li>Je compare alors comme des entiers : 350 et 345 → 3,5 &gt; 3,45.</li></ol>'],
  ]);
  E('dec-ranger', [
    ['etapes', '<ol><li>J’écris tous les nombres avec le même nombre de décimales : 0,7 → 0,700 ; 0,07 → 0,070.</li><li>Je les compare comme des entiers : 700, 70, 707, 770.</li><li>Je les écris dans l’ordre demandé : 0,07 &lt; 0,7 &lt; 0,707 &lt; 0,77.</li></ol>'],
    ['vie', '<p>Au saut en longueur, on classe les élèves : 3,5 m ; 3,45 m ; 3,07 m ; 3,7 m. En centimètres : 350, 345, 307, 370. Le classement du plus petit au plus grand : 3,07 &lt; 3,45 &lt; 3,5 &lt; 3,7.</p>'],
    ['dessin', `${S.numberLine({ from: 3, to: 4, major: 1, minor: 10, marks: [{ v: 3.07, label: 'a' }, { v: 3.45, label: 'b' }, { v: 3.5, label: 'c' }, { v: 3.7, label: 'd' }] })}<p>Sur une droite graduée, les nombres sont rangés tout seuls : plus on va à droite, plus c’est grand.</p>`],
  ]);
  E('dec-arrondir', [
    ['dessin', B],
    ['vie', '<p>Un jeu coûte <b>19,90 €</b>. Pour en parler, on dit « environ 20 € » : c’est l’arrondi à l’unité. Il coûte « plus de 19 € » : c’est la troncature (on coupe les centimes).</p>'],
    ['etapes', '<ol><li>Je souligne le chiffre du rang demandé : arrondi au dixième de 12,3<u>4</u>7 → je regarde le chiffre juste après le 3.</li><li>C’est 4 : moins de 5, je garde 12,3.</li><li>Si c’était 5 ou plus, j’ajouterais 1 : 12,36 → 12,4.</li></ol>'],
  ]);
  E('dec-droite', [
    ['dessin', B],
    ['vie', '<p>Sur ta règle, entre 2 cm et 3 cm, il y a 10 petits traits d’espace : chacun vaut 1 mm = 0,1 cm. Un point placé 7 petits traits après 2 est à <b>2,7 cm</b>.</p>'],
    ['etapes', '<ol><li>Je prends deux nombres écrits : par exemple 0 et 2.</li><li>Je compte les petits intervalles entre eux : 4.</li><li>Une graduation vaut 2 ÷ 4 = 0,5.</li><li>Je compte les graduations jusqu’au point en partant du nombre le plus proche.</li></ol>'],
  ]);

  // ---------- Opérations ----------
  E('ordre-grandeur', [
    ['vie', '<p>Au supermarché, tu as 20 € et tu prends un article à 4,85 €, un à 9,90 € et un à 3,10 €. Ça fait environ 5 + 10 + 3 = 18 € : ça passe ! L’ordre de grandeur sert à vérifier vite, sans calculatrice.</p>'],
    ['etapes', '<ol><li>Je remplace chaque nombre par un nombre rond proche : 48,7 → 50 ; 21,3 → 20.</li><li>Je calcule de tête : 50 × 20 = 1 000.</li><li>Le vrai résultat doit être proche de 1 000 : si je trouve 103,7 ou 10 373, je me suis trompé (souvent la virgule).</li></ol>'],
    ['lien', '<p>C’est comme l’arrondi : on arrondit chaque nombre à son premier chiffre, puis on calcule. 398 + 612 ≈ 400 + 600 = 1 000.</p>'],
  ]);
  E('add-sous', [
    ['dessin', B],
    ['vie', '<p>12,50 € + 3,47 € : j’additionne les euros avec les euros (12 + 3 = 15) et les centimes avec les centimes (50 + 47 = 97). Total : <b>15,97 €</b>. Aligner les virgules, c’est mettre les euros sous les euros et les centimes sous les centimes.</p>'],
    ['lien', '<p>On ne peut additionner que des choses de même sorte : des dixièmes avec des dixièmes, des centièmes avec des centièmes. C’est comme additionner des mètres avec des mètres et des centimètres avec des centimètres.</p>'],
  ]);
  E('mult-dec', [
    ['lien', B],
    ['vie', '<p>Un ruban coûte 1,2 € le mètre. Pour 2,3 m : environ 2 × 1 = 2 €, donc le prix est <b>2,76 €</b> (et pas 27,6 € !). On calcule 23 × 12 = 276, puis l’ordre de grandeur dit où placer la virgule.</p>'],
    ['etapes', '<ol><li>J’enlève les virgules : 2,3 × 1,2 devient 23 × 12.</li><li>Je calcule : 276.</li><li>Je compte les chiffres après la virgule au départ : 1 + 1 = 2.</li><li>Je place la virgule pour avoir 2 chiffres après : <b>2,76</b>.</li></ol>'],
  ]);
  E('div-euclide', [
    ['vie', B],
    ['dessin', '<p>47 billes rangées par paquets de 5 :</p><p class="center">●●●●● ●●●●● ●●●●● ●●●●● ●●●●● ●●●●● ●●●●● ●●●●● ●●●●● &nbsp; ●●</p><p>9 paquets complets (le quotient) et 2 billes qui restent (le reste) : 47 = 5 × 9 + 2.</p>'],
    ['etapes', '<ol><li>Je cherche dans la table du diviseur le plus grand multiple qui ne dépasse pas : pour 47 ÷ 5, c’est 45 = 5 × 9.</li><li>Le quotient est 9.</li><li>Le reste est 47 − 45 = 2, et il doit être plus petit que 5.</li></ol>'],
  ]);
  E('div-dec', [
    ['etapes', B],
    ['vie', '<p>4 amis se partagent <b>7 €</b>. Chacun a d’abord 1 € ; il reste 3 € = 300 centimes, soit 75 centimes chacun. Chacun reçoit <b>1,75 €</b>. Continuer la division après la virgule, c’est partager aussi les centimes.</p>'],
    ['lien', '<p>On peut changer d’unité pour éviter les virgules : 8,4 ÷ 4, c’est 84 dixièmes ÷ 4 = 21 dixièmes = <b>2,1</b>.</p>'],
  ]);

  // ---------- Expressions ----------
  E('vocabulaire-op', [
    ['lien', B],
    ['etapes', '<p>« Le produit de la somme de 2 et 3 par 4 » :</p><ol><li>Le premier mot est <b>produit</b> : le calcul final est une multiplication.</li><li>Produit de quoi ? « de la somme de 2 et 3 » <b>par</b> « 4 ».</li><li>J’écris (2 + 3) × 4 et je calcule : 20.</li></ol>'],
    ['vie', '<p>Au marché : « le double du prix », « la moitié du gâteau », « le triple de la distance ». On utilise ces mots tous les jours : double = × 2, moitié = ÷ 2, triple = × 3, quart = ÷ 4.</p>'],
  ]);
  E('priorites', [
    ['vie', '<p>Tu achètes un stylo à 5 € et 3 cahiers à 4 €. Tu paies 5 + 3 × 4. Évidemment, les 3 cahiers coûtent 3 × 4 = 12 €, puis on ajoute le stylo : 5 + 12 = <b>17 €</b>. La multiplication « passe avant », parce qu’elle regroupe des choses identiques.</p>'],
    ['etapes', '<ol><li>Je calcule d’abord ce qu’il y a dans les parenthèses.</li><li>Puis toutes les multiplications et divisions.</li><li>Enfin les additions et soustractions, de gauche à droite.</li><li>Je réécris tout le calcul à chaque étape pour ne rien oublier.</li></ol>'],
    ['dessin', '<p>Souligne les multiplications pour les « protéger » :</p><p class="center">20 − <u>3 × 4</u> + 2 &nbsp;→&nbsp; 20 − 12 + 2 &nbsp;→&nbsp; 8 + 2 = <b>10</b></p>'],
  ]);
  E('distributivite', [
    ['dessin', B],
    ['vie', '<p>3 copains achètent chacun un sandwich à 4 € et une boisson à 2 €. Total : 3 × (4 + 2) = 3 × 6 = 18 €. Ou bien : 3 sandwichs (3 × 4 = 12 €) et 3 boissons (3 × 2 = 6 €) → 18 €. Même résultat : 3 × (4 + 2) = 3 × 4 + 3 × 2.</p>'],
    ['etapes', '<p>Pour 8 × 99 :</p><ol><li>Je remplace 99 par un calcul facile : 100 − 1.</li><li>Je multiplie chaque morceau par 8 : 8 × 100 = 800 et 8 × 1 = 8.</li><li>Je garde le signe du milieu : 800 − 8 = <b>792</b>.</li></ol>'],
  ]);
  E('factoriser', [
    ['vie', '<p>J’ai 7 boîtes de 13 crayons et 7 boîtes de 7 crayons. Je peux regrouper : chaque « paire de boîtes » contient 13 + 7 = 20 crayons, et j’en ai 7 paires : 7 × 20 = <b>140</b> crayons. 7 × 13 + 7 × 7 = 7 × (13 + 7).</p>'],
    ['dessin', `${S.areaModel(7, 13, 7)}<p>Deux rectangles de même hauteur 7 collés côte à côte forment un grand rectangle de largeur 13 + 7 = 20 : son aire est 7 × 20.</p>`],
    ['etapes', '<ol><li>Je cherche le nombre qui apparaît dans les deux produits (le facteur commun) : 7.</li><li>Je l’écris une seule fois, devant une parenthèse.</li><li>Dans la parenthèse, je mets ce qui reste : (13 + 7).</li><li>Je calcule : 7 × 20 = 140.</li></ol>'],
  ]);

  // ---------- Arithmétique ----------
  E('multiples', [
    ['lien', B],
    ['dessin', `${S.numberLine({ from: 0, to: 36, major: 6, marks: [6, 12, 18, 24, 30, 36].map(v => ({ v })) })}<p>Les multiples de 6, ce sont les nombres où l’on tombe en faisant des sauts de 6 depuis 0.</p>`],
    ['vie', '<p>Les œufs sont vendus par boîtes de 6. On peut acheter 6, 12, 18, 24… œufs : ce sont les <b>multiples de 6</b>. Pour avoir 15 œufs pile, impossible : 15 n’est pas un multiple de 6.</p>'],
  ]);
  E('divisibilite', [
    ['etapes', '<ol><li>Je regarde seulement le dernier chiffre (les unités).</li><li>0, 2, 4, 6 ou 8 → divisible par 2.</li><li>0 ou 5 → divisible par 5 ; 0 → divisible par 10.</li></ol>'],
    ['vie', '<p>Peut-on ranger 345 œufs par paquets de 5 sans qu’il en reste ? Oui : 345 se termine par 5. Par paquets de 2 ? Non : 345 est impair, il restera 1 œuf.</p>'],
    ['lien', '<p>Pourquoi seul le dernier chiffre compte ? Parce que les dizaines, centaines… sont toujours des multiples de 10, donc de 2 et de 5. Seules les unités peuvent « gêner ».</p>'],
  ]);
  E('nombres-premiers', [
    ['lien', B],
    ['dessin', '<p>Avec <b>12</b> jetons, on peut faire plusieurs rectangles : 1 × 12, 2 × 6, 3 × 4. Avec <b>13</b> jetons, un seul rectangle possible : une ligne de 13 (1 × 13). 13 est premier.</p><p class="center">●●●● &nbsp; ●●●●●● &nbsp; ●●●●●●●●●●●●●<br>●●●● &nbsp; ●●●●●●<br>●●●●</p>'],
    ['vie', '<p>Les nombres premiers sont les « briques de base » des nombres : comme on construit un mur avec des briques, on construit chaque nombre en multipliant des nombres premiers. 60 = 2 × 2 × 3 × 5.</p>'],
  ]);
  E('pgcd', [
    ['etapes', B],
    ['vie', '<p>Avec 48 roses et 36 tulipes, on veut faire le plus possible de bouquets identiques, sans fleur restante. Le nombre de bouquets doit diviser 48 et 36. Le plus grand possible est le PGCD : <b>12 bouquets</b> de 4 roses et 3 tulipes.</p>'],
    ['dessin', '<p>On veut carreler un mur de 12 dm sur 18 dm avec les plus grands carreaux carrés possibles, sans les couper. Le côté doit diviser 12 et 18 : le plus grand est <b>6 dm</b> (le PGCD). Il faut alors 2 × 3 = 6 carreaux.</p>'],
  ]);
  E('ppcm', [
    ['etapes', B],
    ['vie', '<p>Un bus passe toutes les 4 min, un tram toutes les 6 min. Ils partent ensemble. Le bus passe à 4, 8, <b>12</b>… ; le tram à 6, <b>12</b>… Ils se retrouvent au bout de <b>12 min</b> : c’est le PPCM.</p>'],
    ['dessin', `${S.numberLine({ from: 0, to: 24, major: 2, labels: [0, 4, 6, 8, 12, 16, 18, 20, 24].map(v => ({ v, text: String(v) })), marks: [{ v: 12, label: '12' }, { v: 24, label: '24' }] })}<p>Une grenouille saute de 4 en 4, une autre de 6 en 6, toutes deux depuis 0. La première case où elles atterrissent toutes les deux est <b>12</b>.</p>`],
  ]);

  // ---------- Fractions ----------
  E('frac-partage', [
    ['dessin', B],
    ['vie', `<p>Une pizza coupée en <b>8 parts égales</b> ; tu en manges <b>3</b>. Tu as mangé ${frac(3, 8)} de la pizza. Le nombre du bas dit en combien on a coupé, celui du haut combien on en prend.</p>`],
    ['etapes', '<ol><li>Je vérifie que les parts sont égales.</li><li>Je compte les parts dans une unité : c’est le dénominateur (en bas).</li><li>Je compte les parts coloriées : c’est le numérateur (en haut).</li></ol>'],
  ]);
  E('frac-quotient', [
    ['lien', B],
    ['vie', `<p>On partage <b>7 pizzas entre 4 enfants</b>. Chacun reçoit 7 ÷ 4 pizza, c’est-à-dire ${frac(7, 4)} de pizza = 1 pizza et 3 quarts = <b>1,75</b> pizza.</p>`],
    ['dessin', `${S.fractionBar(7, 4)}<p>${frac(7, 4)} : 7 quarts, c’est une barre entière et 3 quarts d’une deuxième. 7 ÷ 4 = 1,75.</p>`],
  ]);
  E('frac-droite', [
    ['dessin', B],
    ['etapes', `<ol><li>Je regarde le dénominateur : ${frac(5, 3)} → je partage chaque unité en 3.</li><li>Je compte 5 petits morceaux à partir de 0.</li><li>Je tombe entre 1 et 2, 2 morceaux après 1.</li></ol>`],
    ['vie', `<p>Sur un ruban de 1 m coupé en 4 morceaux égaux, chaque morceau mesure ${frac(1, 4)} m. 3 morceaux mis bout à bout mesurent ${frac(3, 4)} m ; 5 morceaux dépassent le mètre : ${frac(5, 4)} m.</p>`],
  ]);
  E('frac-egales', [
    ['dessin', B],
    ['vie', `<p>Une pizza coupée en 3 dont tu manges 2 parts, ou la même pizza coupée en 12 dont tu manges 8 parts : tu as mangé exactement la même quantité ! ${frac(2, 3)} = ${frac(8, 12)}. On a coupé chaque part en 4.</p>`],
    ['etapes', `<ol><li>Pour compléter ${frac(3, 5)} = ${frac('?', 20)} : je cherche comment passer de 5 à 20 : × 4.</li><li>Je fais pareil en haut : 3 × 4 = 12.</li><li>Pour simplifier ${frac(18, 24)} : je divise en haut et en bas par un même nombre (6) → ${frac(3, 4)}.</li></ol>`],
  ]);
  E('frac-comparer', [
    ['dessin', `${S.fractionBar(3, 4)}${S.fractionBar(5, 8)}<p>${frac(3, 4)} (en haut) colorie plus que ${frac(5, 8)} (en bas) : ${frac(3, 4)} = ${frac(6, 8)} &gt; ${frac(5, 8)}.</p>`],
    ['vie', `<p>Vaut-il mieux ${frac(1, 3)} ou ${frac(1, 4)} d’un gâteau ? Partagé en 3, chaque part est plus grosse que partagé en 4 ! Plus le dénominateur est grand, plus les parts sont petites.</p>`],
    ['etapes', `<ol><li>Je compare d’abord à 1 : ${frac(7, 9)} &lt; 1 &lt; ${frac(10, 9)}.</li><li>Sinon, je mets les fractions au même dénominateur : ${frac(3, 4)} = ${frac(6, 8)}.</li><li>Je compare les numérateurs : 6 &gt; 5.</li></ol>`],
  ]);
  E('frac-somme', [
    ['vie', B],
    ['dessin', `${S.fractionBar(2, 7)}${S.fractionBar(3, 7)}${S.fractionBar(5, 7)}<p>2 septièmes + 3 septièmes : on met les cases coloriées ensemble, on obtient 5 septièmes. La taille des cases (le dénominateur) ne change pas.</p>`],
    ['etapes', `<ol><li>Les dénominateurs sont-ils égaux ? Sinon, je transforme : ${frac(1, 4)} = ${frac(2, 8)}.</li><li>J’additionne les numérateurs : 2 + 3 = 5.</li><li>Je garde le dénominateur : ${frac(5, 8)}.</li><li>Je simplifie si possible.</li></ol>`],
  ]);
  E('frac-quantite', [
    ['dessin', B],
    ['vie', `<p>Tu as 20 bonbons et tu en donnes ${frac(3, 4)}. Tu fais 4 tas égaux : 20 ÷ 4 = 5 bonbons par tas. Tu donnes 3 tas : 3 × 5 = <b>15 bonbons</b>.</p>`],
    ['etapes', `<ol><li>Je divise la quantité par le dénominateur : la valeur d’une part.</li><li>Je multiplie par le numérateur : le nombre de parts prises.</li><li>${frac(2, 3)} de 45 : 45 ÷ 3 = 15, puis 15 × 2 = 30.</li></ol>`],
  ]);

  // ---------- Proportionnalité, problèmes ----------
  E('prop-reconnaitre', [
    ['dessin', B],
    ['vie', '<p>Les pommes à 3 € le kilo : 2 kg coûtent 6 €, 5 kg coûtent 15 € → on multiplie toujours par 3, c’est proportionnel. Ta taille et ton âge : à 10 ans, tu ne mesures pas le double de tes 5 ans → pas proportionnel.</p>'],
    ['etapes', '<ol><li>Je teste : « si l’une double, l’autre double-t-elle ? »</li><li>Je teste : « pour 0, ai-je 0 ? » (un abonnement avec une partie fixe échoue).</li><li>Dans un tableau, je divise chaque nombre du bas par celui du haut : toujours le même résultat → proportionnel.</li></ol>'],
  ]);
  E('prop-tableau', [
    ['etapes', B],
    ['vie', '<p>Une recette de crêpes pour 4 personnes demande 250 g de farine. Pour 1 personne : 250 ÷ 4 = 62,5 g. Pour 6 personnes : 6 × 62,5 = 375 g. C’est le « passage à l’unité ».</p>'],
    ['lien', '<p>Astuce : cherche un lien simple entre les colonnes. Pour 6 personnes, c’est 4 + 2 personnes : 250 g + la moitié de 250 g = 375 g.</p>'],
  ]);
  E('pourcentages', [
    ['etapes', B],
    ['vie', '<p>Un jean à 60 € est soldé à −20 %. « 20 % », c’est 20 € retirés pour chaque 100 €. Pour 60 € : 10 % de 60 = 6 €, donc 20 % = 12 €. Il coûte 60 − 12 = <b>48 €</b>.</p>'],
    ['lien', `<p>Un pourcentage est une fraction de dénominateur 100 : 25 % = ${frac(25, 100)} = ${frac(1, 4)} (le quart), 50 % = ${frac(1, 2)} (la moitié), 10 % = ${frac(1, 10)} (le dixième).</p>`],
  ]);
  E('echelles', [
    ['dessin', B],
    ['vie', `<p>Sur une carte au ${frac(1, 100000)}, 1 cm représente 100 000 cm = 1 km. Si deux villes sont à 7 cm sur la carte, elles sont à <b>7 km</b> en vrai.</p>`],
    ['etapes', '<ol><li>Distance réelle = distance sur le plan × le nombre du bas de l’échelle.</li><li>Le résultat est dans la même unité que la mesure sur le plan (souvent des cm).</li><li>Je convertis dans l’unité demandée (m, km).</li></ol>'],
  ]);
  E('problemes', [
    ['etapes', '<ol><li>Je lis deux fois, je souligne la question.</li><li>Je me demande : « qu’est-ce que je dois savoir d’abord ? »</li><li>Je fais un calcul par étape, avec une phrase : « prix des cahiers : 3 × 2,15 = 6,45 € ».</li><li>Je vérifie que la réponse a du sens (ordre de grandeur, unité).</li></ol>'],
    ['dessin', '<p>Fais un schéma en barres. « Tom a 35 €, il veut 95 €, il économise 7,50 € par semaine » :</p><p class="center">[ 35 € déjà là ][ 7,50 ][ 7,50 ][ … ] = 95 €</p><p>Ce qui manque : 95 − 35 = 60 €, soit 60 ÷ 7,50 = 8 semaines.</p>'],
    ['vie', '<p>Un problème, c’est une histoire. Imagine-la vraiment : si 4 classes de 26 élèves prennent des cars de 50 places, 2 cars (100 places) ne suffisent pas pour 104 élèves. Il faut <b>3 cars</b> : on ne laisse pas 4 élèves sur le trottoir !</p>'],
  ]);

  // ---------- Grandeurs & mesures ----------
  E('conv-longueurs', [
    ['dessin', B],
    ['vie', '<p>Tu mesures 1,45 m. En centimètres : 1 m = 100 cm, donc 1,45 m = <b>145 cm</b>. Une bouteille de 1,5 L contient 150 cL. Un paquet de 1 kg pèse 1 000 g.</p>'],
    ['etapes', '<ol><li>Je repère les deux unités dans le tableau (km, hm, dam, m, dm, cm, mm).</li><li>Je compte les colonnes entre elles.</li><li>Vers une unité plus petite : × 10 par colonne ; vers une plus grande : ÷ 10.</li></ol>'],
  ]);
  E('conv-aires', [
    ['dessin', B],
    ['vie', '<p>Un carreau de carrelage de 1 dm de côté : il en faut 10 rangées de 10 pour couvrir 1 m². Donc 1 m² = <b>100 dm²</b>, pas 10 !</p>'],
    ['etapes', '<ol><li>Je repère le sens : vers une unité plus petite, le nombre grandit (× 100) ; vers une plus grande, il rapetisse (÷ 100).</li><li>m² → cm², c’est deux étapes : × 100 × 100 = × 10 000.</li><li>3 m² = 300 dm² = 30 000 cm².</li></ol>'],
  ]);
  E('conv-volumes', [
    ['dessin', B],
    ['vie', '<p>Une brique de lait de 1 L a presque la forme d’un cube de 1 dm de côté : <b>1 dm³ = 1 L</b>. Une seringue de 5 mL contient 5 cm³.</p>'],
    ['etapes', '<ol><li>Entre m³, dm³, cm³ : × 1 000 ou ÷ 1 000 à chaque unité.</li><li>Pour passer aux litres, je passe par les dm³ (1 dm³ = 1 L).</li><li>2,5 m³ = 2 500 dm³ = 2 500 L.</li></ol>'],
  ]);
  E('durees-conv', [
    ['dessin', B],
    ['vie', '<p>Sur une horloge, la grande aiguille fait le tour en 60 minutes. Un quart de tour = un quart d’heure = <b>15 min</b> ; un demi-tour = <b>30 min</b>. 1,5 h = 1 heure et demie = 1 h 30, pas 1 h 50 !</p>'],
    ['etapes', '<ol><li>Heures → minutes : × 60.</li><li>Minutes → heures et minutes : combien de fois 60 ? 150 = 2 × 60 + 30 → 2 h 30.</li><li>Heures décimales : 2,25 h = 2 h + 0,25 × 60 min = 2 h 15.</li></ol>'],
  ]);
  E('durees-calc', [
    ['etapes', B],
    ['vie', '<p>Le film commence à 20 h 45 et dure 1 h 50. À 21 h 45, une heure est passée. Il reste 50 min : 15 min jusqu’à 22 h, puis 35 min → fin à <b>22 h 35</b>.</p>'],
    ['dessin', '<p>Sur une frise du temps :</p><p class="center">9 h 45 ──(15 min)──▶ 10 h ──(1 h)──▶ 11 h ──(20 min)──▶ 11 h 20</p><p>On additionne les sauts : 15 min + 1 h + 20 min = <b>1 h 35</b>.</p>'],
  ]);
  E('perimetres', [
    ['dessin', B],
    ['vie', '<p>On veut entourer un jardin de 7 m sur 4 m avec une clôture. On fait le tour : 7 + 4 + 7 + 4 = <b>22 m</b> de clôture. Le périmètre, c’est la longueur du tour.</p>'],
    ['etapes', '<ol><li>Toutes les longueurs dans la même unité.</li><li>Rectangle : 2 × (L + l). Carré : 4 × côté. Cercle : 3,14 × diamètre.</li><li>Le résultat est une longueur (cm, m).</li></ol>'],
  ]);
  E('aires', [
    ['dessin', B],
    ['vie', '<p>Pour peindre un mur de 3 m sur 2,5 m, il faut savoir combien de « carrés de 1 m sur 1 m » le couvrent : 3 × 2,5 = <b>7,5 m²</b>. L’aire, c’est la place prise par la surface.</p>'],
    ['lien', '<p>Un rectangle de 5 cm sur 3 cm contient 3 rangées de 5 carrés de 1 cm² : 15 cm². C’est comme les tables de multiplication avec des chaises en rangées ! Pour une figure en L, on compte le grand rectangle et on enlève le morceau qui manque.</p>'],
  ]);
  E('volume-pave', [
    ['dessin', B],
    ['vie', '<p>Des morceaux de sucre rangés dans une boîte : 6 sucres par rangée, 4 rangées, 3 étages. Il y a 6 × 4 = 24 sucres par étage, et 24 × 3 = <b>72</b> sucres en tout. Compter des cubes de 1 cm³, c’est pareil !</p>'],
    ['etapes', '<ol><li>Je compte les cubes d’une rangée et les rangées : j’obtiens une couche.</li><li>Je compte les couches.</li><li>Je multiplie : cubes d’une couche × nombre de couches.</li></ol>'],
  ]);

  // ---------- Géométrie ----------
  E('geo-vocabulaire', [
    ['dessin', B],
    ['vie', '<p>Le trajet entre deux villes A et B : c’est un <b>segment</b> (il commence et finit). Le faisceau d’une lampe torche : une <b>demi-droite</b> (il part de la lampe et va tout droit sans fin). Une droite, c’est comme une route infinie dans les deux sens.</p>'],
    ['etapes', '<ol><li>Le crochet [ veut dire « on s’arrête à ce point ».</li><li>La parenthèse ( veut dire « on continue sans fin ».</li><li>[AB] : s’arrête des deux côtés ; (AB) : continue des deux côtés ; [AB) : s’arrête en A, continue après B.</li></ol>'],
  ]);
  E('geo-perp-para', [
    ['dessin', B],
    ['vie', '<p>Les deux rails d’un train sont <b>parallèles</b> : ils ne se croisent jamais. Le coin d’une feuille forme un angle droit : ses deux bords sont <b>perpendiculaires</b>.</p>'],
    ['etapes', '<ol><li>J’écris ce que je sais : (d1) ⊥ (d3) et (d2) ⊥ (d3).</li><li>Je cite la propriété : deux droites perpendiculaires à une même droite sont parallèles.</li><li>Je conclus : (d1) // (d2).</li></ol>'],
  ]);
  E('mediatrice', [
    ['dessin', B],
    ['vie', '<p>Deux amis habitent en A et en B. Où se donner rendez-vous pour faire chacun le même chemin ? N’importe où sur la médiatrice de [AB] ! Astuce : en pliant la feuille pour que A tombe sur B, le pli est la médiatrice.</p>'],
    ['etapes', '<ol><li>J’ouvre le compas un peu plus que la moitié de AB.</li><li>Je trace un arc de centre A, au-dessus et en dessous du segment.</li><li>Même écartement, mêmes arcs de centre B.</li><li>Je relie les deux points d’intersection : c’est la médiatrice.</li></ol>'],
  ]);
  E('geo-cercle', [
    ['dessin', B],
    ['vie', '<p>Une chèvre attachée à un piquet par une corde de 3 m : en tirant au maximum sur la corde et en tournant, elle dessine un <b>cercle</b> de rayon 3 m. L’herbe qu’elle peut manger forme un <b>disque</b>.</p>'],
    ['etapes', '<ol><li>Le centre est la pointe du compas.</li><li>Le rayon est l’écartement du compas.</li><li>Le diamètre traverse le cercle en passant par le centre : 2 × rayon.</li></ol>'],
  ]);
  E('geo-quadrilateres', [
    ['lien', B],
    ['dessin', `<div class="nets">${S.shape([[20, 55], [180, 55], [180, 145], [20, 145]], { size: 200 })}${S.shape([[100, 15], [160, 100], [100, 185], [40, 100]], { size: 200 })}${S.shape([[30, 30], [170, 30], [170, 170], [30, 170]], { size: 200 })}</div><p>Rectangle (4 angles droits), losange (4 côtés égaux), carré (les deux à la fois).</p>`],
    ['vie', '<p>Pense à des familles : le carré fait partie de la famille des rectangles <b>et</b> de la famille des losanges, car il a toutes leurs qualités. Une porte est un rectangle ; un panneau « attention » est un triangle équilatéral.</p>'],
  ]);
  E('angles-nature', [
    ['dessin', B],
    ['vie', '<p>Les aiguilles d’une horloge : à 3 h, elles forment un angle <b>droit</b>. À 1 h, un angle <b>aigu</b> (plus fermé). À 5 h, un angle <b>obtus</b> (plus ouvert). À 6 h, un angle <b>plat</b> (elles forment une ligne droite).</p>'],
    ['etapes', '<ol><li>Je compare l’angle avec le coin d’une feuille (angle droit).</li><li>Plus fermé → aigu (moins de 90°).</li><li>Plus ouvert → obtus (entre 90° et 180°). Une ligne droite → plat (180°).</li></ol>'],
  ]);
  E('angles-mesure', [
    ['dessin', B],
    ['vie', '<p>Sur une horloge, les aiguilles font un tour complet de 360° en 12 heures : <b>1 heure = 30°</b>. À 2 h, l’angle mesure 60° ; à 4 h, 120°.</p>'],
    ['etapes', '<ol><li>Je place le centre du rapporteur sur le sommet.</li><li>J’aligne le 0 sur un côté de l’angle.</li><li>Je lis sur la graduation qui part de ce 0.</li><li>Je vérifie avec la nature de l’angle (aigu → moins de 90°).</li></ol>'],
  ]);
  E('solides', [
    ['dessin', B],
    ['vie', '<p>Un dé est un <b>cube</b>, une boîte à chaussures un <b>pavé droit</b>, une boîte de Toblerone un <b>prisme</b>, une canette un <b>cylindre</b>, un cornet de glace un <b>cône</b>, un ballon une <b>boule</b>.</p>'],
    ['etapes', '<p>Pour compter les arêtes d’un cube :</p><ol><li>4 arêtes sur la face du dessus.</li><li>4 sur la face du dessous.</li><li>4 verticales qui les relient : 4 + 4 + 4 = 12.</li></ol>'],
  ]);
  E('sym-axes', [
    ['dessin', B],
    ['vie', '<p>Plie un papillon dessiné en deux le long de son corps : les deux ailes se superposent exactement. Le pli est un <b>axe de symétrie</b>. Les lettres A, M, T en ont un vertical ; H et X en ont deux.</p>'],
    ['etapes', '<ol><li>J’imagine un pli possible.</li><li>Je vérifie que chaque point d’un côté a son « jumeau » de l’autre côté, à la même distance du pli.</li><li>Je teste les médiatrices des côtés et les diagonales.</li></ol>'],
  ]);
  E('sym-point', [
    ['dessin', B],
    ['vie', '<p>La symétrie axiale, c’est comme un <b>miroir</b> posé sur l’axe : ton reflet est aussi loin derrière le miroir que toi devant, juste en face.</p>'],
    ['etapes', '<ol><li>Je compte les carreaux entre le point et l’axe, perpendiculairement à l’axe.</li><li>Je reporte le même nombre de carreaux de l’autre côté.</li><li>Je vérifie : le segment [AA’] est perpendiculaire à l’axe et l’axe passe par son milieu.</li></ol>'],
  ]);
})();
