// Official programme versions, and for each one the class in which every notion is taught.
// The pupil picks a target (version + class); the Sommaire, the diagnostic and the progress page
// use it. The current version is derived from the catalogue's `niveau` tags.
(function () {
  'use strict';
  const M = globalThis.M;
  const { list } = M.cat;

  const CLASSES = ['CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e'];
  const HORS = 'hors';

  const versions = [
    {
      id: '2025', label: 'Programmes 2025-2026 (actuels)', short: '2025',
      refs: 'Cycle 3 : BO n° 16 du 17 avril 2025 (6e depuis la rentrée 2025). Cycle 4 : BO n° 10 du 5 mars 2026 (5e depuis la rentrée 2026).',
      // From the catalogue tags; '+' (pour aller plus loin) is outside the programme.
      levels: Object.fromEntries(list.map(no => [no.id, no.niveau === '+' ? HORS : no.niveau])),
    },
  ];
  // Older versions are added here: M.programmes.add({ id, label, short, refs, levels: { notionId: class | 'hors' } }).
  const add = v => { if (versions.some(x => x.id === v.id)) throw new Error('Programme version twice: ' + v.id); versions.push(v); };

  const byId = id => versions.find(v => v.id === id) || versions[0];
  const levelIn = (versionId, notionId) => byId(versionId).levels[notionId] || HORS;
  // Where a notion stands for a target class: 'avant' (earlier class: must be mastered), 'cible',
  // 'apres' (a later class) or 'hors' (not in that programme).
  function relation(target, notionId) {
    const lv = levelIn(target.version, notionId);
    if (lv === HORS) return 'hors';
    const d = CLASSES.indexOf(lv) - CLASSES.indexOf(target.classe);
    return d < 0 ? 'avant' : d === 0 ? 'cible' : 'apres';
  }
  // Notions to master for a target: its class and every earlier one.
  const inScope = (target, notionId) => ['avant', 'cible'].includes(relation(target, notionId));
  const DEFAULT = { version: '2025', classe: '6e' };
  const targetClasses = ['6e', '5e', '4e', '3e'];

  M.programmes = { CLASSES, HORS, versions, add, byId, levelIn, relation, inScope, DEFAULT, targetClasses };
})();
