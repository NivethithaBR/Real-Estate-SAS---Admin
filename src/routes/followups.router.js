const express = require("express");
const { createFollowup, deleteFollowup, getFollowup, updateFollowupStatus, getAllFollowups } = require("../controllers/followups.controller");
const { verifyUser} = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/create",verifyUser ,createFollowup);
router.delete("/delete/:id", deleteFollowup);
router.put("/updateStatus/:id", updateFollowupStatus);
router.get("/get/:id", getFollowup);
router.get("/getAll", getAllFollowups);

module.exports = router;
