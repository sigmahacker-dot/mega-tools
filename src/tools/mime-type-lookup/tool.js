(function () {
  'use strict';
  var ERR = 'mime-type-lookup-error';
  var DATA = [
    ['html', 'text/html'], ['htm', 'text/html'], ['css', 'text/css'], ['js', 'text/javascript'],
    ['mjs', 'text/javascript'], ['json', 'application/json'], ['xml', 'application/xml'],
    ['txt', 'text/plain'], ['csv', 'text/csv'], ['md', 'text/markdown'],
    ['png', 'image/png'], ['jpg', 'image/jpeg'], ['jpeg', 'image/jpeg'], ['gif', 'image/gif'],
    ['webp', 'image/webp'], ['avif', 'image/avif'], ['svg', 'image/svg+xml'], ['ico', 'image/x-icon'],
    ['bmp', 'image/bmp'], ['tiff', 'image/tiff'], ['tif', 'image/tiff'], ['heic', 'image/heic'],
    ['mp3', 'audio/mpeg'], ['wav', 'audio/wav'], ['ogg', 'audio/ogg'], ['oga', 'audio/ogg'],
    ['m4a', 'audio/mp4'], ['flac', 'audio/flac'], ['aac', 'audio/aac'], ['opus', 'audio/opus'],
    ['mid', 'audio/midi'], ['midi', 'audio/midi'], ['weba', 'audio/webm'],
    ['mp4', 'video/mp4'], ['m4v', 'video/mp4'], ['webm', 'video/webm'], ['ogv', 'video/ogg'],
    ['mov', 'video/quicktime'], ['avi', 'video/x-msvideo'], ['mkv', 'video/x-matroska'],
    ['wmv', 'video/x-ms-wmv'], ['flv', 'video/x-flv'], ['3gp', 'video/3gpp'],
    ['pdf', 'application/pdf'], ['doc', 'application/msword'],
    ['docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ['xls', 'application/vnd.ms-excel'],
    ['xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    ['ppt', 'application/vnd.ms-powerpoint'],
    ['pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    ['odt', 'application/vnd.oasis.opendocument.text'], ['ods', 'application/vnd.oasis.opendocument.spreadsheet'],
    ['rtf', 'application/rtf'], ['epub', 'application/epub+zip'],
    ['zip', 'application/zip'], ['rar', 'application/vnd.rar'], ['7z', 'application/x-7z-compressed'],
    ['tar', 'application/x-tar'], ['gz', 'application/gzip'], ['bz2', 'application/x-bzip2'],
    ['ttf', 'font/ttf'], ['otf', 'font/otf'], ['woff', 'font/woff'], ['woff2', 'font/woff2'], ['eot', 'application/vnd.ms-fontobject'],
    ['wasm', 'application/wasm'], ['swf', 'application/x-shockwave-flash'],
    ['exe', 'application/x-msdownload'], ['dmg', 'application/x-apple-diskimage'],
    ['apk', 'application/vnd.android.package-archive'], ['deb', 'application/x-debian-package'],
    ['iso', 'application/x-iso9660-image'],
    ['ics', 'text/calendar'], ['vcf', 'text/vcard'],
    ['rss', 'application/rss+xml'], ['atom', 'application/atom+xml'],
    ['yaml', 'application/yaml'], ['yml', 'application/yaml'], ['toml', 'application/toml'],
    ['ts', 'video/mp2t'], ['m3u8', 'application/vnd.apple.mpegurl'], ['mpd', 'application/dash+xml'],
    ['srt', 'application/x-subrip'], ['vtt', 'text/vtt'],
    ['psd', 'image/vnd.adobe.photoshop'], ['ai', 'application/postscript'], ['eps', 'application/postscript'],
    ['sqlite', 'application/x-sqlite3'], ['db', 'application/x-sqlite3'],
    ['bin', 'application/octet-stream'], ['dat', 'application/octet-stream']
  ];
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function render(q) {
    q = (q || '').trim().toLowerCase().replace(/^\./, '');
    var rows = DATA.filter(function (d) {
      return !q || d[0].indexOf(q) !== -1 || d[1].toLowerCase().indexOf(q) !== -1;
    });
    TN.el('mime-count').textContent = rows.length;
    TN.el('mime-body').innerHTML = rows.map(function (d, i) {
      return '<tr><td><strong>.' + esc(d[0]) + '</strong></td><td>' + esc(d[1]) + '</td>' +
        '<td style="text-align:right"><button type="button" class="btn btn-outline btn-sm mime-cp" data-i="' + i + '">Copy</button></td></tr>';
    }).join('') || '<tr><td colspan="3" class="muted">No matches.</td></tr>';
    TN.qsa('#mime-body .mime-cp').forEach(function (b) {
      b.addEventListener('click', function () {
        var d = rows[parseInt(b.getAttribute('data-i'), 10)];
        if (TN.copy) TN.copy(d[1]);
        b.textContent = 'Copied!';
        setTimeout(function () { b.textContent = 'Copy'; }, 900);
      });
    });
  }
  try {
    TN.on('mime-q', 'input', function () { TN.clearErr(ERR); render(TN.el('mime-q').value); });
    render('');
  } catch (e) { /* never throw on load */ }
})();