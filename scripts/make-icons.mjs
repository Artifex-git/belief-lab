import sharp from "sharp";
import { readFileSync } from "node:fs";
const svg = readFileSync("public/icon.svg");
for (const [name, size] of [["apple-touch-icon.png", 180], ["icon-192.png", 192], ["icon-512.png", 512]])
  await sharp(svg).resize(size, size).png().toFile("public/" + name);
// maskable: spiral inside the central 60% safe zone
const inner = await sharp(svg).resize(310, 310).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: "#F3EEE3" } })
  .composite([{ input: inner, gravity: "center" }]).png().toFile("public/icon-maskable-512.png");
console.log("icons ok");
