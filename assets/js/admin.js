
var _D=null;
function toast(msg){ var t=document.createElement('div'); t.textContent=msg; t.style.cssText='position:fixed;left:50%;transform:translateX(-50%);bottom:18px;background:#0e5b52;color:#fff;padding:8px 12px;border-radius:10px;box-shadow:0 8px 16px rgba(0,0,0,.15);z-index:9999;font-size:13px'; document.body.appendChild(t); setTimeout(function(){t.remove()},1600); }
function saveAndNotify(){ saveData(_D); toast('저장되었습니다. 사용자 페이지에 반영됨'); }
function navTo(id){ qsa('.side-item').forEach(function(a){ a.classList.toggle('active', a.getAttribute('data-to')===id); }); qsa('.panel[data-id]').forEach(function(p){ p.style.display = (p.getAttribute('data-id')===id?'block':'none'); }); }

function bindInfo(){ var t=_D.trip_info=_D.trip_info||{}; qs('#ti_title').value=t.title||''; qs('#ti_sub').value=t.subtitle||''; qs('#ti_date').value=t.date_label||''; qs('#ti_start').value=t.start_date||''; qs('#ti_hero').value=t.hero_image||''; }
function saveInfo(){ var t=_D.trip_info=_D.trip_info||{}; t.title=qs('#ti_title').value.trim(); t.subtitle=qs('#ti_sub').value.trim(); t.date_label=qs('#ti_date').value.trim(); t.start_date=qs('#ti_start').value.trim(); t.hero_image=qs('#ti_hero').value.trim(); saveAndNotify(); }

// Home photos (IDB)
function bindHomePhotos(){
  var arr=_D.home_photos=_D.home_photos||[]; var box=qs('#hp_box'); box.innerHTML='';
  arr.forEach(function(g,i){
    var row=document.createElement('div'); row.className='action-row';
    var imgId='hp_thumb_'+i; row.innerHTML='<img id="'+imgId+'" class="thumb"><input class="input" data-i="'+i+'" data-k="caption" value="'+(g.caption||'')+'" placeholder="캡션(선택)"><button class="btn danger" data-del="'+i+'">X</button>';
    box.appendChild(row); loadImageToElement(qs('#'+imgId), g, 'assets/images/cover.svg');
  });
  box.onclick=function(e){ var del=e.target.closest?e.target.closest('button[data-del]'):null; if(del){ var i=parseInt(del.getAttribute('data-del'),10); var it=_D.home_photos[i]; if(it&&it.imgId){ IDBImages.deleteImageFromDB(it.imgId); } _D.home_photos.splice(i,1); bindHomePhotos(); saveAndNotify(); } };
  box.oninput=function(e){ var i=e.target.getAttribute('data-i'), k=e.target.getAttribute('data-k'); if(i==null||!k)return; _D.home_photos[parseInt(i,10)][k]=e.target.value; };
}
function addHomePhotoFiles(files){
  var arr=_D.home_photos=_D.home_photos||[];
  Array.prototype.forEach.call(files, function(file){
    compressImage(file,1280,0.82).then(function(blob){ return IDBImages.saveImageToDB(blob, blob.type||file.type); })
    .then(function(id){ arr.push({imgId:id, caption:''}); bindHomePhotos(); saveAndNotify(); })
    .catch(function(){ alert('이미지 저장 중 오류가 발생했습니다.'); });
  });
}

// Announcements
function bindAnnouncements(){
  var arr=_D.announcements=_D.announcements||[]; var tbody=qs('#ann_tbody'); tbody.innerHTML='';
  arr.forEach(function(a,i){ var tr=document.createElement('tr');
    tr.innerHTML='<td><input class="input" data-i="'+i+'" data-k="title" value="'+(a.title||'')+'"></td>\
      <td style="width:140px"><input class="input" data-i="'+i+'" data-k="date" value="'+(a.date||'')+'" placeholder="YYYY-MM-DD"></td>\
      <td><input class="input" data-i="'+i+'" data-k="body" value="'+(a.body||'')+'"></td>\
      <td style="width:60px"><button class="btn danger" data-del="'+i+'">X</button></td>';
    tbody.appendChild(tr);
  });
  tbody.onclick=function(e){ var del=e.target.closest?e.target.closest('button[data-del]'):null; if(del){ _D.announcements.splice(parseInt(del.getAttribute('data-del'),10),1); bindAnnouncements(); saveAndNotify(); } }
  tbody.oninput=function(e){ var i=e.target.getAttribute('data-i'), k=e.target.getAttribute('data-k'); if(i==null||!k)return; _D.announcements[parseInt(i,10)][k]=e.target.value; };
}
function addAnnouncement(){ _D.announcements.unshift({title:'',date:new Date().toISOString().slice(0,10),body:''}); bindAnnouncements(); saveAndNotify(); }

// Polls + Results (admin-only)
function resultsTable(p){
  var total=(p.options||[]).reduce(function(s,o){ return s+(o.votes||0); },0)||0;
  var rows=(p.options||[]).map(function(o,i){ var c=(o.votes||0); var pct=total?Math.round(c*100/total):0; return '<tr><td>'+(i+1)+'. '+o.label+'</td><td style="width:80px;text-align:right">'+c+'표</td><td style="width:120px"><div style="background:#ecfbf8;height:8px;border-radius:6px;overflow:hidden"><div style="height:8px;background:#63d3c6;width:'+pct+'%"></div></div></td><td style="width:40px;text-align:right">'+pct+'%</td></tr>'; }).join('');
  return '<table class="table"><thead><tr><th>보기</th><th>득표</th><th colspan="2">비율</th></tr></thead><tbody>'+rows+'</tbody><tfoot><tr><td><strong>총합</strong></td><td style="text-align:right"><strong>'+total+'표</strong></td><td colspan="2"></td></tr></tfoot></table>';
}
function bindPolls(){
  var arr=_D.polls=_D.polls||[]; var box=qs('#pollBox'); box.innerHTML='';
  arr.forEach(function(p,pi){
    var el=document.createElement('div'); el.className='panel'; el.style.margin='8px 0';
    el.innerHTML='<h3>'+(pi+1)+'번 설문</h3>\
      <div class="input-row"><label>질문</label><input class="input" data-pi="'+pi+'" data-k="question" value="'+(p.question||'')+'"></div>\
      <div class="input-row"><label>마감일</label><input class="input" data-pi="'+pi+'" data-k="deadline" placeholder="YYYY-MM-DD" value="'+(p.deadline||'')+'"></div>\
      <div class="input-row"><label>복수선택</label><select class="input" data-pi="'+pi+'" data-k="multiple">\
        <option value="false"'+(!p.multiple?' selected':'')+'>아니오</option><option value="true"'+(p.multiple?' selected':'')+'>예</option></select></div>\
      <div class="input-row"><label>옵션(쉼표 구분, 번호는 자동)</label><input class="input" data-pi="'+pi+'" data-k="options" value="'+((p.options||[]).map(function(o,i){return (i+1)+'. '+o.label}).join(', '))+'"></div>\
      <div class="action-row"><button class="btn secondary" data-view="'+pi+'">결과 보기</button> <button class="btn danger" data-del="'+pi+'">삭제</button></div>\
      <div class="results" id="res_'+pi+'" style="display:none;margin-top:6px">'+resultsTable(p)+'</div>';
    box.appendChild(el);
  });
  box.onclick=function(e){
    var del=e.target.closest?e.target.closest('button[data-del]'):null; if(del){ _D.polls.splice(parseInt(del.getAttribute('data-del'),10),1); bindPolls(); saveAndNotify(); return; }
    var view=e.target.closest?e.target.closest('button[data-view]'):null; if(view){ var i=view.getAttribute('data-view'); var r=qs('#res_'+i); if(r){ r.style.display = (r.style.display==='none'?'block':'none'); r.innerHTML=resultsTable(_D.polls[i]); } }
  };
  box.oninput=function(e){ var pi=e.target.getAttribute('data-pi'), k=e.target.getAttribute('data-k'); if(pi==null||!k)return;
    if(k==='options'){ _D.polls[parseInt(pi,10)].options=e.target.value.split(',').map(function(s){return {label:s.replace(/^\s*\d+\.?\s*/,'').trim(),votes:0}}); }
    else if(k==='multiple'){ _D.polls[parseInt(pi,10)].multiple=(e.target.value==='true'); }
    else{ _D.polls[parseInt(pi,10)][k]=e.target.value; } };
}
function addPoll(){ _D.polls.unshift({id:'poll_'+Date.now(),question:'새 설문',multiple:false,deadline:'',options:[{label:'예',votes:0},{label:'아니오',votes:0}]}); bindPolls(); saveAndNotify(); }

// Meeting
function bindMeeting(){ var m=_D.meeting=_D.meeting||{};
  qs('#mt_title').value=m.title||''; qs('#mt_addr').value=m.address||''; qs('#mt_provider').value=m.provider||'google'; qs('#mt_embed').value=m.map_embed_url||'';
  qs('#mt_query').value=(m.map_links&&m.map_links.query)||''; qs('#mt_lat').value=(m.map_links&&m.map_links.lat!=null)?m.map_links.lat:''; qs('#mt_lng').value=(m.map_links&&m.map_links.lng!=null)?m.map_links.lng:'';
}
function saveMeeting(){ var m=_D.meeting=_D.meeting||{}; m.title=qs('#mt_title').value.trim(); m.address=qs('#mt_addr').value.trim(); m.provider=qs('#mt_provider').value;
  m.map_embed_url=qs('#mt_embed').value.trim(); m.map_links=m.map_links||{}; m.map_links.query=qs('#mt_query').value.trim();
  var la=qs('#mt_lat').value.trim(), lg=qs('#mt_lng').value.trim(); m.map_links.lat=la?parseFloat(la):null; m.map_links.lng=lg?parseFloat(lg):null; saveAndNotify(); }

// Visits (IDB)
function bindVisits(){ var arr=_D.visits=_D.visits||[]; var box=qs('#visitsBox'); box.innerHTML='';
  arr.forEach(function(v,vi){
    var el=document.createElement('div'); el.className='panel'; el.style.margin='8px 0';
    var imgs=(v.images||[]);
    el.innerHTML='<h3>방문지 #'+(vi+1)+'</h3>\
      <div class="input-row"><label>ID</label><input class="input" data-vi="'+vi+'" data-k="id" value="'+(v.id||'')+'"></div>\
      <div class="input-row"><label>제목</label><input class="input" data-vi="'+vi+'" data-k="title" value="'+(v.title||'')+'"></div>\
      <div class="input-row"><label>요약</label><input class="input" data-vi="'+vi+'" data-k="summary" value="'+(v.summary||'')+'"></div>\
      <div class="input-row"><label>본문</label><textarea class="input" data-vi="'+vi+'" data-k="body">'+(v.body||'')+'</textarea></div>\
      <div class="input-row"><label>지도 쿼리</label><input class="input" data-vi="'+vi+'" data-k="map.query" value="'+((v.map&&v.map.query)||'')+'"></div>\
      <div class="input-row"><label>이미지 업로드</label><input type="file" accept="image/*" multiple data-vi="'+vi+'" class="input file-vis"></div>\
      <div class="input-row"><div class="list">'+imgs.map(function(s,si){ var imgId="vthumb_"+vi+"_"+si; return '<div class="action-row"><img id="'+imgId+'" class="thumb"><button class="btn danger" data-vi="'+vi+'" data-si="'+si+'">X</button></div>' }).join('')+'</div></div>\
      <div class="action-row"><button class="btn danger" data-del="'+vi+'">방문지 삭제</button></div>';
    box.appendChild(el);
    imgs.forEach(function(it,si){ var imgEl = qs('#vthumb_'+vi+'_'+si); loadImageToElement(imgEl, it, 'assets/images/cover.svg'); });
  });
  box.oninput=function(e){ var vi=e.target.getAttribute('data-vi'), k=e.target.getAttribute('data-k'); if(vi==null||!k)return; var v=_D.visits[parseInt(vi,10)];
    if(k==='map.query'){ v.map=v.map||{}; v.map.query=e.target.value; } else { v[k]=e.target.value; } };
  box.onclick=function(e){
    var del=e.target.closest?e.target.closest('button[data-del]'):null; if(del){ _D.visits.splice(parseInt(del.getAttribute('data-del'),10),1); bindVisits(); saveAndNotify(); return; }
    var rm=e.target.closest?e.target.closest('button[data-si]'):null; if(rm){ var vi=parseInt(rm.getAttribute('data-vi'),10), si=parseInt(rm.getAttribute('data-si'),10); var rec=_D.visits[vi].images[si]; if(rec&&rec.imgId){ IDBImages.deleteImageFromDB(rec.imgId); } _D.visits[vi].images.splice(si,1); bindVisits(); saveAndNotify(); }
  };
  box.addEventListener('change',function(e){ if(!e.target.matches('.file-vis')) return; var vi=parseInt(e.target.getAttribute('data-vi'),10); var arr=_D.visits[vi].images=_D.visits[vi].images||[];
    Array.prototype.forEach.call(e.target.files, function(file){ compressImage(file,1280,0.82).then(function(blob){ return IDBImages.saveImageToDB(blob, blob.type||file.type); }).then(function(id){ arr.push({imgId:id}); bindVisits(); saveAndNotify(); }).catch(function(){ alert('이미지 저장 중 오류'); }); });
    e.target.value='';
  });
}
function addVisit(){ _D.visits.unshift({id:'visit_'+Date.now(),title:'새 방문지',summary:'',body:'',map:{query:''},images:[]}); bindVisits(); saveAndNotify(); }

// Gallery (IDB)
function bindGallery(){ var arr=_D.gallery=_D.gallery||[]; var box=qs('#gal_box'); box.innerHTML='';
  arr.forEach(function(g,i){ var row=document.createElement('div'); row.className='action-row'; var id='gal_th_'+i; row.innerHTML='<img id="'+id+'" class="thumb"><input class="input" data-i="'+i+'" data-k="caption" value="'+(g.caption||'')+'" placeholder="캡션(선택)"><button class="btn danger" data-del="'+i+'">X</button>'; box.appendChild(row); loadImageToElement(qs('#'+id), g, 'assets/images/cover.svg'); });
  box.onclick=function(e){ var del=e.target.closest?e.target.closest('button[data-del]'):null; if(del){ var i=parseInt(del.getAttribute('data-del'),10); var it=_D.gallery[i]; if(it&&it.imgId){ IDBImages.deleteImageFromDB(it.imgId); } _D.gallery.splice(i,1); bindGallery(); saveAndNotify(); } }
  box.oninput=function(e){ var i=e.target.getAttribute('data-i'), k=e.target.getAttribute('data-k'); if(i==null||!k)return; _D.gallery[parseInt(i,10)][k]=e.target.value; };
}
function addGalleryFiles(files){ var arr=_D.gallery=_D.gallery||[]; Array.prototype.forEach.call(files, function(file){ compressImage(file,1280,0.82).then(function(blob){ return IDBImages.saveImageToDB(blob, blob.type||file.type); }).then(function(id){ arr.push({imgId:id,caption:''}); bindGallery(); saveAndNotify(); }).catch(function(){ alert('이미지 저장 중 오류'); }); }); }

// Board
function bindBoard(){ var arr=_D.board=_D.board||[]; var cats=_D.board_categories=_D.board_categories||['공지','질문','잡담']; var tbody=qs('#bd_tbody'); var csel=qs('#bd_cats'); tbody.innerHTML=''; csel.innerHTML='';
  cats.forEach(function(c){ var op=document.createElement('option'); op.value=c; op.textContent=c; csel.appendChild(op); });
  arr.forEach(function(p,i){ var tr=document.createElement('tr');
    tr.innerHTML='<td style="width:80px"><input class="input" data-i="'+i+'" data-k="name" value="'+(p.name||'')+'"></td>\
      <td style="width:110px"><select class="input" data-i="'+i+'" data-k="category">'+cats.map(function(c){return '<option '+(p.category===c?'selected':'')+'>'+c+'</option>'}).join('')+'</select></td>\
      <td><input class="input" data-i="'+i+'" data-k="message" value="'+(p.message||'')+'"></td>\
      <td style="width:160px"><input class="input" data-i="'+i+'" data-k="date" value="'+(p.date||'')+'"></td>\
      <td style="width:60px"><button class="btn danger" data-del="'+i+'">X</button></td>'; tbody.appendChild(tr);
  });
  tbody.onclick=function(e){ var del=e.target.closest?e.target.closest('button[data-del]'):null; if(del){ _D.board.splice(parseInt(del.getAttribute('data-del'),10),1); bindBoard(); saveAndNotify(); } }
  tbody.oninput=function(e){ var i=e.target.getAttribute('data-i'), k=e.target.getAttribute('data-k'); if(i==null||!k)return; _D.board[parseInt(i,10)][k]=e.target.value; };
}
function addBoard(){ var now=new Date(); var cats=_D.board_categories||['공지','질문','잡담']; _D.board.unshift({name:'운영진',category:cats[0],message:'',date: now.toISOString().slice(0,16).replace('T',' ')}); bindBoard(); saveAndNotify(); }
function addBoardCat(){ var v=qs('#bd_newcat').value.trim(); if(!v) return; _D.board_categories.push(v); qs('#bd_newcat').value=''; bindBoard(); saveAndNotify(); }

// Schedule
function bindSchedule(){
  var box=qs('#schedBox'); box.innerHTML='';
  var S=_D.schedule=_D.schedule||[];
  S.forEach(function(d,di){
    var card=document.createElement('div'); card.className='panel'; card.style.margin='8px 0';
    card.innerHTML='<h3>일자 #'+(di+1)+'</h3>\
      <div class="input-row"><label>일자 제목</label><input class="input" data-di="'+di+'" data-f="day" value="'+(d.day||'')+'"></div>';
    (d.items||[]).forEach(function(it,ii){
      var row=document.createElement('div'); row.className='input-row';
      row.innerHTML='<div style="display:grid;grid-template-columns:120px 1fr 1fr;gap:8px">\
        <input type="time" class="input" data-di="'+di+'" data-ii="'+ii+'" data-f="time" value="'+(it.time||'')+'" placeholder="시간">\
        <input class="input" data-di="'+di+'" data-ii="'+ii+'" data-f="activity" value="'+(it.activity||'')+'" placeholder="활동">\
        <input class="input" data-di="'+di+'" data-ii="'+ii+'" data-f="place" value="'+(it.place||'')+'" placeholder="장소">\
      </div>\
      <div class="action-row"><button class="btn danger" data-del="1" data-di="'+di+'" data-ii="'+ii+'">항목 삭제</button></div>';
      card.appendChild(row);
    });
    var add=document.createElement('div'); add.className='action-row'; add.innerHTML='<button class="btn" data-add="'+di+'">+ 항목 추가</button> <button class="btn danger" data-deld="'+di+'">일자 삭제</button>';
    card.appendChild(add); box.appendChild(card);
  });
  var addDay=document.createElement('div'); addDay.className='action-row'; addDay.innerHTML='<button class="btn" data-addday="1">+ 새 일자 추가</button>'; box.appendChild(addDay);

  box.addEventListener('input',onSchedInput);
  box.addEventListener('click',onSchedClick);
}
function onSchedInput(e){
  var f=e.target.getAttribute('data-f'); if(!f) return; var di=parseInt(e.target.getAttribute('data-di'),10); var ii=e.target.getAttribute('data-ii')!=null?parseInt(e.target.getAttribute('data-ii'),10):null;
  if(ii==null) _D.schedule[di][f]=e.target.value; else _D.schedule[di].items[ii][f]=e.target.value;
}
function onSchedClick(e){
  if(e.target.getAttribute('data-addday')){ _D.schedule.push({day:'새 일정',items:[{time:'',activity:'',place:''}]}); bindSchedule(); saveAndNotify(); return; }
  if(e.target.getAttribute('data-add')){ var di=parseInt(e.target.getAttribute('data-add'),10); _D.schedule[di].items=_D.schedule[di].items||[]; _D.schedule[di].items.push({time:'',activity:'',place:''}); bindSchedule(); saveAndNotify(); return; }
  if(e.target.getAttribute('data-del')){ var di=parseInt(e.target.getAttribute('data-di'),10), ii=parseInt(e.target.getAttribute('data-ii'),10); _D.schedule[di].items.splice(ii,1); bindSchedule(); saveAndNotify(); return; }
  if(e.target.getAttribute('data-deld')){ var ddi=parseInt(e.target.getAttribute('data-deld'),10); _D.schedule.splice(ddi,1); bindSchedule(); saveAndNotify(); return; }
}

function initPanels(){ bindInfo(); bindHomePhotos(); bindAnnouncements(); bindPolls(); bindMeeting(); bindVisits(); bindGallery(); bindBoard(); bindSchedule(); }

document.addEventListener('DOMContentLoaded',function(){
  if(!isAuthed()){ qs('#loginView').style.display='block'; } else { qs('#adminApp').style.display='block'; }
  var lf=qs('#loginForm'); if(lf){ lf.addEventListener('submit',function(e){ e.preventDefault(); var id=qs('#loginId').value.trim(), pw=qs('#loginPw').value; if(loginAdmin(id,pw)){ qs('#loginView').style.display='none'; qs('#adminApp').style.display='block'; } else alert('아이디 또는 비밀번호가 올바르지 않습니다.'); }); }
  var lo=qs('#btnLogout'); if(lo){ lo.addEventListener('click',function(){ logoutAdmin(); location.href='admin.html'; }); }
  _D = getData(); initPanels();
  qsa('.side-item').forEach(function(a){ a.addEventListener('click',function(e){ e.preventDefault(); navTo(a.getAttribute('data-to')); }); });
  navTo('home'); // default

  // Wire
  var el;
  if(el=qs('#btnSaveInfo')) el.onclick=saveInfo;
  if(el=qs('#btnAddHomePhoto')) el.onclick=function(){ var f=qs('#hp_file'); if(f) f.click(); };
  el=qs('#hp_file'); if(el){ el.addEventListener('change',function(e){ if(e.target.files && e.target.files.length) addHomePhotoFiles(e.target.files); e.target.value=''; }); }
  if(el=qs('#btnSaveHomePhoto')) el.onclick=saveAndNotify;

  if(el=qs('#btnAddAnn')) el.onclick=addAnnouncement; if(el=qs('#btnSaveAnn')) el.onclick=saveAndNotify;
  if(el=qs('#btnAddPoll')) el.onclick=addPoll; if(el=qs('#btnSavePolls')) el.onclick=saveAndNotify;

  if(el=qs('#btnSaveMeeting')) el.onclick=saveMeeting;

  if(el=qs('#btnAddVisit')) el.onclick=addVisit; if(el=qs('#btnSaveVisits')) el.onclick=saveAndNotify;

  if(el=qs('#btnAddGal')) el.onclick=function(){ var f=qs('#gal_file'); if(f) f.click(); };
  el=qs('#gal_file'); if(el){ el.addEventListener('change',function(e){ if(e.target.files && e.target.files.length) addGalleryFiles(e.target.files); e.target.value=''; }); }
  if(el=qs('#btnSaveGal')) el.onclick=saveAndNotify;

  if(el=qs('#btnAddBoard')) el.onclick=addBoard; if(el=qs('#btnAddCat')) el.onclick=addBoardCat; if(el=qs('#btnSaveBoard')) el.onclick=saveAndNotify;

  if(el=qs('#btnSaveSchedule')) el.onclick=saveAndNotify;
});
