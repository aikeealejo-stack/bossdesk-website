const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const KEY = 'bossdesk';
let db = JSON.parse(localStorage.getItem(KEY) || 'null') || {
  user: null, session: false,
  boss: { name: '', title: '', email: '', wa: '', tz: Intl.DateTimeFormat().resolvedOptions().timeZone },
  reminders: [], meetings: [], contacts: []
};
const save = () => localStorage.setItem(KEY, JSON.stringify(db));
const uid = () => Date.now() + Math.random().toString(16).slice(2);
const todayStr = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
let signupMode = !db.user;
let remFilter = 'today';

/* ---------- AUTH ---------- */
function drawAuth() {
  $('#authTitle').textContent = signupMode ? 'Create your account' : 'Sign in';
  $('#authSub').textContent = signupMode ? 'This device will own the assistant account.' : 'Welcome back.';
  $('#nameWrap').hidden = !signupMode;
  $('#authBtn').textContent = signupMode ? 'Create account' : 'Sign in';
  $('#authToggle').textContent = signupMode ? 'Already registered? Sign in' : 'New here? Create account';
}
$('#authToggle').onclick = () => { signupMode = !signupMode; drawAuth(); };
$('#authForm').onsubmit = e => {
  e.preventDefault();
  const email = $('#aEmail').value.trim(), pass = $('#aPass').value;
  if (signupMode) {
    db.user = { name: $('#aName').value.trim() || 'Assistant', email, pass };
    db.session = true;
  } else {
    if (!db.user || db.user.email !== email || db.user.pass !== pass) {
      $('#authErr').textContent = 'Wrong email or password.'; return;
    }
    db.session = true;
  }
  save(); start();
};
$('#logout').onclick = () => { db.session = false; save(); start(); };

/* ---------- NAVIGATION ---------- */
function go(name) {
  $$('.view').forEach(v => v.hidden = v.id !== 'v-' + name);
  $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.go === name));
  window.scrollTo(0, 0);
  render();
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-go]');
  if (t) { e.preventDefault(); go(t.dataset.go); }
});
$$('#remTabs .tab').forEach(b => b.onclick = () => {
  remFilter = b.dataset.f;
  $$('#remTabs .tab').forEach(x => x.classList.toggle('active', x === b));
  drawReminders();
});

/* ---------- RENDER ---------- */
const empty = (icon, title, text) =>
  `<div class="empty">${icon}<b>${title}</b>${text}</div>`;

function drawDashboard() {
  const now = new Date();
  $('#today').textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();
  $('#greeting').textContent = `Good ${now.getHours() < 12 ? 'morning' : now.getHours() < 18 ? 'afternoon' : 'evening'}, ${db.user.name}`;
  const b = db.boss;
  $('#subGreeting').textContent = b.name ? `Here's ${b.name}'s day at a glance.` : "Here's your boss's day at a glance.";
  $('#bossCard').innerHTML = b.name
    ? `<div class="boss-top"><div class="avatar">👤</div><div><small>BOSS</small><b>${b.name}</b></div></div>
       <div class="boss-meta"><span>🌐 ${b.tz}</span>${b.title ? `<span>💼 ${b.title}</span>` : ''}</div>`
    : `<a href="#" data-go="settings" style="color:#fff;text-decoration:none"><div class="boss-top"><div class="avatar">👤</div><div><small>BOSS</small><b>Set up boss profile</b></div></div>
       <div class="boss-meta"><span>🌐 ${b.tz}</span></div></a>`;

  const meets = db.meetings.filter(m => m.date === todayStr()).sort((a, b) => a.time.localeCompare(b.time));
  const due = db.reminders.filter(r => r.date === todayStr() && !r.done);
  $('#sMeet').textContent = meets.length;
  $('#sRem').textContent = due.length;
  $('#sCont').textContent = db.contacts.length;

  $('#agenda').innerHTML = meets.length
    ? meets.map(meetingHTML).join('')
    : empty('📅', 'No meetings today', 'Tap + to add a meeting.');
  $('#dueToday').innerHTML = due.length
    ? due.map(reminderHTML).join('')
    : empty('🔕', 'Nothing due today', 'Tap + to add a reminder.');
}

function reminderHTML(r) {
  return `<div class="item ${r.done ? 'done' : ''}">
    <input type="checkbox" ${r.done ? 'checked' : ''} onchange="toggleRem('${r.id}')">
    <div class="body">
      <div class="t">${r.title}</div>
      <div class="s">${r.date} ${r.time || ''} · <span class="pri-${r.pri}">${r.pri}</span></div>
      <div class="actions">
        <a class="chip" href="#" onclick="sendEmail('${r.id}');return false">✉ Email</a>
        <a class="chip" href="#" onclick="sendWA('${r.id}');return false">💬 WhatsApp</a>
        <a class="chip del" href="#" onclick="delRem('${r.id}');return false">Delete</a>
      </div>
    </div></div>`;
}
function meetingHTML(m) {
  return `<div class="item"><div class="body">
    <div class="t">${m.time || ''} · ${m.title}</div>
    <div class="s">${m.date}${m.loc ? ' · ' + m.loc : ''}</div>
    <div class="actions"><a class="chip del" href="#" onclick="delMeet('${m.id}');return false">Delete</a></div>
  </div></div>`;
}

function drawReminders() {
  const t = todayStr();
  const f = {
    today: r => r.date === t && !r.done,
    upcoming: r => r.date > t && !r.done,
    overdue: r => r.date < t && !r.done,
    done: r => r.done
  }[remFilter];
  const list = db.reminders.filter(f).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  $('#remList').innerHTML = list.length ? list.map(reminderHTML).join('') : empty('🔕', 'Nothing here', 'Tap + to add a reminder.');
}
function drawCalendar() {
  const list = [...db.meetings].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  $('#meetList').innerHTML = list.length ? list.map(meetingHTML).join('') : empty('📅', 'No meetings yet', 'Tap + to add one.');
}
function drawSettings() {
  const b = db.boss;
  $('#bName').value = b.name; $('#bTitle').value = b.title;
  $('#bEmail').value = b.email; $('#bWa').value = b.wa; $('#bTz').value = b.tz;
}
function render() { drawDashboard(); drawReminders(); drawCalendar(); drawSettings(); }

/* ---------- ACTIONS ---------- */
window.toggleRem = id => { const r = db.reminders.find(x => x.id === id); r.done = !r.done; save(); render(); };
window.delRem = id => { db.reminders = db.reminders.filter(x => x.id !== id); save(); render(); };
window.delMeet = id => { db.meetings = db.meetings.filter(x => x.id !== id); save(); render(); };
const msg = r => `Reminder: ${r.title}\nDate: ${r.date} ${r.time || ''}\nPriority: ${r.pri}`;
window.sendEmail = id => {
  const r = db.reminders.find(x => x.id === id);
  location.href = `mailto:${db.boss.email}?subject=${encodeURIComponent('Reminder: ' + r.title)}&body=${encodeURIComponent(msg(r))}`;
};
window.sendWA = id => {
  const r = db.reminders.find(x => x.id === id);
  window.open(`https://wa.me/${db.boss.wa.replace(/\D/g, '')}?text=${encodeURIComponent(msg(r))}`, '_blank');
};

$('#briefBtn').onclick = () => {
  const t = todayStr();
  const meets = db.meetings.filter(m => m.date === t);
  const due = db.reminders.filter(r => r.date === t && !r.done);
  const over = db.reminders.filter(r => r.date < t && !r.done);
  const bullets = [
    `${meets.length} meeting(s) today${meets[0] ? ', first at ' + meets[0].time : ''}.`,
    `${due.length} reminder(s) due today.`,
    over.length ? `${over.length} overdue reminder(s) need attention.` : 'No overdue reminders.'
  ];
  $('#briefBox').innerHTML = `<h3>Today's brief</h3><ul class="brief-list">${bullets.map(b => `<li>${b}</li>`).join('')}</ul>`;
};

$('#bossForm').onsubmit = e => {
  e.preventDefault();
  db.boss = { name: $('#bName').value.trim(), title: $('#bTitle').value.trim(), email: $('#bEmail').value.trim(), wa: $('#bWa').value.trim(), tz: $('#bTz').value.trim() || 'UTC' };
  save(); render(); $('#saved').textContent = 'Saved ✓';
};

/* ---------- ADD MODAL ---------- */
$('#fab').onclick = () => { $('#modal').hidden = false; $('#rDate').value = $('#mDate').value = todayStr(); };
$('#closeModal').onclick = () => $('#modal').hidden = true;
$('#addType').onchange = e => {
  $('#fReminder').hidden = e.target.value !== 'reminder';
  $('#fMeeting').hidden = e.target.value !== 'meeting';
  $('#fContact').hidden = e.target.value !== 'contact';
};
$('#addForm').onsubmit = e => {
  e.preventDefault();
  const type = $('#addType').value;
  if (type === 'reminder' && $('#rTitle').value.trim()) {
    db.reminders.push({ id: uid(), title: $('#rTitle').value.trim(), date: $('#rDate').value, time: $('#rTime').value, pri: $('#rPri').value, done: false });
  } else if (type === 'meeting' && $('#mTitle').value.trim()) {
    db.meetings.push({ id: uid(), title: $('#mTitle').value.trim(), date: $('#mDate').value, time: $('#mTime').value, loc: $('#mLoc').value.trim() });
  } else if (type === 'contact' && $('#cName').value.trim()) {
    db.contacts.push({ id: uid(), name: $('#cName').value.trim(), email: $('#cEmail').value, wa: $('#cWa').value });
  } else return;
  save(); e.target.reset(); $('#modal').hidden = true; render();
};

/* ---------- START ---------- */
function start() {
  const logged = db.session && db.user;
  $('#auth').hidden = logged;
  $('#main').hidden = !logged;
  if (logged) go('dashboard'); else { signupMode = !db.user; drawAuth(); }
}
start();