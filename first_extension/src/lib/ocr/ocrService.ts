export interface OCRService {
  recognize(imageBase64: string): Promise<string>;
}
