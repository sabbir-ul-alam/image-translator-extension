export type OCRLine = {
  text: string;
  box: { x0: number; y0: number; x1: number; y1: number }; // in image pixels
};

export type OCRResult = {
  lines: OCRLine[];
  width: number;
  height: number;
};
