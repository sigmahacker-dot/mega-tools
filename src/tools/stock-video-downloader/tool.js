/* Royalty-Free Stock Video Downloader — search /api/stock, render grid with download links */
(function () {
  'use strict';
  var SLUG = 'stock-video-downloader';
  var busy = false;

  function setStatus(t) {
    var s = TN.el(SLUG + '-status');
    if (s) s.textContent = t;
  }

  function fmtDur(sec) {
    sec = Number(sec);
    if (!isFinite(sec) || sec < 0) return '';
    var m = Math.floor(sec / 60), s = Math.round(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function field(it, keys) {
    for (var i = 0; i < keys.length; i++) {
      if (it[keys[i]] !== undefined && it[keys[i]] !== null && it[keys[i]] !== '') return it[keys[i]];
    }
    return '';
  }

  function card(it) {
    var preview = field(it, ['preview', 'preview_url', 'image', 'thumbnail', 'poster']);
    var dl = field(it, ['download', 'download_url', 'url', 'video_url', 'file', 'mp4']);
    var credit = field(it, ['credit', 'photographer', 'author', 'creator']) ||
      (it.user && (it.user.name || it.user.username)) || 'Unknown';
    var dur = fmtDur(field(it, ['duration', 'length']));
    var dims = (it.width && it.height) ? (it.width + '\u00d7' + it.height) : field(it, ['dimensions', 'size']);

    var meta = [dur, dims, 'by ' + credit].filter(function (x) { return x; }).join(' \u00b7 ');
    var div = document.createElement('div');
    div.className = 'result';
    var html = '';
    if (preview) {
      html += '<img class="preview-img" src="' + TN.esc(preview) + '" alt="' + TN.esc('Stock video by ' + credit) + '" loading="lazy" referrerpolicy="no-referrer">';
    }
    html += '<p class="muted">' + TN.esc(meta || 'Stock video') + '</p>';
    if (dl) {
      html += '<div class="btn-row mt"><a class="btn btn-sm btn-primary" href="' + TN.esc(dl) + '" target="_blank" rel="noopener">Download MP4</a></div>';
    } else {
      html += '<p class="muted">Download link unavailable for this video.</p>';
    }
    div.innerHTML = html;
    return div;
  }

  function search() {
    if (busy) return;
    var qEl = TN.el(SLUG + '-q');
    var q = qEl ? qEl.value.trim() : '';
    TN.clearErr(SLUG + '-error');
    TN.hide(SLUG + '-setup');
    if (!q) {
      TN.setErr(SLUG + '-error', 'Type something to search for, e.g. "ocean waves".');
      return;
    }
    busy = true;
    var grid = TN.el(SLUG + '-grid');
    if (grid) grid.innerHTML = '';
    setStatus('Searching\u2026');

    fetch('/api/stock?q=' + encodeURIComponent(q) + '&per_page=12').then(function (r) {
      if (r.status === 503) {
        return r.json().catch(function () { return {}; }).then(function (j) {
          if (j && j.error === 'API key not configured') {
            var e = new Error('setup');
            e.isSetup = true;
            throw e;
          }
          throw new Error('The stock video service is temporarily unavailable. Please try again later.');
        });
      }
      if (!r.ok) throw new Error('Search failed (HTTP ' + r.status + '). Please try again.');
      return r.json();
    }).then(function (j) {
      var items = (j && (j.results || j.videos || j.data)) || [];
      if (!items.length) {
        setStatus('No videos found — try a different search term.');
        return;
      }
      setStatus('Found ' + items.length + ' video' + (items.length === 1 ? '' : 's') + '.');
      for (var i = 0; i < items.length; i++) {
        try { grid.appendChild(card(items[i])); } catch (e) {}
      }
    }).catch(function (err) {
      setStatus('');
      if (err && err.isSetup) {
        TN.show(SLUG + '-setup');
      } else {
        TN.setErr(SLUG + '-error', (err && err.message) || 'Search failed. Please try again.');
      }
    }).then(function () {
      busy = false;
    });
  }

  TN.on(SLUG + '-search', 'click', search);
  TN.on(SLUG + '-q', 'keydown', function (e) {
    if (e.key === 'Enter') search();
  });
})();
