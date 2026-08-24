const express = require("express")
const { unbookReservation, unbookReservationland } = require("../controllers/reservationController");
const router = express.Router();

//Reservation Routes
router.put('/reservation/unbook/:id', unbookReservation);
router.put('/reservationland/unbook/:id', unbookReservationland);



module.exports = router;