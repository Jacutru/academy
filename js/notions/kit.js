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
  // Ordering of words or steps: items given in the right order, shown shuffled.
  // label: what the pupil orders ("les étapes"); sep: shown between items in the correction.
  function sequence(rng, items, { label, sep = '→', how = 'dans l’ordre' } = {}) {
    let idx = rng.shuffle(items.map((_, i) => i));
    // Never shown already in the right order.
    for (let t = 0; t < 10 && items.length > 1 && idx.every((v, i) => v === i); t++) idx = rng.shuffle(idx);
    return { kind: 'order', items: idx.map(i => items[i]), correct: items.map((_, i) => idx.indexOf(i)), sep, label, how };
  }

  M.kit = { Q, num, choice, fixedChoice, order, sequence };
})();
