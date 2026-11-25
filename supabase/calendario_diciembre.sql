-- =====================================================================
--  Calendario diciembre 2026 — Templo Alabanza Panajachel
--  Pegar completo en Supabase → SQL Editor → Run.
--  Es idempotente: borra los turnos de diciembre antes de insertar.
--
--  Cambios:
--   * Angely (10) sale temporalmente → Yonatan (3) cubre sus turnos.
--   * Jairo (12) activo solo en ensayos y domingo 20.
--   * Ensayos 7:00pm: viernes 4 dic, miércoles 9 y 16 dic (tipo 'PM').
--   * Domingo 20 dic: solo AM (servicio especial Navideño).
--   * Domingos 6 y 13 dic: rotación normal con Daniel de vuelta, sin Angely.
-- =====================================================================

-- 1) Angely deja su turno del 29 nov (PM Percusión) → lo toma Yonatan
update public.turnos
   set colaborador_id = 3
 where fecha = '2026-11-29' and turno = 'PM' and rol = 'Percusión' and colaborador_id = 10;

-- 2) Limpiar diciembre (por si se corre dos veces)
delete from public.turnos where fecha between '2026-12-01' and '2026-12-31';
delete from public.ausencias
 where fecha between '2026-12-01' and '2026-12-31' and colaborador_id = 10;

-- 3) Turnos de diciembre
insert into public.turnos (fecha, turno, colaborador_id, rol, notas) values
-- ===== Ensayos (turno 'PM', 7:00 pm) =====
-- Viernes 4 dic
('2026-12-04','PM',5,'Voz Lead','Ensayo 7:00 pm'),
('2026-12-04','PM',2,'Voz de Apoyo','Ensayo 7:00 pm'),
('2026-12-04','PM',7,'Guitarra','Ensayo 7:00 pm'),
('2026-12-04','PM',4,'Bajo','Ensayo 7:00 pm'),
('2026-12-04','PM',3,'Percusión','Ensayo 7:00 pm'),
('2026-12-04','PM',12,'Percusión','Ensayo 7:00 pm'),
-- Miércoles 9 dic
('2026-12-09','PM',5,'Voz Lead','Ensayo 7:00 pm'),
('2026-12-09','PM',2,'Voz de Apoyo','Ensayo 7:00 pm'),
('2026-12-09','PM',7,'Guitarra','Ensayo 7:00 pm'),
('2026-12-09','PM',4,'Bajo','Ensayo 7:00 pm'),
('2026-12-09','PM',3,'Percusión','Ensayo 7:00 pm'),
('2026-12-09','PM',12,'Percusión','Ensayo 7:00 pm'),
-- Miércoles 16 dic
('2026-12-16','PM',5,'Voz Lead','Ensayo 7:00 pm'),
('2026-12-16','PM',2,'Voz de Apoyo','Ensayo 7:00 pm'),
('2026-12-16','PM',7,'Guitarra','Ensayo 7:00 pm'),
('2026-12-16','PM',4,'Bajo','Ensayo 7:00 pm'),
('2026-12-16','PM',3,'Percusión','Ensayo 7:00 pm'),
('2026-12-16','PM',12,'Percusión','Ensayo 7:00 pm'),

-- ===== Domingo 6 dic (semana par — Herdy PM) =====
('2026-12-06','AM',1,'Voz Bilingüe, Guitarra',''),
('2026-12-06','AM',2,'Voz de Apoyo',''),
('2026-12-06','AM',8,'Bajo',''),
('2026-12-06','AM',3,'Percusión',''),
('2026-12-06','PM',5,'Voz Lead',''),
('2026-12-06','PM',6,'Voz de Apoyo',''),
('2026-12-06','PM',7,'Guitarra',''),
('2026-12-06','PM',8,'Bajo',''),
('2026-12-06','PM',3,'Percusión',''),

-- ===== Domingo 13 dic (semana impar — Raquel PM) =====
('2026-12-13','AM',1,'Voz Bilingüe, Guitarra',''),
('2026-12-13','AM',5,'Voz de Apoyo',''),
('2026-12-13','AM',4,'Bajo',''),
('2026-12-13','AM',3,'Percusión',''),
('2026-12-13','PM',9,'Voz Lead',''),
('2026-12-13','PM',2,'Voz de Apoyo',''),
('2026-12-13','PM',8,'Guitarra',''),
('2026-12-13','PM',4,'Bajo',''),
('2026-12-13','PM',3,'Percusión',''),

-- ===== Domingo 20 dic — solo AM, especial Navideño =====
('2026-12-20','AM',5,'Voz Lead','Especial Navideño'),
('2026-12-20','AM',2,'Voz de Apoyo','Especial Navideño'),
('2026-12-20','AM',7,'Guitarra','Especial Navideño'),
('2026-12-20','AM',4,'Bajo','Especial Navideño'),
('2026-12-20','AM',3,'Percusión','Especial Navideño'),
('2026-12-20','AM',12,'Percusión','Especial Navideño');

-- 4) Marcar ausencia temporal de Angely (para que se vea en la app)
insert into public.ausencias (fecha, colaborador_id, turno, motivo, estado) values
('2026-11-29',10,'Ambos','Indisponible temporalmente','Aprobada'),
('2026-12-06',10,'Ambos','Indisponible temporalmente','Aprobada'),
('2026-12-13',10,'Ambos','Indisponible temporalmente','Aprobada'),
('2026-12-20',10,'Ambos','Indisponible temporalmente','Aprobada');
