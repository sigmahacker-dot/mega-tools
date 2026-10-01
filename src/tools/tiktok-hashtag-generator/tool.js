/* TikTok Hashtag Generator — niche-based hashtag sets with copy button. */
(function () {
  'use strict';

  var SLUG = 'tiktok-hashtag-generator';
  var lastSet = '';

  var BROAD = ['fyp', 'foryou', 'foryoupage', 'viral', 'trending', 'tiktokmademebuyit', 'explore', 'blowthisup'];
  var BANKS = {
    fitness: ['gymtok', 'fitness', 'workout', 'gymlife', 'fitcheck', 'personaltrainer', 'legday', 'gains', 'fitnessmotivation', 'gymrat'],
    cooking: ['foodtok', 'cooking', 'recipe', 'foodie', 'easyrecipes', 'homecooking', 'chefsoftiktok', 'foodlover', 'mealprep', 'dinnerideas'],
    travel: ['traveltok', 'travel', 'wanderlust', 'traveltips', 'vacation', 'passportready', 'travelguide', 'hiddenplaces', 'solotravel', 'travelvlog'],
    beauty: ['beautytok', 'makeup', 'skincare', 'grwm', 'beautyhacks', 'makeuptutorial', 'skincareroutine', 'glowup', 'cosmetics', 'selfcare'],
    fashion: ['fashiontok', 'ootd', 'style', 'fashion', 'outfitinspo', 'streetstyle', 'thrifted', 'styletips', 'fashionhaul', 'aesthetic'],
    finance: ['financetok', 'moneytok', 'personalfinance', 'investing', 'moneytips', 'budgeting', 'sidehustle', 'financialfreedom', 'savingmoney', 'wealth'],
    comedy: ['comedy', 'funny', 'humor', 'comedytok', 'funnytiktok', 'skit', 'relatable', 'memes', 'laugh', 'pov'],
    education: ['learnontiktok', 'edutok', 'studytok', 'learn', 'studywithme', 'facts', 'didyouknow', 'studytips', 'knowledge', 'schoolhacks'],
    pets: ['pettok', 'dogsoftiktok', 'catsoftiktok', 'pets', 'dogtok', 'cutepets', 'animallovers', 'petcare', 'funnypets', 'dogoftheday'],
    gaming: ['gaming', 'gamertok', 'gamingtiktok', 'videogames', 'streamer', 'esports', 'gamingcommunity', 'pcgaming', 'gameclips', 'gamememes'],
    music: ['musictok', 'musician', 'newmusic', 'singer', 'songwriter', 'cover', 'originalsong', 'musicvideo', 'indieartist', 'vocalist'],
    business: ['businesstok', 'entrepreneur', 'smallbusiness', 'startup', 'businesstips', 'marketing', 'ecommerce', 'ceolife', 'businesstiktok', 'hustle']
  };

  function pick(arr, n) {
    var copy = arr.slice(), out = [];
    while (out.length < n && copy.length) {
      out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
    }
    return out;
  }

  function slugify(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 20);
  }

  function generate() {
    TN.clearErr(SLUG + '-error');
    var nicheRaw = TN.el(SLUG + '-niche').value.trim();
    var mix = TN.el(SLUG + '-mix').value;
    if (!nicheRaw) { TN.setErr(SLUG + '-error', 'Type your niche first.'); return; }

    var key = Object.keys(BANKS).filter(function (k) {
      return nicheRaw.toLowerCase().indexOf(k) !== -1 || k.indexOf(nicheRaw.toLowerCase()) !== -1;
    })[0];
    var nicheTags = key ? BANKS[key].slice() : [];
    var nicheSlug = slugify(nicheRaw);
    if (nicheSlug && nicheTags.indexOf(nicheSlug) === -1) nicheTags.unshift(nicheSlug);

    var total = 12, set;
    if (mix === 'broad') {
      set = pick(BROAD, 8).concat(pick(nicheTags, 4));
    } else if (mix === 'niche') {
      set = pick(nicheTags, 9).concat(pick(BROAD, 3));
    } else {
      set = pick(nicheTags, 7).concat(pick(BROAD, 5));
    }
    // fill up if bank was small
    while (set.length < total) {
      var extra = pick(BROAD.concat(nicheTags), 1)[0];
      if (set.indexOf(extra) === -1) set.push(extra); else break;
    }
    lastSet = set.map(function (t) { return '#' + t; }).join(' ');
    TN.el(SLUG + '-out').textContent = lastSet;
    TN.el(SLUG + '-count').textContent = '(' + set.length + ' tags' + (key ? ', matched: ' + key : ', custom niche') + ')';
  }

  function init() {
    try {
      if (!TN.el(SLUG + '-gen')) return;
      TN.on(SLUG + '-gen', 'click', generate);
      TN.on(SLUG + '-copy', 'click', function () {
        if (!lastSet) { TN.setErr(SLUG + '-error', 'Generate hashtags first.'); return; }
        TN.copy(lastSet).then(function () { TN.clearErr(SLUG + '-error'); })
          .catch(function () { TN.setErr(SLUG + '-error', 'Copy failed — select the text manually.'); });
      });
    } catch (e) { /* never throw on load */ }
  }

  init();
})();