var assert = require('assert');
var path = require('path');
var fs = require('fs');
var promises = require('fs/promises');
var module$1 = require('module');

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
  const doRequire = module$1.createRequire((typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('index.js', document.baseURI).href)));
  const contents = doRequire(path$1);
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
  assert.notEqual(path, undefined, "Path can't be undefined");
  assert.notEqual(path, null, "Path can't be null");
  assert.notEqual(path, "", "Path can't be empty");
  assert.match(path, /.?\..?/, "Path needs to have SOME extension");
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

module.exports = arrange;
//# sourceMappingURL=index.js.map
