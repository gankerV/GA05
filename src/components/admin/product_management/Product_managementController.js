const Product = require("../../shop/product/productModel");
const Shop = require("../../shop/shopModel");
const Sequelize = require("sequelize");

class Product_managementController{
    // [GET] '/admin/products'
    async getAllProducts(req, res) {
        try {
            const page = parseInt(req.query.page) || 1; // Trang hiện tại (mặc định là 1)
            const limit = 8; // Số lượng sản phẩm mỗi trang
            const offset = (page - 1) * limit; // Vị trí bắt đầu
            const { search, sortBy, sortOrder, category, brand } = req.query;

            // Điều kiện lọc cơ bản
            const whereCondition = {};

            // Lọc theo tên sản phẩm
            if (search) {
                whereCondition["$Shop.product_name$"] = {
                    [Sequelize.Op.like]: `%${search}%`,
                }; // Tìm theo tên sản phẩm
            }

            // Lọc theo category (trong bảng Shop)
            if (category) {
                whereCondition["$Shop.category$"] = category; // Sử dụng dấu $ để tham chiếu đến bảng Shop
            }

            // Lọc theo brand (trong bảng Shop)
            if (brand) {
                whereCondition["$Shop.brand$"] = brand; // Sử dụng dấu $ để tham chiếu đến bảng Shop
            }

            // Điều kiện sắp xếp (sắp xếp theo sold_quantity nếu có)
            const sortingOrder =
                sortBy === "sold_quantity"
                    ? [
                            [
                                Sequelize.literal(`(
                            SELECT COALESCE(SUM(order_items.quantity), 0)
                            FROM order_items
                            INNER JOIN orders ON orders.order_id = order_items.order_id
                            WHERE order_items.product_id = Product.id
                            AND orders.order_status = 'Delivered'
                        )`),
                                sortOrder || "ASC", // Sắp xếp theo sold_quantity
                            ],
                        ]
                    : [
                            ["Shop", sortBy || "id", sortOrder || "ASC"], // Sắp xếp theo trường khác từ bảng Shop
                        ];

            // Gọi phương thức trong model để lấy dữ liệu sản phẩm
            const { rows: products, count: totalProducts } =
                await Product.getAllProducts({
                    limit,
                    offset,
                    whereConditions: whereCondition, // Truyền điều kiện lọc
                    order: sortingOrder,
                });

            const totalPages = Math.ceil(totalProducts / limit); // Tổng số trang

            // Trả về giao diện với dữ liệu
            res.render("product_management", {
                products,
                currentPage: page,
                totalPages,
            });
        } catch (error) {
            console.error("Error fetching products:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    // [POST] '/admin/products/add'
    async createProduct(req, res) {
        const {
            product_name,
            price,
            category,
            brand,
            size,
            color,
            rating,
            description,
            product_status,
        } = req.body;
        const photos = req.files.photos; // Multer sẽ lưu ảnh chính vào `req.files.photos`
        const subImage1 = req.files.sub_image1; // Ảnh phụ 1
        const subImage2 = req.files.sub_image2; // Ảnh phụ 2
        const subImage3 = req.files.sub_image3; // Ảnh phụ 3
        const subImage4 = req.files.sub_image4; // Ảnh phụ 4

        try {
            // Xử lý hình ảnh chính (photos)
            let imageFileName = null;
            if (photos && photos.length > 0) {
                imageFileName = photos[0].filename; // Lấy tên file ảnh chính (chỉ có một ảnh)
            }

            let subImageFileNames = [];

            if (subImage1 && subImage1.length > 0)
                subImageFileNames.push(subImage1[0].filename);
            if (subImage2 && subImage2.length > 0)
                subImageFileNames.push(subImage2[0].filename);
            if (subImage3 && subImage3.length > 0)
                subImageFileNames.push(subImage3[0].filename);
            if (subImage4 && subImage4.length > 0)
                subImageFileNames.push(subImage4[0].filename);
            // Xử lý ảnh phụ (sub_image)

            // Tạo sản phẩm mới
            const product = await Product.create({
                product_name,
                price,
                category,
                brand,
                size,
                color,
                rating,
                description,
                product_status,
                image: imageFileName, // Lưu tên file ảnh chính vào cơ sở dữ liệu
                subImageFileNames, // Lưu mảng tên file ảnh phụ vào cơ sở dữ liệu
            });

            // Trả về phản hồi thành công
            res.redirect("/admin/products");
        } catch (error) {
            console.error("Error creating product:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    // [POST] '/admin/products/update/:id'
    async updateProduct(req, res) {
        const productId = req.params.id;
        const {
            product_name,
            price,
            category,
            brand,
            size,
            delete_image,
            description,
            product_status,
        } = req.body;
        const { photos } = req.files;

        try {
            // Chuẩn bị các trường để cập nhật
            const updateFields = {};

            // Chỉ thêm các trường có giá trị vào updateFields
            if (product_name) updateFields.product_name = product_name;
            if (price) updateFields.price = price;
            if (category) updateFields.category = category;
            if (brand) updateFields.brand = brand;
            if (size) updateFields.size = size;
            if (description) updateFields.description = description;
            if (product_status) updateFields.product_status = product_status;

            // Nếu yêu cầu xóa ảnh
            if (delete_image === "1") {
                updateFields.imageFileName = null; // Đặt lại tên ảnh
            }

            // Nếu có ảnh mới được tải lên
            if (photos && photos.length > 0) {
                updateFields.imageFileName = photos[0].filename; // Lưu tên ảnh mới
            }

            await Shop.updateShop(productId, updateFields);

            // Nếu sản phẩm có chi tiết trong bảng Product
            if (description || product_status) {
                const productUpdateFields = {};
                if (description) productUpdateFields.description = description;
                if (product_status)
                    productUpdateFields.product_status = product_status;

                await Product.updateProduct(productId, productUpdateFields);
            }

            res.redirect("/admin/products");
        } catch (error) {
            console.error("Error updating product:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    // [POST] '/admin/products/delete/:id'
    async deleteProduct(req, res) {
        const productId = req.params.id;

        try {
            console.log("Deleting product:", productId);
            // Xóa sản phẩm theo ID
            await Product.deleteProduct(productId);

            await Shop.deleteShop(productId);

            // Trả về phản hồi thành công
            res.redirect("/admin/products");
        } catch (error) {
            console.error("Error deleting product:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
}

module.exports = new Product_managementController();