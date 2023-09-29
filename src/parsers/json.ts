import { ConfigParser } from "../index";
import { isAbsolute, resolve } from "path";
import { existsSync } from "fs";
import { readFile } from "fs/promises";

const { parse } = JSON;

export const ext = "json";

export const parser: ConfigParser = async (path) => {
  if (!isAbsolute(path)) {
    path = resolve(process.cwd(), path);
  }
  if (!existsSync(path)) {
    throw new Error(`Config file not found in ${path}`);
  } else {
    try {
      const contents = await readFile(path, "utf-8");
      return parse(contents);
    } catch (cantParse) {
      if (cantParse instanceof Error) {
        switch (true) {
          case (cantParse.message as string).includes("JSON"):
            throw new RangeError(`JSON in "${path}" is invalid`);
            break;
          default:
            throw new RangeError(`Can't read JSON config from "${path}"`);
            break;
        }
      }
    }
  }
};
