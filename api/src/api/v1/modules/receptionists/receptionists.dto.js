const Joi = require('joi');

const createReceptionistSchema = Joi.object({
  user_id: Joi.number().integer().required(),
  full_name: Joi.string().max(200).required(),
  phone: Joi.string().max(20).allow(null, ''),
  assigned_to_professional_id: Joi.number().integer().allow(null),
});

const updateReceptionistSchema = Joi.object({
  user_id: Joi.number().integer(),
  full_name: Joi.string().max(200),
  phone: Joi.string().max(20).allow(null, ''),
  assigned_to_professional_id: Joi.number().integer().allow(null),
}).min(1);

const receptionistIdSchema = Joi.object({
  id: Joi.number().integer().required(),
});

module.exports = {
  createReceptionistSchema,
  updateReceptionistSchema,
  receptionistIdSchema,
};
