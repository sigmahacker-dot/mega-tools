(function () {
  'use strict';
  var S = 'cron-job-builder';
  var FIELDS = [
    { key: 'minute', label: 'Minute', min: 0, max: 59, unit: 'minute', units: 'minutes' },
    { key: 'hour', label: 'Hour', min: 0, max: 23, unit: 'hour', units: 'hours' },
    { key: 'dom', label: 'Day of month', min: 1, max: 31, unit: 'day of the month', units: 'days of the month' },
    { key: 'month', label: 'Month', min: 1, max: 12, unit: 'month', units: 'months' },
    { key: 'dow', label: 'Day of week', min: 0, max: 6, unit: 'day of the week', units: 'days of the week' }
  ];
  var DOW_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  function oxford(arr) {
    if (arr.length === 1) return arr[0];
    if (arr.length === 2) return arr[0] + ' and ' + arr[1];
    return arr.slice(0, -1).join(', ') + ', and ' + arr[arr.length - 1];
  }

  function fieldValue(f) {
    var mode = TN.el(S + '-' + f.key + '-mode').value;
    if (mode === 'every') return '*';
    if (mode === 'list') {
      var raw = (TN.el(S + '-' + f.key + '-list').value || '').trim();
      if (!raw) throw new Error(f.label + ': enter at least one value for the list.');
      var parts = raw.split(',').map(function (x) { return x.trim(); }).filter(function (x) { return x !== ''; });
      if (!parts.length) throw new Error(f.label + ': enter at least one value for the list.');
      var seen = {};
      parts.forEach(function (p) {
        if (!/^\d+$/.test(p)) throw new Error(f.label + ': "' + p + '" is not a whole number.');
        var n = parseInt(p, 10);
        if (n < f.min || n > f.max) throw new Error(f.label + ': ' + n + ' is out of range (' + f.min + '–' + f.max + ').');
        seen[n] = true;
      });
      return Object.keys(seen).map(Number).sort(function (a, b) { return a - b; }).join(',');
    }
    if (mode === 'range') {
      var a = parseInt(TN.el(S + '-' + f.key + '-r1').value, 10);
      var b = parseInt(TN.el(S + '-' + f.key + '-r2').value, 10);
      if (!isFinite(a) || !isFinite(b)) throw new Error(f.label + ': enter both ends of the range.');
      if (a < f.min || a > f.max || b < f.min || b > f.max) throw new Error(f.label + ': range must be within ' + f.min + '–' + f.max + '.');
      if (a > b) throw new Error(f.label + ': the range start cannot be after the end.');
      return a + '-' + b;
    }
    var n = parseInt(TN.el(S + '-' + f.key + '-step').value, 10);
    if (!isFinite(n) || n < 1) throw new Error(f.label + ': the step must be a positive whole number.');
    if (n > f.max) throw new Error(f.label + ': the step cannot exceed ' + f.max + '.');
    return '*/' + n;
  }

  function labelVal(f, n) {
    if (f.key === 'dow') return DOW_NAMES[n];
    if (f.key === 'month') return MONTH_NAMES[n - 1];
    return String(n);
  }

  function phrase(f, str) {
    str = str.trim();
    if (str === '*') return 'every ' + f.unit;
    var m;
    if ((m = str.match(/^\*\/(\d+)$/))) return 'every ' + m[1] + ' ' + f.units;
    if ((m = str.match(/^(\d+)-(\d+)$/))) return 'every ' + f.unit + ' from ' + labelVal(f, +m[1]) + ' to ' + labelVal(f, +m[2]);
    var parts = str.split(',').map(function (p) { return labelVal(f, parseInt(p, 10)); });
    return (parts.length === 1 ? 'at ' + f.unit + ' ' : 'at ' + f.units + ' ') + oxford(parts);
  }

  function describe(vals) {
    return 'Runs ' + phrase(FIELDS[0], vals.minute) +
      ', ' + phrase(FIELDS[1], vals.hour) +
      ', ' + phrase(FIELDS[2], vals.dom) +
      ', ' + phrase(FIELDS[3], vals.month) +
      ' (' + phrase(FIELDS[4], vals.dow) + ').';
  }

  function makeTester(str) {
    str = str.trim();
    if (str === '*') return function () { return true; };
    var checks = str.split(',').map(function (p) {
      p = p.trim();
      var m, n;
      if ((m = p.match(/^\*\/(\d+)$/))) {
        n = parseInt(m[1], 10);
        return function (v) { return v % n === 0; };
      }
      if ((m = p.match(/^(\d+)-(\d+)$/))) {
        var a = +m[1], b = +m[2];
        return function (v) { return v >= a && v <= b; };
      }
      n = parseInt(p, 10);
      return function (v) { return v === n; };
    });
    return function (v) {
      for (var i = 0; i < checks.length; i++) if (checks[i](v)) return true;
      return false;
    };
  }

  function nextRuns(vals) {
    var tMin = makeTester(vals.minute);
    var tHour = makeTester(vals.hour);
    var tDom = makeTester(vals.dom);
    var tMon = makeTester(vals.month);
    var tDow = makeTester(vals.dow);
    var bothRestricted = vals.dom !== '*' && vals.dow !== '*';
    var d = new Date();
    d.setSeconds(0, 0);
    d.setMinutes(d.getMinutes() + 1);
    var out = [];
    var limit = 366 * 24 * 60;
    for (var i = 0; i < limit && out.length < 3; i++) {
      var domOk = tDom(d.getDate());
      var dowOk = tDow(d.getDay());
      var dayOk = bothRestricted ? (domOk || dowOk) : (domOk && dowOk);
      if (tMin(d.getMinutes()) && tHour(d.getHours()) && tMon(d.getMonth() + 1) && dayOk) {
        out.push(new Date(d.getTime()));
      }
      d.setMinutes(d.getMinutes() + 1);
    }
    return out;
  }

  function fmtDate(d) {
    try {
      return d.toLocaleString('en-US', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false
      });
    } catch (e) { return d.toString(); }
  }

  function build() {
    try {
      TN.clearErr(S + '-error');
      var vals = {};
      FIELDS.forEach(function (f) { vals[f.key] = fieldValue(f); });
      var expr = vals.minute + ' ' + vals.hour + ' ' + vals.dom + ' ' + vals.month + ' ' + vals.dow;
      TN.el(S + '-expr').textContent = expr;
      TN.el(S + '-desc').textContent = describe(vals);
      var runs = nextRuns(vals);
      var ul = TN.el(S + '-next');
      if (ul) {
        if (!runs.length) {
          ul.innerHTML = '<li class="muted">No run found in the next 366 days — check your schedule.</li>';
        } else {
          var html = '';
          runs.forEach(function (d) { html += '<li>' + TN.esc(fmtDate(d)) + '</li>'; });
          ul.innerHTML = html;
        }
      }
    } catch (e) {
      TN.setErr(S + '-error', e && e.message ? e.message : 'Could not build the cron expression.');
    }
  }

  function syncMode(f) {
    var mode = TN.el(S + '-' + f.key + '-mode').value;
    TN.el(S + '-' + f.key + '-list').classList.toggle('hidden', mode !== 'list');
    TN.el(S + '-' + f.key + '-rangewrap').classList.toggle('hidden', mode !== 'range');
    TN.el(S + '-' + f.key + '-stepwrap').classList.toggle('hidden', mode !== 'step');
  }

  function copyExpr() {
    try {
      TN.copy(TN.el(S + '-expr').textContent).then(function (ok) {
        if (!ok) TN.setErr(S + '-error', 'Copy failed — select the expression and copy it manually.');
        else TN.clearErr(S + '-error');
      });
    } catch (e) { TN.setErr(S + '-error', 'Copy failed.'); }
  }

  function init() {
    FIELDS.forEach(function (f) {
      syncMode(f);
      TN.on(S + '-' + f.key + '-mode', 'change', function () { syncMode(f); build(); });
      [S + '-' + f.key + '-list', S + '-' + f.key + '-r1', S + '-' + f.key + '-r2', S + '-' + f.key + '-step'].forEach(function (id) {
        TN.on(id, 'input', build);
      });
    });
    TN.on(S + '-copy', 'click', copyExpr);
    build();
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
