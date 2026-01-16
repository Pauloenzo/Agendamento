const http = require("http");
const fs = require("fs");
const path = require("path");

const port = Number.parseInt(process.env.PORT, 10) || 3000;
const rootDir = __dirname;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
};

function sendFile(res, filePath, statusCode = 200) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Server error");
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(statusCode, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  const sanitizedPath = path.normalize(urlPath).replace(/^\.+/, "");
  const filePath = path.join(rootDir, sanitizedPath);

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      sendFile(res, filePath);
      return;
    }
    sendFile(res, path.join(rootDir, "index.html"));
  });
});

server.listen(port, () => {
  console.log(`PulseChat running on http://localhost:${port}`);
});
