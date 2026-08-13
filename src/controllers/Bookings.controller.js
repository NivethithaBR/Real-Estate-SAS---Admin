const Bookings_Model = require("../models/Booking.model");
const { Types } = require("mongoose");
const ErrorHandler = require("../middlewares/ErrorMiddleware");

const searchBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, start_date, end_date } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const match = {};

    const andConditions = [];

    if (start_date) {
      andConditions.push({
        createdAt: { $gte: new Date(start_date) },
      });
    }

    if (end_date) {
      const next_date = new Date(end_date);
      const next_end_date = new Date(next_date.getFullYear(), next_date.getMonth(), next_date.getDate() + 2);
      andConditions.push({
        createdAt: { $lte: new Date(next_end_date) },
      });
    }

    if (andConditions.length > 0) {
      match.$and = andConditions;
    }
    const foundBookings = await Bookings_Model.aggregate([
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
      message: "Bookings Searched Successfullyh",
      totalCounts,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler(400, "Invalid id"));
    }

    const ObjectId = new Types.ObjectId(id);
    const foundBooking = await Bookings_Model.aggregate([
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

    if (!foundBooking) {
      return next(new ErrorHandler(404, "Booking Not Found"));
    }
    res.status(200).json({
      success: true,
      messasge: "Get Booking Successfully",
      data: foundBooking?.[0],
    });
  } catch (error) {
    next(error);
  }
};
module.exports = { searchBookings, getBooking };
