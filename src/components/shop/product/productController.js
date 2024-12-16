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
            res.status(500).send("Lỗi Server");
        }
    }

    async writeReview(req, res) {
        try {
            const reviewInfo = {
                productId: Number(req.params.id), // Lấy productId từ URL
                name: req.body.name, // Lấy tên người đánh giá từ body
                email: req.body.email, // Lấy email từ body
                rating: Number(req.body.rating), // Lấy rating từ body
                comment: req.body.comment, // Lấy comment từ body
            };

            await ProductModel.saveReview(reviewInfo);

            res.redirect(`/shop/product/${reviewInfo.productId}`);
        } catch (error) {}
    }

    async getReviews(req, res) {
        try {
            const productId = req.params.id;
            const page = Number(req.query.page) || 1;

            const paginatedReviews = await ProductModel.getReviews(
                productId,
                page,
            );
            res.json(paginatedReviews);
        } catch (error) {
            res.status(500).json({ error });
        }
    }
}

module.exports = new ProductController();
