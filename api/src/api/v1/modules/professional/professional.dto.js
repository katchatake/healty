const Joi = require('joi');

const createProfessionalSchema = Joi.object({
  user_id: Joi.number().integer().required().messages({
    'number.base': 'El user_id debe ser un número',
    'any.required': 'El user_id es obligatorio',
  }),
  full_name: Joi.string().max(200).required().messages({
    'string.empty': 'El nombre completo no puede estar vacío',
    'any.required': 'El nombre completo es obligatorio',
  }),
  specialty: Joi.string().max(100).required().messages({
    'string.empty': 'La especialidad no puede estar vacía',
    'any.required': 'La especialidad es obligatoria',
  }),
  license_number: Joi.string().max(50).allow(null, ''),
  bio: Joi.string().allow(null, ''),
  phone: Joi.string().max(20).allow(null, ''),
});

const updateProfessionalSchema = Joi.object({
  user_id: Joi.number().integer(),
  full_name: Joi.string().max(200),
  specialty: Joi.string().max(100),
  license_number: Joi.string().max(50).allow(null, ''),
  bio: Joi.string().allow(null, ''),
  phone: Joi.string().max(20).allow(null, ''),
}).min(1);

const professionalIdSchema = Joi.object({
  id: Joi.number().integer().required(),
});

module.exports = {
  createProfessionalSchema,
  updateProfessionalSchema,
  professionalIdSchema,
};
