const { mongoose, Types } = require("mongoose");
const Site = require("../models/Site");
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
const { uploadToCloudinary } = require("../utils/cloudinary.utils");
dotenv.config();


exports.createSite = async (req, res) => {
  try {
    const { site_name, mobile_no, address, state, city, location,site_incharge_name, survey_no } = req.body;

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

    const site_map_image = await uploadFile(req.files?.site_map_image?.[0], "site_images");
    const site_banner = await uploadFile(req.files?.site_banner?.[0], "site_images");
    const site_card_image = await uploadFile(req.files?.site_card_image?.[0], "site_images");

    const site = new Site({
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
      site_card_image,
    });
    await site.save();
    res.status(200).json({ success: true, message: "Apartment Project registered successfully", site });
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
      return res.status(404).json({ success: false, message: "Apartment Project not Found" });
    }
    res.status(200).json({ success: true, message: "Apartment Project Details", site });
  } catch (err) {
    res.status(400).json({ success: false, message: "Apartment Project Not found", err });
  }
};

exports.getAllSite = async (req, res) => {
  try {
    const { site_name } = req.query;

    const filter = {};
    if (site_name) {
      filter.site_name = { $regex: site_name, $options: "i" };
    }
    const sites = await Site.find(filter);
    if (!sites.length) {
      return res.status(404).json({ success: false, message: "No Apartment Projects found" });
    }

    const siteWithPlotCounts = await Promise.all(
      sites.map(async (site) => {
        const plotCounts = await Plot.aggregate([
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
      message: "Get Apartment Project Successfully",
      totalSites: siteWithPlotCounts.length,
      sites: siteWithPlotCounts,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: "Failed to Get Apartment Project", err });
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
      res.status(404).json({ success: false, message: "No Apartment Projects Found" });
    }
  } catch (err) {
    res.status(404).json({ success: false, message: "Failed to Get Apartment Projects", err });
  }
};

exports.updateSite = async (req, res) => {
  try {
    const { id } = req.params;
    const { site_name, mobile_no, address, state, city,location, site_incharge_name, survey_no } = req.body;
    const site = await Site.findById(id);
    if (!site) {
      return res.status(404).json({ success: false, message: "Apartment Project not Found" });
    }
    const uploadFile = async (file, folder, oldImage) => {
      if (file) {
        if (oldImage?.public_id) {
          await cloudinary.uploader.destroy(oldImage.public_id);
        }
        const uploadResult = await uploader(file, folder);
        return { public_id: uploadResult.public_id, url: uploadResult.secure_url };
      }
      return oldImage;
    };

    site.site_map_image = await uploadFile(req.files?.site_map_image?.[0], "site_images", site.site_map_image);
    site.site_banner = await uploadFile(req.files?.site_banner?.[0], "site_images", site.site_banner);
    site.site_card_image = await uploadFile(req.files?.site_card_image?.[0], "site_images", site.site_card_image);

    if (site_name) site.site_name = site_name;
    if (mobile_no) site.mobile_no = mobile_no;
    if (address) site.address = address;
    if (state) site.state = state;
    if (city) site.city = city;
    if (site_incharge_name) site.site_incharge_name = site_incharge_name;
    if (survey_no) site.survey_no = survey_no;
    if (location) site.location = location;

    await site.save();
    res.status(200).json({ success: true, message: "Apartment Project Updated Successfully", site });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update Apartment Project" });
  }
};

exports.deleteSite = async (req, res) => {
  try {
    const { id } = req.params;
    const site = await Site.findById(id);
    if (!site) {
      return res.status(400).json({ success: false, message: "Apartment Project not found" });
    }
    if (site.image) {
      const public_Id = site.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(public_Id);
    }
    await Site.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Apartment Project Deleted Succesfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to Delete Site" });
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

    if (!site_id || !mongoose.Types.ObjectId.isValid(site_id)) {
      return res.status(400).json({ success: false, message: "Invalid Site ID" });
    }
    const siteObjectId = new mongoose.Types.ObjectId(site_id);
    const matchQuery = {};

    if (search) {
      matchQuery.plot_no = { $regex: search, $options: "i" };
    }

    if (status) {
      matchQuery.plot_status = status;
    }
    const sites = await Site.findById(siteObjectId).populate({
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
    const imageFields = ["site_map_image", "site_banner", "site_card_image"];
    let deleted = false;

    for (const field of imageFields) {
      if (site[field] && site[field].public_id === publicId) {
        await cloudinary.uploader.destroy(publicId);
        site[field] = null;
        deleted = true;
        break;
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
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid Site ID" });
    }
    const ObjectId = new mongoose.Types.ObjectId(id);
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
    const compressedBuffer = await sharp(screenshot).resize({ width: 1024 }).jpeg({ quality: 100 }).toBuffer();
    const updloaded = await uploadToCloudinary("siteMap", { buffer: compressedBuffer });
    if (updloaded) {
      site.attachment = { public_id: updloaded?.public_id, url: updloaded?.secure_url };
    }
    site.save();
    res.status(200).json({
      sucess: true,
      message: "File uploaded Successfully",
      data: updloaded?.secure_url,
    });
  } catch (error) {
    next(error);
  }
};
