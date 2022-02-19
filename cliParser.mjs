import commandLineArgs from "command-line-args";
import commandLineUsage from "command-line-usage";

const schema = [
  {
    name: "url",
    type: String,
    description: "URL of the file to download",
    defaultOption: true
  },
  {
    name: "headers",
    type: String,
    description: "HTTP headers to send with the request",
    alias: "H",
    multiple: true,
    defaultValue: []
  },
  {
    name: "connections",
    type: Number,
    description: "Number of concurrent connections to use",
    defaultValue: 10
  },
  {
    name: "buffer_size",
    type: Number,
    description: "Size of the buffer to use for each connection",
    defaultValue: 1024 * 1024
  }
];

const printUsage = () => {
  const sections = [
    {
      header: "Sync downloader",
      content: "Downloads files to stdout with concurrency"
    },
    {
      header: "Options",
      optionList: schema
    }
  ];
  console.log(commandLineUsage(sections));
};

const getCommandLineOptions = () => {
  const parsed = commandLineArgs(schema);
  if (!parsed.url) {
    printUsage();
    process.exit(1);
  }
  parsed.headers = Object.fromEntries(
    parsed.headers.map(header => {
      const index = header.indexOf(":");
      return [header.substring(0, index), header.substring(index + 1)];
    })
  );
  return parsed;
};

export default getCommandLineOptions;
