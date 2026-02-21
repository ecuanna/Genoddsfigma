import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    {
      name: "fix-figma-assets",
      resolveId(id) {
        if (id.startsWith("figma:asset/")) return id;
      },
      load(id) {
        if (id.startsWith("figma:asset/")) {
          return `export default "/herologo.png";`;
        }
      },
    },
  ],
});
