import { arrange } from "../src/index";
import { tmpdir } from "os";
import { resolve } from "path";
import { promises } from "fs";
import assert, { doesNotThrow, equal } from "assert";
import { PlainTest } from "./common/types";
import { randomString } from "./common/util";

const REFERENCE_OBJECT = { VALUE: 1 };

export const name = "arrange() can read from a well formed JS file by default";

export const test = async function arrangeThrowsOnBadFile(context) {
  try {
    const config = await arrange(context.tempFile as string);
    equal(config.VALUE, REFERENCE_OBJECT.VALUE);
  } catch (failed) {
    equal(failed, undefined, "config should be able to parse JSON");
  }
} as PlainTest["test"];

export const before = (async (context) => {
  const { stringify } = JSON;
  const randomFile = resolve(tmpdir(), [randomString(), ".", "js"].join(""));
  const jsString = `module.exports = ` + stringify(REFERENCE_OBJECT);
  await promises.writeFile(randomFile, jsString);
  context.tempFile = randomFile;
}) as PlainTest["before"];
