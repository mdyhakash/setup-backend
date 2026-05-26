import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import cors from "cors";
import { authRoute } from "./modules/auth.route";
import cookieParser from "cookie-parser";

const app: Application = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:3000", //your origin url
    credentials: true,
  }),
);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

app.use("/api/auth", authRoute);

app.use(globalErrorHandler);
export default app;
