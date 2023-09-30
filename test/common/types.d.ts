export type TestContext = Record<string, unknown>;
export type TestFunction = (context: TestContext) => void;

export type PlainTest = {
  name: string;
  test: TestFunction;
  before?: (context: TestContext) => void;
  after?: (context: TestContext) => void;
};

export type TestResults = {
  OK: Array<number>;
  notOK: Array<number>;
};
