(function () {
  'use strict';
  var P = 'clothing-size-converter-';
  var ERR = P + 'error';
  function g(id) { return document.getElementById(P + id); }
  var CATS = {
    tops: {
      name: "Men's tops",
      cols: ['US / UK', 'EU', 'Chest (in)'],
      rows: [
        ['XS (32–34)', '42', '32–34'], ['S (35–37)', '44', '35–37'], ['M (38–40)', '46', '38–40'],
        ['L (41–43)', '48', '41–43'], ['XL (44–46)', '50', '44–46'], ['XXL (47–49)', '52', '47–49']
      ]
    },
    pants: {
      name: "Men's pants (waist)",
      cols: ['US waist', 'EU', 'Inches'],
      rows: [
        ['28', '44', '28"'], ['30', '46', '30"'], ['32', '48', '32"'],
        ['34', '50', '34"'], ['36', '52', '36"'], ['38', '54', '38"'], ['40', '56', '40"']
      ]
    },
    dresses: {
      name: "Women's dresses",
      cols: ['US', 'UK', 'EU'],
      rows: [
        ['0', '4', '32'], ['2', '6', '34'], ['4', '8', '36'], ['6', '10', '38'],
        ['8', '12', '40'], ['10', '14', '42'], ['12', '16', '44'], ['14', '18', '46']
      ]
    },
    shoes: {
      name: "Shoes (men's)",
      cols: ['US', 'UK', 'EU', 'Foot (cm)'],
      rows: [
        ['6', '5.5', '38.5', '24.0'], ['6.5', '6', '39', '24.5'], ['7', '6.5', '40', '25.0'],
        ['7.5', '7', '40.5', '25.5'], ['8', '7.5', '41', '26.0'], ['8.5', '8', '42', '26.5'],
        ['9', '8.5', '42.5', '27.0'], ['9.5', '9', '43', '27.5'], ['10', '9.5', '44', '28.0'],
        ['10.5', '10', '44.5', '28.5'], ['11', '10.5', '45', '29.0'], ['12', '11', '46', '30.0'],
        ['13', '12', '47.5', '31.0']
      ]
    }
  };
  function fillCats() {
    var sel = g('cat');
    sel.innerHTML = '';
    Object.keys(CATS).forEach(function (k) {
      var o = document.createElement('option');
      o.value = k; o.textContent = CATS[k].name;
      sel.appendChild(o);
    });
  }
  function fillSizes() {
    var cat = CATS[g('cat').value];
    var sel = g('size');
    sel.innerHTML = '';
    cat.rows.forEach(function (r, i) {
      var o = document.createElement('option');
      o.value = String(i); o.textContent = cat.cols[0] + ' ' + r[0];
      sel.appendChild(o);
    });
  }
  function render() {
    TN.clearErr(ERR);
    var cat = CATS[g('cat').value];
    var idx = parseInt(g('size').value, 10) || 0;
    var row = cat.rows[idx];
    var cards = '';
    cat.cols.forEach(function (c, i) {
      cards += '<div class="stat-card"><div class="v">' + TN.esc(row[i]) + '</div><div class="l">' + TN.esc(c) + '</div></div>';
    });
    g('cards').innerHTML = cards;
    var head = '<tr>';
    cat.cols.forEach(function (c) { head += '<th>' + TN.esc(c) + '</th>'; });
    head += '</tr>';
    g('head').innerHTML = head;
    var html = '';
    cat.rows.forEach(function (r, i) {
      html += '<tr' + (i === idx ? ' style="background:rgba(255,90,90,.08);"' : '') + '>';
      r.forEach(function (cell) { html += '<td>' + TN.esc(cell) + '</td>'; });
      html += '</tr>';
    });
    g('body').innerHTML = html;
  }
  try {
    fillCats();
    fillSizes();
    TN.on(P + 'cat', 'change', function () { fillSizes(); render(); });
    TN.on(P + 'size', 'change', render);
    render();
  } catch (e) { /* never throw on load */ }
})();
