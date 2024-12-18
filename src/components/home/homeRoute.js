const express = require("express");
const router = express.Router();

const homeController = require("./HomeController");

router.get("/404", homeController._404);
router.use("/admin", homeController.admin_index);
router.use("/", homeController.index);


module.exports = router;
