const express = require("express");
const router = express.Router();
const ensureAuthenticated = require("./auth/authModel");

const userController = require("./UserController");

const AuthController = require('./auth/AuthController');

router.get("/register", userController.register);
router.post("/register", userController.verifyRegister);

// Route đăng nhập
router.get("/login", AuthController.loginPage); 
router.post("/login", AuthController.login); 
router.get("/logout", AuthController.logout);

router.get("/cart", ensureAuthenticated, userController.cart);
router.get("/checkout", ensureAuthenticated, userController.checkout);

module.exports = router;
