/* YouTube Description Generator — structured description from video details. */
(function () {
  'use strict';

  var SLUG = 'youtube-description-generator';
  var lastDesc = '';

  var CTAS = {
    subscribe: '🔔 SUBSCRIBE for more videos like this and hit the bell so you never miss an upload!',
    comment: '💬 COMMENT below with your thoughts — I read and reply to every comment!',
    share: '📤 SHARE this video with someone who needs to see it!',
    playlist: '▶️ WATCH NEXT: check out the full playlist for more on this topic!'
  };

  function v(id) { return TN.el(SLUG + '-' + id).value.trim(); }

  function lines(s) { return s.split('\n').map(function (l) { return l.trim(); }).filter(Boolean); }

  function hashtags(topic) {
    return topic.split(/\s+/).filter(Boolean).map(function (w) {
      return '#' + w.toLowerCase().replace(/[^a-z0-9]/g, '');
    }).filter(Boolean).slice(0, 5).join(' ');
  }

  function generate() {
    TN.clearErr(SLUG + '-error');
    var title = v('title'), topic = v('topic'), hook = v('hook');
    if (!title) { TN.setErr(SLUG + '-error', 'Enter the video title.'); return; }
    var points = lines(v('points'));
    var chapters = lines(v('chapters'));
    var links = lines(v('links'));

    var d = '';
    d += (hook || 'In this video: ' + title) + '\n\n';
    if (topic) d += '🎯 ' + title + ' — everything you need to know about ' + topic + '.\n\n';
    if (points.length) {
      d += '📌 IN THIS VIDEO:\n' + points.map(function (p) { return '✅ ' + p; }).join('\n') + '\n\n';
    }
    if (chapters.length) {
      d += '⏱️ CHAPTERS:\n' + chapters.join('\n') + '\n\n';
    }
    if (links.length) {
      d += '🔗 LINKS:\n' + links.map(function (l) {
        var parts = l.split('|');
        if (parts.length > 1) return parts[0].trim() + ': ' + parts.slice(1).join('|').trim();
        return l;
      }).join('\n') + '\n\n';
    }
    d += CTAS[TN.el(SLUG + '-cta').value] + '\n\n';
    d += '📱 Follow for more!\n\n';
    if (topic) d += hashtags(topic) + '\n\n';
    d += '#youtube #' + (topic ? topic.split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, '') : 'video');

    lastDesc = d;
    TN.el(SLUG + '-out').textContent = d;
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-gen')) return;
      TN.on(SLUG + '-gen', 'click', generate);
      TN.on(SLUG + '-copy', 'click', function () {
        if (!lastDesc) { TN.setErr(SLUG + '-error', 'Generate the description first.'); return; }
        TN.copy(lastDesc).then(function () { TN.clearErr(SLUG + '-error'); })
          .catch(function () { TN.setErr(SLUG + '-error', 'Copy failed — select the text manually.'); });
      });
    } catch (e) { /* never throw on load */ }
  }

  init();
})();