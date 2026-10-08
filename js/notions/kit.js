// Small helpers shared by every notion file.
(function () {
  'use strict';
  const M = globalThis.M;

  const Q = (key, prompt, answer, hint, correction) => ({ key, prompt, answer, hint, correction });
  const num = (value, unit) => (unit ? { kind: 'number', value, unit } : { kind: 'number', value });

  // Multiple choice: correct option + distractors, deduplicated and shuffled.
  function choice(rng, correct, distractors, { keepOrder = false } = {}) {
    const opts = [correct];
    distractors.forEach(d => { if (!opts.includes(d)) opts.push(d); });
    const options = keepOrder ? opts.slice(0, 6) : rng.shuffle(opts.slice(0, 6));
    return { kind: 'choice', options, correct: options.indexOf(correct) };
  }
  // Choice with a fixed list of options (e.g. ['<', '=', '>']).
  const fixedChoice = (options, correct) => ({ kind: 'choice', options, correct: options.indexOf(correct) });

  // Ordering: values (numbers, already in display order) with their display html; ascending unless desc.
  function order(values, render, { desc = false } = {}) {
    const shown = values;
    const sorted = shown.map((v, i) => i).sort((a, b) => (desc ? shown[b] - shown[a] : shown[a] - shown[b]));
    return { kind: 'order', items: shown.map(render), correct: sorted, sep: desc ? '>' : '<' };
  }

  M.kit = { Q, num, choice, fixedChoice, order };
})();
