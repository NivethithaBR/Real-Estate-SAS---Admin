const { mongoose, Types } = require("mongoose");
const Land = require("../models/Land");
const Plot = require("../models/Plot");
const { uploader } = require("../utils/helpers");
const cloudinary = require("../utils/cloudinary");
const upload = require("../middlewares/uploadMiddleware");
const dotenv = require("dotenv");
const ErrorHandler = require("../utils/ErrorHandler");
const ejs = require("ejs");
const sharp = require("sharp");

const path = require("path");
const { existsSync, readFileSync } = require("fs");
const puppeteer = require("puppeteer");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/cloudinary.utils");
const Landplot = require("../models/Landplot")
dotenv.config();


exports.createland = async (req, res) => {
  try {
    const { site_name, mobile_no, address, state, city, location, site_incharge_name, survey_no } = req.body;
    console.log(req?.body,"all")
    if (!site_name) {
      return res.status(400).json({ success: false, message: "please fill all the required fields" });
    }

    const uploadFile = async (file, folder) => {
      if (file) {
        const uploadResult = await uploader(file, folder);
        return { public_id: uploadResult.public_id, url: uploadResult.secure_url };
      }
      return null;
    };

    const uploadMultipleFiles = async (files, folder) => {
      const images = [];
      if (files) {
        for (let i = 0; i < Math.min(files.length, 5); i++) {
          const uploaded = await uploadFile(files[i], folder);
          if (uploaded) images.push(uploaded);
        }
      }
      return images;
    };

    const site_map_image = await uploadFile(req.files?.site_map_image?.[0], "site_images");
    const site_banner = await uploadFile(req.files?.site_banner?.[0], "site_images");
    const site_card_images = await uploadMultipleFiles(req.files?.site_card_image, "site_images");

    const site = new Land({
      site_name,
      mobile_no,
      address,
      survey_no,
      state,
      city,
      location,
      site_incharge_name,
      site_map_image,
      site_banner,
      site_card_image: site_card_images,
    });
    await site.save();
    res.status(200).json({ success: true, message: "Land or Plot created successfully", site });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const site_id = req.params.id;
    const site = await Site.findById(site_id);

    if (!site) {
      return res.status(404).json({ success: false, message: "User not Found" });
    }
    res.status(200).json({ success: true, message: "Site Details", site });
  } catch (err) {
    res.status(400).json({ success: false, message: "Site Not found", err });
  }
};

exports.getAllLand = async (req, res) => {
  try {
    const { site_name } = req.query;

    const filter = {};
    if (site_name) {
      filter.site_name = { $regex: site_name, $options: "i" };
    }
    const sites = await Land.find(filter);
    if (!sites.length) {
      return res.status(400).json({ success: false, message: "No sites found" });
    }

    const siteWithPlotCounts = await Promise.all(
      sites.map(async (site) => {
        const plotCounts = await Landplot.aggregate([
          {
            $match: { site_id: site._id },
          },
          {
            $group: {
              _id: "$plot_status",
              count: { $sum: 1 },
            },
          },
        ]);

        const plotCountObj = { Available: 0, Booked: 0, Sold: 0, Declined: 0 };
        plotCounts.forEach((item) => {
          if (plotCountObj.hasOwnProperty(item._id)) {
            plotCountObj[item._id] = item.count;
          }
        });
        return {
          ...site.toObject(),
          plotCounts: plotCountObj,
        };
      })
    );
    res.status(200).json({
      success: true,
      message: "Get Land Successfully",
      totalSites: siteWithPlotCounts.length,
      land: siteWithPlotCounts,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: "Failed to GetSite", err });
  }
};

exports.getFilteredSites = async (req, res) => {
  try {
    const { site_name } = req.query;
    const query = {};

    if (site_name) {
      query.site_name = { $regex: site_name, $options: "i" }; //site_name;
    }
    // if (city) {
    //   query.city = { $regex: city, $options: "i" }; //location;
    // }

    const sites = await Site.find(query).lean();
    if (sites.length > 0) {
      res.status(200).json({ success: true, message: "Welcome..!", sites });
    } else {
      res.status(404).json({ success: false, message: "No sites Found" });
    }
  } catch (err) {
    res.status(404).json({ success: false, message: "Failed to Get sites", err });
  }
};

exports.updateSite = async (req, res) => {
  try {
    const { id } = req.params;
    const { site_name, mobile_no, address, state, city, location, site_incharge_name, survey_no } = req.body;
    const site = await Site.findById(id);
    if (!site) {
      return res.status(404).json({ success: false, message: "Site not Found" });
    }
    const uploadFile = async (file, folder, oldImage) => {
      if (!file) return oldImage;
      if (oldImage?.public_id) {
        await deleteFromCloudinary(oldImage.public_id);
      }
      const uploadResult = await uploadToCloudinary(folder, file);
      return { public_id: uploadResult.public_id, url: uploadResult.secure_url };
    };

    const uploadMultipleFiles = async (files, folder, oldImages) => {
      const newImages = [];
      if (files) {
        for (let i = 0; i < Math.min(files.length, 5); i++) {
          const uploaded = await uploadFile(files[i], folder, null);
          if (uploaded) newImages.push(uploaded);
        }
      }
      // Delete old images if new ones are uploaded
      if (newImages.length > 0 && oldImages) {
        for (const oldImg of oldImages) {
          if (oldImg?.public_id) await deleteFromCloudinary(oldImg.public_id);
        }
      }
      return newImages.length > 0 ? newImages : oldImages;
    };

    site.site_map_image = await uploadFile(req.files?.site_map_image?.[0], "site_images", site.site_map_image);
    site.site_banner = await uploadFile(req.files?.site_banner?.[0], "site_images", site.site_banner);
    site.site_card_image = await uploadMultipleFiles(req.files?.site_card_image, "site_images", site.site_card_image);

    if (site_name) site.site_name = site_name;
    if (mobile_no) site.mobile_no = mobile_no;
    if (address) site.address = address;
    if (state) site.state = state;
    if (city) site.city = city;
    if (site_incharge_name) site.site_incharge_name = site_incharge_name;
    if (survey_no) site.survey_no = survey_no;
    if (location) site.location = location;

    await site.save();
    res.status(200).json({ success: true, message: "Site Updated Successfully", site });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update site" });
  }
};

exports.deleteSite = async (req, res) => {
  try {
    const { id } = req.params;
    const site = await Site.findById(id);
    if (!site) {
      return res.status(400).json({ success: false, message: "Site not found" });
    }
    if (site.image) {
      const public_Id = site.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(public_Id);
    }
    const plot = await Plot.deleteMany({ site_id: id });
    if (!plot) {
      return res.status(400).json({ success: false, message: "Failed to Delete Plots" });
    }
    await Site.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Site & Following Plots deleted Succesfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to Delete Site and Following Plots" });
  }
};

exports.getPlotsBySite = async (req, res) => {
  try {
    const { site_id } = req.params;

    if (!site_id || !mongoose.Types.ObjectId.isValid(site_id)) {
      return res.status(400).json({ success: false, message: "Invalid site_id" });
    }

    const plots = await Plot.find({ site_id }).populate("site_id");
    if (!plots || plots.length === 0) {
      return res.status(404).json({ success: false, message: "No plots found for this site" });
    }
    res.status(200).json({ success: true, plots });
  } catch (err) {
    res.status(500).json({ message: "Error fetching plots", err });
  }
};

exports.getSiteWithAvailablePlots = async (req, res) => {
  try {
    const { site_id, search, status } = req.query;

    if (!site_id) {
      return res.status(400).json({ success: false, message: "Site ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(site_id)) {
      return res.status(400).json({ success: false, message: "Invalid site_id" });
    }

    const siteObjectId = new mongoose.Types.ObjectId(site_id);
    const matchQuery = {};

    if (search) {
      matchQuery.plot_no = { $regex: search, $options: "i" };
    }

    if (status) {
      matchQuery.plot_status = status;
    }
    const sites = await Land.findById(siteObjectId).populate({
      path: "plots",
      match: matchQuery,
    });

    if (!sites) {
      return res.status(404).json({ success: false, message: "Site not found" });
    }
    res.status(200).json({ success: true, data: sites });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server Error", error: err });
  }
};

exports.deleteSiteImage = async (req, res) => {
  try {
    const { siteId, publicId } = req.query;
    if (!siteId || !publicId) {
      return res.status(400).json({ success: false, message: "Missing SiteId or PublicId" });
    }
    const site = await Site.findById(siteId);
    if (!site) {
      return res.status(404).json({ success: false, message: "site not found" });
    }
    const imageFields = ["site_map_image", "site_banner"];
    let deleted = false;

    for (const field of imageFields) {
      if (site[field] && site[field].public_id === publicId) {
        await cloudinary.uploader.destroy(publicId);
        site[field] = null;
        deleted = true;
        break;
      }
    }

    // Handle site_card_image array
    if (!deleted && site.site_card_image && Array.isArray(site.site_card_image)) {
      const index = site.site_card_image.findIndex(img => img.public_id === publicId);
      if (index !== -1) {
        await cloudinary.uploader.destroy(publicId);
        site.site_card_image.splice(index, 1);
        deleted = true;
      }
    }
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Image not found in site fields" });
    }
    await site.save();
    res.status(200).json({ success: true, message: "Site image deleted successfully", data: site });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error deleting site image" });
  }
};

// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// exports.whatsAppMessage = async (req, res) => {
//   try {
//     console.log("object");
//     const {
//       to,
//       organizerName,
//       date,
//       place,
//       functionType,
//       fname,
//       lname,
//       number,
//       paymentType,
//       address,
//       total,
//       pdfUrl = "https://res.cloudinary.com/dt30jyjkv/image/upload/v1745481108/RC3_piorz9.png",
//     } = req.body;

//     if (!to || !pdfUrl) {
//       return res.status(400).send('Missing "to", "body", or "pdfUrl".');
//     }

//     const bodyText = `Organizer Name: ${organizerName || ""}
// Date: ${date || ""}
// Place: ${place || ""}
// Function Type: ${functionType || ""}
// First Name: ${fname || ""}
// Last Name: ${lname || ""}
// Number: ${number || ""}
// Payment Type: ${paymentType || ""}
// Address: ${address || ""}
// Total: ${total || ""}

// Visit Our Site: https://www.wizinoa.com/

// Thank You!`;

//     const decoded = Buffer.from("ODIyMDk0MjM4NA==", "base64").toString("utf-8"); // "8220942384"

//     const message = await client.messages.create({
//       from: `whatsapp:${+14155238886}`,
//       to: `whatsapp:${to}`, // e.g., 'whatsapp:+919999999999'
//       body: bodyText,
//       mediaUrl: [pdfUrl], // must be a public link to the PDF
//     });

//     res.status(200).send(`Message sent: ${message.sid}`);
//   } catch (error) {
//     console.error("Error sending WhatsApp message:", error);
//     res.status(500).send("Failed to send WhatsApp message.");
//   }
// };
exports.uploadSiteMapAndCountsPDF = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ObjectId = new Types.ObjectId(id);
    const site = await Site.findById(ObjectId);
    const foundSite = await Site.aggregate([
      {
        $match: {
          _id: ObjectId,
        },
      },
      {
        $lookup: {
          from: "plots",
          localField: "plots",
          foreignField: "_id",
          as: "plots",
        },
      },
      {
        $unwind: "$plots",
      },
      {
        $group: {
          _id: "$plots.plot_status",
          plots: {
            $push: "$plots",
          },
        },
      },
    ]);
    if (!site) return next(new ErrorHandler(404, "Site Not Found"));
    const filePath = path.join(__dirname, "../views", "SiteMapAndCounts.ejs");
    console.log({
      site,
      counts: foundSite,
    });
    const htmlContent = await ejs.renderFile(filePath, {
      data: {
        site,
        counts: foundSite,
      },
    });
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    // const pdfBuffer = await page.pdf({ format: "A4" });

    const screenshot = await page.screenshot({ fullPage: true });
    await browser.close();
    // const compressedBuffer = await sharp(screenshot).resize({ width: 1024 }).jpeg({ quality: 100 }).toBuffer();
    const updloaded = await uploadToCloudinary("siteMap", { buffer: screenshot });
    if (updloaded) {
      site.attachment = { public_id: updloaded?.public_id, url: updloaded?.secure_url };
    }
    site.save();

    // Generate image gallery
    const galleryFilePath = path.join(__dirname, "../views", "SiteImageGallery.ejs");
    const galleryHtmlContent = await ejs.renderFile(galleryFilePath, {
      data: {
        images: site.site_card_image || [],
      },
    });
    const galleryBrowser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });
    const galleryPage = await galleryBrowser.newPage();
    // const imageCount = site.site_card_image ? site.site_card_image.length : 0;
    // const viewportWidth = Math.max(1024, imageCount * 315 + 100); // 300px image + 15px margin + padding
    // await galleryPage.setViewport({ width: viewportWidth, height: 600 });
    await galleryPage.setContent(galleryHtmlContent, { waitUntil: "networkidle0" });
    const galleryScreenshot = await galleryPage.screenshot({ fullPage: true });
    await galleryBrowser.close();
    const galleryUploaded = await uploadToCloudinary("siteGallery", { buffer: galleryScreenshot });
    let galleryLink = null;
    if (galleryUploaded) {
      galleryLink = galleryUploaded.secure_url;
    }

    // Construct the WhatsApp message with location and map link
    const mapLink = site.attachment.url;
    const whatsappMessage =
      `${site.site_name}\n\n` +
      `Location: ${site.location}\n\n` +
      `Site_Map_Link: ${mapLink}\n\n` +
      (galleryLink ? `Site_Images_Gallery: ${galleryLink}` : `Site_Images: ${(site.site_card_image || []).map(img => img.url).filter(Boolean).join("\n")}`);
    res.status(200).json({
      sucess: true,
      message: "File uploaded Successfully",
      data: whatsappMessage,
    });
  } catch (error) {
    next(error);
  }


};

exports.addlandPlot = async (req, res) => {
  try {
    const files = req.files;
    const { site_id } = req.params;
    const {
      plot_no,
      block,
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
    } = req.body;
    const parsed_dimensions = JSON.parse(dimensions);
    const site = await Land.findById(site_id);
    const foundPlot = await Landplot.findOne({ plot_no, site_id });
    if (foundPlot) {
      return res.status(400).json({ message: "Plot Number should be different" });
    }
    if (!site) {
      return res.status(404).json({ message: "Land not Found" });
    }
    let is_booked = false;
    if (plot_status === "Booked") {
      is_booked = true;
    }
    const newPlot = await Landplot.create({
      site_id,
      plot_no,
      block,
      owner,
      mrp,
      direct_price,
      dimensions: parsed_dimensions,
      plot_area,
      plot_sqft,
      road_area,
      plot_cent,
      total_area,
      price_per_sqft,
      plot_status,
      is_initial_booked: is_booked,
    });

    // console.log("DATABASE:", mongoose.connection.name);
    // console.log("COLLECTION:", Landplot.collection.name);
    // console.log("CREATED ID:", newPlot._id);

    const verifyPlot = await Landplot.findById(newPlot._id);

    // console.log("VERIFY FROM DB:", verifyPlot);

    if (req.files["cover_image"]) {
      const converImageFile = req.files["cover_image"][0];
      const uploadResult = await uploader(converImageFile, "plot_cover_images");
      newPlot.cover_image = {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      };
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

      if (req.files["patta_document"]) {
        const pattaFiles = req.files["patta_document"];
        let pattaUrls;
        for (const file of pattaFiles) {
          const uploadResult = await uploader(file, "approval_documents");
          pattaUrls = {
            public_id: uploadResult.public_id,
            url: uploadResult.url,
          };
        }
        newPlot.patta_document = pattaUrls;
      }

      if (files["dtcp_approval"]) {
        const dtcpFiles = files["dtcp_approval"];
        let dtcpUrls;
        for (const file of dtcpFiles) {
          const uploadResult = await uploader(file, "approval_documents");
          dtcpUrls = {
            public_id: uploadResult.public_id,
            url: uploadResult.url,
          };
        }
        newPlot.dtcp_approval = dtcpUrls;
      }

      if (files["layout_approval"]) {
        const layoutFiles = files["layout_approval"];
        let layoutUrls;
        for (const file of layoutFiles) {
          const uploadResult = await uploader(file, "approval_documents");
          layoutUrls = {
            public_id: uploadResult.public_id,
            url: uploadResult.url,
          };
        }
        newPlot.layout_approval = layoutUrls;
      }

      if (files["building_approval"]) {
        const buildingFiles = files["building_approval"];
        let buildingUrls;
        for (const file of buildingFiles) {
          const uploadResult = await uploader(file, "approval_documents");
          buildingUrls = {
            public_id: uploadResult.public_id,
            url: uploadResult.url,
          };
        }
        newPlot.building_approval = buildingUrls;
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
      message: "New Land Plot Created Successfully",
      plot: newPlot,
    });
  } catch (err) {
    console.log("Error Adding Plot:", err);
    res.status(400).json({ success: true, message: "Error Adding Plot", err });
  }
}

exports.getLandplotDetails = async (req, res) => {
  try {
    const getLand = await Landplot.findOne({ _id: req?.body.params?.landId }).populate("site_id");

    if (getLand) {
      res.status(200).json({
        success: true,
        data: getLand,
        message: "Land plot details fetched successfully"
      })
    } else {
      res.status(400).json({
        success: false,
        message: "Unable to fetch land plots"
      })
    }
  } catch (err) {
    res.status(400).json({ success: false, message: "Error on fetching land plot details", err });
  }
}

exports.editLandplot = async (req, res) => {
  try {
    const getLand = await Landplot.findOne({ _id: req?.body.params?.landplotId });
    if (getLand) {
      res.status(200).json({
        success: true,
        data: getLand,
        message: "Land plot details fetched successfully"
      })
    } else {
      res.status(400).json({
        success: false,
        message: "Unable to fetch land plots"
      })
    }
  } catch (err) {
    res.status(400).json({ success: false, message: "Error on fetching land plot details", err });
  }
}

exports.updateLandPlot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const files = req.files;
    const { plot_no, block, owner, dimensions, total_area, price_per_sqft, plot_status, mrp, direct_price, plot_cent, road_area, plot_sqft } = req.body;

    const plot = await Landplot.findById(id);
    if (plot_no !== plot.plot_no) {
      const foundPlot = await Landplot.findOne({ plot_no, site_id: plot.site_id });

      if (foundPlot) {
        return next(new ErrorHandler(400, "Plot Number should be different"));
      }
    }
    if (!plot) {
      return res.status(404).json({ success: false, message: "Plot not found" });
    }

    if (plot_no) plot.plot_no = plot_no;
    if (block) plot.block = block;
    if (owner) plot.owner = owner;
    if (dimensions) plot.dimensions = JSON.parse(dimensions);
    if (total_area) plot.total_area = total_area;
    if (price_per_sqft) plot.price_per_sqft = price_per_sqft;
    if (plot_status) plot.plot_status = plot_status;
    if (mrp) plot.mrp = mrp;
    if (direct_price) plot.direct_price = direct_price;
    if (plot_cent) plot.plot_cent = plot_cent;
    if (road_area) plot.road_area = road_area;
    if (plot_sqft) plot.plot_sqft = plot_sqft;



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
      plot.cover_image = await uploadSingle(files["cover_image"][0], "plot_cover_images");
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

    const approvalFields = ["patta_document", "layout_approval", "building_approval", "dtcp_approval"];
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
    res.status(200).json({ success: true, message: "Land Plot updated successfully", plot });
  } catch (err) {
    console.log("Error Updating Plot:", err);
    res.status(500).json({ success: false, message: "Error Updating plot", err });
  }
};

exports.deleteLandplot = async (req, res) => {
  try {
    const { id } = req?.params
    if (id) {
      const getLand = await Landplot.findByIdAndDelete({ _id: id });
      if (getLand) {
        res.status(200).json({
          success: true,
          message: "Land plot deleted successfully"
        })
      } else {
        res.status(400).json({
          success: false,
          message: "Unable to delete land plots"
        })
      }
    } else {
      res.status(400).json({ success: false, message: "Id not found", err });

    }

  } catch (err) {
    res.status(400).json({ success: false, message: "Error on deleting land plot", err });
  }
}

exports.getAlllandDatas = async (req, res) => {
  try {
    const { site_name } = req.query;

    const filter = {};
    if (site_name) {
      filter.site_name = { $regex: site_name, $options: "i" };
    }
    const sites = await Land.find(filter);
    if (!sites.length) {
      return res.status(404).json({ success: false, message: "No sites found" });
    }

    const siteWithPlotCounts = await Promise.all(
      sites.map(async (site) => {
        const plotCounts = await Landplot.aggregate([
          {
            $match: { site_id: site._id },
          },
          {
            $group: {
              _id: "$plot_status",
              count: { $sum: 1 },
            },
          },
        ]);

        const plotCountObj = { Available: 0, Booked: 0, Sold: 0, Declined: 0 };
        plotCounts.forEach((item) => {
          if (plotCountObj.hasOwnProperty(item._id)) {
            plotCountObj[item._id] = item.count;
          }
        });
        return {
          ...site.toObject(),
          plotCounts: plotCountObj,
        };
      })
    );
    res.status(200).json({
      success: true,
      message: "Get Land Successfully",
      totalSites: siteWithPlotCounts.length,
      sites: siteWithPlotCounts,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: "Failed to fetch land data", err });
  }
};

exports.getByIdLand = async (req, res) => {
  try {
    const site_id = req.params.id;
    const site = await Land.findById(site_id);

    if (!site) {
      return res.status(404).json({ success: false, message: "User not Found" });
    }
    res.status(200).json({ success: true, message: "Land Details", site });
  } catch (err) {
    res.status(400).json({ success: false, message: "Land Not found", err });
  }
};

exports.updateLand = async (req, res) => {
  try {
    const { id } = req.params;
    const { site_name, mobile_no, address, state, city, location, site_incharge_name, survey_no } = req.body;
    const site = await Land.findById(id);
    if (!site) {
      return res.status(404).json({ success: false, message: "Site not Found" });
    }
    const uploadFile = async (file, folder, oldImage) => {
      if (!file) return oldImage;
      if (oldImage?.public_id) {
        await deleteFromCloudinary(oldImage.public_id);
      }
      const uploadResult = await uploadToCloudinary(folder, file);
      return { public_id: uploadResult.public_id, url: uploadResult.secure_url };
    };

    const uploadMultipleFiles = async (files, folder, oldImages) => {
      const newImages = [];
      if (files) {
        for (let i = 0; i < Math.min(files.length, 5); i++) {
          const uploaded = await uploadFile(files[i], folder, null);
          if (uploaded) newImages.push(uploaded);
        }
      }
      // Delete old images if new ones are uploaded
      if (newImages.length > 0 && oldImages) {
        for (const oldImg of oldImages) {
          if (oldImg?.public_id) await deleteFromCloudinary(oldImg.public_id);
        }
      }
      return newImages.length > 0 ? newImages : oldImages;
    };

    site.site_map_image = await uploadFile(req.files?.site_map_image?.[0], "site_images", site.site_map_image);
    site.site_banner = await uploadFile(req.files?.site_banner?.[0], "site_images", site.site_banner);
    site.site_card_image = await uploadMultipleFiles(req.files?.site_card_image, "site_images", site.site_card_image);

    if (site_name) site.site_name = site_name;
    if (mobile_no) site.mobile_no = mobile_no;
    if (address) site.address = address;
    if (state) site.state = state;
    if (city) site.city = city;
    if (site_incharge_name) site.site_incharge_name = site_incharge_name;
    if (survey_no) site.survey_no = survey_no;
    if (location) site.location = location;

    await site.save();
    res.status(200).json({ success: true, message: "Site Updated Successfully", site });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update site" });
  }
};

exports.deleteLand = async (req, res) => {
  try {
    const { id } = req?.params
    if (id) {
      const getLand = await Land.findByIdAndDelete({ _id: id });
      if (getLand) {
        res.status(200).json({
          success: true,
          message: "Land deleted successfully"
        })
      } else {
        res.status(400).json({
          success: false,
          message: "Unable to delete land plots"
        })
      }
    } else {
      res.status(400).json({ success: false, message: "Id not found", err });

    }

  } catch (err) {
    res.status(400).json({ success: false, message: "Error on deleting land", err });
  }
}