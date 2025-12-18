import { getSettings, saveSettings } from '../../lib/settings/settings';

const select = document.getElementById('lang') as HTMLSelectElement;
const status = document.getElementById('status')!;

(async () => {
  const settings = await getSettings();
  select.value = settings.targetLang;
})();

select.addEventListener('change', async () => {
  await saveSettings({ targetLang: select.value });
  status.textContent = 'Saved';
  setTimeout(() => (status.textContent = ''), 1000);
});
