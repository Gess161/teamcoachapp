import { chromium } from "playwright";
import { mkdirSync, existsSync } from "fs";

const BASE = "http://localhost:8080/teamcoachapp";
const OUT = "/Users/tehnoezh/Desktop/athletepro-screenshots";

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  colorScheme: "dark",
  locale: "uk-UA",
});

await ctx.addInitScript(() => {
  localStorage.setItem("coach_auth", "true");
  localStorage.setItem("theme-preference", "dark");
  localStorage.setItem("i18nextLng", "uk");
});

const page = await ctx.newPage();

async function shot(route, file, scrollY = 0, extraWait = 0) {
  await page.goto(`${BASE}/#${route}`, { waitUntil: "domcontentloaded" });
  // Wait for Convex data to arrive via websocket
  await page.waitForTimeout(3500 + extraWait);
  if (scrollY > 0) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), scrollY);
    await page.waitForTimeout(600);
  }
  const path = `${OUT}/${file}`;
  await page.screenshot({ path, fullPage: false });
  console.log(`✅  ${file}`);
}

// Рис. 1 — Дашборд
await shot("/dashboard", "fig1-dashboard.png");

// Рис. 2 — Команда (картки спортсменів)
await shot("/team", "fig2-team.png");

// Рис. 3 — Тренування
await shot("/training", "fig3-training.png");

// Рис. 4 — Календар
await shot("/calendar", "fig4-calendar.png");

// Рис. 5 — Тести ДЮСШ (з обраним атлетом і результатами)
await page.goto(`${BASE}/#/tests`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(4000);
// Click on first athlete in the list
const firstAthlete = page.locator("li, [role='listitem'], .cursor-pointer").first();
await firstAthlete.click().catch(() => {});
// Fallback: click any element containing athlete name
await page.locator("text=Коваленко Максим").first().click().catch(() => {});
await page.waitForTimeout(2000);
await page.screenshot({ path: `${OUT}/fig5-tests.png`, fullPage: false });
console.log("✅  fig5-tests.png");

// Рис. 6 — Статистика: верх (обсяг, радар, діаграми)
await shot("/statistics", "fig6-statistics.png", 0, 1000);

// Рис. 7 — Статистика: модель підготовленості + ІГС-радар
// Scroll down to show both the 12-components grid and the IGS radar below
await page.goto(`${BASE}/#/statistics`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(4000);
await page.evaluate(() => window.scrollTo({ top: 1800, behavior: "instant" }));
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/fig7-statistics-igs.png`, fullPage: false });
console.log("✅  fig7-statistics-igs.png");

await browser.close();
console.log(`\nСкріншоти збережено: ${OUT}`);
