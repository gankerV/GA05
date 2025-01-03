const express = require("express");
const router = express.Router();
const adminController = require("./User_managementController");

router.post("/status/:id", adminController.updateUserStatus);
router.get("/api/:id", adminController.getAccountDetails);
router.get("/api", adminController.getPagination);
router.get("/", adminController.getAllAccounts);

module.exports = router;
