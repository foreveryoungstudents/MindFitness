/* ═══════════════════════════════════════
   CORE — utils, state, engine
═══════════════════════════════════════ */

/* ─── Utils ─── */
const r = (n) => Math.floor(Math.random() * n);
const shu = (a) => [...a].sort(() => Math.random() - 0.5);
const pick = (a) => a[r(a.length)];
const esc = (s) => String(s).replace(/'/g, "&#39;");
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* ─── Difficulty levels ─── */
const LEVELS = [
  { id: 1, label: 'Лёгкий',    emoji: '🟢', timerMul: 1.5,  gridSz: [3,3], seqLen: [4,5], numRange: [5,20],  wordsN: [4,5] },
  { id: 2, label: 'Средний',   emoji: '🟡', timerMul: 1.0,  gridSz: [4,4], seqLen: [5,6], numRange: [10,50], wordsN: [5,6] },
  { id: 3, label: 'Сложный',   emoji: '🟠', timerMul: 0.7,  gridSz: [4,5], seqLen: [6,7], numRange: [15,99], wordsN: [6,7] },
  { id: 4, label: 'Экстрем',   emoji: '🔴', timerMul: 0.45, gridSz: [5,5], seqLen: [7,8], numRange: [20,150],wordsN: [7,8] },
];

/* ─── Global state ─── */
const STATE = {
  level: 2,           // 1–4
  sessCats: [],
  sessIdx: 0,
  curCat: null,
  curTask: null,
  scOk: 0,
  scTot: 0,
  answered: false,
  tim: null,
  timLeft: 30,
  timTotal: 30,
  // per-category task run
  taskIdx: 0,         // 0–4 внутри текущей категории
  taskResults: [],    // массив bool — результат каждой из 5 задач
  // scratch for complex tasks
  scratch: {},
};

function getLvl() { return LEVELS[STATE.level - 1]; }

/* ─── Timer ─── */
function startTimer(baseSec) {
  const sec = Math.round(baseSec * getLvl().timerMul);
  STATE.timLeft = sec;
  STATE.timTotal = sec;
  updateBar(sec, sec);
  clearInterval(STATE.tim);
  STATE.tim = setInterval(() => {
    STATE.timLeft -= 0.1;
    if (STATE.timLeft <= 0) {
      STATE.timLeft = 0;
      clearInterval(STATE.tim);
      if (!STATE.answered) {
        STATE.answered = true;
        STATE.scTot++;
        recordResult(false);
        showFb(false, STATE.curTask.ans || '?');
        updScore();
        document.querySelectorAll('.opt').forEach(b => {
          b.disabled = true;
          if (STATE.curTask.ans && b.textContent.trim() === STATE.curTask.ans)
            b.classList.add('ok');
        });
        document.getElementById('nxt-btn').style.display = 'block';
      }
    }
    updateBar(STATE.timLeft, STATE.timTotal);
  }, 100);
}
function stopTimer() { clearInterval(STATE.tim); updateBar(1, 1); }
function updateBar(left, total) {
  const p = clamp(left / total * 100, 0, 100);
  const bar = document.getElementById('tbar');
  if (!bar) return;
  bar.style.width = p + '%';
  bar.style.background = p > 50 ? '#1d9e75' : p > 25 ? '#ba7517' : '#d85a30';
}

/* ─── Record task result (called by all answer paths) ─── */
function recordResult(ok) {
  STATE.taskResults.push(ok);
}

/* ─── Score ─── */
function updScore() {
  document.getElementById('sc-ok').textContent = STATE.scOk;
  document.getElementById('sc-tot').textContent = STATE.scTot;
}

/* ─── Feedback ─── */
function showFb(ok, ans) {
  const fb = document.getElementById('fb');
  fb.style.display = 'block';
  fb.className = 'feedback ' + (ok ? 'ok' : 'no');
  fb.textContent = ok ? '✓ Верно!' : '✗ Правильный ответ: ' + ans;
}

/* ─── Standard answer check ─── */
function checkAns(btn, val, ans, useOpts) {
  if (STATE.answered) return;
  STATE.answered = true;
  stopTimer();
  STATE.scTot++;
  const ok = val === ans;
  if (ok) STATE.scOk++;
  recordResult(ok);
  if (useOpts) {
    document.querySelectorAll('.opt').forEach(b => {
      b.disabled = true;
      if (b.textContent.trim() === ans) b.classList.add('ok');
    });
  }
  btn.classList.add(ok ? 'ok' : 'no');
  showFb(ok, ans);
  updScore();
  document.getElementById('nxt-btn').style.display = 'block';
}

/* ─── Render standard task ─── */
function renderStd() {
  const t = STATE.curTask;
  document.getElementById('task-area').innerHTML = `
    <div class="task-q">${t.q}</div>
    <div class="task-vis">${t.vis}</div>
    <div class="opts">${t.opts.map(o =>
      `<button class="opt" onclick="checkAns(this,'${esc(o)}','${esc(t.ans)}',true)">${o}</button>`
    ).join('')}</div>`;
}
