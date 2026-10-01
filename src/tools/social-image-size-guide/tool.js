(function () {
  'use strict';
  var P = 'social-image-size-guide-', ERR = P + 'error';
  var DATA = {
    instagram: [['Profile photo', '320 × 320', '1:1', 320, 320], ['Square post', '1080 × 1080', '1:1', 1080, 1080], ['Portrait post', '1080 × 1350', '4:5', 1080, 1350], ['Landscape post', '1080 × 566', '1.91:1', 1080, 566], ['Story / Reel', '1080 × 1920', '9:16', 1080, 1920]],
    facebook: [['Profile photo', '720 × 720', '1:1', 720, 720], ['Cover photo', '1640 × 924', '16:9-ish', 1640, 924], ['Feed post', '1200 × 630', '1.91:1', 1200, 630], ['Story', '1080 × 1920', '9:16', 1080, 1920], ['Event cover', '1920 × 1080', '16:9', 1920, 1080]],
    x: [['Profile photo', '400 × 400', '1:1', 400, 400], ['Header', '1500 × 500', '3:1', 1500, 500], ['In-stream image', '1600 × 900', '16:9', 1600, 900], ['Card image', '1200 × 628', '1.91:1', 1200, 628]],
    youtube: [['Channel icon', '800 × 800', '1:1', 800, 800], ['Channel banner', '2560 × 1440', '16:9', 2560, 1440], ['Video thumbnail', '1280 × 720', '16:9', 1280, 720], ['Shorts', '1080 × 1920', '9:16', 1080, 1920]],
    linkedin: [['Profile photo', '400 × 400', '1:1', 400, 400], ['Cover / background', '1584 × 396', '4:1', 1584, 396], ['Post image', '1200 × 627', '1.91:1', 1200, 627], ['Company logo', '300 × 300', '1:1', 300, 300]],
    tiktok: [['Profile photo', '200 × 200', '1:1', 200, 200], ['Video', '1080 × 1920', '9:16', 1080, 1920]],
    pinterest: [['Profile photo', '165 × 165', '1:1', 165, 165], ['Pin', '1000 × 1500', '2:3', 1000, 1500], ['Board cover', '800 × 450', '16:9', 800, 450]]
  };
  function render() {
    try {
      TN.clearErr(ERR);
      var rows = DATA[TN.el(P + 'platform').value] || [];
      TN.el(P + 'body').innerHTML = rows.map(function (r) {
        var w = 72, h = Math.max(14, Math.round(72 * r[4] / r[3]));
        if (h > 96) { w = Math.round(w * 96 / h); h = 96; }
        return '<tr><td>' + r[0] + '</td><td><code>' + r[1] + '</code></td><td>' + r[2] + '</td>' +
          '<td><div style="width:' + w + 'px;height:' + h + 'px;background:linear-gradient(135deg,#4D7C0F,#166534);border-radius:6px;"></div></td></tr>';
      }).join('');
    } catch (e) { TN.setErr(ERR, 'Could not load the size guide. Please try again.'); }
  }
  try {
    TN.on(P + 'platform', 'change', render);
    render();
  } catch (e) { /* never throw on load */ }
})();
