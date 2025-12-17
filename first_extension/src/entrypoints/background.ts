// export default defineBackground(() => {
//   console.log('Hello background!', { id: browser.runtime.id });
// });

import { browser } from 'wxt/browser';
import { cropImage } from '../lib/capture/cropImage';
import { TesseractOCR } from '../lib/ocr/tesseractOcr';
const ocr = new TesseractOCR();


export default defineBackground(() => {
  browser.runtime.onMessage.addListener(async (msg, sender) => {
    if (msg.type === 'START_SELECTION') {

      // console.log('msg=', msg);
      // console.log('sender=', sender);
      browser.tabs.sendMessage(msg.tabId, {
        type: 'ENTER_SELECTION_MODE',
      });
    }


    if (msg.type === 'SELECTION_COMPLETE') {
      const tabId = sender.tab?.id;
      // console.log('senderTabId=', tabId);
      if (!tabId) return;

      // 1️⃣ Capture screenshot
      const screenshot = await browser.tabs.captureVisibleTab({
        format: 'png',
      });

      // 2️⃣ Crop image
      const cropped = await cropImage(
        screenshot,
        msg.rect,
        msg.dpr
      );

      browser.tabs.sendMessage(tabId, {
        type: 'PROCESSING_STARTED',
      });

      // // 3️⃣ Send cropped image text back
      // const text = await ocr.recognize(cropped);

      // browser.tabs.sendMessage(tabId, {
      //   type: 'OCR_RESULT',
      //   text,
      // });

      browser.tabs.sendMessage(tabId, {
        type: 'CROPPED_IMAGE',
        image: cropped,
      });

    }

  });

});
