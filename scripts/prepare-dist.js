import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");

console.log("Preparing ./dist for publishing...");

if (!fs.existsSync(distDir)) {
  console.error("dist/ not found. Run the build first.");
  process.exit(1);
}

const filesToCopy = ["README.md", "LICENSE.md"];
for (const file of filesToCopy) {
  const srcPath = path.join(rootDir, file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, path.join(distDir, file));
  }
}

const pkgPath = path.join(rootDir, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

delete pkg.scripts;
delete pkg.devDependencies;
delete pkg.files;
delete pkg.packageManager;

const distPkg =
  JSON.stringify(pkg, null, 2)
    .replaceAll('"./dist/', '"./')
    .replaceAll('"dist/', '"./') + "\n";
fs.writeFileSync(path.join(distDir, "package.json"), distPkg, "utf8");

console.log("Done. ./dist is ready for `npm publish ./dist`.");
