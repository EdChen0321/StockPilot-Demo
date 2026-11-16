const $ = (selector) => document.querySelector(selector);
const role = document.body.dataset.role;
function savedLanguage() {
  try { return localStorage.getItem('stockpilot-tide-language') === 'zh' ? 'zh' : 'en'; }
  catch { return 'en'; }
}
const state = {
  orderPage: 1, pageSize: 25, customerState: ['valid','active','placed','draft','allocated','picked','staged','partially_shipped','shipped','cancelled'].includes(new URLSearchParams(demoLocation.search).get('state')) ? new URLSearchParams(demoLocation.search).get('state') : 'all', orderResult: null,
  products: [], catalogLoading: true, catalogError: null, cart: {}, orders: [], selected: new URLSearchParams(demoLocation.search).get('order'),
  checkoutToken: null, noteToken: null, tourVerified: false,
  storeLang: savedLanguage(),
  receipt: null, checkoutNotice: null, trackNotice: null, checkoutCompleted: false,
  orderFilter: new URLSearchParams(demoLocation.search).has('order') ? 'all' : 'active', salesFilter: 'all', salesQuery: '', customerOrderQuery: '', cartRestored: false,
};
const storeCopy = {
  zh: {
    orderSummary: '訂單摘要',
    invalidDetails: '請用測試資料填妥顧客、電子郵件與配送資訊。', quantityInvalid: '請選擇至少 1 件。', quantityLimit: '購物袋最多可放 {limit} 件此商品（含已加入數量）。',
    bagLimit: '每款最多 5 件，並以目前庫存為限。', goCheckout: '前往模擬結帳', continueShopping: '繼續選購 ↗', backToBag: '← 返回購物袋', remove: '移除',
    eyebrow: '01 / 購物前台', title: '從水面到水下，挑一款路亞。', intro: '依釣法選商品，下單後可查詢出貨進度。',
    cartTitle: '購物袋', orderTotal: '訂單金額', privacy: '付款與出貨是模擬流程，不會扣款或寄送商品；請使用虛構資料。', checkout: '完成模擬付款並下單', checkoutDone: '模擬付款已完成', receiptItems: '商品明細',
    customerHeading: '顧客與配送', customerName: '顧客姓名', customerEmail: '電子郵件', customerPhone: '聯絡電話', deliveryRecipient: '收件人', deliveryAddress: '配送地址／取貨門市', shippingMethod: '配送方式', pickup: '超商取貨', homeDelivery: '宅配', paymentNoteTitle: '模擬付款', paymentNoteHelp: '確認後記錄付款模擬結果，不會實際扣款。',
    bannerTitle: '下一竿，從這裡開始。', bannerText: '從魚形泳餌、浮水蛙到直尾軟餌，依照今天的水域挑選。', heroCta: '選購路亞 ↗',
    categoryLead: '依釣法選路亞', categoryHard: '硬餌 ↗', categoryTopwater: '水面餌 ↗', categorySoft: '軟餌 ↗',
    collectionLabel: 'TIDE & TACKLE / 精選商品', collectionTitle: '找到下一款路亞', collectionNote: '每一款都能看細節，選好後加入購物袋。',
    details: '查看商品', detailHeading: '商品介紹', sku: '商品編號', close: '關閉商品介紹',
    trackLabel: '訂單追蹤', trackTitle: '回來查看出貨進度', trackHelp: '輸入訂單編號，即可查詢目前狀態與明細。', trackInput: '訂單編號', trackButton: '查詢訂單',
    trackMissing: '請輸入訂單編號。', trackFound: '已找到訂單，請查看下方狀態。', trackFailed: '找不到這張訂單，請核對編號。',
    storyLabel: '關於這個作品', storyTitle: '一張訂單，走完營運與出貨。', storyBody: '這個重建作品把購物、訂單、庫存與出貨放進同一條可追查的流程。產品與數據皆為虛構，系統流程參考作者過去的電商營運與內部系統規劃經驗，並非真實業績。', storyTradeoff: '下單不預扣庫存；原倉管系統在配貨時檢查逐件庫存與櫃位，完成出貨後再更新訂單進度。',
    nav: { products: '全部商品', hard: '硬餌', surface: '水面餌', soft: '軟餌', tracking: '訂單查詢', cart: '購物袋' }, brand: '路亞選物', footerBrand: '潮線釣具 ／ 路亞選物', footer: '付款與出貨皆為模擬，不會扣款或寄送。',
    tourSteps: ['選商品', '確認下單', '查詢出貨'],
    tour: [
      ['先挑選一件商品。', '選購商品', '#products'],
      ['商品已加入購物車，可以確認訂單。', '查看購物車', '#cart-title'],
      ['訂單已建立，可在這裡查詢出貨進度。', '查詢訂單', '#track-form'],
    ],
    item: '件', empty: '先選一件商品。', available: '可出貨', add: '加入購物車', perItem: '／件',
    decrease: '減少一件', increase: '增加一件', paymentDone: '模擬付款完成', order: '訂單',
    saved: '已保存', productKinds: '項商品明細', testTransaction: '請保留訂單編號；重新整理後仍可查看出貨狀態。',
    refresh: '更新訂單狀態', another: '再下一張訂單', seeSales: '到營運總覽核對這張訂單 ↗', continueShipping: '繼續出貨作業 ↗',
    saving: '正在儲存訂單…', savedMessage: '模擬付款已記錄，沒有實際扣款。', loading: '正在讀取商品…', loadError: '頁面無法載入：', genericError: '操作未完成，請稍後再試。',
    statuses: { placed: '已下單', draft: '出貨單待配貨', allocated: '已配貨', picked: '已揀貨', staged: '待寄送', partially_shipped: '部分已出貨', shipped: '已出貨' },
  },
  en: {
    orderSummary: 'Order summary',
    invalidDetails: 'Complete the customer and delivery details with test data.', quantityInvalid: 'Choose at least one item.', quantityLimit: 'You can add up to {limit} of this product in total, including items already in your bag.',
    bagLimit: 'Up to 5 per product, subject to availability.', goCheckout: 'Continue to checkout', continueShopping: 'Continue shopping ↗', backToBag: '← Back to bag', remove: 'Remove',
    eyebrow: '01 / STOREFRONT', title: 'Find a lure for the water ahead.', intro: 'Explore the lures, place an order, and follow its shipping status.',
    cartTitle: 'Your bag', orderTotal: 'Order total', privacy: 'Payment and shipping are simulated. No charge is made and no items are sent. Use fictional details.', checkout: 'Complete simulated payment', checkoutDone: 'Simulation complete', receiptItems: 'Order items',
    customerHeading: 'Customer and delivery', customerName: 'Customer name', customerEmail: 'Email', customerPhone: 'Phone (optional)', deliveryRecipient: 'Recipient', deliveryAddress: 'Address / pickup store', shippingMethod: 'Delivery method', pickup: 'Store pickup', homeDelivery: 'Home delivery', paymentNoteTitle: 'Simulated payment', paymentNoteHelp: 'This records a payment simulation. You will not be charged.',
    bannerTitle: 'Lures for the water ahead.', bannerText: 'A surface frog, a jointed swimbait, a straight-tail worm. Find your approach to the next cast.', heroCta: 'Shop the collection ↗',
    categoryLead: 'SHOP BY STYLE', categoryHard: 'Hard baits ↗', categoryTopwater: 'Topwater ↗', categorySoft: 'Soft lures ↗',
    collectionLabel: 'THE LURE COLLECTION', collectionTitle: 'Three ways to cast.', collectionNote: 'From the surface to a slow retrieve.',
    details: 'View details', detailHeading: 'Product details', sku: 'Product code', close: 'Close product details',
    trackLabel: 'ORDER TRACKING', trackTitle: 'Check your order status', trackHelp: 'Enter an order number to see its current status and details.', trackInput: 'Order number', trackButton: 'Find order',
    trackMissing: 'Enter an order number.', trackFound: 'Order found. See its status below.', trackFailed: 'That order could not be found. Check the number and try again.',
    storyLabel: 'ABOUT THIS STORE', storyTitle: 'A tackle shop you can try.', storyBody: 'Tide & Tackle is a demonstration shop with concept products and generated imagery. Browse the collection, build a bag and follow a test order.', storyTradeoff: 'Payment and delivery are simulated. You will not be charged and nothing will be shipped. Please use fictional details at checkout.',
    nav: { products: 'Shop all', hard: 'Hard baits', surface: 'Topwater', soft: 'Soft lures', tracking: 'Track order', cart: 'Bag' }, brand: 'Lure tackle', footerBrand: 'Tide & Tackle / Lure shop', footer: 'Payment and shipping are simulated. No charge or delivery.',
    tourSteps: ['Choose items', 'Confirm order', 'Track order'],
    tour: [
      ['Choose an item to get started.', 'Browse products', '#products'],
      ['Your cart is ready for checkout.', 'Review your cart', '#cart-title'],
      ['Order placed. Check its shipping status here.', 'Track order', '#track-form'],
    ],
    item: 'items', empty: 'Your bag is waiting for your next lure.', available: 'In stock ·', add: 'Add to bag', perItem: ' / item',
    decrease: 'Remove one ', increase: 'Add one ', paymentDone: 'Payment simulation complete', order: 'Order',
    saved: 'Saved', productKinds: 'product lines', testTransaction: 'Keep your order number to check its shipping status after a refresh.',
    refresh: 'Refresh order status', another: 'Start another order', seeSales: 'Review this order in Sales ↗', continueShipping: 'Continue in Fulfillment ↗',
    saving: 'Saving your order…', savedMessage: 'Payment simulation recorded. No charge was made.', loading: 'Loading products…', loadError: 'The page could not load: ', genericError: 'The action could not be completed. Please try again.',
    statuses: { placed: 'Order placed', draft: 'Awaiting allocation', allocated: 'Allocated', picked: 'Picked', staged: 'Awaiting dispatch', partially_shipped: 'Partially shipped', shipped: 'Shipped' },
  },
};
const productEnglish = {
  'TIDE-SWIMBAIT': ['Jointed hard swimbait', 'For slow retrieves and pauses. A jointed fish-profile bait for a measured approach.'],
  'TIDE-FROG': ['Floating frog lure', 'Work the surface. A floating frog for exploring the water along vegetation edges.'],
  'TIDE-WORM': ['4-inch stick worm', 'For a slower, more precise presentation. Straight-tail soft lures, packed in fives.'],
};
const productChinese = {
  'TIDE-SWIMBAIT': ['多節硬式泳餌', '銀綠魚紋、分節魚形，搭配透明舌板與雙三本鉤。'],
  'TIDE-FROG': ['浮水青蛙餌', '草綠蛙形與裙尾設計，適合沿水面與草邊搜索。'],
  'TIDE-WORM': ['4 吋棒蟲軟餌', '細肋直尾，瓜綠與煙灰雙色，一包五入。'],
};
const productDetails = {
  'TIDE-SWIMBAIT': { image: 'swimbait', category: ['HARD BAIT / 硬餌', 'HARD BAIT'], story: ['從頭部到尾鰭的分節輪廓，讓魚形泳餌在畫面中保有完整比例。銀綠背色、亮面鱗紋、透明舌板與雙三本鉤都能在商品圖中看清楚；收線時可從緩收、停頓的節奏開始嘗試。', 'Start with a slow retrieve and leave room for a pause. The articulated fish profile pairs an olive-silver finish with a clear diving lip and twin treble hooks.'], features: [['分節魚形', '銀綠亮面鱗紋', '單顆裝'], ['Jointed fish profile', 'Olive-silver finish', 'One lure']], facts: [['餌型', '多節硬餌'], ['配色', '銀綠魚紋'], ['計價單位', '1 顆']] },
  'TIDE-FROG': { image: 'frog', category: ['TOPWATER / 水面餌', 'TOPWATER'], story: ['蛙形本體以草綠色呈現，背部斑點與裙尾細節清楚可見。可沿著水面、草邊和障礙物邊緣，以短抽或停頓的節奏操作。', 'Follow the edge of the vegetation with short pulls, then pause. This floating frog keeps the presentation at the surface, with a skirted tail and a moss-green profile.'], features: [['蛙形輪廓', '草綠斑點', '單顆裝'], ['Frog profile', 'Moss-green markings', 'One lure']], facts: [['餌型', '浮水蛙形餌'], ['配色', '草綠色'], ['計價單位', '1 顆']] },
  'TIDE-WORM': { image: 'worm', category: ['SOFT BAIT / 軟餌', 'SOFT BAIT'], story: ['直尾棒蟲的細肋紋理與兩種配色，適合需要慢速、細緻操作的場景。包裝單位為五入，可在商品主圖和近拍圖比較瓜綠與煙灰的表面質感。', 'A straight-tail option for slower, more precise presentations. Fine ribbing runs along the soft body; each pack contains five worms in watermelon and smoke finishes.'], features: [['4 吋直尾', '瓜綠／煙灰', '每包 5 入'], ['4-inch straight tail', 'Watermelon / smoke', 'Five per pack']], facts: [['餌型', '4 吋直尾軟餌'], ['配色', '瓜綠與煙灰'], ['計價單位', '1 包／5 入']] },
};
const storeText = () => storeCopy[state.storeLang];
const storeProduct = (product) => {
  const entry = state.products.find(item => item.sku === product.sku) || product;
  if (state.storeLang === 'en' && entry.en_name) return { name: entry.en_name, description: entry.en_description };
  if (state.storeLang === 'zh' && entry.family) return { name: entry.name, description: productChinese[entry.family][1] };
  const copy = (state.storeLang === 'en' ? productEnglish : productChinese)[product.sku];
  return copy ? { name: copy[0], description: copy[1] } : product;
};
const productInfo = product => productDetails[product.family || product.sku];
const productFamily = product => product.family || product.sku;
const productImage = product => productInfo(product)?.image;
const productPageCopy = {
  zh: { back: '全部商品', quantity: '數量', addToCart: '加入購物袋', demoLabel: '模擬購物商店', demoHelp: '不會實際扣款，也不會寄送商品。', stockLabel: '你的購物袋', stockHelp: '下單前確認商品與數量。', aboutLabel: '商品介紹', specTitle: '商品規格', disclaimer: '概念商品與生成圖片，僅供示範。', moreLabel: '繼續選購', moreTitle: '搭配看看其他餌型', photo: '商品主圖', detailPhoto: '細節近拍', breadcrumbLabel: '目前位置', galleryLabel: '商品圖片', decreaseQty: '減少數量', increaseQty: '增加數量', added: '已加入購物袋，正在前往結帳區。' },
  en: { back: 'All lures', quantity: 'Quantity', addToCart: 'Add to bag', demoLabel: 'A demonstration store', demoHelp: 'No payment is taken. No products are shipped.', stockLabel: 'Your bag', stockHelp: 'Review your selection before placing a test order.', aboutLabel: 'ON THE WATER', specTitle: 'The details', disclaimer: 'Concept products and generated imagery, for demonstration only.', moreLabel: 'THE REST OF THE COLLECTION', moreTitle: 'A different approach', photo: 'Full lure', detailPhoto: 'Close-up detail', breadcrumbLabel: 'Breadcrumb', galleryLabel: 'Product photos', decreaseQty: 'Decrease quantity', increaseQty: 'Increase quantity', added: 'Added to bag. Review your selection.' },
};
const shortOrderId = (id) => `${id.slice(0, 5)}…${id.slice(-8)}`;
function storeError(error) {
  if (state.storeLang === 'zh') return /[\u3400-\u9fff]/.test(error.message) ? error.message : storeText().genericError;
  if (error.message.includes('可出貨庫存不足')) return 'Not enough stock is available to ship. Reduce the quantity and try again.';
  return error.message.includes('too many') ? 'Please reduce the quantity and try again.' : storeText().genericError;
}
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
const money = (value) => `NT$ ${Number(value).toLocaleString('zh-TW', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
const taipeiDay = (value) => value ? new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value)) : '';
const uuid = () => crypto.randomUUID().replaceAll('-', '');
function openCart() {
  demoLocation.href = '/cart';
}
function closeCart() {
  if (!$('#cart-overlay')) return;
  document.body.classList.remove('cart-open');
  $('#cart-overlay').hidden = true;
  $('#cart-toggle')?.setAttribute('aria-expanded', 'false');
  $('#cart-toggle')?.focus();
}
function attribution() {
  const current = new URLSearchParams(demoLocation.search);
  const fromUrl = Object.fromEntries(['source', 'medium', 'campaign'].map((key) => [key, (current.get(`utm_${key}`) || '').slice(0, 200)]));
  if (role !== 'shop') return fromUrl;
  try {
    if (Object.values(fromUrl).some(Boolean)) sessionStorage.setItem('stockpilot-tide-utm', JSON.stringify(fromUrl));
    return Object.values(fromUrl).some(Boolean) ? fromUrl : JSON.parse(sessionStorage.getItem('stockpilot-tide-utm') || '{}');
  } catch { return fromUrl; }
}

async function api(path, options = {}) {
  const response = await fetch(path, { cache: 'no-store', ...options });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || '操作未完成，請稍後再試。');
  return data;
}
const post = (path, body) => api(path, {
  method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'operations-ui' },
  body: JSON.stringify(body),
});
function message(selector, value, error = false) {
  const element = $(selector);
  element.textContent = value;
  element.classList.toggle('error', error);
}
function statusLabel(name, lang = 'zh') {
  if(name==='cancelled')return lang==='en'?'Order cancelled':'已取消訂單';
  return storeCopy[lang].statuses[name] || name;
}
function renderStoreLanguage() {
  const copy = storeText();
  document.documentElement.lang=state.storeLang==='en'?'en':'zh-Hant';
  const switcher = $('.language-switch');
  if (switcher && !$('.site-header .language-switch')) $('.site-header').append(switcher);
  const page = $('#store') || $('#product');
  if (page) page.lang = state.storeLang === 'en' ? 'en' : 'zh-Hant';
  document.querySelectorAll('[data-store-i18n]').forEach((element) => { element.textContent = copy[element.dataset.storeI18n]; });
  document.querySelectorAll('[data-tour-step] strong').forEach((element, index) => { element.textContent = copy.tourSteps[index]; });
  document.querySelectorAll('[data-store-lang]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.storeLang === state.storeLang));
  });
  document.querySelectorAll('[data-store-nav]').forEach((link) => {
    if (link.dataset.storeNav === 'cart') link.firstChild.textContent = `${copy.nav.cart} `;
    else link.textContent = copy.nav[link.dataset.storeNav];
  });
  if ($('#store')) {
    const utm = attribution();
    $('#checkout-attribution').textContent = utm.medium
      ? `UTM: ${utm.source || '—'} / ${utm.medium} / ${utm.campaign || '—'}`
      : (state.storeLang === 'en' ? 'No campaign source; this order is general traffic.' : '未帶入活動來源；訂單會歸為一般流量。');
    renderProducts(); renderCart();
    if (state.receipt) renderReceipt(state.receipt);
    if (state.checkoutNotice) message('#checkout-message', copy[state.checkoutNotice.key], state.checkoutNotice.error);
    if (state.checkoutError) message('#checkout-message', storeError(state.checkoutError), true);
    if (state.trackNotice) message('#track-message', copy[state.trackNotice.key], state.trackNotice.error);
  }
  if ($('#product')) renderProductPage();
  if (role === 'shop') {
    const route = demoLocation.pathname;
    const english = state.storeLang === 'en';
    if ($('.demo-notice')) $('.demo-notice').textContent = english ? 'Demonstration store · No real payments or deliveries' : '模擬購物商店 · 不會實際扣款或寄送商品';
    if ($('.skip-link')) $('.skip-link').textContent = english ? 'Skip to content' : '跳至主要內容';
    const headings = english ? {
      '/shop': ['THE COLLECTION', 'Find your next lure.', 'Three lure families. Explore sizes, compare availability and choose your approach.'],
      '/cart': ['01 / YOUR SELECTION', 'Your bag.', 'Review your lures before checkout.'],
      '/checkout': ['02 / TEST CHECKOUT', 'Make it a test run.', 'Use fictional details. No payment or delivery will take place.'],
    } : {
      '/shop': ['精選商品', '找到下一款路亞', '三種餌型，依釣法挑選。'],
      '/cart': ['01 / 選購明細', '你的購物袋', '結帳前，確認商品與數量。'],
      '/checkout': ['02 / 模擬結帳', '試走一次購物流程', '請使用虛構資料，不會扣款或寄送商品。'],
    };
    if (headings[route]) {
      ['eyebrow', 'title', 'intro'].forEach((key, index) => { $(`#shopping-page-${key}`).textContent = headings[route][index]; });
      $('#store').setAttribute('aria-labelledby', 'shopping-page-title');
      document.title = `${headings[route][1]} | Tide & Tackle`;
    }
    if (route === '/') $('#store').setAttribute('aria-label', english ? 'Tide & Tackle lure shop' : 'Tide & Tackle 路亞商店');
    if ($('.campaign-link')) $('.campaign-link').setAttribute('aria-label', english ? 'Shop by lure style' : '選購分類');
    $('.site-header nav').setAttribute('aria-label', english ? 'Main navigation' : '主要導覽');
    if ($('.checkout-fields')) $('.checkout-fields').setAttribute('aria-label', english ? 'Test checkout details' : '模擬結帳資料');
    $('.brand').setAttribute('aria-label', english ? 'Tide & Tackle home' : 'Tide & Tackle 首頁');
    for (const id of ['cart-close', 'cart-overlay']) $(`#${id}`)?.setAttribute('aria-label', english ? 'Close bag' : '關閉購物袋');
    $('.journey-strip')?.setAttribute('aria-label', english ? 'Shopping steps' : '購物流程');
    const hero = $('.store-banner-art img');
    if (hero) hero.alt = english ? 'Fishing tackle beside a quiet lake' : '寧靜湖畔的釣具';
    if (!['/shop','/cart','/checkout'].includes(route) && !route.startsWith('/product/')) document.title = english ? 'Tide & Tackle | Lure shop' : 'Tide & Tackle｜路亞選物';
  }
  renderShellText();
}
function renderShellText() {
  const copy = storeText();
  $('.brand-name small').textContent = copy.brand;
  $('footer span:first-child').textContent = copy.footerBrand;
  $('footer span:last-child').textContent = copy.footer;
  document.documentElement.lang = state.storeLang === 'en' ? 'en' : 'zh-Hant';
}
function updateTour(order = null) {
  const hasCart = Object.values(state.cart).some((quantity) => quantity > 0);
  const step = order ? 2 : (hasCart ? 1 : 0);
  document.querySelectorAll('[data-tour-step]').forEach((item, index) => {
    item.classList.toggle('done', index < step);
    item.classList.toggle('active', index === step);
  });
  const copy = storeText().tour[step];
  $('#tour-status').textContent = copy[0];
  $('#tour-next').innerHTML = `${copy[1]} <span aria-hidden="true">↗</span>`;
  $('#tour-next').href = copy[2];
}
function renderProducts() {
  if (state.catalogLoading || state.catalogError) {
    $('#products').textContent = state.catalogError ? storeText().loadError + storeError(state.catalogError) : storeText().loading;
    return;
  }
  const copy = storeText();
  if (!state.products.length) { $('#products').innerHTML = `<p class="loading">${copy.loading}</p>`; return; }
  const english = state.storeLang === 'en';
  if ($('#catalog-search-label')) {
    $('#catalog-search-label').textContent = english ? 'Search the collection' : '搜尋商品';
    $('#catalog-style-label').textContent = english ? 'Lure style' : '餌型';
    $('#catalog-sort-label').textContent = english ? 'Sort by' : '排序';
    $('#catalog-stock-label').textContent = english ? 'In stock only' : '只看有庫存';
    $('#catalog-search').placeholder = english ? 'Name or SKU' : '商品名稱或 SKU';
    [...$('#catalog-style').options].forEach((o,i) => o.textContent=(english?['All styles','Hard baits','Topwater','Soft lures']:['全部餌型','硬餌','水面餌','軟餌'])[i]);
    [...$('#catalog-sort').options].forEach((o,i) => o.textContent=(english?['Featured','Price: low to high','Price: high to low']:['精選順序','價格由低到高','價格由高到低'])[i]);
  }
  const query = ($('#catalog-search')?.value || '').trim().toLowerCase();
  const family = $('#catalog-style')?.value || '';
  let visible = state.products.filter(p => (!family || productFamily(p) === family) && (!$('#catalog-stock')?.checked || p.available > 0) && `${storeProduct(p).name} ${p.sku}`.toLowerCase().includes(query));
  const sort = $('#catalog-sort')?.value;
  if (sort === 'asc') visible.sort((a,b)=>Number(a.price)-Number(b.price));
  if (sort === 'desc') visible.sort((a,b)=>Number(b.price)-Number(a.price));
  if (demoLocation.pathname === '/') visible = visible.slice(0,3);
  if ($('#catalog-count')) $('#catalog-count').textContent = english ? `${visible.length} of ${state.products.length} styles & sizes` : `${visible.length} / ${state.products.length} 款商品規格`;
  $('#products').innerHTML = visible.map((product, index) => `
    <article class="product-row">
      <a class="product-image-button" href="/product/${esc(product.sku)}" aria-label="${copy.details}：${esc(storeProduct(product).name)}"><img src="/StockPilot-Demo/interactive/assets/${productImage(product)}.webp" alt="${esc(storeProduct(product).name)}" loading="lazy"><span>${String(index + 1).padStart(2,'0')} / ${String(visible.length).padStart(2,'0')}</span></a>
      <div class="product-body"><small>${esc(productInfo(product).category[state.storeLang === 'en' ? 1 : 0])}</small><h3>${esc(storeProduct(product).name)}</h3><p>${esc(storeProduct(product).description)}</p>${product.family ? `<small class="image-reference">${english ? 'Family image · see size in details' : '系列示意圖，規格以文字為準'}</small>` : ''}<a class="product-details-link" href="/product/${esc(product.sku)}">${copy.details} ↗</a></div>
      <div class="product-buy"><strong>${money(product.price)}</strong><span class="stock-tag ${product.available < 3 ? 'low' : ''}">${product.available === 0 ? (english ? 'Out of stock' : '暫時缺貨') : `${product.available < 3 ? (english ? 'Low stock ·' : '庫存偏低 ·') : copy.available} ${product.available} ${copy.item}`}</span><button type="button" class="button secondary" data-add="${esc(product.id)}" ${product.available < 1 ? 'disabled' : ''}>${copy.add} <span aria-hidden="true">＋</span></button></div>
    </article>`).join('') || `<p class="empty">${english ? 'No matching lures. Try another name or style.' : '沒有符合的商品，請調整搜尋或分類。'}</p>`;
}
function renderProductPage() {
  if (state.catalogLoading || state.catalogError) {
    $('#product-message').textContent = state.catalogError ? storeText().loadError + storeError(state.catalogError) : storeText().loading;
    $('#product-add').disabled = true;
    return;
  }
  const product = state.products.find((item) => item.sku === demoLocation.pathname.split('/').at(-1));
  if (!product) return;
  if (!state.productNotice) $('#product-message').textContent = '';
  const copy = productPageCopy[state.storeLang];
  const localized = storeProduct(product);
  const details = productInfo(product);
  document.querySelectorAll('[data-product-i18n]').forEach((element) => { element.textContent = copy[element.dataset.productI18n]; });
  $('.product-breadcrumb').setAttribute('aria-label', copy.breadcrumbLabel);
  $('#product-thumbnails').setAttribute('aria-label', copy.galleryLabel);
  $('[data-quantity-step="-1"]').setAttribute('aria-label', copy.decreaseQty);
  $('[data-quantity-step="1"]').setAttribute('aria-label', copy.increaseQty);
  $('#product-crumb').textContent = localized.name;
  $('#product-category').textContent = details.category[state.storeLang === 'en' ? 1 : 0];
  $('#product-title').textContent = localized.name;
  $('#product-summary').textContent = localized.description;
  $('#product-price').textContent = money(product.price);
  $('#product-unit').textContent = state.storeLang === 'en'
    ? (product.specification || (product.sku === 'TIDE-WORM' ? 'per pack · 5 pieces' : 'per lure'))
    : (product.family ? product.specification.replace('inch', '吋').replace('pieces', '入') : product.sku === 'TIDE-WORM' ? '每包 5 入' : '每顆');
  $('#product-stock').textContent = state.storeLang === 'en' ? (product.available ? `In stock · ${product.available} available` : 'Currently out of stock') : (product.available ? `目前庫存 ${product.available} 件` : '目前缺貨 · 庫存 0 件');
  $('#product-stock').classList.toggle('out-of-stock', product.available < 1);
  const spec = state.storeLang === 'en' ? product.specification : product.specification?.replace('inch', '吋').replace('pieces', '入');
  $('#product-feature-list').innerHTML = (product.family ? [spec, state.storeLang === 'en' ? 'Family reference image' : '系列示意圖', product.sku] : details.features[state.storeLang === 'en' ? 1 : 0])
    .map((feature) => `<li>${esc(feature)}</li>`).join('');
  $('#product-add').disabled = product.available < 1;
  $('#product-quantity').disabled = product.available < 1;
  document.querySelectorAll('[data-quantity-step]').forEach((button) => { button.disabled = product.available < 1; });
  $('#product-quantity').max = String(Math.min(5, product.available));
  if (Number($('#product-quantity').value) > product.available) $('#product-quantity').value = String(Math.max(1, Math.min(5, product.available)));
  const storyTitles = { 'TIDE-FROG': ['沿著草邊探索水面', 'Stay on the surface.'], 'TIDE-SWIMBAIT': ['放慢收線的節奏', 'Take a slower retrieve.'], 'TIDE-WORM': ['細緻操作的軟餌', 'Slow down your presentation.'] };
  $('#product-story-title').textContent = storyTitles[productFamily(product)][state.storeLang === 'en' ? 1 : 0];
  $('#product-story').textContent = product.family ? `${storeProduct(product).description} ${state.storeLang === 'en' ? product.image_note : '圖片為系列示意，尺寸與包裝以商品規格為準。'}` : details.story[state.storeLang === 'en' ? 1 : 0];
  const enFacts = { 'TIDE-SWIMBAIT': [['Type', 'Jointed hard bait'], ['Color', 'Olive silver'], ['Unit', 'One lure']], 'TIDE-FROG': [['Type', 'Floating frog lure'], ['Color', 'Moss green'], ['Unit', 'One lure']], 'TIDE-WORM': [['Type', '4-inch soft bait'], ['Colors', 'Watermelon and smoke'], ['Unit', 'One five-pack']] };
  $('#product-facts').innerHTML = (product.family ? [['SKU',product.sku],[state.storeLang === 'en' ? 'Size / pack' : '尺寸／包裝',spec],[state.storeLang === 'en' ? 'Series' : '系列',storeProduct({sku:product.family}).name]] : (state.storeLang === 'en' ? enFacts[product.sku] : details.facts)).map(([label, value]) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('');
  $('#product-main-image').src = `/StockPilot-Demo/interactive/assets/${details.image}.webp`;
  $('#product-main-image').alt = `${localized.name} — ${copy.photo}`;
  $('#product-thumbnails').innerHTML = ['', '-detail'].map((suffix, index) => `<button type="button" data-gallery-src="/StockPilot-Demo/interactive/assets/${details.image}${suffix}.webp" aria-label="${esc(index ? copy.detailPhoto : copy.photo)}" aria-pressed="${index === 0}"><img src="/StockPilot-Demo/interactive/assets/${details.image}${suffix}.webp" alt=""></button>`).join('');
  $('#product-detail-image').src = `/StockPilot-Demo/interactive/assets/${details.image}-detail.webp`;
  $('#product-detail-image').alt = `${localized.name} — ${copy.detailPhoto}`;
  $('#product-more-list').innerHTML = state.products.filter((item) => item.sku !== product.sku).slice(0,3).map((item) => `<a href="/product/${esc(item.sku)}"><img src="/StockPilot-Demo/interactive/assets/${productImage(item)}.webp" alt="" loading="lazy"><div><small>${esc(productInfo(item).category[state.storeLang === 'en' ? 1 : 0])}</small><span>${esc(storeProduct(item).name)} <b aria-hidden="true">↗</b></span><strong>${money(item.price)}</strong></div></a>`).join('');
  document.title = `${localized.name} | Tide & Tackle`;
  if(state.productNotice) message('#product-message', storeText()[state.productNotice.key].replace('{limit}',state.productNotice.limit ?? ''), true);
}
function persistCart() {
  const cart = Object.fromEntries(Object.entries(state.cart).map(([id, quantity]) => [state.products.find((product) => product.id === id)?.sku, quantity]).filter(([sku, quantity]) => sku && quantity > 0));
  localStorage.setItem('stockpilot-tide-cart', JSON.stringify(cart));
}
function restoreCart() {
  if (state.cartRestored) return;
  state.cartRestored = true;
  try {
    const saved = JSON.parse(localStorage.getItem('stockpilot-tide-cart') || '{}');
    state.cart = Object.fromEntries(state.products.filter((product) => Number.isInteger(saved[product.sku]) && saved[product.sku] > 0).map((product) => [product.id, Math.min(5, product.available, saved[product.sku])]));
  } catch { state.cart = {}; }
}
function renderInventory() {
  $('#inventory-list').innerHTML = state.products.map((product) => `<div class="inventory-row"><span class="inventory-name"><strong>${esc(product.name)}</strong><small>${esc(product.sku)}</small></span><span class="inventory-quantity ${product.available < 3 ? 'low' : ''}">${product.available} 件</span><span class="inventory-note">${product.available < 3 ? '可用量偏低' : '可配貨'}</span></div>`).join('');
}
function renderCart() {
  const copy = storeText();
  const lines = Object.entries(state.cart).filter(([, quantity]) => quantity > 0);
  const count = lines.reduce((sum, [, quantity]) => sum + quantity, 0);
  const total = lines.reduce((sum, [id, quantity]) =>
    sum + Number(state.products.find((product) => product.id === id).price) * quantity, 0);
  document.body.classList.toggle('cart-empty', count === 0);
  $('#cart-count').textContent = `${count} ${state.storeLang === 'en' && count === 1 ? 'item' : copy.item}`;
  if ($('#header-cart-count')) $('#header-cart-count').textContent = String(count);
  $('#cart-total').textContent = money(total);
  $('#checkout').disabled = count === 0 || state.checkoutCompleted;
  $('#checkout').textContent = state.checkoutCompleted ? copy.checkoutDone : copy.checkout;
  $('#cart-lines').innerHTML = lines.length ? lines.map(([id, quantity]) => {
    const product = state.products.find((item) => item.id === id);
    const name = storeProduct(product).name;
    return `<div class="cart-row"><div class="cart-item-main"><a class="cart-image" href="/product/${esc(product.sku)}" aria-label="${esc(name)}"><img src="/StockPilot-Demo/interactive/assets/${productImage(product)}.webp" alt=""></a><div class="cart-item-info"><a href="/product/${esc(product.sku)}"><strong>${esc(name)}</strong></a><small>${money(product.price)}${copy.perItem}</small><button class="remove-item" type="button" data-remove="${esc(id)}" aria-label="${copy.remove} ${esc(name)}">${copy.remove}</button></div></div><div class="cart-item-actions"><div class="quantity-tools"><button type="button" data-minus="${esc(id)}" aria-label="${copy.decrease}${esc(name)}">−</button><span>${quantity}</span><button type="button" data-plus="${esc(id)}" aria-label="${copy.increase}${esc(name)}" ${quantity >= Math.min(5, product.available) ? 'disabled' : ''}>＋</button></div><strong class="line-total">${money(Number(product.price) * quantity)}</strong></div></div>`;
  }).join('') : `<p class="empty">${copy.empty}</p>`;
  if ($('#receipt').classList.contains('hidden')) updateTour();
  if ($('#go-checkout')) $('#go-checkout').hidden = count === 0;
}
function returnLabel(summary, lang = 'zh') {
  const labels = lang === 'en'
    ? {none:'No returns recorded', partial:'Partially returned', full:'All shipped items returned'}
    : {none:'尚無退貨紀錄', partial:'部分已退貨', full:'已出貨商品全數退回'};
  return labels[summary?.state || 'none'];
}
function returnListNote(order) {
  const summary = order.returns;
  return summary?.returned ? `<small class="return-list-note">${esc(returnLabel(summary))} · ${summary.returned} / ${summary.shipped} 件</small>` : '';
}
function renderReturnSummary(order, lang = 'zh') {
  const summary = order.returns;
  if (!summary) return '';
  const en = lang === 'en', title = en ? 'Return progress' : '退貨進度';
  const metric = (label, value) => `<div><dt>${esc(label)}</dt><dd>${value}</dd></div>`;
  const returnedItems = summary.items.filter(item => item.returned).map(item => {
    const line = order.lines.find(line => line.product_id === item.product_id);
    const name = line ? (role === 'shop' ? storeProduct(line).name : line.name) : (en ? 'Shipped item' : '已出貨商品');
    return `<li><span>${esc(name)}</span><span>${en ? 'Returned' : '已退'} ${item.returned} / ${item.shipped}</span></li>`;
  }).join('');
  return `<section class="return-summary" aria-label="${title}">
    <div class="return-heading"><h2>${title}</h2><strong>${esc(returnLabel(summary, lang))}</strong></div>
    <dl class="return-counts">${metric(en ? 'Shipped' : '原出貨', summary.shipped)}${metric(en ? 'Returned' : '已退回', summary.returned)}${metric(en ? 'Not returned' : '未退回', summary.not_returned)}</dl>
    ${returnedItems ? `<ul class="return-items">${returnedItems}</ul><p class="return-processing">${en ? `Awaiting warehouse processing: ${summary.pending} · Returned to inventory: ${summary.released}` : `退貨入庫待處理 ${summary.pending} 件 · 已轉回入庫 ${summary.released} 件`}</p>` : ''}
    <p class="return-help">${en ? 'Counts refer to shipped items. Receiving a return does not cancel the order or issue a refund.' : '件數以實際出貨商品計算；退貨入庫不代表訂單取消或已退款。'}${role === 'shop' || !summary.returned ? '' : ' 轉回入庫後，仍須符合品質、包裝與櫃位條件才可出貨。'}</p>
  </section>`;
}
function renderReceipt(order) {
  state.receipt = order;
  // The visible receipt and its tracking form must refer to the same order.
  if ($('#track-order-id')) $('#track-order-id').value = order.order_id;
  const copy = storeText();
  $('#receipt').classList.remove('hidden');
  const next = `<a class="inline-next" href="#track-form">${copy.trackTitle} ↗</a>`;
  const lineCount = state.storeLang === 'en' && order.lines.length === 1 ? 'product line' : copy.productKinds;
  const items = order.lines.map((line) => `<div><span>${esc(storeProduct(line).name)} × ${line.quantity}</span><strong>${money(line.amount)}</strong></div>`).join('');
  $('#receipt').innerHTML = `<div class="receipt-head"><div><p class="eyebrow dark">${copy.paymentDone}</p><h1>${copy.checkoutDone}</h1><p class="receipt-order-id">${copy.order} <code>${esc(order.order_id)}</code></p><p>${copy.saved} ${order.lines.length} ${lineCount} · ${money(order.total)}</p></div><span class="status ${esc(order.state)}">${esc(statusLabel(order.state, state.storeLang))}</span></div><div class="receipt-lines"><span>${copy.receiptItems}</span>${items}</div><p class="quiet">${copy.testTransaction}</p>${renderReturnSummary(order, state.storeLang)}${window.ParcelUI?.summary(order.parcels, state.storeLang) || ''}<div class="receipt-actions"><button type="button" class="text-button" data-track="${esc(order.order_id)}">${copy.refresh}</button>${next}<button type="button" class="text-button" data-new-order>${copy.another}</button></div>`;
  updateTour(order);
}
function renderOrders() {
  const visible = state.orders.filter((order) => state.orderFilter === 'all' ||
    (state.orderFilter === 'shipped' ? order.state === 'shipped' : order.state !== 'shipped'));
  if (!visible.some((order) => order.order_id === state.selected)) state.selected = visible[0]?.order_id || null;
  document.querySelectorAll('[data-order-filter]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.orderFilter === state.orderFilter));
  });
  $('#orders-list').innerHTML = visible.length ? visible.map((order) => `
    <button type="button" class="order-list-row ${state.selected === order.order_id ? 'selected' : ''}" data-order="${esc(order.order_id)}" title="${esc(order.order_id)}"><span><strong>${esc(shortOrderId(order.order_id))}</strong><small>${order.lines.length} 項商品 · ${money(order.total)}</small></span><span class="status ${esc(order.state)}">${esc(statusLabel(order.state))}</span></button>`).join('')
    : `<p class="empty">${state.orders.length ? '目前沒有符合篩選條件的訂單。' : '尚無訂單。先到前台建立一張。'}</p>`;
}
function renderSalesOrders() {
  if (!$('#sales-orders')) return;
  const visible = state.orders.filter((order) =>
    (state.salesFilter === 'all' || (state.salesFilter === 'shipped' ? order.state === 'shipped' : order.state !== 'shipped'))
    && order.order_id.toLowerCase().includes(state.salesQuery.toLowerCase()));
  $('#sales-orders').innerHTML = visible.length ? visible.map((order) => {
    const date = new Date(order.ordered_at).toLocaleString('zh-TW', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Taipei' });
    return `<tr><td><a href="/orders?order=${encodeURIComponent(order.order_id)}" title="${esc(order.order_id)}">${esc(shortOrderId(order.order_id))} ↗</a></td><td>${order.lines.length} 項 / ${order.lines.reduce((sum, line) => sum + line.quantity, 0)} 件</td><td>${money(order.total)}</td><td><span class="status ${esc(order.state)}">${esc(statusLabel(order.state))}</span>${returnListNote(order)}</td><td>${esc(date)}</td></tr>`;
  }).join('') : `<tr><td colspan="5">${state.orders.length ? '沒有符合條件的訂單，請調整搜尋或狀態。' : '尚無訂單。先到前台下單。'}</td></tr>`;
}
function renderCustomerOrders() {
  if (!$('#customer-order-rows')) return;
  $('#customer-order-count').textContent = `共 ${(state.orderResult?.total || 0).toLocaleString()} 張符合條件的訂單`;
  $('#customer-order-rows').innerHTML = state.orders.map(order => {
    const date = new Date(order.ordered_at).toLocaleString('zh-TW', {dateStyle:'short',timeStyle:'short',timeZone:'Asia/Taipei'});
    return `<tr><td><a href="${esc(customerOrderUrl(order.order_id))}" title="${esc(order.order_id)}">${esc(shortOrderId(order.order_id))}</a><small>${esc(date)}</small></td><td>${esc(order.customer?.name || '未提供')}</td><td>${esc(order.lines[0]?.name || '—')}<small>${order.lines.length} 項商品 · ${order.lines.reduce((sum,line)=>sum+line.quantity,0)} 件</small></td><td>${esc(order.kol_attribution?.name || '未歸屬')}</td><td class="numeric">${money(order.total)}</td><td><span class="status ${esc(order.state)}">${esc(statusLabel(order.state))}</span>${returnListNote(order)}</td><td><a class="text-button" href="${esc(customerOrderUrl(order.order_id))}" aria-label="查看訂單 ${esc(shortOrderId(order.order_id))}">查看</a></td></tr>`;
  }).join('') || '<tr><td colspan="7" class="empty">沒有符合條件的訂單，請調整搜尋、日期或狀態。</td></tr>';
}
function renderDetail(order) {
  if (!order) { $('#order-detail').innerHTML = '<p class="empty">選取一張訂單，查看收件與出貨交接資料。</p>'; return; }
  const date = new Date(order.ordered_at).toLocaleString('zh-TW', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Taipei' });
  const shipmentSummary = order.shipment ? `出貨單 ${esc(order.shipment.number)}` : '尚未建立出貨單';
  const fact = (label, value) => `<div><dt>${label}</dt><dd>${esc(value || '未提供')}</dd></div>`;
    $('#order-detail').innerHTML = `<div class="detail-top"><div><p class="eyebrow">出貨交接資料</p><h3>${esc(order.order_id)}</h3><p class="quiet">${esc(date)}（台北時間）</p></div><span class="status ${esc(order.state)}">${esc(statusLabel(order.state))}</span></div><dl class="handoff-facts">${fact('收件人', order.delivery?.recipient)}${fact('配送方式', order.shipping_method)}${fact('配送地址／門市', order.delivery?.address)}${fact('聯絡電話', order.customer?.phone)}${fact('付款方式', order.payment?.method)}${fact('付款狀態', order.payment?.status)}</dl><table class="line-table"><thead><tr><th>商品</th><th>件數</th><th>金額</th></tr></thead><tbody>${order.lines.map((line) => `<tr><td>${esc(line.name)}<br><small>${esc(line.sku)}</small></td><td>${line.quantity}</td><td>${money(line.amount)}</td></tr>`).join('')}</tbody></table><strong>訂單合計：${money(order.total)}</strong><div class="shipment-summary">${shipmentSummary}</div>${renderReturnSummary(order)}<div class="detail-actions"><a class="button primary" href="/?order=${encodeURIComponent(order.order_id)}">${order.shipment ? '前往出貨單' : '建立出貨單'} ↗</a></div>`;
}
function renderNotes(orderId, notes) {
  $('#notes-order').textContent = orderId ? `訂單 ${shortOrderId(orderId)} · 僅供內部查看` : '選取訂單後可留下處理紀錄。';
  $('#notes-list').innerHTML = notes.length ? notes.map((note) => {
    const date = new Date(note.created_at).toLocaleString('zh-TW', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Taipei' });
    return `<article class="note-entry"><time datetime="${esc(note.created_at)}">${esc(date)}</time><p>${esc(note.body)}</p></article>`;
  }).join('') : '<p class="empty">這張訂單尚無內部備註。</p>';
  $('#notes-form').querySelector('button').disabled = !orderId;
}
async function refreshNotes(orderId = state.selected) {
  if (!orderId) { renderNotes(null, []); return; }
  const result = await api(`/api/portfolio/notes?order_id=${encodeURIComponent(orderId)}`);
  if (state.selected === orderId) renderNotes(orderId, result.notes);
}
function renderSales(result) {
  const maximum = Math.max(1, ...result.products.map((product) => product.quantity));
  const period = result.period?.start ? `${taipeiDay(result.period.start)} ～ ${taipeiDay(result.period.end)}` : '尚無訂單';
  $('#sales-overview').innerHTML = `<div class="sales-masthead"><div><span class="report-label">訂單金額 / TWD</span><strong>${money(result.amount)}</strong><p>統計期間：${esc(period)} · 全部商店訂單；付款為模擬，未實際收款。</p></div><dl><div><dt>有效訂單</dt><dd>${result.order_count} 張</dd></div><div><dt>銷售件數</dt><dd>${result.sales_quantity} 件</dd></div><div><dt>已出貨</dt><dd>${result.shipped_count} 張</dd></div><div><dt>待出貨</dt><dd>${result.awaiting_count} 張</dd></div></dl></div><div class="sales-breakdown"><div class="breakdown-heading"><h3>商品銷售分布</h3><span>依訂單明細</span></div>${result.products.length ? result.products.map((product) => `<div class="breakdown-row"><span>${esc(product.name)}</span><progress class="bar-track" value="${product.quantity}" max="${maximum}" aria-label="${esc(product.name)}銷售 ${product.quantity} 件"></progress><strong>${product.quantity} 件</strong><small>${money(product.amount)}</small></div>`).join('') : '<p class="empty">建立第一筆訂單後，這裡會顯示商品銷售。</p>'}</div>`;
}
async function refreshCatalog() {
  let result;
  try { result = await api('/api/portfolio/catalog'); state.catalogError = null; }
  catch (error) { state.catalogError=error; throw error; }
  finally { state.catalogLoading=false; }
  state.products = result.products;
  if (role === 'shop') { restoreCart(); if ($('#store')) { renderProducts(); renderCart(); } else { renderProductPage(); if ($('#header-cart-count')) $('#header-cart-count').textContent = String(Object.values(state.cart).reduce((sum, quantity) => sum + quantity, 0)); } }
  if (role === 'fulfillment') renderInventory();
}
let orderSequence=0,orderSearchTimer;
function renderOrderPager(result) {
  let pager=$('#portfolio-order-pager');
  if(!pager){pager=document.createElement('div');pager.id='portfolio-order-pager';pager.className='remote-pager';
    const target=$('#customer-order-rows')?.closest('.table-scroll') || $('#sales-orders')?.closest('.table-scroll') || $('#orders-list');
    if(!target)return;target.after(pager);}
  const first=result.total?(result.page-1)*result.page_size+1:0,last=Math.min(result.total,result.page*result.page_size);
  pager.innerHTML=`<span role="status">${first.toLocaleString()}–${last.toLocaleString()} / ${result.total.toLocaleString()} 筆 · 第 ${result.page} / ${result.pages} 頁</span><label>每頁 <select id="portfolio-page-size" aria-label="每頁筆數">${[25,50,100].map(n=>`<option ${n===state.pageSize?'selected':''}>${n}</option>`).join('')}</select> 筆</label><div><button data-order-page="1" ${result.page===1?'disabled':''}>第一頁</button><button data-order-page="${result.page-1}" ${result.page===1?'disabled':''}>上一頁</button><button data-order-page="${result.page+1}" ${result.page===result.pages?'disabled':''}>下一頁</button><button data-order-page="${result.pages}" ${result.page===result.pages?'disabled':''}>最後頁</button></div><label>跳至 <input id="portfolio-jump" type="number" min="1" max="${result.pages}" value="${result.page}" aria-label="跳至頁碼"></label><button id="portfolio-jump-go">前往</button>`;
}
// List state lives in the URL so reload, browser Back and a new detail tab agree.
function customerListParams() {
  const params = new URLSearchParams({page:state.orderPage, page_size:state.pageSize,
    q:state.customerOrderQuery, state:state.customerState});
  for (const key of ['start','end']) {
    const value = $(`#customer-order-${key}`)?.value;
    if (value) params.set(key,value);
  }
  return params;
}
function customerOrderUrl(id) {
  return `/orders/${encodeURIComponent(id)}?${customerListParams()}`;
}
async function refreshOrders(select = state.selected) {
  const sequence=++orderSequence;
  const params=new URLSearchParams({page:state.orderPage,page_size:state.pageSize,
    q:$('#customer-order-rows')?state.customerOrderQuery:state.salesQuery,
    state:role==='fulfillment'?state.orderFilter:$('#customer-order-rows')?state.customerState:state.salesFilter});
  for(const key of ['start','end'])if($(`#customer-order-${key}`)?.value)params.set(key,$(`#customer-order-${key}`).value);
  const container=$('#customer-order-rows') || $('#sales-orders') || $('#orders-list');
  container?.setAttribute('aria-busy','true');
  try {
    const result=await api('/api/portfolio/orders?'+params);
    if(sequence!==orderSequence)return;
    state.orders=result.orders;state.orderResult=result;state.orderPage=result.page;
    if ($('#customer-order-rows')) demoHistory.replaceState(null, '', '/orders?' + customerListParams());
    if(role==='sales'){renderSalesOrders();renderCustomerOrders();}
    if(role==='fulfillment'){
      state.selected=select&&state.orders.some(o=>o.order_id===select)?select:state.orders[0]?.order_id||null;
      // A link can target an order outside the first page; fetch it directly.
      const requested=new URLSearchParams(demoLocation.search).get('order');
      if(requested&&!state.linkedOrderLoaded){state.selected=requested;state.linkedOrderLoaded=true;}
      renderOrders();
      const id=state.selected;
      const detail=id?await api(`/api/portfolio/order?id=${encodeURIComponent(id)}`):null;
      if(sequence!==orderSequence)return;
      renderDetail(detail);await refreshNotes();
    }
    renderOrderPager(result);
  } catch(error){
    if(sequence===orderSequence){if(container?.tagName==='TBODY')container.innerHTML=`<tr><td colspan="${container.closest('table').querySelectorAll('thead th').length}">${esc(error.message)}</td></tr>`;else if(container)container.textContent=error.message;
      $('#portfolio-order-pager')?.replaceChildren();}
  } finally {if(sequence===orderSequence)container?.removeAttribute('aria-busy');}
}
function scheduleOrderSearch(){state.orderPage=1;clearTimeout(orderSearchTimer);orderSearchTimer=setTimeout(()=>refreshOrders(),250);}
document.addEventListener('change',event=>{
  if(event.target.id==='portfolio-page-size'){state.pageSize=Number(event.target.value);state.orderPage=1;refreshOrders();}
  if(event.target.id==='customer-order-state'){state.customerState=event.target.value;state.orderPage=1;refreshOrders();}
  if(['customer-order-start','customer-order-end'].includes(event.target.id)){state.orderPage=1;refreshOrders();}
});
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-order-page],#portfolio-jump-go');if(!button)return;
  const page=Number(button.dataset.orderPage || $('#portfolio-jump').value);
  if(!Number.isInteger(page)||page<1||page>(state.orderResult?.pages||1)){$('#portfolio-jump')?.reportValidity();return;}
  state.orderPage=page;refreshOrders();
});
async function refreshSales() { renderSales(await api('/api/portfolio/overview')); }
async function refreshKol() { await loadPortfolioKol(); }
document.addEventListener('click', async (event) => {
  const photo = event.target.closest('[data-gallery-src]');
  if (photo) {
    $('#product-main-image').src = photo.dataset.gallerySrc;
    $('#product-main-image').alt = `${$('#product-title').textContent} — ${photo.getAttribute('aria-label')}`;
    document.querySelectorAll('[data-gallery-src]').forEach((button) => button.setAttribute('aria-pressed', String(button === photo)));
    return;
  }
  if (event.target.closest('#cart-toggle') && $('#cart-overlay')) { event.preventDefault(); openCart(); return; }
  if (event.target.closest('#cart-close, #cart-overlay')) { closeCart(); return; }
  const stepButton = event.target.closest('[data-quantity-step]');
  if (stepButton) { const input = $('#product-quantity'); input.value = Math.min(Number(input.max), Math.max(1, Number(input.value || 1) + Number(stepButton.dataset.quantityStep))); return; }
  const filter = event.target.closest('[data-order-filter]');
  if (filter) {
    state.orderFilter = filter.dataset.orderFilter;
    state.orderPage=1; await refreshOrders(); return;
  }
  const language = event.target.closest('[data-store-lang]');
  if (language) {
    state.storeLang = language.dataset.storeLang;
    try { localStorage.setItem('stockpilot-tide-language', state.storeLang); } catch { /* Keep the current page usable if storage is unavailable. */ }
    renderStoreLanguage(); return;
  }
  const add = event.target.closest('[data-add]');
  const plus = event.target.closest('[data-plus]');
  const minus = event.target.closest('[data-minus]');
  const remove = event.target.closest('[data-remove]');
  if (add || plus || minus || remove) {
    const control = add || plus || minus || remove;
    const id = control.dataset.add || control.dataset.plus || control.dataset.minus || control.dataset.remove;
    if (state.checkoutCompleted) { state.cart = {}; state.checkoutCompleted = false; }
    const product = state.products.find((item) => item.id === id);
    if (!product) return;
    state.cart[id] = remove ? 0 : Math.min(5, product.available, Math.max(0, (state.cart[id] || 0) + (minus ? -1 : 1)));
    persistCart();
    state.checkoutToken = null;
    state.receipt = null; state.checkoutNotice = null;
    message('#checkout-message', ''); $('#receipt').classList.add('hidden'); renderCart(); if (add) openCart(); return;
  }
  const orderButton = event.target.closest('[data-order]');
  if (orderButton) {
    state.selected = orderButton.dataset.order;
    state.noteToken = null;
    renderOrders(); renderDetail(await api(`/api/portfolio/order?id=${encodeURIComponent(state.selected)}`));
    await refreshNotes(); return;
  }
  const track = event.target.closest('[data-track]');
  if (track) {
    try {
      const order = await api(`/api/portfolio/order?id=${encodeURIComponent(track.dataset.track)}`);
      renderReceipt(order);
    } catch (error) { state.checkoutNotice = null; state.checkoutError=error; message('#checkout-message', storeError(error), true); }
    return;
  }
  if (event.target.closest('[data-new-order]')) {
    state.cart = {}; state.checkoutToken = null; state.tourVerified = false; state.receipt = null; state.checkoutNotice = null; state.checkoutCompleted = false;
    localStorage.removeItem('stockpilot-tide-order'); persistCart(); $('#receipt').classList.add('hidden');
    if (demoLocation.pathname === '/confirmation') { demoLocation.href = '/'; return; }
    message('#checkout-message', ''); renderCart(); $('#store').scrollIntoView(); return;
  }
});
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && document.body.classList.contains('cart-open')) closeCart(); });
$('#checkout')?.addEventListener('click', async () => {
  const required = ['#checkout-name', '#checkout-email', '#checkout-recipient', '#checkout-address'];
  const missing = required.map((selector) => $(selector)).find((field) => !field.value.trim() || !field.checkValidity());
  if (missing) {
    missing.focus();
    state.checkoutNotice = {key:'invalidDetails',error:true};
    message('#checkout-message',storeText().invalidDetails,true);
    return;
  }
  state.checkoutError = null;
  const button = $('#checkout'); button.disabled = true;
  state.checkoutNotice = { key: 'saving', error: false };
  message('#checkout-message', storeText().saving);
  state.checkoutToken ||= uuid();
  const lines = Object.entries(state.cart).filter(([, quantity]) => quantity > 0)
    .map(([product_id, quantity]) => ({ product_id, quantity }));
  try {
    const order = await post('/api/portfolio/checkout', { token: state.checkoutToken, lines,
      customer: { name: $('#checkout-name').value.trim(), email: $('#checkout-email').value.trim(), phone: $('#checkout-phone').value.trim() },
      delivery: { recipient: $('#checkout-recipient').value.trim(), address: $('#checkout-address').value.trim() },
      shipping_method: $('#checkout-shipping').value, payment_method: $('#checkout-payment').value,
      utm: attribution() });
    localStorage.setItem('stockpilot-tide-order', order.order_id);
    state.cart = {}; state.checkoutCompleted = true;
    persistCart();
    demoLocation.href = `/confirmation?order=${encodeURIComponent(order.order_id)}`;
  } catch (error) { state.checkoutNotice = null; state.checkoutError=error; message('#checkout-message', storeError(error), true); }
  finally { button.disabled = state.checkoutCompleted || !Object.values(state.cart).some((quantity) => quantity > 0); }
});
$('#refresh-orders')?.addEventListener('click', async () => {
  try { await Promise.all([refreshOrders(), refreshCatalog()]); }
  catch (error) { $('#orders-list').textContent = error.message; }
});
$('#sales-search')?.addEventListener('input', (event) => {
  state.salesQuery = event.target.value.trim(); scheduleOrderSearch();
});
$('#customer-order-search')?.addEventListener('input', (event) => {
  state.customerOrderQuery = event.target.value.trim(); scheduleOrderSearch();
});
$('#sales-filter')?.addEventListener('change', (event) => {
  state.salesFilter = event.target.value; state.orderPage=1; refreshOrders();
});
$('#refresh-sales')?.addEventListener('click', async () => {
  const button = $('#refresh-sales'); button.disabled = true;
  try { await Promise.all([refreshOrders(), refreshSales()]); }
  catch (error) { $('#sales-orders').innerHTML = `<tr><td colspan="5">${esc(error.message)}</td></tr>`; }
  finally { button.disabled = false; }
});

$('#notes-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const body = $('#note-body').value.trim();
  if (!state.selected || !body || body.length > 500) {
    message('#notes-message', '請輸入 1 至 500 字的備註。', true); return;
  }
  const button = $('#notes-form button'); button.disabled = true;
  state.noteToken ||= uuid();
  try {
    await post('/api/portfolio/notes', { token: state.noteToken, order_id: state.selected, body });
    state.noteToken = null; $('#note-body').value = '';
    message('#notes-message', '備註已保存。');
    await refreshNotes();
  } catch (error) { message('#notes-message', error.message, true); }
  finally { button.disabled = false; }
});
$('#note-body')?.addEventListener('input', () => { state.noteToken = null; });
$('#track-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const orderId = $('#track-order-id').value.trim().toUpperCase();
  if (!orderId) {
    state.trackNotice = { key: 'trackMissing', error: true };
    message('#track-message', storeText().trackMissing, true); return;
  }
  try {
    const order = await api(`/api/portfolio/order?id=${encodeURIComponent(orderId)}`);
    localStorage.setItem('stockpilot-tide-order', order.order_id);
    state.tourVerified = order.state === 'shipped';
    state.trackNotice = { key: 'trackFound', error: false };
    message('#track-message', storeText().trackFound);
    renderReceipt(order);
    $('#receipt').scrollIntoView({ block: 'start', behavior: 'smooth' });
  } catch {
    state.trackNotice = { key: 'trackFailed', error: true };
    message('#track-message', storeText().trackFailed, true);
  }
});
$('#product-add')?.addEventListener('click', () => {
  const product = state.products.find((item) => item.sku === demoLocation.pathname.split('/').at(-1));
  if (!product) return;
  const quantity = Number($('#product-quantity').value);
  const limit = Math.min(5, product.available);
  if (!Number.isInteger(quantity) || quantity < 1) {
    state.productNotice={key:'quantityInvalid'};
    message('#product-message',storeText().quantityInvalid,true);
    return;
  }
  if (quantity + (state.cart[product.id] || 0) > limit) {
    state.productNotice={key:'quantityLimit',limit};
    message('#product-message',storeText().quantityLimit.replace('{limit}',limit),true);
    return;
  }
  state.cart[product.id] = (state.cart[product.id] || 0) + quantity;
  persistCart();
  message('#product-message', productPageCopy[state.storeLang].added);
  demoLocation.href = '/cart';
});
if ($('#customer-order-rows')) {
  const params = new URLSearchParams(demoLocation.search);
  const page = Number(params.get('page'));
  state.orderPage = Number.isSafeInteger(page) && page > 0 ? page : 1;
  const size = Number(params.get('page_size'));
  state.pageSize = [25,50,100].includes(size) ? size : 25;
  state.customerOrderQuery = (params.get('q') || '').slice(0,200);
  $('#customer-order-search').value = state.customerOrderQuery;
  $('#customer-order-state').value = state.customerState;
  for (const key of ['start','end']) $('#customer-order-' + key).value = params.get(key) || '';
}
if (role === 'shop') renderStoreLanguage();
(async () => {
  try {
    if (role === 'shop') {
      attribution(); // Capture campaign links on product pages before navigation strips the query.
      await refreshCatalog();
      if ($('#store')) {
        if (demoLocation.hash === '#cart-title') openCart();
        const saved = localStorage.getItem('stockpilot-tide-order');
        if (saved) $('#track-order-id').value = saved;
        if (demoLocation.pathname === '/confirmation') {
          document.body.classList.add('order-confirmation');
          const orderId = new URLSearchParams(demoLocation.search).get('order');
          try {
            if (!orderId) throw new Error('Order number is missing.');
            const order = await api(`/api/portfolio/order?id=${encodeURIComponent(orderId)}`);
            state.checkoutCompleted = true;
            renderReceipt(order);
          } catch (error) {
            $('#receipt').classList.remove('hidden');
            $('#receipt').textContent = state.storeLang === 'en' ? 'This order could not be found. Check its number and try again.' : '找不到這張訂單，請核對編號後重試。';
          }
        }
      }
    }
    if (role === 'sales') {
      // The dashboard module owns the HUB data, filters and charts.
      if ($('#customer-order-rows')) await refreshOrders();
      if ($('#sales-overview')) await Promise.all([refreshOrders(), refreshSales()]);
      if ($('#kol-content')) await refreshKol();
    }
    if (role === 'fulfillment') await Promise.all([refreshCatalog(), refreshOrders()]);
  } catch (error) {
    const target = $('#product-message') || $('#products') || $('#hub-metrics') || $('#customer-order-rows') || $('#sales-overview') || $('#orders-list') || $('#kol-content');
    if (target) target.textContent = role === 'shop' ? `${storeText().loadError}${storeError(error)}` : `載入失敗：${error.message}，請重新整理重試。`;
  }
})();

// Collection controls are independent of stock and checkout commands.
if ($('#catalog-style')) {
  const style = new URLSearchParams(demoLocation.search).get('style') || '';
  if ([...$('#catalog-style').options].some(o=>o.value===style)) $('#catalog-style').value=style;
  $('#catalog-search').addEventListener('input', renderProducts);
  ['#catalog-style','#catalog-sort','#catalog-stock'].forEach(id=>$(id).addEventListener('change',renderProducts));
}
