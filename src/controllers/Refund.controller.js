const { Types } = require("mongoose");
const ErrorHandler = require("../utils/ErrorHandler");
const refund_model = require("../models/Refund.model");

const getSingleRefund = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler(400, "Invalid Id"));
    }
    const ObjectId = new Types.ObjectId(id);

    const foundRefund = await refund_model.aggregate([
      {
        $match: {
          _id: ObjectId,
        },
      },
      {
        $lookup: {
          from: "sites",
          localField: "site_id",
          foreignField: "_id",
          as: "site",
        },
      },
      {
        $unwind: {
          path: "$site",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "plots",
          localField: "plot_id",
          foreignField: "_id",
          as: "plot",
        },
      },
      {
        $unwind: {
          path: "$plot",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    if (!foundRefund) {
      return next(new ErrorHandler(404, "Refund Not Found"));
    }

    res.status(200).json({
      status: true,
      message: "Refund Get Successfully",
      data: foundRefund?.[0],
    });
  } catch (error) {
    next(error);
  }
};
const searchRefunds = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, start_date, end_date, status } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const match = {};

    const andConditions = [];

    if (start_date) {
      andConditions.push({
        createdAt: { $gte: new Date(start_date) },
      });
    }

    if (end_date) {
      andConditions.push({
        createdAt: { $lte: new Date(end_date) },
      });
    }

    if (status) {
      andConditions.push({
        status: { $eq: status },
      });
    }

    if (andConditions.length > 0) {
      match.$and = andConditions;
    }
    const foundBookings = await refund_model.aggregate([
      {
        $facet: {
          total: [
            {
              $count: "totalDocuments",
            },
          ],
          paginationData: [
            {
              $match: match,
            },
            {
              $lookup: {
                from: "sites",
                localField: "site_id",
                foreignField: "_id",
                as: "site",
              },
            },
            {
              $unwind: {
                path: "$site",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "plots",
                localField: "plot_id",
                foreignField: "_id",
                as: "plot",
              },
            },
            {
              $unwind: {
                path: "$plot",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $skip: Number(skip),
            },
            {
              $limit: Number(limit),
            },
          ],
        },
      },
    ]);

    const totalCounts = foundBookings?.[0].total?.[0]?.totalDocuments;
    const data = foundBookings?.[0]?.paginationData;
    res.status(200).json({
      success: true,
      message: "Refunds Searched Successfully",
      totalCounts,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const updateRefund = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler(400, "Invalid Id"));
    }

    if (!status) {
      return next(new ErrorHandler(400, "Status is Required"));
    }
    const ObjectId = new Types.ObjectId(id);
    const updatedRefund = await refund_model.findByIdAndUpdate(ObjectId, { status }, { new: true });

    if (!updatedRefund) {
      return next(new ErrorHandler(404, "Refund Not Found"));
    }

    res.status(200).json({
      success: true,
      message: "Refund Updated Successfully",
      data: updatedRefund,
    });
  } catch (error) {
    next(error);
  }
};
const deleteRefund = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler(400, "Invalid Id"));
    }
    const ObjectId = new Types.ObjectId(id);

    const deletedRefund = await refund_model.findByIdAndDelete(ObjectId);

    if (!deletedRefund) {
      return next(new ErrorHandler(404, "Refund Not Found"));
    }

    res.status(200).json({
      success: true,
      message: "Refund Deleted Successfully",
      data: deletedRefund,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSingleRefund, searchRefunds, updateRefund,deleteRefund };
