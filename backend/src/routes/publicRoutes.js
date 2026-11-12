const express = require("express");
const { rateLimit } = require("express-rate-limit");
const asyncHandler = require("../middleware/asyncHandler");
const catalogController = require("../controllers/catalogController");
const requestController = require("../controllers/requestController");

const router = express.Router();
const publicRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) =>
    res.status(429).json({ error: "Demasiadas solicitudes. Inténtalo de nuevo en 15 minutos." })
});

router.get("/services", asyncHandler(catalogController.listPublic));
router.post("/contact", publicRequestLimiter, asyncHandler(requestController.createContact));
router.post("/quotes", publicRequestLimiter, asyncHandler(requestController.createQuote));

module.exports = router;
