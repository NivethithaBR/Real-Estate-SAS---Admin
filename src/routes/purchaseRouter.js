const express = require("express");
const {
  PurchaseRequestTransaction,
  PurchaseOrderTransaction,
  PurchaseRequestList,
  PurchaseRequestEdit,
  PurchaseOrderList,
  PurchaseOrderEdit,
  purchaseReqTopurchaseOdr,
  PurchaseRequestListApproval,
  prStatusUpdate,
  poStatusUpdate,
  generatePurchaseOrderPDF,
} = require("../controllers/PurchaseController");
const upload = require("../middlewares/uploadMiddleware");
const {
  PurchaserequestValidator,
} = require("../validators/PurchaserequestValidator");

const router = express.Router();
const { verifyUser } = require("../middlewares/authMiddleware");

router
  .route("/purchaseorder-request-create")
  .post(verifyUser, PurchaserequestValidator, PurchaseRequestTransaction);

router
  .route("/purchaseorder-request-list")
  .get(verifyUser, PurchaseRequestList);

router
  .route("/purchaseorder-request-list-approval")
  .get(verifyUser, PurchaseRequestListApproval);

router
  .route("/purchaseorder-request-edit")
  .post(verifyUser, PurchaseRequestEdit);

router.route("/pr-to-po").post(verifyUser, purchaseReqTopurchaseOdr);

router.route("/purchaseorder-list").get(verifyUser, PurchaseOrderList);

router.route("/purchaseorder-edit").post(verifyUser, PurchaseOrderEdit);

router
  .route("/purchaseorder-create")
  .post(verifyUser, PurchaseOrderTransaction);

router.route("/purchaseorder-statusupdate").post(verifyUser, prStatusUpdate);

router.route("/po-statusupdate").post(verifyUser, poStatusUpdate);

// Added :id so a specific purchase order's PDF can be requested,
// e.g. GET /api/purchase/download-po/6a7710db8fa1dc64ab5fd600
router.route("/download-po/:id").get(verifyUser, generatePurchaseOrderPDF);

module.exports = router;
