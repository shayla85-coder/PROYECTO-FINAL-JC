const express = require("express");
const { rateLimit } = require("express-rate-limit");
const asyncHandler = require("../middleware/asyncHandler");
const requireAdmin = require("../middleware/requireAdmin");
const authController = require("../controllers/authController");
const adminController = require("../controllers/adminController");
const catalogController = require("../controllers/catalogController");

const router = express.Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Espera 15 minutos e inténtalo otra vez." }
});

router.post("/login", loginLimiter, asyncHandler(authController.login));
router.post("/logout", requireAdmin, asyncHandler(authController.logout));
router.get("/session", requireAdmin, authController.currentSession);
router.use(requireAdmin);

router.get("/messages", asyncHandler(adminController.listMessages));
router.delete("/messages/:id", asyncHandler(adminController.deleteMessage));
router.get("/quotes", asyncHandler(adminController.listQuotes));
router.get("/services", asyncHandler(catalogController.listPublic));
router.post("/services", asyncHandler(catalogController.create));
router.put("/services/:id", asyncHandler(catalogController.update));
router.delete("/services/:id", asyncHandler(catalogController.remove));

module.exports = router;
