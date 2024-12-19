const { User } = require("../user/userModel"); // Adjust the path as needed

class AdminController {
    // [GET] '/admin'
    index(req, res) {
        res.render("admin");
    }

    // [GET] '/admin/users'
    async getAllAccounts(req, res) {
        try {
            const users = await User.findAll({
                attributes: ["id", "email", "access", "registration_time"], // Select only the required fields
            });

            // Convert Sequelize instances to plain objects
            const plainUsers = users.map(user => user.get({ plain: true }));

            res.render("userManagement", { users: plainUsers });
        } catch (error) {
            console.error("Error fetching accounts:", error);
            res.status(500).send("Internal Server Error");
        }
    }
}

module.exports = new AdminController();
