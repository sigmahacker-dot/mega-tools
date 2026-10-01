/* Anagram Generator — all unique permutations filtered against a built-in word list. */
(function () {
  'use strict';
  var SLUG = 'anagram-generator';
  // Common English words used to filter permutations down to real anagrams.
  var WORDS = ('a able about above act actor add admit adopt after again age ago agree ahead air all allow almost alone along ' +
    'already also always among amount an and anger angle angry animal answer any apart apple apply are area argue arm army around ' +
    'arrange arrive art as ask asleep at atom attach attack attempt attend author avoid awake aware baby back bad bag ball bank bar base ' +
    'basic battle be beach bear beat became because become bed before begin behind being believe below belt bench best better between ' +
    'beyond bicycle big bill bird birth black blade blame blank blast blend bless blind block blood bloom blow blue board boat body bold ' +
    'book born borrow both bottle bound bow bowl box boy brain brand brave bread break breath breeze brick bridge brief bright bring ' +
    'broad broke brown brush build bunch burn burst bury bus busy but buy by cabin cable calm came can candle care carry catch cause ' +
    'cease chain chair charm chart chase cheap check cheese chest chief child chill choir choose chorus chose civil claim class clean ' +
    'clear clerk clever click cliff climb clock close cloth cloud coach coast color comet comes comic common cool copy corner could ' +
    'count course court cover crack craft crash crazy cream create credit crime cross crowd crown cruel crush cry crystal curve daily ' +
    'dance danger dare dark dash dear death debate decay decide deep deer defend degree delay delight deliver delta demon deny depth ' +
    'design desk diary dirty discuss ditch dive do doctor does dog dollar done door dot doubt down dozen draft drag drama drank dream ' +
    'dress dried drift drink drive drove dry dusty each eager eagle early earn earth ease east easy eat eaten edge eight either elbow ' +
    'elder elect else empty end enemy enjoy enough enter entire entry equal error escape essay even event every exact exist extra face ' +
    'fact faint fair fairy faith false fame family fancy far fast father fault favor feast fence fever few field fierce fifty fight ' +
    'final find fine finger finish fire first fish fit five flame flash fleet flesh float flood floor flour flow flower fluid focus ' +
    'follow food fool force forest forget form forth forty found frame fresh friend from front frost fruit full funny further garden ' +
    'gather gave gentle giant given glad glance glass gleam glide globe glory glove glow goal goes gold good grace grade grain grand ' +
    'grant grape grass grave great green greet grief grill grind grove grow guard guess guest guide habit hair half hall hand handle ' +
    'happy harbor hard has hasty hate have hawk head heal health heard heart heat heavy hello hence her hero hidden hide high hike ' +
    'hill hint history hit hobby hold hole holy home honor horse hotel house how huge human hurry hurt ice idea ideal image in inch ' +
    'income indeed index inner input instead iron island issue ivory jacket jeans jelly jewel join joint joke judge juice jump just ' +
    'keep kept key kick kind king kiss kitchen knew knife knock known label labor large laser last late laugh layer learn least ' +
    'leave legal lemon less lesson level light limit linen liner listen little lively liver local lock lodge logic lonely long look ' +
    'loose lord lose loss lot loud love lovely lower loyal lucky lunar lunch magic major make man mango march marry master match ' +
    'matter maybe mayor mean meant medal media meet melon melt member memory merry metal meter midst might minor minus minute mirror ' +
    'miss model modern money month moral more morning most mother mound mount mouse mouth movie music must mute nail naive name ' +
    'narrow nasty naval near neat neck need nerve never new news night noble noise none north noted novel now number nurse ocean ' +
    'offer often older olive onion only open opera order other ought ounce outer owner paint panel panic paper parcel park part ' +
    'party paste patch path peace peach pearl pedal penny people pepper perch perfect perform petal phase phone photo piano piece ' +
    'pilot pinch pitch place plain plan plane plant plate plaza plead please plenty pluck plume point polar porch pound pour power ' +
    'praise pray press price pride prime print prize proof proud prove pulse punch pupil pure purple push quart queen quest quick ' +
    'quiet quilt quite quote rabbit race radio rail rain raise range rapid ratio reach react ready realm rebel refer renew reply ' +
    'rescue rest result return reveal rhythm rider right river roast robot rocky roman rose round route royal ruler rumor rural ' +
    'sad safe salad salon sauce scale scare scene scent score scout scrap screen screw script scrub sea seal search season seat ' +
    'second secret sense serve seven shade shadow shake shall shame shape share shark sharp sheep sheet shelf shell shift shine ' +
    'shirt shock shoe shook shore short shout shown sight silly since sing single sink sister sit site six sixth sixty skate ' +
    'skill skin skirt sleep slice slide slim slope small smart smell smile smoke snake sneak sober solar solid solve sonic sorry ' +
    'sound south space spare spark speak speed spell spend spice split spoke spoon sport staff stage stair stand stare start ' +
    'state steal steam steel steep steer stick still sting stock stone stood store storm story stove strand strap straw stream ' +
    'street stress strike string strip stripe strong struck stuck study stuff style sugar suite sunny super sweet swift swing ' +
    'sword table taken tale talent talk tall tame taste teach team teeth tempo ten tense thank that their theme there these ' +
    'thick thief thigh thing think third those though thought three threw throw thumb thunder ticket tiger tight timer title ' +
    'toast today token told tooth top total touch tough tower town trace track trade trail train trait tramp travel tread ' +
    'treat trend trial tribe trick tried troop truck truly trust truth twice twist under union unite until upper upset urban ' +
    'urge urgent usage usual valid value vapor vault verse video visit vital voice voter waist wait wake walk wall wand want ' +
    'warm warn waste watch water wave wax we weak wealth wear weave wedge week weigh weird welcome went were west whale what ' +
    'wheat wheel when where which while white whole whose widen widow width wife wild will willing win wind window wine wing ' +
    'winter wire wise wish with witness woman women wonder wood word work world worry worth would wound wrist write wrong wrote ' +
    'yacht year yeast yellow yield young youth zero zonal').split(' ');
  // Extra anagram-rich words so common anagrams are actually found.
  var EXTRA = ('silent enlist inlets tinsel evil vile live veil dare dear read alert alter later angel glean stale ' +
    'slate least tales stop post pots tops spot loop pool care race acre stressed desserts reward drawer parse ' +
    'spare spear rapes meat mate team lemon melon dusty study night thing elbow below act cat').split(' ');

  var DICT = {};
  WORDS.forEach(function (w) { DICT[w] = true; });
  EXTRA.forEach(function (w) { DICT[w] = true; });

  function permutations(word) {
    var chars = word.split('').sort();
    var results = [], used = new Array(chars.length).fill(false), path = [];
    function backtrack() {
      if (path.length === chars.length) { results.push(path.join('')); return; }
      for (var i = 0; i < chars.length; i++) {
        if (used[i]) continue;
        if (i > 0 && chars[i] === chars[i - 1] && !used[i - 1]) continue; // skip dupes
        used[i] = true;
        path.push(chars[i]);
        backtrack();
        path.pop();
        used[i] = false;
      }
    }
    backtrack();
    return results;
  }

  function run() {
    TN.clearErr(SLUG + '-error');
    var input = TN.el(SLUG + '-input').value.toLowerCase().replace(/[^a-z]/g, '');
    if (!input) { TN.setErr(SLUG + '-error', 'Please type a word (letters only).'); return; }
    if (input.length > 8) { TN.setErr(SLUG + '-error', 'Please use 8 letters or fewer.'); return; }
    var perms = permutations(input);
    var found = [];
    perms.forEach(function (p) {
      if (p !== input && DICT[p]) found.push(p);
    });
    TN.el(SLUG + '-found').textContent = found.length;
    TN.el(SLUG + '-checked').textContent = perms.length.toLocaleString('en-US');
    TN.el(SLUG + '-output').textContent = found.length ?
      found.sort().join(', ') :
      'No anagrams found in the built-in word list. Try another word!';
  }

  try {
    TN.on(SLUG + '-run', 'click', run);
    TN.on(SLUG + '-input', 'keydown', function (e) { if (e.key === 'Enter') run(); });
  } catch (e) { /* never throw on load */ }
})();
