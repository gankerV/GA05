const express = require("express");
const router = express.Router();
const profileController = require("./ProfileController");
const orderController = require("../../shop/orders/OrderController");
const upload = require("../../../config/upload");

router.post(
    "/api/update-avatar",
    upload.single("avatar"),
    profileController.updateAvatar,
);

// truy cập order từ profile 
router.use("/order", orderController.getOrderUser);
router.post("/", profileController.update);
router.use("/", profileController.index);

module.exports = router;
