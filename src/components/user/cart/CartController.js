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

    async getOrderItems(req, res) {
        try {
            const { order_id } = req.query;  // Lấy orderId từ query string
            
            if (!order_id) {
                return res.status(400).json({ error: "Order ID is required." });
            }

            // Lấy thông tin sản phẩm trong đơn hàng từ CartModel
            const orderItems = await CartModel.getOrderItemsByOrderId(order_id);

            // Render hoặc trả về thông tin sản phẩm trong đơn hàng
            res.render("orderDetail", { orderItems });
        } catch (error) {
            console.error("Error fetching order items:", error);
            return res.status(500).json({ error: "Failed to fetch order items." });
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
            const addedProduct = await CartModel.addToCart(
                userId,
                product_id,
                quantity || 1,
                price,
            );

            return res.status(201).json({
                message: "Product added to cart successfully.",
                cartItem: addedProduct,
            });
        } catch (error) {
            console.error("Error adding product to cart:", error);
            return res
                .status(500)
                .json({ error: "Failed to add product to cart." });
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
     * Hàm sắp xếp object theo thứ tự alphabet
     * @param {Object} obj - Object cần sắp xếp
     * @returns {Object} - Object đã được sắp xếp
     */
    static sortObject(obj) {
        const sorted = {};
        const keys = Object.keys(obj).sort();
        keys.forEach((key) => {
            sorted[key] = obj[key];
        });
        return sorted;
    }

    /**
     * Thanh toán giỏ hàng
     * @param {Object} req - Request từ Express
     * @param {Object} res - Response từ Express
     */
    async payCart(req, res) {
        try {
            const userId = req.user.id;
            const totalAmountFromClient = parseFloat(req.query.totalAmount); // Lấy tổng tiền từ query string

            if (!userId) {
                return res.status(400).json({ error: "User ID is required." });
            }

            if (isNaN(totalAmountFromClient) || totalAmountFromClient <= 0) {
                return res.status(400).json({ error: "Invalid total amount." });
            }

            // Lấy cấu hình từ .env
            const tmnCode = process.env.vnp_TmnCode;
            const secretKey = process.env.vnp_HashSecret;
            const vnpUrl = process.env.vnp_Url;
            const returnUrl = process.env.vnp_ReturnUrl;

            // Lấy orderId từ cơ sở dữ liệu
            const cart = await CartModel.getCartByUser(userId); // Gọi hàm lấy đơn hàng của user
            if (!cart || cart.length === 0) {
                return res
                    .status(400)
                    .json({ error: "No pending cart items found." });
            }
            const orderId = cart[0].order_id; // Lấy orderId từ kết quả trả về

            // Tạo tham số cho VNPay
            const date = new Date();
            const { default: dateFormat } = await import("dateformat");
            const createDate = dateFormat(date, "yyyymmddHHmmss");
            const orderTime = dateFormat(date, "HHmmss");

            const ipAddr =
                req.headers["x-forwarded-for"] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket?.remoteAddress;

            let vnp_Params = {
                vnp_Version: "2.1.0",
                vnp_Command: "pay",
                vnp_TmnCode: tmnCode,
                vnp_Locale: "vn",
                vnp_CurrCode: "VND",
                vnp_TxnRef: orderTime, // Sử dụng orderId từ cơ sở dữ liệu
                vnp_OrderInfo: `Thanhtoan${orderId}`, // Thêm thông tin giỏ hàng vào OrderInfo
                vnp_OrderType: "billpayment",
                vnp_Amount: totalAmountFromClient * 100, // VNPay yêu cầu số tiền tính bằng đồng
                vnp_ReturnUrl: returnUrl,
                vnp_IpAddr: ipAddr,
                vnp_CreateDate: createDate,
            };

            // Sắp xếp tham số theo thứ tự alphabet
            vnp_Params = CartController.sortObject(vnp_Params); // Thay đổi đây

            // Tạo chữ ký bảo mật
            const signData = querystring.stringify(vnp_Params, {
                encode: true,
            });
            const hmac = crypto.createHmac("sha512", secretKey);
            const signed = hmac
                .update(Buffer.from(signData, "utf-8"))
                .digest("hex");
            vnp_Params["vnp_SecureHash"] = signed;

            // Tạo URL thanh toán
            const paymentUrl = `${vnpUrl}?${querystring.stringify(vnp_Params, {
                encode: false,
            })}`;
            // Trả về URL thanh toán cho client
            res.json({ url: paymentUrl });
        } catch (error) {
            console.error("Error during checkout:", error);
            res.status(500).json({ error: "Failed to process checkout." });
        }
    }

    async returnCart(req, res) {
        try {
            let vnp_return_Params = req.query;
            const secureHash = vnp_return_Params["vnp_SecureHash"];

            // Xóa các trường không cần thiết
            delete vnp_return_Params["vnp_SecureHash"];
            delete vnp_return_Params["vnp_SecureHashType"];

            // Sắp xếp các tham số
            vnp_return_Params = CartController.sortObject(vnp_return_Params);

            const tmnCode = process.env.vnp_TmnCode;
            const secretKey = process.env.vnp_HashSecret;

            // Tạo chuỗi ký kết
            const querystring = require("qs");
            const signData = querystring.stringify(vnp_return_Params, {
                encode: false,
            });

            // Tạo mã băm HMAC SHA512
            const crypto = require("crypto");
            const hmac = crypto.createHmac("sha512", secretKey);
            const signed = hmac
                .update(Buffer.from(signData, "utf-8"))
                .digest("hex");

            // Kiểm tra tính hợp lệ của chữ ký
            if (secureHash === signed) {
                const responseCode = vnp_return_Params["vnp_ResponseCode"];

                if (responseCode === "00") {
                    // Thanh toán thành công
                    const orderInfo = vnp_return_Params["vnp_OrderInfo"];
                    const orderId = orderInfo.replace("Thanhtoan", ""); // Tách orderId từ OrderInfo

                    const amount =
                        parseFloat(vnp_return_Params["vnp_Amount"]) / 100; // Chuyển số tiền về dạng gốc

                    // Gọi updateOrders với orderId và amount
                    await CartModel.updateOrders(orderId, amount);

                    res.render("VnPay_Success", { orderId, amount });
                } else {
                    res.render("VnPay_Error");
                }
            } else {
                res.render("VnPay_Error");
            }
        } catch (error) {
            console.error("Error during payment confirmation:", error);
            res.status(500).json({ error: "Failed to confirm payment." });
        }
    }

    checkout(req, res) {
        const { totalAmount } = req.query; // Lấy totalAmount từ query string
        if (!totalAmount) {
            return res
                .status(400)
                .json({ message: "Total amount is required" });
        }

        // Render trang thanh toán với totalAmount
        res.render("checkout", { totalAmount });
    }
}

module.exports = new CartController();
