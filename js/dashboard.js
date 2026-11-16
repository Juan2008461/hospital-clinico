/**
 * Utilidades comunes para paneles
 */

function setupSidebar() {
  const toggle = document.querySelector('.menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');

  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('open');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });
  }
}

function setupLogout() {
  const btn = document.getElementById('btnLogout');
  if (btn) {
    btn.addEventListener('click', () => {
      const session = getSession();
      if (session) addLog(session.username, 'Cierre de sesión', 'Logout');
      clearSession();
      window.location.href = '../index.html';
    });
  }
}

function setupNav() {
  const items = document.querySelectorAll('.nav-item[data-module]');
  items.forEach(item => {
    item.addEventListener('click', () => {
      const moduleId = item.dataset.module;
      showModule(moduleId);

      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      // Cerrar sidebar en mobile
      const sidebar = document.querySelector('.sidebar');
      const overlay = document.querySelector('.sidebar-overlay');
      if (sidebar) sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('open');

      // Actualizar título
      const title = document.getElementById('pageTitle');
      if (title) title.textContent = item.dataset.title || item.textContent.trim();
    });
  });
}

function showModule(id) {
  document.querySelectorAll('.module').forEach(m => m.classList.remove('active'));
  const mod = document.getElementById('module-' + id);
  if (mod) mod.classList.add('active');
}

function fillUserInfo(session) {
  const nameEl = document.getElementById('userName');
  const roleEl = document.getElementById('userRole');
  const avatarEl = document.getElementById('userAvatar');

  if (nameEl) nameEl.textContent = session.nombre;
  if (roleEl) roleEl.textContent = formatRole(session.role);
  if (avatarEl) {
    const initials = session.nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    avatarEl.textContent = initials;
  }
}

function formatRole(role) {
  const map = {
    paciente: 'Paciente',
    doctor: 'Doctor',
    recepcion: 'Recepción',
    administrador: 'Administrador',
    desarrollador: 'Desarrollador'
  };
  return map[role] || role;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateTime(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function estadoBadge(estado) {
  const map = {
    pendiente: 'badge-warning',
    confirmado: 'badge-info',
    cancelado: 'badge-danger',
    finalizada: 'badge-success',
    en_curso: 'badge-info',
    reprogramado: 'badge-secondary'
  };
  const cls = map[estado] || 'badge-secondary';
  const label = estado ? estado.replace('_', ' ') : '-';
  return `<span class="badge ${cls}">${label}</span>`;
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

function showAlert(containerId, message, type = 'success') {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  setTimeout(() => { container.innerHTML = ''; }, 4000);
}

// Inicialización común
function initDashboard(allowedRoles) {
  const session = requireAuth();
  if (!session) return null;

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    window.location.href = getRoleRedirect(session.role);
    return null;
  }

  fillUserInfo(session);
  setupSidebar();
  setupLogout();
  setupNav();

  // Activar primer módulo
  const first = document.querySelector('.nav-item[data-module]');
  if (first) first.click();

  return session;
}
