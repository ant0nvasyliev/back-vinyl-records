const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const UserController = require("../controllers/user");
const uploadMiddleware = require("../middleware/upload");
const router = express.Router();

router.patch(
  "/avatars",
  authMiddleware,
  uploadMiddleware.single("avatar"),
  UserController.uploadAvatar
);

module.exports = router;
