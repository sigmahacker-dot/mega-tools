(function () {
  'use strict';
  var P = 'port-checker-';

  TN.on(P + 'check', 'click', function () {
    var host = TN.el(P + 'host').value.trim();
    var portRaw = TN.el(P + 'port').value.trim();
    var port = parseInt(portRaw, 10);
    if (!host) { TN.setErr(P + 'error', 'Enter a hostname, e.g. example.com.'); return; }
    if (!/^[a-zA-Z0-9]([a-zA-Z0-9.\-]*[a-zA-Z0-9])?$/.test(host)) {
      TN.setErr(P + 'error', 'That does not look like a valid hostname.');
      return;
    }
    if (!portRaw || isNaN(port) || port < 1 || port > 65535) {
      TN.setErr(P + 'error', 'Enter a valid port number between 1 and 65535.');
      return;
    }
    TN.clearErr(P + 'error');
    TN.hide(P + 'result');
    var btn = TN.el(P + 'check');
    var oldLabel = btn.textContent;
    btn.textContent = 'Checking…';
    btn.disabled = true;

    fetch('/api/port?host=' + encodeURIComponent(host) + '&port=' + port)
      .then(function (r) {
        if (!r.ok) { throw new Error('Server returned ' + r.status); }
        return r.json();
      })
      .then(function (d) {
        var badge = TN.el(P + 'badge');
        var detail = TN.el(P + 'detail');
        if (d && d.open) {
          badge.textContent = 'OPEN';
          badge.className = 'tag';
          badge.style.background = '#16a34a';
          badge.style.color = '#fff';
        } else {
          badge.textContent = 'CLOSED';
          badge.className = 'tag';
          badge.style.background = '#dc2626';
          badge.style.color = '#fff';
        }
        var ms = d && typeof d.ms !== 'undefined' ? d.ms : null;
        detail.textContent = host + ':' + port + (ms !== null ? ' — responded in ' + ms + ' ms' : '');
        TN.show(P + 'result');
      })
      .catch(function (e) {
        TN.setErr(P + 'error', 'Check failed: ' + (e && e.message ? e.message : e));
      })
      .then(function () {
        btn.textContent = oldLabel;
        btn.disabled = false;
      });
  });

  // Quick-port buttons fill the port field (and host default hint left untouched).
  var quick = TN.el(P + 'quick');
  if (quick) {
    quick.addEventListener('click', function (ev) {
      var t = ev.target;
      if (t && t.getAttribute && t.getAttribute('data-port')) {
        TN.el(P + 'port').value = t.getAttribute('data-port');
        TN.clearErr(P + 'error');
      }
    });
  }
})();
