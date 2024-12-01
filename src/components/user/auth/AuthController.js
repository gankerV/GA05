const passport = require("../../../config/passportConfig");  

const AuthController = {
    // Đăng nhập
    login: (req, res, next) => {
        passport.authenticate("local", (err, user, info) => {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.redirect("/user/login");
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
            res.clearCookie('connect.sid', { path: '/' });// Xóa cookie có tên 'connect.sid' nếu sử dụng express-session
            res.redirect("/"); // Sau khi logout, chuyển hướng về trang home
        });
    },  

    // Trang đăng nhập
    loginPage: (req, res) => {
        res.render("login"); // Render trang login
    },
};

module.exports = AuthController;
