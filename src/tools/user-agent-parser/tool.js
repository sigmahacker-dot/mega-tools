(function () {
  'use strict';
  var ERR = 'user-agent-parser-error';
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function parse(ua) {
    var browser = 'Unknown', version = '', os = 'Unknown', engine = 'Unknown';
    var b =
      /EdgA?\/([\d.]+)/.exec(ua) ? ['Edge', /EdgA?\/([\d.]+)/.exec(ua)[1]] :
      /OPR\/([\d.]+)/.exec(ua) ? ['Opera', /OPR\/([\d.]+)/.exec(ua)[1]] :
      /Vivaldi\/([\d.]+)/.exec(ua) ? ['Vivaldi', /Vivaldi\/([\d.]+)/.exec(ua)[1]] :
      /Brave\/([\d.]+)/.exec(ua) ? ['Brave', /Brave\/([\d.]+)/.exec(ua)[1]] :
      /SamsungBrowser\/([\d.]+)/.exec(ua) ? ['Samsung Internet', /SamsungBrowser\/([\d.]+)/.exec(ua)[1]] :
      /CriOS\/([\d.]+)/.exec(ua) ? ['Chrome (iOS)', /CriOS\/([\d.]+)/.exec(ua)[1]] :
      /FxiOS\/([\d.]+)/.exec(ua) ? ['Firefox (iOS)', /FxiOS\/([\d.]+)/.exec(ua)[1]] :
      /EdgiOS\/([\d.]+)/.exec(ua) ? ['Edge (iOS)', /EdgiOS\/([\d.]+)/.exec(ua)[1]] :
      /Firefox\/([\d.]+)/.exec(ua) ? ['Firefox', /Firefox\/([\d.]+)/.exec(ua)[1]] :
      /Chrome\/([\d.]+)/.exec(ua) ? ['Chrome', /Chrome\/([\d.]+)/.exec(ua)[1]] :
      /Version\/([\d.]+).*Safari\//.exec(ua) ? ['Safari', /Version\/([\d.]+)/.exec(ua)[1]] :
      /Safari\/([\d.]+)/.exec(ua) ? ['Safari', /Version\/([\d.]+)/.exec(ua) ? /Version\/([\d.]+)/.exec(ua)[1] : ''] :
      /MSIE ([\d.]+)/.exec(ua) ? ['Internet Explorer', /MSIE ([\d.]+)/.exec(ua)[1]] :
      /Trident\/.*rv:([\d.]+)/.exec(ua) ? ['Internet Explorer', /rv:([\d.]+)/.exec(ua)[1]] : null;
    if (b) { browser = b[0]; version = b[1] || ''; }
    var o =
      /Windows NT 10/.test(ua) ? 'Windows 10 / 11' :
      /Windows NT 6\.3/.test(ua) ? 'Windows 8.1' :
      /Windows NT 6\.2/.test(ua) ? 'Windows 8' :
      /Windows NT 6\.1/.test(ua) ? 'Windows 7' :
      /Windows/.test(ua) ? 'Windows' :
      /iPhone|iPad/.test(ua) ? 'iOS ' + ((/OS ([\d_]+)/.exec(ua) || [])[1] || '').replace(/_/g, '.') :
      /Mac OS X ([\d_]+)/.test(ua) ? 'macOS ' + (/Mac OS X ([\d_]+)/.exec(ua)[1] || '').replace(/_/g, '.') :
      /Android ([\d.]+)/.test(ua) ? 'Android ' + /Android ([\d.]+)/.exec(ua)[1] :
      /CrOS/.test(ua) ? 'ChromeOS' :
      /Linux/.test(ua) ? 'Linux' : null;
    if (o) os = o;
    var device = /Mobi|Android|iPhone|iPod/.test(ua) ? 'Mobile' : /Tablet|iPad/.test(ua) ? 'Tablet' : 'Desktop';
    if (/Gecko\//.test(ua) && !/like Gecko/.test(ua)) engine = 'Gecko';
    else if (/AppleWebKit/.test(ua) && /Chrome|Chromium|Edg|OPR/.test(ua)) engine = 'Blink';
    else if (/AppleWebKit/.test(ua)) engine = 'WebKit';
    else if (/Trident/.test(ua)) engine = 'Trident';
    return { browser: browser, version: version, os: os, device: device, engine: engine };
  }
  function update() {
    if (!TN.el('ua-input')) return;
    TN.clearErr(ERR);
    var ua = TN.el('ua-input').value;
    if (!ua.trim()) { TN.setErr(ERR, 'Paste a user-agent string first.'); return; }
    var p = parse(ua);
    TN.el('ua-browser').textContent = p.browser + (p.version ? ' ' + p.version : '');
    TN.el('ua-os').textContent = p.os;
    TN.el('ua-device').textContent = p.device;
    var rows = [
      ['Browser', p.browser], ['Version', p.version || '—'], ['Operating system', p.os],
      ['Device type', p.device], ['Layout engine', p.engine],
      ['Platform', navigator.platform || '—'],
      ['Languages', (navigator.languages || []).join(', ') || navigator.language || '—'],
      ['CPU cores', navigator.hardwareConcurrency || '—'],
      ['Touch points', ('maxTouchPoints' in navigator) ? navigator.maxTouchPoints : '—'],
      ['Cookies enabled', navigator.cookieEnabled ? 'Yes' : 'No'],
      ['Online', navigator.onLine ? 'Yes' : 'No']
    ];
    TN.el('ua-body').innerHTML = rows.map(function (r) {
      return '<tr><td style="width:40%"><strong>' + esc(r[0]) + '</strong></td><td>' + esc(String(r[1])) + '</td></tr>';
    }).join('');
  }
  try {
    TN.el('ua-input').value = navigator.userAgent || '';
    TN.on('ua-input', 'input', update);
    TN.on('ua-reset', 'click', function () { TN.el('ua-input').value = navigator.userAgent || ''; update(); });
    TN.on('ua-copy', 'click', function () { if (TN.copy) TN.copy(TN.el('ua-input').value); });
    update();
  } catch (e) { /* never throw on load */ }
})();