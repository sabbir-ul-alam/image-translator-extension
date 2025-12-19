type ImageOverlayOptions = {
  fontSizePx?: number;
  opacity?: number;
};

export function showImageTranslationOverlay(
  translatedText: string,
  rect: DOMRect,
  opts: ImageOverlayOptions = {}
) {
  const fontSize = opts.fontSizePx ?? 14;
  const opacity = opts.opacity ?? 0.85;

  // Remove existing overlay
  document.getElementById('__img_translate_overlay__')?.remove();

  const overlay = document.createElement('div');
  overlay.id = '__img_translate_overlay__';

  Object.assign(overlay.style, {
    position: 'fixed',
    left: `${rect.x}px`,
    top: `${rect.y}px`,
    width: `${rect.width}px`,
    minHeight: `${rect.height}px`,
    background: `rgba(0,0,0,${opacity})`,
    color: '#fff',
    padding: '8px',
    boxSizing: 'border-box',
    fontSize: `${fontSize}px`,
    lineHeight: '1.4',
    zIndex: '2147483647',
    borderRadius: '6px',
    overflowWrap: 'break-word',
    whiteSpace: 'pre-wrap',
  });

  overlay.textContent = translatedText;

  document.body.appendChild(overlay);
}
