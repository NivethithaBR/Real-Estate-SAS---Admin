const { Schema, model } = require("mongoose");

const team_schema = new Schema({
  group_name: {
    type: String,
    trim: true,
    unique: true,
    required: true,
  },
  golden_director: {
    type: String,
    trim: true,
  },
  senior_director: {
    type: String,
    trim: true,
  },
  director: {
    type: String,
    trim: true,
  },
  branch_manager: {
    type: String,
    trim: true,
  },
  manager: {
    type: String,
    trim: true,
  },
  assistant_manager: {
    type: String,
    trim: true,
  },
  telecalling: {
    type: String,
    trim: true,
  },
});

const team_model = model("team", team_schema);
module.exports = team_model;
