require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User"); 

const MONGO_URI = process.env.MONGO_URI;

const seedAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected for seeding");

    const email = "admin.realestate@gmail.com";
    const password = "Admin@123";

    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      console.log("Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await User.create({
      full_name: "Admin User",
      email : email,
      password: hashedPassword,
      role: "Admin",
      status : "Active",
      gender : "male",
      address : "Madurai",
      is_otp_verified : true,
      phone : "1234567890"
    });

    console.log("Admin created successfully");
    console.log("Email:", admin.email);

    return;
  } catch (error) {
    console.error("Error seeding admin:", error);
    return;
  }
};

seedAdmin();