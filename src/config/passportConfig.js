const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../components/user/userModel'); // Giả sử bạn đã có `userModel`

passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            const user = await User.findByUsername(username);
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }

            // Kiểm tra mật khẩu (có thể dùng bcrypt để mã hóa và so sánh mật khẩu)
            if (!User.verifyPassword(user.password, password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }

            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

// Serialize and deserialize user (Lưu thông tin người dùng vào session)
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});

module.exports = passport;
