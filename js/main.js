/* ==========================================================================
   CONFIGURACIÓN — lo único que necesitas editar
   ========================================================================== */

const CONFIG = {
  // Fecha estimada de nacimiento.
  // Formato: AAAA-MM-DDTHH:MM:SS-06:00  (-06:00 = hora del centro de México)
  fecha: '2027-02-10T00:00:00-06:00',

  // Mesas de regalos (texto del botón y su liga)
  regalos: [
    { texto: 'Liverpool', url: 'https://mesaderegalos.liverpool.com.mx/' },
    { texto: 'Amazon',    url: 'https://www.amazon.com.mx/baby-reg/homepage' }
  ],

  // Textos de la cuenta regresiva
  textoEspera: 'Nazco aproximadamente en:',
  textoLlegada: '¡Ya estoy aquí!'
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
   Cuenta regresiva
   -------------------------------------------------------------------------- */

const objetivo = new Date(CONFIG.fecha);

const nodos = {
  dias: $('days'),
  horas: $('hours'),
  minutos: $('minutes'),
  lead: $('lead'),
  sr: $('srCount')
};

CONFIG.regalos.forEach((regalo, i) => {
  const boton = $('gift' + (i + 1));
  if (!boton) return;
  boton.textContent = regalo.texto;
  boton.href = regalo.url;
  boton.setAttribute('aria-label', 'Mesa de regalos en ' + regalo.texto);
});

const dosDigitos = (n) => String(n).padStart(2, '0');
let ultimoResumen = '';

function actualizarCuenta() {
  const restante = objetivo - new Date();

  if (restante <= 0) {
    nodos.dias.textContent = '0';
    nodos.horas.textContent = '00';
    nodos.minutos.textContent = '00';
    nodos.lead.textContent = CONFIG.textoLlegada;
    nodos.sr.textContent = CONFIG.textoLlegada;
    clearInterval(intervalo);
    return;
  }

  const segundos = Math.floor(restante / 1000);
  const dias = Math.floor(segundos / 86400);
  const horas = Math.floor(segundos / 3600) % 24;
  const minutos = Math.floor(segundos / 60) % 60;

  nodos.dias.textContent = String(dias);
  nodos.horas.textContent = dosDigitos(horas);
  nodos.minutos.textContent = dosDigitos(minutos);

  const resumen = `Faltan ${dias} días, ${horas} horas y ${minutos} minutos.`;
  if (resumen !== ultimoResumen) {
    nodos.sr.textContent = resumen;
    ultimoResumen = resumen;
  }
}

actualizarCuenta();
const intervalo = setInterval(actualizarCuenta, 1000);

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) actualizarCuenta();
});

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
   Parallax de las ilustraciones
   -------------------------------------------------------------------------- */

const capas = Array.from(document.querySelectorAll('.deco .p'));

if (!reduce && capas.length) {
  let ticking = false;

  // Centro vertical de cada capa dentro del documento (sin transformar)
  function medir() {
    capas.forEach((capa) => {
      capa.style.transform = '';
      const caja = capa.getBoundingClientRect();
      capa._centro = caja.top + window.scrollY + caja.height / 2;
      capa._factor = parseFloat(capa.dataset.speed) || 0;
      // data-anchor="top": la capa queda pegada al borde superior de la página
      // cuando el scroll está arriba (para que no se vea su corte).
      capa._pegadaArriba = capa.dataset.anchor === 'top';
    });
    pintar();
  }

  function pintar() {
    const mitad = window.innerHeight / 2;
    const y = window.scrollY;
    capas.forEach((capa) => {
      if (!capa.offsetParent && capa.offsetWidth === 0) return; // oculta por media query
      const desfase = capa._pegadaArriba
        ? y * capa._factor
        : (y + mitad - capa._centro) * capa._factor;
      capa.style.transform = `translate3d(0, ${desfase.toFixed(2)}px, 0)`;
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
  medir();
}
