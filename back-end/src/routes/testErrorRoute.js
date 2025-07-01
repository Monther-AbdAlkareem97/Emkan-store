// Route to test error logging
import express from "express";
const router = express.Router();

router.get("/test-error", (req, res, next) => {
  throw new Error("Test Error");
});

export default router;
