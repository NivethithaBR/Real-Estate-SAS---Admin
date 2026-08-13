const  { Schema, model }  = require("mongoose");

const assignment_state_schema = new Schema(
  {
    type: {
      type: String,
      required: [true, "Type is Required"],
    },
    nextIndex: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const assignment_state_model = model("assignmentState", assignment_state_schema);

module.exports = assignment_state_model;
