const express = require("express");
const router = express.Router();
const ensureAuthenticated = require("./auth/authModel");
const userController = require("./UserController");
const authController = require("./auth/AuthController");
const cartRouter = require("./cart/cartRoute");
const authRouter = require("./auth/authRoute");

router.get("/register", userController.register);
router.post("/register", userController.verifyRegister);
router.get("/register/check-email", userController.checkRegistrationEmail);
router.get("/register/activate/:token", userController.activateAccount);

// Route đăng nhập
router.get("/login", authController.loginPage);
router.post("/login", authController.login);
router.use("/login", authRouter);
router.get("/logout", authController.logout);

router.use("/cart", ensureAuthenticated, cartRouter);

module.exports = router;
