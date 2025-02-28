import express, { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import globalErrorHandler from "./middleware/globalErrorHandler";

const app = express();

// Routes
app.get("/", (req: Request, res: Response, next: NextFunction) => {
  // Example of throwing an error (uncomment to test)
  const error = createHttpError(400, "Something went wrong");
  throw error;

  res.json({ message: "Welcome to API" });
  // next(); // No need to call next() here unless passing control further
});

// Global error handler
app.use(globalErrorHandler);

export default app;
