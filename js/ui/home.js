// Home (current subject): one "next step" button, streak, progress per domain, badges.
(function () {
  'use strict';
  if (typeof document === 'undefined') return;
  const M = globalThis.M;
  const P = M.progress, UI = M.ui;

  // First launch: ask the pupil's name (kept on this device only).
  UI.welcome = () => {
    const root = UI.render(`<section class="card hero">
      <h1>Bonjour ! 👋</h1>
      <p>Bienvenue dans ton appli de maths et de physique-chimie. Pour commencer, comment tu t’appelles ?</p>
      <form id="name-form" class="row" style="justify-content:center">
        <input type="text" id="name" class="text-input" maxlength="30" autocomplete="off" autocapitalize="words" placeholder="Ton prénom" aria-label="Ton prénom" required>
        <button class="btn primary big">C’est parti ! 🚀</button>
      </form>
      <p><small>Ton prénom reste sur cet appareil, il n’est envoyé nulle part.</small></p>
    </section>`);
    const input = root.querySelector('#name');
    root.querySelector('#name-form').addEventListener('submit', e => {
      e.preventDefault();
      if (!input.value.trim()) { input.focus(); return; }
      M.store.setName(input.value);
      UI.navigate();
    });
    input.focus();
  };

  // Chrono buttons only when the subject has chrono notions.
  const chronoBtn = (cls = 'btn primary big', label = '⚡ Chrono 60 s') => (M.engine.chronoNotions().length ? `<a class="${cls}" href="#/chrono">${label}</a>` : '');

  function nextStepHtml(step, state) {
    // Parts of the bilan: domains with notions in the pupil's target (a domain may have none, e.g. all 5e).
    const name = UI.esc(state.name), subj = UI.subject(), tree = subj.tree.filter(d => P.inScope(state, d.notions).length);
    switch (step.kind) {
      case 'diag': {
        const done = tree.filter(d => P.diagDone(state, d)).length;
        return `<h1>${done ? `On continue le bilan de ${subj.title.toLowerCase()}, ${name} !` : `Bienvenue en ${subj.title.toLowerCase()}, ${name} ! ${subj.icon}`}</h1>
          <p>${done ? `Partie ${done + 1} sur ${tree.length} du bilan de départ.` : `Pour commencer, un petit bilan pour savoir ce que tu maîtrises déjà. Il est en ${tree.length} parties d’environ 10 minutes, à faire quand tu veux.`}</p>
          <a class="btn primary big" href="#/diagnostic/${step.domain.id}">${step.domain.icon} Bilan : ${step.domain.title}</a>`;
      }
      case 'daily':
        return `<h1>On s’entraîne, ${name} ?</h1><p>${M.engine.DAILY_SIZE} questions choisies pour toi : ce qui est à revoir, et un peu de révision.</p>
          <a class="btn primary big" href="#/session">🚀 Entraînement du jour</a>`;
      case 'doneToday': {
        const chrono = chronoBtn();
        return `<h1>Bravo ${name}, entraînement du jour terminé ✓</h1><p>Tu peux encore ${chrono ? 'battre ton record au chrono ou ' : ''}explorer le sommaire.</p>
          <div class="row" style="justify-content:center">${chrono}<a class="btn big" href="#/session">Encore une session</a></div>`;
      }
      default: {
        const chrono = chronoBtn();
        return `<h1>Tout est à jour, ${name} 🎉</h1><p>Aucune notion à revoir aujourd’hui.${chrono ? ' Défie-toi au chrono !' : ''}</p>
          ${chrono || '<a class="btn primary big" href="#/sommaire">📚 Explorer le sommaire</a>'}`;
      }
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
      <section class="card hero">${nextStepHtml(step, state)}<p style="margin-top:14px"><small>🎯 Objectif : ${UI.esc(UI.targetLabel(state))} · <a href="#/bilan">changer</a></small></p></section>
      <div class="grid grid-3" style="margin-top:16px">
        <div class="card stat"><b>${streak ? '🔥 ' + streak : '0'}</b>jour${streak > 1 ? 's' : ''} d’affilée</div>
        <div class="card stat"><b>${M.u.fmt(answered)}</b>réponse${answered > 1 ? 's' : ''}</div>
        <div class="card stat"><b>${earned.length} / ${badges.length}</b>badges</div>
      </div>
      <h2>Ta progression</h2>
      <div class="grid grid-3">
        ${UI.subject().tree.map(d => {
          const p = P.domainProgress(state, d);
          return `<a class="card domain-card" href="#/sommaire" style="text-decoration:none;color:inherit">
            <h3><span>${d.icon} ${d.title}</span><span class="muted">${p.pct} %</span></h3>${UI.barHtml(p.pct)}
            <small>${p.stars} étoiles sur ${p.total}${P.diagDone(state, d) ? '' : ' · bilan à faire'}</small></a>`;
        }).join('')}
      </div>
      <div class="row" style="margin-top:20px">
        <a class="btn" href="#/sommaire">📚 Toutes les leçons</a>
        ${chronoBtn('btn', '⚡ Chrono')}
        <a class="btn" href="#/session">🚀 Session</a>
        <a class="btn" href="#/bilan">📈 Mes progrès</a>
      </div>
      ${earned.length ? `<h2>Tes badges</h2><div class="badges">${earned.map(b => `<div class="badge"><span class="ic">${b.icon}</span><div><b>${b.title}</b><small>${b.desc}</small></div></div>`).join('')}</div>` : ''}
    `);
  });
})();
