/* Secure Note Vault — notes encrypted with AES-GCM, key from PBKDF2. */
(function () {
  'use strict';

  var SLUG = 'secure-note-vault';
  var KEY = 'tn-' + SLUG + '-notes';
  var ITERS = 100000;

  function cryptoOk() {
    return window.crypto && window.crypto.subtle && typeof TextEncoder !== 'undefined';
  }

  function load() {
    try {
      var arr = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function persist(notes) {
    try { localStorage.setItem(KEY, JSON.stringify(notes)); }
    catch (e) { TN.setErr(SLUG + '-error', 'Could not save — browser storage is unavailable.'); }
  }

  function b64encode(bytes) {
    var u8 = new Uint8Array(bytes), bin = '';
    for (var i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
    return btoa(bin);
  }

  function b64decode(s) {
    var bin = atob(s);
    var u8 = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return u8;
  }

  function deriveKey(password, salt) {
    var enc = new TextEncoder();
    return crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey'])
      .then(function (base) {
        return crypto.subtle.deriveKey(
          { name: 'PBKDF2', salt: salt, iterations: ITERS, hash: 'SHA-256' },
          base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
      });
  }

  function encryptNote(password, text) {
    var enc = new TextEncoder();
    var salt = crypto.getRandomValues(new Uint8Array(16));
    var iv = crypto.getRandomValues(new Uint8Array(12));
    return deriveKey(password, salt).then(function (key) {
      return crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, enc.encode(text));
    }).then(function (ct) {
      return b64encode(salt) + '.' + b64encode(iv) + '.' + b64encode(ct);
    });
  }

  function decryptNote(password, packed) {
    var parts = packed.split('.');
    if (parts.length !== 3) return Promise.reject(new Error('bad format'));
    var salt = b64decode(parts[0]), iv = b64decode(parts[1]), ct = b64decode(parts[2]);
    return deriveKey(password, salt).then(function (key) {
      return crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, ct);
    }).then(function (pt) {
      return new TextDecoder().decode(pt);
    });
  }

  function renderLocked() {
    var notes = load();
    TN.el(SLUG + '-state').textContent = '🔒 locked (' + notes.length + ' encrypted notes)';
    var list = TN.el(SLUG + '-list');
    if (!notes.length) { list.innerHTML = '<p class="muted">Vault is empty.</p>'; return; }
    list.innerHTML = notes.map(function (n) {
      return '<div class="tool-card" style="margin:8px 0">' +
        '<strong>🔒 ' + TN.esc(n.title) + '</strong>' +
        '<p class="muted" style="margin:2px 0">' + n.packed.length + ' chars of ciphertext — unlock to read</p>' +
        '<button class="btn btn-sm btn-outline" data-del="' + n.id + '">Delete</button></div>';
    }).join('');
    bindDelete(list);
  }

  function bindDelete(scope) {
    var dels = scope.querySelectorAll('[data-del]');
    for (var i = 0; i < dels.length; i++) {
      (function (b) {
        b.addEventListener('click', function () {
          persist(load().filter(function (x) { return String(x.id) !== b.getAttribute('data-del'); }));
          lock();
        });
      })(dels[i]);
    }
  }

  function lock() {
    TN.el(SLUG + '-pass').value = '';
    renderLocked();
  }

  function unlock() {
    TN.clearErr(SLUG + '-error');
    if (!cryptoOk()) { TN.setErr(SLUG + '-error', 'WebCrypto is unavailable in this browser.'); return; }
    var pass = TN.el(SLUG + '-pass').value;
    if (!pass) { TN.setErr(SLUG + '-error', 'Enter your vault password to unlock.'); return; }
    var notes = load();
    if (!notes.length) { TN.setErr(SLUG + '-error', 'The vault is empty.'); return; }
    var chain = Promise.resolve();
    var results = [];
    notes.forEach(function (n) {
      chain = chain.then(function () {
        return decryptNote(pass, n.packed).then(function (text) {
          results.push({ id: n.id, title: n.title, text: text });
        });
      });
    });
    chain.then(function () {
      var list = TN.el(SLUG + '-list');
      TN.el(SLUG + '-state').textContent = '🔓 unlocked';
      list.innerHTML = results.reverse().map(function (n) {
        return '<div class="tool-card" style="margin:8px 0">' +
          '<strong>' + TN.esc(n.title) + '</strong>' +
          '<p style="margin:4px 0;white-space:pre-wrap">' + TN.esc(n.text) + '</p>' +
          '<button class="btn btn-sm btn-outline" data-del="' + n.id + '">Delete</button></div>';
      }).join('');
      bindDelete(list);
      // clear password from memory shortly after
      setTimeout(function () { TN.el(SLUG + '-pass').value = ''; }, 30000);
    }).catch(function () {
      TN.setErr(SLUG + '-error', 'Wrong password — could not decrypt.');
      renderLocked();
    });
  }

  function saveNote() {
    TN.clearErr(SLUG + '-error');
    if (!cryptoOk()) { TN.setErr(SLUG + '-error', 'WebCrypto is unavailable in this browser.'); return; }
    var pass = TN.el(SLUG + '-pass').value;
    var title = TN.el(SLUG + '-title').value.trim();
    var body = TN.el(SLUG + '-body').value;
    if (!pass) { TN.setErr(SLUG + '-error', 'Enter a vault password first.'); return; }
    if (!title) { TN.setErr(SLUG + '-error', 'Give the note a title.'); return; }
    if (!body) { TN.setErr(SLUG + '-error', 'The note is empty.'); return; }
    encryptNote(pass, body).then(function (packed) {
      var notes = load();
      notes.push({ id: Date.now(), title: title, packed: packed });
      persist(notes);
      TN.el(SLUG + '-title').value = '';
      TN.el(SLUG + '-body').value = '';
      renderLocked();
    }).catch(function () {
      TN.setErr(SLUG + '-error', 'Encryption failed.');
    });
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-save')) return;
      TN.on(SLUG + '-save', 'click', saveNote);
      TN.on(SLUG + '-unlock', 'click', unlock);
      TN.on(SLUG + '-lock', 'click', lock);
      renderLocked();
    } catch (e) { /* never throw on load */ }
  }

  init();
})();