const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../../config/dataConfig");
const bcryptjs = require("bcryptjs");
const crypto = require("crypto");

const User = sequelize.define(
    "User",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        access: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        registration_time: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.NOW,
        },
        is_admin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        is_google: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        activation_token: {
            type: DataTypes.STRING,
            allowNull: true,
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
            const {
                Email,
                Password,
                "Confirm Password": ConfirmPassword,
            } = account;

            // Kiểm tra mật khẩu khớp
            if (Password !== ConfirmPassword) {
                return false;
            }

            // Mã hóa mật khẩu
            const hashedPassword = await bcryptjs.hash(Password, 10);

            // Tạo mã kích hoạt
            const activationToken = crypto.randomBytes(20).toString("hex");

            // Lưu người dùng vào cơ sở dữ liệu
            await User.create({
                email: Email,
                password: hashedPassword,
                is_active: false, // Mặc định chưa kích hoạt
                activation_token: activationToken, // Lưu token
            });

            return activationToken; // Trả về token để gửi email
        } catch (error) {
            throw error;
        }
    }

    static async activateUserByToken(token) {
        try {
            // Tìm người dùng với activation_token khớp
            const user = await User.findOne({
                where: {
                    activation_token: token,
                    is_active: false,
                },
            });

            if (!user) return false;

            // Cập nhật trạng thái tài khoản
            user.is_active = true;
            user.activation_token = null; // Xóa token sau khi kích hoạt
            await user.save();

            return true;
        } catch (error) {
            console.error("Lỗi kích hoạt tài khoản:", error);
            throw error;
        }
    }

    static async resetPasswordByToken(token) {
        try {
            // Tìm người dùng với activation_token khớp
            const user = await User.findOne({
                where: {
                    activation_token: token,
                    is_active: true,
                },
            });

            if (!user) return false;

            user.activation_token = null; // Xóa token sau khi kích hoạt
            await user.save();

            return true;
        } catch (error) {
            console.error("Lỗi kích hoạt tài khoản:", error);
            throw error;
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
