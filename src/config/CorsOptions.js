let allowedOrigins = ["http://localhost:3100","http://localhost:5173", "http://localhost:5174", "https://apartment.wizinoa.in", "https://www.apartment.wizinoa.in"];

// const corsOptions = {
//   origin: function(origin, callback) {
//       // console.log("Origin Received:", origin);
//       // console.log("Allowed Origins:", allowedOrigins);

//     if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
//       // console.log("success", origin);
      
//       callback(null, true);
//     } else {
//       console.log("Blocked Origin:", origin);
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   // origin: true,
//   credentials: true,
// };

const corsOptions = {
  origin: function (origin, callback) {
    console.log("Origin received:", origin);
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
       console.log("Blocked:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With"
  ],
};

// const corsOptions = {
//   origin: (origin, callback) => {
//     callback(null, true);
//   },
//   credentials: true,
// };


module.exports= corsOptions;
