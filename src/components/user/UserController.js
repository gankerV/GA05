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

        if (!result) {
            res.render("register", { result });
        } else {
            res.redirect("/user/login");
        }
    }

    async checkRegistrationEmail(req, res) {
        try {
            const email = req.query.email;

            if (!email) {
                return res.status(400).json({ error: "Email is required." });
            }

            const userExists = await User.isEmailExist(email);

            res.json({ exists: !!userExists }); // Trả về true nếu email tồn tại
        } catch (error) {
            console.error("Error checking email:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    }
}

module.exports = new UserController();
