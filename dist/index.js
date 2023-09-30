var assert = require('assert');
var path = require('path');
var fs = require('fs');
var promises = require('fs/promises');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return n;
}

const {
  parse
} = JSON;
const ext$1 = "json";
const parser$1 = async path$1 => {
  if (!path.isAbsolute(path$1)) {
    path$1 = path.resolve(process.cwd(), path$1);
  }
  if (!fs.existsSync(path$1)) {
    throw new Error(`Config file not found in ${path$1}`);
  } else {
    try {
      const contents = await promises.readFile(path$1, "utf-8");
      return parse(contents);
    } catch (cantParse) {
      if (cantParse instanceof Error) {
        switch (true) {
          case cantParse.message.includes("JSON"):
            throw new RangeError(`JSON in "${path$1}" is invalid`);
          default:
            throw new RangeError(`Can't read JSON config from "${path$1}"`);
        }
      }
    }
  }
};

const ext = ["js", "mjs"];
const parser = async path$1 => {
  if (!path.isAbsolute(path$1)) {
    path$1 = path.resolve(process.cwd(), path$1);
  }
  let contents;
  if (module && "require" in module) {
    const doRequire = module.require.bind(module);
    contents = doRequire(path$1);
  } else {
    const {
      default: imported
    } = await (function (t) { return Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require(t)); }); })(path$1);
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
  assert.notEqual(path, undefined, "Path can't be undefined");
  assert.notEqual(path, null, "Path can't be null");
  assert.notEqual(path, "", "Path can't be empty");
  assert.match(path, /.?\..?/, "Path needs to have SOME extension");
  const loadedParsers = new Map();
  for (const [ext, parser] of DEFAULT_ARRANGE_PARSERS) {
    attachToMap(ext, parser, loadedParsers);
  }
  if (parsers) {
    for (const [ext, parser] of parsers) {
      attachToMap(ext, parser, loadedParsers);
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

exports.arrange = arrange;
exports.arrangeMany = arrangeMany;
