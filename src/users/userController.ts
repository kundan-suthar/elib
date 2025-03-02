import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from "bcrypt";
import { config } from "../config/config";
import { sign } from "jsonwebtoken";
import { User } from "./userTypes";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;
  //validation
  if (!name || !email || !password) {
    const error = createHttpError(400, "All fields required");
    return next(error);
  }
  //database call
  try {
    const user = await userModel.findOne({ email });

    if (user) {
      const error = createHttpError(400, "User already exist with this email");
      return next(error);
    }
  } catch (error) {
    console.log(error);
    return next(createHttpError(500, "unable to find user"));
  }
  //process
  //password hash
  const hashedPassword = await bcrypt.hash(password, 10);
  //create new user
  let newUser: User;
  try {
    newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
    });
  } catch (error) {
    console.log(error);
    return next(createHttpError(500, "Unable to create user."));
  }
  //Token generation: jwt
  try {
    const token = sign({ sub: newUser._id }, config.jwtSecret as string, {
      expiresIn: "7d",
    });
    //return
    res.json({
      accessToke: token,
    });
  } catch (error) {
    console.log(error);
    return createHttpError(500, "unable to create jwt");
  }
};

export { createUser };
