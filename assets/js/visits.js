
function renderVisits(d){
  var list=d.visits||[]; var grid=qs('#visitsGrid'); grid.innerHTML='';
  list.forEach(function(v,vi){
    var a=document.createElement('a'); a.href='visit.html?id='+encodeURIComponent(v.id); a.className='visit-card card';
    var imgId='vimg_'+vi; a.innerHTML='<img id="'+imgId+'" alt="'+v.title+'"><div><strong>'+v.title+'</strong><div class="small">'+(v.summary||'')+'</div></div>';
    grid.appendChild(a);
    var cover = (v.images&&v.images[0]) || v.image || 'assets/images/cover.svg';
    loadImageToElement(qs('#'+imgId), cover, 'assets/images/cover.svg');
  });
}
document.addEventListener('DOMContentLoaded',function(){ renderVisits(getData()); onDataChange(renderVisits); });
