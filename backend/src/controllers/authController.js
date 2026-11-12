const bcrypt = require("bcryptjs");
const Usuario = require("../models/Usuario");
const DUMMY_PASSWORD_HASH = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

async function login(req, res) {
  const body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
  const username = typeof body.username === "string" ? body.username.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!username || !password) {
    return res.status(400).json({ error: "Escribe tu usuario y contraseña." });
  }

  const admin = await Usuario.findOne({ username, active: true }).select("+passwordHash");
  const passwordMatches = await bcrypt.compare(password, admin ? admin.passwordHash : DUMMY_PASSWORD_HASH);

  if (!admin || !passwordMatches) {
    return res.status(401).json({ error: "Usuario o contraseña incorrectos." });
  }

  // Regenerar el identificador impide reutilizar un ID de sesión previo al inicio de sesión.
  await new Promise((resolve, reject) => {
    req.session.regenerate(error => (error ? reject(error) : resolve()));
  });
  req.session.adminId = admin.id;

  return res.json({ message: "Sesión iniciada.", username: admin.username });
}

async function logout(req, res) {
  await new Promise((resolve, reject) => {
    req.session.destroy(error => (error ? reject(error) : resolve()));
  });
  res.clearCookie("zynalix.sid");
  return res.json({ message: "Sesión cerrada." });
}

function currentSession(req, res) {
  return res.json({ authenticated: true, username: req.admin.username });
}

module.exports = { login, logout, currentSession };
