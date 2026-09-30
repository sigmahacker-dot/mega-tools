(function () {
  'use strict';
  var P = 'ip-address-finder-';
  var currentIP = '';

  function findIP() {
    TN.clearErr(P + 'error');
    TN.el(P + 'ip').textContent = '…';
    fetch('/api/ip').then(function (r) {
      if (!r.ok) { throw new Error('Server returned ' + r.status); }
      return r.json();
    }).then(function (d) {
      if (!d || !d.ip) { throw new Error('Unexpected response from server.'); }
      currentIP = String(d.ip);
      TN.el(P + 'ip').textContent = currentIP;
    }).catch(function (e) {
      TN.el(P + 'ip').textContent = '—';
      TN.setErr(P + 'error', 'Could not detect your IP: ' + (e && e.message ? e.message : e));
    });
  }

  TN.on(P + 'find', 'click', findIP);

  TN.on(P + 'copy', 'click', function () {
    if (!currentIP) { TN.setErr(P + 'error', 'No IP detected yet — click "Find my IP" first.'); return; }
    TN.clearErr(P + 'error');
    TN.copy(currentIP).then(null, function () {
      TN.setErr(P + 'error', 'Copy failed — select the text manually.');
    });
  });

  // Auto-run on page load.
  try { findIP(); } catch (e) { /* never throw on load */ }
})();
