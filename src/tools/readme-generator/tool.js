/* README Generator — project details + section checkboxes → polished README.md. */
(function () {
  'use strict';
  var SLUG = 'readme-generator';
  var SECTIONS = [
    ['badges', 'Badges', true],
    ['features', 'Features', true],
    ['installation', 'Installation', true],
    ['usage', 'Usage', true],
    ['api', 'API Reference', false],
    ['contributing', 'Contributing', true],
    ['license', 'License', true]
  ];

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }
  function on(key) {
    var cb = el(SLUG + '-sec-' + key);
    return cb && cb.checked;
  }

  function buildSections() {
    var host = el(SLUG + '-sections');
    SECTIONS.forEach(function (s) {
      var lab = document.createElement('label');
      lab.className = 'checkbox-row';
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.id = SLUG + '-sec-' + s[0];
      cb.checked = s[2];
      lab.appendChild(cb);
      lab.appendChild(document.createTextNode(' ' + s[1]));
      host.appendChild(lab);
    });
  }

  function generate() {
    clear();
    var name = el(SLUG + '-name').value.trim();
    if (!name) { fail('Enter a project name.'); return; }
    var tagline = el(SLUG + '-tagline').value.trim();
    var repo = el(SLUG + '-repo').value.trim().replace(/\/$/, '');
    var author = el(SLUG + '-author').value.trim();
    var install = el(SLUG + '-install').value.trim();
    var license = el(SLUG + '-license').value;
    var usage = el(SLUG + '-usage').value.trim();
    var features = el(SLUG + '-features').value.split('\n').map(function (l) { return l.trim(); }).filter(Boolean);

    var md = '# ' + name + '\n\n';
    if (on('badges') && repo) {
      var short = repo.replace(/^https?:\/\//, '');
      md += '[![License](https://img.shields.io/badge/license-' + encodeURIComponent(license) + '-blue.svg)](' + repo + ')\n';
      md += '[![GitHub stars](https://img.shields.io/github/stars/' + short + '.svg)](' + repo + ')\n\n';
    }
    if (tagline) md += tagline + '\n\n';
    md += '## Table of Contents\n\n';
    var toc = [];
    if (on('features') && features.length) toc.push('Features');
    if (on('installation')) toc.push('Installation');
    if (on('usage')) toc.push('Usage');
    if (on('api')) toc.push('API Reference');
    if (on('contributing')) toc.push('Contributing');
    if (on('license')) toc.push('License');
    toc.forEach(function (t) { md += '- [' + t + '](#' + t.toLowerCase().replace(/\s+/g, '-') + ')\n'; });
    md += '\n';

    if (on('features') && features.length) {
      md += '## Features\n\n';
      features.forEach(function (f) { md += '- ' + f + '\n'; });
      md += '\n';
    }
    if (on('installation')) {
      md += '## Installation\n\n```bash\n' + (install || 'npm install') + '\n```\n\n';
    }
    if (on('usage')) {
      md += '## Usage\n\n' + (usage ? '```bash\n' + usage + '\n```\n\n' : 'Add usage examples here.\n\n');
    }
    if (on('api')) {
      md += '## API Reference\n\n| Method | Description |\n| --- | --- |\n| `example()` | Describe what it does |\n\n';
    }
    if (on('contributing')) {
      md += '## Contributing\n\nContributions are welcome! Please open an issue or submit a pull request.\n\n';
    }
    if (on('license')) {
      md += '## License\n\n';
      if (author) md += 'Copyright (c) ' + new Date().getFullYear() + ' ' + author + '.\n\n';
      md += 'This project is licensed under the ' + license + ' License.\n';
    }
    el(SLUG + '-output').value = md;
  }

  try {
    buildSections();
    TN.on(SLUG + '-generate', 'click', generate);
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate a README first.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate a README first.'); return; }
      TN.downloadText(v, 'README.md', 'text/markdown');
    });
  } catch (e) { /* never throw on load */ }
})();
