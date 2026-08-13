const express = require("express");
const { estimateLimit, estimateLimitGet, estimatedPrice, cancelDurationGet, cancelLimit, cancelBooking } = require("../controllers/estimateController")
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();
const { verifyUser} = require("../middlewares/authMiddleware");

router.route("/estimated-limit-edit").post(verifyUser, estimateLimitGet)
router.route("/estimated-limit-transaction").post(verifyUser, estimateLimit)
router.route("/estimated-limit-price").post(verifyUser, estimatedPrice)

router.route("/cancel-duration").post(verifyUser, cancelDurationGet)
router.route("/cancel-duration-transaction").post(verifyUser, cancelLimit)

router.route("/cancel-booking").post(verifyUser, cancelBooking)

module.exports = router;