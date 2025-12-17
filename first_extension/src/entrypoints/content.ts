// export default defineContentScript({
//   matches: ['*://*.google.com/*'],
//   main() {
//     console.log('Hello content.');
//   },
// });

import { browser } from 'wxt/browser';

export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    let startX = 0;
    let startY = 0;
    let box: HTMLDivElement | null = null;
    let dimmer: HTMLDivElement | null = null;

    const cleanup = () => {
      box?.remove();
      dimmer?.remove();
      box = null;
      dimmer = null;
      window.removeEventListener('mousedown', onDown, true);
      window.removeEventListener('mousemove', onMove, true);
      window.removeEventListener('mouseup', onUp, true);
      window.removeEventListener('keydown', onKey, true);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cleanup();
    };

    const onDown = (e: MouseEvent) => {
      startX = e.clientX;
      startY = e.clientY;

      box = document.createElement('div');
      Object.assign(box.style, {
        position: 'fixed',
        border: '2px solid #00aaff',
        background: 'rgba(0,170,255,0.15)',
        zIndex: '2147483647',
      });
      document.body.appendChild(box);
    };

    const onMove = (e: MouseEvent) => {
      if (!box) return;

      const x = Math.min(e.clientX, startX);
      const y = Math.min(e.clientY, startY);
      const w = Math.abs(e.clientX - startX);
      const h = Math.abs(e.clientY - startY);

      Object.assign(box.style, {
        left: `${x}px`,
        top: `${y}px`,
        width: `${w}px`,
        height: `${h}px`,
      });
    };

    const onUp = () => {
      if (!box) return;

      const rect = box.getBoundingClientRect();
      cleanup();

      browser.runtime.sendMessage({
        type: 'SELECTION_COMPLETE',
        rect,
        dpr: window.devicePixelRatio,
      });
    };

    const enter = () => {
      console.log('hello content script');
      cleanup();
      dimmer = document.createElement('div');
      Object.assign(dimmer.style, {
        position: 'fixed',
        inset: '0',
        background: 'rgba(0,0,0,0.25)',
        cursor: 'crosshair',
        zIndex: '2147483646',
      });
      document.body.appendChild(dimmer);

      window.addEventListener('mousedown', onDown, true);
      window.addEventListener('mousemove', onMove, true);
      window.addEventListener('mouseup', onUp, true);
      window.addEventListener('keydown', onKey, true);
    };

    browser.runtime.onMessage.addListener((msg) => {
      if (msg.type === 'ENTER_SELECTION_MODE') enter();
    });

    // browser.runtime.onMessage.addListener((msg) => {
    //   if (msg.type === 'DEBUG_IMAGE') {
    //     showDebugImage(msg.image);
    //   }
    // });

    // function showDebugImage(src: string) {
    //   const img = document.createElement('img');
    //   img.src = src;

    //   Object.assign(img.style, {
    //     position: 'fixed',
    //     top: '20px',
    //     right: '20px',
    //     maxWidth: '300px',
    //     border: '2px solid red',
    //     zIndex: '2147483647',
    //     background: '#fff',
    //   });

    //   document.body.appendChild(img);

    //   setTimeout(() => img.remove(), 5000);
    // }

    browser.runtime.onMessage.addListener((msg) => {
      if (msg.type === 'OCR_RESULT') {
        showTextOverlay(msg.text);
      }
    });

    function showTextOverlay(text: string) {
      const box = document.createElement('div');

      Object.assign(box.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        maxWidth: '320px',
        padding: '12px',
        background: 'rgba(0,0,0,0.8)',
        color: '#fff',
        fontSize: '14px',
        lineHeight: '1.4',
        borderRadius: '8px',
        zIndex: '2147483647',
      });

      box.textContent = text;
      document.body.appendChild(box);

      setTimeout(() => box.remove(), 6000);
    }



  },
});
