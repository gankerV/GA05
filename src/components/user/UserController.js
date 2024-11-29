class UserController {
    // [GET] '/register'
    register(req, res) {
        res.render("register");
    }

    // [GET] '/login'
    login(req, res) {    
        res.render("login");
    }

    // [GET] '/cart'
    cart(req, res) {
        res.render("cart");
    }

    // [GET] '/checkout'
    checkout(req, res) {
        res.render("checkout");
    }
}

module.exports = new UserController();
