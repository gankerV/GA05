class AuthModel {
    static adminAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            if (!req.user.is_admin) {
                return res.redirect("/404");
            }
            return next(); // Nếu người dùng đã đăng nhập, tiếp tục vào route
        }

        // Lưu lại URL mà người dùng đang yêu cầu vào session
        req.session.returnTo = req.originalUrl; // Lưu URL yêu cầu vào session
        res.redirect("/user/login"); // Chuyển hướng đến trang login
    }

    static userAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return next(); // Nếu người dùng đã đăng nhập, tiếp tục vào route
        }

        // Lưu lại URL mà người dùng đang yêu cầu vào session
        req.session.returnTo = req.originalUrl; // Lưu URL yêu cầu vào session
        res.redirect("/user/login"); // Chuyển hướng đến trang login
    }
}

module.exports = AuthModel;
