import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
const sh = (c) => { try { return execSync(c, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim(); } catch { return ""; } };
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const info = {
  version: pkg.version,
  build: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || sh("git rev-parse --short HEAD") || "local",
  channel: process.env.VERCEL_ENV === "production" ? "production" : process.env.VERCEL_ENV ? "preview" : "local",
  date: new Date().toISOString().slice(0, 10),
};
writeFileSync("src/build-info.json", JSON.stringify(info, null, 2));
console.log("build-info", info);
