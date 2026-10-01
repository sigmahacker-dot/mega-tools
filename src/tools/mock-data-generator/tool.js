/* Mock Data Generator — typed field rows → realistic JSON/CSV rows. */
(function () {
  'use strict';
  var SLUG = 'mock-data-generator';
  var TYPES = ['name', 'email', 'phone', 'company', 'city', 'lorem', 'number', 'date', 'boolean', 'uuid'];

  var FIRST = ['Ava', 'Liam', 'Mia', 'Noah', 'Zoe', 'Ethan', 'Ruby', 'Leo', 'Ivy', 'Owen',
    'Aria', 'Kai', 'Nora', 'Felix', 'Lena', 'Omar', 'Priya', 'Sara', 'Tom', 'Uma'];
  var LAST = ['Smith', 'Khan', 'Garcia', 'Kim', 'Novak', 'Ali', 'Brown', 'Silva', 'Rossi', 'Haddad',
    'Meyer', 'Dubois', 'Tanaka', 'Ivanov', 'Okafor', 'Larsen', 'Costa', 'Weber', 'Fischer', 'Aziz'];
  var COMPANIES = ['Acme', 'Globex', 'Initech', 'Umbrella', 'Hooli', 'Stark', 'Wayne', 'Massive Dynamic',
    'Cyberdyne', 'Soylent', 'Tyrell', 'Aperture', 'Wonka', 'Gekko', 'Nakatomi'];
  var SUFFIX = ['Inc', 'LLC', 'Ltd', 'GmbH', 'Co', 'Labs', 'Systems', 'Group'];
  var CITIES = ['Karachi', 'Lahore', 'Islamabad', 'London', 'New York', 'Tokyo', 'Berlin', 'Paris',
    'Dubai', 'Toronto', 'Sydney', 'Mumbai', 'Cairo', 'Istanbul', 'Nairobi'];
  var WORDS = ('lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor ' +
    'incididunt ut labore et dolore magna aliqua enim quis nostrud exercitation ullamco laboris ' +
    'nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse ' +
    'cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui ' +
    'officia deserunt mollit anim id est laborum').split(' ');

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }
  function clear() { TN.clearErr(SLUG + '-error'); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function ri(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }

  function uuid() {
    var b = new Uint8Array(16);
    crypto.getRandomValues(b);
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    var h = Array.prototype.map.call(b, function (x) {
      return ('0' + x.toString(16)).slice(-2);
    }).join('');
    return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' +
           h.slice(16, 20) + '-' + h.slice(20);
  }

  function genValue(type) {
    switch (type) {
      case 'name': return pick(FIRST) + ' ' + pick(LAST);
      case 'email': {
        var n = pick(FIRST).toLowerCase() + '.' + pick(LAST).toLowerCase();
        return n + ri(1, 999) + '@example.com';
      }
      case 'phone': return '+' + ri(1, 99) + ' ' + ri(100, 999) + ' ' + ri(100, 999) + ' ' + ri(1000, 9999);
      case 'company': return pick(COMPANIES) + ' ' + pick(SUFFIX);
      case 'city': return pick(CITIES);
      case 'lorem': {
        var n = ri(6, 14), s = [];
        for (var i = 0; i < n; i++) s.push(pick(WORDS));
        return s.join(' ');
      }
      case 'number': return ri(1, 10000);
      case 'date': {
        var d = new Date(ri(2020, 2026), ri(0, 11), ri(1, 28));
        return d.toISOString().slice(0, 10);
      }
      case 'boolean': return Math.random() < 0.5;
      case 'uuid': return uuid();
      default: return '';
    }
  }

  function addRow(name, type) {
    var wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;gap:8px;margin-bottom:8px';
    var ni = document.createElement('input');
    ni.className = 'input'; ni.placeholder = 'field name'; ni.value = name || '';
    ni.setAttribute('aria-label', 'Field name');
    var sel = document.createElement('select');
    sel.className = 'input';
    sel.style.flex = '1.4';
    sel.setAttribute('aria-label', 'Field type');
    TYPES.forEach(function (t) {
      var o = document.createElement('option');
      o.value = t; o.textContent = t;
      if (t === type) o.selected = true;
      sel.appendChild(o);
    });
    var rm = document.createElement('button');
    rm.className = 'btn btn-outline'; rm.textContent = '✕';
    rm.setAttribute('aria-label', 'Remove field');
    rm.addEventListener('click', function () { wrap.remove(); });
    wrap.appendChild(ni); wrap.appendChild(sel); wrap.appendChild(rm);
    el(SLUG + '-fields').appendChild(wrap);
  }

  function csvCell(v) {
    var s = String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  function generate() {
    clear();
    var rows = el(SLUG + '-fields').children;
    var fields = [];
    for (var i = 0; i < rows.length; i++) {
      var ins = rows[i].querySelectorAll('input,select');
      var name = ins[0].value.trim().replace(/\s+/g, '_').toLowerCase() || ('field' + (i + 1));
      fields.push({ name: name, type: ins[1].value });
    }
    if (!fields.length) { fail('Add at least one field.'); return; }
    var count = parseInt(el(SLUG + '-rows').value, 10);
    if (!count || count < 1 || count > 1000) { fail('Rows must be between 1 and 1000.'); return; }
    var data = [];
    for (var r = 0; r < count; r++) {
      var obj = {};
      fields.forEach(function (f) { obj[f.name] = genValue(f.type); });
      data.push(obj);
    }
    var out, ext, mime;
    if (el(SLUG + '-format').value === 'csv') {
      var head = fields.map(function (f) { return csvCell(f.name); }).join(',');
      var lines = data.map(function (o) {
        return fields.map(function (f) { return csvCell(o[f.name]); }).join(',');
      });
      out = head + '\n' + lines.join('\n');
      ext = 'mock-data.csv'; mime = 'text/csv';
    } else {
      out = JSON.stringify(data, null, 2);
      ext = 'mock-data.json'; mime = 'application/json';
    }
    el(SLUG + '-output').value = out;
    el(SLUG + '-download').setAttribute('data-ext', ext);
    el(SLUG + '-download').setAttribute('data-mime', mime);
  }

  try {
    TN.on(SLUG + '-add', 'click', function () { addRow('', 'name'); });
    TN.on(SLUG + '-generate', 'click', generate);
    TN.on(SLUG + '-copy', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate data first.'); return; }
      TN.copy(v).then(function (ok) { if (!ok) fail('Copy failed — select the text manually.'); });
    });
    TN.on(SLUG + '-download', 'click', function () {
      var v = el(SLUG + '-output').value;
      if (!v) { fail('Generate data first.'); return; }
      var btn = el(SLUG + '-download');
      TN.downloadText(v, btn.getAttribute('data-ext') || 'mock-data.txt',
        btn.getAttribute('data-mime') || 'text/plain');
    });
    addRow('id', 'uuid');
    addRow('name', 'name');
    addRow('email', 'email');
    addRow('city', 'city');
  } catch (e) { /* never throw on load */ }
})();
