(function () {
  'use strict';
  var P = 'travel-itinerary-day-planner-', ERR = P + 'error', LS = 'tn-travel-itinerary-day-planner';
  var days = [];
  function g(id) { return TN.el(P + id); }
  function load() {
    try {
      var raw = localStorage.getItem(LS);
      if (raw) { days = JSON.parse(raw); return; }
    } catch (e) { /* ignore */ }
    days = [{ title: 'Day 1 — Arrival', items: [{ t: '09:00', d: 'Land and check in' }] }];
  }
  function save() {
    try { localStorage.setItem(LS, JSON.stringify(days)); } catch (e) { /* unavailable */ }
  }
  var saveT = null;
  function saveSoon() { if (saveT) clearTimeout(saveT); saveT = setTimeout(save, 400); }
  function render() {
    var wrap = g('days'), h = '';
    days.forEach(function (day, di) {
      h += '<div class="result" data-day="' + di + '"><div class="grid2">' +
        '<div class="field"><label>Day title</label><input class="input" data-dtitle="' + di + '" value="' + TN.esc(day.title).replace(/"/g, '&quot;') + '"></div>' +
        '<div class="field" style="align-self:end"><div class="btn-row">' +
        '<button type="button" class="btn btn-outline btn-sm" data-additem="' + di + '">+ Activity</button>' +
        '<button type="button" class="btn btn-outline btn-sm" data-rmday="' + di + '">Remove day</button>' +
        '</div></div></div>' +
        '<table class="data"><thead><tr><th style="width:110px">Time</th><th>Activity</th><th style="width:70px"></th></tr></thead><tbody>';
      day.items.forEach(function (it, ii) {
        h += '<tr><td><input class="input" type="time" data-it="' + di + ':' + ii + ':t" value="' + TN.esc(it.t) + '"></td>' +
          '<td><input class="input" data-it="' + di + ':' + ii + ':d" value="' + TN.esc(it.d).replace(/"/g, '&quot;') + '" placeholder="What / where"></td>' +
          '<td><button type="button" class="btn btn-outline btn-sm" data-rmitem="' + di + ':' + ii + '">✕</button></td></tr>';
      });
      h += '</tbody></table></div>';
    });
    if (!days.length) h = '<p class="muted">No days yet — press “+ Add day” to start planning.</p>';
    wrap.innerHTML = h;
    // wire
    function qa(sel, fn) {
      var els = wrap.querySelectorAll(sel);
      for (var i = 0; i < els.length; i++) fn(els[i]);
    }
    qa('[data-dtitle]', function (el) {
      TN.on(el, 'input', function () { days[parseInt(el.getAttribute('data-dtitle'), 10)].title = el.value; saveSoon(); });
    });
    qa('[data-it]', function (el) {
      TN.on(el, 'input', function () {
        var p = el.getAttribute('data-it').split(':');
        var di = parseInt(p[0], 10), ii = parseInt(p[1], 10);
        days[di].items[ii][p[2] === 't' ? 't' : 'd'] = el.value;
        saveSoon();
      });
    });
    qa('[data-additem]', function (el) {
      TN.on(el, 'click', function () {
        var di = parseInt(el.getAttribute('data-additem'), 10);
        days[di].items.push({ t: '12:00', d: '' });
        save(); render();
      });
    });
    qa('[data-rmitem]', function (el) {
      TN.on(el, 'click', function () {
        var p = el.getAttribute('data-rmitem').split(':');
        days[parseInt(p[0], 10)].items.splice(parseInt(p[1], 10), 1);
        save(); render();
      });
    });
    qa('[data-rmday]', function (el) {
      TN.on(el, 'click', function () {
        days.splice(parseInt(el.getAttribute('data-rmday'), 10), 1);
        save(); render();
      });
    });
  }
  function asText() {
    var out = [];
    days.forEach(function (day) {
      out.push(day.title);
      day.items.forEach(function (it) { out.push('  ' + it.t + '  ' + it.d); });
      out.push('');
    });
    return out.join('\n');
  }
  try {
    if (!TN.el(P + 'addday')) return;
    load(); render();
    TN.on(P + 'addday', 'click', function () {
      days.push({ title: 'Day ' + (days.length + 1), items: [{ t: '09:00', d: '' }] });
      save(); render();
    });
    TN.on(P + 'copy', 'click', function () {
      if (!days.length) { TN.setErr(ERR, 'Nothing to copy yet — add a day first.'); return; }
      TN.copy(asText());
    });
    TN.on(P + 'print', 'click', function () { window.print(); });
  } catch (e) { /* never throw on load */ }
})();
