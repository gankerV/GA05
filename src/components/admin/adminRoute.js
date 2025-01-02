const express = require("express");
const router = express.Router();
const upload = require('../../config/upload'); 
const ordersRoute = require("../shop/orders/orderRoute");
const userManageRoute = require("./user_management/user_manamentRoute");
const productManagementRoute = require("./product_management/product_managementRoute");
const reportManagementRoute = require("./report_management/report_managementRoute");

const admin = require("./AdminController");

router.use("/users", userManageRoute);

router.use("/products", productManagementRoute);

router.use("/orders", ordersRoute);

router.use('/reports', reportManagementRoute);

router.use("/", admin.index);

module.exports = router;