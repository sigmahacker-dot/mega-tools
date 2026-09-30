/* Article Rewriter — synonym-swap rewriting engine */
(function () {
  'use strict';
  var input = TN.el('article-rewriter-input');
  var output = TN.el('article-rewriter-output');
  if (!input || !output) return;

  /* word -> [synonyms] */
  var SYN = {
    good: ['great', 'excellent'], bad: ['poor', 'awful'], big: ['large', 'huge'],
    small: ['tiny', 'little'], happy: ['glad', 'joyful'], sad: ['unhappy', 'gloomy'],
    fast: ['quick', 'rapid'], slow: ['sluggish', 'gradual'], easy: ['simple', 'effortless'],
    hard: ['difficult', 'tough'], important: ['crucial', 'vital'], interesting: ['fascinating', 'intriguing'],
    beautiful: ['gorgeous', 'stunning'], new: ['fresh', 'novel'], old: ['ancient', 'aged'],
    great: ['excellent', 'superb'], best: ['finest', 'top'], strong: ['powerful', 'mighty'],
    weak: ['feeble', 'fragile'], rich: ['wealthy', 'affluent'], poor: ['impoverished', 'needy'],
    smart: ['clever', 'intelligent'], stupid: ['foolish', 'silly'], brave: ['courageous', 'bold'],
    scared: ['afraid', 'frightened'], angry: ['furious', 'mad'], calm: ['peaceful', 'serene'],
    loud: ['noisy', 'booming'], quiet: ['silent', 'hushed'], bright: ['radiant', 'vivid'],
    dark: ['dim', 'shadowy'], hot: ['warm', 'heated'], cold: ['chilly', 'freezing'],
    wet: ['damp', 'soaked'], dry: ['arid', 'parched'], full: ['complete', 'packed'],
    empty: ['vacant', 'hollow'], true: ['genuine', 'real'], false: ['untrue', 'fake'],
    right: ['correct', 'accurate'], wrong: ['incorrect', 'mistaken'], near: ['close', 'nearby'],
    far: ['distant', 'remote'], high: ['tall', 'elevated'], low: ['short', 'reduced'],
    long: ['lengthy', 'extended'], short: ['brief', 'concise'], wide: ['broad', 'vast'],
    narrow: ['slim', 'tight'], deep: ['profound', 'intense'], shallow: ['superficial', 'slight'],
    thick: ['dense', 'chunky'], thin: ['slender', 'slim'], heavy: ['weighty', 'hefty'],
    light: ['airy', 'feathery'],
    love: ['adore', 'cherish'], like: ['enjoy', 'appreciate'], want: ['desire', 'wish'],
    need: ['require', 'demand'], help: ['assist', 'aid'], make: ['create', 'produce'],
    use: ['utilize', 'employ'], get: ['obtain', 'acquire'], give: ['provide', 'offer'],
    take: ['grab', 'seize'], come: ['arrive', 'approach'], go: ['depart', 'head'],
    see: ['view', 'observe'], know: ['understand', 'realize'], think: ['believe', 'consider'],
    feel: ['sense', 'experience'], say: ['state', 'declare'], tell: ['inform', 'notify'],
    ask: ['inquire', 'question'], answer: ['reply', 'respond'], work: ['labor', 'toil'],
    play: ['frolic', 'engage'], learn: ['study', 'master'], teach: ['instruct', 'educate'],
    read: ['peruse', 'scan'], write: ['compose', 'pen'], speak: ['talk', 'converse'],
    listen: ['hear', 'heed'], watch: ['observe', 'view'], wait: ['linger', 'pause'],
    start: ['begin', 'commence'], end: ['finish', 'conclude'], stop: ['halt', 'cease'],
    continue: ['proceed', 'persist'], change: ['alter', 'modify'], improve: ['enhance', 'boost'],
    increase: ['raise', 'grow'], decrease: ['reduce', 'lower'], grow: ['expand', 'develop'],
    develop: ['evolve', 'advance'], create: ['build', 'generate'], build: ['construct', 'assemble'],
    design: ['plan', 'craft'], plan: ['scheme', 'outline'], show: ['display', 'reveal'],
    hide: ['conceal', 'obscure'], find: ['discover', 'locate'], lose: ['misplace', 'forfeit'],
    buy: ['purchase', 'acquire'], sell: ['trade', 'market'], send: ['dispatch', 'transmit'],
    receive: ['accept', 'obtain'], open: ['unlock', 'unseal'], close: ['shut', 'seal'],
    clean: ['tidy', 'wash'],
    idea: ['concept', 'notion'], problem: ['issue', 'challenge'], solution: ['answer', 'fix'],
    question: ['query', 'inquiry'], story: ['tale', 'narrative'], time: ['moment', 'period'],
    people: ['folks', 'individuals'], person: ['individual', 'human'], man: ['gentleman', 'guy'],
    woman: ['lady', 'female'], child: ['kid', 'youngster'], friend: ['companion', 'buddy'],
    family: ['relatives', 'household'], home: ['house', 'residence'], house: ['home', 'dwelling'],
    city: ['town', 'metropolis'], country: ['nation', 'land'], world: ['globe', 'earth'],
    place: ['spot', 'location'], thing: ['item', 'object'], way: ['method', 'approach'],
    life: ['existence', 'lifetime'], money: ['cash', 'funds'], food: ['meal', 'cuisine'],
    book: ['volume', 'tome'], car: ['vehicle', 'automobile'], phone: ['mobile', 'handset'],
    computer: ['machine', 'pc'], school: ['academy', 'institution'], job: ['position', 'role']
  };

  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function rewrite(text) {
    var changed = 0, total = 0;
    var out = text.replace(/\b([A-Za-z]+)\b/g, function (match) {
      var lower = match.toLowerCase();
      var syns = SYN[lower];
      if (!syns) return match;
      total++;
      var syn = syns[Math.floor(Math.random() * syns.length)];
      if (syn === lower) return match;
      changed++;
      if (match === match.toUpperCase()) return syn.toUpperCase();
      if (match.charAt(0) === match.charAt(0).toUpperCase()) return capitalize(syn);
      return syn;
    });
    return { text: out, changed: changed, total: total };
  }

  function currentResult() {
    return output.textContent.indexOf('Your rewritten') === 0 ? '' : output.textContent;
  }

  TN.on('article-rewriter-rewrite', 'click', function () {
    try {
      TN.clearErr('article-rewriter-error');
      var t = input.value || '';
      if (!t.trim()) { TN.setErr('article-rewriter-error', 'Paste an article first.'); return; }
      if (t.length > 200000) { TN.setErr('article-rewriter-error', 'Text is too long — please use under 200,000 characters.'); return; }
      var r = rewrite(t);
      output.textContent = r.text;
      var stats = TN.el('article-rewriter-stats');
      if (stats) TN.show(stats);
      TN.el('article-rewriter-changed').textContent = r.changed.toLocaleString('en-US');
      TN.el('article-rewriter-total').textContent = r.total.toLocaleString('en-US');
      TN.el('article-rewriter-pct').textContent = r.total ? Math.round((r.changed / r.total) * 100) + '%' : '0%';
    } catch (e) {
      TN.setErr('article-rewriter-error', 'Rewriting failed. Please try again.');
    }
  });

  TN.on('article-rewriter-copy', 'click', function () {
    var t = currentResult();
    if (!t) { TN.setErr('article-rewriter-error', 'Rewrite an article first.'); return; }
    TN.clearErr('article-rewriter-error');
    TN.copy(t).then(function (ok) {
      if (!ok) TN.setErr('article-rewriter-error', 'Copy failed in this browser. Select the text and press Ctrl/Cmd+C.');
    });
  });
  TN.on('article-rewriter-download', 'click', function () {
    var t = currentResult();
    if (!t) { TN.setErr('article-rewriter-error', 'Rewrite an article first.'); return; }
    TN.clearErr('article-rewriter-error');
    TN.downloadText(t, 'rewritten-article.txt', 'text/plain;charset=utf-8');
  });
  TN.on('article-rewriter-clear', 'click', function () {
    input.value = '';
    output.textContent = 'Your rewritten article will appear here...';
    TN.hide('article-rewriter-stats');
    TN.clearErr('article-rewriter-error');
    input.focus();
  });
})();
