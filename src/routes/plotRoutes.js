const express = require("express");
const {
  addNewPlot,
  getAllPlots,
  getPlotById,
  deletePlot,
  updatePlotById,
  exportAllPlotAsPDF,
  exportPlotDetailsAsPDF,
  getAvailablePlotsPerSite,
  deletePlotImages,
  getAllPlotsBySiteId,
  exportPlotAtPdf,
} = require("../controllers/plotController");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

router.post(
  "/add-plot/:site_id",
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
    {
      name: "agreement_document",
      maxCount: 1,
    },
    {
      name: "floor_plan",
      maxCount: 1,
    },
  ]),
  addNewPlot,
);
router.get("/getallplots", getAllPlots);
router.get("/get-plot/:id", getPlotById);
router.put(
  "/update-plot/:id",
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
    {
      name: "agreement_document",
      maxCount: 1,
    },
    {
      name: "floor_plan",
      maxCount: 1,
    },
  ]),
  updatePlotById,
);
router.delete("/deleteplot/:id", deletePlot);
router.delete("/delete-plot-image", deletePlotImages);
router.get("/exportaspdf/:id", exportPlotDetailsAsPDF);
router.get("/exportallotmentletter/:id", exportPlotAtPdf); // router.get("/pdf/exportall", exportAllPlotAsPDF);
router.get("/available-plot-per-site", getAvailablePlotsPerSite);
router.get("/getAllPlotsBySiteId/:id", getAllPlotsBySiteId);

module.exports = router;
