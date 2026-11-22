#!/usr/bin/env python3
"""Genera nuevo.html (diseño C) a partir de index.html, conservando toda la lógica."""
import re, sys

src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8').read()
# quitar el aviso/redirección beta (solo vive en index.html)
s, nb = re.subn(r'<!-- BETA:START -->.*?<!-- BETA:END -->\n?', '', s, flags=re.S)
s, nc = re.subn(r'  /\* BETA:START \*/.*?/\* BETA:END \*/\n', '', s, flags=re.S)
assert nb == 2 and nc == 1, (nb, nc)

def R(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, f'esperaba {count}, hay {n}: {old[:90]!r}'
    s = s.replace(old, new)

# ---------------------------------------------------------------- HEAD
R('<title>Turnos — Templo de Alabanza Panajachel</title>',
  '<title>Turnos — Templo de Alabanza Panajachel</title>\n'
  '<meta name="color-scheme" content="light">\n<meta name="theme-color" content="#0B3B2E">\n'
  '<script>try{localStorage.setItem(\'diseno\',\'nuevo\')}catch(e){}</script>')
R('family=Fraunces:ital,wght@0,300;0,500;0,700;1,300&family=DM+Sans:wght@300;400;500;600',
  'family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500')
s = s.replace("'DM Sans'", "'Geist'").replace("'Fraunces', serif", "'Geist', sans-serif")

CSS = r"""
  /* =================================================================
     NUEVO DISEÑO (opción C) — capa sobre los estilos existentes
     ================================================================= */
  :root {
    --cream:#F7F7F5; --cream-dark:#EFEFEC; --ink:#0A0A0B; --ink-soft:#3F3F46; --ink-muted:#8A8A93;
    --forest:#059669; --forest-light:#E7F8F0; --border:rgba(10,10,11,.08); --radius:18px;
    --shadow:0 1px 2px rgba(16,24,20,.04),0 8px 24px -6px rgba(16,24,20,.10);
    --nv-card:#fff; --nv-muted:#F2F2EF; --nv-accent-ink:#047857;
    --nv-danger:#E11D48; --nv-danger-soft:#FFEEF2; --nv-warn:#B45309; --nv-warn-soft:#FFF6E0;
    --nv-am:#C2410C; --nv-am-soft:#FFF1E6; --nv-pm:#4F46E5; --nv-pm-soft:#EEF0FF;
    --nv-shadow-sm:0 1px 2px rgba(16,24,20,.05),0 2px 6px rgba(16,24,20,.04);
    --nv-shadow-lg:0 2px 4px rgba(16,24,20,.04),0 24px 48px -12px rgba(16,24,20,.18);
  }
  body { font-family:'Geist',system-ui,sans-serif; background:var(--cream); -webkit-font-smoothing:antialiased; padding-bottom:calc(100px + env(safe-area-inset-bottom)); }
  body::before { content:""; position:fixed; inset:-20vh -20vw auto; height:80vh; z-index:-1; pointer-events:none; filter:blur(20px);
    background:radial-gradient(40% 50% at 15% 20%,rgba(16,185,129,.16),transparent 70%),radial-gradient(35% 45% at 85% 10%,rgba(99,102,241,.10),transparent 70%),radial-gradient(30% 40% at 60% 60%,rgba(234,122,43,.07),transparent 70%); }
  .header, .change-user-btn, .admin-badge { display:none !important; }
  .app { max-width:none; margin:0; padding:0; }
  .loader-overlay { background:var(--cream); }
  .loader-spinner { border-top-color:var(--forest); }

  /* títulos */
  .nav-title { font-size:26px; font-weight:600; letter-spacing:-.9px; }
  .nav-title em { font-style:normal; color:var(--forest); }
  .section-title, .modal-title, .assign-modal-title, .absence-form-title, .absence-list-title, .next-service-title,
  .my-card-name, .month-card-date, .volunteer-modal-header h2, .deck-title, .col-header { font-weight:600; letter-spacing:-.4px; }
  .day-number, .absence-date-day { font-weight:600; letter-spacing:-.5px; }

  /* tarjetas */
  .week-grid, .cal-grid, .next-service, .absence-form-card, .absence-list-card, .month-card, .team-card, .my-card,
  .dash-stat, .dash-volunteer, .dash-gaps, .biblioteca-col, .deck, .assign-playlist, .admin-profile-row, .admin-profile-lock,
  .lista-table, .lista-card, .card-date-group, .my-upcoming { border-radius:18px !important; border:1px solid var(--border) !important; box-shadow:var(--shadow); background:var(--nv-card); }
  .modal, .assign-modal, .volunteer-modal-content { border-radius:24px; box-shadow:var(--nv-shadow-lg); }
  .modal-bg, .assign-modal-bg { background:rgba(10,10,11,.35); backdrop-filter:blur(3px); -webkit-backdrop-filter:blur(3px); }
  .volunteer-modal { background:var(--cream); }
  .volunteer-modal-icon { background:linear-gradient(135deg,#34D399,#059669 55%,#064E3B); box-shadow:0 8px 18px -6px rgba(5,150,105,.6); border-radius:16px; }
  .volunteer-card { border-radius:14px; background:var(--nv-card); border:1px solid var(--border); box-shadow:var(--nv-shadow-sm); }
  .volunteer-card.selected { border:2px solid var(--forest); background:var(--forest-light); }
  .my-card { border-left:1px solid var(--border) !important; }

  /* próximo servicio (vistas de calendario) */
  .next-service-header { position:relative; overflow:hidden; isolation:isolate; background:#0B3B2E; }
  .next-service-header::before { content:""; position:absolute; inset:-60%; z-index:-1; filter:blur(30px);
    background:radial-gradient(40% 50% at 20% 30%,#34D399,transparent 70%),radial-gradient(40% 60% at 85% 40%,#22D3EE,transparent 70%),radial-gradient(40% 50% at 60% 100%,#6366F1,transparent 70%); }

  /* botones */
  .btn-primary, .btn-submit-assign, .btn-continue, .btn-save-shift, .btn-add-contenido, .btn-save-contenido {
    background:linear-gradient(180deg,#34D399,#059669) !important; border-radius:12px !important;
    box-shadow:0 8px 18px -8px rgba(5,150,105,.7), inset 0 1px 0 rgba(255,255,255,.3); }
  .btn-continue:disabled { background:var(--cream-dark) !important; box-shadow:none; color:var(--ink-muted); }
  .today-btn, .btn-secondary, .btn-cancel-assign, .btn-share, .btn-edit, .song-btn, .btn-cancel-shift, .btn-remove-shift, .btn-cancel-contenido {
    border-radius:12px !important; box-shadow:var(--nv-shadow-sm); }
  .nav-btn { box-shadow:var(--nv-shadow-sm); }
  .btn-share.img-btn { background:linear-gradient(180deg,#3BE07A,#1EBE5A); border-color:transparent; box-shadow:0 8px 18px -8px rgba(30,190,90,.7), inset 0 1px 0 rgba(255,255,255,.3); }
  .form-input, .form-select, .form-textarea, .song-search, .assign-playlist-input { border-radius:12px !important; background:var(--cream); }
  .form-input:focus, .form-select:focus, .form-textarea:focus { border-color:var(--forest); box-shadow:0 0 0 3px rgba(5,150,105,.15); }

  /* ---------- SHELL ---------- */
  .nv-shell { max-width:1360px; margin:0 auto; padding:0 16px; }
  .nv-topbar { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px 0 6px; }
  .nv-brand { display:flex; align-items:center; gap:10px; font-weight:600; letter-spacing:-.3px; font-size:15px; }
  .nv-brand small { display:block; font-size:11px; font-weight:400; color:var(--ink-muted); letter-spacing:0; }
  .nv-mark { width:34px; height:34px; border-radius:11px; display:grid; place-items:center; color:#fff; flex-shrink:0;
    background:linear-gradient(135deg,#34D399,#059669 55%,#064E3B); box-shadow:0 6px 16px -4px rgba(5,150,105,.55), inset 0 1px 0 rgba(255,255,255,.3); }
  .nv-mark svg { width:17px; height:17px; }
  .nv-me { display:flex; align-items:center; gap:8px; padding:4px 4px 4px 12px; border-radius:999px; background:var(--nv-card); border:1px solid var(--border); box-shadow:var(--nv-shadow-sm); font:inherit; font-size:13px; font-weight:500; cursor:pointer; color:var(--ink); }
  .nv-badge { font-size:10px; font-weight:600; padding:2px 7px; border-radius:999px; background:var(--nv-warn-soft); color:var(--nv-warn); }
  .nv-av { width:32px; height:32px; border-radius:50%; display:grid; place-items:center; font-size:11px; font-weight:600; color:#fff; flex-shrink:0; box-shadow:0 0 0 2px var(--nv-card); }
  .nv-av.sm { width:24px; height:24px; font-size:9px; }
  .nv-stack { display:flex; } .nv-stack .nv-av { margin-left:-7px; } .nv-stack .nv-av:first-child { margin-left:0; }
  .nv-side { display:none; }
  .nv-main .view-panel.active { animation:nvIn .25s ease; }
  @keyframes nvIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:none; } }
  .view-panel > .nav-bar { margin-top:14px; }

  /* dock (celular) */
  .nv-dock { position:fixed; left:50%; bottom:calc(14px + env(safe-area-inset-bottom)); transform:translateX(-50%); z-index:90; display:flex; gap:2px; padding:6px; border-radius:999px;
    background:rgba(255,255,255,.8); backdrop-filter:blur(18px) saturate(1.5); -webkit-backdrop-filter:blur(18px) saturate(1.5); border:1px solid var(--border); box-shadow:var(--nv-shadow-lg); }
  .nv-dock button { display:flex; align-items:center; gap:7px; padding:10px 12px; border-radius:999px; font:inherit; font-size:13px; font-weight:500; color:var(--ink-soft); background:none; border:0; cursor:pointer; }
  .nv-dock button span { display:none; }
  .nv-dock button.on { background:linear-gradient(180deg,#27272A,#0A0A0B); color:#fff; box-shadow:0 6px 14px -6px rgba(0,0,0,.6); }
  .nv-dock button.on span { display:inline; }
  .nv-dock svg, .nv-side svg, .nv-sheet svg { width:18px; height:18px; flex-shrink:0; }

  /* hoja "Más" */
  .nv-scrim { position:fixed; inset:0; background:rgba(10,10,11,.35); backdrop-filter:blur(3px); z-index:150; opacity:0; pointer-events:none; transition:opacity .2s; }
  .nv-scrim.on { opacity:1; pointer-events:auto; }
  .nv-sheet { position:fixed; left:0; right:0; bottom:0; z-index:151; background:var(--nv-card); border-radius:24px 24px 0 0; padding:10px 16px calc(20px + env(safe-area-inset-bottom));
    transform:translateY(105%); transition:transform .3s cubic-bezier(.2,.8,.2,1); box-shadow:var(--nv-shadow-lg); max-height:86vh; overflow:auto; }
  .nv-sheet.on { transform:none; }
  .nv-grab { width:36px; height:4px; border-radius:4px; background:var(--border); margin:0 auto 14px; }
  .nv-item { display:flex; align-items:center; gap:12px; width:100%; padding:12px; border-radius:12px; font:inherit; font-size:14px; font-weight:500; color:var(--ink); background:none; border:0; cursor:pointer; text-align:left; }
  .nv-item:hover { background:var(--nv-muted); }
  .nv-item.on { background:var(--forest-light); color:var(--nv-accent-ink); }
  .nv-item .nv-ic { width:34px; height:34px; border-radius:11px; display:grid; place-items:center; background:var(--nv-muted); color:var(--ink-soft); }
  .nv-sep { height:1px; background:var(--border); margin:8px 4px; }

  /* calendario: selector semana/mes */
  .nv-seg { display:inline-flex; padding:3px; border-radius:11px; background:var(--nv-muted); border:1px solid var(--border); margin-top:16px; }
  .nv-seg button { padding:6px 14px; border-radius:8px; font:inherit; font-size:13px; font-weight:500; color:var(--ink-soft); background:none; border:0; cursor:pointer; }
  .nv-seg button.on { background:var(--nv-card); color:var(--ink); box-shadow:0 2px 6px rgba(0,0,0,.08); }

  /* ---------- INICIO ---------- */
  .nv-label { font-size:11px; font-weight:500; letter-spacing:.08em; text-transform:uppercase; color:var(--ink-muted); }
  .nv-tiny { font-size:12px; color:var(--ink-muted); }
  .nv-h1 { font-size:30px; font-weight:600; letter-spacing:-1.1px; line-height:1.1; margin:4px 0 0; }
  .nv-sec { display:flex; align-items:center; justify-content:space-between; margin:26px 0 12px; }
  .nv-sec h2 { font-size:17px; font-weight:600; letter-spacing:-.3px; }
  .nv-more { font:inherit; font-size:13px; font-weight:500; color:var(--ink-soft); background:none; border:0; cursor:pointer; }
  .nv-card { background:var(--nv-card); border:1px solid var(--border); border-radius:18px; box-shadow:var(--shadow); }

  .nv-hero { position:relative; overflow:hidden; isolation:isolate; border-radius:24px; padding:22px; color:#fff; margin-top:16px; background:#0B3B2E; box-shadow:0 20px 40px -16px rgba(6,78,59,.55); }
  .nv-hero::before { content:""; position:absolute; inset:-30%; z-index:-1; filter:blur(40px); opacity:.9; animation:nvDrift 14s ease-in-out infinite alternate;
    background:radial-gradient(35% 45% at 20% 25%,#34D399 0%,transparent 70%),radial-gradient(40% 50% at 85% 20%,#22D3EE 0%,transparent 70%),radial-gradient(45% 55% at 70% 95%,#6366F1 0%,transparent 70%),radial-gradient(40% 50% at 10% 100%,#065F46 0%,transparent 70%); }
  .nv-hero::after { content:""; position:absolute; inset:0; z-index:-1; background:linear-gradient(180deg,rgba(0,0,0,0) 30%,rgba(0,0,0,.25)); }
  @keyframes nvDrift { to { transform:translate(4%,-3%) rotate(6deg); } }
  @media (prefers-reduced-motion:reduce) { .nv-hero::before { animation:none; } }
  .nv-hero .nv-label { color:rgba(255,255,255,.75); }
  .nv-hero-top { display:flex; justify-content:space-between; gap:12px; align-items:flex-start; }
  .nv-hero-date { font-size:30px; font-weight:600; letter-spacing:-1px; line-height:1.08; margin-top:6px; }
  .nv-glass { background:rgba(255,255,255,.16); border:1px solid rgba(255,255,255,.22); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); }
  .nv-count { border-radius:16px; padding:8px 12px; text-align:center; min-width:64px; }
  .nv-count b { display:block; font-size:26px; font-weight:600; letter-spacing:-1px; line-height:1; }
  .nv-count span { font-size:10px; text-transform:uppercase; letter-spacing:.08em; opacity:.85; }
  .nv-pills { display:flex; flex-wrap:wrap; gap:6px; margin-top:14px; }
  .nv-pill { display:inline-flex; align-items:center; gap:6px; padding:5px 11px; border-radius:999px; font-size:12px; font-weight:500; }
  .nv-team-line { display:flex; align-items:center; gap:10px; margin-top:16px; font-size:13px; color:rgba(255,255,255,.88); }
  .nv-team-line .nv-av { box-shadow:0 0 0 2px rgba(11,59,46,.8); }
  .nv-hero-actions { display:flex; gap:8px; margin-top:18px; }

  .nv-btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 16px; border-radius:13px; font:inherit; font-size:14px; font-weight:500; border:0; cursor:pointer; transition:transform .12s; white-space:nowrap; }
  .nv-btn:active { transform:translateY(1px) scale(.99); }
  .nv-btn svg { width:18px; height:18px; flex-shrink:0; }
  .nv-btn-white { background:#fff; color:#0B3B2E; box-shadow:0 6px 16px -6px rgba(0,0,0,.35); }
  .nv-btn-glass { color:#fff; }
  .nv-btn-soft { background:var(--nv-card); color:var(--ink); border:1px solid var(--border); box-shadow:var(--nv-shadow-sm); }
  .nv-btn-wa { background:linear-gradient(180deg,#3BE07A,#1EBE5A); color:#fff; box-shadow:0 8px 18px -8px rgba(30,190,90,.7), inset 0 1px 0 rgba(255,255,255,.3); }
  .nv-grow { flex:1; }

  .nv-shortcuts { display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-top:16px; }
  .nv-sc { display:flex; flex-direction:column; align-items:center; gap:8px; padding:14px 6px; border-radius:18px; background:var(--nv-card); border:1px solid var(--border); box-shadow:var(--nv-shadow-sm);
    font:inherit; font-size:12px; font-weight:500; color:var(--ink-soft); text-align:center; cursor:pointer; transition:transform .15s, box-shadow .2s; }
  .nv-sc:hover { transform:translateY(-2px); box-shadow:var(--shadow); }
  .nv-sc i { width:42px; height:42px; border-radius:14px; display:grid; place-items:center; color:#fff; font-style:normal; }
  .nv-sc i svg { width:20px; height:20px; }
  .nv-g-green { background:linear-gradient(135deg,#6EE7B7,#059669); box-shadow:0 8px 16px -8px rgba(5,150,105,.8); }
  .nv-g-indigo { background:linear-gradient(135deg,#A5B4FC,#4F46E5); box-shadow:0 8px 16px -8px rgba(79,70,229,.8); }
  .nv-g-orange { background:linear-gradient(135deg,#FDBA74,#EA580C); box-shadow:0 8px 16px -8px rgba(234,88,12,.8); }
  .nv-g-pink { background:linear-gradient(135deg,#F9A8D4,#DB2777); box-shadow:0 8px 16px -8px rgba(219,39,119,.8); }
  .nv-g-wa { background:linear-gradient(135deg,#86EFAC,#16A34A); box-shadow:0 8px 16px -8px rgba(22,163,74,.8); }
  .nv-g-ink { background:linear-gradient(135deg,#71717A,#18181B); box-shadow:0 8px 16px -8px rgba(0,0,0,.6); }

  .nv-stats { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
  .nv-stat { padding:14px 16px; text-align:left; font:inherit; color:inherit; cursor:pointer; }
  .nv-stat b { display:block; font-size:26px; font-weight:600; letter-spacing:-1px; line-height:1.1; margin-top:4px; }
  .nv-stat.alert b { color:var(--nv-danger); }

  .nv-svc-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:16px 18px; border-bottom:1px solid var(--border); }
  .nv-svc-head h3 { font-size:18px; font-weight:600; letter-spacing:-.4px; }
  .nv-status { display:inline-flex; align-items:center; gap:6px; font-size:12px; font-weight:500; padding:4px 10px; border-radius:999px; }
  .nv-status::before { content:""; width:6px; height:6px; border-radius:50%; background:currentColor; }
  .nv-status.ok { background:var(--forest-light); color:var(--nv-accent-ink); }
  .nv-status.bad { background:var(--nv-danger-soft); color:var(--nv-danger); }
  .nv-svc-cols { display:grid; grid-template-columns:1fr; }
  .nv-svc-col { padding:6px 0; }
  .nv-svc-col + .nv-svc-col { border-top:1px solid var(--border); }
  .nv-col-h { display:flex; align-items:center; justify-content:space-between; padding:12px 18px 4px; }
  .nv-row { display:grid; grid-template-columns:minmax(84px,120px) 1fr auto; align-items:center; gap:12px; padding:9px 18px; }
  .nv-row .r { font-size:12px; color:var(--ink-muted); }
  .nv-row .w { display:flex; align-items:center; gap:10px; font-weight:500; min-width:0; }
  .nv-row .w span { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .nv-row.me { background:linear-gradient(90deg,var(--forest-light),transparent); }
  .nv-row.out .w span { text-decoration:line-through; color:var(--ink-muted); }
  .nv-tag { font-size:11px; font-weight:500; padding:3px 8px; border-radius:999px; white-space:nowrap; }
  .nv-tag.bad { background:var(--nv-danger-soft); color:var(--nv-danger); }
  .nv-tag.warn { background:var(--nv-warn-soft); color:var(--nv-warn); }
  .nv-tag.ok { background:var(--forest-light); color:var(--nv-accent-ink); }
  .nv-track { display:flex; align-items:flex-start; gap:12px; padding:9px 18px; }
  .nv-track .n { color:var(--ink-muted); font-size:12px; width:20px; font-family:'Geist Mono',monospace; padding-top:2px; }
  .nv-track .t { flex:1; font-weight:500; word-break:break-word; white-space:pre-wrap; }
  .nv-track .t.note { font-weight:400; color:var(--ink-soft); }
  .nv-track .t a { color:var(--nv-pm); }
  .nv-track .k { font-size:12px; padding:2px 8px; border-radius:6px; background:var(--nv-muted); color:var(--ink-soft); font-family:'Geist Mono',monospace; }
  .nv-svc-foot { display:flex; gap:8px; padding:14px 18px; border-top:1px solid var(--border); }

  .nv-list { overflow:hidden; }
  .nv-li { display:flex; align-items:center; gap:14px; padding:13px 16px; width:100%; text-align:left; font:inherit; color:inherit; background:none; border:0; }
  .nv-li + .nv-li { border-top:1px solid var(--border); }
  button.nv-li { cursor:pointer; } button.nv-li:hover { background:var(--nv-muted); }
  .nv-cal { width:46px; height:50px; flex-shrink:0; border-radius:13px; background:var(--nv-muted); display:flex; flex-direction:column; align-items:center; justify-content:center; }
  .nv-cal .m { font-size:10px; text-transform:uppercase; letter-spacing:.08em; color:var(--nv-danger); font-weight:600; }
  .nv-cal .d { font-size:20px; font-weight:600; letter-spacing:-.6px; line-height:1; }
  .nv-li.mine .nv-cal { background:linear-gradient(135deg,#34D399,#059669); color:#fff; box-shadow:0 8px 16px -8px rgba(5,150,105,.8); }
  .nv-li.mine .nv-cal .m { color:rgba(255,255,255,.85); }
  .nv-li .main { flex:1; min-width:0; }
  .nv-li .main b { font-weight:600; font-size:14px; }
  .nv-chip-btn { font:inherit; font-size:13px; font-weight:500; padding:7px 12px; border-radius:10px; background:var(--nv-card); border:1px solid var(--border); box-shadow:var(--nv-shadow-sm); cursor:pointer; color:var(--ink); white-space:nowrap; }
  .nv-empty { padding:16px; color:var(--ink-muted); font-size:13px; }

  @media (min-width:640px) {
    .nv-shortcuts { grid-template-columns:repeat(6,1fr); }
    .nv-stats { grid-template-columns:repeat(4,1fr); }
    .nv-svc-cols { grid-template-columns:1fr 1fr; }
    .nv-svc-col + .nv-svc-col { border-top:0; border-left:1px solid var(--border); }
    .nv-hero { padding:28px; }
    .nv-hero-date { font-size:38px; }
    .nv-h1 { font-size:36px; }
  }
  @media (min-width:1024px) {
    body { padding-bottom:40px; }
    .nv-dock { display:none; }
    .nv-shell { display:grid; grid-template-columns:232px minmax(0,1fr); gap:32px; padding:0 28px; }
    .nv-topbar { justify-content:flex-end; }
    .nv-topbar .nv-brand { display:none; }
    .nv-side { display:flex; flex-direction:column; gap:4px; position:sticky; top:0; height:100vh; padding:20px 0; overflow:auto; }
    .nv-side .nv-brand { margin-bottom:22px; padding:0 10px; }
    .nv-side .nv-item { padding:10px 12px; }
    .nv-side .nv-item.on { background:var(--nv-card); color:var(--ink); box-shadow:var(--nv-shadow-sm); border:1px solid var(--border); }
    .nv-side .nv-item .nv-ic { width:auto; height:auto; background:none; }
    .nv-side-card { margin-top:auto; padding:16px; border-radius:18px; color:#fff; position:relative; overflow:hidden; isolation:isolate; background:#0B3B2E; }
    .nv-side-card::before { content:""; position:absolute; inset:-40%; z-index:-1; filter:blur(30px); background:radial-gradient(40% 50% at 20% 20%,#34D399,transparent 70%),radial-gradient(40% 50% at 90% 80%,#6366F1,transparent 70%); }
    .nv-side-card .nv-label { color:rgba(255,255,255,.75); }
    .nv-home { display:grid; grid-template-columns:minmax(0,1fr) 340px; gap:28px; align-items:start; }
    .nv-aside { position:sticky; top:20px; }
    .nv-sheet { left:50%; right:auto; bottom:50%; width:420px; border-radius:24px; transform:translate(-50%,60%); opacity:0; pointer-events:none; transition:transform .25s, opacity .2s; }
    .nv-sheet.on { transform:translate(-50%,50%); opacity:1; pointer-events:auto; }
    .nv-grab { display:none; }
  }
"""
R('</style>', CSS + '</style>')

# ---------------------------------------------------------------- BODY: shell
m = re.search(r'<header class="header">.*?</header>\n', s, re.S)
assert m
BRAND = ('<div class="nv-brand"><div class="nv-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">'
         '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></div>'
         '<div>Alabanza<small>Templo Alabanza Panajachel</small></div></div>')
s = s[:m.start()] + f'''<div class="nv-shell">
<aside class="nv-side" id="nv-side"></aside>
<div class="nv-main">
<div class="nv-topbar">
  {BRAND}
  <button class="nv-me" id="nv-me" onclick="nvOpenMore()"></button>
  <select class="my-select" id="my-volunteer" onchange="setMyVolunteer(this.value)" style="display:none"><option value="">Todos</option></select>
</div>
''' + s[m.end():]

R('''  <!-- ==================== SEMANAL ==================== -->
  <div class="view-panel active" id="view-semanal">''',
  '''  <!-- ==================== INICIO (nuevo) ==================== -->
  <div class="view-panel active" id="view-inicio"><div id="nv-inicio"></div></div>

  <!-- ==================== SEMANAL ==================== -->
  <div class="view-panel" id="view-semanal">
    <div class="nv-seg" data-calseg><button data-cal="semanal" onclick="switchView('semanal')">Semana</button><button data-cal="mensual" onclick="switchView('mensual')">Mes</button></div>''')
R('''  <div class="view-panel" id="view-mensual">''',
  '''  <div class="view-panel" id="view-mensual">
    <div class="nv-seg" data-calseg><button data-cal="semanal" onclick="switchView('semanal')">Semana</button><button data-cal="mensual" onclick="switchView('mensual')">Mes</button></div>''')
R('\n</div>\n\n<!-- ASSIGN SHIFT MODAL -->',
  '''
</div>
</div>
</div>

<nav class="nv-dock" id="nv-dock"></nav>
<div class="nv-scrim" id="nv-scrim" onclick="nvCloseMore()"></div>
<div class="nv-sheet" id="nv-sheet"><div class="nv-grab"></div><div id="nv-sheet-body"></div></div>

<!-- ASSIGN SHIFT MODAL -->''')

# ---------------------------------------------------------------- JS
R("  view: 'semanal',", "  view: 'inicio',")

R('''function switchView(v) {
  state.view = v;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => {
    if (b.textContent.toLowerCase() === v) b.classList.add('active');
  });
  document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('view-' + v).classList.add('active');
  render();
}''', '''function switchView(v) {
  state.view = v;
  document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('view-' + v).classList.add('active');
  render();
}''')

R('''function render() {
  if (state.view === 'semanal') {''', '''function render() {
  renderShell();
  if (state.view === 'inicio') {
    renderInicio();
  } else if (state.view === 'semanal') {''')

R('''  state.view = 'semanal';
  state.weekStart = getMonday(d);
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => {
    if (b.textContent.toLowerCase() === 'semanal') b.classList.add('active');
  });
  document.querySelectorAll('.view-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('view-semanal').classList.add('active');
  render();''', '''  state.weekStart = getMonday(d);
  switchView('semanal');''')

R('''function updateAdminBadge() {
  document.getElementById('admin-badge').style.display = state.isAdmin ? 'flex' : 'none';
}''', '''function updateAdminBadge() {
  document.getElementById('admin-badge').style.display = state.isAdmin ? 'flex' : 'none';
  if (typeof renderShell === 'function') renderShell();
}''')

# links compartidos apuntan a la raíz (index decide qué diseño mostrar)
R("const baseUrl = window.location.origin + window.location.pathname;",
  "const baseUrl = window.location.origin + window.location.pathname.replace(/nuevo\\.html$/, '');")

NEWJS = open(sys.argv[3], encoding='utf-8').read()
R('\ninit();\n</script>', '\n' + NEWJS + '\ninit();\n</script>')

open(dst, 'w', encoding='utf-8').write(s)
print('ok', len(s))
