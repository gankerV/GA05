const express = require("express");
const router = express.Router();
const ensureAuthenticated = require("./auth/authModel");

const passport = require("../../config/passportConfig");  


const userController = require("./UserController");

router.get("/register", userController.register);
router.post("/register", userController.verifyRegister);

router.get("/login", userController.login);
router.post("/login", passport.authenticate('local', {
    successRedirect: "/home",  // Redirect khi đăng nhập thành công
    failureRedirect: "/user/login",  // Redirect khi đăng nhập thất bại
    failureFlash: true  // Cho phép hiển thị thông báo lỗi
}));

router.get("/cart", userController.cart);
router.get("/checkout", ensureAuthenticated, userController.checkout);

module.exports = router;
