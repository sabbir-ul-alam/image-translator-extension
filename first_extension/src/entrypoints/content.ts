// export default defineContentScript({
//   matches: ['*://*.google.com/*'],
//   main() {
//     console.log('Hello content.');
//   },
// });

import { browser } from 'wxt/browser';
import { recognizeText } from '../lib/ocr/tesseractClient';
import { translateText } from '../lib/translate/translateClient';
import { showTranslationOverlay } from '../lib/ui/translationOverlay';
import { getSettings } from '../lib/settings/settings';
import { showImageTranslationOverlay } from '../lib/ui/imageTranslationOverlay';
import { extractLinesFromBlocks } from '../lib/ocr/extractLinesFromBlocks';


import { recognizeWithBlocks as recognizeWithBlocks } from '../lib/ocr/tesseractLines';
import { renderTranslatedImage } from '../lib/render/renderTranslatedImage';


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
        //dborder: '2px solid #00aaff',
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

    browser.runtime.onMessage.addListener(async (msg) => {
      if (msg.type === 'ENTER_SELECTION_MODE') {
        const existing = document.getElementById('__translated_image_overlay__');
        if (existing) existing.remove();
        enter();

      }

      if (msg.type === 'PROCESSING_STARTED') {
        showLoadingOverlay();
      }

      // if (msg.type === 'OCR_RESULT') {
      //   removeLoadingOverlay();
      //   showTranslationOverlay(msg.text, { opacity: 0.85, fontSizePx: 14 });
      // }
      if (msg.type === 'CROPPED_IMAGE') {
        showLoadingOverlay('Extracting text…');

        try {
          const settings = await getSettings();

          const ocrResult = await recognizeWithBlocks(msg.image);
          const lines = extractLinesFromBlocks(ocrResult.blocks);
          if (!lines.length) {
            removeLoadingOverlay();
            // fall back to your movable overlay if you want
            showTextOverlay('No text found in the selected area');
            return;
          }

          showLoadingOverlay('Translating…');

          // Translate each line (simple MVP)
          const translatedLines = [];
          for (const line of lines) {
            const translated = await translateText(
              line.text,
              settings.sourceLang,
              settings.targetLang
            );
            translatedLines.push({ box: line.box, translated });
          }

          console.log('translatedLines=', translatedLines);

          showLoadingOverlay('Rendering…');

          const renderedImage = await renderTranslatedImage(msg.image, translatedLines);

          removeLoadingOverlay();

          showRenderedImageOverlay(
            renderedImage,
            msg.rect);

        } catch (err) {
          removeLoadingOverlay();
          showTextOverlay('Translation failed');
          console.error(err);
        }
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



    let loadingEl: HTMLDivElement | null = null;

    function showLoadingOverlay(message = 'Processing…') {
      if (!loadingEl) {
        loadingEl = document.createElement('div');
        Object.assign(loadingEl.style, {
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px 14px',
          background: 'rgba(0,0,0,0.7)',
          color: '#fff',
          borderRadius: '6px',
          fontSize: '13px',
          zIndex: '2147483647',
        });
        document.body.appendChild(loadingEl);
      }

      loadingEl.textContent = message;
    }


    function removeLoadingOverlay() {
      loadingEl?.remove();
      loadingEl = null;
    }

    function showRenderedImageOverlay(imageBase64: string, rect: DOMRect) {
      const existing = document.getElementById('__translated_image_overlay__');
      if (existing) existing.remove();

      const container = document.createElement('div');
      container.id = '__translated_image_overlay__';

      Object.assign(container.style, {
        position: 'fixed',
        left: `${rect.x}px`,
        top: `${rect.y}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        zIndex: '2147483647',
        overflow: 'hidden',
        borderRadius: '8px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
        background: 'transparent',
        cursor: 'move',

      });



      const img = document.createElement('img');
      img.src = imageBase64;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.display = 'block';


      container.appendChild(img);
      document.body.appendChild(container);

      addEscToClose(container, () => {
        applyExitAnimation(container, () => {
          container.remove();
        });
      });




      applyEnterAnimation(container);
      // makeDraggable(container, header);
      makeDraggable(container, container);


    }

    function makeDraggable(container: HTMLElement, handle: HTMLElement) {
      let dragging = false;
      let startX = 0;
      let startY = 0;
      let startLeft = 0;
      let startTop = 0;

      handle.addEventListener('mousedown', (e) => {
        dragging = true;
        startX = e.clientX;
        startY = e.clientY;

        const rect = container.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;

        e.preventDefault();
      });

      window.addEventListener('mousemove', (e) => {
        if (!dragging) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        const nextLeft = Math.max(0, startLeft + dx);
        const nextTop = Math.max(0, startTop + dy);

        container.style.left = `${nextLeft}px`;
        container.style.top = `${nextTop}px`;
      });

      window.addEventListener('mouseup', () => {
        dragging = false;
      });
    }



    function applyEnterAnimation(el: HTMLElement) {
      el.animate(
        [
          { opacity: 0, transform: 'scale(0.96)' },
          { opacity: 1, transform: 'scale(1)' }
        ],
        {
          duration: 160,
          easing: 'cubic-bezier(0.2, 0, 0, 1)',
          fill: 'forwards',
        }
      );
    }

    function applyExitAnimation(el: HTMLElement, onDone: () => void) {
      const anim = el.animate(
        [
          { opacity: 1, transform: 'scale(1)' },
          { opacity: 0, transform: 'scale(0.96)' }
        ],
        {
          duration: 120,
          easing: 'cubic-bezier(0.4, 0, 1, 1)',
          fill: 'forwards',
        }
      );

      anim.onfinish = onDone;
    }

    function addEscToClose(
      container: HTMLElement,
      onClose: () => void
    ) {
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          onClose();
          window.removeEventListener('keydown', onKeyDown, true);
        }
      };

      // Use capture phase so we catch ESC reliably
      window.addEventListener('keydown', onKeyDown, true);
    }





  },
});
