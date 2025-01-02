const express = require("express");
const router = express.Router();
const upload = require('../../../config/upload'); 

const adminController = require("./Product_managementController");

router.post("/add", upload.fields([
    { name: 'photos', maxCount: 1 }, // Chỉ cho phép một ảnh chính
    { name: 'sub_image1', maxCount: 1 },
    { name: 'sub_image2', maxCount: 1 },
    { name: 'sub_image3', maxCount: 1 },
    { name: 'sub_image4', maxCount: 1 },
]), adminController.createProduct);
router.post("/update/:id", upload.fields([
    { name: 'photos', maxCount: 1 }, // Chỉ cho phép một ảnh chính
    { name: 'sub_image1', maxCount: 1 },
    { name: 'sub_image2', maxCount: 1 },
    { name: 'sub_image3', maxCount: 1 },
    { name: 'sub_image4', maxCount: 1 },
]), adminController.updateProduct);
router.post("/delete/:id", adminController.deleteProduct);
router.use("/", adminController.getAllProducts);

module.exports = router;