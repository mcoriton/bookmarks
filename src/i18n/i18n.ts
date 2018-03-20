import * as i18n from 'i18next';
const instance = i18n.init({
  // your settings here
  fallbackLng: 'fr',
  ns: ['app'],
  defaultNS: 'app',
  debug: false,
  resources: {
    fr: {
      app: require('../locales/fr/translation.json')
    }
  }
});

export default instance;
