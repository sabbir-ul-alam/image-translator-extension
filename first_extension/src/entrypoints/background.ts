// export default defineBackground(() => {
//   console.log('Hello background!', { id: browser.runtime.id });
// });

import { browser } from 'wxt/browser';


export default defineBackground(() => {
  browser.runtime.onMessage.addListener(async (msg, sender) => {
    if (msg.type === 'START_SELECTION') {

      console.log('msg=',msg);
      console.log('sender=',sender);
      browser.tabs.sendMessage(msg.tabId, {
        type: 'ENTER_SELECTION_MODE',
      });
    }


        if (msg.type === 'SELECTION_COMPLETE') {
      const tabId = sender.tab?.id;
      console.log('senderTabId=',tabId);
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

      // 3️⃣ Send cropped image back
      browser.tabs.sendMessage(tabId, {
        type: 'DEBUG_IMAGE',
        image: cropped,
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
