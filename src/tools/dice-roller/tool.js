(function () {
  'use strict';
  var P = 'dice-roller-';
  function g(id) { return document.getElementById(P + id); }

  var countInput = g('count'), sidesSel = g('sides'), rollBtn = g('roll');
  if (!countInput || !sidesSel || !rollBtn) return;

  var D6_FACES = ['\u2680', '\u2681', '\u2682', '\u2683', '\u2684', '\u2685'];
  var rolling = false;
  var history = [];
  var MAX_HISTORY = 30;

  function faceFor(value, sides) {
    if (sides === 6) return D6_FACES[value - 1];
    return String(value);
  }

  function renderFaces(values, sides) {
    var wrap = g('faces');
    if (!wrap) return;
    var html = '';
    var i;
    if (sides === 6) {
      for (i = 0; i < values.length; i++) html += values[i];
    } else {
      for (i = 0; i < values.length; i++) {
        html += '<span class="tag" style="font-size:1.5rem;padding:.4rem .7rem;">' + values[i] + '</span>';
      }
    }
    wrap.innerHTML = html;
  }

  function renderHistory() {
    var list = g('history'), empty = g('history-empty');
    if (!list) return;
    var html = '';
    for (var i = 0; i < history.length; i++) {
      html += '<li>' + TN.esc(history[i]) + '</li>';
    }
    list.innerHTML = html;
    if (empty) empty.style.display = history.length ? 'none' : '';
  }

  function roll() {
    if (rolling) return;
    TN.clearErr(P + 'error');
    var count = parseInt(countInput.value, 10);
    var sides = parseInt(sidesSel.value, 10);
    if (isNaN(count) || count < 1 || count > 6) {
      TN.setErr(P + 'error', 'Please enter a dice count between 1 and 6.');
      return;
    }
    if ([4, 6, 8, 10, 12, 20].indexOf(sides) === -1) {
      TN.setErr(P + 'error', 'Please choose a valid number of sides.');
      return;
    }
    rolling = true;
    rollBtn.disabled = true;
    var finalVals = [];
    for (var i = 0; i < count; i++) finalVals.push(1 + Math.floor(Math.random() * sides));
    var total = 0;
    for (i = 0; i < finalVals.length; i++) total += finalVals[i];

    var ticks = 0;
    var anim = setInterval(function () {
      var tmp = [];
      for (var j = 0; j < count; j++) tmp.push(1 + Math.floor(Math.random() * sides));
      renderFaces(tmp.map(function (v) { return faceFor(v, sides); }), sides);
      if (++ticks >= 10) {
        clearInterval(anim);
        renderFaces(finalVals.map(function (v) { return faceFor(v, sides); }), sides);
        var t = g('total');
        if (t) t.textContent = total;
        TN.show(P + 'result');
        var facesStr = finalVals.map(function (v) { return faceFor(v, sides); }).join(' ');
        history.unshift(count + 'd' + sides + ': ' + facesStr + ' = ' + total);
        if (history.length > MAX_HISTORY) history.length = MAX_HISTORY;
        renderHistory();
        rolling = false;
        rollBtn.disabled = false;
      }
    }, 70);
  }

  TN.on(rollBtn, 'click', roll);
  TN.on(g('clear'), 'click', function () {
    history = [];
    renderHistory();
    TN.hide(P + 'result');
    TN.clearErr(P + 'error');
  });
  renderHistory();
})();
