
(function(global){
  var DB_NAME='bamsil_db', DB_VER=1, STORE='images';
  function openDB(){ return new Promise(function(resolve,reject){ try{
      var req=indexedDB.open(DB_NAME, DB_VER);
      req.onupgradeneeded=function(e){ var db=e.target.result; if(!db.objectStoreNames.contains(STORE)){ db.createObjectStore(STORE,{keyPath:'id'});} };
      req.onsuccess=function(e){ resolve(e.target.result); };
      req.onerror=function(e){ reject(e.target.error||new Error('indexedDB open error')); };
  }catch(err){ reject(err); } }); }

  function saveImageToDB(blob, mime){
    return new Promise(function(resolve,reject){
      openDB().then(function(db){
        var id='img_'+Date.now()+'_'+Math.random().toString(36).slice(2,8);
        var tx=db.transaction([STORE],'readwrite'); var st=tx.objectStore(STORE);
        var rec={id:id, blob:blob, type:mime||blob.type||'image/jpeg', created:Date.now()};
        var r=st.put(rec);
        r.onsuccess=function(){ resolve(id); };
        r.onerror=function(e){ reject(e.target.error||new Error('put error')); };
      }).catch(reject);
    });
  }

  function getImageURLFromDB(id){
    return new Promise(function(resolve,reject){
      openDB().then(function(db){
        var tx=db.transaction([STORE],'readonly'); var st=tx.objectStore(STORE);
        var r=st.get(id);
        r.onsuccess=function(){ if(!r.result) return resolve(null); try{ var url=URL.createObjectURL(r.result.blob); resolve(url); }catch(err){ resolve(null); } };
        r.onerror=function(e){ resolve(null); };
      }).catch(function(){ resolve(null); });
    });
  }

  function deleteImageFromDB(id){
    return new Promise(function(resolve,reject){
      openDB().then(function(db){
        var tx=db.transaction([STORE],'readwrite'); var st=tx.objectStore(STORE);
        var r=st.delete(id);
        r.onsuccess=function(){ resolve(true); };
        r.onerror=function(){ resolve(false); };
      }).catch(function(){ resolve(false); });
    });
  }
  global.IDBImages={openDB:openDB,saveImageToDB:saveImageToDB,getImageURLFromDB:getImageURLFromDB,deleteImageFromDB:deleteImageFromDB};
})(window);
