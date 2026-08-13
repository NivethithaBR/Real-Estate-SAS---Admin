const express = require("express");
const { userSignup, userLogin, userForgotPassword, logout, deleteProfilePicture, createUser } = require("../controllers/authController");
const { sendOtp, verifyOtp } = require("../controllers/otpController");
const upload = require("../middlewares/uploadMiddleware");
const { updateProfile } = require("../controllers/authController");

const router = express.Router();

router.post("/signup", upload.single("avatar"), userSignup);
router.post("/login", userLogin);
router.post("/forgot-password", userForgotPassword);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/logout", logout);
router.put("/update-profile/:id",  upload.single("avatar"), updateProfile);
router.delete("/delete-profile-photo",  deleteProfilePicture);


module.exports = router;
