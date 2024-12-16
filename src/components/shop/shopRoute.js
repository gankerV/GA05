const express = require("express");
const router = express.Router();

const shopController = require("./ShopController");
const productRouter = require("./product/productRoute");
const ensureAuthenticated = require("../user/auth/authModel");
const cartRoute = require("../user/cart/cartRoute");
const userRoute = require("../user/userRoute");

router.get("/product/:id", productRouter);
router.get("/api", shopController.pagination);
router.use("/", shopController.index);

router.use("/user", userRoute);

module.exports = router;
