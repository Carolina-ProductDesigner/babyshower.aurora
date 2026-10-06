/* ==========================================================================
   CONFIGURACIÓN — lo único que necesitas editar
   ========================================================================== */

const CONFIG = {
  // Links (OPCIONALES). Si los dejas vacíos, el sitio usa los links que escribas
  // directamente en index.html (href de cada botón). Si los llenas aquí, estos ganan.
  mapsUrl: '',
  regalos: [
    { texto: '', url: '' },   // 1.er botón de mesa de regalos (Liverpool)
    { texto: '', url: 'https://www.amazon.com.mx/baby-reg/mnica-delgado-ascan-delavega-febrero-2027-aguascalientes/3MLVY9ST8KHM9?ref_=cm_sw_r_apann_dp_2YHXGQBY3YBBX4RMVTQD&language=en-US' }    // 2.º botón de mesa de regalos (Amazon)
  ],

  // URL de la app web de Google Apps Script (ver apps-script/Code.gs y README).
  // Si lo dejas vacío, el sitio entra en MODO PRUEBA (el formulario funciona pero no guarda nada).
  scriptUrl: 'https://script.google.com/macros/s/AKfycby_sCiQ6tC8hMnCqdAUcjhbknwrZJUujokwWugbkg4RzyTt5XxhtXQcWNw_lAIHno2o/exec'
};

/* ========================================================================== */

const $ = (id) => document.getElementById(id);
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --------------------------------------------------------------------------
   Ancho de la barra de scroll
   La escala del sitio (--u) se calcula con 100vw, que en escritorio incluye la
   barra de scroll. Aquí se descuenta para que nada se recorte por la derecha.
   -------------------------------------------------------------------------- */

function medirBarra() {
  const ancho = window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.setProperty('--sbw', ancho + 'px');
}

medirBarra();
window.addEventListener('resize', medirBarra);

/* --------------------------------------------------------------------------
   Botones (mapa y mesas de regalos)
   -------------------------------------------------------------------------- */

// Solo se sobrescribe lo que esté lleno en CONFIG; si no, queda lo de index.html
if (CONFIG.mapsUrl) $('mapsLink').href = CONFIG.mapsUrl;

CONFIG.regalos.forEach((regalo, i) => {
  const boton = $('gift' + (i + 1));
  if (!boton) return;
  if (regalo.texto) boton.textContent = regalo.texto;
  if (regalo.url) boton.href = regalo.url;
  boton.setAttribute('aria-label', 'Mesa de regalos en ' + boton.textContent);
});

/* --------------------------------------------------------------------------
   Confirmación de asistencia → Google Sheets
   -------------------------------------------------------------------------- */

const form = $('rsvp');
const estado = $('rsvpStatus');
const boton = $('enviar');

function mostrar(texto, error) {
  estado.textContent = texto;
  estado.classList.toggle('is-error', !!error);
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (form.web.value) return;                    // trampa anti-spam: los humanos no lo ven
  const datos = {
    asistencia: form.asistencia.value,
    nombre: form.nombre.value.trim(),
    mensaje: form.mensaje.value.trim()
  };
  boton.disabled = true;
  mostrar('Enviando…');
  try {
    if (CONFIG.scriptUrl) {
      const r = await fetch(CONFIG.scriptUrl, { method: 'POST', body: JSON.stringify(datos) });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || 'el script no guardó la respuesta');
    } else {
      console.warn('Modo prueba: falta scriptUrl, no se guardó nada.');
    }
    mostrarGracias(datos.asistencia === 'Sí'
      ? 'Gracias por confirmar, ¡nos vemos pronto!'
      : 'Gracias por confirmar, ¡te veré en otra ocasión!');
  } catch (err) {
    console.error('Error al enviar la confirmación:', err);
    mostrar('No se pudo enviar. Intenta de nuevo, por favor.', true);
    boton.disabled = false;
  }
});

// El mensaje de gracias reemplaza al título y al cuestionario
function mostrarGracias(texto) {
  const gracias = $('rsvpThanks');
  $('rsvpThanksText').textContent = texto;
  form.hidden = true;
  $('rsvpTitle').hidden = true;
  mostrar('');
  gracias.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    gracias.classList.add('is-in');
    gracias.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
    window.dispatchEvent(new Event('resize'));   // la página cambió de alto: recalcula el parallax
  }));
}

/* --------------------------------------------------------------------------
   Aparición / desaparición al hacer scroll
   -------------------------------------------------------------------------- */

const elementos = document.querySelectorAll('.fade');

if (reduce || !('IntersectionObserver' in window)) {
  elementos.forEach((el) => el.classList.add('is-in'));
} else {
  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        entrada.target.classList.toggle('is-in', entrada.isIntersecting);
      });
    },
    { threshold: 0, rootMargin: '-6% 0px -6% 0px' }
  );

  elementos.forEach((el) => observador.observe(el));
}

/* --------------------------------------------------------------------------
   Parallax de las ilustraciones (escritorio y móvil)
   Cada ilustración se desplaza a distinta velocidad que la página (data-speed:
   más alto = más movimiento). Queda exactamente en su posición de diseño cuando
   está centrada en pantalla; las de los extremos, al inicio o al final de la página.
   -------------------------------------------------------------------------- */

const capas = Array.from(document.querySelectorAll('.deco .p'));

if (!reduce && capas.length) {
  let ticking = false;

  function medir() {
    const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
    capas.forEach((capa) => {
      capa.style.transform = '';
      const caja = capa.getBoundingClientRect();
      const centro = caja.top + window.scrollY + caja.height / 2;
      capa._factor = parseFloat(capa.dataset.speed) || 0;
      // scroll en el que la capa está centrada (limitado al inicio/final de la página)
      capa._y0 = Math.min(Math.max(centro - window.innerHeight / 2, 0), maxScroll);
    });
    pintar();
  }

  function pintar() {
    const y = window.scrollY;
    capas.forEach((capa) => {
      if (capa.offsetWidth === 0) return; // oculta por media query
      capa.style.transform = `translate3d(0, ${((y - capa._y0) * capa._factor).toFixed(2)}px, 0)`;
    });
    ticking = false;
  }

  function alHacerScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(pintar);
  }

  window.addEventListener('scroll', alHacerScroll, { passive: true });
  window.addEventListener('resize', medir);
  window.addEventListener('load', medir);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(medir);
  medir();
}
