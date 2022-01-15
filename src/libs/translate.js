const { Translate } = require("@google-cloud/translate").v2;

const translate = target => {
  const client = new Translate();

  const text = async (text = "") => {
    if (text === "") {
      return [];
    }
    const [translations] = await client.translate(text, target);
    return Array.isArray(translations) ? translations : [translations];
  };

  return {
    target,
    text,
  };
};

const Deepl = require("deepl");

const deepl = (authKey, target) => {
  const text = async (text = "") => {
    if (text === "") {
      return [];
    }
    const { data } = await Deepl({
      free_api: true,
      text: text,
      target_lang: target,
      auth_key: authKey,
    });
    const translations = [];
    for (var i = 0; i < data.translations.length; i++) {
      translations.push(data.translations[i].text);
    }
    return translations;
  };

  return {
    target,
    text,
  };
};

module.exports = {
  translate,
  deepl,
};
