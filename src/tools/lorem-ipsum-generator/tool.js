/* Lorem Ipsum Generator — classic placeholder text */
(function () {
  'use strict';
  var countEl = TN.el('lorem-ipsum-generator-count');
  var typeEl = TN.el('lorem-ipsum-generator-type');
  var output = TN.el('lorem-ipsum-generator-output');
  if (!countEl || !typeEl || !output) return;

  var SENTENCES = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    'Curabitur pretium tincidunt lacus, nec iaculis dui venenatis at.',
    'Nulla facilisi. Aenean nec eros vitae enim cursus pellentesque.',
    'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.',
    'Donec vitae sapien ut libero venenatis faucibus.',
    'Phasellus viverra nulla ut metus varius laoreet.',
    'Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue.',
    'Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero.',
    'Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi.',
    'Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim.',
    'Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus.',
    'Praesent blandit odio eu enim. Pellentesque sed dui ut augue blandit sodales.',
    'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices.',
    'Fusce a quam. Etiam ut purus mattis mauris sodales aliquam.',
    'Curabitur blandit mollis lacus. Nam adipiscing. Vestibulum eu odio.',
    'Maecenas malesuada. Praesent congue erat at massa.',
    'Sed cursus turpis vitae tortor. Donec posuere vulputate arcu.',
    'Phasellus accumsan cursus velit. Vestibulum ante ipsum primis in faucibus.',
    'In hac habitasse platea dictumst. Curabitur at lacus ac velit ornare lobortis.',
    'Morbi mattis ullamcorper velit. Phasellus gravida semper nisi.',
    'Nullam vel sem. Pellentesque libero tortor, tincidunt et, tincidunt eget, semper nec, quam.',
    'Sed hendrerit. Morbi ac felis. Nunc egestas, augue at pellentesque laoreet, felis eros vehicula leo.',
    'Quisque id odio. Praesent libero. Sed cursus ante dapibus diam.',
    'Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum.',
    'Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa.',
    'Vestibulum lacinia arcu eget nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra.'
  ];

  function shuffled(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function generate() {
    try {
      TN.clearErr('lorem-ipsum-generator-error');
      var n = parseInt(countEl.value, 10);
      if (isNaN(n) || n < 1) { TN.setErr('lorem-ipsum-generator-error', 'Enter a number of 1 or more.'); return; }
      if (n > 500) { TN.setErr('lorem-ipsum-generator-error', 'Please enter 500 or fewer.'); return; }
      var type = typeEl.value;
      var out;
      if (type === 'paragraphs') {
        var paras = [];
        for (var p = 0; p < n; p++) {
          var sents = shuffled(SENTENCES).slice(0, 4 + Math.floor(Math.random() * 3));
          paras.push(sents.join(' '));
        }
        out = paras.join('\n\n');
      } else if (type === 'sentences') {
        var pool = [];
        while (pool.length < n) pool = pool.concat(shuffled(SENTENCES));
        out = pool.slice(0, n).join(' ');
      } else {
        var words = [];
        while (words.length < n) {
          words = words.concat(shuffled(SENTENCES).join(' ').replace(/[.,]/g, '').split(/\s+/));
        }
        out = words.slice(0, n).join(' ');
      }
      output.textContent = out;
    } catch (e) {
      TN.setErr('lorem-ipsum-generator-error', 'Generation failed. Please try again.');
    }
  }

  function currentText() {
    return output.textContent.indexOf('Click Generate') === 0 ? '' : output.textContent;
  }

  TN.on('lorem-ipsum-generator-generate', 'click', generate);
  TN.on('lorem-ipsum-generator-copy', 'click', function () {
    var t = currentText();
    if (!t) { TN.setErr('lorem-ipsum-generator-error', 'Generate some text first.'); return; }
    TN.clearErr('lorem-ipsum-generator-error');
    TN.copy(t).then(function (ok) {
      if (!ok) TN.setErr('lorem-ipsum-generator-error', 'Copy failed in this browser. Select the text and press Ctrl/Cmd+C.');
    });
  });
  TN.on('lorem-ipsum-generator-download', 'click', function () {
    var t = currentText();
    if (!t) { TN.setErr('lorem-ipsum-generator-error', 'Generate some text first.'); return; }
    TN.clearErr('lorem-ipsum-generator-error');
    TN.downloadText(t, 'lorem-ipsum.txt', 'text/plain;charset=utf-8');
  });
})();
