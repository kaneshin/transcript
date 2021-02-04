const readline = require("readline");
const chalk = require("chalk");
const { Writable } = require("stream");
const fs = require("fs");
const recorder = require("node-record-lpcm16");
const { translate, speech } = require("./../clients");

module.exports = (encoding, sampleRate, languageCode, target, output) => {
  const streamingLimit = 290000;
  const tr = translate(target);
  const sp = speech(encoding, sampleRate, languageCode);

  let outputFile = null;
  let translationFile = null;
  if (output) {
    outputFile = fs.createWriteStream(output);
    if (target) {
      let tmp = output.split(".");
      const name = tmp.concat([target, tmp.pop()]).join(".");
      translationFile = fs.createWriteStream(name);
    }
  }

  let recognizeStream = null;
  let audioInput = [];
  let lastAudioInput = [];
  let resultEndTime = 0;
  let isFinalEndTime = 0;
  let finalRequestEndTime = 0;
  let newStream = true;
  let bridgingOffset = 0;
  let lastTranscriptWasFinal = false;

  const speechCallback = async stream => {
    const result = stream.results[0];
    if (!result) {
      return;
    }

    console.clear();
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);

    resultEndTime = result.resultEndTime.seconds * 1000 + Math.round(result.resultEndTime.nanos / 1000000);
    lastTranscriptWasFinal = result.isFinal;
    const stdoutText = result.alternatives[0] ? result.alternatives[0].transcript : "";
    if (lastTranscriptWasFinal) {
      // write text to stdout
      process.stdout.write(chalk.green(`${stdoutText}\n`));

      // write to file
      if (outputFile) outputFile.write(`${stdoutText}\n`);

      // translate and write to file
      if (translationFile) {
        const translatedText = await tr.text(stdoutText);
        translationFile.write(translatedText.join("\n"));
        translationFile.write("\n");
      }

      isFinalEndTime = resultEndTime;
    } else {
      // write text to stdout
      process.stdout.write(`${stdoutText}`);
    }
  };

  const audioInputStreamTransform = new Writable({
    write(chunk, encoding, next) {
      if (newStream && lastAudioInput.length !== 0) {
        // Approximate math to calculate time of chunks
        const chunkTime = streamingLimit / lastAudioInput.length;
        if (chunkTime !== 0) {
          if (bridgingOffset < 0) {
            bridgingOffset = 0;
          }
          if (bridgingOffset > finalRequestEndTime) {
            bridgingOffset = finalRequestEndTime;
          }
          const chunksFromMS = Math.floor((finalRequestEndTime - bridgingOffset) / chunkTime);
          bridgingOffset = Math.floor((lastAudioInput.length - chunksFromMS) * chunkTime);

          for (let i = chunksFromMS; i < lastAudioInput.length; i++) {
            recognizeStream.write(lastAudioInput[i]);
          }
        }
        newStream = false;
      }
      audioInput.push(chunk);
      if (recognizeStream) {
        recognizeStream.write(chunk);
      }
      next();
    },

    final() {
      if (recognizeStream) {
        recognizeStream.end();
      }
    },
  });

  const startStream = () => {
    // initialize speech streaming
    recognizeStream = sp.streamingRecognize(speechCallback, err => {
      if (err.code === 11) {
        restartStream();
      } else {
        process.stdout.write(chalk.red(`${err}\n`));
        process.exit(1);
      }
    });

    // restart after timeout
    setTimeout(restartStream, streamingLimit);
  };

  const restartStream = () => {
    if (recognizeStream) {
      recognizeStream.end();
      recognizeStream.removeListener("data", speechCallback);
      recognizeStream = null;
    }
    if (resultEndTime > 0) {
      finalRequestEndTime = isFinalEndTime;
    }
    resultEndTime = 0;

    lastAudioInput = audioInput || [];
    audioInput = [];

    if (!lastTranscriptWasFinal) {
      process.stdout.write("\n");
    }

    newStream = true;
    startStream();
  };

  recorder
    .record({
      sampleRate,
      endOnSilence: false,
      threshold: 0.5,
      silence: "1.0",
      recordProgram: "sox",
    })
    .stream()
    .on("error", err => {
      process.stdout.write(chalk.red(`${err}\n`));
    })
    .pipe(audioInputStreamTransform);

  process.stdout.write(chalk.cyan(`${"=".repeat(50)}\n`));
  process.stdout.write(chalk.cyan(`  Transcript starting, press Ctrl+C to stop.\n`));
  process.stdout.write(chalk.cyan(`  - Encoding:         ${encoding}\n`));
  process.stdout.write(chalk.cyan(`  - SampleRate (Hz):  ${sampleRate}\n`));
  process.stdout.write(chalk.cyan(`  - Language Code:    ${languageCode}\n`));
  process.stdout.write(chalk.cyan(`  - Translate Target: ${target}\n`));
  process.stdout.write(chalk.cyan(`${"=".repeat(50)}\n`));

  startStream();
};
