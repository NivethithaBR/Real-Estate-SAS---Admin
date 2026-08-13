const { Schema, model } = require("mongoose");

const recording_schema = new Schema(
  {
    agent_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    lead_id: {
      type: Schema.Types.ObjectId,
      ref: "Enquiry",
    },
    duration: Number,
    recording_url: {
      type: String,
    },
    call_sid: {
      type: String,
    },
    record_start_time: {
      type: String,
    },
    recording_sid: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const recording_model = model("recording", recording_schema);

module.exports =  recording_model;
