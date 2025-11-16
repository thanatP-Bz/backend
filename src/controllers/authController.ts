import { Request, Response } from "express";

import { User } from "../models/Model";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    //check validation
    if (!name || !email || !password) {
      res.status(400).send({ message: "all field are required" });
    }

    //check user exist
    const userExist = await User.checkEmail(email);

    if (userExist) {
      return res
        .status(400)
        .json({ message: "this email has been registered" });
    }

    const newUser = await User.create({
      name,
      email,
      password,
    });

    return res.status(201).json({
      message: "User register Successfully!",
      user: {
        id: newUser._id,
        email: newUser.email,
        password: newUser.password,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  res.send("login user");
};
