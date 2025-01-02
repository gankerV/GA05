const express = require("express");
const router = express.Router();

const shopController = require("./ShopController");
const productRouter = require("./product/productRoute");
const userRoute = require("../user/userRoute");

router.get("/api", shopController.pagination);
router.use("/product", productRouter);
router.use("/", shopController.index);

router.use("/user", userRoute);

module.exports = router;
