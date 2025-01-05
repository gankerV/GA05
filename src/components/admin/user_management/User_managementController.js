const { User } = require("../../user/userModel");
const profileModel = require("../../user/profile/profileModel");
const Sequelize = require("sequelize");

allUser = [];
user_per_page = 10;

class User_managementController{
    // [GET] '/admin/users'
    async getAllAccounts(req, res) {
        try {
            // Lấy thông tin từ query params
            const page = parseInt(req.query.page) || 1; // Trang hiện tại (mặc định là 1)
            const limit = 10; // Số lượng người dùng mỗi trang
            const offset = (page - 1) * limit; // Vị trí bắt đầu

            // Lấy danh sách người dùng với các điều kiện tìm kiếm, lọc, phân trang, và sắp xếp
            const { count, rows: users } = await User.findAndCountAll({
                attributes: ["id", "email", "access", "registration_time"], // Chọn các trường cần thiết
                limit,
                offset,
                include: [
                    {
                        model: profileModel.UserInfo,
                        attributes: [
                            "fullname",
                            "phone",
                            "dob",
                            "gender",
                            "address",
                        ],
                    },
                ],
            });

            // Tính tổng số trang
            const totalPages = Math.ceil(count / limit);

            // Chuyển đổi Sequelize instances thành plain objects
            const plainUsers = users.map((user) => user.get({ plain: true }));

            // Render trang quản lý người dùng kèm thông tin phân trang
            res.render("user_management", {
                users: plainUsers,
                currentPage: page,
                totalPages,
            });
        } catch (error) {
            console.error("Error fetching accounts:", error);
            res.status(500).send("Internal Server Error");
        }
    }

    // [GET] '/admin/users/api'
    async getPagination(req, res) {
        try {
            // Lấy thông tin từ query params
            const page = parseInt(req.query.page) || 1; // Trang hiện tại (mặc định là 1)
            const limit = 10; // Số lượng người dùng mỗi trang
            const offset = (page - 1) * limit; // Vị trí bắt đầu
            const { search,filter , sortBy, sortOrder } = req.query;

            // Điều kiện lọc cơ bản
            const whereCondition = {};

            // Nếu có tham số search, tìm kiếm theo tên hoặc email
            if (search) {
                whereCondition[Sequelize.Op.or] = [
                    { email: { [Sequelize.Op.like]: `%${search}%` } },
                    {
                        "$UserInfo.fullname$": {
                            [Sequelize.Op.like]: `%${search}%`,
                        },
                    },
                ];
            }

            // Lọc theo user hoặc admin
            if (filter) {
                whereCondition["is_admin"] = filter === "TRUE"; // Chuyển filter thành boolean
            }

            // Cấu hình sắp xếp (mặc định là theo `id`)
            const order = [
                [
                    Sequelize.col(
                        sortBy === "fullname"
                            ? "UserInfo.fullname"
                            : sortBy || "id",
                    ),
                    sortOrder === "desc" ? "DESC" : "ASC",
                ],
            ];

            // Lấy danh sách người dùng với các điều kiện tìm kiếm, lọc, phân trang, và sắp xếp
            const { count, rows: users } = await User.findAndCountAll({
                attributes: ["id", "email", "access", "registration_time"], // Chọn các trường cần thiết
                where: whereCondition, // Điều kiện lọc
                limit,
                offset,
                order, // Điều kiện sắp xếp
                include: [
                    {
                        model: profileModel.UserInfo,
                        attributes: [
                            "fullname",
                            "phone",
                            "dob",
                            "gender",
                            "address",
                        ],
                    },
                ],
            });

            // Tính tổng số trang
            const totalPages = Math.ceil(count / limit);

            // Chuyển đổi Sequelize instances thành plain objects
            const plainUsers = users.map((user) => user.get({ plain: true }));

            // Nếu bạn muốn gửi kết quả dưới dạng JSON qua API
            res.status(200).json({
                currentPage: page,
                totalPages,
                totalUsers: count,
                users: plainUsers, // Sequelize instances đã chuyển đổi
            });
        } catch (error) {
            console.error("Error fetching accounts:", error);
            res.status(500).send("Internal Server Error");
        }
    }

    // [GET] '/admin/users/:id'
    async getAccountDetails(req, res) {
        const userId = req.params.id;

        try {
            const user = await User.findByPk(userId, {
                attributes: ["id", "email", "access", "registration_time"],
                include: {
                    model: profileModel.UserInfo,
                    attributes: [
                        "fullname",
                        "phone",
                        "dob",
                        "gender",
                        "address",
                        "avatar",
                    ],
                },
            });

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            res.json(user);
        } catch (error) {
            console.error("Error fetching user details:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    // [POST] '/admin/users/status/:id'
    async updateUserStatus(req, res) {
        const userId = req.params.id;
        const adminID = req.user ? req.user.dataValues.id : null;

        const { status } = req.body;
        try {
            // Tìm người dùng theo ID
            const user = await User.findByPk(userId);

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            if (user.id === adminID) {
                return res.render("ban_error")
            }

            // Cập nhật trạng thái người dùng
            if (status === "ban") {
                user.access = false; // Đánh dấu người dùng là bị cấm
            } else if (status === "unban") {
                user.access = true; // Đánh dấu người dùng là hoạt động
            }

            await user.save(); // Lưu lại thay đổi

            // Trả về phản hồi thành công
            res.redirect("/admin/users"); // Quay lại trang quản lý người dùng
        } catch (error) {
            console.error("Error updating user status:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
}

module.exports = new User_managementController();