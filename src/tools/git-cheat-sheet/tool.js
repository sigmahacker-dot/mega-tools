/* Git Cheat Sheet — 60+ commands, searchable, click-to-copy. */
(function () {
  'use strict';
  var SLUG = 'git-cheat-sheet';
  var GROUPS = [
    ['Setup', [
      ['git init', 'Start a new repository in the current folder'],
      ['git clone <url>', 'Copy a remote repository locally'],
      ['git clone <url> <folder>', 'Clone into a specific folder'],
      ['git config --global user.name "Name"', 'Set your commit author name'],
      ['git config --global user.email "you@example.com"', 'Set your commit author email'],
      ['git config --global init.defaultBranch main', 'Default new repos to the main branch'],
      ['git config --list', 'Show all git configuration']
    ]],
    ['Daily workflow', [
      ['git status', 'Show changed and untracked files'],
      ['git add <file>', 'Stage a file for commit'],
      ['git add .', 'Stage all changes in the current folder'],
      ['git commit -m "message"', 'Commit staged changes with a message'],
      ['git commit -am "message"', 'Stage tracked changes and commit'],
      ['git push', 'Upload commits to the remote'],
      ['git push -u origin <branch>', 'Push and set the upstream branch'],
      ['git pull', 'Fetch and merge remote changes'],
      ['git fetch', 'Download remote changes without merging'],
      ['git diff', 'Show unstaged changes'],
      ['git diff --staged', 'Show staged changes'],
      ['git restore <file>', 'Discard changes in a working file'],
      ['git restore --staged <file>', 'Unstage a file'],
      ['git rm <file>', 'Delete a file and stage the removal'],
      ['git mv <old> <new>', 'Rename a file and stage it']
    ]],
    ['History', [
      ['git log', 'Show commit history'],
      ['git log --oneline', 'Compact one-line-per-commit history'],
      ['git log --graph --oneline --all', 'ASCII graph of all branches'],
      ['git show <commit>', 'Show details of a commit'],
      ['git blame <file>', 'Show who changed each line'],
      ['git reflog', 'History of where HEAD has pointed']
    ]],
    ['Branches', [
      ['git branch', 'List local branches'],
      ['git branch -a', 'List local and remote branches'],
      ['git branch <name>', 'Create a new branch'],
      ['git checkout <branch>', 'Switch to a branch'],
      ['git switch <branch>', 'Switch to a branch (newer syntax)'],
      ['git switch -c <name>', 'Create and switch to a branch'],
      ['git branch -d <name>', 'Delete a merged branch'],
      ['git branch -D <name>', 'Force-delete a branch'],
      ['git branch -m <new>', 'Rename the current branch']
    ]],
    ['Merging & rebasing', [
      ['git merge <branch>', 'Merge a branch into the current one'],
      ['git merge --abort', 'Abort a conflicted merge'],
      ['git rebase <branch>', 'Replay current branch on top of another'],
      ['git rebase --continue', 'Continue after resolving rebase conflicts'],
      ['git rebase --abort', 'Abort the rebase'],
      ['git cherry-pick <commit>', 'Apply a single commit here'],
      ['git rebase -i HEAD~3', 'Interactively rewrite the last 3 commits']
    ]],
    ['Stash', [
      ['git stash', 'Shelve current changes'],
      ['git stash push -m "msg"', 'Stash with a label'],
      ['git stash list', 'List stashed changes'],
      ['git stash pop', 'Restore the latest stash and drop it'],
      ['git stash apply', 'Restore the latest stash, keep it'],
      ['git stash drop', 'Delete the latest stash']
    ]],
    ['Remotes & tags', [
      ['git remote -v', 'List remotes with URLs'],
      ['git remote add origin <url>', 'Add a remote named origin'],
      ['git remote set-url origin <url>', 'Change a remote URL'],
      ['git tag v1.0.0', 'Create a lightweight tag'],
      ['git tag -a v1.0.0 -m "release"', 'Create an annotated tag'],
      ['git push --tags', 'Push tags to the remote'],
      ['git ls-remote', 'List remote refs without cloning']
    ]],
    ['Undoing things', [
      ['git commit --amend', 'Edit the last commit'],
      ['git commit --amend --no-edit', 'Add staged changes to the last commit'],
      ['git reset HEAD~1', 'Undo the last commit, keep changes'],
      ['git reset --hard HEAD', 'Discard all local changes (careful!)'],
      ['git revert <commit>', 'Create a commit that undoes another'],
      ['git clean -fd', 'Delete untracked files and folders (careful!)']
    ]],
    ['Inspection', [
      ['git remote show origin', 'Show remote details and tracking'],
      ['git branch --merged', 'Branches already merged'],
      ['git branch --no-merged', 'Branches not yet merged'],
      ['git shortlog -sn', 'Contributors ranked by commit count'],
      ['git grep "text"', 'Search tracked files for text']
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
