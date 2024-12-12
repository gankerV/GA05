class CartController {
    cart(req, res) {
        res.render("cart");
    }

    checkout(req, res) {
        res.render("checkout");
    }
}

module.exports = new CartController();
