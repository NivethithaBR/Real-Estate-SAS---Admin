const express = require("express");
const siteCtrl = require("../controllers/siteController");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.post(
  "/createsite",
  upload.fields([
    { name: "site_map_image", maxCount: 1 },
    { name: "site_banner", maxCount: 1 },
    { name: "site_card_image", maxCount: 1 },
  ]),
  siteCtrl.createSite
);
router.get("/getAllsites", siteCtrl.getAllSite);
router.get("/getAllLandlist", siteCtrl.getAlllandlist);
router.get("/getAllLandBySiteId/:id", siteCtrl.getAllLandBySiteId);
router.get("/getbyid/:id", siteCtrl.getById);
router.get("/search", siteCtrl.getFilteredSites);
router.get("/populate-plots", siteCtrl.getSiteWithAvailablePlots);
router.put(
  "/update-site/:id",
  upload.fields([
    { name: "site_map_image", maxCount: 1 },
    { name: "site_banner", maxCount: 1 },
    { name: "site_card_image", maxCount: 1 },
  ]),
  siteCtrl.updateSite
);
router.delete("/delete/:id", siteCtrl.deleteSite);
router.get("/plots/:siteid", siteCtrl.getPlotsBySite);
router.delete("/delete-image", siteCtrl.deleteSiteImage);
router.get("/uploadSiteMapAndCountsPDF/:id", siteCtrl.uploadSiteMapAndCountsPDF);

module.exports = router;
