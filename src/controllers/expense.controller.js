const expense_model = require("../models/Expense.model");
const ErrorHandler = require("../utils/ErrorHandler");
const mongoose = require("mongoose");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/cloudinary.utils");
const puppeteer = require("puppeteer");
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");
const amount_model = require("../models/Amounts.model");

const createExpense = async (req, res, next) => {
  const { expense_name, payment_mode } = req.body;
  const data = req.body;
  if (!expense_name || !payment_mode) {
    return next(new ErrorHandler(400, "Expense Name and payment mode is Required"));
  }

  if (req.file) {
    const uploadResult = await uploadToCloudinary("expenses", req.file);
    data.receipt = {
      public_id: uploadResult.public_id,
      url: uploadResult.secure_url,
    };
  }
  const newExpense = await expense_model.create(data);
  if (!newExpense) {
    return next(new ErrorHandler(400, "Couldn't create Expense"));
  }
  
  res.status(200).json({
    success: true,
    message: "New Expense created successfully",
    data: newExpense,
  });
};

const updateExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler(400, "Invalid id"));
    }
    const ObjectId = new mongoose.Types.ObjectId(id);
    const foundExpense = await expense_model.findById(ObjectId);
    if (foundExpense?.receipt?.url) {
      await deleteFromCloudinary(foundExpense?.receipt?.public_id);
    }

    if (req.file) {
      const uploadResult = await uploadToCloudinary("expenses", req.file);
      data.receipt = {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      };
    }
    const updatedExpense = await expense_model.findByIdAndUpdate(ObjectId, data);

    if (!updatedExpense) {
      return next(new ErrorHandler(404, "Expense not found"));
    }
    res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data: updatedExpense,
    });
  } catch (error) {
    next(error);
  }
};

const deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler(400, "Invalid id"));
    }
    const ObjectId = new mongoose.Types.ObjectId(id);
    const deletedExpense = await expense_model.findByIdAndDelete(ObjectId);
    if (!deletedExpense) {
      return next(new ErrorHandler(404, "Expense not found"));
    }
    if (deletedExpense?.receipt?.url) {
      await deleteFromCloudinary(deletedExpense?.receipt?.public_id);
    }
    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
      data: deletedExpense,
    });
  } catch (error) {
    next(error);
  }
};

const searchExpenses = async (req, res, next) => {
  const { date, start_date, end_date, page = 1, limit = 10, search, isDownloadable } = req.query;
  try {
    const match = {};
    const andConditions = [];

    if (date) {
      andConditions.push({
        date: { $eq: new Date(date) },
      });
    }

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

    if (search) {
      andConditions.push({
        expense_name: new RegExp(search, "gi"),
      });
    }

    if (andConditions.length > 0) {
      match.$and = andConditions;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const searchedExpenses = await expense_model.aggregate([
      {
        $facet: {
          total: [
            {
              $count: "totalDocuments",
            },
          ],
          paginationData: [
            {
              $addFields: {
                createdDay: { $dayOfMonth: "$createdAt" },
                createdMonth: { $month: "$createdAt" },
                createdYear: { $year: "$createdAt" },
              },
            },
            {
              $match: match,
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

    const foundAmount = date
      ? await amount_model.findOne({
          $expr: {
            $eq: [{ $dayOfMonth: "$date" }, new Date(date).getDate()],
          },
        })
      : null;
    const totalCounts = searchedExpenses?.[0].total?.[0]?.totalDocuments;
    const data = searchedExpenses?.[0]?.paginationData;
    const spent_amount = data?.reduce((acc, val) => acc + val.amount, 0);

    if (isDownloadable === "true") {
      const filePath = path.join(__dirname, "../views", "/ExpenseReport.ejs");
      if (fs.existsSync(filePath)) {
        const received_amount = foundAmount?.received_amount || 0;
        const pending_amount = received_amount - spent_amount;

        const htmlContent = await ejs.renderFile(filePath, { 
          expenses: data, 
          amount: {received_amount, spent_amount, pending_amount}, 
          report_date : date ? new Date(date).toLocaleDateString(): "All Dates" });

        const browser = await puppeteer.launch({
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
        });
        const page = await browser.newPage();
        await page.setContent(htmlContent, {
          waitUntil: "domcontentloaded",
        });

        const pdfBuffer = await page.pdf({
          format: "A4",
          printBackground: true,
        });
        res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=Expense.pdf`);
        return res.end(pdfBuffer);
      }
    }
    res.status(200).json({
      success: true,
      message: "Expense filtered successfully",
      totalCounts,
      amount: foundAmount,
      spent_amount,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler(400, "Invalid id"));
    }
    const ObjectId = new mongoose.Types.ObjectId(id);
    const foundedExpense = await expense_model.findById(ObjectId);
    if (!foundedExpense) {
      return next(new ErrorHandler(404, "Expense not found"));
    }
    res.status(200).json({
      success: true,
      message: "Expense get successfully",
      data: foundedExpense,
    });
  } catch (error) {
    next(error);
  }
};

const downloadSingleExpense = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler(400, "Invalid Id"));
    }

    const ObjectId = new mongoose.Types.ObjectId(id);
    const foundExpense = await expense_model.findById(ObjectId);

    if (!foundExpense) {
      return next(new ErrorHandler(404, "Expense Not Found"));
    }
    const filePath = path.join(__dirname, "../views", "/ExpenseReport.ejs");
    const htmlContent = await ejs.renderFile(filePath, { expenses: [foundExpense], amount: false });
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, {
      waitUntil: "networkidle0",
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${foundExpense.expense_name}_expense.pdf`);
    return res.end(pdfBuffer);
  } catch (error) {
    next(error);
  }
};
module.exports = { createExpense, updateExpense, deleteExpense, searchExpenses, getExpense, downloadSingleExpense };
