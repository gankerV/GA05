const ProductModel = require("./productModel");

class ProductController {
    async index(req, res) {
        try {
            // Lấy product_code từ URL
            const productCode = req.params.id;

            // Gọi Model để tìm sản phẩm theo product_code
            const product = await ProductModel.getProductById(productCode);

            if (!product) {
                return res.status(404).send("Sản phẩm không tồn tại");
            }

            const baseImageUrl = "../../../../public/images/products/";

            if (product.Shop && product.Shop.imageFileName) {
                // Tạo thuộc tính imageUrl cho sản phẩm từ trường imageFileName của Shop
                product.Shop.imageUrl =
                    baseImageUrl + product.Shop.imageFileName;

                // Xóa trường imageFileName cũ
                delete product.Shop.imageFileName;
            }

            // Gán imageUrl cho các sản phẩm liên quan
            if (product.relatedProducts && product.relatedProducts.length > 0) {
                product.relatedProducts = product.relatedProducts.map(
                    (related) => {
                        if (related && related.imageFileName) {
                            related.imageUrl =
                                baseImageUrl + related.imageFileName;
                            delete related.imageFileName;
                        }
                        return related;
                    },
                );
            }

            res.render("product", { product });
        } catch (error) {
            console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
            res.status(500).send("Lỗi Server");
        }
    }
}

module.exports = new ProductController();
