const homeRouter = require("../components/home/homeRoute");
const aboutRouter = require("../components/about/aboutRoute");
const userRouter = require("../components/user/userRoute");
const shopRouter = require("../components/shop/shopRoute");
const contactRouter = require("../components/contact/contactRoute");
const ensureAuthenticated = require("../components/user/auth/authModel");

function route(app) {
    app.get("/contact", ensureAuthenticated, contactRouter);
    app.get("/about", aboutRouter);
    app.use("/shop", shopRouter);
    app.use("/user", userRouter);
    app.get("/404", homeRouter);
    app.use("/", homeRouter);
}

module.exports = route;
