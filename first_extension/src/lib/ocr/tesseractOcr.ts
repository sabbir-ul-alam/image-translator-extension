import type { OCRService } from './ocrService';
import { createWorker } from 'tesseract.js';

export class TesseractOCR implements OCRService {
  private workerPromise: Promise<any> | null = null;

  private async getWorker() {
    if (!this.workerPromise) {
      this.workerPromise = (async () => {
        const worker = await createWorker('eng');
        return worker;
      })();
    }
    return this.workerPromise;
  }

  async recognize(imageBase64: string): Promise<string> {
    const worker = await this.getWorker();

    const { data } = await worker.recognize(imageBase64);

    return data.text.trim();
  }
}
