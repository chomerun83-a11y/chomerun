
function renderGallery(d){
  var grid=qs('#galleryGrid'); if(!grid) return; grid.innerHTML='';
  (d.gallery||[]).forEach(function(g,idx){ var id='gal'+idx; var cell=document.createElement('div'); cell.className='card'; cell.innerHTML='<img id="'+id+'" alt=""><div class="small">'+(g.caption||'')+'</div>'; grid.appendChild(cell); loadImageToElement(qs('#'+id), g, 'assets/images/cover.svg'); });
}
document.addEventListener('DOMContentLoaded',function(){ renderGallery(getData()); onDataChange(renderGallery); });
