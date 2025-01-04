const User = require("./userModel");
const nodemailer = require("nodemailer");
const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const UserModel = require("./userModel");

class UserController {
    changePasswordPage(req, res) {
        res.render("change_password");
    }

    async changePassword(req, res) {
        const userID = req.session.passport.user;
        const { "Old Password": oldPassword, "New Password": newPassword } =
            req.body;

        const isSuccess = await UserModel.updatePassword(userID, {
            oldPassword,
            newPassword,
        });

        if (!isSuccess) {
            return res.render("change_password", {
                errorMessage: "Wrong old password",
            });
        }

        res.redirect("/user/login");
    }

    register(req, res) {
        res.render("register");
    }

    findEmail(req, res) {
        res.render("identity", { status: 1 });
    }

    async identity(req, res) {
        const { Email } = req.body;
        try {
            const user = await User.User.findOne({
                where: { email: Email },
            });

            if (!user || !user.is_active) {
                return res.render("identity", {
                    status: 0,
                    message: "The email entered is invalid or not activated!",
                });
            }

            if (user.is_google) {
                return res.render("identity", {
                    status: 0,
                    message: "Can't reset password. You can login with Google.",
                });
            }

            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.APP_GMAIL,
                    pass: process.env.APP_PASSWORD,
                },
            });

            const newPassword = crypto.randomBytes(5).toString("hex");
            user.password = await bcryptjs.hash(newPassword, 10);

            await transporter.sendMail({
                from: '"Tail Store" nguyenhuytan2004@gmail.com',
                to: Email,
                subject: "Reset Password",
                html: `<div style="font-family: Arial, sans-serif; line-height: 1.5;">
                    <p>Dear User,</p>
                    <p>Your account's new password is:</p>
                    <p style="font-size: 20px; font-weight: bold; color: #333;">${newPassword}</p>
                    <p>Please make sure to update your password after logging in.</p>
                    <br/>
                    <p>Best regards,</p>
                    <p>The Tail Store Team</p>
                </div>`,
            });

            await user.save();

            return res.render("identity", {
                status: 0,
                message:
                    "Reset password successful! Check your email to get new password.",
            });
        } catch (error) {}
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

                const activationLink = `https://ga05-1.onrender.com/user/register/activate/${activationToken}`;
                // const activationLink = `http://localhost:3000/user/register/activate/${activationToken}`;

                await transporter.sendMail({
                    from: '"Tail Store" <nguyenhuytan2004@gmail.com>',
                    to: account.Email,
                    subject: "Account Activation",
                    html: `
                        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
                            <p>Dear User,</p>
                            <p>Click the link below to activate your account:</p>
                            <p>
                                <a href="${activationLink}" style="font-size: 16px; font-weight: bold; color: #007BFF; text-decoration: none;">
                                    Activate Account
                                </a>
                            </p>
                            <p>If you did not request this, please ignore this email.</p>
                            <br/>
                            <p>Best regards,</p>
                            <p>The Tail Store Team</p>
                        </div>
                    `,
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
