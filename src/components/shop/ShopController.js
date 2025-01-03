const { query } = require("express");
const Shop = require("./shopModel");

// Biến toàn cục để lưu danh sách sản phẩm sau khi filter hoặc search
let allProducts = [];
const itemsPerPage = 6; // Số sản phẩm trên mỗi trang

class ShopController {
    // [GET] '/shop'
    async index(req, res) {
        try {
            const page = parseInt(req.query.page, 10) || 1; // Trang hiện tại (mặc định là 1)
            const { category, size, color, brand, rating, product_name } =
                req.query;
            // Tính offset và limit
            const offset = (page - 1) * itemsPerPage;
            const limit = itemsPerPage;

            // luôn truy vấn dữ liệu ở lần đầu truy cập trang web
            allProducts = await Shop.getProducts({
                category,
                size,
                color,
                brand,
                rating,
                product_name, // Tham số tìm kiếm
            });

            // Render tối đa 6 sản phẩm đầu tiên
            const productsToRender = allProducts.slice(offset, offset + limit);
            res.render("shop", { shop: productsToRender });
        } catch (error) {
            console.error("Lỗi khi lấy sản phẩm:", error);
            res.status(500).send("Lỗi Server");
        }
    }

    async pagination(req, res) {
        try {
            const page = parseInt(req.query.page, 10) || 1; // Trang hiện tại (mặc định là 1)
            const { category, size, color, brand, rating, product_name } =
                req.query;
            // Tính offset và limit
            const offset = (page - 1) * itemsPerPage;
            const limit = itemsPerPage;

            // Lọc sản phẩm theo các tham số (nếu có)
            let filteredProducts = await Shop.getProducts({
                category,
                size,
                color,
                brand,
                rating,
                product_name, // Tham số tìm kiếm
            });

            // Phân trang từ danh sách đã tải
            const totalProducts = filteredProducts.length;
            const paginatedProducts = filteredProducts.slice(
                offset,
                offset + limit,
            );

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
