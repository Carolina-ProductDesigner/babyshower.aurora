/**
 * Confirmaciones — Baby Shower Aurora
 * Pega este código en Extensiones → Apps Script de una hoja de Google Sheets.
 * Cada confirmación se agrega como una fila nueva en la pestaña "Respuestas"
 * (la crea sola si no existe): fecha | asistencia | nombre | mensaje
 * La lista se acomoda sola en orden alfabético (A–Z) por nombre.
 *
 * Si algo no llega: elige la función "probar" arriba y pulsa Ejecutar
 * (la primera vez pide permisos). Debe aparecer una fila de prueba en la hoja.
 */

const HOJA = 'Respuestas';

function doPost(e) {
  try {
    const d = leerDatos(e);
    if (d.asistencia !== 'Sí' && d.asistencia !== 'No') return salida({ ok: false, error: 'asistencia no válida' });
    guardar(d.asistencia, d.nombre, d.mensaje);
    return salida({ ok: true });
  } catch (err) {
    return salida({ ok: false, error: String(err) });
  }
}

// Acepta el JSON que manda el sitio (o, por si acaso, un formulario normal)
function leerDatos(e) {
  try { return JSON.parse(e.postData.contents); } catch (err) { return (e && e.parameter) || {}; }
}

function guardar(asistencia, nombre, mensaje) {
  // Evita que un texto que empieza con = + - @ se interprete como fórmula
  const limpiar = (t, max) => String(t || '').trim().slice(0, max).replace(/^([=+\-@])/, "'$1");

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const h = obtenerHoja();
    h.appendRow([new Date(), asistencia, limpiar(nombre, 100), limpiar(mensaje, 500)]);
    ordenar(h);
  } finally {
    lock.releaseLock();
  }
}

// Usa la hoja donde pegaste el script. Si el script se creó suelto (sin una hoja),
// crea una hoja nueva "Confirmaciones Baby Shower Aurora" en tu Drive y la reutiliza.
function obtenerHoja() {
  let ss = SpreadsheetApp.getActive();
  if (!ss) {
    const props = PropertiesService.getScriptProperties();
    const id = props.getProperty('SS_ID');
    ss = id ? SpreadsheetApp.openById(id) : null;
    if (!ss) {
      ss = SpreadsheetApp.create('Confirmaciones Baby Shower Aurora');
      props.setProperty('SS_ID', ss.getId());
    }
  }
  let h = ss.getSheetByName(HOJA);
  if (!h) {
    const hojas = ss.getSheets();
    h = (hojas.length === 1 && hojas[0].getLastRow() === 0) ? hojas[0].setName(HOJA) : ss.insertSheet(HOJA);
    h.appendRow(['fecha', 'asistencia', 'nombre', 'mensaje']);
    h.setFrozenRows(1);
  }
  return h;
}

// Ordena las respuestas A–Z por la columna "nombre" (sin distinguir mayúsculas)
function ordenar(h) {
  const n = h.getLastRow() - 1;
  if (n > 1) h.getRange(2, 1, n, 4).sort({ column: 3, ascending: true });
}

// Para reordenar a mano: elige "ordenarAhora" y pulsa Ejecutar
function ordenarAhora() { ordenar(obtenerHoja()); }

// Prueba desde el editor (también sirve para dar los permisos la primera vez)
function probar() { guardar('Sí', 'Prueba (puedes borrar esta fila)', 'Mensaje de prueba'); }

// Para comprobar en el navegador: abre la URL /exec y debe decir {"ok":true,...}
function doGet() {
  return salida({ ok: true, mensaje: 'Listo para recibir confirmaciones', conectada: !!SpreadsheetApp.getActive() });
}

function salida(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
