import { translateText } from './translation';
import browser from 'webextension-polyfill';

browser.runtime.onMessage.addListener((message, sender) => {
  console.log("Message received in background script:", message);

  if (message.action === "translateText") {
    return new Promise((resolve) => {
      translateText(message.text)
        .then(async (stream) => {
          if (sender.tab && sender.tab.id) {
            const port = browser.tabs.connect(sender.tab.id, { name: "translation" });
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || "";
              port.postMessage({ type: "chunk", content });
            }
            port.postMessage({ type: "done" });
            resolve({ success: true });
          } else {
            throw new Error("Invalid sender tab");
          }
        })
        .catch((error) => {
          console.error("Translation error:", error);
          resolve({ error: error.message });
        });
    });
  }
});