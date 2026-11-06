const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const uploadPath = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueName = crypto.randomBytes(16).toString("hex") + extension;

    cb(null, uniqueName);
  }
});

const allowedTypes = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "application/pdf": [".pdf"]
};

function fileFilter(req, file, cb) {
  const extension = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = allowedTypes[file.mimetype];

  if (allowedExtensions && allowedExtensions.includes(extension)) {
    return cb(null, true);
  }

  cb(new Error("Only JPG, JPEG, PNG, WEBP and PDF files are allowed."));
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = upload;
