const Joi = require('joi');

const createServiceSchema = Joi.object({
  professional_id: Joi.number().integer().required().messages({
    'number.base': 'El professional_id debe ser un número',
    'any.required': 'El professional_id es obligatorio',
  }),
  name: Joi.string().max(150).required().messages({
    'string.empty': 'El nombre del servicio no puede estar vacío',
    'any.required': 'El nombre del servicio es obligatorio',
  }),
  description: Joi.string().allow(null, ''),
  price: Joi.number().precision(2).min(0).required().messages({
    'number.base': 'El precio debe ser numérico',
    'number.min': 'El precio no puede ser negativo',
    'any.required': 'El precio es obligatorio',
  }),
  duration_minutes: Joi.number().integer().min(1).required().messages({
    'number.base': 'La duración debe ser un número entero',
    'number.min': 'La duración debe ser al menos 1 minuto',
    'any.required': 'La duración es obligatoria',
  }),
  is_visible: Joi.boolean().default(true),
});

const updateServiceSchema = Joi.object({
  professional_id: Joi.number().integer(),
  name: Joi.string().max(150),
  description: Joi.string().allow(null, ''),
  price: Joi.number().precision(2).min(0),
  duration_minutes: Joi.number().integer().min(1),
  is_visible: Joi.boolean(),
}).min(1);

const serviceIdSchema = Joi.object({
  id: Joi.number().integer().required(),
});

module.exports = {
  createServiceSchema,
  updateServiceSchema,
  serviceIdSchema,
};
