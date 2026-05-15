const receptionistsService = require("./receptionists.service");

const getAll = async (req, res, next) => {
  try {
    const data = await receptionistsService.getAllReceptionists();
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const data = await receptionistsService.getReceptionistById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const data = await receptionistsService.createReceptionist(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const data = await receptionistsService.updateReceptionist(req.params.id, req.body);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const data = await receptionistsService.deleteReceptionist(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
