const express = require("express");
const router = express.Router();
const upload = require('../../config/upload'); 
const ordersRoute = require("../shop/orders/orderRoute");

const admin = require("./AdminController");

router.get("/users", admin.getAllAccounts);
router.get("/users/:id", admin.getAccountDetails);
router.post("/users/status/:id", admin.updateUserStatus);

router.get("/profile/:id", admin.getAccountProfile);
router.post("/profile/update/:id", admin.updateAccountProfile);

router.post("/products/add", upload.fields([
    { name: 'photos', maxCount: 1 }, // Chỉ cho phép một ảnh chính
    { name: 'sub_image1', maxCount: 1 },
    { name: 'sub_image2', maxCount: 1 },
    { name: 'sub_image3', maxCount: 1 },
    { name: 'sub_image4', maxCount: 1 },
]), admin.createProduct);
router.post("/products/update/:id", upload.fields([
    { name: 'photos', maxCount: 1 }, // Chỉ cho phép một ảnh chính
    { name: 'sub_image1', maxCount: 1 },
    { name: 'sub_image2', maxCount: 1 },
    { name: 'sub_image3', maxCount: 1 },
    { name: 'sub_image4', maxCount: 1 },
]), admin.updateProduct);
router.post("/products/delete/:id", admin.deleteProduct);
router.use("/products", admin.getAllProducts);

router.use("/orders", ordersRoute);

router.get('/reports', admin.getAllReports);

router.use("/", admin.index);

module.exports = router;