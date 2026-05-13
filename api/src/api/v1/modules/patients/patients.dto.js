const Joi = require('joi');

const createPatientSchema = Joi.object({
  user_id: Joi.number().integer().required().messages({
    'number.base': 'El user_id debe ser un número',
    'any.required': 'El user_id es obligatorio',
  }),
  full_name: Joi.string().max(200).required().messages({
    'string.empty': 'El nombre completo no puede estar vacío',
    'any.required': 'El nombre completo es obligatorio',
  }),
  date_of_birth: Joi.date().iso().allow(null, ''),
  gender: Joi.string().max(20).allow(null, ''),
  phone: Joi.string().max(20).allow(null, ''),
  emergency_contact: Joi.string().max(100).allow(null, ''),
});

const updatePatientSchema = Joi.object({
  user_id: Joi.number().integer(),
  full_name: Joi.string().max(200),
  date_of_birth: Joi.date().iso().allow(null, ''),
  gender: Joi.string().max(20).allow(null, ''),
  phone: Joi.string().max(20).allow(null, ''),
  emergency_contact: Joi.string().max(100).allow(null, ''),
}).min(1);

const patientIdSchema = Joi.object({
  id: Joi.number().integer().required(),
});

module.exports = {
  createPatientSchema,
  updatePatientSchema,
  patientIdSchema,
};
