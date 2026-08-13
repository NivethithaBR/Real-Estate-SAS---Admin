const cron = require("node-cron");
const users = require("../models/User")
const attendances = require("../models/Attendance.model")

const attendanceCron = () => {
    try {
        cron.schedule("0 31 9 * * *", async () => {

            let user = await users.find({ status: "Active" })
            if (user?.length > 0) {
                for (const userDatas of user) {
                    const date = new Date();
                    const startOfDay = new Date(date);
                    startOfDay.setHours(0, 0, 0, 0);
                    const endOfDay = new Date(date);
                    endOfDay.setHours(23, 59, 59, 999);
                    const getUser = await attendances.findOne({
                        userId : userDatas?._id,
                        date: { $gte: startOfDay, $lte: endOfDay },
                    })
                    if(!getUser){
                        let payloads = {
                            userId : userDatas?._id,
                            date : date,
                            status : "Absent",
                            remarks : "",
                            attendanceBy : "algo",
                        }
                        if(await attendances.create(payloads)){
                            console.log("Success of attennce")
                        }else{
                            console.log("Broke of attennce")
                        }
                    }
                    console.log(`Attendance cron ran for user ${userDatas?.full_name}`)
                }
            }
        })
    } catch (error) {
        console.log("attendence cronn error " + error?.message);
    }
}
module.exports = { attendanceCron }