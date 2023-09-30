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

import { notEqual, match } from "assert";
import * as JSON_PARSER from "./parsers/json";
import * as JS_CONFIG_PARSER from "./parsers/js";
import mergeDeep from "./util/mergeDeep";
export type ConfigParser = (path: string) => Promise<Config>;
type ConfigValueType = Date | number | string | boolean;
type Config = Record<string, ConfigValueType>;
type ExtOrExts = string | Array<string>;
type ConfigParserEntry = [ExtOrExts, ConfigParser];
type ConfigParsers = Array<ConfigParserEntry>;

const DEFAULT_ARRANGE_PARSERS: NonNullable<ConfigParsers> = [
  [JSON_PARSER.ext, JSON_PARSER.parser],
  [JS_CONFIG_PARSER.ext, JS_CONFIG_PARSER.parser],
];
type ParserMap = Map<string, ConfigParser>;

export async function arrange<ExpectedAttributes extends Config>(
  path: string,
  parsers?: ConfigParsers
): Promise<Partial<ExpectedAttributes>> {
  notEqual(path, undefined, "Path can't be undefined");
  notEqual(path, null, "Path can't be null");
  notEqual(path, "", "Path can't be empty");
  match(path, /.?\..?/, "Path needs to have SOME extension");

  const loadedParsers: ParserMap = new Map();
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
    const parser = loadedParsers.get(ext) as ConfigParser;
    return (await parser(path)) as Partial<ExpectedAttributes>;
  } else {
    throw new RangeError(`Unknown config file type: ${ext}`);
  }
}

export async function arrangeMany(
  paths: Array<string>,
  parsers?: ConfigParsers
) {
  const results = await Promise.all(
    paths.map((path) => arrange(path, parsers))
  );
  return mergeDeep(...results);
}

function attachToMap(
  ext: ExtOrExts,
  parser: ConfigParser,
  map: Map<string, ConfigParser>
) {
  if (Array.isArray(ext)) {
    ext.forEach((e) => map.set(e, parser));
  } else {
    map.set(ext, parser);
  }
}
