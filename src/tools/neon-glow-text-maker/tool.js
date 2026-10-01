/* Neon Glow Text Maker — glowing neon sign on dark canvas, PNG download. */
(function () {
  'use strict';
  var SLUG = 'neon-glow-text-maker';

  function canvas() { return TN.el(SLUG + '-canvas'); }
  function text() {
    var el = TN.el(SLUG + '-text');
    return el && el.value ? el.value : 'NEON';
  }
  function color() {
    var el = TN.el(SLUG + '-color');
    return el && el.value ? el.value : '#ff2d78';
  }

  function apply() {
    var c = canvas();
    if (!c) return;
    c.width = 1200; c.height = 630;
    var x = c.getContext('2d');
    x.fillStyle = '#0a0a10';
    x.fillRect(0, 0, c.width, c.height);
    // subtle wall texture lines
    x.strokeStyle = 'rgba(255,255,255,0.03)';
    x.lineWidth = 1;
    for (var ly = 0; ly < c.height; ly += 24) {
      x.beginPath(); x.moveTo(0, ly); x.lineTo(c.width, ly); x.stroke();
    }
    var t = text().toUpperCase().slice(0, 40);
    var col = color();
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    var fs = t.length > 12 ? 90 : t.length > 6 ? 130 : 170;
    x.font = 'bold ' + fs + 'px Arial, Helvetica, sans-serif';
    // layered glow
    var glows = [60, 36, 18];
    x.shadowColor = col;
    for (var i = 0; i < glows.length; i++) {
      x.shadowBlur = glows[i];
      x.fillStyle = col;
      x.fillText(t, c.width / 2, c.height / 2);
    }
    // bright core
    x.shadowBlur = 0;
    x.fillStyle = '#ffffff';
    x.globalAlpha = 0.9;
    x.fillText(t, c.width / 2, c.height / 2);
    x.globalAlpha = 1;
    // tube highlight
    x.shadowBlur = 8;
    x.shadowColor = col;
    x.strokeStyle = 'rgba(255,255,255,0.55)';
    x.lineWidth = 2;
    x.strokeText(t, c.width / 2, c.height / 2);
  }

  function download() {
    canvas().toBlob(function (b) {
      if (b) TN.download(b, 'neon-sign.png');
      else TN.setErr(SLUG + '-error', 'Your browser could not encode the PNG.');
    }, 'image/png');
  }

  apply();
  TN.on(SLUG + '-text', 'input', apply);
  TN.on(SLUG + '-color', 'input', apply);
  TN.on(SLUG + '-download', 'click', download);
})();
