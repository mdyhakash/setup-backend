import bcrypt from "bcryptjs";
import { pool } from "../db";
import type { IAuth } from "./auth.interface";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";

const registerUserIntoDB = async (payload: IAuth) => {
  const { name, email, password, role } = payload;

  //check user already exists
  const userData = await pool.query(
    `
     SELECT * 
     FROM users  
     WHERE email=$1 
    `,
    [email],
  );
  if (userData.rows.length > 0) {
    throw new Error("User Already Exists!");
  }

  //hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
        INSERT INTO users(name,email,password,role)  
        VALUES($1,$2,$3,COALESCE($4,'member')) 
        RETURNING *
    `,
    [name, email, hashedPassword, role],
  );
  delete result.rows[0].password;
  return result;
};

const loginUserIntoDB = async (payload: IAuth) => {
  const { email, password } = payload;

  //check if user already exists
  const userdData = await pool.query(
    `
    SELECT *
    FROM users
    WHERE email=$1
    `,
    [email],
  );

  if (userdData.rows.length == 0) {
    throw new Error("User does not exists!");
  }

  const user = userdData.rows[0];

  //match password
  const matchedPassword = await bcrypt.compare(password, user.password);
  if (!matchedPassword) {
    throw new Error("Invalid email or password");
  }

  //token generate
  const jwtpayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(jwtpayload, config.jwt_secret, {
    expiresIn: "1d",
  });
  const refreshToken = jwt.sign(jwtpayload, config.refresh_secret, {
    expiresIn: "30d",
  });

  return { token: accessToken, refreshToken };
};

const generateRefreshToken = async (token: string) => {
  if (!token) {
    throw new Error("Unauthorized");
  }
  const decoded = jwt.verify(
    token as string,
    config.refresh_secret as string,
  ) as JwtPayload;

  const userData = await pool.query(
    `
   SELECT *
   FROM users
   WHERE email=$1    
    `,
    [decoded.email],
  );

  const user = userData.rows[0];

  if (userData.rows.length === 0) {
    throw new Error("User not found");
  }
  if (!user) {
    throw new Error("Forbiddeb");
  }

  //token generate
  const jwtpayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(jwtpayload, config.jwt_secret, {
    expiresIn: "1d",
  });

  return { accessToken };
};
export const authService = {
  registerUserIntoDB,
  loginUserIntoDB,
  generateRefreshToken,
};
