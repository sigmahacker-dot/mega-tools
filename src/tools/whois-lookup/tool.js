/* Whois Lookup — summary card parsed from raw WHOIS via our own /api/whois endpoint */
(function () {
  'use strict';
  var S = 'whois-lookup';

  function cleanDomain(d) {
    d = String(d || '').trim().toLowerCase();
    d = d.replace(/^[a-z][a-z0-9+.-]*:\/\//, ''); // strip scheme
    d = d.split('/')[0];                          // strip path
    d = d.split(':')[0];                          // strip port
    d = d.replace(/^www\./, '');                  // whois looks up the bare domain
    return d.trim();
  }

  function row(k, v) {
    return '<tr><th style="width:35%">' + TN.esc(k) + '</th><td>' + TN.esc(v) + '</td></tr>';
  }

  function firstMatch(text, re) {
    var m = text.match(re);
    return m ? m[1].replace(/\s+/g, ' ').trim() : null;
  }

  function allMatches(text, re) {
    var out = [], m;
    var g = new RegExp(re.source, 'gim');
    while ((m = g.exec(text)) !== null) {
      var v = m[1].replace(/\s+/g, ' ').trim();
      if (v) out.push(v);
    }
    return out;
  }

  function render(text) {
    var registrar = firstMatch(text, /^registrar:\s*(.+)$/im) || '—';
    var created = firstMatch(text, /^(?:creation date|created|registered on)\s*:\s*(.+)$/im) || '—';
    var expires = firstMatch(text, /^(?:registry expiry date|registrar registration expiration date|expiry date|expiration date|expires)\s*:\s*(.+)$/im) || '—';
    var updated = firstMatch(text, /^(?:updated date|last updated|last modified)\s*:\s*(.+)$/im);

    var statuses = allMatches(text, /^domain status\s*:\s*(.+)$/im).map(function (s) {
      return s.replace(/\s*https?:\/\/\S+/g, '').trim();
    });
    var statusText = statuses.length ? statuses.join(', ') : '—';

    var ns = allMatches(text, /^(?:name\s*servers?|nserver)\s*:\s*(\S+)/im);
    var seen = {}, uniq = [];
    ns.forEach(function (n) {
      var k = n.toLowerCase();
      if (!seen[k]) { seen[k] = 1; uniq.push(n); }
    });
    var nsText = uniq.length ? uniq.join(', ') : '—';

    var html = row('Registrar', registrar) +
      row('Created', created) +
      row('Expires', expires);
    if (updated) html += row('Last updated', updated);
    html += row('Status', statusText) + row('Name servers', nsText);

    var tbody = TN.qs('#' + S + '-table tbody');
    if (tbody) tbody.innerHTML = html;
    TN.show(S + '-summary');

    var rawEl = TN.el(S + '-text');
    if (rawEl) rawEl.textContent = text;
    TN.show(S + '-raw');
  }

  function lookup() {
    try {
      TN.clearErr(S + '-error');
      TN.hide(S + '-summary');
      TN.hide(S + '-raw');
      var input = TN.el(S + '-domain');
      var domain = cleanDomain(input ? input.value : '');
      if (!domain || domain.indexOf('.') < 0 || !/^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/.test(domain)) {
        TN.setErr(S + '-error', 'Enter a valid domain, e.g. example.com');
        return;
      }
      var btn = TN.el(S + '-lookup');
      if (btn) btn.disabled = true;
      fetch('/api/whois?domain=' + encodeURIComponent(domain))
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then(function (d) {
          if (!d || typeof d !== 'object') throw new Error('bad response');
          if (d.error) {
            TN.setErr(S + '-error', 'Lookup failed: ' + d.error);
            return;
          }
          var text = String(d.text || '');
          if (!text.trim()) {
            TN.setErr(S + '-error', 'No WHOIS data returned for this domain.');
            return;
          }
          if (/no match for|not found|no entries found|no data found/i.test(text)) {
            TN.setErr(S + '-error', 'No WHOIS record found for "' + domain + '". Check the spelling.');
            return;
          }
          render(text);
        })
        .catch(function () {
          TN.setErr(S + '-error', 'Could not reach the WHOIS service. Please try again.');
        })
        .then(function () { if (btn) btn.disabled = false; });
    } catch (err) {
      TN.setErr(S + '-error', 'Something went wrong. Please try again.');
    }
  }

  function init() {
    try {
      TN.on(S + '-lookup', 'click', lookup);
      var input = TN.el(S + '-domain');
      if (input) input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); lookup(); }
      });
    } catch (err) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
