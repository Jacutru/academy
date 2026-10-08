// THE catalogue: domain → chapter → notion. Single source of structure, order, titles and prerequisites.
// Notion content (lesson + generator) is registered separately with M.notion(id, def).
(function () {
  'use strict';
  const M = globalThis.M;

  // negatives: answers may be negative (relative numbers).
  const N = (id, title, extra = {}) => ({ id, title, niveau: '6e', prereq: [], chrono: false, negatives: false, ...extra });

  // niveau: 'CE2' | 'CM1' | 'CM2' | '6e' | '5e' | '4e' | '3e' | '+' ('+' = hors programme actuel).
  // Official references: cycle 3 programme (BO n° 16, 17 April 2025) for 6e; cycle 4 programme
  // (BO n° 10, 5 March 2026) for 5e.
  const tree = [
    { id: 'nombres', title: 'Nombres & calcul', icon: '🔢', chapters: [
      { id: 'entiers', title: 'Nombres entiers', notions: [
        N('grands-nombres', 'Lire et écrire les grands nombres'),
      ] },
      { id: 'tables', title: 'Tables et calcul mental', notions: [
        N('tables-mult', 'Tables de multiplication', { niveau: 'CE2', chrono: true }),
        N('tables-div', 'Divisions des tables', { niveau: 'CM1', chrono: true, prereq: ['tables-mult'] }),
        N('mult-10', 'Multiplier et diviser par 10, 100, 1 000', { niveau: 'CM1', chrono: true }),
        N('mult-01', 'Multiplier par 0,1 ; 0,01 ; 0,5', { prereq: ['mult-10'] }),
        N('complements', 'Compléments à 10, 100 et 1', { niveau: 'CM1', chrono: true }),
        N('calcul-malin', 'Calcul mental malin (×5, ×9, ×11, ×25…)', { niveau: 'CM2', prereq: ['tables-mult', 'mult-10'] }),
      ] },
      { id: 'decimaux', title: 'Nombres décimaux', notions: [
        N('dec-position', 'Valeur des chiffres', { niveau: 'CM2' }),
        N('dec-fraction', 'Écriture décimale et fraction décimale', { prereq: ['dec-position'] }),
        N('dec-comparer', 'Comparer des décimaux', { prereq: ['dec-position'] }),
        N('dec-ranger', 'Ranger des décimaux', { prereq: ['dec-comparer'] }),
        N('dec-arrondir', 'Encadrer et arrondir', { prereq: ['dec-position'] }),
        N('dec-droite', 'Repérer sur une droite graduée', { prereq: ['dec-position'] }),
      ] },
      { id: 'operations', title: 'Opérations', notions: [
        N('ordre-grandeur', 'Ordre de grandeur', { prereq: ['dec-arrondir'] }),
        N('add-sous', 'Additionner et soustraire des décimaux', { prereq: ['dec-position'] }),
        N('mult-dec', 'Multiplier des décimaux', { prereq: ['tables-mult', 'mult-10'] }),
        N('div-euclide', 'Division euclidienne', { niveau: 'CM2', prereq: ['tables-div'] }),
        N('div-dec', 'Division décimale (par un entier)', { prereq: ['div-euclide'] }),
        N('quotient-approche', 'Quotient approché, nombres non décimaux', { prereq: ['div-dec', 'dec-arrondir'] }),
        N('div-par-decimal', 'Diviser par un nombre décimal', { niveau: '5e', prereq: ['div-dec', 'mult-10'] }),
      ] },
      { id: 'fractions', title: 'Fractions', notions: [
        N('frac-partage', 'Fraction et partage', { niveau: 'CM1' }),
        N('fractions-reperes', 'Quarts, demis, nombres mixtes', { prereq: ['frac-partage'] }),
        N('frac-quotient', 'Fraction et quotient', { prereq: ['frac-partage', 'div-dec'] }),
        N('frac-droite', 'Fractions sur une droite graduée', { prereq: ['frac-partage'] }),
        N('frac-egales', 'Fractions égales et simplification', { prereq: ['frac-partage', 'multiples'] }),
        N('frac-comparer', 'Comparer des fractions', { prereq: ['frac-egales'] }),
        N('frac-somme', 'Additionner et soustraire des fractions', { prereq: ['frac-egales'] }),
        N('frac-somme-5e', 'Fractions de dénominateurs quelconques', { niveau: '5e', prereq: ['frac-somme', 'frac-egales'] }),
        N('frac-produit', 'Multiplier des fractions', { niveau: '4e', prereq: ['frac-quantite', 'frac-egales'] }),
        N('frac-quantite', 'Fraction d’une quantité', { prereq: ['frac-partage', 'tables-div'] }),
      ] },
      { id: 'arithmetique', title: 'Multiples, diviseurs, nombres premiers', notions: [
        N('multiples', 'Multiples et diviseurs', { niveau: 'CM2', prereq: ['tables-div'] }),
        N('divisibilite', 'Critères de divisibilité par 2, 5 et 10', { niveau: 'CM2', prereq: ['multiples'] }),
        N('divisibilite-3-9', 'Critères de divisibilité par 3 et 9', { niveau: '5e', prereq: ['divisibilite'] }),
        N('divisibilite-4', 'Critère de divisibilité par 4', { niveau: '+', prereq: ['divisibilite', 'divisibilite-3-9'] }),
        N('criteres-autres', 'Autres critères : 6, 8, 11, 25', { niveau: '+', prereq: ['divisibilite-3-9', 'divisibilite-4'] }),
        N('nombres-premiers', 'Nombres premiers', { niveau: '+', prereq: ['divisibilite-3-9'] }),
        N('pgcd', 'Diviseurs communs et PGCD', { niveau: '+', prereq: ['multiples'] }),
        N('ppcm', 'Multiples communs et PPCM', { niveau: '+', prereq: ['multiples'] }),
      ] },
      { id: 'relatifs', title: 'Nombres relatifs', notions: [
        N('relatifs-reperage', 'Nombres relatifs : repérer, comparer', { niveau: '5e', negatives: true, prereq: ['dec-droite'] }),
        N('relatifs-addition', 'Additionner et soustraire des relatifs', { niveau: '5e', negatives: true, prereq: ['relatifs-reperage'] }),
      ] },
      { id: 'expressions', title: 'Expressions et calcul littéral', notions: [
        N('pre-algebre', 'Motifs et schémas en barres'),
        N('vocabulaire-op', 'Vocabulaire : somme, différence, produit, quotient', { niveau: '5e' }),
        N('priorites', 'Priorités opératoires et parenthèses', { niveau: '5e', prereq: ['tables-mult'] }),
        N('distributivite', 'Distributivité : développer', { niveau: '5e', prereq: ['priorites', 'mult-10'] }),
        N('factoriser', 'Distributivité : factoriser', { niveau: '5e', prereq: ['distributivite'] }),
        N('puissances', 'Carrés, cubes et puissances', { niveau: '5e', prereq: ['tables-mult', 'priorites'] }),
        N('calcul-litteral', 'Calcul littéral : formules et expressions', { niveau: '5e', negatives: true, prereq: ['priorites', 'distributivite'] }),
        N('identites-remarquables', 'Identités remarquables', { niveau: '3e', prereq: ['distributivite', 'puissances', 'calcul-litteral'] }),
        N('equations', 'Résoudre une équation simple', { niveau: '5e', negatives: true, prereq: ['calcul-litteral'] }),
      ] },
      { id: 'proportionnalite', title: 'Proportionnalité', notions: [
        N('prop-reconnaitre', 'Reconnaître la proportionnalité', { prereq: ['tables-mult'] }),
        N('prop-tableau', 'Compléter un tableau de proportionnalité', { prereq: ['prop-reconnaitre'] }),
        N('pourcentages', 'Pourcentages', { prereq: ['frac-quantite', 'prop-tableau'] }),
        N('echelles', 'Échelles', { prereq: ['prop-tableau', 'conv-longueurs'] }),
        N('agrandissement', 'Agrandir ou réduire une figure', { niveau: '+', prereq: ['echelles'] }),
        N('proportionnalite-5e', 'Coefficient et graphique de proportionnalité', { niveau: '5e', prereq: ['prop-tableau'] }),
      ] },
      { id: 'problemes', title: 'Problèmes', notions: [
        N('problemes', 'Problèmes à plusieurs étapes', { prereq: ['add-sous', 'mult-dec', 'div-euclide'] }),
      ] },
      { id: 'informatique', title: 'Pensée informatique', notions: [
        N('programmes', 'Suivre un programme, une suite d’instructions'),
      ] },
    ] },
    { id: 'mesures', title: 'Grandeurs & mesures', icon: '📏', chapters: [
      { id: 'conversions', title: 'Conversions', notions: [
        N('conv-longueurs', 'Longueurs, masses, contenances', { prereq: ['mult-10'] }),
        N('conv-aires', 'Unités d’aire (m², dm², cm²)', { prereq: ['conv-longueurs'] }),
        N('conv-volumes', 'Volumes et contenances', { niveau: '5e', prereq: ['conv-longueurs'] }),
      ] },
      { id: 'durees', title: 'Durées', notions: [
        N('durees-conv', 'Convertir des durées'),
        N('durees-calc', 'Calculer des durées et des horaires', { prereq: ['durees-conv'] }),
      ] },
      { id: 'figures-mesures', title: 'Périmètres, aires, volumes', notions: [
        N('perimetres', 'Périmètres (et longueur du cercle)', { prereq: ['add-sous', 'mult-dec'] }),
        N('aires', 'Aires du carré et du rectangle', { prereq: ['mult-dec'] }),
        N('aires-5e', 'Aires du triangle, du parallélogramme, du disque', { niveau: '5e', prereq: ['aires'] }),
        N('volume-pave', 'Volume : compter des cubes', { prereq: ['tables-mult'] }),
        N('volumes-5e', 'Volumes du pavé, du prisme et du cylindre', { niveau: '5e', prereq: ['volume-pave', 'aires-5e'] }),
      ] },
    ] },
    { id: 'geometrie', title: 'Espace & géométrie', icon: '📐', chapters: [
      { id: 'figures', title: 'Figures et vocabulaire', notions: [
        N('geo-vocabulaire', 'Droite, segment, demi-droite', { niveau: 'CM2' }),
        N('geo-perp-para', 'Perpendiculaires et parallèles', { prereq: ['geo-vocabulaire'] }),
        N('distances', 'Distance, milieu, inégalité triangulaire', { prereq: ['geo-vocabulaire'] }),
        N('mediatrice', 'Médiatrice d’un segment', { prereq: ['geo-perp-para', 'distances'] }),
        N('geo-cercle', 'Cercle : centre, rayon, diamètre, corde'),
        N('geo-quadrilateres', 'Triangles et quadrilatères particuliers', { niveau: 'CM2', prereq: ['geo-perp-para'] }),
        N('parallelogrammes', 'Parallélogrammes', { niveau: '5e', prereq: ['geo-quadrilateres', 'symetrie-centrale'] }),
      ] },
      { id: 'angles', title: 'Angles', notions: [
        N('angles-nature', 'Nature d’un angle'),
        N('angles-vocabulaire', 'Angles adjacents, opposés, supplémentaires', { prereq: ['angles-nature'] }),
        N('angles-mesure', 'Mesurer un angle', { prereq: ['angles-nature'] }),
        N('bissectrice', 'Bissectrice d’un angle', { prereq: ['angles-mesure'] }),
        N('angles-paralleles', 'Angles et droites parallèles', { niveau: '5e', prereq: ['angles-vocabulaire', 'geo-perp-para'] }),
      ] },
      { id: 'triangles', title: 'Triangles', notions: [
        N('triangles-construction', 'Construire un triangle', { prereq: ['distances', 'angles-mesure'] }),
        N('triangles-angles', 'Somme des angles d’un triangle', { prereq: ['angles-mesure', 'geo-quadrilateres'] }),
        N('cercle-circonscrit', 'Cercle circonscrit à un triangle', { prereq: ['mediatrice', 'geo-cercle'] }),
        N('hauteurs-medianes', 'Hauteurs et médianes d’un triangle', { niveau: '5e', prereq: ['geo-perp-para', 'distances'] }),
      ] },
      { id: 'solides', title: 'Solides et espace', notions: [
        N('solides', 'Solides : faces, arêtes, sommets, patrons', { niveau: 'CM2' }),
        N('vues-cubes', 'Assemblages de cubes', { prereq: ['solides'] }),
        N('prismes-cylindres', 'Prismes droits et cylindres : patrons, perspective', { niveau: '5e', prereq: ['solides'] }),
      ] },
      { id: 'symetrie', title: 'Symétries', notions: [
        N('sym-axes', 'Axes de symétrie d’une figure'),
        N('sym-point', 'Symétrique d’un point sur quadrillage', { prereq: ['sym-axes'] }),
        N('symetrie-centrale', 'Symétrie centrale (demi-tour)', { niveau: '5e', prereq: ['sym-point'] }),
      ] },
      { id: 'reperage', title: 'Repérage', notions: [
        N('repere', 'Coordonnées dans un repère', { niveau: '5e', negatives: true, prereq: ['relatifs-reperage'] }),
      ] },
    ] },
    { id: 'donnees', title: 'Données & probabilités', icon: '📊', chapters: [
      { id: 'donnees-lecture', title: 'Données et graphiques', notions: [
        N('donnees', 'Lire un tableau, un diagramme, un graphique'),
        N('statistiques', 'Effectifs, fréquences, moyenne', { niveau: '5e', prereq: ['donnees', 'pourcentages'] }),
        N('stats-classes', 'Regrouper en classes, histogramme', { niveau: '+', prereq: ['statistiques'] }),
        N('fonctions-intro', 'Tableaux de valeurs et graphiques', { niveau: '5e', negatives: true, prereq: ['donnees', 'repere'] }),
      ] },
      { id: 'probas', title: 'Probabilités', notions: [
        N('probabilites', 'Probabilités : une chance sur…', { prereq: ['frac-partage'] }),
        N('probabilites-5e', 'Probabilités : vocabulaire et calculs', { niveau: '5e', prereq: ['probabilites'] }),
      ] },
    ] },
  ];

  // Flat index with parent pointers and computed numbering ("1.4", "1.4.2").
  const byId = {}, list = [];
  tree.forEach((dom, di) => {
    dom.num = String(di + 1);
    dom.notions = [];
    dom.chapters.forEach((ch, ci) => {
      ch.num = `${dom.num}.${ci + 1}`;
      ch.domain = dom;
      ch.notions.forEach((no, ni) => {
        if (byId[no.id]) throw new Error('Duplicate notion id ' + no.id);
        no.num = `${ch.num}.${ni + 1}`;
        no.chapter = ch;
        no.domain = dom;
        no.index = list.length;
        byId[no.id] = no;
        list.push(no);
        dom.notions.push(no);
      });
    });
  });
  const domains = Object.fromEntries(tree.map(d => [d.id, d]));
  // Reverse links ("used by") computed once, for "Voir aussi".
  list.forEach(no => { no.usedBy = []; });
  list.forEach(no => no.prereq.forEach(p => byId[p] && byId[p].usedBy.push(no.id)));

  // Content registry.
  const content = {};
  M.notion = (id, def) => {
    if (content[id]) throw new Error('Notion registered twice: ' + id);
    content[id] = def;
  };

  // Several explanations per notion, each in a "style"; the pupil picks the clearest.
  const STYLES = {
    dessin: { icon: '🖼️', label: 'Avec un dessin' },
    vie: { icon: '🍕', label: 'Dans la vie de tous les jours' },
    etapes: { icon: '🪜', label: 'Pas à pas' },
    lien: { icon: '🔗', label: 'À partir de ce que je sais' },
  };
  const BASE = Symbol('lesson.explication');
  const explanations = {};
  M.explain = (id, variants) => {
    if (explanations[id]) throw new Error('Explanations registered twice: ' + id);
    explanations[id] = variants.map(([style, html]) => ({ style, html }));
  };
  // Resolved list of { style, html } for a notion (BASE → the lesson's own explication).
  const explanationsOf = id => (explanations[id] || []).map(v => ({ style: v.style, html: v.html === BASE ? content[id].lesson.explication : v.html }));

  M.cat = { tree, byId, list, domains, content, STYLES, BASE, explanations, explanationsOf };
})();
