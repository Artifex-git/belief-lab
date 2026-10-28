// Turns dist-artifact/index.html into the page body claude.ai expects (it adds doctype/head itself).
import { readFileSync, writeFileSync } from "node:fs";
let h = readFileSync("dist-artifact/index.html", "utf8");
h = h.replace(/<!doctype html>/i, "").replace(/<\/?html[^>]*>/gi, "").replace(/<\/?head>/gi, "").replace(/<\/?body[^>]*>/gi, "")
  .replace(/<meta charset[^>]*>/i, "").replace(/<meta name="viewport"[^>]*>/i, "")
  .replace(/<link rel="(manifest|apple-touch-icon|icon)"[^>]*>/gi, "")
  .replace(/<meta name="(theme-color|apple-mobile-web-app-[a-z-]+|mobile-web-app-capable|color-scheme)"[^>]*>/gi, "");
writeFileSync("dist-artifact/artifact.html", h.trim() + "\n");
console.log("artifact.html", h.length);
