const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const stream = require("./commands/stream");

yargs(hideBin(process.argv)).command(
  "stream [OPTION]...",
  "infinite streaming start",
  // https://cloud.google.com/speech-to-text/docs/reference/rest/v1p1beta1/RecognitionConfig
  yargs => {
    // https://cloud.google.com/speech-to-text/docs/reference/rest/v1p1beta1/RecognitionConfig#audioencoding
    yargs.positional("encoding", {
      describe: "encoding of audio",
      default: "LINEAR16",
    });
    yargs.positional("sample-rate", {
      describe: "sample rate in Hz of audio",
      default: 16000,
    });
    yargs.positional("lang", {
      describe: "language code of audio (alternative language codes supported)",
      default: "en-US",
    });
    yargs.positional("translate", {
      describe: "translation target of audio",
      default: "",
    });
    yargs.positional("output", {
      describe: "output filename",
      default: "",
    });
  },
  argv => {
    stream(argv.encoding, argv.sampleRate, argv.lang, argv.translate, argv.output);
  },
).argv;
