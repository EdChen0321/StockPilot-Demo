/* Native JS dashboard; all charts and readable tables share the same response. */
(() => {
  const root = document.getElementById('hub');
  if (!root) return;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money = cents => new Intl.NumberFormat('zh-TW', {style:'currency', currency:'TWD', maximumFractionDigits:2}).format(cents/100);
  const num = value => Number(value).toLocaleString('zh-TW');
  let sequence = 0, charts = [], latest, query = new URLSearchParams(demoLocation.search);
  const range = () => new URLSearchParams([...query].filter(([k]) => ['start','end'].includes(k)));
  const url = (path, extra = {}) => { const p = range(); Object.entries(extra).forEach(([k,v])=>p.set(k,v)); return path + '?' + p; };
  const titles = [['awaiting_pickup','待取貨'],['overdue','滿 96 小時未取'],['reminded','已模擬提醒・未取'],['returning','退回途中'],['returned','已退回']];
  function table(head, rows) { return `<div class="od-table-wrap"><table><thead><tr>${head.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${head.length}">此範圍沒有資料。</td></tr>`}</tbody></table></div>`; }
  function chart(id, options, click) {
    const element = document.getElementById(id);
    if (!window.echarts) { element.classList.add('chart-unavailable'); element.textContent = '圖表未載入；請查看下方數據表。'; return; }
    try { const instance = echarts.init(element); instance.setOption({...options, animation:false, aria:{enabled:true}, textStyle:{fontFamily:'system-ui, sans-serif'}}); if(click) instance.on('click', click); charts.push(instance); }
    catch { element.textContent = '圖表無法顯示；下方數據表仍可查閱。'; }
  }
  function render(data) {
    latest = data; charts.forEach(c=>c.dispose()); charts=[];
    const m = data.metrics, period = `${data.start || data.data_period.start || '無起始日'} ～ ${data.end || data.data_period.end || '無結束日'}`;
    root.innerHTML = `<div class="od-heading"><div><p class="eyebrow dark">OPERATIONS / 營運總覽</p><h1 id="hub-title">營運狀況，一眼掌握。</h1><p>虛構訂單與實存庫存 · 模擬付款，未實際收款</p></div><button id="od-refresh" type="button">更新資料 ↻</button></div>
      <form id="od-range" class="od-toolbar"><div><label for="od-start">下單起日</label><input id="od-start" type="date" value="${escape(query.get('start')||'')}"></div><span aria-hidden="true">—</span><div><label for="od-end">下單迄日</label><input id="od-end" type="date" value="${escape(query.get('end')||'')}"></div><button type="submit">套用日期</button><div class="od-presets" aria-label="日期範圍"><button type="button" data-days="7">最近 7 天</button><button type="button" data-days="30">最近 30 天</button><button type="button" data-days="0">全部期間</button></div></form>
      <p class="od-scope">${escape(period)}（Asia/Taipei，含起迄日）· 訂單金額、件數排除已取消訂單；不扣退貨、不代表收入。<span id="od-status" role="status"></span></p>
      <div class="od-metrics">${[['訂單金額',money(m.amount_cents),'商品小計，未含獨立運費','valid'],['有效訂單',`${num(m.order_count)} 張`,`${num(m.quantity)} 件商品`,'valid'],['待完成出貨',`${num(m.awaiting)} 張`,'包含部分出貨','active'],['已完成出貨',`${num(m.shipped)} 張`,'保留出貨事實，不扣物流退回','shipped']].map(([label,value,hint,state],i)=>`<a class="od-metric ${i===0?'od-emphasis':''}" href="${url('/orders',{state})}"><span>${label} ↗</span><strong>${value}</strong><small>${hint}</small></a>`).join('')}</div>
      <section class="od-panel od-pickup"><div class="od-panel-heading"><div><p class="eyebrow dark">ACTION QUEUE / 待辦</p><h2>包裹取貨與退回</h2></div><a href="${url('/pickups')}">全部 ${num(data.parcel_count)} 個包裹 ↗</a></div><div class="od-pickup-counts">${titles.map(([key,label])=>`<a href="${url('/pickups',{filter:key})}"><span>${label}</span><strong data-pickup-count="${key}">${num(data.pickup[key])}</strong><small>查看清單 ↗</small></a>`).join('')}</div><p class="od-note">包裹判斷時間：${new Date(data.clock.now).toLocaleString('zh-TW',{timeZone:'Asia/Taipei',hour12:false})}（台北 · ${data.clock.simulation?'隔離模擬時鐘':'系統時間'}）。依所選下單日期的包裹，目前狀態含已取消訂單的出貨歷史。「滿 96 小時」與「已模擬提醒」可重疊。提醒不是真實寄信；退回不會自動入庫或退款。</p></section>
      <div class="od-chart-grid"><section class="od-panel"><div class="od-panel-heading"><div><p class="eyebrow dark">DAILY PERFORMANCE</p><h2>訂單與金額趨勢</h2></div></div><p class="od-note">上下圖共用日期軸，分開量尺。點選折線資料點可查看當日訂單。</p><div id="od-trend" class="od-chart" role="img" aria-label="每日訂單金額及訂單數"></div><details><summary>查看每日數據與訂單</summary>${table(['下單日期','有效訂單','訂單金額'], data.trend.map(d=>[`<a href="/orders?state=valid&start=${d.day}&end=${d.day}">${d.day}</a>`,num(d.orders),money(d.amount_cents)]))}</details></section>
      <section class="od-panel"><div class="od-panel-heading"><div><p class="eyebrow dark">PRODUCT RANKING</p><h2>商品銷售排行</h2></div><span>依件數 · 前 8 名</span></div><p class="od-note">點長條或商品名稱，查看同期間的商品訂單明細。</p><div id="od-rank" class="od-chart" role="img" aria-label="商品銷售件數排行"></div><details><summary>查看全部 ${data.products.length} 款商品數據</summary>${table(['商品','件數','金額'],data.products.map(p=>[`<button type="button" class="od-text" data-product="${escape(p.id)}">${escape(p.name)}<small>${escape(p.sku)}</small></button>`,num(p.quantity),money(p.amount_cents)]))}</details></section></div>
      <section id="od-product-detail" class="od-panel" hidden tabindex="-1"></section>
      <section class="od-panel"><div class="od-panel-heading"><div><p class="eyebrow dark">STOCK WATCH / 目前快照</p><h2>優先補貨商品</h2></div><span>缺貨 ${num(data.out_of_stock)} 款 ／ 低於 3 件 ${num(data.low_stock)} 款（含缺貨）</span></div><p class="od-note">庫存不受下單日期篩選影響。可出貨量沿用倉管規則：已配櫃、品質與包裝正常，排除已配貨、調撥與退貨待處理件。</p><label class="od-stock-filter"><input id="od-stock-all" type="checkbox"> 顯示全部 ${data.stock.length} 款商品</label><div id="od-stock-table"></div></section>
      <p class="od-note od-footer">本機作品集 · Apache ECharts 6.1.0 · <a href="/StockPilot-Demo/interactive/vendor/echarts-6.1.0/LICENSE">Apache-2.0 授權</a> · <a href="/StockPilot-Demo/interactive/vendor/echarts-6.1.0/NOTICE">NOTICE</a></p>`;
    const trend = data.trend, top = data.products.slice(0,8);
    chart('od-trend', {color:['#167078','#9b651b'], tooltip:{trigger:'axis'}, grid:[{left:70,right:20,top:35,height:130},{left:70,right:20,top:210,height:80}], xAxis:[{type:'category',data:trend.map(d=>d.day),gridIndex:0,axisLabel:{show:false}},{type:'category',data:trend.map(d=>d.day),gridIndex:1,axisLabel:{hideOverlap:true}}], yAxis:[{type:'value',name:'訂單金額（TWD）',gridIndex:0},{type:'value',name:'有效訂單（張）',minInterval:1,gridIndex:1}], series:[{name:'訂單金額 TWD',type:'line',data:trend.map(d=>d.amount_cents/100),symbolSize:6,xAxisIndex:0,yAxisIndex:0},{name:'有效訂單',type:'line',data:trend.map(d=>d.orders),symbolSize:6,xAxisIndex:1,yAxisIndex:1}]}, p=>{const day=trend[p.dataIndex]?.day;if(day)demoLocation.href='/orders?state=valid&start='+day+'&end='+day;});
    chart('od-rank', {color:['#167078'], tooltip:{trigger:'axis',axisPointer:{type:'shadow'}},grid:{left:150,right:35,top:20,bottom:40},xAxis:{type:'value',name:'件',minInterval:1},yAxis:{type:'category',inverse:true,data:top.map(p=>p.name),axisLabel:{width:130,overflow:'truncate'}},series:[{type:'bar',data:top.map(p=>p.quantity),barMaxWidth:22,label:{show:true,position:'right'}}]}, p=>showProduct(top[p.dataIndex]?.id));
    if (!m.order_count) document.getElementById('od-status').textContent=' 此範圍沒有有效訂單。';
    stockTable(false);
    document.getElementById('od-stock-all').onchange=e=>stockTable(e.target.checked);
    document.getElementById('od-refresh').onclick=load;
    document.getElementById('od-range').onsubmit=e=>{e.preventDefault();query=new URLSearchParams();for(const key of ['start','end']){const value=document.getElementById('od-'+key).value;if(value)query.set(key,value);}load();};
    root.querySelectorAll('[data-days]').forEach(b=>b.onclick=()=>{
      query=new URLSearchParams();const days=Number(b.dataset.days);
      if(days){const end=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());const d=new Date(end+'T00:00:00+08:00');d.setUTCDate(d.getUTCDate()-days+1);query.set('start',new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(d));query.set('end',end);}load();
    });
    root.querySelectorAll('[data-product]').forEach(b=>b.onclick=()=>showProduct(b.dataset.product));
  }
  function stockTable(all) {
    const rows=latest.stock.filter(p=>all||p.available<3), base=document.body.dataset.fulfillmentUrl;
    document.getElementById('od-stock-table').innerHTML=table(['商品 / SKU','可出貨量','處理'],rows.map(p=>[`${escape(p.name)}<small>${escape(p.sku)}</small>`,`${num(p.available)} 件 · ${p.available===0?'缺貨':p.available<3?'低庫存':'正常'}`,`<a href="${escape(base)}warehouse-workspace#catalogue/${encodeURIComponent(p.id)}">查看商品 / 補貨 ↗</a>`]));
  }
  async function showProduct(id) {
    if(!id)return;const panel=document.getElementById('od-product-detail');panel.hidden=false;panel.textContent='正在讀取商品明細…';panel.focus();
    const requestSequence=sequence;
    try {const response=await fetch(url('/api/portfolio/dashboard',{product_id:id}));if(!response.ok)throw new Error('明細讀取失敗');const data=await response.json();if(requestSequence!==sequence)return;const product=data.products.find(p=>p.id===id);
      panel.innerHTML=`<div class="od-panel-heading"><h2>${escape(product?.name||'商品')} · 訂單明細</h2><button id="od-close-detail">關閉明細</button></div><p>${num(product?.quantity||0)} 件 · ${money(product?.amount_cents||0)} · 與上方排行相同期間</p>${table(['訂單','件數','商品金額'],data.product_detail.map(d=>[`<a href="/orders/${encodeURIComponent(d.order_id)}">${escape(d.order_id)}</a>`,num(d.quantity),money(d.amount_cents)]))}`;document.getElementById('od-close-detail').onclick=()=>{panel.hidden=true;};
    }catch(e){panel.textContent=e.message;}
  }
  async function load() {
    const requestSequence=++sequence;root.setAttribute('aria-busy','true');
    try {const response=await fetch('/api/portfolio/dashboard?'+range(),{cache:'no-store'});const data=await response.json();if(!response.ok)throw new Error(data.error||'讀取失敗');if(requestSequence!==sequence)return;demoHistory.replaceState(null,'','/?'+range());render(data);}
    catch(e){if(requestSequence===sequence){root.innerHTML=`<h1 id="hub-title">總覽暫時無法載入</h1><p role="alert">${escape(e.message)}</p><button id="od-retry">重試</button> <a href="/">清除日期篩選</a>`;document.getElementById('od-retry').onclick=load;}}
    finally{if(requestSequence===sequence)root.removeAttribute('aria-busy');}
  }
  new ResizeObserver(()=>charts.forEach(c=>c.resize())).observe(root);
  window.StockDashboard={load};
  load();
})();
