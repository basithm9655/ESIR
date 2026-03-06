/* =====================================================
   Dr. Esakkirajan S — Academic Portfolio Script
   - Navbar scroll behaviour
   - Scroll reveal animations
   - Animated counters
   - Citation bar chart
   - Live Google Scholar fetch (with Supabase fallback)
   - Publication tabs & search
   - Mobile nav toggle
   - Supabase data loading
   ===================================================== */

/* ─── Supabase Client (loaded via CDN in index.html) ─── */
let supabaseClient = null;

function initSupabase() {
  if (typeof window.supabase !== 'undefined' && SUPABASE_URL && SUPABASE_ANON_KEY !== 'YOUR_ANON_PUBLIC_KEY_HERE') {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return true;
  }
  return false;
}

/* ─── Fallback / Known values (used if Supabase not configured yet) ─── */
const FALLBACK = {
  citationsTotal: 1997,
  citationsSince: 839,
  hTotal: 19,
  hSince: 13,
  i10Total: 33,
  i10Since: 18,
  paAvail: 1,
  paNo: 2,
  coAuthors: [
    { name: "Dr. T. Veerakumar", affiliation: "NIT Goa", link: "https://scholar.google.co.in/citations?user=8bGI7nQAAAAJ" },
    { name: "Dr. Badri Narayan Subudhi", affiliation: "IIT Jammu", link: "https://scholar.google.co.in/citations?user=M9m3zv4AAAAJ" },
    { name: "Keerthiveena Balraj", affiliation: "UIUC", link: "https://scholar.google.co.in/citations?user=QGZb-TQAAAAJ" },
    { name: "ila vennila", affiliation: "PSG Tech", link: "https://scholar.google.co.in/citations?user=fbtEB1UAAAAJ" },
    { name: "Navaneethan P.", affiliation: "PSG Tech", link: "https://scholar.google.co.in/citations?user=--DANjMAAAAJ" },
    { name: "Dr.R.Sudhakar", affiliation: "Dr.MCET", link: "https://scholar.google.co.in/citations?user=9kQ5yQwAAAAJ" },
    { name: "Sreevidya P", affiliation: "FISAT", link: "https://scholar.google.co.in/citations?user=KkBqRb4AAAAJ" },
    { name: "Dr.DEEPA N", affiliation: "CIT", link: "https://scholar.google.co.in/citations?user=dS_TpQMAAAAJ" }
  ]
};

/* Citation-per-year data (Overwritten by DB if available) */
let CITATION_YEARS = [
  { year: 2007, count: 5 },
  { year: 2008, count: 11 },
  { year: 2009, count: 14 },
  { year: 2010, count: 22 },
  { year: 2011, count: 33 },
  { year: 2012, count: 68 },
  { year: 2013, count: 90 },
  { year: 2014, count: 139 },
  { year: 2015, count: 134 },
  { year: 2016, count: 125 },
  { year: 2017, count: 110 },
  { year: 2018, count: 113 },
  { year: 2019, count: 132 },
  { year: 2020, count: 149 },
  { year: 2021, count: 162 },
  { year: 2022, count: 172 },
  { year: 2023, count: 161 },
  { year: 2024, count: 168 },
  { year: 2025, count: 154 },
  { year: 2026, count: 21 }
];

/* ─── DOM-ready entry ─── */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileNav();
  initScrollReveal();
  initCounters();
  initPublicationTabs();
  buildCitationChart();

  // Try Supabase first, fall back to data.json
  const sbReady = initSupabase();
  if (sbReady) {
    loadDataFromSupabase();
  } else {
    loadDataFromJson();
  }
});

/* ══════════════════════════════════════════
   SUPABASE DATA LOADING
══════════════════════════════════════════ */
async function loadDataFromSupabase() {
  try {
    const [
      { data: publications },
      { data: books },
      { data: patents },
      { data: experience },
      { data: academicIds },
      { data: education },
      { data: scholarRows },
      { data: classes }
    ] = await Promise.all([
      supabaseClient.from('publications').select('*').order('display_order'),
      supabaseClient.from('books').select('*').order('display_order'),
      supabaseClient.from('patents').select('*').order('display_order'),
      supabaseClient.from('experience').select('*').order('display_order'),
      supabaseClient.from('academic_ids').select('*').order('display_order'),
      supabaseClient.from('education').select('*').order('display_order'),
      supabaseClient.from('scholar_metrics').select('*').order('id', { ascending: false }).limit(1),
      supabaseClient.from('classes').select('*').order('display_order')
    ]);

    if (publications) renderPublicationsFromDB(publications);
    if (books) renderBooksFromDB(books);
    if (patents) renderPatentsFromDB(patents);
    if (experience) renderExperienceFromDB(experience);
    if (academicIds) renderAcademicIdsFromDB(academicIds);
    if (education) renderEducation(education);
    if (classes) renderClasses(classes);

    // Use Supabase scholar metrics as fallback values
    if (scholarRows && scholarRows.length > 0) {
      const sm = scholarRows[0];
      Object.assign(FALLBACK, {
        citationsTotal: sm.citations_total,
        citationsSince: sm.citations_since,
        hTotal: sm.h_total,
        hSince: sm.h_since,
        i10Total: sm.i10_total,
        i10Since: sm.i10_since,
        citationsHistory: sm.citations_history,
        coAuthors: sm.co_authors,
        paAvail: sm.public_access_available,
        paNo: sm.public_access_not_available
      });
      if (sm.citations_history && Array.isArray(sm.citations_history) && sm.citations_history.length > 0) {
        CITATION_YEARS = sm.citations_history;
      }
    }

    // Explicitly apply scholar metrics now that DB values are loaded
    applyScholarData(FALLBACK);

    // Re-init search after DOM is populated
    setTimeout(initPublicationSearch, 200);
    setTimeout(initScrollReveal, 300);

    console.log('[Supabase] All data loaded successfully.');
  } catch (err) {
    console.warn('[Supabase] Load failed, falling back to data.json:', err.message);
    loadDataFromJson();
  }
}

/* ─── Fallback: load from local data.json ─── */
async function loadDataFromJson() {
  try {
    const res = await fetch('data.json');
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    renderPublications(data.publications);
    renderBooks(data.books);
    renderPatents(data.patents);
    renderExperience(data.experience);
    renderAcademicIds(data.academicIds);
    applyScholarData(FALLBACK); // Use hardcoded fallback if everything fails
    setTimeout(initPublicationSearch, 200);
    setTimeout(initScrollReveal, 300);
  } catch (err) {
    console.error('Failed to load data:', err);
  }
}

/* ══════════════════════════════════════════
   RENDER FROM SUPABASE DB ROWS
══════════════════════════════════════════ */

function renderPublicationsFromDB(rows) {
  const tabJ = document.getElementById('tab-j');
  const tabC = document.getElementById('tab-c');
  if (!tabJ || !tabC) return;
  if (!rows || rows.length === 0) return;

  tabJ.innerHTML = '';
  tabC.innerHTML = '';

  rows.forEach(pub => {
    const badgeHtml = pub.badge_label
      ? `<span class="tag" style="${pub.badge_style || ''}">${pub.badge_label}</span>`
      : '';

    const el = document.createElement('div');
    el.className = 'pub-item glass reveal';
    el.setAttribute('data-year', pub.year);
    el.setAttribute('data-cites', pub.cites);
    el.innerHTML = `
      <div class="pub-year">${pub.year}</div>
      <div>
        <div class="pub-title">${pub.title}</div>
        <div class="pub-authors">${pub.authors || ''} · ${pub.venue || ''}</div>
        <div style="margin-top: 8px;">
          ${badgeHtml}
          <span style="font-size: 0.8rem; color: var(--accent-cyan);"><i style="font-style:normal;">📊</i> ${pub.cites} Citations</span>
        </div>
      </div>
    `;
    if (pub.type === 'journal') tabJ.appendChild(el);
    else tabC.appendChild(el);
  });
}

function renderBooksFromDB(rows) {
  const grid = document.getElementById('booksGrid');
  const tabB = document.getElementById('tab-b');

  if (!rows || rows.length === 0) return;
  if (grid) grid.innerHTML = '';
  if (tabB) tabB.innerHTML = '';

  rows.forEach((b, i) => {
    // Parse badge_label (pipe-separated) and badge_style (pipe-separated)
    const labels = (b.badge_label || '').split('|').filter(Boolean);
    const styles = (b.badge_style || '').split('|').filter(Boolean);
    const bHtml = labels.map((lbl, idx) =>
      `<span class="tag" style="${styles[idx] || ''} font-size:0.75rem; padding:4px 10px; border-radius:100px;">${lbl}</span>`
    ).join('');

    const delay = i % 2 !== 0 ? 'delay-1' : '';

    if (grid) {
      grid.innerHTML += `
        <div class="book-card glass reveal ${delay}">
          <div class="book-cover-wrapper">
            <img src="${b.cover}" alt="${b.title}" class="book-cover" />
          </div>
          <div class="book-info">
            <div style="margin-bottom: 10px; display: flex; gap: 8px; flex-wrap: wrap;">${bHtml}</div>
            <h3 class="book-title">${b.title}</h3>
            <p class="book-authors">${b.authors}</p>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5;">
              ISBN: ${b.isbn}<br>Publisher: ${b.publisher}<br>Year: ${b.year}
            </div>
            <p class="book-desc">${b.description}</p>
            <a href="${b.link}" target="_blank" rel="noopener" class="btn btn-outline book-btn">🛒 View on Amazon</a>
          </div>
        </div>
      `;
    }

    if (tabB && b.tab_emoji) {
      tabB.innerHTML += `
        <div class="pub-item glass" style="border-left:4px solid ${b.tab_color};">
          <div style="font-size:2.2rem;flex-shrink:0;">${b.tab_emoji}</div>
          <div style="flex:1;">
            <div style="font-size:0.75rem;color:${b.tab_color};font-weight:700;letter-spacing:1px;margin-bottom:6px;">${b.tab_meta}</div>
            <div class="pub-title">${b.title}</div>
            <div class="pub-authors">${b.authors} &middot; ${b.publisher}</div>
            <a href="${b.link}" target="_blank" class="tag"
              style="display:inline-block;margin-top:10px;background:rgba(255,153,0,0.15);border:1px solid rgba(255,153,0,0.4);color:#fbbf24;padding:4px 12px;border-radius:100px;font-size:0.75rem;">📦 Amazon India</a>
          </div>
        </div>
      `;
    }
  });

  if (tabB) {
    tabB.innerHTML += `<div style="text-align:center;margin-top:24px;">
      <a href="https://www.amazon.in/Books-S-Esakkirajan/s?rh=n%3A976389031%2Cp_27%3AS.%2BEsakkirajan"
        target="_blank" rel="noopener" class="btn btn-glow" style="font-size:0.95rem;">🛒 View All Books on Amazon India</a>
    </div>`;
  }
}

function renderPatentsFromDB(rows) {
  const pList = document.getElementById('patentsList');
  if (!pList) return;
  if (!rows || rows.length === 0) return;
  pList.innerHTML = rows.map(p => `
    <div class="pub-item glass reveal" style="border-left:4px solid ${p.border_color};">
      <div style="font-size:2rem; flex-shrink:0;">${p.icon}</div>
      <div>
        <div style="font-size:0.75rem; font-weight:700; color:${p.category_color}; letter-spacing:1px; margin-bottom:6px;">${p.category}</div>
        <div class="pub-title">${p.title}</div>
        <div class="pub-authors">${p.authors}</div>
      </div>
    </div>
  `).join('');
}

function renderExperienceFromDB(rows) {
  const eList = document.getElementById('experienceList');
  if (!eList) return;
  if (!rows || rows.length === 0) return;
  eList.innerHTML = rows.map((e, index) => {
    const border = e.border_color ? `border-color: ${e.border_color};` : '';
    const delay = index % 2 !== 0 ? 'delay-1' : '';
    return `
      <div class="t-item glass ${delay}" style="padding:40px; border-top:none; border-bottom:none; border-right:none;">
        <div class="t-dot" style="${border}"></div>
        <div class="t-year">${e.year_range}</div>
        <div class="t-title">${e.title}</div>
        <div class="t-org">${e.organisation}</div>
      </div>
    `;
  }).join('');
}

function renderAcademicIdsFromDB(rows) {
  const grid = document.getElementById('academicIdsGrid');
  if (!grid) return;
  if (!rows || rows.length === 0) return;
  grid.innerHTML = rows.map(id => {
    const spanStyle = id.full_width ? 'grid-column: 1 / -1;' : '';
    const iCol = id.icon_color ? `color:${id.icon_color};` : '';
    const vCol = id.value_color ? `color:${id.value_color};` : '';
    const iconHtml = (id.icon && id.icon.startsWith('data:image'))
      ? `<img src="${id.icon}" style="width:24px;height:24px;object-fit:contain;margin:0 auto">`
      : id.icon;
    return `
      <a href="${id.link}" target="_blank" class="id-card glass reveal" style="${spanStyle}">
        <div class="icon" style="${iCol}">${iconHtml}</div>
        <div class="label">${id.name}</div>
        <div class="val" style="${vCol}">${id.value}</div>
      </a>
    `;
  }).join('');
}

/* ── Classes Renderer ── */
function renderClasses(rows) {
  const list = document.getElementById('classesList');
  if (!list || !rows || !rows.length) return;
  const colors = ['var(--accent-indigo)', 'var(--accent-cyan)', 'var(--accent-pink)', '#f59e0b'];
  const typeClass = { Lab: 'type-lab', Elective: 'type-elective', Project: 'type-project' };
  list.innerHTML = rows.map((c, i) => `
    <div class="class-card glass reveal ${i % 2 ? 'delay-1' : ''}" style="border-top-color:${colors[i % 4]}">
      <div class="class-code">${c.course_code || ''}</div>
      <div class="class-name">${c.course_name}</div>
      <div class="class-meta">Semester ${c.semester || '—'} &middot; ${c.degree_programme || ''} &middot; ${c.credits || 3} Credits</div>
      ${c.notes ? `<div style="font-size:0.78rem;color:var(--text-muted);margin-top:2px">${c.notes}</div>` : ''}
      <span class="class-type-badge ${typeClass[c.class_type] || ''}">${c.class_type}</span>
    </div>
  `).join('');
}

/* ── Education Renderer ── */
function renderEducation(rows) {
  const eduList = document.getElementById('educationList');
  if (!eduList) return;
  if (!rows || rows.length === 0) return;
  eduList.innerHTML = rows.map(e => `
    <div class="edu-item glass reveal">
      <div class="edu-icon">${e.logo_emoji}</div>
      <div class="edu-content">
        <div class="edu-institution">${e.institution}</div>
        <div class="edu-degree">${e.degree}, ${e.field}</div>
        <div class="edu-period">Apr ${e.start_year} – Apr ${e.end_year}</div>
        <div class="edu-grade">Grade: ${e.grade}</div>
      </div>
    </div>
  `).join('');
}

/* ══════════════════════════════════════════
   ORIGINAL RENDERERS (data.json fallback)
══════════════════════════════════════════ */
function renderPublications(pubs) {
  const tabJ = document.getElementById('tab-j');
  const tabC = document.getElementById('tab-c');
  if (!tabJ || !tabC) return;
  if (!pubs || pubs.length === 0) return;
  tabJ.innerHTML = '';
  tabC.innerHTML = '';

  pubs.forEach(pub => {
    let badgeHtml = '';
    if (pub.badges && pub.badges.length > 0) {
      badgeHtml = pub.badges.map(b => `<span class="tag" style="${b.style}">${b.label}</span>`).join('');
    }
    if (pub.type === 'journal' || pub.type === 'conference') {
      const el = document.createElement('div');
      el.className = 'pub-item glass reveal';
      el.setAttribute('data-year', pub.year);
      el.setAttribute('data-cites', pub.cites);
      el.innerHTML = `
        <div class="pub-year">${pub.year}</div>
        <div>
          <div class="pub-title">${pub.title}</div>
          <div class="pub-authors">${pub.authors} · ${pub.venue}</div>
          <div style="margin-top: 8px;">
            ${badgeHtml}
            <span style="font-size: 0.8rem; color: var(--accent-cyan);"><i style="font-style: normal;">📊</i> ${pub.cites} Citations</span>
          </div>
        </div>
      `;
      if (pub.type === 'journal') tabJ.appendChild(el);
      else tabC.appendChild(el);
    }
  });
}

function renderBooks(books) {
  const grid = document.getElementById('booksGrid');
  const tabB = document.getElementById('tab-b');
  if (!grid || !tabB) return;
  grid.innerHTML = '';
  tabB.innerHTML = '';

  books.forEach((b, i) => {
    let bHtml = '';
    if (b.badges && b.badges.length) {
      bHtml = b.badges.map(bg => `<span class="tag" style="${bg.style}">${bg.label}</span>`).join('');
    }
    const delay = i % 2 !== 0 ? 'delay-1' : '';
    grid.innerHTML += `
      <div class="book-card glass reveal ${delay}">
        <div class="book-cover-wrapper">
          <img src="${b.cover}" alt="${b.title}" class="book-cover" />
        </div>
        <div class="book-info">
          <div style="margin-bottom: 10px; display: flex; gap: 8px; flex-wrap: wrap;">${bHtml}</div>
          <h3 class="book-title">${b.title}</h3>
          <p class="book-authors">${b.authors}</p>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5;">
            ISBN: ${b.isbn}<br>Publisher: ${b.publisher}<br>Year: ${b.year}
          </div>
          <p class="book-desc">${b.desc}</p>
          <a href="${b.link}" target="_blank" rel="noopener" class="btn btn-outline book-btn">🛒 View on Amazon</a>
        </div>
      </div>
    `;
    if (b.oldTabInfo) {
      tabB.innerHTML += `
        <div class="pub-item glass" style="border-left:4px solid ${b.oldTabInfo.color};">
          <div style="font-size:2.2rem;flex-shrink:0;">${b.oldTabInfo.emoji}</div>
          <div style="flex:1;">
            <div style="font-size:0.75rem;color:${b.oldTabInfo.color};font-weight:700;letter-spacing:1px;margin-bottom:6px;">${b.oldTabInfo.meta}</div>
            <div class="pub-title">${b.title}</div>
            <div class="pub-authors">${b.authors} &middot; ${b.publisher}</div>
            <a href="${b.link}" target="_blank" class="tag"
              style="display:inline-block;margin-top:10px;background:rgba(255,153,0,0.15);border:1px solid rgba(255,153,0,0.4);color:#fbbf24;padding:4px 12px;border-radius:100px;font-size:0.75rem;">📦 Amazon India</a>
          </div>
        </div>
      `;
    }
  });
}

function renderPatents(patents) {
  const pList = document.getElementById('patentsList');
  if (!pList) return;
  pList.innerHTML = patents.map(p => `
    <div class="pub-item glass reveal" style="border-left:4px solid ${p.color};">
      <div style="font-size:2rem; flex-shrink:0;">${p.icon}</div>
      <div>
        <div style="font-size:0.75rem; font-weight:700; color:${p.categoryColor}; letter-spacing:1px; margin-bottom:6px;">${p.category}</div>
        <div class="pub-title">${p.title}</div>
        <div class="pub-authors">${p.authors}</div>
      </div>
    </div>
  `).join('');
}

function renderExperience(exp) {
  const eList = document.getElementById('experienceList');
  if (!eList) return;
  eList.innerHTML = exp.map((e, index) => {
    const border = e.color ? `border-color: ${e.color};` : '';
    const delay = index % 2 !== 0 ? 'delay-1' : '';
    return `
      <div class="t-item glass ${delay}" style="padding:40px; border-top:none; border-bottom:none; border-right:none;">
        <div class="t-dot" style="${border}"></div>
        <div class="t-year">${e.year}</div>
        <div class="t-title">${e.title}</div>
        <div class="t-org">${e.org}</div>
      </div>
    `;
  }).join('');
}

function renderAcademicIds(ids) {
  const grid = document.getElementById('academicIdsGrid');
  if (!grid) return;
  grid.innerHTML = ids.map(id => {
    const spanStyle = id.fullWidth ? 'grid-column: 1 / -1;' : '';
    const iCol = id.iconColor ? `color:${id.iconColor};` : '';
    const vCol = id.valColor ? `color:${id.valColor};` : '';
    const clsDelay = id.delay && id.delay !== "0" ? ` ${id.delay}` : '';
    return `
      <a href="${id.link}" target="_blank" class="id-card glass reveal${clsDelay}" style="${spanStyle}">
        <div class="icon" style="${iCol}">${id.icon}</div>
        <div class="label">${id.name}</div>
        <div class="val" style="${vCol}">${id.val}</div>
      </a>
    `;
  }).join('');
}

/* ══════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  }, { passive: true });
}

/* ══════════════════════════════════════════
   MOBILE NAV TOGGLE
══════════════════════════════════════════ */
function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && links.classList.contains('open')) {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}

/* ══════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════ */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  // Mark any already-visible elements immediately (e.g., hero section)
  elements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add('visible');
    }
  });
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px' });
  elements.forEach(el => {
    if (!el.classList.contains('visible')) observer.observe(el);
  });
}

/* ══════════════════════════════════════════
   ANIMATED COUNTERS
══════════════════════════════════════════ */
function animateCounter(el, target, duration = 1500, prefix = '', suffix = '') {
  if (!el) return;
  const start = parseInt(el.innerText) || 0;
  const range = target - start;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.innerText = prefix + Math.round(start + range * eased).toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function initCounters() {
  const statsSection = document.getElementById('stats');
  if (!statsSection) return;
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) observer.disconnect();
  }, { threshold: 0.3 });
  observer.observe(statsSection);
}

/* ══════════════════════════════════════════
   CITATION BAR CHART
══════════════════════════════════════════ */
function buildCitationChart() {
  const chart = document.getElementById('citationChart');
  const yearsRow = document.getElementById('chartYears');
  if (!chart || !yearsRow) return;

  chart.innerHTML = '';
  yearsRow.innerHTML = '';

  const maxCount = Math.max(...CITATION_YEARS.map(d => d.count));

  CITATION_YEARS.forEach((d, i) => {
    const heightPct = maxCount > 0 ? (d.count / maxCount) * 100 : 0;

    const bar = document.createElement('div');
    bar.style.cssText = `
      flex: 1; background: linear-gradient(180deg, #6366f1, #22d3ee);
      border-radius: 4px 4px 0 0; height: 0;
      transition: height 1.2s cubic-bezier(0.4,0,0.2,1) ${i * 40}ms;
      cursor: default; position: relative; min-width: 0;
    `;
    bar.title = `Year: ${d.year}\nPublications: ${d.count}`;
    bar.addEventListener('mouseenter', () => { bar.style.opacity = '0.8'; });
    bar.addEventListener('mouseleave', () => { bar.style.opacity = '1'; });
    chart.appendChild(bar);

    const label = document.createElement('div');
    label.style.cssText = `flex: 1; text-align: center; font-size: 0.58rem; color: var(--text-muted); min-width: 0; overflow: hidden;`;
    label.innerText = d.year;
    yearsRow.appendChild(label);

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setTimeout(() => { bar.style.height = `${heightPct}%`; }, 100);
        observer.disconnect();
      }
    }, { threshold: 0.2 });
    observer.observe(bar);
  });

  // Update chart title with years
  const title = document.getElementById('sc-chart-title');
  if (title && CITATION_YEARS.length > 0) {
    const startY = CITATION_YEARS[0].year;
    const endY = CITATION_YEARS[CITATION_YEARS.length - 1].year;
    title.innerText = `Citation History (${startY} – ${endY})`;
  }
}

/* ══════════════════════════════════════════
   PUBLICATION TABS
══════════════════════════════════════════ */
function initPublicationTabs() {
  document.querySelectorAll('.tab-btn').forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.target;
      document.querySelectorAll('.tab-btn').forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.pub-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const panel = document.getElementById(targetId);
      if (panel) panel.classList.add('active');
    });
  });
}

function initPublicationSearch() {
  const searchInput = document.getElementById('pubSearch');
  const yearFilter = document.getElementById('pubYearFilter');
  const sortSelect = document.getElementById('pubSort');
  if (!searchInput || !yearFilter || !sortSelect) return;

  function filterAndSort() {
    const query = searchInput.value.toLowerCase();
    const year = yearFilter.value;
    const sort = sortSelect.value;

    document.querySelectorAll('.pub-panel').forEach(panel => {
      if (panel.id === 'tab-b') return;
      const items = Array.from(panel.querySelectorAll('.pub-item'));
      items.forEach(item => {
        const title = item.querySelector('.pub-title');
        const titleText = title ? title.innerText.toLowerCase() : '';
        const itemYear = item.getAttribute('data-year') || '';
        const matchesSearch = titleText.includes(query);
        const matchesYear = (year === 'all' || year === itemYear);
        item.style.display = (matchesSearch && matchesYear) ? '' : 'none';
      });
      items.sort((a, b) => {
        const yearA = parseInt(a.getAttribute('data-year')) || 0;
        const yearB = parseInt(b.getAttribute('data-year')) || 0;
        const citeA = parseInt(a.getAttribute('data-cites')) || 0;
        const citeB = parseInt(b.getAttribute('data-cites')) || 0;
        if (sort === 'newest') return yearB - yearA;
        if (sort === 'oldest') return yearA - yearB;
        if (sort === 'citations') return citeB - citeA;
        return 0;
      });
      items.forEach(item => panel.appendChild(item));
    });
  }

  searchInput.addEventListener('input', filterAndSort);
  yearFilter.addEventListener('change', filterAndSort);
  sortSelect.addEventListener('change', filterAndSort);
}

/* ══════════════════════════════════════════
   SCHOLAR RENDER HELPERS
══════════════════════════════════════════ */

function applyScholarData(data) {
  try {
    if (!data) return;
    setAndAnimate('sc-citations', data.citationsTotal);
    setAndAnimate('sc-hindex', data.hTotal);
    setAndAnimate('sc-i10', data.i10Total);
    if (data.citationsSince !== undefined && data.citationsSince !== null) setText('sc-cit-recent', data.citationsSince.toLocaleString());
    if (data.hSince !== undefined && data.hSince !== null) setText('sc-h-recent', data.hSince);
    if (data.i10Since !== undefined && data.i10Since !== null) setText('sc-i10-recent', data.i10Since);
    // Updated titles
    animateCounter(document.getElementById('statCitations'), data.citationsTotal, 1600);
    animateCounter(document.getElementById('statHindex'), data.hTotal, 1600);
    animateCounter(document.getElementById('statI10'), data.i10Total, 1600);

    // Dynamic Chart Rebuild
    buildCitationChart();

    // Public Access
    const paBox = document.getElementById('sc-pa-box');
    const paStatus = document.getElementById('sc-pa-status');
    if (paBox && paStatus && data.paAvail !== undefined) {
      paBox.style.display = 'block';
      paStatus.innerText = `${data.paAvail} articles available`;
    }

    // Co-authors
    if (data.coAuthors && Array.isArray(data.coAuthors) && data.coAuthors.length > 0) {
      renderCoAuthors(data.coAuthors);
    }
  } catch (err) {
    console.warn("Failed to apply scholar data:", err);
  }
}

function renderCoAuthors(authors) {
  const section = document.getElementById('coauthors-section');
  const list = document.getElementById('coauthors-list');
  if (!section || !list) return;

  section.style.display = 'block';
  list.innerHTML = authors.map(a => `
    <a href="${a.link}" target="_blank" class="s-card glass" style="min-width: 220px; padding: 20px; flex-shrink: 0; text-decoration: none; display: block; border: 1px solid rgba(255,255,255,0.05);">
       <div style="font-weight: 600; color: var(--text-bright); margin-bottom: 5px;">${a.name}</div>
       <div style="font-size: 0.8rem; opacity: 0.7; line-height: 1.4;">${a.affiliation}</div>
    </a>
  `).join('');
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
}

function setAndAnimate(id, value) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerText = '0';
  setTimeout(() => animateCounter(el, value, 1400), 300);
}
