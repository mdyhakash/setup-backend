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

  const { refreshToken } = result;

  res.cookie("refreshToken", refreshToken, {
    secure: false, //true in production
    httpOnly: true,
    sameSite: "lax",
  });

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
const refreshToken = async (req: Request, res: Response) => {
  console.log("Cookies", req.cookies);

  try {
    const result = await authService.generateRefreshToken(
      req.cookies.refreshToken,
    );

    res.status(200).json({
      success: true,
      message: "Access Token Generated",
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
  refreshToken,
};
