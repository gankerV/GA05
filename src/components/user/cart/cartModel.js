const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../../../config/dataConfig");
const Shop = require("../../shop/shopModel").Shop;

const Cart = sequelize.define(
    "Cart",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            allowNull: false,
        },
        added_at: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.NOW,
        },
    },
    {
        tableName: "cart",
        timestamps: false,
    }
);

class CartModel {
    /**
     * Lấy danh sách sản phẩm trong giỏ hàng của user
     * @param {number} userId - ID của người dùng
     * @returns {Array} Danh sách sản phẩm trong giỏ hàng
     */
    static async getCartByUser(userId) {
        try {
            // Kiểm tra user_id
            if (!userId) throw new Error("User ID is required.");

            // Lấy thông tin từ bảng cart và join với bảng shop
            const cartItems = await Cart.findAll({
                where: { user_id: userId },
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
                    id: itemData.id,
                    product_id: itemData.product_id,
                    user_id: itemData.user_id,
                    quantity: itemData.quantity,
                    added_at: itemData.added_at,
                    product_name: product.product_name,
                    price: product.price,
                    imageUrl: baseImageUrl + (product.imageFileName || ""),
                };
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Thêm sản phẩm vào giỏ hàng
     * @param {number} userId - ID của người dùng
     * @param {number} productId - ID của sản phẩm
     * @param {number} quantity - Số lượng sản phẩm (mặc định là 1)
     * @returns {Object} Thông tin sản phẩm được thêm
     */
    static async addToCart(userId, productId, quantity = 1) {
        try {
            // Kiểm tra user_id và product_id
            if (!userId || !productId) {
                throw new Error("User ID and Product ID are required.");
            }

            // Kiểm tra xem sản phẩm đã có trong giỏ chưa
            const existingCartItem = await Cart.findOne({
                where: { user_id: userId, product_id: productId },
            });

            if (existingCartItem) {
                // Nếu đã tồn tại, cập nhật số lượng
                existingCartItem.quantity += quantity;
                await existingCartItem.save();
                return existingCartItem;
            }

            // Nếu chưa có, thêm mới vào giỏ
            const newCartItem = await Cart.create({
                user_id: userId,
                product_id: productId,
                quantity,
            });

            return newCartItem;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Xóa toàn bộ sản phẩm khỏi giỏ hàng của người dùng
     * @param {number} userId - ID của người dùng
     * @returns {boolean} Trạng thái xóa
     */
    static async clearCart(userId) {
        try {
            // Xóa tất cả các mục trong giỏ hàng thuộc về userId
            const result = await Cart.destroy({
                where: { user_id: userId },
            });
            return result > 0; // Trả về true nếu có ít nhất một sản phẩm bị xóa
        } catch (error) {
            throw error;
        }
    }
}

Cart.belongsTo(Shop, { foreignKey: "product_id" });

module.exports = CartModel;
