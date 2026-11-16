/* A document route, not a modal: the order ID and return filters are URL state. */
(() => {
  const root = document.getElementById('customer-order-detail');
  if (!root) return;
  const params = new URLSearchParams();
  const incoming = new URLSearchParams(demoLocation.search);
  for (const key of ['q', 'state', 'start', 'end', 'page', 'page_size']) {
    if (incoming.has(key)) params.set(key, incoming.get(key));
  }
  const listUrl = '/orders' + (params.size ? '?' + params : '');
  document.getElementById('order-back').href = listUrl;
  let id;
  try { id = decodeURIComponent(demoLocation.pathname.slice('/orders/'.length)); }
  catch { id = ''; }
  const fact = (label, value) => `<div><dt>${esc(label)}</dt><dd>${esc(value === null || value === undefined || value === '' ? '未記錄' : value)}</dd></div>`;
  const badge = (label, value, tone = '') => `<span class="order-badge ${esc(tone)}">${esc(label)} · ${esc(value)}</span>`;
  const orderLabel = value => ({active:'有效訂單', cancelled:'已取消'}[value] || value || '未記錄');

  function render(order) {
    const currency = order.currency || 'TWD';
    const amount = value => value == null ? '未記錄' : new Intl.NumberFormat('zh-TW', {
      style:'currency', currency, minimumFractionDigits:2, maximumFractionDigits:2
    }).format(Number(value));
    const date = new Date(order.ordered_at).toLocaleString('zh-TW', {
      dateStyle:'medium', timeStyle:'short', timeZone:'Asia/Taipei'
    });
    const customer = order.customer || {}, delivery = order.delivery || {};
    const shipments = order.shipments || (order.shipment ? [order.shipment] : []);
    const fulfillmentUrl = document.body.dataset.fulfillmentUrl;
    const shipmentUrl = fulfillmentUrl + '?order=' + encodeURIComponent(order.order_id);
    const hasKol = Boolean(order.kol_attribution?.id) && !['general', 'unattributed'].includes(order.kol_attribution.id);
    const source = Object.entries(order.utm || {}).filter(([,value]) => value);
    document.title = `${shortOrderId(order.order_id)}｜顧客訂單｜StockPilot`;
    root.innerHTML = `
      <header class="order-page-heading">
        <div><p class="eyebrow dark">營運 / 顧客訂單 / 詳情</p>
          <h1>${esc(shortOrderId(order.order_id))}</h1>
          <p class="order-date">下單於 ${esc(date)} <span>（台北時間）</span></p>
        </div>
        <div class="order-id-tools">
          ${order.shipment || order.order_status !== 'cancelled' ? `<a class="order-shipment-action" href="${esc(shipmentUrl)}">${order.shipment ? '查看出貨單' : '建立出貨單'} <span aria-hidden="true">↗</span></a>` : ''}
          <button type="button" id="copy-order-id">複製完整 ID</button><span id="copy-order-message" role="status"></span>
        </div>
        <div class="order-statuses" aria-label="訂單目前狀態">
          ${badge('訂單', orderLabel(order.order_status), order.order_status === 'cancelled' ? 'cancelled' : '')}
          ${badge('付款', order.payment?.status || '未記錄', 'payment')}
          ${badge('出貨', statusLabel(order.state), order.state)}
          ${order.returns?.returned ? badge('退貨', returnLabel(order.returns)) : ''}
        </div>
        <details class="order-full-id"><summary>查看完整訂單 ID</summary><code>${esc(order.order_id)}</code></details>
      </header>
      <div class="order-page-layout">
        <div class="order-primary">
          <section class="order-products" aria-labelledby="order-products-title">
            <div class="order-block-heading"><h2 id="order-products-title">商品明細</h2><span>${order.lines.length} 項 · ${order.lines.reduce((n,l) => n + l.quantity, 0)} 件</span></div>
            <table class="order-items-table"><caption class="order-sr-only">此訂單商品、SKU、數量與金額</caption><thead><tr><th scope="col">商品 / SKU</th><th scope="col">數量</th><th scope="col">單價</th><th scope="col">小計</th></tr></thead>
              <tbody>${order.lines.map(line => `<tr><td><strong>${esc(line.name || '未記錄商品名稱')}</strong><small>SKU · ${esc(line.sku || '未記錄')}</small></td><td data-label="數量">${line.quantity}</td><td data-label="單價">${amount(line.unit_price)}</td><td data-label="小計">${amount(line.amount)}</td></tr>`).join('')}</tbody>
            </table>
            <p class="order-note">單價依這筆訂單的商品小計 ÷ 數量計算，顯示至小數點後兩位。</p>
            <dl class="order-totals">
              ${fact('商品小計', amount(order.total))}
              ${fact('運費', order.shipping_fee == null ? '未記錄' : amount(order.shipping_fee))}
              <div class="order-total"><dt>訂單總額 <small>${esc(currency)}</small></dt><dd data-order-total>${amount(order.total)}</dd></div>
            </dl>
            <p class="order-note order-total-note">目前記錄的總額為商品小計；系統未提供獨立運費資料。</p>
          </section>
          ${renderReturnSummary(order)}
          ${window.ParcelUI?.summary(order.parcels) || ''}
          <p><a href="/pickups?order_id=${encodeURIComponent(order.order_id)}&amp;back=${encodeURIComponent(demoLocation.pathname+demoLocation.search)}">查看此訂單所有包裹與模擬提醒 ↗</a></p>
          <section class="order-shipping" aria-labelledby="order-shipping-title">
            <div class="order-block-heading"><h2 id="order-shipping-title">出貨處理</h2>${badge('出貨', statusLabel(order.state), order.state)}</div>
            ${shipments.length ? `<ul class="order-shipment-list">${shipments.map(shipment => `<li><div><a href="${esc(fulfillmentUrl)}warehouse-workspace#shipping/${encodeURIComponent(shipment.id)}">${esc(shipment.number)}</a><span>${esc(shipment.state === 'cancelled' ? '已取消出貨單' : statusLabel(shipment.state))}</span></div></li>`).join('')}</ul>` : '<p>尚未建立出貨單。</p>'}
            ${!order.shipment && order.order_status === 'cancelled' ? '<p class="order-note">這張訂單已取消，無法建立出貨單。</p>' : ''}
            <p class="order-note">在原倉管工作區進行配貨、揀貨與出貨。此頁顯示目前狀態，未提供狀態變更歷程。</p>
          </section>
        </div>
        <aside class="order-secondary" aria-label="顧客、配送與來源資訊">
          <section aria-labelledby="order-customer-title"><h2 id="order-customer-title">顧客與配送</h2>
            <dl class="order-facts">${fact('顧客', customer.name)}${fact('電子郵件', customer.email)}${fact('聯絡電話', customer.phone)}</dl>
            <h3>收件資訊</h3><dl class="order-facts">${fact('收件人', delivery.recipient)}${fact('地址／取貨門市', delivery.address)}${fact('配送方式', order.shipping_method)}</dl>
          </section>
          <section aria-labelledby="order-payment-title"><h2 id="order-payment-title">付款資訊</h2>
            <dl class="order-facts">${fact('付款方式', order.payment?.method)}${fact('目前狀態', order.payment?.status)}</dl>
            <p class="order-note">本訂單為模擬交易，不會實際扣款或寄送商品。</p>
          </section>
          <section aria-labelledby="order-source-title"><h2 id="order-source-title">KOL 與來源</h2>
            <dl class="order-facts">${fact('KOL 歸屬', hasKol ? order.kol_attribution.name : '未歸屬 KOL')}${fact('歸屬依據', order.kol_attribution?.reason)}
              ${source.map(([key,value]) => fact('UTM ' + key, value)).join('')}</dl>
            ${source.length ? '' : '<p class="order-note">未記錄來源資訊。</p>'}
            <a class="order-source-link" href="/kol?kol_id=${encodeURIComponent(order.kol_attribution?.id || 'general')}">查看此歸屬的訂單 ↗</a>
          </section>
        </aside>
      </div>`;
    document.getElementById('copy-order-id').addEventListener('click', async () => {
      const feedback = document.getElementById('copy-order-message');
      try { await navigator.clipboard.writeText(order.order_id); feedback.textContent = '已複製'; }
      catch {
        root.querySelector('.order-full-id').open = true;
        feedback.textContent = '無法自動複製，請選取下方完整 ID 複製。';
      }
    });
  }

  async function load() {
    root.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch('/api/portfolio/order?id=' + encodeURIComponent(id), {cache:'no-store'});
      if (!response.ok) {
        const error = new Error(); error.status = response.status; throw error;
      }
      const order = await response.json();
      if (order.order_id !== id) throw new Error('Order identity mismatch');
      render(order);
    } catch (error) {
      const missing = error.status === 404;
      document.title = (missing ? '找不到訂單' : '訂單載入失敗') + '｜StockPilot';
      root.innerHTML = `<div class="order-load-error" role="alert"><h1>${missing ? '找不到這張訂單' : '暫時無法載入訂單'}</h1><p>${missing ? '請確認訂單連結或完整 ID，或返回列表搜尋。' : '請檢查連線後重試；目前未顯示任何訂單資料。'}</p><code>${esc(id)}</code>${missing ? '' : '<button type="button" id="retry-order">重新載入</button>'}</div>`;
      document.getElementById('retry-order')?.addEventListener('click', load);
    } finally { root.setAttribute('aria-busy', 'false'); }
  }
  load();
})();
