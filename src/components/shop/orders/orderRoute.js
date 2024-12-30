// orderRoutes.js
const express = require('express');
const router = express.Router();
const OrderController = require('./OrderController');

// Route to get all orders (for admin)
router.post('/update_status/:id', OrderController.updateOrderStatus);
router.use('/', OrderController.getAllOrders);

module.exports = router;
