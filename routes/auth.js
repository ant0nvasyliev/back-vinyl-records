const { Router, json } = require("express");
const AuthController = require("../controllers/auth");

const router = Router();
const jsonParser = json();

const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", jsonParser, AuthController.register);

router.post("/login", jsonParser, AuthController.login);

router.post("/logout", jsonParser,  AuthController.logout);

// router.get("/current", jsonParser, authMiddleware, AuthController.current);

// router.get("/verify/:token", AuthController.verify);

router.get("/refresh", AuthController.refresh);

router.get("/activate/:link", AuthController.activate);
// "Кнопка відправили листа повторно"
// router.post("/verify", jsonParser, AuthController.resendVerify);

module.exports = router;
