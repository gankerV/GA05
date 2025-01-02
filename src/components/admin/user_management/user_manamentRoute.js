const express = require("express");
const router = express.Router();
const adminController = require("./User_managementController");

router.get("/", adminController.getAllAccounts);
router.get("/:id", adminController.getAccountDetails);
router.post("/status/:id", adminController.updateUserStatus);
module.exports = router;
