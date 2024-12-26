-- Tạo cơ sở dữ liệu mới
drop database if exists my_store;
CREATE DATABASE IF NOT EXISTS my_store;

-- Sử dụng cơ sở dữ liệu vừa tạo
USE my_store;

-- Tạo bảng products (Danh sách sản phẩm)
CREATE TABLE shop (
    id INT AUTO_INCREMENT PRIMARY KEY, 
    product_name VARCHAR(255) NOT NULL, 
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(255) NOT NULL,
    size ENUM('S', 'M', 'L') NOT NULL, 
    color VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    rating ENUM('1', '2', '3', '4', '5') NOT NULL, 
    imageFileName VARCHAR(255)
);

-- Thêm dữ liệu mẫu vào bảng products
INSERT INTO shop (product_name, price, category, size, color, brand, rating, imageFileName) VALUES
('Blue womens suit', 100.00, 'Women', 'M', 'Blue', 'Nike', '5', '5.jpg'),
('White shirt with long sleeves', 150.50, 'Women', 'L', 'White', 'Nike', '4', '6.jpg'),
('Yellow mens suit', 200.99, 'Men', 'S', 'Yellow', 'Puma', '3', '7.jpg'),
('Red dress', 250.00, 'Women', 'M', 'Red', 'Adidas', '5', '8.jpg'),
('Black leather jacket', 300.00, 'Women', 'L', 'Brown', 'Adidas', '4', '4.jpg'),
('Black long dress', 350.75, 'Women', 'S', 'Black', 'Puma', '5', '3.jpg'),
('Red dress', 250.00, 'Women', 'M', 'Red', 'Adidas', '5', '8.jpg'),
('Black long dress', 350.75, 'Women', 'S', 'Black', 'Puma', '5', '3.jpg'),

('Black formal suit', 500.00, 'Men', 'L', 'Black', 'Gucci', '5', '9.jpg'),
('Brown leather shoes', 150.00, 'Men', 'M', 'Brown', 'Clarks', '5', '10.jpg'),
('Navy blue chinos', 70.50, 'Men', 'L', 'Blue', 'Zara', '4', '11.jpg'),
('White polo T-shirt', 40.99, 'Men', 'S', 'White', 'Lacoste', '4', '12.jpg');

-- Tạo bảng Product (Chi tiết sản phẩm)
CREATE TABLE product (
    id INT PRIMARY KEY,                    
    description TEXT NOT NULL,             
    product_status ENUM('In Stock', 'Out Of Stock') DEFAULT 'In Stock', 
    FOREIGN KEY (id) REFERENCES shop(id)   
);

-- Thêm dữ liệu mẫu vào bảng Product
INSERT INTO product (id, description, product_status) VALUES
(1, 'This is a classic T-shirt made from soft cotton fabric, providing a comfortable fit. Perfect for casual outings or lounging.', 'In Stock'),
(2, 'A stylish hoodie with a modern design. Made from a blend of cotton and polyester for warmth and comfort.', 'In Stock'),
(3, 'Lightweight denim jacket that pairs well with almost any outfit. A timeless piece for any wardrobe.', 'Out Of Stock'),
(4, 'Sports joggers designed for active wear. Made from breathable fabric for ultimate comfort during workouts.', 'In Stock'),
(5, 'Premium quality leather shoes with a sleek design. Ideal for both casual and formal occasions.', 'In Stock'),
(6, 'A fashionable backpack made with durable material. Spacious enough to carry books, gadgets, and other essentials.', 'Out Of Stock'),
(7, 'A fashionable backpack made with durable material. Spacious enough to carry books, gadgets, and other essentials.', 'Out Of Stock'),
(8, 'A fashionable backpack made with durable material. Spacious enough to carry books, gadgets, and other essentials.', 'Out Of Stock'),

(9, 'A premium black formal suit, tailored to perfection for business meetings or special occasions.', 'In Stock'),
(10, 'Stylish and durable brown leather shoes. Perfect for both formal events and casual settings.', 'In Stock'),
(11, 'Slim-fit navy blue chinos made from soft fabric, offering a smart yet casual look.', 'In Stock'),
(12, 'Classic white polo T-shirt with a breathable fabric, perfect for summer wear.', 'In Stock');

-- Tạo bảng review
CREATE TABLE review (
    id INT AUTO_INCREMENT PRIMARY KEY,             -- ID của đánh giá (tự động tăng)
    product_id INT NOT NULL,                       -- ID sản phẩm được đánh giá (liên kết với bảng product)
    customer_name VARCHAR(100) NOT NULL,           -- Tên khách hàng để lại đánh giá
    customer_email VARCHAR(100) NOT NULL,         -- Email khách hàng
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5), -- Đánh giá (1-5 sao)
    comment TEXT,                                  -- Bình luận của khách hàng
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Ngày giờ đánh giá được tạo
    FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE CASCADE, -- Ràng buộc với bảng product
    INDEX (product_id)                             -- Tăng tốc truy vấn
);

INSERT INTO review (product_id, customer_name, customer_email, rating, comment) VALUES
(1, 'John Doe', 'johndoe@gmail.com', 5, 'Great quality! Fits perfectly and the material feels premium. Highly recommend this t-shirt.'),
(1, 'Alice Smith', 'alice.smith@gmail.com', 4, 'Nice quality, but a bit too tight. Still love the design.'),
(1, 'Bob Johnson', 'bob.johnson@gmail.com', 5, 'The best t-shirt I’ve ever bought. Perfect fit and amazing fabric.'),
(1, 'Eve Green', 'eve.green@gmail.com', 3, 'It’s good, but the material could be softer.'),
(1, 'Charlie Brown', 'charlie.brown@gmail.com', 4, 'Very comfortable and stylish, but the color is a bit lighter than expected.'),
(1, 'Lily White', 'lily.white@gmail.com', 5, 'Absolutely love it! Feels so comfortable and looks great.'),
(1, 'David Wilson', 'david.wilson@gmail.com', 2, 'Not satisfied with the quality. The fabric feels rough.'),
(1, 'Sophia Clark', 'sophia.clark@gmail.com', 4, 'Great shirt, fits well, but I would like a wider range of colors.');

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    access BOOLEAN DEFAULT TRUE,
    registration_time timestamp DEFAULT current_timestamp,
    is_admin BOOLEAN DEFAULT FALSE,
    is_google BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT FALSE,
    activation_token VARCHAR(255)
);

CREATE TABLE user_info (
    userID INT PRIMARY KEY NOT NULL,
    fullname VARCHAR(50),
    phone VARCHAR(15),
    dob DATE,
    gender ENUM('Male', 'Female', 'Other'),
    address VARCHAR(255),
    avatar VARCHAR(10),
    FOREIGN KEY (userID) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE cart (
    id INT AUTO_INCREMENT PRIMARY KEY,          -- ID duy nhất cho mỗi mục trong giỏ hàng
    user_id INT NOT NULL,                       -- ID của người dùng
    product_id INT NOT NULL,                    -- ID của sản phẩm
    quantity INT DEFAULT 1,                     -- Số lượng sản phẩm (mặc định là 1)
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Thời gian thêm vào giỏ hàng
    FOREIGN KEY (user_id) REFERENCES users(id)  -- Ràng buộc khóa ngoại tới bảng users
        ON DELETE CASCADE,                      -- Xóa mục trong giỏ khi user bị xóa
    FOREIGN KEY (product_id) REFERENCES shop(id) -- Ràng buộc khóa ngoại tới bảng shop
        ON DELETE CASCADE                       -- Xóa mục trong giỏ khi sản phẩm bị xóa
);
