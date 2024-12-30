// OrderController.js
const orderModel = require('./orderModel');

// [GET] /admin/orders
class OrderController {
  // [GET] '/admin/orders' - View list of orders sorted by order creation time
  async getAllOrders(req, res) {
    try {
        const page = parseInt(req.query.page) || 1; // Current page (default is 1)
        const limit = 8; // Number of orders per page
        const offset = (page - 1) * limit; // Starting position
        const { status, sortOrder } = req.query;

        // Filtering condition
        const whereCondition = {};
        if (status) {
            whereCondition["order_status"] = status; // Filter orders by status
        }

        const order = new orderModel();
        // Fetch orders with pagination and sorting
        const orders = await order.getOrders({
            limit,
            offset,
            where: whereCondition,
            order: [["order_date", sortOrder || "DESC"]],
        });
        
        // Chuyển đổi dữ liệu Sequelize thành dữ liệu thuần túy
        const plainOrders = orders.rows.map(order => order.get({ plain: true }));
        
        // Render view với dữ liệu thuần túy
        res.render("order_management", {
            orders: plainOrders,
            currentPage: page,
            totalPages: Math.ceil(orders.count / limit),
        });
      } catch (error) {
          console.error("Error fetching orders:", error);
          res.status(500).json({ message: "Internal Server Error" });
      }
  }

} 

module.exports = new OrderController();
