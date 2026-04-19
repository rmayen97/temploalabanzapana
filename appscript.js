// ============================================================
//  Google Apps Script — Turnos Templo Alabanza Panamá
//
//  HOJAS REQUERIDAS EN EL SHEET:
//
//  1. "Colaboradores":  id | nombre | roles | color
//  2. "Turnos":         id | fecha | turno | colaboradorId | rol | notas
//  3. "Ausencias":      id | fecha | colaboradorId | turno | motivo | fechaReporte
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
      sheet.appendRow(['id', 'fecha', 'colaboradorId', 'turno', 'motivo', 'fechaReporte']);
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
      fechaReporte
    ]);
    return ContentService.createTextOutput(
      JSON.stringify({ success: true, id: newId })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(
    JSON.stringify({ error: 'Acción no reconocida' })
  ).setMimeType(ContentService.MimeType.JSON);
}

function formatDate(value) {
  if (value instanceof Date) {
    var y = value.getFullYear();
    var m = String(value.getMonth() + 1).padStart(2, '0');
    var d = String(value.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }
  return String(value);
}
