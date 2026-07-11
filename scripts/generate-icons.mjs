// 生成 PWA 所需的多尺寸 PNG 图标
// 用法：node scripts/generate-icons.mjs
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const svgPath = resolve(root, "public/icon.svg");
const svgBuffer = readFileSync(svgPath);

const sizes = [
  { size: 192, name: "pwa-192x192.png" },
  { size: 512, name: "pwa-512x512.png" },
  { size: 180, name: "apple-touch-icon.png" },
  { size: 32, name: "favicon-32x32.png" },
  { size: 16, name: "favicon-16x16.png" },
];

// maskable 图标：在原图周围加 padding 让图标居于安全区内
const maskablePadding = 0.2; // 20% padding

for (const { size, name } of sizes) {
  await sharp(svgBuffer, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(resolve(root, "public", name));
  console.log(`✓ ${name} (${size}x${size})`);
}

// 生成 maskable 图标（512x512，带 padding 背景）
const maskableInner = Math.round(512 * (1 - maskablePadding * 2));
const innerIcon = await sharp(svgBuffer, { density: 384 })
  .resize(maskableInner, maskableInner)
  .png()
  .toBuffer();

await sharp({
  create: {
    width: 512,
    height: 512,
    channels: 4,
    background: { r: 36, g: 58, b: 47, alpha: 1 }, // moss-deep
  },
})
  .composite([
    {
      input: innerIcon,
      top: Math.round((512 - maskableInner) / 2),
      left: Math.round((512 - maskableInner) / 2),
    },
  ])
  .png()
  .toFile(resolve(root, "public", "maskable-512x512.png"));
console.log("✓ maskable-512x512.png (512x512, 带 padding)");

console.log("\n全部图标生成完成。");
