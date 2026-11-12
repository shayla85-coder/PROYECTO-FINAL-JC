const mongoose = require("mongoose");
const Catalogo = require("../models/Catalogo");

function validateCatalogInput(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Envía los datos del servicio en un objeto JSON." };
  }

  const input = {
    name: typeof body.name === "string" ? body.name.trim() : "",
    category: typeof body.category === "string" ? body.category : "",
    price: typeof body.price === "string" ? body.price.trim() : "",
    description: typeof body.description === "string" ? body.description.trim() : ""
  };

  if (input.name.length < 2 || input.name.length > 120) {
    return { error: "El nombre debe tener entre 2 y 120 caracteres." };
  }
  if (!["Mantenimiento", "Desarrollo"].includes(input.category)) {
    return { error: "Selecciona una categoría válida." };
  }
  if (!input.price || input.price.length > 80) {
    return { error: "Escribe un precio o indica que requiere cotización." };
  }
  if (!/^(Cotización|Desde \$\d{1,3}(\.\d{3})*)$/.test(input.price)) {
    return { error: "El precio debe ser 'Cotización' o tener el formato 'Desde $50.000'." };
  }
  if (!input.description || input.description.length > 500) {
    return { error: "La descripción debe tener entre 1 y 500 caracteres." };
  }
  return { input };
}

function asFrontendService(service) {
  return {
    id: service.id,
    n: service.name,
    c: service.category,
    p: service.price,
    d: service.description
  };
}

async function listPublic(req, res) {
  const services = await Catalogo.find().sort({ createdAt: 1 });
  return res.json({ services: services.map(asFrontendService) });
}

async function create(req, res) {
  const { input, error } = validateCatalogInput(req.body);
  if (error) return res.status(400).json({ error });

  const service = await Catalogo.create(input);
  return res.status(201).json({ service: asFrontendService(service) });
}

async function update(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "El identificador del servicio no es válido." });
  }
  const { input, error } = validateCatalogInput(req.body);
  if (error) return res.status(400).json({ error });

  const service = await Catalogo.findByIdAndUpdate(req.params.id, input, {
    new: true,
    runValidators: true
  });
  if (!service) return res.status(404).json({ error: "El servicio ya no existe." });
  return res.json({ service: asFrontendService(service) });
}

async function remove(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "El identificador del servicio no es válido." });
  }
  const service = await Catalogo.findByIdAndDelete(req.params.id);
  if (!service) return res.status(404).json({ error: "El servicio ya no existe." });
  return res.json({ message: "Servicio eliminado." });
}

module.exports = { listPublic, create, update, remove };
