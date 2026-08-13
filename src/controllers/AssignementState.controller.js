const assignment_state_model  = require("../models/AssignmentState.model")
const ErrorHandler = require("../utils/ErrorHandler")
exports.createAssignmentState = async (req, res, next) => {
  try {
    const newState = await assignment_state_model.create({ type: "leadAssign", nextIndex: 0 });
    if (!newState) return next(new ErrorHandler("Can't create new assignment state", 400));
    console.log("New assignment state created", newState);
    res.status(200).json({ success: true, message: "New assignment state created successfully", data: newState });
  } catch (error) {
    console.log("Error in creating assignment state", error);
    next(error);
  }
};
