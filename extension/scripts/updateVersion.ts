import { createClient } from "@supabase/supabase-js";
import { execSync } from "child_process";
import * as fs from "fs";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const EXTENSION_VERSION_PATH = "../EXTENSION_VERSION";

if (!supabaseKey) {
  throw new Error("Missing SUPABASE_KEY env variable");
}

if (!supabaseUrl) {
  throw new Error("Missing SUPABASE_URL env variable");
}

const supabase = createClient(supabaseUrl, supabaseKey);

if (!fs.existsSync(EXTENSION_VERSION_PATH)) {
  throw new Error("Missing EXTENSION_VERSION file");
}

const versionString = fs
  .readFileSync(EXTENSION_VERSION_PATH, "utf8")
  .split(".");

const version: {
  major: number;
  minor: number;
  patch: number;
} = {
  major: parseInt(versionString[0]),
  minor: parseInt(versionString[1]),
  patch: parseInt(versionString[2]),
};

if (version.patch < 9) {
  version.patch += 1;
} else if (version.patch === 9 && version.minor < 9) {
  version.patch = 0;
  version.minor += 1;
} else if (version.patch === 9 && version.minor === 9) {
  version.patch = 0;
  version.minor = 0;
  version.major += 1;
} else {
  throw new Error("Version is too high");
}

const newVersionString = `${version.major}.${version.minor}.${version.patch}`;

fs.writeFileSync(EXTENSION_VERSION_PATH, newVersionString);

const packageJson = JSON.parse(fs.readFileSync("../package.json", "utf8"));
packageJson["version"] = newVersionString;
fs.writeFileSync("../package.json", JSON.stringify(packageJson, null, 2));

execSync("cd ../ && bun run esbuild");
execSync("cd ../ && yes 'y' | vsce package --out ./bin");

const packageName = `pincer-extension-${newVersionString}.vsix`;

const packageFile = fs.readFileSync(`../bin/${packageName}`);

const { error } = await supabase.storage
  .from("extension-bin")
  .upload(packageName, packageFile);

const { data } = await supabase.from("Version").select("*").eq("latest", true);

if (data && data.length > 0) {
  await supabase
    .from("Version")
    .update({
      latest: false,
    })
    .eq("version", data[0].version);
}

await supabase.from("Version").insert({
  version: newVersionString,
  latest: true,
});

if (error) {
  console.error("failed to upload package", error);
}

console.log(
  `bumped extension version ${versionString.join(
    "."
  )} -> ${newVersionString}, and uploaded package`
);
