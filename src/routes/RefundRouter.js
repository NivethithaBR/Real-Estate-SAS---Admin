const express = require("express");
const refund_router = express.Router();
const { getSingleRefund, searchRefunds, updateRefund, deleteRefund } = require("../controllers/Refund.controller");

refund_router.get("/getRefund/:id", getSingleRefund);
refund_router.get("/search", searchRefunds);
refund_router.put("/update/:id", updateRefund);
refund_router.delete("/delete/:id", deleteRefund);

module.exports = refund_router;
