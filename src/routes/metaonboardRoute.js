const express = require("express");
const router = express.Router();
const { loginFunction, callbackFunction } = require("../controllers/metaonboardController");

router.get("/login", loginFunction);
router.get("/callback", callbackFunction);


module.exports = router;
