// orderRoutes.js
const express = require('express');
const router = express.Router();
const OrderController = require('./OrderController');

// Route to get all orders (for admin)
router.use('/', OrderController.getAllOrders);

module.exports = router;
