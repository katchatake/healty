const paymentsService = require("./payments.service");

const getAll = async (req, res, next) => {
  try {
    const data = await paymentsService.getAll();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const data = await paymentsService.getById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getByAppointmentId = async (req, res, next) => {
  try {
    const data = await paymentsService.getByAppointmentId(req.params.appointmentId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const data = await paymentsService.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const data = await paymentsService.update(req.params.id, req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const data = await paymentsService.deleteById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  getByAppointmentId,
  create,
  update,
  remove,
};
