/* UTC Converter — UTC ↔ local, UTC → any fixed UTC offset (honest no-DST note). */
(function () {
  'use strict';
  var SLUG = 'utc-converter';
  var $ = function (id) { return TN.el(SLUG + '-' + id); };

  // All real-world standard UTC offsets in minutes.
  var OFFSETS = [-720, -660, -600, -570, -540, -480, -420, -360, -300, -240, -210, -180,
    -120, -60, 0, 60, 120, 180, 210, 240, 270, 300, 330, 345, 360, 390, 420, 480,
    525, 540, 570, 600, 630, 660, 720, 765, 780, 840];

  function offLabel(mins) {
    var sign = mins < 0 ? '−' : '+';
    var a = Math.abs(mins);
    return 'UTC' + sign + ('0' + Math.floor(a / 60)).slice(-2) + ':' + ('0' + (a % 60)).slice(-2);
  }

  function buildOffsets() {
    var sel = $('target');
    OFFSETS.forEach(function (m) {
      var o = document.createElement('option');
      o.value = m;
      o.textContent = offLabel(m);
      if (m === 300) o.selected = true; // UTC+5 default
      sel.appendChild(o);
    });
  }

  function parseLocal(v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(v || '');
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
    return isNaN(d.getTime()) ? null : d;
  }

  function parseAsUTC(v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(v || '');
    if (!m) return null;
    var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]));
    return isNaN(d.getTime()) ? null : d;
  }

  function fmtYMDHM(d) {
    return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' +
      ('0' + d.getDate()).slice(-2) + ' ' + ('0' + d.getHours()).slice(-2) + ':' +
      ('0' + d.getMinutes()).slice(-2);
  }

  function fmtUTC(d) {
    return d.getUTCFullYear() + '-' + ('0' + (d.getUTCMonth() + 1)).slice(-2) + '-' +
      ('0' + d.getUTCDate()).slice(-2) + ' ' + ('0' + d.getUTCHours()).slice(-2) + ':' +
      ('0' + d.getUTCMinutes()).slice(-2) + ' UTC';
  }

  function go1() {
    TN.clearErr(SLUG + '-error');
    var utc = parseAsUTC($('utc').value);
    if (!utc) { TN.setErr(SLUG + '-error', 'Please enter a valid UTC date and time.'); return; }
    var off = parseInt($('target').value, 10);
    // Represent the target wall-clock time by shifting a Date's UTC fields.
    var shifted = new Date(utc.getTime() + off * 60000);
    var lbl = offLabel(off);
    var localOff = -utc.getTimezoneOffset();
    var localLbl = offLabel(localOff);
    $('out1').innerHTML = '<p><strong class="code">' + fmtUTC(utc) + '</strong> =</p>' +
      '<p style="font-size:20px"><strong>' + fmtUTC(shifted).replace(' UTC', '') + '</strong> <span class="code">' + lbl + '</span></p>' +
      '<p class="muted">Your local time: <strong>' + fmtYMDHM(utc) +
      '</strong> <span class="code">' + localLbl + '</span></p>';
  }

  function go2() {
    TN.clearErr(SLUG + '-error');
    var local = parseLocal($('local').value);
    if (!local) { TN.setErr(SLUG + '-error', 'Please enter a valid local date and time.'); return; }
    $('out2').innerHTML = '<p>Your local <strong class="code">' + fmtYMDHM(local) + '</strong> =</p>' +
      '<p style="font-size:20px"><strong>' + fmtUTC(local) + '</strong></p>' +
      '<p class="muted">Unix timestamp: <span class="code">' + Math.floor(local.getTime() / 1000) + '</span></p>';
  }

  try {
    buildOffsets();
    TN.on(SLUG + '-go1', 'click', go1);
    TN.on(SLUG + '-go2', 'click', go2);
  } catch (e) { /* never throw on load */ }
})();
