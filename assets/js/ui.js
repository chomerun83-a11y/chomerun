
export const qs  = (s,p=document)=>p.querySelector(s);
export const qsa = (s,p=document)=>Array.from(p.querySelectorAll(s));
export function linkify(text=''){
  const url=/((https?:\/\/)[^\s]+)/g;
  return (text||'').replace(url, u=>`<a href="${u}" target="_blank" rel="noopener">${u}</a>`);
}
export function safeFileName(name){
  const dot=name.lastIndexOf('.');
  let base=dot>-1?name.slice(0,dot):name; const ext=dot>-1?name.slice(dot):'.jpg';
  base = base.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^0-9a-zA-Z-_ ]/g,'').trim().replace(/\s+/g,'_');
  return (base||'image')+ext.toLowerCase();
}
export function bucketLabel(hhmm){
  if(!hhmm) return '기타';
  const m=/^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if(!m) return '기타';
  const h=parseInt(m[1],10);
  if(h<6) return '이른 아침';
  if(h<12) return '오전';
  if(h<18) return '오후';
  return '저녁';
}
export function mapLinks(q){
  const e=encodeURIComponent(q||'');
  return { g:`https://www.google.com/maps?q=${e}`, n:`https://map.naver.com/v5/search/${e}`, k:`https://map.kakao.com/?q=${e}` };
}
export function mountCarousel(box, interval=3000){
  const slides=qsa('.slide',box);
  if(!slides.length) return;
  let i=0;
  slides.forEach((el,idx)=>el.style.display=idx? 'none':'block');
  setInterval(()=>{ slides[i].style.display='none'; i=(i+1)%slides.length; slides[i].style.display='block'; }, interval);
}
