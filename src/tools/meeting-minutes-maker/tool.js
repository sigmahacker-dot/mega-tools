/* Meeting Minutes Maker — structured minutes: attendees, decisions, actions. */
(function () {
  'use strict';
  var SLUG = 'meeting-minutes-maker';
  var decisions = [], points = [], actions = [];

  function row(text, arr, i) {
    var r = document.createElement('div');
    r.className = 'copy-row mt';
    var d = document.createElement('div');
    d.className = 'result';
    d.style.flex = '1';
    d.textContent = text;
    var del = document.createElement('button');
    del.className = 'btn btn-outline btn-sm';
    del.type = 'button';
    del.textContent = '✕';
    del.setAttribute('aria-label', 'Remove');
    del.addEventListener('click', function () { arr.splice(i, 1); render(); });
    r.appendChild(d);
    r.appendChild(del);
    return r;
  }

  function render() {
    var list = TN.el(SLUG + '-list');
    list.innerHTML = '';
    function section(title, arr, fmt) {
      if (!arr.length) return;
      var h = document.createElement('div');
      h.style.cssText = 'font-weight:700;margin:12px 0 4px';
      h.textContent = title;
      list.appendChild(h);
      arr.forEach(function (it, i) { list.appendChild(row(fmt(it), arr, i)); });
    }
    section('Decisions', decisions, function (d) { return d; });
    section('Discussion points', points, function (p) { return p; });
    section('Action items', actions, function (a) {
      return a.text + '  — Owner: ' + a.owner + (a.due ? ', Due: ' + a.due : '');
    });
  }

  function minutesText() {
    var title = TN.el(SLUG + '-title').value.trim() || 'Meeting Minutes';
    var date = TN.el(SLUG + '-date').value || '[date]';
    var att = TN.el(SLUG + '-attendees').value.trim() || '[attendees]';
    var L = ['MINUTES: ' + title, 'Date: ' + date, 'Attendees: ' + att, ''];
    if (decisions.length) {
      L.push('DECISIONS:');
      decisions.forEach(function (d, i) { L.push((i + 1) + '. ' + d); });
      L.push('');
    }
    if (points.length) {
      L.push('DISCUSSION POINTS:');
      points.forEach(function (p, i) { L.push((i + 1) + '. ' + p); });
      L.push('');
    }
    if (actions.length) {
      L.push('ACTION ITEMS:');
      actions.forEach(function (a, i) { L.push((i + 1) + '. ' + a.text + ' — Owner: ' + a.owner + (a.due ? ', Due: ' + a.due : '')); });
      L.push('');
    }
    return L.join('\n');
  }

  function init() {
    if (!TN.el(SLUG + '-add-decision')) return;
    render();
    TN.on(SLUG + '-add-decision', 'click', function () {
      var v = TN.el(SLUG + '-decision').value.trim();
      if (!v) { TN.setErr(SLUG + '-error', 'Type a decision first.'); return; }
      TN.clearErr(SLUG + '-error');
      decisions.push(v); TN.el(SLUG + '-decision').value = ''; render();
    });
    TN.on(SLUG + '-add-point', 'click', function () {
      var v = TN.el(SLUG + '-point').value.trim();
      if (!v) { TN.setErr(SLUG + '-error', 'Type a discussion point first.'); return; }
      TN.clearErr(SLUG + '-error');
      points.push(v); TN.el(SLUG + '-point').value = ''; render();
    });
    TN.on(SLUG + '-add-action', 'click', function () {
      var t = TN.el(SLUG + '-action').value.trim();
      var o = TN.el(SLUG + '-owner').value.trim();
      if (!t) { TN.setErr(SLUG + '-error', 'Type an action item first.'); return; }
      if (!o) { TN.setErr(SLUG + '-error', 'Every action item needs an owner.'); return; }
      TN.clearErr(SLUG + '-error');
      actions.push({ text: t, owner: o, due: TN.el(SLUG + '-due').value });
      TN.el(SLUG + '-action').value = ''; TN.el(SLUG + '-owner').value = ''; TN.el(SLUG + '-due').value = '';
      render();
    });
    TN.on(SLUG + '-copy', 'click', function () {
      if (!decisions.length && !points.length && !actions.length) { TN.setErr(SLUG + '-error', 'Add at least one entry first.'); return; }
      var btn = TN.el(SLUG + '-copy');
      TN.copy(minutesText()).then(function (ok) {
        btn.textContent = ok ? 'Copied ✓' : 'Copy Minutes';
        setTimeout(function () { btn.textContent = 'Copy Minutes'; }, 1200);
      });
    });
    TN.on(SLUG + '-download', 'click', function () {
      if (!decisions.length && !points.length && !actions.length) { TN.setErr(SLUG + '-error', 'Add at least one entry first.'); return; }
      TN.downloadText(minutesText(), 'meeting-minutes.txt', 'text/plain');
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
