const express = require("express");
const productController = require("./productController");
const ensureAuthenticated = require("../../user/auth/authModel");
const router = express.Router();

router.get("/:id", productController.index);
router.post(
    "/:id/post-review",
    ensureAuthenticated,
    productController.writeReview,
);
router.get("/:id/api/reviews", productController.getReviews);

module.exports = router;
