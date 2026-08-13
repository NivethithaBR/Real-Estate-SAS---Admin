const jwt = require("jsonwebtoken");
const errorHandler = require("../utils/ErrorHandler");
const User = require("../models/User");

const verifyUser = async(req, res, next) => {
  let token = req.cookies.token;
  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }
  try {
    // const cleanedToken = token.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { id } = decoded
    const foundUser = await User.findById(id)
    if(!foundUser) next(new errorHandler(404,"User not found"))
    req.user = foundUser;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid Token" });
  }
};

const authenticateUser = async(req, res, next) => {
  try {
    let token = req.cookies.token;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
         return next(new errorHandler(401, "Token not found")); 

    }
    await jwt.verify(token, process.env.JWT_SECRET,async (err, res) => {
      if (err) {
         return next(new errorHandler(400, "Token expired")); 
      }
      const { id } = res
      const foundUser = await User.findById(id)
      if (!foundUser) {
         return next(new errorHandler(404, "Token verified, But user not found"));
      }
      let allowedRoles = ["Admin"]
      if (!allowedRoles.includes(foundUser?.role)) {
         return next(new errorHandler(401, "Currently you don't have access"));
      }
      req.auth = foundUser
       next();
    });
  } catch (error) {
    next(error)
  }
};

module.exports = {
  verifyUser,
  authenticateUser,
};

