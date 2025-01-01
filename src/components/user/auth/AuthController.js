const passport = require("../../../config/passportConfig");

const 
AuthController = {
    // Đăng nhập qua Google
    googleAuth: passport.authenticate("google", {
        scope: ["profile", "email"],
    }),

    // Callback Google
    googleAuthCallback: (req, res, next) => {
        passport.authenticate("google", (err, user, info) => {
            if (err) {
                return next(err); // Nếu có lỗi, chuyển tiếp lỗi đến middleware xử lý
            }
            if (!user) {
                // Nếu không có người dùng, chuyển hướng về trang đăng nhập
                return res.redirect("/user/login");
            }

            // Lưu người dùng vào session
            req.login(user, (err) => {
                if (err) {
                    return next(err);
                }
                // Sau khi đăng nhập thành công, chuyển hướng đến trang chính hoặc dashboard
                return res.redirect("/"); // Hoặc trang bạn muốn chuyển hướng
            });
        })(req, res, next); // Gọi hàm passport.authenticate
    },

    // Đăng nhập
    login: (req, res, next) => {
        passport.authenticate("local", (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.render("login", {
                    errorMessage: "Invalid email or password!",
                });
            }
            // Xác thực thành công, lưu người dùng vào session
            req.logIn(user, (err) => {
                if (err) return next(err);

                // Kiểm tra nếu có một URL trước đó trong session và chuyển hướng về đó
                const redirectTo = req.session.returnTo || "/"; // Nếu không có URL trước đó, chuyển hướng về home
                delete req.session.returnTo; // Xóa URL đã lưu sau khi đã chuyển hướng
                res.redirect(redirectTo); // Chuyển hướng về trang yêu cầu
            });
        })(req, res, next); // Đảm bảo rằng passport.authenticate được gọi đúng cách
    },

    // Đăng xuất
    logout: (req, res, next) => {
        req.logout((err) => {
            if (err) return next(err);
            // Xóa cookie session
            res.clearCookie("connect.sid", { path: "/" }); // Xóa cookie có tên 'connect.sid' nếu sử dụng express-session
            res.redirect("/"); // Sau khi logout, chuyển hướng về trang home
        });
    },

    // Trang đăng nhập
    loginPage: (req, res) => {
        res.render("login"); // Render trang login
    },
};

module.exports = AuthController;
