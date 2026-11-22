// ============================================================
//  NUEVO DISEÑO — navegación, Inicio y menú
// ============================================================
const NV_ICONS = {
  inicio: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  calendario: '<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M3 9h18M8 2v4M16 2v4"/>',
  canciones: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  equipo: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5"/>',
  ausencia: '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',
  lista: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  admin: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  mas: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
  share: '<path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7"/><path d="M16 6l-4-4-4 4M12 2v14"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  back: '<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
};
const nvSvg = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${NV_ICONS[k] || ''}</svg>`;

const NV_NAV = [
  { v: 'inicio',     label: 'Inicio',          icon: 'inicio',     dock: true },
  { v: 'semanal',    label: 'Calendario',      icon: 'calendario', dock: true, also: ['mensual'] },
  { v: 'biblioteca', label: 'Canciones',       icon: 'canciones',  dock: true },
  { v: 'dashboard',  label: 'Equipo',          icon: 'equipo',     dock: true },
  { v: 'ausencias',  label: 'Ausencias',       icon: 'ausencia' },
  { v: 'lista',      label: 'Lista de turnos', icon: 'lista' },
  { v: 'admin',      label: 'Admin',           icon: 'admin' },
];
const nvActive = it => state.view === it.v || (it.also || []).includes(state.view);
const nvAv = (c, cls = '') => `<span class="nv-av ${cls}" style="background:${c.color.hex}">${initials(c.name)}</span>`;
const NV_M = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

function nvDaysTo(ds) { return Math.round((new Date(ds + 'T12:00:00') - new Date(todayStr() + 'T12:00:00')) / 86400000); }
function nvRel(ds) { const n = nvDaysTo(ds); return n === 0 ? 'Hoy' : n === 1 ? 'Mañana' : n < 14 ? `En ${n} días` : `En ${Math.round(n / 7)} semanas`; }
function nvLongDate(ds) { const d = new Date(ds + 'T12:00:00'); return `${DAYS_FULL[d.getDay()]} ${d.getDate()} de ${MONTHS[d.getMonth()].toLowerCase()}`; }
function nvShifts(ds, t) { return state.shifts.filter(s => s.date === ds && (!t || s.turno === t)); }
function nvAbsence(ds, t, cid) { return state.ausencias.find(a => a.date === ds && a.collabId === cid && (a.turno === t || a.turno === 'Ambos')); }
function nvApproved(a) { return a && a.estado && a.estado.toLowerCase() === 'aprobada'; }
function nvMissing(ds, t) { return Math.max(0, 4 - nvShifts(ds, t).length); } // mismo criterio que el Dashboard
function nvServiceDates(n) {
  const today = todayStr();
  return [...new Set(state.shifts.filter(s => s.date >= today && new Date(s.date + 'T12:00:00').getDay() === 0).map(s => s.date))].sort().slice(0, n);
}
function nvMine() {
  if (!state.myVolunteerId) return [];
  const today = todayStr();
  return state.shifts.filter(s => s.collabId === state.myVolunteerId && s.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.turno.localeCompare(b.turno));
}

// ---------- shell: menú lateral, dock y botón de usuario ----------
function renderShell() {
  const me = getCollab(state.myVolunteerId);
  const meBtn = document.getElementById('nv-me');
  if (meBtn) meBtn.innerHTML = (state.isAdmin ? '<span class="nv-badge">Admin</span>' : '') +
    (me ? `${escHtml(me.name.split(' ')[0])} ${nvAv(me)}` : `Elegir <span class="nv-av" style="background:var(--ink-muted)">?</span>`);

  const dock = document.getElementById('nv-dock');
  if (dock) {
    const moreOn = NV_NAV.some(it => !it.dock && nvActive(it));
    dock.innerHTML = NV_NAV.filter(it => it.dock).map(it =>
      `<button class="${nvActive(it) ? 'on' : ''}" onclick="nvGo('${it.v}')" aria-label="${it.label}">${nvSvg(it.icon)}<span>${it.label}</span></button>`
    ).join('') + `<button class="${moreOn ? 'on' : ''}" onclick="nvOpenMore()" aria-label="Más">${nvSvg('mas')}<span>Más</span></button>`;
  }

  const side = document.getElementById('nv-side');
  if (side) {
    const next = nvServiceDates(1)[0];
    const people = next ? new Set(nvShifts(next).map(s => s.collabId)).size : 0;
    side.innerHTML = `<div class="nv-brand"><div class="nv-mark">${nvSvg('canciones')}</div><div>Alabanza<small>Templo Alabanza Panajachel</small></div></div>
      ${NV_NAV.map(it => `<button class="nv-item ${nvActive(it) ? 'on' : ''}" onclick="nvGo('${it.v}')"><span class="nv-ic">${nvSvg(it.icon)}</span>${it.label}</button>`).join('')}
      ${next ? `<div class="nv-side-card"><div class="nv-label">Próximo servicio</div>
        <div style="font-weight:600;font-size:15px;margin:4px 0 2px">${escHtml(nvLongDate(next))}</div>
        <div style="font-size:12px;opacity:.85;margin-bottom:10px">${people} personas · ${nvRel(next)}</div>
        <button class="nv-btn nv-btn-white" style="width:100%;padding:9px" onclick="openDayDetail('${next}','AM')">${nvSvg('share')} Ver y compartir</button></div>` : ''}
      <button class="nv-item" style="margin-top:${next ? '8px' : 'auto'};font-size:12px;color:var(--ink-muted)" onclick="nvClassicDesign()"><span class="nv-ic">${nvSvg('back')}</span>Diseño anterior</button>`;
  }

  document.querySelectorAll('[data-cal]').forEach(b => b.classList.toggle('on', b.dataset.cal === state.view));
}

function nvGo(v) { nvCloseMore(); switchView(v); window.scrollTo({ top: 0, behavior: 'smooth' }); }

function nvOpenMore() {
  const me = getCollab(state.myVolunteerId);
  const item = (icon, label, fn, on) => `<button class="nv-item ${on ? 'on' : ''}" onclick="${fn}"><span class="nv-ic">${nvSvg(icon)}</span>${label}</button>`;
  document.getElementById('nv-sheet-body').innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;padding:4px 12px 12px">
      ${me ? nvAv(me, '') : '<span class="nv-av" style="background:var(--ink-muted)">?</span>'}
      <div style="flex:1"><div style="font-weight:600">${me ? escHtml(me.name) : 'Sin seleccionar'}</div><div class="nv-tiny">${me ? escHtml(me.roles) : 'Elige tu nombre para ver tus turnos'}</div></div>
      ${state.isAdmin ? '<span class="nv-badge">Admin</span>' : ''}
    </div>
    ${item('user', me ? 'Cambiar de usuario' : 'Elegir mi nombre', 'nvCloseMore();openVolunteerModal()')}
    <div class="nv-sep"></div>
    ${NV_NAV.filter(it => !it.dock).map(it => item(it.icon, it.label, `nvGo('${it.v}')`, nvActive(it))).join('')}
    ${item('calendario', 'Calendario del mes', `nvGo('mensual')`, state.view === 'mensual')}
    <div class="nv-sep"></div>
    ${state.isAdmin ? item('logout', 'Cerrar sesión de admin', 'nvCloseMore();logoutAdmin()') : ''}
    ${item('back', 'Volver al diseño anterior', 'nvClassicDesign()')}`;
  document.getElementById('nv-scrim').classList.add('on');
  document.getElementById('nv-sheet').classList.add('on');
}
function nvCloseMore() {
  const sc = document.getElementById('nv-scrim'); if (sc) sc.classList.remove('on');
  const sh = document.getElementById('nv-sheet'); if (sh) sh.classList.remove('on');
}

function nvClassicDesign() {
  try { localStorage.setItem('diseno', 'clasico'); localStorage.setItem('disenoAviso', String(Date.now())); } catch (e) {}
  location.href = 'index.html' + location.search;
}

// Lleva al formulario de ausencias con los datos ya llenos
function nvReportAbsence(date, turno) {
  nvGo('ausencias');
  const sel = document.getElementById('abs-collab');
  if (state.myVolunteerId && sel) sel.value = state.myVolunteerId;
  if (date) document.getElementById('abs-date').value = date;
  if (turno) document.getElementById('abs-turno').value = turno;
  setTimeout(() => document.getElementById('abs-motivo').focus(), 250);
}

function nvShareService(date, turno) {
  openDayDetail(date, turno);
  setTimeout(() => { if (typeof shareAsImage === 'function') shareAsImage(); }, 350);
}

// ---------- INICIO ----------
let nvHomeTurno = 'AM';

function nvServiceCard(ds, t) {
  const list = nvShifts(ds, t);
  const missing = nvMissing(ds, t);
  const items = state.contenido.filter(c => c.fecha === ds && c.turno === t).sort((a, b) => a.orden - b.orden);
  const roster = list.map(s => {
    const c = getCollab(s.collabId); if (!c) return '';
    const a = nvAbsence(ds, t, s.collabId);
    const tag = a ? (nvApproved(a) ? '<span class="nv-tag bad">ausente</span>' : `<span class="nv-tag warn">${escHtml((a.estado || 'Pendiente').toLowerCase())}</span>`) : '';
    return `<div class="nv-row ${s.collabId === state.myVolunteerId ? 'me' : ''} ${nvApproved(a) ? 'out' : ''}">
      <div class="r">${escHtml(s.rol)}</div><div class="w">${nvAv(c, 'sm')}<span>${escHtml(c.name)}</span></div>${tag}</div>`;
  }).join('') || '<div class="nv-empty">Sin asignar</div>';
  let n = 0;
  const content = items.map(it => {
    if (it.tipo === 'cancion') {
      n++;
      const song = it.cancionId ? getCancion(it.cancionId) : null;
      return `<div class="nv-track"><span class="n">${String(n).padStart(2, '0')}</span><span class="t">${escHtml(it.contenido)}</span>${song && song.tonalidad ? `<span class="k">${escHtml(song.tonalidad)}</span>` : ''}</div>`;
    }
    return `<div class="nv-track"><span class="n">·</span><span class="t note">${linkify(it.contenido)}</span></div>`;
  }).join('') || '<div class="nv-empty">Aún no hay canciones ni notas.</div>';

  return `<div class="nv-card">
    <div class="nv-svc-head"><div><div class="nv-label">${nvRel(ds)}</div><h3>${escHtml(nvLongDate(ds))}</h3></div>
      <div class="nv-seg" style="margin:0">${['AM', 'PM'].map(k => `<button class="${k === t ? 'on' : ''}" onclick="nvHomeTurno='${k}';renderInicio()">${k}</button>`).join('')}</div></div>
    <div style="padding:12px 18px 0">${missing ? `<span class="nv-status bad">Falta${missing > 1 ? 'n' : ''} ${missing} persona${missing > 1 ? 's' : ''}</span>` : '<span class="nv-status ok">Equipo completo</span>'}</div>
    <div class="nv-svc-cols">
      <div class="nv-svc-col"><div class="nv-col-h"><span class="nv-label">Equipo</span><span class="nv-tiny">${list.length} personas</span></div>${roster}</div>
      <div class="nv-svc-col"><div class="nv-col-h"><span class="nv-label">Repertorio y notas</span><span class="nv-tiny">${n ? n + ' canciones' : ''}</span></div>${content}</div>
    </div>
    <div class="nv-svc-foot">
      <button class="nv-btn nv-btn-soft nv-grow" onclick="openDayDetail('${ds}','${t}')">Abrir y editar</button>
      <button class="nv-btn nv-btn-wa nv-grow" onclick="nvShareService('${ds}','${t}')">${nvSvg('share')} WhatsApp</button>
    </div>
  </div>`;
}

function renderInicio() {
  const el = document.getElementById('nv-inicio');
  if (!el) return;
  const me = getCollab(state.myVolunteerId);
  const today = todayStr();
  const mine = nvMine();
  const services = nvServiceDates(7);
  const next = services[0];

  // Banner principal
  let hero;
  if (mine[0]) {
    const s = mine[0];
    const n = nvDaysTo(s.date);
    const mates = nvShifts(s.date, s.turno).filter(x => x.collabId !== state.myVolunteerId && x.collabId !== '11').map(x => getCollab(x.collabId)).filter(Boolean);
    const songs = state.contenido.filter(c => c.fecha === s.date && c.turno === s.turno && c.tipo === 'cancion').length;
    hero = `<div class="nv-hero">
      <div class="nv-hero-top"><div><div class="nv-label">Tu próximo turno</div><div class="nv-hero-date">${escHtml(nvLongDate(s.date))}</div></div>
        <div class="nv-count nv-glass">${n === 0 ? '<b style="font-size:20px">Hoy</b>' : `<b>${n}</b><span>${n === 1 ? 'día' : 'días'}</span>`}</div></div>
      <div class="nv-pills"><span class="nv-pill nv-glass">${s.turno === 'AM' ? '☀︎ Mañana' : '☾ Tarde'}</span><span class="nv-pill nv-glass">♪ ${escHtml(s.rol)}</span><span class="nv-pill nv-glass">${songs ? songs + (songs === 1 ? ' canción' : ' canciones') : 'Sin canciones'}</span></div>
      ${mates.length ? `<div class="nv-team-line"><div class="nv-stack">${mates.slice(0, 5).map(c => nvAv(c, 'sm')).join('')}</div>Con ${escHtml(mates.map(c => c.name.split(' ')[0]).join(', '))}</div>` : ''}
      <div class="nv-hero-actions"><button class="nv-btn nv-btn-white nv-grow" onclick="openDayDetail('${s.date}','${s.turno}')">Ver servicio</button>
        <button class="nv-btn nv-btn-glass nv-glass nv-grow" onclick="nvReportAbsence('${s.date}','${s.turno}')">No puedo ir</button></div>
    </div>`;
  } else if (next) {
    hero = `<div class="nv-hero"><div class="nv-label">Próximo servicio</div><div class="nv-hero-date">${escHtml(nvLongDate(next))}</div>
      <div class="nv-pills"><span class="nv-pill nv-glass">${nvShifts(next).length} turnos asignados</span><span class="nv-pill nv-glass">${nvRel(next)}</span>${me ? '<span class="nv-pill nv-glass">No tienes turnos próximos</span>' : ''}</div>
      <div class="nv-hero-actions"><button class="nv-btn nv-btn-white nv-grow" onclick="openDayDetail('${next}','AM')">Ver servicio</button>
        ${me ? '' : '<button class="nv-btn nv-btn-glass nv-glass nv-grow" onclick="openVolunteerModal()">Elegir mi nombre</button>'}</div></div>`;
  } else {
    hero = `<div class="nv-hero"><div class="nv-label">Servicios</div><div class="nv-hero-date">No hay servicios programados</div></div>`;
  }

  // Accesos directos
  const SC = [
    ['ausencia', 'Reportar ausencia', 'nv-g-orange', 'nvReportAbsence()'],
    ['canciones', 'Canciones', 'nv-g-indigo', "nvGo('biblioteca')"],
    ['share', 'WhatsApp', 'nv-g-wa', next ? `nvShareService('${next}','AM')` : "nvGo('semanal')"],
    ['calendario', 'Calendario', 'nv-g-green', "nvGo('mensual')"],
    ['equipo', 'Equipo', 'nv-g-pink', "nvGo('dashboard')"],
    ['plus', 'Asignar turno', 'nv-g-ink', 'openAssignShiftModal()'],
  ];

  // Resumen
  const monthPrefix = today.slice(0, 7);
  const gaps = nvServiceDates(4).reduce((acc, d) => acc + ['AM', 'PM'].filter(t => nvMissing(d, t) > 0).length, 0);
  const pending = state.ausencias.filter(a => a.date >= today && (a.estado || '').toLowerCase() === 'pendiente').length;
  const stats = [
    ['Mis turnos', me ? mine.length : '—', 'programados', '', "nvGo('semanal')"],
    ['Este mes', me ? mine.filter(s => s.date.startsWith(monthPrefix)).length : '—', 'turnos en ' + MONTHS[new Date().getMonth()].toLowerCase(), '', "nvGo('mensual')"],
    ['Turnos sin cubrir', gaps, 'próximas 4 semanas', gaps ? 'alert' : '', "nvGo('dashboard')"],
    ['Ausencias', pending, 'pendientes de aprobar', '', "nvGo('ausencias')"],
  ];

  // Columna derecha
  const agenda = services.slice(1, 7).map(d => {
    const dd = new Date(d + 'T12:00:00');
    const people = [...new Set(nvShifts(d).map(s => s.collabId))].map(getCollab).filter(Boolean);
    const mineHere = nvShifts(d).filter(s => s.collabId === state.myVolunteerId);
    const miss = nvMissing(d, 'AM') + nvMissing(d, 'PM');
    const sub = mineHere.length ? `Te toca ${mineHere.map(s => s.turno).join(' + ')}` : miss ? `<span style="color:var(--nv-danger)">Faltan ${miss}</span>` : 'Equipo completo';
    return `<button class="nv-li ${mineHere.length ? 'mine' : ''}" onclick="openDayDetail('${d}','${mineHere[0] ? mineHere[0].turno : 'AM'}')">
      <div class="nv-cal"><div class="m">${NV_M[dd.getMonth()]}</div><div class="d">${dd.getDate()}</div></div>
      <div class="main"><b>${nvRel(d)}</b><div class="nv-tiny">${sub}</div></div>
      <div class="nv-stack">${people.slice(0, 3).map(c => nvAv(c, 'sm')).join('')}</div></button>`;
  }).join('') || '<div class="nv-empty">No hay más servicios programados.</div>';

  const myList = me ? (mine.slice(0, 6).map(s => {
    const dd = new Date(s.date + 'T12:00:00');
    const a = state.ausencias.find(x => x.date === s.date && x.collabId === state.myVolunteerId && (x.turno === s.turno || x.turno === 'Ambos'));
    return `<div class="nv-li mine"><div class="nv-cal"><div class="m">${NV_M[dd.getMonth()]}</div><div class="d">${dd.getDate()}</div></div>
      <div class="main"><b>${s.turno === 'AM' ? 'Mañana' : 'Tarde'} · ${escHtml(s.rol)}</b><div class="nv-tiny">${nvRel(s.date)}</div></div>
      ${a ? `<span class="nv-tag ${nvApproved(a) ? 'ok' : 'warn'}">Ausencia ${escHtml((a.estado || '').toLowerCase())}</span>` : `<button class="nv-chip-btn" onclick="nvReportAbsence('${s.date}','${s.turno}')">No puedo</button>`}</div>`;
  }).join('') || '<div class="nv-empty">No tienes turnos programados.</div>') : '';

  const absList = state.ausencias.filter(a => a.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 5).map(a => {
    const c = getCollab(a.collabId); if (!c) return '';
    const dd = new Date(a.date + 'T12:00:00');
    const st = (a.estado || 'Pendiente');
    return `<div class="nv-li">${nvAv(c)}<div class="main"><b>${escHtml(c.name)}</b><div class="nv-tiny">${dd.getDate()} ${NV_M[dd.getMonth()]} · ${escHtml(a.turno)} · ${escHtml(a.motivo || '')}</div></div>
      <span class="nv-tag ${st.toLowerCase() === 'aprobada' ? 'ok' : st.toLowerCase() === 'rechazada' ? 'bad' : 'warn'}">${escHtml(st)}</span></div>`;
  }).join('') || '<div class="nv-empty">Sin ausencias próximas.</div>';

  el.innerHTML = `<div class="nv-home">
    <div>
      <div class="nv-label" style="margin-top:10px">${escHtml(nvLongDate(today))}</div>
      <div class="nv-h1">${me ? `Hola, ${escHtml(me.name.split(' ')[0])} 👋` : 'Turnos de alabanza'}</div>
      ${hero}
      <div class="nv-shortcuts">${SC.map(([ic, l, g, fn]) => `<button class="nv-sc" onclick="${fn}"><i class="${g}">${nvSvg(ic)}</i>${l}</button>`).join('')}</div>
      <div class="nv-sec"><h2>Resumen</h2></div>
      <div class="nv-stats">${stats.map(([l, v, t, c, fn]) => `<button class="nv-card nv-stat ${c}" onclick="${fn}"><div class="nv-label">${l}</div><b>${v}</b><div class="nv-tiny">${t}</div></button>`).join('')}</div>
      <div class="nv-sec"><h2>Próximo servicio</h2><button class="nv-more" onclick="nvGo('semanal')">Calendario →</button></div>
      ${next ? nvServiceCard(next, nvHomeTurno) : '<div class="nv-card nv-empty">No hay servicios programados.</div>'}
    </div>
    <div class="nv-aside">
      ${me ? `<div class="nv-sec"><h2>Mis turnos</h2><button class="nv-more" onclick="nvGo('semanal')">Ver todos →</button></div><div class="nv-card nv-list">${myList}</div>` : ''}
      <div class="nv-sec"><h2>Próximos domingos</h2></div>
      <div class="nv-card nv-list">${agenda}</div>
      <div class="nv-sec"><h2>Ausencias</h2><button class="nv-more" onclick="nvReportAbsence()">+ Reportar</button></div>
      <div class="nv-card nv-list">${absList}</div>
    </div>
  </div>`;
}
