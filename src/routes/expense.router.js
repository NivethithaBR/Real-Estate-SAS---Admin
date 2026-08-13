const express = require("express");
const {
  createExpense,
  updateExpense,
  deleteExpense,
  searchExpenses,
  getExpense,
  downloadSingleExpense,
} = require("../controllers/expense.controller");
const { addInventory, addInventoryCategory, getInventoryCategory, getEditCategory, listInventory, getEditInventory, getInventoryCategoryNames, addInventoryUnits, getInventoryUnits, getEditUnits} = require("../controllers/inventoryController")
const upload = require("../middlewares/uploadMiddleware");

const expense_router = express.Router();

expense_router.route("/create").post(upload.single("receipt"), createExpense);
expense_router.route("/update/:id").put(upload.single("receipt"), updateExpense);
expense_router.route("/delete/:id").delete(deleteExpense);
expense_router.route("/search").get(searchExpenses);
expense_router.route("/get/:id").get(getExpense);
expense_router.route("/downloadSingle/:id").get(downloadSingleExpense);
expense_router.route("/search").get(searchExpenses);









module.exports = expense_router;
