const express = require("express");
const { addInventory, addInventoryCategory, getInventoryCategory, getEditCategory, listInventory, getEditInventory, getInventoryCategoryNames, addInventoryUnits, getInventoryUnits, getEditUnits, getInventoryUnitsNames, initInventoryManagementData, productsList, getInventoryUnitsList, initInventoryManagementDataList, editTransaction, initAdjustmentData, editAdjustment, getEditInventoryTran, initInventoryAdjustmentDataList, inventoryReport, updateApprovalData} = require("../controllers/inventoryController")
const upload = require("../middlewares/uploadMiddleware");
const {InventorymanagementValidator} = require("../validators/InventorymanagementValidator")
const {InventoryadjustmentValidator} = require("../validators/InventoryadjustmentValidator")

const router = express.Router();
const { verifyUser} = require("../middlewares/authMiddleware");
const { ValidatorMiddleware } = require("../validators/ValidatorMiddleware")

router.route("/inventorycreate").post(verifyUser,addInventory);
router.route("/inventory-list").post(verifyUser,listInventory);
router.route("/inventory-edit").post(verifyUser,getEditInventory);


router.route("/inventory-category").post(verifyUser,addInventoryCategory);
router.route("/inventory-category-edit").post(verifyUser,getEditCategory);
router.route("/inventory-category-list").post(verifyUser,getInventoryCategory);
router.route("/inventory-category-names").get(verifyUser,getInventoryCategoryNames);

router.route("/inventory-units").post(verifyUser,addInventoryUnits);
router.route("/inventory-units-list").post(verifyUser,getInventoryUnits);
router.route("/inventory-units-edit").post(verifyUser,getEditUnits);
router.route("/inventory-units-names").get(verifyUser,getInventoryUnitsNames);

// router.route("/inventory-management-list").get(getAllInventoryManagementData)

router.route("/inventory-management-create").post(verifyUser, InventorymanagementValidator,ValidatorMiddleware, initInventoryManagementData)

router.route("/inventory-management-edit").post(verifyUser, getEditInventoryTran)

router.route("/inventory-management-lister").post(verifyUser, initInventoryManagementDataList)

router.route("/products-list").get(verifyUser, productsList)
router.route("/inventory-unitsget").get(verifyUser, getInventoryUnitsList)



router.route("/inventory-adjustment-create").post(verifyUser, InventoryadjustmentValidator,ValidatorMiddleware, upload.single("approvalphoto"),initAdjustmentData)

router.route("/inventory-adjustment-approval-update/:id?").post(verifyUser, upload.none(),updateApprovalData)

router.route("/inventory-adjustment-edit").post(verifyUser, editAdjustment)

router.route("/inventory-adjustment-lister").post(verifyUser, initInventoryAdjustmentDataList)

router.route("/inventory-report").post(verifyUser, inventoryReport)

module.exports = router;
