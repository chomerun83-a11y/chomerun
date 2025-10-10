
function renderVisitDetail(d){
  var id=new URL(location.href).searchParams.get('id');
  var v=(d.visits||[]).find(function(x){ return x.id===id; }); var wrap=qs('#detailWrap');
  if(!v){ wrap.innerHTML='<div class="card">방문지 정보를 찾을 수 없습니다.</div>'; return; }
  var imgs=(v.images&&v.images.length?v.images:[(v.image||'assets/images/cover.svg')]);
  var slider = '<div class="carousel" id="vCarousel"><div class="carousel-track">'+
    imgs.map(function(_,i){return '<div class="carousel-item"><img id="vslide'+i+'" src="assets/images/cover.svg" alt=""></div>'}).join('')+
    '</div><div class="dots" id="vDots">'+imgs.map(function(_,i){return '<div class="dot'+(i==0?' active':'')+'" data-i="'+i+'"></div>'}).join('')+'</div></div>';
  wrap.innerHTML='<div class="card">'+slider+'<h2 style="margin:8px 0;">'+v.title+'</h2><div class="small">'+(v.summary||'')+'</div><div style="margin-top:8px;white-space:pre-wrap">'+(v.body||'')+'</div></div>';
  imgs.forEach(function(it,i){ loadImageToElement(qs('#vslide'+i), it, 'assets/images/cover.svg'); });
  var track=qs('#vCarousel .carousel-track'); var dots=qs('#vDots'); var idx=0,N=imgs.length,t=null;
  function go(i){ idx=(i+N)%N; track.style.transform='translateX(-'+(idx*100)+'%)'; qsa('.dot',dots).forEach(function(x,j){x.classList.toggle('active', j===idx)}); if(t)clearInterval(t); if(N>1) t=setInterval(function(){go(idx+1)}, 3500); }
  qsa('.dot',dots).forEach(function(d){ d.addEventListener('click',function(){ go(parseInt(d.getAttribute('data-i'),10)) }); }); go(0);
  var links = mapLinks((v.map&&v.map.query)||'', null, null);
  var dirBtns = qs('#dirBtns'); if(dirBtns){
    dirBtns.innerHTML = '<div class="map-icons">\
      <a class="map-btn" target="_blank" href="'+links.google+'" aria-label="Google 지도"><svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#4285F4" stroke-width="2"/><text x="12" y="16" text-anchor="middle" font-size="12" fill="#4285F4" font-weight="700">G</text></svg></a>\
      <a class="map-btn" target="_blank" href="'+links.naver+'" aria-label="네이버 지도"><svg viewBox="0 0 24 24  fill="none"><rect x="2" y="2" width="20" height="20" rx="4" stroke="#03C75A" stroke-width="2"/><text x="12" y="16" text-anchor="middle" font-size="12" fill="#03C75A" font-weight="700">N</text></svg></a>\
      <a class="map-btn" target="_blank" href="'+links.kakao+'" aria-label="카카오맵"><svg viewBox="0 0 24 24" fill="none"><rect x="2" y="6" width="20" height="14" rx="3" stroke="#fee500" stroke-width="2"/><text x="12" y="16" text-anchor="middle" font-size="12" fill="#000" font-weight="700">K</text></svg></a>\
    </div>';
  }
}
document.addEventListener('DOMContentLoaded',function(){ renderVisitDetail(getData()); onDataChange(renderVisitDetail); });
