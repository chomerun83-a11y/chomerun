
// Canvas-based compression + helper to attach image by id or base64
function compressImage(file, maxW, quality){
  return new Promise(function(resolve){
    try{
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload=function(){
        var w=img.naturalWidth, h=img.naturalHeight;
        if(w> (maxW||1280)){ var r=(maxW||1280)/w; w=(maxW||1280); h=Math.round(h*r); }
        var canvas=document.createElement('canvas'); canvas.width=w; canvas.height=h;
        var ctx=canvas.getContext('2d'); ctx.drawImage(img,0,0,w,h);
        canvas.toBlob(function(blob){ URL.revokeObjectURL(url); resolve(blob||file); }, 'image/jpeg', (quality||0.82));
      };
      img.onerror=function(){ URL.revokeObjectURL(url); resolve(file); };
      img.src=url;
    }catch(e){ resolve(file); }
  });
}

function loadImageToElement(imgEl, item, fallback){
  if(!imgEl) return;
  if(typeof item==='string'){
    // Could be base64 or URL
    imgEl.src=item; return;
  }
  if(item && item.src){ imgEl.src=item.src; return; }
  if(item && item.imgId){
    IDBImages.getImageURLFromDB(item.imgId).then(function(url){ if(url) imgEl.src=url; else if(fallback) imgEl.src=fallback; });
    return;
  }
  if(fallback) imgEl.src=fallback;
}
