function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next(); // Nếu đã xác thực, cho phép tiếp tục vào route
    }
    res.redirect('/user/login'); // Nếu chưa xác thực, chuyển hướng về trang đăng nhập
}

module.exports = ensureAuthenticated;
