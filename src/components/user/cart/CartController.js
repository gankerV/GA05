const CartModel = require("./cartModel"); // Import cartModel

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
            const { product_id, quantity } = req.body;

            if (!userId || !product_id) {
                return res
                    .status(400)
                    .json({ error: "User ID and Product ID are required." });
            }

            const addedProduct = await CartModel.addToCart(
                userId,
                product_id,
                quantity || 1,
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

            const cleared = await CartModel.clearCart(userId);
            if (cleared) {
                return res.status(200).json({
                    message: "Cart cleared successfully.",
                });
            } else {
                return res.status(404).json({
                    message: "Cart is already empty or user does not exist.",
                });
            }
        } catch (error) {
            console.error("Error clearing cart:", error);
            return res.status(500).json({ error: "Failed to clear cart." });
        }
    }

    checkout(req, res) {
        res.render("checkout");
    }
}

module.exports = new CartController();
