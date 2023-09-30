import { arrange } from "../src/index";
import { tmpdir } from "os";
import { resolve } from "path";
import { promises } from "fs";
import assert from "assert";
import { PlainTest } from "./common/types";
import { randomString } from "./common/util";

export const name = "arrange() throws on bad file extension";

export const test = async function arrangeThrowsOnBadFileExt(context) {
  try {
    await arrange(context.tempFile as string);
    assert.equal(
      true,
      false,
      "Arrange should have thrown upon finding an unknown file extension"
    );
  } catch (assertThrew) {
    assert(assertThrew instanceof RangeError);
    assert(Boolean(assertThrew.message));
    assert(assertThrew.message.includes("Unknown config file type"));
  }
} as PlainTest["test"];

export const before = (async (context) => {
  const randomFile = [randomString(), ".", randomString(3)].join("");
  const tempFile = resolve(tmpdir(), "./", randomFile);
  const file = await promises.open(tempFile, "a");
  await file.close();
  context.tempFile = tempFile;
}) as PlainTest["before"];
