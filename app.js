// The demo deliberately uses generated example data in the browser only.
// It does not call either StockPilot project or read a database.
const guides = {
  warehouse: 'https://github.com/EdChen0321/StockPilot-Warehouse/blob/main/docs/inventory-shipping.md',
  orders: 'https://github.com/EdChen0321/StockPilot-Operations/blob/main/docs/orders-sales.md',
  kol: 'https://github.com/EdChen0321/StockPilot-Operations/blob/main/docs/kol-analysis.md',
};

const integer = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = (items) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = integer(0, i);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const templates = {
  warehouse: [
    () => {
      const total = integer(9, 16);
      const unplaced = integer(2, 4);
      const reserved = integer(1, 2);
      const eligible = total - unplaced - reserved;
      return {
        tag: '庫存可用量',
        title: '庫存有貨，出貨單卻不能全數配貨。',
        facts: [['實體在庫', `${total} 件`], ['未配櫃、未占用', `${unplaced} 件`], ['已配櫃、已占用', `${reserved} 件`]],
        question: '其餘商品都在符合條件的可出貨櫃位。這張新出貨單目前最多能配多少件？',
        options: [
          { text: `${total} 件；實體在庫就是可出貨量`, correct: false },
          { text: `${eligible} 件；先排除未配櫃與已占用`, correct: true },
          { text: `${total - unplaced} 件；已占用也可以再配`, correct: false },
        ],
        answer: `最多 ${eligible} 件。實體在庫、可出貨量與已占用量是不同概念；配貨前必須核對櫃位、品質、包裝和占用狀態。`,
        guide: guides.warehouse,
      };
    },
    () => {
      const total = integer(5, 12);
      return {
        tag: '櫃位資格',
        title: '商品已配櫃，櫃位卻被停用。',
        facts: [['實體在庫', `${total} 件`], ['櫃位狀態', '停用'], ['出貨單', '等待配貨']],
        question: '倉管人員應如何處理這批商品？',
        options: [
          { text: '既然已配櫃，就直接完成出貨', correct: false },
          { text: '先查停用原因並處理櫃位資格，再配貨', correct: true },
          { text: '重新入庫一次，讓數量增加', correct: false },
        ],
        answer: '停用的櫃位不具出貨資格。先查停用原因，安排符合條件的可出貨櫃位，核對品質與包裝後再判斷可用量；不能用重複入庫繞過限制。',
        guide: guides.warehouse,
      };
    },
    () => ({
      tag: '出貨單狀態',
      title: '新建了一張出貨單，但尚未加入商品。',
      facts: [['出貨單號', `WH-${integer(2001, 9999)}`], ['商品明細', '0 筆'], ['目前狀態', '待處理']],
      question: '可以直接把這張出貨單標記為完成嗎？',
      options: [
        { text: '可以，單號存在就代表已完成出貨', correct: false },
        { text: '不行；先加入明細並完成配貨、揀貨與出貨', correct: true },
        { text: '可以，但先在營運系統建立同號訂單', correct: false },
      ],
      answer: '空出貨單不能完成出貨。倉管端自行建立出貨單號，不依賴營運系統；實際出貨仍要有商品明細與作業紀錄。',
      guide: guides.warehouse,
    }),
  ],
  operations: [
    () => {
      const count = integer(18, 45);
      return {
        tag: '匯入確認',
        title: '檔案預檢成功，銷售總覽卻沒有增加。',
        facts: [['預覽訂單', `${count} 筆`], ['預檢結果', '通過'], ['批次狀態', '尚未確認']],
        question: '現在應該如何解讀銷售總覽？',
        options: [
          { text: `立即計入這 ${count} 筆訂單`, correct: false },
          { text: '核對預覽並確認匯入後，才計入有效銷售', correct: true },
          { text: '先同步倉管庫存，報表才會更新', correct: false },
        ],
        answer: '預檢只提供核對，不會把訂單計入銷售。確認匯入後，才到訂單列表與銷售報表核對結果。',
        guide: guides.orders,
      };
    },
    () => {
      const valid = integer(780, 1980);
      const cancelled = integer(420, 920);
      const shipping = integer(60, 120);
      return {
        tag: '銷售口徑',
        title: '訂單裡有取消項目，還有另列運費。',
        facts: [['有效商品折後金額', `NT$ ${valid.toLocaleString('en-US')}`], ['取消訂單商品', `NT$ ${cancelled.toLocaleString('en-US')}`], ['另列運費', `NT$ ${shipping}`]],
        question: '銷售查詢中的有效商品金額應是多少？',
        options: [
          { text: `NT$ ${(valid + cancelled + shipping).toLocaleString('en-US')}`, correct: false },
          { text: `NT$ ${valid.toLocaleString('en-US')}`, correct: true },
          { text: `NT$ ${(valid + cancelled).toLocaleString('en-US')}`, correct: false },
        ],
        answer: '取消訂單不計入有效銷售；商品銷售金額採折後金額，不含另列運費。銷售報表也不代表倉管端的實際出貨量。',
        guide: guides.orders,
      };
    },
    () => ({
      tag: 'KOL 歸屬',
      title: '訂單有來源名稱，但沒有 UTM medium。',
      facts: [['訂單來源', '社群活動'], ['utm_medium', '未填'], ['KOL 設定', '已有多位']],
      question: '這筆訂單應歸到哪位 KOL？',
      options: [
        { text: '依來源名稱猜測最可能的 KOL', correct: false },
        { text: '先列為未歸屬，回查來源資料', correct: true },
        { text: '平均分配給所有 KOL', correct: false },
      ],
      answer: '沒有可核對的 utm_medium，就不推定 KOL 歸屬。未填、未知與已匹配標記應分開查看，避免污染成效統計。',
      guide: guides.kol,
    }),
  ],
};

const state = { mode: 'warehouse', case: null, answered: false, seen: { warehouse: [], operations: [] } };
const content = document.getElementById('case-content');
const answerArea = document.getElementById('answer-area');
const caseCount = document.getElementById('case-count');
const modeButtons = [...document.querySelectorAll('[data-mode]')];

function drawCase() {
  const seen = state.seen[state.mode];
  if (seen.length === templates[state.mode].length) seen.length = 0;
  const available = templates[state.mode].map((_, index) => index).filter((index) => !seen.includes(index));
  const index = available[integer(0, available.length - 1)];
  seen.push(index);
  state.case = templates[state.mode][index]();
  state.case.options = shuffle(state.case.options);
  state.answered = false;
  caseCount.textContent = `${String(seen.length).padStart(2, '0')} / 03`;
  renderCase();
}

function renderCase() {
  const current = state.case;
  content.replaceChildren();
  const header = document.createElement('div');
  header.className = 'case-header';
  header.innerHTML = '<span class="case-kicker"></span><h2 class="case-title"></h2><p class="case-meta">DEMO DATA / 部分情境會變動範例條件</p>';
  header.querySelector('.case-kicker').textContent = current.tag;
  header.querySelector('.case-title').textContent = current.title;
  content.append(header);

  const facts = document.createElement('div');
  facts.className = 'facts';
  for (const [label, value] of current.facts) {
    const fact = document.createElement('div');
    fact.className = 'fact';
    fact.innerHTML = '<span class="fact-label"></span><strong class="fact-value"></strong>';
    fact.querySelector('.fact-label').textContent = label;
    fact.querySelector('.fact-value').textContent = value;
    facts.append(fact);
  }
  content.append(facts);

  const questionLabel = document.createElement('p');
  questionLabel.className = 'question-label';
  questionLabel.textContent = 'YOUR CALL / 你會怎麼判斷？';
  const question = document.createElement('p');
  question.className = 'case-question';
  question.textContent = current.question;
  content.append(questionLabel, question);

  const choices = document.createElement('div');
  choices.className = 'choices';
  choices.setAttribute('role', 'group');
  choices.setAttribute('aria-label', '選擇判斷');
  current.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.className = 'choice';
    button.type = 'button';
    button.innerHTML = `<span class="choice-letter">${String.fromCharCode(65 + index)}.</span><span class="choice-text"></span>`;
    button.querySelector('.choice-text').textContent = option.text;
    button.addEventListener('click', () => revealAnswer(button, option));
    choices.append(button);
  });
  content.append(choices);
  answerArea.replaceChildren();
}

function revealAnswer(selectedButton, selectedOption) {
  if (state.answered) return;
  state.answered = true;
  const buttons = [...content.querySelectorAll('.choice')];
  buttons.forEach((button, index) => {
    button.disabled = true;
    if (state.case.options[index].correct) button.classList.add('is-correct');
  });
  selectedButton.classList.add('is-selected');

  const kicker = document.createElement('p');
  kicker.className = 'answer-kicker';
  kicker.textContent = selectedOption.correct ? '判斷符合規則' : '再看一眼規則';
  const title = document.createElement('p');
  title.className = 'answer-title';
  title.textContent = selectedOption.correct ? '你守住了關鍵界線。' : '正確選項已標出。';
  const copy = document.createElement('p');
  copy.className = 'answer-copy';
  copy.textContent = state.case.answer;
  const source = document.createElement('a');
  source.className = 'source-link';
  source.href = state.case.guide;
  source.textContent = '查看專案操作指南 ↗';
  answerArea.replaceChildren(kicker, title, copy, source);
}

modeButtons.forEach((button) => button.addEventListener('click', () => {
  const nextMode = button.dataset.mode;
  if (nextMode === state.mode) return;
  state.mode = nextMode;
  modeButtons.forEach((item) => {
    const active = item.dataset.mode === nextMode;
    item.classList.toggle('is-active', active);
    item.setAttribute('aria-pressed', String(active));
  });
  drawCase();
}));

document.getElementById('next-case').addEventListener('click', drawCase);
drawCase();
