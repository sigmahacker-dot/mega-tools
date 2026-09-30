(function () {
  'use strict';
  var P = 'dns-lookup-';

  function fmtRecord(r) {
    if (r === null || r === undefined) return '';
    if (typeof r === 'object') {
      try { return JSON.stringify(r); } catch (e) { return String(r); }
    }
    return String(r);
  }

  TN.on(P + 'go', 'click', function () {
    var host = TN.el(P + 'host').value.trim();
    var type = TN.el(P + 'type').value;
    if (!host) { TN.setErr(P + 'error', 'Enter a hostname, e.g. example.com.'); return; }
    // Basic hostname sanity check.
    if (!/^[a-zA-Z0-9]([a-zA-Z0-9.\-]*[a-zA-Z0-9])?$/.test(host)) {
      TN.setErr(P + 'error', 'That does not look like a valid hostname.');
      return;
    }
    TN.clearErr(P + 'error');
    TN.hide(P + 'result');
    var btn = TN.el(P + 'go');
    var oldLabel = btn.textContent;
    btn.textContent = 'Looking up…';
    btn.disabled = true;

    fetch('/api/dns?host=' + encodeURIComponent(host) + '&type=' + encodeURIComponent(type))
      .then(function (r) {
        if (!r.ok) { throw new Error('Server returned ' + r.status); }
        return r.json();
      })
      .then(function (d) {
        var records = d && d.records;
        var tbody = TN.el(P + 'rows');
        tbody.innerHTML = '';
        if (!records || !records.length) {
          var tr = document.createElement('tr');
          var td = document.createElement('td');
          td.colSpan = 2;
          td.textContent = 'No ' + type + ' records found for ' + host + '.';
          tr.appendChild(td);
          tbody.appendChild(tr);
        } else {
          records.forEach(function (rec, i) {
            var tr = document.createElement('tr');
            var n = document.createElement('td');
            n.textContent = String(i + 1);
            var v = document.createElement('td');
            v.textContent = fmtRecord(rec);
            tr.appendChild(n);
            tr.appendChild(v);
            tbody.appendChild(tr);
          });
        }
        TN.show(P + 'result');
      })
      .catch(function (e) {
        TN.setErr(P + 'error', 'Lookup failed: ' + (e && e.message ? e.message : e));
      })
      .then(function () {
        btn.textContent = oldLabel;
        btn.disabled = false;
      });
  });
})();
