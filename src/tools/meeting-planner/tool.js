(function () {
  'use strict';
  var ERR = 'meeting-planner-error';

  function offsets() {
    var list = [];
    for (var h = -12; h <= 14; h++) list.push(h);
    list.push(5.5); // UTC+05:30
    list.sort(function (a, b) { return a - b; });
    return list;
  }

  function label(off) {
    var sign = off < 0 ? '−' : '+';
    var abs = Math.abs(off);
    var h = Math.floor(abs);
    var m = Math.round((abs - h) * 60);
    return 'UTC' + sign + ('0' + h).slice(-2) + ':' + ('0' + m).slice(-2);
  }

  function fillSelect(el, includeNone, defVal) {
    if (!el) return;
    el.innerHTML = '';
    if (includeNone) {
      var none = document.createElement('option');
      none.value = '';
      none.textContent = '— None —';
      el.appendChild(none);
    }
    offsets().forEach(function (off) {
      var o = document.createElement('option');
      o.value = String(off);
      o.textContent = label(off);
      if (defVal !== undefined && off === defVal) o.selected = true;
      el.appendChild(o);
    });
  }

  function fmtTime(mins) {
    mins = ((mins % 1440) + 1440) % 1440;
    var h = Math.floor(mins / 60);
    var m = Math.round(mins % 60);
    return ('0' + h).slice(-2) + ':' + ('0' + m).slice(-2);
  }

  function plan() {
    TN.clearErr(ERR);
    try {
      var mine = parseFloat(TN.el('meeting-planner-mine').value);
      var len = parseInt(TN.el('meeting-planner-len').value, 10);
      if (!isFinite(len) || len < 15 || len > 480) throw new Error('Meeting length must be 15–480 minutes.');
      var others = [];
      ['meeting-planner-z1', 'meeting-planner-z2', 'meeting-planner-z3', 'meeting-planner-z4'].forEach(function (id) {
        var v = TN.el(id).value;
        if (v !== '') others.push(parseFloat(v));
      });
      if (!others.length) throw new Error('Pick at least one other zone.');

      var zones = [{ off: mine, name: 'You (' + label(mine) + ')' }].concat(
        others.map(function (o, i) { return { off: o, name: label(o) }; })
      );

      var head = TN.el('meeting-planner-head');
      head.innerHTML = '';
      zones.forEach(function (z) {
        var th = document.createElement('th');
        th.textContent = z.name;
        head.appendChild(th);
      });

      var body = TN.el('meeting-planner-body');
      body.innerHTML = '';
      var good = 0;
      for (var start = 8 * 60; start + len <= 20 * 60; start += 60) {
        var tr = document.createElement('tr');
        var allOk = true;
        zones.forEach(function (z, zi) {
          var localStart = start + (z.off - mine) * 60;
          var localEnd = localStart + len;
          var normStart = ((localStart % 1440) + 1440) % 1440;
          var normEnd = ((localEnd % 1440) + 1440) % 1440;
          // Must not cross midnight and must fit 09:00–17:00
          var ok = normStart >= 9 * 60 && normEnd <= 17 * 60 && normEnd > normStart;
          if (!ok) allOk = false;
          var td = document.createElement('td');
          td.textContent = fmtTime(localStart) + '–' + fmtTime(localEnd);
          tr.appendChild(td);
        });
        if (allOk) {
          tr.style.background = 'rgba(46, 125, 50, 0.22)';
          good++;
        }
        body.appendChild(tr);
      }
      if (!body.children.length) throw new Error('No slots fit within your 08:00–20:00 window at that length.');
      if (!good) {
        var note = TN.el('meeting-planner-result').querySelector('.note');
        if (note) note.textContent = 'No slot fits 09:00–17:00 in every zone — try a shorter meeting or different zones.';
      }
    } catch (err) {
      TN.setErr(ERR, err && err.message ? err.message : 'Invalid input.');
    }
  }

  try {
    fillSelect(TN.el('meeting-planner-mine'), false, 5);
    fillSelect(TN.el('meeting-planner-z1'), true, 0);
    fillSelect(TN.el('meeting-planner-z2'), true, -5);
    fillSelect(TN.el('meeting-planner-z3'), true, 1);
    fillSelect(TN.el('meeting-planner-z4'), true, 8);
    TN.on('meeting-planner-go', 'click', plan);
  } catch (e) { /* never throw on load */ }
})();
