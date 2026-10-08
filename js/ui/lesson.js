// Lesson page (also shown in a modal during practice).
(function () {
  'use strict';
  if (typeof document === 'undefined') return;
  const M = globalThis.M;
  const UI = M.ui;
  const { byId, content } = M.cat;

  const list = items => `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
  const links = ids => ids.map(id => `<a href="#/lecon/${id}">${byId[id].num} ${byId[id].title}</a>`).join(' ');

  function lessonHtml(id, { modal = false } = {}) {
    const no = byId[id], L = content[id].lesson;
    return `<article class="lesson">
      ${modal ? '' : `<div class="crumbs"><a href="#/sommaire">Sommaire</a> › ${no.domain.title} › ${no.chapter.title}</div>`}
      <h1>${no.num} · ${no.title} <span class="tag">${no.niveau}</span></h1>
      <section><h2>📌 À retenir</h2><div class="retenir">${L.retenir}</div></section>
      ${L.explication ? `<section><h2>💡 Explication</h2>${L.explication}</section>` : ''}
      <section class="methode"><h2>🛠️ Méthode</h2><ol>${L.methode.map(m => `<li>${m}</li>`).join('')}</ol></section>
      <section><h2>✍️ Exemples corrigés</h2>
        ${L.exemples.map(e => `<div class="exemple"><div class="q">${e.q}</div><div>${e.r}</div></div>`).join('')}
        <div id="more-ex"></div>
        <button class="btn small no-print" data-act="example">🎲 Un autre exemple</button>
      </section>
      ${L.astuces && L.astuces.length ? `<section><h2>🎯 Astuces</h2><div class="astuce">${list(L.astuces)}</div></section>` : ''}
      ${L.erreurs && L.erreurs.length ? `<section><h2>⚠️ Erreurs fréquentes</h2><div class="erreur">${list(L.erreurs)}</div></section>` : ''}
      ${!modal && (no.prereq.length || no.usedBy.length) ? `<section class="links no-print"><h2>🔗 Voir aussi</h2>
        ${no.prereq.length ? `<p><b>À savoir avant :</b> ${links(no.prereq)}</p>` : ''}
        ${no.usedBy.length ? `<p><b>Sert ensuite pour :</b> ${links(no.usedBy)}</p>` : ''}</section>` : ''}
    </article>`;
  }

  // "Un autre exemple": a generated question shown with its worked answer.
  function bindExample(root, id) {
    root.querySelector('[data-act=example]').addEventListener('click', () => {
      const q = M.engine.question(id, 2);
      root.querySelector('#more-ex').innerHTML = `<div class="exemple"><div class="q">${q.prompt}</div><div><b>Réponse :</b> ${M.answer.show(q.answer)}</div><div class="corr">${q.correction}</div></div>`;
    });
  }

  UI.route('lecon/:id', ({ id }) => {
    if (!byId[id] || !content[id]) { location.hash = '#/sommaire'; return; }
    M.store.markSeen(id);
    const no = byId[id];
    const root = UI.render(`<div class="card">${lessonHtml(id)}
      <div class="lesson-actions">
        <a class="btn primary big" href="#/exercice/${id}">✏️ S’entraîner sur cette notion</a>
        ${no.chrono ? `<a class="btn big" href="#/chrono/${id}">⚡ Chrono</a>` : ''}
        <button class="btn" data-act="print">🖨️ Imprimer la fiche</button>
        <a class="btn" href="#/sommaire">← Sommaire</a>
      </div></div>`);
    bindExample(root, id);
    root.querySelector('[data-act=print]').addEventListener('click', () => window.print());
  });

  // Open the lesson over the current exercise without leaving it.
  function showLessonModal(id, onClose) {
    M.store.markSeen(id);
    UI.openModal(lessonHtml(id, { modal: true }), onClose);
    bindExample(document.querySelector('#modal .modal-body'), id);
  }

  M.ui.lessonHtml = lessonHtml;
  M.ui.showLessonModal = showLessonModal;
})();
