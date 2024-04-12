const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    let ext = path.extname(file.originalname);
    let uniqueFilename = Date.now() + '-' + Math.random().toString(36).substring(7) + ext;
    cb(null, uniqueFilename);
  },
});

const fileFilter = function (req, file, callback) {
  if (file.mimetype.startsWith("image/")) {
    callback(null, true);
  } else {
    console.log("Only image files supported");
    callback(null, false);
  }
};

const limits = {
  fileSize: 1024 * 1024 * 100,
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: limits,
}).array("productImage", 5);

module.exports = upload;
