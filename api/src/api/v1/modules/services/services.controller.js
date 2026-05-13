const servicesService = require("./services.service");

const getAll = async (req, res, next) => {
  try {
    const data = await servicesService.getAll();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const data = await servicesService.getById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getByProfessionalId = async (req, res, next) => {
  try {
    const data = await servicesService.getByProfessionalId(req.params.professionalId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const data = await servicesService.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const data = await servicesService.update(req.params.id, req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const data = await servicesService.deleteById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  getByProfessionalId,
  create,
  update,
  remove,
};
