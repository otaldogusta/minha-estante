import * as fs from "fs";
import * as path from "path";

function scanDirectory(dir: string, fileCallback: (filePath: string) => void) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== "node_modules" && file !== "dist" && !file.startsWith(".")) {
        scanDirectory(fullPath, fileCallback);
      }
    } else if (file.endsWith(".tsx") || file.endsWith(".ts") || file.endsWith(".js") || file.endsWith(".mjs")) {
      fileCallback(fullPath);
    }
  }
}

scanDirectory("c:/Projects/Minha Estante/standalone/src", (filePath) => {
  const content = fs.readFileSync(filePath, "utf-8");
  if (content.includes("getLocalDB")) {
    console.log(`Match in ${filePath}`);
  }
});
