const express = require("express");
const router = express.Router();
const profileController = require("./ProfileController");

router.use("/", profileController.index);

module.exports = router;
