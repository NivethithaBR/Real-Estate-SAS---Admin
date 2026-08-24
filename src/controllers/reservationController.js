const { default: mongoose } = require("mongoose");
const Plot = require("../models/Plot");
const ErrorHandler = require("../utils/ErrorHandler");
const Booked = require("../models/Booked");
const Bookedland = require("../models/Bookedland");
const Enquiry = require("../models/Enquiry");
const RefundModel = require("../models/Refund.model");
const BookingModel = require("../models/Booking.model");
const Landplot = require("../models/Landplot")
exports.unbookReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler(400, "Invalid Id"));
    }
    const ObjectId = new mongoose.Types.ObjectId(id);
    const deletedBooked = await Booked.findByIdAndDelete(ObjectId);

    if (!deletedBooked) {
      return next(new ErrorHandler(404, "Not found the booked data you search"));
    }
    const {
      client_name,
      address,
      contact_no,
      email_id,
      state,
      city,
      site_id,
      plot_id,
      createdAt,
      token_advance,
      remarks,
    } = deletedBooked;
    const enquiry = {
      client_name: client_name || "Unknown",
      contact_no: contact_no || "",
      email_id: email_id || "",
      address: address || "",
      city: city || "",
      state: state || "",
      site_id,
      plot_id,
    };
    await RefundModel.create({
      ...enquiry,
      booking_date: createdAt,
      remarks,
      token_advance: token_advance,
      paid_amount: Number(deletedBooked.token_advance),
      status: "On Hold",
      refund_amount: Number(deletedBooked?.token_advance) - 1000,
    });
    await Enquiry.create(enquiry); // after unbooked a client ,they will be move to enquiry with basic information that enquiry model needs

    await BookingModel.findByIdAndUpdate(deletedBooked?.booking_id, {
      amount: 1000,
    });

    const plotObjectId = new mongoose.Types.ObjectId(deletedBooked?.plot_id);

    const updatedPlot = await Plot.findByIdAndUpdate(
      plotObjectId,
      { $set: { plot_status: "Available" } },
      { upsert: true }
    );
    if (!updatedPlot) {
      return next(new ErrorHandler(404, "Plot Not Found"));
    }
    res.status(200).json({
      success: true,
      message: "Plot unbooked successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.unbookReservationland = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler(400, "Invalid Id"));
    }
    const ObjectId = new mongoose.Types.ObjectId(id);
    const deletedBooked = await Bookedland.findByIdAndDelete(ObjectId);

    if (!deletedBooked) {
      return next(new ErrorHandler(404, "Not found the booked data you search"));
    }
    const {
      client_name,
      address,
      contact_no,
      email_id,
      state,
      city,
      site_id,
      plot_id,
      createdAt,
      token_advance,
      remarks,
    } = deletedBooked;
    const enquiry = {
      client_name: client_name || "Unknown",
      contact_no: contact_no || "",
      email_id: email_id || "",
      address: address || "",
      city: city || "",
      state: state || "",
      site_id,
      plot_id,
    };
    await RefundModel.create({
      ...enquiry,
      booking_date: createdAt,
      remarks,
      token_advance: token_advance,
      paid_amount: Number(deletedBooked.token_advance),
      status: "On Hold",
      refund_amount: Number(deletedBooked?.token_advance) - 1000,
    });
    await Enquiry.create(enquiry); // after unbooked a client ,they will be move to enquiry with basic information that enquiry model needs

    await BookingModel.findByIdAndUpdate(deletedBooked?.booking_id, {
      amount: 1000,
    });

    const plotObjectId = new mongoose.Types.ObjectId(deletedBooked?.plot_id);

    const updatedPlot = await Landplot.findByIdAndUpdate(
      plotObjectId,
      { $set: { plot_status: "Available" } },
      { upsert: true }
    );
    if (!updatedPlot) {
      return next(new ErrorHandler(404, "Land plot Not Found"));
    }
    res.status(200).json({
      success: true,
      message: "Land plot unbooked successfully",
    });
  } catch (error) {
    next(error);
  }
};
