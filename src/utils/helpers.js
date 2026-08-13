const nodemailer = require("nodemailer");
const cloudinary = require("../utils/cloudinary");
require("dotenv").config();
const ejs = require("ejs")
const path = require("path")
const app = require("express")()

const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: process.env.MAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });


const sendMail = async ({ to, subject, text, file, data, html:htmlContent }) => {
  try {
    let html;
    if (file && data) {
      console.log("data",data)
      html = await ejs.renderFile(path.join(__dirname,"../views", file),data);
    } else {
      html = htmlContent;
    }
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    });
    console.log("Message Sent", info.messageId);
    return info;
  } catch (error) {
    console.log("Nodemailer error", error);
  }
};
const findCredential = async (email) => {
  if (!email) return { type: null, value: null };
  return { type: "email", value: email };
};

const uploader = async (file, folderName) => {
  const base64String = bufferToBase64(file.buffer);
  const dataUri = `data:${file.mimetype};base64,${base64String}`;
  return await cloudinary.uploader.upload(dataUri, {
    resource_type: "auto",
    folder: `Wizinoa Realestate/${folderName}`,
  });
};

const deleteFromCloudinary = async (url) => {
  try {
    const publicId = url.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(publicId);
    console.log(`Deleted from cloudinary: ${publicId}`);
  } catch (err) {
    console.error("Error deleting from Cloudinary:", err);
  }
};

const bufferToBase64 = (buffer) => {
  //console.log(bufferToBase64);
  return buffer.toString("base64");
};

const generateUniqueNumber = async() => {
  const now = Date.now();
  const random = Math.floor(100000 + Math.random() * 900000);
  const randNum = `${now}${random}`
  return randNum;
}

module.exports = {
  sendMail,
  findCredential,
  uploader,
  bufferToBase64,
  deleteFromCloudinary,
  generateUniqueNumber
};