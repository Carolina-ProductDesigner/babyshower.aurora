# Baby Shower Aurora 💗

Invitación de una sola página con formulario de confirmación de asistencia que
se guarda en una hoja de Google Sheets. HTML, CSS y JavaScript puros: sin build.

```
.
├── index.html
├── css/styles.css
├── js/main.js            # configuración (CONFIG), formulario, scroll y parallax
├── img/                  # ilustraciones PNG
└── apps-script/Code.gs   # código que se pega en tu hoja de Google
```

## 1. Probar el sitio

Con un servidor local (`python3 -m http.server`) abre `http://localhost:8000`.
Mientras `scriptUrl` esté vacío es **modo prueba**: el formulario funciona pero no guarda nada.

## 2. Personalizar (`js/main.js` → `CONFIG`)

- `mapsUrl`: link de Google Maps del botón **Ubicación**.
- `regalos`: texto y link de cada mesa de regalos.
- `scriptUrl`: URL de tu app de Apps Script (paso 3).

El título (BABY SHOWER Aurora) es el SVG `img/titulo.svg`: para cambiarlo, reemplaza ese archivo
(967 × 290, con el texto centrado). Fecha y WhatsApp del footer están en `index.html`.
Colores en `css/styles.css`: `--bg #F7D9E4`, `--cream #FCEAF1`, `--ink #A83463`, `--hair #D48DA8`.
El espacio entre secciones se ajusta en un solo lugar: la variable `--gap`.

## 3. Conectar el formulario a Google Sheets

1. Crea una hoja de Google nueva (sheets.new).
2. *Extensiones → Apps Script*: borra lo que haya, pega `apps-script/Code.gs` y guarda.
3. *Implementar → Nueva implementación → ⚙ Aplicación web*:
   **Ejecutar como: Yo** · **Quién tiene acceso: Cualquier persona** → Implementar.
   Acepta los permisos que pide Google.
4. Copia la URL que termina en `/exec` y pégala en `scriptUrl` (`CONFIG` de `js/main.js`).
5. Prueba el formulario: aparece una pestaña **Respuestas** con fecha, asistencia, nombre y mensaje.
   La lista se ordena sola **alfabéticamente por nombre** cada vez que llega una respuesta.

Si cambias `Code.gs` después, vuelve a implementar: *Implementar → Administrar
implementaciones → ✏ → Versión: Nueva versión*. La URL se queda igual.

## Animaciones

Al abrir se despliega la capa rosa y el contenido aparece escalonado; al hacer scroll
cada bloque aparece suavemente, y las ilustraciones tienen parallax (`data-speed` en
`index.html`). Todo se desactiva si el sistema pide "reducir movimiento".

## Subir a GitHub y publicar

```bash
git init
git add .
git commit -m "Invitación baby shower Aurora"
git branch -M main
git remote add origin https://github.com/USUARIO/REPOSITORIO.git
git push -u origin main
```

**GitHub Pages:** *Settings → Pages → Deploy from a branch → main / (root)*.
**Vercel:** importa el repo, Framework Preset **Other**, sin build command.
