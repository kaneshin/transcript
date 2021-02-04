const { Translate } = require("@google-cloud/translate").v2;
const Speech = require("@google-cloud/speech").v1p1beta1;

const translate = target => {
  const client = new Translate();

  const text = async (text = "") => {
    let [translations] = await client.translate(text, target);
    return Array.isArray(translations) ? translations : [translations];
  };

  return {
    client,
    target,
    text,
  };
};

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
  translate,
  speech,
};
