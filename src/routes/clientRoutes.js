const express = require("express");
const {
  updateClient,
  getBookedClients,
  bookPlot,
  // updateBookPlot,
  getFilteredBoughtPlots,
  getFilteredBookedClients,
  searchBooked,
  searchBougths,
  getBookedOne,
  getBoughtOne,
  getClientById,
  updateAmount,
  updateCommissionPercentages,
  getAllpayment
} = require("../controllers/clientController");
const upload = require("../middlewares/uploadMiddleware");
const router = express.Router();

router.get("/booked-clients", getBookedClients);
router.put(
  "/updateclient/:id",
  upload.fields([
    { name: "aadhar_card", maxCount: 1 },
    { name: "pan_card", maxCount: 1 },
    { name: "bank_passbook", maxCount: 1 },
    { name: "income_proof", maxCount: 1 },
    { name: "loan_approval_letter", maxCount: 1 },
  ]),
  updateClient
);
router.get("/getclientby/:id", getClientById);
router.get("/searchBooked", searchBooked);
router.get("/searchBoughts", searchBougths);

//Customer Management Module API's
router.post(
  "/book-plot",
  upload.fields([
    { name: "aadhar_card", maxCount: 1 },
    { name: "pan_card", maxCount: 1 },
    { name: "bank_passbook", maxCount: 1 },
    { name: "income_proof", maxCount: 1 },
    { name: "loan_approval_letter", maxCount: 1 },
  ]),
  bookPlot
);
router.get("/get-bookedone/:id", getBookedOne);

// router.put(
//   "/update-booking/:plot_id",
//   upload.fields([
//     { name: "aadhar_card", maxCount: 1 },
//     { name: "pan_card", maxCount: 1 },
//     { name: "bank_passbook", maxCount: 1 },
//     { name: "income_proof", maxCount: 1 },
//     { name: "loan_approval_letter", maxCount: 1 },
//   ]),
//   updateBookPlot
// );
router.get("/get-boughtone/:id", getBoughtOne);

router.get("/bought-filter", getFilteredBoughtPlots);
router.get("/booked-filter", getFilteredBookedClients);
router.put("/updateMRP", updateAmount);
router.put("/updateCommissionPercentages/:id", updateCommissionPercentages);
router.get("/getAllPayments", getAllpayment)
module.exports = router;
