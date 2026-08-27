const express = require("express");
const {
  updateClient,
  updatelandClient,
  getBookedClients,
  bookPlot,
  // updateBookPlot,
  getFilteredBoughtPlots,
  getFilteredBookedClients,
  searchBooked,
  searchBookedLand,
  searchBougths,
  searchBougthsland,
  getBookedOne,
  getBookedOneland,
  getBoughtOne,
  getBoughtOneLand,
  getClientById,
  getlandClientById,
  updateAmount,
  updateCommissionPercentages,
  getAllpayment,
  bookLandPlot,
  updateAmountLand
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

router.put(
  "/updateclientland/:id",
  upload.fields([
    { name: "aadhar_card", maxCount: 1 },
    { name: "pan_card", maxCount: 1 },
    { name: "bank_passbook", maxCount: 1 },
    { name: "income_proof", maxCount: 1 },
    { name: "loan_approval_letter", maxCount: 1 },
  ]),
  updatelandClient
);

router.get("/getclientby/:id", getClientById);
router.get("/getlandclientby/:id", getlandClientById);

router.get("/searchBooked", searchBooked);
router.get("/searchBookedLand", searchBookedLand);
router.get("/searchBoughts", searchBougths);
router.get("/searchBoughtsland", searchBougthsland);

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
router.get("/get-bookedoneland/:id", getBookedOneland);


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
router.get("/get-boughtoneland/:id", getBoughtOneLand);


router.get("/bought-filter", getFilteredBoughtPlots);
router.get("/booked-filter", getFilteredBookedClients);
router.put("/updateMRP", updateAmount);
router.put("/updateMRPland", updateAmountLand);
router.put("/updateCommissionPercentages/:id", updateCommissionPercentages);
router.get("/getAllPayments", getAllpayment)

router.post(
  "/book-land-plot",
  upload.fields([
    { name: "aadhar_card", maxCount: 1 },
    { name: "pan_card", maxCount: 1 },
    { name: "bank_passbook", maxCount: 1 },
    { name: "income_proof", maxCount: 1 },
    { name: "loan_approval_letter", maxCount: 1 },
  ]),
  bookLandPlot
);

module.exports = router;
