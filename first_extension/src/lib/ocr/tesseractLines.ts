import { createWorker, PSM } from 'tesseract.js';
import type { OCRResult, OCRLine } from './ocrTypes';

let workerPromise: Promise<any> | null = null;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      const worker = await createWorker('eng');

      // Enable layout analysis outputs
    //    await worker.loadLanguage('eng');
    //   await worker.initialize('eng');
      

//     await worker.setParameters({
//     ['tessedit_pageseg_mode' as any]: '3',
//     ['tessjs_create_hocr' as any]: '1', 
//   });

    //   await worker.setParameters({
    //     // tessedit_pageseg_mode: PSM.AUTO_OSD, // Automatic page segmentation
    //     preserve_interword_spaces: '1',
    //     ['tessjs_create_hocr' as string]: '1',
    // //     tessjs_create_hocr: '1',
    // //     tessjs_create_osd: '1', // Necessary for layout/orientation
    //   });

      return worker;
    })();
  }
  return workerPromise;
}

// imageBase64 is your cropped image (data URL)
export async function recognizeLines(imageBase64: string): Promise<OCRResult> {
  const worker = await getWorker();
const output = {
  blocks: true,
  hocr: true,
  tsv: true,
};

const res = await worker.recognize(imageBase64, {}, output);
const data = res.data;
  console.log('Tesseract.js raw data=', data);

  // data.lines exists in Tesseract.js output
  const lines: OCRLine[] = (data.lines ?? [])
    .map((l: any) => {
      const text = (l.text ?? '').trim();
      if (!text) return null;

      const b = l.bbox; // { x0, y0, x1, y1 }
      if (!b) return null;

      return { text, box: { x0: b.x0, y0: b.y0, x1: b.x1, y1: b.y1 } };
    })
    .filter(Boolean);

  // Try to infer width/height from data (available on some outputs)
  // Fallback: parse image dimensions in next step if needed.
  const width = data.imageSize?.width ?? 0;
  const height = data.imageSize?.height ?? 0;

  return { lines, width, height };
}
