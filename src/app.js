process.env.TZ = "Asia/Kolkata";
const { Server } = require("socket.io");
const startFollowupsCron = require("./crons/followups.cron");
const { attendanceCron } = require("./crons/attendanceCron")
const {metaReminderCron} = require("./crons/trackmeta")
const {trackEnquiry} = require("./crons/trackEnquiry")

const dotenv = require("dotenv");
const express = require("express");
const authRoutes = require("./routes/authRoutes");
const siteRoutes = require("./routes/siteRoutes");
const plotRoutes = require("./routes/plotRoutes");
const salesRoutes = require("./routes/salesRoutes");
const clientRoutes = require("./routes/clientRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");
const decodeToken = require("./middlewares/decodeToken");
const cookieParser = require("cookie-parser");
const expense_router = require("./routes/expense.router");
// const ErrorMiddleware = require("./middlewares/ErrorMiddleware");
const app = express();
const path = require("path");
const refund_router = require("./routes/RefundRouter");
const bookings_router = require("./routes/Bookings.router");
const registration_router = require("./routes/registrationRoutes");
const dashboard_router = require("./routes/Dashboard.router");
const amount_router = require("./routes/amount.router");
const team_rouer = require("./routes/Team.router");
const assignment_router = require("./routes/AssignmentState.router");
const admin_user_router = require("./routes/AdminRoutes/Admin.user.router");
const documentation_router = require("./routes/documentationRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const webhookRoute = require("./routes/webhookRoute");
const metaonboardRoute = require("./routes/metaonboardRoute");
const appointmentRoute = require("./routes/appointmentRoute")
const inventoryRouter = require("./routes/inventoryRouter");
const purchaseRouter = require("./routes/purchaseRouter");
const supplierRouter = require("./routes/supplierRoutes");
const stageRouter = require("./routes/stageRoutes");
const estimateRouter = require("./routes/estimateRouter")
const landRoutes = require("./routes/landRoutes")
const multer = require("multer");


const { createServer } = require("http");
// const {socketHandler} = require("./socket");
const cors = require("cors");
const corsOptions = require("./config/CorsOptions");
const notifications_router = require("./routes/notifications.router");
const followups_router = require("./routes/followups.router");
const {initSocket} = require("./socket");

dotenv.config();

app.use((req,res,next)=>{
  console.log(
    new Date().toISOString(),
    req.method,
    req.originalUrl,
    req.headers.origin
  );
  next();
});
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended:true}))
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
const server = createServer(app)
const { io } = initSocket(server);

// Start cron after socket is ready
// setTimeout(() => { 
// startFollowupsCron(io);
// },4000)

metaReminderCron();
attendanceCron()
trackEnquiry(io);


app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Server is working fine",
  });
});

// app.use((req, res, next) => {
//   console.log("Method:", req.method);
//   console.log("Origin:", req.headers.origin);
//   console.log("Headers:", req.headers["access-control-request-headers"]);
//   next();
// });

// app.use((err, req, res, next) => {
//   console.error(err);

//   res.header(
//     "Access-Control-Allow-Origin",
//     "https://apartment.wizinoa.in"
//   );

//   res.header(
//     "Access-Control-Allow-Credentials",
//     "true"
//   );

//   res.status(err.statusCode || 500).json({
//     success: false,
//     message: err.message,
//   });
// });

app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: err.message,
    });
  }

  res.status(500).json({
    success: false,
    message: err.message,
  });
});

app.post("/api/call-record", (req, res) => { 
  console.log("webhook called by daffytel",req.body)
  res.send(200)
})



// app.use((req, res, next) => {
//   console.log("Request Origin:", req.headers.origin);
//   next();
// });

app.use("/api/auth", authRoutes);
app.use("/api/decode", decodeToken);
app.use("/api/site", siteRoutes);
app.use("/api/plot", plotRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/enquiries", enquiryRoutes);

app.use("/api/land",landRoutes)

app.use("/webhookmeta", webhookRoute);       
app.use("/metaonboard", metaonboardRoute);



// app.post("/api/wp", whatsAppMessage);

//Expense
app.use("/api/expense", expense_router);

//Bookings
app.use("/api/bookings", bookings_router);

//Registration

app.use("/api/registration", registration_router);

//Refund
app.use("/api/refund", refund_router);

//Amount
app.use("/api/amounts", amount_router);

//Dashboard
app.use("/api/dashboard", dashboard_router);

//Team
app.use("/api/team", team_rouer);

// Notifications

app.use("/api/notifications", notifications_router);

// Followups

app.use("/api/followups", followups_router);

// socketHandler(server);

// Admin Routes
app.use("/api/admin/user", admin_user_router);

app.use("/api/assignmentState", assignment_router);

app.use("/api/documentation", documentation_router);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/appointment",appointmentRoute)
app.use("/api/stock", inventoryRouter);

app.use("/api/purchase", purchaseRouter);
app.use("/api/supplier", supplierRouter);

app.use("/api/stage", stageRouter);

app.use("/api/estimate", estimateRouter);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        message: `File too large. Max allowed size is ${maxSize / (1024 * 1024)}MB.`,
      });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});


// app.use(globalError);
// app.use(ErrorMiddleware);

module.exports = {
  server,
};
