import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const requestedBase = env.VITE_BASE_PATH || "/";
  const base = `/${requestedBase.replace(/^\/+|\/+$/g, "")}${requestedBase === "/" ? "" : "/"}`;
  const siteUrl = env.VITE_SITE_URL || "http://localhost:3001";
  const escapeAttribute = (value: string) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  const homeUrl = escapeAttribute(new URL(base, siteUrl).href);
  const shareImageUrl = escapeAttribute(new URL(`${base}images/share/ybrary-home.jpg`, siteUrl).href);

  return {
    base,
    plugins: [
      react(),
      {
        name: "ybrary-indexing",
        transformIndexHtml(html) {
          return html.replaceAll("__YBRARY_HOME_URL__", homeUrl).replaceAll("__YBRARY_SHARE_IMAGE_URL__", shareImageUrl).replace(
            'name="robots" content="noindex,follow"',
            `name="robots" content="${env.VITE_ENABLE_INDEXING === "true" ? "index" : "noindex"},follow"`,
          );
        },
      },
    ],
    resolve: {
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
  };
});
