const mongoose = require("mongoose");

const Task = new mongoose.Schema({
  task: {
    type: String,
    required: true,
  },
  task_description: {
    type: String,
  },
  userid: {
    type: String,
    required : true
  },
},{
    timestamps: true
});

module.exports = mongoose.model("tasks", Task);
