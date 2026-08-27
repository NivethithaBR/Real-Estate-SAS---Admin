const Plot = require("../models/Plot");
const Site = require("../models/Site");
const cloudinary = require("../utils/cloudinary");
const { uploader } = require("../utils/helpers");
const puppeteer = require("puppeteer");
const path = require("path");
const ejs = require("ejs");
const { Types, default: mongoose } = require("mongoose");
const ErrorHandler = require("../utils/ErrorHandler");
const Landplot = require("../models/Landplot")

exports.addNewPlot = async (req, res, next) => {
  try {
    const files = req.files;
    const { site_id } = req.params;
    const {
      plot_no,
      flat_no,
      block,
      tower_name,
      floor_no,
      unit_type,
      facing,
      carpet_area,
      built_up_area,
      super_built_up_area,
      uds,
      owner,
      dimensions,
      total_area,
      price_per_sqft,
      plot_area,
      plot_sqft,
      road_area,
      plot_cent,
      plot_status,
      mrp,
      direct_price,
      total_price,
      floor_rise_charges,
      amenities_charges,
      car_parking_charges,
      gst,
      final_agreement_value,
      room_details,
      approval_number,
      rera_number,
      discount,
    } = req.body;

    const parsed_dimensions = dimensions ? JSON.parse(dimensions) : {};
    const parsed_room_details = room_details ? JSON.parse(room_details) : [];

    const site = await Site.findById(site_id);
    const foundPlot = await Plot.findOne({ plot_no, site_id });
    if (foundPlot) {
      return res.status(400).json({ message: "Flat number is taken already" });
    }
    if (!site) {
      return res.status(404).json({ message: "Apartment Project not Found" });
    }
    let is_booked = false;
    if (plot_status === "Booked") {
      is_booked = true;
    }
    const newPlot = await Plot.create({
      site_id,
      plot_no,
      flat_no,
      block,
      tower_name,
      floor_no,
      unit_type,
      facing,
      carpet_area,
      built_up_area,
      super_built_up_area,
      uds,
      owner,
      mrp,
      direct_price,
      total_price,
      floor_rise_charges,
      amenities_charges,
      car_parking_charges,
      gst,
      final_agreement_value,
      room_details: parsed_room_details,
      approval_number,
      rera_number,
      dimensions: parsed_dimensions,
      plot_area,
      plot_sqft,
      road_area,
      plot_cent,
      total_area,
      price_per_sqft,
      plot_status,
      is_initial_booked: is_booked,
      discount,
    });

    if (req.files["cover_image"]) {
      const converImageFile = req.files["cover_image"][0];
      const uploadResult = await uploader(converImageFile, "plot_cover_images");
      newPlot.cover_image = {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      };
    }else{
      return res.status(400).json({
        success : false,
        message : "Cover image is required"
      })
    }

    if (files) {
      const imageFiles = req.files["images"];
      let imageUrls = [];
      if (imageFiles && imageFiles.length > 0) {
        for (const file of imageFiles) {
          const uploadResult = await uploader(file, "plot_images");
          imageUrls.push({
            public_id: uploadResult.public_id,
            url: uploadResult.secure_url,
          });
        }
      }
      newPlot.images = imageUrls;

      const documentFields = [
        "patta_document",
        "layout_approval",
        "building_approval",
        "dtcp_approval",
        "agreement_document",
        "floor_plan",
      ];
      for (const field of documentFields) {
        if (req.files[field]) {
          const file = req.files[field][0];
          const uploadResult = await uploader(file, "approval_documents");
          newPlot[field] = {
            public_id: uploadResult.public_id,
            url: uploadResult.url || uploadResult.secure_url,
          };
        }
      }
    }

    if (!Array.isArray(site.plots)) {
      site.plots = [];
    }
    const ObjectId = new Types.ObjectId(newPlot._id);
    site.plots.push(ObjectId);

    await newPlot.save();
    await site.save();
    res.status(200).json({
      success: true,
      message: "New Flat Created Successfully",
      plot: newPlot,
    });
  } catch (err) {
    console.log("Error Adding Flat:", err);
    res.status(400).json({ success: false, message: "Error Adding Flat", err });
  }
};

exports.getAllPlots = async (req, res) => {
  try {
    const { search, page, limit } = req.query;

    let filter = {};
    if (search) {
      filter.plot_status = search.toLowerCase();
    }

    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 9;
    const skip = (pageNumber - 1) * pageSize;

    const totalPlots = await Plot.countDocuments(filter);

    const plots = await Plot.find(filter).skip(skip).limit(pageSize);
    if (plots.length === 0) {
      return res.status(404).json({
        success: false,
        message: `There are no ${search ? search.toLowerCase() : ""} flats available`,
      });
    }
    res.status(200).json({
      success: true,
      message: "Flats retrieved successfully",
      totalPlots,
      totalPages: Math.ceil(totalPlots / pageSize),
      currentPage: pageNumber,
      plots,
    });
  } catch (err) {
    res
      .status(400)
      .json({ success: false, message: "Error retrieving flats", err });
  }
};

exports.getPlotById = async (req, res) => {
  try {
    const { id } = req.params;
    const plot = await Plot.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "sites",
          localField: "site_id",
          foreignField: "_id",
          as: "site",
        },
      },
      {
        $unwind: {
          path: "$site",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "bookeds",
          localField: "client_id",
          foreignField: "_id",
          as: "booked_client",
        },
      },
      {
        $lookup: {
          from: "boughts",
          localField: "client_id",
          foreignField: "_id",
          as: "bought_client",
        },
      },
      {
        $addFields: {
          client: { $concatArrays: ["$booked_client", "$bought_client"] },
        },
      },
      {
        $unwind: {
          path: "$client",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    if (!plot.length) {
      return res
        .status(404)
        .json({ success: false, message: "Flat not Found" });
    }
    res.status(200).json({
      success: true,
      message: "Flat retrieved successfully",
      plot: plot[0],
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ success: false, message: "Error retrieving flat", err });
  }
};

exports.getlandPlotById = async (req, res) => {
  try {
    const { id } = req.params;
    const plot = await Landplot.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "lands",
          localField: "site_id",
          foreignField: "_id",
          as: "site",
        },
      },
      {
        $unwind: {
          path: "$site",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "bookedlandss",
          localField: "client_id",
          foreignField: "_id",
          as: "booked_client",
        },
      },
      {
        $lookup: {
          from: "boughtlands",
          localField: "client_id",
          foreignField: "_id",
          as: "bought_client",
        },
      },
      {
        $addFields: {
          client: { $concatArrays: ["$booked_client", "$bought_client"] },
        },
      },
      {
        $unwind: {
          path: "$client",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    if (!plot.length) {
      return res
        .status(404)
        .json({ success: false, message: "Flat not Found" });
    }
    res.status(200).json({
      success: true,
      message: "Plots retrieved successfully",
      plot: plot[0],
    });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ success: false, message: "Error retrieving flat", err });
  }
};

exports.updatePlotById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const files = req.files;
    const {
      plot_no,
      flat_no,
      block,
      tower_name,
      floor_no,
      unit_type,
      facing,
      carpet_area,
      built_up_area,
      super_built_up_area,
      uds,
      owner,
      dimensions,
      total_area,
      price_per_sqft,
      plot_status,
      mrp,
      direct_price,
      total_price,
      floor_rise_charges,
      amenities_charges,
      car_parking_charges,
      gst,
      final_agreement_value,
      room_details,
      approval_number,
      rera_number,
      discount,
    } = req.body;
    console.log("req.body", req.body);
    const plot = await Plot.findById(id);
    if (!plot) {
      return res
        .status(404)
        .json({ success: false, message: "Flat not found" });
    }

    if (plot_no && plot_no !== plot.plot_no) {
      const foundPlot = await Plot.findOne({ plot_no, site_id: plot.site_id });
      if (foundPlot) {
        return res
        .status(404)
        .json({ success: false, message: "Flat Number should be different" });
        
      }
      plot.plot_no = plot_no;
    }
    console.log("Came Here",id)
    if (flat_no) plot.flat_no = flat_no;
    if (block) plot.block = block;
    if (tower_name) plot.tower_name = tower_name;
    if (floor_no) plot.floor_no = floor_no;
    if (unit_type) plot.unit_type = unit_type;
    if (facing) plot.facing = facing;
    if (carpet_area) plot.carpet_area = carpet_area;
    if (built_up_area) plot.built_up_area = built_up_area;
    if (super_built_up_area) plot.super_built_up_area = super_built_up_area;
    if (uds) plot.uds = uds;
    if (owner) plot.owner = owner;
    if (dimensions) plot.dimensions = JSON.parse(dimensions);
    if (total_area) plot.total_area = total_area;
    if (price_per_sqft) plot.price_per_sqft = price_per_sqft;
    if (plot_status) plot.plot_status = plot_status;
    if (mrp) plot.mrp = mrp;
    if (direct_price) plot.direct_price = direct_price;
    if (total_price) plot.total_price = total_price;
    if (floor_rise_charges) plot.floor_rise_charges = floor_rise_charges;
    if (amenities_charges) plot.amenities_charges = amenities_charges;
    if (car_parking_charges) plot.car_parking_charges = car_parking_charges;
    if (gst) plot.gst = gst;
    if (final_agreement_value)
      plot.final_agreement_value = final_agreement_value;
    if (room_details) plot.room_details = JSON.parse(room_details);
    if (approval_number) plot.approval_number = approval_number;
    if (rera_number) plot.rera_number = rera_number;
    if (discount) plot.discount = discount;

    const uploadSingle = async (file, folder) => {
      const result = await uploader(file, folder);
      return {
        public_id: result.public_id,
        url: result.secure_url,
      };
    };

    if (files["cover_image"]) {
      if (plot.cover_image?.public_id) {
        await cloudinary.uploader.destroy(plot.cover_image.public_id);
      }
      plot.cover_image = await uploadSingle(
        files["cover_image"][0],
        "plot_cover_images",
      );
    }else{
      if(!plot.cover_image){
        return res.status(400).json({
        succes : false,
        message : "Cover image is required"
      })
      }
      
    }

    if (files["images"]) {
      if (plot.images?.length) {
        for (const img of plot.images) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      }
      let uploadImages = [];
      for (const file of files["images"]) {
        const uploadResult = await uploadSingle(file, "plot_images");
        uploadImages.push(uploadResult);
      }
      plot.images = uploadImages;
    }

    const approvalFields = [
      "patta_document",
      "layout_approval",
      "building_approval",
      "dtcp_approval",
      "agreement_document",
      "floor_plan",
    ];
    for (const field of approvalFields) {
      if (files[field]) {
        if (plot[field]?.public_id) {
          await cloudinary.uploader.destroy(plot[field].public_id);
        }
        const file = files[field][0];
        const uploadFile = await uploadSingle(file, "approval_documents");
        plot[field] = uploadFile;
      }
    }
    await plot.save();
    res
      .status(200)
      .json({ success: true, message: "Flat updated successfully", plot });
  } catch (err) {
    console.log("Error Updating Flat:", err);
    res
      .status(500)
      .json({ success: false, message: "Error Updating Flat", err });
  }
};

exports.deletePlot = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPlot = await Plot.findByIdAndDelete(id);
    if (!deletedPlot) {
      return res
        .status(404)
        .json({ success: false, message: "Flat Not Found" });
    }
    return res.status(400).json({
      success: false,
      message: "Delete Flat successfully",
      plot: deletedPlot,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Error Deleting Flat", err });
  }
};

exports.exportPlotDetailsAsPDF = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !Types.ObjectId.isValid(id)) {
     return res.status(400).json({
        message: "invalid id",
      });
    }
    const plotId = new Types.ObjectId(id);

    const plotDetails = await Plot.findById(plotId);
    if (!plotDetails) {
      return res
        .status(404)
        .json({ success: false, message: "Flat Not Found" });
    }

    const siteDetails = await Site.findById(plotDetails.site_id).lean();
    if (!siteDetails) {
      return res
        .status(404)
        .json({ success: false, message: "Apartment Project not Found" });
    }
    const tempName = path.join(__dirname, "../views/plotDetails.ejs");
    const htmlContent = await ejs.renderFile(tempName, {
      plotDetails,
      site_name: siteDetails.site_name,
      site_map_image: siteDetails.site_map_image,
    });

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });
    const page = await browser.newPage();

    await page.setContent(htmlContent, { waitUntil: "load" });

    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });

    await browser.close();

    if (!pdfBuffer || pdfBuffer.length === 0) {
      return res.status(500).json({
        message: "Error occured while pdf generate",
      });
    }
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Flat_${plotDetails?.plot_no}.pdf`,
    );
    res.end(pdfBuffer);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Error exporting Flat Details", err });
  }
};

exports.exportAllPlotAsPDF = async (req, res) => {
  try {
    const plotDetails = await Plot.find();

    if (!plotDetails || plotDetails.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No Flats Found" });
    }

    const tempName = path.join(__dirname, "../views/plotDetails.ejs");
    const htmlContent = await ejs.renderFile(tempName, {
      plotDetails,
    });
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });
    const page = await browser.newPage();

    await page.setContent(htmlContent, { waitUntil: "load" });

    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });

    await browser.close();

    if (!pdfBuffer || pdfBuffer.length === 0) {
      return res
        .status(500)
        .json({ success: false, message: "error occured while generare PDF" });
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename = "AllFlatDetails.pdf"`,
    );
    res.end(pdfBuffer);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Error exporting All Flats", err });
  }
};

exports.getAvailablePlotsPerSite = async (req, res) => {
  try {
    const availablePlots = await Plot.aggregate([
      {
        $group: {
          _id: "$site_id",
          availablePlotIds: { $push: "$_id" },
        },
      },
      {
        $lookup: {
          from: "sites",
          localField: "_id",
          foreignField: "_id",
          as: "siteDetails",
        },
      },
      {
        $unwind: "$siteDetails",
      },
      {
        $project: {
          _id: 0,
          site_id: "$_id",
          siteName: "$siteDetails.name",
          availablePlotIds: 1,
        },
      },
    ]);
    res.status(200).json({ success: true, data: availablePlots });
  } catch (err) {
    res.status(500).json({ success: false, message: "Servor Error", err });
  }
};

exports.deletePlotImages = async (req, res) => {
  try {
    const { plotId, publicId } = req.query;
    if (!plotId || !publicId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing Flat & Public ID" });
    }
    const plot = await Plot.findById(plotId);
    if (!plot) {
      return res.status(400).json({ succes: false, message: "flat not found" });
    }
    let deleted = false;

    const imageIndex = plot.images.findIndex(
      (img) => img.public_id === publicId,
    );
    if (imageIndex !== -1) {
      await cloudinary.uploader.destroy(publicId);
      plot.images.splice(imageIndex, 1);
      deleted = true;
    }

    const documentFields = [
      "patta_document",
      "layout_approval",
      "building_approval",
      "dtcp_approval",
      "agreement_document",
      "floor_plan",
    ];
    for (const field of documentFields) {
      if (plot[field] && plot[field].public_id === publicId) {
        await cloudinary.uploader.destroy(publicId);
        plot[field] = null;
        deleted = true;
        break;
      }
    }
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "File not found in flat" });
    }
    await plot.save();
    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      data: plot,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error deleting Image" });
  }
};

exports.getAllPlotsBySiteId = async (req, res) => {
  try {
    const { id } = req.params;
    const ObjectId = new Types.ObjectId(id);
    const plots = await Plot.find({ site_id: ObjectId });

    res.status(200).json({
      message: "Get all flats by apartment project id successfully",
      success: true,
      data: plots,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting Image" });
  }
};

exports.exportPlotAtPdf = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id || !Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "invalid id" });
    }
    const plotId = new Types.ObjectId(id);

    const plotResult = await Plot.aggregate([
      { $match: { _id: plotId } },
      {
        $lookup: {
          from: "sites",
          localField: "site_id",
          foreignField: "_id",
          as: "site",
        },
      },
      { $unwind: { path: "$site", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "bookeds",
          localField: "client_id",
          foreignField: "_id",
          as: "booked_client",
        },
      },
      {
        $lookup: {
          from: "boughts",
          localField: "client_id",
          foreignField: "_id",
          as: "bought_client",
        },
      },
      {
        $addFields: {
          client: { $concatArrays: ["$booked_client", "$bought_client"] },
        },
      },
      { $unwind: { path: "$client", preserveNullAndEmptyArrays: true } },
    ]);

    if (!plotResult.length) {
      return res
        .status(404)
        .json({ success: false, message: "Flat Not Found" });
    }

    const plotDetails = plotResult[0];

    const htmlContent = await ejs.renderFile(
      path.join(__dirname, "../views/allotmentLetter.ejs"),
      {
        date: new Date().toLocaleDateString("en-GB"),
        plotDetails,
        site_name: plotDetails.site?.site_name || "-",
        client_name: plotDetails.client?.client_name || "-",
        client_address: plotDetails.client?.address || "-",
      },
    );

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "load" });
    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Allotment_Letter_${plotDetails.plot_no}.pdf`,
    );
    res.end(pdfBuffer);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Error exporting Allotment Letter" });
  }
};

exports.getLandPlot = async (req, res) => {
  try {
    const { id } = req.params;
    const plot = await Landplot.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "lands",
          localField: "site_id",
          foreignField: "_id",
          as: "site",
        },
      },
      {
        $unwind: {
          path: "$site",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "bookedlands",
          localField: "client_id",
          foreignField: "_id",
          as: "booked_client",
        },
      },
      {
        $lookup: {
          from: "boughtlands",
          localField: "client_id",
          foreignField: "_id",
          as: "bought_client",
        },
      },
      {
        $addFields: {
          client: { $concatArrays: ["$booked_client", "$bought_client"] },
        },
      },
      {
        $unwind: {
          path: "$client",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    if (!plot.length) {
      return res.status(404).json({ success: false, message: "Land plot not Found" });
    }
    res.status(200).json({ success: true, message: "Land plot retrieve successfully", plot: plot[0] });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Error retrieving plot", err });
  }
};

