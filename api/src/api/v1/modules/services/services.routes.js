const express = require("express");
const router = express.Router();
const servicesController = require("./services.controller");
const validateSchema = require("../../../../middleware/validator.middleware");
const {
  createServiceSchema,
  updateServiceSchema,
  serviceIdSchema,
} = require("./services.dto");
const Joi = require("joi");
const {
  verifyToken,
  hasRole,
} = require("../../../../middleware/auth.middleware");

// Esquema específico para validar el professionalId en la ruta GET /professional/:professionalId
const professionalIdParamSchema = Joi.object({
  professionalId: Joi.number().integer().required(),
});

// Todas las rutas requieren autenticación
router.use(verifyToken);

router.get("/", servicesController.getAll);

router.get(
  "/:id",
  validateSchema(serviceIdSchema, "params"),
  servicesController.getById
);

router.get(
  "/professional/:professionalId",
  validateSchema(professionalIdParamSchema, "params"),
  servicesController.getByProfessionalId
);

// Solo Admin y Root pueden crear, actualizar o borrar servicios (según plan)
router.post(
  "/",
  hasRole(["Admin", "Root"]),
  validateSchema(createServiceSchema, "body"),
  servicesController.create
);

router.patch(
  "/:id",
  hasRole(["Admin", "Root"]),
  validateSchema(serviceIdSchema, "params"),
  validateSchema(updateServiceSchema, "body"),
  servicesController.update
);

router.delete(
  "/:id",
  hasRole(["Admin", "Root"]),
  validateSchema(serviceIdSchema, "params"),
  servicesController.remove
);

module.exports = router;
