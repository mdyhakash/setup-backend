import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import cors from "cors";

const app: Application = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "htpp://localhost:3000", //your origin url
  }),
);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

app.use(globalErrorHandler);
export default app;
