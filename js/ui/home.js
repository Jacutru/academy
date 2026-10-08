// Home: one "next step" button, streak, progress per domain, badges.
(function () {
  'use strict';
  if (typeof document === 'undefined') return;
  const M = globalThis.M;
  const P = M.progress, UI = M.ui;

  function nextStepHtml(step) {
    switch (step.kind) {
      case 'diag': {
        const done = M.cat.tree.filter(d => P.diagDone(M.store.read(), d)).length;
        return `<h1>${done ? 'On continue le bilan !' : 'Bienvenue ! 👋'}</h1>
          <p>${done ? `Partie ${done + 1} sur 3 du bilan de départ.` : 'Pour commencer, un petit bilan pour savoir ce que tu maîtrises déjà. Il est en 3 parties d’environ 10 minutes, à faire quand tu veux.'}</p>
          <a class="btn primary big" href="#/diagnostic/${step.domain.id}">${step.domain.icon} Bilan : ${step.domain.title}</a>`;
      }
      case 'daily':
        return `<h1>Prêt pour l’entraînement du jour ?</h1><p>${M.engine.DAILY_SIZE} questions choisies pour toi : ce qui est à revoir, et un peu de révision.</p>
          <a class="btn primary big" href="#/session">🚀 Entraînement du jour</a>`;
      case 'doneToday':
        return `<h1>Entraînement du jour terminé ✓</h1><p>Bravo ! Tu peux encore battre ton record au chrono ou explorer le sommaire.</p>
          <div class="row" style="justify-content:center"><a class="btn primary big" href="#/chrono">⚡ Chrono 60 s</a><a class="btn big" href="#/session">Encore une session</a></div>`;
      default:
        return `<h1>Tout est à jour 🎉</h1><p>Aucune notion à revoir aujourd’hui. Défie-toi au chrono !</p>
          <a class="btn primary big" href="#/chrono">⚡ Chrono 60 s</a>`;
    }
  }

  UI.route('', () => {
    const state = M.store.read();
    const step = M.engine.nextStep(state);
    const streak = P.streak(state.days);
    const badges = P.badges(state);
    const earned = badges.filter(b => b.earned);
    const answered = state.log.length;
    UI.render(`
      <section class="card hero">${nextStepHtml(step)}</section>
      <div class="grid grid-3" style="margin-top:16px">
        <div class="card stat"><b>${streak ? '🔥 ' + streak : '0'}</b>jour${streak > 1 ? 's' : ''} d’affilée</div>
        <div class="card stat"><b>${M.u.fmt(answered)}</b>réponse${answered > 1 ? 's' : ''}</div>
        <div class="card stat"><b>${earned.length} / ${badges.length}</b>badges</div>
      </div>
      <h2>Ta progression</h2>
      <div class="grid grid-3">
        ${M.cat.tree.map(d => {
          const p = P.domainProgress(state, d);
          return `<a class="card domain-card" href="#/sommaire" style="text-decoration:none;color:inherit">
            <h3><span>${d.icon} ${d.title}</span><span class="muted">${p.pct} %</span></h3>${UI.barHtml(p.pct)}
            <small>${p.stars} étoiles sur ${p.total}${P.diagDone(state, d) ? '' : ' · bilan à faire'}</small></a>`;
        }).join('')}
      </div>
      <div class="row" style="margin-top:20px">
        <a class="btn" href="#/sommaire">📚 Toutes les leçons</a>
        <a class="btn" href="#/chrono">⚡ Chrono</a>
        <a class="btn" href="#/session">🚀 Session</a>
        <a class="btn" href="#/bilan">📈 Mes progrès</a>
      </div>
      ${earned.length ? `<h2>Tes badges</h2><div class="badges">${earned.map(b => `<div class="badge"><span class="ic">${b.icon}</span><div><b>${b.title}</b><small>${b.desc}</small></div></div>`).join('')}</div>` : ''}
    `);
  });
})();
