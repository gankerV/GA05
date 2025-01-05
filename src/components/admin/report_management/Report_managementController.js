const orderModel = require("../../shop/orders/orderModel");
const Sequelize = require("sequelize");

class Report_managementController{
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

module.exports = new Report_managementController();