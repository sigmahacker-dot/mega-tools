(function () {
  'use strict';
  var ERR = 'pros-cons-decider-error';
  function addRow(boxId, text, weight) {
    var box = TN.el(boxId);
    var d = document.createElement('div');
    d.style.cssText = 'display:grid;grid-template-columns:1fr 64px 34px;gap:8px;margin-bottom:8px;';
    d.innerHTML = '<input type="text" class="input pc-text" placeholder="Reason">' +
      '<select class="select pc-w"><option value="1">1</option><option value="2">2</option><option value="3" selected>3</option><option value="4">4</option><option value="5">5</option></select>' +
      '<button type="button" class="btn btn-danger btn-sm pc-del" title="Remove">✕</button>';
    if (text) d.querySelector('.pc-text').value = text;
    if (weight) d.querySelector('.pc-w').value = String(weight);
    box.appendChild(d);
    d.querySelector('.pc-text').addEventListener('input', update);
    d.querySelector('.pc-w').addEventListener('change', update);
    d.querySelector('.pc-del').addEventListener('click', function () { d.remove(); update(); });
  }
  function score(boxId) {
    var total = 0, n = 0;
    TN.qsa('#' + boxId + ' .pc-text').forEach(function (el) {
      var t = el.value.trim();
      if (!t) return;
      var w = parseInt(el.parentElement.querySelector('.pc-w').value, 10) || 1;
      total += w; n++;
    });
    return { total: total, n: n };
  }
  function update() {
    if (!TN.el('pc-verdict')) return;
    TN.clearErr(ERR);
    var p = score('pc-pros'), c = score('pc-cons');
    TN.el('pc-pro-score').textContent = p.total;
    TN.el('pc-con-score').textContent = c.total;
    var tot = p.total + c.total;
    TN.el('pc-bar-pro').style.width = (tot ? p.total / tot * 100 : 50) + '%';
    TN.el('pc-bar-con').style.width = (tot ? c.total / tot * 100 : 50) + '%';
    var v = TN.el('pc-verdict'), note = TN.el('pc-note');
    if (!p.n && !c.n) {
      v.textContent = '–'; v.style.color = '';
      note.textContent = 'Add pros and cons with weights to get a verdict.';
      return;
    }
    var diff = p.total - c.total, rel = tot ? Math.abs(diff) / tot : 0;
    if (rel < 0.1) {
      v.textContent = '⚖️ Toss-up'; v.style.color = '#fcd34d';
      note.textContent = 'The weighted scores are nearly tied — gather more information or go with your gut.';
    } else if (diff > 0) {
      v.textContent = '✅ Go for it'; v.style.color = '#4ade80';
      note.textContent = 'Pros outweigh cons by ' + diff + ' weighted point' + (diff === 1 ? '' : 's') + '.';
    } else {
      v.textContent = '🛑 Hold off'; v.style.color = '#f87171';
      note.textContent = 'Cons outweigh pros by ' + (-diff) + ' weighted point' + (diff === -1 ? '' : 's') + '.';
    }
  }
  try {
    TN.on('pc-add-pro', 'click', function () { addRow('pc-pros'); });
    TN.on('pc-add-con', 'click', function () { addRow('pc-cons'); });
    TN.on('pc-topic', 'input', update);
    addRow('pc-pros', 'Companionship', 5);
    addRow('pc-pros', 'Daily exercise', 3);
    addRow('pc-cons', 'Time commitment', 4);
    update();
  } catch (e) { /* never throw on load */ }
})();