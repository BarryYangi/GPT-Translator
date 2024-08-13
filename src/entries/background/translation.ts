import browser from "webextension-polyfill";
import OpenAI from "openai";

async function getOpenAIConfig() {
  const result = await browser.storage.sync.get(["openaiApiKey", "useProxy", "proxyUrl"]);
  return {
    apiKey: result.openaiApiKey,
    useProxy: result.useProxy,
    proxyUrl: result.proxyUrl
  };
}

export async function translateText(text: string) {
  const config = await getOpenAIConfig();
  
  if (!config.apiKey) {
    throw new Error("OpenAI API key is not set");
  }

  const { defaultLanguage } = await browser.storage.sync.get("defaultLanguage");

  const openai = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.useProxy && config.proxyUrl ? config.proxyUrl : undefined,
  });

  const stream = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: `You are a translator. Translate the following text to ${defaultLanguage || 'English'}.` },
      { role: "user", content: text }
    ],
    stream: true,
  });

  return stream;
}