const express = require("express");
const { createAmountForExpense, updateAmount } = require("../controllers/amount.controller");

const amount_router = express.Router();

amount_router.post("/create", createAmountForExpense);
amount_router.put("/update/:id", updateAmount);

module.exports = amount_router;
