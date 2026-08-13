const { Schema, model } = require("mongoose");

const Appointments = new Schema(
    {
        status: {
            type: String,
        },
        refType: {
            type: String,
        },
        refId: {
            type: Schema.Types.ObjectId
        },
        assigned_to: {
            type: Schema.Types.ObjectId,
            ref: "users",
        },
        followup_date: {
            type: Date,
        },
        followup_time: {
            type: String,
        },
        remarks: {
            type: String,
        },
        is_notified: {
            type: String,
            default: "false"
        },

    },
    {
        timestamps: true,
    }
);

const appointment = model("Appointment", Appointments);

module.exports = appointment;
