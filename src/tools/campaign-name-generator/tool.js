(function () {
  'use strict';
  var P = 'campaign-name-generator-', ERR = P + 'error';
  function clean(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ').trim();
  }
  function render() {
    try {
      TN.clearErr(ERR);
      var brand = clean(TN.el(P + 'brand').value), camp = clean(TN.el(P + 'campaign').value);
      var channel = TN.el(P + 'channel').value;
      var date = (TN.el(P + 'date').value || '').replace(/-/g, '');
      var body = TN.el(P + 'body');
      if (!brand || !camp) {
        body.innerHTML = '<tr><td colspan="3" class="muted">Enter brand and campaign to generate names.</td></tr>';
        return;
      }
      var parts = [brand, camp, channel].concat(date ? [date] : []);
      var names = [
        ['snake_case', parts.join('_')],
        ['kebab-case', parts.join('-')],
        ['Title Case', parts.map(function (p) { return p.split(' ').map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' '); }).join(' ')],
        ['UTM (utm_campaign)', parts.join('_')]
      ];
      body.innerHTML = names.map(function (n, i) {
        return '<tr><td>' + n[0] + '</td><td><code>' + TN.esc(n[1]) + '</code></td>' +
          '<td><button type="button" class="btn btn-outline btn-sm" data-i="' + i + '">Copy</button></td></tr>';
      }).join('');
      var btns = body.querySelectorAll('button[data-i]');
      for (var i = 0; i < btns.length; i++) {
        (function (b) {
          TN.on(b, 'click', function () {
            TN.copy(names[parseInt(b.getAttribute('data-i'), 10)][1]).then(function () {
              b.textContent = 'Copied';
              setTimeout(function () { b.textContent = 'Copy'; }, 1000);
            });
          });
        })(btns[i]);
      }
    } catch (e) { TN.setErr(ERR, 'Could not generate names. Please try again.'); }
  }
  try {
    ['brand', 'campaign', 'channel', 'date'].forEach(function (k) {
      TN.on(P + k, 'input', TN.debounce(render, 150));
      TN.on(P + k, 'change', render);
    });
    render();
  } catch (e) { /* never throw on load */ }
})();
