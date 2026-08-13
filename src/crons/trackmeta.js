const cron = require("node-cron");
const Metatokens = require("../models/Metatokens")
const { sendMail } = require("../utils/helpers")
const metaReminderCron = () => {
    try {
        cron.schedule("0 0 0 * * *", async () => {
            const ceckAccess = await Metatokens.findOne({ username: "appartments" });
            if (ceckAccess && ceckAccess?.updatedAt) {
                const date = new Date(ceckAccess?.updatedAt);
                date.setUTCDate(date.getUTCDate() + 58);
                const dateProvided = date.toISOString();

                const today = new Date().toISOString().slice(0, 10);
                const targetDate = dateProvided.slice(0, 10);

                if (today === targetDate) {
                    // Send Reminder Email
                    const mailOptions = {
                        to: "marketing@slnc.in",
                        subject: "Reminder For Wizinoa Meta Login",
                        text: "Hi this is a reminder for, login from meta app for meta leads tracking",
                        file: "reminderMeta.ejs",
                        data: { full_name: "Lakshmi Narayana Constructions", target_date : targetDate },
                    };
                    const mail = await sendMail(mailOptions)

                    if (mail) {
                        console.log("Reminder mail sent");
                    } else {
                        console.log("Unable to send mail");
                    }
                }
            }
        }, {
            timezone: "Asia/Kolkata"
        });
    } catch (error) {
        console.log("Error : " + error)
    }
}

module.exports = { metaReminderCron }