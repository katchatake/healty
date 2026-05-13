const Joi = require('joi');

const createRecordSchema = Joi.object({
  patient_id: Joi.number().integer().required().messages({
    'any.required': 'El ID del paciente es obligatorio',
  }),
  professional_id: Joi.number().integer().required().messages({
    'any.required': 'El ID del profesional es obligatorio',
  }),
  appointment_id: Joi.number().integer().allow(null),
  record_type: Joi.string().max(50).required().messages({
    'string.empty': 'El tipo de expediente no puede estar vacío',
    'any.required': 'El tipo de expediente es obligatorio',
  }),
  notes: Joi.string().allow(null, ''),
  data: Joi.alternatives().try(Joi.object(), Joi.array()).allow(null), // Flexible JSON schema
});

const updateRecordSchema = Joi.object({
  record_type: Joi.string().max(50),
  notes: Joi.string().allow(null, ''),
  data: Joi.alternatives().try(Joi.object(), Joi.array()).allow(null),
}).min(1);

const recordIdSchema = Joi.object({
  id: Joi.number().integer().required(),
});

module.exports = {
  createRecordSchema,
  updateRecordSchema,
  recordIdSchema,
};
