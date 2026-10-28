import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig(({ mode }) => mode === "artifact" ? {
  // One self-contained HTML file for claude.ai: the coach then runs on your Claude subscription.
  plugins: [viteSingleFile()],
  resolve: { alias: { "virtual:pwa-register": "/src/pwa-stub.js" } },
  build: { outDir: "dist-artifact", emptyOutDir: true },
} : {
  plugins: [
    VitePWA({
      registerType: "prompt",
      includeAssets: ["icon.svg", "apple-touch-icon.png"],
      workbox: {
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
        globPatterns: ["**/*.{js,css,html,svg,png,json,webmanifest}"],
        runtimeCaching: [
          { urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/, handler: "StaleWhileRevalidate", options: { cacheName: "fonts", expiration: { maxEntries: 20 } } },
        ],
      },
      manifest: {
        id: "/", name: "The Belief Lab", short_name: "Belief Lab",
        description: "A private companion to Follow the Pull.",
        start_url: "/", scope: "/", display: "standalone", orientation: "portrait",
        background_color: "#F3EEE3", theme_color: "#F3EEE3",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
  test: { include: ["tests/**/*.test.js"] },
});
