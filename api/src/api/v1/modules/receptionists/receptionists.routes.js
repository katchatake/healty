const express = require("express");
const router = express.Router();
const receptionistsController = require("./receptionists.controller");
const validateSchema = require("../../../../middleware/validator.middleware");
const {
  createReceptionistSchema,
  updateReceptionistSchema,
  receptionistIdSchema,
} = require("./receptionists.dto");
const {
  verifyToken,
  hasRole,
} = require("../../../../middleware/auth.middleware");

router.use(verifyToken);
router.use(hasRole(["Admin", "Root"]));

router.get("/", receptionistsController.getAll);

router.get(
  "/:id",
  validateSchema(receptionistIdSchema, "params"),
  receptionistsController.getById
);

router.post(
  "/",
  validateSchema(createReceptionistSchema, "body"),
  receptionistsController.create
);

router.patch(
  "/:id",
  validateSchema(receptionistIdSchema, "params"),
  validateSchema(updateReceptionistSchema, "body"),
  receptionistsController.update
);

router.delete(
  "/:id",
  validateSchema(receptionistIdSchema, "params"),
  receptionistsController.remove
);

module.exports = router;
