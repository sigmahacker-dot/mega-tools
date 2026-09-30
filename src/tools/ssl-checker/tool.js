/* SSL Checker — reads a domain's live certificate via our own /api/ssl endpoint */
(function () {
  'use strict';
  var S = 'ssl-checker';

  function cleanHost(h) {
    h = String(h || '').trim().toLowerCase();
    h = h.replace(/^[a-z][a-z0-9+.-]*:\/\//, ''); // strip scheme
    h = h.split('/')[0];                          // strip path
    h = h.split(':')[0];                          // strip port
    return h.trim();
  }

  function row(k, v) {
    return '<tr><th style="width:35%">' + TN.esc(k) + '</th><td>' + TN.esc(v) + '</td></tr>';
  }

  function render(d) {
    var ok = !!d.valid;
    var badge = TN.el(S + '-badge');
    if (badge) {
      var style = ok
        ? 'background:#dcfce7;color:#166534;border:1px solid #bbf7d0'
        : 'background:#fee2e2;color:#b91c1c;border:1px solid #fecaca';
      badge.innerHTML = '<span class="tag" style="' + style + ';font-size:.9rem;padding:5px 18px">' +
        (ok ? 'VALID' : 'INVALID') + '</span>';
    }
    var html = '';
    if (d.host) html += row('Host', d.host);
    if (ok) {
      if (d.issuer) html += row('Issuer', d.issuer);
      if (d.valid_from) html += row('Valid from', d.valid_from);
      if (d.valid_to) html += row('Valid to', d.valid_to);
      if (d.days_left != null) {
        var n = Number(d.days_left);
        html += row('Days remaining', isNaN(n) ? String(d.days_left) : (n === 1 ? '1 day' : n + ' days'));
      }
      if (d.fingerprint) html += row('Fingerprint', d.fingerprint);
    } else if (d.error) {
      html += row('Error', d.error);
    }
    if (!html) html = row('Result', 'No certificate details returned.');
    var tbody = TN.qs('#' + S + '-table tbody');
    if (tbody) tbody.innerHTML = html;
    TN.show(S + '-output');
  }

  function check() {
    try {
      TN.clearErr(S + '-error');
      TN.hide(S + '-output');
      var input = TN.el(S + '-domain');
      var host = cleanHost(input ? input.value : '');
      if (!host || host.indexOf('.') < 0 || !/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/.test(host)) {
        TN.setErr(S + '-error', 'Enter a valid domain, e.g. example.com');
        return;
      }
      var btn = TN.el(S + '-check');
      if (btn) btn.disabled = true;
      fetch('/api/ssl?host=' + encodeURIComponent(host))
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then(function (d) {
          if (!d || typeof d !== 'object') throw new Error('bad response');
          render(d);
        })
        .catch(function () {
          TN.setErr(S + '-error', 'Could not reach the SSL check service. Please try again.');
        })
        .then(function () { if (btn) btn.disabled = false; });
    } catch (err) {
      TN.setErr(S + '-error', 'Something went wrong. Please try again.');
    }
  }

  function init() {
    try {
      TN.on(S + '-check', 'click', check);
      var input = TN.el(S + '-domain');
      if (input) input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); check(); }
      });
    } catch (err) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
