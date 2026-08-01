import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = dirname(fileURLToPath(import.meta.url));
const output = join(root, "dist", "server", "index.js");
await build({
  entryPoints: [join(root, "src", "supabase-client.js")],
  bundle: true,
  format: "iife",
  minify: true,
  outfile: join(root, "supabase-client.js"),
  target: ["es2020"],
});

const sourceFiles = [
  "index.html",
  "styles.css",
  "script.js",
  "supabase-client.js",
  "manifest.webmanifest",
  "service-worker.js",
  "design-lab.html",
  "design-lab.css",
  "design-lab.js",
  "Design system/index.html",
  "Design system/design-system.css",
  "Design system/tokens.css",
  "assets/brand-symbol.svg",
  "assets/brand-symbol-1024.png",
];

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

const assets = {};
for (const file of sourceFiles) {
  const contents = await readFile(join(root, file));
  assets[file] = {
    body: contents.toString("base64"),
    type: contentTypes[extname(file)] ?? "application/octet-stream",
  };
}

const worker = `const assets=${JSON.stringify(assets)};
function decode(value){
  const binary=atob(value);
  const bytes=new Uint8Array(binary.length);
  for(let index=0;index<binary.length;index+=1) bytes[index]=binary.charCodeAt(index);
  return bytes;
}
export default {
  async fetch(request){
    const url=new URL(request.url);
    let path=decodeURIComponent(url.pathname).replace(/^\\/+/, "");
    if(!path) path="index.html";
    const asset=assets[path] ?? (path.includes(".") ? null : assets["index.html"]);
    if(!asset) return new Response("Not found",{status:404});
    const isDocument=path==="index.html";
    return new Response(decode(asset.body),{
      headers:{
        "Content-Type":asset.type,
        "Cache-Control":isDocument ? "no-cache" : "public, max-age=3600",
        "X-Content-Type-Options":"nosniff",
        "Referrer-Policy":"strict-origin-when-cross-origin"
      }
    });
  }
};
`;

await rm(join(root, "dist"), { recursive: true, force: true });
await mkdir(dirname(output), { recursive: true });
await writeFile(output, worker);
