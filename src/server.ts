import { initDB } from "./db";
import app from "./app";
import config from "./config";

const main = () => {
  initDB();
  app.listen(config.port, () => {
    console.log(`Example app Listening on port ${config.port}`);
  });
};

main();
