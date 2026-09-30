(function () {
  'use strict';
  var P = 'world-clock-';
  function g(id) { return document.getElementById(P + id); }

  var grid = g('grid'), tzIn = g('tz'), addBtn = g('add');
  if (!grid || !tzIn || !addBtn) return;

  var KEY = 'tn_world_clock_custom';
  var defaults = [
    { label: 'Karachi', tz: 'Asia/Karachi' },
    { label: 'Dubai', tz: 'Asia/Dubai' },
    { label: 'London', tz: 'Europe/London' },
    { label: 'New York', tz: 'America/New_York' },
    { label: 'Tokyo', tz: 'Asia/Tokyo' },
    { label: 'Sydney', tz: 'Australia/Sydney' },
    { label: 'Riyadh', tz: 'Asia/Riyadh' },
    { label: 'Delhi', tz: 'Asia/Kolkata' }
  ];
  var customs = [];

  function loadCustom() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          customs = parsed.filter(function (c) {
            return c && typeof c.tz === 'string' && isValidTz(c.tz);
          }).map(function (c) { return { label: String(c.label || c.tz), tz: c.tz }; });
        }
      }
    } catch (e) { customs = []; }
  }

  function saveCustom() {
    try { localStorage.setItem(KEY, JSON.stringify(customs)); } catch (e) { /* private mode */ }
  }

  function isValidTz(tz) {
    try {
      new Intl.DateTimeFormat('en', { timeZone: tz });
      return true;
    } catch (e) { return false; }
  }

  function fmtTime(tz) {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false, timeZone: tz
      }).format(new Date());
    } catch (e) { return '--:--:--'; }
  }

  function fmtDate(tz) {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        weekday: 'short', day: 'numeric', month: 'short',
        timeZone: tz
      }).format(new Date());
    } catch (e) { return ''; }
  }

  function allZones() {
    return defaults.concat(customs.map(function (c) {
      return { label: c.label, tz: c.tz, custom: true };
    }));
  }

  function buildGrid() {
    var zones = allZones();
    var html = '';
    for (var i = 0; i < zones.length; i++) {
      var z = zones[i];
      var del = z.custom
        ? ' <button class="btn btn-danger btn-sm" data-wc-del="' + TN.esc(z.tz) + '" type="button">Remove</button>'
        : '';
      html += '<div class="stat-card"><div class="v" data-wc-time="' + i + '" style="font-size:1.6rem;">--:--:--</div>' +
        '<div class="l">' + TN.esc(z.label) + '<br><span class="muted">' + TN.esc(fmtDate(z.tz)) + '</span>' + del + '</div></div>';
    }
    grid.innerHTML = html;
  }

  function tick() {
    var zones = allZones();
    for (var i = 0; i < zones.length; i++) {
      var el = grid.querySelector('[data-wc-time="' + i + '"]');
      if (el) el.textContent = fmtTime(zones[i].tz);
    }
    var local = g('local-time');
    if (local) {
      try {
        local.textContent = new Date().toLocaleTimeString('en-GB', { hour12: false });
      } catch (e) { local.textContent = ''; }
    }
    var ldate = g('local-date');
    if (ldate) {
      try {
        ldate.textContent = new Date().toLocaleDateString(undefined, {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
      } catch (e) { ldate.textContent = ''; }
    }
  }

  function addCustom() {
    TN.clearErr(P + 'error');
    var tz = (tzIn.value || '').trim();
    if (!tz) {
      TN.setErr(P + 'error', 'Please type a time zone name, e.g. America/Chicago.');
      return;
    }
    if (tz.length > 60) {
      TN.setErr(P + 'error', 'That time zone name is too long.');
      return;
    }
    if (!isValidTz(tz)) {
      TN.setErr(P + 'error', 'Unknown time zone "' + tz + '". Use a Continent/City name like Europe/Paris.');
      return;
    }
    var zones = allZones();
    for (var i = 0; i < zones.length; i++) {
      if (zones[i].tz.toLowerCase() === tz.toLowerCase()) {
        TN.setErr(P + 'error', 'That time zone is already shown.');
        return;
      }
    }
    var label = tz.split('/').pop().replace(/_/g, ' ');
    customs.push({ label: label, tz: tz });
    saveCustom();
    tzIn.value = '';
    buildGrid();
    tick();
  }

  grid.onclick = function (e) {
    var tgt = e.target;
    var tz = tgt.getAttribute && tgt.getAttribute('data-wc-del');
    if (tz) {
      customs = customs.filter(function (c) { return c.tz !== tz; });
      saveCustom();
      buildGrid();
      tick();
    }
  };

  TN.on(addBtn, 'click', addCustom);
  TN.on(tzIn, 'keydown', function (e) { if (e.key === 'Enter') addCustom(); });

  loadCustom();
  buildGrid();
  tick();
  setInterval(tick, 1000);
})();
