# TeamCoachApp — Implementation Plan

> Created: 2026-03-28
> Based on ТЗ from Валерія Олексіївна
> Sport focus: Handball (гандбол) as primary example

---

## Overview of Work

1. **Прибрати мок-дані** — видалити всю заглушку з `localStorage`
2. **Підключити Convex** — реальна БД, real-time queries/mutations
3. **Нова функціональність** — тести ДЮСШ, прогрес, макроцикл, статистика, навчання

---

## Phase 1 — Convex Integration (Backend)

### 1.1 Install & Setup Convex
- `npm install convex`
- `npx convex dev` — initialize project, get deployment URL
- Wrap app in `<ConvexProvider>` в `main.tsx`
- Додати `VITE_CONVEX_URL` до `.env`

### 1.2 Convex Schema (`convex/schema.ts`)

```
athletes           — профілі спортсменів
trainings          — тренування (план + факт)
training_sessions  — конкретна сесія (дата, результати)
test_results       — результати тестів ДЮСШ
dyush_tests        — довідник тестів ДЮСШ (шаблони)
macrocycles        — річний цикл (межі етапів)
mesocycles         — мезоцикли в рамках макроциклу
microcycles        — мікроцикли (тижні)
coaches            — тренери (для авторизації)
```

### 1.3 Convex Queries & Mutations
- `athletes`: getAll, getById, create, update, delete
- `trainings`: getAll, getByDate, getByAthlete, create, update, delete
- `training_sessions`: create, getByTraining, getByAthlete
- `test_results`: create, getByAthlete, getByTest, getLatest
- `dyush_tests`: getAll (seeded data — тести ДЮСШ гандбол)
- `macrocycles`: getActive, create, update

### 1.4 Seed Data
- Завантажити офіційні тести ДЮСШ для гандболу як початкові дані
- Видалити всі `storage.ts` заглушки

---

## Phase 2 — ДЮСШ Tests (Нормативи)

### 2.1 Довідник тестів (handball specific)

**Фізичні нормативи:**
| Тест | Одиниця | Вікові групи |
|------|---------|--------------|
| Біг 30м | с | U12, U14, U16, U18 |
| Біг 60м | с | U14, U16, U18 |
| Стрибок у довжину з місця | см | всі |
| Підтягування (хлопці) / вис (дівчата) | рази | всі |
| Прес за 30с | рази | всі |
| Човниковий біг 4×9м | с | всі |
| Біг 1500м / 1000м | хв:с | U14+ |
| Нахил вперед | см | всі |

**Спеціальні (гандбол):**
| Тест | Одиниця |
|------|---------|
| Кидок на дальність | м |
| Влучність кидка (10 кидків) | разів |
| Ведення м'яча 20м | с |
| Передачі в парах за 30с | разів |

### 2.2 Сторінка тестів (нова: `/tests`)
**Вигляд:** Вкладки по ПІБ → перелік тестів → клік → графік динаміки

```
[Список спортсменів (карточки з аватаром)]
  → [Клік на спортсмена]
     → [Таблиця: Назва тесту | Норматив | Останній результат | Тренд ↑↓]
        → [Клік на тест]
           → [Графік динаміки по датах + таблиця результатів]
```

**Компоненти:**
- `TestsPage.tsx` — основна сторінка
- `AthleteTestsView.tsx` — тести конкретного спортсмена
- `TestProgressChart.tsx` — Recharts лінійний графік
- `AddTestResultModal.tsx` — внести новий результат
- Норматив позначати кольором: зелений (виконав), жовтий (близько), червоний (не виконав)

---

## Phase 3 — Team Page Enhancement (Макроцикл + Клікабельність)

### 3.1 Картка спортсмена з макроциклом
- Мінімалістична смужка макроциклу на картці (горизонтальна):
  ```
  [Підготовчий ████████░░░░░░░░] [Змагальний ░░░░░░████░░░░] [Перехідний]
                  ↑ зараз
  ```
- Показувати: поточний мезоцикл, тиждень мікроциклу

### 3.2 Клікабельність: Команда → ПІБ → Поточне тренування за планом
- На картці спортсмена: кнопка "Поточний мікроцикл"
- Клік → сторінка `/training/athlete/:id/current`
  - Показує план тренування на сьогодні (за макроциклом)
  - Тренер може вносити корективи прямо тут
  - Зміни зберігаються окремо для цього спортсмена
  - Зміни НЕ впливають на загальний план (персоналізація)

### 3.3 Нові поля в схемі Athletes
```typescript
{
  macroCycleId: string,       // прив'язка до макроциклу
  trainingGroupId: string,    // група (якщо різні)
  currentMesocycleType: "ударний" | "відновний" | "змагальний" | "передзмагальний" | "стабілізуючий",
  currentMicrocycleWeek: number,
  personalTrainingNotes: string,  // нотатки тренера по цьому гравцю
}
```

---

## Phase 4 — History Page Enhancement

### 4.1 Клікабельні спортсмени в Історії
```
[Список тренувань]
  → [Клік на тренування]
     → [Список спортсменів хто брав участь — клікабельно]
        → [Клік на ПІБ]
           → [Профіль спортсмена з повною інформацією]
```

### 4.2 Перегляд тренування: види за етапом підготовки
- При кліку на назву тренування показувати:
  - Тип підготовки (ЗФП / СФП / Технічна / Тактична)
  - **в залежності від поточного етапу підготовки** (Платонов: розподіл по фазах)
  - Можливість: обрати з запропонованих або додати свій вид
  - Збереження прив'язки до тренування

### 4.3 Training types по етапах (Platonov)
```
Підготовчий I:   ЗФП 60% / СФП 20% / Технічна 15% / Тактична 5%
Підготовчий II:  ЗФП 30% / СФП 40% / Технічна 20% / Тактична 10%
Змагальний:      ЗФП 15% / СФП 25% / Технічна 25% / Тактична 35%
Перехідний:      ЗФП 70% / СФП 15% / Технічна 10% / Тактична 5%
```

---

## Phase 5 — Statistics Page Enhancement

### 5.1 5 Фізичних якостей
- **Сила** (strength) — тести: підтягування, прес, кидок на дальність
- **Витривалість** (endurance) — тести: 1500м, човниковий біг
- **Гнучкість** (flexibility) — тест: нахил вперед
- **Координація** (coordination) — тести: човниковий 4×9м, ведення м'яча
- **Швидкість** (speed) — тести: 30м, 60м

Radar chart (павутинка) на картці кожного спортсмена.

### 5.2 Типи підготовленості (Платонов — повна класифікація)

**Основні:**
1. Фізична — фізичні тести ДЮСШ
2. Технічна — оцінки технічних дій
3. Тактична — оцінки тактичних рішень
4. Психологічна — суб'єктивна оцінка тренера (1-10)
5. Теоретична — тест-опитування (може бути окремий блок)

**Розширені:**
6. Функціональна — ЧСС, відновлення
7. Психофізіологічна — суб'єктивна
8. Когнітивна — реакція, увага
9. Морфофункціональна — антропометрія (ріст/вага/wingspan)
10. Відновлювальна — навантаження/відновлення індекс

**Додаткові:**
11. Координаційна — окремий блок
12. Інтегральна — узагальнений результат (формула ІТН з пам'яті)

**UI:** Таблиця підготовленості + спідометр/radar chart по групах.

### 5.3 Графіки статистики
- Командна динаміка (лінійний графік по тижнях)
- Топ-5 спортсменів по кожній якості
- Порівняння: план vs факт навантаження
- Розподіл типів тренувань (pie chart)

---

## Phase 6 — Education Block (Навчання)

### 6.1 Нова сторінка `/learn`
**Структура:** Accordion або картки по темах

**Теми:**
- Основи спортивного тренування (по Платонову)
- Що таке макроцикл / мезоцикл / мікроцикл
- Типи підготовленості (прості пояснення)
- Навантаження: великі / значні / середні / малі
- Як читати графіки прогресу
- Тести ДЮСШ: навіщо і як проводити
- Принципи гандбольного тренування

### 6.2 Компоненти
- `LearnPage.tsx` — основна сторінка
- `LearnCard.tsx` — картка теми
- `LearnContent.tsx` — текстовий вміст з ілюстраціями

---

## Implementation Order (Пріоритети)

### Sprint 1 — Foundation (Convex setup)
- [ ] Install Convex, create schema
- [ ] Migrate athletes CRUD
- [ ] Migrate trainings CRUD
- [ ] Remove localStorage mock data
- [ ] Setup seeded ДЮСШ tests data

### Sprint 2 — Tests Feature
- [ ] TestsPage з навігацією по спортсменах
- [ ] AthleteTestsView з таблицею тестів
- [ ] TestProgressChart (графік динаміки)
- [ ] AddTestResultModal

### Sprint 3 — Team & History Enhancement
- [ ] Макроцикл-смужка на картці спортсмена
- [ ] Клікабельний поточний мікроцикл → тренування
- [ ] Персоналізовані корективи в тренуванні
- [ ] Клікабельні ПІБ в Історії
- [ ] Типи тренувань за етапом підготовки

### Sprint 4 — Statistics & Education
- [ ] 5 фізичних якостей (radar chart)
- [ ] Типи підготовленості (12 компонентів)
- [ ] Education block

---

## New Navigation Structure

```
Dashboard       /dashboard
Team            /team
Training        /training
Tests           /tests          ← НОВЕ
History         /history
Statistics      /statistics
Calendar        /calendar
Learn           /learn          ← НОВЕ
```

---

## Technical Notes

- **Convex schema** використовує `v.` validators (Convex типи, не Zod)
- **useQuery / useMutation** замість `useState + localStorage`
- **Real-time** — Convex автоматично оновлює UI при зміні даних
- **Auth** — Convex має вбудований auth (Clerk або custom JWT)
- Мова інтерфейсу: **українська** (зберегти)

---

## Files to Create

```
convex/
  schema.ts
  athletes.ts
  trainings.ts
  testResults.ts
  dyushTests.ts
  macrocycles.ts
  seed.ts

src/pages/
  TestsPage.tsx
  LearnPage.tsx

src/components/
  AthleteTestsView.tsx
  TestProgressChart.tsx
  AddTestResultModal.tsx
  MacroCycleBar.tsx
  PhysicalQualitiesRadar.tsx
  PreparednessTable.tsx
  LearnCard.tsx
```

## Files to Modify

```
src/main.tsx              — add ConvexProvider
src/App.tsx               — add new routes (/tests, /learn)
src/components/AppSidebar.tsx  — add new nav items
src/lib/storage.ts        — DELETE (replace with Convex)
src/pages/Team.tsx        — add macrocycle bar, clickable microcycle
src/pages/History.tsx     — clickable athletes, training types
src/pages/Statistics.tsx  — 5 qualities, preparedness types
```
