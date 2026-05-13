const Joi = require('joi');

const createAppointmentSchema = Joi.object({
  patient_id: Joi.number().integer().required().messages({
    'any.required': 'El ID del paciente es obligatorio',
  }),
  professional_id: Joi.number().integer().required().messages({
    'any.required': 'El ID del profesional es obligatorio',
  }),
  service_id: Joi.number().integer().required().messages({
    'any.required': 'El ID del servicio es obligatorio',
  }),
  appointment_date: Joi.date().iso().required().messages({
    'any.required': 'La fecha de la cita es obligatoria',
    'date.format': 'La fecha debe estar en formato ISO 8601',
  }),
  notes: Joi.string().allow(null, ''),
});

const updateAppointmentSchema = Joi.object({
  appointment_date: Joi.date().iso(),
  status: Joi.string().valid('pending', 'confirmed', 'completed', 'cancelled'),
  notes: Joi.string().allow(null, ''),
}).min(1);

const appointmentIdSchema = Joi.object({
  id: Joi.number().integer().required(),
});

module.exports = {
  createAppointmentSchema,
  updateAppointmentSchema,
  appointmentIdSchema,
};
