import { notEqual, match } from 'assert';
import { isAbsolute, resolve } from 'path';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';

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
  let contents;
  if (module && "require" in module) {
    const doRequire = module.require.bind(module);
    contents = doRequire(path);
  } else {
    const {
      default: imported
    } = await import(path);
    contents = imported;
  }
  if (contents instanceof Function) {
    return contents();
  }
  return contents;
};

/**
 * @typedef {boolean | Array<unknown> | Record<string, unknown>} Extendable
 */
/**
 * @typedef {Array<Extendable>} Extendables
 */
/**
 * Yanked from JQuery.
 * @see https://gist.github.com/cfv1984/6319681685f78333d98a
 * @param {Extendables}
 * @returns Record
 */
function mergeDeep(..._) {
  function isFunction(fn) {
    return typeof fn === "function" && fn.constructor === Function;
  }
  function isArray(ar) {
    return ar instanceof Array;
  }
  function isPlainObject(obj) {
    return obj !== null && typeof obj == "object" && "constructor" in obj && obj.constructor == Object;
  }
  let options;
  let src;
  let copy;
  let copyIsArray = false;
  let clone;
  let target = arguments[0] || {};
  let i = 1;
  let deep = false;
  const length = arguments.length;
  if (typeof target === "boolean") {
    deep = target;
    target = arguments[i] || {};
    i++;
  }
  if (typeof target !== "object" && !isFunction(target)) target = {};
  if (i === length) {
    target = this;
    i--;
  }
  for (; i < length; i++) {
    if ((options = arguments[i]) != null) {
      for (const name in options) {
        src = target[name];
        copy = options[name];
        if (target === copy) continue;
        if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
          if (!copyIsArray) {
            copyIsArray = false;
            clone = src && isArray(src) ? src : [];
          } else clone = src && isPlainObject(src) ? src : {};
          target[name] = mergeDeep(deep, clone, copy);
        } else if (copy !== undefined) target[name] = copy;
      }
    }
  }
  return target;
}

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
  for (const [_ext, parser] of DEFAULT_ARRANGE_PARSERS) {
    attachToMap(_ext, parser, loadedParsers);
  }
  if (parsers) {
    for (const [_ext2, parser] of parsers) {
      attachToMap(_ext2, parser, loadedParsers);
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
async function arrangeMany(paths, parsers) {
  const results = await Promise.all(paths.map(path => arrange(path, parsers)));
  return mergeDeep(...results);
}
function attachToMap(ext, parser, map) {
  if (Array.isArray(ext)) {
    ext.forEach(e => map.set(e, parser));
  } else {
    map.set(ext, parser);
  }
}

export { arrange, arrangeMany };
