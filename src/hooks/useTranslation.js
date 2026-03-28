import { useLanguage } from '../context/LanguageContext';
import { en } from '../i18n/en';
import { bn } from '../i18n/bn';

export const useTranslation = () => {
  const { lang } = useLanguage();
  return lang === 'en' ? en : bn;
};
