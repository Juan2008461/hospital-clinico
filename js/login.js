document.addEventListener('DOMContentLoaded', () => {
  const MAIL_API = 'http://localhost:3001';
  const params = new URLSearchParams(window.location.search);
  const resetTokenFromUrl = params.get('reset');
  const session = getSession();

  if (session && !resetTokenFromUrl) {
    window.location.href = getRoleRedirect(session.role);
    return;
  }

  const viewLogin = document.getElementById('viewLogin');
  const viewRegister = document.getElementById('viewRegister');
  const viewRecoverEmail = document.getElementById('viewRecoverEmail');
  const viewResetPass = document.getElementById('viewResetPass');
  const loginError = document.getElementById('loginError');
  const loginSuccess = document.getElementById('loginSuccess');
  const recoverEmailError = document.getElementById('recoverEmailError');
  const recoverEmailSuccess = document.getElementById('recoverEmailSuccess');
  const resetPassError = document.getElementById('resetPassError');
  const resetPassSuccess = document.getElementById('resetPassSuccess');
  const registerError = document.getElementById('registerError');
  const registerSuccess = document.getElementById('registerSuccess');
  const btnSendRecover = document.getElementById('btnSendRecover');

  // Agrega el ojito a todos los campos de contraseña de esta pantalla:
  // inicio de sesión, registro y recuperación/cambio de contraseña.
  document.querySelectorAll('input[type="password"]').forEach((input) => {
    const existingWrapper = input.closest('.password-input-wrapper');
    const wrapper = existingWrapper || document.createElement('div');
    if (!existingWrapper) {
      wrapper.className = 'password-input-wrapper';
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);
    }

    // Evita duplicar el botón del inicio de sesión, que ya existe en el HTML.
    let toggle = wrapper.querySelector('.toggle-password');
    if (!toggle) {
      toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'toggle-password';
      toggle.textContent = '👁';
      toggle.setAttribute('aria-label', 'Mostrar contraseña');
      toggle.setAttribute('aria-pressed', 'false');
      toggle.title = 'Mostrar contraseña';
      wrapper.appendChild(toggle);
    }

    // Conecta el botón en todos los campos, incluido el inicio de sesión.
    toggle.addEventListener('click', () => {
      const showing = input.type === 'password';
      input.type = showing ? 'text' : 'password';
      toggle.setAttribute('aria-pressed', String(showing));
      toggle.setAttribute('aria-label', showing ? 'Ocultar contraseña' : 'Mostrar contraseña');
      toggle.title = showing ? 'Ocultar contraseña' : 'Mostrar contraseña';
      toggle.textContent = showing ? '👁' : '🙈';
    });
  });

  function showView(view) {
    [viewLogin, viewRegister, viewRecoverEmail, viewResetPass].forEach(v => {
      if (v) v.classList.add('hidden');
    });
    if (view) view.classList.remove('hidden');
  }

  function clearMessages() {
    [loginError, loginSuccess, recoverEmailError, recoverEmailSuccess,
      resetPassError, resetPassSuccess, registerError, registerSuccess].forEach(el => {
      if (el) el.hidden = true;
    });
  }

  function buildResetLink(token) {
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';
    let path = url.pathname;
    if (!/index\.html$/i.test(path)) {
      if (path.endsWith('/')) path += 'index.html';
      else path = path.replace(/\/?$/, '/index.html');
    }
    return url.origin + path + '?reset=' + encodeURIComponent(token);
  }

  if (resetTokenFromUrl) {
    const entry = consumeResetToken(resetTokenFromUrl);
    if (!entry) {
      showView(viewLogin);
      loginError.textContent = 'El enlace de recuperación no es válido, ya se usó o venció. Solicitá uno nuevo desde el mismo navegador donde abriste el proyecto.';
      loginError.hidden = false;
      history.replaceState({}, '', window.location.pathname);
    } else {
      const user = findUserById(entry.userId);
      if (!user) {
        showView(viewLogin);
        loginError.textContent = 'No se encontró la cuenta asociada a este enlace.';
        loginError.hidden = false;
        history.replaceState({}, '', window.location.pathname);
      } else {
        document.getElementById('resetUserId').value = user.id;
        document.getElementById('resetToken').value = resetTokenFromUrl;
        document.getElementById('resetAccountLabel').textContent = (user.nombre || '') + ' (@' + user.username + ')';
        showView(viewResetPass);
      }
    }
  }

  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    clearMessages();
    const result = login(
      document.getElementById('username').value.trim(),
      document.getElementById('password').value
    );
    if (result.success) {
      window.location.href = getRoleRedirect(result.user.role);
    } else {
      loginError.textContent = result.message;
      loginError.hidden = false;
    }
  });

  document.getElementById('linkRegister').addEventListener('click', (e) => {
    e.preventDefault();
    clearMessages();
    document.getElementById('registerForm').reset();
    showView(viewRegister);
  });

  document.getElementById('btnBackFromRegister').addEventListener('click', () => {
    clearMessages();
    showView(viewLogin);
  });

  document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    clearMessages();
    const password = document.getElementById('registerPassword').value;
    const confirmation = document.getElementById('registerConfirmPassword').value;
    if (password !== confirmation) {
      registerError.textContent = 'Las contraseñas no coinciden.';
      registerError.hidden = false;
      return;
    }
    const result = registerUser({
      nombre: document.getElementById('registerNombre').value,
      username: document.getElementById('registerUsername').value,
      email: document.getElementById('registerEmail').value,
      dni: document.getElementById('registerDni').value,
      telefono: document.getElementById('registerTelefono').value,
      password
    });
    if (!result.success) {
      registerError.textContent = result.message;
      registerError.hidden = false;
      return;
    }
    document.getElementById('username').value = result.user.username;
    document.getElementById('password').value = '';
    document.getElementById('registerForm').reset();
    showView(viewLogin);
    loginSuccess.textContent = 'Cuenta de paciente creada correctamente. Ahora iniciá sesión con tu usuario o email y contraseña.';
    loginSuccess.hidden = false;
  });

  document.getElementById('linkForgot').addEventListener('click', (e) => {
    e.preventDefault();
    clearMessages();
    document.getElementById('recoverEmailForm').reset();
    showView(viewRecoverEmail);
  });

  document.getElementById('btnBackFromEmail').addEventListener('click', () => {
    clearMessages();
    showView(viewLogin);
  });

  document.getElementById('btnBackFromReset').addEventListener('click', () => {
    clearMessages();
    history.replaceState({}, '', window.location.pathname);
    showView(viewLogin);
  });

  async function sendRecoveryEmail(toEmail, subject, message) {
    if (location.protocol === 'file:') {
      throw new Error('Abrí index.html con Live Server (Go Live), no directamente como archivo.');
    }
    let response;
    try {
      response = await fetch(MAIL_API + '/api/recover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ to: toEmail, subject, message })
      });
    } catch (_) {
      throw new Error('No se pudo conectar con el servidor de correo. En VS Code abrí una terminal en server, ejecutá npm start y dejala abierta.');
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'El servidor no pudo enviar el correo. Revisá la configuración de server/.env.');
    }
    return data;
  }

  document.getElementById('recoverEmailForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessages();
    const email = document.getElementById('recoverEmail').value.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      recoverEmailError.textContent = 'Ingresá un correo válido.';
      recoverEmailError.hidden = false;
      return;
    }

    const user = findUserByEmail(email);
    if (!user) {
      recoverEmailError.textContent = 'No hay una cuenta registrada con ese correo. Primero creá una cuenta de paciente o comprobá qué correo tiene asociado tu usuario.';
      recoverEmailError.hidden = false;
      return;
    }

    const token = createResetToken(user.id);
    const resetLink = buildResetLink(token);
    const subject = 'Recuperación de acceso – HOSPITAL CLÍNICO';
    const message =
      'Hola ' + (user.nombre || user.username) + ',\n\n' +
      'Recibimos una solicitud para cambiar la contraseña de tu cuenta de HOSPITAL CLÍNICO.\n\n' +
      'Usuario: ' + user.username + '\n\n' +
      'Para crear una contraseña nueva, abrí este enlace dentro de una hora y en el mismo navegador donde usás el proyecto:\n' + resetLink + '\n\n' +
      'Si no solicitaste este cambio, podés ignorar este correo. Nunca enviamos tu contraseña actual por email.\n\n' +
      '— HOSPITAL CLÍNICO';

    btnSendRecover.disabled = true;
    btnSendRecover.textContent = 'Enviando…';
    try {
      await sendRecoveryEmail(email, subject, message);
      addLog(user.username, 'Correo de recuperación enviado', 'A ' + email + ' vía servidor local');
      recoverEmailSuccess.textContent = 'Correo enviado a ' + email + '. Revisá Recibidos y Spam. Abrí el enlace desde este mismo navegador para crear la contraseña nueva.';
      recoverEmailSuccess.hidden = false;
    } catch (err) {
      invalidateResetToken(token);
      recoverEmailError.textContent = err.message || 'No se pudo enviar el correo.';
      recoverEmailError.hidden = false;
    } finally {
      btnSendRecover.disabled = false;
      btnSendRecover.textContent = 'Enviar correo de recuperación';
    }
  });

  document.getElementById('resetPassForm').addEventListener('submit', (e) => {
    e.preventDefault();
    clearMessages();
    const userId = parseInt(document.getElementById('resetUserId').value, 10);
    const token = document.getElementById('resetToken').value;
    const newPass = document.getElementById('resetNewPass').value;
    const confirmPass = document.getElementById('resetConfirmPass').value;
    const entry = consumeResetToken(token);
    if (!entry || entry.userId !== userId) {
      resetPassError.textContent = 'El enlace expiró, ya se usó o no es válido. Solicitá uno nuevo.';
      resetPassError.hidden = false;
      return;
    }
    if (newPass.length < 4) {
      resetPassError.textContent = 'La contraseña debe tener al menos 4 caracteres.';
      resetPassError.hidden = false;
      return;
    }
    if (newPass !== confirmPass) {
      resetPassError.textContent = 'Las contraseñas no coinciden.';
      resetPassError.hidden = false;
      return;
    }
    const result = resetPasswordById(userId, newPass);
    if (!result.success) {
      resetPassError.textContent = result.message;
      resetPassError.hidden = false;
      return;
    }
    invalidateResetToken(token);
    resetPassSuccess.textContent = 'Contraseña actualizada correctamente. Ya podés ingresar con tu cuenta.';
    resetPassSuccess.hidden = false;
    const user = findUserById(userId);
    window.setTimeout(() => {
      history.replaceState({}, '', window.location.pathname);
      showView(viewLogin);
      if (user) document.getElementById('username').value = user.username;
      document.getElementById('password').value = '';
      loginSuccess.textContent = 'Contraseña actualizada. Iniciá sesión con tu usuario o email y la contraseña nueva.';
      loginSuccess.hidden = false;
    }, 1000);
  });
});
