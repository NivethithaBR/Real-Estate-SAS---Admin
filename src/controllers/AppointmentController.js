const errorHandler = require("../utils/ErrorHandler");
const appointment = require("../models/Appointment")
const notification_model = require("../models/notifications.model")
const createAppointment = async (req, res, next) => {
    try {
        console.log(req?.body, "req?.bodyhere")
        const { followup_date, followup_time, status, remarks, refId, refType, assigned_to } = req?.body

        const store = await appointment.create({
            followup_date: followup_date,
            followup_time: followup_time,
            remarks: remarks,
            refId: refId,
            refType: refType,
            status: status,
            assigned_to: assigned_to
        })

        if (store) {
            // const createNotify = await notification_model.create({
            //     type: "appointment",
            //     appointmentid: store?._id,
            //     to: store?.assigned_to,
            // })
            return res.status(200).json({
                success: true,
                result: store,
                message: "Appointment made successfully"
            })
        } else {
            return res.status(400).json({
                success: false,
                result: "",
                message: "Unable to make appointment"
            })
        }


    } catch (error) {
        next(error)
    }
}

const updateAppointment = async (req, res, next) => {
    try {
        console.log(req?.body, "req?.bodyhere")
        const { status, appid } = req?.body
        if (status != undefined && status != "" && status != null) {
            const update = await appointment.findOneAndUpdate({
                _id: appid,
            }, {
                $set: { status: status }
            },
                { new: true })

            if (update) {
                return res.status(200).json({
                    success: true,
                    result: update,
                    message: "Appointment updated successfully"
                })
            } else {
                return res.status(400).json({
                    success: false,
                    result: "",
                    message: "Unable to update appointment"
                })
            }

        } else {
            return res.status(400).json({
                success: false,
                result: "",
                message: "Status is required"
            })
        }
        return res.status(400).json({
            success: false,
            result: "",
            message: "Unable to update appointment"
        })
    } catch (error) {
        next(error)
    }
}

const getAllAppointment = async (req, res, next) => {
    try {
        const { id } = req?.query
        if (!id) {
            return res.status(400).json({
                success: false,
                result: "",
                message: "Refrerence ID is required"
            })
        }
        const getappointment = await appointment.find({ refId: id })
        console.log(getappointment, "getappointment")
        if (getappointment.length > 0) {
            return res.status(200).json({
                success: true,
                result: getappointment,
                message: "Appointment fetched successfully"
            })
        } else {
            return res.status(200).json({
                success: false,
                result: "",
                message: "Nothing to fetch"
            })
        }


    } catch (error) {
        next(error)
    }
}

const deleteAppointment = async (req, res, next) => {
    try {
        const { id } = req?.query
        if (!id) {
            return res.status(400).json({
                success: false,
                result: "",
                message: "Refrerence ID is required"
            })
        }
        const getappointment = await appointment.findByIdAndDelete(id)
        if (getappointment) {
            return res.status(200).json({
                success: true,
                result: "",
                message: "Appointment deleted successfully"
            })
        } else {
            return res.status(200).json({
                success: false,
                result: "",
                message: "Unable to delete appointment"
            })
        }


    } catch (error) {
        next(error)
    }
}

module.exports = { createAppointment, getAllAppointment, updateAppointment, deleteAppointment }