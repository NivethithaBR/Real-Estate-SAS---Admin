const { model, Schema } = require("mongoose");

const followup_schema = new Schema({
  assigned_to: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  status: {
    type: String,
    enum: ["Scheduled", "Confirmed","Completed","Canceled","No Show"],
    default: "pending",
  },
  refType: {
    type: String,
    enum: ["Enquiry", "Booked"],
    required:[true,"Reference type is Required"]
  },
  refId: {
    type: Schema.Types.ObjectId,
    required:[true, "Reference id is Required"],
    refPath:"refType"
  },
  followup_date: {
    type: Date,
  },
  followup_time: {
    type: String,
  },
  remarks: {
    type: String,
  },
  is_notified: {
    type: Boolean,
    default: false,
  },
});

const followup_model = model("followup", followup_schema);

module.exports = followup_model;
