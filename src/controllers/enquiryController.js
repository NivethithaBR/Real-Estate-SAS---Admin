const { default: mongoose } = require("mongoose");
const Enquiry = require("../models/Enquiry");
const Plot = require("../models/Plot");
const Site = require("../models/Site");
const User = require("../models/User");
const errorHandler = require("../utils/ErrorHandler");
const followup_model = require("../models/Followups.model");
const twilio = require("twilio");
const recording_model = require("../models/Recordings.model");
const axios = require("axios");
const XLSX = require("xlsx");
const assignment_state_model = require("../models/AssignmentState.model");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

exports.addEnquiry = async (req, res) => {
  try {
    const { assigned_to, followup_time, followup_date, remarks, plot, site } =
      req.body;
    let foundPlot;
    if (plot) {
      foundPlot = await Plot.findOne({
        _id: plot,
        plot_status: "Available",
      });
      if (!foundPlot) {
        return res.status(400).json({
          success: false,
          message: "Selected plot is not available",
        });
      }
    }

    const newClient = new Enquiry({
      ...req.body,
      plot_id: plot,
      site_id: site,
    });
    await newClient.save();
    // if (followup_date && followup_time) {
    //   await followup_model.create({
    //     assigned_to,
    //     status: "pending",
    //     remarks,
    //     refId: newClient?._id,
    //     refType: "Enquiry",
    //     followup_date,
    //     followup_time,
    //   });
    // }
    const populateClient = await Enquiry.findById(newClient._id)
      .populate("site_id")
      .populate("plot_id");
    res.status(201).json({
      success: true,
      message: "Enquiry added successfully",
      data: populateClient,
    });
  } catch (err) {
    res.status(500).json({ message: "Error adding enquiry", err });
  }
};

exports.searchEnquiry = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      followup_date,
      plot_id,
      site_id,
      client_name,
      contact_no,
      city,
      lead_source,
      assigned_to,
      visit_date,
    } = req.query;
    let skip = (Number(page) - 1) * Number(limit);

    const matchStage = {};
    if (followup_date) {
      matchStage.followup_date = new Date(followup_date);
    }

    if (site_id) {
      matchStage.site_id = new mongoose.Types.ObjectId(site_id);
    }

    if (client_name) {
      matchStage.client_name = { $regex: client_name, $options: "i" };
    }

    if (contact_no) {
      matchStage.contact_no = {
        $regex: contact_no,
        $options: "i",
      };
    }

    if (city) {
      matchStage.city = { $regex: city, $options: "i" };
    }

    if (lead_source) {
      matchStage.lead_source = { $regex: lead_source, $options: "i" };
    }

    if (assigned_to) {
      matchStage.assigned_to = new mongoose.Types.ObjectId(assigned_to);
    }

    if (visit_date === "null") {
      matchStage.visit_date = null;
    } else if (visit_date) {
      matchStage.visit_date = new Date(visit_date);
    }

    if (plot_id) {
      matchStage.plot_id = new mongoose.Types.ObjectId(plot_id);
    }

    const filteredData = await Enquiry.aggregate([
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
              $sort: {
                createdAt: -1,
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
    res
      .status(500)
      .json({ success: false, message: "Error fetching enquiries", err });
  }
};

exports.updateEnquiry = async (req, res) => {
  try {
    const {
      client_name,
      contact_no,
      email_id,
      address,
      state,
      status,
      city,
      visit_date,
      follow_update,
      remarks,
      site,
      plot,
    } = req.body;
    const { enquiryId } = req.params;

    const updatedEnquiry = await Enquiry.findByIdAndUpdate(
      enquiryId,
      {
        client_name,
        contact_no,
        email_id,
        address,
        state,
        status,
        city,
        visit_date,
        remarks,
        site_id: site,
        plot_id: plot,
      },
      { new: true },
    );
    if (!updatedEnquiry) {
      return res.status(400).json({ message: "Enquiry Not Found" });
    }
    res.status(200).json({
      success: true,
      message: "Enquiry Updated Successfully",
      data: updatedEnquiry,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error Updating Enquiry", data: err });
  }
};

exports.deleteEnquiry = async (req, res) => {
  try {
    const { enquiryId } = req.params;

    const deletedEnquiry = await Enquiry.findByIdAndDelete(enquiryId);
    if (!deletedEnquiry) {
      return res.status(404).json({ message: "Enquiry not Found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Enquiry delete successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error deleting enquiry", err });
  }
};

exports.getEnquiryOne = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Enquiry.aggregate([
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
        $unwind: {
          path: "$plot",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    const followups = await followup_model.find({
      refId: id,
      refType: "Enquiry",
    });
    if (!client.length) {
      return res
        .status(400)
        .json({ success: false, message: "Client Not Found" });
    }
    const data = {
      ...client[0],
      followups,
    };
    res.status(200).json({
      success: true,
      messge: "Client Details Fetch Successfully",
      data,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Error Getting Enquiry by ID", err });
  }
};

exports.getAvailablePlotsBySite = async (req, res) => {
  try {
    const { id } = req.params;

    // Get site
    const site = await Site.findById(id);

    if (!site) {
      return res
        .status(404)
        .json({ success: false, message: "Site not found" });
    }

    // Find only available plots among site plots
    const availablePlots = await Plot.find({
      _id: { $in: site.plots },
      plot_status: "Available",
    }).select(
      "plot_no block owner total_area price_per_sqft dimensions images mrp plot_status",
    );

    res.status(200).json({
      success: true,
      available_plots: availablePlots,
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching available plots", err });
  }
};
// exports.showLeadStatusPercentages = async (req, res, next) => {
//   try {
//     const totalCount = await Enquiry.countDocuments();
//     const statusCounts = await Enquiry.aggregate([
//       {
//         $group: {
//           _id: "$status",
//           count: { $sum: 1 },
//         },
//       },
//       {
//         $group: {
//           _id: null,
//           data: {
//             $push: {
//               k: "$_id",
//               v: "$count",
//             },
//           },
//         },
//       },
//       {
//         $replaceRoot: {
//           newRoot: {
//             $arrayToObject: "$data",
//           },
//         },
//       },
//     ]);

//     const warmCount = statusCounts?.[0]?.Warm || 0;
//     const hotCount = statusCounts?.[0]?.Hot || 0;
//     const coldCount = statusCounts?.[0]?.Cold || 0;
//     const warmPercentage = ((Number(warmCount) / Number(totalCount)) || 0) * 100;
//     const hotPercentage = ((Number(hotCount) / Number(totalCount)) || 0) * 100;
//     const coldPercentage = ((Number(coldCount) / Number(totalCount)) || 0) * 100;

//     return res.status(200).json({
//       success: true,
//       message: "Lead status percentages got successfully",
//       data: {
//         Warm: warmPercentage,
//         Hot: hotPercentage,
//         Cold: coldPercentage,
//       },
//     });
//   } catch (error) {
//     next(error);
//   }
// };

exports.showLeadStatusPercentages = async (req, res, next) => {
  try {
    const totalCount = await Enquiry.countDocuments();

    const statusCounts = await Enquiry.aggregate([
      {
        $match: {
          status: {
            $exists: true,
            $ne: null,
          },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    let warmCount = 0;
    let hotCount = 0;
    let coldCount = 0;

    statusCounts.forEach((item) => {
      const status = String(item._id || "")
        .trim()
        .toLowerCase();

      if (status === "warm") {
        warmCount = item.count;
      }

      if (status === "hot") {
        hotCount = item.count;
      }

      if (status === "cold") {
        coldCount = item.count;
      }
    });

    const warmPercentage = totalCount > 0 ? (warmCount / totalCount) * 100 : 0;

    const hotPercentage = totalCount > 0 ? (hotCount / totalCount) * 100 : 0;

    const coldPercentage = totalCount > 0 ? (coldCount / totalCount) * 100 : 0;

    return res.status(200).json({
      success: true,
      message: "Lead status percentages got successfully",
      data: {
        Warm: Number(warmPercentage.toFixed(2)),
        Hot: Number(hotPercentage.toFixed(2)),
        Cold: Number(coldPercentage.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("showLeadStatusPercentages Error:", error);
    next(error);
  }
};
exports.LeadCountByDay = async (req, res, next) => {
  try {
    const { date } = req.body;
    const today = new Date(date || "2025-11-07");
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const count = await Enquiry.find({
      createdAt: { $gte: today, $lt: tomorrow },
    }).countDocuments();

    return res.status(200).json({
      success: true,
      message: "Leads count by day got successfully",
      data: {
        count,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Twilio
// exports.callLead = async (req, res, next) => {
//   try {
//     const { agent_id, lead_id } = req.body;
//     const foundAgent = await User.findById(agent_id);
//     if (!foundAgent) {
//       return next(new errorHandler(404, "User not found"));
//     }
//     const foundLead = await Enquiry.findById(lead_id);
//     if (!foundLead) {
//       return next(new errorHandler(404, "Enquiry not found"));
//     }
//     if (!foundAgent?.phone || !foundLead?.contact_no) {
//       return next(new errorHandler(400, "Mobile Numbers are not provided"));
//     }

//     const call = await client.calls.create({
//       from: process.env.TWILIO_PHONE_NUMBER,
//       to: `${foundAgent?.phone}`,
//       url: `${process.env.BASE_URL}/api/enquiries/twilio/connect-lead?leadNumber=${foundLead?.contact_no}&agent_id=${agent_id}&lead_id=${lead_id}`,
//       record: true,
//     });

//     res.json({ success: true,message:"Call has been initiated", callSid: call.sid });
//   } catch (error) {
//     next(error);
//   }
// };

// exports.contactLead = async (req, res, next) => {
//   try {
//     const { leadNumber, agent_id, lead_id } = req.query;

//     console.log(leadNumber);
//     const twiml = new twilio.twiml.VoiceResponse();
//     const dial = twiml.dial({
//       record: "record-from-answer",
//       recordingStatusCallback: `${process.env.BASE_URL}/api/enquiries/twilio/recording?agent_id=${agent_id}&lead_id=${lead_id}`,
//     });

//     dial.number(leadNumber);

//     res.type("text/xml");
//     res.send(twiml.toString());
//   } catch (error) {
//     next(error);
//   }
// };

// exports.callFinish = async (req, res, next) => {
//   try {
//     const { RecordingUrl, RecordingSid, RecordingStartTime, CallSid, RecordingDuration } = req.body;
//     const { agent_id, lead_id } = req.query;
//     await recording_model.create({
//       agent_id: agent_id,
//       lead_id: lead_id,
//       call_sid: CallSid,
//       duration: RecordingDuration,
//       record_start_time: RecordingStartTime,
//       recording_sid: RecordingSid,
//       recording_url: RecordingUrl,
//     });
//     res.send("OK");
//   } catch (error) {
//     next(error);
//   }
// };

// exports.searchRecordings = async (req, res, next) => {
//   try {
//     const { page = 1, limit = 10, keyword } = req.query;
//     const skip = Number((page || 1) - 1) * Number(limit || 0);

//     const recordings = await recording_model.aggregate([
//       {
//         $facet: {
//           count: [{ $count: "totalCount" }],
//           data: [
//             {
//               $lookup: {
//                 from: "enquiries",
//                 localField: "lead_id",
//                 foreignField: "_id",
//                 as: "enquiry",
//               },
//             },
//             {
//               $lookup: {
//                 from: "users",
//                 localField: "agent_id",
//                 foreignField: "_id",
//                 as: "user",
//               },
//             },
//             {
//               $addFields: {
//                 enquiry: { $arrayElemAt: ["$enquiry", 0] },
//                 user: { $arrayElemAt: ["$user", 0] },
//               },
//             },
//             {
//               $skip: skip,
//             },
//             {
//               $limit: Number(limit),
//             },
//           ],
//         },
//       },
//     ]);

//     const data = recordings[0]?.data || [];
//     const totalCounts = recordings[0]?.count[0]?.totalCount || 0;

//     return res.status(200).json({
//       success: true,
//       message: "Recordings get successfully",
//       data,
//       totalCounts,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// exports.getAudio = async (req, res) => {
//   try {
//     console.log("hello");
//     const recordingUrl = `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Recordings/${req.params.sid}.mp3`;

//     const response = await axios.get(recordingUrl, {
//       responseType: "arraybuffer",
//       auth: {
//         username: process.env.TWILIO_ACCOUNT_SID,
//         password: process.env.TWILIO_AUTH_TOKEN,
//       },
//       withCredentials: true,
//     });
//     res.set("Content-Type", "audio/mpeg");
//     res.send(response.data);
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Error fetching recording");
//   }
// };

// DaffyTel
exports.callLead = async (req, res, next) => {
  try {
    const { agent_id, lead_id } = req.body;
    const foundAgent = await User.findById(agent_id);
    if (!foundAgent) {
      return next(new errorHandler(404, "User not found"));
    }
    const foundLead = await Enquiry.findById(lead_id);
    if (!foundLead) {
      return next(new errorHandler(404, "Enquiry not found"));
    }
    if (!foundAgent?.phone || !foundLead?.contact_no) {
      return next(new errorHandler(400, "Mobile Numbers are not provided"));
    }
    const admin = await User.findOne({ role: "Admin" });

    const response = axios
      .post(`${process.env.DAFFYTEL_API}/clicktocall`, {
        token: admin?.daffytelToken,
        userid: foundAgent?.userid,
        mobile: foundLead?.contact_no,
      })
      .then((response) => {
        return res.json({ success: true, message: response?.data?.message });
      })
      .catch(async (error) => {
        console.log(error.response?.data);
        try {
          if (!error?.response?.data?.is_authenticated) {
            const loginResponse = await axios.post(
              `${process.env.DAFFYTEL_API}/login`,
              {
                client_id: process.env.DAFFYTEL_CLIENT_ID,
                client_secret: process.env.DAFFYTEL_SECRET,
              },
            );
            console.log(loginResponse);
            if (
              loginResponse?.data?.status &&
              loginResponse?.data?.is_authenticated
            ) {
              const adminData = await User.findOneAndUpdate(
                { role: "Admin" },
                {
                  $set: {
                    daffytelToken: loginResponse?.data?.accessToken,
                  },
                },
              );
              const response = await axios.post(
                `${process.env.DAFFYTEL_API}/clicktocall`,
                {
                  token: loginResponse?.data?.accessToken,
                  userid: foundAgent?.userid,
                  mobile: foundLead?.contact_no,
                },
              );
              if (response?.data?.status) {
                return res.json({
                  success: true,
                  message: "Call has been initiated",
                });
              }
            }
          }
        } catch (error) {
          console.log("Error in login", error);
        }
      });
  } catch (error) {
    console.log("errorrrrrrr");
    next(error);
  }
};

exports.searchRecordings = async (req, res, next) => {
  try {
    const { status, date } = req.query;

    const recordings = await axios.post(
      `${process.env.DAFFYTEL_API}/getsfcallreport`,
      {
        client_id: process.env.DAFFYTEL_CLIENT_ID, //Client Id
        client_secret: process.env.DAFFYTEL_SECRET,
        date, // YYYY-MM-DD Format
        status, // NOANSWER,ANSWER,INVALIDNUMBER,MISSED,NETWORKBUSY,BUSY,CONGESTION,SERVICE_UNAVAILABLE,
        call_type: "0",
      },
    );
    console.log(recordings.data);
    res.status(200).json({
      success: true,
      message: "Records got successfully",
      data: recordings?.data,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.bulkUploadEnquiries = async (req, res, next) => {
  const { file } = req;
  // console.log("loggg",file)
  try {
    if (!file) return next(new errorHandler("file not Found", 404));
    const headerMapping = {
      Name: "client_name",
      Address: "address",
      "Contact Number": "contact_no",
      Email: "email_id",
      State: "state",
      City: "city",
      Status: "status",
      "Lead Source" : "lead_source"
    };

    const workBook = XLSX.read(file.buffer, { type: "buffer" });
    const sheet_name_list = workBook.SheetNames;

    const xlsxData = XLSX.utils.sheet_to_json(
      workBook.Sheets[sheet_name_list[0]],
      { header: 1 },
    );
    const headers = xlsxData[0].map((header) => headerMapping[header]);
    const executives = await User.find({ role: "User" }).sort({ createdAt: 1 });
    const leadAssignmentState = await assignment_state_model.findOne({
      type: "leadAssign",
    });

    let fromExecutiveIndex = leadAssignmentState?.nextIndex || 0;
    let documents = [];
    for (let i = 1; i < xlsxData.length; i++) {
      let newDoc = {};
      for (let j = 0; j < xlsxData[i].length; j++) {
        newDoc[headers[j]] = xlsxData[i][j];
      }
      documents.push({
        ...newDoc,
        assigned_to: executives[fromExecutiveIndex]?._id,
      });
      if (fromExecutiveIndex === executives.length - 1) {
        fromExecutiveIndex = 0;
      } else {
        fromExecutiveIndex += 1;
      }
    }
    const enquiries = await Enquiry.insertMany(documents);
    await assignment_state_model.findOneAndUpdate(
      { type: "leadAssign" },
      { nextIndex: fromExecutiveIndex },
    );
    res.status(200).json({
      success: true,
      message: "Read the data Successfully",
      data: enquiries,
      totalCount: await Enquiry.countDocuments(),
    });
  } catch (error) {
    next(error);
  }
};
