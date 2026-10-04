# Baby De la Vega Delgado — on the way!

Sitio de una sola página con cuenta regresiva para el 10 de febrero de 2027.
HTML, CSS y JavaScript puros: no necesita build ni dependencias.

## Estructura

```
.
├── index.html      # marcado
├── css/styles.css  # estilos (desktop y móvil)
├── js/main.js      # configuración, cuenta regresiva, scroll y parallax
├── img/            # ilustraciones en PNG
└── README.md
```

## Personalizar

Abre `js/main.js` y edita el objeto `CONFIG`:

```js
const CONFIG = {
  fecha: '2027-02-10T00:00:00-06:00',   // -06:00 = hora del centro de México
  regalos: [
    { texto: 'Liverpool', url: 'https://...' },
    { texto: 'Amazon',    url: 'https://...' }
  ],
  textoEspera: 'Nazco aproximadamente en:',
  textoLlegada: '¡Ya estoy aquí!'
};
```

Los demás textos (nombre, tarjeta de los papás, footer) están en `index.html`.
Los colores están al inicio de `css/styles.css`:

| Variable  | Valor     | Uso                          |
|-----------|-----------|------------------------------|
| `--green` | `#D8DEBB` | fondo                        |
| `--cream` | `#F3E4CB` | capa del título y tarjeta    |
| `--ink`   | `#2F5B2C` | textos, botones y footer     |
| `--hair`  | `#839C74` | líneas separadoras           |

Tipografías: **Kurale** (contenido) y **Meow Script** (nombres), desde Google Fonts.

## Cómo funciona el escalado

Todo el diseño está construido sobre una unidad `--u`, donde `1u` equivale a
`1px` del diseño original (1440 × 1510 en escritorio, 402 × 1371 en móvil).
La página completa crece o se encoge de forma proporcional, así que se ve igual
en cualquier pantalla.

## Animaciones

- **Al abrir:** la capa crema se despliega de arriba hacia abajo y el contenido
  aparece escalonado.
- **Al hacer scroll:** cada bloque aparece y desaparece suavemente cuando entra
  o sale de la pantalla (`IntersectionObserver`).
- **Parallax:** las ilustraciones se mueven a distinta velocidad que el texto.
  La intensidad se ajusta en `index.html` con el atributo `data-speed` de cada
  ilustración (valores de `0.04` a `0.12`; más alto = más movimiento).

Todo se desactiva automáticamente si el sistema tiene activada la opción
"reducir movimiento".

## Subir a GitHub

```bash
git init
git add .
git commit -m "Sitio Baby De la Vega Delgado"
git branch -M main
git remote add origin https://github.com/USUARIO/REPOSITORIO.git
git push -u origin main
```

## Publicar

**Vercel:** entra a [vercel.com/new](https://vercel.com/new), importa el repo y
haz Deploy. Framework Preset **Other**, sin build command ni output directory.

**GitHub Pages:** en el repo, *Settings → Pages → Source: Deploy from a branch →
main / (root)*.
