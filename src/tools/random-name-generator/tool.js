(function () {
  'use strict';
  var S = 'random-name-generator';
  // Per origin: male[], female[], last[]
  var DATA = {
    international: {
      male: ['Alexander','Ben','Carlos','Dmitri','Emeka','Felix','Gabriel','Hiroshi','Ivan','Jasper','Kai','Liam','Mateo','Nikhil','Omar','Pablo','Ravi','Santiago','Tariq','Victor','William','Xander','Yusuf','Zane','Daniel','Erik','Finn','Gustav','Henrik','Isaac','Jonas','Kofi','Lucas','Marco','Nils','Otto','Petr','Quinn','Rafael','Stefan','Tomas','Umar'],
      female: ['Aisha','Bianca','Clara','Diana','Elena','Fatima','Grace','Hana','Iris','Julia','Keiko','Lena','Maya','Nadia','Olivia','Priya','Quinn','Rosa','Sofia','Tara','Uma','Vera','Wren','Ximena','Yara','Zara','Amara','Bella','Celine','Daria','Elif','Freya','Giulia','Hazel','Ivy','Jade','Kira','Laila','Mira','Nina','Opal','Pia'],
      last: ['Smith','Garcia','Khan','Nguyen','Silva','Rossi','Kim','Ali','Novak','Silva-Reyes','Okafor','Petrov','Dubois','Haddad','Tanaka','Moreau','Iqbal','Kowalski','Fernandes','Costa','Muller','Ivanov','Osei','Bergstrom','Castillo','Vargas','Duarte','Larsen','Kaur','Weber','Novikov','Santos','Yamada','Diallo','Costa-Mendez','Lindqvist','Ozturk','Ferreira','Gruber','Kowacz']
    },
    pakistani: {
      male: ['Ahmed','Ali','Bilal','Danish','Fahad','Hamza','Imran','Junaid','Kamran','Muhammad','Nabeel','Omar','Rizwan','Saad','Tariq','Usman','Waqas','Yawar','Zain','Adeel','Asad','Faisal','Hassan','Irfan','Khalid','Nasir','Qasim','Salman','Shahid','Umair','Adnan','Arslan','Fawad','Haroon','Javed','Kashif','Noman','Rashid','Sajid','Taimoor','Wasim','Zubair'],
      female: ['Ayesha','Fatima','Hina','Iqra','Javeria','Kiran','Mahnoor','Nadia','Rabia','Sana','Zainab','Areeba','Bushra','Farah','Hira','Irum','Kanwal','Maryam','Nimra','Saba','Shazia','Tehmina','Uzma','Amina','Dania','Fiza','Huma','Isha','Laiba','Mehwish','Noreen','Sadia','Shanza','Tania','Urwa','Warda','Zoya','Anum','Fariha','Gul','Hadia'],
      last: ['Khan','Ahmed','Ali','Malik','Sheikh','Butt','Rana','Chaudhry','Siddiqui','Qureshi','Farooq','Iqbal','Raza','Hussain','Shah','Syed','Abbas','Javed','Mahmood','Akhtar','Anwar','Aslam','Bashir','Chohan','Dar','Gill','Hameed','Imtiaz','Janjua','Khalil','Lodhi','Memon','Naqvi','Pervaiz','Rafiq','Saeed','Tariq','Usmani','Wattoo','Zafar']
    },
    arabic: {
      male: ['Omar','Yusuf','Khalid','Tariq','Hassan','Ahmed','Bilal','Farid','Jamal','Karim','Layla','Mahmoud','Nasser','Qasim','Rashid','Salim','Walid','Zaid','Adnan','Amir','Basim','Daoud','Fahim','Ghazi','Hadi','Ibrahim','Jaber','Khalil','Lutfi','Majid','Nabil','Rami','Samir','Taher','Wissam','Yahya','Ziyad','Anwar','Aziz','Faris','Hisham','Jalal'],
      female: ['Amina','Fatima','Layla','Mariam','Noura','Rania','Salma','Yasmin','Zahra','Aisha','Dana','Huda','Iman','Jamila','Khadija','Lina','Maha','Nadia','Rana','Sara','Tala','Wala','Zainab','Abeer','Dalal','Farah','Hiba','Inas','Jouri','Karima','Lamis','Mona','Najwa','Rasha','Sahar','Thana','Wafa','Yara','Zaina','Amira','Ghada'],
      last: ['Al-Farsi','Al-Harbi','Al-Otaibi','Al-Qahtani','Al-Rashid','Al-Saud','Haddad','Khalidi','Nasser','Aziz','Farouk','Habib','Ibrahim','Jabari','Karam','Laham','Mansour','Najjar','Osman','Qassem','Rahman','Saleh','Taha','Wahab','Zaki','Abadi','Barakat','Dagher','El-Amin','Farah','Ghanem','Hakim','Issa','Jad','Kanaan','Latif','Mokdad','Naim','Qudsi','Saad']
    },
    western: {
      male: ['James','John','Robert','Michael','David','William','Richard','Joseph','Thomas','Charles','Christopher','Daniel','Matthew','Anthony','Mark','Donald','Steven','Paul','Andrew','Joshua','Kevin','Brian','George','Timothy','Ronald','Edward','Jason','Jeffrey','Ryan','Jacob','Nicholas','Gary','Eric','Jonathan','Stephen','Larry','Justin','Scott','Brandon','Benjamin','Samuel','Gregory'],
      female: ['Mary','Patricia','Jennifer','Linda','Elizabeth','Barbara','Susan','Jessica','Sarah','Karen','Lisa','Nancy','Betty','Margaret','Sandra','Ashley','Kimberly','Emily','Donna','Michelle','Carol','Amanda','Melissa','Deborah','Stephanie','Rebecca','Sharon','Laura','Cynthia','Kathryn','Amy','Shirley','Angela','Helen','Anna','Brenda','Pamela','Nicole','Emma','Samantha','Katherine','Christine'],
      last: ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores','Green']
    },
    indian: {
      male: ['Aarav','Arjun','Aditya','Amit','Anil','Deepak','Harish','Karan','Manish','Nikhil','Pranav','Rahul','Ravi','Rohan','Sahil','Sanjay','Suresh','Varun','Vikram','Yash','Abhishek','Akash','Ankit','Dev','Gaurav','Harsh','Ishaan','Jay','Kabir','Laksh','Mohit','Naman','Om','Parth','Raj','Rishabh','Sagar','Tarun','Udit','Vivek','Zaid','Ajay'],
      female: ['Aishwarya','Ananya','Diya','Divya','Ishita','Kavya','Lakshmi','Meera','Neha','Nisha','Pooja','Priya','Riya','Ritika','Shreya','Simran','Sneha','Tanvi','Vanya','Zara','Aditi','Anika','Bhavna','Deepika','Esha','Gauri','Hema','Jaya','Kiran','Lata','Madhuri','Nandini','Pallavi','Radha','Sanya','Tara','Uma','Vidya','Yamini','Asha','Kavita','Ritu'],
      last: ['Sharma','Verma','Patel','Reddy','Iyer','Gupta','Mehta','Singh','Kumar','Das','Nair','Chopra','Agarwal','Joshi','Rao','Khan','Mishra','Pillai','Bose','Chatterjee','Kulkarni','Desai','Trivedi','Bhatt','Chauhan','Yadav','Pandey','Tiwari','Dubey','Saxena','Kapoor','Malhotra','Arora','Bansal','Jain','Sinha','Mukherjee','Banerjee','Ghosh','Menon']
    }
  };
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function on(id, evt, fn) { try { TN.on(id, evt, fn); } catch (e) {} }
  function gen() {
    try {
      TN.clearErr(S + '-error');
      var gender = TN.el(S + '-gender').value || 'any';
      var origin = TN.el(S + '-origin').value || 'international';
      var count = parseInt(TN.el(S + '-count').value, 10) || 10;
      var d = DATA[origin] || DATA.international;
      var list = TN.el(S + '-list');
      list.innerHTML = '';
      var frag = document.createDocumentFragment();
      for (var i = 0; i < count; i++) {
        var g = gender === 'any' ? (Math.random() < 0.5 ? 'male' : 'female') : gender;
        var first = pick(d[g] || d.male);
        var name = first + ' ' + pick(d.last);
        var row = document.createElement('div');
        row.className = 'copy-row';
        var span = document.createElement('span');
        span.textContent = name;
        row.appendChild(span);
        row.style.cursor = 'pointer';
        (function (n) {
          row.addEventListener('click', function () {
            TN.copy(n).catch(function () { TN.setErr(S + '-error', 'Copy failed — please copy manually.'); });
          });
        })(name);
        frag.appendChild(row);
      }
      list.appendChild(frag);
    } catch (e) { TN.setErr(S + '-error', 'Something went wrong. Please try again.'); }
  }
  on(S + '-generate', 'click', gen);
  // Auto-generate on load for instant value
  try { gen(); } catch (e) {}
})();
