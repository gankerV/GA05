const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcryptjs = require("bcryptjs");
const UserModel = require("../components/user/userModel");  

// Sử dụng LocalStrategy cho đăng nhập
passport.use(new LocalStrategy(
    {
      usernameField: "Email", // Tên trường chứa email
      passwordField: "Password", // Tên trường chứa mật khẩu
    },
    async (Email, Password, done) => {
      try {
        const user = await UserModel.User.findOne({ where: { email: Email } });
  
        if (!user) {
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
    }
  ));
  

// Serialize user: Chỉ lưu ID của user vào session
passport.serializeUser((user, done) => {
  done(null, user.id);  // Lưu ID người dùng vào session
});

// Deserialize user: Tìm lại user từ cơ sở dữ liệu bằng ID đã lưu trong session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserModel.User.findByPk(id);  // Tìm user theo ID
    done(null, user);  // Lưu thông tin user vào session
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
