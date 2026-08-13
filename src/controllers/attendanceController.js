const Attendance = require("../models/Attendance.model");
const User = require("../models/User");
const mongoose = require("mongoose")
const Task = require("../models/Task")
const Eod = require("../models/Eod")
const user = require("../models/User")
const timeDifference = async (time1) => {
  const dbDate = new Date(time1);
  const nineAM = new Date(dbDate);
  nineAM.setHours(9, 0, 0, 0);
  const diffMs = dbDate.getTime() - nineAM.getTime();
  const diffMinutes = diffMs / (1000 * 60);
  return diffMinutes;
}

exports.markAttendance = async (req, res, next) => {
  try {
    let {
      userId,
      date,
      status,
      leaveType,
      remarks,
      permissionHours,
      permissionMinutes,
    } = req.body;
    console.log("allhere",req?.body)
    if (req?.body?.type) {
      if (req?.body?.type == "userside") {
        date = new Date();
      }
    } else {
      if (!userId || !date || !status) {
        return res.status(400).json({
          success: false,
          message: "UserId, date and status are required",
        });
      }
    }


    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    if (status == "Leave") {
      const usrID = new mongoose.Types.ObjectId(userId)
      let validateLeave = await Attendance.find({
        userId: usrID,
        status: "Leave",
        leaveType: {
          $in: ["CL", "SL"]
        },
        createdAt: {
          $gte: startOfMonth,
          $lt: startOfNextMonth
        }
      })

      let getCL = 0;
      let getSL = 0;
      if (validateLeave.length > 0) {

        for (const vld of validateLeave) {
          if (vld?.leaveType == "CL") {
            getCL++;
          }
          if (vld?.leaveType == "SL") {
            getSL++;
          }
        }
        if (getCL >= 1 && leaveType == "CL") {
          return res.status(400).json({
            success: false,
            message: "Used casual leave for the month",
            data: "",
          });
        }
        if (getSL >= 1 && leaveType == "SL") {
          return res.status(400).json({
            success: false,
            message: "Used sick leave for the month",
            data: "",
          });
        }
      }
    }

    if (status == "Permission") {
      const usrID = new mongoose.Types.ObjectId(userId)
      let validatePermission = await Attendance.find({
        userId: usrID,
        status: "Permission",
        createdAt: {
          $gte: startOfMonth,
          $lt: startOfNextMonth
        }
      })

      let getpermission = 0;
      if (validatePermission.length > 0) {

        for (const vlds of validatePermission) {
          getpermission += Number(vlds?.permissionHours)
        }
        if (getpermission == 1 && permissionHours >= 2) {
          return res.status(400).json({
            success: false,
            message: "Already used 1hr permission for the month",
            data: "",
          });
        }
        if (getpermission >= 2) {
          return res.status(400).json({
            success: false,
            message: "Used 2hrs permission for the month",
            data: "",
          });
        }
      }
    }


    let attendance = await Attendance.findOne({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    let typess = 0
      if(req?.user?.role == "User"){
        typess = 2
      }
      if(req?.user?.role != "User"){
        typess = 1
      }
    
    if (attendance) {
      let dateToday = new Date()

      let diff = await timeDifference(dateToday)
      let lateAbsent = 0

      attendance.status = status;
      attendance.remarks = remarks ?? attendance.remarks;

      
      
      if (diff > 5 && diff < 30) {
        attendance.lateAbsent = diff
        attendance.status = typess === 1 ? status : "Half Day"
        attendance.remarks = "Half day salary cut to late upto 5 minutes or more"
      }
      if (diff >= 30) {
        attendance.lateAbsent = diff
        attendance.status = typess === 1 ? status : "Absent"
        attendance.remarks = "Full day salary cut due to late attendence, upto 30 minutes or more"
      }

      attendance.leaveType = leaveType;

      attendance.permissionHours =
        permissionHours ?? attendance.permissionHours;

      attendance.permissionMinutes =
        permissionMinutes ?? attendance.permissionMinutes;
      attendance.date = dateToday;
      attendance.attendanceBy = req?.user?.role == "User" ? "user" : req?.user?.role == "Admin" ? "admin" : "",
      await attendance.save();
    } else {
      let dateToday = new Date()

      let diff = await timeDifference(dateToday)
      let lateAbsent = 0
      if (diff > 5 && diff < 30) {
        lateAbsent = diff
        status = typess === 1 ? status :"Half Day"
        remarks = "Half day salary cut to late upto 5 minutes or more"
      }
      if (diff >= 30) {
        lateAbsent = diff
        status = typess === 1 ? status : "Absent"
        remarks = "Full day salary cut due to late attendence, upto 30 minutes or more"
      }
      attendance = await Attendance.create({
        userId,
        date: dateToday,
        status,
        remarks,
        leaveType,
        lateAbsent,

        permissionHours: permissionHours || 0,
        permissionMinutes: permissionMinutes || 0,
        attendanceBy : req?.user?.role == "User" ? "user" : req?.user?.role == "Admin" ? "admin" : "",
        // markedById: req.auth._id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Attendance marked successfully",
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAttendanceByDate = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res
        .status(400)
        .json({ success: false, message: "Date is required" });
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const attendances = await Attendance.find({
      date: { $gte: startOfDay, $lte: endOfDay },
    }).populate("userId", "full_name role");

    return res.status(200).json({
      success: true,
      data: attendances,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMonthlyAttendance = async (req, res, next) => {
  try {
    const { month } = req.query; // YYYY-MM
    if (!month) {
      return res
        .status(400)
        .json({ success: false, message: "Month is required" });
    }

    const [year, m] = month.split("-");
    const startOfMonth = new Date(year, parseInt(m) - 1, 1);
    const endOfMonth = new Date(year, parseInt(m), 0, 23, 59, 59, 999);

    const attendances = await Attendance.find({
      date: { $gte: startOfMonth, $lte: endOfMonth },
    }).populate("userId", "full_name role");

    // Group by user
    const grouped = {};
    attendances.forEach((at) => {
      const uId = at.userId._id.toString();
      if (!grouped[uId]) {
        grouped[uId] = {
          user: at.userId,
          records: [],
          presentCount: 0,
          halfDayCount: 0,
          permissionCount: 0,
          permissionHours: 0,
          permissionMinutes: 0,
          absentCount: 0,
          absentCLCount: 0,
          absentSLCount: 0,
          absentNoneCount: 0,
          totalWorkingDays: 0,
          effectivePresent: 0,
          salaryDeduction: "",
          abhours: 0,
          abmin : 0
        };
      }
      grouped[uId].records.push(at);
      grouped[uId].totalWorkingDays++;

      if (at.status === "Present") {
        grouped[uId].presentCount++;
        grouped[uId].effectivePresent += 1;
      } else if (at.status === "Half Day") {
        grouped[uId].halfDayCount++;
        grouped[uId].effectivePresent += 0.5;
      } else if (at.status === "Permission") {
        grouped[uId].permissionCount++;

        grouped[uId].permissionHours += at.permissionHours || 0;
        grouped[uId].permissionMinutes += at.permissionMinutes || 0;

        if (grouped[uId].permissionMinutes >= 60) {
          grouped[uId].permissionHours += Math.floor(
            grouped[uId].permissionMinutes / 60,
          );

          grouped[uId].permissionMinutes = grouped[uId].permissionMinutes % 60;
        }
      } else if (at.status === "Absent") {
        grouped[uId].absentCount++;

        if (at.leaveType === "CL") {
          grouped[uId].absentCLCount++;
        } else if (at.leaveType === "SL") {
          grouped[uId].absentSLCount++;
        } else {
          grouped[uId].absentNoneCount++;
        }

        if (at.lateAbsent > 0) {
          grouped[uId].abhours += Math.floor(Number(at.lateAbsent) / 60);
          grouped[uId].abmin += Number(at.lateAbsent) % 60;
          grouped[uId].salaryDeduction = `${grouped[uId].abhours.toFixed(0)} hours ${grouped[uId].abmin.toFixed(0)} mins`

        }
      }
    });

    return res.status(200).json({
      success: true,
      data: Object.values(grouped),
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsersForAttendance = async (req, res, next) => {
  try {
    const users = await User.find({ role: { $ne: "Super Admin" }, status : "Active" }).select(
      "full_name role",
    );
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

exports.getUserAttendence = async (req, res, next) => {
  try {
    const date = new Date()
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    const auserid = new mongoose.Types.ObjectId(req?.body?.userid)
    const user = await Attendance.findOne({
      userId: auserid,
      date: { $gte: startOfDay, $lte: endOfDay },
    });
    if (user) {
      return res.status(200).json({ success: true, data: user });

    } else {
      return res.status(200).json({ success: false, data: "", message: "Attendence not found" });
    }

  } catch (error) {
    next(error);
  }
}

exports.createTask = async (req, res, next) => {
  try {
    const { task, task_description } = req?.body
    if (!task) {
      return res.status(400).json({
        success: false,
        data: "",
        message: "Task name is required"
      })
    }
    if (!task_description) {
      return res.status(400).json({
        success: false,
        data: "",
        message: "Task description is required"
      })
    }

    if (!req?.body?.taskid) {
      const store = await Task.create({
        task: task,
        task_description: task_description,
        userid: req?.params?.id
      })

      if (store) {
        return res.status(200).json({
          success: true,
          data: store,
          message: "Task created successfully"
        })
      } else {
        return res.status(400).json({
          success: false,
          data: "",
          message: "Unable to create task"
        })
      }
    } else {
      const store = await Task.findOneAndUpdate({
        _id: req?.body?.taskid
      }, {
        $set: {
          task: task,
          task_description: task_description
        }
      })

      if (store) {
        return res.status(200).json({
          success: true,
          data: store,
          message: "Task updated successfully"
        })
      } else {
        return res.status(400).json({
          success: false,
          data: "",
          message: "Unable to update task"
        })
      }
    }



  } catch (error) {
    next(error)
  }
}

exports.getUserTask = async (req, res, next) => {
  try {
    const { userid } = req?.body

    const { page, limit } = req?.query
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    if (!userid) {
      return res.status(400).json({
        success: false,
        data: "",
        message: "User id required"
      })
    }

    const date = new Date()
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const filter = {
      userid: userid,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    };

    const store = await Task.find(filter)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 })

    const totalCount = await Task.countDocuments(filter);


    if (store) {
      return res.status(200).json({
        success: true,
        data: store,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalItems: totalCount,
          limit: limitNum
        },
        message: "Task fetched successfully"
      })
    } else {
      return res.status(400).json({
        success: false,
        data: "",
        message: "Unable to fetch task"
      })
    }

  } catch (error) {
    next(error)
  }
}

exports.getTask = async (req, res, next) => {
  try {
    const { id } = req?.params
    if (!id) {
      return res.status(400).json({
        success: false,
        data: "",
        message: "User id required"
      })
    }

    const date = new Date()
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    const getAll = await Task.findOne({
      _id: id,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    }).select("task task_description")

    if (getAll) {
      return res.status(200).json({
        success: true,
        data: getAll,
        message: "Task fetched successfully"
      })
    } else {
      return res.status(400).json({
        success: false,
        data: "",
        message: "Unable to fetch task"
      })
    }

  } catch (error) {
    next(error)
  }
}

exports.eodReports = async (req, res, next) => {
  try {
    const { eod_description } = req?.body
    const { id } = req?.params
    if (!eod_description) {
      return res.status(400).json({
        success: false,
        data: "",
        message: "Eod description is required"
      })
    }

    const date = new Date();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const geteod = await Eod.findOne({
      userid: id,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    })


    if (geteod) {

      geteod.eod_description = eod_description
      let store = geteod.save();

      if (store) {
        return res.status(200).json({
          success: true,
          data: store,
          message: "EOD created successfully"
        })
      } else {
        return res.status(400).json({
          success: false,
          data: "",
          message: "Unable to create EOD"
        })
      }

    }

    // if (!req?.body?.eodid) {
    const store = await Eod.create({
      eod_description: eod_description,
      userid: req?.params?.id
    })

    if (store) {
      return res.status(200).json({
        success: true,
        data: store,
        message: "EOD created successfully"
      })
    } else {
      return res.status(400).json({
        success: false,
        data: "",
        message: "Unable to create EOD"
      })
    }
    // } 



  } catch (error) {
    next(error)
  }
}

exports.eodget = async (req, res, next) => {
  try {
    const { id } = req?.params
    if (!id) {
      return res.status(400).json({
        success: false,
        data: "",
        message: "User Id is required"
      })
    }
    const date = new Date();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const geteod = await Eod.findOne({
      userid: id,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    }).select("eod_description")

    if (geteod) {
      return res.status(200).json({
        success: true,
        data: geteod,
        message: "Eod task fetched successfully"
      })
    } else {
      return res.status(200).json({
        success: true,
        data: "",
        message: "No data found"
      })
    }

  } catch (err) {
    next(err)
  }
}