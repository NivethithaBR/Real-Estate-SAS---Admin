const notification_model = require("../models/notifications.model");
const errorHandler = require("../utils/ErrorHandler")
const mongoose = require("mongoose");

const searchNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { _id } = req.user;
    let matchStage = {
      to: _id,
    };
    const skip = Number(page - 1) * Number(limit);
    const foundNotifications = await notification_model.aggregate([
      {
        $facet: {
          count: [{ $count: "count" }],
          data: [
            {
              $lookup: {
                from: "followups",
                foreignField: "_id",
                localField: "followup",
                as: "followup",
              },
            },
            {
              $unwind: {
                path: "$followup",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "enquiries",
                foreignField: "_id",
                localField: "followup.refId",
                as: "enquiry",
              },
            },
            {
              $lookup: {
                from: "bookeds",
                foreignField: "_id",
                localField: "followup.refId",
                as: "booked",
              },
            },
            {
              $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "to",
                as: "user",
              },
            },
            {
              $addFields: {
                user: {
                  $arrayElemAt: ["$user", 0],
                },
                enquiry: {
                  $arrayElemAt: ["$enquiry", 0],
                },
                booked: {
                  $arrayElemAt: ["$booked", 0],
                },
              },
            },
            {
              $match: matchStage,
            },
            {
              $skip: skip,
            },
            {
              $limit: Number(limit),
            },
          ],
        },
      },
    ]);

    const totalCount = foundNotifications[0].count?.[0]?.count || 1
    const data = foundNotifications[0]?.data

    res.status(200).json({ success: true, message: "Notifications searched successfully", totalCount, data });
  } catch (error) {
    next(error);
  }
};

const listNotifications = async (req, res, next) => {
  try {
    const { type, status, to, page = 1, limit = 10 } = req.query;
    const { _id } = req.user;

    const skip = Number(page - 1) * Number(limit);

    if (type == "followup") {

      let matchStage = {
        to: new mongoose.Types.ObjectId(to),
        status: status,
        type: { $ne: "appointment" }
      };

      const foundNotifications = await notification_model.aggregate([
        {
          $match: matchStage,
        },
        {
          $facet: {
            count: [{ $count: "count" }],
            data: [
              {
                $lookup: {
                  from: "followups",
                  foreignField: "_id",
                  localField: "followupid",
                  as: "followup",
                },
              },
              {
                $unwind: {
                  path: "$followup",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: "enquiries",
                  foreignField: "_id",
                  localField: "followup.refId",
                  as: "enquiry",
                },
              },
              {
                $lookup: {
                  from: "bookeds",
                  foreignField: "_id",
                  localField: "followup.refId",
                  as: "booked",
                },
              },
              {
                $lookup: {
                  from: "users",
                  foreignField: "_id",
                  localField: "to",
                  as: "user",
                },
              },
              {
                $addFields: {
                  user: {
                    $arrayElemAt: ["$user", 0],
                  },
                  enquiry: {
                    $arrayElemAt: ["$enquiry", 0],
                  },
                  booked: {
                    $arrayElemAt: ["$booked", 0],
                  },
                },
              },
              {
                $skip: skip,
              },
              {
                $limit: Number(limit),
              },
            ],
          },
        },
      ]);
      const totalDocs = foundNotifications[0]?.count[0]?.count
      const totalCount = Math.ceil(totalDocs / limit);

      // console.log(totalCount,"foundNotifications")
      const data = foundNotifications[0]?.data

      res.status(200).json({ success: true, message: "Notifications searched successfully", totalCount, data });


    }

    if (type == "appointment") {

      let matchStage = {
        to: new mongoose.Types.ObjectId(to),
        status: status,
        type: { $ne: "followup" }
      };

      const foundNotifications = await notification_model.aggregate([
        {
          $match: matchStage,
        },
        {
          $facet: {
            count: [{ $count: "count" }],
            data: [
              {
                $lookup: {
                  from: "appointments",
                  localField: "appointmentid",
                  foreignField: "_id",
                  as: "appointment",
                },
              },
              {
                $unwind: {
                  path: "$appointment",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $lookup: {
                  from: "enquiries",
                  foreignField: "_id",
                  localField: "appointment.refId",
                  as: "enquiry",
                },
              },
              {
                $lookup: {
                  from: "bookeds",
                  foreignField: "_id",
                  localField: "appointment.refId",
                  as: "booked",
                },
              },
              {
                $lookup: {
                  from: "users",
                  foreignField: "_id",
                  localField: "to",
                  as: "user",
                },
              },
              {
                $addFields: {
                  user: {
                    $arrayElemAt: ["$user", 0],
                  },
                  enquiry: {
                    $arrayElemAt: ["$enquiry", 0],
                  },
                  booked: {
                    $arrayElemAt: ["$booked", 0],
                  },
                },
              },
              {
                $skip: skip,
              },
              {
                $limit: Number(limit),
              },
            ],
          },
        },
      ]);
      const totalDocs = foundNotifications[0]?.count[0]?.count
      const totalCount = Math.ceil(totalDocs / limit);

      const data = foundNotifications[0]?.data

      // console.log(data,"apps")


      res.status(200).json({ success: true, message: "Notifications searched successfully", totalCount, data });
    }




  } catch (error) {
    next(error);
  }
};

const updateNotificationStatus = async (req, res, next) => {
  try {
    const { _id } = req.user
    const { id } = req.params

    const foundNotification = await notification_model.findById(id)

    if (!foundNotification) {
      return next(new errorHandler(404, "Notification not found"))
    }
    console.log(foundNotification.to.toString(), _id.toString())
    if (foundNotification?.to?.toString() != _id?.toString()) {
      return next(new errorHandler(400, "Your are not allowed to update other Notifications"));
    }

    const status = foundNotification?.status;

    foundNotification.status = status === "Pending" ? "Read" : "Pending"

    await foundNotification.save()
    res.status(200).json({ success: true, message: "Status updated successfully", data: foundNotification })
  } catch (error) {
    next(error)
  }
}

const updateStatus = async (req, res, next) => {
  try {
    const { id } = (req?.query)
    const ids = new mongoose.Types.ObjectId(id);
    const foundNotification = await notification_model.findOne({ _id: ids })

    if (!foundNotification) {
      return next(new errorHandler(404, "Notification not found"))
      res.status(400).json({ success: false, message: "Notification not found", data: "" })
    }

    // if (foundNotification?.to?.toString() != id?.toString()) {
    //   return res.status(400).json({ success: false, message: "Your are not allowed to update other Notifications", data: "" })
    // }

    const status = foundNotification?.status;
    foundNotification.status = status === "Pending" ? "Read" : "Pending"
    await foundNotification.save()

    return res.status(200).json({ success: true, message: "Status updated successfully", data: foundNotification })


  } catch (error) {
    next(error)
  }
}

const notifyUsers = async (req, res, next) => {
  try {
    let foundNotification = ""
    if (req?.user?.role == "Admin") {
      let matchcase = {
        status: "Pending",
      }
      // foundNotification = await notification_model.find({status : "Pending"}).populate(['appointmentid','followupid','to','followupid.refId'])

      foundNotification = await notification_model.aggregate([
        {
          $lookup: {
            from: "appointments",
            localField: "appointmentid",
            foreignField: "_id",
            as: "appointment"
          },
        },
        {
          $unwind: {
            path: "$appointment",
            preserveNullAndEmptyArrays: true,
          }
        },
        {
          $lookup: {
            from: "followups",
            localField: "followupid",
            foreignField: "_id",
            as: "followup"
          }
        },
        {
          $unwind: {
            path: "$followup",
            preserveNullAndEmptyArrays: true,
          }
        },
        {
          $lookup: {
            from: "enquiries",
            localField: "followup.refId",
            foreignField: "_id",
            as: "followup_enquiry_ref",
          },
        },
        {
          $lookup: {
            from: "bookeds",
            localField: "followup.refId",
            foreignField: "_id",
            as: "followup_booking_ref",
          },
        },
        {
          $lookup: {
            from: "enquiries",
            localField: "appointment.refId",
            foreignField: "_id",
            as: "appointment_enquiry_ref",
          },
        },
        {
          $lookup: {
            from: "bookeds",
            localField: "appointment.refId",
            foreignField: "_id",
            as: "appointment_booking_ref",
          },
        },
        {
          $match: matchcase
        }

      ])
    }
    if (req?.user?.role == "User") {
      let matchcase = {
        status: "Pending",
        to : req?.user?._id
      }
      // foundNotification = await notification_model.find({status : "Pending"}).populate(['appointmentid','followupid','to','followupid.refId'])

      foundNotification = await notification_model.aggregate([
        {
          $lookup: {
            from: "appointments",
            localField: "appointmentid",
            foreignField: "_id",
            as: "appointment"
          },
        },
        {
          $unwind: {
            path: "$appointment",
            preserveNullAndEmptyArrays: true,
          }
        },
        {
          $lookup: {
            from: "followups",
            localField: "followupid",
            foreignField: "_id",
            as: "followup"
          }
        },
        {
          $unwind: {
            path: "$followup",
            preserveNullAndEmptyArrays: true,
          }
        },
        {
          $lookup: {
            from: "enquiries",
            localField: "followup.refId",
            foreignField: "_id",
            as: "followup_enquiry_ref",
          },
        },
        {
          $lookup: {
            from: "bookeds",
            localField: "followup.refId",
            foreignField: "_id",
            as: "followup_booking_ref",
          },
        },
        {
          $lookup: {
            from: "enquiries",
            localField: "appointment.refId",
            foreignField: "_id",
            as: "appointment_enquiry_ref",
          },
        },
        {
          $lookup: {
            from: "bookeds",
            localField: "appointment.refId",
            foreignField: "_id",
            as: "appointment_booking_ref",
          },
        },
        {
          $match: matchcase
        }

      ])
    }


    if (foundNotification.length > 0) {
      return res.json({
        success: true,
        message: "Notification fetched successfully",
        data: foundNotification
      })
    } else {
      return res.json({
        success: true,
        message: "Nothing to display",
        data: ""
      })
    }
  } catch (err) {
    next(err)
  }
}


module.exports = {
  searchNotifications,
  updateNotificationStatus,
  listNotifications,
  updateStatus,
  notifyUsers
};