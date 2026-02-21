import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    // ✅ EN ÖNEMLİ: figma:asset/... referanslarını build'den önce normal path'e çevirir
    {
      name: "rewrite-figma-asset-urls",
      enforce: "pre",
      transform(code, id) {
        // HTML/TS/JS/CSS vb. her yerde yakalasın
        if (!/\.(ts|tsx|js|jsx|css|scss|sass|less|html)$/.test(id)) return null;

        // figma:asset/xxxx.png  ->  /figma/asset/xxxx.png
        const replaced = code.replaceAll("figma:asset/", "/figma/asset/");
        if (replaced === code) return null;

        return { code: replaced, map: null };
      },
    },
  ],
});
