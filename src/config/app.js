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
            json: (context) => JSON.stringify(context),
            multiply: (a, b) => a * b, // Ensure multiply helper is directly here
            formatCurrency: (value) => `$${value.toFixed(2)}`, // Define other helpers here
            calculateSubtotal: (cartItems) => {
                let subtotal = 0;
                cartItems.forEach((item) => {
                    subtotal += item.price * item.quantity;
                });
                return subtotal.toFixed(2);
            },
            // Register custom helpers directly in this object
            eq: function(a, b) {
                return a === b;
            },
        },
    }),
);

// Cấu hình handlebars
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "../views/bodies"));
// Helper để tạo mảng sao đầy (★)
Handlebars.registerHelper("fullStars", function (rating) {
    return "★".repeat(rating);
});
// Helper để tạo mảng sao rỗng (☆)
Handlebars.registerHelper("emptyStars", function (rating) {
    return "☆".repeat(5 - rating);
});

// Cấu hình express
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/public", express.static(path.join(__dirname, "../../public")));

// Cấu hình express-session
app.use(
    session({
        secret: process.env.SESSION_SECRET, // Secret cho session
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false, maxAge: 1000 * 3600 },
    }),
);

// Cấu hình passport
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
