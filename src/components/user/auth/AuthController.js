const passport = require('passport');

const AuthController = {
    login: passport.authenticate('local', {
        successRedirect: '/user/profile',
        failureRedirect: '/user/login',
        failureFlash: false
    }),

    logout: (req, res) => {
        req.logout(err => {
            if (err) return next(err);
            res.redirect('/user/login');
        });
    },

    loginPage: (req, res) => {
        res.render('user/authentication/login'); // Render trang login
    }
};

module.exports = AuthController;
