import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    // ✅ Automatic runtime (React import zorunlu değil)
    react(),

    // ✅ figma:asset/... -> /figma/asset/...
    {
      name: "rewrite-figma-asset-urls",
      enforce: "pre",
      transform(code, id) {
        if (!/\.(ts|tsx|js|jsx|css|scss|sass|less|html)$/.test(id)) return null;

        const replaced = code.replaceAll("figma:asset/", "/figma/asset/");
        if (replaced === code) return null;

        return { code: replaced, map: null };
      },
    },
  ],
});
