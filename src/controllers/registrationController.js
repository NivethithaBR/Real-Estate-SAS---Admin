
const Registration_Model = require("../models/Registration");

const searchRegistrations = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, start_date, end_date } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const match = {};

    const andConditions = [];

    if (start_date) {
      andConditions.push({
        date: { $gte: new Date(start_date) },
      });
    }

    if (end_date) {
      andConditions.push({
        date: { $lte: new Date(end_date) },
      });
    }

    if (andConditions.length > 0) {
      match.$and = andConditions;
    }
    const foundBookings = await Registration_Model.aggregate([
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
      message: "Registration Searched Successfully",
      totalCounts,
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { searchRegistrations };


