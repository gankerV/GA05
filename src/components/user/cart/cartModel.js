const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../../../config/dataConfig");
const Shop = require("../../shop/shopModel").Shop;
const Order = require("../../shop/orders/orderModel").Order;
const OrderItem = require("../../shop/orders/orderModel").OrderItem;

class CartModel {
    /**
     * Lấy danh sách sản phẩm trong giỏ hàng của user
     * @param {number} userId - ID của người dùng
     * @returns {Array} Danh sách sản phẩm trong giỏ hàng
     */
    static async getCartByUser(userId) {
        try {
            // Kiểm tra userId
            if (!userId) throw new Error("User ID is required.");

            // Lấy thông tin đơn hàng của user có trạng thái 'Pending'
            const order = await Order.findOne({
                where: { user_id: userId, order_status: "Pending" },
                attributes: ["order_id"],
            });

            if (!order) return [];

            const orderId = order.order_id;

            // Lấy thông tin từ bảng order_items và join với bảng shop
            const cartItems = await OrderItem.findAll({
                where: { order_id: orderId },
                include: [
                    {
                        model: Shop,
                        attributes: ["product_name", "price", "imageFileName"],
                    },
                ],
            });

            // Xử lý dữ liệu kết quả
            const baseImageUrl = "../../../public/images/products/";
            return cartItems.map((item) => {
                const itemData = item.get({ plain: true });
                const product = itemData.Shop; // Lấy thông tin sản phẩm từ bảng Shop
                return {
                    order_id: orderId,  // Thêm order_id vào mỗi sản phẩm
                    id: itemData.order_item_id,
                    product_id: itemData.product_id,
                    quantity: itemData.quantity,
                    price: itemData.price,
                    product_name: product.product_name,
                    imageUrl: baseImageUrl + (product.imageFileName || ""),
                };
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Thêm sản phẩm vào giỏ hàng (order_items)
     * @param {number} userId - ID của người dùng
     * @param {number} productId - ID của sản phẩm
     * @param {number} quantity - Số lượng sản phẩm (mặc định là 1)
     * @param {number} price - Giá sản phẩm tại thời điểm thêm vào
     * @returns {Object} Thông tin sản phẩm được thêm
     */
    static async addToCart(userId, productId, quantity = 1, price) {
        try {
            if (!userId || !productId || !price) {
                throw new Error("User ID, Product ID, and Price are required.");
            }

            // Kiểm tra nếu `orderId` là null, tạo mới Order
            let order = await Order.findOne({
                where: { user_id: userId, order_status: "Pending" },
            });

            if (!order) {
                order = await Order.create({
                    user_id: userId,
                    order_status: "Pending",
                    created_at: new Date(),
                    total_amount: 0, // Cập nhật giá trị ban đầu của tổng tiền
                    shipping_address: '', // Cập nhật địa chỉ giao hàng nếu cần
                    payment_status: 'Unpaid', // Trạng thái thanh toán mặc định
                    payment_method: 'Cash On Delivery', // Phương thức thanh toán mặc định
                });
            }

            const orderId = order.order_id;

            // Kiểm tra nếu sản phẩm đã tồn tại trong giỏ hàng
            const existingCartItem = await OrderItem.findOne({
                where: { order_id: orderId, product_id: productId },
            });

            if (existingCartItem) {
                // Nếu sản phẩm đã tồn tại, cập nhật số lượng
                existingCartItem.quantity += quantity;
                await existingCartItem.save();
                return existingCartItem;
            }

            // Nếu sản phẩm chưa có, thêm mới vào `OrderItem`
            const newCartItem = await OrderItem.create({
                order_id: orderId,
                product_id: productId,
                quantity,
                price,
            });

            return newCartItem;
        } catch (error) {
            console.error("Error in addToCart:", error);
            throw error;
        }
    }

    /**
     * Xóa toàn bộ sản phẩm khỏi giỏ hàng của user (Pending)
     * @param {number} userId - ID của người dùng
     * @returns {boolean} Trạng thái xóa
     */
    static async clearCartByUser(userId) {
        try {
            // Lấy thông tin đơn hàng của user có trạng thái 'Pending'
            const order = await Order.findOne({
                where: { user_id: userId, order_status: "Pending" },
                attributes: ["order_id"],
            });

            if (!order) throw new Error("No pending order found for this user.");

            const orderId = order.order_id;

            // Xóa toàn bộ sản phẩm trong giỏ hàng
            const result = await OrderItem.destroy({
                where: { order_id: orderId },
            });
            return result > 0; // Trả về true nếu có ít nhất một sản phẩm bị xóa
        } catch (error) {
            throw error;
        }
    }

    static async updatePaymentStatus(userId) {
        try {
            // Kiểm tra xem người dùng có đơn hàng "Pending" nào không
            const order = await Order.findOne({
                where: { user_id: userId, order_status: "Pending" },
            });

            if (!order) {
                throw new Error("No pending order found for this user.");
            }

            // Cập nhật trạng thái thanh toán thành "Unpaid"
            order.payment_status = "Unpaid";
            await order.save();

            // Trả về đơn hàng đã cập nhật
            return order;
        } catch (error) {
            console.error("Error updating payment status:", error);
            throw error;
        }
    }

    static async updateOrders(orderId, amount) {
        try {
            if (!orderId) throw new Error("Order ID is required.");
            if (amount == null || amount < 0) throw new Error("Amount must be a valid positive number.");
    
            // Tìm đơn hàng theo orderId
            const order = await Order.findOne({
                where: { order_id: orderId },
            });
    
            if (!order) {
                throw new Error("Order not found.");
            }
    
            // Cập nhật thông tin đơn hàng
            order.order_status = "Shipped";
            order.payment_status = "Paid";
            order.amount = amount; // Thêm hoặc cập nhật trường số tiền
            await order.save();
    
            return order;
        } catch (error) {
            console.error("Error updating order:", error);
            throw error;
        }
    }
    
}

OrderItem.belongsTo(Shop, { foreignKey: "product_id" });

module.exports = CartModel;
