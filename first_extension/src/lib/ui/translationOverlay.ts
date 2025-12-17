type OverlayOptions = {
  opacity?: number;      // 0..1
  fontSizePx?: number;   // e.g., 14
};

export function showTranslationOverlay(
  translatedText: string,
  opts: OverlayOptions = {}
) {
  const opacity = opts.opacity ?? 0.85;
  const fontSizePx = opts.fontSizePx ?? 14;

  // Remove existing overlay (MVP: one at a time)
  document.getElementById('__img_translate_overlay__')?.remove();

  const container = document.createElement('div');
  container.id = '__img_translate_overlay__';

  Object.assign(container.style, {
    position: 'fixed',
    top: '60px',
    left: '60px',
    width: '360px',
    maxWidth: '70vw',
    background: `rgba(0,0,0,${opacity})`,
    color: '#fff',
    borderRadius: '10px',
    zIndex: '2147483647',
    boxShadow: '0 6px 24px rgba(0,0,0,0.35)',
    overflow: 'hidden',
    userSelect: 'none',
  });

  // Header (drag handle + close)
  const header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    cursor: 'move',
    background: 'rgba(255,255,255,0.08)',
    fontSize: '13px',
    fontWeight: '600',
  });

  const title = document.createElement('div');
  title.textContent = 'Translation';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✕';
  Object.assign(closeBtn.style, {
    border: 'none',
    background: 'transparent',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '16px',
    lineHeight: '1',
    padding: '0 4px',
  });
  closeBtn.addEventListener('click', () => container.remove());

  header.appendChild(title);
  header.appendChild(closeBtn);

  // Body (selectable text)
  const body = document.createElement('div');
  Object.assign(body.style, {
    padding: '12px',
    fontSize: `${fontSizePx}px`,
    lineHeight: '1.45',
    whiteSpace: 'pre-wrap',
    userSelect: 'text',
  });
  body.textContent = translatedText;

  container.appendChild(header);
  container.appendChild(body);
  document.body.appendChild(container);

  makeDraggable(container, header);
}

function makeDraggable(container: HTMLDivElement, handle: HTMLDivElement) {
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;

  const onDown = (e: MouseEvent) => {
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;

    const rect = container.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;

    e.preventDefault();
  };

  const onMove = (e: MouseEvent) => {
    if (!dragging) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    const nextLeft = Math.max(0, startLeft + dx);
    const nextTop = Math.max(0, startTop + dy);

    container.style.left = `${nextLeft}px`;
    container.style.top = `${nextTop}px`;
  };

  const onUp = () => {
    dragging = false;
  };

  handle.addEventListener('mousedown', onDown);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
}
