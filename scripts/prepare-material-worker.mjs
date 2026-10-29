import { copyFileSync, cpSync } from "node:fs";
copyFileSync(new URL("../node_modules/pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url), new URL("../public/pdf.worker.min.mjs", import.meta.url));
for (const directory of ["cmaps", "standard_fonts", "wasm"]) {
  cpSync(new URL(`../node_modules/pdfjs-dist/${directory}/`, import.meta.url), new URL(`../public/pdfjs/${directory}/`, import.meta.url), { recursive: true });
}
