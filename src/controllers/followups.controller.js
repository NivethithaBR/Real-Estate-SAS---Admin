const followup_model = require("../models/Followups.model");
const errorHandler = require("../utils/ErrorHandler");
const notification_model = require("../models/notifications.model")
const createFollowup = async (req, res, next) => {
  try {
    const { followup_date, followup_time } = req.body;
    if (!followup_date || !followup_time) {
      return next(new errorHandler(400, "Date and time is Required"));
    }
    const newFollowup = await followup_model.create({ ...req.body});
    if (!newFollowup) {
      return next(new errorHandler(400, "Can't create followup"));
    }
    // const createNotify = await notification_model.create({
    //   type : "followup",
    //   stage : "lead",
    //   followupid : newFollowup?._id,
    //   to : newFollowup?.assigned_to,
    // })
    res.status(200).json({ success: true, message: "New followup created successfully", data: newFollowup });
  } catch (error) {
    next(error);
  }
};

const updateFollowupStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return next(new errorHandler(400, "Status is Required"));
    }

    const updatedFollowup = await followup_model.findByIdAndUpdate(id, { status }, { new: true });
    if (!updatedFollowup) {
      return next(new errorHandler(404, "Followup not found"));
    }
    res.status(200).json({ success: true, message: "Followup status updated successfully", data: updatedFollowup });
  } catch (error) {
    next(error);
  }
};

const deleteFollowup = async (req, res, next) => {
  try {
    const { id } = req.params;

    const deletedFollowup = await followup_model.findByIdAndDelete(id);
    if (!deletedFollowup) {
      return next(new errorHandler(404, "Followup not found"));
    }
    res.status(200).json({ success: true, message: "Followup deleted successfully", data: deletedFollowup });
  } catch (error) {
    next(error);
  }
};
const getFollowup = async (req, res, next) => {
  try {
    const { id } = req.params;

    const foundFollowup = await followup_model.findById(id);
    if (!foundFollowup) {
      return next(new errorHandler(404, "Followup not found"));
    }
    res.status(200).json({ success: true, message: "Followup got successfully", data: foundFollowup });
  } catch (error) {
    next(error);
  }
};
const getAllFollowups = async (req, res, next) => {
  try {
    const { refId, refType } = req.query;
    const followups = await followup_model.find({
      refId,
      refType,
    });
    res.status(200).json({ success: true, message: "All Followups got successfully", data: followups });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createFollowup,
  deleteFollowup,
  updateFollowupStatus,
  getFollowup,
  getAllFollowups
};
