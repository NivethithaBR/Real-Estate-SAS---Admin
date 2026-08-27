const Client = require("../models/Client");
const Plot = require("../models/Plot");
const Landplot = require("../models/Landplot");
const Land = require("../models/Land");
const Booked = require("../models/Booked");
const Bookedland = require("../models/Bookedland");
const Bought = require("../models/Bought");
const Registrationland = require("../models/Registrationland")
const { uploader, deleteFromCloudinary } = require("../utils/helpers");
const { Types } = require("mongoose");
const { default: mongoose } = require("mongoose");
const ErrorHandler = require("../utils/ErrorHandler");
const Registration = require("../models/Registration");
const booking_model = require("../models/Booking.model");
const Bookingland_model = require("../models/Bookingland.model");
const team_model = require("../models/Team.model");
const followup_model = require("../models/Followups.model");
const Boughtland = require("../models/Boughtland")


const status = [
  "First Installment",
  "Second Installment",
  "Third Installment",
  "Fourth Installment",
  "Fifth Installment",
];

const professionals = [
  {
    type: "Golden Director",
    percentage: 13,
  },
  {
    type: "Senior Director",
    percentage: 12,
  },
  {
    type: "Director",
    percentage: 10,
  },
  {
    type: "Branch Manager",
    percentage: 8,
  },
  {
    type: "Manager",
    percentage: 5,
  },
  {
    type: "Assistant Manager",
    percentage: 3,
  },
  {
    type: "Telecalling",
    percentage: 1,
  },
];
exports.getClientById = async (req, res) => {
  try {
    let client;
    client = await Bought.findById(req.params.id);
    if (!client) {
      client = await Booked.findById(req.params.id).populate("booking_id");
    }
    if (!client) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }
    res.status(200).json({
      success: true,
      message: "Client Retrieve successfully",
      client,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error getting Client", err });
  }
};

exports.getlandClientById = async (req, res) => {
  try {
    let client;
    client = await Boughtland.findById(req.params.id);
    if (!client) {
      client = await Bookedland.findById(req.params.id).populate("booking_id");
    }
    if (!client) {
      return res.status(404).json({ success: false, message: "Client not found" });
    }
    res.status(200).json({
      success: true,
      message: "Client Retrieve successfully",
      client,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error getting Client", err });
  }
};

exports.updateClient = async (req, res, next) => {
  try {
    const client_id = req.params.id;
    const {
      plot_id,
      site_id,
      registration_date,
      payment_mode,
      registration_cost,
      received_amount,
      installment_status,
      token_advance,
      registered_by,
      payment_type,
    } = req.body;
    const files = req.files;
    const newFiles = {};
    const data = { ...req.body };
    if (
      !client_id ||
      !mongoose.Types.ObjectId.isValid(client_id) ||
      !plot_id ||
      !mongoose.Types.ObjectId.isValid(plot_id)
    ) {
      return next(new ErrorHandler(400, "Client id and Plot id is Required"));
    }
    console.log(client_id, plot_id);

    const clientObjectId = new mongoose.Types.ObjectId(client_id);
    const plotObjectId = new mongoose.Types.ObjectId(plot_id);
    const foundClient = await Booked.findById(clientObjectId);
    const foundPlot = await Plot.findById(plotObjectId);

    const founTeam = await team_model.findOne({ group_name: foundClient?.team });
    let booking;
    let client;
    if (!foundClient) {
      return res.status(404).json({ success: false, message: "Client not Found" });
    }

    if (!foundPlot) {
      return res.status(404).json({ success: false, message: "Plot not Found" });
    }

    const handleFileUpload = async (key, folder) => {
      if (files[key] && files[key][0]) {
        if (foundClient[key]?.url) {
          await deleteFromCloudinary(foundClient[key].url);
        }

        const uploadResult = await uploader(files[key][0], folder);
        newFiles[key] = {
          public_id: uploadResult.public_id,
          url: uploadResult.secure_url,
        };
      }
    };

    await handleFileUpload("aadhar_card", "aadhar_cards");
    await handleFileUpload("pan_card", "pan_cards");
    await handleFileUpload("bank_passbook", "bank_passbook");
    await handleFileUpload("income_proof", "income_proof");
    await handleFileUpload("loan_approval_letter", "loan_approval_letter");

    if (installment_status === "Token Advance" && token_advance > 0) {
      const query = foundClient?.booking_id ? { _id: foundClient.booking_id } : {};

      booking = await booking_model.findOneAndUpdate(
        query,
        {
          client_name: req.body.client_name || "",
          contact_no: req.body.contact_no || 0,
          email_id: req.body.email_id || "",
          address: req.body.address || "",
          state: req.body.state || "",
          remarks: req.body.remarks || "",
          location: req.body.city || "",
          amount: token_advance,
          payment_type,
          plot_id: plot_id,
          site_id: foundPlot?.site_id,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    if (payment_mode !== "Full Payment") {
      console.log("payment mode came")
      await Booked.findByIdAndUpdate(clientObjectId, data, { new: true });
      client = await Booked.findById(clientObjectId);

      if (booking) {
        client.booking_id = booking._id;
      }
      if (payment_mode === "EMI" && installment_status === "EMI") {
        console.log("payment mode came emi")
        client.emi_details.push({ amount: received_amount, date: Date.now(), payment_type });
        console.log("payment mode came emidone")
      }
      if (payment_mode === "Installment" && status.includes(installment_status)) {
        console.log("came here always")
        client.installment_details.push({
          status: installment_status,
          amount: received_amount,
          date: Date.now(),
          payment_type,
        });
      }
      await client.save();
      // console.log("came here always save",installment_status, status)

    }
    if (payment_mode === "Full Payment" && installment_status !== "Fully Paid") {
      foundClient.set({
        ...req.body,
        payment_mode: "Full Payment",
        overAllGivenAmount: received_amount,
        full_payment_type: payment_type,
      });
      await foundClient.save();
    }
    if (payment_mode === "Full Payment" && installment_status === "Fully Paid") {
      res.status(400).json({
        success: false,
        message: "Try making payment in instalments",
      });
    }
    console.log(installment_status, registration_cost, registration_date, registered_by, "tryhere")
    if (installment_status === "Fully Paid" && (!registration_cost || !registration_date || !registered_by)) {
      if (!registration_cost) {
        return res.status(400).json({
          success: false,
          message: "Provide Registration cost"
        })
      }
      if (!registration_date) {
        return res.status(400).json({
          success: false,
          message: "Provide Registration date"
        })
      }
      if (!registered_by) {
        return res.status(400).json({
          success: false,
          message: "Provide Registered By"
        })
      }
    }
    if (installment_status === "Fully Paid" && registration_cost && registration_date && registered_by) {
      let percentages;
      let commissionPRCG = 13;
      let mrp = foundPlot?.mrp;

      // if (foundClient?.isMrpModified) {
      //   percentages = foundClient.professionalsPercentages;
      //   commissionPRCG = foundClient.commissionPercentage;
      //   mrp = foundClient?.modified_mrp;
      // } else {
      //   percentages = professionals;
      // }
      // console.log("isMRPmodified", foundClient.isMrpModified);
      // console.log("mrp", mrp);
      // console.log(percentages);
      // console.log("typeof", typeof percentages?.[0]?.percentage);

      // const modified = percentages?.map((data) => {
      //   let amount = (Number(mrp) / 100) * Number(data?.percentage);
      //   return { ...data, amount };
      // });
      // console.log("modified", modified);

      // const index = percentages?.findIndex((value) => value?.type === foundClient?.professional);
      // console.log("index", index);

      // const firstFiltered = modified?.slice(0, index + 1);
      // const remaings = modified?.slice(index + 1);

      // const professionals_key = [
      //   "golden_director",
      //   "senior_director",
      //   "director",
      //   "branch_manager",
      //   "manager",
      //   "assistant_manager",
      //   "telecalling",
      // ];
      // console.log("firstFiltered", firstFiltered);
      // console.log("remaings", remaings);

      // const result = firstFiltered
      //   .reduceRight((acc, value) => {
      //     if (acc.length === 0) {
      //       acc.push({ ...value, amt: value.amount });
      //     } else {
      //       const prev = acc[acc.length - 1];
      //       const amt = value.amount - prev.amount;
      //       console.log(amt);
      //       acc.push({ ...value, amt: amt });
      //     }
      //     return acc;
      //   }, [])
      //   .reverse();

      // console.log("result", result);

      // const remaingsWithZero = remaings?.map((remain) => ({ ...remain, amt: 0 }));

      // const finalResult = result
      //   .concat(remaingsWithZero)
      //   .map((data, index) => ({ ...data, name: founTeam[professionals_key[index]] }));
      // client = await Booked.findById(clientObjectId);

      // if (payment_mode === "EMI") {
      //   console.log("payment mode came emi")
      //   client.emi_details.push({ amount: received_amount, date: Date.now(), payment_type });
      //   console.log("payment mode came emidone")
      // }
      // if (payment_mode === "Installment") {
      //   console.log("came here always")
      //   client.installment_details.push({
      //     status: installment_status,
      //     amount: received_amount,
      //     date: Date.now(),
      //     payment_type,
      //   });
      // }
      // await client.save()

      const newRegistration = await Registration.create({
        client_name: req.body.client_name,
        contact_no: req.body.contact_no,
        location: req.body.city,
        amount: req.body.registration_cost,
        date: req.body.registration_date,
        site_id: site_id,
        plot_id: plot_id,
        payment_type,
      });

      const commission_amount = (Number(foundClient?.overAllGivenAmount) / 100) * Number(commissionPRCG);
      let remainingWithCommission = foundClient?.overAllGivenAmount - commission_amount;
      let remainingWithDP = remainingWithCommission - Number(foundPlot?.direct_price);
      console.log("remainingWithDP1", remainingWithDP, remainingWithCommission, foundPlot?.direct_price);

      if (registered_by === "Us") {
        remainingWithDP -= Number(registration_cost);
      }
      console.log("commission_amount", commission_amount);
      console.log("remainingWithDP", remainingWithDP);

      if (payment_mode === "EMI") {
        console.log("payment mode came emi")
        foundClient.emi_details.push({ amount: received_amount, date: Date.now(), payment_type });
        console.log("payment mode came emidone")
      }
      if (payment_mode === "Installment") {
        console.log("came here always")
        foundClient.installment_details.push({
          status: installment_status,
          amount: received_amount,
          date: Date.now(),
          payment_type,
        });
      }
      if (payment_mode !== "Full Payment" && installment_status === "Fully Paid") {
        foundClient.set({
          ...req.body,
          overAllGivenAmount: received_amount,
          full_payment_type: payment_type,
          pending_amount: Number(foundClient?.pending_amount) - Number(received_amount)
        });
      }


      // await foundClient.save()
      await Bought.create({
        ...foundClient.toObject(),
        registration_id: newRegistration._id,
        registration_cost,
        registration_date,
        registered_by,
        // commission_distributed: finalResult,
        commission: commission_amount,
        revenue: remainingWithDP,
      });
      foundPlot.plot_status = "Sold";




      foundPlot.save();
      await Booked.findByIdAndDelete(clientObjectId);
    }


    res.status(200).json({
      success: true,
      message: "Client updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.updatelandClient = async (req, res, next) => {
  try {
    const client_id = req.params.id;
    const {
      plot_id,
      site_id,
      registration_date,
      payment_mode,
      registration_cost,
      received_amount,
      installment_status,
      token_advance,
      registered_by,
      payment_type,
    } = req.body;
    console.log(installment_status, "installment_status")
    const files = req.files;
    const newFiles = {};
    const data = { ...req.body };
    if (
      !client_id ||
      !mongoose.Types.ObjectId.isValid(client_id) ||
      !plot_id ||
      !mongoose.Types.ObjectId.isValid(plot_id)
    ) {
      return next(new ErrorHandler(400, "Client id and Plot id is Required"));
    }
    // console.log(client_id, plot_id);

    const clientObjectId = new mongoose.Types.ObjectId(client_id);
    const plotObjectId = new mongoose.Types.ObjectId(plot_id);
    const foundClient = await Bookedland.findById(clientObjectId);
    const foundPlot = await Landplot.findById(plotObjectId);

    const founTeam = await team_model.findOne({ group_name: foundClient?.team });
    let booking;
    let client;
    if (!foundClient) {
      return res.status(404).json({ success: false, message: "Client not Found" });
    }

    if (!foundPlot) {
      return res.status(404).json({ success: false, message: "Plot not Found" });
    }

    const handleFileUpload = async (key, folder) => {
      if (files[key] && files[key][0]) {
        if (foundClient[key]?.url) {
          await deleteFromCloudinary(foundClient[key].url);
        }

        const uploadResult = await uploader(files[key][0], folder);
        newFiles[key] = {
          public_id: uploadResult.public_id,
          url: uploadResult.secure_url,
        };
      }
    };

    await handleFileUpload("aadhar_card", "aadhar_cards");
    await handleFileUpload("pan_card", "pan_cards");
    await handleFileUpload("bank_passbook", "bank_passbook");
    await handleFileUpload("income_proof", "income_proof");
    await handleFileUpload("loan_approval_letter", "loan_approval_letter");

    if (installment_status === "Token Advance" && token_advance > 0) {
      const query = foundClient?.booking_id ? { _id: foundClient.booking_id } : {};

      booking = await Bookingland_model.findOneAndUpdate(
        query,
        {
          client_name: req.body.client_name || "",
          contact_no: req.body.contact_no || 0,
          email_id: req.body.email_id || "",
          address: req.body.address || "",
          state: req.body.state || "",
          remarks: req.body.remarks || "",
          location: req.body.city || "",
          amount: token_advance,
          payment_type,
          plot_id: plot_id,
          site_id: foundPlot?.site_id,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    if (payment_mode !== "Full Payment") {
      await Bookedland.findByIdAndUpdate(clientObjectId, data, { new: true });
      client = await Bookedland.findById(clientObjectId);

      if (booking) {
        client.booking_id = booking._id;
      }
      if (payment_mode === "EMI" && installment_status === "EMI") {
        client.emi_details.push({ amount: received_amount, date: Date.now(), payment_type });
      }
      if (payment_mode === "Installment" && status.includes(installment_status)) {
        client.installment_details.push({
          status: installment_status,
          amount: received_amount,
          date: Date.now(),
          payment_type,
        });
      }
      await client.save();
    }
    if (payment_mode === "Full Payment" && installment_status !== "Fully Paid") {
      foundClient.set({
        ...req.body,
        payment_mode: "Full Payment",
        overAllGivenAmount: received_amount,
        full_payment_type: payment_type,
      });
      await foundClient.save();
    }
    if (payment_mode === "Full Payment" && installment_status === "Fully Paid") {
      res.status(400).json({
        success: false,
        message: "Try making payment in instalments",
      });
    }
    if (installment_status === "Fully Paid" && (!registration_cost || !registration_date || !registered_by)) {
      if (!registration_cost) {
        return res.status(400).json({
          success: false,
          message: "Provide Registration cost"
        })
      }
      if (!registration_date) {
        return res.status(400).json({
          success: false,
          message: "Provide Registration date"
        })
      }
      if (!registered_by) {
        return res.status(400).json({
          success: false,
          message: "Provide Registered By"
        })
      }
    }
    if (installment_status === "Fully Paid" && registration_cost && registration_date && registered_by) {
      let percentages;
      let commissionPRCG = 13;
      let mrp = foundPlot?.mrp;

      // if (foundClient?.isMrpModified) {
      //   percentages = foundClient.professionalsPercentages;
      //   commissionPRCG = foundClient.commissionPercentage;
      //   mrp = foundClient?.modified_mrp;
      // } else {
      //   percentages = professionals;
      // }
      // console.log("isMRPmodified", foundClient.isMrpModified);
      // console.log("mrp", mrp);
      // console.log(percentages);
      // console.log("typeof", typeof percentages?.[0]?.percentage);

      // const modified = percentages?.map((data) => {
      //   let amount = (Number(mrp) / 100) * Number(data?.percentage);
      //   return { ...data, amount };
      // });
      // console.log("modified", modified);

      // const index = percentages?.findIndex((value) => value?.type === foundClient?.professional);
      // console.log("index", index);

      // const firstFiltered = modified?.slice(0, index + 1);
      // const remaings = modified?.slice(index + 1);

      // const professionals_key = [
      //   "golden_director",
      //   "senior_director",
      //   "director",
      //   "branch_manager",
      //   "manager",
      //   "assistant_manager",
      //   "telecalling",
      // ];
      // console.log("firstFiltered", firstFiltered);
      // console.log("remaings", remaings);

      // const result = firstFiltered
      //   .reduceRight((acc, value) => {
      //     if (acc.length === 0) {
      //       acc.push({ ...value, amt: value.amount });
      //     } else {
      //       const prev = acc[acc.length - 1];
      //       const amt = value.amount - prev.amount;
      //       console.log(amt);
      //       acc.push({ ...value, amt: amt });
      //     }
      //     return acc;
      //   }, [])
      //   .reverse();

      // console.log("result", result);

      // const remaingsWithZero = remaings?.map((remain) => ({ ...remain, amt: 0 }));

      // const finalResult = result
      //   .concat(remaingsWithZero)
      //   .map((data, index) => ({ ...data, name: founTeam[professionals_key[index]] }));

      const newRegistration = await Registrationland.create({
        client_name: req.body.client_name,
        contact_no: req.body.contact_no,
        location: req.body.city,
        amount: req.body.registration_cost,
        date: req.body.registration_date,
        site_id: site_id,
        plot_id: plot_id,
        payment_type,
      });

      const commission_amount = (Number(foundClient?.overAllGivenAmount) / 100) * Number(commissionPRCG);
      let remainingWithCommission = foundClient?.overAllGivenAmount - commission_amount;
      let remainingWithDP = remainingWithCommission - Number(foundPlot?.direct_price);
      if (registered_by === "Us") {
        remainingWithDP -= Number(registration_cost);
      }
      console.log("commission_amount", commission_amount);
      console.log("remainingWithDP", remainingWithDP);

      if (payment_mode === "EMI") {
        console.log("payment mode came emi")
        foundClient.emi_details.push({ amount: received_amount, date: Date.now(), payment_type });
        console.log("payment mode came emidone")
      }
      if (payment_mode === "Installment") {
        console.log("came here always")
        foundClient.installment_details.push({
          status: installment_status,
          amount: received_amount,
          date: Date.now(),
          payment_type,
        });
      }

      if (payment_mode !== "Full Payment" && installment_status === "Fully Paid") {
        foundClient.set({
          ...req.body,
          overAllGivenAmount: received_amount,
          full_payment_type: payment_type,
          pending_amount: Number(foundClient?.pending_amount) - Number(received_amount)
        });
      }

      await Boughtland.create({
        ...foundClient.toObject(),
        registration_id: newRegistration._id,
        registration_cost,
        registration_date,
        registered_by,
        // commission_distributed: finalResult,
        commission: commission_amount,
        revenue: remainingWithDP,
      });
      foundPlot.plot_status = "Sold";
      foundPlot.save();
      await Bookedland.findByIdAndDelete(clientObjectId);
    }


    res.status(200).json({
      success: true,
      message: "Client updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

exports.getBookedClients = async (req, res) => {
  try {
    const { page, limit, search } = req.query;

    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * pageSize;

    let filter = { status: "Booked" };
    if (search) {
      filter.client_name = { $regex: search, $options: "i" };
    }

    const totalBookings = await Client.countDocuments(filter);

    const bookedClients = await Client.find(filter)
      .select("client_name contact_no address status site_id plot_id")
      .populate("site_id", "site_name")
      .populate("plot_id", "plot_no")
      .skip(skip)
      .limit(pageSize)
      .sort({ booking_date: -1 });

    if (!bookedClients.length) {
      return res.status(404).json({ success: false, message: "No booked clients found" });
    }

    const formattedData = bookedClients.map((client) => ({
      client_name: client.client_name,
      contact_no: client.contact_no,
      location: client.address,
      site_name: client.site_id?.site_name || "N/A",
      plot_no: client.plot_id?.plot_no || "N/A",
      status: client.status,
    }));

    res.status(200).json({
      success: true,
      message: "Booked Clients retrieved successfully",
      totalBookings,
      totalPages: Math.ceil(totalBookings / pageSize),
      currentPage: pageNumber,
      data: formattedData,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching booked clients",
      error: err.message,
    });
  }
};

exports.bookPlot = async (req, res, next) => {
  try {
    const { payment_mode, token_advance, team, professional, payment_type, installment_status, received_amount } =
      req.body;
    const { site_id, plot_id } = req.query;

    const plot = await Plot.findById(plot_id);

    if (!plot) {
      return res.status(404).json({ success: false, message: "Plot not found!" });
    }
    if (plot.plot_status !== "Available") {
      return res.status(400).json({ success: false, message: "Plot is already booked or sold!" });
    }

    let newClient = {};
    let booking;
    const files = req.files;

    let uploadedFiles = {
      aadhar_card: { public_id: "", url: "" },
      pan_card: { public_id: "", url: "" },
      bank_passbook: { public_id: "", url: "" },
      income_proof: { public_id: "", url: "" },
      loan_approval_letter: { public_id: "", url: "" },
    };

    const uploadFile = async (file, folder) => {
      const uploadResult = await uploader(file, folder);
      return {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      };
    };
    if (files) {
      if (files["aadhar_card"]) {
        uploadedFiles.aadhar_card = await uploadFile(files["aadhar_card"][0], "aadhar_cards");
      }
      if (files["pan_card"]) {
        uploadedFiles.pan_card = await uploadFile(files["pan_card"][0], "pan_cards");
      }
      if (files["bank_passbook"]) {
        uploadedFiles.bank_passbook = await uploadFile(files["bank_passbook"][0], "bank_passbook");
      }
      if (files["income_proof"]) {
        uploadedFiles.income_proof = await uploadFile(files["income_proof"][0], "income_proof");
      }
      if (files["loan_approval_letter"]) {
        uploadedFiles.loan_approval_letter = await uploadFile(files["loan_approval_letter"][0], "loan_approval_letter");
      }
    }

    if (installment_status === "Token Advance" && Number(token_advance) > 0) {
      booking = await booking_model.create({
        client_name: req.body.client_name || "",
        contact_no: req.body.contact_no || 0,
        email_id: req.body.email_id || "",
        address: req.body.address || "",
        state: req.body.state || "",
        remarks: req.body.remarks || "",
        location: req.body.city || "",
        amount: req.body.token_advance,
        payment_type,
        assigned_to: req?.body?.assigned_to,
        site_id: site_id,
        plot_id: plot_id,
      });
    }

    if (payment_mode !== "Full Payment") {
      newClient = await Booked.create({
        ...req.body,
        aadhar_card: uploadedFiles.aadhar_card,
        pan_card: uploadedFiles.pan_card,
        bank_passbook: uploadedFiles.bank_passbook,
        income_proof: uploadedFiles.income_proof,
        loan_approval_letter: uploadedFiles.loan_approval_letter,
        team,
        modified_mrp: req.body.mrp,
        professional,
        site_id,
        plot_id,
      });

      if (booking) {
        newClient.booking_id = booking._id;
      }
      if (payment_mode === "EMI" && installment_status === "EMI") {
        newClient.emi_details.push({ amount: received_amount, date: Date.now(), payment_type });
      }
      if (payment_mode === "Installment" && status.includes(installment_status)) {
        newClient.installment_details.push({
          status: installment_status,
          amount: received_amount,
          date: Date.now(),
          payment_type,
        });
      }

      await newClient.save();
    } else {
      if (Number(plot.mrp) !== Number(received_amount) + Number(token_advance)) {
        return next(new ErrorHandler(400, "Payment is not equal to mrp"));
      }

      if (payment_mode === "Full Payment" && installment_status !== "Fully Paid") {
        newClient = await Booked.create({
          ...req.body,
          aadhar_card: uploadedFiles.aadhar_card,
          pan_card: uploadedFiles.pan_card,
          bank_passbook: uploadedFiles.bank_passbook,
          income_proof: uploadedFiles.income_proof,
          loan_approval_letter: uploadedFiles.loan_approval_letter,
          overAllGivenAmount: received_amount,
          team,
          full_payment_type: payment_type,
          professional,
          site_id,
          plot_id,
        });
        await newClient.save();


      }

      if (payment_mode === "Full Payment" && installment_status === "Fully Paid") {
        return res.status(400).json({
          success: false,
          message: "Try making payment in instalments"
        })
      }

    }

    await Plot.findByIdAndUpdate(plot_id, {
      plot_status: "Booked",
      client_id: newClient._id,
    });

    res.status(201).json({
      success: true,
      message: "Plot booked successfully!",
      client: newClient,
    });
  } catch (err) {
    next(err);
  }
};

//Get All Booked Collection - Pagination
exports.searchBooked = async (req, res) => {
  try {
    let { page = 1, limit = 10, site_id, plot_id, status } = req.query;
    let skip = (Number(page) - 1) * Number(limit);
    const parsedStatus = JSON.parse(status);

    const matchStage = {
      $expr: {
        $and: [],
      },
    };
    if (parsedStatus?.length > 0) {
      matchStage.$expr.$and.push({
        $in: ["$installment_status", parsedStatus],
      });
    }

    if (site_id) {
      matchStage.$expr.$and.push({
        $eq: ["$site_id", new Types.ObjectId(site_id)],
      });
    }

    if (plot_id) {
      matchStage.$expr.$and.push({
        $eq: ["$plot_id", new Types.ObjectId(plot_id)],
      });
    }
    const filteredBookeds = await Booked.aggregate([
      {
        $facet: {
          count: [
            {
              $count: "totalCounts",
            },
          ],
          data: [
            {
              $match: matchStage,
            },
            {
              $lookup: {
                from: "sites",
                localField: "site_id",
                foreignField: "_id",
                as: "site",
              },
            },
            {
              $lookup: {
                from: "plots",
                localField: "plot_id",
                foreignField: "_id",
                as: "plot",
              },
            },
            {
              $unwind: {
                path: "$site",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $unwind: {
                path: "$plot",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $skip: skip,
            },
            {
              $limit: Number(limit),
            },
          ],
        },
      },
    ]);
    const totalCount = filteredBookeds?.[0]?.count?.[0]?.totalCounts || 0;
    const data = filteredBookeds?.[0]?.data || [];

    res.status(200).json({
      success: true,
      message: "Filtered Booked Plots Fetch Successfully",
      totalCount,
      filteredBookeds,
      filteredCount: data.length,
      data,
    });
  } catch (err) {
    console.error("Error fetching booked plots:", err);
    res.status(500).json({ success: false, message: "Error fetching booked plots", err });
  }
};

exports.searchBookedLand = async (req, res) => {
  try {
    let { page = 1, limit = 10, site_id, plot_id, status } = req.query;
    let skip = (Number(page) - 1) * Number(limit);
    const parsedStatus = JSON.parse(status);

    const matchStage = {
      $expr: {
        $and: [],
      },
    };
    if (parsedStatus?.length > 0) {
      matchStage.$expr.$and.push({
        $in: ["$installment_status", parsedStatus],
      });
    }

    if (site_id) {
      matchStage.$expr.$and.push({
        $eq: ["$site_id", new Types.ObjectId(site_id)],
      });
    }

    if (plot_id) {
      matchStage.$expr.$and.push({
        $eq: ["$plot_id", new Types.ObjectId(plot_id)],
      });
    }
    const filteredBookeds = await Bookedland.aggregate([
      {
        $facet: {
          count: [
            {
              $count: "totalCounts",
            },
          ],
          data: [
            {
              $match: matchStage,
            },
            {
              $lookup: {
                from: "lands",
                localField: "site_id",
                foreignField: "_id",
                as: "site",
              },
            },
            {
              $lookup: {
                from: "landplots",
                localField: "plot_id",
                foreignField: "_id",
                as: "plot",
              },
            },
            {
              $unwind: {
                path: "$site",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $unwind: {
                path: "$plot",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $skip: skip,
            },
            {
              $limit: Number(limit),
            },
          ],
        },
      },
    ]);
    const totalCount = filteredBookeds?.[0]?.count?.[0]?.totalCounts || 0;
    const data = filteredBookeds?.[0]?.data || [];

    res.status(200).json({
      success: true,
      message: "Filtered Booked Plots Fetch Successfully",
      totalCount,
      filteredBookeds,
      filteredCount: data.length,
      data,
    });
  } catch (err) {
    console.error("Error fetching booked plots:", err);
    res.status(500).json({ success: false, message: "Error fetching booked plots", err });
  }
};

exports.getBookedOne = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Booked.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) },
      },
      {
        $lookup: {
          from: "plots",
          localField: "plot_id",
          foreignField: "_id",
          as: "plot",
        },
      },
      {
        $unwind: {
          path: "$plot",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "sites",
          localField: "site_id",
          foreignField: "_id",
          as: "site",
        },
      },
      {
        $lookup: {
          from: "bookings",
          localField: "booking_id",
          foreignField: "_id",
          as: "booking_id",
        },
      },
      {
        $unwind: {
          path: "$booking_id",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$site",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    const followups = await followup_model.find({
      refId: id,
      refType: "Booked"
    });

    if (!client.length) {
      return res.status(400).json({ success: false, message: " Booked Client Not Found" });
    }
    res.status(200).json({
      success: true,
      messge: "Get Booked Client Details Fetch Successfully",
      data: { ...client[0], followups },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error Getting Booked by ID", err });
  }
};

exports.getBookedOneland = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Bookedland.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) },
      },
      {
        $lookup: {
          from: "landplots",
          localField: "plot_id",
          foreignField: "_id",
          as: "plot",
        },
      },
      {
        $unwind: {
          path: "$plot",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "lands",
          localField: "site_id",
          foreignField: "_id",
          as: "site",
        },
      },
      {
        $lookup: {
          from: "bookinglands",
          localField: "booking_id",
          foreignField: "_id",
          as: "booking_id",
        },
      },
      {
        $unwind: {
          path: "$booking_id",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$site",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    const followups = await followup_model.find({
      refId: id,
      refType: "Booked"
    });

    if (!client.length) {
      return res.status(400).json({ success: false, message: " Booked Client Not Found" });
    }
    res.status(200).json({
      success: true,
      messge: "Get Booked Client Details Fetch Successfully",
      data: { ...client[0], followups },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error Getting Booked by ID", err });
  }
};

// exports.updateBookPlot = async (req, res) => {
//   try {
//     const { plot_id } = req.params;
//     const updateData = req.body;
//     const files = req.files;

//     let existingClient = await Booked.findById() || (await Bought.findOne({ plot_id }));

//     if (!existingClient) {
//       return res.status(400).json({ success: false, message: "Booking not found!" });
//     }

//     let uploadedFiles = {
//       aadhar_card: { public_id: "", url: "" },
//       pan_card: { public_id: "", url: "" },
//       bank_passbook: { public_id: "", url: "" },
//       income_proof: { public_id: "", url: "" },
//       loan_approval_letter: { public_id: "", url: "" },
//     };

//     const uploadFile = async (file, folder) => {
//       const uploadResult = await uploader(file, folder);
//       return {
//         public_id: uploadResult.public_id,
//         url: uploadResult.secure_url,
//       };
//     };
//     if (files) {
//       if (files["aadhar_card"]) {
//         uploadedFiles.aadhar_card = await uploadFile(files["aadhar_card"][0], "aadhar_cards");
//       }
//       if (files["pan_card"]) {
//         uploadedFiles.pan_card = await uploadFile(files["pan_card"][0], "pan_cards");
//       }
//       if (files["bank_passbook"]) {
//         uploadedFiles.bank_passbook = await uploadFile(files["bank_passbook"][0], "bank_passbook");
//       }
//       if (files["income_proof"]) {
//         uploadedFiles.income_proof = await uploadFile(files["income_proof"][0], "income_proof");
//       }
//       if (files["loan_approval_letter"]) {
//         uploadedFiles.loan_approval_letter = await uploadFile(files["loan_approval_letter"][0], "loan_approval_letter");
//       }
//     }

//     Object.assign(existingClient, updateData, uploadedFiles);

//     if (updateData.payment_mode === "EMI" && updateData.installment_status === "Paid") {
//       await Booked.findByIdAndDelete(existingClient._id);
//       existingClient = new Bought({
//         ...existingClient.toObject(),
//         installment_status: "Paid",
//       });
//       await existingClient.save();

//      await Plot.findByIdAndUpdate(
//         plot_id,
//         {
//           plot_status: updateData.payment_mode === "Full Payment" ? "Sold" : "Booked",
//           client_id: existingClient._id,
//         },
//         { new: true }
//       );
//     }
//     else{
//       const updatedClient = await Booked.findByIdAndUpdate()
//     }
//     res.status(200).json({
//       success: true,
//       message: "Booking Updated Successfully!",
//       client_details: existingClient,
//     });
//   } catch (err) {
//     console.error("Error booking plot:", err);
//     res.status(500).json({
//       success: false,
//       message: "Error booking plot",
//       error: err.message,
//     });
//   }
// };

//Bought Search Filter
exports.getFilteredBoughtPlots = async (req, res) => {
  try {
    const { start_date, end_date, site_name, plot_no } = req.query;

    const result = await Bought.aggregate([
      {
        $match: {
          $and: [
            { settlement_date: { $gte: new Date(start_date) } },
            { settlement_date: { $lte: new Date(end_date) } },
          ],
        },
      },
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
        },
      },
      {
        $lookup: {
          from: "plots",
          localField: "plot_id",
          foreignField: "_id",
          as: "plot",
        },
      },
      {
        $unwind: {
          path: "$plot",
        },
      },
      {
        $match: {
          "site.site_name": new RegExp(site_name, "ig"),
          "plot.plot_no": new RegExp(plot_no, "ig"),
        },
      },
    ]);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("Error fetching bought plots:", err);
    res.status(500).json({ success: false, message: "Error fetching bought plots", err });
  }
};

//Booked Search Filter
exports.getFilteredBookedClients = async (req, res) => {
  try {
    const { installment_status, start_date, end_date, plot_no, site_name } = req.query;
    if (!installment_status) {
      return res.status(400).json({ success: false, message: "Installment_status is required" });
    }
    const validInstallments = ["first installment", "second installment", "third installment"];
    if (!validInstallments.includes(installment_status.toLowerCase())) {
      return res.status(400).json({ success: false, message: "Invalid installment status" });
    }

    let matchStage = { installment_status };

    if (start_date && end_date) {
      matchStage.createdAt = {
        $gte: new Date(start_date),
        $lte: new Date(end_date),
      };
    }

    const result = await Booked.aggregate([
      { $match: { matchStage } },
      {
        $lookup: {
          from: "sites",
          localField: "site_id",
          foreignField: "_id",
          as: "site",
        },
      },
      { $unwind: "$site" },
      {
        $lookup: {
          from: "plots",
          localField: "plot_id",
          foreignField: "_id",
          as: "plot",
        },
      },
      { $unwind: "$plot" },
      {
        $match: {
          ...(plot_no ? { "plot.plot_no": plot_no } : {}),
          ...(site_name ? { "site.site_name": site_name } : {}),
        },
      },
    ]);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    console.error("Error fetching booked Clients:", err);
    res.status(500).json({ success: false, message: "Error fetching booked clients", err });
  }
};

//Get All Bought Collection - Pagination
exports.searchBougths = async (req, res) => {
  try {
    let { page = 1, limit = 10, start_date, end_date, site_id, plot_id } = req.query;
    let skip = (Number(page) - 1) * Number(limit);

    const matchStage = {
      $expr: {
        $and: [],
      },
    };

    if (start_date) {
      matchStage.$expr.$and.push({
        $gte: ["$registration_date", new Date(start_date)],
      });
    }
    if (end_date) {
      matchStage.$expr.$and.push({
        $lte: ["$registration_date", new Date(end_date)],
      });
    }
    if (site_id) {
      matchStage.site_id = new Types.ObjectId(site_id);
    }

    if (plot_id) {
      matchStage.plot_id = new Types.ObjectId(plot_id);
    }

    const filteredData = await Bought.aggregate([
      {
        $facet: {
          count: [
            {
              $count: "totalCounts",
            },
          ],
          data: [
            {
              $match: matchStage,
            },
            {
              $lookup: {
                from: "sites",
                localField: "site_id",
                foreignField: "_id",
                as: "site",
              },
            },
            {
              $lookup: {
                from: "plots",
                localField: "plot_id",
                foreignField: "_id",
                as: "plot",
              },
            },

            {
              $unwind: {
                path: "$site",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $unwind: {
                path: "$plot",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $skip: Number(skip),
            },
            {
              $limit: Number(limit),
            },
          ],
        },
      },
    ]);

    const totalCounts = filteredData?.[0]?.count?.[0]?.totalCounts || 0;
    const data = filteredData?.[0]?.data;
    res.status(200).json({
      success: true,
      message: "Get All Bought Clients Data Retrieve Successfully",
      filteredCount: data.length || 0,
      totalCount: totalCounts || 0,
      data: data || [],
    });
  } catch (err) {
    console.error("Error fetching bought plots:", err);
    res.status(500).json({ success: false, message: "Error fetching bought plots", err });
  }
};

exports.searchBougthsland = async (req, res) => {
  try {
    let { page = 1, limit = 10, start_date, end_date, site_id, plot_id } = req.query;
    let skip = (Number(page) - 1) * Number(limit);

    const matchStage = {
      $expr: {
        $and: [],
      },
    };

    if (start_date) {
      matchStage.$expr.$and.push({
        $gte: ["$registration_date", new Date(start_date)],
      });
    }
    if (end_date) {
      matchStage.$expr.$and.push({
        $lte: ["$registration_date", new Date(end_date)],
      });
    }
    if (site_id) {
      matchStage.site_id = new Types.ObjectId(site_id);
    }

    if (plot_id) {
      matchStage.plot_id = new Types.ObjectId(plot_id);
    }

    const filteredData = await Boughtland.aggregate([
      {
        $facet: {
          count: [
            {
              $count: "totalCounts",
            },
          ],
          data: [
            {
              $match: matchStage,
            },
            {
              $lookup: {
                from: "lands",
                localField: "site_id",
                foreignField: "_id",
                as: "site",
              },
            },
            {
              $lookup: {
                from: "landplots",
                localField: "plot_id",
                foreignField: "_id",
                as: "plot",
              },
            },

            {
              $unwind: {
                path: "$site",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $unwind: {
                path: "$plot",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $skip: Number(skip),
            },
            {
              $limit: Number(limit),
            },
          ],
        },
      },
    ]);

    const totalCounts = filteredData?.[0]?.count?.[0]?.totalCounts || 0;
    const data = filteredData?.[0]?.data;
    res.status(200).json({
      success: true,
      message: "Get All Bought Clients Data Retrieve Successfully",
      filteredCount: data.length || 0,
      totalCount: totalCounts || 0,
      data: data || [],
    });
  } catch (err) {
    console.error("Error fetching bought plots:", err);
    res.status(500).json({ success: false, message: "Error fetching bought plots", err });
  }
};

exports.getBoughtOne = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Bought.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) },
      },
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
          from: "plots",
          localField: "plot_id",
          foreignField: "_id",
          as: "plot",
        },
      },
      {
        $lookup: {
          from: "bookings",
          localField: "booking_id",
          foreignField: "_id",
          as: "booking_id",
        },
      },
      {
        $unwind: {
          path: "$booking_id",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$plot",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    if (!client.length) {
      return res.status(400).json({ success: false, message: "Bought Client Not Found" });
    }
    res.status(200).json({
      success: true,
      messge: "Get Bought Client Details Fetch Successfully",
      data: client[0],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error Getting Bought by ID", err });
  }
};

exports.getBoughtOneLand = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Boughtland.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) },
      },
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
          from: "landplots",
          localField: "plot_id",
          foreignField: "_id",
          as: "plot",
        },
      },
      {
        $lookup: {
          from: "bookinglands",
          localField: "booking_id",
          foreignField: "_id",
          as: "booking_id",
        },
      },
      {
        $unwind: {
          path: "$booking_id",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$plot",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    if (!client.length) {
      return res.status(400).json({ success: false, message: "Bought Client Not Found" });
    }
    res.status(200).json({
      success: true,
      messge: "Get Bought Client Details Fetch Successfully",
      data: client[0],
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error Getting Bought by ID", err });
  }
};

exports.updateAmount = async (req, res, next) => {
  try {
    const { client_id, amount } = req.query;
    console.log(client_id, amount);
    if (!client_id || !Types.ObjectId.isValid(client_id)) {
      return next(new ErrorHandler(400, "Invalid id"));
    }

    const foundClient = await Booked.findById(client_id);
    foundClient.isMrpModified = true;
    foundClient.modified_mrp = Number(foundClient.modified_mrp) - amount;

    await foundClient.save();

    if (!foundClient) {
      return next(new ErrorHandler(400, "Plot not found"));
    }
    res.status(200).json({
      success: true,
      message: "Amount updated successfully",
      data: foundClient,
    });
  } catch (error) {
    next(error);
  }
};
exports.updateAmountLand = async (req, res, next) => {
  try {
    const { client_id, amount } = req.query;
    // console.log(client_id, amount);
    if (!client_id || !Types.ObjectId.isValid(client_id)) {
      return next(new ErrorHandler(400, "Invalid id"));
    }

    const foundClient = await Bookedland.findById(client_id);
    foundClient.isMrpModified = true;
    foundClient.modified_mrp = Number(foundClient.modified_mrp) - amount;

    await foundClient.save();

    if (!foundClient) {
      return next(new ErrorHandler(400, "Plot not found"));
    }
    res.status(200).json({
      success: true,
      message: "Amount updated successfully",
      data: foundClient,
    });
  } catch (error) {
    next(error);
  }
};
exports.updateCommissionPercentages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { professionalsPercentages, commissionPercentage } = req.body;
    console.log("percentages", req.body);
    if (!id || !Types.ObjectId.isValid(id)) {
      return next(new ErrorHandler(400, "Invalid id"));
    }

    const foundClient = await Booked.findByIdAndUpdate(
      id,
      { $set: { commissionPercentage, professionalsPercentages } },
      { new: true }
    );

    if (!foundClient) {
      next(new ErrorHandler(404, "Client not found"));
    }
    res.status(200).json({
      success: true,
      message: "Commissions updated successfully",
      data: foundClient,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllpayment = async (req, res, next) => {
  try {
    const BookedData = await Booked
      .aggregate([
        {
          $lookup: {
            from: "plots",
            localField: "plot_id",
            foreignField: "_id",
            as: "plot"
          }
        },
        {
          $unwind: {
            path: "$plot",
            preserveNullAndEmptyArrays: true,
          }
        },
        {
          $group: {
            _id: null,
            totalPendingAmount: { $sum: "$pending_amount" },
            totaloverAllGivenAmount: { $sum: "$overAllGivenAmount" },
            totalFinalAgreementValue: { $sum: "$plot.final_agreement_value" }
          }
        }
      ])

    if (BookedData.length > 0) {
      res.status(200).json({
        success: true,
        message: "Customer payment data fetched successfully",
        data: BookedData
      })
    } else {
      res.status(200).json({
        success: true,
        message: "No data found",
        data: ""
      })
    }

  } catch (err) {
    res.status(500).json({ success: false, message: "Error Getting Bought by ID", err });
  }
}

exports.bookLandPlot = async (req, res, next) => {
  try {
    const { payment_mode, token_advance, team, professional, payment_type, installment_status, received_amount } =
      req.body;
    const { site_id, plot_id } = req.query;

    const plot = await Landplot.findById(plot_id);

    if (!plot) {
      return res.status(404).json({ success: false, message: "Plot not found!" });
    }
    if (plot.plot_status !== "Available") {
      return res.status(400).json({ success: false, message: "Plot is already booked or sold!" });
    }

    let newClient = {};
    let booking;
    const files = req.files;

    let uploadedFiles = {
      aadhar_card: { public_id: "", url: "" },
      pan_card: { public_id: "", url: "" },
      bank_passbook: { public_id: "", url: "" },
      income_proof: { public_id: "", url: "" },
      loan_approval_letter: { public_id: "", url: "" },
    };

    const uploadFile = async (file, folder) => {
      const uploadResult = await uploader(file, folder);
      return {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
      };
    };
    if (files) {
      if (files["aadhar_card"]) {
        uploadedFiles.aadhar_card = await uploadFile(files["aadhar_card"][0], "aadhar_cards");
      }
      if (files["pan_card"]) {
        uploadedFiles.pan_card = await uploadFile(files["pan_card"][0], "pan_cards");
      }
      if (files["bank_passbook"]) {
        uploadedFiles.bank_passbook = await uploadFile(files["bank_passbook"][0], "bank_passbook");
      }
      if (files["income_proof"]) {
        uploadedFiles.income_proof = await uploadFile(files["income_proof"][0], "income_proof");
      }
      if (files["loan_approval_letter"]) {
        uploadedFiles.loan_approval_letter = await uploadFile(files["loan_approval_letter"][0], "loan_approval_letter");
      }
    }

    if (installment_status === "Token Advance" && Number(token_advance) > 0) {
      booking = await Bookingland_model.create({
        client_name: req.body.client_name || "",
        contact_no: req.body.contact_no || 0,
        email_id: req.body.email_id || "",
        address: req.body.address || "",
        state: req.body.state || "",
        remarks: req.body.remarks || "",
        location: req.body.city || "",
        amount: req.body.token_advance,
        payment_type,
        site_id: site_id,
        plot_id: plot_id,
      });
    }

    if (payment_mode !== "Full Payment") {
      newClient = await Bookedland.create({
        ...req.body,
        aadhar_card: uploadedFiles.aadhar_card,
        pan_card: uploadedFiles.pan_card,
        bank_passbook: uploadedFiles.bank_passbook,
        income_proof: uploadedFiles.income_proof,
        loan_approval_letter: uploadedFiles.loan_approval_letter,
        team,
        modified_mrp: req.body.mrp,
        professional,
        site_id,
        plot_id,
      });

      if (booking) {
        newClient.booking_id = booking._id;
      }
      if (payment_mode === "EMI" && installment_status === "EMI") {
        newClient.emi_details.push({ amount: received_amount, date: Date.now(), payment_type });
      }
      if (payment_mode === "Installment" && status.includes(installment_status)) {
        newClient.installment_details.push({
          status: installment_status,
          amount: received_amount,
          date: Date.now(),
          payment_type,
        });
      }

      await newClient.save();
    } else {
      if (Number(plot.mrp) !== Number(received_amount) + Number(token_advance)) {
        return res.status(400).json({
          success: false,
          message: "Payment is not equal to mrp"
        })
      }

      if (payment_mode === "Full Payment" && installment_status !== "Fully Paid") {
        newClient = await Bookedland.create({
          ...req.body,
          aadhar_card: uploadedFiles.aadhar_card,
          pan_card: uploadedFiles.pan_card,
          bank_passbook: uploadedFiles.bank_passbook,
          income_proof: uploadedFiles.income_proof,
          loan_approval_letter: uploadedFiles.loan_approval_letter,
          overAllGivenAmount: received_amount,
          team,
          full_payment_type: payment_type,
          professional,
          site_id,
          plot_id,
        });

        await newClient.save();

      }

      if (payment_mode === "Full Payment" && installment_status === "Fully Paid") {
        return res.status(400).json({
          success: false,
          message: "Try making payment in installments"
        })
      }

    }

    await Landplot.findByIdAndUpdate(plot_id, {
      plot_status: "Booked",
      client_id: newClient._id,
    });

    res.status(201).json({
      success: true,
      message: "Land Plot booked successfully!",
      client: newClient,
    });
  } catch (err) {
    next(err);
  }
};
