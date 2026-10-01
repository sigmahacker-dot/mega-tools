/* Meeting Agenda Generator — timed agenda items, live total, copy/download. */
(function () {
  'use strict';
  var SLUG = 'meeting-agenda-generator';
  var items = [];

  function fmtTotal(mins) {
    if (mins < 60) return mins + ' min';
    var h = Math.floor(mins / 60), m = mins % 60;
    return h + 'h' + (m ? ' ' + m + 'm' : '');
  }

  function render() {
    var list = TN.el(SLUG + '-list');
    list.innerHTML = '';
    var total = 0;
    items.forEach(function (it, i) {
      total += it.mins;
      var row = document.createElement('div');
      row.className = 'copy-row mt';
      var res = document.createElement('div');
      res.className = 'result';
      res.style.flex = '1';
      res.textContent = (i + 1) + '. ' + it.title + (it.owner ? '  (' + it.owner + ')' : '') + '  — ' + it.mins + ' min';
      var del = document.createElement('button');
      del.className = 'btn btn-outline btn-sm';
      del.type = 'button';
      del.textContent = '✕';
      del.setAttribute('aria-label', 'Remove item');
      del.addEventListener('click', function () { items.splice(i, 1); render(); });
      row.appendChild(res);
      row.appendChild(del);
      list.appendChild(row);
    });
    if (!items.length) list.innerHTML = '<p class="muted">No items yet — add your first agenda item above.</p>';
    TN.el(SLUG + '-total').textContent = fmtTotal(total);
  }

  function agendaText() {
    var title = TN.el(SLUG + '-title').value.trim() || 'Meeting Agenda';
    var date = TN.el(SLUG + '-date').value || '[date]';
    var L = ['AGENDA: ' + title, 'Date: ' + date, ''];
    var total = 0, t = 0;
    items.forEach(function (it, i) {
      total += it.mins;
      L.push((i + 1) + '. ' + it.title + (it.owner ? ' [' + it.owner + ']' : '') + ' — ' + it.mins + ' min');
      t += it.mins;
    });
    L.push('');
    L.push('Total: ' + fmtTotal(total));
    return L.join('\n');
  }

  function init() {
    if (!TN.el(SLUG + '-add')) return;
    render();
    TN.on(SLUG + '-add', 'click', function () {
      try {
        TN.clearErr(SLUG + '-error');
        var title = TN.el(SLUG + '-item').value.trim();
        var owner = TN.el(SLUG + '-owner').value.trim();
        var mins = parseInt(TN.el(SLUG + '-mins').value, 10);
        if (!title) { TN.setErr(SLUG + '-error', 'Please enter an item title.'); return; }
        if (!mins || mins < 1 || mins > 480) { TN.setErr(SLUG + '-error', 'Duration must be 1–480 minutes.'); return; }
        items.push({ title: title, owner: owner, mins: mins });
        TN.el(SLUG + '-item').value = '';
        TN.el(SLUG + '-owner').value = '';
        render();
        TN.el(SLUG + '-item').focus();
      } catch (e) { TN.setErr(SLUG + '-error', 'Could not add the item. Please try again.'); }
    });
    TN.on(SLUG + '-copy', 'click', function () {
      if (!items.length) { TN.setErr(SLUG + '-error', 'Add at least one agenda item first.'); return; }
      var btn = TN.el(SLUG + '-copy');
      TN.copy(agendaText()).then(function (ok) {
        btn.textContent = ok ? 'Copied ✓' : 'Copy Agenda';
        setTimeout(function () { btn.textContent = 'Copy Agenda'; }, 1200);
      });
    });
    TN.on(SLUG + '-download', 'click', function () {
      if (!items.length) { TN.setErr(SLUG + '-error', 'Add at least one agenda item first.'); return; }
      TN.downloadText(agendaText(), 'meeting-agenda.txt', 'text/plain');
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
