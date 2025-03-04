import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import createHttpError from "http-errors";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  console.log("file:", req.files);
  const files = req.files as {
    [fieldName: string]: Express.Multer.File[];
  };
  try {
    const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
    const fileName = files.coverImage[0].filename;
    const filepath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      fileName
    );

    const uploadResult = await cloudinary.uploader.upload(filepath, {
      filename_override: fileName,
      folder: "book-cover",
      format: coverImageMimeType,
    });
    console.log("uploadResult", uploadResult);
  } catch (error) {
    console.log(error);
    return next(createHttpError(500, "unable to upload to cloudinary"));
  }

  try {
    const bookFileName = files.file[0].filename;
    const bookFilepathname = path.resolve(
      __dirname,
      "../../public/data/uploads",
      bookFileName
    );
    const fileUploadResult = await cloudinary.uploader.upload(
      bookFilepathname,
      {
        resource_type: "raw",
        filename_override: bookFileName,
        folder: "book-pdfs",
        format: "pdf",
      }
    );
    console.log("file upload result: ", fileUploadResult);
  } catch (error) {
    console.log(error);
    return next(createHttpError(500, "unable to upload to cloudinary"));
  }

  res.json({});
};
export { createBook };
