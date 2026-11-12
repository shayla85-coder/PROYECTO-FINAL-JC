const Contacto = require("../models/Contacto");
const Cotizacion = require("../models/Cotizacion");

async function listMessages(req, res) {
  const documents = await Contacto.find().sort({ created_at: -1 }).lean();
  const messages = documents.map(message => ({
    id: String(message._id),
    name: message.name,
    email: message.email,
    service: message.service,
    message: message.message,
    created_at: message.created_at
  }));
  return res.json({ messages });
}

async function deleteMessage(req, res) {
  const message = await Contacto.findByIdAndDelete(req.params.id);
  if (!message) return res.status(404).json({ error: "El mensaje ya no existe." });
  return res.json({ message: "Mensaje eliminado." });
}

async function listQuotes(req, res) {
  const documents = await Cotizacion.find().sort({ created_at: -1 }).lean();
  const quotes = documents.map(quote => ({
    id: String(quote._id),
    name: quote.name,
    email: quote.email,
    items: quote.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      subtotal: item.subtotal
    })),
    modality: quote.modality,
    priority: quote.priority,
    estimated_total: quote.estimatedTotal,
    pending_items: quote.pendingItems,
    created_at: quote.created_at
  }));
  return res.json({ quotes });
}

module.exports = { listMessages, deleteMessage, listQuotes };
