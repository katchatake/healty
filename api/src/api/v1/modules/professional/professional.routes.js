const express = require("express");
const router = express.Router();
const professionalController = require("./professional.controller");
const validateSchema = require("../../../../middleware/validator.middleware");
const {
  createProfessionalSchema,
  updateProfessionalSchema,
  professionalIdSchema,
} = require("./professional.dto");
const {
  verifyToken,
  hasRole,
} = require("../../../../middleware/auth.middleware");

// Todas las rutas requieren autenticación
router.use(verifyToken);

router.get("/", professionalController.getAll);

router.get(
  "/:id",
  validateSchema(professionalIdSchema, "params"),
  professionalController.getById
);

// Solo Admin y Root pueden crear, actualizar o borrar perfiles de profesionales
router.post(
  "/",
  hasRole(["Admin", "Root"]),
  validateSchema(createProfessionalSchema, "body"),
  professionalController.create
);

router.patch(
  "/:id",
  hasRole(["Admin", "Root"]),
  validateSchema(professionalIdSchema, "params"),
  validateSchema(updateProfessionalSchema, "body"),
  professionalController.update
);

router.delete(
  "/:id",
  hasRole(["Admin", "Root"]),
  validateSchema(professionalIdSchema, "params"),
  professionalController.remove
);

module.exports = router;
