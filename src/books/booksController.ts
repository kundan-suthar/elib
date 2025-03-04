import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import fs from "node:fs";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre } = req.body;
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
    const newBook = await bookModel.create({
      title,
      genre,
      author: "67c3fe17b6cacb6cecee437c",
      coverImage: uploadResult.secure_url,
      file: fileUploadResult.secure_url,
    });

    //delete temp file
    await fs.promises.unlink(filepath);
    await fs.promises.unlink(bookFilepathname);

    console.log("file upload result: ", fileUploadResult);
    console.log("uploadResult", uploadResult);
    res.status(201).json({ id: newBook._id });
  } catch (error) {
    console.log(error);
    return next(createHttpError(500, "unable to upload to cloudinary"));
  }
};
export { createBook };
