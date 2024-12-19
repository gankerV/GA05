const express = require("express");
const router = express.Router();

const admin = require("./adminController");

router.get("/users", admin.getAllAccounts);
router.use("/", admin.index);

module.exports = router;
