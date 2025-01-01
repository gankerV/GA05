const express = require("express");
const router = express.Router();
const profileController = require("./ProfileController");
const upload = require("../../../config/upload");

router.post(
    "/api/update-avatar",
    upload.single("avatar"),
    profileController.updateAvatar,
);
router.post("/", profileController.update);
router.use("/", profileController.index);

module.exports = router;
