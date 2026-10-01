/* tmux Cheat Sheet — searchable reference of real keybindings/commands. */
(function () {
  'use strict';
  var SLUG = 'tmux-cheat-sheet';
  var DATA = [{"sec": "Sessions", "keys": "tmux new -s <name>", "desc": "Create a new session called <name>."}, {"sec": "Sessions", "keys": "tmux attach -t <name>", "desc": "Attach to the session <name>."}, {"sec": "Sessions", "keys": "tmux ls", "desc": "List all sessions."}, {"sec": "Sessions", "keys": "tmux kill-session -t <name>", "desc": "Kill the session <name>."}, {"sec": "Sessions", "keys": "tmux kill-server", "desc": "Kill the tmux server and all sessions."}, {"sec": "Sessions", "keys": "C-b d", "desc": "Detach from the current session."}, {"sec": "Sessions", "keys": "C-b s", "desc": "List sessions and windows (choose-tree)."}, {"sec": "Sessions", "keys": "C-b $", "desc": "Rename the current session."}, {"sec": "Sessions", "keys": "C-b (", "desc": "Switch to the previous session."}, {"sec": "Sessions", "keys": "C-b )", "desc": "Switch to the next session."}, {"sec": "Sessions", "keys": "C-b L", "desc": "Switch to the last (previously used) session."}, {"sec": "Sessions", "keys": "C-b D", "desc": "Choose a client to detach."}, {"sec": "Windows", "keys": "C-b c", "desc": "Create a new window."}, {"sec": "Windows", "keys": "C-b ,", "desc": "Rename the current window."}, {"sec": "Windows", "keys": "C-b n", "desc": "Next window."}, {"sec": "Windows", "keys": "C-b p", "desc": "Previous window."}, {"sec": "Windows", "keys": "C-b l", "desc": "Last (previously used) window."}, {"sec": "Windows", "keys": "C-b 0 \u2026 9", "desc": "Select window by number."}, {"sec": "Windows", "keys": "C-b w", "desc": "List windows."}, {"sec": "Windows", "keys": "C-b f", "desc": "Find a window by name."}, {"sec": "Windows", "keys": "C-b &", "desc": "Kill the current window (asks for confirmation)."}, {"sec": "Windows", "keys": "C-b .", "desc": "Move the window (prompts for an index)."}, {"sec": "Windows", "keys": "tmux neww -n <name> <cmd>", "desc": "New window called <name> running <cmd>."}, {"sec": "Windows", "keys": "tmux rename-window <name>", "desc": "Rename the current window from the shell."}, {"sec": "Panes", "keys": "C-b %", "desc": "Split the pane vertically (side by side)."}, {"sec": "Panes", "keys": "C-b \"", "desc": "Split the pane horizontally (top and bottom)."}, {"sec": "Panes", "keys": "C-b o", "desc": "Go to the next pane."}, {"sec": "Panes", "keys": "C-b ;", "desc": "Go to the last active pane."}, {"sec": "Panes", "keys": "C-b Up / Down / Left / Right", "desc": "Move to the pane in that direction."}, {"sec": "Panes", "keys": "C-b q", "desc": "Show pane numbers briefly."}, {"sec": "Panes", "keys": "C-b q 0 \u2026 9", "desc": "Jump to the pane with that number."}, {"sec": "Panes", "keys": "C-b x", "desc": "Kill the current pane (asks for confirmation)."}, {"sec": "Panes", "keys": "C-b z", "desc": "Zoom the pane to fill the window (toggle)."}, {"sec": "Panes", "keys": "C-b !", "desc": "Break the pane out into a new window."}, {"sec": "Panes", "keys": "C-b {", "desc": "Swap the pane with the previous one."}, {"sec": "Panes", "keys": "C-b }", "desc": "Swap the pane with the next one."}, {"sec": "Panes", "keys": "C-b C-o", "desc": "Rotate panes forward."}, {"sec": "Panes", "keys": "C-b M-o", "desc": "Rotate panes backward."}, {"sec": "Panes", "keys": "C-b Space", "desc": "Cycle through pane layouts."}, {"sec": "Panes", "keys": "C-b M-1 \u2026 M-5", "desc": "Apply a preset layout (even-horizontal, even-vertical, main-horizontal, main-vertical, tiled)."}, {"sec": "Panes", "keys": "C-b C-Up / C-Down / C-Left / C-Right", "desc": "Resize the pane by one cell."}, {"sec": "Panes", "keys": "C-b M-Up / M-Down / M-Left / M-Right", "desc": "Resize the pane by five cells."}, {"sec": "Panes", "keys": "C-b :setw synchronize-panes", "desc": "Toggle sending input to all panes at once."}, {"sec": "Panes", "keys": "tmux split-window -h", "desc": "Split vertically from the shell."}, {"sec": "Panes", "keys": "tmux send-keys -t <pane> \"<cmd>\" Enter", "desc": "Type a command into another pane."}, {"sec": "Copy mode", "keys": "C-b [", "desc": "Enter copy mode (scroll and select)."}, {"sec": "Copy mode", "keys": "q", "desc": "Quit copy mode."}, {"sec": "Copy mode", "keys": "Space", "desc": "Start a selection (vi keys)."}, {"sec": "Copy mode", "keys": "Enter", "desc": "Copy the selection and quit (vi keys)."}, {"sec": "Copy mode", "keys": "/ then ?", "desc": "Search forward / backward in copy mode."}, {"sec": "Copy mode", "keys": "C-b ]", "desc": "Paste the most recent buffer."}, {"sec": "Copy mode", "keys": "C-b =", "desc": "Choose a paste buffer interactively."}, {"sec": "Copy mode", "keys": "C-b -", "desc": "Delete the most recent paste buffer."}, {"sec": "Copy mode", "keys": "tmux show-buffer", "desc": "Print the top paste buffer from the shell."}, {"sec": "Misc", "keys": "C-b ?", "desc": "List all key bindings."}, {"sec": "Misc", "keys": "C-b :", "desc": "Open the tmux command prompt."}, {"sec": "Misc", "keys": "C-b t", "desc": "Show a big clock."}, {"sec": "Misc", "keys": "C-b i", "desc": "Display information about the current window."}, {"sec": "Misc", "keys": "C-b ~", "desc": "Show previous tmux messages."}, {"sec": "Misc", "keys": "C-b C-z", "desc": "Suspend the tmux client."}, {"sec": "Misc", "keys": "tmux source-file ~/.tmux.conf", "desc": "Reload the config file from the shell."}, {"sec": "Misc", "keys": "tmux set -g mouse on", "desc": "Enable mouse support (put in ~/.tmux.conf)."}, {"sec": "Misc", "keys": "tmux set -g prefix C-a", "desc": "Change the prefix key to C-a (in ~/.tmux.conf, then unbind C-b)."}, {"sec": "Misc", "keys": "tmux list-keys", "desc": "List key bindings from the shell."}, {"sec": "Misc", "keys": "tmux display-message -p \"#S\"", "desc": "Print the current session name from the shell."}];
  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function render() {
    clear();
    var q = el(SLUG + '-q').value.trim().toLowerCase();
    var sec = el(SLUG + '-sec').value;
    var body = el(SLUG + '-body');
    body.innerHTML = '';
    var n = 0;
    DATA.forEach(function (e) {
      if (sec && e.sec !== sec) return;
      var hay = (e.keys + ' ' + e.sec + ' ' + e.desc).toLowerCase();
      if (q && hay.indexOf(q) < 0) return;
      var tr = document.createElement('tr');
      tr.style.cssText = 'border-bottom:1px solid #27272a;cursor:pointer';
      tr.title = 'Click to copy';
      tr.innerHTML = '<td style="padding:8px;font-family:monospace;color:#a3e635;white-space:nowrap">' + TN.esc(e.keys) + '</td>' +
        '<td style="padding:8px;color:#a1a1aa">' + TN.esc(e.sec) + '</td>' +
        '<td style="padding:8px">' + TN.esc(e.desc) + '</td>';
      (function (keys) {
        tr.addEventListener('click', function () {
          TN.copy(keys).then(function (ok) { if (!ok) fail('Copy failed.'); });
        });
      })(e.keys);
      body.appendChild(tr);
      n++;
    });
    el(SLUG + '-count').textContent = n + ' of ' + DATA.length + ' entries — click a row to copy.';
  }

  try {
    if (!el(SLUG + '-q')) return;
    var secs = {};
    DATA.forEach(function (e) { secs[e.sec] = 1; });
    var sel = el(SLUG + '-sec');
    Object.keys(secs).forEach(function (s) {
      var o = document.createElement('option');
      o.value = s; o.textContent = s;
      sel.appendChild(o);
    });
    TN.on(SLUG + '-q', 'input', render);
    TN.on(SLUG + '-sec', 'change', render);
    TN.on(SLUG + '-download', 'click', function () {
      var md = '# tmux Cheat Sheet\n\n| Keys / Command | Section | Description |\n|---|---|---|\n' +
        DATA.map(function (e) { return '| `' + e.keys + '` | ' + e.sec + ' | ' + e.desc + ' |'; }).join('\n') + '\n';
      TN.downloadText(md, 'tmux-cheatsheet.md', 'text/markdown');
    });
    render();
  } catch (e) { /* never throw on load */ }
})();
