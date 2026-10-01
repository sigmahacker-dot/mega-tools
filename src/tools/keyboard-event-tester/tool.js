(function () {
  'use strict';
  var ERR = 'keyboard-event-tester-error';
  var history = [];
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function keyLabel(k) {
    if (k === ' ') return 'Space';
    return k;
  }
  function handle(e) {
    try {
      if (TN.el('kb-prevent').checked) e.preventDefault();
      var mods = [];
      if (e.ctrlKey) mods.push('Ctrl');
      if (e.shiftKey) mods.push('Shift');
      if (e.altKey) mods.push('Alt');
      if (e.metaKey) mods.push('Meta');
      TN.el('kb-key').textContent = keyLabel(e.key);
      TN.el('kb-code').textContent = e.code || '—';
      TN.el('kb-keycode').textContent = e.keyCode;
      TN.el('kb-which').textContent = e.which;
      TN.el('kb-big').textContent = keyLabel(e.key);
      TN.el('kb-sub').textContent = e.type + ' · code: ' + (e.code || '—') + ' · location: ' + e.location + (e.repeat ? ' · (auto-repeat)' : '');
      history.unshift({
        t: new Date().toLocaleTimeString(), type: e.type, key: keyLabel(e.key),
        code: e.code || '—', kc: e.keyCode, mods: mods.join('+') || '—'
      });
      if (history.length > 50) history.length = 50;
      var html = '';
      history.forEach(function (h) {
        html += '<tr><td>' + esc(h.t) + '</td><td>' + esc(h.type) + '</td><td>' + esc(h.key) + '</td><td>' +
          esc(h.code) + '</td><td>' + h.kc + '</td><td>' + esc(h.mods) + '</td></tr>';
      });
      TN.el('kb-history').innerHTML = html;
    } catch (err) { /* never throw */ }
  }
  try {
    var box = TN.el('kb-box');
    box.addEventListener('keydown', handle);
    box.addEventListener('keyup', handle);
    box.addEventListener('focus', function () { box.style.borderColor = 'rgba(255,90,90,.65)'; });
    box.addEventListener('blur', function () { box.style.borderColor = 'rgba(255,255,255,.25)'; });
    TN.on('kb-global', 'change', function () {
      var on = TN.el('kb-global').checked;
      if (on) {
        window.addEventListener('keydown', handle);
        window.addEventListener('keyup', handle);
        TN.el('kb-sub').textContent = 'listening on whole window';
      } else {
        window.removeEventListener('keydown', handle);
        window.removeEventListener('keyup', handle);
        TN.el('kb-sub').textContent = 'keydown / keyup are captured here';
      }
    });
    TN.on('kb-clear', 'click', function () {
      history = [];
      TN.el('kb-history').innerHTML = '<tr><td colspan="6" class="muted">No events yet.</td></tr>';
      TN.el('kb-key').textContent = '–'; TN.el('kb-code').textContent = '–';
      TN.el('kb-keycode').textContent = '–'; TN.el('kb-which').textContent = '–';
      TN.el('kb-big').textContent = 'Press any key…';
    });
  } catch (e) { /* never throw on load */ }
})();