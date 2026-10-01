/* Regex Cheat Sheet — searchable token table + live tester with <mark> highlights. */
(function () {
  'use strict';
  var SLUG = 'regex-cheat-sheet';
  var GROUPS = [
    ['Anchors', [
      ['^', 'Start of string (or line with m)'],
      ['$', 'End of string (or line with m)'],
      ['\\b', 'Word boundary'],
      ['\\B', 'Not a word boundary']
    ]],
    ['Character classes', [
      ['.', 'Any character except newline'],
      ['\\d', 'Digit [0-9]'],
      ['\\D', 'Non-digit'],
      ['\\w', 'Word char [A-Za-z0-9_]'],
      ['\\W', 'Non-word char'],
      ['\\s', 'Whitespace'],
      ['\\S', 'Non-whitespace'],
      ['[abc]', 'One of a, b, c'],
      ['[^abc]', 'Anything but a, b, c'],
      ['[a-z]', 'Range a to z']
    ]],
    ['Quantifiers', [
      ['*', '0 or more (greedy)'],
      ['+', '1 or more (greedy)'],
      ['?', '0 or 1'],
      ['{n}', 'Exactly n'],
      ['{n,}', 'n or more'],
      ['{n,m}', 'Between n and m'],
      ['*?', '+?', 'Lazy versions of * and +']
    ]],
    ['Groups & alternation', [
      ['(abc)', 'Capture group'],
      ['(?:abc)', 'Non-capturing group'],
      ['(?<name>abc)', 'Named capture group'],
      ['a|b', 'a or b'],
      ['\\1', 'Backreference to group 1']
    ]],
    ['Lookaround', [
      ['(?=abc)', 'Positive lookahead'],
      ['(?!abc)', 'Negative lookahead'],
      ['(?<=abc)', 'Positive lookbehind'],
      ['(?<!abc)', 'Negative lookbehind']
    ]],
    ['Escapes', [
      ['\\', 'Escape a special char'],
      ['\\n \\t \\r', 'Newline, tab, carriage return'],
      ['\\u00A9', 'Unicode escape (©)'],
      ['\\p{L}', 'Unicode property (letter), needs u flag']
    ]]
  ];

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }
  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function test() {
    clear();
    TN.hide(SLUG + '-result');
    var pattern = el(SLUG + '-pattern').value;
    var text = el(SLUG + '-text').value;
    if (!pattern) return;
    var flags = (el(SLUG + '-g').checked ? 'g' : '') +
                (el(SLUG + '-i').checked ? 'i' : '') +
                (el(SLUG + '-m').checked ? 'm' : '');
    var re;
    try { re = new RegExp(pattern, flags); }
    catch (e) { fail('Invalid pattern: ' + e.message); return; }
    // collect matches with indices
    var matches = [];
    if (flags.indexOf('g') >= 0) {
      var m;
      re.lastIndex = 0;
      while ((m = re.exec(text)) !== null) {
        matches.push(m);
        if (m[0] === '') re.lastIndex++; // avoid infinite loop on empty match
      }
    } else {
      var s = re.exec(text);
      if (s) matches.push(s);
    }
    // highlight via <mark>
    var html = '', last = 0;
    matches.forEach(function (m, i) {
      html += esc(text.slice(last, m.index));
      html += '<mark data-i="' + i + '">' + esc(m[0] || '∅') + '</mark>';
      last = m.index + m[0].length;
    });
    html += esc(text.slice(last));
    el(SLUG + '-matches').innerHTML = html || '<span class="muted">No matches.</span>';
    // groups
    var gh = el(SLUG + '-groups');
    gh.innerHTML = '';
    if (!matches.length) {
      gh.innerHTML = '<span class="muted">No matches.</span>';
    } else {
      matches.forEach(function (m, mi) {
        if (m.length <= 1) return;
        var p = document.createElement('p');
        p.innerHTML = '<strong>Match ' + (mi + 1) + '</strong> <code class="code">' + esc(m[0]) + '</code>';
        gh.appendChild(p);
        var ul = document.createElement('ul');
        for (var g = 1; g < m.length; g++) {
          var li = document.createElement('li');
          li.innerHTML = 'Group ' + g + ': <code class="code">' + esc(String(m[g])) + '</code>';
          ul.appendChild(li);
        }
        gh.appendChild(ul);
      });
      if (!gh.children.length) gh.innerHTML = '<span class="muted">No capture groups in this pattern.</span>';
    }
    TN.show(SLUG + '-result');
  }

  function renderTable(filter) {
    var host = el(SLUG + '-table');
    host.innerHTML = '';
    var q = (filter || '').toLowerCase().trim();
    var shown = 0;
    GROUPS.forEach(function (g) {
      var items = g[1].filter(function (it) {
        return !q || it[0].toLowerCase().indexOf(q) >= 0 || it[1].toLowerCase().indexOf(q) >= 0;
      });
      if (!items.length) return;
      shown += items.length;
      var h = document.createElement('h3');
      h.textContent = g[0];
      h.style.margin = '18px 0 8px';
      host.appendChild(h);
      var table = document.createElement('table');
      table.className = 'data';
      var tb = document.createElement('tbody');
      items.forEach(function (it) {
        var tr = document.createElement('tr');
        var td1 = document.createElement('td');
        td1.innerHTML = '<code class="code">' + esc(it[0]) + '</code>';
        var td2 = document.createElement('td');
        td2.textContent = it[1];
        tr.appendChild(td1);
        tr.appendChild(td2);
        tb.appendChild(tr);
      });
      table.appendChild(tb);
      host.appendChild(table);
    });
    el(SLUG + '-none').classList.toggle('hidden', shown > 0);
  }

  try {
    var deb = TN.debounce(test, 250);
    TN.on(SLUG + '-pattern', 'input', deb);
    TN.on(SLUG + '-text', 'input', deb);
    TN.on(SLUG + '-g', 'change', test);
    TN.on(SLUG + '-i', 'change', test);
    TN.on(SLUG + '-m', 'change', test);
    TN.on(SLUG + '-search', 'input', TN.debounce(function () {
      renderTable(el(SLUG + '-search').value);
    }, 150));
    renderTable('');
  } catch (e) { /* never throw on load */ }
})();
