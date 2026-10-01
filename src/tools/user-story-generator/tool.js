/* User Story Generator — "As a… I want… so that…" + Given/When/Then criteria. */
(function () {
  'use strict';
  var SLUG = 'user-story-generator';
  var criteria = [];
  var current = '';

  function render() {
    var list = TN.el(SLUG + '-list');
    list.innerHTML = '';
    criteria.forEach(function (c, i) {
      var row = document.createElement('div');
      row.className = 'copy-row mt';
      var d = document.createElement('div');
      d.className = 'result';
      d.style.flex = '1';
      d.textContent = (i + 1) + '. ' + c;
      var del = document.createElement('button');
      del.className = 'btn btn-outline btn-sm';
      del.type = 'button';
      del.textContent = '✕';
      del.setAttribute('aria-label', 'Remove criterion');
      del.addEventListener('click', function () { criteria.splice(i, 1); render(); });
      row.appendChild(d);
      row.appendChild(del);
      list.appendChild(row);
    });
    if (!criteria.length) list.innerHTML = '<p class="muted">No acceptance criteria yet — add at least one.</p>';
  }

  function build() {
    var role = TN.el(SLUG + '-role').value.trim();
    var goal = TN.el(SLUG + '-goal').value.trim();
    var benefit = TN.el(SLUG + '-benefit').value.trim();
    if (!role || !goal || !benefit) return null;
    var points = TN.el(SLUG + '-points').value;
    var priority = TN.el(SLUG + '-priority').value;
    var L = [];
    L.push('USER STORY');
    L.push('As a ' + role + ',');
    L.push('I want ' + goal + ',');
    L.push('so that ' + benefit + '.');
    L.push('');
    L.push('Story points: ' + points + ' | Priority: ' + priority);
    L.push('');
    L.push('ACCEPTANCE CRITERIA:');
    if (criteria.length) {
      criteria.forEach(function (c, i) { L.push((i + 1) + '. ' + c); });
    } else {
      L.push('[add acceptance criteria above]');
    }
    return L.join('\n');
  }

  function init() {
    if (!TN.el(SLUG + '-go')) return;
    render();
    TN.on(SLUG + '-add', 'click', function () {
      var v = TN.el(SLUG + '-ac').value.trim();
      if (!v) { TN.setErr(SLUG + '-error', 'Type an acceptance criterion first.'); return; }
      TN.clearErr(SLUG + '-error');
      criteria.push(v);
      TN.el(SLUG + '-ac').value = '';
      render();
    });
    TN.on(SLUG + '-go', 'click', function () {
      TN.clearErr(SLUG + '-error');
      var s = build();
      if (!s) { TN.setErr(SLUG + '-error', 'Please fill in the role, goal, and benefit.'); return; }
      current = s;
      TN.el(SLUG + '-output').textContent = current;
    });
    TN.on(SLUG + '-copy', 'click', function () {
      if (!current) { TN.setErr(SLUG + '-error', 'Build your user story first.'); return; }
      var btn = TN.el(SLUG + '-copy');
      TN.copy(current).then(function (ok) {
        btn.textContent = ok ? 'Copied ✓' : 'Copy';
        setTimeout(function () { btn.textContent = 'Copy'; }, 1200);
      });
    });
    TN.on(SLUG + '-download', 'click', function () {
      if (!current) { TN.setErr(SLUG + '-error', 'Build your user story first.'); return; }
      TN.downloadText(current, 'user-story.txt', 'text/plain');
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
