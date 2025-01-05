// OrderController.js
const orderModel = require('./orderModel');
const {User} = require('../../user/userModel');

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

    async updateOrderStatus(req, res){
        const { order_id, status } = req.body;     // Nhận trạng thái từ form

        try {
            console.log('Updating order status:', order_id, status);
            const order = new orderModel();
            const singgleOrder = await order.getOrderById(order_id);  // Lấy đơn hàng từ DB
            if (singgleOrder) {
                singgleOrder.order_status = status;  // Cập nhật trạng thái
                await singgleOrder.save();           // Lưu thay đổi
                res.redirect('/admin/orders');      // Chuyển hướng về danh sách đơn hàng
            } else {
                res.status(404).json({ success: false, message: 'Order not found' });
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    async getOrderUser(req, res) {
        try {
            const userId = req.user.id; 
            
            const order = new orderModel();
            // Fetch all orders for the user
            const orders = await order.getOrdersByUserId( userId );
            
            // Convert Sequelize data to plain JSON
            const plainOrders = orders.map(order => order.get({ plain: true }));
            
            // Render view with all orders
            res.render("order_user", {
                orders: plainOrders,
            });
        } catch (error) {
            console.error("Error fetching user orders:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
} 

module.exports = new OrderController();
