const express = require("express");
const {
  addEnquiry,
  searchEnquiry,
  deleteEnquiry,
  getEnquiryOne,
  updateEnquiry,
  getAvailablePlotsBySite,
  LeadCountByDay,
  showLeadStatusPercentages,
  callLead,
  bulkUploadEnquiries,
  // contactLead,
  // callFinish,
  searchRecordings,
  // getAudio,
} = require("../controllers/enquiryController");
const upload = require("../middlewares/uploadMiddleware");
const router = express.Router();

router.post("/add-enquiry", addEnquiry);
router.get("/searchEnquiry", searchEnquiry);
router.put("/update-enquiry/:enquiryId", updateEnquiry);
router.delete("/delete-enquiry/:enquiryId", deleteEnquiry);
router.get("/get-enquirybyid/:id", getEnquiryOne);
router.get("/getsiteplotenquiry/:id", getAvailablePlotsBySite);
router.post("/getLeadCountByDay", LeadCountByDay);
router.get("/getLeadStatusPercentage", showLeadStatusPercentages);
router.post("/callLead", callLead)
// router.post("/twilio/connect-lead", contactLead);
// router.post("/twilio/recording", callFinish);
router.get("/getCallRecords", searchRecordings);
router.post("/bulkupload",upload.single("file"), bulkUploadEnquiries);
// router.get("/recording/:sid", getAudio);

module.exports = router;
