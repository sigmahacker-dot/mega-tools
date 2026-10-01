#!/usr/bin/env node
/* ToolNest static site generator — reads src/tools/* and emits dist/ */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync, rmSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, 'src');
const DIST = join(ROOT, 'dist');
const SITE_URL = 'https://toolnest.vercel.app';
const SITE_NAME = 'ToolNest';

const CATEGORIES = [
  { id: 'video-audio', name: 'Video & Audio', icon: '🎬', blurb: 'Download thumbnails, convert, cut, merge and compress video & audio.' },
  { id: 'image', name: 'Image Tools', icon: '🖼️', blurb: 'Remove backgrounds, compress, resize, convert and create images.' },
  { id: 'pdf', name: 'PDF & Documents', icon: '📄', blurb: 'Merge, split, compress, convert and sign PDFs and documents.' },
  { id: 'text', name: 'Text & Writing', icon: '✍️', blurb: 'Count words, rewrite, speak text aloud and generate content.' },
  { id: 'seo', name: 'SEO & Web', icon: '🔍', blurb: 'Meta tags, sitemaps, DNS, SSL, WHOIS and website utilities.' },
  { id: 'calculators', name: 'Calculators', icon: '🧮', blurb: 'Age, EMI, loan, BMI, currency, GST and everyday calculators.' },
  { id: 'generators', name: 'Generators', icon: '⚙️', blurb: 'QR codes, barcodes, passwords, invoices, resumes and more.' },
  { id: 'social', name: 'Social Media', icon: '📣', blurb: 'Fancy text, bios, captions and titles for your social posts.' },
  { id: 'developer', name: 'Developer Tools', icon: '💻', blurb: 'Formatters, minifiers, encoders, IP, DNS and port tools.' },
  { id: 'fun', name: 'Fun & Lifestyle', icon: '🎲', blurb: 'Games, clocks, timers, weather, notes and playful utilities.' },
  { id: 'finance', name: 'Finance & Money', icon: '💰', blurb: 'Mortgages, compound interest, budgets, loans and money tools.' },
  { id: 'health', name: 'Health & Fitness', icon: '❤️', blurb: 'Calories, macros, heart-rate zones, pace, sleep and fitness.' },
  { id: 'math', name: 'Math & Numbers', icon: '📐', blurb: 'Scientific calculator, statistics, fractions, primes and more.' },
  { id: 'time', name: 'Time & Date', icon: '⏰', blurb: 'Date math, countdowns, work hours, week numbers and planners.' },
  { id: 'color', name: 'Color Tools', icon: '🎨', blurb: 'Pickers, palettes, contrast checkers and color-blindness simulators.' },
  { id: 'converters', name: 'Converters', icon: '🔄', blurb: 'Temperature, length, weight, speed, data and unit converters.' },
];

const LIB_CDN = {
  'pdf-lib': 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js',
  'pdfjs': 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js',
  'jszip': 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js',
  'qrcode': 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js',
  'jsbarcode': 'https://cdn.jsdelivr.net/npm/jsbarcode@3.8.0/dist/JsBarcode.all.min.js',
  'docx': 'https://unpkg.com/docx@8.5.0/build/index.umd.js',
  'mammoth': 'https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js',
  'lamejs': 'https://cdn.jsdelivr.net/npm/lamejs@1.2.1/lame.min.js',
  'gifjs': 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.js',
  'terser': 'https://cdn.jsdelivr.net/npm/terser@5.31.6/dist/bundle.min.js',
};

const catById = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- load tools ---------- */
const toolsDir = join(SRC, 'tools');
const slugs = readdirSync(toolsDir).filter(d => statSync(join(toolsDir, d)).isDirectory()).sort();
const tools = [];
const seen = new Set();
for (const slug of slugs) {
  const dir = join(toolsDir, slug);
  const metaPath = join(dir, 'meta.json');
  const bodyPath = join(dir, 'body.html');
  const jsPath = join(dir, 'tool.js');
  if (!existsSync(metaPath) || !existsSync(bodyPath) || !existsSync(jsPath)) {
    throw new Error(`Tool ${slug} is missing meta.json, body.html or tool.js`);
  }
  const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
  for (const f of ['slug', 'title', 'category', 'description', 'howto', 'faqs']) {
    if (!meta[f]) throw new Error(`Tool ${slug}: meta.json missing "${f}"`);
  }
  if (meta.slug !== slug) throw new Error(`Tool dir ${slug} but meta.slug is ${meta.slug}`);
  if (seen.has(slug)) throw new Error(`Duplicate slug ${slug}`);
  seen.add(slug);
  if (!catById[meta.category]) throw new Error(`Tool ${slug}: unknown category ${meta.category}`);
  if (!Array.isArray(meta.howto) || meta.howto.length < 3) throw new Error(`Tool ${slug}: howto needs >=3 steps`);
  if (!Array.isArray(meta.faqs) || meta.faqs.length < 3) throw new Error(`Tool ${slug}: faqs need >=3 entries`);
  meta.libs = meta.libs || [];
  for (const l of meta.libs) if (!LIB_CDN[l]) throw new Error(`Tool ${slug}: unknown lib "${l}"`);
  tools.push({
    ...meta,
    body: readFileSync(bodyPath, 'utf8'),
    js: readFileSync(jsPath, 'utf8'),
  });
}
console.log(`Loaded ${tools.length} tools`);

/* ---------- dist ---------- */
rmSync(DIST, { recursive: true, force: true });
mkdirSync(join(DIST, 'assets'), { recursive: true });
mkdirSync(join(DIST, 'tools'), { recursive: true });
copyFileSync(join(SRC, 'shared', 'site.css'), join(DIST, 'assets', 'site.css'));
copyFileSync(join(SRC, 'shared', 'site.js'), join(DIST, 'assets', 'site.js'));
mkdirSync(join(DIST, 'assets', 'img'), { recursive: true });
for (const f of readdirSync(join(SRC, 'shared', 'img'))) {
  copyFileSync(join(SRC, 'shared', 'img', f), join(DIST, 'assets', 'img', f));
}

const pageTpl = readFileSync(join(SRC, 'templates', 'page.html'), 'utf8');
function fill(tpl, vars) {
  let out = tpl;
  for (const [k, v] of Object.entries(vars)) out = out.split('{{' + k + '}}').join(v);
  return out;
}
const toolUrl = t => `/tools/${t.slug}/`;
const toolCard = t => {
  const cat = catById[t.category];
  const icon = cat ? cat.icon : '🔧';
  const d = t.description.length > 92 ? t.description.slice(0, 92) + '…' : t.description;
  return `<a class="tool-link" href="${toolUrl(t)}" data-search="${esc((t.title + ' ' + t.description + ' ' + (t.keywords || []).join(' ')).toLowerCase())}"><span class="t-ico">${icon}</span><span class="t-body"><b>${esc(t.title)}</b><small>${esc(d)}</small></span><span class="t-arrow">→</span></a>`;
};

/* ---------- tool pages ---------- */
for (const t of tools) {
  const cat = catById[t.category];
  const libScripts = t.libs.map(l => `<script src="${LIB_CDN[l]}" defer></script>`).join('\n');
  const toolScript = t.module
    ? `<script type="module">\n${t.js}\n</script>`
    : `<script>\n${t.js}\n</script>`;
  const howtoItems = t.howto.map(s => `<li>${esc(s)}</li>`).join('');
  const faqItems = t.faqs.map(f => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('');
  const related = tools.filter(x => x.category === t.category && x.slug !== t.slug).slice(0, 6);
  const jsonld = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebApplication', name: t.title, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0' }, url: SITE_URL + toolUrl(t), description: t.description },
      { '@type': 'FAQPage', mainEntity: t.faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    ],
  });
  const html = fill(pageTpl, {
    PAGE_TITLE: esc(`${t.title} — Free Online | ${SITE_NAME}`),
    META_DESC: esc(t.description),
    META_KEYWORDS: esc((t.keywords || []).join(', ')),
    CANONICAL_URL: SITE_URL + toolUrl(t),
    JSONLD: jsonld.replace(/</g, '\\u003c'),
    CATEGORY_SLUG: cat.id,
    CATEGORY_NAME: esc(cat.name),
    TOOL_TITLE: esc(t.title),
    TOOL_DESC: esc(t.description),
    BODY: t.body,
    LIB_SCRIPTS: libScripts,
    TOOL_SCRIPT: toolScript,
    HOWTO_ITEMS: howtoItems,
    FAQ_ITEMS: faqItems,
    RELATED_CARDS: related.map(toolCard).join(''),
  });
  const outDir = join(DIST, 'tools', t.slug);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), html);
}

/* ---------- shared Urdu font files (used by urdu-fonts + urdu-text-to-png) ---------- */
const urduFontsSrc = join(SRC, 'tools', 'urdu-fonts', 'fonts');
if (existsSync(urduFontsSrc)) {
  for (const slug of ['urdu-fonts', 'urdu-text-to-png']) {
    const fd = join(DIST, 'tools', slug, 'fonts');
    mkdirSync(fd, { recursive: true });
    for (const f of readdirSync(urduFontsSrc)) {
      copyFileSync(join(urduFontsSrc, f), join(fd, f));
    }
  }
}

/* ---------- homepage ---------- */
const toolsIndex = tools.map(t => ({ slug: t.slug, title: t.title, desc: t.description, cat: t.category, kw: t.keywords || [] }));
const catSections = CATEGORIES.map(c => {
  const ts = tools.filter(t => t.category === c.id);
  if (!ts.length) return '';
  return `<section class="section" id="${c.id}">
    <h2>${c.icon} ${esc(c.name)}</h2>
    <p class="sec-sub">${esc(c.blurb)}</p>
    <div class="tool-grid">${ts.map(toolCard).join('')}</div>
  </section>`;
}).join('\n');
const catCards = CATEGORIES.map(c => {
  const n = tools.filter(t => t.category === c.id).length;
  return `<a class="cat-card" href="#${c.id}"><span class="cicon">${c.icon}</span><b>${esc(c.name)}</b><small>${n} tools</small></a>`;
}).join('');

const homeHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${SITE_NAME} — ${tools.length}+ Free Online Tools That Actually Work</title>
<meta name="description" content="${SITE_NAME}: ${tools.length}+ free online tools — image, PDF, video, calculators, generators, developer utilities and more. No sign-up. Your files never leave your device.">
<link rel="canonical" href="${SITE_URL}/">
<meta property="og:title" content="${SITE_NAME} — Free Online Tools">
<meta property="og:description" content="${tools.length}+ free tools: compress images, merge PDFs, generate QR codes, convert currency and more.">
<meta property="og:type" content="website">
<meta name="theme-color" content="#07070b">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/site.css?v=4">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='24' fill='%23e01111'/><text x='50' y='68' font-size='58' text-anchor='middle' fill='white' font-family='Arial' font-weight='bold'>T</text></svg>">
</head>
<body>
<header class="site-header">
  <div class="container">
    <a class="logo" href="/"><span class="logo-mark">T</span> ${SITE_NAME}</a>
    <nav class="site-nav">
      <a href="#categories">Categories</a>
      <a href="#all-tools">All Tools</a>
    </nav>
  </div>
</header>

<section class="hero">
  <span class="hero-orb o1"></span><span class="hero-orb o2"></span>
  <div class="container hero-split">
    <div class="hero-copy">
      <span class="hero-badge"><span class="pulse"></span> ${tools.length}+ tools · 100% free · no sign-up</span>
      <h1>Every tool you need, <span class="grad">free</span> — and they actually work</h1>
      <p class="hero-lead">${tools.length}+ fast online tools: images, PDFs, video, finance, health, math, converters &amp; more. No sign-up, no watermarks.</p>
      <div class="search-wrap">
        <span class="sicon">🔍</span>
        <input id="toolSearch" type="search" placeholder="Search tools… e.g. &quot;mortgage&quot;, &quot;qr code&quot;, &quot;color picker&quot;" autocomplete="off">
      </div>
      <p class="search-hint">Press <kbd>/</kbd> to search</p>
      <div class="hero-stats"><span><b>${tools.length}</b> tools</span><span><b>${CATEGORIES.length}</b> categories</span><span><b>100%</b> free</span></div>
    </div>
    <div class="hero-img">
      <img src="/assets/img/ai-hero-robot.webp" alt="AI robot with red glow — illustration for ToolNest's smart free online tools" width="1280" height="1920" fetchpriority="high">
    </div>
  </div>
</section>

<!-- ADSTERRA-HEADER: paste your Adsterra banner ad code inside the div below -->
<div class="container"><div class="ad-slot ad-leaderboard" data-ad="header"></div></div>

<main class="container">
  <section class="section" id="categories">
    <h2>🗂️ Browse by category</h2>
    <p class="sec-sub">Pick a category to explore its tools.</p>
    <div class="cat-grid">${catCards}</div>
  </section>

  <section class="section smart-banner">
    <img src="/assets/img/ai-tools-orb.webp" alt="Glowing red circuit orb — illustration for ToolNest's smart tool collection" loading="lazy" width="2352" height="1008">
    <div class="sb-body">
      <h2>Built smart, stays simple</h2>
      <ul>
        <li>Free forever — no trials, no paywalls, no watermarks</li>
        <li>No sign-up — open any tool and start using it</li>
        <li>Mobile-friendly — every tool works on your phone</li>
      </ul>
    </div>
  </section>

  <div id="searchResults" class="section hidden">
    <h2>🔍 Search results</h2>
    <div class="tool-grid" id="searchGrid"></div>
  </div>

  <div id="all-tools">${catSections}</div>

  <section class="section">
    <div class="info-card">
      <h2>Why ${SITE_NAME}?</h2>
      <ul>
        <li><b>Genuinely free</b> — every tool works without accounts, trials or watermarks.</li>
        <li><b>Private by design</b> — file tools (images, PDFs, video, audio) process everything <b>on your device</b>. Your files are never uploaded anywhere.</li>
        <li><b>Fast &amp; mobile-friendly</b> — lightweight pages that work on phones, tablets and desktops.</li>
        <li><b>No fake tools</b> — if a tool can't be made to really work, we don't ship it.</li>
      </ul>
    </div>
  </section>
</main>

<!-- ADSTERRA-FOOTER: paste your Adsterra footer/banner ad code inside the div below -->
<div class="container"><div class="ad-slot" data-ad="footer"></div></div>

<footer class="site-footer">
  <div class="container">
    <div class="f-grid">
      <div>
        <span class="brandline"><span class="logo-mark">T</span> ${SITE_NAME}</span>
        <p>Free online tools that actually work. No sign-up, no watermarks — and your files never leave your device for client-side tools.</p>
      </div>
      <div>
        <h4>Popular</h4>
        <a href="/tools/qr-code-generator/">QR Code Generator</a>
        <a href="/tools/background-remover/">Background Remover</a>
        <a href="/tools/pdf-merger/">PDF Merger</a>
        <a href="/tools/word-counter/">Word Counter</a>
      </div>
      <div>
        <h4>Categories</h4>
        <a href="/#converters">Converters</a>
        <a href="/#finance">Finance &amp; Money</a>
        <a href="/#image">Image Tools</a>
        <a href="/#developer">Developer Tools</a>
      </div>
      <div>
        <h4>Site</h4>
        <a href="/">Home</a>
        <a href="/#all-tools">All Tools</a>
        <a href="/sitemap.xml">Sitemap</a>
      </div>
    </div>
    <div class="f-bottom">© 2026 ${SITE_NAME} · Free tools for everyone · Made with care</div>
  </div>
</footer>

<script>
const TOOLS = ${JSON.stringify(toolsIndex).replace(/</g, '\\u003c')};
const ICONS = ${JSON.stringify(Object.fromEntries(CATEGORIES.map(c => [c.id, c.icon])))};
(function(){
  const input = document.getElementById('toolSearch');
  const box = document.getElementById('searchResults');
  const grid = document.getElementById('searchGrid');
  const all = document.getElementById('all-tools');
  const escH = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
  function card(t){
    return '<a class="tool-link" href="/tools/'+t.slug+'/"><span class="t-ico">'+(ICONS[t.cat]||'🔧')+'</span><span class="t-body"><b>'+escH(t.title)+'</b><small>'+escH(String(t.desc).slice(0,92))+(String(t.desc).length>92?'…':'')+'</small></span><span class="t-arrow">→</span></a>';
  }
  function doSearch(){
    const q = input.value.trim().toLowerCase();
    if(q.length < 2){ box.classList.add('hidden'); all.classList.remove('hidden'); return; }
    const hits = TOOLS.filter(t => (t.title+' '+t.desc+' '+(t.kw||[]).join(' ')).toLowerCase().includes(q)).slice(0, 60);
    grid.innerHTML = hits.length ? hits.map(card).join('') : '<p class="muted">No tools found for "'+q.replace(/</g,'&lt;')+'". Try another keyword.</p>';
    box.classList.remove('hidden'); all.classList.add('hidden');
  }
  input.addEventListener('input', doSearch);
  /* "/" focuses search from anywhere on the page */
  document.addEventListener('keydown', function(e){
    if(e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
    const tag = (document.activeElement && document.activeElement.tagName) || '';
    if(/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
    e.preventDefault();
    input.focus();
  });
  /* ?q= pre-fill (used by the navbar search on tool pages) */
  try{
    const q0 = new URLSearchParams(location.search).get('q');
    if(q0){ input.value = q0; doSearch(); input.focus(); }
  }catch(e){}
})();
</script>
</body>
</html>`;
writeFileSync(join(DIST, 'index.html'), homeHtml);

/* ---------- sitemap + robots ---------- */
const urls = ['', ...tools.map(t => toolUrl(t))];
writeFileSync(join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u => `  <url><loc>${SITE_URL}${u}</loc><changefreq>monthly</changefreq></url>`).join('\n') +
  `\n</urlset>\n`);
writeFileSync(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);

/* ---------- speedtest asset (10 MB, for the honest speed test) ---------- */
writeFileSync(join(DIST, 'speedtest.bin'), randomBytes(10 * 1024 * 1024));

console.log(`Built ${tools.length} tool pages → dist/`);
