const cron = require("node-cron");
const Metatokens = require("../models/Metatokens")
const { sendMail } = require("../utils/helpers")
const Enquiry = require("../models/Enquiry");
const Booked = require("../models/Booked");
const followup = require("../models/Followups.model")
const appointment = require("../models/Appointment")
const notifications = require("../models/notifications.model")
const {connectedUsers} = require("../socket/connectedUsers");

const trackEnquiry = (io) => {
    try {
        console.log("Track enquiry cron")

        cron.schedule("0 * * * * *", async () => {
            const now = new Date();
            const dateofToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

            const dateofTodayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

            const currentHour = String(now.getHours()).padStart(2, '0');
            const currentMinute = String(now.getMinutes()).padStart(2, '0');
            const exactCurrentTimeStr = `${currentHour}:${currentMinute}`;


            const nextMinuteRaw = new Date(now.getTime() + 60000);
            const nextHour = String(nextMinuteRaw.getHours()).padStart(2, '0');
            const nextMinute = String(nextMinuteRaw.getMinutes()).padStart(2, '0');
            const exactNextTimeStr = `${nextHour}:${nextMinute}`;

            const getTrackFollow = await followup.find({
                followup_date: dateofToday,
                followup_time: {
                    $in: [exactCurrentTimeStr, exactNextTimeStr]
                }
            })

            const getTrackAppoint = await appointment.find({
                followup_date: dateofTodayStr,
                followup_time: {
                    $in: [exactCurrentTimeStr, exactNextTimeStr]
                }
            })

            if (getTrackFollow.length > 0) {
                let stageName = "";
                for (const enq of getTrackFollow) {

                    const findthefollowEnq = await Enquiry.findOne({ _id: enq?.refId })
                    const findthefollowBk = await Booked.findOne({ _id: enq?.refId })

                    if (findthefollowEnq) {
                        stageName = "lead"
                    }
                    if (findthefollowBk) {
                        stageName = "booked"
                    }
                    if (!findthefollowEnq && !findthefollowBk) {
                        console.log(`Referrence enquiry or booked asset not found - ${enq?._id}`)
                        continue;
                    }

                    const check = await notifications.find({
                        type: "followup",
                        to: enq?.assigned_to,
                        followupid: enq?._id,
                    })

                    if (check.length === 0) {

                        const storeNotify = await notifications.create({
                            type: "followup",
                            to: enq?.assigned_to,
                            stage: stageName,
                            followupid: enq?._id,
                        })

                        // const foundNotification = await notifications.findById(storeNotify?._id).populate("followupid");
                        // io?.to(connectedUsers[enq?.assigned_to]).emit("notify-followup", {
                        //     data: foundNotification,
                        // });

                        console.log("cron completed for followup")

                        if (!storeNotify) {
                            console.log(`Error : Unable to create notification for leads enquiry - check cron`)
                        }
                    }

                }
            }

            if (getTrackAppoint.length > 0) {
                let stageName = "";
                for (const enqs of getTrackAppoint) {

                    const findthefollowEnq = await Enquiry.findOne({ _id: enqs?.refId })
                    const findthefollowBk = await Booked.findOne({ _id: enqs?.refId })

                    if (findthefollowEnq) {
                        stageName = "lead"
                    }
                    if (findthefollowBk) {
                        stageName = "booked"
                    }
                    if (!findthefollowEnq && !findthefollowBk) {
                        console.log(`Referrence enquiry or booked asset not found - ${enqs?._id}`)
                        continue;
                    }

                    const check = await notifications.find({
                        type: "appointment",
                        to: enqs?.assigned_to,
                        appointmentid: enqs?._id,
                    })

                    if (check.length === 0) {

                        const storeNotify = await notifications.create({
                            type: "appointment",
                            to: enqs?.assigned_to,
                            stage: stageName,
                            appointmentid: enqs?._id,
                        })

                        console.log("cron completed for appointments")

                        if (!storeNotify) {
                            console.log(`Error : Unable to create notification for leads enquiry - check cron`)
                        }
                    }

                }
            }
            console.log("Cron completed for all")
        }, {
            timezone: "Asia/Kolkata"
        });

    } catch (error) {
        console.log(`Error in cron : Unable to create notification for leads enquiry - check cron`)
    }
}

module.exports = { trackEnquiry }