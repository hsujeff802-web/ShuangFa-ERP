
(function(){
  const $=id=>document.getElementById(id);
  const cleanCodes=value=>{
    const raw=Array.isArray(value)?value.join(','):String(value||'');
    return [...new Set(raw.split(/[，,;；\s]+/).map(x=>x.trim()).filter(Boolean))];
  };
  const productSupplierCodes=p=>cleanCodes(p?.supplierCodes||p?.supplierCode||p?.vendorCode||p?.primarySupplierCode||'');

  // Always rebuild the product array from the embedded source when old saved data only contains overrides.
  function restoreProducts(){
    if(Array.isArray(state.products)&&state.products.length)return;
    const base=(Array.isArray(SOURCE_PRODUCTS)?SOURCE_PRODUCTS:[]).map(p=>({...p}));
    const overrides=state.productOverrides||{};
    base.forEach(p=>{
      const over=overrides[(p.channel||'')+'|'+(p.id||'')];
      if(over)Object.assign(p,over);
    });
    const custom=Array.isArray(state.customProducts)?state.customProducts:[];
    state.products=base.concat(custom);
  }

  function ensureMasterData(){
    restoreProducts();
    if(!Array.isArray(state.customers))state.customers=[];
    if(!state.customers.length){
      state.customers=[
        {id:1,code:'0001',name:'一般客戶',phone:'',address:'',note:'門市散客',priceType:'suggested',discountFormula:'1',invoiceMode:'一般'},
        {id:2,code:'0002',name:'水電師傅（操作範例）',phone:'',address:'',note:'可直接修改',priceType:'wholesale',discountFormula:'1',invoiceMode:'三X聯'},
        {id:3,code:'0003',name:'工程行（操作範例）',phone:'',address:'',note:'可直接修改',priceType:'direct',discountFormula:'1',invoiceMode:'三X聯'}
      ];
    }
    if(!Array.isArray(state.suppliers))state.suppliers=[];
    const defaults=[
      ['0001','櫻花'],['0002','林內'],['0003','莊頭北'],['0004','喜特麗JTL'],['0005','豪山']
    ];
    defaults.forEach(([code,name],i)=>{
      if(!state.suppliers.some(v=>String(v.code||'')===code||String(v.name||'').replace(/\s/g,'').includes(name.replace('JTL','')))){
        state.suppliers.push({id:Date.now()+i,code,name,contact:'',phone:'',address:'',note:'可直接修改'});
      }
    });
    // Normalize every product to the new multi-supplier structure.
    (state.products||[]).forEach(p=>{
      const codes=productSupplierCodes(p);
      p.supplierCodes=codes;
      if(!p.primarySupplierCode&&codes.length)p.primarySupplierCode=codes[0];
    });
    try{storageSet(KEY,JSON.stringify(stateWithoutPhotos()))}catch(e){console.error(e)}
  }

  ensureMasterData();

  window.erp90RenderProducts=function(){
    const qEl=$('p90q'),bEl=$('p90brand'),cEl=$('p90cat'),list=$('p90list'),count=$('p90count');if(!list)return;
    const brands=[...new Set((state.products||[]).map(x=>x.brand).filter(Boolean))].sort();
    const cats=[...new Set((state.products||[]).map(x=>x.category).filter(Boolean))].sort();
    const oldB=bEl?.value||'',oldC=cEl?.value||'';
    if(bEl)bEl.innerHTML='<option value="">全部品牌</option>'+brands.map(x=>`<option ${x===oldB?'selected':''}>${e90(x)}</option>`).join('');
    if(cEl)cEl.innerHTML='<option value="">全部分類</option>'+cats.map(x=>`<option ${x===oldC?'selected':''}>${e90(x)}</option>`).join('');
    const q=norm(qEl?.value||'').toLowerCase(),b=bEl?.value||'',c=cEl?.value||'';
    const rows=(state.products||[]).map((p,i)=>({p,i})).filter(({p})=>{
      const codes=productSupplierCodes(p).join(' ');
      return (!q||norm([p.id,p.description,p.storeCode,p.barcode,p.brand,p.category,p.channel,codes].join(' ')).toLowerCase().includes(q))&&(!b||p.brand===b)&&(!c||p.category===c);
    });
    if(count)count.textContent=`共找到 ${rows.length} 筆商品資料（畫面最多顯示前500筆）`;
    list.innerHTML=rows.length?`<table class="erp90-table"><thead><tr><th>型號</th><th>品名</th><th>廠商編號</th><th>品牌</th><th>庫存</th><th>售價</th></tr></thead><tbody>${rows.slice(0,500).map(({p,i})=>`<tr class="${i===erp90SelectedProduct?'selected':''}" onclick="erp90EditProduct(${i})"><td><b>${e90(p.id)}</b><div class="muted">${e90(p.storeCode||p.barcode||'')}</div></td><td>${e90(p.description||'')}</td><td><b>${e90(productSupplierCodes(p).join('、')||'未設定')}</b></td><td>${e90(p.brand||'')}</td><td>${e90(p.stock||0)}</td><td>$${money(Number(p.suggested||calc(p).end||0))}</td></tr>`).join('')}</tbody></table>`:'<div class="erp90-empty">查無商品資料</div>';
  };

  const oldEdit=window.erp90EditProduct;
  window.erp90EditProduct=function(i){
    oldEdit(i);
    const p=state.products?.[i];if(!p)return;
    if($('p90supplierCodes'))$('p90supplierCodes').value=productSupplierCodes(p).join(', ');
    if($('p90primarySupplier'))$('p90primarySupplier').value=p.primarySupplierCode||productSupplierCodes(p)[0]||'';
  };
  const oldNew=window.erp90NewProduct;
  window.erp90NewProduct=function(){oldNew();if($('p90supplierCodes'))$('p90supplierCodes').value='';if($('p90primarySupplier'))$('p90primarySupplier').value=''};

  window.erp90SaveProduct=function(){
    const id=$('p90id')?.value.trim();if(!id)return toast('請輸入商品型號／品號');
    let p=erp90SelectedProduct>=0?state.products[erp90SelectedProduct]:null;
    if(!p){p={customProduct:true};state.products.unshift(p);erp90SelectedProduct=0}
    const codes=cleanCodes($('p90supplierCodes')?.value||'');
    let primary=$('p90primarySupplier')?.value.trim()||codes[0]||'';
    if(primary&&!codes.includes(primary))codes.unshift(primary);
    Object.assign(p,{id,storeCode:$('p90store')?.value.trim(),description:$('p90desc')?.value.trim(),brand:$('p90brandEdit')?.value.trim(),category:$('p90catEdit')?.value.trim(),channel:$('p90channel')?.value.trim()||'自建商品',barcode:$('p90barcode')?.value.trim(),stock:Number($('p90stock')?.value||0),suggested:Number($('p90suggested')?.value||0),dealer:Number($('p90dealer')?.value||0),directPrice:Number($('p90direct')?.value||0),supplierCodes:codes,primarySupplierCode:primary,supplierCode:primary});
    persist('ERP10.0.2修改商品與廠商編號',true);renderSelects();erp90InitFilters();erp90RenderProducts();toast('商品與廠商編號已儲存');
  };

  window.erp10RepairAndRefresh=function(){
    ensureMasterData();
    try{renderSelects();renderCustomers();renderSuppliers();erp90RenderProducts();erp90RenderCustomers();erp90RenderSuppliers();erp10UpdateCounts()}catch(e){console.error(e)}
    toast('商品、客戶、廠商資料已完整載入');
  };

  // Render all three master-data lists immediately, not only after the user types in search.
  setTimeout(()=>{
    try{
      renderSelects();renderCustomers();renderSuppliers();
      erp90RenderProducts();erp90RenderCustomers();erp90RenderSuppliers();
      if(typeof erp10UpdateCounts==='function')erp10UpdateCounts();
    }catch(e){console.error('ERP10.0.2主檔顯示失敗',e)}
  },50);
})();
