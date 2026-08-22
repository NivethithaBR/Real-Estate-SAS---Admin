const express = require("express");
const siteCtrl = require("../controllers/landController");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "land routes working",
  });
});

router.post(
  "/createland",
  upload.fields([
    { name: "site_map_image", maxCount: 1 },
    { name: "site_banner", maxCount: 1 },
    { name: "site_card_image", maxCount: 1 },
  ]),
  siteCtrl.createland
);
router.get("/getAllland", siteCtrl.getAllLand);
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
router.post(
  "/add-landplot/:site_id",
  upload.fields([
    {
      name: "images",
      maxCount: 10,
    },
    {
      name: "cover_image",
      maxCount: 1,
    },
    {
      name: "patta_document",
      maxCount: 1,
    },
    {
      name: "dtcp_approval",
      maxCount: 1,
    },
    {
      name: "layout_approval",
      maxCount: 1,
    },
    {
      name: "building_approval",
      maxCount: 1,
    },
  ]),
  siteCtrl.addlandPlot
);
router.post("/getLandplotDetails",siteCtrl.getLandplotDetails)
router.post("/edit-landplot",siteCtrl.editLandplot)
router.post("/update-landplot/:id",
  upload.fields([
    {
      name: "images",
      maxCount: 10,
    },
    {
      name: "cover_image",
      maxCount: 1,
    },
    {
      name: "patta_document",
      maxCount: 1,
    },
    {
      name: "dtcp_approval",
      maxCount: 1,
    },
    {
      name: "layout_approval",
      maxCount: 1,
    },
    {
      name: "building_approval",
      maxCount: 1,
    },
  ]),
  siteCtrl.updateLandPlot)
  router.post("/delete-landplot/:id",siteCtrl.deleteLandplot)
router.get("/getbyidland/:id", siteCtrl.getByIdLand);
router.put(
  "/update-land/:id",
  upload.fields([
    { name: "site_map_image", maxCount: 1 },
    { name: "site_banner", maxCount: 1 },
    { name: "site_card_image", maxCount: 1 },
  ]),
  siteCtrl.updateLand
);

router.post("/delete-land/:id",siteCtrl.deleteLand)


module.exports = router;
