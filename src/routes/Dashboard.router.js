const express = require("express");
const {
  SalesAndBookingsOverview,
  OfficeExpense,
  getSitePlotCounts,
  getPlotsOverview,
  getRegistrationClients,
  calendarEvents,
  widgetDatas
} = require("../controllers/Dashboard.controller");
const dashboard_router = express.Router();

dashboard_router.get("/getsiteplotcounts", getSitePlotCounts);
dashboard_router.get("/getplotsoverview", getPlotsOverview);
dashboard_router.get("/getregistrationclients", getRegistrationClients);
dashboard_router.get("/salesAndBookingsOverview", SalesAndBookingsOverview);
dashboard_router.get("/expenseOverview", OfficeExpense);
dashboard_router.get("/calendarevents", calendarEvents);
dashboard_router.get("/getFollowups", widgetDatas)


module.exports = dashboard_router;
