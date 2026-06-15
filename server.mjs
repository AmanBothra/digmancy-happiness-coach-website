import { createServer } from "node:http";
import next from "next";

const port = Number(process.env.PORT || 3000);
const dev = process.env.NODE_ENV !== "production";

const app = next({ dev });
const handle = app.getRequestHandler();

await app.prepare();

createServer((req, res) => {
  handle(req, res);
}).listen(port, () => {
  console.log(`Ready on port ${port}`);
});
