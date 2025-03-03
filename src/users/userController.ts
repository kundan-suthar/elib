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
    res.status(201).json({
      accessToke: token,
    });
  } catch (error) {
    console.log(error);
    return createHttpError(500, "unable to create jwt");
  }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) {
    return createHttpError(400, "All fields are required");
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return next(createHttpError(404, "User not found"));
    }
    const isMatch = bcrypt.compare(password, user.password);
    if (!isMatch) {
      return next(createHttpError(400, "Username or password incorrect."));
    }
    //create accessToken
    const token = sign({ sub: user._id }, config.jwtSecret as string, {
      expiresIn: "7d",
    });
    res.json({
      token: token,
    });
  } catch (error) {
    console.log(error);
    createHttpError(500, "Unable to find user.");
  }
};
export { createUser, loginUser };
