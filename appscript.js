// ============================================================
//  Google Apps Script — Turnos Templo Alabanza Panamá
//
//  INSTRUCCIONES:
//  1. Abre tu Google Sheet
//  2. Ve a Extensiones > Apps Script
//  3. Borra el contenido y pega este código
//  4. Haz clic en "Implementar" > "Nueva implementación"
//  5. Tipo: "Aplicación web"
//  6. Ejecutar como: "Yo"
//  7. Quién tiene acceso: "Cualquier persona"
//  8. Copia la URL generada y pégala en API_URL del index.html
//
//  ESTRUCTURA DEL SHEET:
//
//  Hoja "Colaboradores":
//  | id | nombre          | roles              | color   |
//  | 1  | Rodrigo Mayén   | Guitarra, Cantante | #16A34A |
//  | 2  | Sam Castro      | Guitarra           | #ff0000 |
//
//  Hoja "Turnos":
//  | id | fecha      | turno | colaboradorId | rol               | notas            |
//  | 1  | 2026-04-21 | AM    | 1             | Cantante          |                  |
//  | 2  | 2026-04-21 | PM    | 1             | Guitarra, Cantante| Servicio especial|
// ============================================================

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // --- Colaboradores ---
  const colabSheet = ss.getSheetByName('Colaboradores');
  const colabData = colabSheet.getDataRange().getValues();
  const colaboradores = colabData.slice(1).filter(row => row[0]).map(row => ({
    id:     String(row[0]),
    nombre: row[1],
    roles:  row[2] || '',
    color:  row[3] || '#64748B',
  }));

  // --- Turnos ---
  const turnosSheet = ss.getSheetByName('Turnos');
  const turnosData = turnosSheet.getDataRange().getValues();
  const turnos = turnosData.slice(1).filter(row => row[0]).map(row => ({
    id:             String(row[0]),
    fecha:          formatDate(row[1]),
    turno:          (row[2] || 'AM').toString().toUpperCase(),
    colaboradorId:  String(row[3]),
    rol:            row[4] || '',
    notas:          row[5] || '',
  }));

  const output = JSON.stringify({ colaboradores, turnos });
  return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  if (data.action === 'addTurno') {
    const sheet = ss.getSheetByName('Turnos');
    const lastRow = sheet.getLastRow();
    const newId = lastRow;
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

  return ContentService.createTextOutput(
    JSON.stringify({ error: 'Acción no reconocida' })
  ).setMimeType(ContentService.MimeType.JSON);
}

function formatDate(value) {
  if (value instanceof Date) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }
  return String(value);
}
