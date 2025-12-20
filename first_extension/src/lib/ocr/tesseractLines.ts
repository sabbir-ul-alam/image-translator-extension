import { createWorker, PSM } from 'tesseract.js';
import type { OCRResult, OCRBlock, OCRParagraph, OCRLine, OCRWord } from './ocrTypes';

let workerPromise: Promise<any> | null = null;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = (async () => {
      const worker = await createWorker('eng');
      return worker;
    })();
  }
  return workerPromise;
}

// imageBase64 is your cropped image (data URL)
export async function recognizeWithBlocks(imageBase64: string): Promise<OCRResult> {
  const worker = await getWorker();
const output = {
  blocks: true,
  hocr: true,
  tsv: true,
};

const res = await worker.recognize(imageBase64, {}, output);
const data = res.data;
console.log('Tesseract.js raw data=', data);



return mapRawToResult(data);;
}

function mapWord(word: any): OCRWord {
  return {
    text: word.text,
    bbox: word.bbox,
  };
}


function mapLine(line: any): OCRLine {
  return {
    text: line.text,
    bbox: line.bbox,
    baseLine: line.baseline,
    rowAttributes: line.rowAttributes,
    words: line.words.map(mapWord),
  };
}


function mapParagraph(paragraph: any): OCRParagraph {
  return {
    text: paragraph.text,
    bbox: paragraph.bbox,
    lines: paragraph.lines.map(mapLine),
  };
}


function mapBlock(block: any): OCRBlock {
  return {
    text: block.text,
    bbox: block.bbox,
    paragraphs: block.paragraphs.map(mapParagraph),
  };
}


export function mapRawToResult(data: any): OCRResult {
  const ocrResult: OCRResult = {
    blocks: data.blocks.map(mapBlock),
    tsv: data.tsv,
    text: data.text,
    hocr: data.hocr,
  };
  


  return ocrResult;

}

