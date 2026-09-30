(function () {
  'use strict';
  var P = 'screen-resolution-checker-';
  function g(id) { return document.getElementById(P + id); }
  function set(id, val) { var el = g(id); if (el) el.textContent = val; }

  function update() {
    try {
      var sw = (typeof screen !== 'undefined' && screen.width) ? screen.width : '–';
      var sh = (typeof screen !== 'undefined' && screen.height) ? screen.height : '–';
      set('screen', sw + ' × ' + sh + ' px');

      var vw = (typeof window.innerWidth === 'number') ? window.innerWidth : '–';
      var vh = (typeof window.innerHeight === 'number') ? window.innerHeight : '–';
      set('viewport', vw + ' × ' + vh + ' px');

      var dpr = (typeof window.devicePixelRatio === 'number') ? window.devicePixelRatio : 'n/a';
      set('dpr', String(dpr));

      var depth = (typeof screen !== 'undefined' && screen.colorDepth) ? screen.colorDepth + '-bit' : 'n/a';
      set('depth', depth);

      var orient = 'n/a';
      try {
        if (screen && screen.orientation && screen.orientation.type) {
          orient = String(screen.orientation.type).replace('-primary', '').replace('-secondary', ' (reversed)');
        } else if (typeof window.orientation === 'number') {
          var deg = window.orientation;
          orient = (deg === 0 || deg === 180) ? 'portrait' : 'landscape';
        }
      } catch (e) {}
      set('orient', orient);
    } catch (e) {
      TN.setErr(P + 'error', 'Could not read screen information in this browser.');
    }
  }

  TN.on(P + 'refresh', 'click', update);
  try {
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('resize', TN.debounce(update, 150));
      if (screen && screen.orientation && typeof screen.orientation.addEventListener === 'function') {
        screen.orientation.addEventListener('change', update);
      }
    }
  } catch (e) {}
  update();
})();
