import type { Request, Response } from "express";
import { authService } from "./auth.service";

const registerUSer = async (req: Request, res: Response) => {
  const result = await authService.registerUserIntoDB(req.body);
  try {
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const loginUser = async (req: Request, res: Response) => {
  const result = await authService.loginUserIntoDB(req.body);

  try {
    res.status(201).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const authController = {
  registerUSer,
  loginUser,
};
