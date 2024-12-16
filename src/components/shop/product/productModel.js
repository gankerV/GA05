const { DataTypes, Sequelize } = require("sequelize");
const { Op } = require("sequelize");
const sequelize = require("../../../config/dataConfig");
const ShopModel = require("../shopModel");
const Shop = ShopModel.Shop;

const Product = sequelize.define(
    "product",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        product_status: {
            type: DataTypes.ENUM("In Stock", "Out Of Stock"),
            defaultValue: "In Stock",
        },
    },
    {
        tableName: "product", // Tên bảng trong cơ sở dữ liệu
        timestamps: false, // Bỏ qua cột createdAt và updatedAt
    },
);
Product.belongsTo(Shop, { foreignKey: "id", targetKey: "id" });
// Thêm các phương thức truy vấn vào lớp ProductModel
class ProductModel {
    /**
     * Truy vấn chi tiết sản phẩm từ bảng product và shop dựa trên id sản phẩm.
     * @param {number} productId - ID của sản phẩm
     * @returns {Object} - Thông tin sản phẩm bao gồm các thuộc tính của cả product và shop
     */
    static async getProductById(productId) {
        try {
            const productIdInt = parseInt(productId, 10);

            const product = await Product.findOne({
                where: { id: productIdInt }, // Điều kiện tìm sản phẩm theo ID
                include: [
                    {
                        model: Shop, // Kết hợp bảng Shop
                        required: true, // Chỉ lấy kết quả khi có thông tin trong bảng Shop
                    },
                ],
            });

            if (!product) {
                return null; // Nếu không tìm thấy sản phẩm
            }

            // Chuyển instance Sequelize thành object JavaScript
            const productData = product.toJSON();

            // Lấy các sản phẩm liên quan (cùng danh mục) nhưng loại trừ chính sản phẩm hiện tại
            const relatedProducts = await Shop.findAll({
                where: {
                    category: productData.Shop.category, // Cùng danh mục
                    id: { [Op.ne]: productIdInt }, // Loại trừ sản phẩm hiện tại
                },
                limit: 4, // Giới hạn số lượng sản phẩm liên quan
            });

            // Chuyển các sản phẩm liên quan thành mảng đối tượng JavaScript
            productData.relatedProducts = relatedProducts.map((prod) =>
                prod.toJSON(),
            );

            // Trả về toàn bộ dữ liệu sản phẩm cùng danh sách sản phẩm liên quan
            return productData;
        } catch (error) {
            console.error("Lỗi khi lấy sản phẩm kết hợp:", error);
            throw error;
        }
    }
}

module.exports = ProductModel;
