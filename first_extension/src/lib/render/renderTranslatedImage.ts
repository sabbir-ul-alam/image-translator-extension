export async function renderTranslatedImage(
  imageBase64: string,
  lines: Array<{ box: { x0: number; y0: number; x1: number; y1: number }; translated: string }>
): Promise<string> {
  const img = await loadImage(imageBase64);

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  for (const item of lines) {
    const { x0, y0, x1, y1 } = item.box;
    const w = Math.max(1, x1 - x0);
    const h = Math.max(1, y1 - y0);

    // Cover original text
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = '#000';
    ctx.fillRect(x0, y0, w, h);
    ctx.restore();

    // Fit font size to box height
    const fontSize = Math.max(10, Math.floor(h * 0.75));
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'top';

    drawWrappedText(ctx, item.translated, x0 + 4, y0 + 2, w - 8, h - 4);
  }

  return canvas.toDataURL('image/png');
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  maxHeight: number
) {
  const words = text.split(/\s+/);
  const lineHeight = Math.ceil(parseInt(ctx.font, 10) * 1.15);

  let line = '';
  let yy = y;

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      if (yy + lineHeight > y + maxHeight) break;
      ctx.fillText(line, x, yy);
      line = word;
      yy += lineHeight;
    } else {
      line = test;
    }
  }

  if (line && yy + lineHeight <= y + maxHeight) {
    ctx.fillText(line, x, yy);
  }
}
