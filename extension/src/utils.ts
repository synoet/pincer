import * as fs from 'fs';

export function readVersion(): string {
  if (!fs.existsSync("../EXTENSION_VERSION")) {
    return fs.readFileSync("../EXTENSION_VERSION", "utf8")
  }
  return "0.0.0"
}
