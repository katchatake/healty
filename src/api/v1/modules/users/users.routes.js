const express = require("express");
const router = express.Router();
const usersController = require("./users.controller");
const validateSchema = require("../../../../middleware/validator.middleware");
const {
  createUserSchema,
  updateUserSchema,
  userIdSchema,
} = require("./users.dto");
const {
  verifyToken,
  hasRole,
} = require("../../../../middleware/auth.middleware");

// Todas las rutas de usuarios requieren autenticación
router.use(verifyToken);

router.get("/", usersController.getAll);

router.get(
  "/:id",
  validateSchema(userIdSchema, "params"),
  usersController.getById,
);

// Solo Admin puede crear, actualizar o borrar usuarios
router.post(
  "/",
  hasRole(["Admin", "Root"]),
  validateSchema(createUserSchema, "body"),
  usersController.create,
);

router.patch(
  "/:id",
  hasRole(["Admin", "Root"]),
  validateSchema(userIdSchema, "params"),
  validateSchema(updateUserSchema, "body"),
  usersController.update,
);

router.delete(
  "/:id",
  hasRole(["Admin", "Root"]),
  validateSchema(userIdSchema, "params"),
  usersController.remove,
);

module.exports = router;
