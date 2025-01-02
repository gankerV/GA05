const express = require("express");
const router = express.Router();
const AuthModel = require("./auth/authModel");
const userController = require("./UserController");
const authController = require("./auth/AuthController");
const cartRouter = require("./cart/cartRoute");
const authRouter = require("./auth/authRoute");
const profileRouter = require("./profile/profileRoute");

router.get("/register", userController.register);
router.post("/register", userController.verifyRegister);
router.get("/register/check-email", userController.checkRegistrationEmail);
router.get("/register/activate/:token", userController.activateAccount);

// Route đăng nhập
router.get("/login", authController.loginPage);
router.post("/login", authController.login);
router.get("/logout", authController.logout);

// Route đăng nhập bằng Google
router.use("/login", authRouter);

// Route quên mật khẩu
router.post("/login/identity", userController.identity);
router.use("/login/identity", userController.findEmail);

// Route đổi mật khẩu
router.post("/change-password", userController.changePassword);
router.use("/change-password", userController.changePasswordPage);

router.use("/profile", AuthModel.userAuthenticated, profileRouter);
router.use("/cart", AuthModel.userAuthenticated, cartRouter);

module.exports = router;
