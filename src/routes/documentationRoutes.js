const express = require("express");
const router = express.Router();
const documentationController = require("../controllers/documentation.controller");

// Cash Voucher Routes
router.post("/cash-vouchers", documentationController.createCashVoucher);
router.get("/cash-vouchers", documentationController.getAllCashVouchers);
router.put("/cash-vouchers/:id", documentationController.updateCashVoucher);
router.delete("/cash-vouchers/:id", documentationController.deleteCashVoucher);

// Suspense Slip Routes
router.post("/suspense-slips", documentationController.createSuspenseSlip);
router.get("/suspense-slips", documentationController.getAllSuspenseSlips);
router.put("/suspense-slips/:id", documentationController.updateSuspenseSlip);
router.delete("/suspense-slips/:id", documentationController.deleteSuspenseSlip);

// Pre-booking Routes
router.post("/pre-bookings", documentationController.createPreBooking);
router.get("/pre-bookings", documentationController.getAllPreBookings);
router.put("/pre-bookings/:id", documentationController.updatePreBooking);
router.delete("/pre-bookings/:id", documentationController.deletePreBooking);

// Stock Register Routes
router.post("/stock-registers", documentationController.createStockRegister);
router.get("/stock-registers", documentationController.getAllStockRegisters);
router.put("/stock-registers/:id", documentationController.updateStockRegister);
router.delete("/stock-registers/:id", documentationController.deleteStockRegister);

module.exports = router;
