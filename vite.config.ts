import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ✅ TEK DOSYADA: React classic runtime + figma:asset rewrite
export default defineConfig({
  plugins: [
    // 1) ✅ "React is not defined" fix
    react({
      jsxRuntime: "classic",
    }),

    // 2) ✅ figma:asset/... -> /figma/asset/...
    //    Böylece Vite build sırasında "figma:asset" diye dosya aramaz,
    //    tarayıcıda public klasöründen statik URL olarak yükler.
    {
      name: "rewrite-figma-asset-urls",
      enforce: "pre",
      transform(code, id) {
        // TS/JS/JSX/TSX/CSS/HTML vb. kaynaklarda çalışsın
        if (!/\.(ts|tsx|js|jsx|css|scss|sass|less|html)$/.test(id)) return null;

        // figma:asset/xxxx -> /figma/asset/xxxx
        const replaced = code.replaceAll("figma:asset/", "/figma/asset/");
        if (replaced === code) return null;

        return { code: replaced, map: null };
      },
    },
  ],
});
