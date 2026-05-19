/* ── BIHEM MATCH ── */
CATS.bihem_match = {
  name: 'Соотнеси пары', desc: 'Свяжи понятия из двух колонок',
  icon: '🔗', bg: '#e1f5ee', fg: '#085041',
  gen() { return { type: 'bihem_match' }; }
};

const BM_PAIRS_ALL = [
  // Пары стали осмысленнее — понятие и его определение/область
  { L:['Дарвин','Ньютон','Менделеев','Фрейд'],    R:['эволюция','гравитация','таблица элементов','бессознательное'], map:{Дарвин:'эволюция',Ньютон:'гравитация',Менделеев:'таблица элементов',Фрейд:'бессознательное'} },
  { L:['Рим','Афины','Карфаген','Вавилон'],        R:['форум','Акрополь','пунические войны','висячие сады'],         map:{Рим:'форум',Афины:'Акрополь',Карфаген:'пунические войны',Вавилон:'висячие сады'} },
  { L:['соната','симфония','фуга','этюд'],         R:['оркестр','учебная пьеса','контрапункт','три части'],          map:{соната:'три части',симфония:'оркестр',фуга:'контрапункт',этюд:'учебная пьеса'} },
  { L:['метафора','метонимия','синекдоха','оксюморон'], R:['часть вместо целого','перенос смежности','живой труп','скрытое сравнение'], map:{метафора:'скрытое сравнение',метонимия:'перенос смежности',синекдоха:'часть вместо целого',оксюморон:'живой труп'} },
  { L:['ДНК','РНК','белок','АТФ'],                R:['энергия клетки','генетический код','транскрипция','катализатор'], map:{ДНК:'генетический код',РНК:'транскрипция',белок:'катализатор',АТФ:'энергия клетки'} },
];

function renderBihemMatch() {
  const lvl = getLvl();
  const p = pick(BM_PAIRS_ALL);
  const n = lvl.id <= 2 ? 3 : 4;
  const LW = shu(p.L).slice(0, n), RW = shu(LW.map(w => p.map[w]));
  STATE.scratch = { p, LW, RW, selL: null, selR: null, found: 0, total: n };

  document.getElementById('task-area').innerHTML = `
    <div class="task-q" style="font-size:16px">Соедини понятие с его определением или областью</div>
    <div class="bihem-wrap">
      <div class="bihem-col"><div class="bihem-hdr">Понятие</div>${LW.map(w=>`<div class="bihem-cell" id="L_${esc(w)}" onclick="bmClick('L','${esc(w)}')">${w}</div>`).join('')}</div>
      <div class="bihem-col"><div class="bihem-hdr">Связь</div>${RW.map(w=>`<div class="bihem-cell" id="R_${esc(w)}" onclick="bmClick('R','${esc(w)}')">${w}</div>`).join('')}</div>
    </div>
    <div class="sc-info" id="bm-prog" style="margin-top:10px;font-size:14px">Совпадений: 0 из ${n}</div>`;
}

function bmClick(side, word) {
  const sc = STATE.scratch;
  if (!sc || STATE.answered) return;
  const el = document.getElementById(side + '_' + word);
  if (!el || el.classList.contains('ok')) return;
  if (side === 'L') {
    if (sc.selL) { const old = document.getElementById('L_' + sc.selL); if (old) old.classList.remove('sel'); }
    sc.selL = word; el.classList.add('sel');
  } else {
    if (sc.selR) { const old = document.getElementById('R_' + sc.selR); if (old) old.classList.remove('sel'); }
    sc.selR = word; el.classList.add('sel');
  }
  if (sc.selL && sc.selR) {
    const lw = sc.selL, rw = sc.selR;
    const ok = sc.p.map[lw] === rw;
    const le = document.getElementById('L_' + lw), re = document.getElementById('R_' + rw);
    if (ok) {
      le.classList.remove('sel'); re.classList.remove('sel');
      le.classList.add('ok'); re.classList.add('ok');
      le.onclick = null; re.onclick = null;
      sc.found++;
      document.getElementById('bm-prog').textContent = `Совпадений: ${sc.found} из ${sc.total}`;
      if (sc.found >= sc.total) {
        STATE.answered = true; STATE.scOk++; STATE.scTot++;
        recordResult(true);
        updScore(); showFb(true, '');
        document.getElementById('nxt-btn').style.display = 'block';
      }
    } else {
      le.classList.remove('sel'); re.classList.remove('sel');
      le.classList.add('no'); re.classList.add('no');
      setTimeout(() => { le.classList.remove('no'); re.classList.remove('no'); }, 500);
    }
    sc.selL = null; sc.selR = null;
  }
}

/* ── BIHEM SEQ ── */
CATS.bihem_seq = {
  name: 'Двойная задача', desc: 'Следи за двумя рядами одновременно',
  icon: '⚡', bg: '#faeeda', fg: '#633806',
  gen() {
    const lvl = getLvl();
    const colors = ['🔴','🔵','🟢','🟡','🟣','🟠'];
    const shapes = ['■','▲','●','◆','★','⬟'];
    const nc = 3 + lvl.id, ns = 3 + lvl.id;
    const cseq = [...Array(nc)].map(() => pick(colors));
    const sseq = [...Array(ns)].map(() => pick(shapes));

    // Уровень 1-2: считаем в одном ряду (без подсветки)
    // Уровень 3-4: два вопроса — ответить нужно на оба
    const cq = r(2) === 0;
    const tgt_seq = cq ? cseq : sseq;
    const tgt = pick(tgt_seq);
    const cnt = tgt_seq.filter(x => x === tgt).length;

    const bothRows = lvl.id >= 3 && r(2) === 0;
    const other_seq = cq ? sseq : cseq;
    const tgt2 = bothRows ? pick(other_seq) : null;
    const cnt2 = tgt2 ? other_seq.filter(x => x === tgt2).length : null;

    const ansVal = bothRows ? cnt2 : cnt;
    const opts = shu([...new Set([ansVal, ansVal+1, Math.max(0,ansVal-1), ansVal+2])].slice(0,4));

    const sz = [32, 30, 28, 26][lvl.id - 1];

    return {
      q: bothRows
        ? `Сколько <b style="font-size:${sz}px">${tgt2}</b> ${cq?'в ряду фигур':'в ряду цветов'}?<br><span style="font-size:13px;color:var(--text3)">(заодно посчитай ${tgt} ${cq?'в цветах':'в фигурах'} — пригодится)</span>`
        : `Сколько раз встречается <b style="font-size:${sz}px">${tgt}</b> ${cq?'в ряду цветов':'в ряду фигур'}?`,
      vis: `
        <div style="margin-bottom:16px">
          <div style="font-size:11px;color:var(--text3);margin-bottom:8px;text-transform:uppercase;letter-spacing:.06em">Цвета</div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;font-size:${sz}px;line-height:1">${cseq.join('')}</div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text3);margin-bottom:8px;text-transform:uppercase;letter-spacing:.06em">Фигуры</div>
          <div style="display:flex;gap:10px;flex-wrap:wrap;font-size:${sz}px;line-height:1">${sseq.join('')}</div>
        </div>`,
      ans: String(ansVal), opts: opts.map(String)
    };
  }
};
