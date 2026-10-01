/* VS Code Shortcut Reference — 60+ shortcuts, Windows/macOS toggle, searchable. */
(function () {
  'use strict';
  var SLUG = 'vscode-shortcut-reference';
  var os = 'win';
  // [action, windows binding, mac binding]
  var GROUPS = [
    ['General', [
      ['Command Palette', 'Ctrl+Shift+P', 'Cmd+Shift+P'],
      ['Quick Open file', 'Ctrl+P', 'Cmd+P'],
      ['Toggle sidebar', 'Ctrl+B', 'Cmd+B'],
      ['Toggle panel', 'Ctrl+J', 'Cmd+J'],
      ['Toggle fullscreen', 'F11', 'Ctrl+Cmd+F'],
      ['Split editor right', 'Ctrl+\\', 'Cmd+\\'],
      ['Focus next editor group', 'Ctrl+1 / Ctrl+2', 'Cmd+1 / Cmd+2'],
      ['Close editor', 'Ctrl+W', 'Cmd+W'],
      ['Close all editors', 'Ctrl+K Ctrl+W', 'Cmd+K Cmd+W'],
      ['New window', 'Ctrl+Shift+N', 'Cmd+Shift+N'],
      ['Settings', 'Ctrl+,', 'Cmd+,'],
      ['Keyboard shortcuts', 'Ctrl+K Ctrl+S', 'Cmd+K Cmd+S']
    ]],
    ['Editing', [
      ['Undo / Redo', 'Ctrl+Z / Ctrl+Y', 'Cmd+Z / Cmd+Shift+Z'],
      ['Cut line', 'Ctrl+X', 'Cmd+X'],
      ['Copy line down', 'Shift+Alt+Down', 'Shift+Option+Down'],
      ['Move line up/down', 'Alt+Up / Alt+Down', 'Option+Up / Option+Down'],
      ['Delete line', 'Ctrl+Shift+K', 'Cmd+Shift+K'],
      ['Comment line', 'Ctrl+/', 'Cmd+/'],
      ['Block comment', 'Shift+Alt+A', 'Shift+Option+A'],
      ['Indent / outdent', 'Ctrl+] / Ctrl+[', 'Cmd+] / Cmd+['],
      ['Toggle word wrap', 'Alt+Z', 'Option+Z'],
      ['Format document', 'Shift+Alt+F', 'Shift+Option+F'],
      ['Rename symbol', 'F2', 'F2'],
      ['Trigger suggestion', 'Ctrl+Space', 'Ctrl+Space'],
      ['Trigger parameter hints', 'Ctrl+Shift+Space', 'Cmd+Shift+Space'],
      ['Go to definition', 'F12', 'F12'],
      ['Peek definition', 'Alt+F12', 'Option+F12'],
      ['Show references', 'Shift+F12', 'Shift+F12']
    ]],
    ['Navigation', [
      ['Go to file…', 'Ctrl+P', 'Cmd+P'],
      ['Go to symbol…', 'Ctrl+Shift+O', 'Cmd+Shift+O'],
      ['Go to line…', 'Ctrl+G', 'Ctrl+G'],
      ['Go back / forward', 'Alt+Left / Alt+Right', 'Ctrl+- / Ctrl+Shift+-'],
      ['Go to bracket', 'Ctrl+Shift+\\', 'Cmd+Shift+\\'],
      ['Fold / unfold', 'Ctrl+Shift+[ / ]', 'Cmd+Option+[ / ]'],
      ['Fold all', 'Ctrl+K Ctrl+0', 'Cmd+K Cmd+0'],
      ['Unfold all', 'Ctrl+K Ctrl+J', 'Cmd+K Cmd+J']
    ]],
    ['Search', [
      ['Find', 'Ctrl+F', 'Cmd+F'],
      ['Find in files', 'Ctrl+Shift+F', 'Cmd+Shift+F'],
      ['Replace', 'Ctrl+H', 'Cmd+Option+F'],
      ['Find next / previous', 'F3 / Shift+F3', 'Cmd+G / Cmd+Shift+G'],
      ['Select all occurrences', 'Ctrl+Shift+L', 'Cmd+Shift+L']
    ]],
    ['Multi-cursor', [
      ['Add cursor above/below', 'Ctrl+Alt+Up/Down', 'Cmd+Option+Up/Down'],
      ['Add next occurrence', 'Ctrl+D', 'Cmd+D'],
      ['Add cursors to line ends', 'Shift+Alt+I', 'Shift+Option+I'],
      ['Undo last cursor', 'Ctrl+U', 'Cmd+U']
    ]],
    ['Terminal', [
      ['New terminal', 'Ctrl+Shift+`', 'Ctrl+Shift+`'],
      ['Toggle terminal', 'Ctrl+`', 'Ctrl+`'],
      ['Kill active terminal', 'trash icon in terminal panel', 'trash icon in terminal panel'],
      ['Run selected text', 'Ctrl+Shift+P → Run Selection', 'Cmd+Shift+P → Run Selection']
    ]],
    ['Debugging', [
      ['Start debugging', 'F5', 'F5'],
      ['Step over', 'F10', 'F10'],
      ['Step into', 'F11', 'F11'],
      ['Step out', 'Shift+F11', 'Shift+F11'],
      ['Toggle breakpoint', 'F9', 'F9'],
      ['Continue', 'F5', 'F5'],
      ['Stop', 'Shift+F5', 'Shift+F5']
    ]]
  ];

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }

  function setOs(v) {
    os = v;
    el(SLUG + '-win').className = 'btn ' + (os === 'win' ? 'btn-primary' : 'btn-outline');
    el(SLUG + '-mac').className = 'btn ' + (os === 'mac' ? 'btn-primary' : 'btn-outline');
    render(el(SLUG + '-search').value);
  }

  function render(filter) {
    var host = el(SLUG + '-list');
    host.innerHTML = '';
    var q = (filter || '').toLowerCase().trim();
    var shown = 0;
    GROUPS.forEach(function (g) {
      var items = g[1].filter(function (it) {
        var keys = os === 'win' ? it[1] : it[2];
        return !q || it[0].toLowerCase().indexOf(q) >= 0 || keys.toLowerCase().indexOf(q) >= 0;
      });
      if (!items.length) return;
      shown += items.length;
      var h = document.createElement('h3');
      h.textContent = g[0];
      h.style.margin = '18px 0 8px';
      host.appendChild(h);
      items.forEach(function (it) {
        var keys = os === 'win' ? it[1] : it[2];
        var row = document.createElement('div');
        row.className = 'copy-row';
        row.style.cssText = 'margin-bottom:8px;cursor:pointer';
        row.title = 'Click to copy';
        var code = document.createElement('code');
        code.className = 'code';
        code.style.flex = '1';
        code.textContent = keys;
        var desc = document.createElement('span');
        desc.className = 'muted';
        desc.style.cssText = 'flex:1.4;font-size:13px';
        desc.textContent = it[0];
        row.appendChild(code);
        row.appendChild(desc);
        row.addEventListener('click', function () {
          TN.copy(keys).then(function (ok) {
            if (!ok) fail('Copy failed — select the text manually.');
          });
        });
        host.appendChild(row);
      });
    });
    el(SLUG + '-none').classList.toggle('hidden', shown > 0);
  }

  try {
    TN.on(SLUG + '-win', 'click', function () { setOs('win'); });
    TN.on(SLUG + '-mac', 'click', function () { setOs('mac'); });
    TN.on(SLUG + '-search', 'input', TN.debounce(function () {
      render(el(SLUG + '-search').value);
    }, 150));
    setOs('win');
  } catch (e) { /* never throw on load */ }
})();
