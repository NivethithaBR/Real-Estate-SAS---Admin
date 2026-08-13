const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true },
    status : {type : String, enum : ['Active','Block'],default : "Active", required : true},
    phone: { type: String, required: true },
    userid: Number,
    email: { type: String, unique: true, required: [true, "Email is Required"] },
    password: { type: String, required: true, minlength: 4 },
    gender: { type: String, enum: ["male", "female"], required: true },
    address: { type: String, required: true },
    role: { type: String, enum: ["Super Admin", "Admin", "User","HR"], required: true },
    is_otp_verified: { type: Boolean, default: false },
    permission_for_plots: [Number],
    profileImage: {
      public_id: String,
      url: String,
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    department : {type : String, required : true},
    daffytelToken: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
