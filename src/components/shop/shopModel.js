const { DataTypes, Sequelize } = require("sequelize");
const { Op } = require("sequelize");
const sequelize = require("../../config/dataConfig");

const Shop = sequelize.define(
    "Shop",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        product_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        size: {
            type: DataTypes.ENUM("S", "M", "L"), // Khai báo ENUM cho size
            allowNull: false,
        },
        color: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        brand: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        rating: {
            type: DataTypes.ENUM("1", "2", "3", "4", "5"), // Khai báo ENUM cho rating
            allowNull: false,
        },
        imageFileName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        tableName: "shop",
        timestamps: false,
    },
);

// Thêm các phương thức truy vấn vào lớp Model
class ShopModel {
    /**
     * Truy vấn danh sách sản phẩm theo các điều kiện category và size
     * @param {Object} queryParams - Tham số truy vấn từ URL
     * @returns {Array} Danh sách sản phẩm
     */

    //Getters
    constructor() {
        this.Shop = Shop; // Lưu đối tượng Shop vào một thuộc tính
    }

    static get Shop() {
        return Shop; // Getter cho đối tượng Shop
    }

    static async getProducts({
        category = [],
        size = [],
        color = [],
        brand = [],
        rating = [],
        product_name = null, // Thêm tham số tìm kiếm sản phẩm theo tên
    }) {
        try {
            // Xử lý filter nếu là chuỗi
            if (typeof category === "string") category = [category];
            if (typeof size === "string") size = [size];
            if (typeof color === "string") color = [color];
            if (typeof brand === "string") brand = [brand];
            if (typeof rating === "string") rating = [rating];

            // Điều kiện truy vấn
            const whereConditions = {};

            // Tìm kiếm theo tên sản phẩm (search)
            if (product_name) {
                whereConditions.product_name = {
                    [Op.like]: `%${product_name}%`,
                };
            }

            // Lọc theo các tiêu chí khác (filter)
            if (category.length > 0) whereConditions.category = category;
            if (size.length > 0) whereConditions.size = size;
            if (color.length > 0) whereConditions.color = color;
            if (brand.length > 0) whereConditions.brand = brand;
            if (rating.length > 0) whereConditions.rating = rating;

            // Thực hiện truy vấn
            const products = await Shop.findAll({
                where: whereConditions,
            });

            // Thêm URL hình ảnh vào kết quả
            const baseImageUrl = "../../../public/images/products/";
            return products.map((product) => {
                const productData = product.get({ plain: true });
                productData.imageUrl =
                    baseImageUrl + (productData.imageFileName || "");
                return productData;
            });
        } catch (error) {
            console.error("Lỗi khi truy vấn sản phẩm:", error);
            throw error;
        }
    }
}

module.exports = ShopModel;
