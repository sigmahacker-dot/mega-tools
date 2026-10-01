/* Smoking savings calculator: cigs/day, pack price, quit date -> savings. */
(function () {
  'use strict';
  var SLUG = 'smoking-savings-calculator';
  function $(id) { return document.getElementById(id); }
  function calc() {
    $(SLUG + '-error').textContent = '';
    var cigs = parseFloat($(SLUG + '-cigs').value);
    var price = parseFloat($(SLUG + '-price').value);
    var cur = $(SLUG + '-currency').value || '$';
    var qv = $(SLUG + '-quit').value;
    if (isNaN(cigs) || cigs < 1 || cigs > 200) { $(SLUG + '-error').textContent = 'Enter cigarettes per day (1–200).'; return; }
    if (isNaN(price) || price <= 0) { $(SLUG + '-error').textContent = 'Enter a valid pack price.'; return; }
    if (!qv) { $(SLUG + '-error').textContent = 'Enter your quit date.'; return; }
    var quit = new Date(qv + 'T00:00:00');
    var now = new Date();
    var days = Math.floor((now - quit) / 86400000);
    if (days < 0) { $(SLUG + '-error').textContent = 'Quit date is in the future — enter the day you actually quit.'; return; }
    var dailyCost = (cigs / 20) * price;
    var saved = dailyCost * days;
    var cigsSaved = Math.round(cigs * days);
    function money(x) {
      return cur + x.toLocaleString(undefined, { maximumFractionDigits: 0 });
    }
    $(SLUG + '-saved').textContent = money(saved);
    $(SLUG + '-cigsaved').textContent = cigsSaved.toLocaleString();
    $(SLUG + '-yr1').textContent = money(dailyCost * 365);
    $(SLUG + '-yr5').textContent = money(dailyCost * 365 * 5);
    $(SLUG + '-out').classList.remove('hidden');
    $(SLUG + '-note').textContent = 'Smoke-free for ' + days + ' day' + (days === 1 ? '' : 's') +
      ' · saving about ' + cur + dailyCost.toFixed(2) + ' per day.';
  }
  try { $(SLUG + '-calc').addEventListener('click', calc); } catch (e) { /* never throw on load */ }
})();
