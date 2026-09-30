(function () {
  'use strict';
  var P = 'lottery-number-generator-';
  function g(id) { return document.getElementById(P + id); }

  var maxInput = g('max'), countInput = g('count'), uniqueBox = g('unique');
  var balls = g('balls'), historyList = g('history'), emptyMsg = g('empty');
  if (!maxInput || !countInput || !uniqueBox || !balls) return;

  var draws = 0;

  function randInt(min, max) {
    // Cryptographic randomness when available, Math.random fallback.
    try {
      if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        var range = max - min + 1;
        var arr = new Uint32Array(1);
        var limit = Math.floor(4294967296 / range) * range; // avoid modulo bias
        var v;
        do { crypto.getRandomValues(arr); v = arr[0]; } while (v >= limit);
        return min + (v % range);
      }
    } catch (e) {}
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function generate() {
    TN.clearErr(P + 'error');
    var max = parseInt(maxInput.value, 10);
    var count = parseInt(countInput.value, 10);
    var unique = uniqueBox.checked;

    if (isNaN(max) || max < 2 || max > 999) {
      TN.setErr(P + 'error', 'Highest number must be between 2 and 999.');
      return;
    }
    if (isNaN(count) || count < 1 || count > 100) {
      TN.setErr(P + 'error', 'How many numbers must be between 1 and 100.');
      return;
    }
    if (unique && count > max) {
      TN.setErr(P + 'error', 'With “No duplicates” on, you can\u2019t draw ' + count + ' unique numbers from 1–' + max + '. Lower the count or allow duplicates.');
      return;
    }

    var nums = [];
    if (unique) {
      var set = {};
      while (nums.length < count) {
        var n = randInt(1, max);
        if (!set[n]) { set[n] = true; nums.push(n); }
      }
    } else {
      for (var i = 0; i < count; i++) nums.push(randInt(1, max));
    }
    nums.sort(function (a, b) { return a - b; });

    var html = '';
    for (var j = 0; j < nums.length; j++) html += '<div class="lotto-ball">' + nums[j] + '</div>';
    balls.innerHTML = html;

    draws++;
    var li = document.createElement('li');
    var left = document.createElement('span');
    left.textContent = 'Draw ' + draws + ': ' + nums.join(' – ');
    var right = document.createElement('span');
    right.className = 'muted';
    try { right.textContent = new Date().toLocaleTimeString(); } catch (e) { right.textContent = ''; }
    li.appendChild(left);
    li.appendChild(right);
    if (historyList) {
      historyList.insertBefore(li, historyList.firstChild);
      while (historyList.children.length > 20) historyList.removeChild(historyList.lastChild);
    }
    if (emptyMsg) TN.hide(emptyMsg);
  }

  function clearHistory() {
    if (historyList) historyList.innerHTML = '';
    draws = 0;
    if (emptyMsg) TN.show(emptyMsg);
    balls.innerHTML = '';
    TN.clearErr(P + 'error');
  }

  TN.on(P + 'go', 'click', generate);
  TN.on(P + 'clear', 'click', clearHistory);
})();
