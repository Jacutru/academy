// THE catalogue: domain → chapter → notion. Single source of structure, order, titles and prerequisites.
// Notion content (lesson + generator) is registered separately with M.notion(id, def).
(function () {
  'use strict';
  const M = globalThis.M;

  const N = (id, title, extra = {}) => ({ id, title, niveau: '6e', prereq: [], chrono: false, ...extra });

  const tree = [
    { id: 'nombres', title: 'Nombres & calcul', icon: '🔢', chapters: [
      { id: 'tables', title: 'Tables et calcul mental', notions: [
        N('tables-mult', 'Tables de multiplication', { niveau: 'CE2', chrono: true }),
        N('tables-div', 'Divisions des tables', { niveau: 'CM1', chrono: true, prereq: ['tables-mult'] }),
        N('mult-10', 'Multiplier et diviser par 10, 100, 1 000', { niveau: 'CM1', chrono: true }),
        N('mult-01', 'Multiplier par 0,1 ; 0,01 ; 0,5', { prereq: ['mult-10'] }),
        N('complements', 'Compléments à 10, 100 et 1', { niveau: 'CM1', chrono: true }),
        N('calcul-malin', 'Calcul mental malin (×5, ×9, ×11, ×25…)', { prereq: ['tables-mult', 'mult-10'] }),
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
        N('div-dec', 'Division décimale', { prereq: ['div-euclide'] }),
      ] },
      { id: 'expressions', title: 'Expressions et distributivité', notions: [
        N('priorites', 'Priorités opératoires et parenthèses', { prereq: ['tables-mult'] }),
        N('distributivite', 'Distributivité : développer', { prereq: ['priorites', 'mult-10'] }),
        N('factoriser', 'Distributivité : factoriser', { prereq: ['distributivite'] }),
      ] },
      { id: 'arithmetique', title: 'Multiples et diviseurs', notions: [
        N('multiples', 'Multiples et diviseurs', { prereq: ['tables-div'] }),
        N('divisibilite', 'Critères de divisibilité', { prereq: ['multiples'] }),
      ] },
      { id: 'fractions', title: 'Fractions', notions: [
        N('frac-partage', 'Fraction et partage', { niveau: 'CM1' }),
        N('frac-quotient', 'Fraction et quotient', { prereq: ['frac-partage', 'div-dec'] }),
        N('frac-droite', 'Fractions sur une droite graduée', { prereq: ['frac-partage'] }),
        N('frac-egales', 'Fractions égales et simplification', { prereq: ['frac-partage', 'multiples'] }),
        N('frac-comparer', 'Comparer des fractions', { prereq: ['frac-egales'] }),
        N('frac-somme', 'Additionner et soustraire des fractions', { prereq: ['frac-egales'] }),
        N('frac-quantite', 'Fraction d’une quantité', { prereq: ['frac-partage', 'tables-div'] }),
      ] },
      { id: 'proportionnalite', title: 'Proportionnalité', notions: [
        N('prop-reconnaitre', 'Reconnaître la proportionnalité', { prereq: ['tables-mult'] }),
        N('prop-tableau', 'Compléter un tableau de proportionnalité', { prereq: ['prop-reconnaitre'] }),
        N('pourcentages', 'Pourcentages', { prereq: ['frac-quantite', 'prop-tableau'] }),
        N('echelles', 'Échelles', { prereq: ['prop-tableau', 'conv-longueurs'] }),
      ] },
      { id: 'problemes', title: 'Problèmes', notions: [
        N('problemes', 'Problèmes à plusieurs étapes', { prereq: ['add-sous', 'mult-dec', 'div-euclide'] }),
      ] },
    ] },
    { id: 'mesures', title: 'Grandeurs & mesures', icon: '📏', chapters: [
      { id: 'conversions', title: 'Conversions', notions: [
        N('conv-longueurs', 'Longueurs, masses, contenances', { prereq: ['mult-10'] }),
        N('conv-aires', 'Unités d’aire', { prereq: ['conv-longueurs'] }),
        N('conv-volumes', 'Volumes et contenances', { prereq: ['conv-longueurs'] }),
      ] },
      { id: 'durees', title: 'Durées', notions: [
        N('durees-conv', 'Convertir des durées', { niveau: 'CM2' }),
        N('durees-calc', 'Calculer des durées et des horaires', { prereq: ['durees-conv'] }),
      ] },
      { id: 'figures-mesures', title: 'Périmètres, aires, volumes', notions: [
        N('perimetres', 'Périmètres (et longueur du cercle)', { prereq: ['add-sous', 'mult-dec'] }),
        N('aires', 'Aires (rectangle, triangle, disque)', { prereq: ['mult-dec'] }),
        N('volume-pave', 'Volume du pavé droit et du cube', { prereq: ['mult-dec'] }),
      ] },
    ] },
    { id: 'geometrie', title: 'Espace & géométrie', icon: '📐', chapters: [
      { id: 'figures', title: 'Figures et vocabulaire', notions: [
        N('geo-vocabulaire', 'Droite, segment, demi-droite', { niveau: 'CM2' }),
        N('geo-perp-para', 'Perpendiculaires et parallèles', { prereq: ['geo-vocabulaire'] }),
        N('geo-cercle', 'Cercle : centre, rayon, diamètre'),
        N('geo-quadrilateres', 'Triangles et quadrilatères particuliers', { prereq: ['geo-perp-para'] }),
      ] },
      { id: 'angles', title: 'Angles', notions: [
        N('angles-nature', 'Nature d’un angle'),
        N('angles-mesure', 'Estimer la mesure d’un angle', { prereq: ['angles-nature'] }),
      ] },
      { id: 'symetrie', title: 'Symétrie axiale', notions: [
        N('sym-axes', 'Axes de symétrie d’une figure'),
        N('sym-point', 'Symétrique d’un point sur quadrillage', { prereq: ['sym-axes'] }),
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

  M.cat = { tree, byId, list, domains, content };
})();
