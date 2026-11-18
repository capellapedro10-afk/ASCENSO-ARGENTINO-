# Ascenso Argentino

Simulador de gestión de fútbol inspirado en Football Manager y juegos de modo carrera. Desarrollado en HTML, CSS y JavaScript puro, sin servidor externo ni base de datos. Las partidas se guardan en `localStorage` del navegador.

## Cómo jugar (local)

Abrí `index.html` directamente en tu navegador, o levantá un servidor local:

```bash
python -m http.server 8765
```
Luego visitá `http://127.0.0.1:8765/index.html`

## Cómo desplegar con HTTPS (link público)

Para tener un link que funcione desde cualquier navegador (PC o celular) con HTTPS:

1. Creá un repositorio en [GitHub](https://github.com) (gratis).
2. Subí todos los archivos de este proyecto al repositorio.
3. En el repositorio, vas a **Settings → Pages**.
4. En **Build and deployment → Source**, elegí "Deploy from a branch", branch `main`, carpeta `/ (root)`.
5. Guardá. En 1-2 minutos tendrás un link tipo:
   `https://tuusuario.github.io/ascenso-argentino/`

Ese link es HTTPS y lo podés copiar y pegar en cualquier navegador.

## Tecnología

- HTML5, CSS3, JavaScript (ES6+)
- Canvas: no se usa (todo DOM)
- Almacenamiento: `localStorage` (navegador del usuario)
- Sin servidor, sin base de datos, sin APIs externas

## Estructura del proyecto

| Archivo | Función |
|---------|---------|
| `index.html` | Todas las pantallas del juego |
| `css/style.css` | Diseño visual, tema oscuro, responsive |
| `js/config.js` | Constantes: divisiones, formaciones, estilos, dificultades |
| `js/data.js` | Clubes ficticios, jugadores, escudos SVG generados |
| `js/state.js` | Estado del juego y persistencia en localStorage |
| `js/match.js` | Motor de simulación de partidos (determinista) |
| `js/league.js` | Calendario, tablas de posiciones, ascensos/descensos |
| `js/market.js` | Mercado de pases, fichajes, ventas, validaciones |
| `js/ui.js` | Renderizado de pantallas y lógica de interacción |
| `js/app.js` | Punto de entrada del juego |

## Funcionalidades

- Creación de carrera con 8 clubes ficticios de división inferior
- Elección de nombre de entrenador y de la partida
- Plantel de ~18 jugadores por club (nombre, edad, posición, rol, valoración, potencial, salario, valor de mercado)
- Alineación de 11 titulares + suplentes
- Formaciones 4-3-3, 4-4-2, 4-2-3-1
- Estilos de juego: ofensivo, equilibrado, defensivo
- Simulación de partidos con eventos (goles, ocasiones, tarjetas), goleadores y marcador animado
- Liga con calendario de ida y vuelta (14 fechas)
- Ascenso de campeón (2ª división) y descenso de último (1ª división)
- Mercado de pases con filtros, fichajes, ventas y control de presupuesto
- Finanzas: presupuesto, salarios, proyección anual
- Historial de temporadas, títulos, ascensos y evaluación del entrenador
- Guardado automático en localStorage
- Nueva carrera y borrado de partida con confirmación
- Diseño responsive para PC y celulares

## Créditos

Todos los clubes, jugadores, escudos y nombres son ficticios. Inspirado en la estructura del fútbol argentino, sin usar marcas registradas ni imágenes de terceros.# ASCENSO-ARGENTINO-
