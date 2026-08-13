const { model, Schema } = require("mongoose")

const notification_schema = new Schema(
  {
    type: {
      type: String,
      enum: ["followup","appointment"],
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    appointmentid: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
    },
    stage: {
      type: String,
      enum: ["lead","booked"],
    },
    followupid : {
      type: Schema.Types.ObjectId,
      ref : "followup"
    },
    status: {
      type: String,
      default : "Pending",
      enum: ["Pending", "Read"],
    },
  },
  {
    timestamps: true,
  }
);

const notification_model = model("notifications", notification_schema)

module.exports = notification_model