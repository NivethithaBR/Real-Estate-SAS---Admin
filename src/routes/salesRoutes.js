const express = require("express")
const { unbookReservation } = require("../controllers/reservationController");
const router = express.Router();

//Reservation Routes
router.put('/reservation/unbook/:id', unbookReservation);


module.exports = router;