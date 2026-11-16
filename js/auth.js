/**
 * HOSPITAL CLÍNICO – Autenticación y datos mock
 * Almacenamiento en localStorage para demo sin backend
 */

const STORAGE_KEYS = {
  USERS: 'hc_users',
  SESSION: 'hc_session',
  TURNOS: 'hc_turnos',
  CONSULTAS: 'hc_consultas',
  ESPECIALIDADES: 'hc_especialidades',
  MEDICOS: 'hc_medicos',
  PACIENTES: 'hc_pacientes',
  LOGS: 'hc_logs',
  RESET_TOKENS: 'hc_reset_tokens'
};

// Datos iniciales de demostración
const INITIAL_DATA = {
  users: [
    { id: 1, username: 'paciente', password: '1234', role: 'paciente', nombre: 'María González', email: 'maria.gonzalez@email.com', telefono: '11-4567-8901', dni: '30123456' },
    { id: 2, username: 'doctor', password: '1234', role: 'doctor', nombre: 'Dr. Carlos Ruiz', email: 'carlos.ruiz@hospital.com', especialidad: 'Cardiología', matricula: 'MN-12345' },
    { id: 3, username: 'recepcion', password: '1234', role: 'recepcion', nombre: 'Ana Martínez', email: 'ana.martinez@hospital.com' },
    { id: 4, username: 'admin', password: '1234', role: 'administrador', nombre: 'Admin Sistema', email: 'admin@hospital.com' },
    { id: 5, username: 'dev', password: '1234', role: 'desarrollador', nombre: 'Dev Team', email: 'dev@hospital.com' },
    { id: 6, username: 'paciente2', password: '1234', role: 'paciente', nombre: 'Juan Pérez', email: 'juan.perez@email.com', telefono: '11-9876-5432', dni: '28987654' },
    { id: 7, username: 'doctor2', password: '1234', role: 'doctor', nombre: 'Dra. Laura Fernández', email: 'laura.fernandez@hospital.com', especialidad: 'Pediatría', matricula: 'MN-67890' }
  ],
  especialidades: [
    { id: 1, nombre: 'Cardiología', descripcion: 'Enfermedades del corazón y sistema circulatorio' },
    { id: 2, nombre: 'Pediatría', descripcion: 'Atención médica de niños y adolescentes' },
    { id: 3, nombre: 'Traumatología', descripcion: 'Lesiones del sistema musculoesquelético' },
    { id: 4, nombre: 'Dermatología', descripcion: 'Enfermedades de la piel' },
    { id: 5, nombre: 'Clínica Médica', descripcion: 'Medicina general e interna' }
  ],
  medicos: [
    { id: 1, userId: 2, nombre: 'Dr. Carlos Ruiz', especialidadId: 1, especialidad: 'Cardiología', disponible: true, horario: '08:00-16:00' },
    { id: 2, userId: 7, nombre: 'Dra. Laura Fernández', especialidadId: 2, especialidad: 'Pediatría', disponible: true, horario: '09:00-17:00' },
    { id: 3, userId: null, nombre: 'Dr. Martín Soto', especialidadId: 3, especialidad: 'Traumatología', disponible: true, horario: '10:00-18:00' },
    { id: 4, userId: null, nombre: 'Dra. Sofía López', especialidadId: 4, especialidad: 'Dermatología', disponible: false, horario: '08:00-14:00' }
  ],
  turnos: [
    { id: 1, pacienteId: 1, pacienteNombre: 'María González', medicoId: 1, medicoNombre: 'Dr. Carlos Ruiz', especialidad: 'Cardiología', fecha: '2026-09-20', hora: '10:00', estado: 'confirmado', motivo: 'Control de presión' },
    { id: 2, pacienteId: 1, pacienteNombre: 'María González', medicoId: 2, medicoNombre: 'Dra. Laura Fernández', especialidad: 'Pediatría', fecha: '2026-09-22', hora: '11:30', estado: 'pendiente', motivo: 'Consulta general' },
    { id: 3, pacienteId: 6, pacienteNombre: 'Juan Pérez', medicoId: 1, medicoNombre: 'Dr. Carlos Ruiz', especialidad: 'Cardiología', fecha: '2026-09-19', hora: '09:00', estado: 'confirmado', motivo: 'Dolor de pecho' },
    { id: 4, pacienteId: 6, pacienteNombre: 'Juan Pérez', medicoId: 3, medicoNombre: 'Dr. Martín Soto', especialidad: 'Traumatología', fecha: '2026-09-25', hora: '15:00', estado: 'pendiente', motivo: 'Dolor de rodilla' }
  ],
  consultas: [
    { id: 1, turnoId: 3, pacienteId: 6, pacienteNombre: 'Juan Pérez', medicoId: 1, medicoNombre: 'Dr. Carlos Ruiz', fecha: '2026-09-18', hora: '09:00', diagnostico: 'Hipertensión arterial leve', notas: 'Se recomienda control de dieta y ejercicio. Control en 30 días.', estado: 'finalizada', receta: 'Enalapril 10mg - 1 comp/día' },
    { id: 2, turnoId: null, pacienteId: 1, pacienteNombre: 'María González', medicoId: 1, medicoNombre: 'Dr. Carlos Ruiz', fecha: '2026-08-15', hora: '10:30', diagnostico: 'Control rutinario - valores normales', notas: 'Paciente estable. Continuar medicación actual.', estado: 'finalizada', receta: '' }
  ],
  logs: [
    { id: 1, fecha: '2026-09-18T10:00:00', usuario: 'admin', accion: 'Inicio de sesión', detalle: 'Login exitoso' },
    { id: 2, fecha: '2026-09-18T09:30:00', usuario: 'recepcion', accion: 'Turno creado', detalle: 'Turno #4 asignado' }
  ]
};

function initStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_DATA.users));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ESPECIALIDADES)) {
    localStorage.setItem(STORAGE_KEYS.ESPECIALIDADES, JSON.stringify(INITIAL_DATA.especialidades));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MEDICOS)) {
    localStorage.setItem(STORAGE_KEYS.MEDICOS, JSON.stringify(INITIAL_DATA.medicos));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TURNOS)) {
    localStorage.setItem(STORAGE_KEYS.TURNOS, JSON.stringify(INITIAL_DATA.turnos));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CONSULTAS)) {
    localStorage.setItem(STORAGE_KEYS.CONSULTAS, JSON.stringify(INITIAL_DATA.consultas));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(INITIAL_DATA.logs));
  }
}

function getUsers() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

function getSession() {
  const s = localStorage.getItem(STORAGE_KEYS.SESSION);
  return s ? JSON.parse(s) : null;
}

function setSession(user) {
  const session = {
    id: user.id,
    username: user.username,
    role: user.role,
    nombre: user.nombre,
    email: user.email
  };
  localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  addLog(user.username, 'Inicio de sesión', 'Login exitoso');
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

function login(usernameOrEmail, password) {
  const users = getUsers();
  const identity = (usernameOrEmail || '').trim().toLowerCase();
  const user = users.find(u =>
    ((u.username || '').trim().toLowerCase() === identity ||
     (u.email || '').trim().toLowerCase() === identity) && u.password === password
  );
  if (user) {
    setSession(user);
    return { success: true, user };
  }
  return { success: false, message: 'Usuario, email o contraseña incorrectos' };
}

/** Buscar usuario existente por nombre de usuario (no crea cuentas). */
function findUserByUsername(username) {
  return getUsers().find(u => u.username === username) || null;
}

function findUserById(id) {
  return getUsers().find(u => u.id === id) || null;
}

function findUserByEmail(email) {
  const e = (email || '').trim().toLowerCase();
  if (!e) return null;
  return getUsers().find(u => (u.email || '').toLowerCase() === e) || null;
}

/**
 * Restablecer contraseña de una cuenta EXISTENTE (por id).
 * No crea usuarios nuevos. En producción se enviaría un enlace por email.
 */
function resetPasswordById(userId, newPassword) {
  const users = getUsers();
  const user = users.find(u => u.id === userId);
  if (!user) {
    return { success: false, message: 'La cuenta no existe. No se puede restablecer la contraseña.' };
  }
  if (!newPassword || newPassword.length < 4) {
    return { success: false, message: 'La contraseña debe tener al menos 4 caracteres.' };
  }
  user.password = newPassword;
  saveUsers(users);
  addLog(user.username, 'Contraseña restablecida', 'Recuperación de cuenta existente desde login');
  return {
    success: true,
    message: 'Contraseña actualizada. Ya podés iniciar sesión con la nueva clave.',
    username: user.username
  };
}

/** Compatibilidad: restablecer por nombre de usuario (solo si la cuenta existe). */
function resetPassword(username, newPassword) {
  const user = findUserByUsername(username);
  if (!user) {
    return { success: false, message: 'No existe una cuenta con ese usuario.' };
  }
  return resetPasswordById(user.id, newPassword);
}

/**
 * Registro de cuenta NUEVA (solo rol paciente).
 * No permite auto-registrarse como doctor/admin/recepción.
 */
function registerUser({ username, password, nombre, email, dni, telefono }) {
  const users = getUsers();
  const uname = (username || '').trim().toLowerCase();
  if (!uname || uname.length < 3) {
    return { success: false, message: 'El usuario debe tener al menos 3 caracteres.' };
  }
  if (users.some(u => u.username.toLowerCase() === uname)) {
    return { success: false, message: 'Ese nombre de usuario ya está en uso. Elegí otro.' };
  }
  if (!password || password.length < 4) {
    return { success: false, message: 'La contraseña debe tener al menos 4 caracteres.' };
  }
  if (!nombre || !nombre.trim()) {
    return { success: false, message: 'Ingresá tu nombre completo.' };
  }
  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return { success: false, message: 'Ingresá un email válido.' };
  }
  if (users.some(u => (u.email || '').trim().toLowerCase() === normalizedEmail)) {
    return { success: false, message: 'Ya existe una cuenta con ese correo. Iniciá sesión o recuperá tu contraseña.' };
  }
  const nuevo = {
    id: nextId(users),
    username: (username || '').trim(),
    password,
    role: 'paciente',
    nombre: nombre.trim(),
    email: normalizedEmail,
    telefono: (telefono || '').trim() || undefined,
    dni: (dni || '').trim() || undefined
  };
  users.push(nuevo);
  saveUsers(users);
  addLog(nuevo.username, 'Registro de cuenta', 'Nueva cuenta paciente creada desde login');
  return { success: true, user: nuevo, message: 'Cuenta creada correctamente. Ya podés iniciar sesión.' };
}


/** Tokens de recuperación de contraseña (válidos 1 hora). */
function getResetTokens() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.RESET_TOKENS) || '{}');
}

function saveResetTokens(map) {
  localStorage.setItem(STORAGE_KEYS.RESET_TOKENS, JSON.stringify(map));
}

function createResetToken(userId) {
  // Token aleatorio para esta demo local. El token se usa una sola vez y vence en una hora.
  let randomPart = '';
  if (window.crypto && window.crypto.getRandomValues) {
    const bytes = new Uint8Array(24);
    window.crypto.getRandomValues(bytes);
    randomPart = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  } else {
    randomPart = Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
  const token = 'hc_' + randomPart;
  const map = getResetTokens();
  map[token] = { userId, expires: Date.now() + 60 * 60 * 1000 };
  // limpiar vencidos
  Object.keys(map).forEach(k => {
    if (map[k].expires < Date.now()) delete map[k];
  });
  saveResetTokens(map);
  return token;
}

function consumeResetToken(token) {
  const map = getResetTokens();
  const entry = map[token];
  if (!entry) return null;
  if (entry.expires < Date.now()) {
    delete map[token];
    saveResetTokens(map);
    return null;
  }
  return entry;
}

function invalidateResetToken(token) {
  const map = getResetTokens();
  delete map[token];
  saveResetTokens(map);
}

function requireAuth() {
  const session = getSession();
  if (!session) {
    window.location.href = '../index.html';
    return null;
  }
  return session;
}

function getRoleRedirect(role) {
  const map = {
    paciente: 'pages/paciente.html',
    doctor: 'pages/doctor.html',
    recepcion: 'pages/recepcion.html',
    administrador: 'pages/admin.html',
    desarrollador: 'pages/desarrollador.html'
  };
  return map[role] || 'index.html';
}

// CRUD helpers
function getTurnos() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.TURNOS) || '[]');
}

function saveTurnos(data) {
  localStorage.setItem(STORAGE_KEYS.TURNOS, JSON.stringify(data));
}

function getConsultas() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.CONSULTAS) || '[]');
}

function saveConsultas(data) {
  localStorage.setItem(STORAGE_KEYS.CONSULTAS, JSON.stringify(data));
}

function getMedicos() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.MEDICOS) || '[]');
}

function saveMedicos(data) {
  localStorage.setItem(STORAGE_KEYS.MEDICOS, JSON.stringify(data));
}

function getEspecialidades() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.ESPECIALIDADES) || '[]');
}

function saveEspecialidades(data) {
  localStorage.setItem(STORAGE_KEYS.ESPECIALIDADES, JSON.stringify(data));
}

function getLogs() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS) || '[]');
}

function addLog(usuario, accion, detalle) {
  const logs = getLogs();
  logs.unshift({
    id: Date.now(),
    fecha: new Date().toISOString(),
    usuario,
    accion,
    detalle
  });
  if (logs.length > 100) logs.pop();
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
}

function nextId(arr) {
  return arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1;
}

// Inicializar al cargar
initStorage();
