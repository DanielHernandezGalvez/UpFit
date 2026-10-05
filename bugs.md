# Historial de bugs

Registro de fallos vistos en Upfit y de cómo se corrigieron. El sitio publicado es [https://up-fit-eight.vercel.app](https://up-fit-eight.vercel.app/).

## El historial y las mejores marcas no cargaban

**Qué pasaba.** Al abrir el historial, la lista no aparecía. Algunas mañanas, las mejores marcas del inicio tampoco. En ambos casos la pantalla se veía como si no hubiera datos.

**Por qué.** La sesión de Supabase caduca cerca de una hora. Por la noche, con la app cerrada, el token ya no sirve. `lib/supabase/proxy.ts` solo leía la cookie y no la renovaba. El inicio armaba las marcas con ese token vencido y con la renovación apagada. La consulta fallaba, el código ignoraba el error y pintaba la lista vacía. Ese resultado vacío quedaba en caché unos 60 segundos, así que recargar enseguida no lo arreglaba.

El historial, además, pide la duración y el cardio. Si esa consulta corría antes de aplicar el SQL, fallaba y la página mostraba el texto de “cuando termines un entrenamiento”.

**Cómo se solucionó.**

- Si el token está por vencer, el proxy llama a `getUser()` y guarda la cookie nueva antes de pintar la pantalla. La lógica está en `lib/supabase/access-token.ts`.
- Si el inicio no puede leer los datos, no guarda ese fallo en caché y pide recargar. Lo mismo hace el historial, en lugar de mostrar la lista vacía.
- La barra solo se muestra cuando el token sigue vigente, para no mezclar una sesión muerta con la portada.

## El correo de confirmación abría localhost:3000

**Qué pasaba.** Al crear una cuenta y abrir el correo, el enlace iba a `http://localhost:3000`. En el teléfono esa dirección no existe.

**Por qué.** El enlace del correo usa la Site URL de Supabase. Estaba en localhost, la dirección de desarrollo. Si esa URL no coincide con una Redirect URL permitida, Supabase ignora el destino de la app y manda al Site URL.

**Cómo se solucionó.**

- `features/auth/origin.ts` arma el enlace con `NEXT_PUBLIC_SITE_URL` o con el dominio de producción de Vercel. Localhost solo se usa cuando no hay un sitio publicado.
- Esa variable quedó en `https://up-fit-eight.vercel.app` (`.env.example` y `.env.local`).
- En Supabase, **Authentication → URL Configuration** quedó así:
  - Site URL: `https://up-fit-eight.vercel.app`
  - Redirect URL: `https://up-fit-eight.vercel.app/auth/callback`
  - Para pruebas locales también puede estar `http://localhost:3000/auth/callback`

El correo que ya se había enviado sigue apuntando a localhost. Hay que pedir otro, o confirmar esa cuenta desde la computadora donde corre la app. En Vercel hace falta la misma variable `NEXT_PUBLIC_SITE_URL` y un despliegue nuevo para que el sitio publicado use este enlace.

## Entrar no hacía nada después de cerrar la sesión

**Qué pasaba.** Con la cuenta principal, la app cerraba la sesión. Después, Entrar y Crear cuenta no dejaban pasar: volvían al inicio.

**Por qué.** Quedaba una cookie de sesión vencida. El proxy la tomaba como si siguieras dentro y mandaba `/auth/login` de regreso a `/`. En el inicio, la sesión ya no servía, así que otra vez salía la portada. Los botones repetían ese círculo. Además, renovar el token en la pantalla y en el proxy a la vez podía invalidar la sesión recién creada.

**Cómo se solucionó.**

- Si el token no se puede renovar, se borran las cookies de acceso.
- La pantalla de entrar solo regresa al inicio cuando la sesión se confirma con el servidor.
- Las pantallas leen la sesión que ya renovó el proxy, con `lib/supabase/request-auth.ts`, y no vuelven a renovarla.
