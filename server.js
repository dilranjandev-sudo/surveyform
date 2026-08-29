// Production entry point for Node.js hosting (e.g. Hostinger's Node.js app
// manager / Passenger). Set this file as the application "startup file".
// Locally you can still use `npm run dev`.
const { createServer } = require("http");
const next = require("next");

const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`> Survey ready on port ${port}`);
  });
});
