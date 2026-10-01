(function () {
  'use strict';
  var P = 'regex-tester-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  function set(id, v) { var el = g(id); if (el) el.textContent = v; }
  function getFlags() {
    var out = '', boxes = document.querySelectorAll('#' + P + 'flags input[type="checkbox"]');
    for (var i = 0; i < boxes.length; i++) if (boxes[i].checked) out += boxes[i].value;
    return out;
  }
  function resetEmpty() {
    set('count', '0'); set('groups', '0');
    var hl = g('highlight'), dt = g('details');
    if (hl) { hl.textContent = 'Type something to test against.'; hl.className = 'rt-out muted'; }
    if (dt) { dt.textContent = 'No matches yet.'; dt.className = 'rt-out muted'; }
  }
  function test() {
    var patEl = g('pattern'), txtEl = g('text');
    if (!patEl || !txtEl) return;
    TN.clearErr(ERR);
    var pattern = patEl.value, text = txtEl.value, fl = getFlags(), re;
    try { re = new RegExp(pattern, fl); }
    catch (e) {
      TN.setErr(ERR, 'Invalid regular expression: ' + (e && e.message ? e.message : e));
      resetEmpty();
      return;
    }
    var gfl = fl.indexOf('g') === -1 ? fl + 'g' : fl, reG = re;
    try { reG = new RegExp(pattern, gfl); } catch (e) { reG = re; }
    var matches = [];
    try {
      var it = text.matchAll(reG), m;
      while ((m = it.next()) && !m.done) {
        matches.push(m.value);
        if (matches.length >= 200) break;
      }
    } catch (e) { matches = []; }
    set('count', String(matches.length));
    set('groups', String(matches.length ? matches[0].length - 1 : 0));
    var html = '', last = 0, i, mm, idx;
    for (i = 0; i < matches.length; i++) {
      mm = matches[i];
      idx = mm.index == null ? 0 : mm.index;
      html += TN.esc(text.slice(last, idx)) + '<mark>' + TN.esc(mm[0]) + '</mark>';
      last = idx + mm[0].length;
    }
    html += TN.esc(text.slice(last));
    var hl = g('highlight');
    if (hl) {
      if (!text) { hl.textContent = 'Type something to test against.'; hl.className = 'rt-out muted'; }
      else { hl.innerHTML = html; hl.className = 'rt-out'; }
    }
    var dt = g('details'), det = '', lim = Math.min(matches.length, 20), k;
    for (i = 0; i < lim; i++) {
      mm = matches[i];
      det += '<div class="rt-grp"><b>Match ' + (i + 1) + '</b> at index ' + mm.index + ': <code>' + TN.esc(mm[0]) + '</code>';
      if (mm.length > 1) {
        var gs = [];
        for (k = 1; k < mm.length; k++) gs.push('Group ' + k + ' = ' + (mm[k] === undefined ? '(did not participate)' : '"' + mm[k] + '"'));
        det += '<br>Groups: ' + TN.esc(gs.join('; '));
      }
      if (mm.groups) {
        var names = Object.keys(mm.groups), ng = [];
        for (k = 0; k < names.length; k++) ng.push(names[k] + '="' + mm.groups[names[k]] + '"');
        det += '<br>Named: ' + TN.esc(ng.join('; '));
      }
      det += '</div>';
    }
    if (matches.length > 20) det += '<p class="muted">Showing 20 of ' + matches.length + ' matches (capped at 200).</p>';
    if (dt) {
      if (!matches.length) { dt.textContent = 'No matches yet.'; dt.className = 'rt-out muted'; }
      else { dt.innerHTML = det; dt.className = 'rt-out'; }
    }
  }
  try {
    TN.on(P + 'pattern', 'input', test);
    TN.on(P + 'text', 'input', test);
    var boxes = document.querySelectorAll('#' + P + 'flags input[type="checkbox"]');
    for (var i = 0; i < boxes.length; i++) boxes[i].addEventListener('change', test);
  } catch (e) { /* never throw on load */ }
})();
