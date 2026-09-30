(function () {
  'use strict';
  var S = 'resume-builder';
  function on(id, evt, fn) { try { TN.on(id, evt, fn); } catch (e) {} }
  function esc(s) { try { return TN.esc(String(s == null ? '' : s)); } catch (e) { return ''; } }
  function lines(v) {
    return (v || '').split('\n').map(function (l) { return l.trim(); }).filter(function (l) { return l; });
  }
  function update() {
    try {
      TN.clearErr(S + '-error');
      var name = TN.el(S + '-name').value || 'Your Name';
      var title = TN.el(S + '-title').value;
      var email = TN.el(S + '-email').value;
      var phone = TN.el(S + '-phone').value;
      var loc = TN.el(S + '-location').value;
      var summary = TN.el(S + '-summary').value;
      var exp = lines(TN.el(S + '-experience').value);
      var edu = lines(TN.el(S + '-education').value);
      var skills = (TN.el(S + '-skills').value || '').split(',').map(function (s) { return s.trim(); }).filter(function (s) { return s; });
      var contact = [email, phone, loc].filter(function (x) { return x; }).join('  ·  ');
      var html =
        '<div class="result" id="' + S + '-print-area">' +
        '<h2 style="margin:0 0 2px">' + esc(name) + '</h2>' +
        (title ? '<p style="margin:0 0 8px"><strong>' + esc(title) + '</strong></p>' : '') +
        (contact ? '<p class="muted" style="margin:0 0 12px">' + esc(contact) + '</p>' : '') +
        (summary ? '<h4 style="margin:12px 0 4px">Summary</h4><p style="margin:0">' + esc(summary) + '</p>' : '') +
        (exp.length ? '<h4 style="margin:12px 0 4px">Experience</h4><ul style="margin:0;padding-left:20px">' +
          exp.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') + '</ul>' : '') +
        (edu.length ? '<h4 style="margin:12px 0 4px">Education</h4><ul style="margin:0;padding-left:20px">' +
          edu.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') + '</ul>' : '') +
        (skills.length ? '<h4 style="margin:12px 0 4px">Skills</h4><p style="margin:0">' +
          skills.map(function (s) { return '<span class="tag">' + esc(s) + '</span>'; }).join(' ') + '</p>' : '') +
        '</div>';
      TN.el(S + '-preview').innerHTML = html;
    } catch (e) {}
  }
  ['name', 'title', 'email', 'phone', 'location', 'summary', 'experience', 'education', 'skills'].forEach(function (k) {
    on(S + '-' + k, 'input', update);
    on(S + '-' + k, 'change', update);
  });
  on(S + '-print', 'click', function () {
    try {
      document.body.classList.add(S + '-printing');
      window.print();
      setTimeout(function () { document.body.classList.remove(S + '-printing'); }, 500);
    } catch (e) {}
  });
  try { update(); } catch (e) {}
})();
