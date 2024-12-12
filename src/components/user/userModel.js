const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../../config/dataConfig");
const bcryptjs = require("bcryptjs");

const User = sequelize.define(
    "User",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        tableName: "users",
        timestamps: false,
    },
);

class UserModel {
    static get User() {
        return User; // Getter cho đối tượng User
    }

    static async saveUser(account) {
        try {
            // Kiểm tra các trường bắt buộc
            const {
                Email,
                Password,
                "Confirm Password": ConfirmPassword,
            } = account;

            // Mã hóa mật khẩu
            const hashedPassword = await bcryptjs.hash(Password, 10); // 10 là số vòng salt

            // Lưu người dùng vào cơ sở dữ liệu
            const newUser = await User.create({
                email: Email,
                password: hashedPassword,
            });

            return true;
        } catch (error) {
            return false;
        }
    }

    static async isEmailExist(email) {
        try {
            const emailExist = await User.findOne({ where: { email: email } });
            return emailExist;
        } catch (error) {}
    }
}

module.exports = UserModel;
