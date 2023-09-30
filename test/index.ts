import * as structureIsSolid from "./structureIsSolid";
import * as arrangeThrowsOnBadFileExt from "./arrangeThrowsOnBadFileExt";
import * as arrangeThrowsIfFileIsInvalid from "./arrangeThrowsIfFileIsInvalid";
import * as arrangeCanParseGoodJSON from "./arrangeCanParseGoodJSON";
import * as arrangeCanReadGoodJS from "./arrangeCanReadGoodJS";
import type {
  PlainTest,
  TestContext,
  TestFunction,
  TestResults,
} from "./common/types";
import { ensureTest } from "./common/util";

const TESTS: Array<PlainTest> = [
  structureIsSolid,
  arrangeThrowsOnBadFileExt,
  arrangeThrowsIfFileIsInvalid,
  arrangeCanParseGoodJSON,
  arrangeCanReadGoodJS,
].map(ensureTest);

(async () => {
  const log = console.log.bind(console);

  const { OK, notOK }: TestResults = { OK: [], notOK: [] };

  log(`1..${TESTS.length || 1}\n`);

  let pos = 0;
  for (const test of TESTS) {
    pos += 1;
    try {
      await runTest(test);
    } catch (testFailed) {
      onTestFailed(testFailed, test);
    }
  }

  if (notOK.length) {
    log(`FAILED tests ${notOK.join(", ")}`);
  }
  log("");
  log(
    `Failed ${notOK.length}/${TESTS.length}, ${roundish(
      100 * (OK.length / TESTS.length)
    )}% okay`
  );

  async function runTest(testCase: PlainTest) {
    const { before, test, after, name } = testCase;

    const testContext: TestContext = {
      test: { before, test, after },
    };

    before && (await before(testContext));
    await test(testContext);
    after && (await after(testContext));

    log(`ok - ${name}`);
    OK.push(pos);
  }

  function onTestFailed(error: unknown, { name }: PlainTest) {
    log(`not ok ${pos + 1} - ${name}`);
    log(["---", `message: ${(error as Error).message}`, "---"].join("\n"));

    notOK.push(pos);
  }

  function roundish(num: number, digits = 2) {
    const { round, pow } = Math;
    const { EPSILON } = Number;
    return round((num + EPSILON) * pow(10, digits)) / pow(10, digits);
  }
})();
