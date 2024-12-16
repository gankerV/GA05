const express = require("express");
const router = express.Router();

const productController = require("./productController");

router.get("/:id", productController.index);
router.post("/:id/post-review", productController.writeReview);

module.exports = router;
