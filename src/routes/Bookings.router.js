const express = require("express");
const { searchBookings, getBooking } = require("../controllers/Bookings.controller");

const bookings_router = express.Router();

bookings_router.get("/search", searchBookings);
bookings_router.get("/getSingle/:id", getBooking);

module.exports = bookings_router;
