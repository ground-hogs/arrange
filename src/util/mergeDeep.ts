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
export default function mergeDeep<NergeResult = unknown>(
  this: any,
  ..._: Extendables
): NergeResult {
  function isFunction(fn: unknown) {
    return typeof fn === "function" && fn.constructor === Function;
  }
  function isArray(ar: unknown) {
    return ar instanceof Array;
  }
  function isPlainObject(obj: unknown) {
    return (
      obj !== null &&
      typeof obj == "object" &&
      "constructor" in (obj as object) &&
      obj.constructor == Object
    );
  }

  let options: unknown;
  let src: unknown;
  let copy: unknown;
  let copyIsArray = false;
  let clone: unknown;
  let target = arguments[0] || {};
  let i = 1;
  let deep = false;
  const length = arguments.length;

  if (typeof target === "boolean") {
    deep = target;
    target = arguments[i] || {};
    i++;
  }
  if (typeof target !== "object" && !isFunction(target)) target = {};
  if (i === length) {
    target = this as any;
    i--;
  }
  for (; i < length; i++) {
    if ((options = arguments[i]) != null) {
      for (const name in options) {
        src = target[name];
        copy = options[name as keyof typeof options];
        if (target === copy) continue;

        if (
          deep &&
          copy &&
          (isPlainObject(copy) || (copyIsArray = isArray(copy)))
        ) {
          if (!copyIsArray) {
            copyIsArray = false;
            clone = src && isArray(src) ? src : [];
          } else clone = src && isPlainObject(src) ? src : {};

          target[name] = mergeDeep(
            deep,
            clone as Extendable,
            copy as Extendable
          );
        } else if (copy !== undefined) target[name] = copy;
      }
    }
  }

  return target;
}
