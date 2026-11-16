/* Uses the original KOL save command and exact UTM attribution rule. */
let kolResult, kolRequest = 0;
async function loadPortfolioKol(page = 1) {
  const sequence = ++kolRequest;
  const query = new URLSearchParams({page});
  for (const key of ['kol_id','start','end','status']) {
    const value = document.getElementById(`kol-filter-${key}`)?.value ?? new URLSearchParams(demoLocation.search).get(key);
    if (value) query.set(key,value);
  }
  const target = document.getElementById('kol-content');
  target.setAttribute('aria-busy','true');
  try {
    const result = await api('/api/portfolio/kol?'+query);
    if (sequence !== kolRequest) return;
    kolResult = result;
    renderPortfolioKol(result);
    demoHistory.replaceState(null,'','/kol?'+query);
    $('#kol-workspace-link').href = result.workspace_url;
  } catch (error) {
    if (!$('#kol-feedback')) target.innerHTML='<p id="kol-feedback" role="alert"></p><button id="kol-retry">重新載入</button>';
    $('#kol-feedback').textContent=error.message;
  } finally { if (sequence===kolRequest) target.setAttribute('aria-busy','false'); }
}
function renderPortfolioKol(result) {
  const selected = result.groups.find(g=>g.id===result.filters.kol_id);
  const creators = result.groups.filter(g=>!['general','unattributed'].includes(g.id));
  const options = result.groups.map(g=>`<option value="${esc(g.id)}" ${g.id===result.filters.kol_id?'selected':''}>${esc(g.name)}</option>`).join('');
  $('#kol-content').innerHTML = `
    <div class="kol-actions"><button id="kol-new">新增 KOL</button><a href="${esc(result.workspace_url)}">進階設定與匯出 ↗</a></div>
    <form id="kol-filters" class="kol-filters">
      <label>KOL／歸屬分類<select id="kol-filter-kol_id"><option value="">全部分類</option>${options}</select></label>
      <label>起日（台北）<input id="kol-filter-start" type="date" value="${esc(result.filters.start)}"></label>
      <label>迄日（台北）<input id="kol-filter-end" type="date" value="${esc(result.filters.end)}"></label>
      <label>明細狀態<select id="kol-filter-status">${[['all','全部'],['active','有效'],['cancelled','已取消']].map(([value,label])=>`<option value="${value}" ${result.filters.status===value?'selected':''}>${label}</option>`).join('')}</select></label>
      <button>套用條件</button>
    </form><p id="kol-feedback" role="status"></p>
    <h2>${esc(selected?.name || '全部商店訂單')}</h2>
    <p>統計期間：${esc(result.period.start || '尚無訂單')} ～ ${esc(result.period.end || '—')}（台北時間，含起迄日）。</p>
    <div class="kol-summary"><div><span>有效訂單</span><strong>${result.summary.order_count} 張</strong></div><div><span>商品銷量</span><strong>${result.summary.quantity} 件</strong></div><div><span>有效商品金額</span><strong>${money(result.summary.total)}</strong></div></div>
    <p class="kol-rule">統計選定期間與歸屬的有效訂單，商品金額為實際明細加總，不含運費、非實收款。已取消 ${result.summary.cancelled_count} 張保留在明細但不計入訂單數、銷量或金額。下方狀態篩選僅影響明細；本商店沒有退款金額流程，倉管退回庫存不等於退款。</p>
    <details><summary>管理 KOL（${creators.length} 位）</summary><div class="kol-directory">${creators.map(g=>`<article><h3>${esc(g.name)}</h3><p>${esc(g.platforms.join('、') || '未填平台')} · ${esc(g.campaign_name || '未填活動名稱')}</p><p>UTM medium：${esc(g.utms.join(', '))}</p><p>${g.order_count} 張／${g.quantity} 件／${money(g.total)}</p><div class="kol-actions"><button data-kol-view="${esc(g.id)}">查看成效</button><button data-kol-edit="${esc(g.id)}">編輯資料</button></div><label>推薦連結（開啟後使用同一分頁完成下單）<input readonly aria-label="${esc(g.name)} 推薦連結" value="${esc(result.shop_url+'shop?utm_source=kol&utm_medium='+encodeURIComponent(g.utms[0])+'&utm_campaign='+encodeURIComponent(g.campaign_name))}"></label><a target="_blank" rel="noopener" href="${esc(result.shop_url+'shop?utm_source=kol&utm_medium='+encodeURIComponent(g.utms[0])+'&utm_campaign='+encodeURIComponent(g.campaign_name))}">開啟推薦商店 ↗</a></article>`).join('') || '<p>尚無 KOL，請先新增。</p>'}</div></details>
    <h3>訂單與售出商品明細</h3><p>點選訂單編號查看出貨狀態；展開商品可核對每筆數量與金額。</p>
    <div class="table-scroll kol-order-scroll" tabindex="0" role="region" aria-label="KOL 訂單明細，可左右捲動"><table><thead><tr><th>訂單／日期</th><th>歸屬</th><th>商品</th><th>金額</th><th>訂單狀態</th></tr></thead><tbody>${result.orders.map(o=>`<tr><td><a href="/orders?order=${encodeURIComponent(o.order_id)}">${esc(o.order_id)}</a><br>${esc(o.day)}</td><td>${esc(o.kol_name)}<br><small>${esc(o.reason)}</small></td><td><details><summary>${o.quantity} 件／${o.lines.length} 項商品</summary>${o.lines.map(l=>`<p>${esc(l.name)}<br><small>${esc(l.sku)}</small><br>${l.quantity} 件 · ${money(l.amount)}</p>`).join('')}</details></td><td>${money(o.total)}</td><td><span class="status ${o.status==='cancelled'?'cancelled':'placed'}">${o.status==='cancelled'?'已取消（不計業績）':'有效訂單'}</span></td></tr>`).join('') || '<tr><td colspan="5">沒有符合條件的訂單。</td></tr>'}</tbody></table></div>
    <div class="remote-pager"><span>${result.total} 筆 · 第 ${result.page}／${result.pages} 頁，每頁 25 筆</span><button data-kol-page="${result.page-1}" ${result.page===1?'disabled':''}>上一頁</button><button data-kol-page="${result.page+1}" ${result.page===result.pages?'disabled':''}>下一頁</button></div>
    <p>歸屬規則：沿用 UTM medium 精確比對，訂單日期須不早於合作開始時間。無代碼為「一般訂單」；未知代碼為「待確認歸屬」。同分頁保留最近一組帶 UTM 的來源，新連結會取代舊來源；不提供跨裝置追蹤。修改代碼或合作日期會重新計算歷史歸屬。</p>`;
}
function editPortfolioKol(id) {
  const k = kolResult.groups.find(g=>g.id===id);
  let dialog = $('#kol-editor');
  if (!dialog) { dialog=document.createElement('dialog');dialog.id='kol-editor';dialog.setAttribute('aria-label','KOL 基本資料');document.body.append(dialog); }
  dialog.innerHTML=`<form id="kol-save-form"><h2>${k?'編輯':'新增'} KOL</h2><label>名稱<input name="name" required maxlength="200" value="${esc(k?.name || '')}"></label><label>平台（逗號分隔）<input name="platforms" maxlength="2000" value="${esc(k?.platforms.join(',') || '')}"></label><label>合作開始日期（台北時間）<input name="started_at" type="date" required value="${k?taipeiDay(k.started_at):new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Taipei'})}"></label><label>UTM medium（逗號分隔，不重複）<input name="utms" required maxlength="2000" value="${esc(k?.utms.join(',') || '')}"></label><label><input name="keep_case" type="checkbox" ${k?.keep_case?'checked':''}> 保留代碼大小寫（訂單需完全相同）</label><label>活動名稱<input name="campaign_name" maxlength="200" value="${esc(k?.campaign_name || '')}"></label><label>備註<textarea name="comment" maxlength="2000">${esc(k?.comment || '')}</textarea></label><p>不勾選保留大小寫時，代碼會轉為小寫。修改設定會重新計算歷史訂單歸屬。</p><p id="kol-save-feedback" role="alert"></p><div class="kol-actions"><button type="submit">保存 KOL</button><button type="button" id="kol-edit-close">取消</button></div></form>`;
  $('#kol-edit-close').onclick=()=>dialog.close();
  $('#kol-save-form').onsubmit=async event=>{
    event.preventDefault(); const button=event.target.querySelector('[type=submit]');button.disabled=true;
    const form=new FormData(event.target),body=Object.fromEntries(form);
    body.started_at = k && body.started_at === taipeiDay(k.started_at) ? k.started_at : body.started_at + 'T00:00:00+08:00';
    body.keep_case=form.has('keep_case');body.operation_id=uuid();
    if(k){body.id=k.id;body.expected_version=k.version;}
    try { const saved=await post('/api/portfolio/kols',body);dialog.close();await loadPortfolioKol();$('#kol-feedback').textContent=`已保存 ${saved.name}`; }
    catch(error){$('#kol-save-feedback').textContent=error.message;}
    finally{button.disabled=false;}
  };
  dialog.showModal();
}
document.addEventListener('submit',event=>{if(event.target.id==='kol-filters'){event.preventDefault();loadPortfolioKol();}});
document.addEventListener('click',event=>{
  if(event.target.closest('#kol-new'))editPortfolioKol();
  if(event.target.closest('#kol-retry'))loadPortfolioKol();
  const edit=event.target.closest('[data-kol-edit]'),view=event.target.closest('[data-kol-view]'),page=event.target.closest('[data-kol-page]');
  if(edit)editPortfolioKol(edit.dataset.kolEdit);
  if(view){$('#kol-filter-kol_id').value=view.dataset.kolView;loadPortfolioKol();}
  if(page)loadPortfolioKol(Number(page.dataset.kolPage));
});
