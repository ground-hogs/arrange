import { createRequire } from "module";
import { isAbsolute, resolve } from "path";
import { ConfigParser } from "../index";
import { existsSync } from "fs";

export const ext = ["js", "mjs"];

type ConfigReturn = ReturnType<ConfigParser>;

export const parser: ConfigParser = async (path: string) => {
  if (!isAbsolute(path)) {
    path = resolve(process.cwd(), path);
  }

  let contents: unknown;
  if (module && "require" in module) {
    const doRequire = module.require.bind(module);
    contents = doRequire(path);
  } else {
    const { default: imported } = await import(path);
    contents = imported;
  }

  if (contents instanceof Function) {
    return contents() as ConfigReturn;
  }
  return contents as ConfigReturn;
};
