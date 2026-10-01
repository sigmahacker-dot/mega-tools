/* Buzzword Bingo Card — random 5x5 card, free center, clickable marks, printable. */
(function () {
  'use strict';
  var SLUG = 'buzzword-bingo-card';

  var WORDS = ['Synergy', 'Leverage', 'Bandwidth', 'Deep dive', 'Low-hanging fruit', 'Move the needle', 'Circle back', 'Touch base', 'Drill down', 'Double-click', 'Take offline', 'Parking lot', 'Action items', 'Deliverables', 'Stakeholders', 'Buy-in', 'Alignment', 'Cadence', 'North star', 'Quick win', 'Value add', 'Game-changer', 'Thought leadership', 'Best practice', 'Bleeding edge', 'Disrupt', 'Pivot', 'Scale', 'Optimize', 'Streamline', 'Holistic', 'Robust', 'Agile', 'Scrum', 'Sprint', 'KPIs', 'OKRs', 'ROI', 'Bottom line', '30,000 feet', 'Boil the ocean', 'Herd cats', 'Drink the Kool-Aid', 'Open the kimono', 'Peel the onion', 'Run it up the flagpole', 'Ducks in a row', 'Win-win', 'No-brainer', 'Out of pocket', 'Ping me', 'Loop in', 'Hard stop', 'EOD', 'ASAP', 'FYI', 'TBD', 'Net-net', 'At the end of the day', 'Going forward'];

  function shuffled(a) {
    var arr = a.slice();
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function newCard() {
    try {
      TN.clearErr(SLUG + '-error');
      var board = TN.el(SLUG + '-board');
      board.innerHTML = '';
      var picks = shuffled(WORDS).slice(0, 24);
      var k = 0;
      for (var r = 0; r < 5; r++) {
        for (var c = 0; c < 5; c++) {
          var cell = document.createElement('button');
          cell.type = 'button';
          var isFree = (r === 2 && c === 2);
          cell.textContent = isFree ? 'FREE ★' : picks[k++];
          cell.style.cssText = 'min-height:74px;border-radius:10px;border:1px solid #4a5568;background:#1e293b;color:#e2e8f0;font-size:.78rem;padding:8px;cursor:pointer;line-height:1.25';
          if (isFree) {
            cell.style.background = '#166534';
            cell.style.fontWeight = '700';
          }
          cell.addEventListener('click', function () {
            var marked = this.getAttribute('data-marked') === '1';
            var free = this.textContent === 'FREE \u2605';
            if (marked) {
              this.setAttribute('data-marked', '0');
              this.style.background = free ? '#166534' : '#1e293b';
            } else {
              this.setAttribute('data-marked', '1');
              this.style.background = '#4d7c0f';
            }
          });
          board.appendChild(cell);
        }
      }
    } catch (e) { TN.setErr(SLUG + '-error', 'Could not build a card. Please try again.'); }
  }

  function init() {
    if (!TN.el(SLUG + '-new')) return;
    TN.on(SLUG + '-new', 'click', newCard);
    TN.on(SLUG + '-print', 'click', function () {
      if (!TN.el(SLUG + '-board').children.length) { TN.setErr(SLUG + '-error', 'Generate a card first.'); return; }
      window.print();
    });
    newCard();
  }
  try { init(); } catch (e) { /* never throw on load */ }
})();
