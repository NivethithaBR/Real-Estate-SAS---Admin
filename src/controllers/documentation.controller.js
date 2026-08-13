const CashVoucher = require("../models/CashVoucher.model");
const SuspenseSlip = require("../models/SuspenseSlip.model");
const PreBooking = require("../models/PreBooking.model");
const StockRegister = require("../models/StockRegister.model");

// Cash Voucher Controllers
exports.createCashVoucher = async (req, res) => {
  try {
    const data = await CashVoucher.create(req.body);
    res.status(201).json({ success: true, message: "Cash Voucher created successfully", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllCashVouchers = async (req, res) => {
  try {
    const data = await CashVoucher.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateCashVoucher = async (req, res) => {
  try {
    const data = await CashVoucher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, message: "Cash Voucher updated successfully", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteCashVoucher = async (req, res) => {
  try {
    await CashVoucher.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Cash Voucher deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Suspense Slip Controllers
exports.createSuspenseSlip = async (req, res) => {
  try {
    const data = await SuspenseSlip.create(req.body);
    res.status(201).json({ success: true, message: "Suspense Slip created successfully", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllSuspenseSlips = async (req, res) => {
  try {
    const data = await SuspenseSlip.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateSuspenseSlip = async (req, res) => {
  try {
    const data = await SuspenseSlip.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, message: "Suspense Slip updated successfully", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteSuspenseSlip = async (req, res) => {
  try {
    await SuspenseSlip.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Suspense Slip deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Pre-booking Controllers
exports.createPreBooking = async (req, res) => {
  try {
    const data = await PreBooking.create(req.body);
    res.status(201).json({ success: true, message: "Pre-booking Form created successfully", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllPreBookings = async (req, res) => {
  try {
    const data = await PreBooking.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updatePreBooking = async (req, res) => {
  try {
    const data = await PreBooking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, message: "Pre-booking Form updated successfully", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deletePreBooking = async (req, res) => {
  try {
    await PreBooking.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Pre-booking Form deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Stock Register Controllers
exports.createStockRegister = async (req, res) => {
  try {
    const data = await StockRegister.create(req.body);
    res.status(201).json({ success: true, message: "Stock Register created successfully", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllStockRegisters = async (req, res) => {
  try {
    const data = await StockRegister.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateStockRegister = async (req, res) => {
  try {
    const data = await StockRegister.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ success: true, message: "Stock Register updated successfully", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteStockRegister = async (req, res) => {
  try {
    await StockRegister.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Stock Register deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
