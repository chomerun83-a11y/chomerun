
'use strict';
var LS={DATA:'club_data', POLL_V:'club_poll_votes', ADMIN:'club_admin_auth'};
function qs(s,el){if(!el)el=document;return el.querySelector(s)}; function qsa(s,el){if(!el)el=document;return Array.prototype.slice.call(el.querySelectorAll(s));}
function pad2(n){return n<10?'0'+n:n}
function fmtDate(d){try{var t=new Date(d);if(isNaN(t))return d;return t.getFullYear()+'-'+pad2(t.getMonth()+1)+'-'+pad2(t.getDate())}catch(e){return d}}
function tryParse(s,fb){try{return s?JSON.parse(s):fb}catch(e){return fb}}
function getData(){var ls=localStorage.getItem(LS.DATA);if(ls)return tryParse(ls, window.DEFAULT_DATA||{});return window.DEFAULT_DATA||{}}
function saveData(d){try{localStorage.setItem(LS.DATA, JSON.stringify(d))}catch(e){alert('저장 실패: 용량 초과 등이 원인일 수 있습니다.');}}
function onDataChange(cb){window.addEventListener('storage',function(e){ if(e.key===LS.DATA){cb(getData());}});}
function isAuthed(){return sessionStorage.getItem(LS.ADMIN)==='ok'}
function loginAdmin(id,pw){if(id==='admin'&&pw==='admin123!@#'){sessionStorage.setItem(LS.ADMIN,'ok');return true}return false}
function logoutAdmin(){sessionStorage.removeItem(LS.ADMIN)}

// Map helpers
function mapLinks(q,lat,lng){var query=(lat!=null&&lng!=null)?(lat+','+lng):(q||'');var enc=encodeURIComponent(query);return{
  google:'https://www.google.com/maps/search/?api=1&query='+enc,
  naver:'https://map.naver.com/v5/search/'+enc,
  kakao:'https://map.kakao.com/?q='+enc
};}
function embedSrc(provider, raw, q, lat, lng){
  if(raw && raw.trim()){return raw.trim();}
  var query=(lat!=null&&lng!=null)?(lat+','+lng):(q||'');var enc=encodeURIComponent(query);
  if(provider==='google') return 'https://www.google.com/maps?q='+enc+'&output=embed';
  if(provider==='naver') return 'https://map.naver.com/v5/search/'+enc;
  if(provider==='kakao') return 'https://map.kakao.com/?q='+enc;
  return 'https://www.google.com/maps?q='+enc+'&output=embed';
}
