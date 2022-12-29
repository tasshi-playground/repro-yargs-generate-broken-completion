# Archived

The original issue was closed in https://github.com/yargs/yargs/pull/2269.

# repro-yargs-generate-broken-completion-with-alias

minimal reproduction of https://github.com/yargs/yargs/issues/2268 .

## Summary

When we generate the completion script for zsh, with a option with an alias, the completion shown is incorrect.
That's because the description of key from alias is missing in the generated completion script for zsh.

```shell
 -- values --
--bar          -- Bar option
--foo          -- Foo option
--help         -- Show help
--version      -- Show version number
-B         -F  --
```

## Reproduction

I created the minimum reproduction in https://github.com/tasshi-playground/repro-yargs-generate-broken-completion-with-alias .

```shell
# If you don't enable zsh-completion, you need to enable it first.
# Clone and configure repository
$ git clone git@github.com:tasshi-playground/repro-yargs-generate-broken-completion-with-alias.git
$ cd repro-yargs-generate-broken-completion-with-alias
$ npm ci
$ npm run build
$ ./cli.js completion > /path/to/your/fpath/_cli.js
# Reload the shell
```

In the repository, I specified the options and aliases as follows.

```javascript
yargs
  .option("foo", {
    describe: "Foo option",
    alias: "F",
    type: "string",
  })
  .option("bar", {
    describe: "Bar option",
    alias: "B",
    type: "string",
  })
  .completion()
  .help().argv;
```

### Expected Behavior

The output when I strike the **TAB** should be the following.

```shell
./cli.js - #Strike TAB
 -- values --
--bar      -B  -- Bar option
--foo      -F  -- Foo option
--help         -- Show help
--version      -- Show version number
```

### Actual Behavior

The actual output is the following.
The aliases (`-B` and `-F`) are aligned to same line with no descriptions.

```shell
./cli.js - #Strike TAB
 -- values --
--bar          -- Bar option
--foo          -- Foo option
--help         -- Show help
--version      -- Show version number
-B         -F  --
```

## Cause

When I request a completion with striking the **TAB** key, completion function calls the original file with `--get-yargs-completions` option.
It is specified in completion script as follows.

```shell
_cli.js_yargs_completions()
{
  local reply
  local si=$IFS
  IFS=$'
' reply=($(COMP_CWORD="$((CURRENT-1))" COMP_LINE="$BUFFER" COMP_POINT="$CURSOR" ./cli.js --get-yargs-completions "${words[@]}"))
  IFS=$si
  _describe 'values' reply
}
compdef _cli.js_yargs_completions cli.js
```

However, the output of `--get-yargs-completions` is incorrect.
With current version of yargs, the output is the following.

```shell
$ node ./lib/index.js --get-yargs-completions -
--version:Show version number
--foo:Foo option
-F:
--bar:Bar option
-B:
--help:Show help
```

The key `-F` and `-B` are specified without description.

According to the document of zsh-completion, the two keys have the same description are collected together.
https://github.com/zsh-users/zsh-completions/blob/master/zsh-completions-howto.org#writing-simple-completion-functions-using-_describe
> If two candidates have the same description, _describe collects them together on the same row and ensures that descriptions are aligned in neatly in columns.

So if we want to align the option and its alias, we have to add the description of option to the alias as follows.

```shell
$ node ./lib/index.js --get-yargs-completions -
--version:Show version number
--foo:Foo option
-F:Foo option
--bar:Bar option
-B:Bar option
--help:Show help
```

## Lisence

This project is licensed under the [MIT license.](./LICENSE)
