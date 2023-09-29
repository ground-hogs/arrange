import { notEqual, match } from 'assert';
import { isAbsolute, resolve } from 'path';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { createRequire } from 'module';

const {
  parse
} = JSON;
const ext$1 = "json";
const parser$1 = async path => {
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
          case cantParse.message.includes("JSON"):
            throw new RangeError(`JSON in "${path}" is invalid`);
          default:
            throw new RangeError(`Can't read JSON config from "${path}"`);
        }
      }
    }
  }
};

const ext = ["js", "mjs"];
const parser = async path => {
  if (!isAbsolute(path)) {
    path = resolve(process.cwd(), path);
  }
  const doRequire = createRequire(import.meta.url);
  const contents = doRequire(path);
  if (contents instanceof Function) {
    return contents();
  }
  return contents;
};

/**
 * @usage:
 * const config = await arrange("./path/to/config/file.ext");
 * // or
 * const config = await arrange([
 * "./path/to/config/file.ext",
 *  [ "js", YOUR_OWN_CONFIG_PARSER],
 * ]);
 * // or
 * const config = await arrange(
 * "./path/to/config/file.ext",
 * [
 *  [ ["js","mjs"], YOUR_OWN_CONFIG_PARSER],
 * ]);
 */
const DEFAULT_ARRANGE_PARSERS = [[ext$1, parser$1], [ext, parser]];
async function arrange(path, parsers) {
  notEqual(path, undefined, "Path can't be undefined");
  notEqual(path, null, "Path can't be null");
  notEqual(path, "", "Path can't be empty");
  match(path, /.?\..?/, "Path needs to have SOME extension");
  const loadedParsers = new Map();
  for (const [ext, parser] of DEFAULT_ARRANGE_PARSERS) {
    attactToMap(ext, parser, loadedParsers);
  }
  if (parsers) {
    for (const [ext, parser] of parsers) {
      attactToMap(ext, parser, loadedParsers);
    }
  }
  const ext = path.split(".").at(-1);
  if (ext && loadedParsers.has(ext)) {
    const parser = loadedParsers.get(ext);
    return await parser(path);
  } else {
    throw new RangeError(`Unknown config file type: ${ext}`);
  }
}
function attactToMap(ext, parser, map) {
  if (Array.isArray(ext)) {
    ext.forEach(e => map.set(e, parser));
  } else {
    map.set(ext, parser);
  }
}

export { arrange as default };
//# sourceMappingURL=index.mjs.map
