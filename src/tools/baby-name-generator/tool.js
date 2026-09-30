(function () {
  'use strict';
  var P = 'baby-name-generator-';
  function g(id) { return document.getElementById(P + id); }

  var goBtn = g('go');
  if (!goBtn) return;

  // Each entry: [name, meaning]
  var NAMES = {
    pakistani: {
      boy: [["Ahmed","Most praised"],["Ali","Exalted, noble"],["Bilal","Fresh water; first muezzin"],["Hamza","Strong, steadfast like a lion"],["Hassan","Handsome, good"],["Hussain","Beautiful, handsome"],["Omar","Flourishing, long-lived"],["Usman","Devout and wise"],["Daniyal","God is my judge"],["Ibrahim","Father of many nations"],["Ismail","God hears"],["Yusuf","God increases"],["Musa","Drawn from the water"],["Talha","Fruitful tree"],["Zubair","Strong, intelligent"],["Salman","Safe and secure"],["Farhan","Joyful, merry"],["Adnan","Settler, pioneer"],["Imran","Prosperity"],["Kamran","Successful, fortunate"],["Shahzaib","Kingly, royal"],["Rayan","Lush, well-watered"],["Ayan","Gift of God"],["Zayan","Bright, radiant"],["Arham","Most merciful"],["Fahad","Panther, leopard"],["Saad","Happiness, good fortune"],["Taha","Pure, upright"],["Yasin","Rich, prosperous"],["Mustafa","The chosen one"]],
      girl: [["Ayesha","Alive, prosperous"],["Fatima","Captivating"],["Zainab","Fragrant flower"],["Maryam","Beloved, pure"],["Khadija","Trustworthy, respected"],["Amina","Trustworthy, faithful"],["Hafsa","Young lioness"],["Mahnoor","Moonlight"],["Noor","Light, radiance"],["Hira","Diamond"],["Areeba","Wise, intelligent"],["Anaya","God's answer, blessing"],["Zoya","Life"],["Zara","Blooming flower"],["Alina","Noble, bright"],["Esha","Life"],["Iqra","Read, recite"],["Saba","Morning breeze"],["Rida","Contentment"],["Dua","Prayer"],["Manahil","Springs of fresh water"],["Hoorain","Beautiful-eyed"],["Laiba","Most beautiful"],["Inaya","Gift, care"],["Mahira","Skilled, expert"],["Fiza","Gentle breeze"],["Rabia","Spring, garden"],["Sana","Radiance, praise"],["Warda","Rose"],["Bushra","Good news"]]
    },
    arabic: {
      boy: [["Abdullah","Servant of God"],["Muhammad","Praised, commendable"],["Khalid","Eternal, immortal"],["Tariq","Morning star"],["Zaid","Growth, abundance"],["Faisal","Decisive"],["Nasser","Helper, victorious"],["Rashid","Rightly guided"],["Karim","Generous, noble"],["Jamal","Beauty, grace"],["Samir","Evening companion"],["Nabil","Noble, excellent"],["Hadi","Guide, leader"],["Amin","Trustworthy"],["Rami","Archer, marksman"],["Waleed","Newborn child"],["Suhail","Gentle; bright star"],["Anwar","Luminous, radiant"],["Basim","Smiling"],["Jibril","Gabriel, archangel"],["Luqman","Wise sage"],["Idris","Studious, learned"],["Yahya","God is gracious"],["Zakariya","Remembered by God"],["Yunus","Dove"],["Ayub","Patient, steadfast"],["Dawood","Beloved"],["Sulaiman","Man of peace"],["Haris","Guardian, protector"],["Qasim","One who divides fairly"]],
      girl: [["Layla","Night, dark beauty"],["Yasmin","Jasmine flower"],["Salma","Peaceful, safe"],["Rana","Beautiful to gaze upon"],["Dina","Love, affection"],["Hana","Happiness, bliss"],["Jamila","Beautiful, graceful"],["Karima","Generous, noble"],["Nadia","Hope"],["Rania","Queenly, content"],["Samira","Night companion"],["Farah","Joy, happiness"],["Hiba","Gift, blessing"],["Lina","Tender, delicate"],["Maha","Beautiful eyes"],["Noura","Radiant light"],["Rasha","Young gazelle"],["Saja","Calm, tranquil"],["Tahira","Pure, chaste"],["Wafa","Loyalty"],["Zahra","Blooming flower"],["Amira","Princess, leader"],["Dalia","Gentle vine"],["Iman","Faith, belief"],["Jana","Harvest, paradise garden"],["Kenza","Treasure"],["Mayar","Glow of the moon"],["Nujud","Wise, sensible"],["Qamar","Moon"],["Lama","Dark-lipped beauty"]]
    },
    western: {
      boy: [["James","Supplanter"],["William","Resolute protector"],["Oliver","Olive tree"],["Henry","Ruler of the home"],["Alexander","Defender of men"],["Ethan","Strong, firm"],["Daniel","God is my judge"],["Matthew","Gift of God"],["Noah","Rest, comfort"],["Liam","Resolute protector"],["Lucas","Bringer of light"],["Mason","Stone worker"],["Elijah","My God is Yahweh"],["Logan","Little hollow"],["Jack","God is gracious"],["Owen","Noble, young warrior"],["Nathan","Gift"],["Caleb","Whole-hearted, faithful"],["Ryan","Little king"],["Jacob","Supplanter"],["Michael","Who is like God"],["David","Beloved"],["Samuel","God has heard"],["Benjamin","Son of the right hand"],["Leo","Lion"],["Felix","Lucky, fortunate"],["Hugo","Mind, intellect"],["Theo","Gift of God"],["Arthur","Bear, noble"],["Gabriel","God is my strength"]],
      girl: [["Olivia","Olive tree"],["Emma","Universal, whole"],["Sophia","Wisdom"],["Ava","Life"],["Isabella","God is my oath"],["Mia","Mine, beloved"],["Amelia","Industrious"],["Harper","Harp player"],["Evelyn","Desired, wished for"],["Abigail","Father's joy"],["Emily","Industrious, striving"],["Elizabeth","God is my oath"],["Sofia","Wisdom"],["Avery","Ruler of the elves"],["Ella","Fairy maiden, light"],["Scarlett","Bright red"],["Grace","Grace, favor"],["Chloe","Blooming"],["Victoria","Victory"],["Lily","Lily flower, purity"],["Hannah","Grace, favor"],["Zoe","Life"],["Penelope","Weaver"],["Nora","Light, honor"],["Stella","Star"],["Aurora","Dawn"],["Hazel","Hazel tree"],["Violet","Violet flower"],["Ruby","Deep red gem"],["Claire","Clear, bright"]]
    },
    indian: {
      boy: [["Aarav","Peaceful, calm sound"],["Arjun","Bright, shining"],["Vihaan","Dawn, first light"],["Vivaan","Full of life"],["Aditya","The sun"],["Krishna","Divine, all-attractive"],["Reyansh","Ray of light"],["Atharv","Lord of knowledge"],["Kabir","Great, powerful"],["Ishaan","Guardian of the sun"],["Rudra","Remover of sorrows"],["Dhruv","Constant, pole star"],["Yash","Fame, glory"],["Dev","Divine, godlike"],["Om","The sacred sound"],["Pranav","Sacred syllable Om"],["Shaurya","Valor, courage"],["Veer","Brave, heroic"],["Aryan","Noble, honored"],["Rohan","Ascending, blossoming"],["Sameer","Companion, friend"],["Nikhil","Whole, complete"],["Varun","Lord of the waters"],["Karan","Helper, doer"],["Laksh","Aim, goal"],["Manav","Human, humane"],["Neil","Blue, champion"],["Parth","Charioteer, prince"],["Rudransh","Part of Lord Shiva"],["Shlok","Verse, hymn"]],
      girl: [["Aadhya","First power"],["Ananya","Unique, matchless"],["Diya","Lamp, light"],["Myra","Sweet, extraordinary"],["Sara","Princess, noble"],["Ira","Earth"],["Navya","New, fresh"],["Aanya","Gracious"],["Saanvi","Goddess Lakshmi"],["Riya","Singer, graceful"],["Pari","Fairy"],["Kiara","Bright, famous"],["Tara","Star"],["Meera","Devotee, prosperous"],["Kavya","Poetry"],["Anika","Graceful, brilliant"],["Ishita","Desired, cherished"],["Tanvi","Delicate, beautiful"],["Divya","Divine, heavenly"],["Naina","Beautiful gaze"],["Shreya","Beautiful, auspicious"],["Pooja","Worship, prayer"],["Ritu","Season"],["Simran","Remembrance, meditation"],["Anjali","Offering, gift"],["Deepika","Little light"],["Lakshmi","Goddess of wealth"],["Priya","Beloved, dear"],["Rani","Queen"],["Sita","Furrow; goddess"]]
    },
    turkish: {
      boy: [["Emir","Prince, commander"],["Kerem","Noble, generous"],["Efe","Brave leader"],["Mert","Brave, manly"],["Deniz","Sea"],["Aras","Brave as the river"],["Doruk","Mountain peak"],["Baran","Rain"],["Kaan","Ruler, khan"],["Alp","Hero, brave"],["Tuna","The Danube river"],["Onur","Honor"],["Serkan","Noble blood"],["Emre","Loving friend"],["Burak","Lightning"],["Can","Soul, life"],["Demir","Iron"],["Ege","The Aegean sea"],["Kuzey","North"],["Poyraz","North-east wind"],["Rüzgar","Wind"],["Volkan","Volcano"],["Yiğit","Brave young man"],["Alperen","Brave saint-warrior"],["Batuhan","Mighty ruler"],["Göktuğ","Banner of the sky"],["Koray","Ember moon"],["Taner","Born at dawn"],["Umut","Hope"],["Yağız","Strong, dark steed"]],
      girl: [["Elif","Slender, graceful"],["Zeynep","Precious, ornamental"],["Aylin","Halo around the moon"],["Defne","Laurel tree"],["Selin","Flowing water"],["Aslı","Genuine, original"],["Ceren","Young gazelle"],["Derya","Sea, ocean"],["Ece","Queen"],["Gamze","Dimple"],["Hande","Smiling, cheerful"],["İpek","Silk"],["Melis","Honey-sweet"],["Naz","Coy grace"],["Pınar","Spring, fountain"],["Sude","Tranquil, blessed"],["Yağmur","Rain"],["Esra","Swift, quick"],["Beren","Strong, clever"],["Damla","Water drop"],["Ecrin","Reward from God"],["Nisan","April"],["Peri","Fairy"],["Simge","Symbol"],["Tuana","Strong and powerful"],["Yaren","Close friend"],["Zehra","Blooming, radiant"],["Gül","Rose"],["Tuğçe","Little banner tuft"],["Zümra","Emerald"]]
    }
  };

  function shuffleCopy(arr) {
    var a = arr.slice(), i, j, t;
    for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function generate() {
    TN.clearErr(P + 'error');
    var okEl = g('copied');
    if (okEl) okEl.classList.remove('show');

    var gender = g('gender') ? g('gender').value : 'boy';
    var origin = g('origin') ? g('origin').value : 'pakistani';
    var count = g('count') ? parseInt(g('count').value, 10) : 10;

    var group = NAMES[origin];
    if (!group) { TN.setErr(P + 'error', 'Please choose a valid origin.'); return; }
    var pool = gender === 'any' ? group.boy.concat(group.girl)
             : gender === 'girl' ? group.girl : group.boy;
    if (!pool || !pool.length) { TN.setErr(P + 'error', 'No names found for that selection.'); return; }
    if (isNaN(count) || count < 1) count = 10;
    count = Math.min(count, pool.length);

    var picks = shuffleCopy(pool).slice(0, count);
    var list = g('list');
    if (!list) return;
    list.innerHTML = '';
    picks.forEach(function (entry) {
      var card = document.createElement('div');
      card.className = 'name-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('title', 'Tap to copy');
      var nm = document.createElement('div');
      nm.className = 'nm';
      nm.textContent = entry[0];
      var mn = document.createElement('div');
      mn.className = 'mn';
      mn.textContent = entry[1] || '';
      card.appendChild(nm);
      card.appendChild(mn);
      function doCopy() {
        TN.copy(entry[0]).then(function () {
          var ok = g('copied');
          if (ok) {
            ok.textContent = 'Copied: ' + entry[0];
            ok.classList.add('show');
          }
        }).catch(function () {
          TN.setErr(P + 'error', 'Could not copy — your browser blocked clipboard access.');
        });
      }
      card.addEventListener('click', doCopy);
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); doCopy(); }
      });
      list.appendChild(card);
    });
  }

  TN.on(goBtn, 'click', generate);
  // Generate an initial set on load so the page isn't empty.
  generate();
})();
