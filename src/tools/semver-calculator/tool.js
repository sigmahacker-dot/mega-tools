/* SemVer Calculator — parse semver, apply major/minor/patch/pre* bumps per spec. */
(function () {
  'use strict';
  var SLUG = 'semver-calculator';

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }

  function parse(v) {
    var m = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/.exec(v.trim());
    if (!m) return null;
    return { major: +m[1], minor: +m[2], patch: +m[3], pre: m[4] || null };
  }

  function bumpPre(pre, tag) {
    tag = tag || 'beta';
    if (!pre) return tag + '.1';
    var parts = pre.split('.');
    var last = parts[parts.length - 1];
    if (/^\d+$/.test(last)) {
      parts[parts.length - 1] = String(parseInt(last, 10) + 1);
      return parts.join('.');
    }
    return pre + '.1';
  }

  function calc() {
    clear();
    TN.hide(SLUG + '-result');
    var v = parse(el(SLUG + '-current').value);
    if (!v) { fail('Enter a valid semver like 1.4.2 (optional leading v).'); return; }
    var bump = el(SLUG + '-bump').value;
    var tag = el(SLUG + '-tag').value.trim() || 'beta';
    var next, explain;
    switch (bump) {
      case 'major':
        next = (v.major + 1) + '.0.0';
        explain = 'Major bump: breaking changes — minor and patch reset to 0.';
        break;
      case 'minor':
        next = v.major + '.' + (v.minor + 1) + '.0';
        explain = 'Minor bump: new backwards-compatible features — patch resets to 0.';
        break;
      case 'patch':
        next = v.major + '.' + v.minor + '.' + (v.patch + 1);
        explain = 'Patch bump: backwards-compatible bug fixes.';
        break;
      case 'premajor':
        next = (v.major + 1) + '.0.0-' + tag + '.1';
        explain = 'Premajor: bumps to the next major, then starts a prerelease.';
        break;
      case 'preminor':
        next = v.major + '.' + (v.minor + 1) + '.0-' + tag + '.1';
        explain = 'Preminor: bumps to the next minor, then starts a prerelease.';
        break;
      case 'prepatch':
        next = v.major + '.' + v.minor + '.' + (v.patch + 1) + '-' + tag + '.1';
        explain = 'Prepatch: bumps to the next patch, then starts a prerelease.';
        break;
      default: // prerelease
        if (v.pre) {
          next = v.major + '.' + v.minor + '.' + v.patch + '-' + bumpPre(v.pre, tag);
          explain = 'Prerelease bump: increments the existing prerelease number.';
        } else {
          next = v.major + '.' + v.minor + '.' + (v.patch + 1) + '-' + tag + '.1';
          explain = 'Prerelease bump on a stable version: patches, then starts a prerelease.';
        }
    }
    el(SLUG + '-next').textContent = next;
    el(SLUG + '-explain').textContent = explain;
    TN.show(SLUG + '-result');
  }

  try {
    TN.on(SLUG + '-calc', 'click', calc);
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-next').textContent;
      if (!v || v === '—') { fail('Calculate a version first.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
  } catch (e) { /* never throw on load */ }
})();
