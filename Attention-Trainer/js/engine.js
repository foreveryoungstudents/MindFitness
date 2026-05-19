/* ═══════════════════════════════════════
   ENGINE — session control + UI shell
═══════════════════════════════════════ */

/* ─── Level picker render ─── */
function renderLevelPicker() {
  document.getElementById('level-picker').innerHTML = LEVELS.map(l => `
    <button class="lvl-btn${STATE.level === l.id ? ' active' : ''}" onclick="setLevel(${l.id})">
      <span class="lvl-emoji">${l.emoji}</span>
      <span class="lvl-label">${l.label}</span>
    </button>`).join('');
}

function setLevel(id) {
  STATE.level = id;
  renderLevelPicker();
}

/* ─── Grid render ─── */
function renderGrid() {
  const root = document.getElementById('grid-root');
  root.innerHTML = SECTIONS.map(sec => `
    <div class="section-label">${sec.label}</div>
    <div class="grid">${sec.cats.map(id => {
      const c = CATS[id];
      return `<div class="card" onclick="openCat('${id}')">
        <div class="card-icon" style="background:${c.bg};color:${c.fg}">${c.icon}</div>
        <div class="card-name">${c.name}</div>
        <div class="card-desc">${c.desc}</div>
      </div>`;
    }).join('')}</div>`).join('');
}

const TASKS_PER_CAT = 5;

/* ─── Open single category ─── */
function openCat(id) {
  STATE.sessCats = [CATS[id]];
  STATE.sessIdx = 0; STATE.scOk = 0; STATE.scTot = 0;
  STATE.taskIdx = 0; STATE.taskResults = [];
  startSess();
}

/* ─── Random set: 5 random categories from all 21 ─── */
function startRandom() {
  const allCatIds = SECTIONS.flatMap(sec => sec.cats);
  STATE.sessCats = shu(allCatIds).slice(0, 5).map(id => CATS[id]);
  STATE.sessIdx = 0; STATE.scOk = 0; STATE.scTot = 0;
  STATE.taskIdx = 0; STATE.taskResults = [];
  startSess();
}

/* ─── Start session ─── */
function startSess() {
  STATE.curCat = STATE.sessCats[STATE.sessIdx];
  document.getElementById('m-title').textContent = STATE.curCat.name;
  setBadge(); updScore(); loadTask();
  document.getElementById('overlay').classList.add('open');
}

function setBadge() {
  const b = document.getElementById('m-badge');
  const total = STATE.sessCats.length;
  b.textContent = total > 1 ? `${STATE.sessIdx + 1}/${total}` : STATE.curCat.name;
  b.style.background = STATE.curCat.bg;
  b.style.color = STATE.curCat.fg;
}

/* ─── Load next task ─── */
function loadTask() {
  STATE.answered = false;
  STATE.scratch = {};
  STATE.curTask = STATE.curCat.gen();

  // Progress label
  const multiCat = STATE.sessCats.length > 1;
  document.getElementById('sess-lbl').textContent = multiCat
    ? `${STATE.sessIdx + 1} из 5 категорий`
    : `Задача ${STATE.taskIdx + 1} из ${TASKS_PER_CAT}`;
  document.getElementById('fb').style.display = 'none';
  document.getElementById('nxt-btn').style.display = 'none';
  document.getElementById('task-area').innerHTML = '';

  const tp = STATE.curTask.type;
  const noAutoTimer = ['schulte','memory','text_attn','diff','bihem_match','bihem_hand','anagram','grid_memory','except','speech_odd'];

  if      (tp === 'schulte')     renderSchulte();
  else if (tp === 'memory')      renderMem1();
  else if (tp === 'text_attn')   renderTextAttn();
  else if (tp === 'diff')        renderDiff();
  else if (tp === 'bihem_match') renderBihemMatch();
  else if (tp === 'bihem_hand')  renderBihemHand();
  else if (tp === 'ghost_game')  renderGhostGame();
  else if (tp === 'anagram')     renderAnagram();
  else if (tp === 'grid_memory') renderGridMemory();
  else if (tp === 'speech_odd')  renderExc();
  else if (tp === 'except')      renderExc();
  else                           renderStd();

  if (!noAutoTimer.includes(tp)) startTimer(35);
  else stopTimer();
}

/* ─── Next task / advance ─── */
function nextTask() {
  const multiCat = STATE.sessCats.length > 1;
  if (multiCat) {
    // режим «Случайный набор»: 1 задача на категорию, затем итог
    STATE.sessIdx++;
    if (STATE.sessIdx < STATE.sessCats.length) {
      STATE.curCat = STATE.sessCats[STATE.sessIdx];
      document.getElementById('m-title').textContent = STATE.curCat.name;
      setBadge(); loadTask();
    } else {
      showSummary();
    }
  } else {
    // одиночная категория: 5 задач подряд
    STATE.taskIdx++;
    if (STATE.taskIdx < TASKS_PER_CAT) {
      loadTask();
    } else {
      showSummary();
    }
  }
}

/* ─── Summary screen ─── */
function showSummary() {
  stopTimer();
  const res = STATE.taskResults; // bool[]
  const okCount = res.filter(Boolean).length;
  const total = res.length;
  const lvl = getLvl();
  const multiCat = STATE.sessCats.length > 1;

  let starsHTML;
  if (multiCat) {
    // звезда + название категории под ней
    starsHTML = res.map((ok, i) => {
      const cat = STATE.sessCats[i];
      return `<div class="sum-star-col">
        <span class="sum-star${ok ? ' sum-star-ok' : ''}"  style="background:${ok?'':cat.bg};color:${ok?'#f0b429':cat.fg}">★</span>
        <span class="sum-star-lbl" style="color:${ok?'var(--text2)':'var(--text3)'};">${cat.icon} ${cat.name}</span>
      </div>`;
    }).join('');
  } else {
    starsHTML = res.map(ok =>
      `<span class="sum-star${ok ? ' sum-star-ok' : ''}">★</span>`
    ).join('');
  }

  const sub = okCount === total ? 'Идеально! 🎉' : okCount >= Math.ceil(total / 2) ? 'Хороший результат' : 'Продолжай тренироваться';

  document.getElementById('task-area').innerHTML = `
    <div class="summary">
      <div class="sum-stars-row${multiCat ? ' sum-stars-cats' : ''}">${starsHTML}</div>
      <div class="summary-score">${okCount} из ${total}</div>
      <div class="summary-sub">${sub}</div>
      <div style="font-size:14px;color:var(--text3);margin-top:6px">Уровень: ${lvl.emoji} ${lvl.label}</div>
      <button class="next-btn" style="margin-top:1.5rem" onclick="closeModal()">Завершить</button>
    </div>`;
  document.getElementById('fb').style.display = 'none';
  document.getElementById('nxt-btn').style.display = 'none';
}

/* ─── Modal close ─── */
function closeModal() {
  stopTimer();
  document.getElementById('overlay').classList.remove('open');
}
function overlayClick(e) {
  if (e.target === document.getElementById('overlay')) closeModal();
}

/* ─── Boot ─── */
document.addEventListener('DOMContentLoaded', () => {
  renderLevelPicker();
  renderGrid();
});
