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

            // Kiểm tra xem email đã tồn tại trong cơ sở dữ liệu chưa
            const existingUser = await User.findOne({
                where: { email: Email },
            });
            if (existingUser) {
                throw new Error("Email already exists");
            }

            // Kiểm tra xem Password và Confirm Password có khớp không
            if (Password !== ConfirmPassword) {
                throw new Error(
                    '"Password" and "Confirm Password" do not match',
                );
            }

            // Mã hóa mật khẩu
            const hashedPassword = await bcryptjs.hash(Password, 10); // 10 là số vòng salt

            // Lưu người dùng vào cơ sở dữ liệu
            const newUser = await User.create({
                email: Email,
                password: hashedPassword,
            });

            return {
                success: true,
                message: "Register successful",
                data: newUser,
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
            };
        }
    }
}

module.exports = UserModel;
