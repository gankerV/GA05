const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcryptjs = require("bcryptjs");
const UserModel = require("../components/user/userModel");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// Sử dụng LocalStrategy cho đăng nhập
passport.use(
    new LocalStrategy(
        {
            usernameField: "Email", // Tên trường chứa email
            passwordField: "Password", // Tên trường chứa mật khẩu
        },
        async (Email, Password, done) => {
            try {
                const user = await UserModel.User.findOne({
                    where: { email: Email },
                });

                if (!user || user.is_google) {
                    return done(null, false, { message: "Email not found" });
                }

                const isMatch = await bcryptjs.compare(Password, user.password);

                if (!isMatch) {
                    return done(null, false, { message: "Invalid password" });
                }

                return done(null, user);
            } catch (err) {
                return done(err);
            }
        },
    ),
);

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL:
                // "https://ga05-1.onrender.com/user/login/google/callback",
                "http://localhost:3000/user/login/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            // Lưu thông tin người dùng vào cơ sở dữ liệu hoặc session
            let user = await UserModel.User.findOne({
                where: { email: profile.emails[0].value },
            });

            if (!user) {
                // Nếu chưa có người dùng, tạo mới
                user = await UserModel.User.create({
                    email: profile.emails[0].value,
                    is_google: true,
                    is_active: true,
                });
            }

            return done(null, user); // Trả về đối tượng người dùng sau khi xác thực thành công
        },
    ),
);

// Serialize user: Chỉ lưu ID của user vào session
passport.serializeUser((user, done) => {
    done(null, user.id); // Lưu ID người dùng vào session
});

// Deserialize user: Tìm lại user từ cơ sở dữ liệu bằng ID đã lưu trong session
passport.deserializeUser(async (id, done) => {
    UserModel.User.findByPk(id)
        .then((user) => done(null, user))
        .catch(done); // Xử lý lỗi trong trường hợp không tìm thấy user
});

module.exports = passport;
