  export async function cropImage(
    dataUrl: string,
    rect: DOMRect,
    dpr: number
  ): Promise<string> {
    const img = await loadImage(dataUrl);

    const canvas = new OffscreenCanvas(
      rect.width * dpr,
      rect.height * dpr
    );

    const ctx = canvas.getContext('2d')!;

    ctx.drawImage(
      img,
      rect.x * dpr,
      rect.y * dpr,
      rect.width * dpr,
      rect.height * dpr,
      0,
      0,
      rect.width * dpr,
      rect.height * dpr
    );

    const blob = await canvas.convertToBlob({ type: 'image/png' });
    return blobToDataUrl(blob);
  }

    function loadImage(src: string): Promise<ImageBitmap> {
    return fetch(src)
      .then(r => r.blob())
      .then(createImageBitmap);
  }

  function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }