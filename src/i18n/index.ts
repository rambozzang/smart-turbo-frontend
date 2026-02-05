import { createI18n } from 'vue-i18n'
import en from './locales/en'
import ko from './locales/ko'

const messages = {
  en,
  ko
}

// Get saved language or use browser language
const savedLocale = localStorage.getItem('locale')
const browserLocale = navigator.language.split('-')[0]
const defaultLocale = savedLocale || (browserLocale === 'ko' ? 'ko' : 'en')

const i18n = createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: 'en',
  messages
})

export default i18n
