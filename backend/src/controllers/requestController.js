const mongoose = require("mongoose");
const Catalogo = require("../models/Catalogo");
const Contacto = require("../models/Contacto");
const Cotizacion = require("../models/Cotizacion");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateCustomer(name, email) {
  return typeof name === "string" &&
    name.trim().length >= 3 &&
    name.trim().length <= 120 &&
    typeof email === "string" &&
    email.trim().length <= 254 &&
    EMAIL_PATTERN.test(email.trim());
}

async function createContact(req, res) {
  const body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
  const { name, email, service, message } = body;
  if (
    !validateCustomer(name, email) ||
    typeof service !== "string" ||
    !service.trim() ||
    service.trim().length > 120 ||
    typeof message !== "string" ||
    message.trim().length < 10 ||
    message.trim().length > 3000
  ) {
    return res.status(400).json({ error: "Revisa tu nombre, correo, servicio y mensaje." });
  }

  await Contacto.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    service: service.trim(),
    message: message.trim()
  });
  return res.status(201).json({ message: "Solicitud guardada correctamente." });
}

function priceAmount(price) {
  const digits = String(price).replace(/\D/g, "");
  return digits ? Number(digits) : null;
}

async function createQuote(req, res) {
  const body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body : {};
  const { name, email, items, modality, priority } = body;
  if (!validateCustomer(name, email)) {
    return res.status(400).json({ error: "Escribe un nombre y un correo válidos." });
  }
  if (
    !Array.isArray(items) ||
    items.length < 1 ||
    items.length > 20 ||
    !["remote", "onsite"].includes(modality) ||
    !["normal", "urgent"].includes(priority)
  ) {
    return res.status(400).json({ error: "La selección de la cotización no es válida." });
  }

  const requested = new Map();
  for (const item of items) {
    if (
      !item ||
      !mongoose.isValidObjectId(item.serviceId) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 20
    ) {
      return res.status(400).json({ error: "Cada servicio debe tener una cantidad entre 1 y 20." });
    }
    if (requested.has(String(item.serviceId))) {
      return res.status(400).json({ error: "No repitas un servicio en la misma cotización." });
    }
    requested.set(String(item.serviceId), item.quantity);
  }

  // Los precios se vuelven a consultar aquí: nunca se confía en importes enviados por el navegador.
  const catalog = await Catalogo.find({ _id: { $in: [...requested.keys()] } });
  if (catalog.length !== requested.size) {
    return res.status(400).json({ error: "Uno de los servicios ya no está disponible. Recarga el catálogo." });
  }

  let subtotal = 0;
  let pendingItems = 0;
  const quoteItems = catalog.map(service => {
    const quantity = requested.get(service.id);
    const unitPrice = priceAmount(service.price);
    if (unitPrice === null) pendingItems += 1;
    const itemSubtotal = (unitPrice || 0) * quantity;
    subtotal += itemSubtotal;
    return {
      serviceId: service.id,
      name: service.name,
      quantity,
      unitPrice,
      subtotal: itemSubtotal
    };
  });
  const estimatedTotal =
    Math.round(subtotal * (priority === "urgent" ? 1.2 : 1)) + (modality === "onsite" ? 30000 : 0);

  await Cotizacion.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    items: quoteItems,
    modality,
    priority,
    estimatedTotal,
    pendingItems
  });

  return res.status(201).json({ estimatedTotal, pendingItems });
}

module.exports = { createContact, createQuote };
