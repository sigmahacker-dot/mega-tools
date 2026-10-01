/* Nginx Config Generator — domain/port/mode/SSL options → server block. */
(function () {
  'use strict';
  var SLUG = 'nginx-config-generator';

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function generate() {
    clear();
    var domain = el(SLUG + '-domain').value.trim();
    if (!domain) { fail('Enter at least one domain.'); return; }
    var mode = el(SLUG + '-mode').value;
    var target = el(SLUG + '-target').value.trim();
    if (!target) { fail('Enter a document root or upstream.'); return; }
    var port = el(SLUG + '-port').value.trim() || '80';
    var ssl = el(SLUG + '-ssl').checked;
    var redirect = el(SLUG + '-redirect').checked && ssl;
    var gzip = el(SLUG + '-gzip').checked;
    var cert = el(SLUG + '-cert').value.trim();
    var key = el(SLUG + '-key').value.trim();

    var out = '';
    if (redirect) {
      out += 'server {\n' +
        '    listen ' + port + ';\n' +
        '    server_name ' + domain + ';\n' +
        '    return 301 https://$host$request_uri;\n' +
        '}\n\n';
    }
    out += 'server {\n';
    out += '    listen ' + (ssl ? '443 ssl' : port) + ';\n';
    if (ssl && !redirect) out += '    listen ' + port + ';\n';
    out += '    server_name ' + domain + ';\n\n';
    if (ssl) {
      out += '    ssl_certificate ' + cert + ';\n' +
        '    ssl_certificate_key ' + key + ';\n' +
        '    ssl_protocols TLSv1.2 TLSv1.3;\n' +
        '    ssl_prefer_server_ciphers on;\n\n';
    }
    if (gzip) {
      out += '    gzip on;\n' +
        '    gzip_types text/plain text/css application/json application/javascript text/xml;\n' +
        '    gzip_min_length 1024;\n\n';
    }
    if (mode === 'static') {
      out += '    root ' + target + ';\n' +
        '    index index.html index.htm;\n\n' +
        '    location / {\n' +
        '        try_files $uri $uri/ =404;\n' +
        '    }\n';
    } else {
      out += '    location / {\n' +
        '        proxy_pass ' + target + ';\n' +
        '        proxy_set_header Host $host;\n' +
        '        proxy_set_header X-Real-IP $remote_addr;\n' +
        '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n' +
        '        proxy_set_header X-Forwarded-Proto $scheme;\n' +
        '    }\n';
    }
    out += '}\n';
    el(SLUG + '-output').value = out;
  }

  try {
    TN.on(SLUG + '-generate', 'click', generate);
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate a config first.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate a config first.'); return; }
      TN.downloadText(v, 'nginx-site.conf', 'text/plain');
    });
    generate();
  } catch (e) { /* never throw on load */ }
})();
