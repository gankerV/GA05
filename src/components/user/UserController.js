const User = require("./userModel");
class UserController {
    // [GET] '/user/register'
    register(req, res) {
        res.render("register");
    }

    // [POST] '/user/register'
    async verifyRegister(req, res) {
        const account = req.body;
        const result = await User.saveUser(account);

        if (!result.success) {
            res.render("register", { result });
        } else {
            res.render("login", { result });
        }
    }

    cart(req, res) {
        res.render("cart");
    }

    // [GET] '/user/checkout'
    checkout(req, res) {
        res.render("checkout");
    }
}

module.exports = new UserController();
