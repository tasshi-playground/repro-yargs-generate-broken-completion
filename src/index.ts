import yargs from "yargs";

// eslint-disable-next-line no-unused-expressions
yargs
  .option("foo", {
    describe: "Foo option",
    alias: "F",
    type: "string",
  })
  .option("bar", {
    describe: "Bar option",
    alias: "p",
    type: "string",
  })
  .completion()
  .help().argv;
