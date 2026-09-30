/* YouTube Thumbnail Downloader — parse ID, preview sizes, download per size */
(function () {
  'use strict';
  var SLUG = 'youtube-thumbnail-downloader';

  var SIZES = [
    ['maxresdefault', 'HD · 1280×720'],
    ['sddefault', 'SD · 640×480'],
    ['hqdefault', 'HQ · 480×360'],
    ['mqdefault', 'MQ · 320×180'],
    ['default', 'Default · 120×90']
  ];

  function parseId(s) {
    s = String(s || '').trim();
    if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
    var m = s.match(/(?:youtube\.com\/(?:watch\?[^#]*v=|shorts\/|embed\/|live\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
  }

  function thumbUrl(id, size) {
    return 'https://i.ytimg.com/vi/' + id + '/' + size + '.jpg';
  }

  function render(id) {
    var box = TN.el(SLUG + '-results');
    if (!box) return;
    var html = '<div class="grid2">';
    for (var i = 0; i < SIZES.length; i++) {
      var name = SIZES[i][0], label = SIZES[i][1];
      html += '<div class="result" data-thumb="' + TN.esc(name) + '">' +
        '<p class="muted">' + TN.esc(label) + '</p>' +
        '<img class="preview-img" src="' + TN.esc(thumbUrl(id, name)) + '" alt="' + TN.esc(label + ' thumbnail') + '" loading="lazy" referrerpolicy="no-referrer">' +
        '<div class="btn-row mt"><button class="btn btn-sm btn-primary" type="button" data-dl="' + TN.esc(name) + '">Download</button></div>' +
        '</div>';
    }
    box.innerHTML = html + '</div>' +
      '<p class="muted mt">Video ID: <span class="tag">' + TN.esc(id) + '</span></p>';

    // Hide any size that fails to load (e.g. maxresdefault on non-HD videos)
    var imgs = box.querySelectorAll('img');
    for (var j = 0; j < imgs.length; j++) {
      imgs[j].addEventListener('error', function () {
        var card = this.closest('[data-thumb]');
        if (card) card.style.display = 'none';
      });
    }
    box.setAttribute('data-videoid', id);
  }

  function downloadOne(id, size) {
    var url = thumbUrl(id, size);
    var filename = 'youtube-thumbnail-' + id + '-' + size + '.jpg';
    // Try fetch -> blob so the file saves directly; fall back to a new tab on CORS failure
    fetch(url, { mode: 'cors' }).then(function (r) {
      if (!r.ok) throw new Error('http ' + r.status);
      return r.blob();
    }).then(function (b) {
      TN.download(b, filename);
    }).catch(function () {
      window.open(url, '_blank', 'noopener');
    });
  }

  TN.on(SLUG + '-get', 'click', function () {
    TN.clearErr(SLUG + '-error');
    var input = TN.el(SLUG + '-input');
    var id = parseId(input ? input.value : '');
    if (!id) {
      TN.setErr(SLUG + '-error', 'Could not find a YouTube video ID in that input. Paste a full YouTube URL or the 11-character video ID.');
      return;
    }
    render(id);
  });

  TN.on(SLUG + '-input', 'keydown', function (e) {
    if (e.key === 'Enter') {
      var btn = TN.el(SLUG + '-get');
      if (btn) btn.click();
    }
  });

  TN.on(SLUG + '-results', 'click', function (e) {
    var t = e.target;
    if (t && t.getAttribute && t.getAttribute('data-dl')) {
      var box = TN.el(SLUG + '-results');
      var id = box ? box.getAttribute('data-videoid') : '';
      if (id) downloadOne(id, t.getAttribute('data-dl'));
    }
  });

  TN.on(SLUG + '-clear', 'click', function () {
    var input = TN.el(SLUG + '-input');
    if (input) input.value = '';
    var box = TN.el(SLUG + '-results');
    if (box) { box.innerHTML = ''; box.removeAttribute('data-videoid'); }
    TN.clearErr(SLUG + '-error');
  });
})();
