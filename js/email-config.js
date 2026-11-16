/**
 * ============================================================
 * CONFIGURACIÓN DE CORREO REAL (EmailJS → Gmail)
 * ============================================================
 * Sin estas claves el sistema NO puede enviar mails reales
 * desde el navegador (Google no permite SMTP directo por JS).
 *
 * Pasos (una sola vez, gratis):
 * 1. Entrá a https://www.emailjs.com y creá una cuenta.
 * 2. Email Services → Add Service → elegí Gmail e iniciá sesión
 *    con la cuenta que VA A ENVIAR los correos (ej. tu Gmail).
 * 3. Copiá el Service ID (ej. service_xxxxxxx).
 * 4. Email Templates → Create New Template. Ejemplo de contenido:
 *
 *    Subject: Recuperación de acceso – HOSPITAL CLÍNICO
 *    To Email: {{to_email}}
 *    Body:
 *      Hola {{nombre}},
 *
 *      Recibimos una solicitud para recuperar tu acceso a HOSPITAL CLÍNICO.
 *
 *      Tu nombre de usuario es: {{username}}
 *
 *      Para crear una nueva contraseña, abrí este enlace:
 *      {{reset_link}}
 *
 *      Si no pediste este correo, ignoralo.
 *
 * 5. Copiá el Template ID (ej. template_xxxxxxx).
 * 6. Account → General → Public Key → copiá la clave pública.
 * 7. Pegá los tres valores abajo, guardá y recargá la página.
 * ============================================================
 */
window.HC_EMAIL_CONFIG = {
  // Pegá acá tus datos de EmailJS:
  PUBLIC_KEY: '',      // ej: 'AbCdEfGhIjKlMnOp'
  SERVICE_ID: '',      // ej: 'service_abc123'
  TEMPLATE_ID: '',     // ej: 'template_xyz789'

  // Si está en true y faltan las claves, se muestra la simulación en pantalla
  // (solo para desarrollo). Con claves configuradas siempre se envía mail real.
  ALLOW_DEMO_FALLBACK: true
};

window.HC_emailConfigured = function () {
  const c = window.HC_EMAIL_CONFIG || {};
  return !!(c.PUBLIC_KEY && c.SERVICE_ID && c.TEMPLATE_ID);
};
