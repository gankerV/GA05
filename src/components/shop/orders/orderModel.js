const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../../../config/dataConfig");
const Shop = require("../../shop/shopModel").Shop;

const Order = sequelize.define('Order', {
    order_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    order_date: {
        type: DataTypes.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    order_status: {
        type: DataTypes.ENUM('Pending', 'Shipped', 'Delivered', 'Cancelled'),
        defaultValue: 'Pending',
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    shipping_address: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    payment_status: {
        type: DataTypes.ENUM('Paid', 'Unpaid'),
        defaultValue: 'Unpaid',
    },
    payment_method: {
        type: DataTypes.ENUM('Credit Card', 'PayPal', 'Cash On Delivery'),
        defaultValue: 'Cash On Delivery',
    },
}, {
    tableName: 'orders',
    timestamps: false,
});


const OrderItem = sequelize.define('OrderItem', {
    order_item_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
}, {
    tableName: 'order_items',
    timestamps: false,
});

// Order has many OrderItems
Order.hasMany(OrderItem, {
    foreignKey: 'order_id',
    as: 'orderItems', // Tên alias để truy cập OrderItems từ Order
});

// OrderItem belongs to Order
OrderItem.belongsTo(Order, {
    foreignKey: 'order_id',
    as: 'order', // Tên alias để truy cập Order từ OrderItem
});

// Trong model OrderItem, thêm quan hệ với Shop
OrderItem.belongsTo(Shop, {
    foreignKey: 'product_id', // Liên kết OrderItem với Shop qua product_id
    as: 'shop', // alias để truy cập thông tin Shop
});

class OrderModel {

    constructor() {
        this.Order = Order;
        this.OrderItem = OrderItem;
    }

    static get Order() {
        return Order;
    }

    static get OrderItem() {
        return OrderItem;
    }
    
    // Get orders with pagination, filtering, and sorting
    async getOrders({ limit, offset, where, order }) {
        try {
            return await Order.findAndCountAll({
                limit,
                offset,
                where,
                order,
            });
        } catch (error) {
            console.error("Error fetching orders:", error);
            return { rows: [], count: 0 };
        }
    }

    // Update order status
    async updateOrderStatus(userId, status) {
        try {
            const [updated] = await Order.update(
                { order_status: status },
                { where: { user_id: userId } }
            );
            return updated > 0; // Return true if update was successful
        } catch (error) {
            console.error("Error updating order status:", error);
            return false;
        }
    }

    async getOrderById(id){
        try {
            return await Order.findOne({ where: { order_id: id } });
        } catch (error) {
            console.error("Error fetching order by ID:", error);
            return null;
        }
    }

   // Lấy doanh thu theo ngày
    async getRevenueByDate() {
        try {
            const revenueData = await Order.findAll({
                attributes: [
                    [sequelize.fn('DATE', sequelize.col('order_date')), 'date_or_period'],
                    [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue'],
                ],
                where: {
                    order_status: 'Delivered',
                },
                group: [sequelize.fn('DATE', sequelize.col('order_date'))],
                order: [[sequelize.fn('DATE', sequelize.col('order_date')), 'DESC']], // Sắp xếp theo ngày mới nhất
                limit: 5, // Giới hạn kết quả chỉ lấy tối đa 5 ngày
                raw: true,
            });

            return revenueData;
        } catch (error) {
            console.error("Error fetching revenue by date:", error);
            return [];
        }
    }

    //lấy doanh thu theo tuần
    async getRevenueByWeek() {
        try {
            const revenueData = await Order.findAll({
                attributes: [
                    [sequelize.fn('WEEK', sequelize.col('order_date')), 'date_or_period'],
                    [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue'],
                ],
                where: {
                    order_status: 'Delivered',
                },
                group: [sequelize.fn('WEEK', sequelize.col('order_date'))],
                order: [[sequelize.fn('WEEK', sequelize.col('order_date')), 'DESC']], // Sắp xếp theo tuần mới nhất
                limit: 4, // Giới hạn kết quả chỉ lấy tối đa tuần
                raw: true,
            });

            return revenueData;
        } catch (error) {
            console.error("Error fetching revenue by week:", error);
            return [];
        }
    }

    // Lấy doanh thu theo tháng
    async getRevenueByMonth() {
        try {
            const revenueData = await Order.findAll({
                attributes: [
                    [sequelize.fn('MONTH', sequelize.col('order_date')), 'date_or_period'],
                    [sequelize.fn('SUM', sequelize.col('total_amount')), 'revenue'],
                ],
                where: {
                    order_status: 'Delivered',
                },
                group: [sequelize.fn('MONTH', sequelize.col('order_date'))],
                order: [[sequelize.fn('MONTH', sequelize.col('order_date')), 'DESC']], // Sắp xếp theo tháng mới nhất
                limit: 3, // Giới hạn kết quả chỉ lấy tối đa 5 tháng
                raw: true,
            });

            return revenueData;
        } catch (error) {
            console.error("Error fetching revenue by month:", error);
            return [];
        }
    }

    async getTopRevenueProductsByDate() {
        try {
            const topProducts = await OrderItem.findAll({
                attributes: [
                    'product_id',
                    [
                        sequelize.fn('SUM', sequelize.literal('quantity * OrderItem.price')),
                        'total_revenue',
                    ],
                ],
                include: [
                    {
                        model: Shop, // Mô hình Shop
                        as: 'shop', // Alias được chỉ định trong quan hệ
                        attributes: ['product_name'], // Lấy tên sản phẩm từ bảng Shop
                        required: true, // Bắt buộc phải có thông tin từ bảng Shop
                    },
                    {
                        model: Order, // Mô hình Order
                        as: 'order', // Alias được chỉ định trong quan hệ
                        attributes: [], // Không lấy thông tin từ bảng Order
                        where: { order_status: 'Delivered',
                            order_date: sequelize.where(sequelize.fn('DATE', sequelize.col('order_date')), '=', sequelize.literal('CURRENT_DATE'))
                         }, // Chỉ lấy thông tin từ các đơn hàng đã giao và trong hôm nay
                    }
                ],
                group: ['OrderItem.product_id', 'shop.id'], // Nhóm theo product_id và shop.id
                order: [[sequelize.literal('total_revenue'), 'DESC']], // Sắp xếp theo tổng doanh thu giảm dần
                limit: 5, // Lấy tối đa 5 sản phẩm
                raw: false, // Sử dụng raw: false để có thể truy cập vào quan hệ
            });
    
            return topProducts;
        } catch (error) {
            console.error("Error fetching top revenue products:", error);
            return [];
        }
    }     

    async getTopRevenueProductsByWeek() {
        try {
            const topProducts = await OrderItem.findAll({
                attributes: [
                    'product_id',
                    [
                        sequelize.fn('SUM', sequelize.literal('quantity * OrderItem.price')),
                        'total_revenue',
                    ],
                ],
                include: [
                    {
                        model: Shop, // Mô hình Shop
                        as: 'shop', // Alias được chỉ định trong quan hệ
                        attributes: ['product_name'], // Lấy tên sản phẩm từ bảng Shop
                        required: true, // Bắt buộc phải có thông tin từ bảng Shop
                    },
                    {
                        model: Order, // Mô hình Order
                        as: 'order', // Alias được chỉ định trong quan hệ
                        attributes: [], // Không lấy thông tin từ bảng Order
                        where: { order_status: 'Delivered',
                            order_date: sequelize.where(sequelize.fn('WEEK', sequelize.col('order_date')), '=', sequelize.literal('WEEK(CURRENT_DATE())'))
                         }, // Chỉ lấy thông tin từ các đơn hàng đã giao và trong tuần này
                    }
                ],
                group: ['OrderItem.product_id', 'shop.id'], // Nhóm theo product_id và shop.id
                order: [[sequelize.literal('total_revenue'), 'DESC']], // Sắp xếp theo tổng doanh thu giảm dần
                limit: 5, // Lấy tối đa 5 sản phẩm
                raw: false, // Sử dụng raw: false để có thể truy cập vào quan hệ
            });
    
            return topProducts;
        } catch (error) {
            console.error("Error fetching top revenue products:", error);
            return [];
        }
    }

    async getTopRevenueProductsByMonth() {
        try {
            const topProducts = await OrderItem.findAll({
                attributes: [
                    'product_id',
                    [
                        sequelize.fn('SUM', sequelize.literal('quantity * OrderItem.price')),
                        'total_revenue',
                    ],
                ],
                include: [
                    {
                        model: Shop, // Mô hình Shop
                        as: 'shop', // Alias được chỉ định trong quan hệ
                        attributes: ['product_name'], // Lấy tên sản phẩm từ bảng Shop
                        required: true, // Bắt buộc phải có thông tin từ bảng Shop
                    },
                    {
                        model: Order, // Mô hình Order
                        as: 'order', // Alias được chỉ định trong quan hệ
                        attributes: [], // Không lấy thông tin từ bảng Order
                        where: { order_status: 'Delivered',
                            order_date: sequelize.where(sequelize.fn('MONTH', sequelize.col('order_date')), '=', sequelize.literal('MONTH(CURRENT_DATE())'))
                         }, // Chỉ lấy thông tin từ các đơn hàng đã giao và trong tháng này
                    }
                ],
                group: ['OrderItem.product_id', 'shop.id'], // Nhóm theo product_id và shop.id
                order: [[sequelize.literal('total_revenue'), 'DESC']], // Sắp xếp theo tổng doanh thu giảm dần
                limit: 5, // Lấy tối đa 5 sản phẩm
                raw: false, // Sử dụng raw: false để có thể truy cập vào quan hệ
            });
    
            return topProducts;
        } catch (error) {
            console.error("Error fetching top revenue products:", error);
            return [];
        }
    }

}

module.exports = OrderModel;
