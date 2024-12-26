const multer = require("multer");
const path = require("path");

// Cấu hình multer để lưu file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, "../../public/images/user_images/");
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const userID = req.query.userID || "default";
        const ext = path.extname(file.originalname);
        cb(null, `${userID}${ext}`);
    },
});

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
