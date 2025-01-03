const express = require("express");
const router = express.Router();

const cartController = require("./CartController");

router.post("/add-product", cartController.addToCart);
router.delete("/clear-product", cartController.clearCart);
router.use("/checkout", cartController.checkout);
router.use("/create_payment_url", cartController.payCart);
router.get("/", cartController.getCart);

module.exports = router;
