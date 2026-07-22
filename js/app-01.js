
let barcodeScannerInstance=null;
let barcodeScannerTarget="productSearch";
let barcodeScannerRunning=false;

function startBarcodeScanner(targetId){
  barcodeScannerTarget=targetId||"productSearch";
  const dlg=document.getElementById("barcodeScannerDialog");
  const status=document.getElementById("scanStatus");

  if(!window.isSecureContext){
    toast("相機掃碼需要 HTTPS 安全網址");
    return;
  }
  if(typeof Html5Qrcode==="undefined"){
    toast("掃碼元件尚未載入，請確認網路連線");
    return;
  }

  dlg.showModal();
  status.textContent="正在啟動相機…";
  barcodeScannerInstance=new Html5Qrcode("qr-reader");

  const config={
    fps:10,
    qrbox:function(viewfinderWidth,viewfinderHeight){
      const width=Math.floor(Math.min(viewfinderWidth*0.88,360));
      return {width:width,height:Math.floor(width*0.48)};
    },
    aspectRatio:1.777778,
    formatsToSupport:[
      Html5QrcodeSupportedFormats.CODE_128,
      Html5QrcodeSupportedFormats.CODE_39,
      Html5QrcodeSupportedFormats.CODE_93,
      Html5QrcodeSupportedFormats.EAN_13,
      Html5QrcodeSupportedFormats.EAN_8,
      Html5QrcodeSupportedFormats.UPC_A,
      Html5QrcodeSupportedFormats.UPC_E,
      Html5QrcodeSupportedFormats.ITF
    ]
  };

  barcodeScannerInstance.start(
    {facingMode:"environment"},
    config,
    function(decodedText){
      const code=String(decodedText||"").trim();
      if(!code)return;
      const input=document.getElementById(barcodeScannerTarget);
      if(input)input.value=code;
      if(navigator.vibrate)navigator.vibrate(120);
      stopBarcodeScanner();
      setTimeout(function(){
        if(barcodeScannerTarget==="posBarcode"){
          posLookupAndAdd();
        }else if(barcodeScannerTarget==="quickSearch"){
          quickFind();
        }else{
          showPanel("products");
          smartProductSearch(code,true);
        }
        toast("已掃到條碼："+code);
      },250);
    },
    function(){}
  ).then(function(){
    barcodeScannerRunning=true;
    status.textContent="相機已開啟，請把商品條碼對準框內。";
  }).catch(function(err){
    barcodeScannerRunning=false;
    status.textContent="無法啟用相機。請確認已允許相機權限，或改用 Safari／Chrome 開啟網站。";
    console.error(err);
  });
}

async function stopBarcodeScanner(){
  const dlg=document.getElementById("barcodeScannerDialog");
  try{
    if(barcodeScannerInstance){
      if(barcodeScannerRunning)await barcodeScannerInstance.stop();
      await barcodeScannerInstance.clear();
    }
  }catch(e){
    console.warn(e);
  }
  barcodeScannerInstance=null;
  barcodeScannerRunning=false;
  if(dlg&&dlg.open)dlg.close();
}

document.addEventListener("visibilitychange",function(){
  if(document.hidden&&barcodeScannerRunning)stopBarcodeScanner();
});

