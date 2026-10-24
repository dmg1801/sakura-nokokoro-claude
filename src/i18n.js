import labelsEn from '../config/labels.en.json';
import labelsEs from '../config/labels.json';

const KEY = 'sakura-no-kokoro-language';
const dictionaries = { en: labelsEn, es: labelsEs };
let language = 'en';

try {
  const saved = localStorage.getItem(KEY);
  if (Object.hasOwn(dictionaries, saved)) language = saved;
} catch (error) {
  console.warn('Could not load the saved language preference:', error);
}

document.documentElement.lang = language;

export const getLanguage = () => language;
export const getLabels = () => dictionaries[language];

export function setLanguage(next) {
  if (!Object.hasOwn(dictionaries, next) || next === language) return;
  language = next;
  document.documentElement.lang = language;
  try {
    localStorage.setItem(KEY, language);
  } catch (error) {
    console.warn('Could not save the language preference:', error);
  }
  window.dispatchEvent(new Event('languagechange'));
}
