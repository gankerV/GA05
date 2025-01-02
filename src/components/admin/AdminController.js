const { User } = require("../user/userModel");
const Product = require("../shop/product/productModel");
const Shop = require("../shop/shopModel");
const profileModel = require("../user/profile/profileModel");
const orderModel = require("../shop/orders/orderModel");
const Sequelize = require("sequelize");

allUser = [];
user_per_page = 10;

class AdminController {
    /**
     * Lấy thông tin admin
     * @param {Object} req - Request từ Express
     * @param {Object} res - Response từ Express
     */
    // [GET] '/admin'
    async index(req, res) {
        try {
            // Lấy thông tin người dùng từ
            // session
            // Render trang admin và truyền thông tin người dùng
            res.render("admin", {
                title: "Admin Dashboard",
                user: req.user,
            });
        } catch (error) {
            console.error("Error fetching admin:", error);
            // Xử lý lỗi khi không thể lấy thông tin admin
            return res
                .status(500)
                .render("404", { message: "Failed to fetch admin." });
        }
    }

}

module.exports = new AdminController();
