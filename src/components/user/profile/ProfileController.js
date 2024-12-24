const UserInfoModel = require("./profileModel");

class ProfileController {
    async index(req, res) {
        const userID = req.session.passport.user;

        const userInfo = await UserInfoModel.saveUserInfo(userID);
        res.render("user_profile", { userInfo: userInfo.toJSON() });
    }
}

module.exports = new ProfileController();
