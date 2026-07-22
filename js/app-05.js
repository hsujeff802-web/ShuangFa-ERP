
(function(){
  function n(v){const x=Number(v);return Number.isFinite(x)?x:0}
  function esc(v){return typeof escapeHtml==='function'?escapeHtml(String(v??'')):String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function fmt(v){return typeof money==='function'?money(Math.round(n(v))):Math.round(n(v)).toLocaleString('zh-TW')}
  function isCash(text){return String(text||'').includes('現金')}
  function logAmount(l){
    if(l.type==='銷貨') return n(l.total||l.payable||l.netTotal||l.amount);
    if(l.type==='進貨') return n(l.total||l.amount||n(l.qty)*n(l.unit));
    if(l.type==='進退貨') return n(l.total||l.amount||n(l.qty)*n(l.unit));
    if(l.type==='客戶退貨') return n(l.total||l.amount||n(l.qty)*n(l.unit));
    return n(l.total||l.amount||n(l.qty)*n(l.unit));
  }
  function ensure(){
    state.dailyClosings=Array.isArray(state.dailyClosings)?state.dailyClosings:[];
  }
  function selectedDate(){return document.getElementById('dc10Date')?.value || (typeof today==='function'?today():new Date().toISOString().slice(0,10))}
  function rowsForDate(date){return (state.logs||[]).filter(l=>String(l.date||'').slice(0,10)===date)}
  function calc(date){
    const rows=rowsForDate(date);
    const sales=rows.filter(x=>x.type==='銷貨');
    const purchases=rows.filter(x=>x.type==='進貨');
    const supplierReturns=rows.filter(x=>x.type==='進退貨');
    const customerReturns=rows.filter(x=>x.type==='客戶退貨');
    const payments={};
    sales.forEach(l=>{const p=l.payment||'未指定';payments[p]=(payments[p]||0)+logAmount(l)});
    const salesTotal=sales.reduce((a,l)=>a+logAmount(l),0);
    const purchaseTotal=purchases.reduce((a,l)=>a+logAmount(l),0);
    const supplierReturnTotal=supplierReturns.reduce((a,l)=>a+logAmount(l),0);
    const customerReturnTotal=customerReturns.reduce((a,l)=>a+logAmount(l),0);
    const cashSales=sales.filter(l=>isCash(l.payment)).reduce((a,l)=>a+logAmount(l),0);
    const cashPurchases=purchases.filter(l=>isCash(l.payment)).reduce((a,l)=>a+logAmount(l),0);
    const cashSupplierReturns=supplierReturns.filter(l=>isCash(l.payment)).reduce((a,l)=>a+logAmount(l),0);
    const cashCustomerReturns=customerReturns.filter(l=>isCash(l.payment)).reduce((a,l)=>a+logAmount(l),0);
    const inQty=purchases.reduce((a,l)=>a+n(l.qty),0)+customerReturns.filter(l=>l.restock!==false).reduce((a,l)=>a+n(l.qty),0);
    const outQty=sales.reduce((a,l)=>a+n(l.qty),0)+supplierReturns.reduce((a,l)=>a+n(l.qty),0);
    return {date,rows,sales,purchases,supplierReturns,customerReturns,payments,salesTotal,purchaseTotal,supplierReturnTotal,customerReturnTotal,cashSales,cashPurchases,cashSupplierReturns,cashCustomerReturns,inQty,outQty};
  }
  window.dc10RenderSummary=function(){
    const c=calc(selectedDate());
    const opening=n(document.getElementById('dc10OpeningCash')?.value);
    const adjustment=n(document.getElementById('dc10Adjustment')?.value);
    const counted=n(document.getElementById('dc10CountedCash')?.value);
    const expected=opening+c.cashSales-c.cashPurchases+c.cashSupplierReturns-c.cashCustomerReturns+adjustment;
    const diff=counted-expected;
    const set=(id,text)=>{const e=document.getElementById(id);if(e)e.textContent=text};
    set('dc10SalesTotal','$'+fmt(c.salesTotal));set('dc10PurchaseTotal','$'+fmt(c.purchaseTotal));set('dc10ExpectedCash','$'+fmt(expected));set('dc10CashDiff',(diff>=0?'+':'')+'$'+fmt(diff));
    const diffEl=document.getElementById('dc10CashDiff');if(diffEl)diffEl.style.color=diff===0?'#137333':(Math.abs(diff)<=10?'#a66b00':'#b3261e');
    window.dc10Current=Object.assign(c,{opening,adjustment,counted,expected,diff});
  };
  window.dc10Render=function(){
    ensure();const date=selectedDate();const c=calc(date);
    const ptable=document.getElementById('dc10PaymentTable');
    const paymentRows=Object.entries(c.payments).sort((a,b)=>b[1]-a[1]);
    if(ptable)ptable.innerHTML=paymentRows.length?`<table><tr><th>付款方式</th><th class="right">金額</th></tr>${paymentRows.map(([p,v])=>`<tr><td>${esc(p)}</td><td class="right">$${fmt(v)}</td></tr>`).join('')}<tr><th>銷售合計</th><th class="right">$${fmt(c.salesTotal)}</th></tr></table>`:'<p class="notice">這一天沒有 POS 銷售資料。</p>';
    const m=document.getElementById('dc10MovementTable');
    if(m)m.innerHTML=`<table><tr><th>項目</th><th class="right">筆數</th><th class="right">數量</th><th class="right">金額</th></tr>
      <tr><td>客戶銷貨</td><td class="right">${c.sales.length}</td><td class="right">${fmt(c.sales.reduce((a,l)=>a+n(l.qty),0))}</td><td class="right">$${fmt(c.salesTotal)}</td></tr>
      <tr><td>廠商進貨</td><td class="right">${c.purchases.length}</td><td class="right">${fmt(c.purchases.reduce((a,l)=>a+n(l.qty),0))}</td><td class="right">$${fmt(c.purchaseTotal)}</td></tr>
      <tr><td>廠商退貨</td><td class="right">${c.supplierReturns.length}</td><td class="right">${fmt(c.supplierReturns.reduce((a,l)=>a+n(l.qty),0))}</td><td class="right">$${fmt(c.supplierReturnTotal)}</td></tr>
      <tr><td>客戶退貨</td><td class="right">${c.customerReturns.length}</td><td class="right">${fmt(c.customerReturns.reduce((a,l)=>a+n(l.qty),0))}</td><td class="right">$${fmt(c.customerReturnTotal)}</td></tr>
      <tr><th>庫存淨異動</th><th></th><th class="right">${fmt(c.inQty-c.outQty)}</th><th></th></tr></table>`;
    const detail=document.getElementById('dc10DetailTable');
    if(detail)detail.innerHTML=c.rows.length?`<table><tr><th>時間</th><th>類型</th><th>單號</th><th>對象</th><th>商品</th><th class="right">數量</th><th>付款</th><th class="right">金額</th></tr>${c.rows.map(l=>`<tr><td>${esc(String(l.time||'').slice(11,19))}</td><td>${esc(l.type)}</td><td>${esc(l.orderNo||l.saleNo||'')}</td><td>${esc(l.party||l.customer||l.supplier||'')}</td><td>${esc(l.product||l.item||'')}</td><td class="right">${fmt(l.qty)}</td><td>${esc(l.payment||'')}</td><td class="right">$${fmt(logAmount(l))}</td></tr>`).join('')}</table>`:'<p class="notice">這一天沒有進銷存紀錄。</p>';
    dc10RenderSummary();dc10RenderHistory();
  };
  window.dc10Save=function(){
    ensure();dc10RenderSummary();const c=window.dc10Current;if(!c)return;
    const existing=state.dailyClosings.find(x=>x.date===c.date);
    if(existing&&!confirm(`${c.date} 已經做過日結，確定要更新嗎？`))return;
    const record={id:existing?.id||Date.now(),date:c.date,closedAt:new Date().toISOString(),openingCash:c.opening,countedCash:c.counted,adjustment:c.adjustment,expectedCash:c.expected,cashDifference:c.diff,salesTotal:c.salesTotal,purchaseTotal:c.purchaseTotal,supplierReturnTotal:c.supplierReturnTotal,customerReturnTotal:c.customerReturnTotal,payments:c.payments,salesCount:c.sales.length,purchaseCount:c.purchases.length,supplierReturnCount:c.supplierReturns.length,customerReturnCount:c.customerReturns.length,inventoryInQty:c.inQty,inventoryOutQty:c.outQty};
    if(existing)Object.assign(existing,record);else state.dailyClosings.unshift(record);
    persist('每日結帳',true);dc10RenderHistory();toast('日結紀錄已儲存');
  };
  function closeBody(r){return `<h1>雙發水電五金 每日結帳表</h1><p>結帳日期：${esc(r.date)}</p><p>儲存時間：${esc(String(r.closedAt||'').replace('T',' ').slice(0,19))}</p><table><tr><th>項目</th><th class="right">金額</th></tr><tr><td>POS 銷售總額</td><td class="right">$${fmt(r.salesTotal)}</td></tr><tr><td>進貨總額</td><td class="right">$${fmt(r.purchaseTotal)}</td></tr><tr><td>廠商退貨</td><td class="right">$${fmt(r.supplierReturnTotal)}</td></tr><tr><td>客戶退貨</td><td class="right">$${fmt(r.customerReturnTotal)}</td></tr><tr><td>開店現金</td><td class="right">$${fmt(r.openingCash)}</td></tr><tr><td>其他現金調整</td><td class="right">$${fmt(r.adjustment)}</td></tr><tr><td>預計現金</td><td class="right">$${fmt(r.expectedCash)}</td></tr><tr><td>實際現金</td><td class="right">$${fmt(r.countedCash)}</td></tr><tr><th>現金差額</th><th class="right">${r.cashDifference>=0?'+':''}$${fmt(r.cashDifference)}</th></tr></table><h2>付款方式</h2><table><tr><th>付款方式</th><th class="right">金額</th></tr>${Object.entries(r.payments||{}).map(([p,v])=>`<tr><td>${esc(p)}</td><td class="right">$${fmt(v)}</td></tr>`).join('')}</table><p style="margin-top:50px">經辦人：________________　覆核人：________________</p>`}
  window.dc10PrintCurrent=function(){dc10RenderSummary();const c=window.dc10Current;if(!c)return;const r={...c,closedAt:new Date().toISOString(),payments:c.payments,salesCount:c.sales.length,purchaseCount:c.purchases.length,supplierReturnCount:c.supplierReturns.length,customerReturnCount:c.customerReturns.length,inventoryInQty:c.inQty,inventoryOutQty:c.outQty};if(typeof recordPrintWindow==='function')recordPrintWindow('每日結帳 '+c.date,closeBody(r));else window.print()};
  window.dc10PrintSaved=function(id){ensure();const r=state.dailyClosings.find(x=>String(x.id)===String(id));if(!r)return;if(typeof recordPrintWindow==='function')recordPrintWindow('每日結帳 '+r.date,closeBody(r));else window.print()};
  window.dc10Delete=function(id){ensure();const r=state.dailyClosings.find(x=>String(x.id)===String(id));if(!r||!confirm(`刪除 ${r.date} 的日結紀錄？`))return;state.dailyClosings=state.dailyClosings.filter(x=>String(x.id)!==String(id));persist('刪除每日結帳',true);dc10RenderHistory()};
  window.dc10Load=function(id){ensure();const r=state.dailyClosings.find(x=>String(x.id)===String(id));if(!r)return;document.getElementById('dc10Date').value=r.date;document.getElementById('dc10OpeningCash').value=r.openingCash||0;document.getElementById('dc10CountedCash').value=r.countedCash||0;document.getElementById('dc10Adjustment').value=r.adjustment||0;dc10Render();window.scrollTo({top:0,behavior:'smooth'})};
  window.dc10RenderHistory=function(){ensure();const el=document.getElementById('dc10History');if(!el)return;const rows=[...state.dailyClosings].sort((a,b)=>String(b.date).localeCompare(String(a.date)));el.innerHTML=rows.length?`<table><tr><th>日期</th><th class="right">銷售</th><th class="right">進貨</th><th class="right">預計現金</th><th class="right">實際現金</th><th class="right">差額</th><th>操作</th></tr>${rows.map(r=>`<tr><td>${esc(r.date)}</td><td class="right">$${fmt(r.salesTotal)}</td><td class="right">$${fmt(r.purchaseTotal)}</td><td class="right">$${fmt(r.expectedCash)}</td><td class="right">$${fmt(r.countedCash)}</td><td class="right">${n(r.cashDifference)>=0?'+':''}$${fmt(r.cashDifference)}</td><td><button class="secondary" onclick="dc10Load('${esc(r.id)}')">查看</button> <button class="secondary" onclick="dc10PrintSaved('${esc(r.id)}')">列印</button> <button class="danger" onclick="dc10Delete('${esc(r.id)}')">刪除</button></td></tr>`).join('')}</table>`:'<p class="notice">尚未儲存任何日結紀錄。</p>'};
  const oldShow=window.showPanel;if(typeof oldShow==='function')window.showPanel=function(id){oldShow(id);if(id==='dailyClose10')dc10Render()};
  setTimeout(()=>{ensure();const d=document.getElementById('dc10Date');if(d&&!d.value)d.value=typeof today==='function'?today():new Date().toISOString().slice(0,10);dc10RenderHistory()},300);
})();
