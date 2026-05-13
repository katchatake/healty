const express = require("express");
const router = express.Router();
const paymentsController = require("./payments.controller");
const validateSchema = require("../../../../middleware/validator.middleware");
const {
  createPaymentSchema,
  updatePaymentSchema,
  paymentIdSchema,
} = require("./payments.dto");
const Joi = require("joi");
const {
  verifyToken,
  hasRole,
} = require("../../../../middleware/auth.middleware");

// Esquema paramétrico para búsqueda por cita
const appointmentIdParamSchema = Joi.object({
  appointmentId: Joi.number().integer().required(),
});

// Todas las rutas requieren estar logueado
router.use(verifyToken);

// Los Médicos (Professional) pueden consultar el estatus de los pagos, al igual que los operativos
router.get(
  "/",
  hasRole(["Admin", "Root", "Receptionist", "Professional"]),
  paymentsController.getAll
);

router.get(
  "/:id",
  hasRole(["Admin", "Root", "Receptionist", "Professional"]),
  validateSchema(paymentIdSchema, "params"),
  paymentsController.getById
);

router.get(
  "/appointment/:appointmentId",
  hasRole(["Admin", "Root", "Receptionist", "Professional"]),
  validateSchema(appointmentIdParamSchema, "params"),
  paymentsController.getByAppointmentId
);

// Creación y actualización (procesar dinero) está restringido solo a Recepcionistas y Admins
router.post(
  "/",
  hasRole(["Admin", "Root", "Receptionist"]),
  validateSchema(createPaymentSchema, "body"),
  paymentsController.create
);

router.patch(
  "/:id",
  hasRole(["Admin", "Root", "Receptionist"]),
  validateSchema(paymentIdSchema, "params"),
  validateSchema(updatePaymentSchema, "body"),
  paymentsController.update
);

// Borrado físico restringido al nivel más alto
router.delete(
  "/:id",
  hasRole(["Admin", "Root"]),
  validateSchema(paymentIdSchema, "params"),
  paymentsController.remove
);

module.exports = router;
