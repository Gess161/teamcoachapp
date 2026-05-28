import { useTranslation } from "react-i18next";

const LANGS = ["uk", "en", "ru"] as const;
type Lang = (typeof LANGS)[number];

const LABELS: Record<Lang, string> = { uk: "UA", en: "EN", ru: "RU" };

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const current = (i18n.language?.slice(0, 2) as Lang) || "uk";

  const change = (lang: Lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

  return (
    <div className="flex items-center gap-0.5 bg-secondary/50 rounded-lg p-0.5">
      {LANGS.map((lang) => (
        <button
          key={lang}
          onClick={() => change(lang)}
          className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${
            current === lang
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {LABELS[lang]}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
