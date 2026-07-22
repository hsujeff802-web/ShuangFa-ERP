(function(){
 const page=document.body.dataset.page;
 document.querySelectorAll('.nav-link').forEach(a=>{if(a.dataset.page===page)a.classList.add('active')});
 window.addEventListener('keydown',e=>{
   if(e.altKey && e.key==='ArrowLeft'){history.back();}
   if(e.key==='F11'){e.preventDefault();toggleFullscreen();}
 });
 window.toggleFullscreen=function(){
   if(!document.fullscreenElement) document.documentElement.requestFullscreen?.();
   else document.exitFullscreen?.();
 };
 window.focusERP=function(){document.querySelector('iframe')?.focus();};
})();
