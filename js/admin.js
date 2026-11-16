document.addEventListener('DOMContentLoaded', () => {
  const session = initDashboard(['administrador']);
  if (!session) return;

  function renderInicio() {
    document.getElementById('statUsers').textContent = getUsers().length;
    document.getElementById('statMedicos').textContent = getMedicos().length;
    document.getElementById('statTurnos').textContent = getTurnos().length;
    document.getElementById('statConsultas').textContent = getConsultas().length;
  }

  function renderUsuarios() {
    const users = getUsers();
    const tbody = document.getElementById('usuariosBody');
    tbody.innerHTML = users.map(u => `
      <tr>
        <td>${u.id}</td>
        <td>${u.username}</td>
        <td>${u.nombre}</td>
        <td><span class="badge badge-info">${formatRole(u.role)}</span></td>
        <td>${u.email || '-'}</td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="window.editUsuario(${u.id})">Editar</button>
          ${u.id !== session.id ? `<button class="btn btn-sm btn-danger" onclick="window.deleteUsuario(${u.id})">Eliminar</button>` : ''}
        </td>
      </tr>
    `).join('');
  }

  function renderMedicos() {
    const medicos = getMedicos();
    const tbody = document.getElementById('medicosBody');
    tbody.innerHTML = medicos.map(m => `
      <tr>
        <td>${m.nombre}</td>
        <td>${m.especialidad}</td>
        <td>${m.horario}</td>
        <td>${m.disponible ? '<span class="badge badge-success">Sí</span>' : '<span class="badge badge-danger">No</span>'}</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="window.deleteMedico(${m.id})">Eliminar</button>
        </td>
      </tr>
    `).join('');
  }

  function renderEspecs() {
    const especs = getEspecialidades();
    const tbody = document.getElementById('especsBody');
    tbody.innerHTML = especs.map(e => `
      <tr>
        <td>${e.id}</td>
        <td>${e.nombre}</td>
        <td>${e.descripcion || '-'}</td>
        <td>
          <button class="btn btn-sm btn-danger" onclick="window.deleteEspec(${e.id})">Eliminar</button>
        </td>
      </tr>
    `).join('');
  }

  function renderReportes() {
    const turnos = getTurnos();
    const consultas = getConsultas();
    document.getElementById('repPendientes').textContent = turnos.filter(t => t.estado === 'pendiente').length;
    document.getElementById('repConfirmados').textContent = turnos.filter(t => t.estado === 'confirmado').length;
    document.getElementById('repCancelados').textContent = turnos.filter(t => t.estado === 'cancelado').length;
    document.getElementById('repConsultas').textContent = consultas.filter(c => c.estado === 'finalizada').length;

    const porEspec = {};
    turnos.forEach(t => {
      porEspec[t.especialidad] = (porEspec[t.especialidad] || 0) + 1;
    });
    const tbody = document.getElementById('repEspecsBody');
    const entries = Object.entries(porEspec);
    tbody.innerHTML = entries.length
      ? entries.map(([nombre, cant]) => `<tr><td>${nombre}</td><td>${cant}</td></tr>`).join('')
      : '<tr><td colspan="2" class="text-muted">Sin datos</td></tr>';
  }

  // Usuarios
  document.getElementById('btnNuevoUsuario').addEventListener('click', () => {
    document.getElementById('modalUsuarioTitle').textContent = 'Nuevo usuario';
    document.getElementById('userEditId').value = '';
    document.getElementById('userUsername').value = '';
    document.getElementById('userPassword').value = '';
    document.getElementById('userNombre').value = '';
    document.getElementById('userEmail').value = '';
    document.getElementById('userRole').value = 'paciente';
    openModal('modalUsuario');
  });

  window.editUsuario = function(id) {
    const u = getUsers().find(x => x.id === id);
    if (!u) return;
    document.getElementById('modalUsuarioTitle').textContent = 'Editar usuario';
    document.getElementById('userEditId').value = u.id;
    document.getElementById('userUsername').value = u.username;
    document.getElementById('userPassword').value = '';
    document.getElementById('userNombre').value = u.nombre;
    document.getElementById('userEmail').value = u.email || '';
    document.getElementById('userRole').value = u.role;
    openModal('modalUsuario');
  };

  document.getElementById('btnSaveUsuario').addEventListener('click', () => {
    const id = document.getElementById('userEditId').value;
    const username = document.getElementById('userUsername').value.trim();
    const password = document.getElementById('userPassword').value;
    const nombre = document.getElementById('userNombre').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const role = document.getElementById('userRole').value;

    if (!username || !nombre) return;

    const users = getUsers();
    if (id) {
      const u = users.find(x => x.id == id);
      if (u) {
        u.username = username;
        if (password) u.password = password;
        u.nombre = nombre;
        u.email = email;
        u.role = role;
      }
    } else {
      if (users.some(x => x.username === username)) {
        alert('El nombre de usuario ya existe');
        return;
      }
      users.push({
        id: nextId(users),
        username,
        password: password || '1234',
        role,
        nombre,
        email
      });
    }
    saveUsers(users);
    addLog(session.username, id ? 'Usuario editado' : 'Usuario creado', username);
    closeModal('modalUsuario');
    showAlert('alertUsuarios', 'Usuario guardado correctamente.', 'success');
    renderUsuarios();
    renderInicio();
  });

  window.deleteUsuario = function(id) {
    if (!confirm('¿Eliminar este usuario?')) return;
    let users = getUsers().filter(u => u.id !== id);
    saveUsers(users);
    addLog(session.username, 'Usuario eliminado', `ID ${id}`);
    showAlert('alertUsuarios', 'Usuario eliminado.', 'success');
    renderUsuarios();
    renderInicio();
  };

  // Médicos
  document.getElementById('btnNuevoMedico').addEventListener('click', () => {
    const especs = getEspecialidades();
    document.getElementById('medEspecialidad').innerHTML =
      especs.map(e => `<option value="${e.id}">${e.nombre}</option>`).join('');
    document.getElementById('medNombre').value = '';
    document.getElementById('medHorario').value = '08:00-16:00';
    document.getElementById('medDisponible').checked = true;
    openModal('modalMedico');
  });

  document.getElementById('btnSaveMedico').addEventListener('click', () => {
    const nombre = document.getElementById('medNombre').value.trim();
    const especialidadId = parseInt(document.getElementById('medEspecialidad').value);
    const horario = document.getElementById('medHorario').value.trim();
    const disponible = document.getElementById('medDisponible').checked;
    const espec = getEspecialidades().find(e => e.id === especialidadId);

    if (!nombre || !espec) return;

    const medicos = getMedicos();
    medicos.push({
      id: nextId(medicos),
      userId: null,
      nombre,
      especialidadId,
      especialidad: espec.nombre,
      disponible,
      horario
    });
    saveMedicos(medicos);
    addLog(session.username, 'Médico creado', nombre);
    closeModal('modalMedico');
    showAlert('alertMedicos', 'Médico agregado.', 'success');
    renderMedicos();
    renderInicio();
  });

  window.deleteMedico = function(id) {
    if (!confirm('¿Eliminar este médico?')) return;
    saveMedicos(getMedicos().filter(m => m.id !== id));
    addLog(session.username, 'Médico eliminado', `ID ${id}`);
    showAlert('alertMedicos', 'Médico eliminado.', 'success');
    renderMedicos();
    renderInicio();
  };

  // Especialidades
  document.getElementById('btnNuevaEspec').addEventListener('click', () => {
    document.getElementById('especNombre').value = '';
    document.getElementById('especDesc').value = '';
    openModal('modalEspec');
  });

  document.getElementById('btnSaveEspec').addEventListener('click', () => {
    const nombre = document.getElementById('especNombre').value.trim();
    const descripcion = document.getElementById('especDesc').value.trim();
    if (!nombre) return;

    const especs = getEspecialidades();
    especs.push({ id: nextId(especs), nombre, descripcion });
    saveEspecialidades(especs);
    addLog(session.username, 'Especialidad creada', nombre);
    closeModal('modalEspec');
    showAlert('alertEspecs', 'Especialidad agregada.', 'success');
    renderEspecs();
  });

  window.deleteEspec = function(id) {
    if (!confirm('¿Eliminar esta especialidad?')) return;
    saveEspecialidades(getEspecialidades().filter(e => e.id !== id));
    addLog(session.username, 'Especialidad eliminada', `ID ${id}`);
    showAlert('alertEspecs', 'Especialidad eliminada.', 'success');
    renderEspecs();
  };

  // Config
  document.getElementById('btnResetData').addEventListener('click', () => {
    if (!confirm('¿Restablecer todos los datos de demostración? Se perderán los cambios.')) return;
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    initStorage();
    addLog(session.username, 'Datos restablecidos', 'Reset a datos iniciales');
    showAlert('alertConfig', 'Datos restablecidos correctamente. Recargue las páginas de otros roles si están abiertas.', 'success');
    renderInicio();
    renderUsuarios();
    renderMedicos();
    renderEspecs();
    renderReportes();
  });

  document.querySelectorAll('.nav-item[data-module]').forEach(item => {
    item.addEventListener('click', () => {
      const m = item.dataset.module;
      if (m === 'inicio') renderInicio();
      if (m === 'usuarios') renderUsuarios();
      if (m === 'medicos') renderMedicos();
      if (m === 'especialidades') renderEspecs();
      if (m === 'reportes') renderReportes();
    });
  });

  renderInicio();
  renderUsuarios();
  renderMedicos();
  renderEspecs();
  renderReportes();
});
