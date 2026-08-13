const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // if (
    // file.mimetype === "image/png" ||
    // file.mimetype === "image/jpeg" ||
    // file.mimetype === "application/pdf" ||
    // file.mimetype === "image/jpg"
  // ) {
    cb(null, true);
  // } else {
    // cb(new Error("Invalid file type. Only PNG, JPEG and PDF are allowed"), false);
  // }
};

const maxSize = 5 * 1024 * 1024;   // 5 MB

const upload = multer({
  storage,
  limits: {
    fileSize: maxSize,
  },
  fileFilter,
});

module.exports = upload;

// const multer = require('multer')
// const {CloudinaryStorage} = require('multer-storage-cloudinary');
// const cloudinary = require('../utils/cloudinary');

// const storage = new CloudinaryStorage({
//     cloudinary: cloudinary,
//     params:{
//         folder:"profile_picture",
//         format: async(req, file)=>{
//             const ext = file.mimetype.split('/')[1];
//             return ext;
//         },
//         public_id:(req, file)=> `${Date.now()}-${file.originalname}`
//     }
// })

// const fileFilter = (req, file, cb) =>{
//     if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
//         return cb(null, true);
//     }else{
//         return cb(new Error('only JPG and PNG files are allowed'), false);
//     }
// }

// const upload = multer({storage: storage, fileFilter: fileFilter});

// module.exports = {upload}; 