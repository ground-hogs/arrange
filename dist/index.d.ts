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
export type ConfigParser = (path: string) => Promise<Config>;
type ConfigValueType = Date | number | string | boolean;
type Config = Record<string, ConfigValueType>;
type ExtOrExts = string | Array<string>;
type ConfigParserEntry = [ExtOrExts, ConfigParser];
type ConfigParsers = Array<ConfigParserEntry>;
export default function arrange<ExpectedAttributes extends Config>(path: string, parsers?: ConfigParsers): Promise<Partial<ExpectedAttributes>>;
export {};
