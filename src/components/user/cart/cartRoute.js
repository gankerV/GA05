const express = require("express");
const router = express.Router();

const cartController = require("./CartController");

router.get("/", cartController.getCart);
router.post("/add-product", cartController.addToCart);
router.delete("/clear-product", cartController.clearCart);

module.exports = router;
