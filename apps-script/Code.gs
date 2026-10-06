/**
 * Confirmaciones — Baby Shower Aurora
 * Pega este código en Extensiones → Apps Script de una hoja de Google Sheets.
 * Cada confirmación se agrega como una fila nueva en la pestaña "Respuestas"
 * (la crea sola si no existe): fecha | asistencia | nombre | mensaje
 * La lista se acomoda sola en orden alfabético (A–Z) por nombre cada vez que llega una respuesta.
 */

const HOJA = 'Respuestas';

function doPost(e) {
  let d;
  try { d = JSON.parse(e.postData.contents); } catch (err) { return salida({ ok: false }); }
  if (d.asistencia !== 'Sí' && d.asistencia !== 'No') return salida({ ok: false });

  // Evita que un texto que empieza con = + - @ se interprete como fórmula
  const limpiar = (t, max) => String(t || '').trim().slice(0, max).replace(/^([=+\-@])/, "'$1");

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.getActive();
    let h = ss.getSheetByName(HOJA);
    if (!h) {
      h = ss.insertSheet(HOJA);
      h.appendRow(['fecha', 'asistencia', 'nombre', 'mensaje']);
      h.setFrozenRows(1);
    }
    h.appendRow([new Date(), d.asistencia, limpiar(d.nombre, 100), limpiar(d.mensaje, 500)]);
    ordenar(h);
    return salida({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

// Ordena las respuestas A–Z por la columna "nombre" (sin distinguir mayúsculas)
function ordenar(h) {
  const n = h.getLastRow() - 1;
  if (n > 1) h.getRange(2, 1, n, 4).sort({ column: 3, ascending: true });
}

// Por si quieres reordenar a mano: Apps Script → elegir "ordenarAhora" → Ejecutar
function ordenarAhora() {
  const h = SpreadsheetApp.getActive().getSheetByName(HOJA);
  if (h) ordenar(h);
}

// Para comprobar en el navegador que la implementación está activa
function doGet() { return salida({ ok: true, mensaje: 'Listo para recibir confirmaciones' }); }

function salida(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
