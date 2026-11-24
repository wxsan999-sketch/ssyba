import { createReadStream } from "node:fs"
import { realpath, stat } from "node:fs/promises"
import { createServer } from "node:http"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = await realpath(fileURLToPath(new URL("../", import.meta.url)))
const port = Number(process.env.PORT || 4173)
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".wasm": "application/wasm",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".webmanifest": "application/manifest+json",
}

function insideRoot(file) {
  const relative = path.relative(root, file)
  return relative !== ".." && !relative.startsWith(".." + path.sep) && !path.isAbsolute(relative)
}

const server = createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end()
    return
  }
  try {
    const url = new URL(request.url, "http://localhost")
    const pathname = decodeURIComponent(url.pathname)
    const segments = pathname.split("/")
    if (segments.some(segment => segment.startsWith(".") || /[\\:\0]/.test(segment))) {
      response.writeHead(404).end()
      return
    }
    let file = await realpath(path.join(root, ...segments))
    if (!insideRoot(file)) {
      response.writeHead(404).end()
      return
    }
    if ((await stat(file)).isDirectory()) {
      if (!url.pathname.endsWith("/")) {
        response.writeHead(301, { Location: url.pathname + "/" + url.search }).end()
        return
      }
      file = await realpath(path.join(file, "index.html"))
    }
    const info = await stat(file)
    if (!insideRoot(file) || !info.isFile()) {
      response.writeHead(404).end()
      return
    }
    response.writeHead(200, {
      "Content-Type": types[path.extname(file)] || "application/octet-stream",
      "Content-Length": info.size,
    })
    if (request.method === "HEAD") response.end()
    else createReadStream(file).on("error", () => response.destroy()).pipe(response)
  } catch {
    response.writeHead(404).end()
  }
})

server.on("error", error => {
  console.error(error.message)
  process.exitCode = 1
})
server.listen(port, "127.0.0.1", () => {
  console.log(`SSyba     http://localhost:${port}/`)
  console.log(`Sea Farm  http://localhost:${port}/games/sea-farm/`)
})
