const cron = require("node-cron");
const followup_model = require("../models/Followups.model");
const notification_model = require("../models/notifications.model");
const {connectedUsers} = require("../socket/connectedUsers");
const today = new Date().toISOString()?.split("T")?.[0];

const startFollowupsCron = (io) => {
  // console.log("connectedUsersFromFollowups", connectedUsers);

  try {
    cron.schedule("* * * * * *", async () => {
      const todayFollowups = await followup_model.find({ followup_date: today, is_notified: false, status: "pending" }).populate("refId");
      for (const followup of todayFollowups) {
        // console.log("object")
  // console.log("connectedUsersFromFollowups", connectedUsers);
  let date = followup?.followup_date;
        let time = followup?.followup_time?.split(":");
        date.setHours(Number(time[0]));
        date.setMinutes(Number(time[1]));
        const currentTime = Date.now();
        const IST_OFFSET = 5 * 60 * 60 * 1000 + 30 * 60 * 1000;
        if (currentTime + IST_OFFSET >= date.getTime() + IST_OFFSET) {
          try {
            console.log("bhello")
             await followup_model.findByIdAndUpdate(followup?._id, { is_notified: true });
             const newNotification = await notification_model.create({
               type: "followup",
               followup: followup?._id,
               status: "pending",
               to: followup?.assigned_to,
             });

             const foundNotification = await notification_model.findById(newNotification?._id).populate("followup");
             io?.to(connectedUsers[followup?.assigned_to]).emit("notify-followup", {
               data: foundNotification,
               type: "followup",
             });
          } catch (error) {
            console.log(error)
          }
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
};
module.exports = startFollowupsCron;
