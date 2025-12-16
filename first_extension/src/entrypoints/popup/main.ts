// import './style.css';
// import typescriptLogo from '@/assets/typescript.svg';
// import wxtLogo from '/wxt.svg';
// import { setupCounter } from '@/src/components/counter';

// document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
//   <div>
//     <a href="https://wxt.dev" target="_blank">
//       <img src="${wxtLogo}" class="logo" alt="WXT logo" />
//     </a>
//     <a href="https://www.typescriptlang.org/" target="_blank">
//       <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
//     </a>
//     <h1>WXT + TypeScript</h1>
//     <div class="card">
//       <button id="counter" type="button"></button>
//     </div>
//     <p class="read-the-docs">
//       Click on the WXT and TypeScript logos to learn more
//     </p>
//   </div>
// `;

// setupCounter(document.querySelector<HTMLButtonElement>('#counter')!);

import { browser } from 'wxt/browser';

document.getElementById('select')!.addEventListener('click', async () => {
  const [tab] = await browser.tabs.query({
    active: true,
    currentWindow: true,
  });

  browser.runtime.sendMessage({
    type: 'START_SELECTION',
    tabId: tab.id,
  });
  console.log('Hello main!');

  // window.close();
});
