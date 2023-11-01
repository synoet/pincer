import * as fs from "fs";
import dotenv from "dotenv";

const envConfig = dotenv.parse(fs.readFileSync(".env"));

const defines = Object.keys(envConfig).reduce((acc, key) => {
  acc[`process.env.${key}`] = JSON.stringify(envConfig[key]);
  return acc;
}, {});

require("esbuild")
  .build({
    entryPoints: ["./src/extension.ts"],
    bundle: true,
    outfile: "out/extension.js",
    external: ["vscode"],
    format: "cjs",
    platform: "node",
    define: defines,
  })
  .catch(() => process.exit(1));
