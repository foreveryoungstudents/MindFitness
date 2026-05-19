/* ═══════════════════════════════════════
   REGISTRY — all categories + sections
   Each category: { name, desc, icon, bg, fg, gen() }
   gen() returns a task object; complex tasks set task.type
═══════════════════════════════════════ */

const SECTIONS = [
  { label: 'Внимание — базовые',          cats: ['stroop','focus','grid_search','diff','oral_math','grid_memory'] },
  { label: 'Таблицы Шульте',              cats: ['schulte5','schulte7','schulte_chaos'] },
  { label: 'Память и последовательности', cats: ['memory','sequence','pattern'] },
  { label: 'Межполушарное взаимодействие',cats: ['bihem_hand','bihem_match','bihem_seq'] },
  { label: 'Речь и словесное внимание',   cats: ['text_attn','anagram','speech_odd'] },
  { label: 'Мышление и логика',           cats: ['analogy','except','matrix_logic'] },
];

/* CATS is populated by each category file */
const CATS = {};
