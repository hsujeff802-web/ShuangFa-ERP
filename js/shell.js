(function(){
  'use strict';
  const links=[...document.querySelectorAll('.nav-link')];
  const page=document.body.dataset.page;
  const keyLabels=['01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24'];
  links.forEach((a,i)=>a.dataset.key=keyLabels[i]||String(i+1).padStart(2,'0'));
  let navIndex=Math.max(0,links.findIndex(a=>a.dataset.page===page));
  function selectNav(i,focus=true){
    if(!links.length)return;
    navIndex=(i+links.length)%links.length;
    links.forEach((a,n)=>{a.tabIndex=n===navIndex?0:-1;a.classList.toggle('kbd-selected',n===navIndex)});
    if(focus)links[navIndex].focus({preventScroll:true});
  }
  links.forEach((a,i)=>{a.tabIndex=i===navIndex?0:-1;if(i===navIndex)a.classList.add('active')});
  window.toggleFullscreen=function(){if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.()};
  window.focusERP=function(){const f=document.querySelector('iframe');f?.focus();try{f?.contentWindow?.postMessage({type:'ERP_FOCUS_FIRST'},'*')}catch(_){}};
  window.addEventListener('keydown',e=>{
    const inSidebar=document.activeElement?.classList?.contains('nav-link');
    if(e.key==='F1'){e.preventDefault();selectNav(navIndex,true);return;}
    if(e.key==='F10'){e.preventDefault();location.href='index.html';return;}
    if(e.key==='F11'){e.preventDefault();toggleFullscreen();return;}
    if(/^\d$/.test(e.key) && inSidebar){
      const n=parseInt(e.key,10); if(n>0 && n<=links.length){e.preventDefault();selectNav(n-1,true);} return;
    }
    if(inSidebar && ['ArrowDown','ArrowUp','ArrowLeft','ArrowRight'].includes(e.key)){
      e.preventDefault();
      const delta=e.key==='ArrowDown'?2:e.key==='ArrowUp'?-2:e.key==='ArrowRight'?1:-1;
      selectNav(navIndex+delta,true);return;
    }
    if(inSidebar && e.key==='Enter'){e.preventDefault();document.activeElement.click();return;}
    if(e.altKey && e.key==='ArrowLeft'){e.preventDefault();history.back();}
  },true);
  window.addEventListener('load',()=>setTimeout(window.focusERP,80));
})();
