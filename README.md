# Sakura no Kokoro · 桜の心

Juego 2D pixel-art (Phaser 3 + Vite) para móvil y escritorio. Escribes de 0 a 5 preocupaciones; cada ninja lleva una sobre la cabeza. Defiende el cerezo **120 segundos** con un samurái bajo un ciclo completo día/noche.
Un juego tranquilo para pasar el rato: **no es una terapia ni un tratamiento** y no hace ninguna afirmación médica.

> **Estado de las pruebas (leer antes de publicar).** Este proyecto se escribió en un entorno sin red, así que **no se ha podido ejecutar en un navegador** ni correr `npm install` / `npm run build`. Lo verificado: sintaxis de todos los módulos y 7 tests unitarios de la lógica pura (`npm test`). Lo no verificado: render, controles, audio y balance. Espera pequeños fallos en la primera ejecución y revisa la consola del navegador; ver "Limitaciones conocidas".

## Arrancar

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # tests unitarios (Node, sin navegador)
npm run build      # genera dist/
npm run preview    # sirve dist/ para probarlo
```
Requiere Node 18+. Prueba táctil en escritorio: abre `http://localhost:5173/?touch=1` (y usa las herramientas de dispositivo del navegador para girar entre vertical y horizontal).

## Publicar en GitHub Pages (paso a paso)
1. Crea un repositorio en GitHub (p. ej. `sakura-no-kokoro`) y sube **el contenido de esta carpeta** a la rama `main`.
2. En el repo: **Settings → Pages → Build and deployment → Source: "GitHub Actions"**.
3. Haz push a `main`. El workflow `.github/workflows/deploy.yml` instala, pasa los tests, compila y publica.
4. La web queda en `https://<usuario>.github.io/<repo>/`.

**Ruta base (base path).** El workflow pasa `VITE_BASE=/<nombre-del-repo>/` automáticamente. Para cambiarla a mano:
- local: `VITE_BASE=/mi-repo/ npm run build`
- fija: edita el valor por defecto en `vite.config.js` (`'./'` = ruta relativa, válida en cualquier carpeta o en un ZIP subido a un hosting estático).
Si usas un dominio propio en la raíz, pon `VITE_BASE=/`.

## Controles y pantalla
| | Mover | Saltar | Tajo | Pausa |
|---|---|---|---|---|
| Teclado | ← → / A D | ↑ / W / Espacio | J / K | P / Esc |
| Táctil | botones ◀ ▶ | botón SALTO | botón TAJO | icono II |

**Móvil en vertical y en horizontal.** El campo de juego es 16:9 y se adapta solo.
- *Horizontal:* el juego ocupa toda la pantalla; ◀ ▶ abajo a la izquierda, SALTO y TAJO abajo a la derecha, y arriba a la derecha pausa, sonido, pantalla completa y reiniciar.
- *Vertical:* el juego va arriba y los controles debajo (herramientas en una fila, ◀ ▶ a la izquierda, SALTO sobre TAJO a la derecha). Los textos del lienzo (preocupaciones, temporizador) se agrandan automáticamente en pantallas pequeñas.
- Los controles son HTML (`src/controls.js`, estilos en `src/style.css`), no parte del lienzo, así que mantienen tamaño de dedo en cualquier orientación. Son multitáctiles (mover y saltar a la vez). Se muestran en dispositivos táctiles.
- **Pantalla completa:** el botón alterna entrar y salir (el icono cambia). En iPhone/Safari la API no existe y el botón se oculta; allí, "Compartir → Añadir a pantalla de inicio" abre el juego sin barras del navegador.
- Se pausa solo al cambiar de pestaña o apps.

## Qué se puede editar sin tocar el motor
| Archivo | Contenido |
|---|---|
| `config/gameplay.json` | duración, pétalos, límite de texto, velocidades, físicas, tiempos del tajo (anticipación/impacto/recuperación), IA del ninja, **tabla de aparición** (`spawn`), ajustes de audio por defecto, `assets` |
| `config/labels.json` | textos de la interfaz en español |
| `config/labels.en.json` | textos de la interfaz en inglés |
| `config/quotes.json` | banco de citas originales y traducciones en inglés/español, con autor y fuente |
| `src/entities/DayNightController.js` | paleta del cielo (`SKY`) y curva de noche (`NIGHT`) |
| `src/art.js` | arte procedural (colores y formas) |
| `src/audio.js` | escala, tempo y sonidos procedurales |

Los JSON se incluyen al compilar: tras editar, reinicia `npm run dev` o vuelve a hacer build.

### Citas
La interfaz está en inglés por defecto; el selector del menú permite cambiar a español y recuerda la elección en este navegador. Mantén las mismas claves en ambos archivos de etiquetas al añadir textos. Las 12 citas de autores de **dominio público** incluyen traducciones al inglés y al español. Las traducciones son libres y conviene contrastar cada pasaje con una edición crítica antes de publicar. No hay citas atribuidas a figuras modernas. Para añadir una, copia una entrada y rellena `original`, `en`, `es`, `author`, `authorEn`, `source`, `sourceEn` y `sourceNote`.

## Reemplazar arte (PNG)
1. Coloca el PNG en `public/assets/` (p. ej. `public/assets/samurai_idle.png`).
2. Regístralo en `config/gameplay.json` con la **misma clave** que la textura:
```json
"assets": { "sam_idle": "assets/samurai_idle.png", "fuji": "assets/fuji.png" }
```
Si una clave está en `assets`, se usa tu PNG; si no, el arte integrado. Cada clave es **una imagen suelta** (no hay spritesheets: cada pose es su propia clave). El lienzo lógico es 640×360, píxel-perfecto (vecino más cercano).

| Clave | Tamaño | Notas |
|---|---|---|
| `sam_sit`, `sam_idle`, `sam_run0`, `sam_run1`, `sam_jump`, `sam_slash0`, `sam_slash1` | 32×32 | pies abajo-centro, mira a la derecha (se voltea solo) |
| `nin0`, `nin1`, `nin2` | 20×28 | andar A/B y salto; mira a la derecha |
| `slash_arc` | 44×40 | arco del tajo, ancla en (4, 20) |
| `tree_trunk` | 96×130 | base del tronco centrada en x=44 |
| `tree_crown` | 260×140 | copa de flores |
| `fuji` | 320×100 | |
| `pagoda`, `pagoda_lit` | 64×120 | `pagoda_lit` = solo las ventanas iluminadas, mismo tamaño, fondo transparente |
| `hills_far`, `hills_mid`, `trees_near` | 640×90, 640×80, 640×60 | capas de parallax |
| `ground` | 640×70 | |
| `sun`, `moon` | 32×32, 30×30 | |
| `lantern`, `glow`, `star` | 10×16, 64×64, 3×3 | |
| `petal`, `petal_off`, `spark` | 5×5, 5×5, 4×4 | partículas y HUD |

## Audio
No hay archivos de audio: la música (escala Hirajoshi, plucks tipo koto, taiko y madera) y los efectos (incluido el "SHINK") son **originales y se generan con Web Audio**. Empiezan solo tras el primer toque en "Jugar" (política de los navegadores móviles). Para usar tus archivos, sustituye los métodos de `src/audio.js` (`shink()`, `hit()`, `win()`… y `setMode()` para la música) por reproducción de ficheros; mantén la llamada a `unlock()` dentro de un gesto del usuario.

## Privacidad de las preocupaciones
Se guardan solo en memoria durante la partida (`registry`), nunca en `localStorage`, red ni disco. Se limpian de caracteres de control, se recortan a 28 caracteres, se rechazan vacías, sin letras/números o con `< > { } \``, y se pintan en canvas / con `textContent` (nunca `innerHTML`). Lo único persistente en `localStorage` son los ajustes de audio y de movimiento reducido.

## Funciones implementadas
Menú (DOM), ajustes (sonido, música, 2 volúmenes, reducir movimiento), instrucciones, formulario de preocupaciones (0–5, añadir/quitar, sugerencias, validación), introducción contemplativa con entrada de ninjas, ciclo día/noche continuo de 120 s (sol, luna llena, estrellas, ventanas de la pagoda, farolillos), parallax, viento y pétalos, tajo con anticipación/impacto/recuperación, ninjas que saltan, avisan (parpadeo amarillo) y atacan (aturdimiento + invulnerabilidad), robo y recuperación de pétalos, muerte en pétalos de día / fuegos artificiales de noche, derrota inmediata, victoria con floración y cita, pausa que congela el cronómetro, pausa automática al perder foco, pantalla completa, controles táctiles multitáctil en vertical y horizontal, pausa/resultados/menús en HTML, áreas seguras (notch), tests unitarios, workflow de Pages.

## Limitaciones conocidas
- **No ejecutado en navegador** por quien lo escribió (ver arriba). Pendiente de verificar tú: 360×800 (vertical), 844×390 y 1920×1080, táctil + teclado, pantalla completa, partida completa de 120 s, derrota temprana, jugar con 0/1/5 preocupaciones, y consola sin errores.
- No se ha afinado el balance con jugadores reales (`config/gameplay.json` → `spawn`, `ninja`).
- El arte es procedural y funcional, no ilustración final: conviene sustituirlo por PNG propios.
- iPhone no permite pantalla completa en Safari (el botón se oculta).
- En vertical el campo de juego ocupa solo el ancho de la pantalla (se ve pequeño); en horizontal se ve mejor. Deslizar el dedo de ◀ a ▶ sin levantarlo no cambia de dirección: hay que levantar y volver a pulsar.
- Los glifos CJK/griego de las citas dependen de las fuentes del dispositivo.
- El texto de la interfaz usa fuente del sistema (sin fuente bitmap incluida).
