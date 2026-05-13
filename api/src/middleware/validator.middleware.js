const Boom = require('@hapi/boom');

const validateSchema = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((detail) => ({
        message: detail.message,
        path: detail.path,
      }));
      
      // Using Boom.badRequest with custom data
      return next(Boom.badRequest('Validation Error', details));
    }
    
    next();
  };
};

module.exports = validateSchema;
