const createError = require("http-errors");
const express = require("express");
const path = require("path");
const handlebars = require("express-handlebars");
const port = process.env.PORT || 3000;
const route = require("./routes");

const app = express();

// view engine setup
app.engine(
    "hbs",
    handlebars.engine({
        extname: ".hbs",
        defaultLayout: "main",
        layoutsDir: path.join(__dirname, "../views", "layouts"),
        partialsDir: path.join(__dirname, "../views", "partials"),
    }),
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "../views/bodies"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/public", express.static(path.join(__dirname, "../../public")));


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
