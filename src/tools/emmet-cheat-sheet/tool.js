/* Emmet Cheat Sheet — 50+ abbreviations with expansions, searchable, click-to-copy. */
(function () {
  'use strict';
  var SLUG = 'emmet-cheat-sheet';
  var GROUPS = [
    ['Nesting & siblings', [
      ['div>p', '<div>\n  <p></p>\n</div>'],
      ['div+p', '<div></div>\n<p></p>'],
      ['div>p>span', '<div>\n  <p>\n    <span></span>\n  </p>\n</div>'],
      ['div>p+span', '<div>\n  <p></p>\n  <span></span>\n</div>'],
      ['div>(p>span)+a', '<div>\n  <p>\n    <span></span>\n  </p>\n  <a href=""></a>\n</div>'],
      ['div>p^span', '<div>\n  <p></p>\n</div>\n<span></span>']
    ]],
    ['Multiplication & numbering', [
      ['ul>li*3', '<ul>\n  <li></li>\n  <li></li>\n  <li></li>\n</ul>'],
      ['ul>li.item$*3', '<ul>\n  <li class="item1"></li>\n  <li class="item2"></li>\n  <li class="item3"></li>\n</ul>'],
      ['ul>li.item$$*3', '… class="item01" … class="item02" … class="item03"'],
      ['h$[title=item$]*3', '<h1 title="item1"></h1>\n<h2 title="item2"></h2>\n<h3 title="item3"></h3>'],
      ['li*3>lorem', '3 list items with lorem ipsum text']
    ]],
    ['Classes, ids & attributes', [
      ['.container', '<div class="container"></div>'],
      ['#main', '<div id="main"></div>'],
      ['p.intro#lead', '<p class="intro" id="lead"></p>'],
      ['a[href=https://example.com]', '<a href="https://example.com"></a>'],
      ['a[href title=Home]', '<a href="" title="Home"></a>'],
      ['input[type=email required]', '<input type="email" required>'],
      ['img[src=pic.jpg alt=Photo]', '<img src="pic.jpg" alt="Photo">']
    ]],
    ['Text', [
      ['p{Hello}', '<p>Hello</p>'],
      ['a{Click me}', '<a href="">Click me</a>'],
      ['p>lorem', '<p>Lorem ipsum dolor sit amet…</p>'],
      ['p>lorem10', '<p>10 words of lorem ipsum</p>']
    ]],
    ['HTML structure', [
      ['!', 'Full HTML5 boilerplate'],
      ['html:5', 'Full HTML5 boilerplate'],
      ['head>meta+title', '<head>\n  <meta>\n  <title></title>\n</head>'],
      ['link:css', '<link rel="stylesheet" href="style.css">'],
      ['script:src', '<script src=""><\/script>']
    ]],
    ['Common elements', [
      ['ul>li', '<ul>\n  <li></li>\n</ul>'],
      ['ol>li*3', '<ol>\n  <li></li> × 3\n</ol>'],
      ['table>tr*2>td*3', 'Table with 2 rows × 3 cells'],
      ['form:get', '<form action="" method="get"></form>'],
      ['input:text', '<input type="text" name="" id="">'],
      ['input:checkbox', '<input type="checkbox" name="" id="">'],
      ['button:submit', '<button type="submit"></button>'],
      ['select>option*3', '<select>\n  <option> × 3\n</select>'],
      ['nav>ul>li*4>a', 'Nav with 4 linked items'],
      ['header+main+footer', '<header></header>\n<main></main>\n<footer></footer>'],
      ['article>h1+p*2', '<article>\n  <h1></h1>\n  <p></p>\n  <p></p>\n</article>'],
      ['figure>img+figcaption', '<figure>\n  <img src="" alt="">\n  <figcaption></figcaption>\n</figure>'],
      ['dl>(dt+dd)*2', 'Definition list with 2 terms'],
      ['div.card>img+h3+p+a', 'Card component skeleton']
    ]],
    ['CSS abbreviations', [
      ['m10', 'margin: 10px;'],
      ['p10-20', 'padding: 10px 20px;'],
      ['w100', 'width: 100px;'],
      ['h100p', 'height: 100%;'],
      ['df', 'display: flex;'],
      ['jcc', 'justify-content: center;'],
      ['aic', 'align-items: center;'],
      ['pos:a', 'position: absolute;'],
      ['t0', 'top: 0;'],
      ['bgc', 'background-color: #fff;'],
      ['c#333', 'color: #333;'],
      ['fz16', 'font-size: 16px;'],
      ['bd1-s', 'border: 1px solid;'],
      ['br10', 'border-radius: 10px;']
    ]]
  ];

  function el(id) { return document.getElementById(id); }
  function fail(msg) { TN.setErr(SLUG + '-error', msg); }

  function render(filter) {
    var host = el(SLUG + '-list');
    host.innerHTML = '';
    var q = (filter || '').toLowerCase().trim();
    var shown = 0;
    GROUPS.forEach(function (g) {
      var items = g[1].filter(function (it) {
        return !q || it[0].toLowerCase().indexOf(q) >= 0 || it[1].toLowerCase().indexOf(q) >= 0;
      });
      if (!items.length) return;
      shown += items.length;
      var h = document.createElement('h3');
      h.textContent = g[0];
      h.style.margin = '18px 0 8px';
      host.appendChild(h);
      items.forEach(function (it) {
        var row = document.createElement('div');
        row.className = 'copy-row';
        row.style.cssText = 'margin-bottom:8px;cursor:pointer;align-items:flex-start';
        row.title = 'Click to copy abbreviation';
        var code = document.createElement('code');
        code.className = 'code';
        code.style.cssText = 'flex:1;white-space:pre-wrap';
        code.textContent = it[0];
        var desc = document.createElement('code');
        desc.className = 'muted';
        desc.style.cssText = 'flex:1.6;font-size:12px;white-space:pre-wrap';
        desc.textContent = it[1];
        row.appendChild(code);
        row.appendChild(desc);
        row.addEventListener('click', function () {
          TN.copy(it[0]).then(function (ok) {
            if (!ok) fail('Copy failed — select the text manually.');
          });
        });
        host.appendChild(row);
      });
    });
    el(SLUG + '-none').classList.toggle('hidden', shown > 0);
  }

  try {
    TN.on(SLUG + '-search', 'input', TN.debounce(function () {
      render(el(SLUG + '-search').value);
    }, 150));
    render('');
  } catch (e) { /* never throw on load */ }
})();
