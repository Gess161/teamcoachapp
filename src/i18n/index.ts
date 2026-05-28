import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "./locales/en/common.json";
import enAuth from "./locales/en/auth.json";
import enDashboard from "./locales/en/dashboard.json";
import enTraining from "./locales/en/training.json";
import enTeam from "./locales/en/team.json";
import enCalendar from "./locales/en/calendar.json";
import enTests from "./locales/en/tests.json";
import enStatistics from "./locales/en/statistics.json";
import enHistory from "./locales/en/history.json";
import enLearn from "./locales/en/learn.json";
import enEnums from "./locales/en/enums.json";

import ukCommon from "./locales/uk/common.json";
import ukAuth from "./locales/uk/auth.json";
import ukDashboard from "./locales/uk/dashboard.json";
import ukTraining from "./locales/uk/training.json";
import ukTeam from "./locales/uk/team.json";
import ukCalendar from "./locales/uk/calendar.json";
import ukTests from "./locales/uk/tests.json";
import ukStatistics from "./locales/uk/statistics.json";
import ukHistory from "./locales/uk/history.json";
import ukLearn from "./locales/uk/learn.json";
import ukEnums from "./locales/uk/enums.json";

import ruCommon from "./locales/ru/common.json";
import ruAuth from "./locales/ru/auth.json";
import ruDashboard from "./locales/ru/dashboard.json";
import ruTraining from "./locales/ru/training.json";
import ruTeam from "./locales/ru/team.json";
import ruCalendar from "./locales/ru/calendar.json";
import ruTests from "./locales/ru/tests.json";
import ruStatistics from "./locales/ru/statistics.json";
import ruHistory from "./locales/ru/history.json";
import ruLearn from "./locales/ru/learn.json";
import ruEnums from "./locales/ru/enums.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "uk",
    defaultNS: "common",
    resources: {
      en: {
        common: enCommon,
        auth: enAuth,
        dashboard: enDashboard,
        training: enTraining,
        team: enTeam,
        calendar: enCalendar,
        tests: enTests,
        statistics: enStatistics,
        history: enHistory,
        learn: enLearn,
        enums: enEnums,
      },
      uk: {
        common: ukCommon,
        auth: ukAuth,
        dashboard: ukDashboard,
        training: ukTraining,
        team: ukTeam,
        calendar: ukCalendar,
        tests: ukTests,
        statistics: ukStatistics,
        history: ukHistory,
        learn: ukLearn,
        enums: ukEnums,
      },
      ru: {
        common: ruCommon,
        auth: ruAuth,
        dashboard: ruDashboard,
        training: ruTraining,
        team: ruTeam,
        calendar: ruCalendar,
        tests: ruTests,
        statistics: ruStatistics,
        history: ruHistory,
        learn: ruLearn,
        enums: ruEnums,
      },
    },
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "language",
    },
  });

export default i18n;
