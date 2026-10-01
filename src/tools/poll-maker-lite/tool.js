(function () {
  'use strict';
  var ERR = 'poll-maker-lite-error';
  var KEY = 'tn_poll_lite';
  var poll = null;
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(poll)); } catch (e) {} }
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) poll = JSON.parse(raw);
    } catch (e) { poll = null; }
  }
  function addOptRow(v) {
    var box = TN.el('poll-opts');
    var d = document.createElement('div');
    d.style.cssText = 'display:flex;gap:8px;margin-bottom:8px;';
    d.innerHTML = '<input type="text" class="input poll-opt" placeholder="Option">' +
      '<button type="button" class="btn btn-danger btn-sm poll-opt-del" title="Remove">✕</button>';
    if (v) d.querySelector('.poll-opt').value = v;
    box.appendChild(d);
    d.querySelector('.poll-opt-del').addEventListener('click', function () { d.remove(); });
  }
  function showSetup() { TN.el('poll-setup').style.display = ''; TN.el('poll-live').style.display = 'none'; }
  function showLive() { TN.el('poll-setup').style.display = 'none'; TN.el('poll-live').style.display = ''; }
  function render() {
    TN.el('poll-title').textContent = poll.q;
    var total = poll.opts.reduce(function (a, o) { return a + o.votes; }, 0);
    TN.el('poll-total').textContent = total;
    var html = '';
    poll.opts.forEach(function (o, i) {
      var pct = total ? Math.round(o.votes / total * 100) : 0;
      html += '<button type="button" class="btn btn-outline poll-vote" data-i="' + i + '" style="display:block;width:100%;justify-content:flex-start;margin-bottom:8px;text-align:left">' +
        '<span style="flex:1">' + esc(o.text) + '</span><span class="muted">' + o.votes + ' (' + pct + '%)</span></button>' +
        '<div style="height:8px;background:rgba(255,255,255,.08);border-radius:99px;margin:-4px 0 12px;overflow:hidden">' +
        '<div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,#f23333,#c80f0f);border-radius:99px"></div></div>';
    });
    TN.el('poll-results').innerHTML = html;
    TN.qsa('#poll-results .poll-vote').forEach(function (b) {
      b.addEventListener('click', function () {
        poll.opts[parseInt(b.getAttribute('data-i'), 10)].votes++;
        save(); render();
      });
    });
  }
  try {
    load();
    addOptRow('Pizza'); addOptRow('Sushi');
    TN.on('poll-add', 'click', function () { addOptRow(''); });
    TN.on('poll-create', 'click', function () {
      TN.clearErr(ERR);
      var q = TN.el('poll-q').value.trim();
      var opts = TN.qsa('#poll-opts .poll-opt').map(function (el) { return el.value.trim(); }).filter(function (x) { return x; });
      if (!q) { TN.setErr(ERR, 'Type a poll question first.'); return; }
      if (opts.length < 2) { TN.setErr(ERR, 'Add at least two options.'); return; }
      poll = { q: q, opts: opts.map(function (t) { return { text: t, votes: 0 }; }) };
      save(); showLive(); render();
    });
    TN.on('poll-reset', 'click', function () {
      poll.opts.forEach(function (o) { o.votes = 0; });
      save(); render();
    });
    TN.on('poll-new', 'click', function () {
      poll = null; save(); showSetup();
    });
    if (poll && poll.opts) { showLive(); render(); }
  } catch (e) { /* never throw on load */ }
})();