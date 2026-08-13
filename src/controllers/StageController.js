const plotstage = require("../models/plotstage");
const plotstageadded = require("../models/plotstageadded");
const mongoose = require("mongoose");
const { uploader } = require("../utils/helpers");

const stages = async (req, res) => {
    try {
        console.log(req?.body, "get all datas")
        if (!req?.body?.stagename || req?.body?.stagename == "") {
            return res.status(400).json({ success: false, message: "Stage name is required", data: "" });
        }
        const { invid } = req?.body
        if (invid) {
            const stage = await plotstage.findOneAndUpdate({ _id: invid }, { $set: { stagename: req?.body?.stagename } });
            if (stage) {
                return res.status(200).json({ success: true, message: "Stage updated successfully", data: stage });
            } else {
                return res.status(400).json({ success: false, message: "Unable to update stage", data: "" });
            }
        }
        const stages = await plotstage.create({
            stagename: req?.body?.stagename
        });
        if (stages) {
            return res.status(200).json({ success: true, message: "Stage created successfully", data: stages });
        }
        return res.status(400).json({ success: false, message: "Unable to create stage", data: "" });
    } catch (err) {
        return res.status(400).json({ success: false, message: `Error - ${err.message}`, data: "" });
    }
}

const stagesEdit = async (req, res) => {
    try {

        const { id } = req?.body
        if (id) {
            const stage = await plotstage.findOne({ _id: id });
            if (stage) {
                return res.status(200).json({ success: true, message: "Stage fetched successfully", data: stage });
            } else {
                return res.status(400).json({ success: false, message: "Unable to fetch stage", data: "" });
            }
        }

        return res.status(400).json({ success: false, message: "Stage not found", data: "" });
    } catch (err) {
        return res.status(400).json({ success: false, message: `Error - ${err.message}`, data: "" });
    }
}

const stagesDelete = async (req, res) => {
    try {

        const { id } = req?.body
        if (id) {
            const stage = await plotstage.findOneAndDelete({ _id: id });
            if (stage) {
                return res.status(200).json({ success: true, message: "Stage deleted successfully", data: stage });
            } else {
                return res.status(400).json({ success: false, message: "Unable to delete stage", data: "" });
            }
        }

        return res.status(400).json({ success: false, message: "Stage not found", data: "" });
    } catch (err) {
        return res.status(400).json({ success: false, message: `Error - ${err.message}`, data: "" });
    }
}

const StagesList = async (req, res) => {
    try {
        const { page, limit } = req?.query
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const inventoryUnits = await plotstage.aggregate([
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

        const totalCount = await plotstage.countDocuments({});

        if (inventoryUnits.length > 0) {
            return res.status(200).json({
                success: true, message: "Stages fetched", data: inventoryUnits,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(totalCount / limitNum),
                    totalItems: totalCount,
                    limit: limitNum
                }
            });
        } else {
            return res.status(200).json({ success: false, message: "No data found", data: "" });
        }
    } catch (err) {
        return res.status(400).json({ success: false, message: err?.message, data: "" });
    }
}

const StagesListdatas = async (req, res) => {
    try {

        const inventoryUnits = await plotstage.find({}).select('_id stagename');


        if (inventoryUnits.length > 0) {
            return res.status(200).json({
                success: true, message: "Stages fetched", data: inventoryUnits,

            });
        } else {
            return res.status(200).json({ success: false, message: "No data found", data: "" });
        }
    } catch (err) {
        return res.status(400).json({ success: false, message: err?.message, data: "" });
    }
}

const stageaddon = async (req, res) => {
    try {

        const { invid } = req?.body

        if (invid) {
            let payloads = {
                plot: req?.body?.plotid,
                stage: req?.body?.stage,
                stagecost: req?.body?.stagecost
            }
            if (req.file) {
                const uploadResult = await uploader(
                    req.file,
                    "plot_stage_photo"
                );

                payloads.plot_stage_photo = {
                    public_id: uploadResult.public_id,
                    url: uploadResult.secure_url,
                };
            }

            const stages = await plotstageadded.findOneAndUpdate({_id : invid},payloads);
            if (stages) {
                return res.status(200).json({ success: true, message: "Stage cost added successfully", data: stages });
            }
            return res.status(400).json({ success: false, message: "Unable to add stage cost", data: "" });
        }

        let payloads = {
            plot: req?.body?.plotid,
            stage: req?.body?.stage,
            stagecost: req?.body?.stagecost
        }
        if (req.file) {
            const uploadResult = await uploader(
                req.file,
                "plot_stage_photo"
            );

            payloads.plot_stage_photo = {
                public_id: uploadResult.public_id,
                url: uploadResult.secure_url,
            };
        }

        const stages = await plotstageadded.create(payloads);
        if (stages) {
            return res.status(200).json({ success: true, message: "Stage cost added successfully", data: stages });
        }
        return res.status(400).json({ success: false, message: "Unable to add stage cost", data: "" });
    } catch (err) {
        return res.status(400).json({ success: false, message: `Error - ${err.message}`, data: "" });
    }
}

const stagecostList = async (req, res) => {
    try {
        const { page, limit } = req?.query
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const plotsId = req?.body?.plotid ? new mongoose.Types.ObjectId(req?.body?.plotid) : "";
        const matchStage = {
            plot: plotsId ? plotsId : ""
        };
        const inventoryUnits = await plotstageadded.aggregate([
            {
                $lookup: {
                    from: "plots",
                    localField: "plot",
                    foreignField: "_id",
                    as: "plotDetails"
                }
            },
            {
                $unwind: {
                    path: "$plotDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "plotstages",
                    localField: "stage",
                    foreignField: "_id",
                    as: "stageDetails"
                }
            },
            {
                $unwind: {
                    path: "$stageDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: matchStage
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

        const totalCount = await plotstageadded.countDocuments({});
        if (inventoryUnits.length > 0) {
            return res.status(200).json({
                success: true, message: "Stages fetched", data: inventoryUnits,
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(totalCount / limitNum),
                    totalItems: totalCount,
                    limit: limitNum
                }
            });
        } else {
            return res.status(200).json({ success: false, message: "No data found", data: "" });
        }
    } catch (err) {
        return res.status(400).json({ success: false, message: err?.message, data: "" });
    }
}

const stagecostEdit = async (req, res) => {
    try {
        console.log(req?.body, "get the id")

        const { editid } = req?.body
        const getTheId = new mongoose.Types.ObjectId(editid);
        if (editid) {
            console.log(getTheId, "get the id")
            const stage = await plotstageadded.findOne({ _id: getTheId });
            if (stage) {
                return res.status(200).json({ success: true, message: "Stage fetched successfully", data: stage });
            } else {
                return res.status(400).json({ success: false, message: "Unable to fetch stage", data: "" });
            }
        }

        return res.status(400).json({ success: false, message: "Stage not found", data: "" });
    } catch (err) {
        return res.status(400).json({ success: false, message: `Error - ${err.message}`, data: "" });
    }
}

module.exports = { stages, stagesEdit, StagesList, stagesDelete, StagesListdatas, stageaddon, stagecostList, stagecostEdit };