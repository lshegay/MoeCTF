import {
  faDoorOpen,
  faHome,
  faTable,
  faGlobeEurope,
} from '@fortawesome/free-solid-svg-icons';

const menuButtons = [
  {
    icon: faGlobeEurope,
    onClick: async (router) => {
      const newLocale = router.locales.findIndex((l) => l == router.locale);
      router.push(router.asPath, router.asPath, { locale: router.locales[(newLocale + 1) % 2] });
    },
    tooltip: { 'ru-RU': 'Сменить язык', 'en-US': 'Change language' },
  },
  { icon: faHome, url: '/', tooltip: { 'ru-RU': 'Главная', 'en-US': 'Main' } },
  { icon: faTable, url: '/scoreboard', tooltip: { 'ru-RU': 'Таблица рекордов', 'en-US': 'Scoreboaqrd' } },
  {
    icon: faDoorOpen,
    onClick: async (router) => {
      await fetch(new URL('/api/logout', 'http://localhost:3000').toString());

      router.push('/login');
    },
    tooltip: { 'ru-RU': 'Выход', 'en-US': 'Logout' },
  },
];

export { menuButtons };
