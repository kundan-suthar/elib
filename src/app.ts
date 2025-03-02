import express, { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import globalErrorHandler from "./middleware/globalErrorHandler";
import userRouter from "./users/userRouter";

const app = express();
app.use(express.json());
// Routes
app.get("/", (req: Request, res: Response, next: NextFunction) => {
  // Example of throwing an error (uncomment to test)
  const error = createHttpError(400, "Something went wrong");
  throw error;

  res.json({ message: "Welcome to API" });
  // next(); // No need to call next() here unless passing control further
});

app.use("/api/users", userRouter);

// Global error handler
app.use(globalErrorHandler);

export default app;
