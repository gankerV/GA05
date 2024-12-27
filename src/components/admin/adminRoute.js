const express = require("express");
const router = express.Router();
const upload = require('../../config/upload'); 

const admin = require("./AdminController");

router.get("/users", admin.getAllAccounts);
router.get("/users/:id", admin.getAccountDetails);
router.post("/users/status/:id", admin.updateUserStatus);

router.get("/profile/:id", admin.getAccountProfile);
router.post("/profile/update/:id", admin.updateAccountProfile);

router.post("/products/add", upload.single('photos'), admin.createProduct);
router.use("/products", admin.getAllProducts);

router.get("/orders", admin.getAllOrders);

router.use("/", admin.index);

module.exports = router;