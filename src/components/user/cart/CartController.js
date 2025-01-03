const CartModel = require("./cartModel");
const querystring = require("qs");
const crypto = require("crypto");

class CartController {
    /**
     * Lấy giỏ hàng của người dùng
     * @param {Object} req - Request từ Express
     * @param {Object} res - Response từ Express
     */
    async getCart(req, res) {
        try {
            const userId = req.user.id;

            if (!userId) {
                return res.status(400).json({ error: "User ID is required." });
            }

            // Lấy danh sách sản phẩm trong giỏ hàng dựa trên userId
            const cartItems = await CartModel.getCartByUser(userId);
            res.render("cart", { cartItems });
        } catch (error) {
            console.error("Error fetching cart:", error);
            return res.status(500).json({ error: "Failed to fetch cart." });
        }
    }

    /**
     * Thêm sản phẩm vào giỏ hàng
     * @param {Object} req - Request từ Express
     * @param {Object} res - Response từ Express
     */
    async addToCart(req, res) {
        try {
            const userId = req.user.id;
            const { product_id, quantity, price } = req.body;
            if (!userId || !product_id || !price) {
                return res.status(400).json({
                    error: "User ID, Product ID, and Price are required.",
                });
            }

            // Thêm sản phẩm vào giỏ hàng dựa trên userId
            const addedProduct = await CartModel.addToCart(userId, product_id, quantity || 1, price);

            return res.status(201).json({
                message: "Product added to cart successfully.",
                cartItem: addedProduct,
            });
        } catch (error) {
            console.error("Error adding product to cart:", error);
            return res.status(500).json({ error: "Failed to add product to cart." });
        }
    }

    /**
     * Xóa toàn bộ sản phẩm khỏi giỏ hàng của người dùng
     * @param {Object} req - Request từ Express
     * @param {Object} res - Response từ Express
     */
    async clearCart(req, res) {
        try {
            const userId = req.user.id;

            if (!userId) {
                return res.status(400).json({ error: "User ID is required." });
            }

            // Xóa toàn bộ sản phẩm trong giỏ hàng dựa trên userId
            const cleared = await CartModel.clearCartByUser(userId);
            if (cleared) {
                return res.status(200).json({
                    message: "Cart cleared successfully.",
                });
            } else {
                return res.status(404).json({
                    message: "Cart is already empty.",
                });
            }
        } catch (error) {
            console.error("Error clearing cart:", error);
            return res.status(500).json({ error: "Failed to clear cart." });
        }
    }

    /**
     * Thanh toán giỏ hàng
     * @param {Object} req - Request từ Express
     * @param {Object} res - Response từ Express
     */
    async payCart(req, res) {
        try {
            const userId = req.user.id;

            if (!userId) {
                return res.status(400).json({ error: "User ID is required." });
            }

            // Lấy danh sách sản phẩm trong giỏ hàng dựa trên userId
            const cartItems = await CartModel.getCartByUser(userId);

            if (!cartItems || cartItems.length === 0) {
                return res.status(400).json({ error: "Your cart is empty." });
            }

            // Tính tổng giá trị đơn hàng
            const totalAmount = cartItems.reduce((total, item) => {
                return total + item.price * item.quantity;
            }, 0);

            if (totalAmount <= 0) {
                return res.status(400).json({ error: "Invalid cart total." });
            }

            // Lấy cấu hình từ .env
            const tmnCode = process.env.vnp_TmnCode;
            const secretKey = process.env.vnp_HashSecret;
            const vnpUrl = process.env.vnp_Url;
            const returnUrl = process.env.vnp_ReturnUrl;

            // Tạo tham số cho VNPay
            const date = new Date();
            const { default: dateFormat } = await import("dateformat");
            const createDate = dateFormat(date, "yyyymmddHHmmss");
            const orderId = dateFormat(date, "HHmmss");

            const ipAddr = req.headers["x-forwarded-for"] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket?.remoteAddress;

            let vnp_Params = {
                vnp_Version: "2.1.0",
                vnp_Command: "pay",
                vnp_TmnCode: tmnCode,
                vnp_Locale: "vn",
                vnp_CurrCode: "VND",
                vnp_TxnRef: orderId,
                vnp_OrderInfo: `Thanh toán đơn hàng ${orderId}`,
                vnp_OrderType: "billpayment",
                vnp_Amount: totalAmount * 100, // VNPay yêu cầu số tiền tính bằng đồng
                vnp_ReturnUrl: returnUrl,
                vnp_IpAddr: ipAddr,
                vnp_CreateDate: createDate,
            };

            // Sắp xếp tham số theo thứ tự alphabet
            vnp_Params = this.sortObject(vnp_Params);

            // Tạo chữ ký bảo mật
            const signData = querystring.stringify(vnp_Params, { encode: false });
            const hmac = crypto.createHmac("sha512", secretKey);
            const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
            vnp_Params["vnp_SecureHash"] = signed;

            // Tạo URL thanh toán
            const paymentUrl = `${vnpUrl}?${querystring.stringify(vnp_Params, { encode: false })}`;

            // Chuyển hướng người dùng tới VNPay
            res.redirect(paymentUrl);
        } catch (error) {
            console.error("Error during checkout:", error);
            res.status(500).json({ error: "Failed to process checkout." });
        }
    }

    /**
     * Hàm sắp xếp object theo thứ tự alphabet
     * @param {Object} obj - Object cần sắp xếp
     * @returns {Object} - Object đã được sắp xếp
     */
    sortObject(obj) {
        const sorted = {};
        const keys = Object.keys(obj).sort();
        keys.forEach((key) => {
            sorted[key] = obj[key];
        });
        return sorted;
    }

    checkout(req, res) {
        res.render("checkout");
    }
}

module.exports = new CartController();
