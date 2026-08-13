const Purchaserequest = require("../models/Purchaserequest");
const Purchaseorder = require("../models/Purchaseorder");
// NOTE: adjust these two paths/filenames if your actual model files are named differently
const Inventory = require("../models/Inventory");
const Supplier = require("../models/Supplier");
const { generateUniqueNumber } = require("../utils/helpers");
const {
  inventoryServices,
} = require("../services/inventory/inventoryServices");
const path = require("path");
const ejs = require("ejs");
const puppeteer = require("puppeteer");

const PurchaseRequestTransaction = async (req, res) => {
  try {
    if (req?.body?.invid && req?.body?.invid != "") {
      const storeData = await Purchaserequest.findOneAndUpdate(
        { _id: req?.body?.invid },
        {
          $set: {
            products: req?.body?.products,
            remarks: req?.body?.remarks,
          },
        },
      );

      if (storeData) {
        return res.status(200).json({
          success: true,
          message: "Purchase Request Updated",
          data: storeData,
        });
      }
      return res
        .status(400)
        .json({ success: false, message: "Unable to update", data: "" });
    }
    const generateUniqueNum = await generateUniqueNumber();
    payloads = {
      products: req?.body?.products,
      remarks: req?.body?.remarks,
      prnumber: `PR-${generateUniqueNum}`,
      raisedby: req?.user?._id,
    };
    const storeData = await Purchaserequest.create(payloads);
    if (storeData) {
      return res.status(200).json({
        success: true,
        message: "Purchase Request Created",
        data: storeData,
      });
    }
    return res
      .status(400)
      .json({ success: false, message: "Unable to update", data: "" });
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, message: err?.message, data: "" });
  }
};

const PurchaseRequestList = async (req, res) => {
  try {
    const { page, limit, status } = req?.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const matchcase = { status: status, raisedby: req?.user?._id };

    const inventoryUnits = await Purchaserequest.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "raisedby",
          foreignField: "_id",
          as: "raiser",
        },
      },
      {
        $unwind: {
          path: "$raiser",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: matchcase,
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: Number(skip),
      },
      {
        $limit: Number(limit),
      },
    ]);

    const totalCount = await Purchaserequest.countDocuments({});

    if (inventoryUnits.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Purchase Request list fetched",
        data: inventoryUnits,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalItems: totalCount,
          limit: limitNum,
        },
      });
    } else {
      return res
        .status(200)
        .json({ success: false, message: "No data found", data: "" });
    }
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, message: err?.message, data: "" });
  }
};

const PurchaseRequestListApproval = async (req, res) => {
  try {
    const { page, limit, status } = req?.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const matchcase = { status: status };

    const inventoryUnits = await Purchaserequest.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "raisedby",
          foreignField: "_id",
          as: "raiser",
        },
      },
      {
        $unwind: {
          path: "$raiser",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: matchcase,
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: Number(skip),
      },
      {
        $limit: Number(limit),
      },
    ]);

    const totalCount = await Purchaserequest.countDocuments({});

    if (inventoryUnits.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Purchase Request list fetched",
        data: inventoryUnits,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalItems: totalCount,
          limit: limitNum,
        },
      });
    } else {
      return res
        .status(200)
        .json({ success: false, message: "No data found", data: "" });
    }
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, message: err?.message, data: "" });
  }
};

const PurchaseRequestEdit = async (req, res) => {
  try {
    const { id } = req?.body;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Id not found", data: "" });
    }
    const inventoryUnits = await Purchaserequest.findOne({ _id: id }).populate(
      "raisedby",
    );
    if (inventoryUnits) {
      return res.status(200).json({
        success: true,
        message: "Purchase Request fetched successfully",
        data: inventoryUnits,
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Unable to fetch data", data: "" });
    }
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, message: err?.message, data: "" });
  }
};

const PurchaseOrderTransaction = async (req, res) => {
  try {
    if (req?.body?.id && req?.body?.id != "") {
      let totalAmt = 0;

      req?.body?.products?.map((datas) => {
        totalAmt += (Number(datas?.amount) * Number(datas?.quantity))
      })

      const gstAmt = (Number(totalAmt) * Number(req?.body?.prdata?.gstrate)) / 100

      const storeData = await Purchaseorder.findOneAndUpdate(
        { _id: req?.body?.id },
        {
          $set: {
            products: req?.body?.products,
            remarks: req?.body?.prdata?.remarks,
            supplier: req?.body?.prdata?.supplier,
            departure: req?.body?.prdata?.departure,
            status: req?.body?.prdata?.status,
            gstrate: req?.body?.prdata?.gstrate,
            totalamount: totalAmt,
            gstamount: gstAmt
          },
        },
      );

      if (storeData) {
        return res.status(200).json({
          success: true,
          message: "Purchase Order Updated",
          data: storeData,
        });
      }
      return res
        .status(400)
        .json({ success: false, message: "Unable to update", data: "" });
    }
    const generateUniqueNum = await generateUniqueNumber();
    let prDataDB = {};
    if (req?.body?.prId) {
      prDataDB = await Purchaserequest.findOne({ _id: req?.body?.prId });
    }
    let totalAmt = 0;

    req?.body?.products?.map((datas) => {
      totalAmt += (Number(datas?.amount) * Number(datas?.quantity))
    })

    const gstAmt = (Number(totalAmt) * Number(req?.body?.prdata?.gstrate)) / 100


    payloads = {
      products: req?.body?.products,
      remarks: req?.body?.prdata?.remarks,
      supplier: req?.body?.prdata?.supplier,
      departure: req?.body?.prdata?.departure,
      ponumber: `PO-${generateUniqueNum}`,
      raisedby: req?.body?.prdata?.raisedby || req?.user?._id,
      gstrate: req?.body?.prdata?.gstrate,
      totalamount: totalAmt,
      gstamount: gstAmt
    };

    if (req?.body?.prId) {
      payloads.prid = req?.body?.prId;
    }

    const storeData = await Purchaseorder.create(payloads);

    if (storeData) {
      if (req?.body?.prId) {
        prDataDB.status = "Converted";
        const changeStatusPr = prDataDB.save();
      }
      return res.status(200).json({
        success: true,
        message: `PR converted to purchase order - ${storeData?.ponumber}`,
        data: storeData,
      });
    }
    return res
      .status(400)
      .json({ success: false, message: "Unable to convert as PO", data: "" });

    if (storeData) {
      return res.status(200).json({
        success: true,
        message: "Purchase Order Created",
        data: storeData,
      });
    }
    return res
      .status(400)
      .json({ success: false, message: "Unable to create", data: "" });
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, message: err?.message, data: "" });
  }
};

const PurchaseOrderList = async (req, res) => {
  try {
    const { page, limit, status } = req?.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const matchCase = { status: status };
    const inventoryUnits = await Purchaseorder.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "raisedby",
          foreignField: "_id",
          as: "raiser",
        },
      },
      {
        $unwind: {
          path: "$raiser",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: matchCase,
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: Number(skip),
      },
      {
        $limit: Number(limit),
      },
    ]);

    const totalCount = await Purchaseorder.countDocuments({});

    if (inventoryUnits.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Purchase Order list fetched",
        data: inventoryUnits,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalItems: totalCount,
          limit: limitNum,
        },
      });
    } else {
      return res
        .status(200)
        .json({ success: false, message: "No data found", data: "" });
    }
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, message: err?.message, data: "" });
  }
};

const PurchaseOrderEdit = async (req, res) => {
  try {
    const { id } = req?.body;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Id not found", data: "" });
    }
    const inventoryUnits = await Purchaseorder.findOne({ _id: id }).populate(
      "raisedby",
    );
    if (inventoryUnits) {
      return res.status(200).json({
        success: true,
        message: "Purchase Order fetched successfully",
        data: inventoryUnits,
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Unable to fetch data", data: "" });
    }
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, message: err?.message, data: "" });
  }
};

const purchaseReqTopurchaseOdr = async (req, res) => {
  try {
    if (req?.body?.prId && req?.body?.prId != "") {
      const prData = await Purchaserequest.findOne({
        _id: req?.body?.prId,
      }).populate("raisedby");
      if (prData) {
        const generateUniqueNum = await generateUniqueNumber();
        const orderPayload = {
          ponumber: `PO-${generateUniqueNum}`,
          products: req?.body?.products,
          prid: req?.body?.prId,
          supplier: req?.body?.prdata?.supplier?.value,
          remarks: req?.body?.prdata?.remarks,
          departure: req?.body?.prdata?.departure,
        };

        const storePO = await Purchaseorder.create(orderPayload);
        if (storePO) {
          prData.status = "Converted";
          const changeStatusPr = prData.save();
          return res.status(200).json({
            success: true,
            message: `PR converted to purchase order - ${storePO?.ponumber}`,
            data: storePO,
          });
        }
        return res.status(400).json({
          success: false,
          message: "Unable to convert as PO",
          data: "",
        });
      }
      return res
        .status(400)
        .json({ success: false, message: "PR not found", data: "" });
    }
    return res
      .status(400)
      .json({ success: false, message: "PR id required", data: "" });
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, message: err?.message, data: "" });
  }
};

const prStatusUpdate = async (req, res) => {
  try {
    const { id } = req?.body;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Id not found", data: "" });
    }
    const inventoryUnits = await Purchaserequest.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          status: "Rejected",
        },
      },
    );

    if (inventoryUnits) {
      return res.status(200).json({
        success: true,
        message: "Status changed successfully",
        data: "",
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Unable to fetch data", data: "" });
    }
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, message: err?.message, data: "" });
  }
};

const poStatusUpdate = async (req, res) => {
  try {
    const { id } = req?.body;
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Id not found", data: "" });
    }
    const inventoryUnits = await Purchaseorder.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          status: "Completed",
        },
      },
      { new: true },
    );

    if (inventoryUnits) {
      const recordInv = await inventoryServices(
        inventoryUnits?.products,
        "add",
      );

      return res.status(200).json({
        success: true,
        message: "Status changed successfully",
        data: "",
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Unable to fetch data", data: "" });
    }
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, message: err?.message, data: "" });
  }
};

// ---------------------------------------------------------------------
// Small helper: converts a number to words (Indian numbering system)
// used for "Amount Chargeable (in words)" on the PDF.
// ---------------------------------------------------------------------
const numberToWordsIndian = (num) => {
  const a = [
    "",
    "ONE",
    "TWO",
    "THREE",
    "FOUR",
    "FIVE",
    "SIX",
    "SEVEN",
    "EIGHT",
    "NINE",
    "TEN",
    "ELEVEN",
    "TWELVE",
    "THIRTEEN",
    "FOURTEEN",
    "FIFTEEN",
    "SIXTEEN",
    "SEVENTEEN",
    "EIGHTEEN",
    "NINETEEN",
  ];
  const b = [
    "",
    "",
    "TWENTY",
    "THIRTY",
    "FORTY",
    "FIFTY",
    "SIXTY",
    "SEVENTY",
    "EIGHTY",
    "NINETY",
  ];

  const numToWords = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return (b[Math.floor(n / 10)] + " " + a[n % 10]).trim();
    if (n < 1000)
      return (
        a[Math.floor(n / 100)] +
        " HUNDRED " +
        numToWords(n % 100)
      ).trim();
    return "";
  };

  let n = Math.floor(Number(num) || 0);
  if (n === 0) return "ZERO";

  let result = "";

  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const hundred = n;

  if (crore) result += numToWords(crore) + " CRORE ";
  if (lakh) result += numToWords(lakh) + " LAKH ";
  if (thousand) result += numToWords(thousand) + " THOUSAND ";
  if (hundred) result += numToWords(hundred);

  return result.trim();
};

// ---------------------------------------------------------------------
// Formats a date as DD.MM.YYYY, e.g. 28.07.2026, matching the PO layout.
// ---------------------------------------------------------------------
const formatDateDDMMYYYY = (dateValue) => {
  const d = new Date(dateValue);
  if (isNaN(d.getTime())) return "";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}.${month}.${year}`;
};

// ---------------------------------------------------------------------
// Fixed company details. These are the same on every Purchase Order
// (they describe our own company, not the supplier), so they are not
// pulled from the order document — only the supplier and items change
// per PO.
// ---------------------------------------------------------------------
const FIXED_INVOICE_TO = {
  name: "SREE LAKSHMI NARAYANA CONSTRUCTIONS P LTD",
  address: "CORP OFF ADD : 338, D B ROAD, R S PURAM, COIMBATORE - 641002",
  gstin: "33AAQCS6100A1ZU",
  stateName: "Tamil Nadu",
  stateCode: "33",
};

const FIXED_CONSIGNEE = {
  name: "SREE LAKSHMI NARAYANA CONSTRUCTIONS P LTD",
  address: "SHREYAAVAAS VISALAKSHIPURAM,BIBIKULAM, MADURAI - 625014.",
  mobile: "9677740150, 9443047147",
  gstin: "33AAQCS6100A1ZU",
  stateName: "Tamil Nadu",
  stateCode: "33",
};

const mapOrderToTemplatePO = async (order) => {
  const products = Array.isArray(order?.products) ? order.products : [];

  // Look up every referenced inventory item (product) in one query,
  // pulling in its unit (e.g. "KG") too.
  const stockIds = products.map((p) => p?.stock).filter(Boolean);

  const stocks = stockIds.length
    ? await Inventory.find({ _id: { $in: stockIds } }).populate("unit")
    : [];

  const stockMap = {};
  stocks.forEach((s) => {
    stockMap[s._id.toString()] = s;
  });

  // Look up the supplier referenced on the order.
  const supplierDoc = order?.supplier
    ? await Supplier.findById(order.supplier)
    : null;

  const items = products.map((p, idx) => {
    const stockDoc = p?.stock ? stockMap[p.stock.toString()] : null;

    const quantity = Number(p?.quantity ?? 0);
    // No price field exists on Inventory yet - falls back to 0 unless
    // a price was stored directly on the order line item.
    const offerPrice = Number(p?.amount ?? p?.amount ?? p?.amount ?? 0);
    const amount =
      p?.amount !== undefined && p?.amount !== null
        ? Number(p.amount)
        : quantity * offerPrice;

    return {
      slNo: idx + 1,
      description: stockDoc?.inventoryname || "",
      unit: stockDoc?.unit?.units || "",
      quantity,
      offerPrice,
      amount,
      details: p?.remarks ? [p.remarks] : [],
    };
  });

  const subTotal = order?.totalamount;
  const gstRate = Number(order?.gstrate ?? "");
  const gstAmount =
    order?.gstamount !== undefined && order?.gstamount !== null
      ? Number(order.gstamount)
      : Number(((subTotal * gstRate) / 100).toFixed(2));
  const grandTotal =
    order?.grandTotal !== undefined && order?.grandTotal !== null
      ? Number(order.grandTotal)
      : Number((subTotal + gstAmount).toFixed(2));

  return {
    voucherNo: order?.ponumber || order?._id?.toString() || "",
    date: order?.createdAt ? formatDateDDMMYYYY(order.createdAt) : "",
    paymentTerms: order?.paymentTerms || "CREDIT",
    referenceNo: order?.referenceNo || order?.ponumber || "",
    otherReferences: order?.otherReferences || "",
    dispatchThrough: order?.dispatchThrough || "",
    destination: order?.destination || order?.departure || "",

    invoiceTo: FIXED_INVOICE_TO,

    consignee: FIXED_CONSIGNEE,

    supplier: {
      name: supplierDoc?.suppliername || "",
      address: supplierDoc?.address || "",
      email: supplierDoc?.email || "",
      mobile: supplierDoc?.contactnumber || "",
      gstin: supplierDoc?.gstin || "",
      stateName: supplierDoc?.stateName || "",
      stateCode: supplierDoc?.stateCode || "",
    },

    items,

    subTotal,
    gstRate,
    gstAmount,
    grandTotal,
    amountInWords: numberToWordsIndian(grandTotal),
  };
};

const generatePurchaseOrderPDF = async (req, res) => {
  try {
    const { id } = req?.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Purchase order id required",
        data: "",
      });
    }

    const order = await Purchaseorder.findOne({ _id: id }).populate("raisedby");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Purchase order not found",
        data: "",
      });
    }

    const po = await mapOrderToTemplatePO(order);

    const html = await ejs.renderFile(
      path.join(__dirname, "../views/purchase-order.ejs"),
      {
        po,
      },
    );

    // Launch browser
    const browser = await puppeteer.launch({
      headless: true,

      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // Set A4 viewport
    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 1,
    });

    await page.setContent(html, {
      waitUntil: "networkidle0",
    });

    // Generate PDF
    const pdf = await page.pdf({
      format: "A4",

      printBackground: true,

      preferCSSPageSize: true,

      margin: {
        top: "8mm",
        right: "8mm",
        bottom: "8mm",
        left: "8mm",
      },
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",

      "Content-Disposition": `attachment; filename=PO-${po.voucherNo}.pdf`,

      "Content-Length": pdf.length,
    });

    res.end(pdf);
  } catch (error) {
    console.error("Purchase Order PDF Error:", error);

    res.status(500).json({
      success: false,

      message: "Failed to generate Purchase Order PDF",

      error: error.message,
    });
  }
};

module.exports = {
  PurchaseRequestTransaction,
  PurchaseRequestList,
  PurchaseOrderTransaction,
  PurchaseRequestEdit,
  PurchaseOrderList,
  PurchaseOrderEdit,
  purchaseReqTopurchaseOdr,
  PurchaseRequestListApproval,
  prStatusUpdate,
  poStatusUpdate,
  generatePurchaseOrderPDF,
};
