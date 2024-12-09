const Shop = require("./shopModel");

let paginationProducts = [];

class ShopController {
    // [GET] '/shop'
    async index(req, res) {
        try {
            const { category, size, color, brand, rating, product_name } = req.query;

            // Sử dụng getProducts để xử lý cả tìm kiếm và lọc
            const products = await Shop.getProducts({
                category,
                size,
                color,
                brand,
                rating,
                product_name, // Tham số tìm kiếm
            });

            console.log("Dữ liệu trả về từ Shop.getProducts:", products);

            // Truyền dữ liệu vào view (vẫn cần khi bạn render trang lần đầu)
            res.render("shop");
        } catch (error) {
            console.error("Lỗi khi lấy sản phẩm:", error);
            res.status(500).send("Lỗi Server");
        }
    }

    // [GET] '/shop/api' - API phân trang với lọc và tìm kiếm
    async pagination(req, res) {
        try {
            const itemsPerPage = 6; // Số sản phẩm trên mỗi trang
            const page = parseInt(req.query.page, 10) || 1; // Trang hiện tại (mặc định là 1)
            const { category, size, color, brand, rating, product_name } = req.query;

            console.log("Dữ liệu truy vấn:", req.query);

            // Lọc sản phẩm theo các tham số (nếu có)
            let filteredProducts = await Shop.getProducts({
                category,
                size,
                color,
                brand,
                rating,
                product_name, // Tham số tìm kiếm
            });
            
            // Tính offset và limit
            const offset = (page - 1) * itemsPerPage;
            const paginatedProducts = filteredProducts.slice(offset, offset + itemsPerPage);

            // Trả về dữ liệu JSON cho frontend
            res.json({
                products: paginatedProducts,
                currentPage: page,
                totalPages: Math.ceil(filteredProducts.length / itemsPerPage),
            });
        } catch (error) {
            console.error("Lỗi khi phân trang:", error);
            res.status(500).json({ error: "Lỗi khi phân trang sản phẩm." });
        }
    }
}

module.exports = new ShopController();
