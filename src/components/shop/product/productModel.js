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

const SubImage = sequelize.define("SubImage", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    shop_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    imageFileName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: false, // Disable automatic timestamps (`createdAt` and `updatedAt`)
    tableName: "sub_images", // Name of the table in the database
});

// Define associations
Shop.hasMany(SubImage, { foreignKey: "shop_id", as: "subImages" });
SubImage.belongsTo(Shop, { foreignKey: "shop_id", targetKey: "id" });

const Review = sequelize.define(
    "review",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        customer_name: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        customer_email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                isEmail: true, // Kiểm tra định dạng email
            },
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5, // Ràng buộc giá trị nằm trong khoảng 1-5
            },
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW, // Gán thời gian mặc định là thời gian hiện tại
        },
    },
    {
        tableName: "review", // Tên bảng trong cơ sở dữ liệu
        timestamps: false, // Bỏ qua cột createdAt và updatedAt
    },
);

Product.hasMany(Review, { foreignKey: "product_id", onDelete: "CASCADE" }); // Một sản phẩm có nhiều đánh giá
Review.belongsTo(Product, { foreignKey: "product_id", onDelete: "CASCADE" }); // Một đánh giá thuộc về một sản phẩm

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
                    {
                        model: Review, // Kết hợp bảng Review
                        required: false, // Không bắt buộc phải có review, vì sản phẩm có thể không có đánh giá
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

            // Lấy các review của sản phẩm
            const reviews = await Review.findAll({
                where: { product_id: productIdInt },
            });

            // Chuyển các review thành mảng đối tượng JavaScript và thêm vào productData
            productData.reviews = reviews.map((review) => review.toJSON());

            // Trả về toàn bộ dữ liệu sản phẩm cùng danh sách sản phẩm liên quan
            return productData;
        } catch (error) {
            console.error("Lỗi khi lấy sản phẩm kết hợp:", error);
            throw error;
        }
    }

    static async saveReview(reviewInfo) {
        try {
            // Tạo một bản ghi mới trong bảng review
            const review = await Review.create({
                product_id: reviewInfo.productId, // Lấy productId từ reviewInfo
                customer_name: reviewInfo.name, // Tên khách hàng
                customer_email: reviewInfo.email, // Email khách hàng
                rating: reviewInfo.rating, // Đánh giá sao
                comment: reviewInfo.comment, // Bình luận
            });
        } catch (error) {
            console.error("Lỗi khi lưu đánh giá:", error);
            throw error; // Ném lỗi để xử lý ở nơi khác nếu cần
        }
    }

    static async getReviews(productId, page) {
        try {
            const limit = 3;
            const offset = (page - 1) * limit; // Tính offset

            // Lấy danh sách reviews
            const { count, rows: reviews } = await Review.findAndCountAll({
                where: { product_id: productId },
                offset: parseInt(offset, 10),
                limit: parseInt(limit, 10),
                order: [["created_at", "DESC"]], // Sắp xếp mới nhất lên đầu
            });

            // Trả về dữ liệu
            return {
                reviews,
                totalReviews: count,
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page, 10),
            };
        } catch (error) {
            throw error;
        }
    }

    static async getAllProducts({ limit, offset, whereConditions, order }) {
        try {
            // Mặc định sắp xếp theo "id" nếu không có điều kiện sắp xếp
            const defaultOrder = [["id", "ASC"]];
            
            // Xác định điều kiện sắp xếp (bao gồm sold_quantity)
            let sortingOrder;
            if (order && order[0][0] === "sold_quantity") {
                sortingOrder = [
                    [
                        sequelize.literal(`(
                            SELECT COALESCE(SUM(order_items.quantity), 0)
                            FROM order_items
                            INNER JOIN orders ON orders.order_id = order_items.order_id
                            WHERE order_items.product_id = Product.id
                            AND orders.order_status = 'Delivered'
                        )`),
                        order[0][1] || "ASC" // Sắp xếp ASC hoặc DESC
                    ]
                ];
            } else {
                sortingOrder = order || defaultOrder;
            }
    
            // Lấy danh sách sản phẩm từ bảng Product kèm thông tin từ bảng Shop
            const { rows, count } = await Product.findAndCountAll({
                include: [
                    {
                        model: Shop, // Kết hợp bảng Shop
                        attributes: [
                            "product_name", 
                            "price", 
                            "category", 
                            "size", 
                            "color", 
                            "brand", 
                            "rating", 
                            "imageFileName"
                        ],
                        required: true, // Chỉ lấy sản phẩm có thông tin trong bảng Shop
                    }
                ],
                attributes: [
                    "id",
                    "description",
                    "product_status",
                    [
                        sequelize.literal(`(
                            SELECT COALESCE(SUM(order_items.quantity), 0)
                            FROM order_items
                            INNER JOIN orders ON orders.order_id = order_items.order_id
                            WHERE order_items.product_id = Product.id
                            AND orders.order_status = 'Delivered'
                        )`),
                        "sold_quantity"
                    ], // Thêm trường số lượng đã bán
                ],
                where: whereConditions, // Lọc theo điều kiện
                order: sortingOrder,   // Sắp xếp theo điều kiện
                limit: limit || 8,     // Giới hạn số lượng kết quả mỗi trang
                offset: offset || 0,   // Vị trí bắt đầu của dữ liệu
            });
            
            // Chuyển đổi dữ liệu
            return {
                rows: rows.map((product) => product.toJSON()), // Chuyển các đối tượng Sequelize thành JSON
                count, // Tổng số sản phẩm
            };
        } catch (error) {
            throw error;
        }
    }
    
    static async create({ product_name, price, category, brand, size, color, rating, description, product_status ,image, subImageFileNames }) {
        let transaction;
        try {
            // Bắt đầu giao dịch (transaction) để đảm bảo tính toàn vẹn dữ liệu
            transaction = await sequelize.transaction();
    
            // Tạo một bản ghi trong bảng shop
            const shop = await Shop.create({
                product_name,
                price,
                category,
                brand,
                size,
                color,
                rating,
                imageFileName: image,  // Tên ảnh chính
            }, { transaction });
    
            // Tạo một bản ghi trong bảng product và liên kết với bảng shop thông qua shop_id
            const product = await Product.create({
                description,
                product_status,
                id: shop.id, // Liên kết với shop
            }, { transaction });

            // Nếu có ảnh phụ (subImages), thêm chúng vào bảng sub_images
            if (subImageFileNames && subImageFileNames.length > 0) {

                const subImageData = subImageFileNames.map(image => ({
                    imageFileName: image,   // Tên file ảnh phụ
                    shop_id: shop.id,      // Liên kết ảnh phụ với shop
                }));
    
                // Thêm nhiều ảnh phụ vào bảng sub_images
                await SubImage.bulkCreate(subImageData, { transaction });
            }
    
            // Commit giao dịch
            await transaction.commit();
    
            // Trả về thông tin sản phẩm bao gồm thông tin từ bảng shop
            return {
                product: product.toJSON(),
                shop: shop.toJSON(),
            };
        } catch (error) {
            // Nếu có lỗi, rollback giao dịch
            await transaction.rollback();
            throw error;
        }
    }    

}

module.exports = ProductModel;