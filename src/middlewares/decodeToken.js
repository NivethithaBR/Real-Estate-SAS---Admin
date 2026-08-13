const jwt = require("jsonwebtoken");
const User = require("../models/User");

const decodeToken = async (req, res) => {
  // console.log(req.cookies)
  console.log(req.headers.authorization, 'sdasdasdas')
  let token = req.cookies.token;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  try {
    if (!token) {
      return res.status(401).json({ success: false, message: "Token not Found" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "jwt-secret");
    const user = await User.findById(decoded?.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not Found" });
    }

    res.status(200).json({ success: true, message: "User Detail fetch Successfully", data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error", err: err.message || String(err) });
  }
};

module.exports = decodeToken;
