import { createServer } from "node:http";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const port = getPort();

const app = next({ dev });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => {
      handle(req, res);
    }).listen(port, () => {
      console.log(`Ready on port ${port}`);
    });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

function getPort() {
  if (process.env.PORT) {
    return Number(process.env.PORT);
  }

  if (dev) {
    return 3000;
  }

  throw new Error("PORT environment variable is required in production");
}
