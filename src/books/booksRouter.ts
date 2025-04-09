import express from "express";
import {
  createBook,
  deleteBook,
  getSingleBook,
  listBooks,
  updateBook,
} from "./booksController";
import multer from "multer";
import path from "node:path";
import authenticate from "../middleware/authenticate";

const booksRouter = express.Router();

//file store local
const upload = multer({
  dest: path.resolve(__dirname, "../../public/data/uploads"),
  limits: { fileSize: 3e7 },
});
// routes
booksRouter.post(
  "/",
  authenticate,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  createBook
);

booksRouter.patch(
  "/:bookId",
  authenticate,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  updateBook
);

booksRouter.get("/", listBooks);

booksRouter.get("/:bookId", getSingleBook);

booksRouter.delete("/:bookId", authenticate, deleteBook);
export default booksRouter;
