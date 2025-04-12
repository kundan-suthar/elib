import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import createHttpError from "http-errors";
import bookModel from "./bookModel";
import fs from "node:fs";
import { AuthRequest } from "../middleware/authenticate";
import { Book } from "./bookTypes";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre, description } = req.body;
  //console.log("file:", req.files);
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
    let uploadResult;
    try {
      uploadResult = await cloudinary.uploader.upload(filepath, {
        filename_override: fileName,
        folder: "book-cover",
        format: coverImageMimeType,
        timeout: 120000,
      });
    } catch (error) {
      console.log(error);
      return next(createHttpError(500, "cloudinatry error"));
    }
    // eslint-disable-next-line no-debugger
    debugger;
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
    const _req = req as AuthRequest;

    const newBook = await bookModel.create({
      title,
      genre,
      description,
      author: _req.userId,
      coverImage: uploadResult.secure_url,
      file: fileUploadResult.secure_url,
    });

    //delete temp file
    await fs.promises.unlink(filepath);
    await fs.promises.unlink(bookFilepathname);

    res.status(201).json({ id: newBook._id });
  } catch (error) {
    console.log(error);
    return next(createHttpError(500, "unable to upload to cloudinary"));
  }
};
const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre } = req.body;
  const bookId = req.params.bookId;

  const book = await bookModel.findOne({ _id: bookId });

  if (!book) {
    return next(createHttpError(404, "book not found"));
  }
  //check access
  const _req = req as AuthRequest;

  if (book.author.toString() !== _req.userId) {
    return next(createHttpError(403, "you cannot update others book."));
  }
  deleteExistingcloudinary(book);
  let completeCoverImage = "";
  const files = req.files as {
    [fieldName: string]: Express.Multer.File[];
  };
  if (files.coverImage) {
    const fileName = files.coverImage[0].filename;
    const coverMimeType = files.coverImage[0].mimetype.split("/").at(-1);
    const filePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      fileName
    );
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: fileName,
      folder: "book-cover",
      format: coverMimeType,
    });
    completeCoverImage = uploadResult.secure_url;
    await fs.promises.unlink(filePath);
  }

  //check if file field exist
  let completeFileName = "";
  if (files.file) {
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
    completeFileName = fileUploadResult.secure_url;
    await fs.promises.unlink(bookFilepathname);
  }

  const updatedBook = await bookModel.findOneAndUpdate(
    {
      _id: bookId,
    },
    {
      title: title,
      genre: genre,
      coverImage: completeCoverImage ? completeCoverImage : book.coverImage,
      file: completeFileName ? completeFileName : book.file,
    },
    {
      new: true,
    }
  );

  res.json({ updatedBook });
};
const deleteExistingcloudinary = async (book: Book) => {
  const coverImageSplits = book.coverImage.split("/");
  const coverImagePublicId =
    coverImageSplits.at(-2) + "/" + coverImageSplits.at(-1)?.split(".").at(0);

  const filePdfSplit = book.file.split("/");
  const filePublicId = filePdfSplit.at(-2) + "/" + filePdfSplit.at(-1);

  await cloudinary.uploader.destroy(filePublicId, {
    resource_type: "raw",
  });
  await cloudinary.uploader.destroy(coverImagePublicId);
};
const listBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const books = await bookModel.find().populate("author", "name");
    res.json({ books });
  } catch (err) {
    console.log(err);
    return next(createHttpError(500, "Error while getting books."));
  }
};
const getSingleBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookId = req.params.bookId;
    const singleBook = await bookModel
      .findOne({ _id: bookId })
      .populate("author", "name");
    if (!singleBook) {
      return next(createHttpError(404, "book not found."));
    }
    res.json(singleBook);
  } catch (err) {
    console.log(err);
    return next(createHttpError(500, "Error while getting book."));
  }
};
const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookId = req.params.bookId;
    const singleBook = await bookModel.findOne({ _id: bookId });
    if (!singleBook) {
      return next(createHttpError(404, "book not found."));
    }

    const _req = req as AuthRequest;

    if (singleBook.author.toString() !== _req.userId) {
      return next(createHttpError(403, "you cannot delete others book."));
    }
    deleteExistingcloudinary(singleBook);
    //res.json({ message: `${bookId} Deleted.` });
    res.sendStatus(204);
  } catch (err) {
    console.log(err);
    return next(createHttpError(500, "Error while getting book."));
  }
};

export { createBook, updateBook, listBooks, getSingleBook, deleteBook };
