const express = require("express");
const router = express.Router();
const { markAttendance, getAttendanceByDate, getMonthlyAttendance, getAllUsersForAttendance, getUserAttendence, createTask, getUserTask, getTask, eodReports, eodget} = require("../controllers/attendanceController");
const { authenticateUser, verifyUser } = require("../middlewares/authMiddleware");

// Admin only routes for attendance
const verifyAdmin = (req, res, next) => {
  if (req.auth.role !== "Admin" && req.auth.role !== "Super Admin") {
    return res.status(403).json({ success: false, message: "Only admin can access attendance" });
  }
  next();
};

router.post("/mark",verifyUser, markAttendance);
router.get("/by-date", authenticateUser, verifyAdmin, getAttendanceByDate);
router.get("/monthly", authenticateUser, verifyAdmin, getMonthlyAttendance);
router.get("/users", authenticateUser, verifyAdmin, getAllUsersForAttendance);
router.post("/getuser", getUserAttendence);

router.post("/create-task/:id", createTask);
router.post("/getuserTask", getUserTask);
router.post("/getTask/:id", getTask);

router.post("/eodreport/:id",eodReports)
router.post("/eod/:id",eodget)


module.exports = router;
