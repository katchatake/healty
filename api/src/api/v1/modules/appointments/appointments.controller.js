const appointmentsService = require("./appointments.service");

const getAll = async (req, res, next) => {
  try {
    const data = await appointmentsService.getAll();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const data = await appointmentsService.getById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getByPatientId = async (req, res, next) => {
  try {
    const data = await appointmentsService.getByPatientId(req.params.patientId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getByProfessionalId = async (req, res, next) => {
  try {
    const data = await appointmentsService.getByProfessionalId(req.params.professionalId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    // req.user.id viene del middleware verifyToken
    const data = await appointmentsService.create(req.body, req.user.id);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const data = await appointmentsService.update(req.params.id, req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const data = await appointmentsService.deleteById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  getByPatientId,
  getByProfessionalId,
  create,
  update,
  remove,
};
