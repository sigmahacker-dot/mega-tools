/* HowTo Schema Generator — steps → HowTo JSON-LD. */
(function () {
  'use strict';

  var SLUG = 'howto-schema-generator';
  var steps = [];
  var lastJson = '';

  function v(id) { return TN.el(SLUG + '-' + id).value.trim(); }

  function renderSteps() {
    var box = TN.el(SLUG + '-steps');
    if (!steps.length) { box.innerHTML = '<p class="muted">No steps yet.</p>'; return; }
    box.innerHTML = steps.map(function (s, i) {
      return '<div class="tool-card" style="margin:6px 0"><strong>Step ' + (i + 1) + ': ' + TN.esc(s.name) + '</strong>' +
        (s.text ? '<p class="muted" style="margin:4px 0">' + TN.esc(s.text) + '</p>' : '') +
        '<p class="muted" style="margin:0">' +
        (s.mins ? '⏱ ' + s.mins + ' min ' : '') +
        (s.img ? '🖼 image attached' : '') + '</p>' +
        '<button class="btn btn-sm btn-outline" data-del="' + i + '" style="margin-top:6px">Remove</button></div>';
    }).join('');
    var dels = box.querySelectorAll('[data-del]');
    for (var i = 0; i < dels.length; i++) {
      (function (b) {
        b.addEventListener('click', function () {
          steps.splice(parseInt(b.getAttribute('data-del'), 10), 1);
          renderSteps();
        });
      })(dels[i]);
    }
  }

  function add() {
    TN.clearErr(SLUG + '-error');
    var name = v('sname');
    var text = v('stext');
    var mins = parseInt(v('smins'), 10);
    var img = v('simg');
    if (!name) { TN.setErr(SLUG + '-error', 'Enter a step name.'); return; }
    steps.push({ name: name, text: text, mins: isNaN(mins) ? 0 : mins, img: img });
    TN.el(SLUG + '-sname').value = '';
    TN.el(SLUG + '-stext').value = '';
    TN.el(SLUG + '-smins').value = '';
    TN.el(SLUG + '-simg').value = '';
    renderSteps();
  }

  function generate() {
    TN.clearErr(SLUG + '-error');
    if (!v('name')) { TN.setErr(SLUG + '-error', 'Enter the how-to name.'); return; }
    if (!steps.length) { TN.setErr(SLUG + '-error', 'Add at least one step first.'); return; }
    var obj = {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: v('name')
    };
    if (v('desc')) obj.description = v('desc');
    if (v('time')) obj.totalTime = v('time');
    obj.step = steps.map(function (s, i) {
      var st = { '@type': 'HowToStep', position: i + 1, name: s.name };
      if (s.text) st.text = s.text;
      if (s.mins) st.performTime = 'PT' + s.mins + 'M';
      if (s.img) st.image = s.img;
      return st;
    });
    lastJson = JSON.stringify(obj, null, 2);
    TN.el(SLUG + '-out').textContent = lastJson;
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-add')) return;
      TN.on(SLUG + '-add', 'click', add);
      TN.on(SLUG + '-gen', 'click', generate);
      TN.on(SLUG + '-clear', 'click', function () { steps = []; renderSteps(); });
      TN.on(SLUG + '-copy', 'click', function () {
        if (!lastJson) { TN.setErr(SLUG + '-error', 'Generate the schema first.'); return; }
        TN.copy(lastJson).catch(function () { TN.setErr(SLUG + '-error', 'Copy failed — select the text manually.'); });
      });
      TN.on(SLUG + '-dl', 'click', function () {
        if (!lastJson) { TN.setErr(SLUG + '-error', 'Generate the schema first.'); return; }
        TN.downloadText(lastJson, 'howto-schema.json', 'application/ld+json');
      });
      renderSteps();
    } catch (e) { /* never throw on load */ }
  }

  init();
})();