module.exports = function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ error: "Los datos enviados no son válidos." });
  }
  if (error.code === 11000) {
    return res.status(409).json({ error: "Ya existe un registro con esos datos." });
  }
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ error: "El cuerpo de la solicitud no contiene JSON válido." });
  }
  if (error.type === "entity.too.large") {
    return res.status(413).json({ error: "La solicitud es demasiado grande." });
  }

  console.error("Error en la solicitud:", error);
  return res.status(500).json({ error: "Ocurrió un error interno. Inténtalo de nuevo más tarde." });
};
