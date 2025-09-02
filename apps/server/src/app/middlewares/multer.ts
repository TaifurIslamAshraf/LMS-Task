import { Request } from "express";
import fs from "fs";
import httpStatus from "http-status";
import multer, { FileFilterCallback } from "multer";
import path from "path";
import config from "../config/config";
import ApiError from "../errorHandlers/ApiError";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, getUploadFolder());
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const getUploadFolder = () => {
  const timestamp = Date.now();
  const uploadFolder = path.join("public/uploads", String(timestamp));

  // Create the folder if it doesn't exist
  if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
  }

  return uploadFolder;
};

//file filter
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  // Define acceptable file types
  const fileFormate = config.upload.imageFormat;
  const acceptableTypes = [...JSON.parse(fileFormate as string)];

  if (acceptableTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(httpStatus.BAD_REQUEST, "Unsupported file type"));
  }
};

export const upload = multer({
  storage,
  fileFilter: fileFilter,
  limits: { fileSize: Number(config.upload.imageSize) },
});
