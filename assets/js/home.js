
var heroTimer=null, heroIdx=0;
function mapIcon(type){
  if(type==='google') return '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#4285F4" stroke-width="2"/><text x="12" y="16" text-anchor="middle" font-size="12" fill="#4285F4" font-weight="700">G</text></svg>';
  if(type==='naver') return '<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="4" stroke="#03C75A" stroke-width="2"/><text x="12" y="16" text-anchor="middle" font-size="12" fill="#03C75A" font-weight="700">N</text></svg>';
  return '<svg viewBox="0 0 24 24" fill="none"><rect x="2" y="6" width="20" height="14" rx="3" stroke="#fee500" stroke-width="2"/><text x="12" y="16" text-anchor="middle" font-size="12" fill="#000" font-weight="700">K</text></svg>';
}
function renderHome(d){
  var info=d.trip_info||{};
  var brand=qs('#brandTitle'); if(brand) brand.textContent=info.title||'밤실 부녀 화담숲 여행 모임';

  var photos=(d.home_photos||[]); var hero=qs('#hero'); if(heroTimer){clearInterval(heroTimer); heroTimer=null;}
  function buildHero(placeholders){
    hero.innerHTML='<div class="carousel" id="heroCarousel"><div class="carousel-track"></div><div class="dots" id="heroDots"></div></div>';
    var track=qs('#heroCarousel .carousel-track'); var dots=qs('#heroDots');
    placeholders.forEach(function(_,i){
      var item=document.createElement('div'); item.className='carousel-item';
      item.innerHTML='<img id="heroImg'+i+'" src="assets/images/cover.svg" alt="slide">'; track.appendChild(item);
      var d=document.createElement('div'); d.className='dot'+(i===0?' active':''); d.setAttribute('data-idx',i); dots.appendChild(d);
      d.addEventListener('click',function(){ go(i); });
    });
    var N=placeholders.length; heroIdx=0;
    function go(i){ heroIdx=(i+N)%N; track.style.transform='translateX(-'+(heroIdx*100)+'%)'; qsa('.dot',dots).forEach(function(x,j){ x.classList.toggle('active', j===heroIdx); }); }
    function next(){ go(heroIdx+1); }
    if(N>1) heroTimer=setInterval(next,3500);
  }
  if(photos.length>0){ buildHero(photos); photos.forEach(function(p,i){ loadImageToElement(qs('#heroImg'+i), p, 'assets/images/cover.svg'); }); }
  else{ hero.innerHTML='<div class="carousel"><div class="carousel-item"><img src="'+(info.hero_image||'assets/images/cover.svg')+'" alt="메인"></div></div>'; }

  // Announcements
  var ann=(d.announcements||[]).slice(0,5); var annBox=qs('#annList'); annBox.innerHTML='';
  ann.forEach(function(a){ var item=document.createElement('div'); item.className='card';
    item.innerHTML='<strong>'+(a.title||'')+'</strong><div class="small">'+fmtDate(a.date)+'</div><div class="small">'+(a.body||'')+'</div>'; annBox.appendChild(item); });

  // Poll (first only): user voting updates central counts
  var polls=d.polls||[]; var pWrap=qs('#pollWrap'); pWrap.innerHTML='';
  if(polls.length){ var p=polls[0]; var votes=JSON.parse(localStorage.getItem('club_poll_votes')||'{}'); var closed=p.deadline? (new Date()>new Date(p.deadline+' 23:59:59')):false; var saved=votes[p.id];
    var opts=(p.options||[]).map(function(opt,i){ var n=i+1; var input=p.multiple?'<input type="checkbox" name="p_'+p.id+'" value="'+i+'" '+(Array.isArray(saved)&&saved.indexOf(i)>-1?'checked':'')+' '+(closed?'disabled':'')+'>'
      :'<input type="radio" name="p_'+p.id+'" value="'+i+'" '+(saved===i?'checked':'')+' '+(closed?'disabled':'')+'>'; return '<label class="opt">'+input+'<span>'+n+'. '+opt.label+'</span></label>'; }).join('');
    pWrap.innerHTML='<div class="card"><h3 style="margin:4px 0;">🗳️ 1번 설문: '+p.question+'</h3><div class="small">'+(p.deadline?('마감: '+p.deadline+(closed?' (마감됨)':'')):'')+'</div><div class="poll">'+opts+'</div><div style="margin-top:8px;"><button class="btn" id="btnVote" '+(closed?'disabled':'')+'>투표하기</button></div></div>';
    var btn=qs('#btnVote'); if(btn){ btn.addEventListener('click',function(){
      var newSel;
      if(p.multiple){ newSel=qsa('input[name="p_'+p.id+'"]:checked').map(function(x){return parseInt(x.value,10)}); if(!newSel.length){ alert('옵션을 선택해 주세요.'); return; } }
      else{ var sel=qs('input[name="p_'+p.id+'"]:checked'); if(!sel){ alert('옵션을 선택해 주세요.'); return; } newSel=parseInt(sel.value,10); }
      // delta update counts in central data
      var data=getData(); var poll=(data.polls||[]).find(function(x){return x.id===p.id}); if(poll){
        var prev = votes[p.id];
        if(p.multiple){
          var prevA=Array.isArray(prev)?prev:[]; var newA=Array.isArray(newSel)?newSel:[];
          var add=newA.filter(function(x){return prevA.indexOf(x)<0}); var remove=prevA.filter(function(x){return newA.indexOf(x)<0});
          add.forEach(function(i){ if(poll.options[i]) poll.options[i].votes=(poll.options[i].votes||0)+1; });
          remove.forEach(function(i){ if(poll.options[i] && poll.options[i].votes>0) poll.options[i].votes-=1; });
        }else{
          if(typeof prev==='number' && poll.options[prev] && (poll.options[prev].votes||0)>0){ poll.options[prev].votes-=1; }
          if(poll.options[newSel]) poll.options[newSel].votes=(poll.options[newSel].votes||0)+1;
        }
        saveData(data);
      }
      votes[p.id]=newSel; localStorage.setItem('club_poll_votes', JSON.stringify(votes));
      alert('투표가 반영되었습니다.');
    }); }
  } else { pWrap.innerHTML='<div class="card small">진행 중인 설문이 없습니다.</div>'; }

  // Meeting / Map + mini icons
  var meet=d.meeting||{}; var addr=qs('#meetAddr'); if(addr) addr.textContent=meet.address||''; var mapBox=qs('#mapBox');
  var q=(meet.map_links&&meet.map_links.query)||''; var lat=meet.map_links?meet.map_links.lat:null; var lng=meet.map_links?meet.map_links.lng:null;
  var eSrc = embedSrc(meet.provider||'google', meet.map_embed_url||'', q, lat, lng);
  var links = mapLinks(q,lat,lng);
  var icons = '<div class="map-icons">\
    <a class="map-btn" target="_blank" href="'+links.google+'" aria-label="Google 지도">'+mapIcon('google')+'</a>\
    <a class="map-btn" target="_blank" href="'+links.naver+'" aria-label="네이버 지도">'+mapIcon('naver')+'</a>\
    <a class="map-btn" target="_blank" href="'+links.kakao+'" aria-label="카카오맵">'+mapIcon('kakao')+'</a>\
  </div>';
  if(mapBox){
    if(eSrc){
      mapBox.innerHTML='<div class="card"><div class="small">'+(meet.title||'집합 장소 지도')+'</div><div style="border-radius:12px;overflow:hidden;border:1px solid var(--line)"><iframe src="'+eSrc+'" width="100%" height="260" style="border:0" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>'+icons+'</div>';
    } else {
      mapBox.innerHTML='<div class="card small">지도 URL이 아직 등록되지 않았습니다. 아래 아이콘으로 길찾기를 이용해 주세요.'+icons+'</div>';
    }
  }

  // Gallery preview (optional)
  var g=(d.gallery||[]); var gSec=qs('#gallerySec'); if(gSec){ var grid='<div class="grid">';
    g.slice(0,6).forEach(function(it,idx){ var id='gprev'+idx; grid += '<img id="'+id+'" class="thumb" style="width:100%;height:100px;object-fit:cover;border-radius:10px;border:1px solid var(--line)" src="assets/images/cover.svg">'; });
    grid+='</div>'; gSec.insertAdjacentHTML('beforeend', grid);
    g.slice(0,6).forEach(function(it,idx){ loadImageToElement(qs('#gprev'+idx), it, 'assets/images/cover.svg'); });
  }
}
document.addEventListener('DOMContentLoaded',function(){ renderHome(getData()); onDataChange(renderHome); });
