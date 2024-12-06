const Shop = require("./shopModel");

let paginationProducts = [];

class ShopController {
    // [GET] '/shop'
    async index(req, res) {
        try {
            const { category, size, color, brand, rating, product_name } =
                req.query;

            // Sử dụng getProducts để xử lý cả tìm kiếm và lọc
            const products = await Shop.getProducts({
                category,
                size,
                color,
                brand,
                rating,
                product_name, // Tham số tìm kiếm
            });

            if (!products.length) {
                return res.render("404"); // Hiển thị trang 404 nếu không tìm thấy sản phẩm
            }

            paginationProducts = products;

            // Truyền dữ liệu vào view
            res.render("shop", { shop: products });
        } catch (error) {
            console.error("Lỗi khi lấy sản phẩm:", error);
            res.status(500).send("Lỗi Server");
        }
    }

    async pagination(req, res) {
        try {
            const itemsPerPage = 6; // Số sản phẩm trên mỗi trang
            const page = parseInt(req.query.page, 10) || 1; // Trang hiện tại (mặc định là 1)

            // Tính offset và limit
            const offset = (page - 1) * itemsPerPage;
            const limit = itemsPerPage;

            // Lấy sản phẩm từ biến toàn cục
            const totalProducts = paginationProducts.length;
            const paginatedProducts = paginationProducts.slice(
                offset,
                offset + limit,
            );

            paginatedProducts;

            // Trả về dữ liệu JSON
            res.json({
                products: paginatedProducts,
                currentPage: page,
                totalPages: Math.ceil(totalProducts / itemsPerPage),
            });
        } catch (error) {
            console.error("Lỗi khi phân trang:", error);
            res.status(500).json({ error: "Lỗi khi phân trang sản phẩm." });
        }
    }
}

module.exports = new ShopController();
