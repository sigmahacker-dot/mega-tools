(function () {
  'use strict';
  var ERR = 'prime-number-checker-error';
  var LIMIT64 = (1n << 64n);
  var sieveCache = null;

  function modPow(base, exp, mod) {
    var r = 1n;
    base = base % mod;
    while (exp > 0n) {
      if (exp & 1n) r = (r * base) % mod;
      base = (base * base) % mod;
      exp >>= 1n;
    }
    return r;
  }

  function isPrime(n) {
    if (n < 2n) return false;
    var small = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];
    for (var i = 0; i < small.length; i++) {
      if (n === small[i]) return true;
      if (n % small[i] === 0n) return false;
    }
    var d = n - 1n, s = 0n;
    while ((d & 1n) === 0n) { d >>= 1n; s++; }
    // Deterministic for n < 2^64
    var bases = [2n, 3n, 5n, 7n, 11n, 13n, 17n];
    for (var b = 0; b < bases.length; b++) {
      var a = bases[b] % n;
      if (a === 0n) continue;
      var x = modPow(a, d, n);
      if (x === 1n || x === n - 1n) continue;
      var composite = true;
      for (var r = 1n; r < s; r++) {
        x = (x * x) % n;
        if (x === n - 1n) { composite = false; break; }
      }
      if (composite) return false;
    }
    return true;
  }

  function primeSieve(limit) {
    if (sieveCache) return sieveCache;
    var isP = new Array(limit + 1).fill(true);
    isP[0] = isP[1] = false;
    for (var i = 2; i * i <= limit; i++) {
      if (isP[i]) {
        for (var j = i * i; j <= limit; j += i) isP[j] = false;
      }
    }
    var primes = [];
    for (var k = 2; k <= limit; k++) if (isP[k]) primes.push(k);
    sieveCache = primes;
    return primes;
  }

  function smallestFactor(n) {
    if (n % 2n === 0n) return '2';
    var primes = primeSieve(1000000);
    for (var i = 0; i < primes.length; i++) {
      var p = BigInt(primes[i]);
      if (p * p > n) break; // no factor can hide below sqrt(n)
      if (n % p === 0n) return String(p);
    }
    return 'none \u2264 1,000,000';
  }

  function fmtBig(n) {
    try { return n.toLocaleString('en-US'); } catch (e) { return n.toString(); }
  }

  function check() {
    TN.clearErr(ERR);
    try {
      var el = TN.el('prime-number-checker-input');
      var s = el ? el.value.trim() : '';
      if (!/^\d+$/.test(s)) throw new Error('Enter a positive integer (digits only).');
      var n = BigInt(s.replace(/^0+(?=\d)/, ''));
      if (n >= LIMIT64) throw new Error('Too large — this tool tests integers below 2^64.');
      var verdictEl = TN.el('prime-number-checker-verdict');
      var factorEl = TN.el('prime-number-checker-factor');
      if (isPrime(n)) {
        verdictEl.textContent = fmtBig(n) + ' is PRIME';
        factorEl.textContent = '—';
      } else {
        verdictEl.textContent = fmtBig(n) + ' is COMPOSITE';
        factorEl.textContent = n < 2n ? 'n/a' : smallestFactor(n);
      }
    } catch (err) {
      TN.setErr(ERR, err && err.message ? err.message : 'Invalid input.');
    }
  }

  try {
    TN.on('prime-number-checker-go', 'click', check);
    TN.on('prime-number-checker-input', 'keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); check(); }
    });
  } catch (e) { /* never throw on load */ }
})();
