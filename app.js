const STORAGE_KEY = 'stockpilot-demo-v4';
const productCatalogue = {
  warehouse: [
    { sku: 'WH-001', name: '摺疊收納箱' },
    { sku: 'WH-002', name: '保溫水壺' },
  ],
  operations: [
    { sku: 'OP-001', name: '帆布托特包' },
    { sku: 'OP-002', name: '玻璃隨行杯' },
  ],
};
const pageInfo = {
  warehouse: {
    inventory: ['庫存總覽', '核對實體在庫、未配櫃與目前可出貨件數。'],
    receipts: ['入庫管理', '建立入庫單並確認收貨，商品才會進入實體庫存。'],
    locations: ['櫃位管理', '把已入庫但未配櫃的商品放到可出貨櫃位。'],
    shipments: ['出貨管理', '建立出貨單、加入商品、配貨、揀貨，再完成出貨。'],
    shippingReport: ['出貨總覽', '依實際完成出貨日期核對出貨件數與單據。'],
  },
  operations: {
    orders: ['接收訂單', '建立銷售訂單，核對來源、商品與訂單狀態。'],
    orderImport: ['匯入銷售訂單', '先預檢範例批次，確認後才會納入訂單與銷售。'],
    sales: ['銷售總覽', '依有效訂單查看商品銷售金額與品項數量。'],
    kol: ['KOL 分析', '查看合作夥伴專屬頁、商品與訂單表現，再核對匯入批次。'],
  },
};
const repoUrls = {
  warehouse: 'https://github.com/EdChen0321/StockPilot-Warehouse',
  operations: 'https://github.com/EdChen0321/StockPilot-Operations',
};

function freshData() {
  return {
    warehouse: {
      products: [
        { sku: 'WH-001', available: 6, unplaced: 4, reserved: 0 },
        { sku: 'WH-002', available: 12, unplaced: 0, reserved: 0 },
      ],
      receipts: [{ number: 'RC-1001', source: '示範供應商', sku: 'WH-001', qty: 10, status: 'confirmed' }, { number: 'RC-1000', source: '示範供應商', sku: 'WH-002', qty: 12, status: 'confirmed' }],
      shipments: [{ number: 'SH-0998', channel: '網路商店', sku: 'WH-002', qty: 2, status: 'complete', completed: '2026-11-01' }],
    },
    operations: {
      importBatch: { status: 'none', rows: [
        { number: 'IM-2001', source: '官方網站', sku: 'OP-001', qty: 2, price: 360, utm: 'kol_amy', date: '2026-11-04', status: 'active' },
        { number: 'IM-2002', source: '市集', sku: 'OP-002', qty: 1, price: 550, utm: '', date: '2026-11-04', status: 'active' },
        { number: 'IM-2003', source: '官方網站', sku: 'OP-001', qty: 1, price: 390, utm: 'kol_ben', date: '2026-11-04', status: 'cancelled' },
      ] },
      kols: [
        { id: 'amy', name: 'Amy', platform: 'Instagram', campaign: '秋季生活提案', started: '2026-10-01', utms: ['kol_amy'], note: '示範合作夥伴' },
        { id: 'ben', name: 'Ben', platform: 'YouTube', campaign: '日常選物', started: '2026-10-15', utms: ['kol_ben'], note: '示範合作夥伴' },
      ],
      orders: [
        { number: 'OR-1001', source: '官方網站', sku: 'OP-001', qty: 2, price: 390, utm: 'kol_amy', date: '2026-11-02', status: 'active' },
        { number: 'OR-1002', source: '市集', sku: 'OP-002', qty: 1, price: 560, utm: '', date: '2026-11-03', status: 'active' },
        { number: 'OR-1003', source: '官方網站', sku: 'OP-001', qty: 1, price: 390, utm: 'kol_ben', date: '2026-11-03', status: 'cancelled' },
        { number: 'OR-1004', source: '官方網站', sku: 'OP-002', qty: 3, price: 520, utm: 'kol_amy', date: '2026-11-01', status: 'active' },
        { number: 'OR-1005', source: '快閃活動', sku: 'OP-001', qty: 1, price: 350, utm: '', date: '2026-10-29', status: 'active' },
        { number: 'OR-1006', source: '市集', sku: 'OP-002', qty: 2, price: 540, utm: 'kol_ben', date: '2026-10-28', status: 'active' },
        { number: 'OR-1007', source: '官方網站', sku: 'OP-001', qty: 1, price: 390, utm: 'kol_new', date: '2026-10-25', status: 'active' },
        { number: 'OR-1008', source: '市集', sku: 'OP-001', qty: 2, price: 370, utm: 'kol_ben', date: '2026-10-23', status: 'active' },
      ],
      kolBatch: { status: 'none', rows: [
        { number: 'K-1001', product: '帆布托特包', sku: 'OP-001', qty: 2, amount: 780, utm: 'kol_amy', date: '2026-11-02', source: '官方網站', status: 'active' },
        { number: 'K-1002', product: '玻璃隨行杯', sku: 'OP-002', qty: 1, amount: 560, utm: '', date: '2026-11-03', source: '市集', status: 'active' },
        { number: 'K-1003', product: '帆布托特包', sku: 'OP-001', qty: 1, amount: 390, utm: 'kol_ben', date: '2026-11-03', source: '官方網站', status: 'cancelled' },
        { number: 'K-1004', product: '帆布托特包', sku: 'OP-001', qty: 1, amount: 420, utm: 'kol_new', date: '2026-11-03', source: '官方網站', status: 'active' },
        { number: 'K-1005', product: '玻璃隨行杯', sku: 'OP-002', qty: 2, amount: 1080, utm: 'kol_ben', date: '2026-10-26', source: '市集', status: 'active' },
        { number: 'K-1006', product: '帆布托特包', sku: 'OP-001', qty: 1, amount: 390, utm: 'kol_amy', date: '2026-10-20', source: '官方網站', status: 'active' },
        { number: 'K-1007', product: '玻璃隨行杯', sku: 'OP-002', qty: 1, amount: 560, utm: '', date: '2026-10-18', source: '市集', status: 'active' },
        { number: 'K-1008', product: '帆布托特包', sku: 'OP-001', qty: 2, amount: 740, utm: 'kol_amy', date: '2026-10-12', source: '官方網站', status: 'active' },
        { number: 'K-1009', product: '帆布托特包', sku: 'OP-001', qty: 1, amount: 370, utm: 'kol_ben', date: '2026-10-12', source: '官方網站', status: 'active' },
      ] },
    },
  };
}

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.warehouse?.products && saved?.operations?.orders && saved?.operations?.kolBatch && saved?.operations?.kols && saved?.operations?.importBatch) return saved;
  } catch { /* A damaged local demo state can safely start over. */ }
  return freshData();
}

let data = loadData();
let ui = { mode: 'warehouse', page: 'inventory', form: '', shipmentIndex: -1, search: '', source: '', status: '', start: '', end: '', kolTab: 'list', kolId: '', kolStart: '', kolEnd: '' };
const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const money = (value) => `NT$ ${Number(value).toLocaleString('zh-TW')}`;
const productName = (mode, sku) => productCatalogue[mode].find((item) => item.sku === sku)?.name ?? sku;
const physical = (item) => item.available + item.unplaced + item.reserved;
const badge = (text, tone = '') => `<span class="badge ${tone}">${escapeHtml(text)}</span>`;
const productOptions = (mode, selected = '') => productCatalogue[mode].map((item) => `<option value="${item.sku}" ${item.sku === selected ? 'selected' : ''}>${item.name} · ${item.sku}</option>`).join('');
const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' });
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

function message(text, type = '') {
  const target = $('#message');
  target.textContent = text;
  target.className = `message ${type}`;
  target.hidden = false;
}

function go(page) {
  ui.page = page;
  ui.form = '';
  ui.search = '';
  ui.source = '';
  ui.status = '';
  if (page === 'kol') { ui.kolTab = 'list'; ui.kolId = ''; }
  render();
  $('#main').focus();
}

function renderNav() {
  const pages = Object.entries(pageInfo[ui.mode]);
  $('#module-nav').innerHTML = `<p class="nav-group-title">${ui.mode === 'warehouse' ? '倉管作業' : '營運作業'}</p><div class="nav-list">${pages.map(([key, [name]]) => `<button type="button" data-go="${key}" ${ui.page === key ? 'aria-current="page"' : ''}>${name}</button>`).join('')}</div>`;
  document.querySelectorAll('[data-mode]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.mode === ui.mode)));
  $('#repo-link').href = repoUrls[ui.mode];
}

function render() {
  renderNav();
  const [title, description] = pageInfo[ui.mode][ui.page];
  $('#breadcrumb').textContent = `${ui.mode === 'warehouse' ? '倉管系統' : '營運系統'} / ${title}`;
  $('#page-title').textContent = title;
  $('#page-description').textContent = description;
  $('#message').hidden = true;
  const renderers = {
    inventory: renderInventory,
    receipts: renderReceipts,
    locations: renderLocations,
    shipments: renderShipments,
    shippingReport: renderShippingReport,
    orders: renderOrders,
    orderImport: renderOrderImport,
    sales: renderSales,
    kol: renderKol,
  };
  $('#view').innerHTML = renderers[ui.page]();
  const actions = {
    inventory: '<button class="primary" type="button" data-go="receipts">建立入庫單</button>',
    receipts: '<button class="primary" type="button" data-form="receipt">建立入庫單</button>',
    locations: '<button class="primary" type="button" data-focus="putaway-form">開始配櫃</button>',
    shipments: '<button class="primary" type="button" data-form="shipment">建立出貨單</button>',
    shippingReport: '<button class="secondary" type="button" data-go="shipments">查看出貨單</button>',
    orders: '<button class="primary" type="button" data-form="order">新增訂單</button>',
    orderImport: '<button class="secondary" type="button" data-go="orders">查看訂單</button>',
    sales: '<button class="secondary" type="button" data-go="orders">查看訂單</button>',
    kol: '<button class="primary" type="button" data-kol-tab="imports">Excel 訂單匯入</button>',
  };
  $('#primary-action').innerHTML = actions[ui.page];
}

function stat(label, value, unit = '', accent = false) {
  return `<div class="stat ${accent ? 'accent' : ''}"><span class="stat-label">${label}</span><strong>${value}<span>${unit}</span></strong></div>`;
}

function renderInventory() {
  const products = data.warehouse.products;
  const totals = products.reduce((sum, item) => ({ physical: sum.physical + physical(item), available: sum.available + item.available, unplaced: sum.unplaced + item.unplaced }), { physical: 0, available: 0, unplaced: 0 });
  return `<div class="stat-row">${stat('實體在庫', totals.physical, '件')}${stat('目前可出貨', totals.available, '件', true)}${stat('待配櫃', totals.unplaced, '件')}</div>
    <section class="surface"><div class="surface-header"><h2>商品庫存</h2><button class="secondary" type="button" data-go="locations">查看櫃位</button></div>
    <div class="table-wrap"><table><thead><tr><th>商品 / SKU</th><th class="numeric">實體在庫</th><th class="numeric">待配櫃</th><th class="numeric">已配貨</th><th class="numeric">可出貨</th></tr></thead><tbody>
    ${products.map((item) => `<tr><td><strong>${productName('warehouse', item.sku)}</strong><span class="subtext">${item.sku}</span></td><td class="numeric">${physical(item)}</td><td class="numeric">${item.unplaced}</td><td class="numeric">${item.reserved}</td><td class="numeric"><strong>${item.available}</strong></td></tr>`).join('')}
    </tbody></table></div><p class="form-hint">已入庫的商品須完成配櫃，且所在櫃位符合出貨條件，才能用於配貨。</p></section>`;
}

function renderReceipts() {
  return `${ui.form === 'receipt' ? `<section class="surface"><h2>建立入庫單</h2><form id="receipt-form"><div class="form-grid">
    <label>入庫單號<input name="number" required maxlength="40" placeholder="例如 RC-1002"></label>
    <label>進貨來源<input name="source" required maxlength="80" placeholder="例如 示範供應商"></label>
    <label>商品<select name="sku">${productOptions('warehouse')}</select></label>
    <label>實收件數<input name="qty" type="number" min="1" max="999" value="5" required></label></div>
    <div class="form-actions"><button class="primary" type="submit">保存入庫單</button><button class="secondary" type="button" data-close-form>取消</button></div>
    <p class="form-hint">保存後仍是草稿；按「確認入庫」才會增加實體在庫。</p></form></section>` : ''}
    <section class="surface"><div class="surface-header"><h2>入庫單</h2></div><div class="table-wrap"><table><thead><tr><th>入庫單號</th><th>進貨來源</th><th>商品</th><th class="numeric">實收件數</th><th>入庫狀態</th><th>操作</th></tr></thead><tbody>
    ${data.warehouse.receipts.map((item, index) => `<tr><td><strong>${escapeHtml(item.number)}</strong></td><td>${escapeHtml(item.source)}</td><td>${productName('warehouse', item.sku)}<span class="subtext">${item.sku}</span></td><td class="numeric">${item.qty}</td><td>${item.status === 'confirmed' ? badge('已入庫') : badge('草稿', 'pending')}</td><td><div class="row-actions">${item.status === 'draft' ? `<button type="button" data-action="confirm-receipt" data-index="${index}">確認入庫</button>` : '<span class="subtext">等待或已完成配櫃</span>'}</div></td></tr>`).join('')}
    </tbody></table></div></section>`;
}

function renderLocations() {
  return `<section class="surface"><div class="surface-header"><h2>櫃位</h2></div><div class="table-wrap"><table><thead><tr><th>櫃位</th><th>狀態</th><th>出貨設定</th></tr></thead><tbody>
    <tr><td><strong>A01 · 一般品區</strong></td><td>${badge('已啟用')}</td><td>允許出貨</td></tr>
    <tr><td><strong>B01 · 暫停使用區</strong></td><td>${badge('已停用', 'neutral')}</td><td>不可出貨</td></tr>
    </tbody></table></div></section>
    <section class="surface" id="putaway-form"><div class="surface-header"><h2>配櫃</h2></div><form id="putaway-form-inner"><div class="form-grid">
    <label>商品<select name="sku">${productOptions('warehouse')}</select></label>
    <label>配櫃件數<input name="qty" type="number" min="1" max="999" value="1" required></label>
    <label>目的櫃位<select name="location"><option value="A01">A01 · 一般品區（可出貨）</option><option value="B01">B01 · 暫停使用區</option></select></label>
    </div><div class="form-actions"><button class="primary" type="submit">確認配櫃</button></div><p class="form-hint">只有已入庫、尚未配櫃的商品可配入啟用且允許出貨的櫃位。</p></form></section>
    <section class="surface"><h2>待配櫃商品</h2><div class="table-wrap"><table><thead><tr><th>商品 / SKU</th><th class="numeric">待配櫃件數</th><th class="numeric">目前可出貨</th></tr></thead><tbody>
    ${data.warehouse.products.map((item) => `<tr><td>${productName('warehouse', item.sku)}<span class="subtext">${item.sku}</span></td><td class="numeric">${item.unplaced}</td><td class="numeric">${item.available}</td></tr>`).join('')}
    </tbody></table></div></section>`;
}

function shipmentStatus(item) {
  return item.status === 'complete' ? badge('已完成') : item.status === 'picked' ? badge('已揀貨') : item.status === 'allocated' ? badge('已配貨') : item.status === 'preparing' ? badge('準備中', 'pending') : badge('待加入商品', 'neutral');
}

function renderShipments() {
  const lineShipment = data.warehouse.shipments[ui.shipmentIndex];
  const addLine = ui.form === 'shipment-line' ? `<section class="surface"><h2>${lineShipment?.status === 'preparing' ? '修改出貨商品' : '加入出貨商品'}</h2><p class="inline-note">出貨單 ${escapeHtml(lineShipment?.number)}</p><form id="shipment-line-form"><div class="form-grid"><label>商品<select name="sku">${productOptions('warehouse', lineShipment?.sku)}</select></label><label>出貨件數<input name="qty" type="number" min="1" max="999" value="${lineShipment?.qty || 1}" required></label></div><div class="form-actions"><button class="primary" type="submit">保存商品明細</button><button class="secondary" type="button" data-close-form>取消</button></div></form></section>` : '';
  const newShipment = ui.form === 'shipment' ? `<section class="surface"><h2>建立出貨單</h2><form id="shipment-form"><div class="form-grid"><label>出貨單號<input name="number" required maxlength="40" placeholder="例如 SH-1001"></label><label>出貨通路<input name="channel" required maxlength="80" placeholder="例如 網路商店"></label></div><div class="form-actions"><button class="primary" type="submit">保存出貨單</button><button class="secondary" type="button" data-close-form>取消</button></div><p class="form-hint">出貨單由倉管端自行建立。保存後再加入商品、配貨並完成出貨。</p></form></section>` : '';
  return `${newShipment}${addLine}<section class="surface"><div class="surface-header"><h2>出貨單</h2></div><div class="table-wrap"><table><thead><tr><th>出貨單號</th><th>通路</th><th>商品 / 件數</th><th>狀態</th><th>操作</th></tr></thead><tbody>
    ${data.warehouse.shipments.length ? data.warehouse.shipments.map((item, index) => `<tr><td><strong>${escapeHtml(item.number)}</strong></td><td>${escapeHtml(item.channel)}</td><td>${item.sku ? `${productName('warehouse', item.sku)} · ${item.qty} 件` : '尚未加入商品'}</td><td>${shipmentStatus(item)}</td><td><div class="row-actions">${item.status === 'empty' ? `<button type="button" data-action="add-line" data-index="${index}">加入商品</button>` : item.status === 'preparing' ? `<button type="button" data-action="edit-line" data-index="${index}">修改商品</button><button type="button" data-action="allocate" data-index="${index}">配貨</button>` : item.status === 'allocated' ? `<button type="button" data-action="pick" data-index="${index}">確認揀貨</button>` : item.status === 'picked' ? `<button type="button" data-action="complete" data-index="${index}">完成出貨</button>` : '<span class="subtext">已完成</span>'}</div></td></tr>`).join('') : '<tr><td colspan="5" class="empty">尚無出貨單。按「建立出貨單」開始操作。</td></tr>'}
    </tbody></table></div></section>`;
}

function renderShippingReport() {
  const completed = data.warehouse.shipments.filter((item) => item.status === 'complete' && (!ui.shippingStart || item.completed >= ui.shippingStart) && (!ui.shippingEnd || item.completed <= ui.shippingEnd));
  const qty = completed.reduce((sum, item) => sum + item.qty, 0);
  return `<section class="surface"><form id="shipping-report-form" class="filter-row"><label>開始日期<input name="start" type="date" value="${ui.shippingStart || ''}"></label><label>結束日期<input name="end" type="date" value="${ui.shippingEnd || ''}"></label><button class="secondary" type="submit">查詢出貨</button></form><p class="inline-note">依完成出貨日期統計；不包含尚在配貨或揀貨的單據，也不代表營運端下單日銷售。</p></section><div class="stat-row">${stat('完成出貨單', completed.length, '張', true)}${stat('實際出貨', qty, '件')}${stat('待完成', data.warehouse.shipments.filter((item) => item.status !== 'complete').length, '張')}</div><section class="surface"><h2>完成出貨明細</h2><div class="table-wrap"><table><thead><tr><th>出貨單號</th><th>完成日期</th><th>通路</th><th>商品</th><th class="numeric">件數</th></tr></thead><tbody>${completed.length ? completed.map((item) => `<tr><td>${escapeHtml(item.number)}</td><td>${item.completed}</td><td>${escapeHtml(item.channel)}</td><td>${productName('warehouse', item.sku)}</td><td class="numeric">${item.qty}</td></tr>`).join('') : '<tr><td colspan="5" class="empty">目前期間沒有已完成出貨單。</td></tr>'}</tbody></table></div></section>`;
}

function orderStatus(item) { return item.status === 'active' ? badge('有效') : badge('已取消', 'neutral'); }
function renderOrders() {
  const keyword = ui.search.trim().toLowerCase();
  const orders = data.operations.orders.map((item, index) => ({ ...item, index })).filter((item) => (!keyword || `${item.number} ${item.sku} ${productName('operations', item.sku)}`.toLowerCase().includes(keyword)) && (!ui.source || item.source === ui.source) && (!ui.status || item.status === ui.status));
  return `${ui.form === 'order' ? `<section class="surface"><h2>新增訂單</h2><form id="order-form"><div class="form-grid">
    <label>訂單來源<select name="source"><option>官方網站</option><option>市集</option><option>快閃活動</option></select></label>
    <label>訂單編號<input name="number" required maxlength="40" placeholder="例如 OR-1004"></label>
    <label>下單日期<input name="date" type="date" value="${today()}" required></label>
    <label>商品<select name="sku">${productOptions('operations')}</select></label>
    <label>數量<input name="qty" type="number" min="1" max="999" value="1" required></label>
    <label>單件商品折後金額（TWD）<input name="price" type="number" min="0" max="999999" value="390" required></label>
    <label>UTM medium（選填）<input name="utm" maxlength="80" placeholder="例如 kol_amy；未知請留白"></label>
    </div><div class="form-actions"><button class="primary" type="submit">保存訂單</button><button class="secondary" type="button" data-close-form>取消</button></div><p class="form-hint">這裡只建立營運系統的訂單，不會自動產生倉管出貨單。</p></form></section>` : ''}
    <section class="surface"><div class="surface-header"><h2>已接收訂單</h2></div>
    <form id="order-search-form" class="filter-row"><label>搜尋訂單<input name="search" type="search" value="${escapeHtml(ui.search)}" placeholder="訂單編號、商品或 SKU"></label><label>來源<select name="source"><option value="">全部來源</option><option ${ui.source === '官方網站' ? 'selected' : ''}>官方網站</option><option ${ui.source === '市集' ? 'selected' : ''}>市集</option><option ${ui.source === '快閃活動' ? 'selected' : ''}>快閃活動</option></select></label><label>狀態<select name="status"><option value="">全部狀態</option><option value="active" ${ui.status === 'active' ? 'selected' : ''}>有效</option><option value="cancelled" ${ui.status === 'cancelled' ? 'selected' : ''}>已取消</option></select></label><button class="secondary" type="submit">查詢訂單</button></form>
    <div class="table-wrap"><table><thead><tr><th>來源 / 訂單</th><th>商品</th><th class="numeric">商品金額</th><th>UTM medium</th><th>狀態</th><th>操作</th></tr></thead><tbody>
    ${orders.length ? orders.map((item) => `<tr><td><strong>${escapeHtml(item.number)}</strong><span class="subtext">${escapeHtml(item.source)} · ${escapeHtml(item.date)}</span></td><td>${productName('operations', item.sku)} × ${item.qty}<span class="subtext">${item.sku}</span></td><td class="numeric">${money(item.qty * item.price)}</td><td>${item.utm ? escapeHtml(item.utm) : '未填'}</td><td>${orderStatus(item)}</td><td><div class="row-actions">${item.status === 'active' ? `<button type="button" data-action="cancel-order" data-index="${item.index}">取消訂單</button>` : '<span class="subtext">保留紀錄</span>'}</div></td></tr>`).join('') : '<tr><td colspan="6" class="empty">找不到符合條件的訂單。</td></tr>'}
    </tbody></table></div></section>`;
}

function filteredSalesOrders() {
  return data.operations.orders.filter((item) => item.status === 'active' && (!ui.start || item.date >= ui.start) && (!ui.end || item.date <= ui.end));
}
function renderOrderImport() {
  const batch = data.operations.importBatch;
  const active = batch.rows.filter((item) => item.status === 'active');
  return `<section class="surface"><div class="surface-header"><h2>合成訂單範例批次</h2>${badge(batch.status === 'none' ? '尚未預檢' : batch.status === 'preview' ? '待確認' : '已確認', batch.status === 'preview' ? 'pending' : '')}</div><p class="inline-note">原系統可上傳 Excel 或標準 CSV；此網站用內建範例展示預檢與確認順序，不處理訪客上傳檔案。確認前不計入銷售，也不會產生倉管出貨單。</p><div class="form-actions">${batch.status === 'none' ? '<button class="primary" type="button" data-action="preview-orders">載入範例並預檢</button>' : batch.status === 'preview' ? '<button class="primary" type="button" data-action="confirm-orders">確認匯入訂單</button>' : '<button class="secondary" type="button" data-go="orders">核對接收訂單</button>'}</div></section>${batch.status !== 'none' ? `<div class="stat-row">${stat('範例訂單', batch.rows.length, '筆')}${stat('有效訂單', active.length, '筆', true)}${stat('取消訂單', batch.rows.length - active.length, '筆')}</div><section class="surface"><h2>${batch.status === 'preview' ? '預檢明細' : '已匯入明細'}</h2><div class="table-wrap"><table><thead><tr><th>訂單 / 日期</th><th>來源</th><th>商品</th><th>UTM medium</th><th>狀態</th><th class="numeric">商品金額</th></tr></thead><tbody>${batch.rows.map((item) => `<tr><td>${item.number}<span class="subtext">${item.date}</span></td><td>${item.source}</td><td>${productName('operations', item.sku)} × ${item.qty}</td><td>${item.utm || '未填'}</td><td>${orderStatus(item)}</td><td class="numeric">${money(item.qty * item.price)}</td></tr>`).join('')}</tbody></table></div><p class="form-hint">取消訂單保留紀錄，不計入有效銷售；同一批次只能確認一次。</p></section>` : ''}`;
}
function renderSales() {
  const orders = filteredSalesOrders();
  const total = orders.reduce((sum, item) => sum + item.qty * item.price, 0);
  const quantity = orders.reduce((sum, item) => sum + item.qty, 0);
  const byProduct = productCatalogue.operations.map((product) => ({ ...product, amount: orders.filter((item) => item.sku === product.sku).reduce((sum, item) => sum + item.qty * item.price, 0) }));
  const max = Math.max(1, ...byProduct.map((item) => item.amount));
  return `<section class="surface"><form id="sales-filter-form" class="filter-row"><label>開始日期<input name="start" type="date" value="${ui.start}"></label><label>結束日期<input name="end" type="date" value="${ui.end}"></label><button class="secondary" type="submit">查詢銷售</button></form><p class="inline-note">依下單日期統計有效訂單；商品金額不含另列稅與運費。</p></section>
    <div class="stat-row">${stat('商品銷售金額', money(total), '', true)}${stat('有效訂單', orders.length, '筆')}${stat('銷售品項', quantity, '件')}</div>
    <section class="surface"><h2>商品銷售</h2>${byProduct.map((item) => `<div class="bar-row"><strong>${item.name}</strong><div class="bar-track"><div class="bar-fill" style="width:${Math.round(item.amount / max * 100)}%"></div></div><span class="bar-value">${money(item.amount)}</span></div>`).join('')}</section>
    <section class="surface"><h2>有效訂單明細</h2><div class="table-wrap"><table><thead><tr><th>訂單</th><th>下單日期</th><th>商品</th><th class="numeric">件數</th><th class="numeric">商品金額</th></tr></thead><tbody>
    ${orders.length ? orders.map((item) => `<tr><td>${escapeHtml(item.number)}<span class="subtext">${escapeHtml(item.source)}</span></td><td>${escapeHtml(item.date)}</td><td>${productName('operations', item.sku)}</td><td class="numeric">${item.qty}</td><td class="numeric">${money(item.qty * item.price)}</td></tr>`).join('') : '<tr><td colspan="5" class="empty">目前期間沒有有效訂單。</td></tr>'}
    </tbody></table></div></section>`;
}

function kolGroup(item) {
  if (!item.utm) return 'general';
  return data.operations.kols.find((kol) => kol.utms.includes(item.utm) && item.date >= kol.started)?.id || 'unattributed';
}
function attribution(item) {
  if (item.status === 'cancelled') return ['已排除', 'neutral'];
  const group = kolGroup(item);
  if (group === 'general') return ['一般訂單', 'neutral'];
  if (group === 'unattributed') return ['待確認歸屬', 'pending'];
  return [data.operations.kols.find((kol) => kol.id === group).name, ''];
}
const kolRows = () => data.operations.kolBatch.status === 'confirmed' ? data.operations.kolBatch.rows : [];
const activeKolRows = (id, rows = kolRows()) => rows.filter((item) => item.status === 'active' && kolGroup(item) === id && (!ui.kolStart || item.date >= ui.kolStart) && (!ui.kolEnd || item.date <= ui.kolEnd));
const kolAmount = (rows) => rows.reduce((sum, item) => sum + item.amount, 0);
function kolTabs() {
  return `<nav class="tab-nav" aria-label="KOL 分析功能">${[['list', 'KOL 名單'], ['statistics', '整體表現統計'], ['imports', 'Excel 訂單匯入']].map(([id, label]) => `<button type="button" data-kol-tab="${id}" ${ui.kolTab === id || ui.kolTab === 'detail' && id === 'list' ? 'aria-current="page"' : ''}>${label}</button>`).join('')}</nav>`;
}
function kolFilter() {
  return `<section class="surface"><form id="kol-filter-form" class="filter-row"><label>開始日期<input name="start" type="date" value="${ui.kolStart}"></label><label>結束日期<input name="end" type="date" value="${ui.kolEnd}"></label><button class="secondary" type="submit">查詢期間</button></form><p class="inline-note">目前條件：${ui.kolStart || '不限'} ～ ${ui.kolEnd || '不限'}。僅統計已確認批次中的有效訂單。</p></section>`;
}
function kolOrdersTable(rows) {
  return `<div class="table-wrap"><table><thead><tr><th>訂單 / 日期</th><th>來源</th><th>商品</th><th>UTM medium</th><th>狀態</th><th class="numeric">訂單金額</th></tr></thead><tbody>${rows.length ? rows.map((item) => `<tr><td><strong>${escapeHtml(item.number)}</strong><span class="subtext">${item.date}</span></td><td>${escapeHtml(item.source)}</td><td>${escapeHtml(item.product)} × ${item.qty}</td><td>${escapeHtml(item.utm || '未填')}</td><td>${badge(...attribution(item))}</td><td class="numeric">${money(item.amount)}</td></tr>`).join('') : '<tr><td colspan="6" class="empty">目前條件沒有訂單。</td></tr>'}</tbody></table></div>`;
}
function renderKolList() {
  const partners = data.operations.kols;
  return `${kolFilter()}<section class="surface"><div class="surface-header"><h2>合作夥伴</h2><button class="secondary" type="button" data-form="kol">新增 KOL</button></div>${ui.form === 'kol' ? `<form id="kol-form"><div class="form-grid"><label>KOL 名稱<input name="name" maxlength="80" required></label><label>平台<input name="platform" maxlength="80" required></label><label>活動名稱<input name="campaign" maxlength="80" required></label><label>合作開始日期<input name="started" type="date" required></label><label>UTM medium<input name="utm" maxlength="80" required></label><label>備註<input name="note" maxlength="160"></label></div><div class="form-actions"><button class="primary" type="submit">保存 KOL</button><button class="secondary" type="button" data-close-form>取消</button></div><p class="form-hint">保存後，已確認批次的歸屬會依 UTM 與合作開始日期重新計算；來源訂單保留。</p></form>` : `<div class="table-wrap"><table><thead><tr><th>夥伴名稱</th><th>活動 / 平台</th><th>UTM medium</th><th class="numeric">有效訂單</th><th class="numeric">訂單總金額</th><th>操作</th></tr></thead><tbody>${partners.map((kol) => { const rows = activeKolRows(kol.id); return `<tr><td><strong>${escapeHtml(kol.name)}</strong></td><td>${escapeHtml(kol.campaign)}<span class="subtext">${escapeHtml(kol.platform)}</span></td><td>${kol.utms.map(escapeHtml).join('、')}</td><td class="numeric">${rows.length}</td><td class="numeric">${money(kolAmount(rows))}</td><td><button type="button" class="table-link" data-kol-id="${escapeHtml(kol.id)}">檢視專屬頁</button></td></tr>`; }).join('')}</tbody></table></div>`}</section><section class="surface"><h2>訂單歸屬分類（非 KOL）</h2><p class="inline-note">一般訂單沒有 UTM；待確認歸屬有 UTM 但未匹配合作夥伴，或早於合作開始。</p><div class="classification-row">${[['general', '一般訂單'], ['unattributed', '待確認歸屬']].map(([id, name]) => `<button type="button" data-kol-id="${id}"><strong>${name}</strong><span>${activeKolRows(id).length} 筆有效訂單 · ${money(kolAmount(activeKolRows(id)))}</span></button>`).join('')}</div></section>`;
}
function renderKolStatistics() {
  const rows = kolRows().filter((item) => item.status === 'active' && (!ui.kolStart || item.date >= ui.kolStart) && (!ui.kolEnd || item.date <= ui.kolEnd));
  const groups = [...data.operations.kols.map((kol) => [kol.id, kol.name]), ['general', '一般訂單'], ['unattributed', '待確認歸屬']];
  return `${kolFilter()}<div class="stat-row">${stat('有效訂單', rows.length, '筆', true)}${stat('訂單總金額', money(kolAmount(rows)))}${stat('平均訂單金額', rows.length ? money(Math.round(kolAmount(rows) / rows.length)) : '—')}</div><section class="surface"><h2>夥伴與分類表現</h2><p class="inline-note">KOL、一般訂單與待確認歸屬分列；此處只計 KOL 範例批次，不與營運銷售總覽相加。</p><div class="table-wrap"><table><thead><tr><th>夥伴 / 分類</th><th class="numeric">有效訂單</th><th class="numeric">訂單總金額</th><th class="numeric">平均訂單金額</th><th>操作</th></tr></thead><tbody>${groups.map(([id, name]) => { const groupRows = activeKolRows(id); return `<tr><td><strong>${escapeHtml(name)}</strong></td><td class="numeric">${groupRows.length}</td><td class="numeric">${money(kolAmount(groupRows))}</td><td class="numeric">${groupRows.length ? money(Math.round(kolAmount(groupRows) / groupRows.length)) : '—'}</td><td><button type="button" class="table-link" data-kol-id="${id}">查看明細</button></td></tr>`; }).join('')}</tbody></table></div></section>`;
}
function renderKolDetail() {
  const id = ui.kolId;
  const kol = data.operations.kols.find((item) => item.id === id);
  if (!kol && !['general', 'unattributed'].includes(id)) return renderKolList();
  const name = kol?.name || (id === 'general' ? '一般訂單' : '待確認歸屬');
  const rows = activeKolRows(id);
  const products = [...new Set(rows.map((item) => item.sku))].map((sku) => { const items = rows.filter((item) => item.sku === sku); return { name: items[0].product, sku, qty: items.reduce((sum, item) => sum + item.qty, 0), count: items.length, amount: kolAmount(items) }; });
  return `<div class="detail-back"><button type="button" class="table-link" data-kol-tab="list">← KOL 名單</button><span> / ${escapeHtml(name)}</span></div><div class="detail-heading"><h2>${escapeHtml(name)}</h2>${kol ? `<span>${escapeHtml(kol.platform)} · ${escapeHtml(kol.campaign)}</span>` : '<span>系統固定分類，不能修改</span>'}</div><nav class="tab-nav sub-tabs" aria-label="KOL 專屬頁資料"><button type="button" data-kol-sub="orders" ${ui.kolSub !== 'products' ? 'aria-current="page"' : ''}>訂單概況與明細</button><button type="button" data-kol-sub="products" ${ui.kolSub === 'products' ? 'aria-current="page"' : ''}>商品銷售統計</button></nav>${kol ? `<section class="surface"><h2>KOL 資訊</h2><div class="info-grid"><span>活動名稱<strong>${escapeHtml(kol.campaign)}</strong></span><span>平台<strong>${escapeHtml(kol.platform)}</strong></span><span>合作開始<strong>${kol.started}</strong></span><span>UTM medium<strong>${kol.utms.map(escapeHtml).join('、')}</strong></span></div>${kol.note ? `<p class="form-hint">備註：${escapeHtml(kol.note)}</p>` : ''}</section>` : `<section class="surface"><p class="inline-note">${id === 'general' ? '沒有 UTM 的訂單固定歸入一般訂單。' : '有 UTM 但未匹配 KOL，或早於合作開始的訂單，列為待確認歸屬。'}</p></section>`}${kolFilter()}<div class="stat-row">${stat('有效訂單', rows.length, '筆', true)}${stat('訂單總金額', money(kolAmount(rows)))}${stat('平均訂單金額', rows.length ? money(Math.round(kolAmount(rows) / rows.length)) : '—')}</div>${ui.kolSub === 'products' ? `<section class="surface"><h2>商品銷售統計</h2><div class="table-wrap"><table><thead><tr><th>商品 / SKU</th><th class="numeric">數量</th><th class="numeric">有效訂單</th><th class="numeric">商品明細金額</th></tr></thead><tbody>${products.length ? products.map((item) => `<tr><td>${escapeHtml(item.name)}<span class="subtext">${escapeHtml(item.sku)}</span></td><td class="numeric">${item.qty}</td><td class="numeric">${item.count}</td><td class="numeric">${money(item.amount)}</td></tr>`).join('') : '<tr><td colspan="4" class="empty">目前期間沒有商品資料。</td></tr>'}</tbody></table></div></section>` : `<section class="surface"><h2>相關訂單</h2>${kolOrdersTable(rows)}</section>`}`;
}
function renderKolImports() {
  const batch = data.operations.kolBatch;
  if (batch.status === 'none') return `<section class="surface"><h2>KOL 訂單範例批次</h2><p class="inline-note">原專案使用 KOL 訂單 Excel：先上傳預覽，核對排除與 UTM，再確認匯入。這裡提供一份內建合成範例供操作。</p><div class="form-actions"><button class="primary" type="button" data-action="preview-kol">載入範例批次並預覽</button></div></section>`;
  const rows = batch.rows;
  const matched = rows.filter((item) => item.status === 'active' && !['general', 'unattributed'].includes(kolGroup(item)));
  const unknown = rows.filter((item) => item.status === 'active' && kolGroup(item) === 'unattributed');
  const missing = rows.filter((item) => item.status === 'active' && kolGroup(item) === 'general');
  return `<section class="surface"><div class="surface-header"><h2>範例批次 ${batch.status === 'preview' ? badge('待確認', 'pending') : badge('已確認')}</h2>${batch.status === 'preview' ? '<button class="primary" type="button" data-action="confirm-kol">確認匯入</button>' : ''}</div><p class="inline-note">${batch.status === 'preview' ? '目前僅為預覽，尚未計入 KOL 統計。請先核對排除資料與 UTM。' : '此批次已確認，以下統計只來自這份 KOL 範例批次，未與一般銷售訂單加總。'}</p></section>${batch.status === 'confirmed' ? `<div class="stat-row">${stat('已匹配 KOL', matched.length, '筆', true)}${stat('一般訂單', missing.length, '筆')}${stat('待確認歸屬', unknown.length, '筆')}</div>` : ''}<section class="surface"><h2>${batch.status === 'preview' ? '匯入預覽' : 'KOL 訂單明細'}</h2>${kolOrdersTable(rows)}<p class="form-hint">已取消訂單排除；未填與未知 UTM 分開核對。合作開始前的訂單列入待確認歸屬。</p></section>`;
}
function renderKol() {
  return `${kolTabs()}${ui.kolTab === 'statistics' ? renderKolStatistics() : ui.kolTab === 'imports' ? renderKolImports() : ui.kolTab === 'detail' ? renderKolDetail() : renderKolList()}`;
}

function formValues(form) { return Object.fromEntries(new FormData(form).entries()); }
function positiveInteger(value) { const number = Number(value); return Number.isInteger(number) && number > 0 && number <= 999 ? number : null; }

function submitForm(event) {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  event.preventDefault();
  const values = formValues(form);
  if (form.id === 'receipt-form') {
    const qty = positiveInteger(values.qty);
    const number = values.number.trim();
    if (!qty || !number) return message('請填入有效的單號與實收件數。', 'error');
    if (data.warehouse.receipts.some((item) => item.number === number)) return message('入庫單號已存在，請核對原單。', 'error');
    data.warehouse.receipts.unshift({ number, source: values.source.trim(), sku: values.sku, qty, status: 'draft' });
    ui.form = '';
    save(); render(); message(`入庫單 ${number} 已保存為草稿，請確認入庫。`);
  } else if (form.id === 'putaway-form-inner') {
    const qty = positiveInteger(values.qty);
    const product = data.warehouse.products.find((item) => item.sku === values.sku);
    if (!qty || qty > product.unplaced) return message(`配櫃件數超過待配櫃數量（${product.unplaced} 件）。`, 'error');
    if (values.location !== 'A01') return message('B01 已停用，不能作為可出貨櫃位。', 'error');
    product.unplaced -= qty; product.available += qty;
    save(); render(); message(`${productName('warehouse', product.sku)} 已配入 A01，新增 ${qty} 件可出貨量。`);
  } else if (form.id === 'shipment-form') {
    const number = values.number.trim();
    if (!number) return message('請填寫出貨單號。', 'error');
    if (data.warehouse.shipments.some((item) => item.number === number)) return message('出貨單號已存在，請搜尋原單。', 'error');
    data.warehouse.shipments.unshift({ number, channel: values.channel.trim(), sku: '', qty: 0, status: 'empty' });
    ui.form = '';
    save(); render(); message(`出貨單 ${number} 已建立，請加入商品。`);
  } else if (form.id === 'shipment-line-form') {
    const qty = positiveInteger(values.qty);
    const shipment = data.warehouse.shipments[ui.shipmentIndex];
    if (!shipment || !['empty', 'preparing'].includes(shipment.status) || !qty) return message('請填寫有效的商品與出貨件數。', 'error');
    shipment.sku = values.sku; shipment.qty = qty; shipment.status = 'preparing';
    ui.form = '';
    save(); render(); message(`${shipment.number} 已加入商品，請核對可出貨量後配貨。`);
  } else if (form.id === 'order-form') {
    const qty = positiveInteger(values.qty);
    const price = Number(values.price);
    const number = values.number.trim();
    if (!number || !qty || !Number.isFinite(price) || price < 0 || price > 999999) return message('請核對訂單編號、數量與商品金額。', 'error');
    if (data.operations.orders.some((item) => item.number === number)) return message('訂單編號已存在，請搜尋原單。', 'error');
    data.operations.orders.unshift({ number, source: values.source, sku: values.sku, qty, price, utm: values.utm.trim(), date: values.date, status: 'active' });
    ui.form = '';
    save(); render(); message(`訂單 ${number} 已保存，可到銷售總覽核對。`);
  } else if (form.id === 'order-search-form') {
    ui.search = values.search; ui.source = values.source; ui.status = values.status; render();
  } else if (form.id === 'sales-filter-form') {
    if (values.start && values.end && values.start > values.end) return message('開始日期不能晚於結束日期。', 'error');
    ui.start = values.start; ui.end = values.end; render();
  } else if (form.id === 'shipping-report-form') {
    if (values.start && values.end && values.start > values.end) return message('開始日期不能晚於結束日期。', 'error');
    ui.shippingStart = values.start; ui.shippingEnd = values.end; render();
  } else if (form.id === 'kol-filter-form') {
    if (values.start && values.end && values.start > values.end) return message('開始日期不能晚於結束日期。', 'error');
    ui.kolStart = values.start; ui.kolEnd = values.end; render();
  } else if (form.id === 'kol-form') {
    const name = values.name.trim();
    const utm = values.utm.trim();
    if (!name || !utm || !values.started) return message('請填寫 KOL 名稱、UTM 與合作開始日期。', 'error');
    if (data.operations.kols.some((item) => item.utms.includes(utm))) return message('這個 UTM 已對應其他 KOL，請先核對設定。', 'error');
    const id = `kol-${Date.now()}`;
    data.operations.kols.push({ id, name, platform: values.platform.trim(), campaign: values.campaign.trim(), started: values.started, utms: [utm], note: values.note.trim() });
    ui.form = ''; ui.kolId = id; ui.kolTab = 'detail'; ui.kolSub = 'orders';
    save(); render(); message(`${name} 已建立；已確認批次的歸屬已重新計算。`);
  }
}

document.addEventListener('submit', submitForm);
document.addEventListener('click', (event) => {
  const mode = event.target.closest('[data-mode]');
  if (mode) {
    if (mode.dataset.mode === ui.mode) return;
    ui.mode = mode.dataset.mode;
    ui.page = ui.mode === 'warehouse' ? 'inventory' : 'orders';
    ui.form = ''; render(); $('#main').focus(); return;
  }
  const navigation = event.target.closest('[data-go]');
  if (navigation) return go(navigation.dataset.go);
  const kolTab = event.target.closest('[data-kol-tab]');
  if (kolTab) { ui.kolTab = kolTab.dataset.kolTab; ui.form = ''; render(); $('#main').focus(); return; }
  const kolDetail = event.target.closest('[data-kol-id]');
  if (kolDetail) { ui.kolId = kolDetail.dataset.kolId; ui.kolTab = 'detail'; ui.kolSub = 'orders'; render(); $('#main').focus(); return; }
  const kolSub = event.target.closest('[data-kol-sub]');
  if (kolSub) { ui.kolSub = kolSub.dataset.kolSub; render(); $('#main').focus(); return; }
  const showForm = event.target.closest('[data-form]');
  if (showForm) { ui.form = showForm.dataset.form; render(); $('#view input')?.focus(); return; }
  if (event.target.closest('[data-close-form]')) { ui.form = ''; render(); return; }
  const focus = event.target.closest('[data-focus]');
  if (focus) return $(`#${focus.dataset.focus} input`)?.focus();
  const action = event.target.closest('[data-action]');
  if (action) {
    if (action.dataset.action === 'preview-kol') {
      data.operations.kolBatch.status = 'preview';
      save(); render(); message('範例批次已預覽，確認前不計入 KOL 統計。'); return;
    }
    if (action.dataset.action === 'confirm-kol') {
      data.operations.kolBatch.status = 'confirmed';
      save(); render(); message('KOL 範例批次已確認，可核對統計與明細。'); return;
    }
    if (action.dataset.action === 'preview-orders') {
      data.operations.importBatch.status = 'preview';
      save(); render(); message('預檢完成；範例訂單尚未計入銷售。'); return;
    }
    if (action.dataset.action === 'confirm-orders') {
      const batch = data.operations.importBatch;
      if (batch.status !== 'preview') return;
      for (const row of batch.rows) if (!data.operations.orders.some((item) => item.number === row.number)) data.operations.orders.push({ ...row });
      batch.status = 'confirmed';
      save(); render(); message('範例訂單已確認匯入，可到接收訂單與銷售總覽核對。'); return;
    }
    const index = Number(action.dataset.index);
    if (action.dataset.action === 'confirm-receipt') {
      const receipt = data.warehouse.receipts[index];
      if (!receipt || receipt.status !== 'draft') return;
      receipt.status = 'confirmed';
      data.warehouse.products.find((item) => item.sku === receipt.sku).unplaced += receipt.qty;
      save(); render(); message(`${receipt.number} 已確認入庫，${receipt.qty} 件商品待配櫃。`);
    } else if (['add-line', 'edit-line'].includes(action.dataset.action)) {
      ui.shipmentIndex = index; ui.form = 'shipment-line'; render(); $('#view select')?.focus();
    } else if (action.dataset.action === 'allocate') {
      const shipment = data.warehouse.shipments[index];
      const product = data.warehouse.products.find((item) => item.sku === shipment.sku);
      if (product.available < shipment.qty) return message(`目前可出貨 ${product.available} 件，無法配貨 ${shipment.qty} 件。請先核對庫存與櫃位。`, 'error');
      product.available -= shipment.qty; product.reserved += shipment.qty; shipment.status = 'allocated';
      save(); render(); message(`${shipment.number} 已配貨 ${shipment.qty} 件，下一步確認揀貨。`);
    } else if (action.dataset.action === 'pick') {
      const shipment = data.warehouse.shipments[index];
      if (!shipment || shipment.status !== 'allocated') return;
      shipment.status = 'picked';
      save(); render(); message(`${shipment.number} 已確認揀貨，可完成出貨。`);
    } else if (action.dataset.action === 'complete') {
      const shipment = data.warehouse.shipments[index];
      if (!shipment || shipment.status !== 'picked') return;
      const product = data.warehouse.products.find((item) => item.sku === shipment.sku);
      product.reserved -= shipment.qty; shipment.status = 'complete'; shipment.completed = today();
      save(); render(); message(`${shipment.number} 已完成出貨，實體在庫已扣除 ${shipment.qty} 件。`);
    } else if (action.dataset.action === 'cancel-order') {
      const order = data.operations.orders[index];
      if (!order || order.status !== 'active') return;
      order.status = 'cancelled';
      save(); render(); message(`${order.number} 已取消並保留紀錄，不再計入有效銷售。`);
    }
    return;
  }
  if (event.target.closest('#reset-demo')) {
    if (!window.confirm('要清除這個瀏覽器中的 Demo 操作，恢復初始範例資料嗎？')) return;
    data = freshData(); save(); ui = { mode: 'warehouse', page: 'inventory', form: '', shipmentIndex: -1, search: '', source: '', status: '', start: '', end: '', kolTab: 'list', kolId: '', kolStart: '', kolEnd: '' };
    render(); message('範例資料已重設。');
  }
});

render();
