# HOSPITAL CLÍNICO – Sistema de Gestión Hospitalaria

Proyecto de demostración escolar hecho con HTML, CSS y JavaScript. Incluye paneles para paciente, doctor, recepción, administrador y desarrollador.

## Qué se corrigió

- Se agregó un formulario para registrar cuentas nuevas de paciente.
- El inicio de sesión acepta nombre de usuario o correo electrónico.
- La recuperación de contraseña usa únicamente el servidor local Nodemailer; ya no manda notificaciones falsas mediante FormSubmit como alternativa.
- El correo de recuperación contiene un enlace temporal de una hora y no revela la contraseña actual.
- El enlace cambia la contraseña de la cuenta existente y luego permite volver a iniciar sesión.
- Las cuentas con rol doctor, recepción, administrador o desarrollador deben ser creadas o asignadas por un administrador; no se permite que cualquiera se registre con permisos elevados.

## Instalación y ejecución

1. Abrí la carpeta `hospital-clinico` en VS Code.
2. En la terminal, ejecutá `cd server` y luego `npm install`.
3. Copiá `server/.env.example` como `server/.env`.
4. Editá `server/.env` con el Gmail que enviará los correos y una contraseña de aplicación de Google:

```dotenv
SMTP_USER=tu_correo@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
PORT=3001
```

5. Desde la carpeta `server`, ejecutá `npm start` y dejá esa terminal abierta.
6. Abrí `index.html` con Live Server en VS Code (no con `file://`).
7. Registrá una cuenta de paciente usando el correo donde querés recibir la recuperación. Iniciá sesión con el nombre de usuario o correo y la contraseña elegida.
8. Para probar recuperación, cerrá sesión, elegí “¿Olvidaste tu usuario o contraseña?”, escribí el mismo correo y pedí el mensaje.
9. Abrí el enlace del correo desde el mismo navegador y la misma dirección de Live Server donde registraste la cuenta. Creá la contraseña nueva y volvé a iniciar sesión.

## Cuentas de demostración existentes

Si el almacenamiento del navegador no se había inicializado antes, también hay cuentas de demostración: `paciente / 1234`, `doctor / 1234`, `recepcion / 1234`, `admin / 1234` y `dev / 1234`. Sus correos son ficticios; para recuperar una de ellas, el email registrado debe coincidir con el correo guardado para ese usuario.

## Limitaciones importantes

Esta versión es para una demostración local. Las cuentas y los tokens se guardan en `localStorage`, por lo que el enlace de recuperación solo funciona en el mismo navegador, perfil y origen de Live Server donde se creó la solicitud. Las contraseñas también están guardadas localmente y en texto plano; no uses este proyecto con datos médicos reales ni lo publiques como sistema hospitalario real. Para uso real haría falta una base de datos y autenticación segura en un backend.

No compartas `server/.env`, no lo subas a GitHub y nunca uses la contraseña normal de tu Gmail en el archivo.
