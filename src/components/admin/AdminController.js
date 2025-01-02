const { User } = require("../user/userModel");
const Product = require("../shop/product/productModel");
const Shop = require("../shop/shopModel");
const profileModel = require("../user/profile/profileModel");
const orderModel = require("../shop/orders/orderModel");
const Sequelize = require("sequelize");
const order = new orderModel();
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
            // Lấy thông tin người dùng từ
            // session
            // Render trang admin và truyền thông tin người dùng
            res.render("admin", {
                title: "Admin Dashboard",
                user: req.user,
            });
        } catch (error) {
            console.error("Error fetching admin:", error);
            // Xử lý lỗi khi không thể lấy thông tin admin
            return res
                .status(500)
                .render("404", { message: "Failed to fetch admin." });
        }
    }

    // [GET] '/admin/profile/:id'
    async getAccountProfile(req, res) {
        try {
            // Kiểm tra người dùng đã xác thực hay chưa
            if (!req.user || !req.user.dataValues) {
                return res
                    .status(401)
                    .render("404", { message: "Unauthorized access" });
            }

            const userId = req.user.dataValues.id;

            // Tìm thông tin chi tiết của người dùng từ bảng `user_info`
            const profile = await profileModel.getUserInfo(userId);

            // Kiểm tra nếu không tìm thấy thông tin chi tiết
            if (!profile) {
                return res.status(404).render("404", {
                    message: "Không tìm thấy thông tin chi tiết người dùng",
                });
            }

            // Chuẩn bị dữ liệu người dùng kèm theo thông tin chi tiết
            const userData = {
                id: req.user.dataValues.id,
                email: req.user.dataValues.email,
                registration_time: req.user.dataValues.registration_time,
                is_admin: req.user.dataValues.is_admin,
                avatar: profile.avatar || "/default-avatar.png", // Ảnh đại diện mặc định
                profile: {
                    fullname: profile.fullname || "N/A",
                    phone: profile.phone || "N/A",
                    gender: profile.gender || "Unknown",
                    dob: profile.dob || "N/A",
                    address: profile.address || "N/A",
                },
            };

            // Render giao diện admin profile với dữ liệu người dùng
            res.render("admin_profile", {
                title: "Admin Profile",
                user: userData,
            });
        } catch (error) {
            console.error("Error fetching account profile:", error);
            res.status(500).render("404", {
                message: "Lỗi hệ thống. Vui lòng thử lại sau.",
            });
        }
    }

    // [POST] '/admin/profile/update/:id'
    async updateAccountProfile(req, res) {
        const userId = req.params.id;
        const { email, fullname, phone, gender, dob, address } = req.body;

        try {
            // Tìm người dùng theo ID
            const user = await User.findByPk(userId);

            if (!user) {
                return res
                    .status(404)
                    .render("error", { message: "User not found" });
            }

            // Cập nhật thông tin cơ bản của người dùng
            user.email = email || user.email;

            // Lưu thông tin cập nhật của người dùng
            await user.save();

            // Cập nhật thông tin chi tiết của người dùng (UserInfo)
            const updatedProfile = await profileModel.updateUserInfo({
                userID: user.id,
                fullname,
                phone,
                gender,
                dob,
                address,
            });

            if (!updatedProfile) {
                return res.status(404).render("error", {
                    message: "Failed to update user profile",
                });
            }

            // Chuyển hướng đến trang hồ sơ
            res.redirect(`/admin/profile/${user.id}`);
        } catch (error) {
            console.error("Error updating account profile:", error);
            return res
                .status(500)
                .render("error", { message: "Internal Server Error" });
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
                    { email: { [Sequelize.Op.like]: `%${search}%` } },
                    {
                        "$UserInfo.fullname$": {
                            [Sequelize.Op.like]: `%${search}%`,
                        },
                    },
                ];
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
                return res
                    .status(400)
                    .json({ error: "You can't ban yourself" });
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
                whereCondition["$Shop.product_name$"] = {
                    [Sequelize.Op.like]: `%${search}%`,
                }; // Tìm theo tên sản phẩm
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
            const sortingOrder =
                sortBy === "sold_quantity"
                    ? [
                          [
                              Sequelize.literal(`(
                            SELECT COALESCE(SUM(order_items.quantity), 0)
                            FROM order_items
                            INNER JOIN orders ON orders.order_id = order_items.order_id
                            WHERE order_items.product_id = Product.id
                            AND orders.order_status = 'Delivered'
                        )`),
                              sortOrder || "ASC", // Sắp xếp theo sold_quantity
                          ],
                      ]
                    : [
                          ["Shop", sortBy || "id", sortOrder || "ASC"], // Sắp xếp theo trường khác từ bảng Shop
                      ];

            // Gọi phương thức trong model để lấy dữ liệu sản phẩm
            const { rows: products, count: totalProducts } =
                await Product.getAllProducts({
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
        const {
            product_name,
            price,
            category,
            brand,
            size,
            color,
            rating,
            description,
            product_status,
        } = req.body;
        const photos = req.files.photos; // Multer sẽ lưu ảnh chính vào `req.files.photos`
        const subImage1 = req.files.sub_image1; // Ảnh phụ 1
        const subImage2 = req.files.sub_image2; // Ảnh phụ 2
        const subImage3 = req.files.sub_image3; // Ảnh phụ 3
        const subImage4 = req.files.sub_image4; // Ảnh phụ 4

        try {
            // Xử lý hình ảnh chính (photos)
            let imageFileName = null;
            if (photos && photos.length > 0) {
                imageFileName = photos[0].filename; // Lấy tên file ảnh chính (chỉ có một ảnh)
            }

            let subImageFileNames = [];

            if (subImage1 && subImage1.length > 0)
                subImageFileNames.push(subImage1[0].filename);
            if (subImage2 && subImage2.length > 0)
                subImageFileNames.push(subImage2[0].filename);
            if (subImage3 && subImage3.length > 0)
                subImageFileNames.push(subImage3[0].filename);
            if (subImage4 && subImage4.length > 0)
                subImageFileNames.push(subImage4[0].filename);
            // Xử lý ảnh phụ (sub_image)

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
                product_status,
                image: imageFileName, // Lưu tên file ảnh chính vào cơ sở dữ liệu
                subImageFileNames, // Lưu mảng tên file ảnh phụ vào cơ sở dữ liệu
            });

            // Trả về phản hồi thành công
            res.redirect("/admin/products");
        } catch (error) {
            console.error("Error creating product:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    // [POST] '/admin/products/update/:id'
    async updateProduct(req, res) {
        const productId = req.params.id;
        const {
            product_name,
            price,
            category,
            brand,
            size,
            delete_image,
            description,
            product_status,
        } = req.body;
        const { photos } = req.files;

        try {
            // Chuẩn bị các trường để cập nhật
            const updateFields = {};

            // Chỉ thêm các trường có giá trị vào updateFields
            if (product_name) updateFields.product_name = product_name;
            if (price) updateFields.price = price;
            if (category) updateFields.category = category;
            if (brand) updateFields.brand = brand;
            if (size) updateFields.size = size;
            if (description) updateFields.description = description;
            if (product_status) updateFields.product_status = product_status;

            // Nếu yêu cầu xóa ảnh
            if (delete_image === "1") {
                updateFields.imageFileName = null; // Đặt lại tên ảnh
            }

            // Nếu có ảnh mới được tải lên
            if (photos && photos.length > 0) {
                updateFields.imageFileName = photos[0].filename; // Lưu tên ảnh mới
            }

            await Shop.updateShop(productId, updateFields);

            // Nếu sản phẩm có chi tiết trong bảng Product
            if (description || product_status) {
                const productUpdateFields = {};
                if (description) productUpdateFields.description = description;
                if (product_status)
                    productUpdateFields.product_status = product_status;

                await Product.updateProduct(productId, productUpdateFields);
            }

            res.redirect("/admin/products");
        } catch (error) {
            console.error("Error updating product:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    // [POST] '/admin/products/delete/:id'
    async deleteProduct(req, res) {
        const productId = req.params.id;

        try {
            console.log("Deleting product:", productId);
            // Xóa sản phẩm theo ID
            await Product.deleteProduct(productId);

            await Shop.deleteShop(productId);

            // Trả về phản hồi thành công
            res.redirect("/admin/products");
        } catch (error) {
            console.error("Error deleting product:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }

    // [GET] '/admin/reports'
    async getAllReports(req, res) {
        try {
            const time_range = req.query.time_range || "day"; // Mặc định là báo cáo theo ngày
            const order = new orderModel();
            // Gọi hàm lấy doanh thu theo ngày
            if (time_range === "day") {
                const revenueByDate = await order.getRevenueByDate();
                const topRevenueProducts =
                    await order.getTopRevenueProductsByDate();
                res.render("report_management", {
                    revenueData: revenueByDate,
                    topProducts: topRevenueProducts,
                });
            } else if (time_range === "week") {
                // Gọi hàm lấy doanh thu theo tuần
                const revenueByWeek = await order.getRevenueByWeek();
                const topRevenueProducts =
                    await order.getTopRevenueProductsByWeek();
                res.render("report_management", {
                    revenueData: revenueByWeek,
                    topProducts: topRevenueProducts,
                });
            } else if (time_range === "month") {
                // Gọi hàm lấy doanh thu theo tháng
                const revenueByMonth = await order.getRevenueByMonth();
                const topRevenueProducts =
                    await order.getTopRevenueProductsByMonth();
                res.render("report_management", {
                    revenueData: revenueByMonth,
                    topProducts: topRevenueProducts,
                });
            } else {
                res.status(400).send("Invalid time range");
            }
        } catch (error) {
            console.error("Error fetching reports:", error);
            res.status(500).send("Internal Server Error");
        }
    }
}

module.exports = new AdminController();