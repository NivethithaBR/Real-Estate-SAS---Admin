const express = require("express");
const { createSupplier , editSupplier, SupplierList, SupplierMaster} = require("../controllers/SupplierController")
const upload = require("../middlewares/uploadMiddleware");
const {SupplierrequestValidator} = require("../validators/SupplierrequestValidator")

const router = express.Router();
const { verifyUser} = require("../middlewares/authMiddleware");

router.route("/supplier-create").post(verifyUser,SupplierrequestValidator, createSupplier)
router.route("/supplier-edit").post(verifyUser, editSupplier)
router.route("/supplier-list").get(verifyUser, SupplierList)
router.route("/suppliers-master").get(verifyUser, SupplierMaster)




module.exports = router;