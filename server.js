const { server } = require("./src/app.js");
const connectDB = require("./src/config/db.js");

const startServer = async () => {
  try {
   // const PORT = process.env.PORT || 5000;
      const PORT =6081
    server.listen(PORT, () => console.log(`Server is Running on Port ${PORT}`));
  } catch (error) {
    console.log("can't start server", error);
  }
};
connectDB().then(startServer);
