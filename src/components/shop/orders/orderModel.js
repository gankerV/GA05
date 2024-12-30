const { DataTypes, Sequelize } = require("sequelize");
const sequelize = require("../../../config/dataConfig");


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

class OrderModel {
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

}

module.exports = OrderModel;
