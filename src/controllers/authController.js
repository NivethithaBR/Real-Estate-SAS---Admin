require("dotenv").config;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const cloudinary = require("cloudinary");
const { uploader, sendMail } = require("../utils/helpers");
const ErrorHandler = require("../utils/ErrorHandler");
const ejs = require("ejs");
const path = require("path");
const userSignup = async (req, res) => {
  try {
    const files = req.file;

    const { full_name, phone, gender, email, address, password } = req.body;
    if (!full_name || !phone || !email || !password) {
      return res.status(400).json({
        message: "Please fill all required fields",
        statuscode: 400,
        success: false,
      });
    }

    let fileName;
    if (files) {
      const uploadResult = await uploader(files, "Users");
      fileName = { public_id: uploadResult?.public_id, url: uploadResult.secure_url };
    }

    let isExist;

    isExist = await User.findOne({ email });

    if (isExist) {
      return res.status(400).json({
        message: "Given Email already exists, please sign in!",
        statuscode: 409,
        success: false,
      });
    }

    let hashPass = null;

    hashPass = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      full_name,
      phone,
      email,
      password: hashPass,
      gender,
      address,
      role: "Super Admin",
      profileImage: fileName,
    });

    if (!newUser) {
      return res.status(400).json({
        message: "User couln't create, please try again later!",
        statuscode: 400,
        success: false,
      });
    }

    // if (user_type === "user") {
    //   const { type, value } = await findCredential(email || "");

    //   let otp = `${Math.floor(1000 + Math.random() * 9000)}`;

    //   if (type === "email" && value) {
    //     await findCredential(otp, value, response._id, response.full_name);
    //   }
    // }

    return res.status(201).json({
      message: "User created successfully!",
      statuscode: 201,
      success: true,
      data: newUser,
    });
  } catch (error) {
    console.error("signup Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      statuscode: 500,
      success: false,
      error: error.message || String(error),
    });
  }
};

const userLogin = async (req, res) => {
  try {
    console.log("LOGIN BODY:", req.body);
    const { email, password } = req.body;

    const userData = await User.findOne({
      $or: [{ email: email }, { phone: email }],
      status : "Active"
    });

     console.log("USER FOUND:", !!userData);


    if (!userData) {
      return res.status(400).json({
        message: "User Not Found",
        statuscode: 400,
        success: false,
      });
    }

    console.log("password working");
    


    const isMatch = await bcrypt.compare(password, userData.password);

    console.log("password matching");
    

    if (!isMatch) {
      return res.status(400).json({
        message: "Password is Invalid, Please Enter Valid Password",
        statuscode: 400,
        success: false,
      });
    }
    const token = jwt.sign({ id: userData._id, user_type: userData.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

  console.log(token, process.env.JWT_SECRET, "checking");


    
    

    res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
     path: "/",
    });

    console.log("cookie stroing");
    

    return res.status(200).json({
      message: `Welcome ${userData.full_name}!`,
      statuscode: 200,
      success: true,
      token,
      data: userData,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      message: "Internal server error",
      statuscode: 500,
      success: false,
      error: error.message || String(error),
    });
  }
};

const userForgotPassword = async (req, res, next) => {
  try {
    let hashPass;
    const { user_id, password, confirmPassword } = req.body;

    if (!user_id) {
      return res.status(400).json({
        message: "User Id required!",
        statuscode: 400,
        success: false,
      });
    }
    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: " Password and ConfirmPassword are required!",
      });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Password do not match!" });
    }

    const getUser = await User.findOne({ _id: user_id });
    if (!getUser) {
      return res.status(400).json({
        message: "User Not Found",
        statuscode: 400,
        success: false,
      });
    }

    hashPass = await bcrypt.hash(password, 10);

    const response = await User.findByIdAndUpdate(user_id, { password: hashPass }, { new: true });

    if (!response) {
      return res.status(500).json({
        success: false,
        message: "Something went wrong, Please try again later!",
      });
    }

    return res.status(200).json({
      message: "Password Reset Successfully!",
      success: true,
      statuscode: 200,
      responses: {
        id: response._id,
        email: response.email,
        user_type: response.user_type,
      },
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  try {
      res.clearCookie("token", {
      httpOnly: true,
      secure: true,      // same as login
      sameSite: "None",  // same as login
      path: "/",         // same as login
    });
    return res.status(200).json({
      message: "Logout Successful",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: "Logout Failed", success: false });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, phone, email, address,userid, status, gender, department,role } = req.body;
    let imageUrl = null;
    if (req.file) {
      const uploadResult = await uploader(req.file, "Users");
      imageUrl = { public_id: uploadResult?.public_id, url: uploadResult.secure_url };
    }
    const updateData = {};
    if (full_name) updateData.full_name = full_name;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;
    if (address) updateData.address = address;
    if (status) updateData.status = status;
    if (gender) updateData.gender = gender;
    if (department) updateData.department = department;
    if (role) updateData.role = role;
    if (imageUrl) updateData.profileImage = imageUrl;
    updateData.userid = userid;

    const updateUser = await User.findByIdAndUpdate(id, { $set: updateData }, { new: true });

    if (!updateUser) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      success: true,
      data: updateUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile photo", success: false, error });
  }
};

const deleteProfilePicture = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user || !user.profileImage) {
      return res.status(404).json({ message: "No profile picture found", success: false });
    }

    const imageUrl = user.profileImage?.public_id;
    const parts = imageUrl.split("/");
    const publicIdWithExt = parts.pop();
    const public_id = publicIdWithExt.split(".")[0];

    await cloudinary.uploader.destroy(public_id);
    user.profileImage = {
      public_id: "",
      url: "",
    };
    await user.save();

    res.status(200).json({
      message: "Profile picture deleted successfully!",
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { email, full_name, role } = req.body;

    if (!email) {
      return next(new ErrorHandler(400, "Email is requried"));
    }
    if (role === "User") {
      const userCount = await User.countDocuments({ role: "User" });
      if (userCount >= 7) {
        return next(new ErrorHandler(400, "Only 5 users are allowed"));
      }
    }
    const { _id } = req.auth;
    let getTrimname = full_name.replace(/\s+/g, "").toLowerCase()
    let password = `${getTrimname}@123`;
    let hassPass = await bcrypt.hash(password, 10);
    let profileImage = null;
    const foundUser = await User.findOne({ email });
    if (foundUser) return next(new ErrorHandler(409, "User already exist"));
    if (req.file) {
      const res = await uploader(req.file, "Users");
      profileImage = {
        secure_url: res?.secure_url,
        public_id: res?.public_id,
      };
    }

    const newUser = await User.create({
      ...req.body,
      password: hassPass,
      createdBy: _id,
    });

    if (!newUser) {
      return next(new ErrorHandler(400, "Can't create user ,Please try again"));
    }

    if (profileImage) {
      newUser.profileImage = profileImage;
      await newUser.save();
    }
    const mailOptions = {
      to: newUser.email,
      subject: "Wizinoa Realestate registration",
      text: "Welcome onboard to wizinoa realestate",
      file: "Invitation.ejs",
      data: { ...newUser.toJSON(), loginUrl: process.env.BASE_URL, password },
    };

    const response = await sendMail(mailOptions);
    console.log(response)
    // res.render(path.join(__dirname, "../views", "Invitation.ejs"),{data:newUser,password});
    return res.status(200).json({ success: true, message: "New user created successfully", data: newUser });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return next(new ErrorHandler(404, "User not found"));
    }
    return res.status(200).json({ success: true, message: "User deleted successfully", data: deletedUser });
  } catch (error) {
    next(error);
  }
};
const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const foundUser = await User.findById(id);
    if (!foundUser) {
      return next(new ErrorHandler(404, "User not found"));
    }
    return res.status(200).json({ success: true, message: "User got successfully", data: foundUser });
  } catch (error) {
    next(error);
  }
};
const search = async (req, res, next) => {
  const { searchTerm, limit = 10, page = 1 } = req.query;

  let matchStage = {};
  if (searchTerm) {
    matchStage.$or = [{ full_name: new RegExp(searchTerm, "gi") }, { phone: new RegExp(searchTerm, "gi") }];
  }
  const skip = (Number(page) - 1) * Number(limit);
  const { _id, role } = req.auth
  
  if (role === "Admin") { 
    matchStage.role = {$in:["Admin","User"]} 
  }
  try {
    const foundUsers = await User.aggregate([
      {
        $facet: {
          count: [
            {
              $count: "count",
            },
          ],
          data: [
            {
              $match: {
                ...matchStage,
                _id: {$ne:_id}
              },
            },
            {
              $skip: skip,
            },
            {
              $limit: Number(limit),
            },
          ],
        },
      },
    ]);

    const totalCount = foundUsers[0]?.count[0]?.count || 0;
    const data = foundUsers[0]?.data;
    return res.status(200).json({ success: true, message: "Users searched successfully", totalCount, data });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async(req,res,next)=>{
  try {

    const { role, _id } = req.auth
    
    let search = {}
    if (role === "Admin") { 
      search.role = {$in:["User"]}
    }
    const foundUsers = await User.find(search);
    return res.status(200).json({success:true,message:"Got all users successfully",data:foundUsers})
  } catch (error) {
    next(error)
  }
}

const getAllUser = async(req,res,next)=>{
  try {

    const { role, _id } = req.auth
    
    let search = {}
    if (role === "Admin") { 
      search.role = {$in:["User","Admin"]}
    }
    const foundUsers = await User.find(search);
    return res.status(200).json({success:true,message:"Got all users successfully",data:foundUsers})
  } catch (error) {
    next(error)
  }
}

module.exports = {
  getAllUsers,
  getAllUser,
  userSignup,
  userLogin,
  search,
  userForgotPassword,
  logout,
  updateProfile,
  deleteProfilePicture,
  createUser,
  deleteUser,
  getUser
};
