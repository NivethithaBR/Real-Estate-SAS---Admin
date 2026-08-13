const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Present", "Leave", "Absent", "Half Day", "Permission"],
      required: true,
    },
    leaveType: {
      type: String,
      enum: ["CL", "SL", "None",""],
      default: "",
    },
    permissionHours: {
      type: Number,
      default: 0,
    },

    permissionMinutes: {
      type: Number,
      default: 0,
    },
    remarks: { type: String, default: "" },
    lateAbsent : {type : Number,default: 0},
    markedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    attendanceBy : {
      type : String,
      enum : ["algo","user","admin"],
    }
  },
  { timestamps: true },
);

// Ensure a user has only one record per day
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
