const express = require("express");
const router = express.Router();

const productController = require("./productController");

router.get("/product/:id", productController.index);

module.exports = router;