'use strict';
/* BossDesk. Everything is stored in this browser (localStorage, plus IndexedDB for audio). */

/* ============ Utilities ============ */
const KEY = 'bossdesk.v2';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const digits = s => String(s || '').replace(/\D/g, '');
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

const ICONS = {
  grid: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  mic: '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3"/>',
  printer: '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
  settings: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  crown: '<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7Z"/><path d="M5 20h14"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  edit: '<path d="M17 3a2.85 2.85 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
  retry: '<path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  off: '<path d="m2 2 20 20M9 9a3 3 0 0 0 4.2 4.2M17 17H7a5 5 0 0 1-1-9.9M10 5.3A5 5 0 0 1 17 9a5 5 0 0 1 4 4.5"/>'
};
const ic = (n, s = 16) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;

/* ---- dates ---- */
const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseYmd = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parseYmd(s); d.setDate(d.getDate() + n); return ymd(d); };
const today = () => ymd(new Date());
const startOfWeek = s => { const d = parseYmd(s); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return ymd(d); }; // Monday
const fmt12 = t => { if (!t) return ''; let [h, m] = t.split(':').map(Number); const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return `${h}:${pad(m)} ${ap}`; };
const fmtLong = s => parseYmd(s).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
const fmtShort = s => parseYmd(s).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const fmtMD = s => parseYmd(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const mmss = sec => `${pad(Math.floor(sec / 60))}:${pad(Math.floor(sec % 60))}`;
const fmtStamp = ts => new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
const nowHM = () => { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };

/* ============ State ============ */
function defaults() {
  return {
    user: null, session: false, fired: {},
    settings: {
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      emailSender: '', replyTo: '', waSender: '',
      reminderTpl: 'Reminder: {title} on {date} at {time}. {notes}',
      meetingTpl: "You're invited: {title} on {date} at {time} ({timezone}). Location: {location}. Agenda: {agenda}",
      defaultReminders: ['1h', '24h'], push: true, theme: 'dark'
    },
    contacts: [], reminders: [], meetings: [], messages: [], recordings: []
  };
}
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (d) { const df = defaults(); return { ...df, ...d, settings: { ...df.settings, ...d.settings } }; }
  } catch (e) { /* ignore */ }
  return defaults();
}
let S = load();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Could not save: browser storage is full or blocked.', 'err'); } };
const contact = id => S.contacts.find(c => c.id === id);
const boss = () => S.contacts.find(c => c.isBoss) || { id: '', name: 'Your boss', email: '', phone: '', role: '' };
const bossShort = () => {
  const n = boss().name.trim().split(/\s+/);
  return (/^(mr|mrs|ms|dr|eng|prof|sheikh)\.?$/i.test(n[0]) && n[1]) ? n[0] + ' ' + n[1] : (n[0] || 'Your boss');
};
const OFFSETS = { at: { label: 'At time', min: 0 }, '15m': { label: '15 min', min: 15 }, '1h': { label: '1 hr', min: 60 }, '24h': { label: '24 hr', min: 1440 }, '1w': { label: '1 week', min: 10080 } };
const CHL = { email: 'Email', whatsapp: 'WhatsApp' };
const chLabel = ch => (ch || []).map(c => CHL[c]).join(' + ') || 'No channel';

async function sha(p) {
  try { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('bossdesk:' + p)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
  catch (e) { return 'plain:' + p; }
}

/* ---- audio storage (IndexedDB) ---- */
const idb = () => new Promise((res, rej) => { const r = indexedDB.open('bossdesk-audio', 1); r.onupgradeneeded = () => r.result.createObjectStore('a'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
const idbTx = async (mode, fn) => { const d = await idb(); return new Promise((res, rej) => { const t = d.transaction('a', mode); const rq = fn(t.objectStore('a')); t.oncomplete = () => res(rq && rq.result); t.onerror = () => rej(t.error); }); };
const idbPut = (k, v) => idbTx('readwrite', s => s.put(v, k));
const idbGet = k => idbTx('readonly', s => s.get(k));
const idbDel = k => idbTx('readwrite', s => s.delete(k));

/* ============ UI primitives ============ */
function openModal(html, wide) {
  $('#modalRoot').innerHTML = `<div class="modal-bg"><div class="modal${wide ? ' wide' : ''}" role="dialog" aria-modal="true">${html}</div></div>`;
  const f = $('#modalRoot input:not([type=hidden]):not([type=checkbox]):not([type=date]):not([type=time]), #modalRoot textarea');
  if (f) setTimeout(() => f.focus(), 30);
}
const closeModal = () => { $('#modalRoot').innerHTML = ''; };
function toast(msg, type = 'ok', act) {
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = `<span>${esc(msg)}</span>${act ? `<button type="button" data-act="${act.act}" data-id="${esc(act.id || '')}">${esc(act.label)}</button>` : ''}`;
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), act ? 9000 : 3600);
}
const field = (label, inner, cls = '') => `<label class="f ${cls}"><span>${label}</span>${inner}</label>`;
const empty = (t, p) => `<div class="empty"><b class="serif">${t}</b><p>${p}</p></div>`;
const download = (name, text, type = 'text/plain') => {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
};
function printDocument(html) {
  const el = $('#printDoc'); el.innerHTML = html; document.body.classList.add('printing');
  const done = () => { document.body.classList.remove('printing'); el.innerHTML = ''; window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  setTimeout(() => window.print(), 60);
}

/* ============ Messaging ============ */
function openMail(to, subject, body, bcc) {
  const q = [];
  if (bcc) q.push('bcc=' + encodeURIComponent(bcc));
  q.push('subject=' + encodeURIComponent(subject), 'body=' + encodeURIComponent(body));
  const a = document.createElement('a'); a.href = `mailto:${to || ''}?${q.join('&')}`;
  document.body.appendChild(a); a.click(); a.remove();
}
function footer(ch) {
  const s = S.settings;
  const who = s.emailSender || `${S.user.name}, Office of ${boss().name}`;
  let f = `\n\n— ${who}`;
  if (ch === 'email' && s.replyTo) f += `\nReply to: ${s.replyTo}`;
  if (ch === 'whatsapp' && s.waSender) f += `\nWhatsApp: ${s.waSender}`;
  return f;
}
function deliver(e) {
  const c = contact(e.cid);
  const addr = e.channel === 'email' ? (c && c.email) : digits(c && c.phone);
  if (!addr) { e.status = 'failed'; e.error = e.channel === 'email' ? 'No email address on file' : 'No WhatsApp number on file'; return false; }
  e.addr = e.channel === 'email' ? c.email : c.phone; delete e.error;
  if (e.channel === 'email') openMail(c.email, e.subject, e.body + footer('email'));
  else window.open(`https://wa.me/${addr}?text=${encodeURIComponent(e.body + footer('whatsapp'))}`, '_blank', 'noopener');
  e.status = 'sent'; e.ts = Date.now();
  return true;
}
function send(channel, cid, subject, body, ref) {
  const c = contact(cid);
  const e = { id: uid(), ts: Date.now(), channel, cid, to: c ? c.name : 'Unknown', addr: '', subject, body, ref: ref || '', status: 'pending' };
  deliver(e); S.messages.unshift(e); save();
  if (e.status === 'failed') toast(`${e.error} for ${e.to}.`, 'err');
  else toast(`${CHL[channel]} opened for ${e.to}. Press send there.`);
  return e;
}
const fillTpl = (tpl, v) => tpl.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '').replace(/[ \t]{2,}/g, ' ').replace(/\s+([.,])/g, '$1').trim();
const reminderMsg = r => fillTpl(S.settings.reminderTpl, { title: r.title, date: fmtLong(r.date), time: fmt12(r.time), notes: r.notes || '' });
const meetingMsg = m => fillTpl(S.settings.meetingTpl, { title: m.title, date: fmtLong(m.date), time: `${fmt12(m.start)} to ${fmt12(m.end)}`, timezone: m.tz || S.settings.tz, location: m.location || 'To be confirmed', agenda: m.agenda || 'To be shared' });

let NOTE = null;
function notifyModal(ctx) {
  NOTE = ctx;
  const list = ctx.cids.map(contact).filter(Boolean);
  if (!list.length) { toast('No recipients to send to. Add participants first.', 'err'); return; }
  openModal(`<div class="row between"><h3 class="serif">Send message</h3><button type="button" class="ib" data-act="closeModal">${ic('x')}</button></div>
    <div class="muted small">${esc(ctx.subject)}</div>
    ${field('Message', `<textarea id="noteBody" rows="8">${esc(ctx.body)}</textarea>`)}
    <div>${list.map(c => `<div class="rcpt"><div class="avatar">${esc(c.name[0] || '?')}</div><div><b>${esc(c.name)}</b><small>${esc(c.email || 'no email')} · ${esc(c.phone || 'no WhatsApp number')}</small></div>
      <button type="button" class="btn sm" data-act="noteSend" data-ch="email" data-cid="${c.id}" ${c.email ? '' : 'disabled'}>${ic('mail', 14)} Email</button>
      <button type="button" class="btn sm" data-act="noteSend" data-ch="whatsapp" data-cid="${c.id}" ${c.phone ? '' : 'disabled'}>${ic('chat', 14)} WhatsApp</button></div>`).join('')}</div>
    <div class="row end wrap"><button type="button" class="btn primary" data-act="noteAll">${ic('mail')} Email all (hidden copy)</button></div>
    <p class="hint">Your email app or WhatsApp opens with the message ready. Press send there. Attachments (like a PDF) must be added by you.</p>`);
}

/* ============ Domain helpers ============ */
const meetingsOn = d => S.meetings.filter(m => m.date === d).sort((a, b) => a.start.localeCompare(b.start));
const cmpRem = (a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || ''));
const rStatus = r => { const l = r.log || {}, ch = r.channels || []; if (ch.some(c => l[c] === 'failed')) return 'failed'; if (ch.length && ch.every(c => l[c] === 'sent')) return 'sent'; return 'pending'; };
const conflicts = m => S.meetings.filter(o => o.id !== m.id && o.date === m.date && m.start < o.end && m.end > o.start);
const nextDate = (d, rep) => { const x = parseYmd(d); if (rep === 'daily') x.setDate(x.getDate() + 1); else if (rep === 'weekly') x.setDate(x.getDate() + 7); else x.setMonth(x.getMonth() + 1); return ymd(x); };

function tzOffsetMs(date, tz) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(date).map(x => [x.type, x.value]));
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - date.getTime();
}
function toUtc(date, time, tz) {
  const [y, m, d] = date.split('-').map(Number), [h, mi] = time.split(':').map(Number);
  const guess = Date.UTC(y, m - 1, d, h, mi);
  try { return new Date(guess - tzOffsetMs(new Date(guess), tz)); } catch (e) { return new Date(y, m - 1, d, h, mi); }
}
const icsEsc = s => String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
const icsDate = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
function buildICS(list) {
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//BossDesk//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  list.forEach(m => {
    const tz = m.tz || S.settings.tz;
    L.push('BEGIN:VEVENT', `UID:${m.id}@bossdesk`, `DTSTAMP:${icsDate(new Date())}`, `DTSTART:${icsDate(toUtc(m.date, m.start, tz))}`, `DTEND:${icsDate(toUtc(m.date, m.end, tz))}`, `SUMMARY:${icsEsc(m.title)}`);
    if (m.location) L.push('LOCATION:' + icsEsc(m.location));
    const desc = [m.agenda && 'Agenda: ' + m.agenda, m.notes].filter(Boolean).join('\n'); if (desc) L.push('DESCRIPTION:' + icsEsc(desc));
    (m.participants || []).forEach(cid => { const c = contact(cid); if (c && c.email) L.push(`ATTENDEE;CN=${c.name.replace(/[;,:"]/g, '')}:mailto:${c.email}`); });
    (m.reminders || []).forEach(k => { if (OFFSETS[k]) L.push('BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Reminder', `TRIGGER:-PT${OFFSETS[k].min}M`, 'END:VALARM'); });
    L.push('END:VEVENT');
  });
  L.push('END:VCALENDAR');
  return L.join('\r\n');
}

/* ============ Sample data ============ */
function seedSample() {
  const b = boss(), t = today(), tz = S.settings.tz;
  b.role = b.role || 'Chairman'; b.email = b.email || 'k.almansour@office.co'; b.phone = b.phone || '+971500000000';
  const sara = { id: uid(), name: 'Sara Haddad', role: 'Legal Counsel', email: 'sara@partners.co', phone: '+971501111111' };
  const omar = { id: uid(), name: 'Dr. Omar Rizk', role: 'Physician', email: 'omar@clinic.ae', phone: '+971502222222' };
  const hiro = { id: uid(), name: 'Hiro Tanaka', role: 'Trade Partner', email: 'hiro@tokyo-trade.jp', phone: '+819012345678' };
  S.contacts.push(sara, omar, hiro);
  const M = (title, date, start, end, location, agenda, ps) => ({ id: uid(), title, date, start, end, tz, location, agenda, notes: '', participants: ps, reminders: ['1h', '24h'] });
  S.meetings.push(
    M('Board Pre-Briefing', t, '09:30', '10:30', 'Executive Suite, 22nd Floor', 'Review board pack and talking points', [sara.id]),
    M('Lunch — Dr. Rizk', t, '14:00', '15:30', 'Al-Riwaq Restaurant', '', [omar.id]),
    M('Tokyo Trade Call', addDays(t, 1), '10:00', '10:45', 'Video call', 'Quarterly supply update', [hiro.id]),
    M('Charity Gala Planning', addDays(t, 5), '11:00', '12:00', 'Head Office', 'Venue, guest list and budget', [])
  );
  const R = (title, notes, date, time, priority, category, channels, log) => ({ id: uid(), title, notes, date, time, priority, category, repeat: 'none', channels, log: log || {}, done: false });
  S.reminders.push(
    R('Call sister (birthday tomorrow)', '', addDays(t, -1), '13:57', 'Low', '', ['email', 'whatsapp'], { email: 'failed' }),
    R('Sign Q3 dividend letter', 'Legal has prepared the document. Needs wet signature.', t, '15:57', 'High', 'Finance', ['email']),
    R('Take medication', '', addDays(t, 1), '08:00', 'Medium', 'Health', ['whatsapp'])
  );
}

/* ============ Router ============ */
const ROUTES = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid' }, { id: 'reminders', label: 'Reminders', icon: 'bell' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar' }, { id: 'contacts', label: 'Contacts', icon: 'users' },
  { id: 'recordings', label: 'Recordings', icon: 'mic' }, { id: 'print', label: 'Print & Export', icon: 'printer' },
  { id: 'log', label: 'Message Log', icon: 'mail' }, { id: 'settings', label: 'Settings', icon: 'settings' }
];
const META = {
  dashboard: ['Today', 'A single quiet view of the day ahead.'], reminders: ['Reminders', "Prompts delivered on your boss's behalf."],
  calendar: ['Calendar', 'Meetings across day, week and month.'], contacts: ['Contacts', 'Address book of frequent participants.'],
  recordings: ['Recordings', 'Captured conversations and transcripts.'], print: ['Print & Export', 'Clean, printable schedules on paper.'],
  log: ['Message Log', 'Every email and WhatsApp sent.'], settings: ['Settings', 'Preferences, integrations and templates.']
};
const PAGES = {}, AFTER = {};
let route = 'dashboard';
const readRoute = () => { const r = (location.hash || '').replace('#/', ''); return PAGES[r] ? r : 'dashboard'; };

function renderApp() {
  const logged = S.session && S.user;
  document.documentElement.dataset.theme = S.settings.theme;
  $('#auth').hidden = !!logged; $('#shell').hidden = !logged;
  if (!logged) { renderAuth(); return; }
  $('#nav').innerHTML = ROUTES.map(r => `<a class="nav-i ${r.id === route ? 'on' : ''}" href="#/${r.id}">${ic(r.icon, 17)}<span>${r.label}</span></a>`).join('');
  $('#who').innerHTML = `<div class="avatar">${esc((S.user.name[0] || '?').toUpperCase())}</div><div><b>${esc(S.user.name)}</b><small>Assistant to ${esc(boss().name)}</small></div>`;
  $('#menuBtn').innerHTML = ic('menu', 20);
  $('#themeBtn').innerHTML = ic(S.settings.theme === 'dark' ? 'sun' : 'moon', 17);
  $('#logoutBtn').innerHTML = ic('logout', 17);
  $('#recPill').hidden = !rec;
  $('#pageTitle').textContent = META[route][0]; $('#pageSub').textContent = META[route][1];
  $('#page').innerHTML = PAGES[route]();
  if (AFTER[route]) AFTER[route]();
}
window.addEventListener('hashchange', () => { route = readRoute(); document.body.classList.remove('nav-open'); renderApp(); window.scrollTo(0, 0); });

/* ============ Page: Dashboard ============ */
function meetRow(m, markNext) {
  const n = (m.participants || []).length;
  return `<button type="button" class="agenda-row" data-act="openMeeting" data-id="${m.id}">
    <div class="ag-time"><b class="mono">${fmt12(m.start)}</b><small class="mono">→ ${fmt12(m.end)}</small></div>
    <div class="ag-body"><h4>${esc(m.title)}</h4><div class="meta">${m.location ? `<span>${ic('pin', 13)} ${esc(m.location)}</span>` : ''}<span>${plural(n, 'participant')}</span></div></div>
    <i class="dot ${markNext ? 'on' : ''}"></i></button>`;
}
function remRow(r, full) {
  const st = rStatus(r), pr = (r.priority || 'Medium').toLowerCase();
  const acts = full ? `<div class="rem-act">${(r.channels || []).map(c => `<button type="button" class="ib" title="${(r.log && r.log[c] === 'failed') ? 'Retry' : 'Send'} by ${CHL[c]}" data-act="sendRem" data-id="${r.id}" data-ch="${c}">${ic((r.log && r.log[c] === 'failed') ? 'retry' : (c === 'email' ? 'mail' : 'chat'), 15)}</button>`).join('')}
    <button type="button" class="ib" title="Edit" data-act="editRem" data-id="${r.id}">${ic('edit', 15)}</button>
    <button type="button" class="ib del" title="Delete" data-act="delRem" data-id="${r.id}">${ic('trash', 15)}</button></div>` : '';
  return `<div class="rem ${r.done ? 'is-done' : ''}">
    <button type="button" class="check ${r.done ? 'on' : ''}" data-act="toggleRem" data-id="${r.id}" title="${r.done ? 'Mark as not done' : 'Mark complete'}">${r.done ? ic('check', 12) : ''}</button>
    <div><div class="rem-t"><b>${esc(r.title)}</b>${full ? `<span class="tag ${pr}">${esc(r.priority)}</span>${r.category ? `<em>${esc(r.category)}</em>` : ''}` : ''}</div>
      ${full && r.notes ? `<div class="rem-n">${esc(r.notes)}</div>` : ''}
      <div class="meta"><span>${ic('clock', 12)} ${fmtShort(r.date)} · ${fmt12(r.time)}</span>${full ? `<span>→ ${esc(boss().name)}</span>` : `<span class="tag ${pr}">${esc(r.priority)}</span>`}${r.repeat && r.repeat !== 'none' ? `<span>↻ ${esc(r.repeat)}</span>` : ''}<span class="tag ${st}">${st[0].toUpperCase() + st.slice(1)}</span><span class="tag chn">${chLabel(r.channels)}</span></div></div>${acts}</div>`;
}
PAGES.dashboard = () => {
  const t = today(), meets = meetingsOn(t), ws = startOfWeek(t), we = addDays(ws, 6);
  const weekN = S.meetings.filter(m => m.date >= ws && m.date <= we).length;
  const overdue = S.reminders.filter(r => !r.done && r.date < t).length;
  const delivered = S.messages.filter(m => m.status === 'sent').length;
  const hr = new Date().getHours(), g = hr < 12 ? 'morning' : hr < 18 ? 'afternoon' : 'evening';
  const up = S.reminders.filter(r => !r.done).sort(cmpRem).slice(0, 5);
  const now = nowHM(), nextIdx = meets.findIndex(m => m.end > now);
  return `<section class="card hero"><div class="hero-top"><div>
      <small class="date mono">${esc(fmtLong(t).toUpperCase())}</small>
      <h2 class="serif">Good ${g}, ${esc(S.user.name)}.</h2>
      <p>${esc(bossShort())} has <b>${meets.length}</b> ${meets.length === 1 ? 'meeting' : 'meetings'} today ${overdue ? `and <b class="bad">${plural(overdue, 'overdue reminder')}</b>` : 'and no overdue reminders'}.</p></div>
      <div class="hero-actions"><button type="button" class="btn" data-act="newRem">${ic('plus')} Reminder</button><button type="button" class="btn primary" data-act="newMeeting">${ic('plus')} Meeting</button></div></div>
    <div class="stats">
      <div class="stat"><small>Today</small><b>${meets.length}</b><span>meetings</span></div>
      <div class="stat"><small>This week</small><b>${weekN}</b><span>meetings</span></div>
      <div class="stat"><small>Overdue</small><b class="${overdue ? 'bad' : ''}">${overdue}</b><span>reminders</span></div>
      <div class="stat"><small>Delivered</small><b>${delivered}</b><span>messages</span></div></div></section>
    <div class="cols">
      <section class="card"><div class="card-h"><div><h2 class="serif">Today's agenda</h2><div class="muted small">${esc(parseYmd(t).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }))}</div></div><a class="link" href="#/calendar">Open calendar ${ic('arrow', 13)}</a></div>
        ${meets.length ? meets.map((m, i) => meetRow(m, i === nextIdx)).join('') : empty('No meetings today', 'Tap “Meeting” to add one.')}</section>
      <section class="card"><div class="card-h"><div><h2 class="serif">Reminders</h2><div class="muted small">Next five by date</div></div><a class="link" href="#/reminders">All ${ic('arrow', 13)}</a></div>
        ${up.length ? up.map(r => remRow(r, false)).join('') : empty('All clear', 'No open reminders.')}</section></div>`;
};

/* ============ Page: Reminders ============ */
let remTab = 'today';
const remFilters = { today: r => !r.done && r.date === today(), upcoming: r => !r.done && r.date > today(), overdue: r => !r.done && r.date < today(), completed: r => r.done, all: () => true };
PAGES.reminders = () => {
  const tabs = [['today', 'Today'], ['upcoming', 'Upcoming'], ['overdue', 'Overdue'], ['completed', 'Completed'], ['all', 'All']];
  const list = S.reminders.filter(remFilters[remTab]).sort(cmpRem);
  const lbl = tabs.find(t => t[0] === remTab)[1];
  return `<div class="toolbar"><div class="seg">${tabs.map(([k, l]) => `<button type="button" class="${remTab === k ? 'on' : ''}" data-act="remTab" data-k="${k}">${l}<i>${S.reminders.filter(remFilters[k]).length}</i></button>`).join('')}</div>
    <button type="button" class="btn primary" data-act="newRem">${ic('plus')} New reminder</button></div>
    <section class="card"><h2 class="serif" style="margin-bottom:6px">${lbl} reminders</h2>${list.length ? list.map(r => remRow(r, true)).join('') : empty('Nothing here', 'No reminders in this view.')}</section>`;
};
function openReminderForm(id, date) {
  const r = S.reminders.find(x => x.id === id) || { title: '', notes: '', date: date || today(), time: '09:00', priority: 'Medium', category: '', repeat: 'none', channels: ['email'] };
  const b = boss(), miss = [];
  openModal(`<form data-form="reminder" data-id="${id || ''}"><div class="row between"><h3 class="serif">${id ? 'Edit' : 'New'} reminder</h3><button type="button" class="ib" data-act="closeModal">${ic('x')}</button></div>
    ${field('Title', `<input name="title" required value="${esc(r.title)}" placeholder="e.g. Sign the contract">`)}
    ${field('Notes', `<textarea name="notes" rows="2">${esc(r.notes)}</textarea>`)}
    <div class="grid2">${field('Date', `<input type="date" name="date" required value="${r.date}">`)}${field('Time', `<input type="time" name="time" required value="${r.time}">`)}</div>
    <div class="grid3">${field('Priority', `<select name="priority">${['Low', 'Medium', 'High'].map(p => `<option ${p === r.priority ? 'selected' : ''}>${p}</option>`).join('')}</select>`)}
      ${field('Category', `<input name="category" list="cats" value="${esc(r.category)}" placeholder="Optional"><datalist id="cats"><option>Finance</option><option>Personal</option><option>Health</option><option>Work</option><option>Travel</option></datalist>`)}
      ${field('Repeat', `<select name="repeat">${['none', 'daily', 'weekly', 'monthly'].map(p => `<option ${p === r.repeat ? 'selected' : ''}>${p}</option>`).join('')}</select>`)}</div>
    <div class="f"><span>Send to ${esc(b.name)} by</span><div class="pills">${['email', 'whatsapp'].map(c => `<label class="pill"><input type="checkbox" name="ch" value="${c}" ${(r.channels || []).includes(c) ? 'checked' : ''}><span>${CHL[c]}</span></label>`).join('')}</div>
      ${(!b.email || !b.phone) ? `<span class="hint bad" style="text-transform:none;letter-spacing:0">${!b.email ? 'No email saved for ' + esc(b.name) + '. ' : ''}${!b.phone ? 'No WhatsApp number saved. ' : ''}Add them in Contacts.</span>` : ''}</div>
    <div class="row end"><button type="button" class="btn" data-act="closeModal">Cancel</button><button class="btn primary">Save reminder</button></div></form>`);
}

/* ============ Page: Calendar ============ */
let calView = 'week', calDate = today();
const calShift = dir => {
  if (calView === 'day') calDate = addDays(calDate, dir);
  else if (calView === 'week') calDate = addDays(calDate, 7 * dir);
  else { const d = parseYmd(calDate); d.setDate(1); d.setMonth(d.getMonth() + dir); calDate = ymd(d); }
};
function calLabel() {
  if (calView === 'day') return fmtLong(calDate);
  if (calView === 'week') { const s = startOfWeek(calDate), e = addDays(s, 6); return `${fmtMD(s)} — ${parseYmd(e).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`; }
  return parseYmd(calDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
function calBody() {
  const t = today();
  if (calView === 'day') {
    const list = meetingsOn(calDate);
    return `<section class="card">${list.length ? list.map(m => meetRow(m, false)).join('') : empty('Nothing scheduled', 'No meetings on this day.')}<div style="margin-top:12px"><button type="button" class="btn sm" data-act="newMeeting" data-date="${calDate}">${ic('plus', 14)} Add meeting</button></div></section>`;
  }
  if (calView === 'week') {
    const s = startOfWeek(calDate);
    return `<div class="scroll-x"><div class="week">${[...Array(7)].map((_, i) => {
      const d = addDays(s, i), dd = parseYmd(d);
      return `<div class="day ${d === t ? 'today' : ''}"><div class="day-h"><span>${dd.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</span><b>${dd.getDate()}</b></div>
        ${meetingsOn(d).map(m => `<button type="button" class="mini" data-act="openMeeting" data-id="${m.id}"><small>${fmt12(m.start)}</small><b>${esc(m.title)}</b></button>`).join('')}
        <button type="button" class="add" data-act="newMeeting" data-date="${d}">+ Add</button></div>`;
    }).join('')}</div></div>`;
  }
  const d = parseYmd(calDate), first = new Date(d.getFullYear(), d.getMonth(), 1);
  const days = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(), weeks = Math.ceil((((first.getDay() + 6) % 7) + days) / 7), gs = startOfWeek(ymd(first));
  return `<div class="mgrid">${['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(x => `<div class="mhead">${x}</div>`).join('')}${[...Array(weeks * 7)].map((_, i) => {
    const c = addDays(gs, i), cd = parseYmd(c), ms = meetingsOn(c);
    return `<div class="mcell ${cd.getMonth() !== d.getMonth() ? 'dim' : ''} ${c === t ? 'today' : ''}" data-act="dayCell" data-date="${c}"><b>${cd.getDate()}</b><div class="chips">${ms.slice(0, 2).map(m => `<button type="button" class="chip" data-act="openMeeting" data-id="${m.id}">${fmt12(m.start).replace(':00', '')} ${esc(m.title)}</button>`).join('')}</div>${ms.length > 2 ? `<span class="more">+${ms.length - 2} more</span>` : ''}</div>`;
  }).join('')}</div>`;
}
PAGES.calendar = () => `<div class="toolbar"><div class="cal-nav"><button type="button" class="btn" data-act="calPrev" aria-label="Previous">${ic('left')}</button><button type="button" class="btn" data-act="calToday">Today</button><button type="button" class="btn" data-act="calNext" aria-label="Next">${ic('right')}</button><h2 class="serif">${esc(calLabel())}</h2></div>
  <div class="row wrap"><div class="seg">${['day', 'week', 'month'].map(v => `<button type="button" class="${calView === v ? 'on' : ''}" data-act="calView" data-v="${v}">${v[0].toUpperCase() + v.slice(1)}</button>`).join('')}</div>
  <button type="button" class="btn" data-act="exportICS" title="Import into Outlook or Google Calendar">${ic('download')} .ics</button>
  <button type="button" class="btn primary" data-act="newMeeting" data-date="${calView === 'day' ? calDate : today()}">${ic('plus')} New meeting</button></div></div>${calBody()}`;

function openMeetingForm(id, date) {
  const m = S.meetings.find(x => x.id === id) || { title: '', date: date || today(), start: '09:00', end: '10:00', tz: S.settings.tz, location: '', agenda: '', participants: [], reminders: S.settings.defaultReminders.slice() };
  const others = S.contacts.filter(c => !c.isBoss);
  openModal(`<form data-form="meeting" data-id="${id || ''}"><div class="row between"><h3 class="serif">${id ? 'Edit' : 'New'} meeting</h3><button type="button" class="ib" data-act="closeModal">${ic('x')}</button></div>
    ${field('Title', `<input name="title" required value="${esc(m.title)}" placeholder="e.g. Board pre-briefing">`)}
    <div class="grid3">${field('Date', `<input type="date" name="date" required value="${m.date}" data-input="ackReset">`)}${field('Start', `<input type="time" name="start" required value="${m.start}" data-input="ackReset">`)}${field('End', `<input type="time" name="end" required value="${m.end}" data-input="ackReset">`)}</div>
    <div class="grid2">${field('Time zone', `<input name="tz" value="${esc(m.tz)}" list="tzlist">${tzDatalist()}`)}${field('Location or video link', `<input name="location" value="${esc(m.location)}">`)}</div>
    ${field('Agenda', `<textarea name="agenda" rows="2">${esc(m.agenda)}</textarea>`)}
    <div class="f"><span>Participants</span>${others.length ? `<div class="pills">${others.map(c => `<label class="pill"><input type="checkbox" name="p" value="${c.id}" ${(m.participants || []).includes(c.id) ? 'checked' : ''}><span>${esc(c.name)}</span></label>`).join('')}</div>` : '<span class="hint" style="text-transform:none;letter-spacing:0">Add contacts first to invite them.</span>'}</div>
    <div class="f"><span>Remind participants</span><div class="pills">${Object.entries(OFFSETS).map(([k, o]) => `<label class="pill"><input type="checkbox" name="rem" value="${k}" ${(m.reminders || []).includes(k) ? 'checked' : ''}><span>${o.label}</span></label>`).join('')}</div></div>
    <div class="warn" id="conflictBox" hidden></div>
    <div class="row end"><button type="button" class="btn" data-act="closeModal">Cancel</button><button class="btn primary">Save meeting</button></div></form>`);
}
function openMeeting(id) {
  const m = S.meetings.find(x => x.id === id); if (!m) return;
  const ps = (m.participants || []).map(contact).filter(Boolean);
  const loc = /^https?:\/\//i.test(m.location) ? `<a href="${esc(m.location)}" target="_blank" rel="noopener" style="color:var(--accent-text)">${esc(m.location)}</a>` : esc(m.location);
  openModal(`<div class="row between"><h3 class="serif">${esc(m.title)}</h3><button type="button" class="ib" data-act="closeModal">${ic('x')}</button></div>
    <div class="meta"><span>${ic('calendar', 13)} ${esc(fmtLong(m.date))}</span><span>${ic('clock', 13)} ${fmt12(m.start)} to ${fmt12(m.end)} (${esc(m.tz || S.settings.tz)})</span>${m.location ? `<span>${ic('pin', 13)} ${loc}</span>` : ''}</div>
    ${m.agenda ? `<div class="sec" style="margin-top:0"><h4>Agenda</h4><p>${esc(m.agenda)}</p></div>` : ''}
    <div class="sec" style="margin-top:0"><h4>Participants</h4>${ps.length ? ps.map(c => `<div class="rcpt"><div class="avatar">${esc(c.name[0])}</div><div><b>${esc(c.name)}</b><small>${esc(c.role || '')}</small></div></div>`).join('') : '<p class="muted">None yet.</p>'}</div>
    <div class="sec" style="margin-top:0"><h4>Reminders</h4><p>${(m.reminders || []).length ? (m.reminders || []).map(k => OFFSETS[k] ? OFFSETS[k].label : k).join(', ') + ' before' : 'None'}</p></div>
    <div class="row wrap"><button type="button" class="btn primary" data-act="inviteMeeting" data-id="${id}">${ic('mail')} Notify participants</button>
      <button type="button" class="btn" data-act="icsOne" data-id="${id}">${ic('download')} Add to calendar</button>
      <button type="button" class="btn" data-act="editMeeting" data-id="${id}">${ic('edit')} Edit</button>
      <button type="button" class="btn danger" data-act="delMeeting" data-id="${id}">${ic('trash')} Delete</button></div>`);
}

/* ============ Page: Contacts ============ */
PAGES.contacts = () => `<div class="toolbar"><span></span><button type="button" class="btn primary" data-act="newContact">${ic('plus')} New contact</button></div>
  <section class="card"><h2 class="serif" style="margin-bottom:14px">Address book</h2>${S.contacts.length ? `<div class="cgrid">${S.contacts.slice().sort((a, b) => (b.isBoss ? 1 : 0) - (a.isBoss ? 1 : 0)).map(c => `<div class="ccard"><div class="avatar">${esc((c.name[0] || '?').toUpperCase())}</div><div><h4>${esc(c.name)} ${c.isBoss ? ic('crown', 14) : ''}</h4><div class="role">${esc(c.role || '')}</div>
    ${c.email ? `<a class="ln" href="mailto:${esc(c.email)}">${ic('mail', 13)} ${esc(c.email)}</a>` : ''}${c.phone ? `<a class="ln" href="https://wa.me/${digits(c.phone)}" target="_blank" rel="noopener">${ic('phone', 13)} ${esc(c.phone)}</a>` : ''}</div>
    <div class="acts"><button type="button" class="ib" title="Edit" data-act="editContact" data-id="${c.id}">${ic('edit', 14)}</button>${c.isBoss ? '' : `<button type="button" class="ib del" title="Delete" data-act="delContact" data-id="${c.id}">${ic('trash', 14)}</button>`}</div></div>`).join('')}</div>` : empty('No contacts', 'Add the people your boss meets often.')}</section>`;
function openContactForm(id) {
  const c = contact(id) || { name: '', role: '', email: '', phone: '', isBoss: false };
  openModal(`<form data-form="contact" data-id="${id || ''}"><div class="row between"><h3 class="serif">${id ? 'Edit' : 'New'} contact</h3><button type="button" class="ib" data-act="closeModal">${ic('x')}</button></div>
    ${field('Name', `<input name="name" required value="${esc(c.name)}">`)}${field('Role', `<input name="role" value="${esc(c.role)}" placeholder="e.g. Legal Counsel">`)}
    <div class="grid2">${field('Email', `<input type="email" name="email" value="${esc(c.email)}">`)}${field('WhatsApp number <em>with country code</em>', `<input name="phone" value="${esc(c.phone)}" placeholder="+971 50 000 0000">`)}</div>
    <label class="chk"><input type="checkbox" name="isBoss" ${c.isBoss ? 'checked' : ''}><span>This is my boss (reminders are sent to this person)</span></label>
    <div class="row end"><button type="button" class="btn" data-act="closeModal">Cancel</button><button class="btn primary">Save contact</button></div></form>`);
}

/* ============ Page: Recordings ============ */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = null;
PAGES.recordings = () => {
  const cap = rec
    ? `<div class="cap-card rec-live"><div class="pulse"></div><h3 class="serif">Recording… <span class="mono" id="recTimer">00:00</span></h3><p>${SR ? 'Live transcript appears below.' : 'This browser cannot transcribe live, but the audio is being saved.'}</p><div class="live-tx" id="liveTx"></div><button type="button" class="btn danger" data-act="stopRec">${ic('stop')} Stop and save</button></div>`
    : `<div class="cap-card"><div class="big">${ic('mic', 28)}</div><h3 class="serif">Record a session</h3><p>Captures audio in the app. A consent notice is shown before you start.</p><button type="button" class="btn primary" data-act="startRec">${ic('mic')} Start recording</button></div>
       <div class="cap-card drop"><div class="big">${ic('upload', 28)}</div><h3 class="serif">Upload existing</h3><p>MP3, M4A or WAV files. Transcription supports English and Arabic.</p><label class="btn">${ic('upload')} Choose file<input type="file" accept="audio/*,.mp3,.m4a,.wav" multiple hidden data-change="upload"></label></div>`;
  return `<section class="card"><h2 class="serif" style="margin-bottom:14px">Capture</h2><div class="cap">${cap}</div></section>
    <section class="card"><h2 class="serif" style="margin-bottom:6px">Library</h2>${S.recordings.length ? S.recordings.map(r => { const m = S.meetings.find(x => x.id === r.meetingId);
      return `<button type="button" class="rec-item" data-act="openRec" data-id="${r.id}"><span class="big">${ic('mic', 17)}</span><div style="flex:1;min-width:0"><b>${esc(r.title)}</b><div class="meta"><span>${esc(fmtStamp(r.created))}</span><span>${mmss(r.duration || 0)}</span><span>${r.lang === 'ar-AE' ? 'Arabic' : 'English'}</span>${m ? `<span>${ic('link', 12)} ${esc(m.title)}</span>` : ''}${r.transcript ? '<span class="tag sent">Transcript</span>' : ''}${r.summary ? '<span class="tag sent">Summary</span>' : ''}</div></div>${ic('right', 16)}</button>`; }).join('') : empty('No recordings yet.', 'Record a session or upload an audio file to begin.')}</section>`;
};
AFTER.recordings = () => updateLive();
function updateLive() {
  if (!rec) return;
  const t = $('#recTimer'); if (t) t.textContent = mmss((Date.now() - rec.t0) / 1000);
  const l = $('#liveTx'); if (l) { l.textContent = rec.lines.join('\n') + (rec.live ? '\n… ' + rec.live : ''); l.scrollTop = l.scrollHeight; }
}
function openConsent() {
  openModal(`<form data-form="consent"><h3 class="serif">Before you record</h3>
    <p class="muted">Recording a conversation without everyone's knowledge may be unlawful where you are. Tell all participants and get their consent first.</p>
    <label class="chk"><input type="checkbox" name="ok" required><span>Everyone in the meeting has agreed to be recorded.</span></label>
    ${field('Spoken language', '<select name="lang"><option value="en-US">English</option><option value="ar-AE">Arabic (العربية)</option></select>')}
    <p class="hint">${SR ? 'Live transcription uses your browser’s speech service. In Chrome and Edge the audio is sent to Google or Microsoft to be transcribed.' : 'This browser does not support live transcription (try Chrome or Edge). The audio will still be saved and you can type the transcript.'}</p>
    <div class="row end"><button type="button" class="btn" data-act="closeModal">Cancel</button><button class="btn primary">${ic('mic')} Start recording</button></div></form>`);
}
async function startRecording(lang) {
  if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) || !window.MediaRecorder) { toast('Recording is not supported in this browser.', 'err'); return; }
  let stream; try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (e) { toast('Microphone access was blocked.', 'err'); return; }
  const mr = new MediaRecorder(stream), chunks = [];
  rec = { mr, stream, chunks, t0: Date.now(), lang, lines: [], live: '', sr: null, stopping: false, timer: null };
  mr.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
  mr.onstop = finishRecording;
  mr.start(1000);
  if (SR) {
    const sr = new SR(); sr.lang = lang; sr.continuous = true; sr.interimResults = true;
    sr.onresult = ev => { let interim = ''; for (let i = ev.resultIndex; i < ev.results.length; i++) { const r = ev.results[i]; if (r.isFinal) rec.lines.push(`[${mmss((Date.now() - rec.t0) / 1000)}] ${r[0].transcript.trim()}`); else interim += r[0].transcript; } rec.live = interim; updateLive(); };
    sr.onend = () => { if (rec && !rec.stopping) { try { sr.start(); } catch (e) { /* ignore */ } } };
    sr.onerror = () => { /* ignore, onend restarts */ };
    try { sr.start(); } catch (e) { /* ignore */ } rec.sr = sr;
  }
  rec.timer = setInterval(updateLive, 500);
  renderApp();
}
function stopRecording() {
  if (!rec) return; rec.stopping = true;
  try { rec.sr && rec.sr.stop(); } catch (e) { /* ignore */ }
  rec.stream.getTracks().forEach(t => t.stop());
  if (rec.mr.state !== 'inactive') rec.mr.stop();
}
async function finishRecording() {
  const r = rec; rec = null; clearInterval(r.timer);
  const id = uid(), blob = new Blob(r.chunks, { type: r.mr.mimeType || 'audio/webm' });
  let audio = true; try { await idbPut(id, blob); } catch (e) { audio = false; toast('Could not store the audio file.', 'err'); }
  S.recordings.unshift({ id, title: 'Recording ' + fmtStamp(Date.now()), meetingId: '', created: Date.now(), duration: Math.round((Date.now() - r.t0) / 1000), lang: r.lang, transcript: r.lines.join('\n'), summary: '', actions: '', audio });
  save(); renderApp(); toast('Recording saved.'); openRecording(id);
}
const audioDuration = f => new Promise(res => { const a = new Audio(); a.preload = 'metadata'; a.src = URL.createObjectURL(f); a.onloadedmetadata = () => res(isFinite(a.duration) ? Math.round(a.duration) : 0); a.onerror = () => res(0); });

function summarize(text) {
  const clean = text.replace(/\[\d+:\d{2}\]\s*/g, '');
  const sents = clean.split(/(?<=[.!?؟])\s+|\n+/).map(s => s.trim()).filter(s => s.split(/\s+/).length >= 4);
  if (!sents.length) return { summary: '', actions: '' };
  const stop = new Set('the a an and or but of to in on for with is are was were be been it this that as at by from we you i they he she will would should can could have has had not so if then there their our your'.split(' '));
  const freq = {}; (clean.toLowerCase().match(/[\p{L}']+/gu) || []).forEach(w => { if (!stop.has(w) && w.length > 2) freq[w] = (freq[w] || 0) + 1; });
  const score = s => { const w = s.toLowerCase().match(/[\p{L}']+/gu) || []; return w.reduce((a, x) => a + (freq[x] || 0), 0) / Math.sqrt(w.length || 1); };
  const top = sents.map((s, i) => ({ s, i, sc: score(s) })).sort((a, b) => b.sc - a.sc).slice(0, 5).sort((a, b) => a.i - b.i).map(x => x.s);
  const act = /\b(will|need to|needs to|must|should|action|follow up|follow-up|deadline|please|assign|schedule|send|prepare|review)\b|\bby (monday|tuesday|wednesday|thursday|friday|tomorrow|next week|end of)|سوف|يجب|يرجى|المطلوب/i;
  return { summary: top.map(s => '• ' + s).join('\n'), actions: sents.filter(s => act.test(s)).slice(0, 8).join('\n') };
}
function recText(r) {
  const m = S.meetings.find(x => x.id === r.meetingId);
  return `Meeting record: ${r.title}\n${m ? `Meeting: ${m.title}, ${fmtLong(m.date)}\n` : ''}\nSummary:\n${r.summary || '(no summary)'}\n\nAction items:\n${r.actions || '(none)'}\n\n(The full transcript is in the attached PDF.)`;
}
function recReportHTML(r) {
  const m = S.meetings.find(x => x.id === r.meetingId), ps = m ? (m.participants || []).map(c => (contact(c) || {}).name).filter(Boolean) : [];
  const lines = s => esc(s || '').split('\n').filter(Boolean).map(x => `<li>${x}</li>`).join('');
  return `<div class="sheet"><div class="sheet-head"><div><small>Meeting record</small><h2 class="serif">${esc(r.title)}</h2></div><div class="r"><small>${m ? esc(fmtLong(m.date)) : esc(new Date(r.created).toLocaleDateString('en-US', { dateStyle: 'long' }))}</small><div>${esc(boss().name)}</div></div></div>
    ${m ? `<div class="sec"><h4>Meeting</h4><p>${esc(m.title)} · ${fmt12(m.start)} to ${fmt12(m.end)}${m.location ? ' · ' + esc(m.location) : ''}</p></div>` : ''}
    ${ps.length ? `<div class="sec"><h4>Participants</h4><p>${esc(ps.join(', '))}</p></div>` : ''}
    <div class="sec"><h4>Summary</h4><ul style="list-style:none;padding:0">${lines(r.summary) || '<li>—</li>'}</ul></div>
    <div class="sec"><h4>Action items</h4><ul>${lines(r.actions) || '<li>None recorded</li>'}</ul></div>
    <div class="sec"><h4>Full transcript</h4><p>${esc(r.transcript || 'No transcript.')}</p></div>
    <div class="sheet-foot"><span>Prepared by ${esc(S.user.name)}</span><span>${esc(S.settings.replyTo || '')}</span></div></div>`;
}
function collectRec(id) {
  const r = S.recordings.find(x => x.id === id), f = $('#recForm'); if (!r || !f) return r;
  const fd = new FormData(f);
  r.title = (fd.get('title') || '').trim() || r.title; r.meetingId = fd.get('meeting') || ''; r.lang = fd.get('lang');
  r.transcript = fd.get('transcript'); r.summary = fd.get('summary'); r.actions = fd.get('actions'); save(); return r;
}
function openRecording(id) {
  const r = S.recordings.find(x => x.id === id); if (!r) return;
  openModal(`<form id="recForm" data-form="rec" data-id="${id}"><div class="row between"><h3 class="serif">Recording</h3><button type="button" class="ib" data-act="closeModal">${ic('x')}</button></div>
    ${field('Title', `<input name="title" required value="${esc(r.title)}">`)}
    <div class="grid2">${field('Linked meeting', `<select name="meeting"><option value="">None</option>${S.meetings.slice().sort((a, b) => b.date.localeCompare(a.date)).map(m => `<option value="${m.id}" ${m.id === r.meetingId ? 'selected' : ''}>${esc(fmtShort(m.date))} · ${esc(m.title)}</option>`).join('')}</select>`)}
      ${field('Language', `<select name="lang"><option value="en-US" ${r.lang !== 'ar-AE' ? 'selected' : ''}>English</option><option value="ar-AE" ${r.lang === 'ar-AE' ? 'selected' : ''}>Arabic</option></select>`)}</div>
    ${r.audio ? '<audio id="recAudio" class="audio" controls></audio>' : ''}
    ${field('Transcript <em>editable</em>', `<textarea name="transcript" rows="8" dir="auto">${esc(r.transcript)}</textarea>`)}
    ${r.transcript ? '' : '<p class="hint">Automatic transcription of uploaded files needs a speech-to-text service on a server. Paste or type the transcript above, then press “Generate summary”.</p>'}
    <div class="row"><button type="button" class="btn" data-act="autoSum">${ic('file')} Generate summary</button></div>
    ${field('Summary <em>editable</em>', `<textarea name="summary" rows="4" dir="auto">${esc(r.summary)}</textarea>`)}
    ${field('Action items <em>one per line</em>', `<textarea name="actions" rows="3" dir="auto">${esc(r.actions)}</textarea>`)}
    <div class="row wrap between"><button type="button" class="btn danger" data-act="delRec" data-id="${id}">${ic('trash')} Delete permanently</button>
      <div class="row wrap"><button type="button" class="btn" data-act="recReminders" data-id="${id}">${ic('bell')} Make reminders</button><button type="button" class="btn" data-act="recPDF" data-id="${id}">${ic('printer')} PDF</button><button type="button" class="btn" data-act="recSend" data-id="${id}">${ic('mail')} Send</button><button class="btn primary">Save</button></div></div></form>`, true);
  if (r.audio) idbGet(id).then(b => { const a = $('#recAudio'); if (b && a) a.src = URL.createObjectURL(b); }).catch(() => { });
}

/* ============ Page: Print & Export ============ */
let prMode = 'daily', prDate = today(), prMonth = today().slice(0, 7);
function sheetHTML() {
  const b = boss(), by = `Prepared by ${esc(S.user.name)}`, rt = esc(S.settings.replyTo || '');
  if (prMode === 'daily') {
    const ms = meetingsOn(prDate), hrs = ms.map(m => +m.start.slice(0, 2));
    const from = Math.min(7, ...hrs), to = Math.max(19, ...hrs); let rows = '';
    for (let h = from; h <= to; h++) {
      const label = `${h % 12 || 12} ${h >= 12 ? 'PM' : 'AM'}`, here = ms.filter(m => +m.start.slice(0, 2) === h);
      if (!here.length) rows += `<tr class="h"><td class="t">${label}</td><td></td><td></td><td></td><td class="n"></td></tr>`;
      else here.forEach((m, i) => rows += `<tr class="h"><td class="t">${i ? '' : label}</td><td><b>${esc(m.title)}</b><small>${fmt12(m.start)} → ${fmt12(m.end)}</small></td><td>${esc(m.location)}</td><td>${esc((m.participants || []).map(c => (contact(c) || {}).name).filter(Boolean).join(', '))}</td><td class="n"></td></tr>`);
    }
    return `<div class="sheet"><div class="sheet-head"><div><small>Office of</small><h2 class="serif">${esc(b.name)}</h2></div><div class="r"><small>Daily schedule</small><h3 class="serif">${esc(fmtLong(prDate))}</h3></div></div>
      <table class="sched"><thead><tr><th>Time</th><th>Meeting</th><th>Location</th><th>Participants</th><th>Notes</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="sheet-foot"><span>${by}</span><span>${rt}</span></div></div>`;
  }
  const [y, mo] = prMonth.split('-').map(Number), first = new Date(y, mo - 1, 1), days = new Date(y, mo, 0).getDate();
  const weeks = Math.ceil((((first.getDay() + 6) % 7) + days) / 7), gs = startOfWeek(ymd(first));
  const label = first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const inMonth = S.meetings.filter(m => m.date.startsWith(prMonth)).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  return `<div class="sheet"><div class="sheet-head"><div><small>Office of</small><h2 class="serif">${esc(b.name)}</h2></div><div class="r"><small>Monthly overview</small><h3 class="serif">${esc(label)}</h3></div></div>
    <div class="pm-grid">${['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(x => `<div class="hd">${x}</div>`).join('')}${[...Array(weeks * 7)].map((_, i) => { const c = addDays(gs, i), cd = parseYmd(c);
      return `<div class="${cd.getMonth() !== mo - 1 ? 'dim' : ''}"><b>${cd.getDate()}</b>${meetingsOn(c).slice(0, 3).map(m => `<span>${fmt12(m.start).replace(':00', '')} ${esc(m.title)}</span>`).join('')}</div>`; }).join('')}</div>
    <div class="pm-list"><h4>Meetings this month</h4>${inMonth.length ? inMonth.map(m => `<div><span>${esc(fmtShort(m.date))}</span><span>${fmt12(m.start)} – ${fmt12(m.end)}</span><span><b>${esc(m.title)}</b>${m.location ? ' · ' + esc(m.location) : ''}</span></div>`).join('') : '<p class="muted">No meetings this month.</p>'}</div>
    <div class="sheet-foot"><span>${by}</span><span>${rt}</span></div></div>`;
}
function schedText() {
  if (prMode === 'daily') {
    const ms = meetingsOn(prDate);
    return `Schedule for ${boss().name}\n${fmtLong(prDate)}\n\n` + (ms.length ? ms.map(m => `${fmt12(m.start)} – ${fmt12(m.end)}  ${m.title}${m.location ? ' (' + m.location + ')' : ''}`).join('\n') : 'No meetings scheduled.');
  }
  const ms = S.meetings.filter(m => m.date.startsWith(prMonth)).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  const label = new Date(+prMonth.slice(0, 4), +prMonth.slice(5) - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  return `Meetings for ${boss().name}, ${label}\n\n` + (ms.length ? ms.map(m => `${fmtShort(m.date)}  ${fmt12(m.start)} – ${fmt12(m.end)}  ${m.title}${m.location ? ' (' + m.location + ')' : ''}`).join('\n') : 'No meetings this month.');
}
PAGES.print = () => `<div class="card toolbar-card"><div class="seg"><button type="button" class="${prMode === 'daily' ? 'on' : ''}" data-act="prMode" data-m="daily">Daily</button><button type="button" class="${prMode === 'monthly' ? 'on' : ''}" data-act="prMode" data-m="monthly">Monthly</button></div>
  ${field(prMode === 'daily' ? 'Date' : 'Month', `<input type="${prMode === 'daily' ? 'date' : 'month'}" value="${prMode === 'daily' ? prDate : prMonth}" data-change="prDate" style="width:auto">`)}
  <div class="spacer"></div><button type="button" class="btn" data-act="shareSched" data-ch="email">${ic('mail')} Email</button><button type="button" class="btn" data-act="shareSched" data-ch="whatsapp">${ic('chat')} WhatsApp</button><button type="button" class="btn primary" data-act="printSheet">${ic('printer')} Print / Save as PDF</button></div>
  ${sheetHTML()}`;

/* ============ Page: Message Log ============ */
let logCh = 'all', logQ = '';
function logList() {
  const q = logQ.toLowerCase();
  const list = S.messages.filter(m => (logCh === 'all' || m.channel === logCh) && (!q || (m.to + ' ' + m.subject + ' ' + m.addr).toLowerCase().includes(q)));
  if (!list.length) return empty('No messages yet.', 'Reminders and meeting invites will appear here when sent.');
  return `<div class="log-row hd"><span>Channel</span><span>Recipient</span><span>Message</span><span>Sent</span><span>Status</span></div>` + list.map(m => `<div class="log-row"><span>${ic(m.channel === 'email' ? 'mail' : 'chat', 14)} ${CHL[m.channel]}</span>
    <span class="tr"><b>${esc(m.to)}</b><br><small class="muted">${esc(m.addr || '')}</small></span><span class="tr" title="${esc(m.body)}">${esc(m.subject)}</span><span class="muted">${esc(fmtStamp(m.ts))}</span>
    <span class="row"><span class="tag ${m.status}" ${m.error ? `title="${esc(m.error)}"` : ''}>${m.status[0].toUpperCase() + m.status.slice(1)}</span>${m.status === 'failed' ? `<button type="button" class="ib" title="${esc(m.error || 'Retry')}. Retry" data-act="retryMsg" data-id="${m.id}">${ic('retry', 15)}</button>` : ''}</span></div>`).join('');
}
PAGES.log = () => `<div class="card toolbar-card"><div class="search">${ic('search', 16)}<input id="logQ" placeholder="Search recipient or subject…" value="${esc(logQ)}" data-input="logQ"></div>
  <div class="seg">${[['all', 'All'], ['email', 'Email'], ['whatsapp', 'WhatsApp']].map(([k, l]) => `<button type="button" class="${logCh === k ? 'on' : ''}" data-act="logCh" data-k="${k}">${l}</button>`).join('')}</div></div>
  <section class="card"><h2 class="serif" style="margin-bottom:8px">Delivery log</h2><div id="logList">${logList()}</div>
  <p class="hint" style="margin-top:14px">“Sent” means the message was opened in your email app or WhatsApp for you to send. Automatic sending needs a server.</p></section>`;

/* ============ Page: Settings ============ */
const tzDatalist = () => { let z = []; try { z = Intl.supportedValuesOf('timeZone'); } catch (e) { z = ['Asia/Dubai', 'UTC', 'Europe/London', 'America/New_York']; } return `<datalist id="tzlist">${z.map(x => `<option>${x}</option>`).join('')}</datalist>`; };
PAGES.settings = () => {
  const s = S.settings;
  return `<form data-form="settings" class="stack narrow">
    <section class="card"><h2 class="serif">Profile</h2><p class="sub">Shown on printable sheets and in message footers.</p>
      <div class="grid2">${field("Boss's name", `<input name="boss" required value="${esc(boss().name)}">`)}${field('Your name', `<input name="you" required value="${esc(S.user.name)}">`)}${field('Default time zone', `<input name="tz" list="tzlist" value="${esc(s.tz)}">${tzDatalist()}`)}</div></section>
    <section class="card"><h2 class="serif">Calendar integrations</h2><p class="sub">Outlook and Google Calendar.</p>
      <div class="stack">${[['Microsoft Outlook', 'outlook'], ['Google Calendar', 'google']].map(([n, k]) => `<div class="integ"><div class="big">${ic('off', 18)}</div><div style="flex:1"><b>${n}</b><small>Not connected</small></div><button type="button" class="btn sm" data-act="connect" data-k="${k}">Connect</button></div>`).join('')}</div></section>
    <section class="card"><h2 class="serif">Messaging</h2><p class="sub">Default sender identity and templates.</p><div class="stack">
      <div class="grid2">${field('Email sender name', `<input name="emailSender" value="${esc(s.emailSender)}" placeholder="Office of Mr. Al-Mansour">`)}${field('Reply-to address', `<input type="email" name="replyTo" value="${esc(s.replyTo)}">`)}</div>
      ${field('WhatsApp sender number', `<input name="waSender" value="${esc(s.waSender)}" placeholder="+971 50 000 0000" style="max-width:340px">`)}
      ${field('Reminder template <em>Variables: {title} {date} {time} {notes}</em>', `<textarea name="reminderTpl" rows="3">${esc(s.reminderTpl)}</textarea>`)}
      ${field('Meeting invite template <em>Variables: {title} {date} {time} {timezone} {location} {agenda}</em>', `<textarea name="meetingTpl" rows="3">${esc(s.meetingTpl)}</textarea>`)}</div></section>
    <section class="card"><h2 class="serif">Default meeting reminders</h2><p class="sub">Pre-selected when creating a new meeting.</p><div class="pills">${Object.entries(OFFSETS).map(([k, o]) => `<label class="pill"><input type="checkbox" name="dr" value="${k}" ${s.defaultReminders.includes(k) ? 'checked' : ''}><span>${o.label}</span></label>`).join('')}</div></section>
    <section class="card"><h2 class="serif">Notifications</h2><p class="sub" style="margin-bottom:10px">Alerts appear while BossDesk is open in a tab.</p><label class="chk"><input type="checkbox" name="push" ${s.push ? 'checked' : ''}><span>Enable push notifications for upcoming reminders and meetings.</span></label></section>
    <section class="card"><h2 class="serif">Data</h2><p class="sub">Export a backup or reset all data.</p><div class="row wrap">
      <button type="button" class="btn" data-act="backup">${ic('download')} Download backup</button>
      <label class="btn">${ic('upload')} Restore backup<input type="file" accept="application/json,.json" hidden data-change="restore"></label>
      <button type="button" class="btn danger" data-act="resetAll">${ic('trash')} Reset all data</button></div></section>
    <div class="save-bar"><button class="btn primary">Save all changes</button></div></form>`;
};

/* ============ Auth ============ */
let authMode = null;
function renderAuth() {
  if (authMode === null) authMode = S.user ? 'signin' : 'create';
  const c = authMode === 'create';
  $('#auth').innerHTML = `<div class="auth-card"><div class="brand center"><div class="logo serif">BD</div><h1 class="serif">BossDesk</h1><p class="muted">Your boss's day, perfectly managed.</p></div>
    <form data-form="auth" class="card stack"><h2 class="serif">${c ? 'Create your account' : 'Sign in'}</h2><p class="muted small" style="margin-top:-8px">${c ? 'This browser will hold your assistant account and data.' : 'Welcome back.'}</p>
      ${c ? field('Your name', '<input name="name" required placeholder="e.g. Layla">') + field("Boss's name", '<input name="boss" required placeholder="e.g. Mr. Khalid Al-Mansour">') : ''}
      ${field('Email', '<input type="email" name="email" required placeholder="you@example.com">')}
      ${field('Password', `<input type="password" name="pass" required minlength="8" placeholder="••••••••"><span class="hint" style="text-transform:none;letter-spacing:0">${c ? 'Minimum 8 characters' : ''}</span>`)}
      ${c ? '<label class="chk"><input type="checkbox" name="sample" checked><span>Start with sample data (you can reset it any time)</span></label>' : ''}
      <p class="hint bad" id="authErr"></p><button class="btn primary block">${c ? 'Create account' : 'Sign in'}</button>
      ${(S.user && c) ? '<button type="button" class="link" style="align-self:center" data-act="authToggle">Already registered? Sign in</button>' : ''}
      ${!c ? '<button type="button" class="link" style="align-self:center" data-act="resetAll">Forgot password? Reset this browser</button>' : ''}</form>
    <p class="hint center" style="margin-top:14px">Demo build: data and login live only in this browser.</p></div>`;
}

/* ============ Actions ============ */
const ACT = {
  closeModal, openNav() { document.body.classList.add('nav-open'); }, closeNav() { document.body.classList.remove('nav-open'); },
  theme() { S.settings.theme = S.settings.theme === 'dark' ? 'light' : 'dark'; save(); renderApp(); },
  logout() { S.session = false; save(); authMode = 'signin'; renderApp(); },
  authToggle() { authMode = authMode === 'create' ? 'signin' : 'create'; renderAuth(); },
  newRem(d) { closeModal(); openReminderForm(); },
  editRem(d) { openReminderForm(d.id); },
  delRem(d) { if (!confirm('Delete this reminder?')) return; S.reminders = S.reminders.filter(r => r.id !== d.id); save(); renderApp(); },
  toggleRem(d) {
    const r = S.reminders.find(x => x.id === d.id); if (!r) return; r.done = !r.done;
    if (r.done && r.repeat && r.repeat !== 'none') { S.reminders.push({ ...r, id: uid(), date: nextDate(r.date, r.repeat), done: false, log: {} }); toast('Next ' + r.repeat + ' reminder created.'); }
    save(); renderApp();
  },
  remTab(d) { remTab = d.k; renderApp(); },
  sendRem(d) {
    const r = S.reminders.find(x => x.id === d.id); if (!r) return;
    const e = send(d.ch, boss().id, 'Reminder: ' + r.title, reminderMsg(r), 'reminder:' + r.id);
    r.log = r.log || {}; r.log[d.ch] = e.status; save(); renderApp();
  },
  newMeeting(d) { closeModal(); openMeetingForm('', d.date); },
  editMeeting(d) { openMeetingForm(d.id); },
  openMeeting(d) { openMeeting(d.id); },
  delMeeting(d) { if (!confirm('Delete this meeting?')) return; S.meetings = S.meetings.filter(m => m.id !== d.id); save(); closeModal(); renderApp(); toast('Meeting deleted.'); },
  inviteMeeting(d) { const m = S.meetings.find(x => x.id === d.id); if (!m) return; if (!(m.participants || []).length) { toast('Add participants to this meeting first.', 'err'); return; } notifyModal({ subject: 'Invitation: ' + m.title, body: meetingMsg(m), cids: m.participants, ref: 'meeting:' + m.id }); },
  icsOne(d) { const m = S.meetings.find(x => x.id === d.id); if (m) download(m.title.replace(/\W+/g, '-') + '.ics', buildICS([m]), 'text/calendar'); },
  exportICS() { if (!S.meetings.length) { toast('No meetings to export.', 'err'); return; } download('bossdesk-calendar.ics', buildICS(S.meetings), 'text/calendar'); },
  calPrev() { calShift(-1); renderApp(); }, calNext() { calShift(1); renderApp(); }, calToday() { calDate = today(); renderApp(); },
  calView(d) { calView = d.v; renderApp(); },
  dayCell(d) { calDate = d.date; calView = 'day'; renderApp(); },
  newContact() { openContactForm(); }, editContact(d) { openContactForm(d.id); },
  delContact(d) { const c = contact(d.id); if (!c || !confirm(`Delete ${c.name}?`)) return; S.contacts = S.contacts.filter(x => x.id !== d.id); S.meetings.forEach(m => m.participants = (m.participants || []).filter(x => x !== d.id)); save(); renderApp(); },
  noteSend(d) { if (!NOTE) return; const body = $('#noteBody').value; send(d.ch, d.cid, NOTE.subject, body, NOTE.ref); renderApp(); },
  noteAll() {
    if (!NOTE) return; const body = $('#noteBody').value, list = NOTE.cids.map(contact).filter(Boolean), withMail = list.filter(c => c.email);
    list.forEach(c => S.messages.unshift({ id: uid(), ts: Date.now(), channel: 'email', cid: c.id, to: c.name, addr: c.email || '', subject: NOTE.subject, body, ref: NOTE.ref || '', status: c.email ? 'sent' : 'failed', error: c.email ? undefined : 'No email address on file' }));
    save(); if (withMail.length) { openMail('', NOTE.subject, body + footer('email'), withMail.map(c => c.email).join(',')); toast('Email opened with all recipients in hidden copy.'); } else toast('None of the recipients has an email address.', 'err'); renderApp();
  },
  startRec() { openConsent(); }, stopRec() { stopRecording(); },
  openRec(d) { openRecording(d.id); },
  autoSum() { const f = $('#recForm'); const t = f.elements.transcript.value.trim(); if (!t) { toast('Add or record a transcript first.', 'err'); return; } const r = summarize(t); f.elements.summary.value = r.summary || 'Transcript too short to summarize.'; f.elements.actions.value = r.actions; toast('Summary drafted. Please review and edit it.'); },
  delRec(d) { if (!confirm('Permanently delete this recording and its transcript? This cannot be undone.')) return; idbDel(d.id).catch(() => { }); S.recordings = S.recordings.filter(r => r.id !== d.id); save(); closeModal(); renderApp(); toast('Recording deleted.'); },
  recPDF(d) { const r = collectRec(d.id); if (r) printDocument(recReportHTML(r)); },
  recSend(d) { const r = collectRec(d.id); if (!r) return; const m = S.meetings.find(x => x.id === r.meetingId); const cids = [boss().id, ...(m ? m.participants || [] : [])].filter((x, i, a) => x && a.indexOf(x) === i); notifyModal({ subject: 'Meeting record: ' + r.title, body: recText(r), cids, ref: 'recording:' + r.id }); },
  recReminders(d) {
    const r = collectRec(d.id); if (!r) return; const lines = (r.actions || '').split('\n').map(x => x.trim()).filter(Boolean);
    if (!lines.length) { toast('No action items to convert.', 'err'); return; }
    lines.forEach(l => S.reminders.push({ id: uid(), title: l.length > 90 ? l.slice(0, 87) + '…' : l, notes: 'From recording: ' + r.title, date: addDays(today(), 1), time: '09:00', priority: 'Medium', category: 'Work', repeat: 'none', channels: ['email'], log: {}, done: false }));
    save(); renderApp(); toast(`${plural(lines.length, 'reminder')} created for tomorrow at 9:00 AM.`);
  },
  prMode(d) { prMode = d.m; renderApp(); },
  printSheet() { printDocument(sheetHTML()); },
  shareSched(d) { const b = boss(); notifyModal({ subject: prMode === 'daily' ? `Schedule for ${fmtLong(prDate)}` : `Monthly schedule ${prMonth}`, body: schedText(), cids: [b.id, ...S.contacts.filter(c => !c.isBoss).map(c => c.id)].filter(Boolean), ref: 'schedule' }); },
  logCh(d) { logCh = d.k; renderApp(); },
  retryMsg(d) { const m = S.messages.find(x => x.id === d.id); if (!m) return; deliver(m); save(); renderApp(); toast(m.status === 'sent' ? `${CHL[m.channel]} opened for ${m.to}.` : `${m.error}. Fix it in Contacts, then retry.`, m.status === 'sent' ? 'ok' : 'err'); },
  connect(d) {
    openModal(`<div class="row between"><h3 class="serif">Connect ${d.k === 'outlook' ? 'Microsoft Outlook' : 'Google Calendar'}</h3><button type="button" class="ib" data-act="closeModal">${ic('x')}</button></div>
      <p class="muted">Live two-way sync needs a secure sign-in (OAuth) handled by a server, which this website does not have yet. Until then you can move your meetings across in one click:</p>
      <ol style="padding-left:20px;line-height:1.8"><li>Download the calendar file below.</li><li>${d.k === 'outlook' ? 'In Outlook: File → Open &amp; Export → Import/Export → iCalendar file.' : 'In Google Calendar: Settings → Import &amp; export → Import.'}</li></ol>
      <div class="row end"><button type="button" class="btn" data-act="closeModal">Close</button><button type="button" class="btn primary" data-act="exportICS">${ic('download')} Download .ics</button></div>`);
  },
  backup() { download('bossdesk-backup.json', JSON.stringify(S, null, 2), 'application/json'); },
  resetAll() { if (!confirm('This permanently deletes ALL BossDesk data in this browser. Continue?')) return; localStorage.removeItem(KEY); try { indexedDB.deleteDatabase('bossdesk-audio'); } catch (e) { /* ignore */ } location.hash = ''; location.reload(); }
};
document.addEventListener('click', e => {
  if (e.target.classList && e.target.classList.contains('modal-bg')) { closeModal(); return; }
  const el = e.target.closest('[data-act]'); if (!el) return;
  const fn = ACT[el.dataset.act]; if (fn) { e.preventDefault(); fn(el.dataset, el); }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); document.body.classList.remove('nav-open'); } });

/* ---- change / input handlers ---- */
const CHG = {
  prDate(t) { if (!t.value) return; if (prMode === 'daily') prDate = t.value; else prMonth = t.value; renderApp(); },
  async upload(t) {
    const files = [...t.files]; if (!files.length) return;
    for (const f of files) {
      const id = uid(); let ok = true; try { await idbPut(id, f); } catch (e) { ok = false; }
      S.recordings.unshift({ id, title: f.name.replace(/\.[^.]+$/, ''), meetingId: '', created: Date.now(), duration: await audioDuration(f), lang: 'en-US', transcript: '', summary: '', actions: '', audio: ok });
    }
    save(); renderApp(); toast(`${plural(files.length, 'file')} added. Open one to add a transcript.`);
  },
  restore(t) {
    const f = t.files[0]; if (!f) return; const rd = new FileReader();
    rd.onload = () => { try { const d = JSON.parse(rd.result); if (!Array.isArray(d.contacts) || !Array.isArray(d.meetings)) throw 0; if (!confirm('Replace all current data with this backup?')) return; localStorage.setItem(KEY, JSON.stringify(d)); location.reload(); } catch (e) { toast('That file is not a valid BossDesk backup.', 'err'); } };
    rd.readAsText(f);
  }
};
document.addEventListener('change', e => { const t = e.target.closest('[data-change]'); if (t && CHG[t.dataset.change]) CHG[t.dataset.change](t); });
const INP = { logQ(t) { logQ = t.value; $('#logList').innerHTML = logList(); }, ackReset(t) { if (t.form) t.form.dataset.ack = ''; } };
document.addEventListener('input', e => { const t = e.target.closest('[data-input]'); if (t && INP[t.dataset.input]) INP[t.dataset.input](t); });

/* ---- forms ---- */
const markFired = (kind, item) => {
  S.fired = S.fired || {}; const now = Date.now();
  if (kind === 'r') { if (new Date(`${item.date}T${item.time || '09:00'}`).getTime() <= now) S.fired['r:' + item.id] = 1; }
  else (item.reminders || []).forEach(k => { if (OFFSETS[k] && new Date(`${item.date}T${item.start}`).getTime() - OFFSETS[k].min * 60000 <= now) S.fired[`m:${item.id}:${k}`] = 1; });
};
const FORMS = {
  async auth(f, fd) {
    const email = fd.get('email').trim().toLowerCase(), h = await sha(fd.get('pass')), err = $('#authErr');
    if (authMode === 'create') {
      S = { ...defaults(), settings: { ...defaults().settings, theme: S.settings.theme } };
      S.user = { name: fd.get('name').trim(), email, hash: h }; S.session = true;
      S.contacts.push({ id: uid(), name: fd.get('boss').trim(), role: '', email: '', phone: '', isBoss: true });
      if (fd.get('sample')) seedSample();
    } else {
      if (!S.user || S.user.email !== email || S.user.hash !== h) { err.textContent = 'Wrong email or password.'; return; }
      S.session = true;
    }
    save(); authMode = null; location.hash = '#/dashboard'; route = 'dashboard'; renderApp(); startTicker();
  },
  reminder(f, fd, d) {
    const ch = fd.getAll('ch'); if (!ch.length) { toast('Pick at least one channel (Email or WhatsApp).', 'err'); return; }
    const old = S.reminders.find(x => x.id === d.id);
    const r = { id: d.id || uid(), title: fd.get('title').trim(), notes: fd.get('notes').trim(), date: fd.get('date'), time: fd.get('time'), priority: fd.get('priority'), category: fd.get('category').trim(), repeat: fd.get('repeat'), channels: ch, log: old ? Object.fromEntries(Object.entries(old.log || {}).filter(([k]) => ch.includes(k))) : {}, done: old ? old.done : false };
    if (old) S.reminders[S.reminders.indexOf(old)] = r; else S.reminders.push(r);
    markFired('r', r); save(); closeModal(); renderApp(); toast('Reminder saved.');
  },
  meeting(f, fd, d) {
    const old = S.meetings.find(x => x.id === d.id);
    const m = { id: d.id || uid(), title: fd.get('title').trim(), date: fd.get('date'), start: fd.get('start'), end: fd.get('end'), tz: fd.get('tz').trim() || S.settings.tz, location: fd.get('location').trim(), agenda: fd.get('agenda').trim(), notes: old ? old.notes : '', participants: fd.getAll('p'), reminders: fd.getAll('rem') };
    if (m.end <= m.start) { toast('End time must be after the start time.', 'err'); return; }
    try { new Intl.DateTimeFormat('en-US', { timeZone: m.tz }); } catch (e) { toast('Unknown time zone. Example: Asia/Dubai', 'err'); return; }
    const cf = conflicts(m);
    if (cf.length && f.dataset.ack !== '1') {
      f.dataset.ack = '1'; const box = $('#conflictBox', f);
      box.hidden = false; box.innerHTML = `<b>Time conflict:</b> overlaps ${cf.map(c => `${esc(c.title)} (${fmt12(c.start)} to ${fmt12(c.end)})`).join(', ')}. Press “Save anyway” to keep it, or change the time.`;
      $('button.primary', f).textContent = 'Save anyway'; return;
    }
    if (old) S.meetings[S.meetings.indexOf(old)] = m; else S.meetings.push(m);
    markFired('m', m); save(); closeModal(); renderApp(); toast('Meeting saved.');
  },
  contact(f, fd, d) {
    const c = { id: d.id || uid(), name: fd.get('name').trim(), role: fd.get('role').trim(), email: fd.get('email').trim(), phone: fd.get('phone').trim(), isBoss: !!fd.get('isBoss') };
    if (c.isBoss) S.contacts.forEach(x => { if (x.id !== c.id) x.isBoss = false; });
    else if (d.id && contact(d.id) && contact(d.id).isBoss && !S.contacts.some(x => x.isBoss && x.id !== d.id)) c.isBoss = true; // keep one boss
    const old = contact(d.id); if (old) S.contacts[S.contacts.indexOf(old)] = c; else S.contacts.push(c);
    save(); closeModal(); renderApp(); toast('Contact saved.');
  },
  consent(f, fd) { closeModal(); startRecording(fd.get('lang')); },
  rec(f, fd, d) { collectRec(d.id); closeModal(); renderApp(); toast('Recording saved.'); },
  settings(f, fd) {
    const tz = fd.get('tz').trim() || 'UTC';
    try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); } catch (e) { toast('Unknown time zone. Example: Asia/Dubai', 'err'); return; }
    Object.assign(S.settings, { tz, emailSender: fd.get('emailSender').trim(), replyTo: fd.get('replyTo').trim(), waSender: fd.get('waSender').trim(), reminderTpl: fd.get('reminderTpl'), meetingTpl: fd.get('meetingTpl'), defaultReminders: fd.getAll('dr'), push: !!fd.get('push') });
    S.user.name = fd.get('you').trim() || S.user.name; boss().name = fd.get('boss').trim() || boss().name;
    if (S.settings.push && 'Notification' in window && Notification.permission === 'default') Notification.requestPermission();
    save(); renderApp(); toast('Settings saved.');
  }
};
document.addEventListener('submit', e => { const f = e.target.closest('form[data-form]'); if (!f) return; e.preventDefault(); const fn = FORMS[f.dataset.form]; if (fn) fn(f, new FormData(f), f.dataset); });

/* ============ Alerts (while the tab is open) ============ */
function alertUser(title, body, act) {
  toast(`${title}: ${body}`, 'ok', act);
  if (S.settings.push && 'Notification' in window && Notification.permission === 'granted') { try { new Notification(title, { body }); } catch (e) { /* ignore */ } }
}
function tick() {
  if (!(S.session && S.user)) return;
  S.fired = S.fired || {}; const now = Date.now(); let dirty = false;
  S.reminders.forEach(r => {
    if (r.done) return; const due = new Date(`${r.date}T${r.time || '09:00'}`).getTime(), k = 'r:' + r.id;
    if (now >= due && now - due < 6 * 3600e3 && !S.fired[k]) { S.fired[k] = 1; dirty = true; alertUser('Reminder due', r.title, { label: 'Open', act: 'goReminders' }); }
  });
  S.meetings.forEach(m => {
    const st = new Date(`${m.date}T${m.start}`).getTime(), en = new Date(`${m.date}T${m.end}`).getTime();
    (m.reminders || []).forEach(k => {
      if (!OFFSETS[k]) return; const key = `m:${m.id}:${k}`, trig = st - OFFSETS[k].min * 60000;
      if (now >= trig && now < en && !S.fired[key]) { S.fired[key] = 1; dirty = true; alertUser(k === 'at' ? 'Meeting starting' : `Meeting in ${OFFSETS[k].label}`, `${m.title}. Time to remind participants.`, { label: 'Notify', act: 'inviteMeeting', id: m.id }); }
    });
  });
  if (dirty) save();
}
ACT.goReminders = () => { remTab = 'today'; location.hash = '#/reminders'; };
let tickTimer = null;
function startTicker() { if (tickTimer) clearInterval(tickTimer); tickTimer = setInterval(tick, 30000); setTimeout(tick, 1500); }
window.addEventListener('beforeunload', e => { if (rec) { e.preventDefault(); e.returnValue = ''; } });

/* ============ Start ============ */
route = readRoute();
renderApp();
if (S.session && S.user) startTicker();
