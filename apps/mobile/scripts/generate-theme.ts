// scripts/generate-theme.ts
import fs from "fs";
import path from "path";
import { THEME_CONFIG } from "@repo/theme/global";

const outFile = path.resolve("./app/global.css");

function generateCSS() {
  const header = `
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
`;

  function vars(obj: Record<string, string>) {
    return Object.entries(obj)
      .map(([k, v]) => `    --${k}: ${v};`)
      .join("\n");
  }

  const light = `  :root {\n${vars(THEME_CONFIG.light)}\n  }`;
  const dark = `  .dark:root {\n${vars(THEME_CONFIG.dark)}\n  }`;

  const footer = `}\n`;

  const css = `${header}${light}\n\n${dark}\n${footer}`;

  fs.writeFileSync(outFile, css, "utf-8");
  console.log(`✅ Theme CSS generated at ${outFile}`);
}

generateCSS();
