const express = require("express");
const { searchRegistrations } = require("../controllers/registrationController");
const registration_router = express.Router();

registration_router.get("/search", searchRegistrations);

module.exports = registration_router;
