class HomeController {
    // [GET] '/'
    index(req, res) {
        res.render("home");
    }

    admin_index(req, res) {
        res.render("admin");
    }

    // [GET] '/404'
    _404(req, res) {
        res.render("404");
    }
}

module.exports = new HomeController();
