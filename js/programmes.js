// Official programme versions, per subject, and for each one the class in which every notion is taught.
// The pupil picks a class and, for each subject, a programme version; the Sommaire, the diagnostic and
// the progress page use it. Current versions are derived from the catalogue's `niveau` tags.
(function () {
  'use strict';
  const M = globalThis.M;
  const { subjects, listOf, subjectOf } = M.cat;

  const CLASSES = ['CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e'];
  const HORS = 'hors';

  // Levels from the catalogue tags ('+' = pour aller plus loin, outside the programme), then overrides.
  function fromTags(subject, overrides = {}) {
    const levels = Object.fromEntries(listOf(subject).map(no => [no.id, no.niveau === '+' ? HORS : no.niveau]));
    Object.entries(overrides).forEach(([id, lv]) => {
      if (!(id in levels)) throw new Error(`Unknown ${subject} notion in programme overrides: ${id}`);
      levels[id] = lv;
    });
    return levels;
  }

  const versions = [
    {
      id: '2025', subject: 'maths', label: 'Programmes 2025-2026 (actuels)', short: '2025',
      refs: 'Cycle 3 : BO n° 16 du 17 avril 2025 (6e depuis la rentrée 2025). Cycle 4 : BO n° 10 du 5 mars 2026 (5e depuis la rentrée 2026).',
      levels: fromTags('maths'),
    },
    {
      id: 'pc-2020', subject: 'physique', label: 'Programme en vigueur (2016, ajusté en 2020)', short: '2020',
      refs: 'Cycle 4 (physique-chimie) : BO spécial n° 11 du 26 novembre 2015, version consolidée au BO n° 31 du 30 juillet 2020 ; il couvre la 5e, la 4e et la 3e, les leçons de 5e suivent ses repères de progressivité. Bases de 6e : programme de sciences et technologie du cycle 3 révisé en 2023 (BO du 22 juin 2023), en vigueur en 6e jusqu’en 2026-2027 (nouveau programme : BO n° 24 du 11 juin 2026, en 6e à la rentrée 2027).',
      levels: fromTags('physique'),
    },
    {
      id: 'pc-projet-2025', subject: 'physique', label: 'Projet de programme 2025 (non officiel)', short: 'projet',
      refs: 'Projet de programmes de physique-chimie du cycle 4, Conseil supérieur des programmes, juillet 2025 (consultation en mai-juin 2026, pas encore publié au BO). Écrit classe par classe : la 5e y est macroscopique et qualitative.',
      levels: fromTags('physique', {
        'pc-modele-particulaire': '4e', 'pc-solubilite': '4e', 'pc-vitesse': '4e', 'pc-vitesse-lumiere': '4e',
        'pc-pression': '5e', 'pc-mesure-repetee': '5e', 'pc-frequence-son': '5e', 'pc-niveau-sonore': '5e',
      }),
    },
  ];
  // Older versions are added here: M.programmes.add({ id, subject, label, short, refs, levels: { notionId: class | 'hors' } }).
  const add = v => {
    if (versions.some(x => x.id === v.id)) throw new Error('Programme version twice: ' + v.id);
    if (!M.cat.subjectById(v.subject)) throw new Error('Unknown subject for programme ' + v.id);
    versions.push(v);
  };

  const versionsOf = subject => versions.filter(v => v.subject === subject);
  const byId = id => versions.find(v => v.id === id) || versions[0];
  const levelIn = (versionId, notionId) => byId(versionId).levels[notionId] || HORS;
  // Default: the first (current) version of every subject.
  const DEFAULT = { classe: '6e', versions: Object.fromEntries(subjects.map(s => [s.id, versionsOf(s.id)[0].id])) };
  // Version the target uses for a subject.
  const versionFor = (target, subject) => (target.versions && target.versions[subject]) || DEFAULT.versions[subject];
  // Where a notion stands for a target class: 'avant' (earlier class: must be mastered), 'cible',
  // 'apres' (a later class) or 'hors' (not in that programme).
  function relation(target, notionId) {
    const subj = subjectOf(notionId);
    const lv = subj ? levelIn(versionFor(target, subj.id), notionId) : HORS;
    if (lv === HORS) return 'hors';
    const d = CLASSES.indexOf(lv) - CLASSES.indexOf(target.classe);
    return d < 0 ? 'avant' : d === 0 ? 'cible' : 'apres';
  }
  // Notions to master for a target: its class and every earlier one.
  const inScope = (target, notionId) => ['avant', 'cible'].includes(relation(target, notionId));
  const targetClasses = ['6e', '5e', '4e', '3e'];

  M.programmes = { CLASSES, HORS, versions, add, versionsOf, versionFor, byId, levelIn, relation, inScope, DEFAULT, targetClasses };
})();
