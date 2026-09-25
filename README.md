# Upfit

Upfit es una PWA para anotar entrenamientos de gimnasio desde el celular. Se instala en la pantalla de inicio, se abre a pantalla completa y usa el icono de la app. Hay un solo usuario: la persona que entrena. No hay roles de instructor ni cuentas compartidas.

El fondo es blanco y el amarillo marca la acción principal de cada pantalla.

## Flujo del usuario

1. **Crear cuenta.** En `/auth/sign-up` escribe su nombre, correo y contraseña. Supabase envía un correo de confirmación. El enlace hay que abrirlo en el mismo navegador. Si el enlace no abre la sesión, entra con correo y contraseña.
2. **Entrar.** En `/auth/login` usa ese correo y contraseña. Si la olvida, `/auth/forgot-password` manda un enlace para elegir una nueva en `/auth/update-password`.
3. **Ver el dashboard.** Después de entrar llega a la pantalla principal:
   - días entrenados en los últimos 7 días y en el año en curso (sesiones con fecha distinta);
   - las 3 mejores marcas, el mayor peso registrado por ejercicio;
   - **Mis rutinas**;
   - **Iniciar rutina**.
4. **Armar rutinas antes de entrenar.** En **Mis rutinas** o, si todavía no hay ninguna, en el botón **Crear rutina**:
   - pone un nombre (Push, Pull, Legs, Upper…);
   - agrega ejercicios del catálogo o crea uno nuevo eligiendo el grupo muscular (Pecho, Espalda, Hombro, Tríceps, Bíceps o Pierna);
   - guarda.
5. **Editar una rutina.** En la lista toca la rutina para cambiar el nombre y agregar o quitar ejercicios. El orden no se arrastra.
6. **Entrenar.** **Iniciar rutina** muestra las rutinas guardadas. Al elegir una, se abre la sesión de hoy con los ejercicios en orden. En cada ejercicio ajusta peso y repeticiones con + y −, y **Agregar serie** guarda esa serie al momento. **Finalizar sesión** vuelve al inicio. Si no anotó ninguna serie, esa sesión no se guarda.
7. **Ver el historial.** En **Historial** aparece cada sesión con fecha, nombre de la rutina si tenía, y cuántas series llevó. Al abrirla se ven los ejercicios, las series, el peso y las repeticiones. Esas sesiones también alimentan los días entrenados y las mejores marcas del dashboard.

## Qué se puede hacer ahora

- Registrarse, entrar, confirmar el correo y recuperar la contraseña.
- Ver el dashboard.
- Crear y editar rutinas, y mantener un catálogo propio de ejercicios.
- Iniciar una rutina, anotar series y finalizar la sesión.
- Consultar el historial de sesiones.

Cada persona solo ve y modifica sus datos.

Fuera de este alcance: editar o borrar series ya guardadas, gráficas, reordenar ejercicios y cuentas de varias personas.

## Cómo correrla en local

1. Copia `.env.example` a `.env.local` y completa la URL y la publishable key del proyecto de Supabase.
2. En el SQL Editor de Supabase, ejecuta `supabase/migrations/20260925171800_init_schema.sql`.
3. En **Authentication → URL Configuration**, agrega `http://localhost:3000/auth/callback` como Redirect URL.
4. Instala y arranca:

```bash
corepack pnpm install
corepack pnpm dev
```

La app queda en `http://localhost:3000`.

## Instalarla como PWA

Upfit incluye un manifiesto web y un service worker. El nombre de la app es Upfit y los iconos están en `public`:

- `favicon.svg`
- `icon-192.png` y `icon-512.png`
- `apple-touch-icon.png`

En el celular:

1. Abre `http://localhost:3000` en Chrome o la URL publicada en Safari.
2. En Chrome, elige **Instalar app**. En Safari, **Compartir** y luego **Agregar a pantalla de inicio**.
3. Ábrela desde el icono. Entra en pantalla completa, sin la barra del navegador.

En la computadora, Chrome también permite instalarla desde `localhost`. Para que alguien más la instale desde el teléfono, la app tiene que estar publicada con HTTPS.
