import express from "express";
import { createBook } from "./booksController";

const booksRouter = express.Router();

// routes
booksRouter.post("/", createBook);

export default booksRouter;
