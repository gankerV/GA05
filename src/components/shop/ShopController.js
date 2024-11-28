const Shop = require("./shopModel");

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
    
            if (!products.length) {
                return res.render("404"); // Hiển thị trang 404 nếu không tìm thấy sản phẩm
            }
    
            // Truyền dữ liệu vào view
            res.render("shop", { shop: products });
        } catch (error) {
            console.error("Lỗi khi lấy sản phẩm:", error);
            res.status(500).send("Lỗi Server");
        }
    }
    
    

    // [GET] '/shop/search'
    async research(req, res) {
        try {
            const { product_name } = req.query; // Lấy từ khóa tìm kiếm từ query string
            const productData = await Shop.getSearchProducts(product_name);

            if (!productData.length) {
                res.render("404");
            } else {
                res.render("shop", { shop: productData });
            }
        } catch (error) {
            console.error("Lỗi khi tìm kiếm:", error);
            res.status(500).send("Lỗi sever.");
        }
    }
}

module.exports = new ShopController();
