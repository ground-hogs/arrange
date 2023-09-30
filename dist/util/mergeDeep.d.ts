type Extendable = boolean | Array<unknown> | Record<string, unknown>;
type Extendables = Array<Extendable>;
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
export default function mergeDeep<NergeResult = unknown>(this: any, ..._: Extendables): NergeResult;
export {};
