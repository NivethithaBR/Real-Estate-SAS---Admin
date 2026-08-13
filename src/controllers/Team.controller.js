const { Types } = require("mongoose");
const team_model = require("../models/Team.model");
const ErrorHandler = require("../utils/ErrorHandler");

const createTeam = async (req, res, next) => {
  try {
    const { group_name } = req.body;

    if (!group_name) {
      return next(new ErrorHandler(400, "Group Name is Required"));
    }
    const newTeam = await team_model.create(req.body);

    if (!newTeam) {
      return next(new ErrorHandler(400, "Team couldn't created"));
    }

    res.status(200).json({
      success: true,
      message: "New team create successfully",
      data: newTeam,
    });
  } catch (error) {
    next(error);
  }
};

const updatedTeam = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { group_name } = req.body;
    if (!id || !Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler(400, "Invalid id"));
    }
    if (!group_name) {
      return next(new ErrorHandler(400, "Invalid id"));
    }

    const ObjectId = new Types.ObjectId(id);

    const updatedTeam = await team_model.findByIdAndUpdate(ObjectId, req.body, { new: true });
    if (!updatedTeam) {
      return next(new ErrorHandler(400, "Team not found"));
    }

    res.status(200).json({
      success: true,
      message: "Team update successfully",
      data: updatedTeam,
    });
  } catch (error) {
    next(error);
  }
};

const getTeam = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler(400, "Invalid id"));
    }

    const ObjectId = new Types.ObjectId(id);

    const foundTeam = await team_model.findById(ObjectId);
    if (!foundTeam) {
      return next(new ErrorHandler(400, "Team not found"));
    }

    res.status(200).json({
      success: true,
      message: "Team found successfully",
      data: foundTeam,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTeam = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler(400, "Invalid id"));
    }

    const ObjectId = new Types.ObjectId(id);

    const deletedTeam = await team_model.findByIdAndDelete(ObjectId, { new: true });
    if (!deletedTeam) {
      return next(new ErrorHandler(400, "Team not found"));
    }

    res.status(200).json({
      success: true,
      message: "Team deleted successfully",
      data: deletedTeam,
    });
  } catch (error) {
    next(error);
  }
};

const searchTeam = async (req, res, next) => {
  try {
    const { searchTerm, page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const matchStage = {};

    if (searchTerm) {
      matchStage["group_name"] = new RegExp(searchTerm, "gi");
    }

    const data = await team_model.aggregate([
      {
        $facet: {
          count: [
            {
              $count: "count",
            },
          ],
          data: [
            {
              $match: matchStage,
            },
            // {
            //   $skip: Number(skip),
            // },
            // {
            //   $limit: Number(limit),
            // },
          ],
        },
      },
    ]);

    const totalCount = data?.[0]?.count?.[0]?.count;
    const searchedData = data?.[0]?.data;

    res.status(200).json({
      success: true,
      message: "Team searched successfully",
      totalCount,
      data: searchedData,
    });
  } catch (error) {
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const foundTeams = await team_model.find();
    res.status(200).json({
      success: true,
      message: "Get All Teams successfully",
      data: foundTeams,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTeam, updatedTeam, getTeam, deleteTeam, searchTeam ,getAll};
