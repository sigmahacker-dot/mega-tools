/* Dummy Data Generator — realistic fake rows: names, emails, phones, addresses. */
(function () {
  'use strict';
  var SLUG = 'dummy-data-generator';

  var FIRST = ['Ayesha','Bilal','Chen','Diana','Elena','Farhan','Grace','Hassan','Ivy','Jamal','Kira','Liam','Maria','Nadia','Omar','Priya','Quinn','Ravi','Sara','Tariq','Uma','Victor','Wendy','Xander','Yusuf','Zara','Ahmed','Beatriz','Carlos','Deepak','Elif','Faisal','Gina','Hamza','Ines','Junaid','Kamal','Lena','Mei','Noor'];
  var LAST = ['Khan','Sharma','Garcia','Ahmed','Ali','Patel','Rossi','Hussain','Kim','Nguyen','Silva','Bakshi','Chen','Dube','Farooq','Gupta','Haddad','Iqbal','Joshi','Kapoor','Lopez','Malik','Nair','Osman','Parker','Qureshi','Raza','Singh','Tanaka','Usman','Verma','Wang','Yilmaz','Zaidi','Abbas','Brown','Chaudhry','Das','Elahi','Fernandez'];
  var STREET = ['Maple Street','Oak Avenue','Cedar Lane','Pine Road','Elm Drive','Birch Boulevard','Willow Way','Aspen Court','Juniper Place','Magnolia Terrace','Chestnut Street','Walnut Avenue','Spruce Lane','Holly Road','Ivy Drive','Laurel Boulevard','Poplar Way','Sycamore Court','Acacia Place','Palm Terrace'];
  var CITY = ['Lahore, Pakistan','Karachi, Pakistan','Islamabad, Pakistan','Mumbai, India','Delhi, India','Dhaka, Bangladesh','London, UK','New York, USA','Toronto, Canada','Sydney, Australia','Dubai, UAE','Riyadh, Saudi Arabia','Istanbul, Turkey','Kuala Lumpur, Malaysia','Singapore, Singapore'];
  var DOMAIN = ['example.com','mail.com','testmail.org','sample.net','demo.io'];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function num(n) { var s = ''; for (var i = 0; i < n; i++) s += Math.floor(Math.random() * 10); return s; }

  function makeRow() {
    var fn = pick(FIRST), ln = pick(LAST);
    var email = (fn + '.' + ln + num(2)).toLowerCase().replace(/[^a-z.0-9]/g, '') + '@' + pick(DOMAIN);
    var phone = '+92 3' + num(2) + ' ' + num(7);
    var addr = num(2).replace(/^0/, '1') + ' ' + pick(STREET) + ', ' + pick(CITY);
    return { name: fn + ' ' + ln, email: email, phone: phone, address: addr };
  }
  function toCSV(rows) {
    var out = 'Name,Email,Phone,Address\n';
    rows.forEach(function (r) {
      out += '"' + r.name + '","' + r.email + '","' + r.phone + '","' + r.address + '"\n';
    });
    return out;
  }

  var current = [];
  function render() {
    var box = TN.el(SLUG + '-output');
    if (!current.length) { box.textContent = 'Press Generate Data to create realistic test rows.'; return; }
    var html = '<table style="width:100%;border-collapse:collapse;font-size:.82rem"><thead><tr>' +
      '<th style="text-align:left;padding:6px;border-bottom:1px solid #444">Name</th>' +
      '<th style="text-align:left;padding:6px;border-bottom:1px solid #444">Email</th>' +
      '<th style="text-align:left;padding:6px;border-bottom:1px solid #444">Phone</th>' +
      '<th style="text-align:left;padding:6px;border-bottom:1px solid #444">Address</th></tr></thead><tbody>';
    current.forEach(function (r) {
      html += '<tr><td style="padding:6px;border-bottom:1px solid #333">' + TN.esc(r.name) + '</td>' +
        '<td style="padding:6px;border-bottom:1px solid #333">' + TN.esc(r.email) + '</td>' +
        '<td style="padding:6px;border-bottom:1px solid #333">' + TN.esc(r.phone) + '</td>' +
        '<td style="padding:6px;border-bottom:1px solid #333">' + TN.esc(r.address) + '</td></tr>';
    });
    box.innerHTML = html + '</tbody></table>';
  }

  function init() {
    if (!TN.el(SLUG + '-go')) return;
    TN.on(SLUG + '-go', 'click', function () {
      try {
        TN.clearErr(SLUG + '-error');
        var n = parseInt(TN.el(SLUG + '-count').value, 10) || 10;
        current = [];
        for (var i = 0; i < n; i++) current.push(makeRow());
        render();
      } catch (e) { TN.setErr(SLUG + '-error', 'Could not generate data. Please try again.'); }
    });
    TN.on(SLUG + '-copy', 'click', function () {
      if (!current.length) { TN.setErr(SLUG + '-error', 'Generate data first.'); return; }
      var btn = TN.el(SLUG + '-copy');
      TN.copy(toCSV(current)).then(function (ok) {
        btn.textContent = ok ? 'Copied ✓' : 'Copy CSV';
        setTimeout(function () { btn.textContent = 'Copy CSV'; }, 1200);
      });
    });
    TN.on(SLUG + '-download', 'click', function () {
      if (!current.length) { TN.setErr(SLUG + '-error', 'Generate data first.'); return; }
      TN.downloadText(toCSV(current), 'dummy-data.csv', 'text/csv');
    });
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
