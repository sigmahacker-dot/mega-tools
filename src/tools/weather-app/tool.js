(function () {
  'use strict';
  var P = 'weather-app-';
  function g(id) { return document.getElementById(P + id); }

  var cityIn = g('city'), btn = g('get');
  if (!cityIn || !btn) return;

  function fmtDay(dateStr) {
    try {
      var d = new Date(dateStr + 'T12:00:00');
      return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    } catch (e) { return dateStr; }
  }

  function setLoading(on) {
    btn.disabled = on;
    btn.textContent = on ? 'Loading...' : 'Get Weather';
  }

  function fetchWeather() {
    TN.clearErr(P + 'error');
    var city = (cityIn.value || '').trim();
    if (!city) {
      TN.setErr(P + 'error', 'Please enter a city name first.');
      return;
    }
    TN.hide(P + 'result');
    setLoading(true);

    fetch('/api/weather?q=' + encodeURIComponent(city))
      .then(function (resp) {
        if (resp.status === 404) {
          throw new Error('notfound');
        }
        if (!resp.ok) {
          throw new Error('badstatus');
        }
        return resp.json();
      })
      .then(function (data) {
        setLoading(false);
        if (!data || !data.current) throw new Error('baddata');
        var place = g('place');
        if (place) place.textContent = (data.place || city) + (data.country ? ', ' + data.country : '');
        var cur = data.current;
        var t = g('temp'), f = g('feels'), hu = g('humidity'), w = g('wind'), d = g('desc');
        if (t) t.textContent = (cur.temp_c != null ? cur.temp_c + '\u00B0C' : '\u2013');
        if (f) f.textContent = (cur.feels_like_c != null ? cur.feels_like_c + '\u00B0C' : '\u2013');
        if (hu) hu.textContent = (cur.humidity != null ? cur.humidity + '%' : '\u2013');
        if (w) w.textContent = (cur.wind_kph != null ? cur.wind_kph + ' km/h' : '\u2013');
        if (d) d.textContent = cur.desc || '';
        var daily = g('daily');
        if (daily) {
          var html = '';
          var days = Array.isArray(data.daily) ? data.daily : [];
          for (var i = 0; i < days.length; i++) {
            var day = days[i] || {};
            html += '<div class="stat-card"><div class="v" style="font-size:1.1rem;">' +
              TN.esc((day.max_c != null ? day.max_c + '\u00B0' : '\u2013') + ' / ' +
                      (day.min_c != null ? day.min_c + '\u00B0' : '\u2013')) +
              '</div><div class="l">' + TN.esc(fmtDay(day.date || '')) +
              (day.desc ? '<br>' + TN.esc(day.desc) : '') + '</div></div>';
          }
          daily.innerHTML = html || '<p class="muted">No forecast data available.</p>';
        }
        TN.show(P + 'result');
      })
      .catch(function (err) {
        setLoading(false);
        if (err && err.message === 'notfound') {
          TN.setErr(P + 'error', 'Place not found. Try a different spelling or a larger nearby city.');
        } else {
          TN.setErr(P + 'error', 'The weather service is temporarily unavailable. Please try again in a moment.');
        }
      });
  }

  TN.on(btn, 'click', fetchWeather);
  TN.on(cityIn, 'keydown', function (e) { if (e.key === 'Enter') fetchWeather(); });
})();
