/* admin.js — All CRUD logic for Dr. Esakkirajan Admin Panel */
let sb = null;
let curPw = typeof ADMIN_PASSWORD !== 'undefined' ? ADMIN_PASSWORD : 'esir@admin2024';
let curUser = typeof ADMIN_USERNAME !== 'undefined' ? ADMIN_USERNAME : 'admin';

window.addEventListener('DOMContentLoaded', () => {
    const saved = sessionStorage.getItem('esir_admin');
    if (saved === 'true') showApp();
    if (typeof window.supabase !== 'undefined') {
        sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    document.getElementById('lp').addEventListener('keyup', e => { if (e.key === 'Enter') doLogin(); });
    const pw = sessionStorage.getItem('esir_pw'); if (pw) curPw = pw;
});

function doLogin() {
    const u = document.getElementById('lu').value.trim();
    const p = document.getElementById('lp').value;
    if (u === curUser && p === curPw) { sessionStorage.setItem('esir_admin', 'true'); showApp(); }
    else { const e = document.getElementById('lerr'); e.style.display = 'block'; setTimeout(() => e.style.display = 'none', 3000); }
}
function showApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('app').classList.add('on');
    loadDash(); loadSc();
}
function doLogout() { sessionStorage.removeItem('esir_admin'); location.reload(); }

// ── NAVIGATION ──
const titles = {
    home: '🏠 Dashboard', education: '🎓 Education', classes: '📋 Classes & Courses',
    publications: '📄 Publications', books: '📚 Books', patents: '💡 Patents',
    experience: '🏛 Experience', scholar: '📊 Scholar Metrics', academic_ids: '🔗 Academic IDs', password: '🔑 Change Password'
};
const loaders = {
    education: loadEdu, classes: loadCls, publications: loadPub, books: loadBk,
    patents: loadPat, experience: loadExp, scholar: loadSc, academic_ids: loadAid
};

function nav(name) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('on'));
    document.querySelectorAll('.ni').forEach(n => n.classList.remove('on'));
    document.getElementById('p-' + name).classList.add('on');
    event.currentTarget.classList.add('on');
    document.getElementById('ptitle').textContent = titles[name] || name;
    if (loaders[name]) loaders[name]();
}

// ── TOAST ──
function toast(msg, type = 'ok') {
    const t = document.getElementById('toast');
    t.textContent = msg; t.className = (type === 'err' ? 'err ' : '') + ' on';
    setTimeout(() => t.className = '', 3000);
}

// ── DASHBOARD ──
async function loadDash() {
    if (!sb) return;
    const tables = [
        { name: 'education', label: 'Education Entries', color: '#22d3ee', emoji: '🎓', panel: 'education' },
        { name: 'classes', label: 'Courses', color: '#a78bfa', emoji: '📋', panel: 'classes' },
        { name: 'publications', label: 'Publications', color: '#f59e0b', emoji: '📄', panel: 'publications' },
        { name: 'books', label: 'Books', color: '#10b981', emoji: '📚', panel: 'books' },
        { name: 'patents', label: 'Patents', color: '#ef4444', emoji: '💡', panel: 'patents' },
        { name: 'experience', label: 'Experience', color: '#6366f1', emoji: '🏛', panel: 'experience' },
    ];
    const counts = await Promise.all(tables.map(t => sb.from(t.name).select('id', { count: 'exact', head: true })));
    const g = document.getElementById('dashGrid');
    g.innerHTML = tables.map((t, i) => `
    <div class="dash-card" style="border-top-color:${t.color}" onclick="nav('${t.panel}')">
      <div class="num" style="color:${t.color}">${counts[i].count ?? 0}</div>
      <div class="lbl">${t.emoji} ${t.label}</div>
    </div>
  `).join('');
}

// ── EDUCATION ──
async function loadEdu() {
    if (!sb) return;
    const { data } = await sb.from('education').select('*').order('display_order');
    window._edu = data;
    document.getElementById('edu-tb').innerHTML = data.map(e => `<tr>
    <td style="font-size:1.3rem">${e.logo_emoji || '🎓'}</td>
    <td><strong>${e.institution}</strong></td>
    <td>${e.degree}</td><td>${e.field}</td>
    <td><span class="badge">${e.start_year}–${e.end_year}</span></td>
    <td style="font-size:.82rem;color:var(--muted)">${e.grade}</td>
    <td><button class="btn-ed" onclick="editEdu(${e.id})">Edit</button><button class="btn-del" onclick="delRow('education',${e.id},loadEdu)">Delete</button></td>
  </tr>`).join('');
}
function editEdu(id) {
    const e = window._edu.find(x => x.id === id); if (!e) return;
    setVals({
        edu_id: id, 'edu-inst': e.institution, 'edu-deg': e.degree, 'edu-fld': e.field,
        'edu-sy': e.start_year, 'edu-ey': e.end_year, 'edu-gr': e.grade, 'edu-em': e.logo_emoji || '🎓'
    });
    document.getElementById('edu-fh').textContent = '✏️ Edit Education';
    show('edu-cx');
    document.getElementById('fc-edu').classList.remove('fc-hidden'); document.getElementById('fc-edu').classList.add('fc-visible');
}
function resetEdu() {
    clearVals(['edu-inst', 'edu-deg', 'edu-fld', 'edu-sy', 'edu-ey', 'edu-gr']);
    document.getElementById('edu-em').value = '🎓'; document.getElementById('edu-id').value = '';
    document.getElementById('edu-fh').textContent = '➕ Add Education'; hide('edu-cx');
    document.getElementById('fc-edu').classList.remove('fc-visible'); document.getElementById('fc-edu').classList.add('fc-hidden');
}
async function saveEdu() {
    const payload = {
        institution: g('edu-inst'), degree: g('edu-deg'), field: g('edu-fld'),
        start_year: parseInt(g('edu-sy')) || null, end_year: parseInt(g('edu-ey')) || null,
        grade: g('edu-gr'), logo_emoji: g('edu-em') || '🎓'
    };
    if (!payload.institution) return toast('Institution required', 'err');
    const id = document.getElementById('edu-id').value;
    const { error } = id ? await sb.from('education').update(payload).eq('id', id)
        : await sb.from('education').insert(payload);
    if (error) return toast('Error: ' + error.message, 'err');
    toast(id ? '✅ Education updated!' : '✅ Education added!'); resetEdu(); loadEdu();
}

// ── CLASSES ──
async function loadCls() {
    if (!sb) return;
    const { data } = await sb.from('classes').select('*').order('display_order');
    window._cls = data;
    document.getElementById('cls-tb').innerHTML = data.map(c => `<tr>
    <td><span class="badge badge-y">${c.course_code || '—'}</span></td>
    <td><strong>${c.course_name}</strong></td>
    <td>${c.semester || '—'}</td><td>${c.academic_year || '—'}</td>
    <td><span class="badge ${c.class_type === 'Lab' ? 'badge-g' : c.class_type === 'Elective' ? 'badge-r' : ''}">${c.class_type}</span></td>
    <td>${c.credits}</td>
    <td style="font-size:.8rem;color:var(--muted);max-width:160px">${c.notes || '—'}</td>
    <td><button class="btn-ed" onclick="editCls(${c.id})">Edit</button><button class="btn-del" onclick="delRow('classes',${c.id},loadCls)">Delete</button></td>
  </tr>`).join('');
}
function editCls(id) {
    const c = window._cls.find(x => x.id === id); if (!c) return;
    setVals({
        cls_id: id, 'cls-code': c.course_code, 'cls-name': c.course_name, 'cls-sem': c.semester,
        'cls-yr': c.academic_year, 'cls-prog': c.degree_programme, 'cls-cred': c.credits, 'cls-notes': c.notes || ''
    });
    document.getElementById('cls-type').value = c.class_type;
    document.getElementById('cls-fh').textContent = '✏️ Edit Course';
    show('cls-cx');
    document.getElementById('fc-cls').classList.remove('fc-hidden'); document.getElementById('fc-cls').classList.add('fc-visible');
}
function resetCls() {
    clearVals(['cls-code', 'cls-name', 'cls-sem', 'cls-yr', 'cls-prog', 'cls-cred', 'cls-notes']);
    document.getElementById('cls-id').value = ''; document.getElementById('cls-type').value = 'Theory';
    document.getElementById('cls-fh').textContent = '➕ Add Class / Course'; hide('cls-cx');
    document.getElementById('fc-cls').classList.remove('fc-visible'); document.getElementById('fc-cls').classList.add('fc-hidden');
}
async function saveCls() {
    const payload = {
        course_code: g('cls-code'), course_name: g('cls-name'), semester: g('cls-sem'),
        academic_year: g('cls-yr'), degree_programme: g('cls-prog'), credits: parseInt(g('cls-cred')) || 3,
        class_type: document.getElementById('cls-type').value, notes: g('cls-notes')
    };
    if (!payload.course_name) return toast('Course name required', 'err');
    const id = document.getElementById('cls-id').value;
    const { error } = id ? await sb.from('classes').update(payload).eq('id', id)
        : await sb.from('classes').insert(payload);
    if (error) return toast('Error: ' + error.message, 'err');
    toast(id ? '✅ Course updated!' : '✅ Course added!'); resetCls(); loadCls();
}

// ── PUBLICATIONS ──
async function loadPub() {
    if (!sb) return;
    const { data } = await sb.from('publications').select('*').order('year', { ascending: false });
    window._pub = data;
    document.getElementById('pub-tb').innerHTML = data.map(p => `<tr>
    <td><span class="badge">${p.year}</span></td>
    <td><span class="badge ${p.type === 'conference' ? 'badge-y' : ''}" style="text-transform:capitalize">${p.type}</span></td>
    <td style="max-width:260px;font-size:.84rem">${p.title}</td>
    <td style="font-size:.8rem;color:var(--muted);max-width:160px">${p.venue || '—'}</td>
    <td><strong style="color:var(--cyan)">${p.cites}</strong></td>
    <td><button class="btn-ed" onclick="editPub(${p.id})">Edit</button><button class="btn-del" onclick="delRow('publications',${p.id},loadPub)">Delete</button></td>
  </tr>`).join('');
}
function editPub(id) {
    const p = window._pub.find(x => x.id === id); if (!p) return;
    setVals({
        pub_id: id, 'pub-ti': p.title, 'pub-yr': p.year, 'pub-ci': p.cites,
        'pub-au': p.authors || '', 'pub-vn': p.venue || '', 'pub-bl': p.badge_label || '', 'pub-lk': p.link || ''
    });
    document.getElementById('pub-tp').value = p.type;
    document.getElementById('pub-fh').textContent = '✏️ Edit Publication'; show('pub-cx');
    document.getElementById('fc-pub').classList.remove('fc-hidden'); document.getElementById('fc-pub').classList.add('fc-visible');
}
function resetPub() {
    clearVals(['pub-ti', 'pub-yr', 'pub-ci', 'pub-au', 'pub-vn', 'pub-bl', 'pub-lk']);
    document.getElementById('pub-id').value = ''; document.getElementById('pub-tp').value = 'journal';
    document.getElementById('pub-fh').textContent = '➕ Add Publication'; hide('pub-cx');
    document.getElementById('fc-pub').classList.remove('fc-visible'); document.getElementById('fc-pub').classList.add('fc-hidden');
}
async function savePub() {
    const payload = {
        title: g('pub-ti'), type: document.getElementById('pub-tp').value,
        year: parseInt(g('pub-yr')) || new Date().getFullYear(), cites: parseInt(g('pub-ci')) || 0,
        authors: g('pub-au'), venue: g('pub-vn'), badge_label: g('pub-bl') || null, link: g('pub-lk') || null
    };
    if (!payload.title) return toast('Title required', 'err');
    const id = document.getElementById('pub-id').value;
    const { error } = id ? await sb.from('publications').update(payload).eq('id', id)
        : await sb.from('publications').insert(payload);
    if (error) return toast('Error: ' + error.message, 'err');
    toast(id ? '✅ Publication updated!' : '✅ Publication added!'); resetPub(); loadPub();
}

// ── BOOKS ──
async function loadBk() {
    if (!sb) return;
    const { data } = await sb.from('books').select('*').order('year', { ascending: false });
    window._bk = data;
    document.getElementById('bk-tb').innerHTML = data.map(b => `<tr>
    <td>${b.cover ? `<img src="${b.cover}" style="height:48px;border-radius:4px;object-fit:cover" onerror="this.style.display='none'">` : '—'}</td>
    <td><span class="badge">${b.year}</span></td>
    <td style="max-width:200px;font-size:.84rem"><strong>${b.title}</strong></td>
    <td style="font-size:.8rem;color:var(--muted)">${b.authors}</td>
    <td style="font-size:.8rem">${b.publisher}</td>
    <td style="font-size:.78rem;color:var(--muted)">${b.isbn || '—'}</td>
    <td><button class="btn-ed" onclick="editBk(${b.id})">Edit</button><button class="btn-del" onclick="delRow('books',${b.id},loadBk)">Delete</button></td>
  </tr>`).join('');
}
function editBk(id) {
    const b = window._bk.find(x => x.id === id); if (!b) return;
    setVals({
        bk_id: id, 'bk-ti': b.title, 'bk-au': b.authors || '', 'bk-pu': b.publisher || '',
        'bk-yr': b.year, 'bk-is': b.isbn || '', 'bk-co': b.cover || '', 'bk-lk': b.link || '', 'bk-de': b.description || ''
    });
    document.getElementById('bk-fh').textContent = '✏️ Edit Book'; show('bk-cx');
    document.getElementById('fc-bk').classList.remove('fc-hidden'); document.getElementById('fc-bk').classList.add('fc-visible');
}
function resetBk() {
    clearVals(['bk-ti', 'bk-au', 'bk-pu', 'bk-yr', 'bk-is', 'bk-co', 'bk-lk', 'bk-de']);
    document.getElementById('bk-id').value = '';
    document.getElementById('bk-fh').textContent = '➕ Add Book'; hide('bk-cx');
    document.getElementById('fc-bk').classList.remove('fc-visible'); document.getElementById('fc-bk').classList.add('fc-hidden');
}
async function saveBk() {
    const payload = {
        title: g('bk-ti'), authors: g('bk-au'), publisher: g('bk-pu'),
        year: parseInt(g('bk-yr')) || new Date().getFullYear(), isbn: g('bk-is'), cover: g('bk-co'),
        link: g('bk-lk'), description: g('bk-de')
    };
    if (!payload.title) return toast('Title required', 'err');
    const id = document.getElementById('bk-id').value;
    const { error } = id ? await sb.from('books').update(payload).eq('id', id)
        : await sb.from('books').insert(payload);
    if (error) return toast('Error: ' + error.message, 'err');
    toast(id ? '✅ Book updated!' : '✅ Book added!'); resetBk(); loadBk();
}

// ── PATENTS ──
async function loadPat() {
    if (!sb) return;
    const { data } = await sb.from('patents').select('*').order('display_order');
    window._pat = data;
    document.getElementById('pat-tb').innerHTML = data.map(p => `<tr>
    <td style="font-size:1.4rem">${p.icon}</td>
    <td style="font-size:.8rem;color:var(--muted);max-width:180px">${p.category}</td>
    <td style="font-size:.84rem;max-width:280px">${p.title}</td>
    <td style="font-size:.8rem;color:var(--muted)">${p.authors}</td>
    <td><button class="btn-ed" onclick="editPat(${p.id})">Edit</button><button class="btn-del" onclick="delRow('patents',${p.id},loadPat)">Delete</button></td>
  </tr>`).join('');
}
function editPat(id) {
    const p = window._pat.find(x => x.id === id); if (!p) return;
    setVals({ pat_id: id, 'pat-ti': p.title, 'pat-ca': p.category, 'pat-au': p.authors || '', 'pat-ic': p.icon || '💡' });
    document.getElementById('pat-fh').textContent = '✏️ Edit Patent'; show('pat-cx');
    document.getElementById('fc-pat').classList.remove('fc-hidden'); document.getElementById('fc-pat').classList.add('fc-visible');
}
function resetPat() {
    clearVals(['pat-ti', 'pat-ca', 'pat-au']); document.getElementById('pat-ic').value = '💡';
    document.getElementById('pat-id').value = '';
    document.getElementById('pat-fh').textContent = '➕ Add Patent'; hide('pat-cx');
    document.getElementById('fc-pat').classList.remove('fc-visible'); document.getElementById('fc-pat').classList.add('fc-hidden');
}
async function savePat() {
    const payload = {
        title: g('pat-ti'), category: g('pat-ca'), authors: g('pat-au'),
        icon: g('pat-ic') || '💡', border_color: 'var(--accent-indigo)', category_color: 'var(--accent-cyan)'
    };
    if (!payload.title) return toast('Title required', 'err');
    const id = document.getElementById('pat-id').value;
    const { error } = id ? await sb.from('patents').update(payload).eq('id', id)
        : await sb.from('patents').insert(payload);
    if (error) return toast('Error: ' + error.message, 'err');
    toast(id ? '✅ Patent updated!' : '✅ Patent added!'); resetPat(); loadPat();
}

// ── EXPERIENCE ──
async function loadExp() {
    if (!sb) return;
    const { data } = await sb.from('experience').select('*').order('display_order');
    window._exp = data;
    document.getElementById('exp-tb').innerHTML = data.map(e => `<tr>
    <td style="color:var(--cyan);font-size:.85rem;white-space:nowrap">${e.year_range}</td>
    <td><strong>${e.title}</strong></td>
    <td style="font-size:.82rem;color:var(--muted)">${e.organisation.replace(/<br>/g, ' · ')}</td>
    <td><button class="btn-ed" onclick="editExp(${e.id})">Edit</button><button class="btn-del" onclick="delRow('experience',${e.id},loadExp)">Delete</button></td>
  </tr>`).join('');
}
function editExp(id) {
    const e = window._exp.find(x => x.id === id); if (!e) return;
    setVals({ exp_id: id, 'exp-yr': e.year_range, 'exp-ti': e.title, 'exp-or': e.organisation.replace(/<br>/g, '\n') });
    document.getElementById('exp-fh').textContent = '✏️ Edit Experience'; show('exp-cx');
    document.getElementById('fc-exp').classList.remove('fc-hidden'); document.getElementById('fc-exp').classList.add('fc-visible');
}
function resetExp() {
    clearVals(['exp-yr', 'exp-ti', 'exp-or']); document.getElementById('exp-id').value = '';
    document.getElementById('exp-fh').textContent = '➕ Add Experience'; hide('exp-cx');
    document.getElementById('fc-exp').classList.remove('fc-visible'); document.getElementById('fc-exp').classList.add('fc-hidden');
}
async function saveExp() {
    const payload = {
        year_range: g('exp-yr'), title: g('exp-ti'),
        organisation: g('exp-or').replace(/\n/g, '<br>')
    };
    if (!payload.title) return toast('Title required', 'err');
    const id = document.getElementById('exp-id').value;
    const { error } = id ? await sb.from('experience').update(payload).eq('id', id)
        : await sb.from('experience').insert(payload);
    if (error) return toast('Error: ' + error.message, 'err');
    toast(id ? '✅ Updated!' : '✅ Added!'); resetExp(); loadExp();
}

// ── SCHOLAR — Manual Fetch & Save (Admin Panel) ──
const SCHOLAR_PROXY = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent('https://scholar.google.co.in/citations?user=fEOnODMAAAAJ&hl=en')}`;
let _scId = null;

async function loadSc() {
    if (!sb) return;
    const { data } = await sb.from('scholar_metrics').select('*').order('id', { ascending: false }).limit(1);
    if (data && data.length) {
        const s = data[0];
        _scId = s.id;
        _setScAdmInfo(s);
    }
}

function _setScAdmInfo(s) {
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('scAdm-ct', s.citations_total.toLocaleString());
    set('scAdm-h', s.h_total);
    set('scAdm-i', s.i10_total);
}

async function fetchAndSaveSc() {
    const btn = document.getElementById('sc-fetch-btn');
    const msg = document.getElementById('sc-msg');
    const status = document.getElementById('scAdm-status');
    const ogHtml = btn.innerHTML;
    try {
        btn.innerHTML = '⏳ Fetching from Google Scholar...';
        btn.disabled = true;
        const res = await fetch(SCHOLAR_PROXY, { signal: AbortSignal.timeout(12000) });
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const cells = [...doc.querySelectorAll('#gsc_rsb_st td.gsc_rsb_std')]
            .map(td => parseInt(td.textContent.replace(/,/g, '')) || 0);

        if (cells.length >= 6) {
            // 1. Citation History (Years + Counts)
            const years = [...doc.querySelectorAll('.gsc_g_t')].map(t => t.textContent.trim());
            const counts = [...doc.querySelectorAll('.gsc_g_al')].map(t => parseInt(t.textContent) || 0);
            const citations_history = years.map((y, i) => ({ year: parseInt(y), count: counts[i] || 0 }));

            // 2. Co-authors
            const co_authors = [...doc.querySelectorAll('.gsc_rsb_a li')].map(li => {
                const a = li.querySelector('.gsc_rsb_a_desc a');
                return {
                    name: a ? a.textContent.trim() : '',
                    link: a ? 'https://scholar.google.co.in' + a.getAttribute('href') : '',
                    affiliation: li.querySelector('.gsc_rsb_a_ext') ? li.querySelector('.gsc_rsb_a_ext').textContent.trim() : ''
                };
            });

            // 3. Public Access
            const pubAcc = doc.querySelector('#gsc_rsb_m');
            let pa_avail = 0, pa_no = 0;
            if (pubAcc) {
                const avEl = pubAcc.querySelector('.gsc_rsb_m_a span');
                const noEl = pubAcc.querySelector('.gsc_rsb_m_na div');
                if (avEl) pa_avail = parseInt(avEl.textContent) || 0;
                if (noEl) pa_no = parseInt(noEl.textContent) || 0;
            }

            const payload = {
                citations_total: cells[0], citations_since: cells[1],
                h_total: cells[2], h_since: cells[3],
                i10_total: cells[4], i10_since: cells[5],
                citations_history,
                co_authors,
                public_access_available: pa_avail,
                public_access_not_available: pa_no,
                updated_at: new Date().toISOString()
            };
            if (!_scId) {
                const { data: existing } = await sb.from('scholar_metrics').select('id').limit(1);
                if (existing && existing.length > 0) {
                    _scId = existing[0].id;
                }
            }
            const { error, data } = _scId
                ? await sb.from('scholar_metrics').update(payload).eq('id', _scId).select()
                : await sb.from('scholar_metrics').insert(payload).select();

            if (error) throw error;
            if (data && data.length) { _scId = data[0].id; _setScAdmInfo(data[0]); }

            if (status) status.textContent = `— Last auto-fetched: ${new Date().toLocaleTimeString('en-US')}`;
            if (msg) { msg.style.display = 'block'; msg.textContent = '✅ Fetched live data and saved to database successfully!'; setTimeout(() => msg.style.display = 'none', 4000); }
            toast('✅ Scholar metrics actively saved!');
        } else {
            throw new Error('Could not parse Google Scholar HTML properly.');
        }
    } catch (err) {
        toast('❌ Fetch failed: ' + err.message, 'err');
    } finally {
        btn.innerHTML = ogHtml;
        btn.disabled = false;
    }
}

// ── SCHEMA RELOAD ──
async function forceSchemaRefresh() {
    try {
        // A simple query sometimes pokes the PostgREST cache to refresh
        await sb.from('scholar_metrics').select('id').limit(1);
        toast('🔄 Schema cache poked. If errors persist, please reload the page.');
    } catch (e) { }
}

// ── IMAGE UPLOADS ──
function uploadBookCover(input) {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
        toast('⚠️ File too large. Max 2 MB. Use a smaller image.', 'err');
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUrl = e.target.result;
        document.getElementById('bk-co').value = dataUrl;
        const preview = document.getElementById('bk-co-preview');
        const img = document.getElementById('bk-co-img');
        if (preview && img) {
            img.src = dataUrl;
            preview.style.display = 'block';
        }
        toast('✅ Image loaded! Click Save to store it.');
    };
    reader.readAsDataURL(file);
}

function uploadAidIcon(input) {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 1 * 1024 * 1024) {
        toast('⚠️ File too large. Max 1 MB.', 'err');
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        const dataUrl = e.target.result;
        document.getElementById('aid-ic').value = dataUrl;
        const preview = document.getElementById('aid-ic-preview');
        const img = document.getElementById('aid-ic-img');
        if (preview && img) {
            img.src = dataUrl;
            preview.style.display = 'flex';
        }
        toast('✅ Icon loaded! Click Save to store it.');
    };
    reader.readAsDataURL(file);
}

// ── ACADEMIC IDS ──
async function loadAid() {
    if (!sb) return;
    const { data } = await sb.from('academic_ids').select('*').order('display_order');
    window._aid = data;
    document.getElementById('aid-tb').innerHTML = data.map(a => `<tr>
    <td style="font-size:1.2rem;color:${a.icon_color || 'inherit'}">
        ${(a.icon && a.icon.startsWith('data:image')) ? `<img src="${a.icon}" style="height:24px;width:24px;object-fit:contain">` : (a.icon || '—')}
    </td>
    <td><strong>${a.name}</strong></td>
    <td style="font-size:.85rem;color:${a.value_color || 'var(--cyan)'}">${a.value}</td>
    <td><a href="${a.link}" target="_blank" style="color:var(--cyan);font-size:.8rem;word-break:break-all">${a.link}</a></td>
    <td><button class="btn-ed" onclick="editAid(${a.id})">Edit</button><button class="btn-del" onclick="delRow('academic_ids',${a.id},loadAid)">Delete</button></td>
  </tr>`).join('');
}
function editAid(id) {
    const a = window._aid.find(x => x.id === id); if (!a) return;
    setVals({ aid_id: id, 'aid-nm': a.name, 'aid-ic': a.icon, 'aid-vl': a.value, 'aid-lk': a.link });
    document.getElementById('aid-ic2').value = a.icon_color || '#ffffff';
    document.getElementById('aid-vc').value = a.value_color || '#22d3ee';

    const preview = document.getElementById('aid-ic-preview');
    const img = document.getElementById('aid-ic-img');
    if (preview && img && a.icon && a.icon.startsWith('data:image')) {
        img.src = a.icon;
        preview.style.display = 'flex';
    } else {
        preview.style.display = 'none';
    }

    document.getElementById('aid-fh').textContent = '✏️ Edit Academic ID'; show('aid-cx');
    document.getElementById('fc-aid').classList.remove('fc-hidden'); document.getElementById('fc-aid').classList.add('fc-visible');
}
function resetAid() {
    clearVals(['aid-nm', 'aid-ic', 'aid-vl', 'aid-lk']); document.getElementById('aid-id').value = '';
    document.getElementById('aid-ic-preview').style.display = 'none';
    document.getElementById('aid-fh').textContent = '➕ Add Academic ID / Profile Link'; hide('aid-cx');
    document.getElementById('fc-aid').classList.remove('fc-visible'); document.getElementById('fc-aid').classList.add('fc-hidden');
}
async function saveAid() {
    const payload = {
        name: g('aid-nm'), icon: g('aid-ic'), value: g('aid-vl'), link: g('aid-lk'),
        icon_color: document.getElementById('aid-ic2').value || null,
        value_color: document.getElementById('aid-vc').value || null
    };
    if (!payload.name) return toast('Platform name required', 'err');
    const id = document.getElementById('aid-id').value;
    const { error } = id ? await sb.from('academic_ids').update(payload).eq('id', id)
        : await sb.from('academic_ids').insert(payload);
    if (error) return toast('Error: ' + error.message, 'err');
    toast(id ? '✅ ID updated!' : '✅ ID added!'); resetAid(); loadAid();
}

// ── SHARED DELETE ──
async function delRow(table, id, reloader) {
    if (!confirm('Delete this entry?')) return;
    await sb.from(table).delete().eq('id', id);
    toast('🗑️ Deleted'); reloader();
}

// ── PASSWORD CHANGE ──
function changePw() {
    const c = document.getElementById('pw-c').value;
    const n = document.getElementById('pw-n').value;
    const f = document.getElementById('pw-f').value;
    if (c !== curPw) { showPwMsg('❌ Current password is wrong.', 'var(--red)'); return; }
    if (n.length < 6) { showPwMsg('❌ Min 6 characters.', 'var(--red)'); return; }
    if (n !== f) { showPwMsg('❌ Passwords do not match.', 'var(--red)'); return; }
    curPw = n; sessionStorage.setItem('esir_pw', n);
    showPwMsg('✅ Password changed successfully for this session!', 'var(--green)');
    ['pw-c', 'pw-n', 'pw-f'].forEach(id => document.getElementById(id).value = '');
    toast('✅ Password changed for this session!');
}
function showPwMsg(msg, color) {
    const el = document.getElementById('pw-msg');
    el.style.display = 'block'; el.style.color = color; el.textContent = msg;
}

// ── HELPERS ──
function g(id) { return (document.getElementById(id) || {}).value?.trim() || ''; }
function setVals(obj) {
    for (const [k, v] of Object.entries(obj)) {
        const key = k.replace('_', '-');
        const el = document.getElementById(k) || document.getElementById(key);
        if (el) el.value = v ?? '';
    }
}
function clearVals(ids) { ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; }); }
function show(id) { const el = document.getElementById(id); if (el) el.style.display = 'inline-block'; }
function hide(id) { const el = document.getElementById(id); if (el) el.style.display = 'none'; }
