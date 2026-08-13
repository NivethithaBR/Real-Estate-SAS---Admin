const express = require("express");
const router = express.Router();
const { webhookVerify, webhookLeadget } = require("../controllers/WebhookController");

router.get("/data", webhookVerify);
router.post("/data", webhookLeadget);


module.exports = router;
