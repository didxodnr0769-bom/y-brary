import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const requestedBase = env.VITE_BASE_PATH || "/";
  const base = `/${requestedBase.replace(/^\/+|\/+$/g, "")}${requestedBase === "/" ? "" : "/"}`;

  return {
    base,
    plugins: [
      react(),
      {
        name: "ybrary-indexing",
        transformIndexHtml(html) {
          return html.replace(
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
