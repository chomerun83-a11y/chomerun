
function bucketLabel(h){
  if(h>=5 && h<9) return "이른 아침";
  if(h>=9 && h<12) return "오전";
  if(h>=12 && h<17) return "오후";
  if(h>=17 && h<22) return "저녁";
  return "늦은 밤";
}
function renderSchedule(d){
  var wrap=qs('#scheduleWrap'); wrap.innerHTML='';
  (d.schedule||[]).forEach(function(day){
    var groups={};
    (day.items||[]).forEach(function(it){
      var hh = parseInt((it.time||"00:00").split(':')[0],10)||0;
      var label=bucketLabel(hh); groups[label]=groups[label]||[]; groups[label].push(it);
    });
    var card=document.createElement('div'); card.className='card';
    var html = '<h3 style="margin:4px 0;">'+day.day+'</h3><div class="timeline">';
    Object.keys(groups).forEach(function(lb){
      var items=groups[lb].map(function(it){ return '<div class="slot-item"><span class="badge-time">'+(it.time||'')+'</span><div>'+it.activity+' <span class="small">('+(it.place||'')+')</span></div></div>'; }).join('');
      html += '<div class="slot"><h3>'+lb+'</h3>'+items+'</div>';
    });
    html += '</div>'; card.innerHTML=html; wrap.appendChild(card);
  });
}
document.addEventListener('DOMContentLoaded',function(){ renderSchedule(getData()); onDataChange(renderSchedule); });
