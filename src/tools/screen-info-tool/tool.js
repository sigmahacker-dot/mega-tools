(function () {
  'use strict';
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function update() {
    try {
      if (!TN.el('scr-body')) return;
      var dpr = window.devicePixelRatio || 1;
      TN.el('scr-screen').textContent = screen.width + ' × ' + screen.height;
      TN.el('scr-viewport').textContent = window.innerWidth + ' × ' + window.innerHeight;
      TN.el('scr-dpr').textContent = dpr;
      TN.el('scr-phys').textContent = Math.round(screen.width * dpr) + ' × ' + Math.round(screen.height * dpr);
      var o = screen.orientation || {};
      var rows = [
        ['Screen', screen.width + ' × ' + screen.height + ' CSS px'],
        ['Available screen', screen.availWidth + ' × ' + screen.availHeight + ' CSS px'],
        ['Viewport (inner)', window.innerWidth + ' × ' + window.innerHeight + ' CSS px'],
        ['Window (outer)', window.outerWidth + ' × ' + window.outerHeight + ' CSS px'],
        ['Device pixel ratio', String(dpr)],
        ['Physical resolution', Math.round(screen.width * dpr) + ' × ' + Math.round(screen.height * dpr) + ' px'],
        ['Color depth', screen.colorDepth + '-bit'],
        ['Pixel depth', screen.pixelDepth + '-bit'],
        ['Orientation', (o.type || 'unknown') + (o.angle !== undefined ? ' (' + o.angle + '°)' : '')],
        ['Scrollbar width', (window.innerWidth - document.documentElement.clientWidth) + ' px']
      ];
      TN.el('scr-body').innerHTML = rows.map(function (r) {
        return '<tr><td style="width:40%"><strong>' + esc(r[0]) + '</strong></td><td>' + esc(r[1]) + '</td></tr>';
      }).join('');
    } catch (e) { /* never throw */ }
  }
  try {
    update();
    window.addEventListener('resize', update);
    if (screen.orientation && screen.orientation.addEventListener) screen.orientation.addEventListener('change', update);
  } catch (e) { /* never throw on load */ }
})();