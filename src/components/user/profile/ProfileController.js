const UserInfoModel = require("./profileModel");

class ProfileController {
    async updateAvatar(req, res) {
        try {
            const fileName = req.file.filename;
            const userID = req.query.userID;
            await UserInfoModel.UserInfo.update(
                {
                    avatar: fileName,
                },
                { where: { userID } },
            );

            const result = {
                success: true,
                imageUrl: `/public/images/user_images/${fileName}`,
            };

            res.json(result);
        } catch (error) {
            throw error;
        }
    }

    async index(req, res) {
        try {
            const userID = req.session.passport.user;

            const userInfo = await UserInfoModel.saveUserInfo(userID);
            res.render("user_profile", { userInfo: userInfo.toJSON() });
        } catch (error) {
            res.status(500).send("Lỗi sever");
        }
    }

    async update(req, res) {
        try {
            const {
                userID,
                fullname,
                phone,
                gender,
                "dob-day": dobDay,
                "dob-month": dobMonth,
                "dob-year": dobYear,
                address,
            } = req.body;

            const dob = `${dobYear}-${dobMonth.padStart(
                2,
                "0",
            )}-${dobDay.padStart(2, "0")}`;

            const userInfo = await UserInfoModel.updateUserInfo({
                userID,
                fullname,
                phone,
                gender,
                dob,
                address,
            });

            res.render("user_profile", {
                userInfo: userInfo.toJSON(),
                isSuccess: true,
            });
        } catch (error) {
            console.log(error);
            res.status(500).send("Lỗi sever");
        }
    }
}

module.exports = new ProfileController();
