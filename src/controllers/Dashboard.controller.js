const Bought_Model = require("../models/Bought");
const Booking_Model = require("../models/Booking.model");
const Expense_Model = require("../models/Expense.model");
const Plot = require("../models/Plot");
const Site = require("../models/Site");
const Registration = require("../models/Registration");
const followup_model = require("../models/Followups.model")
const appointment = require("../models/Appointment")
const Enquiry = require("../models/Enquiry")
const Booked = require("../models/Booked")
const mongoose = require("mongoose");
function padMissingDays(result, month, year) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const resultMap = new Map(result.map((r) => [r.day, r.amount]));

  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    return {
      day,
      amount: resultMap.get(day) || 0,
    };
  });
}

const SalesAndBookingsOverview = async (req, res, next) => {
  const { month, year } = req.query;
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const prevStart = new Date(year, month - 2, 1);
  const prevEnd = new Date(year, month - 1, 1); // Current month start

  try {
    // Current month data: Bought
    const bought_result = await Bought_Model.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: { day: { $dayOfMonth: "$createdAt" } },
          amount: { $sum: "$mrp" },
        },
      },
      {
        $sort: { "_id.day": 1 },
      },
      {
        $project: {
          day: "$_id.day",
          amount: 1,
          _id: 0,
        },
      },
    ]);

    // Current month data: Booking
    const booking_result = await Booking_Model.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: { day: { $dayOfMonth: "$createdAt" } },
          amount: { $sum: "$amount" },
        },
      },
      {
        $sort: { "_id.day": 1 },
      },
      {
        $project: {
          day: "$_id.day",
          amount: 1,
          _id: 0,
        },
      },
    ]);

    const currentTotalOfBoughts = bought_result.reduce((sum, item) => sum + item.amount, 0);
    const currentTotalOfBookings = booking_result.reduce((sum, item) => sum + item.amount, 0);

    // Previous month totals
    const prevBoughtAggregate = await Bought_Model.aggregate([
      {
        $match: {
          createdAt: { $gte: prevStart, $lt: prevEnd },
        },
      },
      {
        $group: {
          _id: null,
          amount: { $sum: "$mrp" },
        },
      },
    ]);
    const prevTotalOfBoughts = prevBoughtAggregate[0]?.amount || 0;

    const prevBookingAggregate = await Booking_Model.aggregate([
      {
        $match: {
          createdAt: { $gte: prevStart, $lt: prevEnd },
        },
      },
      {
        $group: {
          _id: null,
          amount: { $sum: "$amount" },
        },
      },
    ]);
    const prevTotalOfBookings = prevBookingAggregate[0]?.amount || 0;

    // Percentage changes
    const percentageChange1 =
      prevTotalOfBoughts === 0
        ? currentTotalOfBoughts > 0
          ? 100
          : 0
        : ((currentTotalOfBoughts - prevTotalOfBoughts) / prevTotalOfBoughts) * 100;

    const percentageChange2 =
      prevTotalOfBookings === 0
        ? currentTotalOfBookings > 0
          ? 100
          : 0
        : ((currentTotalOfBookings - prevTotalOfBookings) / prevTotalOfBookings) * 100;

    // Fill missing days
    const boughtData = padMissingDays(bought_result, month, year);
    const bookingData = padMissingDays(booking_result, month, year);

    const merged = boughtData
      .filter((booking) => booking.day % 5 === 0) // Only include every 5th day
      .map((booking, _index) => {
        return {
          day: booking.day,
          "Booking Revenue overview": booking.amount,
          "Plot sales overview": bookingData.find((b) => b.day === booking.day)?.amount || 0,
          value: booking.day * 1000, // or (index + 1) * 5000 if you prefer fixed intervals
        };
      });

    res.status(200).json({
      currentTotalOfBoughts,
      currentTotalOfBookings,
      boughtPreviousPercentage: Number(percentageChange1.toFixed(2)),
      bookPreviousPercentage: Number(percentageChange2.toFixed(2)),
      merged,
    });
  } catch (error) {
    next(error);
  }
};
const OfficeExpense = async (req, res, next) => {
  const { month, year } = req.query;
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const prevStart = new Date(year, month - 2, 1);
  const prevEnd = new Date(year, month - 1, 1);

  try {
    // Get current month expense (daily breakdown)
    const expense_result = await Expense_Model.aggregate([
      {
        $match: {
          date: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: { day: { $dayOfMonth: "$date" } },
          amount: { $sum: "$amount" },
        },
      },
      {
        $sort: { "_id.day": 1 },
      },
      {
        $project: {
          day: "$_id.day",
          amount: 1,
          _id: 0,
        },
      },
    ]);

    // Calculate current total
    const currentTotal = expense_result.reduce((sum, item) => sum + item.amount, 0);

    // Get previous month total
    const prevExpenseAggregate = await Expense_Model.aggregate([
      {
        $match: {
          date: { $gte: prevStart, $lt: prevEnd },
        },
      },
      {
        $group: {
          _id: null,
          amount: { $sum: "$amount" },
        },
      },
    ]);
    const prevTotal = prevExpenseAggregate[0]?.amount || 0;

    // Calculate percentage change
    const percentageChange =
      prevTotal === 0 ? (currentTotal > 0 ? 100 : 0) : ((currentTotal - prevTotal) / prevTotal) * 100;

    // Pad missing days
    const data = padMissingDays(expense_result, month, year);
    const merged = data
      .filter((booking) => booking.day % 5 === 0) // Only include every 5th day
      .map((booking, index) => {
        return {
          day: booking.day,
          amount: booking.amount,
        };
      });

    res.status(200).json({
      currentTotal,
      previousPercentage: Number(percentageChange.toFixed(2)),
      data: merged,
    });
  } catch (error) {
    next(error);
  }
};

const getSitePlotCounts = async (req, res) => {
  try {
    const id = req.params.id;

    const totalSites = await Site.countDocuments({ id });
    const totalPlots = await Plot.countDocuments({ id });

    res.status(200).json({
      success: true,
      message: "Site & Plot Counts retrieve Successfully",
      totalSites,
      totalPlots,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error retrive Plot & Site Counts",
      err,
    });
  }
};

const getPlotsOverview = async (req, res) => {
  try {
    const { financial_year } = req.query;
    if (!financial_year) {
      return res.status(400).json({ success: false, message: "Financial year is required" });
    }
    const plotCounts = await Plot.aggregate([
      {
        $addFields: {
          financial_year: {
            $cond: [
              { $gte: [{ $month: "$createdAt" }, 4] },
              {
                $concat: [
                  { $toString: { $year: "$createdAt" } },
                  "-",
                  { $toString: { $add: [{ $year: "$createdAt" }, 1] } },
                ],
              },
              {
                $concat: [
                  { $toString: { $subtract: [{ $year: "$createdAt" }, 1] } },
                  "-",
                  { $toString: { $year: "$createdAt" } },
                ],
              },
            ],
          },
        },
      },
      {
        $match: { financial_year: financial_year },
      },
      {
        $group: {
          _id: "$plot_status",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalPlots = plotCounts.reduce((acc, item) => acc + item.count, 0);

    const counts = {};
    plotCounts.forEach((item) => {
      counts[item._id] = {
        count: item.count,
        percentage: totalPlots === 0 ? 0 : ((item.count / totalPlots) * 100).toFixed(2),
      };
    });
    res.status(200).json({
      success: true,
      message: "Plot counts by status retrieved successfully",
      financial_year,
      totalPlots,
      counts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error retrieving Plot counts", err });
  }
};

const getRegistrationClients = async (req, res) => {
  try {
    const { client_name, site_id, plot_id } = req.query;

    const query = {};
    if (client_name) {
      query.client_name = { $regex: client_name, $options: "i" };
    }
    if (site_id) {
      query.site_id = site_id;
    }
    if (plot_id) {
      query.plot_id = plot_id;
    }
    const clients = await Registration.find(query)
      .populate("site_id", "site_name")
      .populate("plot_id", "plot_no")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Registration Client fetch Successfully",
      data: clients.slice(0, 3),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error Getting Registration Clients" });
  }
};

const dateFormatters = (date) => {
  return new Date(date).toLocaleDateString("en-GB")

}

const calendarEvents = async (req, res) => {
  try {

    const allEvents = []
    const { id, role, start, end } = req?.query

    let ids = new mongoose.Types.ObjectId(id)
    const today = new Date();

    const startOfYear  = new Date(today.getFullYear(), 0, 1);
    startOfYear.setHours(0, 0, 0, 0);

    const endOfYear = new Date(today.getFullYear(), 11, 31);
    endOfYear.setHours(23, 59, 59, 999);

    let matchingCase = {
      status: "Scheduled",
      followup_date: { $gte: new Date(start), $lte: new Date(end) },
    }
    console.log(start,end,"endOfYearendOfYear")
    if (role != "Admin") {
      matchingCase.assigned_to = ids
    }

    const getfollowups = await followup_model.aggregate([
      {
        $match: matchingCase
      },
      {
        $lookup: {
          foreignField: "_id",
          localField: "refId",
          from: "enquiries",
          as: "leadcustomer"
        }
      },
      {
        $unwind: {
          path: "$leadcustomer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          foreignField: "_id",
          localField: "refId",
          from: "bookeds",
          as: "bookedcustomer"
        }
      },
      {
        $unwind: {
          path: "$bookedcustomer",
          preserveNullAndEmptyArrays: true,
        },
      }
    ]);

    const appointments = await appointment.aggregate([
      {
        $match: matchingCase
      },
      {
        $lookup: {
          foreignField: "_id",
          localField: "refId",
          from: "enquiries",
          as: "leadcustomer"
        }
      },
      {
        $unwind: {
          path: "$leadcustomer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          foreignField: "_id",
          localField: "refId",
          from: "bookeds",
          as: "bookedcustomer"
        }
      },
      {
        $unwind: {
          path: "$bookedcustomer",
          preserveNullAndEmptyArrays: true,
        },
      }
    ]);

    
    console.log("appointments",appointments)
    if (getfollowups.length > 0) {
      for (const follow of getfollowups) {
        let theElements = {
          client_name : (follow?.bookedcustomer ? follow?.bookedcustomer.client_name : follow?.leadcustomer.client_name),
          remarks : follow?.remarks,
          date : follow?.followup_date,
          eventtype : "Followup",
          usertype : follow?.refType,
          id : follow?.refId
        };
        allEvents.push(theElements)
      }
    }

    if (appointments.length > 0) {
      for (const app of appointments) {
        let theAllElements = {
          client_name : (app?.bookedcustomer ? app?.bookedcustomer.client_name : app?.leadcustomer.client_name),
          remarks : app?.remarks,
          date : app?.followup_date,
          eventtype : "Appointment",
          usertype : app?.refType,
          id : app?.refId
        };
        allEvents.push(theAllElements)
      }
    }


    return res.status(200).json({
      successs: true,
      data: allEvents,
      message: ""
    })

  } catch (err) {
    res.status(500).json({ success: false, message: err?.message });
  }
}

const widgetDatas = async (req, res) => {
  try {
    const { id, role } = req?.query
    let ids = new mongoose.Types.ObjectId(id)
    const today = new Date();

    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const startOfYesterday = new Date(today);
    startOfYesterday.setDate(today.getDate() - 1);
    startOfYesterday.setHours(0, 0, 0, 0);

    const endOfYesterday = new Date(today);
    endOfYesterday.setDate(today.getDate() - 1);
    endOfYesterday.setHours(23, 59, 59, 999);

    let matchingCase = {
      status: "Scheduled",
      followup_date: { $gte: startOfToday, $lte: endOfToday },
    }

    let matchingCaseOld = {
      status: "Scheduled",
      followup_date: { $lte: startOfToday },
    }

    if (role != "Admin") {
      matchingCase.assigned_to = ids
      matchingCaseOld.assigned_to = ids
    }

    const newFollowups = await followup_model.aggregate([
      {
        $match: matchingCase
      },
      {
        $lookup: {
          foreignField: "_id",
          localField: "refId",
          from: "enquiries",
          as: "leadcustomer"
        }
      },
      {
        $unwind: {
          path: "$leadcustomer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          foreignField: "_id",
          localField: "refId",
          from: "bookeds",
          as: "bookedcustomer"
        }
      },
      {
        $unwind: {
          path: "$bookedcustomer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: { _id: -1 }
      },
      {
        $limit: 5
      }
    ]);

    const oldFollowups = await followup_model.aggregate([
      {
        $match: matchingCaseOld
      },
      {
        $lookup: {
          foreignField: "_id",
          localField: "refId",
          from: "enquiries",
          as: "leadcustomer"
        }
      },
      {
        $unwind: {
          path: "$leadcustomer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          foreignField: "_id",
          localField: "refId",
          from: "bookeds",
          as: "bookedcustomer"
        }
      },
      {
        $unwind: {
          path: "$bookedcustomer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: { _id: -1 }
      },
      {
        $limit: 5
      }
    ]);

    const appointments = await appointment.aggregate([
      {
        $match: matchingCase
      },
      {
        $lookup: {
          foreignField: "_id",
          localField: "refId",
          from: "enquiries",
          as: "leadcustomer"
        }
      },
      {
        $unwind: {
          path: "$leadcustomer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          foreignField: "_id",
          localField: "refId",
          from: "bookeds",
          as: "bookedcustomer"
        }
      },
      {
        $unwind: {
          path: "$bookedcustomer",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: { _id: -1 }
      },
      {
        $limit: 5
      }
    ]);

    let bookedFlats = ""
    if (role == "Admin") {
      bookedFlats = await Booked.find({})
    } else {
      bookedFlats = await Booked.find({ assigned_to: ids })
    }

    let todayLeads = [];

    if (role == "Admin") {
      todayLeads = await Enquiry.find({
        createdAt: { $gte: startOfToday, $lte: endOfToday },
      })
    } else {

      todayLeads = await Enquiry.find({
        createdAt: { $gte: startOfToday, $lte: endOfToday },
        assigned_to: ids
      })
    }

    // Here getting all datas for summary

    let summary = {};
    summary.newleads = todayLeads.length
    summary.pendingFollowup = oldFollowups.length
    summary.todayAppointments = appointments.length
    summary.totalBooked = bookedFlats.length

    const allFollowups = { newFollowups, oldFollowups, todayLeads, summary }

    return res.status(200).json({
      successs: true,
      data: allFollowups,
      message: "Followup data fetched"
    })

  } catch (err) {
    res.status(500).json({ success: false, message: err?.message });
  }
}
module.exports = {
  SalesAndBookingsOverview,
  OfficeExpense,
  getSitePlotCounts,
  getPlotsOverview,
  getRegistrationClients,
  calendarEvents,
  widgetDatas
};
