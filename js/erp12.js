(function(){
  const iframe=document.querySelector('iframe[data-panel]');
  if(!iframe) return;
  const panel=iframe.dataset.panel;
  function tune(){
    try{
      const d=iframe.contentDocument,w=iframe.contentWindow;
      if(!d) return;
      const style=d.createElement('style');
      style.id='erp12-override';
      style.textContent=`
html,body{height:100%!important;overflow:hidden!important;background:#eef2f5!important}
header,.nav,.keyboard-help{display:none!important}
main{max-width:none!important;width:100%!important;height:100vh!important;margin:0!important;padding:6px!important;overflow:hidden!important}
.panel{height:calc(100vh - 12px)!important;overflow:hidden!important;margin:0!important}
.panel>.card{height:100%!important;margin:0!important;border-radius:0!important;box-shadow:none!important;border:1px solid #8a9baa!important;padding:10px!important;overflow:auto!important}
.card{border-radius:0!important;box-shadow:none!important;margin-bottom:7px!important;padding:10px!important}
button,.btn,input,select,textarea{border-radius:2px!important}
input,select,textarea{padding:7px 8px!important;font-size:15px!important}
button,.btn{padding:7px 10px!important}
table{font-size:13px!important}th,td{padding:5px 6px!important}
.scroll,.static-scroll,.pos-cart{scrollbar-width:thin}
:focus{outline:3px solid #ffbf00!important;outline-offset:1px!important}
.pos-layout{height:100%!important;grid-template-columns:300px 1fr!important;gap:8px!important}
.pos-screen{border-radius:0!important;padding:8px!important;height:100%!important;overflow:hidden!important}
.pos-qty{font-size:30px!important;padding:4px 8px!important}
.pos-code{font-size:18px!important}
.pos-keypad{gap:5px!important;margin-top:5px!important}
.pos-keypad button{font-size:18px!important;min-height:35px!important;padding:4px!important}
.pos-scan{min-height:39px!important}
.pos-message{min-height:34px!important;margin-top:5px!important;padding:6px!important}
.pos-cart{height:calc(100vh - 260px)!important;overflow:auto!important}
.pos-total{font-size:28px!important}
.pos-payments{gap:5px!important}.pos-payments button{min-height:34px!important;padding:5px!important}
.pos-mode-grid{gap:4px!important}.pos-mode-grid label{padding:5px!important;margin:0!important}
.product-results{max-height:210px!important}
`;
      const old=d.getElementById('erp12-override'); if(old) old.remove(); d.head.appendChild(style);
      const sections=[...d.querySelectorAll('section.panel')];
      sections.forEach(s=>s.classList.toggle('hidden',s.id!==panel));
      const target=d.getElementById(panel); if(target) target.classList.remove('hidden');
      setTimeout(()=>{
        const f=d.querySelector(`#${CSS.escape(panel)} input:not([type=hidden]),#${CSS.escape(panel)} select,#${CSS.escape(panel)} button`);
        if(f) f.focus();
      },150);
      d.addEventListener('keydown',e=>{
        if(e.key==='Escape' && !d.querySelector('dialog[open]')) location.href='index.html';
      });
    }catch(e){console.warn(e)}
  }
  iframe.addEventListener('load',tune);
  window.focusERP=()=>{try{iframe.contentWindow.focus();const d=iframe.contentDocument;const f=d.querySelector(`#${CSS.escape(panel)} input:not([type=hidden]),#${CSS.escape(panel)} select,#${CSS.escape(panel)} button`);if(f)f.focus()}catch(e){}};
  window.toggleFullscreen=()=>{if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.()};
})();
