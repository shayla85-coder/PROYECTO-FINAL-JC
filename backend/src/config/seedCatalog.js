const Catalogo = require("../models/Catalogo");

const initialServices = [
  {
    name: "Mantenimiento preventivo",
    category: "Mantenimiento",
    price: "Desde $50.000",
    description: "Limpieza interna, pasta térmica y revisión completa para que rinda como el primer día."
  },
  {
    name: "Reparación y formateo",
    category: "Mantenimiento",
    price: "Desde $60.000",
    description: "Instalación de sistema, programas y respaldo de tu información."
  },
  {
    name: "Redes y WiFi",
    category: "Mantenimiento",
    price: "Desde $80.000",
    description: "Cobertura estable en casa u oficina, configuración y seguridad."
  },
  {
    name: "Recuperación de datos",
    category: "Mantenimiento",
    price: "Cotización",
    description: "Rescatamos archivos de discos y memorias dañadas."
  },
  {
    name: "Páginas web",
    category: "Desarrollo",
    price: "Desde $600.000",
    description: "Sitios rápidos, responsive y con tu identidad de marca."
  },
  {
    name: "Aplicaciones a la medida",
    category: "Desarrollo",
    price: "Cotización",
    description: "Sistemas de inventario, reservas o gestión hechos para tu negocio."
  },
  {
    name: "Tiendas en línea",
    category: "Desarrollo",
    price: "Desde $1.200.000",
    description: "Catálogo, carrito y panel para administrar tus productos."
  },
  {
    name: "Automatización con IA",
    category: "Desarrollo",
    price: "Cotización",
    description: "Chatbots y flujos que atienden a tus clientes por ti."
  }
];

async function seedCatalog() {
  if ((await Catalogo.estimatedDocumentCount()) > 0) return;
  await Catalogo.insertMany(initialServices);
  console.info("Catálogo inicial cargado en MongoDB.");
}

module.exports = seedCatalog;
