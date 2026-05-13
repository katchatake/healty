const express = require("express");
const router = express.Router();
const medicalRecordsController = require("./medical_records.controller");
const validateSchema = require("../../../../middleware/validator.middleware");
const {
  createRecordSchema,
  updateRecordSchema,
  recordIdSchema,
} = require("./medical_records.dto");
const Joi = require("joi");
const {
  verifyToken,
  hasRole,
} = require("../../../../middleware/auth.middleware");

// Esquema paramétrico para búsqueda por paciente
const patientIdParamSchema = Joi.object({
  patientId: Joi.number().integer().required(),
});

// Todas las rutas requieren estar logueado
router.use(verifyToken);

// Privacidad clínica: Solo profesionales y administradores pueden interactuar con expedientes médicos
router.use(hasRole(["Admin", "Root", "Professional"]));

router.get("/", medicalRecordsController.getAll);

router.get(
  "/:id",
  validateSchema(recordIdSchema, "params"),
  medicalRecordsController.getById
);

router.get(
  "/patient/:patientId",
  validateSchema(patientIdParamSchema, "params"),
  medicalRecordsController.getByPatientId
);

router.post(
  "/",
  validateSchema(createRecordSchema, "body"),
  medicalRecordsController.create
);

router.patch(
  "/:id",
  validateSchema(recordIdSchema, "params"),
  validateSchema(updateRecordSchema, "body"),
  medicalRecordsController.update
);

// Borrado de expedientes limitado estrictamente a Admins y Root por seguridad de la información
router.delete(
  "/:id",
  hasRole(["Admin", "Root"]),
  validateSchema(recordIdSchema, "params"),
  medicalRecordsController.remove
);

module.exports = router;
