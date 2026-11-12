const Usuario = require("../models/Usuario");

module.exports = async function requireAdmin(req, res, next) {
  try {
    if (!req.session.adminId) {
      return res.status(401).json({ error: "Inicia sesión para continuar." });
    }

    const admin = await Usuario.findOne({
      _id: req.session.adminId,
      active: true,
      role: "admin"
    }).select("_id username");

    if (!admin) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: "La sesión ya no es válida. Inicia sesión otra vez." });
    }

    req.admin = admin;
    return next();
  } catch (error) {
    return next(error);
  }
};
