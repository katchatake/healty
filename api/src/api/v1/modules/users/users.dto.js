const Joi = require('joi');

const createUserSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'El email debe tener un formato válido',
    'any.required': 'El email es obligatorio',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'La contraseña debe tener al menos 6 caracteres',
    'any.required': 'La contraseña es obligatoria',
  }),
  is_active: Joi.boolean().default(true),
});

const updateUserSchema = Joi.object({
  email: Joi.string().email(),
  password: Joi.string().min(6),
  is_active: Joi.boolean(),
}).min(1); // Exigir al menos un campo para actualizar

const userIdSchema = Joi.object({
  id: Joi.number().integer().required(),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  userIdSchema,
};
