(function(){
 const links=[...document.querySelectorAll('.nav-link')];
 const page=document.body.dataset.page;
 let navIndex=Math.max(0,links.findIndex(a=>a.dataset.page===page));
 links.forEach((a,i)=>{a.tabIndex=(i===navIndex?0:-1);if(i===navIndex)a.classList.add('active')});
 function selectNav(i,focus=true){navIndex=(i+links.length)%links.length;links.forEach((a,n)=>{a.tabIndex=n===navIndex?0:-1;a.classList.toggle('kbd-selected',n===navIndex)});if(focus)links[navIndex]?.focus();}
 window.addEventListener('keydown',e=>{
   const inSidebar=document.activeElement?.classList?.contains('nav-link');
   if(e.key==='F1'){e.preventDefault();selectNav(navIndex,true);return;}
   if(e.key==='F10'){e.preventDefault();location.href='index.html';return;}
   if(e.key==='F11'){e.preventDefault();toggleFullscreen();return;}
   if(inSidebar && (e.key==='ArrowDown'||e.key==='ArrowUp')){e.preventDefault();selectNav(navIndex+(e.key==='ArrowDown'?1:-1),true);return;}
   if(inSidebar && e.key==='Enter'){e.preventDefault();document.activeElement.click();return;}
   if(e.altKey && e.key==='ArrowLeft'){history.back();}
 });
 window.toggleFullscreen=function(){if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.()};
 window.focusERP=function(){document.querySelector('iframe')?.focus()};
 window.addEventListener('load',()=>{document.querySelector('iframe')?.focus()});
})();
