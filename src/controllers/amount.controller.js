const { Types } = require("mongoose");
const amount_model = require("../models/Amounts.model");
const ErrorHandler = require("../utils/ErrorHandler");

const createAmountForExpense = async (req, res, next) => {
  try {
    const newExpenseAmount = await amount_model.create(req.body);
    if (!newExpenseAmount) return next(new ErrorHandler(400, "New expense amount not created"));
    return res.status(200).json({
      success: true,
      message: "New Expense Amount created",
      data: newExpenseAmount,
    });
  } catch (error) {
    next(error);
  }
};


const updateAmount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body
    if (!id || !Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler(400, "Invalid id"));
    }
    const ObjectId = new Types.ObjectId(id);
    console.log(ObjectId,data)
    const updatedAmount = await amount_model.findByIdAndUpdate(ObjectId, data,{new:true});
    if (!updatedAmount) {
      return next(new ErrorHandler(404, "Amount Not Found"));
    }
    res.status(200).json({
      success: true,
      message: "Update successfully",
      data: updatedAmount,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = { createAmountForExpense, updateAmount };
