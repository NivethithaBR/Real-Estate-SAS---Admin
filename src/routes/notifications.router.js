const express  = require("express")
const { searchNotifications, updateNotificationStatus, listNotifications,updateStatus, notifyUsers } = require("../controllers/notifications.controller");
const { verifyUser} = require("../middlewares/authMiddleware")
const router = express.Router();

router.get("/search", verifyUser, searchNotifications);
router.put("/updateStatus/:id", verifyUser, updateNotificationStatus);
router.get("/list", verifyUser, listNotifications);
router.post("/updatestatushere", verifyUser, updateStatus);
router.get("/notify",verifyUser,notifyUsers)

module.exports = router;
