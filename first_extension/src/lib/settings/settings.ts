import { browser } from 'wxt/browser';

export type UserSettings = {
  targetLang: string;
};

const DEFAULT_SETTINGS: UserSettings = {
  targetLang: 'en',
};

export async function getSettings(): Promise<UserSettings> {
  return new Promise((resolve) => {
    browser.storage.sync.get(DEFAULT_SETTINGS, (items) => {
      resolve(items as UserSettings);
    });
  });
}

export async function saveSettings(settings: Partial<UserSettings>): Promise<void> {
  return new Promise((resolve) => {
    browser.storage.sync.set(settings, () => resolve());
  });
}
