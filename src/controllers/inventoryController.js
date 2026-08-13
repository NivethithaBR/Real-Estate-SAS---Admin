const inventory = require("../models/Inventory")
const unitsModel = require("../models/unit")
const inventorycategory = require("../models/InventoryCategory")
const InventoryRegister = require("../models/InventoryRegister")
const InventoryAdjustment = require("../models/InventoryAdjustment")
const { inventoryServices, createInventory, updateInventory } = require("../services/inventory/inventoryServices")
const InventoryRecord = require("../models/InventoryRecord")
const { uploader } = require("../utils/helpers");
const mongoose = require("mongoose")
const godownmaster = require("../models/godownmaster")
const addInventory = async (req, res) => {
    try {

        const { inventoryname, category, unit, openingstock } = req?.body

        if (!inventoryname) {
            return res.status(400).json({ success: false, message: "Inventory name is required", data: "" });
        }

        if (!category) {
            return res.status(400).json({ success: false, message: "Category is required", data: "" });
        }

        if (!unit) {
            return res.status(400).json({ success: false, message: "Unit is required", data: "" });
        }

        if (req?.body?.invid) {
            const update = await inventory.findOneAndUpdate({ _id: req?.body?.invid },
                {
                    $set: { inventoryname: inventoryname, category: category, unit: unit }
                })
            if (update) {

                const invRecs = await updateInventory(req?.body?.invid, req?.body?.openingstock)

                return res.status(200).json({ success: true, message: "Inventory updated successfully", data: update });
            } else {
                return res.status(400).json({ success: false, message: error?.message, data: "" });
            }


        }
        const store = await inventory.create({
            inventoryname: inventoryname,
            category: category,
            unit: unit
        })


        if (store) {
            const invRecs = await createInventory(store?._id, openingstock)

            return res.status(200).json({ success: true, message: "Inventory created successfully", data: store });
        } else {
            return res.status(400).json({ success: false, message: error?.message, data: "" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: error?.message, data: "" });
    }
}

const listInventory = async (req, res) => {
    try {
        const { page, limit } = req?.query
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const inventorys = await inventory.find({})
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 })

        const totalCount = await inventory.countDocuments({});

        if (inventorys.length > 0) {
            return res.status(200).json({
                success: true, message: "Inventory list fetched", data: inventorys,
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

const getEditInventory = async (req, res) => {
    try {
        const { id } = req?.body
        if (!id) {
            return res.status(400).json({ success: false, message: "Id not found", data: "" });
        }
        let inventorycategorys = await inventory.findOne({ _id: id }).select("inventoryname category unit").lean()
        let inventoryOp = await InventoryRecord.findOne({ stock: id }).select("openingstock").lean()

        const datas = {
            ...inventorycategorys,
            openingstock: inventoryOp?.openingstock ?? 0
        };

        if (inventorycategorys && inventoryOp) {
            return res.status(200).json({ success: true, message: "Inventory fetched successfully", data: datas });

        } else {
            return res.status(400).json({ success: false, message: "Unable to fetch", data: "" });

        }

    } catch (err) {
        return res.status(400).json({ success: false, message: err?.message, data: "" });
    }
}

const addInventoryCategory = async (req, res) => {
    try {

        const { categoryname } = req?.body

        if (!categoryname) {
            return res.status(400).json({ success: false, message: "Category name is required", data: "" });
        }

        if (req?.body?.invid) {
            const update = await inventorycategory.findOneAndUpdate({ _id: req?.body?.invid },
                {
                    $set: { categoryname: categoryname }
                })
            if (update) {
                return res.status(200).json({ success: true, message: "Inventory updated successfully", data: update });
            } else {
                return res.status(400).json({ success: false, message: error?.message, data: "" });
            }

        }
        console.log("camehere")
        const store = await inventorycategory.create({
            categoryname: categoryname
        })

        if (store) {
            return res.status(200).json({ success: true, message: "Inventory created successfully", data: store });
        } else {
            return res.status(400).json({ success: false, message: error?.message, data: "" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: error?.message, data: "" });
    }
}

const getInventoryCategory = async (req, res) => {
    try {
        const { page, limit } = req?.query
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const inventorycategorys = await inventorycategory.find({})
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 })

        const totalCount = await inventorycategory.countDocuments({});

        if (inventorycategorys.length > 0) {
            return res.status(200).json({
                success: true, message: "Inventory list fetched", data: inventorycategorys,
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

const getEditCategory = async (req, res) => {
    try {
        const { id } = req?.body
        if (!id) {
            return res.status(400).json({ success: false, message: "Id not found", data: "" });
        }
        const inventorycategorys = await inventorycategory.findOne({ _id: id }).select("categoryname")
        if (inventorycategorys) {
            return res.status(200).json({ success: true, message: "Category fetched successfully", data: inventorycategorys });

        } else {
            return res.status(400).json({ success: false, message: "Unable to fetch", data: "" });

        }

    } catch (err) {
        return res.status(400).json({ success: false, message: err?.message, data: "" });
    }
}

const getInventoryCategoryNames = async (req, res) => {
    try {

        const inventorycategorys = await inventorycategory.find({}).select("categoryname _id")

        if (inventorycategorys.length > 0) {
            return res.status(200).json({
                success: true, message: "Inventory list fetched", data: inventorycategorys,
            });
        } else {
            return res.status(200).json({ success: false, message: "No data found", data: "" });
        }
    } catch (err) {
        return res.status(400).json({ success: false, message: err?.message, data: "" });
    }
}

// const getInventoryCategoryNames = async (req, res) => {
//     try {

//         const inventorycategorys = await inventorycategory.find({}).select("categoryname _id")

//         if (inventorycategorys.length > 0) {
//             return res.status(200).json({
//                 success: true, message: "Inventory list fetched", data: inventorycategorys,
//             });
//         } else {
//             return res.status(200).json({ success: false, message: "No data found", data: "" });
//         }
//     } catch (err) {
//         return res.status(400).json({ success: false, message: err?.message, data: "" });
//     }
// }

const addInventoryUnits = async (req, res) => {
    try {

        const { units } = req?.body

        if (!units) {
            return res.status(400).json({ success: false, message: "units is required", data: "" });
        }

        if (req?.body?.invid) {
            const update = await unitsModel.findOneAndUpdate({ _id: req?.body?.invid },
                {
                    $set: { units: units }
                })
            if (update) {
                return res.status(200).json({ success: true, message: "units updated successfully", data: update });
            } else {
                return res.status(400).json({ success: false, message: error?.message, data: "" });
            }

        }
        const store = await unitsModel.create({
            units: units
        })

        if (store) {
            return res.status(200).json({ success: true, message: "Units created successfully", data: store });
        } else {
            return res.status(400).json({ success: false, message: error?.message, data: "" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: error?.message, data: "" });
    }


}

const getInventoryUnits = async (req, res) => {
    try {
        const { page, limit } = req?.query
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const inventoryUnits = await unitsModel.find({})
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 })

        const totalCount = await unitsModel.countDocuments({});

        if (inventoryUnits.length > 0) {
            return res.status(200).json({
                success: true, message: "Inventory list fetched", data: inventoryUnits,
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

const getEditUnits = async (req, res) => {
    try {
        const { id } = req?.body

        if (!id) {
            return res.status(400).json({ success: false, message: "Id not found", data: "" });
        }
        console.log(id, "sdfsdfd")

        const inventoryUnits = await unitsModel.findOne({ _id: id })
        if (inventoryUnits) {
            return res.status(200).json({ success: true, message: "Inventory Unit fetched successfully", data: inventoryUnits });

        } else {
            return res.status(400).json({ success: false, message: "Unable to fetch data", data: "" });

        }

    } catch (err) {
        return res.status(400).json({ success: false, message: err?.message, data: "" });
    }
}

const getEditInventoryTran = async (req, res) => {
    try {
        const { id } = req?.body
        if (!id) {
            return res.status(400).json({ success: false, message: "Id not found", data: "" });
        }
        const inventoryUnits = await InventoryRegister.findOne({ _id: id })
        if (inventoryUnits) {
            return res.status(200).json({ success: true, message: "Inventory transaction fetched successfully", data: inventoryUnits });

        } else {
            return res.status(400).json({ success: false, message: "Unable to fetch data", data: "" });

        }

    } catch (err) {
        return res.status(400).json({ success: false, message: err?.message, data: "" });
    }
}

const getInventoryUnitsNames = async (req, res) => {
    try {

        const inventorycategorys = await unitsModel.find({}).select("units _id")

        if (inventorycategorys.length > 0) {
            return res.status(200).json({
                success: true, message: "Units list fetched", data: inventorycategorys,
            });
        } else {
            return res.status(200).json({ success: false, message: "No data found", data: "" });
        }
    } catch (err) {
        return res.status(400).json({ success: false, message: err?.message, data: "" });
    }
}

const initInventoryManagementData = async (req, res) => {
    try {
        let payloads = {};


        if (req?.body?.invid && req?.body?.invid != "") {
            payloads = {
                stock: req?.body?.stock,
                quantity: req?.body?.quantity,
                transaction_type: req?.body?.transaction_type,
                remarks: req?.body?.remarks
            }

            const storeData = await InventoryRegister.findOneAndUpdate({ _id: req?.body?.invid },
                {
                    $set: {
                        stock: req?.body?.stock,
                        quantity: req?.body?.quantity,
                        transaction_type: req?.body?.transaction_type,
                        remarks: req?.body?.remarks
                    }
                }
            )

            if (storeData) {
                const recPay = [{
                    stock: req?.body?.stock,
                    quantity: req?.body?.quantity
                }]
                let trTypes;
                if (req?.body?.transaction_type == "Stock-Inward") {
                    trTypes = "add"
                }
                if (req?.body?.transaction_type == "Stock-Outward") {
                    trTypes = "reduce"
                }
                const recordInv = await inventoryServices(recPay, trTypes)
                return res.status(200).json({ success: true, message: "Inventory transaction updated", data: storeData });
            }
            return res.status(400).json({ success: false, message: "Unable to update", data: "" });


        }
        payloads = {
            stock: req?.body?.stock,
            quantity: req?.body?.quantity,
            transaction_type: req?.body?.transaction_type,
            remarks: req?.body?.remarks
        }

        if (req?.body?.transaction_type == "Stock-Outward") {
            const chkInvRec = await InventoryRecord.findOne({ stock: req?.body?.stock })
            if (chkInvRec) {
                if (chkInvRec?.overalltotal < req?.body?.quantity) {
                    return res.status(400).json({ success: false, message: "Not enough stock available", data: "" });
                }
            } else {
                return res.status(400).json({ success: false, message: "Stock not available", data: "" });
            }

        }

        const storeData = await InventoryRegister.create(payloads)
        if (storeData) {

            const recPay = [{
                stock: req?.body?.stock,
                quantity: req?.body?.quantity
            }]
            let trTypes;
            if (req?.body?.transaction_type == "Stock-Inward") {
                trTypes = "add"
            }
            if (req?.body?.transaction_type == "Stock-Outward") {
                trTypes = "reduce"
            }
            const recordInv = await inventoryServices(recPay, trTypes)

            return res.status(200).json({ success: true, message: "Inventory transaction recorded", data: storeData });
        }
        return res.status(400).json({ success: false, message: "Unable to create", data: "" });

    } catch (err) {
        return res.status(400).json({ success: false, message: err?.message, data: "" });
    }
}

const editTransaction = async (req, res) => {
    try {

        const storeData = await InventoryRegister.findOne({
            _id: req?.body?.id
        })
        if (storeData) {
            return res.status(200).json({ success: true, message: "Inventory transaction fetched", data: storeData });
        }
        return res.status(400).json({ success: false, message: "Unable to fetch data", data: "" });
    } catch (err) {
        return res.status(400).json({ success: false, message: err?.message, data: "" });
    }
}

const initInventoryManagementDataList = async (req, res) => {
    try {
        const { page, limit } = req?.query
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const inventoryUnits = await InventoryRegister.aggregate([
            {
                $lookup: {
                    from: "inventories",
                    localField: "stock",
                    foreignField: "_id",
                    as: "stocks",
                },
            },
            {
                $unwind: {
                    path: "$stocks",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "units",
                    localField: "unit",
                    foreignField: "_id",
                    as: "unit",
                },
            },
            {
                $unwind: {
                    path: "$unit",
                    preserveNullAndEmptyArrays: true,
                },
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


        const totalCount = await InventoryRegister.countDocuments({});

        if (inventoryUnits.length > 0) {
            return res.status(200).json({
                success: true, message: "Inventory list fetched", data: inventoryUnits,
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

const productsList = async (req, res) => {
    try {
        const getProducts = await inventory.find({}).select("inventoryname")
        if (getProducts.length > 0) {
            return res.status(200).json({ success: true, data: getProducts, message: "Products fetched" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: error?.message, data: "" });
    }
}

const getInventoryUnitsList = async (req, res) => {
    try {

        const inventorycategorys = await unitsModel.find({}).select("units _id")

        if (inventorycategorys.length > 0) {
            return res.status(200).json({
                success: true, message: "Units list fetched", data: inventorycategorys,
            });
        } else {
            return res.status(200).json({ success: false, message: "No data found", data: "" });
        }
    } catch (err) {
        return res.status(400).json({ success: false, message: err?.message, data: "" });
    }
}

const initAdjustmentData = async (req, res) => {
    try {
        let payloads = {};
       
        if (req?.body?.adjustment_type == "Decrease") {
            const getCounts = await InventoryRecord.findOne({ stock: req?.body?.stock })
            if (getCounts) {
                if (getCounts?.overalltotal < req?.body?.quantity) {
                    return res.status(400).json({ success: false, message: "Not enough stock available", data: "" });
                }
            } else {
                return res.status(400).json({ success: false, message: "Stock not available", data: "" });
            }
        }

        payloads = {
            stock: req?.body?.stock,
            quantity: req?.body?.quantity,
            adjustment_type: req?.body?.adjustment_type,
            remarks: req?.body?.remarks
        }

        if (req.file) {
            const uploadResult = await uploader(
                req.file,
                "approvalphoto"
            );

            payloads.approvalphoto = {
                public_id: uploadResult.public_id,
                url: uploadResult.secure_url,
            };
        }
        
        const storeData = await InventoryAdjustment.create(payloads)
        if (storeData) {

            return res.status(200).json({ success: true, message: "Adjustment pending for admin approval", data: storeData });
        }
        return res.status(400).json({ success: false, message: "Unable to create", data: "" });
    } catch (err) {
        return res.status(400).json({ success: false, message: err?.message, data: "" });
    }
}

const editAdjustment = async (req, res) => {
    try {

        const storeData = await InventoryAdjustment.findOne({
            _id: req?.body?.id
        })
        if (storeData) {
            return res.status(200).json({ success: true, message: "Inventory adjustment fetched", data: storeData });
        }
        return res.status(400).json({ success: false, message: "Unable to fetch data", data: "" });
    } catch (err) {
        return res.status(400).json({ success: false, message: err?.message, data: "" });
    }
}

const initInventoryAdjustmentDataList = async (req, res) => {
    try {
        const { page, limit } = req?.query
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const inventoryUnits = await InventoryAdjustment.aggregate([
            {
                $lookup: {
                    from: "inventories",
                    localField: "stock",
                    foreignField: "_id",
                    as: "stocks",
                },
            },
            {
                $unwind: {
                    path: "$stocks",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "units",
                    localField: "unit",
                    foreignField: "_id",
                    as: "unit",
                },
            },
            {
                $unwind: {
                    path: "$unit",
                    preserveNullAndEmptyArrays: true,
                },
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


        const totalCount = await InventoryAdjustment.countDocuments({});

        if (inventoryUnits.length > 0) {
            return res.status(200).json({
                success: true, message: "Inventory adjustment list fetched", data: inventoryUnits,
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

const inventoryReport = async (req, res) => {
    try {
        const { page, limit } = req?.query
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const inventoryUnits = await InventoryRecord.aggregate([
            {
                $lookup: {
                    from: "inventories",
                    localField: "stock",
                    foreignField: "_id",
                    as: "stocks",
                },
            },
            {
                $unwind: {
                    path: "$stocks",
                    preserveNullAndEmptyArrays: true,
                },
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


        const totalCount = await InventoryRecord.countDocuments({});

        if (inventoryUnits.length > 0) {
            return res.status(200).json({
                success: true, message: "Inventory list fetched", data: inventoryUnits,
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

const updateApprovalData = async (req, res) => {
    try {
        let payloads = {};
        // console.log(req?.params, req?.body?.status, "Rise Above")

        if (req?.params?.id && req?.params?.id != "") {
            payloads = {
                status: req?.body?.status,
            }

            const storeDatass = await InventoryAdjustment.findOne({ _id: req?.params?.id })

            if (storeDatass?.adjustment_type == "Decrease") {
                const getCounts = await InventoryRecord.findOne({ stock: req?.body?.stock })
                if (getCounts && getCounts?.overalltotal < req?.body?.quantity) {
                    return res.status(400).json({ success: false, message: "Not enough stock available", data: "" });
                }
            }

            const storeData = await InventoryAdjustment.findOneAndUpdate({ _id: req?.params?.id },
                {
                    $set: {
                        status: req?.body?.status,
                    }
                }, {
                new: true
            }
            )

            if (req?.body?.status == "Accepted") {
                if (storeData) {

                    const recPay = [{
                        stock: storeData?.stock,
                        quantity: storeData?.quantity
                    }]
                    let trTypes;
                    if (storeData?.adjustment_type == "Increase") {
                        trTypes = "add"
                    }
                    if (storeData?.adjustment_type == "Decrease") {
                        trTypes = "reduce"
                    }
                    const recordInv = await inventoryServices(recPay, trTypes)

                    return res.status(200).json({ success: true, message: "Inventory adjustment updated", data: storeData });
                }
            }

            if (storeData) {
                return res.status(200).json({ success: true, message: "Status updated", data: "" });
            }
            return res.status(400).json({ success: false, message: "Unable to update", data: "" });



        }

        
    } catch (err) {
        return res.status(400).json({ success: false, message: err?.message, data: "" });
    }
}

const addGodown = async (req, res) => {
    try {

        const { godownname } = req?.body

        if (!godownname) {
            return res.status(400).json({ success: false, message: "Godown name required", data: "" });
        }

        if (req?.body?.invid) {
            const update = await godownmaster.findOneAndUpdate({ _id: req?.body?.invid },
                {
                    $set: { godownname: godownname }
                })
            if (update) {
                return res.status(200).json({ success: true, message: "Godown updated successfully", data: update });
            } else {
                return res.status(400).json({ success: false, message: error?.message, data: "" });
            }

        }

        const store = await godownmaster.create({
            godownname: godownname
        })

        if (store) {
            return res.status(200).json({ success: true, message: "Godown created successfully", data: store });
        } else {
            return res.status(400).json({ success: false, message: error?.message, data: "" });
        }
    } catch (error) {
        return res.status(400).json({ success: false, message: error?.message, data: "" });
    }
}


module.exports = { addInventory, addInventoryCategory, getInventoryCategory, getEditCategory, listInventory, getEditInventory, getInventoryCategoryNames, addInventoryUnits, getInventoryUnits, getEditUnits, getInventoryUnitsNames, initInventoryManagementData, productsList, getInventoryUnitsList, initInventoryManagementDataList, editTransaction, initAdjustmentData, editAdjustment, initInventoryAdjustmentDataList, getEditInventoryTran, inventoryReport, updateApprovalData }