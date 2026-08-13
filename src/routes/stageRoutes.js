const express = require("express");
const { stages, stagesEdit, StagesList, stagesDelete, StagesListdatas, stageaddon, stagecostList, stagecostEdit } = require("../controllers/StageController")
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();
const { verifyUser} = require("../middlewares/authMiddleware");

router.route("/stages").post(verifyUser, stages)
router.route("/stages-edit").post(verifyUser, stagesEdit)
router.route("/stages-list").get(verifyUser, StagesList)
router.route("/stages-delete").post(verifyUser, stagesDelete)
router.route("/stages-listdatas").get(verifyUser, StagesListdatas)

router.route("/stageaddon").post(verifyUser,upload.single("stagephoto"), stageaddon)
router.route("/stagecost-list").post(verifyUser, stagecostList)
router.route("/stagecost-edit").post(verifyUser, stagecostEdit)

module.exports = router;