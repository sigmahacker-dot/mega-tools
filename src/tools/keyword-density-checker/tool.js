/* Keyword Density Checker — real text analysis, paste mode or URL fetch */
(function () {
  'use strict';
  var S = 'keyword-density-checker';

  var STOP = {
    the: 1, a: 1, an: 1, and: 1, or: 1, but: 1, of: 1, to: 1, in: 1, on: 1, for: 1,
    with: 1, as: 1, at: 1, by: 1, from: 1, is: 1, are: 1, was: 1, were: 1, be: 1,
    been: 1, being: 1, it: 1, its: 1, this: 1, that: 1, these: 1, those: 1, i: 1,
    you: 1, he: 1, she: 1, we: 1, they: 1, them: 1, his: 1, her: 1, our: 1, their: 1,
    your: 1, my: 1, not: 1, no: 1, so: 1, if: 1, then: 1, than: 1, too: 1, very: 1,
    can: 1, will: 1, just: 1, don: 1, doesn: 1, didn: 1, isn: 1, aren: 1, wasn: 1,
    has: 1, have: 1, had: 1, do: 1, does: 1, did: 1, all: 1, any: 1, each: 1,
    more: 1, most: 1, other: 1, some: 1, such: 1, only: 1, own: 1, same: 1,
    into: 1, over: 1, after: 1, before: 1, between: 1, through: 1, during: 1,
    about: 1, up: 1, out: 1, also: 1, how: 1, what: 1, when: 1, where: 1, which: 1,
    who: 1, whom: 1, why: 1, because: 1
  };

  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function flash(msg) {
    var el = TN.el(S + '-success');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('hidden');
    setTimeout(function () { el.classList.add('hidden'); }, 4000);
  }

  function analyze() {
    try {
      TN.clearErr(S + '-error');
      var textEl = TN.el(S + '-text');
      var kwEl = TN.el(S + '-keyword');
      var text = textEl ? textEl.value : '';
      var kw = kwEl ? kwEl.value.trim() : '';
      if (!text.trim()) {
        TN.setErr(S + '-error', 'Paste some text (or fetch a page URL) before analyzing.');
        return;
      }
      if (!kw) {
        TN.setErr(S + '-error', 'Enter a keyword or phrase to measure.');
        return;
      }

      var lower = text.toLowerCase();
      var words = lower.match(/[a-z0-9]+/g) || [];
      var total = words.length;
      var kwLower = kw.toLowerCase();
      var re = new RegExp('\\b' + escRe(kwLower) + '\\b', 'g');
      var matches = lower.match(re);
      var count = matches ? matches.length : 0;
      var density = total ? (count / total) * 100 : 0;

      var totalEl = TN.el(S + '-total');
      if (totalEl) totalEl.textContent = String(total);
      var countEl = TN.el(S + '-count');
      if (countEl) countEl.textContent = String(count);
      var densEl = TN.el(S + '-density');
      if (densEl) densEl.textContent = density.toFixed(2) + '%';
      TN.show(S + '-stats');

      var freq = {};
      words.forEach(function (w) {
        if (STOP[w]) return;
        freq[w] = (freq[w] || 0) + 1;
      });
      var rows = Object.keys(freq).map(function (w) {
        return { w: w, c: freq[w] };
      }).sort(function (a, b) { return b.c - a.c; }).slice(0, 10);

      var tbody = TN.qs('#' + S + '-table tbody');
      if (tbody) {
        if (!rows.length) {
          tbody.innerHTML = '<tr><td colspan="3">No significant words found.</td></tr>';
        } else {
          tbody.innerHTML = rows.map(function (r) {
            return '<tr><td>' + TN.esc(r.w) + '</td><td>' + r.c + '</td><td>' +
              (total ? ((r.c / total) * 100).toFixed(2) : '0.00') + '%</td></tr>';
          }).join('');
        }
      }
      TN.show(S + '-output');
    } catch (err) {
      TN.setErr(S + '-error', 'Something went wrong while analyzing the text.');
    }
  }

  function fetchUrl() {
    TN.clearErr(S + '-error');
    var urlEl = TN.el(S + '-url');
    var raw = urlEl ? urlEl.value.trim() : '';
    if (!raw) {
      TN.setErr(S + '-error', 'Enter a page URL to fetch, or paste the text above.');
      return;
    }
    var target;
    try {
      target = new URL(raw);
      if (target.protocol !== 'http:' && target.protocol !== 'https:') throw new Error('bad');
    } catch (e) {
      TN.setErr(S + '-error', 'That is not a valid http(s) page URL.');
      return;
    }
    var btn = TN.el(S + '-fetch');
    if (btn) btn.disabled = true;
    fetch(target.toString())
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
      })
      .then(function (html) {
        var text = '';
        try {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var scr = doc.querySelectorAll('script,style,noscript');
          for (var i = 0; i < scr.length; i++) scr[i].parentNode.removeChild(scr[i]);
          text = doc.body ? doc.body.textContent : '';
        } catch (e) {
          text = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ');
        }
        text = text.replace(/\s+/g, ' ').trim().slice(0, 200000);
        if (!text) throw new Error('empty');
        var textEl = TN.el(S + '-text');
        if (textEl) textEl.value = text;
        flash('Loaded ' + text.length.toLocaleString() + ' characters — click Analyze.');
      })
      .catch(function () {
        TN.setErr(S + '-error', 'Could not fetch that page (likely blocked by the site\u2019s CORS policy). Copy the page text and paste it above instead.');
      })
      .then(function () { if (btn) btn.disabled = false; });
  }

  function init() {
    try {
      TN.on(S + '-analyze', 'click', analyze);
      TN.on(S + '-fetch', 'click', fetchUrl);
    } catch (err) { /* never throw on load */ }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
