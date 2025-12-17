import { createWorker } from 'tesseract.js';

let workerPromise: Promise<any> | null = null;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker('eng');
  }
  return workerPromise;
}

export async function recognizeText(imageBase64: string): Promise<string> {
  const worker = await getWorker();
  const { data } = await worker.recognize(imageBase64);
  return data.text.trim();
}
