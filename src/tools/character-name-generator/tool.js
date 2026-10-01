/* Character Name Generator — first/last banks across cultures + fantasy. */
(function () {
  'use strict';
  var SLUG = 'character-name-generator';

  var FIRST = {
    western: ['James','Emma','Oliver','Ava','Liam','Sophia','Noah','Isabella','Ethan','Mia','Lucas','Amelia','Mason','Harper','Elijah','Evelyn'],
    'east-asian': ['Hiroshi','Yuki','Wei','Mei','Kenji','Sakura','Jian','Lin','Takeshi','Aiko','Chen','Haruka','Min-jun','Soo-ah','Ren','Li'],
    'south-asian': ['Aarav','Priya','Arjun','Anaya','Vikram','Diya','Rohan','Ishita','Kabir','Meera','Aditya','Zara','Dev','Naina','Karan','Saanvi'],
    'middle-eastern': ['Omar','Layla','Hassan','Yasmin','Ali','Noor','Karim','Amira','Tariq','Zaina','Yusuf','Leila','Samir','Dalia','Nabil','Rania'],
    african: ['Kofi','Amara','Zuri','Tendai','Nia','Jabari','Ayo','Zola','Kwame','Efua','Duma','Imani','Sefu','Naledi','Obi','Asha'],
    latin: ['Diego','Lucia','Mateo','Sofia','Santiago','Valentina','Rafael','Camila','Emilio','Elena','Pablo','Rosa','Carlos','Maria','Jorge','Ana']
  };
  var LAST = {
    western: ['Smith','Carter','Bennett','Hayes','Morgan','Parker','Reed','Sullivan','Turner','Walker','Foster','Graham','Ellis','Thornton','Blake','Cole'],
    'east-asian': ['Tanaka','Kim','Wang','Sato','Park','Li','Chen','Nakamura','Zhang','Nguyen','Kobayashi','Liu','Yamamoto','Han','Lin','Suzuki'],
    'south-asian': ['Sharma','Patel','Khan','Gupta','Singh','Reddy','Iyer','Mehta','Kapoor','Nair','Joshi','Rao','Verma','Bose','Chawla','Das'],
    'middle-eastern': ['Haddad','Nasser','Khalil','Rahman','Aziz','Farouk','Ibrahim','Mahmoud','Saleh','Abbas','Hamdi','Zaki','Barakat','Mansour','Al-Farsi','Haddad'],
    african: ['Mensah','Okafor','Diallo','Adeyemi','Nkosi','Kamara','Toure','Bah','Conteh','Diarra','Sow','Keita','Mbeki','Adebayo','Sarr','Jalloh'],
    latin: ['Garcia','Martinez','Lopez','Hernandez','Perez','Sanchez','Rivera','Torres','Ramirez','Flores','Gomez','Diaz','Morales','Ortiz','Chavez','Ruiz']
  };
  var F_PRE = ['Ael','Bran','Cor','Dain','El','Fael','Gal','Kael','Lor','Myr','Sil','Thal'];
  var F_MID = ['a','ae','an','ar','en','er','ian','il','in','or'];
  var F_SUF = ['dor','dus','mir','rath','ric','ven','win','a','ela','ia','lyn','ria'];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  function genOne(culture) {
    if (culture === 'fantasy') return cap(pick(F_PRE) + pick(F_MID) + pick(F_SUF));
    return pick(FIRST[culture] || FIRST.western) + ' ' + pick(LAST[culture] || LAST.western);
  }

  function render(items) {
    var list = TN.el(SLUG + '-list');
    list.innerHTML = '';
    items.forEach(function (t) {
      var row = document.createElement('div');
      row.className = 'copy-row mt';
      var res = document.createElement('div');
      res.className = 'result';
      res.style.cursor = 'pointer';
      var val = document.createElement('div');
      val.textContent = t;
      res.appendChild(val);
      var btn = document.createElement('button');
      btn.className = 'btn btn-outline btn-sm';
      btn.type = 'button';
      btn.textContent = 'Copy';
      btn.addEventListener('click', function () {
        TN.copy(t).then(function (ok) {
          btn.textContent = ok ? 'Copied ✓' : 'Copy';
          if (!ok) TN.setErr(SLUG + '-error', 'Copy failed — select the text and press Ctrl/Cmd+C.');
          setTimeout(function () { btn.textContent = 'Copy'; }, 1000);
        });
      });
      res.addEventListener('click', function () { btn.click(); });
      row.appendChild(res);
      row.appendChild(btn);
      list.appendChild(row);
    });
  }

  function generate() {
    try {
      TN.clearErr(SLUG + '-error');
      var culture = TN.el(SLUG + '-culture').value;
      var count = parseInt(TN.el(SLUG + '-count').value, 10);
      var seen = {}, out = [], guard = 0;
      while (out.length < count && guard < count * 40) {
        guard++;
        var n = genOne(culture);
        if (!seen[n]) { seen[n] = true; out.push(n); }
      }
      render(out);
    } catch (e) {
      TN.setErr(SLUG + '-error', 'Could not generate names. Please try again.');
    }
  }

  TN.on(SLUG + '-generate', 'click', generate);
})();
