const createError = require("http-errors");
const express = require("express");
const path = require("path");
const handlebars = require("express-handlebars");
const port = process.env.PORT || 3000;
const route = require("./routes");
const session = require("express-session");
const passport = require("./passportConfig");
const flash = require("connect-flash");
const Handlebars = require("handlebars");
const moment = require("moment");

const app = express();

// view engine setup
app.engine(
    "hbs",
    handlebars.engine({
        extname: ".hbs",
        defaultLayout: "main",
        layoutsDir: path.join(__dirname, "../views", "layouts"),
        partialsDir: path.join(__dirname, "../views", "partials"),
        helpers: {
            json: (context) => JSON.stringify(context), // Thêm helper json
        },
    }),
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "../views/bodies"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/public", express.static(path.join(__dirname, "../../public")));

// Helper để tạo mảng sao đầy (★)
Handlebars.registerHelper("fullStars", function (rating) {
    return "★".repeat(rating);
});

// Helper để tạo mảng sao rỗng (☆)
Handlebars.registerHelper("emptyStars", function (rating) {
    return "☆".repeat(5 - rating);
});

// Cấu hình express-session
app.use(
    session({
        secret: process.env.SESSION_SECRET, // Secret cho session
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false, maxAge: 1000 * 3600 },
    }),
);
// Khai báo Passport
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use((req, res, next) => {
    res.locals.successMessage = req.flash("success");
    res.locals.errorMessage = req.flash("error");
    res.locals.user = req.user || null; // Nếu người dùng đã đăng nhập, lưu thông tin vào res.locals
    next();
});

route(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// Start server
app.listen(port, () => {
    console.log(`Example app listening on http://localhost:${port}`);
});

module.exports = app;
