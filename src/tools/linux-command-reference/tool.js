/* Linux Command Reference — 80+ commands, searchable, click-to-copy. */
(function () {
  'use strict';
  var SLUG = 'linux-command-reference';
  var GROUPS = [
    ['Files & directories', [
      ['ls -la', 'List all files with details'],
      ['cd <dir>', 'Change directory'],
      ['pwd', 'Print the current directory'],
      ['mkdir -p a/b/c', 'Create nested directories'],
      ['rm -rf <dir>', 'Delete a directory tree (careful!)'],
      ['cp -r src/ dst/', 'Copy a directory recursively'],
      ['mv old new', 'Move or rename a file'],
      ['touch file.txt', 'Create an empty file'],
      ['ln -s target link', 'Create a symbolic link'],
      ['find . -name "*.log"', 'Find files by name'],
      ['find . -type f -size +100M', 'Find large files'],
      ['tree', 'Show a directory tree'],
      ['du -sh *', 'Disk usage of each item'],
      ['df -h', 'Free disk space'],
      ['stat file', 'Detailed file metadata']
    ]],
    ['Viewing & text', [
      ['cat file', 'Print a file'],
      ['less file', 'Page through a file'],
      ['head -n 20 file', 'First 20 lines'],
      ['tail -n 20 file', 'Last 20 lines'],
      ['tail -f app.log', 'Follow a growing log file'],
      ['grep -r "text" .', 'Search files recursively'],
      ['grep -i "err" app.log', 'Case-insensitive search'],
      ['sed -i "s/old/new/g" file', 'Replace text in a file'],
      ['awk \'{print $1}\' file', 'Print the first column'],
      ['sort file | uniq -c', 'Count unique lines'],
      ['wc -l file', 'Count lines in a file'],
      ['diff a.txt b.txt', 'Compare two files'],
      ['cut -d, -f2 data.csv', 'Extract the 2nd CSV column'],
      ['tr "a-z" "A-Z" < file', 'Uppercase text']
    ]],
    ['Permissions & ownership', [
      ['chmod 755 script.sh', 'Set rwxr-xr-x permissions'],
      ['chmod +x script.sh', 'Make executable'],
      ['chmod -R 644 dir/', 'Permissions recursively'],
      ['chown user:group file', 'Change owner and group'],
      ['chown -R user:group dir/', 'Change ownership recursively'],
      ['umask 022', 'Show/set default permission mask']
    ]],
    ['Processes', [
      ['ps aux', 'List all processes'],
      ['ps aux | grep nginx', 'Find a process'],
      ['top', 'Live process monitor'],
      ['htop', 'Interactive process monitor'],
      ['kill <pid>', 'Terminate a process'],
      ['kill -9 <pid>', 'Force-kill a process'],
      ['pkill -f name', 'Kill processes by name'],
      ['jobs', 'List background jobs'],
      ['nohup cmd &', 'Run immune to hangup, in background'],
      ['nice -n 10 cmd', 'Run with lower priority']
    ]],
    ['System info', [
      ['uname -a', 'Kernel and system info'],
      ['hostname', 'Show the machine name'],
      ['uptime', 'How long the system has run'],
      ['whoami', 'Current username'],
      ['id', 'User and group IDs'],
      ['free -h', 'Memory usage'],
      ['lscpu', 'CPU details'],
      ['lsblk', 'Block devices'],
      ['dmesg | tail', 'Recent kernel messages'],
      ['cat /etc/os-release', 'Distribution info']
    ]],
    ['Networking', [
      ['ping example.com', 'Test connectivity'],
      ['curl -I https://example.com', 'Fetch response headers'],
      ['curl -o file url', 'Download a file'],
      ['wget url', 'Download a file'],
      ['ssh user@host', 'Open an SSH session'],
      ['scp file user@host:/path', 'Copy a file over SSH'],
      ['rsync -avz src/ user@host:dst/', 'Sync directories over SSH'],
      ['ss -tlnp', 'Listening TCP ports and processes'],
      ['ip addr', 'Network interfaces and addresses'],
      ['dig example.com', 'DNS lookup'],
      ['traceroute example.com', 'Trace the route to a host'],
      ['netstat -tulpn', 'Connections and listening ports']
    ]],
    ['Packages (Debian/Ubuntu)', [
      ['sudo apt update', 'Refresh package lists'],
      ['sudo apt upgrade', 'Upgrade installed packages'],
      ['sudo apt install pkg', 'Install a package'],
      ['sudo apt remove pkg', 'Remove a package'],
      ['apt search keyword', 'Search packages'],
      ['dpkg -l | grep pkg', 'Check if a package is installed']
    ]],
    ['Archives', [
      ['tar -czf out.tar.gz dir/', 'Create a gzipped archive'],
      ['tar -xzf in.tar.gz', 'Extract a gzipped archive'],
      ['tar -tzf in.tar.gz', 'List archive contents'],
      ['zip -r out.zip dir/', 'Create a zip archive'],
      ['unzip in.zip', 'Extract a zip archive']
    ]],
    ['Users & services', [
      ['sudo -i', 'Become root'],
      ['sudo cmd', 'Run a command as root'],
      ['adduser name', 'Create a user'],
      ['passwd', 'Change your password'],
      ['systemctl status nginx', 'Service status'],
      ['systemctl restart nginx', 'Restart a service'],
      ['systemctl enable nginx', 'Start service at boot'],
      ['journalctl -u nginx -f', 'Follow a service log'],
      ['crontab -e', 'Edit your cron jobs']
    ]]
  ];

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }

  function render(filter) {
    var host = el(SLUG + '-list');
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
      items.forEach(function (it) {
        var row = document.createElement('div');
        row.className = 'copy-row';
        row.style.cssText = 'margin-bottom:8px;cursor:pointer';
        row.title = 'Click to copy';
        var code = document.createElement('code');
        code.className = 'code';
        code.style.flex = '1';
        code.textContent = it[0];
        var desc = document.createElement('span');
        desc.className = 'muted';
        desc.style.cssText = 'flex:1.4;font-size:13px';
        desc.textContent = it[1];
        row.appendChild(code);
        row.appendChild(desc);
        row.addEventListener('click', function () {
          TN.copy(it[0]).then(function (ok) {
            if (!ok) fail('Copy failed — select the text manually.');
          });
        });
        host.appendChild(row);
      });
    });
    el(SLUG + '-none').classList.toggle('hidden', shown > 0);
  }

  try {
    TN.on(SLUG + '-search', 'input', TN.debounce(function () {
      render(el(SLUG + '-search').value);
    }, 150));
    render('');
  } catch (e) { /* never throw on load */ }
})();
