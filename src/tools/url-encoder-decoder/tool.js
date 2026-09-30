(function () {
  'use strict';
  var P = 'url-encoder-decoder-';
  var lastOutput = '';

  function selectedMode() {
    var radios = document.getElementsByName(P + 'mode');
    for (var i = 0; i < radios.length; i++) {
      if (radios[i].checked) return radios[i].value;
    }
    return 'component';
  }

  function show(text) {
    lastOutput = text;
    TN.el(P + 'output').textContent = text;
    TN.show(P + 'result');
  }

  TN.on(P + 'encode', 'click', function () {
    var input = TN.el(P + 'input').value;
    if (!input) { TN.setErr(P + 'error', 'Enter some text first.'); return; }
    TN.clearErr(P + 'error');
    try {
      var out = selectedMode() === 'full' ? encodeURI(input) : encodeURIComponent(input);
      show(out);
    } catch (e) {
      TN.hide(P + 'result');
      TN.setErr(P + 'error', 'Encode failed: ' + (e && e.message ? e.message : e));
    }
  });

  TN.on(P + 'decode', 'click', function () {
    var input = TN.el(P + 'input').value;
    if (!input) { TN.setErr(P + 'error', 'Enter some text first.'); return; }
    TN.clearErr(P + 'error');
    try {
      show(decodeURIComponent(input));
    } catch (e) {
      TN.hide(P + 'result');
      TN.setErr(P + 'error', 'Decode failed: malformed percent-encoding — ' + (e && e.message ? e.message : e));
    }
  });

  TN.on(P + 'copy', 'click', function () {
    if (!lastOutput) { TN.setErr(P + 'error', 'Nothing to copy yet — encode or decode first.'); return; }
    TN.clearErr(P + 'error');
    TN.copy(lastOutput).then(null, function () {
      TN.setErr(P + 'error', 'Copy failed — select the text manually.');
    });
  });
})();
