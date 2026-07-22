
(function(){
 const $=id=>document.getElementById(id);
 window.erp10UpdateCounts=function(){
   const p=$('erp10ProductCount'),c=$('erp10CustomerCount'),v=$('erp10SupplierCount');
   if(p)p.textContent=`商品 ${(state.products||[]).length.toLocaleString()} 筆`;
   if(c)c.textContent=`客戶 ${(state.customers||[]).length.toLocaleString()} 筆`;
   if(v)v.textContent=`廠商 ${(state.suppliers||[]).length.toLocaleString()} 筆`;
 };
 window.erp10RepairAndRefresh=function(){
   if(!Array.isArray(state.products)||!state.products.length)state.products=Array.isArray(SOURCE_PRODUCTS)?SOURCE_PRODUCTS:[];
   if(!Array.isArray(state.customers)||!state.customers.length)state.customers=[{id:1,code:'0001',name:'一般客戶',phone:'',address:'',note:'門市散客',priceType:'suggested',discountFormula:'1',invoiceMode:'一般'}];
   if(!Array.isArray(state.suppliers))state.suppliers=[];
   ['櫻花','林內','莊頭北','喜特麗JTL','豪山'].forEach((name,i)=>{if(!state.suppliers.some(x=>String(x.name||'').includes(name.replace('JTL',''))))state.suppliers.push({id:Date.now()+i,code:String(state.suppliers.length+1).padStart(4,'0'),name,contact:'',phone:'',address:'',note:''})});
   persist('ERP10.0修復資料',true);erp10UpdateCounts();
   try{erp90RenderProducts();erp90RenderCustomers();erp90RenderSuppliers();renderSelects()}catch(e){console.error(e)}
   toast('商品、客戶、廠商資料已重新載入');
 };
 // Override search functions to avoid relying on browser-created global variables for element IDs.
 window.erp90RenderProducts=function(){
   const qEl=$('p90q'),bEl=$('p90brand'),cEl=$('p90cat'),list=$('p90list'),count=$('p90count');if(!list)return;
   const brands=[...new Set((state.products||[]).map(x=>x.brand).filter(Boolean))].sort();
   const cats=[...new Set((state.products||[]).map(x=>x.category).filter(Boolean))].sort();
   if(bEl&&bEl.options.length<=1)bEl.innerHTML='<option value="">全部品牌</option>'+brands.map(x=>`<option>${e90(x)}</option>`).join('');
   if(cEl&&cEl.options.length<=1)cEl.innerHTML='<option value="">全部分類</option>'+cats.map(x=>`<option>${e90(x)}</option>`).join('');
   const q=norm(qEl?.value||'').toLowerCase(),b=bEl?.value||'',c=cEl?.value||'';
   const rows=(state.products||[]).map((p,i)=>({p,i})).filter(({p})=>(!q||norm([p.id,p.description,p.storeCode,p.barcode,p.brand,p.category,p.channel].join(' ')).toLowerCase().includes(q))&&(!b||p.brand===b)&&(!c||p.category===c));
   if(count)count.textContent=`共找到 ${rows.length} 筆商品資料（畫面最多顯示前500筆）`;
   list.innerHTML=rows.length?`<table class="erp90-table"><thead><tr><th>型號</th><th>品名</th><th>品牌</th><th>庫存</th><th>售價</th></tr></thead><tbody>${rows.slice(0,500).map(({p,i})=>`<tr class="${i===erp90SelectedProduct?'selected':''}" onclick="erp90EditProduct(${i})"><td><b>${e90(p.id)}</b><div class="muted">${e90(p.storeCode||p.barcode||'')}</div></td><td>${e90(p.description||'')}</td><td>${e90(p.brand||'')}</td><td>${e90(p.stock||0)}</td><td>$${money(Number(p.suggested||calc(p).end||0))}</td></tr>`).join('')}</tbody></table>`:'<div class="erp90-empty">查無商品資料</div>';
 };
 window.erp90RenderCustomers=function(){
   const q=norm($('c90q')?.value||'').toLowerCase(),list=$('c90list'),count=$('c90count');if(!list)return;
   const rows=(state.customers||[]).filter(c=>!q||norm([c.code,c.name,c.phone,c.address,c.note].join(' ')).toLowerCase().includes(q));
   if(count)count.textContent=`共找到 ${rows.length} 筆客戶資料`;
   list.innerHTML=rows.length?`<table class="erp90-table"><thead><tr><th>編號</th><th>客戶名稱</th><th>電話</th><th>地址</th></tr></thead><tbody>${rows.map(c=>`<tr class="${String(c.id)===String(erp90SelectedCustomer)?'selected':''}" onclick="erp90EditCustomer('${e90(c.id)}')"><td>${e90(c.code)}</td><td><b>${e90(c.name)}</b></td><td>${e90(c.phone)}</td><td>${e90(c.address)}</td></tr>`).join('')}</tbody></table>`:'<div class="erp90-empty">查無客戶資料</div>';
 };
 window.erp90RenderSuppliers=function(){
   const q=norm($('s90q')?.value||'').toLowerCase(),list=$('s90list'),count=$('s90count');if(!list)return;
   const rows=(state.suppliers||[]).filter(v=>!q||norm([v.code,v.name,v.contact,v.phone,v.address,v.note].join(' ')).toLowerCase().includes(q));
   if(count)count.textContent=`共找到 ${rows.length} 筆廠商資料`;
   list.innerHTML=rows.length?`<table class="erp90-table"><thead><tr><th>編號</th><th>廠商名稱</th><th>聯絡人</th><th>電話</th></tr></thead><tbody>${rows.map(v=>`<tr class="${String(v.id)===String(erp90SelectedSupplier)?'selected':''}" onclick="erp90EditSupplier('${e90(v.id)}')"><td>${e90(v.code)}</td><td><b>${e90(v.name)}</b></td><td>${e90(v.contact)}</td><td>${e90(v.phone)}</td></tr>`).join('')}</tbody></table>`:'<div class="erp90-empty">查無廠商資料</div>';
 };
 const oldPersist=window.persist; if(typeof oldPersist==='function')window.persist=function(){const r=oldPersist.apply(this,arguments);setTimeout(erp10UpdateCounts,0);return r};
 setTimeout(()=>{erp10UpdateCounts();try{erp90RenderProducts();erp90RenderCustomers();erp90RenderSuppliers()}catch(e){console.error(e)}},200);
})();
