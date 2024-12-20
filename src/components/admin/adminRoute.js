const express = require("express");
const router = express.Router();

const admin = require("./AdminController");

router.get("/users", admin.getAllAccounts);
router.get("/profile/:id", admin.getAccountProfile);
router.post("/profile/update/:id", admin.updateAccountProfile);
router.use("/", admin.index);

module.exports = router;
