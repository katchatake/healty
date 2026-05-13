const Joi = require('joi');

const createPaymentSchema = Joi.object({
  appointment_id: Joi.number().integer().required().messages({
    'any.required': 'El ID de la cita es obligatorio',
  }),
  amount: Joi.number().positive().required().messages({
    'number.positive': 'El monto debe ser positivo',
    'any.required': 'El monto es obligatorio',
  }),
  payment_method: Joi.string().valid('cash', 'card', 'transfer').required().messages({
    'any.only': 'El método de pago debe ser cash, card o transfer',
    'any.required': 'El método de pago es obligatorio',
  }),
  status: Joi.string().valid('pending', 'completed', 'failed', 'refunded'),
  payment_date: Joi.date().iso().allow(null),
});

const updatePaymentSchema = Joi.object({
  amount: Joi.number().positive(),
  payment_method: Joi.string().valid('cash', 'card', 'transfer'),
  status: Joi.string().valid('pending', 'completed', 'failed', 'refunded'),
  payment_date: Joi.date().iso().allow(null),
}).min(1);

const paymentIdSchema = Joi.object({
  id: Joi.number().integer().required(),
});

module.exports = {
  createPaymentSchema,
  updatePaymentSchema,
  paymentIdSchema,
};
