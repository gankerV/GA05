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
('Black long dress', 350.75, 'Women', 'S', 'Black', 'Puma', '5', '3.jpg');

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
(8, 'A fashionable backpack made with durable material. Spacious enough to carry books, gadgets, and other essentials.', 'Out Of Stock');


CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);
INSERT INTO users (email, password_1) VALUES
('test@gmail.com', '123');

