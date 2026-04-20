// ============================================================
//  Google Apps Script — Turnos Templo Alabanza Panamá
//
//  HOJAS REQUERIDAS EN EL SHEET:
//
//  1. "Colaboradores":  id | nombre | roles | color
//  2. "Turnos":         id | fecha | turno | colaboradorId | rol | notas
//  3. "Ausencias":      id | fecha | colaboradorId | turno | motivo | fechaReporte | estado
//                       (estado: "Pendiente", "Aprobada" o "Rechazada" — se cambia manualmente en el Sheet)
//
//  INSTRUCCIONES:
//  1. Abre tu Google Sheet
//  2. Crea la hoja "Ausencias" con las columnas de arriba
//  3. Ve a Extensiones > Apps Script
//  4. Reemplaza el código con este
//  5. Implementar > Nueva implementación > Aplicación web
//  6. Ejecutar como: "Yo" | Acceso: "Cualquier persona"
//  7. Copia la nueva URL y actualízala en index.html
// ============================================================
//  CONFIGURACIÓN DE NOTIFICACIONES
// ============================================================
var ADMIN_EMAIL = "kevin.rodrigo.mayen@gmail.com";
// Agrega más correos separados por coma: "admin1@mail.com,admin2@mail.com"
// ============================================================

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // --- Colaboradores ---
  var colabSheet = ss.getSheetByName('Colaboradores');
  var colabData = colabSheet.getDataRange().getValues();
  var colaboradores = [];
  for (var i = 1; i < colabData.length; i++) {
    var row = colabData[i];
    if (!row[0]) continue;
    colaboradores.push({
      id:     String(row[0]),
      nombre: row[1],
      roles:  row[2] || '',
      color:  row[3] || '#64748B',
    });
  }

  // --- Turnos ---
  var turnosSheet = ss.getSheetByName('Turnos');
  var turnosData = turnosSheet.getDataRange().getValues();
  var turnos = [];
  for (var i = 1; i < turnosData.length; i++) {
    var row = turnosData[i];
    if (!row[0]) continue;
    turnos.push({
      id:             String(row[0]),
      fecha:          formatDate(row[1]),
      turno:          (row[2] || 'AM').toString().toUpperCase(),
      colaboradorId:  String(row[3]),
      rol:            row[4] || '',
      notas:          row[5] || '',
    });
  }

  // --- Ausencias ---
  var ausencias = [];
  var ausSheet = ss.getSheetByName('Ausencias');
  if (ausSheet) {
    var ausData = ausSheet.getDataRange().getValues();
    for (var i = 1; i < ausData.length; i++) {
      var row = ausData[i];
      if (!row[0]) continue;
      ausencias.push({
        id:             String(row[0]),
        fecha:          formatDate(row[1]),
        colaboradorId:  String(row[2]),
        turno:          row[3] || 'Ambos',
        motivo:         row[4] || '',
        estado:         row[6] || 'Pendiente',
      });
    }
  }

  var output = JSON.stringify({ colaboradores: colaboradores, turnos: turnos, ausencias: ausencias });
  return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (data.action === 'addTurno') {
    var sheet = ss.getSheetByName('Turnos');
    var newId = sheet.getLastRow();
    sheet.appendRow([
      newId,
      data.fecha,
      data.turno || 'AM',
      data.colaboradorId,
      data.rol || '',
      data.notas || ''
    ]);
    return ContentService.createTextOutput(
      JSON.stringify({ success: true, id: newId })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  if (data.action === 'addAusencia') {
    var sheet = ss.getSheetByName('Ausencias');
    if (!sheet) {
      sheet = ss.insertSheet('Ausencias');
      sheet.appendRow(['id', 'fecha', 'colaboradorId', 'turno', 'motivo', 'fechaReporte', 'estado']);
    }
    var newId = sheet.getLastRow();
    var now = new Date();
    var fechaReporte = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0');
    sheet.appendRow([
      newId,
      data.fecha,
      data.colaboradorId,
      data.turno || 'Ambos',
      data.motivo || '',
      fechaReporte,
      'Pendiente'
    ]);

    // --- Notificación por email ---
    try {
      var nombreVoluntario = data.colaboradorId;
      var colabSheet = ss.getSheetByName('Colaboradores');
      if (colabSheet) {
        var colabData = colabSheet.getDataRange().getValues();
        for (var j = 1; j < colabData.length; j++) {
          if (String(colabData[j][0]) === String(data.colaboradorId)) {
            nombreVoluntario = colabData[j][1];
            break;
          }
        }
      }

      var asunto = 'Nueva ausencia reportada — ' + nombreVoluntario;
      var cuerpo = 'Se ha reportado una nueva ausencia:\n\n'
        + 'Voluntario: ' + nombreVoluntario + '\n'
        + 'Fecha del servicio: ' + data.fecha + '\n'
        + 'Turno: ' + (data.turno || 'Ambos') + '\n'
        + 'Motivo: ' + (data.motivo || 'No especificado') + '\n'
        + 'Fecha de reporte: ' + fechaReporte + '\n'
        + 'Estado: Pendiente\n\n'
        + 'Para aprobar o rechazar, abre el Google Sheet en la hoja "Ausencias" y cambia la columna "estado".\n'
        + ss.getUrl();

      MailApp.sendEmail(ADMIN_EMAIL, asunto, cuerpo);
    } catch (emailErr) {
      // No bloquear si falla el envío de email
    }

    return ContentService.createTextOutput(
      JSON.stringify({ success: true, id: newId })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(
    JSON.stringify({ error: 'Acción no reconocida' })
  ).setMimeType(ContentService.MimeType.JSON);
}

function formatDate(value) {
  // instanceof Date puede fallar en Apps Script V8, usamos getTime como check
  if (value && typeof value.getTime === 'function') {
    // Usar Utilities.formatDate con la zona horaria del spreadsheet
    // para evitar desfases de +/- 1 día
    var tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
    return Utilities.formatDate(value, tz, 'yyyy-MM-dd');
  }
  return String(value);
}
