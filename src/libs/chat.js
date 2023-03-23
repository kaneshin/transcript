const { Configuration, OpenAIApi } = require("openai");

const chat = (apiKey, model = "gpt-3.5-turbo") => {
  const configuration = new Configuration({
    apiKey,
  });
  const openai = new OpenAIApi(configuration);
  const message = async (role, content) => {
    if (content === "") {
      return [];
    }
    const { data } = await openai.createChatCompletion({
      model,
      messages: [
        {
          role,
          content,
        },
      ],
    });
    const contents = [];
    for (var i = 0; i < data.choices.length; i++) {
      contents.push(data.choices[i].message.content);
    }
    return contents;
  };

  return {
    message,
    model,
  };
};

module.exports = {
  chat,
};
