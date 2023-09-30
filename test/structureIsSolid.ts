import * as exported from "../src/index";
import { equal, notEqual } from "assert";
import { PlainTest } from "./common/types";

async function AsyncFn() {}

export const name = `Main export has async two functions, arrange and arrangeMany`;
export const test = async function arrangeThrowsOnBadFile(context) {
  equal(2, Object.keys(exported).length);
  const { arrange, arrangeMany } = exported;
  notEqual(undefined, arrange, "arrange() musts be defined in the main export");
  notEqual(
    undefined,
    arrangeMany,
    "arrangeMany() musts be defined in the main export"
  );
  equal(
    true,
    arrange.constructor === AsyncFn.constructor,
    "arrange() is an async function"
  );
  equal(
    true,
    arrangeMany.constructor === AsyncFn.constructor,
    "arrangeMany() is an async function"
  );
} as PlainTest["test"];
