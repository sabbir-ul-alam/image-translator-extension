// export default defineBackground(() => {
//   console.log('Hello background!', { id: browser.runtime.id });
// });

import { browser } from 'wxt/browser';


export default defineBackground(() => {
  browser.runtime.onMessage.addListener(async (msg, sender) => {
    if (msg.type === 'START_SELECTION') {
      browser.tabs.sendMessage(msg.tabId, {
        type: 'ENTER_SELECTION_MODE',
      });
    }
  });
});
