# Documentación del código de Upfit

Upfit es una PWA de un solo usuario para anotar entrenamientos. Next.js pinta las pantallas. Supabase guarda los datos y aplica las reglas de acceso. No hay un API propio: las pantallas leen y escriben Postgres con la publishable key, y Row Level Security limita cada fila a su dueño.

## Cómo está organizado

| Carpeta | Qué contiene |
|---|---|
| `app/` | Rutas. Cada `page.tsx` es una pantalla. `layout.tsx` carga Poppins, la barra y el aviso de instalación. |
| `features/` | Lógica de cada función: formularios, acciones de servidor y cálculos. |
| `components/` | Piezas compartidas: barra, aviso PWA y componentes de interfaz. |
| `lib/supabase/` | Clientes de Supabase para el navegador, el servidor y la barra de sesión. |
| `supabase/migrations/` | SQL de tablas, políticas y la función para importar una rutina. |
| `public/` | Iconos de la PWA y `sw.js`. |
| `proxy.ts` | Decide si la visita entra, va al login o ve la portada. |

Las pantallas autenticadas viven en `app/`. El acceso vive en `app/auth/`.

## Rutas

| Ruta | Quién la ve | Qué hace |
|---|---|---|
| `/` | Todos | Portada si no hay sesión. Inicio si ya entró. |
| `/auth/login`, `/auth/sign-up`, `/auth/forgot-password`, `/auth/update-password` | Público | Cuenta, entrada y contraseña nueva. |
| `/auth/callback` | Público | Canjea el código del correo de Supabase. |
| `/routines`, `/routines/new`, `/routines/[id]` | Sesión | Lista, alta y edición de rutinas. |
| `/workout`, `/workout/[sessionId]` | Sesión | Elegir rutina, anotar series, cardio y tiempo. |
| `/history`, `/history/[id]` | Sesión | Sesiones pasadas, con series, cardio y duración. |
| `/medidas` | Sesión | Peso y medidas, opcionales. |

`lib/supabase/proxy.ts` marca `/` y las rutas de `/auth` como públicas. El resto redirige a `/auth/login` si no hay cookie de sesión. Esa revisión usa `getSession()` para no llamar a Supabase en cada clic.

## Datos

La migración `20260925171800_init_schema.sql` crea el núcleo:

- `profiles` extiende `auth.users`. Un trigger copia el nombre al registrarse.
- `exercises` es el catálogo de cada usuario. El grupo muscular solo puede ser Pecho, Espalda, Hombro, Tríceps, Bíceps o Pierna.
- `routines` y `routine_exercises` arman la rutina. `orden` es el orden en que se agregaron.
- `workout_sessions` es una sesión. `fecha` la manda el celular, en el día local. `routine_id` puede quedar vacío si se borra la rutina.
- `session_sets` es cada serie: número, peso y repeticiones. No se editan ni se borran desde la interfaz.

`20261005105000_shares_and_measurements.sql` agrega:

- `routine_shares`: un código de 8 caracteres ligado a una rutina.
- `import_shared_routine`: copia esa rutina y sus ejercicios a quien pega el código. Si el ejercicio ya existe por nombre, lo reutiliza.
- `body_measurements`: fecha más peso, cintura, pecho, cadera, brazo o muslo. Hace falta al menos un valor.

`20261005120000_workout_guides.sql` agrega lo que se anota durante el entrenamiento:

- `routine_exercises.series_objetivo`: cuántas series sugiere la rutina. Es una guía; en la sesión se pueden hacer más o menos.
- `workout_sessions.duracion_minutos`: minutos de la sesión, de 1 a 300. Se guarda al finalizar.
- `session_exercises`: copia de los ejercicios al abrir la sesión (`orden`, `exercise_id`, `series_objetivo`). Cambiar un ejercicio aquí no reescribe la rutina guardada.
- `session_cardio`: bloques opcionales de Caminadora, Bicicleta, Elíptica, Remo, Cuerda u Otro, con sus minutos.
- `import_shared_routine` también copia `series_objetivo`.

Todas las tablas tienen RLS. La función de importar corre como `security definer` porque quien importa no puede leer las filas del otro usuario.

## Funciones y dónde están

**Acceso.** `features/auth/actions.ts` registra, entra, pide el correo de recuperación y cambia la contraseña. `features/auth/messages.ts` traduce los errores de Supabase.

**Inicio.** `features/dashboard/get-dashboard.ts` arma la semana, los días del año y las 5 mejores marcas. `features/dashboard/stats.ts` tiene esos cálculos, y ahí están sus pruebas. El resultado se guarda 60 segundos con la etiqueta `dashboard:<usuario>` y se invalida al guardar una serie o una rutina.

**Rutinas.** `features/routines/routine-form.tsx` muestra, en este orden, lo que ya lleva la rutina, el alta de un ejercicio y el catálogo. Cada ejercicio elegido tiene el contador **Series guía**. `features/routines/actions.ts` guarda ese plan como `id:series`. `features/routines/share.ts` arma y normaliza el código. `features/routines/share-controls.tsx` muestra Compartir e Importar.

**Entrenamiento.** `features/workouts/actions.ts` abre la sesión y copia los ejercicios a `session_exercises`. Guarda cada serie, cambia un ejercicio de esa sesión, agrega cardio y cierra. Al cerrar guarda los minutos. Si no hay series ni cardio, borra la sesión. El peso cambia de 1 kg. `features/workouts/exercise-logger.tsx` muestra la guía, las series de la vez pasada y el botón **Cambiar**. `features/workouts/session-extras.tsx` pide el tiempo y el cardio. `features/workouts/plan.ts` interpreta el plan, sugiere la serie que toca y limita series, minutos y tipos de cardio. La sugerencia sale de la última sesión de la misma rutina: la serie del mismo número, o la última si ya se pasaron.

**Historial.** `app/history/page.tsx` lista sesiones que tienen al menos una serie o un bloque de cardio, y muestra la duración si existe. `lib/embedded-count.ts` lee ese conteo. `features/history/format.ts` escribe la fecha en español sin depender del idioma del servidor. El detalle en `app/history/[id]/page.tsx` incluye minutos y cardio.

**Medidas.** `features/measurements/parse.ts` valida el formulario. `app/medidas/page.tsx` lista lo guardado.

**Navegación.** `components/app-nav.tsx` se muestra solo con sesión. Abajo en el celular y arriba en pantallas anchas: Inicio, Rutinas, Iniciar, Historial y Medidas.

**PWA.** `app/manifest.ts` declara el nombre y los iconos. `public/sw.js` cachea solo los iconos, no el JavaScript, para no servir una versión vieja. `components/install-prompt.tsx` muestra el aviso. `features/pwa/install-prompt.ts` decide si sale: no aparece si ya está instalada, y “Ahora no” la oculta 14 días en `localStorage`.

**Portada.** `features/landing/landing-page.tsx` es lo que ve quien no ha entrado.

## Pruebas

`npm test` corre las pruebas de Node sobre la lógica pura: semana, racha, marcas, fechas, grupos musculares, códigos, medidas, el aviso de instalación, los mensajes de acceso y el plan de la sesión (series guía, sugerencia de la vez pasada, minutos y cardio). No levantan el navegador ni Supabase.

En cada push, `.github/workflows/test.yml` corre esas pruebas y `tsc --noEmit`.

## Qué no está

Sigue pendiente cambiar el nombre a Fitrapp y generar una rutina a partir de los datos de la persona o con IA. Tampoco se editan series ya guardadas, no hay gráficas y no se reordenan ejercicios.
