/**
 * HOSPITAL CLÍNICO – API local de correo
 * Envía el mail de recuperación de verdad a cualquier Gmail.
 *
 * Uso:
 *   cd server
 *   npm install
 *   cp .env.example .env   (y completá SMTP_USER / SMTP_PASS)
 *   npm start
 *
 * Luego abrí el frontend con Live Server y pedí recuperación.
 */
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return {};
  const out = {};
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) return;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[m[1]] = v;
  });
  return out;
}

const env = { ...loadEnv(), ...process.env };
const PORT = Number(env.PORT || 3001);
const SMTP_USER = env.SMTP_USER || '';
const SMTP_PASS = (env.SMTP_PASS || '').replace(/\s+/g, '');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    mailConfigured: Boolean(SMTP_USER && SMTP_PASS),
    from: SMTP_USER ? SMTP_USER.replace(/(.{2}).+(@.+)/, '$1***$2') : null
  });
});

function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>\"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;'
  }[ch]));
}

app.post('/api/recover', async (req, res) => {
  try {
    const { to, subject, message } = req.body || {};
    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(to).trim())) {
      return res.status(400).json({ ok: false, error: 'Email destino inválido' });
    }
    if (!SMTP_USER || !SMTP_PASS) {
      return res.status(503).json({
        ok: false,
        error: 'Servidor de correo no configurado. Completá server/.env (SMTP_USER y SMTP_PASS).'
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });

    await transporter.sendMail({
      from: `"HOSPITAL CLÍNICO" <${SMTP_USER}>`,
      to: String(to).trim(),
      subject: subject || 'Recuperación de acceso – HOSPITAL CLÍNICO',
      text: message || '',
      html: '<div style="font-family:Segoe UI,Arial,sans-serif;font-size:14px;line-height:1.6;white-space:pre-wrap;">' +
        escapeHtml(message || '') +
        '</div>'
    });

    res.json({ ok: true });
  } catch (err) {
    console.error('Mail error:', err);
    res.status(500).json({
      ok: false,
      error: 'No se pudo enviar el correo. Revisá SMTP_USER y SMTP_PASS en server/.env y que Gmail permita la contraseña de aplicación.'
    });
  }
});

app.listen(PORT, () => {
  console.log('');
  console.log('HOSPITAL CLÍNICO – API de correo');
  console.log('http://localhost:' + PORT);
  console.log('Mail configurado:', Boolean(SMTP_USER && SMTP_PASS));
  console.log('');
});
