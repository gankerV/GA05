const express = require("express");
const router = express.Router();
const profileController = require("./ProfileController");

router.post("/", profileController.update);
router.use("/", profileController.index);

module.exports = router;
