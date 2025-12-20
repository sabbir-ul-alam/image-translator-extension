export type OCRLine = {
  text: string;
  box: { x0: number; y0: number; x1: number; y1: number };
};

export function extractLinesFromBlocks(blocks: any[]): OCRLine[] {
  const lines: OCRLine[] = [];

  for (const block of blocks) {
    for (const paragraph of block.paragraphs ?? []) {
      for (const line of paragraph.lines ?? []) {
        const text = (line.text ?? '').trim();
        if (!text) continue;

        const b = line.bbox;
        if (!b) continue;

        lines.push({
          text,
          box: {
            x0: b.x0,
            y0: b.y0,
            x1: b.x1,
            y1: b.y1,
          },
        });
      }
    }
  }

  console.log(
  'Extracted lines:',
  lines.map(l => ({ text: l.text, box: l.box }))
);


  return lines;
}
