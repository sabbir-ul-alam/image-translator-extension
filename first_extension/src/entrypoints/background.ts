// export default defineBackground(() => {
//   console.log('Hello background!', { id: browser.runtime.id });
// });

import { browser } from 'wxt/browser';


export default defineBackground(() => {
  browser.runtime.onMessage.addListener(async (msg, sender) => {
    if (msg.type === 'START_SELECTION') {

      console.log('msg=', msg);
      console.log('sender=', sender);
      browser.tabs.sendMessage(msg.tabId, {
        type: 'ENTER_SELECTION_MODE',
      });
    }


    if (msg.type === 'SELECTION_COMPLETE') {
      const tabId = sender.tab?.id;
      console.log('senderTabId=', tabId);
      if (!tabId) return;

      // 1️⃣ Capture screenshot
      const imageDataUrl = await browser.tabs.captureVisibleTab({
        format: 'png',
      });

      // 2️⃣ Crop image
      const cropped = await cropImage(
        imageDataUrl,
        msg.rect,
        msg.dpr
      );

      // 3️⃣ Send cropped image text back
      const text = await fakeOCR(cropped);

      browser.tabs.sendMessage(tabId, {
        type: 'OCR_RESULT',
        text,
      });
    }




  });


  async function cropImage(
    dataUrl: string,
    rect: DOMRect,
    dpr: number
  ): Promise<string> {
    const img = await loadImage(dataUrl);

    const canvas = new OffscreenCanvas(
      rect.width * dpr,
      rect.height * dpr
    );

    const ctx = canvas.getContext('2d')!;

    ctx.drawImage(
      img,
      rect.x * dpr,
      rect.y * dpr,
      rect.width * dpr,
      rect.height * dpr,
      0,
      0,
      rect.width * dpr,
      rect.height * dpr
    );

    const blob = await canvas.convertToBlob({ type: 'image/png' });
    return blobToDataUrl(blob);
  }

  async function fakeOCR(_: string): Promise<string> {
    // Simulate network + processing delay
    await new Promise(r => setTimeout(r, 800));

    return `Detected text (stub OCR)

This is placeholder text.
Next step will replace this with real OCR output.`;
  }


  function loadImage(src: string): Promise<ImageBitmap> {
    return fetch(src)
      .then(r => r.blob())
      .then(createImageBitmap);
  }

  function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }

});
