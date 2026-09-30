/* ToolNest shared helpers — loaded on every page as window.TN */
(function(){
  'use strict';
  function resolveEl(elOrId){
    return typeof elOrId === 'string' ? document.getElementById(elOrId) : elOrId;
  }
  const TN = {
    el: function(id){ return document.getElementById(id); },
    qs: function(sel, root){ return (root||document).querySelector(sel); },
    qsa: function(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); },
    on: function(elOrId, evt, fn){
      const el = resolveEl(elOrId);
      if(el) el.addEventListener(evt, fn);
      return el;
    },
    show: function(elOrId){ const el = resolveEl(elOrId); if(el) el.classList.remove('hidden'); },
    hide: function(elOrId){ const el = resolveEl(elOrId); if(el) el.classList.add('hidden'); },
    setErr: function(elOrId, msg){
      const el = resolveEl(elOrId);
      if(!el) return;
      el.textContent = msg;
      el.classList.add('show');
    },
    clearErr: function(elOrId){
      const el = resolveEl(elOrId);
      if(!el) return;
      el.textContent = '';
      el.classList.remove('show');
    },
    copy: function(text){
      if(navigator.clipboard && navigator.clipboard.writeText){
        return navigator.clipboard.writeText(text).then(function(){return true;}).catch(function(){return fallback();});
      }
      return Promise.resolve(fallback());
      function fallback(){
        try{
          const ta = document.createElement('textarea');
          ta.value = text; ta.style.position='fixed'; ta.style.opacity='0';
          document.body.appendChild(ta); ta.select();
          const ok = document.execCommand('copy');
          document.body.removeChild(ta);
          return ok;
        }catch(e){ return false; }
      }
    },
    download: function(blob, filename){
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename || 'download';
      document.body.appendChild(a); a.click();
      setTimeout(function(){ document.body.removeChild(a); URL.revokeObjectURL(url); }, 1500);
    },
    downloadText: function(text, filename, mime){
      TN.download(new Blob([text], {type: mime || 'text/plain;charset=utf-8'}), filename);
    },
    readAsDataURL: function(file){
      return new Promise(function(res, rej){
        const r = new FileReader();
        r.onload = function(){ res(r.result); };
        r.onerror = function(){ rej(r.error); };
        r.readAsDataURL(file);
      });
    },
    readAsArrayBuffer: function(file){
      return new Promise(function(res, rej){
        const r = new FileReader();
        r.onload = function(){ res(r.result); };
        r.onerror = function(){ rej(r.error); };
        r.readAsArrayBuffer(file);
      });
    },
    loadImage: function(src){
      return new Promise(function(res, rej){
        const img = new Image();
        img.onload = function(){ res(img); };
        img.onerror = function(){ rej(new Error('Could not load image')); };
        img.src = src;
      });
    },
    fmtBytes: function(n){
      if(!n && n !== 0) return '—';
      const u = ['B','KB','MB','GB'];
      let i = 0;
      while(n >= 1024 && i < u.length-1){ n /= 1024; i++; }
      return n.toFixed(n < 10 && i > 0 ? 1 : 0) + ' ' + u[i];
    },
    debounce: function(fn, ms){
      let t;
      return function(){ clearTimeout(t); const a=arguments, s=this; t=setTimeout(function(){ fn.apply(s,a); }, ms||300); };
    },
    esc: function(s){
      return String(s==null?'':s).replace(/[&<>"']/g, function(c){
        return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
      });
    }
  };
  window.TN = TN;
})();
