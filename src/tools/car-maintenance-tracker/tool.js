(function () {
  'use strict';
  var P = 'car-maintenance-tracker-', ERR = P + 'error', LS = 'tn-car-maintenance-tracker';
  var DAY = 86400000;
  var state = { mileage: 0, services: [] };
  function g(id) { return TN.el(P + id); }
  function load() {
    try {
      var raw = localStorage.getItem(LS);
      if (raw) state = JSON.parse(raw);
    } catch (e) { state = { mileage: 0, services: [] }; }
  }
  function save() {
    try { localStorage.setItem(LS, JSON.stringify(state)); } catch (e) { /* unavailable */ }
  }
  function pdate(s) { var p = s.split('-'); return new Date(p[0], p[1] - 1, p[2]); }
  function dstr(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function addMonths(d, m) { var x = new Date(d); x.setMonth(x.getMonth() + m); return x; }
  function today() { var n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
  function status(s) {
    var t = today();
    var dueDate = addMonths(pdate(s.lastDate), s.intMonths);
    var dueMiles = s.lastMiles + s.intMiles;
    var daysLeft = Math.round((dueDate - t) / DAY);
    var milesLeft = dueMiles - state.mileage;
    if (daysLeft < 0 || milesLeft < 0) return { label: 'OVERDUE', color: '#f87171', why: (daysLeft < 0 ? (-daysLeft) + ' days over' : '') + (daysLeft < 0 && milesLeft < 0 ? ' & ' : '') + (milesLeft < 0 ? (-milesLeft) + ' mi over' : '') };
    if (daysLeft <= 30 || milesLeft <= 500) return { label: 'DUE SOON', color: '#fbbf24', why: Math.min(daysLeft, 9999) + ' days / ' + Math.max(milesLeft, 0) + ' mi left' };
    return { label: 'OK', color: '#4ade80', why: daysLeft + ' days / ' + milesLeft + ' mi left' };
  }
  function render() {
    var body = g('list');
    if (!state.services.length) { body.innerHTML = '<tr><td colspan="5" class="muted">No services yet — add oil changes, filters, tires…</td></tr>'; return; }
    body.innerHTML = state.services.map(function (s, i) {
      var dueDate = dstr(addMonths(pdate(s.lastDate), s.intMonths));
      var dueMiles = s.lastMiles + s.intMiles;
      var st = status(s);
      return '<tr><td><b>' + TN.esc(s.name) + '</b></td><td>' + dueDate + '</td><td>' + dueMiles.toLocaleString('en-US') + ' mi</td>' +
        '<td style="color:' + st.color + ';font-weight:bold">' + st.label + '<br><span class="muted" style="font-weight:normal">' + TN.esc(st.why) + '</span></td>' +
        '<td><div class="btn-row"><button type="button" class="btn btn-outline btn-sm" data-done="' + i + '">Done</button>' +
        '<button type="button" class="btn btn-outline btn-sm" data-del="' + i + '">✕</button></div></td></tr>';
    }).join('');
    function wire(attr, fn) {
      var els = body.querySelectorAll('[' + attr + ']');
      for (var i = 0; i < els.length; i++) {
        (function (b) {
          TN.on(b, 'click', function () { fn(parseInt(b.getAttribute(attr), 10)); });
        })(els[i]);
      }
    }
    wire('data-done', function (i) {
      var t = today();
      state.services[i].lastDate = dstr(t);
      state.services[i].lastMiles = state.mileage;
      save(); render();
    });
    wire('data-del', function (i) { state.services.splice(i, 1); save(); render(); });
  }
  try {
    if (!TN.el(P + 'add')) return;
    load();
    if (state.mileage) g('cur').value = state.mileage;
    render();
    TN.on(P + 'savem', 'click', function () {
      TN.clearErr(ERR);
      var m = parseInt(g('cur').value, 10);
      if (isNaN(m) || m < 0) { TN.setErr(ERR, 'Current mileage must be ≥ 0.'); return; }
      state.mileage = m; save(); render();
    });
    TN.on(P + 'add', 'click', function () {
      TN.clearErr(ERR);
      var name = g('name').value.trim();
      var ld = g('lastd').value, lm = parseInt(g('lastm').value, 10);
      var im = parseInt(g('intm').value, 10), imi = parseInt(g('intmi').value, 10);
      if (!name) { TN.setErr(ERR, 'Name the service (e.g. Oil change).'); return; }
      if (!ld) { TN.setErr(ERR, 'Pick the last-done date.'); return; }
      if (isNaN(lm) || lm < 0) { TN.setErr(ERR, 'Last mileage must be ≥ 0.'); return; }
      if (isNaN(im) || im < 1 || im > 60) { TN.setErr(ERR, 'Month interval must be 1–60.'); return; }
      if (isNaN(imi) || imi < 100) { TN.setErr(ERR, 'Mile interval must be ≥ 100.'); return; }
      if (pdate(ld) > today()) { TN.setErr(ERR, 'Last-done date cannot be in the future.'); return; }
      state.services.push({ name: name, lastDate: ld, lastMiles: lm, intMonths: im, intMiles: imi });
      g('name').value = '';
      save(); render();
    });
  } catch (e) { /* never throw on load */ }
})();
