const multer = require("multer");
const path = require("path");

// Hàm để tạo tên file cho ảnh người dùng
const userFilename = (req, file) => {
    const userID = req.query.userID || "default";
    const ext = path.extname(file.originalname);
    return `${userID}${ext}`;
};

// Hàm để tạo tên file cho ảnh sản phẩm
const productFilename = (req, file) => {
    const userID = req.query.userID || "default";
    const ext = path.extname(file.originalname);
    return `${userID}-${Date.now()}${ext}`;
};

// Cấu hình multer để lưu file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let dir;
        // Kiểm tra loại ảnh và quyết định thư mục lưu trữ
        if (
            file.fieldname === "photos" ||
            file.fieldname === "sub_image1" ||
            file.fieldname === "sub_image2" ||
            file.fieldname === "sub_image3" ||
            file.fieldname === "sub_image4"
        ) {
            dir = path.join(__dirname, "../../public/images/products/"); // Thư mục lưu ảnh sản phẩm
        } else {
            dir = path.join(__dirname, "../../public/images/user_images/"); // Thư mục lưu ảnh người dùng
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        let fileName;
        // Tùy thuộc vào loại ảnh, gọi hàm tạo tên file tương ứng
        if (
            file.fieldname === "photos" ||
            file.fieldname === "sub_image1" ||
            file.fieldname === "sub_image2" ||
            file.fieldname === "sub_image3" ||
            file.fieldname === "sub_image4"
        ) {
            fileName = productFilename(req, file);
        } else {
            fileName = userFilename(req, file);
        }
        cb(null, fileName);
    },
});

// Khởi tạo multer
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const extname = fileTypes.test(
            path.extname(file.originalname).toLowerCase(),
        );
        const mimeType = fileTypes.test(file.mimetype);
        if (extname && mimeType) {
            cb(null, true);
        } else {
            cb(new Error("Only images are allowed"));
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn kích thước file: 5MB
});

module.exports = upload;
