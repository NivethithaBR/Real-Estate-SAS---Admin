const Supplier = require("../models/Supplier")

const createSupplier = async (req, res) => {
    try {

        if (req?.body?.invid && req?.body?.invid != "") {

            const storeData = await Supplier.findOneAndUpdate({ _id: req?.body?.invid },
                {
                    $set: {
                        suppliername: req?.body?.suppliername,
                        address: req?.body?.address,
                        contactnumber: req?.body?.contactnumber,
                    }
                }
            )

            if (storeData) {
                return res.status(200).json({ success: true, message: "Supplier Created", data: storeData });
            }
            return res.status(400).json({ success: false, message: "Unable to update", data: "" });
        }
        payloads = {
            suppliername: req?.body?.suppliername,
            address: req?.body?.address,
            contactnumber: req?.body?.contactnumber,
        }
        const storeData = await Supplier.create(payloads)
        if (storeData) {
            return res.status(200).json({ success: true, message: "Supplier Created", data: storeData });
        }
        return res.status(400).json({ success: false, message: "Unable to update", data: "" });
    } catch (err) {
        return res.status(400).json({ success: false, message: err?.message, data: "" });
    }
}

const editSupplier = async (req, res) => {
    try {
        const { id } = req?.body
        if (!id) {
            return res.status(400).json({ success: false, message: "Id not found", data: "" });
        }
        const inventoryUnits = await Supplier.findOne({ _id: id })
        if (inventoryUnits) {
            return res.status(200).json({ success: true, message: "Supplier datas fetched successfully", data: inventoryUnits });
        } else {
            return res.status(400).json({ success: false, message: "Unable to fetch data", data: "" });

        }

    } catch (err) {
        return res.status(400).json({ success: false, message: err?.message, data: "" });
    }


}

const SupplierList = async (req, res) => {
    try {
        const { page, limit } = req?.query
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        const inventoryUnits = await Supplier.aggregate([
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

        const totalCount = await Supplier.countDocuments({});

        if (inventoryUnits.length > 0) {
            return res.status(200).json({
                success: true, message: "Suppliers fetched", data: inventoryUnits,
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

const SupplierMaster = async (req, res) => {
    try {
        const inventoryUnits = await Supplier.find({}).select("_id suppliername");

        if (inventoryUnits.length > 0) {
            return res.status(200).json({
                success: true,
                message: "Suppliers master fetched",
                data: inventoryUnits,
            });
        } else {
            return res.status(200).json({ success: false, message: "No data found", data: "" });
        }
    } catch (err) {
        return res.status(400).json({ success: false, message: err?.message, data: "" });
    }
}

module.exports = { createSupplier, editSupplier, SupplierList, SupplierMaster }