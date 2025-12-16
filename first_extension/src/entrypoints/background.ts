// export default defineBackground(() => {
//   console.log('Hello background!', { id: browser.runtime.id });
// });
import { browser } from 'wxt/browser';


export default defineBackground(() => {
  browser.runtime.onMessage.addListener(async (msg) => {
    if (msg.type === 'START_SELECTION') {
      await browser.scripting.executeScript({
        target: { tabId: msg.tabId },
        files: ['content.js'],
      });

      browser.tabs.sendMessage(msg.tabId, {
        type: 'ENTER_SELECTION_MODE',
      });
    }
  });
});
