const twilio = require("twilio");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const OTP = require("../models/otpSchema");
const { sendMail } = require("../utils/helpers");
const otpSchema = require("../models/otpSchema");
const { customError } = require("../utils/customError");

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email or phone number is required!",
        statuscode: 400,
        success: false,
      });
    }
    let userData = await User.findOne({
      $or: [{ email: email }, { phone: email }],
    });
    if (!userData) {
      return res.status(404).json({ message: "Oops! User not found", statuscode: 404, success: false });
    }

    let otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const hashOtp = await bcrypt.hash(otp, 10);

    let otpData = {
      user_id: userData._id,
      otp: hashOtp,
      expiresAt: Date.now() + 3600000,
    };

    if (email === userData.phone) {
      await client.messages.create({
        body: `OTP for password reset is ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: `+91${userData.phone}`,
      });
      otpData.phone = userData.phone;
    } else if (email === userData.email) {
      const mailOptions = {
        to: userData.email,
        subject: "OTP for password reset",
        text: "OTP for password reset",
        file: null,
        data: null,
        html: `<h1> OTP for password reset is ${otp}<\h1>`,
      };
      const res = await sendMail(mailOptions);
      otpData.email = userData.email;
    }
    await OTP.create(otpData);

    return res.status(200).json({ success: true, message: "OTP sent Successfully!", data: userData });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { otp, user_id, email, phone } = req.body;

    if (!otp) {
      throw customError("Otp is required!", 400, false);
    }
    if (!user_id) {
      throw customError("User Id is required!", 400, false);
    }

    let query = { user_id };
    if (email) {
      query.email = email;
    } else if (phone) {
      query.phone = phone;
    }

    const findOtpById = await otpSchema.findOne(query).sort({ createdAt: -1 });

    if (!findOtpById) {
      throw customError("Account records don't exist!", 404, false);
    }

    if (findOtpById.expiresAt < Date.now()) {
      await otpSchema.deleteMany({ user_id });
      throw customError("Otp expired!", 410, false);
    }

    const validateOtp = await bcrypt.compare(otp, findOtpById.otp);
    if (!validateOtp) {
      await otpSchema.deleteMany({ user_id });
      throw customError("Invalid otp!", 400, false);
    }

    await otpSchema.deleteMany({ user_id });

    res.status(200).json({
      message: "Otp verified successfully!",
      statuscode: 200,
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendOtp, verifyOtp };
