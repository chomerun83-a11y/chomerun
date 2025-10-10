
function renderPolls(d){
  var wrap=qs('#surveyWrap'); wrap.innerHTML='';
  (d.polls||[]).forEach(function(p,i){
    var closed=p.deadline? (new Date()>new Date(p.deadline+' 23:59:59')):false; var votes=JSON.parse(localStorage.getItem('club_poll_votes')||'{}'); var saved=votes[p.id];
    var opts=(p.options||[]).map(function(opt,oi){ var n=oi+1; var input=p.multiple?'<input type="checkbox" name="p_'+p.id+'" value="'+oi+'" '+(Array.isArray(saved)&&saved.indexOf(oi)>-1?'checked':'')+' '+(closed?'disabled':'')+'>'
      :'<input type="radio" name="p_'+p.id+'" value="'+oi+'" '+(saved===oi?'checked':'')+' '+(closed?'disabled':'')+'>'; return '<label class="opt">'+input+'<span>'+n+'. '+opt.label+'</span></label>';}).join('');
    var el=document.createElement('div'); el.className='card';
    el.innerHTML='<h3 style="margin:0;">'+(i+1)+'번 설문: '+p.question+'</h3><div class="small">'+(p.deadline?('마감: '+p.deadline+(closed?' (마감됨)':'')):'')+'</div>\
      <div class="poll" style="margin-top:6px">'+opts+'</div><div class="action-row"><button class="btn" '+(closed?'disabled':'')+' data-pid="'+p.id+'">투표하기</button></div>';
    var btn=el.querySelector('button');
    if(btn){ btn.addEventListener('click',function(){
      var newSel;
      if(p.multiple){ newSel=qsa('input[name="p_'+p.id+'"]:checked',el).map(function(x){return parseInt(x.value,10)}); if(!newSel.length){ alert('옵션을 선택해 주세요.'); return; } }
      else{ var sel=el.querySelector('input[name="p_'+p.id+'"]:checked'); if(!sel){ alert('옵션을 선택해 주세요.'); return; } newSel=parseInt(sel.value,10); }
      var data=getData(); var poll=(data.polls||[]).find(function(x){return x.id===p.id}); if(poll){
        var votesMap=JSON.parse(localStorage.getItem('club_poll_votes')||'{}'); var prev=votesMap[p.id];
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
      var vm=JSON.parse(localStorage.getItem('club_poll_votes')||'{}'); vm[p.id]=newSel; localStorage.setItem('club_poll_votes', JSON.stringify(vm)); alert('투표가 반영되었습니다.');
    }); }
    wrap.appendChild(el);
  });
}
document.addEventListener('DOMContentLoaded',function(){ renderPolls(getData()); onDataChange(renderPolls); });
