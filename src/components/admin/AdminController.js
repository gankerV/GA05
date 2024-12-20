const { User } = require("../user/userModel"); // Adjust the path as needed

class AdminController {
    /**
     * Lấy thông tin admin
     * @param {Object} req - Request từ Express
     * @param {Object} res - Response từ Express
     */
    // [GET] '/admin'
    async index(req, res) {
        try {
            // Kiểm tra nếu user đã đăng nhập và có thông tin
            if (!req.user || !req.user.id) {
                return res.status(403).render("404", { message: "Access denied. You are not logged in." });
            }
            
            const userId = req.user.id;
            
            // Tìm thông tin người dùng admin từ database
            const user = await User.findByPk(userId); // Giả sử bạn có model User để truy vấn
            if (!user || !user.is_admin) {
                return res.status(403).render("404", { message: "Access denied. You are not an admin." });
            }

            // Render trang admin và truyền thông tin người dùng
            res.render("admin", {
                title: "Admin Dashboard",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    profilePicture: user.profilePicture || "/default-avatar.png",
                },
            });
        } catch (error) {
            console.error("Error fetching admin:", error);
            // Xử lý lỗi khi không thể lấy thông tin admin
            return res.status(500).render("404", { message: "Failed to fetch admin." });
        }
    }

    // [GET] '/admin/users'
    async getAllAccounts(req, res) {
        try {
            const users = await User.findAll({
                attributes: ["id", "email", "name", "access", "registration_time"], // Select only the required fields
            });

            // Convert Sequelize instances to plain objects
            const plainUsers = users.map(user => user.get({ plain: true }));

            res.render("user_management", { users: plainUsers });
        } catch (error) {
            console.error("Error fetching accounts:", error);
            res.status(500).send("Internal Server Error");
        }
    }

    // [GET] '/admin/profile/:id'
    async getAccountProfile(req, res) {
        const userId = req.params.id;
    
        try {
            // Tìm người dùng theo ID
            const user = await User.findByPk(userId);
    
            // Kiểm tra nếu không tìm thấy người dùng
            if (!user) {
                return res.status(404).render("error", { message: "User not found" });
            }
    
            // Chuyển đổi user sang đối tượng JavaScript thông thường
            const userData = {
                id: user.id,
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture || "/default-avatar.png", // Dùng ảnh mặc định nếu không có
            };
    
            // Render giao diện admin profile với dữ liệu người dùng
            res.render("admin_profile", {
                title: "Admin Profile",
                user: userData,
            });
        } catch (error) {
            console.error("Error fetching account profile:", error);
            res.status(500).render("error", { message: "Internal Server Error" });
        }
    }    

    // [POST] '/admin/profile/update/:id'
    async updateAccountProfile(req, res) {
        const userId = req.params.id;
        const { name, email } = req.body;


        try {
            // Find the user by ID
            const user = await User.findByPk(userId);

            if (!user) {
                return res.status(404).render("error", { message: "User not found" });
            }

            // Update the user details
            user.name = name || user.name;
            user.email = email || user.email;

            // Save the updated user data
            await user.save();

            // Redirect to the profile page or a success page
            res.redirect(`/admin/profile/${user.id}`);
        } catch (error) {
            console.error("Error updating account profile:", error);
            return res.status(500).render("error", { message: "Internal Server Error" });
        }
    }
}

module.exports = new AdminController();
