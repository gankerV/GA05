const express = require("express");
const router = express.Router();
const adminController = require("./Report_managementController");

router.get('/', adminController.getAllReports);

module.exports = router;