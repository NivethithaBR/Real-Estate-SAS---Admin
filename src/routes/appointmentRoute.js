const express = require("express");
const { createAppointment,getAllAppointment,updateAppointment,deleteAppointment } = require("../controllers/AppointmentController");
const { verifyUser} = require("../middlewares/authMiddleware");
const router = express.Router();
const {AppointmentValidator} = require("../validators/AppointmentValidator")
const {ValidatorMiddleware} = require("../validators/ValidatorMiddleware")


router.post("/create",verifyUser,AppointmentValidator, ValidatorMiddleware ,createAppointment);
router.post("/update",verifyUser, updateAppointment);
router.get("/getall",verifyUser,getAllAppointment);
router.post("/delete",verifyUser,deleteAppointment);


module.exports = router;
