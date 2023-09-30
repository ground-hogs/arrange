import { arrange } from "../src/index";
import { tmpdir } from "os";
import { resolve } from "path";
import { promises } from "fs";
import assert from "assert";
import { PlainTest } from "./common/types";
import { randomString } from "./common/util";

export const name = "arrange() throws if a file is not valid";

export const test = async function arrangeThrowsOnBadFile(context) {
  try {
    await arrange(context.tempFile as string);
    assert.equal(
      true,
      false,
      "Arrange should have thrown upon finding a bad JSON file"
    );
  } catch (assertThrew) {
    assert(assertThrew instanceof RangeError);
  }
} as PlainTest["test"];

export const before = (async (context) => {
  const randomFile = [randomString(), ".", "json"].join("");
  const tempFile = resolve(tmpdir(), "./", randomFile);
  const file = await promises.open(tempFile, "a");
  await file.close();
  context.tempFile = tempFile;
}) as PlainTest["before"];
