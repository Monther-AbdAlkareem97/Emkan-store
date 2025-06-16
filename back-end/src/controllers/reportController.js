import User from "../models/User.js";
import Order from "../models/Order.js";

export const getReports = async (req, res) => {
  try {
    // جلب كل الطلبات المكتملة
    const orders = await Order.find({ status: "completed" });
    // جلب كل المستخدمين العاديين فقط
    const customers = await User.countDocuments({ role: "user" });
    // تحديد الشهر الحالي
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // صفرية
    // حساب عدد الأيام في الشهر الحالي
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // تجهيز مصفوفة الأيام
    const days = Array.from(
      { length: daysInMonth },
      (_, i) =>
        `${year}-${String(month + 1).padStart(2, "0")}-${String(i + 1).padStart(
          2,
          "0"
        )}`
    );
    // تجميع المبيعات حسب اليوم
    const salesByDay = {};
    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      if (date.getFullYear() === year && date.getMonth() === month) {
        const day = `${year}-${String(month + 1).padStart(2, "0")}-${String(
          date.getDate()
        ).padStart(2, "0")}`;
        if (!salesByDay[day]) salesByDay[day] = 0;
        salesByDay[day] += order.totalAmount;
      }
    });
    // تجهيز بيانات الرسم البياني
    const chart = {
      labels: days,
      data: days.map((d) => salesByDay[d] || 0),
    };
    // إحصائيات أخرى كما كانت
    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const completedOrders = totalOrders;

    // المنتجات الأكثر مبيعًا
    const productSales = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!productSales[item.product]) {
          productSales[item.product] = {
            id: item.product,
            name: item.name,
            orders: 0,
          };
        }
        productSales[item.product].orders += item.quantity;
      });
    });
    // ترتيب المنتجات تنازليًا حسب عدد الطلبات وأخذ أول 5
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5);

    res.json({
      stats: {
        orders: totalOrders,
        sales: totalSales,
        customers: customers,
        completed: completedOrders,
      },
      topProducts: topProducts,
      chart,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
