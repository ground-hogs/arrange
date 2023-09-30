# Arrange

Arrange is a library for loading configuration files.

It can load configs from any number of sources, as long as there is a config parser for that source.

By default, it ships with parsers for JSON and JS files.

## Usage

### JSON files

Suppose a `config.json` file like this one:

```json
{
  "API": "https://233.234.235:123/service"
}
```

To consume it, you would do:

```ts
import { arrange } from ("@cfvergara/arrange");

const config = await arrange("./config.json");

console.log( config.API ); // "https://233.234.235:123/service"

```

### JS files

Suppose a `config.json` file like this one:

```js
module.exports = {
  API: process.env.API_URL || "https://233.234.235:123/service",
};
```

Or like this one:

```js
export default function configureSomething() {
  API: process.env.API_URL || "https://233.234.235:123/service",
};
```

To consume it, you would do:

```ts
import { arrange } from ("@cfvergara/arrange");

const config = arrange("./config.mjs").then( console.log); // { "API": "https://233.234.235:123/service" }

```

## License

Arrange is licensed under [CC-BY-NC-SA][2]([es][1], [en][2]) terms

[1]: https://creativecommons.org/licenses/by-nc-sa/2.5/ar/deed.es
[2]: https://creativecommons.org/licenses/by-nc-sa/2.5/ar/deed.en
