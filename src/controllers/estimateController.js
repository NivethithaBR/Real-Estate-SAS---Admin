const estimates = require("../models/estimatelimitmodel");
const cancelduration = require("../models/cancelduration");
const Plot = require("../models/Plot");
const Booked = require("../models/Booked");


const estimateLimit = async (req, res) => {
    try {
        if (req?.body?._id) {
            const updateEstimate = await estimates.findOneAndUpdate({ _id: req?.body?._id }, { estimatelimit: req?.body?.estimatelimit }, { new: true });
            if (updateEstimate) {
                return res.status(200).json({
                    success: true,
                    message: "Estimated limit updated",
                    data: updateEstimate
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Unable to update estimated limit",
                    data: ""
                });
            }
        }

        const updateEstimate = await estimates.create({ estimatelimit: req?.body?.estimatelimit });

        if (updateEstimate) {
            return res.status(200).json({
                success: true,
                message: "Estimated limit updated",
                data: updateEstimate
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Unable to update estimated limit",
                data: ""
            });
        }
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}

const estimateLimitGet = async (req, res) => {
    try {
        const getEsimate = await estimates.find({});
        if (!getEsimate || getEsimate > 1) {
            return res.status(400).json({
                success: false,
                message: "Duplicate data or no data available",
                data: ""
            });
        }
        const getEsimates = await estimates.findOne({}).sort({ _id: -1 });
        if (getEsimates) {
            return res.status(200).json({
                success: true,
                message: "Estimate limit updated",
                data: getEsimates
            });
        } else {
            return res.status(200).json({
                success: true,
                message: "No data found",
                data: ""
            });
        }
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}

const estimatedPrice = async (req, res) => {
    try {
        const getPrice = await estimates.findOne({}).sort({ _id: -1 })
        if (getPrice) {
            return res.status(200).json({
                success: true,
                data: getPrice,
                message: "Estimated price fetched successfully"
            })
        } else {
            return res.status(400).json({
                success: true,
                message: "No data found"
            })
        }
    } catch (err) {
        return res.status(400).json({
            success: false,
            message: "Unable to fetch estimate price"
        })
    }
}

const cancelDurationGet = async (req, res) => {
    try {
        const getEsimate = await cancelduration.find({});
        if (!getEsimate || getEsimate > 1) {
            return res.status(400).json({
                success: false,
                message: "Duplicate data or no data available",
                data: ""
            });
        }
        const getEsimates = await cancelduration.findOne({}).sort({ _id: -1 });
        if (getEsimates) {
            return res.status(200).json({
                success: true,
                message: "Canceling limit updated",
                data: getEsimates
            });
        } else {
            return res.status(200).json({
                success: true,
                message: "No data found",
                data: ""
            });
        }
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}

const cancelLimit = async (req, res) => {
    try {
        if (req?.body?._id) {
            const updateEstimate = await cancelduration.findOneAndUpdate({ _id: req?.body?._id }, { duration: req?.body?.duration }, { new: true });
            if (updateEstimate) {
                return res.status(200).json({
                    success: true,
                    message: "Duration limit updated",
                    data: updateEstimate
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Unable to update duration limit",
                    data: ""
                });
            }
        }

        const updateEstimate = await cancelduration.create({ duration: req?.body?.duration });

        if (updateEstimate) {
            return res.status(200).json({
                success: true,
                message: "Duration limit updated",
                data: updateEstimate
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Unable to update duration limit",
                data: ""
            });
        }
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
}

const cancelBooking = async (req, res) => {
    try {

        const Bookedss = await Booked.findOne({ plot_id: req?.body?.id })
        const canceldurations = await cancelduration.findOne({})
        if (!Bookedss) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        const registrationDate = new Date(Bookedss.registration_date);
        const now = new Date();

        const diffMs = now - registrationDate;

        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (Number(diffDays) > Number(canceldurations?.duration)) {
            return res.status(400).json({
                success: false,
                message: `Cancellation is allowed only within ${canceldurations?.duration} days of registration.`,
            });
        }

        const book = await Plot.findOneAndUpdate({ _id: req?.body?.id },
            {
                $set: {
                    "plot_status": "Declined"
                }
            }
        )

        if (book) {
            const Bookeds = await Booked.findOneAndUpdate({ plot_id: req?.body?.id }, {
                $set: {
                    "status": "Canceled"
                }
            })

            if (Bookeds) {
                return res.status(200).json({
                    success: true,
                    data: Bookeds,
                    message : "Booking canceled successfully"
                });
            }else{
                return res.status(400).json({
                    success: false,
                    message: "Unable to cancel booking",
                });
            }
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}

module.exports = { estimateLimit, estimateLimitGet, estimatedPrice, cancelDurationGet, cancelLimit, cancelBooking }