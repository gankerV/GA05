const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/dataConfig");
const UserModel = require("../userModel");
const User = UserModel.User;

const UserInfo = sequelize.define(
    "UserInfo",
    {
        userID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        fullname: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        dob: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        gender: {
            type: DataTypes.ENUM("Male", "Female", "Other"),
            allowNull: true,
        },
        address: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        tableName: "user_info",
        timestamps: false,
    },
);
User.hasOne(UserInfo, { foreignKey: "userID" });
UserInfo.belongsTo(User, { foreignKey: "userID" });

class UserInfoModel {
    static get UserInfo() {
        return UserInfo;
    }

    static async saveUserInfo(userID) {
        try {
            const userInfo = await UserInfo.findOne({
                where: { userID: userID },
            });

            if (!userInfo) {
                const newUserInfo = await UserInfo.create({
                    userID: userID,
                });
                return newUserInfo;
            }
            return userInfo;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = UserInfoModel;
