
function renderBoard(d){
  var list=qs('#postList'); var tabs=qs('#tabs'); list.innerHTML=''; tabs.innerHTML='';
  var cats=['전체'].concat(d.board_categories||[]);
  cats.forEach(function(c,i){ var b=document.createElement('button'); b.className='tab'+(i===0?' active':''); b.textContent=c; b.setAttribute('data-cat',c); tabs.appendChild(b); });
  function draw(cat){
    list.innerHTML='';
    (d.board||[]).filter(function(p){return cat==='전체'||p.category===cat}).slice().reverse().forEach(function(p){
      var el=document.createElement('div'); el.className='card';
      el.innerHTML='<div><strong>['+(p.category||'-')+'] '+(p.name||'익명')+'</strong> <span class="small">'+(p.date||'')+'</span></div><div>'+ ( (p.message||'').replace(/\n/g,'<br>') ) +'</div>';
      list.appendChild(el);
    });
  }
  draw('전체');
  tabs.addEventListener('click',function(e){ var t=e.target.closest?e.target.closest('.tab'):null; if(!t)return; qsa('.tab',tabs).forEach(function(x){x.classList.remove('active')}); t.classList.add('active'); draw(t.getAttribute('data-cat')); });
}
document.addEventListener('DOMContentLoaded',function(){ renderBoard(getData()); onDataChange(renderBoard); });
