import express from "express";
const router = express.Router();
import * as salesMovementController from "../controllers/salesMovementController.js";
import { auth as isAuthenticated, adminOnly as isAdmin } from "../middleware/auth.js"; // افترض وجود middleware للمصادقة والتحقق من المدير

// جلب كل حركات المبيعات (للمشرفين فقط)
router.get(
  "/",
  isAuthenticated,
  isAdmin,
  salesMovementController.getAllSalesMovements
);

// جلب حركات المبيعات لمنتج معين (يمكن أن يكون متاحًا للمستخدمين المسجلين أو المشرفين)
router.get(
  "/product/:productId",
  isAuthenticated,
  salesMovementController.getSalesMovementsByProduct
);

// جلب حركات المبيعات لمستخدم معين (للمستخدم نفسه أو للمشرفين)
// تم تقسيم هذا المسار الآن إلى مسارين منفصلين: /user/:userId و /user لتجنب المشاكل مع '?' في path-to-regexp ولتوضيح النية

// مسار لجلب الحركات لمستخدم معين بواسطة ID
// يجب أن يكون التحكم في الوصول (مثل، المشرف لرؤية أي مستخدم، أو المستخدم لرؤية بياناته الخاصة)
// محكومًا بشكل قوي إما عن طريق إضافة middleware أكثر تحديدًا (مثل isAdmin)
// أو من خلال التحقق داخل المتحكم. حاليًا، يتم تطبيق isAuthenticated فقط هنا.
router.get(
  "/user/:userId",
  isAuthenticated,
  salesMovementController.getSalesMovementsByUser
);

// مسار لجلب الحركات للمستخدم المسجل حاليًا
router.get(
  "/user",
  isAuthenticated,
  salesMovementController.getSalesMovementsByUser
);

// جلب حركات المبيعات لطلب معين (للمستخدم صاحب الطلب أو للمشرفين)
router.get(
  "/order/:orderId",
  isAuthenticated,
  salesMovementController.getSalesMovementsByOrder
);

// ملاحظة: لا يوجد مسار لإنشاء حركة مبيعات بشكل مباشر عبر API
// حيث أن الإنشاء يتم تلقائيًا عند تأكيد الطلب كما هو موضح في salesMovementController

export default router;
