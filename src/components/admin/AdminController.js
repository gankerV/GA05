const { User } = require("../user/userModel"); 
const Product = require("../shop/product/productModel"); 
const Sequelize = require("sequelize");

allUser = [];
user_per_page = 10;

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
            // Lấy thông tin từ query params
            const page = parseInt(req.query.page) || 1; // Trang hiện tại (mặc định là 1)
            const limit = 10; // Số lượng người dùng mỗi trang
            const offset = (page - 1) * limit; // Vị trí bắt đầu
            const { search, sortBy, sortOrder } = req.query;

            // Điều kiện lọc cơ bản
            const whereCondition = {};

            // Nếu có tham số search, tìm kiếm theo tên hoặc email
            if (search) {
                whereCondition[Sequelize.Op.or] = [
                    { name: { [Sequelize.Op.like]: `%${search}%` } },
                    { email: { [Sequelize.Op.like]: `%${search}%` } },
                ];
            }

            // Cấu hình sắp xếp (mặc định là theo `id`)
            const order = [[sortBy || 'id', sortOrder === 'desc' ? 'DESC' : 'ASC']];

            // Lấy danh sách người dùng với các điều kiện tìm kiếm, lọc, phân trang, và sắp xếp
            const { count, rows: users } = await User.findAndCountAll({
                attributes: ["id", "email", "name", "access", "registration_time"], // Chọn các trường cần thiết
                where: whereCondition, // Điều kiện lọc
                limit,
                offset,
                order, // Điều kiện sắp xếp
            });

            // Tính tổng số trang
            const totalPages = Math.ceil(count / limit);

            // Chuyển đổi Sequelize instances thành plain objects
            const plainUsers = users.map(user => user.get({ plain: true }));

            // Render trang quản lý người dùng kèm thông tin phân trang
            res.render("user_management", { 
                users: plainUsers, 
                currentPage: page, 
                totalPages,
                search,
                sortBy,
                sortOrder,
            });
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

    // [GET] '/admin/users/:id'
    async getAccountDetails(req, res) {
        const userId = req.params.id;
        
        try {
        const user = await User.findByPk(userId, {
            attributes: ['id', 'name', 'email', 'access', 'registration_time'],
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

        const { status } = req.body; // Trạng thái mới: 'banned' hoặc 'active'
    
        try {
        // Tìm người dùng theo ID
        const user = await User.findByPk(userId);
    
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.id === adminID) {
            return res.status(400).json({ error: "You can't ban yourself" });
        }
        
        // Cập nhật trạng thái người dùng
        if (status === 'banned') {
            user.access = false; // Đánh dấu người dùng là bị cấm
        } else if (status === 'active') {
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
    
    // [GET] '/admin/products'
    async getAllProducts(req, res) {
        try {
            const page = parseInt(req.query.page) || 1; // Trang hiện tại (mặc định là 1)
            const limit = 8; // Số lượng sản phẩm mỗi trang
            const offset = (page - 1) * limit; // Vị trí bắt đầu
            const { search, sortBy, sortOrder, category, brand } = req.query;
    
            // Điều kiện lọc cơ bản
            const whereCondition = {};
    
            // Lọc theo tên sản phẩm
            if (search) {
                whereCondition["$Shop.product_name$"] = { [Sequelize.Op.like]: `%${search}%` }; // Tìm theo tên sản phẩm
            }
    
            // Lọc theo category (trong bảng Shop)
            if (category) {
                whereCondition["$Shop.category$"] = category; // Sử dụng dấu $ để tham chiếu đến bảng Shop
            }
    
            // Lọc theo brand (trong bảng Shop)
            if (brand) {
                whereCondition["$Shop.brand$"] = brand; // Sử dụng dấu $ để tham chiếu đến bảng Shop
            }
    
            // Điều kiện sắp xếp (sắp xếp theo sold_quantity nếu có)
            const sortingOrder = sortBy === "sold_quantity"
                ? [
                    [
                        Sequelize.literal(`(
                            SELECT COALESCE(SUM(order_items.quantity), 0)
                            FROM order_items
                            INNER JOIN orders ON orders.order_id = order_items.order_id
                            WHERE order_items.product_id = Product.id
                            AND orders.order_status = 'Delivered'
                        )`),
                        sortOrder || "ASC" // Sắp xếp theo sold_quantity
                    ]
                ]
                : [
                    ["Shop", sortBy || "id", sortOrder || "ASC"] // Sắp xếp theo trường khác từ bảng Shop
                ];
    
            // Gọi phương thức trong model để lấy dữ liệu sản phẩm
            const { rows: products, count: totalProducts } = await Product.getAllProducts({
                limit,
                offset,
                whereConditions: whereCondition, // Truyền điều kiện lọc
                order: sortingOrder,
            });
    
            const totalPages = Math.ceil(totalProducts / limit); // Tổng số trang
    
            // Trả về giao diện với dữ liệu
            res.render("product_management", {
                products,
                currentPage: page,
                totalPages,
            });
        } catch (error) {
            console.error("Error fetching products:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }    
    
   // [POST] '/admin/products/add'
    async createProduct(req, res) {
        const { product_name, price, category, brand, size, color, rating, description } = req.body;
        const image = req.file; // Multer sẽ lưu file vào `req.file`
        
        try {
            // Xử lý hình ảnh
            let imageFileName = null;
            if (image) {
                imageFileName = image.filename; // Lấy tên file từ Multer
            }
        
            // Tạo sản phẩm mới
            const product = await Product.create({
                product_name,
                price,
                category,
                brand,
                size,
                color,
                rating,
                description,
                image: imageFileName, // Lưu tên file vào cơ sở dữ liệu
            });

            // Trả về phản hồi thành công
            res.redirect("/admin/products");
        } catch (error) {
            console.error("Error creating product:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    // [GET] '/admin/orders'
    async getAllOrders(req, res) {
        try {
            // Trả về giao diện với dữ liệu
            res.render("order_management");
        } catch (error) {
            console.error("Error fetching orders:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

}

module.exports = new AdminController();