const express = require("express");
const router = express.Router();
const ensureAuthenticated = require("./auth/authModel");
const userController = require("./UserController");
const AuthController = require("./auth/AuthController");
const cartRouter = require("./cart/cartRoute");

router.get("/register", userController.register);
router.post("/register", userController.verifyRegister);
router.get("/register/check-email", userController.checkRegistrationEmail);
router.get("/register/activate/:token", userController.activateAccount);

// Route đăng nhập
router.get("/login", AuthController.loginPage);
router.post("/login", AuthController.login);
router.get("/logout", AuthController.logout);

router.use("/cart", ensureAuthenticated, cartRouter);

module.exports = router;
