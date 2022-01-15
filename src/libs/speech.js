const Speech = require("@google-cloud/speech").v1;

const speech = (encoding, sampleRate, languageCode) => {
  const config = {
    encoding,
    sampleRateHertz: sampleRate,
    alternativeLanguageCodes: [],
  };

  if (Array.isArray(languageCode)) {
    config["languageCode"] = languageCode.slice(0, 1);
    config["alternativeLanguageCodes"] = languageCode.slice(1);
  } else {
    config["languageCode"] = languageCode;
  }

  const request = {
    config,
    interimResults: true,
  };

  const client = new Speech.SpeechClient();
  return {
    client,
    request,
    streamingRecognize: (callback, onError = err => {}) => {
      return client
        .streamingRecognize(request)
        .on("error", err => onError(err))
        .on("data", callback);
    },
  };
};

module.exports = {
  speech,
};
