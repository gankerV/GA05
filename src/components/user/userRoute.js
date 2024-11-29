const express = require("express");
const router = express.Router();
const ensureAuthenticated = require('./auth/authModel');

const userController = require("./UserController");

router.get("/register", userController.register);
router.get("/login", userController.login);
router.get("/cart", userController.cart);
router.get("/checkout",ensureAuthenticated, userController.checkout);

module.exports = router;
