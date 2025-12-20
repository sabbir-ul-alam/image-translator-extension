export type OCRWord = {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
};

export type OCRLine = {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
  baseLine: { x0: number; y0: number; x1: number; y1: number };
  rowAttributes: {rowHeight: number; descenders: number, ascenders: number};
  words: OCRWord[];
};

export type OCRParagraph = {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number };
  lines: OCRLine[];
};

export type OCRBlock = {
  text: string;
  bbox: { x0: number; y0: number; x1: number; y1: number }; // in image pixels
  paragraphs: OCRParagraph[];

};

export type OCRResult = {
  blocks: OCRBlock[];
  tsv: string;
  text: string;
  hocr: string;
};
