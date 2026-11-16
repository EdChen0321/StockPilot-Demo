/* Shared parcel summary and the operations pickup ledger. No real notification APIs. */
(() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const date = value => value ? new Date(value).toLocaleString('zh-TW',{timeZone:'Asia/Taipei',hour12:false}) : '未提供';
  const labels={in_transit:'運送中',awaiting_pickup:'已到店待取',collected:'已取件',returning:'退回途中',returned:'已退回',delivered:'宅配已送達'};
  const filters={all:'全部包裹',awaiting_pickup:'待取貨',overdue:'滿 96 小時仍未取',reminded:'已模擬提醒但尚未取',returning:'退回途中',returned:'已退回',collected:'已取件',in_transit:'運送中',delivered:'宅配已送達',unknown:'配送方式未知'};
  const englishLabels={in_transit:'In transit',awaiting_pickup:'Ready for pickup',collected:'Collected',returning:'Returning to sender',returned:'Returned',delivered:'Delivered'};
  const summary = (parcels, language='zh') => {
    const en=language==='en';
    const displayDate=value=>value?new Date(value).toLocaleString(en?'en-GB':'zh-TW',{timeZone:'Asia/Taipei',hour12:false}):(en?'Not recorded':'未提供');
    return `<div class="parcel-summary"><h3>${en?'Parcel tracking':'包裹物流追蹤'}</h3>${parcels?.length?parcels.map(p=>`<p><strong>${esc(p.number)} · ${esc(en?englishLabels[p.state]||p.state:p.label)}</strong>${p.active?'':en?' (Previous dispatch; shipment reopened)':'（歷史批次，已重開出貨）'}${p.warehouse_returns?.received_units?`<br>${en?`Warehouse returns: ${p.warehouse_returns.received_units} units; pending inspection: ${p.warehouse_returns.held_units} (separate from carrier events)`:`原出貨單實物退貨入庫：${p.warehouse_returns.received_units} 件；待處理：${p.warehouse_returns.held_units} 件（與物流事件分開）`}`:''}<br>${en?'Arrival':'到店'}: ${displayDate(p.arrival_at)} (${en?'Taipei':'台北'})${p.reminder?`<br>${en?'Simulated email reminder':'模擬寄信提醒'}: ${displayDate(p.reminder.checked_at)}${en?'; no email sent':'；未實際寄信'}`:''}</p>`).join(''):`<p>${en?'No dispatched parcels yet.':'尚無已完成出貨的包裹。'}</p>`}<small>${en?'Carrier returns and warehouse returns are recorded separately. This does not imply a refund or restored sellable stock.':'物流退回與倉庫退貨入庫分開記錄；不代表退款或恢復可售。'}</small></div>`;
  };
  window.ParcelUI={summary};
  const root=document.getElementById('pickups');if(!root)return;
  let params=new URLSearchParams(demoLocation.search), snapshot, sequence=0, busy=false;
  // Preserve the existing order-list context through the parcel round trip.
  let returnUrl=null;
  try {
    const candidate=new URL(params.get('back')||'',demoLocation.origin);
    if(params.has('back') && candidate.origin===demoLocation.origin && /^\/orders(?:\/TIDE-[A-F0-9]+)?$/.test(candidate.pathname)) returnUrl=candidate;
  } catch {}
  const orderLink=id=>returnUrl?.pathname==='/orders/'+id?returnUrl.pathname+returnUrl.search:'/orders/'+encodeURIComponent(id);
  const apiParams=()=>new URLSearchParams([...params].filter(([key])=>['start','end','filter','order_id'].includes(key)));
  function render(data) {
    snapshot=data;
    root.innerHTML=`<div class="od-heading"><div><p class="eyebrow dark">FULFILLMENT / 包裹追蹤</p><h1 id="pickup-title">取貨追蹤</h1><p>每個出貨批次各自追蹤，提醒與物流分開保存。完成出貨先建立「運送中」模擬事件，不代表真實物流回報。</p></div><button id="pickup-refresh">更新 / 檢查提醒 ↻</button></div>
      ${returnUrl?`<p><a id="pickup-back" href="${esc(returnUrl.pathname+returnUrl.search)}">← 返回訂單詳情與原查詢</a></p>`:''}
      <div class="pickup-policy"><strong>模擬寄信提醒，沒有實際寄送。</strong><p>到店後經過 96 小時仍待取才產生提醒。同一到店事件只記錄一次。時間以 Asia/Taipei 顯示；未提供時間不推測，逾期不自動視為退回。</p><p>目前檢查時間：<strong>${date(data.clock.now)}</strong>（${data.clock.simulation?'隔離模擬時鐘':'系統時間'}）· 服務運行時每 30 秒檢查，開頁與重啟亦檢查。</p>${data.clock.simulation?'<div class="pickup-clock-actions"><button data-advance="24">模擬時間 +24 小時</button><button data-advance="96">模擬時間 +96 小時</button><span>僅影響此隔離庫包裹判斷；不改訂單日期與庫存。</span></div>':''}</div>
      <form id="pickup-filter" class="od-toolbar"><div><label for="pickup-state">處理狀態</label><select id="pickup-state">${Object.entries(filters).map(([k,v])=>`<option value="${k}" ${params.get('filter')===k?'selected':''}>${v}</option>`).join('')}</select></div><div><label for="pickup-start">下單起日</label><input id="pickup-start" type="date" value="${esc(params.get('start')||'')}"></div><div><label for="pickup-end">下單迄日</label><input id="pickup-end" type="date" value="${esc(params.get('end')||'')}"></div><div class="pickup-search"><label for="pickup-order">完整訂單編號</label><input id="pickup-order" value="${esc(params.get('order_id')||'')}" placeholder="TIDE-…"></div><button>套用篩選</button><a href="/pickups">清除</a></form>
      <p class="od-scope" role="status" id="pickup-status">符合條件 ${data.parcels.length} 個包裹 · 日期依原訂單的台北下單日（含起迄日），不是到店日。<a href="/?${new URLSearchParams([...params].filter(([k])=>['start','end'].includes(k)))}">回同期間總覽 ↗</a></p>
      <div class="parcel-list">${data.parcels.length?data.parcels.map(parcel).join(''):'<div class="od-panel"><h2>此條件沒有包裹</h2><p>可調整日期與狀態，或從顧客訂單進入原倉管完成出貨。新包裹會沿用原出貨單自動出現。</p><a href="/orders">查看顧客訂單 ↗</a></div>'}</div>`;
    document.getElementById('pickup-filter').onsubmit=e=>{e.preventDefault();params=new URLSearchParams();if(returnUrl)params.set('back',returnUrl.pathname+returnUrl.search);for(const [key,id] of [['filter','state'],['start','start'],['end','end'],['order_id','order']]){const value=document.getElementById('pickup-'+id).value.trim();if(value)params.set(key,value);}load();};
    document.getElementById('pickup-refresh').onclick=load;
    root.querySelectorAll('[data-advance]').forEach(b=>b.onclick=()=>mutate('/api/portfolio/pickups/clock',{hours:Number(b.dataset.advance),token:crypto.randomUUID()}));
    root.querySelectorAll('.parcel-event-form').forEach(form=>form.onsubmit=e=>{e.preventDefault();const p=data.parcels.find(p=>p.id===form.dataset.parcel),input=form.querySelector('[name=time]').value;if(!input)return;mutate(`/api/portfolio/pickups/${p.id}/events`,{state:form.querySelector('[name=state]').value,occurred_at:input+':00+08:00',version:p.version,note:form.querySelector('[name=note]').value,token:crypto.randomUUID()});});
  }
  function parcel(p) {
    return `<article class="od-panel parcel-card"><div class="od-panel-heading"><div><h2>${esc(p.number)}</h2><a href="${esc(orderLink(p.order_id))}">查看訂單 ${esc(p.order_id)} ↗</a></div><span class="parcel-state state-${p.state}">${esc(p.label)}</span></div><dl class="parcel-facts"><div><dt>包裹 / 出貨批次</dt><dd>${esc(p.id.slice(0,12))} / ${p.dispatch_revision+1}</dd></div><div><dt>配送方式</dt><dd>${({pickup:'超商取貨',delivery:'宅配',unknown:'未記錄，停用取貨提醒'})[p.mode]}</dd></div><div><dt>到店時間（台北）</dt><dd>${date(p.arrival_at)}</dd></div><div><dt>模擬寄信提醒</dt><dd>${p.reminder?`${date(p.reminder.checked_at)} · 已記錄，未寄信`:p.overdue?'等待檢查':'尚無提醒紀錄'}</dd></div></dl>
      ${p.warehouse_returns?.received_units?`<p class="pickup-warning">原出貨單已實物退貨入庫 ${p.warehouse_returns.received_units} 件，其中 ${p.warehouse_returns.held_units} 件待處理。物流狀態是獨立模擬紀錄，請核對實物與物流事件；系統不自動改寫歷史。</p>`:''}
      ${p.state==='returned'?'<p class="pickup-warning">物流已退回；庫存、商品成本與退款不會自動變動。需到原倉管「退貨入庫」檢查實物，再視情況「轉回入庫」。</p>':''}
      <details><summary>事件歷程與模擬操作（${p.events.length} 筆物流事件）</summary><ol class="parcel-events">${p.events.map(e=>`<li><strong>${esc(labels[e.kind]||e.kind)}</strong><span>事件：${date(e.occurred_at)} ／ 記錄：${date(e.recorded_at)}</span>${JSON.parse(e.payload).note?`<span>${esc(JSON.parse(e.payload).note)}</span>`:''}</li>`).join('')}${p.reminder?`<li class="reminder-event"><strong>模擬寄信提醒（未實際寄送）</strong><span>96 小時到期：${date(p.reminder.due_at)}<br>檢查時間：${date(p.reminder.checked_at)} ／ 寫入時間：${date(p.reminder.recorded_at)}</span></li>`:''}</ol>
      ${p.allowed.length?`<form class="parcel-event-form" data-parcel="${p.id}"><h3>記錄虛構物流事件</h3><label>下一狀態<select name="state">${p.allowed.map(s=>`<option value="${s}">${labels[s]}</option>`).join('')}</select></label><label>事件時間（台北，必填）<input name="time" type="datetime-local" required></label><label>備註<input name="note" maxlength="500" placeholder="虛構情境說明"></label><button type="submit">保存模擬物流事件</button><p class="od-note">時間不得早於上一事件、晚於上方檢查時間。終止狀態不能退回待取；重複送出不會新增到店事件。</p></form>`:'<p class="od-note">此包裹已結案，保留完整歷程，不再產生取貨提醒。</p>'}
      <a href="${esc(document.body.dataset.fulfillmentUrl)}warehouse-workspace#shipping/${p.shipment_id}">查看原出貨單 ↗</a></details></article>`;
  }
  async function mutate(path, body) {
    if(busy)return;busy=true;root.querySelectorAll('button').forEach(b=>b.disabled=true);
    try{const response=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json','X-Requested-With':'operations-ui'},body:JSON.stringify(body)});const result=await response.json();if(!response.ok)throw new Error(result.error||'操作失敗');await load();document.getElementById('pickup-status').textContent+=' · 已保存模擬紀錄。';}
    catch(e){document.getElementById('pickup-status').textContent=e.message;document.getElementById('pickup-status').setAttribute('role','alert');}
    finally{busy=false;root.querySelectorAll('button').forEach(b=>b.disabled=false);}
  }
  async function load() {
    const requestSequence=++sequence;root.setAttribute('aria-busy','true');
    try{const response=await fetch('/api/portfolio/pickups?'+apiParams(),{cache:'no-store'});const data=await response.json();if(!response.ok)throw new Error(data.error||'載入失敗');if(requestSequence!==sequence)return;demoHistory.replaceState(null,'','/pickups?'+params);render(data);}
    catch(e){if(requestSequence===sequence){root.innerHTML=`<h1 id="pickup-title">取貨追蹤暫時無法載入</h1><p role="alert">${esc(e.message)}</p><button id="pickup-retry">重新載入</button> <a href="/pickups">清除篩選</a>`;document.getElementById('pickup-retry').onclick=load;}}
    finally{if(requestSequence===sequence)root.removeAttribute('aria-busy');}
  }
  load();
})();
