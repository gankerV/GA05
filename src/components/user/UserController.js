const User = require("./userModel");
const nodemailer = require("nodemailer");

class UserController {
    // [GET] '/user/register'
    register(req, res) {
        res.render("register");
    }

    // [POST] '/user/register'
    async verifyRegister(req, res) {
        const account = req.body;

        try {
            const activationToken = await User.saveUser(account);

            if (!activationToken) {
                res.render("register");
            } else {
                // Gửi email kích hoạt
                const transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: process.env.APP_GMAIL,
                        pass: process.env.APP_PASSWORD,
                    },
                });

                const activationLink = `http://localhost:3000/user/register/activate/${activationToken}`;

                await transporter.sendMail({
                    from: '"Tail Store" nguyenhuytan2004@gmail.com',
                    to: account.Email,
                    subject: "Account Activation",
                    text: `Click this link to activate your account: ${activationLink}`,
                });

                res.send(
                    "Registration successful! Check your email to activate your account.",
                );
            }
        } catch (error) {
            res.status(500).send("Lỗi sever.");
        }
    }

    async activateAccount(req, res) {
        const { token } = req.params;

        try {
            // Gọi Model để kích hoạt tài khoản
            const result = await User.activateUserByToken(token);

            if (result) {
                res.redirect("/user/login");
            } else {
                res.status(400).send(
                    "Mã kích hoạt không hợp lệ hoặc tài khoản đã được kích hoạt!",
                );
            }
        } catch (error) {
            console.error("Lỗi kích hoạt tài khoản:", error);
            res.status(500).send("Lỗi server!");
        }
    }

    async checkRegistrationEmail(req, res) {
        try {
            const email = req.query.email;

            const userExists = await User.isEmailExist(email);

            res.json({ exists: !!userExists }); // Trả về true nếu email tồn tại
        } catch (error) {
            console.error("Error checking email:", error);
            res.status(500).json({ error: "Internal server error." });
        }
    }
}

module.exports = new UserController();
