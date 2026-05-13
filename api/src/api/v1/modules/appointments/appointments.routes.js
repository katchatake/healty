const express = require("express");
const router = express.Router();
const appointmentsController = require("./appointments.controller");
const validateSchema = require("../../../../middleware/validator.middleware");
const {
  createAppointmentSchema,
  updateAppointmentSchema,
  appointmentIdSchema,
} = require("./appointments.dto");
const Joi = require("joi");
const {
  verifyToken,
  hasRole,
} = require("../../../../middleware/auth.middleware");

// Esquemas paramétricos para búsquedas específicas
const patientIdParamSchema = Joi.object({
  patientId: Joi.number().integer().required(),
});

const professionalIdParamSchema = Joi.object({
  professionalId: Joi.number().integer().required(),
});

// Todas las rutas requieren estar logueado
router.use(verifyToken);

router.get("/", appointmentsController.getAll);

router.get(
  "/:id",
  validateSchema(appointmentIdSchema, "params"),
  appointmentsController.getById
);

router.get(
  "/patient/:patientId",
  validateSchema(patientIdParamSchema, "params"),
  appointmentsController.getByPatientId
);

router.get(
  "/professional/:professionalId",
  validateSchema(professionalIdParamSchema, "params"),
  appointmentsController.getByProfessionalId
);

// Permitimos a Pacientes, Recepcionistas, Profesionales, Admin y Root crear citas
router.post(
  "/",
  hasRole(["Admin", "Root", "Receptionist", "Professional", "Patient"]),
  validateSchema(createAppointmentSchema, "body"),
  appointmentsController.create
);

router.patch(
  "/:id",
  hasRole(["Admin", "Root", "Receptionist", "Professional"]),
  validateSchema(appointmentIdSchema, "params"),
  validateSchema(updateAppointmentSchema, "body"),
  appointmentsController.update
);

// Solo Admin/Root pueden eliminar (borrado físico). Para otros roles se debería usar PATCH status='cancelled'
router.delete(
  "/:id",
  hasRole(["Admin", "Root"]),
  validateSchema(appointmentIdSchema, "params"),
  appointmentsController.remove
);

module.exports = router;
