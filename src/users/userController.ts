import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from "bcrypt";
import { config } from "../config/config";
import { sign } from "jsonwebtoken";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;
  //validation
  if (!name || !email || !password) {
    const error = createHttpError(400, "All fields required");
    return next(error);
  }
  //database call
  const user = await userModel.findOne({ email });
  if (user) {
    const error = createHttpError(400, "User already exist with this email");
    return next(error);
  }
  //process
  //password hash
  const hashedPassword = await bcrypt.hash(password, 10);
  //create new user
  const newUser = await userModel.create({
    name,
    email,
    password: hashedPassword,
  });
  //Token generation: jwt
  const token = sign({ sub: newUser._id }, config.jwtSecret as string, {
    expiresIn: "7d",
  });
  //return
  res.json({
    accessToke: token,
  });
};

export { createUser };
