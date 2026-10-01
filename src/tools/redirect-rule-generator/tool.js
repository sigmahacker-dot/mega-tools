(function () {
  'use strict';
  var S = 'redirect-rule-generator';
  var TABS = ['apache', 'nginx', 'html', 'js'];
  var LABELS = { apache: 'Apache .htaccess', nginx: 'Nginx', html: 'HTML', js: 'JavaScript' };
  var active = 'apache';

  function escApache(s) { return s.replace(/"/g, '\\"'); }
  function escNginxPath(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function escHtml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function escJs(s) { return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n'); }

  function parse() {
    var raw = TN.el(S + '-input').value || '';
    var lines = raw.split('\n');
    var rules = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;
      var idx = line.indexOf('->');
      if (idx < 0) throw new Error('Line ' + (i + 1) + ': use the format  old-path -> new-url');
      var old = line.slice(0, idx).trim();
      var to = line.slice(idx + 2).trim();
      if (!old) throw new Error('Line ' + (i + 1) + ': the old path is empty.');
      if (!to) throw new Error('Line ' + (i + 1) + ': the new URL is empty.');
      if (old[0] !== '/') throw new Error('Line ' + (i + 1) + ': the old path must start with /');
      if (!/^https?:\/\//i.test(to)) throw new Error('Line ' + (i + 1) + ': the new URL must start with http:// or https://');
      rules.push({ old: old, to: to });
    }
    if (!rules.length) throw new Error('Enter at least one redirect line first.');
    return rules;
  }

  function generate() {
    try {
      TN.clearErr(S + '-error');
      var rules = parse();
      var apache = '', nginx = '', html = '', js = '';
      rules.forEach(function (r) {
        apache += 'Redirect 301 "' + escApache(r.old) + '" "' + escApache(r.to) + '"\n';
        nginx += 'rewrite ^' + escNginxPath(r.old) + '$ ' + r.to + ' permanent;\n';
        html += '<!-- ' + r.old + ' -->\n<meta http-equiv="refresh" content="0; url=' + escHtml(r.to) + '">\n';
        js += '// ' + r.old + '\nwindow.location.replace("' + escJs(r.to) + '");\n';
      });
      TN.el(S + '-out-apache').textContent = apache.replace(/\n$/, '');
      TN.el(S + '-out-nginx').textContent = nginx.replace(/\n$/, '');
      TN.el(S + '-out-html').textContent = html.replace(/\n$/, '');
      TN.el(S + '-out-js').textContent = js.replace(/\n$/, '');
    } catch (e) {
      TN.setErr(S + '-error', e && e.message ? e.message : 'Could not generate redirects.');
    }
  }

  function switchTab(tab) {
    active = tab;
    TABS.forEach(function (t) {
      TN.el(S + '-out-' + t).classList.toggle('hidden', t !== tab);
    });
    TN.el(S + '-out-label').textContent = LABELS[tab];
    var btns = document.querySelectorAll('[data-tab]');
    for (var i = 0; i < btns.length; i++) {
      var on = btns[i].getAttribute('data-tab') === tab;
      btns[i].classList.toggle('btn-primary', on);
      btns[i].classList.toggle('btn-outline', !on);
    }
  }

  function copyTab() {
    try {
      var text = TN.el(S + '-out-' + active).textContent || '';
      if (!text) { TN.setErr(S + '-error', 'Generate redirects first.'); return; }
      TN.copy(text).then(function (ok) {
        if (!ok) TN.setErr(S + '-error', 'Copy failed — select the text and copy it manually.');
        else TN.clearErr(S + '-error');
      });
    } catch (e) { TN.setErr(S + '-error', 'Copy failed.'); }
  }

  function init() {
    TN.on(S + '-generate', 'click', generate);
    TN.on(S + '-copy', 'click', copyTab);
    var btns = document.querySelectorAll('[data-tab]');
    for (var i = 0; i < btns.length; i++) {
      (function (b) {
        b.addEventListener('click', function () { switchTab(b.getAttribute('data-tab')); });
      })(btns[i]);
    }
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
