const express = require("express");
const router = express.Router();
const cartController = require("./CartController");

router.get("/checkout", cartController.checkout);
router.use("/", cartController.cart);

module.exports = router;
