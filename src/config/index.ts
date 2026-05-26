import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

const config = {
  port: Number(process.env.PORT) || 3000,
  connection_string: process.env.DATABASE_URL as string,
  jwt_secret: process.env.JWT_SECRET! as string,
  refresh_secret: process.env.REFRESH_SECRET! as string,
};

export default config;
