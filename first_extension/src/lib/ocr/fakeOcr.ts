import type { OCRService } from './ocrService';

export class FakeOCR implements OCRService {
  async recognize(_: string): Promise<string> {
    await new Promise(r => setTimeout(r, 800));
    return `Detected text (stub OCR)

This text will be replaced by real OCR output.`;
  }
}
