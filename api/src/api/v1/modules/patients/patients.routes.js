const express = require("express");
const router = express.Router();
const patientsController = require("./patients.controller");
const validateSchema = require("../../../../middleware/validator.middleware");
const {
  createPatientSchema,
  updatePatientSchema,
  patientIdSchema,
} = require("./patients.dto");
const {
  verifyToken,
  hasRole,
} = require("../../../../middleware/auth.middleware");

// Todas las rutas requieren autenticación
router.use(verifyToken);

router.get("/", patientsController.getAll);

router.get(
  "/:id",
  validateSchema(patientIdSchema, "params"),
  patientsController.getById
);

// Múltiples roles pueden crear y editar pacientes
router.post(
  "/",
  hasRole(["Admin", "Root", "Receptionist", "Professional"]),
  validateSchema(createPatientSchema, "body"),
  patientsController.create
);

router.patch(
  "/:id",
  hasRole(["Admin", "Root", "Receptionist", "Professional"]),
  validateSchema(patientIdSchema, "params"),
  validateSchema(updatePatientSchema, "body"),
  patientsController.update
);

// Borrar pacientes es una operación destructiva, la limitamos solo a administradores
router.delete(
  "/:id",
  hasRole(["Admin", "Root"]),
  validateSchema(patientIdSchema, "params"),
  patientsController.remove
);

module.exports = router;
